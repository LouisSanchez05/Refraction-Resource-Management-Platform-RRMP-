const pool = require('../db/pool');

const assignMembership = async (req, res) => {
  const { company_id, plan_id, month, year } = req.body;

  if (!company_id || !plan_id || !month || !year) {
    return res.status(400).json({ error: 'All fields are required' });
  }

  try {
    const existing = await pool.query(
      `SELECT * FROM company_memberships
       WHERE company_id = $1 AND month = $2 AND year = $3`,
      [company_id, month, year]
    );

    if (existing.rows.length > 0) {
      return res.status(409).json({ error: 'Membership already assigned for this period' });
    }

    const result = await pool.query(
      `INSERT INTO company_memberships (company_id, plan_id, hours_used, month, year)
       VALUES ($1, $2, 0, $3, $4) RETURNING *`,
      [company_id, plan_id, month, year]
    );

    res.status(201).json(result.rows[0]);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Server error' });
  }
};

const getCompanyBalance = async (req, res) => {
  const { companyId } = req.params;
  const month = new Date().getMonth() + 1;
  const year = new Date().getFullYear();

  try {
    const result = await pool.query(
      `SELECT cm.*, mp.name as plan_name, mp.monthly_hours,
              (mp.monthly_hours - cm.hours_used) as remaining_hours,
              CASE WHEN cm.hours_used > mp.monthly_hours
                   THEN cm.hours_used - mp.monthly_hours
                   ELSE 0 END as overage_hours
       FROM company_memberships cm
       JOIN membership_plans mp ON cm.plan_id = mp.id
       WHERE cm.company_id = $1 AND cm.month = $2 AND cm.year = $3`,
      [companyId, month, year]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'No membership found for this period' });
    }

    res.json(result.rows[0]);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Server error' });
  }
};

const getMonthlyReport = async (req, res) => {
  const { month, year } = req.query;

  try {
    const result = await pool.query(
      `SELECT c.name as company_name, mp.name as plan_name,
              mp.monthly_hours, cm.hours_used,
              CASE WHEN cm.hours_used > mp.monthly_hours
                   THEN cm.hours_used - mp.monthly_hours
                   ELSE 0 END as overage_hours,
              cm.month, cm.year
       FROM company_memberships cm
       JOIN companies c ON cm.company_id = c.id
       JOIN membership_plans mp ON cm.plan_id = mp.id
       WHERE cm.month = $1 AND cm.year = $2
       ORDER BY c.name`,
      [month, year]
    );

    res.json(result.rows);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Server error' });
  }
};

module.exports = { assignMembership, getCompanyBalance, getMonthlyReport };