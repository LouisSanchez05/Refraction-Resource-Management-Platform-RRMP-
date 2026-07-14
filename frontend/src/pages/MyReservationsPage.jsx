import { useEffect, useState } from 'react';
import { apiRequest } from '../services/api';

function MyReservationsPage() {
  const [reservations, setReservations] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [message, setMessage] = useState('');
  const [editingId, setEditingId] = useState(null);
  const [editStartTime, setEditStartTime] = useState('');
  const [editEndTime, setEditEndTime] = useState('');

  useEffect(() => {
    async function loadReservations() {
      try {
        const authResponse = await apiRequest('/auth/me');
        const user = authResponse.user ?? authResponse;

        const data = await apiRequest(
          `/api/reservations/user/${user.id}`
        );

        setReservations(data);
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    }

    loadReservations();
  }, []);

  function startEditing(reservation) {
  setEditingId(reservation.id);

  setEditStartTime(
    new Date(reservation.start_time)
      .toISOString()
      .slice(0, 16)
  );

  setEditEndTime(
    new Date(reservation.end_time)
      .toISOString()
      .slice(0, 16)
  );

  setMessage('');
}

function stopEditing() {
  setEditingId(null);
  setEditStartTime('');
  setEditEndTime('');
}

async function handleEdit(reservation) {
  setMessage('');

  try {
    const updatedReservation = await apiRequest(
      `/api/reservations/${reservation.id}`,
      {
        method: 'PATCH',
        body: JSON.stringify({
          room_id: reservation.room_id,
          start_time: editStartTime,
          end_time: editEndTime,
        }),
      }
    );

    setReservations((current) =>
      current.map((item) =>
        item.id === reservation.id
          ? {
              ...item,
              ...updatedReservation,
            }
          : item
      )
    );

    setMessage('Reservation updated successfully.');
    stopEditing();
  } catch (err) {
    setMessage(err.message);
  }
}

  async function handleCancel(reservationId) {
    const confirmed = window.confirm(
      'Are you sure you want to cancel this reservation?'
    );

    if (!confirmed) {
      return;
    }

    try {
      await apiRequest(
        `/api/reservations/${reservationId}`,
        {
          method: 'DELETE',
        }
      );

      setReservations((current) =>
        current.filter(
          (reservation) =>
            reservation.id !== reservationId
        )
      );

      setMessage('Reservation canceled successfully.');
    } catch (err) {
      setMessage(err.message);
    }
  }

  if (loading) {
    return (
      <main>
        <p>Loading reservations...</p>
      </main>
    );
  }

  return (
    <main>
      <h1>My Reservations</h1>

      {error && <p>Error: {error}</p>}
      {message && <p>{message}</p>}

      {!error && reservations.length === 0 && (
        <p>You do not have any reservations.</p>
      )}

      <div className="reservation-list">
        {reservations.map((reservation) => (
                <article
        className="reservation-card"
        key={reservation.id}
        >
        <h2>{reservation.room_name}</h2>

        <p>
            <strong>Room type:</strong>{' '}
            {reservation.room_type}
        </p>

        {editingId === reservation.id ? (
            <div className="edit-reservation-form">
            <label>
                Start time
                <input
                type="datetime-local"
                value={editStartTime}
                onChange={(event) =>
                    setEditStartTime(event.target.value)
                }
                />
            </label>

            <label>
                End time
                <input
                type="datetime-local"
                value={editEndTime}
                min={editStartTime || undefined}
                onChange={(event) =>
                    setEditEndTime(event.target.value)
                }
                />
            </label>

            <div className="reservation-actions">
                <button
                type="button"
                onClick={() => handleEdit(reservation)}
                >
                Save Changes
                </button>

                <button
                type="button"
                onClick={stopEditing}
                >
                Cancel Edit
                </button>
            </div>
            </div>
        ) : (
            <>
            <p>
                <strong>Start:</strong>{' '}
                {new Date(
                reservation.start_time
                ).toLocaleString()}
            </p>

            <p>
                <strong>End:</strong>{' '}
                {new Date(
                reservation.end_time
                ).toLocaleString()}
            </p>

            <p>
                <strong>Status:</strong>{' '}
                {reservation.status ?? 'confirmed'}
            </p>

            <div className="reservation-actions">
                <button
                type="button"
                onClick={() => startEditing(reservation)}
                >
                Edit
                </button>

                <button
                type="button"
                onClick={() =>
                    handleCancel(reservation.id)
                }
                >
                Cancel Reservation
                </button>
            </div>
            </>
        )}
        </article>
        ))}
      </div>
    </main>
  );
}

export default MyReservationsPage;