import { useEffect, useState } from 'react';
import { apiRequest } from '../services/api';
import { Link } from 'react-router-dom';

function RoomsPage() {
  const [rooms, setRooms] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

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

  return (
    <main>
      <h1>Rooms</h1>

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