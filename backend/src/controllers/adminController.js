const pool = require('../db/pool');

// Get all users
const getAllUsers = async (req, res) => {
  try {
    const result = await pool.query(
      `SELECT
          u.*,
          c.name AS company_name
       FROM users u
       LEFT JOIN companies c
         ON u.company_id = c.id
       ORDER BY u.created_at DESC`
    );

    res.json(result.rows);
  } catch (err) {
    console.error('Error getting users:', err);
    res.status(500).json({ error: 'Server error' });
  }
};

// Update user role
const updateUserRole = async (req, res) => {
  const { id } = req.params;
  const { role } = req.body;

  if (!['admin', 'member', 'staff'].includes(role)) {
    return res.status(400).json({ error: 'Invalid role' });
  }

  try {
    const result = await pool.query(
      `UPDATE users
       SET role = $1
       WHERE id = $2
       RETURNING *`,
      [role, id]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'User not found' });
    }

    res.json(result.rows[0]);
  } catch (err) {
    console.error('Error updating user role:', err);
    res.status(500).json({ error: 'Server error' });
  }
};

// Get all companies with current membership and usage information
const getAllCompanies = async (req, res) => {
  const month =
    Number(req.query.month) || new Date().getMonth() + 1;

  const year =
    Number(req.query.year) || new Date().getFullYear();

  try {
    const result = await pool.query(
      `SELECT
          c.id,
          c.name,
          c.created_at,
          cm.plan_id,
          mp.name AS membership_plan,
          mp.monthly_hours,
          mp.overage_rate,
          COALESCE(cm.hours_used, 0) AS hours_used,
          cm.month,
          cm.year,

          CASE
            WHEN cm.id IS NULL THEN NULL
            ELSE GREATEST(
              mp.monthly_hours - cm.hours_used,
              0
            )
          END AS remaining_hours,

          CASE
            WHEN cm.id IS NULL THEN NULL
            WHEN cm.hours_used > mp.monthly_hours
            THEN cm.hours_used - mp.monthly_hours
            ELSE 0
          END AS overage_hours,

          CASE
            WHEN cm.id IS NULL THEN NULL
            WHEN cm.hours_used > mp.monthly_hours
            THEN
              (cm.hours_used - mp.monthly_hours)
              * mp.overage_rate
            ELSE 0
          END AS overage_cost

       FROM companies c

       LEFT JOIN company_memberships cm
         ON c.id = cm.company_id
        AND cm.month = $1
        AND cm.year = $2

       LEFT JOIN membership_plans mp
         ON cm.plan_id = mp.id

       ORDER BY c.name`,
      [month, year]
    );

    res.json(result.rows);
  } catch (err) {
    console.error('Error getting companies:', err);
    res.status(500).json({ error: 'Server error' });
  }
};

// Create company
const createCompany = async (req, res) => {
  const { name } = req.body;

  if (!name || !name.trim()) {
    return res.status(400).json({
      error: 'Company name is required'
    });
  }

  try {
    const result = await pool.query(
      `INSERT INTO companies (name)
       VALUES ($1)
       RETURNING *`,
      [name.trim()]
    );

    res.status(201).json(result.rows[0]);
  } catch (err) {
    console.error('Error creating company:', err);
    res.status(500).json({ error: 'Server error' });
  }
};

// Assign user to company
const assignUserToCompany = async (req, res) => {
  const { userId, companyId } = req.params;

  try {
    const result = await pool.query(
      `UPDATE users
       SET company_id = $1
       WHERE id = $2
       RETURNING *`,
      [companyId, userId]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'User not found' });
    }

    res.json(result.rows[0]);
  } catch (err) {
    console.error('Error assigning user to company:', err);
    res.status(500).json({ error: 'Server error' });
  }
};

module.exports = {
  getAllUsers,
  updateUserRole,
  getAllCompanies,
  createCompany,
  assignUserToCompany
};