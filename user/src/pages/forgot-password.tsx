import { type FormEvent, useState } from 'react';
import { Link } from 'react-router-dom';
import { resetPassword } from '../api/client.ts';

export default function ForgotPassword() {
  const [email, setEmail] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');
  const [submitting, setSubmitting] = useState(false);

  const handleSubmit = async (event: FormEvent) => {
    event.preventDefault();
    setError('');
    setMessage('');

    if (newPassword.length < 6) {
      setError('Password must be at least 6 characters.');
      return;
    }

    if (newPassword !== confirmPassword) {
      setError('Passwords do not match.');
      return;
    }

    setSubmitting(true);
    try {
      const result = await resetPassword(email, newPassword);
      setMessage(result);
      setEmail('');
      setNewPassword('');
      setConfirmPassword('');
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Password reset failed.');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <section className="flat-spacing">
      <div className="container">
        <div className="row justify-content-center">
          <div className="col-md-6">
            <h1 className="page-title font-instrument_serif fw-normal mb-16">Forgot Password</h1>
            <p className="cl-text-5 mb-24">Enter your email and choose a new password.</p>
            <form onSubmit={handleSubmit}>
              <div className="mb-24">
                <label className="form-label" htmlFor="resetEmail">
                  Email address
                </label>
                <input
                  id="resetEmail"
                  className="form-control style-2"
                  type="email"
                  required
                  value={email}
                  onChange={(event) => setEmail(event.target.value)}
                />
              </div>
              <div className="mb-24">
                <label className="form-label" htmlFor="newPassword">
                  New password
                </label>
                <input
                  id="newPassword"
                  className="form-control style-2"
                  type="password"
                  required
                  minLength={6}
                  value={newPassword}
                  onChange={(event) => setNewPassword(event.target.value)}
                />
              </div>
              <div className="mb-24">
                <label className="form-label" htmlFor="confirmPassword">
                  Confirm password
                </label>
                <input
                  id="confirmPassword"
                  className="form-control style-2"
                  type="password"
                  required
                  minLength={6}
                  value={confirmPassword}
                  onChange={(event) => setConfirmPassword(event.target.value)}
                />
              </div>
              {error && <p className="text-danger mb-16">{error}</p>}
              {message && <p className="text-success mb-16">{message}</p>}
              <button type="submit" className="tf-btn style-2 type-2 w-100 mb-16" disabled={submitting}>
                {submitting ? 'Resetting...' : 'Reset password'}
              </button>
              <Link to="/" className="tf-btn-line fw-normal w-100 text-center">
                Back to home
              </Link>
            </form>
          </div>
        </div>
      </div>
    </section>
  );
}
