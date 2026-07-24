const pool = require('../db/pool');

async function getRooms(req, res) {
  try {
    const result = await pool.query(
      `
      SELECT *
      FROM rooms
      ORDER BY name ASC
      `
    );

    return res.json(result.rows);
  } catch (error) {
    console.error('Get rooms error:', error);

    return res.status(500).json({
      error: 'Unable to retrieve rooms.',
    });
  }
}

async function getRoomById(req, res) {
  const { roomId } = req.params;

  try {
    const result = await pool.query(
      `
      SELECT *
      FROM rooms
      WHERE id = $1
      `,
      [roomId]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({
        error: 'Room not found.',
      });
    }

    return res.json(result.rows[0]);
  } catch (error) {
    console.error('Get room error:', error);

    return res.status(500).json({
      error: 'Unable to retrieve room.',
    });
  }
}

async function createRoom(req, res) {
  const { name, type, capacity, description } = req.body;

  const trimmedName = name?.trim();
  const trimmedType = type?.trim();
  const trimmedDescription = description?.trim();

  if (!trimmedName || !trimmedType) {
    return res.status(400).json({
      error: 'Name and type are required.',
    });
  }

  const parsedCapacity =
    capacity === null ||
    capacity === undefined ||
    capacity === ''
      ? null
      : Number(capacity);

  if (
    parsedCapacity !== null &&
    (!Number.isInteger(parsedCapacity) || parsedCapacity < 1)
  ) {
    return res.status(400).json({
      error: 'Capacity must be a whole number greater than zero.',
    });
  }

  try {
    const result = await pool.query(
      `
      INSERT INTO rooms (
        name,
        type,
        capacity,
        description
      )
      VALUES ($1, $2, $3, $4)
      RETURNING *
      `,
      [
        trimmedName,
        trimmedType,
        parsedCapacity,
        trimmedDescription || null,
      ]
    );

    return res.status(201).json(result.rows[0]);
  } catch (error) {
    console.error('Create room error:', error);

    return res.status(500).json({
      error: 'Unable to create room.',
    });
  }
}

module.exports = {
  getRooms,
  getRoomById,
  createRoom,
};