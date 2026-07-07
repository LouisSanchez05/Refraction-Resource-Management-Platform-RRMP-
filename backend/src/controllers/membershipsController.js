const pool = require('../db/pool');

// Assign a membership plan to a company for a specific month/year
const assignMembership = async (req, res) => {
  const { company_id, plan_id, month, year } = req.body;

  if (!company_id || !plan_id || !month || !year) {
    return res.status(400).json({ error: 'company_id, plan_id, month, and year are required' });
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
       VALUES ($1, $2, 0, $3, $4)
       RETURNING *`,
      [company_id, plan_id, month, year]
    );

    res.status(201).json(result.rows[0]);
  } catch (err) {
    console.error('Error assigning membership:', err);
    res.status(500).json({ error: 'Server error' });
  }
};

// Get current monthly balance for a company
const getCompanyBalance = async (req, res) => {
  const { companyId } = req.params;

  const month =
    Number(req.query.month) || new Date().getMonth() + 1;

  const year =
    Number(req.query.year) || new Date().getFullYear();

  try {
    const result = await pool.query(
      `SELECT 
          cm.id,
          cm.company_id,
          cm.plan_id,
          cm.hours_used,
          cm.month,
          cm.year,
          mp.name AS plan_name,
          mp.monthly_hours,
          mp.overage_rate,
          GREATEST(mp.monthly_hours - cm.hours_used, 0) AS remaining_hours,
          CASE 
            WHEN cm.hours_used > mp.monthly_hours
            THEN cm.hours_used - mp.monthly_hours
            ELSE 0
          END AS overage_hours,
          CASE 
            WHEN cm.hours_used > mp.monthly_hours
            THEN (cm.hours_used - mp.monthly_hours) * mp.overage_rate
            ELSE 0
          END AS overage_cost
       FROM company_memberships cm
       JOIN membership_plans mp ON cm.plan_id = mp.id
       WHERE cm.company_id = $1 
         AND cm.month = $2 
         AND cm.year = $3`,
      [companyId, month, year]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'No membership found for this company this month' });
    }

    res.json(result.rows[0]);
  } catch (err) {
    console.error('Error getting company balance:', err);
    res.status(500).json({ error: 'Server error' });
  }
};
const updateMembershipPlan = async (req, res) => {
  const { planId } = req.params;
  const { name, monthly_hours, overage_rate } = req.body;

  try {
    const result = await pool.query(
      `UPDATE membership_plans
       SET name = COALESCE($1, name),
           monthly_hours = COALESCE($2, monthly_hours),
           overage_rate = COALESCE($3, overage_rate)
       WHERE id = $4
       RETURNING *`,
      [name, monthly_hours, overage_rate, planId]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Membership plan not found' });
    }

    res.json(result.rows[0]);
  } catch (err) {
    console.error('Error updating membership plan:', err);
    res.status(500).json({ error: 'Server error' });
  }
};

// Get monthly report for all companies
const getMonthlyReport = async (req, res) => {
  const month = req.query.month || new Date().getMonth() + 1;
  const year = req.query.year || new Date().getFullYear();

  try {
    const result = await pool.query(
      `SELECT 
          c.id AS company_id,
          c.name AS company_name,
          mp.name AS plan_name,
          mp.monthly_hours,
          mp.overage_rate,
          cm.hours_used,
          GREATEST(mp.monthly_hours - cm.hours_used, 0) AS remaining_hours,
          CASE 
            WHEN cm.hours_used > mp.monthly_hours
            THEN cm.hours_used - mp.monthly_hours
            ELSE 0
          END AS overage_hours,
          CASE 
            WHEN cm.hours_used > mp.monthly_hours
            THEN (cm.hours_used - mp.monthly_hours) * mp.overage_rate
            ELSE 0
          END AS overage_cost,
          cm.month,
          cm.year
       FROM company_memberships cm
       JOIN companies c ON cm.company_id = c.id
       JOIN membership_plans mp ON cm.plan_id = mp.id
       WHERE cm.month = $1 
         AND cm.year = $2
       ORDER BY c.name`,
      [month, year]
    );

    res.json(result.rows);
  } catch (err) {
    console.error('Error getting monthly report:', err);
    res.status(500).json({ error: 'Server error' });
  }
};

module.exports = {
  assignMembership,
  getCompanyBalance,
  getMonthlyReport,
  updateMembershipPlan
};