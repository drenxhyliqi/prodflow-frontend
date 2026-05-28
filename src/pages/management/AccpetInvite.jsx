import { useEffect, useState } from 'react';
import api from '../../api/axios';
import { useSearchParams, useNavigate } from 'react-router-dom';
import { toast } from 'react-toastify';

const AcceptInvite = () => {
  const [params] = useSearchParams();
  const navigate = useNavigate();
  const token = params.get('token');

  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [invite, setInvite] = useState(null);
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');

  useEffect(() => {
    if (!token) {
      toast.error('Invitation token is missing.');
      setLoading(false);
      return;
    }

    api.get(`/invitations/${token}`)
      .then((res) => {
        setInvite(res.data?.invitation || null);
      })
      .catch((err) => {
        toast.error(err.response?.data?.message || 'Invalid or expired invitation.');
      })
      .finally(() => setLoading(false));
  }, [token]);

  const handleAccept = (e) => {
    e.preventDefault();

    if (!password || password.length < 8) {
      toast.error('Password must be at least 8 characters.');
      return;
    }
    if (password !== confirmPassword) {
      toast.error('Passwords do not match.');
      return;
    }

    setSubmitting(true);
    api.post('/invitations/accept', { token, password })
      .then((res) => {
        toast.success(res.data?.message || 'Invitation accepted successfully.');
        navigate('/login');
      })
      .catch((err) => {
        toast.error(err.response?.data?.message || 'Failed to accept invitation.');
      })
      .finally(() => setSubmitting(false));
  };

  if (loading) {
    return <div className="container py-5"><h5>Loading invitation...</h5></div>;
  }

  if (!invite) {
    return (
      <div className="container py-5">
        <div className="alert alert-danger">Invitation is invalid or expired.</div>
      </div>
    );
  }

  return (
    <div className="container py-5" style={{ maxWidth: 520 }}>
      <div className="card shadow-sm rounded-4">
        <div className="card-body p-4">
          <h4 className="fw-bold mb-1">Accept Invitation</h4>
          <p className="text-muted mb-4">Set your password to activate your account.</p>

          <div className="mb-3">
            <label className="form-label">Name</label>
            <input className="form-control rounded-3" value={invite.user || ''} disabled />
          </div>

          <div className="mb-3">
            <label className="form-label">Username</label>
            <input className="form-control rounded-3" value={invite.username || ''} disabled />
          </div>

          <div className="mb-3">
            <label className="form-label">Role</label>
            <input className="form-control rounded-3 text-capitalize" value={invite.role || ''} disabled />
          </div>

          <form onSubmit={handleAccept}>
            <div className="mb-3">
              <label className="form-label">Password</label>
              <input
                type="password"
                className="form-control rounded-3"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="Enter password"
              />
            </div>

            <div className="mb-4">
              <label className="form-label">Confirm Password</label>
              <input
                type="password"
                className="form-control rounded-3"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                placeholder="Confirm password"
              />
            </div>

            <button type="submit" className="btn btn-primary w-100 rounded-3" disabled={submitting}>
              {submitting ? 'Submitting...' : 'Accept Invitation'}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
};

export default AcceptInvite;