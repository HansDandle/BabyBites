// src/components/InviteUsersForm.jsx
import React, { useState } from 'react';
import { db } from '../firebaseConfig';
import { collection, addDoc, query, where, getDocs } from 'firebase/firestore';
import { useAuth } from '../context/AuthContext';

const InviteUsersForm = ({ childId, childName, onClose }) => {
  const { currentUser } = useAuth();
  const [inviteeEmail, setInviteeEmail] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setSuccess('');
    setLoading(true);

    if (!inviteeEmail) {
      setError('Please enter an email address.');
      setLoading(false);
      return;
    }

    if (inviteeEmail === currentUser.email) {
      setError('You cannot invite yourself.');
      setLoading(false);
      return;
    }

    try {
      // Check if an invitation already exists for this child and email
      const existingInvitationsQuery = query(
        collection(db, 'invitations'),
        where('childId', '==', childId),
        where('inviteeEmail', '==', inviteeEmail),
        where('status', '==', 'pending')
      );
      const existingInvitationsSnap = await getDocs(existingInvitationsQuery);

      if (!existingInvitationsSnap.empty) {
        setError('An invitation has already been sent to this user for this child.');
        setLoading(false);
        return;
      }

      // --- ADD THESE CONSOLE LOGS ---
      console.log('Attempting to send invitation...');
      console.log('currentUser:', currentUser);
      console.log('currentUser.uid:', currentUser?.uid);
      console.log('currentUser.email:', currentUser?.email);
      // --- END CONSOLE LOGS ---

      // Send invitation
      await addDoc(collection(db, 'invitations'), {
        childId,
        childName,
        inviterUid: currentUser.uid,
        inviterEmail: currentUser.email,
        inviteeEmail,
        status: 'pending',
        createdAt: new Date(),
      });

      setSuccess(`Invitation sent to ${inviteeEmail}! They will see it on their dashboard.`);
      setInviteeEmail('');
    } catch (err) {
      console.error('Error sending invitation:', err);
      setError('Failed to send invitation. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-70 flex items-center justify-center z-50 p-4 animate-fadeIn">
      <div className="bg-surface p-8 rounded-2xl shadow-glow-lg border border-border w-full max-w-lg transform transition-all duration-300 hover:scale-[1.01]">
        <h2 className="text-3xl font-bold text-accent mb-6 text-center">Invite User to Manage {childName}</h2>
        {error && <p className="text-error text-center mb-4">{error}</p>}
        {success && <p className="text-success text-center mb-4">{success}</p>}
        <form onSubmit={handleSubmit} className="space-y-5">
          <div>
            <label htmlFor="inviteeEmail" className="block text-textSecondary text-sm font-medium mb-2">
              Invitee's Email Address
            </label>
            <input
              type="email"
              id="inviteeEmail"
              value={inviteeEmail}
              onChange={(e) => setInviteeEmail(e.target.value)}
              required
              className="w-full px-4 py-3 bg-background border border-border rounded-xl text-text placeholder-textSecondary focus:outline-none focus:ring-2 focus:ring-accent focus:border-transparent transition-all duration-300"
              placeholder="collaborator@example.com"
            />
          </div>
          <div className="flex justify-end space-x-4 mt-6">
            <button
              type="button"
              onClick={onClose}
              className="px-6 py-3 bg-textSecondary text-white rounded-xl font-semibold hover:bg-opacity-80 transition-all duration-300 shadow-glow-sm"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={loading}
              className="px-6 py-3 bg-accent text-white rounded-xl font-semibold shadow-glow-sm hover:shadow-glow-md transition-all duration-300 ease-in-out transform hover:scale-105 focus:outline-none focus:ring-2 focus:ring-accent focus:ring-opacity-75 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center"
            >
              {loading ? (
                <div className="animate-spin rounded-full h-5 w-5 border-t-2 border-b-2 border-white"></div>
              ) : (
                'Send Invitation'
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default InviteUsersForm;
