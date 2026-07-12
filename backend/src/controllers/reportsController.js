const pool = require('../db/pool');

// Room utilization report
const getRoomUtilization = async (req, res) => {
  const month = Number(req.query.month) || new Date().getMonth() + 1;
  const year = Number(req.query.year) || new Date().getFullYear();

  try {
    const result = await pool.query(
      `SELECT
          r.id AS room_id,
          r.name AS room_name,
          r.type AS room_type,
          COUNT(res.id) AS total_bookings,
          COALESCE(SUM(EXTRACT(EPOCH FROM (res.end_time - res.start_time)) / 3600), 0) AS total_hours_booked
       FROM rooms r
       LEFT JOIN reservations res ON r.id = res.room_id
         AND EXTRACT(MONTH FROM res.start_time) = $1
         AND EXTRACT(YEAR FROM res.start_time) = $2
       GROUP BY r.id, r.name, r.type
       ORDER BY total_hours_booked DESC`,
      [month, year]
    );

    res.json(result.rows);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Server error' });
  }
};

module.exports = { getRoomUtilization };