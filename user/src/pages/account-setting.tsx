import { type FormEvent, useEffect, useState } from 'react';
import { useAuth } from '../context/AuthContext.tsx';
import { updateUserProfile, type AuthUser } from '../api/client.ts';

function populateFormFromUser(
  user: AuthUser,
  setters: {
    setFirstName: (value: string) => void;
    setLastName: (value: string) => void;
    setEmail: (value: string) => void;
    setPhone: (value: string) => void;
    setAddress: (value: string) => void;
  }
) {
  const parts = user.name.trim().split(/\s+/);
  setters.setFirstName(parts[0] ?? '');
  setters.setLastName(parts.slice(1).join(' '));
  setters.setEmail(user.email);
  setters.setPhone(user.phone);
  setters.setAddress(user.address ?? '');
}

export default function AccountSetting() {
  const { user, setUserProfile } = useAuth();
  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [address, setAddress] = useState('');
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [notice, setNotice] = useState('');
  const [error, setError] = useState('');

  useEffect(() => {
    if (!user) {
      setLoading(false);
      return;
    }

    populateFormFromUser(user, {
      setFirstName,
      setLastName,
      setEmail,
      setPhone,
      setAddress,
    });
    setLoading(false);
  }, [user]);

  const handleSubmit = async (event: FormEvent) => {
    event.preventDefault();
    setError('');
    setNotice('');

    const fullName = [firstName.trim(), lastName.trim()].filter(Boolean).join(' ');
    if (!fullName) {
      setError('Please enter your first name.');
      return;
    }
    if (!email.trim()) {
      setError('Please enter your email address.');
      return;
    }

    setSaving(true);
    try {
      const updatedUser = await updateUserProfile({
        name: fullName,
        email: email.trim(),
        phone: phone.trim(),
        address: address.trim(),
      });

      setUserProfile(updatedUser);
      populateFormFromUser(updatedUser, {
        setFirstName,
        setLastName,
        setEmail,
        setPhone,
        setAddress,
      });

      setNotice('Profile updated successfully. Refreshing page...');
      window.setTimeout(() => {
        window.location.reload();
      }, 700);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Profile update failed.');
      setSaving(false);
    }
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
        {notice && <p className="text-success mb-24">{notice}</p>}
        {error && <p className="text-danger mb-24">{error}</p>}
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
              disabled={saving}
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
              disabled={saving}
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
              disabled={saving}
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
              disabled={saving}
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
              disabled={saving}
              onChange={(event) => setAddress(event.target.value)}
            />
          </div>
          <div className="col-12">
            <button type="submit" className="tf-btn style-2 type-2" disabled={saving}>
              {saving ? 'Saving changes...' : 'Save changes'}
            </button>
          </div>
        </form>
      </div>
    </section>
  );
}
