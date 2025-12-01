const pool = require('../config/database');
const { normalizeStatus } = require('../utils/statusNormalizer');

/**
 * Get all contracts for current user (as requester or provider)
 */
const getMyContracts = async (req, res) => {
  try {
    const userId = req.userId;
    const [rows] = await pool.query(`
      SELECT c.id, c.proposal_id as proposalId, c.amount, c.status, date_format(c.start_date, "%Y-%m-%d") as startDate,
             t.title as taskTitle, t.id as taskId,
             req.display_name as requesterName, prov.display_name as providerName,
             c.requester_id as requesterId, c.provider_id as providerId
      FROM contracts c
      JOIN proposals p ON c.proposal_id = p.id
      JOIN tasks t ON p.task_id = t.id
      JOIN users req ON c.requester_id = req.id
      JOIN users prov ON c.provider_id = prov.id
      WHERE c.requester_id = ? OR c.provider_id = ?
    `, [userId, userId]);
    
    const contracts = rows.map(r => ({
      ...r,
      status: normalizeStatus(r.status)
    }));

    res.json(contracts);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Database error' });
  }
};

/**
 * Get contract by ID
 */
const getContractById = async (req, res) => {
  try {
    const contractId = req.params.id;
    const [rows] = await pool.query(`
      SELECT c.id, c.proposal_id as proposalId, c.amount, c.status, 
             date_format(c.start_date, "%Y-%m-%d") as startDate,
             date_format(c.end_date, "%Y-%m-%d") as endDate,
             t.title as taskTitle, t.description as taskDescription, t.id as taskId, date_format(t.deadline, "%Y-%m-%d") as deadline,
             req.display_name as requesterName, req.email as requesterEmail, req.id as requesterId,
             prov.display_name as providerName, prov.email as providerEmail, prov.id as providerId
      FROM contracts c
      JOIN proposals p ON c.proposal_id = p.id
      JOIN tasks t ON p.task_id = t.id
      JOIN users req ON c.requester_id = req.id
      JOIN users prov ON c.provider_id = prov.id
      WHERE c.id = ?
    `, [contractId]);
    
    if (rows.length === 0) {
      return res.status(404).json({ error: 'Contract not found' });
    }
    
    const contract = rows[0];
    contract.status = normalizeStatus(contract.status);
    res.json(contract);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Database error' });
  }
};

/**
 * Update contract status & Handle Money Transfer
 * Logic: If status -> 'completed', move funds from Escrow to Provider.
 */
const updateContractStatus = async (req, res) => {
  const contractId = req.params.id;
  const { status, releaseAmount } = req.body; // releaseAmount optional for partial payouts
  const userId = req.userId;

  // When marking completed, delegate to the DB proc so funds move atomically
  if (status === 'completed') {
    try {
      await pool.query('CALL sp_release_contract_payment(?,?,?)', [
        contractId,
        userId,
        releaseAmount || null
      ]);

      // Return the latest status from the DB (proc may keep it in_progress for partial releases)
      const [rows] = await pool.query(
        'SELECT status FROM contracts WHERE id = ?',
        [contractId]
      );

      if (!rows.length) {
        return res.status(404).json({ error: 'Contract not found' });
      }

      return res.json({ success: true, status: normalizeStatus(rows[0].status) });
    } catch (err) {
      console.error(err);
      return res.status(500).json({ error: err.message || 'Database error' });
    }
  }

  // Fallback for other status transitions
  const connection = await pool.getConnection();
  try {
    await connection.beginTransaction();

    const [contracts] = await connection.query(
      'SELECT id FROM contracts WHERE id = ?',
      [contractId]
    );

    if (!contracts.length) {
      await connection.rollback();
      return res.status(404).json({ error: 'Contract not found' });
    }

    await connection.query(
      'UPDATE contracts SET status = ? WHERE id = ?',
      [status, contractId]
    );

    await connection.commit();
    res.json({ success: true, status: normalizeStatus(status) });
  } catch (err) {
    await connection.rollback();
    console.error(err);
    res.status(500).json({ error: 'Database error' });
  } finally {
    connection.release();
  }
};

module.exports = {
  getMyContracts,
  getContractById,
  updateContractStatus
};
