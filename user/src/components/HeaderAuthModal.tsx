import { type FormEvent, useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext.tsx';

export default function HeaderAuthModal() {
  const {
    authModalOpen,
    authMode,
    closeAuthModal,
    setAuthMode,
    login,
    register,
  } = useAuth();

  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [address, setAddress] = useState('');
  const [error, setError] = useState('');
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    if (!authModalOpen) {
      setError('');
      setSubmitting(false);
    }
  }, [authModalOpen]);

  useEffect(() => {
    const modalEl = document.getElementById('modalHerbaviAuth');
    const bootstrap = (
      window as Window & {
        bootstrap?: { Modal: { getOrCreateInstance: (el: HTMLElement) => { show: () => void; hide: () => void } } };
      }
    ).bootstrap;

    if (!modalEl || !bootstrap?.Modal) return;

    const instance = bootstrap.Modal.getOrCreateInstance(modalEl);
    if (authModalOpen) {
      instance.show();
    } else {
      instance.hide();
    }
  }, [authModalOpen]);

  useEffect(() => {
    const modalEl = document.getElementById('modalHerbaviAuth');
    if (!modalEl) return;

    const handleHidden = () => closeAuthModal();
    modalEl.addEventListener('hidden.bs.modal', handleHidden);
    return () => modalEl.removeEventListener('hidden.bs.modal', handleHidden);
  }, [closeAuthModal]);

  const resetFields = () => {
    setName('');
    setEmail('');
    setPassword('');
    setAddress('');
    setError('');
  };

  const switchMode = (mode: 'login' | 'register') => {
    setAuthMode(mode);
    setError('');
  };

  const handleSubmit = async (event: FormEvent) => {
    event.preventDefault();
    setError('');
    setSubmitting(true);

    try {
      if (authMode === 'login') {
        await login(email.trim(), password);
      } else {
        await register({
          name: name.trim(),
          email: email.trim(),
          password,
          address: address.trim(),
        });
      }
      resetFields();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Something went wrong.');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="modal fade modalCentered herbavi-auth-modal" id="modalHerbaviAuth" tabIndex={-1}>
      <div className="modal-dialog modal-dialog-centered herbavi-auth-dialog">
        <div className="modal-content">
          <button
            type="button"
            className="icon icon-Close btn-close-popup fs-24 herbavi-auth-close"
            data-bs-dismiss="modal"
            aria-label="Close"
          ></button>

          <div className="herbavi-auth-shell">
            <div className="herbavi-auth-intro">
              <p className="herbavi-auth-eyebrow">Herbavi account</p>
              <h3 className="herbavi-auth-title font-instrument_serif">
                {authMode === 'login' ? 'Welcome back' : 'Create your account'}
              </h3>
              <p className="herbavi-auth-copy">
                {authMode === 'login'
                  ? 'Sign in to save your wishlist, track orders, and manage your profile.'
                  : 'Register with your details to shop naturally crafted skincare with ease.'}
              </p>
            </div>

            <div className="herbavi-auth-panel">
              <div className="herbavi-auth-tabs" role="tablist">
                <button
                  type="button"
                  className={`herbavi-auth-tab${authMode === 'login' ? ' active' : ''}`}
                  onClick={() => switchMode('login')}
                >
                  Login
                </button>
                <button
                  type="button"
                  className={`herbavi-auth-tab${authMode === 'register' ? ' active' : ''}`}
                  onClick={() => switchMode('register')}
                >
                  Register
                </button>
              </div>

              <form className="herbavi-auth-form" onSubmit={handleSubmit}>
                {error && <p className="herbavi-auth-error">{error}</p>}

                {authMode === 'register' && (
                  <div className="herbavi-auth-field">
                    <label htmlFor="auth-name">Full name</label>
                    <input
                      id="auth-name"
                      type="text"
                      className="form-control style-2"
                      placeholder="Your name"
                      value={name}
                      onChange={(event) => setName(event.target.value)}
                      required
                    />
                  </div>
                )}

                <div className="herbavi-auth-field">
                  <label htmlFor="auth-email">Email address</label>
                  <input
                    id="auth-email"
                    type="email"
                    className="form-control style-2"
                    placeholder="you@example.com"
                    value={email}
                    onChange={(event) => setEmail(event.target.value)}
                    required
                  />
                </div>

                <div className="herbavi-auth-field">
                  <label htmlFor="auth-password">Password</label>
                  <input
                    id="auth-password"
                    type="password"
                    className="form-control style-2"
                    placeholder="Minimum 6 characters"
                    value={password}
                    onChange={(event) => setPassword(event.target.value)}
                    minLength={6}
                    required
                  />
                </div>

                {authMode === 'register' && (
                  <div className="herbavi-auth-field">
                    <label htmlFor="auth-address">Delivery address</label>
                    <textarea
                      id="auth-address"
                      className="form-control style-2 herbavi-auth-textarea"
                      placeholder="House no., street, city, state, PIN code"
                      rows={3}
                      value={address}
                      onChange={(event) => setAddress(event.target.value)}
                      required
                    />
                    <p className="herbavi-auth-hint">Use a complete delivery address for orders and account details.</p>
                  </div>
                )}

                <button type="submit" className="tf-btn style-2 type-2 w-100" disabled={submitting}>
                  {submitting
                    ? authMode === 'login'
                      ? 'Signing in...'
                      : 'Creating account...'
                    : authMode === 'login'
                      ? 'Sign in'
                      : 'Create account'}
                </button>

                {authMode === 'login' && (
                  <p className="herbavi-auth-footnote text-center">
                    <Link to="/forgot-password" data-bs-dismiss="modal">
                      Forgot password?
                    </Link>
                  </p>
                )}
              </form>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
