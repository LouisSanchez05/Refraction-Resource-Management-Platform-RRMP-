const pool = require('../db/pool');

const getCompanies = async (req, res) => {
  try {
    const result = await pool.query(
      `SELECT
          c.id,
          c.name,
          c.created_at,
          cm.plan_id,
          mp.name AS membership_plan,
          mp.monthly_hours,
          mp.overage_rate
       FROM companies c
       LEFT JOIN company_memberships cm
         ON c.id = cm.company_id
        AND cm.month = $1
        AND cm.year = $2
       LEFT JOIN membership_plans mp
         ON cm.plan_id = mp.id
       ORDER BY c.name`,
      [new Date().getMonth() + 1, new Date().getFullYear()]
    );

    res.json(result.rows);
  } catch (err) {
    console.error('Error getting companies:', err);
    res.status(500).json({ error: 'Server error' });
  }
};

const getCompanyById = async (req, res) => {
  const { companyId } = req.params;
  const month = Number(req.query.month) || new Date().getMonth() + 1;
  const year = Number(req.query.year) || new Date().getFullYear();

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
          cm.hours_used,
          cm.month,
          cm.year
       FROM companies c
       LEFT JOIN company_memberships cm
         ON c.id = cm.company_id
        AND cm.month = $2
        AND cm.year = $3
       LEFT JOIN membership_plans mp
         ON cm.plan_id = mp.id
       WHERE c.id = $1`,
      [companyId, month, year]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Company not found' });
    }

    res.json(result.rows[0]);
  } catch (err) {
    console.error('Error getting company:', err);
    res.status(500).json({ error: 'Server error' });
  }
};

const createCompany = async (req, res) => {
  const { name } = req.body;

  if (!name || !name.trim()) {
    return res.status(400).json({ error: 'Company name is required' });
  }

  try {
    const result = await pool.query(
      `INSERT INTO companies (name)
       VALUES ($1)
       RETURNING id, name, created_at`,
      [name.trim()]
    );

    res.status(201).json(result.rows[0]);
  } catch (err) {
    console.error('Error creating company:', err);
    res.status(500).json({ error: 'Server error' });
  }
};

const updateCompany = async (req, res) => {
  const { companyId } = req.params;
  const { name } = req.body;

  if (!name || !name.trim()) {
    return res.status(400).json({ error: 'Company name is required' });
  }

  try {
    const result = await pool.query(
      `UPDATE companies
       SET name = $1
       WHERE id = $2
       RETURNING id, name, created_at`,
      [name.trim(), companyId]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Company not found' });
    }

    res.json(result.rows[0]);
  } catch (err) {
    console.error('Error updating company:', err);
    res.status(500).json({ error: 'Server error' });
  }
};

module.exports = {
  getCompanies,
  getCompanyById,
  createCompany,
  updateCompany
};