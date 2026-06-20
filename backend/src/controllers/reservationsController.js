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
    // check for conflicts
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

    // create the reservation
    const result = await pool.query(
      `INSERT INTO reservations (room_id, user_id, company_id, start_time, end_time)
       VALUES ($1, $2, $3, $4, $5)
       RETURNING *`,
      [room_id, user_id, company_id, start_time, end_time]
    );

    res.status(201).json(result.rows[0]);
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