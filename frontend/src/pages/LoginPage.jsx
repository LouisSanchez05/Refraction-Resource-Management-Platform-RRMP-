import './LoginPage.css';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3000';

function LoginPage() {
  const handleGoogleLogin = () => {
    window.location.href = `${API_URL}/auth/google`;
  };

  return (
    <main className="login-page">
      <section className="login-panel">
        <div className="login-brand">
          <img
            src="/refraction-logo.png"
            alt="Refraction Innovation Hub"
            className="login-logo"
          />

          <h1>Welcome to RRMP</h1>

          <p>
            Sign in to reserve rooms, manage bookings, and review company usage.
          </p>
        </div>

        <button
          type="button"
          className="google-login-button"
          onClick={handleGoogleLogin}
        >
          <span className="google-icon">G</span>
          Continue with Google
        </button>

        <p className="login-note">
          Use the Google account associated with your Refraction membership.
        </p>
      </section>
    </main>
  );
}

export default LoginPage;