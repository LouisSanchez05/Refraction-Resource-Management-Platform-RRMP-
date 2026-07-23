const pool = require('../db/pool');
const { logAction } = require('./auditController');

// get all users
const getAllUsers = async (req, res) => {
  try {
    const result = await pool.query(
      `SELECT u.*, c.name as company_name
       FROM users u
       LEFT JOIN companies c ON u.company_id = c.id
       ORDER BY u.created_at DESC`
    );
    res.json(result.rows);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Server error' });
  }
};

const updateUserRole = async (req, res) => {
  const { id } = req.params;
  const { role } = req.body;
  if (!['admin', 'member', 'staff'].includes(role)) {
    return res.status(400).json({ error: 'Invalid role' });
  }
  try {
    const result = await pool.query(
      'UPDATE users SET role = $1 WHERE id = $2 RETURNING *',
      [role, id]
    );
    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'User not found' });
    }
    await logAction(req.user?.id, 'UPDATE_ROLE', 'user', id, { new_role: role });
    res.json(result.rows[0]);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Server error' });
  }
};

const getAllCompanies = async (req, res) => {
  try {
    const result = await pool.query('SELECT * FROM companies ORDER BY name');
    res.json(result.rows);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Server error' });
  }
};

const createCompany = async (req, res) => {
  const { name } = req.body;
  if (!name) {
    return res.status(400).json({ error: 'Company name is required' });
  }
  try {
    const result = await pool.query(
      'INSERT INTO companies (name) VALUES ($1) RETURNING *',
      [name]
    );
    await logAction(req.user?.id, 'CREATE_COMPANY', 'company', result.rows[0].id, { name });
    res.status(201).json(result.rows[0]);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Server error' });
  }
};

const assignUserToCompany = async (req, res) => {
  const { userId, companyId } = req.params;
  try {
    const result = await pool.query(
      'UPDATE users SET company_id = $1 WHERE id = $2 RETURNING *',
      [companyId, userId]
    );
    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'User not found' });
    }
    await logAction(req.user?.id, 'ASSIGN_COMPANY', 'user', userId, { company_id: companyId });
    res.json(result.rows[0]);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Server error' });
  }
};

const getAllRooms = async (req, res) => {
  try {
    const result = await pool.query('SELECT * FROM rooms ORDER BY name');
    res.json(result.rows);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Server error' });
  }
};

const createRoom = async (req, res) => {
  const { name, type, capacity } = req.body;
  if (!name || !type) {
    return res.status(400).json({ error: 'Name and type are required' });
  }
  if (!['meeting_room', 'board_room', 'event_space'].includes(type)) {
    return res.status(400).json({ error: 'Invalid room type' });
  }
  try {
    const result = await pool.query(
      'INSERT INTO rooms (name, type, capacity) VALUES ($1, $2, $3) RETURNING *',
      [name, type, capacity]
    );
    await logAction(req.user?.id, 'CREATE_ROOM', 'room', result.rows[0].id, { name, type, capacity });
    res.status(201).json(result.rows[0]);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Server error' });
  }
};

const updateRoom = async (req, res) => {
  const { id } = req.params;
  const { name, type, capacity } = req.body;
  try {
    const result = await pool.query(
      `UPDATE rooms SET
        name = COALESCE($1, name),
        type = COALESCE($2, type),
        capacity = COALESCE($3, capacity)
       WHERE id = $4 RETURNING *`,
      [name, type, capacity, id]
    );
    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Room not found' });
    }
    await logAction(req.user?.id, 'UPDATE_ROOM', 'room', id, { name, type, capacity });
    res.json(result.rows[0]);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Server error' });
  }
};

const deleteRoom = async (req, res) => {
  const { id } = req.params;
  try {
    const result = await pool.query(
      'DELETE FROM rooms WHERE id = $1 RETURNING *',
      [id]
    );
    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Room not found' });
    }
    await logAction(req.user?.id, 'DELETE_ROOM', 'room', id, {});
    res.json({ message: 'Room deleted', room: result.rows[0] });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Server error' });
  }
};

module.exports = { getAllUsers, updateUserRole, getAllCompanies, createCompany, assignUserToCompany, getAllRooms, createRoom, updateRoom, deleteRoom };