const pool = require('../db/pool');

// log an action
const logAction = async (userId, action, entityType, entityId, details) => {
  try {
    await pool.query(
      `INSERT INTO audit_logs (user_id, action, entity_type, entity_id, details)
       VALUES ($1, $2, $3, $4, $5)`,
      [userId, action, entityType, entityId, JSON.stringify(details)]
    );
  } catch (err) {
    console.error('Audit log error:', err);
  }
};

// get all audit logs
const getAuditLogs = async (req, res) => {
  try {
    const result = await pool.query(
      `SELECT al.*, u.name as user_name, u.email
       FROM audit_logs al
       LEFT JOIN users u ON al.user_id = u.id
       ORDER BY al.created_at DESC
       LIMIT 100`
    );
    res.json(result.rows);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Server error' });
  }
};

module.exports = { logAction, getAuditLogs };