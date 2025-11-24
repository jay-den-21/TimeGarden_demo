-- Database security setup (optional hardening)
-- This script demonstrates RBAC with GRANT/REVOKE and stored procedures that enforce
-- per-user access (requester vs. provider). Run manually in MySQL 8+ as needed.

-- 1) Roles
CREATE ROLE IF NOT EXISTS requester_role;
CREATE ROLE IF NOT EXISTS provider_role;

-- 2) Revoke broad access from the roles to start with least privilege
REVOKE ALL PRIVILEGES, GRANT OPTION FROM requester_role;
REVOKE ALL PRIVILEGES, GRANT OPTION FROM provider_role;

-- 3) Grant minimal read access
GRANT SELECT ON TimeGarden.tasks TO requester_role;
GRANT SELECT ON TimeGarden.tasks TO provider_role;
GRANT SELECT ON TimeGarden.proposals TO requester_role;
GRANT SELECT ON TimeGarden.proposals TO provider_role;
GRANT SELECT ON TimeGarden.contracts TO requester_role;
GRANT SELECT ON TimeGarden.contracts TO provider_role;

-- 4) Stored procedures with invoker rights to enforce row-level checks
DROP PROCEDURE IF EXISTS sp_get_requester_tasks;
DELIMITER //
CREATE PROCEDURE sp_get_requester_tasks(IN p_user_id INT)
BEGIN
  SELECT *
  FROM tasks
  WHERE poster_id = p_user_id;
END//
DELIMITER ;
GRANT EXECUTE ON PROCEDURE sp_get_requester_tasks TO requester_role;

DROP PROCEDURE IF EXISTS sp_get_provider_proposals;
DELIMITER //
CREATE PROCEDURE sp_get_provider_proposals(IN p_user_id INT)
BEGIN
  SELECT *
  FROM proposals
  WHERE applicant_id = p_user_id;
END//
DELIMITER ;
GRANT EXECUTE ON PROCEDURE sp_get_provider_proposals TO provider_role;

DROP PROCEDURE IF EXISTS sp_update_proposal_status;
DELIMITER //
CREATE PROCEDURE sp_update_proposal_status(IN p_user_id INT, IN p_proposal_id INT, IN p_status ENUM('pending','accepted','rejected'))
BEGIN
  DECLARE v_task_id INT;
  DECLARE v_poster_id INT;

  -- Ensure requester owns the task tied to the proposal
  SELECT task_id INTO v_task_id FROM proposals WHERE id = p_proposal_id;
  IF v_task_id IS NULL THEN
    SIGNAL SQLSTATE '45000' SET MESSAGE_TEXT = 'Proposal not found';
  END IF;

  SELECT poster_id INTO v_poster_id FROM tasks WHERE id = v_task_id;
  IF v_poster_id IS NULL THEN
    SIGNAL SQLSTATE '45000' SET MESSAGE_TEXT = 'Task not found';
  END IF;

  IF v_poster_id <> p_user_id THEN
    SIGNAL SQLSTATE '45000' SET MESSAGE_TEXT = 'Not authorized to update this proposal';
  END IF;

  UPDATE proposals SET status = p_status WHERE id = p_proposal_id;
END//
DELIMITER ;
GRANT EXECUTE ON PROCEDURE sp_update_proposal_status TO requester_role;

-- 5) Remove direct write access; enforce writes through procedures
-- REVOKE INSERT, UPDATE, DELETE ON TimeGarden.proposals FROM requester_role;
-- REVOKE INSERT, UPDATE, DELETE ON TimeGarden.proposals FROM provider_role;
-- REVOKE INSERT, UPDATE, DELETE ON TimeGarden.tasks FROM requester_role;
-- REVOKE INSERT, UPDATE, DELETE ON TimeGarden.tasks FROM provider_role;

-- 6) Example user bindings (replace with your actual DB users)
-- GRANT requester_role TO 'requester_app'@'%';
-- GRANT provider_role TO 'provider_app'@'%';
-- SET DEFAULT ROLE requester_role FOR 'requester_app'@'%';
-- SET DEFAULT ROLE provider_role FOR 'provider_app'@'%';

-- After running this script, apps should call the stored procedures instead of
-- direct table writes to get DB-enforced ownership checks.
