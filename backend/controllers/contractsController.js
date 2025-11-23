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
  const connection = await pool.getConnection(); // 1. Get a dedicated connection
  try {
    await connection.beginTransaction(); // 2. Start a Transaction (Safety Net)

    const contractId = req.params.id;
    const { status } = req.body; // Expected: 'delivered' or 'completed'
    
    console.log(`👉 Updating Contract #${contractId} to status: ${status}`);

    // Get current contract details first
    const [contracts] = await connection.query('SELECT * FROM contracts WHERE id = ?', [contractId]);
    if (contracts.length === 0) {
        throw new Error('Contract not found');
    }
    const contract = contracts[0];

    // === FUND TRANSFER LOGIC ===
    // Only execute if we are marking it as 'completed' AND it wasn't completed before
    if (status === 'completed' && contract.status !== 'completed') {
        console.log(`💰 Processing Payment of ${contract.amount} TC...`);

        // A. Requester: Deduct from Escrow Balance (Money leaves escrow)
        await connection.query(
            'UPDATE wallets SET escrow_balance = escrow_balance - ? WHERE user_id = ?',
            [contract.amount, contract.requester_id]
        );

        // B. Provider: Add to Available Balance (Money enters wallet)
        await connection.query(
            'UPDATE wallets SET balance = balance + ? WHERE user_id = ?',
            [contract.amount, contract.provider_id]
        );

        // C. Record Transaction: "Escrow Release"
        await connection.query(
            'INSERT INTO transactions (wallet_id, contract_id, amount, type, description, status) VALUES (?, ?, ?, ?, ?, ?)',
            [contract.provider_id, contractId, contract.amount, 'escrow_release', `Payment received for Contract #${contractId}`, 'success']
        );
        
        // Update contract end_date
        await connection.query(
            'UPDATE contracts SET end_date = NOW() WHERE id = ?', 
            [contractId]
        );
        
        // Also update the linked Task status to 'completed'
        // (We need to find the proposal first to find the task... simplified here by assuming we query via JOIN if needed, 
        // but for now let's just update contract status)
    }

    // Update the contract status
    await connection.query(
      'UPDATE contracts SET status = ? WHERE id = ?',
      [status, contractId]
    );

    await connection.commit(); // 3. Save everything
    console.log('✅ Contract updated and funds transferred (if completed).');
    
    res.json({ success: true, status });
  } catch (err) {
    await connection.rollback(); // 4. Undo changes if anything failed
    console.error(err);
    res.status(500).json({ error: 'Database error' });
  } finally {
    connection.release(); // 5. Release connection
  }
};

module.exports = {
  getMyContracts,
  getContractById,
  updateContractStatus
};