import { useEffect, useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import { apiRequest } from '../services/api';

function RoomDetailsPage() {
  const { roomId } = useParams();

  const [reservations, setReservations] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const [startTime, setStartTime] = useState('');
  const [endTime, setEndTime] = useState('');
  const [message, setMessage] = useState('');
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    async function loadReservations() {
      try {
        const data = await apiRequest(
          `/api/reservations/room/${roomId}`
        );

        setReservations(data);
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    }

    loadReservations();
  }, [roomId]);

  async function handleBooking(event) {
    event.preventDefault();

    setMessage('');
    setSubmitting(true);

    try {
      const authResponse = await apiRequest('/auth/me');

      // Supports either:
      // { id, company_id, ... }
      // or { user: { id, company_id, ... } }
      const user = authResponse.user ?? authResponse;

      if (!user?.id || !user?.company_id) {
        throw new Error(
          'Your account must be assigned to a company before booking.'
        );
      }

      const result = await apiRequest('/api/reservations', {
        method: 'POST',
        body: JSON.stringify({
          room_id: Number(roomId),
          user_id: user.id,
          company_id: user.company_id,
          start_time: startTime,
          end_time: endTime,
        }),
      });

      setMessage(
        result.overage_warning ||
          'Reservation created successfully.'
      );

      setStartTime('');
      setEndTime('');

      const updatedReservations = await apiRequest(
        `/api/reservations/room/${roomId}`
      );

      setReservations(updatedReservations);
    } catch (err) {
      setMessage(err.message);
    } finally {
      setSubmitting(false);
    }
  }

  async function handleCancel(reservationId) {
setMessage('');
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

async function handleEdit(reservation) {
    setMessage('');
  const newStartTime = window.prompt(
    'Enter the new start time:',
    reservation.start_time.slice(0, 16)
  );

  if (!newStartTime) {
    return;
  }

  const newEndTime = window.prompt(
    'Enter the new end time:',
    reservation.end_time.slice(0, 16)
  );

  if (!newEndTime) {
    return;
  }

  try {
    const updatedReservation = await apiRequest(
      `/api/reservations/${reservation.id}`,
      {
        method: 'PATCH',
        body: JSON.stringify({
          room_id: reservation.room_id,
          start_time: newStartTime,
          end_time: newEndTime,
        }),
      }
    );

    setReservations((current) =>
      current.map((item) =>
        item.id === reservation.id
          ? updatedReservation
          : item
      )
    );

    setMessage('Reservation updated successfully.');
  } catch (err) {
    setMessage(err.message);
  }
}

  return (
    <main>
      <Link to="/rooms">Back to rooms</Link>

      <h1>Room Availability</h1>

      <section className="booking-form">
        <h2>Book This Room</h2>

        <form onSubmit={handleBooking}>
          <label>
            Start time
            <input
              type="datetime-local"
              value={startTime}
              onChange={(event) =>
                setStartTime(event.target.value)
              }
              required
            />
          </label>

          <label>
            End time
            <input
              type="datetime-local"
              value={endTime}
              onChange={(event) =>
                setEndTime(event.target.value)
              }
              min={startTime || undefined}
              required
            />
          </label>

          <button type="submit" disabled={submitting}>
            {submitting ? 'Booking...' : 'Book Room'}
          </button>
        </form>

        {message && <p>{message}</p>}
      </section>

      {loading && <p>Loading reservations...</p>}

      {error && <p>Error: {error}</p>}

      {!loading &&
        !error &&
        reservations.length === 0 && (
          <p>This room currently has no reservations.</p>
        )}

      {!loading &&
        !error &&
        reservations.length > 0 && (
          <>
            <h2>Current Reservations</h2>

            <div className="reservation-list">
              {reservations.map((reservation) => (
                <article
  className="reservation-card"
  key={reservation.id}
>
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

  <div className="reservation-actions">
    <button
      type="button"
      onClick={() => handleEdit(reservation)}
    >
      Edit
    </button>

    <button
      type="button"
      onClick={() => handleCancel(reservation.id)}
    >
      Cancel
    </button>
  </div>
</article>
              ))}
            </div>
          </>
        )}
    </main>
  );
}

export default RoomDetailsPage;