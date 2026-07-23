const pool = require('../db/pool');

// Get all rooms
const getAllRooms = async (req, res) => {
  try {
    const result = await pool.query('SELECT * FROM rooms ORDER BY name');
    res.json(result.rows);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Server error' });
  }
};

// Get single room
const getRoomById = async (req, res) => {
  const { roomId } = req.params;
  try {
    const result = await pool.query('SELECT * FROM rooms WHERE id = $1', [roomId]);
    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Room not found' });
    }
    res.json(result.rows[0]);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Server error' });
  }
};

// Check room availability
const checkAvailability = async (req, res) => {
  const { roomId } = req.params;
  const { start_time, end_time } = req.query;
  if (!start_time || !end_time) {
    return res.status(400).json({ error: 'start_time and end_time are required' });
  }
  try {
    const result = await pool.query(
      `SELECT * FROM reservations
       WHERE room_id = $1
       AND start_time < $2
       AND end_time > $3`,
      [roomId, end_time, start_time]
    );
    if (result.rows.length > 0) {
      return res.json({ available: false });
    }
    return res.json({ available: true });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Server error' });
  }
};

module.exports = { getAllRooms, getRoomById, checkAvailability };