import { type FormEvent, useEffect, useState } from 'react';
import { useAuth } from '../context/AuthContext.tsx';

export default function AccountSetting() {
  const { user } = useAuth();
  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [address, setAddress] = useState('');
  const [loading, setLoading] = useState(true);
  const [notice, setNotice] = useState('');

  useEffect(() => {
    if (!user) return;
    const parts = user.name.trim().split(/\s+/);
    setFirstName(parts[0] ?? '');
    setLastName(parts.slice(1).join(' '));
    setEmail(user.email);
    setPhone(user.phone);
    setAddress(user.address ?? '');
    setLoading(false);
  }, [user]);

  const handleSubmit = (event: FormEvent) => {
    event.preventDefault();
    setNotice('Profile updates are read-only until an account update API is added.');
  };

  if (loading) {
    return (
      <section className="flat-spacing">
        <div className="container text-center py-5">Loading account...</div>
      </section>
    );
  }

  return (
    <section className="flat-spacing">
      <div className="container">
        <h1 className="page-title font-instrument_serif fw-normal mb-24">Account Settings</h1>
        {notice && <p className="cl-text-5 mb-24">{notice}</p>}
        <form className="row g-24" onSubmit={handleSubmit}>
          <div className="col-md-6">
            <label className="form-label" htmlFor="firstName">
              First name
            </label>
            <input
              id="firstName"
              className="form-control style-2"
              type="text"
              value={firstName}
              onChange={(event) => setFirstName(event.target.value)}
            />
          </div>
          <div className="col-md-6">
            <label className="form-label" htmlFor="lastName">
              Last name
            </label>
            <input
              id="lastName"
              className="form-control style-2"
              type="text"
              value={lastName}
              onChange={(event) => setLastName(event.target.value)}
            />
          </div>
          <div className="col-md-6">
            <label className="form-label" htmlFor="email">
              Email
            </label>
            <input
              id="email"
              className="form-control style-2"
              type="email"
              value={email}
              onChange={(event) => setEmail(event.target.value)}
            />
          </div>
          <div className="col-md-6">
            <label className="form-label" htmlFor="phone">
              Phone
            </label>
            <input
              id="phone"
              className="form-control style-2"
              type="tel"
              value={phone}
              onChange={(event) => setPhone(event.target.value)}
            />
          </div>
          <div className="col-12">
            <label className="form-label" htmlFor="address">
              Address
            </label>
            <textarea
              id="address"
              className="form-control style-2"
              rows={3}
              value={address}
              onChange={(event) => setAddress(event.target.value)}
            />
          </div>
          <div className="col-12">
            <button type="submit" className="tf-btn style-2 type-2">
              Save changes
            </button>
          </div>
        </form>
      </div>
    </section>
  );
}
