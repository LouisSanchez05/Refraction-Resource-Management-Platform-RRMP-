import { useEffect, useState } from 'react';
import { apiRequest } from '../services/api';
import { Link } from 'react-router-dom';

function RoomsPage() {
  const [rooms, setRooms] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const [showForm, setShowForm] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [message, setMessage] = useState('');

  const [newRoom, setNewRoom] = useState({
    name: '',
    type: '',
    capacity: '',
  });

  useEffect(() => {
    async function loadRooms() {
      try {
        const data = await apiRequest('/api/rooms');
        setRooms(data);
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    }

    loadRooms();
  }, []);

  function handleInputChange(event) {
    const { name, value } = event.target;

    setNewRoom((current) => ({
      ...current,
      [name]: value,
    }));
  }

  async function handleCreateRoom(event) {
    event.preventDefault();

    setSubmitting(true);
    setMessage('');
    setError('');

    try {
      const createdRoom = await apiRequest('/api/rooms', {
        method: 'POST',
        body: JSON.stringify({
          name: newRoom.name.trim(),
          type: newRoom.type.trim(),
          capacity: Number(newRoom.capacity),
        }),
      });

      setRooms((currentRooms) => [
        ...currentRooms,
        createdRoom.room ?? createdRoom,
      ]);

      setNewRoom({
        name: '',
        type: '',
        capacity: '',
      });

      setShowForm(false);
      setMessage('Room created successfully.');
    } catch (err) {
      setError(err.message);
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <main>
      <div className="page-heading">
        <div>
          <h1>Rooms</h1>
          <p>View and manage available meeting rooms.</p>
        </div>

        <button
          type="button"
          onClick={() => setShowForm((current) => !current)}
        >
          {showForm ? 'Cancel' : 'Add Room'}
        </button>
      </div>

      {showForm && (
        <section className="room-form-section">
          <h2>Create New Room</h2>

          <form
            className="room-form"
            onSubmit={handleCreateRoom}
          >
            <label>
              Room name
              <input
                type="text"
                name="name"
                value={newRoom.name}
                onChange={handleInputChange}
                placeholder="Conference Room A"
                required
              />
            </label>

            <label>
              Room type
              <input
                type="text"
                name="type"
                value={newRoom.type}
                onChange={handleInputChange}
                placeholder="Conference room"
                required
              />
            </label>

            <label>
              Capacity
              <input
                type="number"
                name="capacity"
                min="1"
                value={newRoom.capacity}
                onChange={handleInputChange}
                required
              />
            </label>

            <button type="submit" disabled={submitting}>
              {submitting ? 'Creating...' : 'Create Room'}
            </button>
          </form>
        </section>
      )}

      {message && <p className="success-message">{message}</p>}

      {loading && <p>Loading rooms...</p>}
      {error && <p>Error: {error}</p>}

      {!loading && !error && rooms.length === 0 && (
        <p>No rooms found.</p>
      )}

      <div className="room-grid">
        {rooms.map((room) => (
          <article className="room-card" key={room.id}>
            <h2>{room.name}</h2>

            <p>
              <strong>Type:</strong> {room.type}
            </p>

            <p>
              <strong>Capacity:</strong>{' '}
              {room.capacity ?? 'N/A'}
            </p>

            <Link to={`/rooms/${room.id}`}>
              <button type="button">
                Check Availability
              </button>
            </Link>
          </article>
        ))}
      </div>
    </main>
  );
}

export default RoomsPage;