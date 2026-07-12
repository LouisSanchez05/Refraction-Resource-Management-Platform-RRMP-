const pool = require('../db/pool');

// get all reservations for a room
const getRoomReservations = async (req, res) => {
  const { roomId } = req.params;
  try {
    const result = await pool.query(
      `SELECT r.*, u.name as user_name, c.name as company_name
       FROM reservations r
       JOIN users u ON r.user_id = u.id
       JOIN companies c ON r.company_id = c.id
       WHERE r.room_id = $1
       ORDER BY r.start_time`,
      [roomId]
    );
    res.json(result.rows);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Server error' });
  }
};

// create a reservation
const createReservation = async (req, res) => {
  const { room_id, user_id, company_id, start_time, end_time } = req.body;

  if (!room_id || !user_id || !company_id || !start_time || !end_time) {
    return res.status(400).json({ error: 'All fields are required' });
  }

  try {
    const conflict = await pool.query(
      `SELECT * FROM reservations
       WHERE room_id = $1
       AND start_time < $2
       AND end_time > $3`,
      [room_id, end_time, start_time]
    );

    if (conflict.rows.length > 0) {
      return res.status(409).json({ error: 'Room is already booked for this time' });
    }

    const start = new Date(start_time);
    const end = new Date(end_time);
    const hours = (end - start) / (1000 * 60 * 60);

    const result = await pool.query(
      `INSERT INTO reservations (room_id, user_id, company_id, start_time, end_time)
       VALUES ($1, $2, $3, $4, $5)
       RETURNING *`,
      [room_id, user_id, company_id, start_time, end_time]
    );

    const month = start.getMonth() + 1;
    const year = start.getFullYear();

    await pool.query(
      `UPDATE company_memberships
       SET hours_used = hours_used + $1
       WHERE company_id = $2 AND month = $3 AND year = $4`,
      [hours, company_id, month, year]
    );

    const membership = await pool.query(
      `SELECT cm.hours_used, mp.monthly_hours
       FROM company_memberships cm
       JOIN membership_plans mp ON cm.plan_id = mp.id
       WHERE cm.company_id = $1 AND cm.month = $2 AND cm.year = $3`,
      [company_id, month, year]
    );

    let overage_warning = null;
    if (membership.rows.length > 0) {
      const { hours_used, monthly_hours } = membership.rows[0];
      if (hours_used > monthly_hours) {
        overage_warning = `Warning: Your company has exceeded its monthly allocation by ${hours_used - monthly_hours} hours.`;
      }
    }

    res.status(201).json({
      reservation: result.rows[0],
      overage_warning
    });

  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Server error' });
  }
};

// cancel a reservation
const cancelReservation = async (req, res) => {
  const { id } = req.params;
  try {
    const result = await pool.query(
      'DELETE FROM reservations WHERE id = $1 RETURNING *',
      [id]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Reservation not found' });
    }

    res.json({ message: 'Reservation cancelled', reservation: result.rows[0] });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Server error' });
  }
};

module.exports = { getRoomReservations, createReservation, cancelReservation };