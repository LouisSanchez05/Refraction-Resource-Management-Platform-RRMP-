const pool = require('../db/pool');

const getUserReservations = async (req, res) => {
  const { userId } = req.params;

  try {
    const result = await pool.query(
      `SELECT
          res.id,
          res.room_id,
          res.user_id,
          res.company_id,
          res.start_time,
          res.end_time,
          res.status,
          res.created_at,
          r.name AS room_name,
          r.type AS room_type,
          c.name AS company_name
       FROM reservations res
       JOIN rooms r ON res.room_id = r.id
       JOIN companies c ON res.company_id = c.id
       WHERE res.user_id = $1
       ORDER BY res.start_time`,
      [userId]
    );

    res.json(result.rows);
  } catch (err) {
    console.error('Error getting user reservations:', err);
    res.status(500).json({ error: 'Server error' });
  }
};

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

    if (
      Number.isNaN(start.getTime()) ||
      Number.isNaN(end.getTime()) ||
      end <= start
    ) {
      return res.status(400).json({
        error: 'End time must be after start time'
      });
    }

    // check business hours for members
    if (req.user && req.user.role === 'member') {
      const startHour = start.getHours();
      const endHour = end.getHours();
      if (startHour < 9 || endHour > 17 || (endHour === 17 && end.getMinutes() > 0)) {
        return res.status(403).json({
          error: 'Members can only book rooms between 9am and 5pm'
        });
      }
    }

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

const updateReservation = async (req, res) => {
  const { id } = req.params;
  const { room_id, start_time, end_time } = req.body;

  if (!room_id || !start_time || !end_time) {
    return res.status(400).json({
      error: 'room_id, start_time, and end_time are required'
    });
  }

  const start = new Date(start_time);
  const end = new Date(end_time);

  if (
    Number.isNaN(start.getTime()) ||
    Number.isNaN(end.getTime()) ||
    end <= start
  ) {
    return res.status(400).json({
      error: 'End time must be after start time'
    });
  }

  const client = await pool.connect();

  try {
    await client.query('BEGIN');

    const existingResult = await client.query(
      `SELECT * FROM reservations WHERE id = $1 FOR UPDATE`,
      [id]
    );

    if (existingResult.rows.length === 0) {
      await client.query('ROLLBACK');
      return res.status(404).json({ error: 'Reservation not found' });
    }

    const existing = existingResult.rows[0];

    const conflictResult = await client.query(
      `SELECT id FROM reservations
       WHERE room_id = $1 AND id <> $2 AND start_time < $3 AND end_time > $4`,
      [room_id, id, end_time, start_time]
    );

    if (conflictResult.rows.length > 0) {
      await client.query('ROLLBACK');
      return res.status(409).json({ error: 'Room is already booked for this time' });
    }

    const oldStart = new Date(existing.start_time);
    const oldEnd = new Date(existing.end_time);
    const oldHours = (oldEnd - oldStart) / (1000 * 60 * 60);
    const newHours = (end - start) / (1000 * 60 * 60);
    const oldMonth = oldStart.getMonth() + 1;
    const oldYear = oldStart.getFullYear();
    const newMonth = start.getMonth() + 1;
    const newYear = start.getFullYear();

    const updateResult = await client.query(
      `UPDATE reservations SET room_id = $1, start_time = $2, end_time = $3 WHERE id = $4 RETURNING *`,
      [room_id, start_time, end_time, id]
    );

    await client.query(
      `UPDATE company_memberships SET hours_used = GREATEST(hours_used - $1, 0) WHERE company_id = $2 AND month = $3 AND year = $4`,
      [oldHours, existing.company_id, oldMonth, oldYear]
    );

    await client.query(
      `UPDATE company_memberships SET hours_used = hours_used + $1 WHERE company_id = $2 AND month = $3 AND year = $4`,
      [newHours, existing.company_id, newMonth, newYear]
    );

    await client.query('COMMIT');
    res.json(updateResult.rows[0]);
  } catch (err) {
    await client.query('ROLLBACK');
    console.error('Error updating reservation:', err);
    res.status(500).json({ error: 'Server error' });
  } finally {
    client.release();
  }
};

// cancel a reservation
const cancelReservation = async (req, res) => {
  const { id } = req.params;
  const client = await pool.connect();

  try {
    await client.query('BEGIN');

    const reservationResult = await client.query(
      `SELECT * FROM reservations WHERE id = $1 FOR UPDATE`,
      [id]
    );

    if (reservationResult.rows.length === 0) {
      await client.query('ROLLBACK');
      return res.status(404).json({ error: 'Reservation not found' });
    }

    const reservation = reservationResult.rows[0];
    const start = new Date(reservation.start_time);
    const end = new Date(reservation.end_time);
    const hours = (end - start) / (1000 * 60 * 60);
    const month = start.getMonth() + 1;
    const year = start.getFullYear();

    await client.query(`DELETE FROM reservations WHERE id = $1`, [id]);

    await client.query(
      `UPDATE company_memberships SET hours_used = GREATEST(hours_used - $1, 0) WHERE company_id = $2 AND month = $3 AND year = $4`,
      [hours, reservation.company_id, month, year]
    );

    await client.query('COMMIT');
    res.json({ message: 'Reservation cancelled', reservation });
  } catch (err) {
    await client.query('ROLLBACK');
    console.error('Error cancelling reservation:', err);
    res.status(500).json({ error: 'Server error' });
  } finally {
    client.release();
  }
};

module.exports = {
  getRoomReservations,
  getUserReservations,
  createReservation,
  updateReservation,
  cancelReservation
};