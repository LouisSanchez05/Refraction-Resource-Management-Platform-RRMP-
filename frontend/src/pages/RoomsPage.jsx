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
    description: '',
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

    setNewRoom((currentRoom) => ({
      ...currentRoom,
      [name]: value,
    }));
  }

  async function handleCreateRoom(event) {
    event.preventDefault();

    const name = newRoom.name.trim();
    const type = newRoom.type.trim();
    const description = newRoom.description.trim();

    if (!name || !type) {
      setError('Room name and type are required.');
      return;
    }

    const capacity =
      newRoom.capacity === ''
        ? null
        : Number(newRoom.capacity);

    if (
      capacity !== null &&
      (!Number.isInteger(capacity) || capacity < 1)
    ) {
      setError('Capacity must be a whole number greater than zero.');
      return;
    }

    setSubmitting(true);
    setMessage('');
    setError('');

    try {
      const createdRoom = await apiRequest('/api/rooms', {
        method: 'POST',
        body: JSON.stringify({
          name,
          type,
          capacity,
          description: description || null,
        }),
      });

      const roomToAdd = createdRoom.room ?? createdRoom;

      setRooms((currentRooms) =>
        [...currentRooms, roomToAdd].sort((a, b) =>
          a.name.localeCompare(b.name)
        )
      );

      setNewRoom({
        name: '',
        type: '',
        capacity: '',
        description: '',
      });

      setShowForm(false);
      setMessage('Room created successfully.');
    } catch (err) {
      setError(err.message);
    } finally {
      setSubmitting(false);
    }
  }

  function handleCancelForm() {
    setShowForm(false);
    setError('');

    setNewRoom({
      name: '',
      type: '',
      capacity: '',
      description: '',
    });
  }

  return (
    <main>
      <div className="page-heading">
        <div>
          <h1>Rooms</h1>
          <p>View and manage available spaces.</p>
        </div>

        <button
          type="button"
          onClick={() => {
            if (showForm) {
              handleCancelForm();
            } else {
              setShowForm(true);
              setMessage('');
              setError('');
            }
          }}
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
                placeholder="Example: Lamarr"
                disabled={submitting}
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
                placeholder="Example: Meeting Room"
                disabled={submitting}
                required
              />
            </label>

            <label>
              Capacity

              <input
                type="number"
                name="capacity"
                min="1"
                step="1"
                value={newRoom.capacity}
                onChange={handleInputChange}
                placeholder="8"
                disabled={submitting}
              />
            </label>

            <label>
              Description

              <textarea
                name="description"
                value={newRoom.description}
                onChange={handleInputChange}
                placeholder="Describe the room, equipment, lighting, booking rules, or other details."
                rows="5"
                disabled={submitting}
              />
            </label>

            <button
              type="submit"
              disabled={submitting}
            >
              {submitting
                ? 'Creating...'
                : 'Create Room'}
            </button>
          </form>
        </section>
      )}

      {message && (
        <p className="success-message">
          {message}
        </p>
      )}

      {loading && <p>Loading rooms...</p>}

      {error && (
        <p className="error-message">
          Error: {error}
        </p>
      )}

      {!loading && !error && rooms.length === 0 && (
        <p>No rooms found.</p>
      )}

      {!loading && rooms.length > 0 && (
        <div className="room-grid">
          {rooms.map((room) => (
            <article
              className="room-card"
              key={room.id}
            >
              <h2>{room.name}</h2>

              <p>
                <strong>Type:</strong>{' '}
                {room.type}
              </p>

              <p>
                <strong>Capacity:</strong>{' '}
                {room.capacity ?? 'N/A'}
              </p>

              {room.description && (
                <p>
                  <strong>Description:</strong>{' '}
                  {room.description}
                </p>
              )}

              <Link to={`/rooms/${room.id}`}>
                <button type="button">
                  Check Availability
                </button>
              </Link>
            </article>
          ))}
        </div>
      )}
    </main>
  );
}

export default RoomsPage;