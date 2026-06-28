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

    // calculate hours for this reservation
    const start = new Date(start_time);
    const end = new Date(end_time);
    const hours = (end - start) / (1000 * 60 * 60);

    // create the reservation
    const result = await pool.query(
      `INSERT INTO reservations (room_id, user_id, company_id, start_time, end_time)
       VALUES ($1, $2, $3, $4, $5)
       RETURNING *`,
      [room_id, user_id, company_id, start_time, end_time]
    );

    // update company hours used
    const month = start.getMonth() + 1;
    const year = start.getFullYear();

    await pool.query(
      `UPDATE company_memberships
       SET hours_used = hours_used + $1
       WHERE company_id = $2 AND month = $3 AND year = $4`,
      [hours, company_id, month, year]
    );

    res.status(201).json(result.rows[0]);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Server error' });
  }
};