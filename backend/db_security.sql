-- Database security setup (optional hardening)
-- This script demonstrates RBAC with GRANT/REVOKE and stored procedures that enforce
-- per-user access (requester vs. provider). Run manually in MySQL 8+ as needed.

-- 0) Create users:
SELECT host,user FROM mysql.user WHERE user='timegarden_app';
DROP USER IF EXISTS 'timegarden_app'@'%';
DROP USER IF EXISTS 'timegarden_app'@'localhost';
FLUSH PRIVILEGES;
CREATE USER 'timegarden_app'@'%' IDENTIFIED BY '12345678';
GRANT SELECT, INSERT, UPDATE, DELETE, EXECUTE ON TimeGarden.* TO 'timegarden_app'@'%';
FLUSH PRIVILEGES;



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

-- 4b) Trigger: validate contract creation constraints
DROP TRIGGER IF EXISTS trg_contract_validate;
DELIMITER //
CREATE TRIGGER trg_contract_validate
BEFORE INSERT ON contracts
FOR EACH ROW
BEGIN
  DECLARE v_balance DECIMAL(10,2);

  -- Requester and provider must be different people
  IF NEW.requester_id = NEW.provider_id THEN
    SIGNAL SQLSTATE '45000'
      SET MESSAGE_TEXT = 'Requester and provider must be different users.';
  END IF;

  -- Requester must have an active wallet
  SELECT balance INTO v_balance
    FROM wallets
   WHERE user_id = NEW.requester_id
   FOR UPDATE;
  IF v_balance IS NULL THEN
    SIGNAL SQLSTATE '45000'
      SET MESSAGE_TEXT = 'Requester must have an active wallet.';
  END IF;

  -- Ensure escrow already has the funds being committed
  SELECT escrow_balance INTO v_balance
    FROM wallets
   WHERE user_id = NEW.requester_id
   FOR UPDATE;
  IF v_balance < NEW.amount THEN
    SIGNAL SQLSTATE '45000'
      SET MESSAGE_TEXT = 'Insufficient escrow balance to create contract.';
  END IF;
END//
DELIMITER ;

-- 4c) Stored Procedure: release contract payment from escrow (requester-only)
DROP PROCEDURE IF EXISTS sp_release_contract_payment;
DELIMITER //
CREATE PROCEDURE sp_release_contract_payment(
  IN p_contract_id INT,
  IN p_actor_user_id INT,
  IN p_amount DECIMAL(10,2)
)
BEGIN
  DECLARE v_requester INT;
  DECLARE v_provider INT;
  DECLARE v_agreed DECIMAL(10,2);
  DECLARE v_use_amount DECIMAL(10,2);
  DECLARE v_escrow_balance DECIMAL(10,2);
  DECLARE v_status ENUM('awaiting_escrow','active','delivered','completed','disputed','cancelled','in_progress','awaiting_review');

  DECLARE EXIT HANDLER FOR SQLEXCEPTION
  BEGIN
    ROLLBACK;
    RESIGNAL;
  END;

  START TRANSACTION;

  -- Lock the contract row and verify the actor is the requester
  SELECT requester_id, provider_id, amount, status
    INTO v_requester, v_provider, v_agreed, v_status
    FROM contracts
   WHERE id = p_contract_id
   FOR UPDATE;

  IF v_requester IS NULL THEN
    SIGNAL SQLSTATE '45000'
      SET MESSAGE_TEXT = 'Contract not found.';
  END IF;

  IF p_actor_user_id <> v_requester THEN
    SIGNAL SQLSTATE '45000'
      SET MESSAGE_TEXT = 'Only the requester can release payment.';
  END IF;

  IF v_status IN ('cancelled', 'disputed', 'completed') THEN
    SIGNAL SQLSTATE '45000'
      SET MESSAGE_TEXT = 'Payment cannot be released for this contract status.';
  END IF;

  -- Determine how much to release (defaults to the agreed amount, capped at it)
  IF p_amount IS NULL OR p_amount <= 0 THEN
    SET v_use_amount = v_agreed;
  ELSEIF p_amount > v_agreed THEN
    SET v_use_amount = v_agreed;
  ELSE
    SET v_use_amount = p_amount;
  END IF;

  -- Verify escrow funds are available on the requester wallet
  SELECT escrow_balance
    INTO v_escrow_balance
    FROM wallets
   WHERE user_id = v_requester
   FOR UPDATE;

  IF v_escrow_balance IS NULL THEN
    SIGNAL SQLSTATE '45000'
      SET MESSAGE_TEXT = 'Requester wallet not found.';
  END IF;

  IF v_escrow_balance < v_use_amount THEN
    SIGNAL SQLSTATE '45000'
      SET MESSAGE_TEXT = 'Not enough escrow to release payment.';
  END IF;

  -- Move funds from requester escrow to provider balance
  UPDATE wallets
     SET escrow_balance = escrow_balance - v_use_amount
   WHERE user_id = v_requester;

  UPDATE wallets
     SET balance = balance + v_use_amount
   WHERE user_id = v_provider;

  -- Record the escrow release for auditability
  INSERT INTO transactions (wallet_id, contract_id, amount, type, description, status)
  VALUES (v_provider, p_contract_id, v_use_amount, 'escrow_release',
          CONCAT('Release for contract ', p_contract_id), 'success');

  -- Update contract status/end date on full release
  IF v_use_amount >= v_agreed THEN
    UPDATE contracts
       SET status = 'completed',
           end_date = NOW()
     WHERE id = p_contract_id;
  ELSE
    UPDATE contracts
       SET status = 'in_progress'
     WHERE id = p_contract_id;
  END IF;

  COMMIT;
END//
DELIMITER ;
GRANT EXECUTE ON PROCEDURE sp_release_contract_payment TO requester_role;

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
