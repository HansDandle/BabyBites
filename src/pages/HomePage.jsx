// src/pages/HomePage.jsx
import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { db } from '../firebaseConfig';
import { collection, query, where, onSnapshot, doc, updateDoc, arrayUnion, arrayRemove } from 'firebase/firestore';
import ChildCard from '../components/ChildCard';
import AddChildForm from '../components/AddChildForm';

const HomePage = () => {
  const { currentUser } = useAuth();
  const [children, setChildren] = useState([]);
  const [invitations, setInvitations] = useState([]);
  const [showAddChildModal, setShowAddChildModal] = useState(false);
  const [loadingChildren, setLoadingChildren] = useState(true);
  const [loadingInvitations, setLoadingInvitations] = useState(true);

  useEffect(() => {
    if (!currentUser) return;

    // Listen for children managed by the current user
    const childrenQuery = query(collection(db, 'children'), where('managers', 'array-contains', currentUser.uid));
    const unsubscribeChildren = onSnapshot(childrenQuery, (snapshot) => {
      const childrenData = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
      setChildren(childrenData);
      setLoadingChildren(false);
    }, (error) => {
      console.error("Error fetching children:", error);
      setLoadingChildren(false);
    });

    // Listen for invitations sent to the current user's email
    const invitationsQuery = query(collection(db, 'invitations'), where('inviteeEmail', '==', currentUser.email), where('status', '==', 'pending'));
    const unsubscribeInvitations = onSnapshot(invitationsQuery, (snapshot) => {
      const invitationsData = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
      setInvitations(invitationsData);
      setLoadingInvitations(false);
    }, (error) => {
      console.error("Error fetching invitations:", error);
      setLoadingInvitations(false);
    });

    return () => {
      unsubscribeChildren();
      unsubscribeInvitations();
    };
  }, [currentUser]);

  const handleAcceptInvitation = async (invitationId, childId) => {
    try {
      // Update invitation status
      await updateDoc(doc(db, 'invitations', invitationId), { status: 'accepted' });
      // Add current user to child's managers
      await updateDoc(doc(db, 'children', childId), { managers: arrayUnion(currentUser.uid) });
      // Remove invitation from user's profile (optional, but good for cleanup)
      await updateDoc(doc(db, 'users', currentUser.uid), { invitations: arrayRemove(invitationId) });
      alert('Invitation accepted! You can now manage this child profile.');
    } catch (error) {
      console.error('Error accepting invitation:', error);
      alert('Failed to accept invitation. Please try again.');
    }
  };

  const handleDeclineInvitation = async (invitationId) => {
    try {
      await updateDoc(doc(db, 'invitations', invitationId), { status: 'declined' });
      // Remove invitation from user's profile (optional)
      await updateDoc(doc(db, 'users', currentUser.uid), { invitations: arrayRemove(invitationId) });
      alert('Invitation declined.');
    } catch (error) {
      console.error('Error declining invitation:', error);
      alert('Failed to decline invitation. Please try again.');
    }
  };

  if (loadingChildren || loadingInvitations) {
    return (
      <div className="flex items-center justify-center min-h-[calc(100vh-80px)] bg-background text-text">
        <div className="animate-spin rounded-full h-16 w-16 border-t-4 border-b-4 border-primary"></div>
        <p className="ml-4 text-lg">Loading your profiles...</p>
      </div>
    );
  }

  return (
    <div className="min-h-[calc(100vh-80px)] bg-gradient-to-br from-background to-surface p-6 md:p-10">
      <header className="relative h-64 md:h-80 rounded-2xl overflow-hidden shadow-glow-lg mb-10 animate-fadeIn">
        <img
          src="https://images.pexels.com/photos/366004/pexels-photo-366004.jpeg?auto=compress&cs=tinysrgb&w=1260&h=750&dpr=2"
          alt="Baby playing with food"
          className="absolute inset-0 w-full h-full object-cover object-center filter brightness-75"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-background via-transparent to-transparent opacity-90"></div>
        <div className="relative z-10 flex flex-col items-center justify-center h-full text-center p-4">
          <h1 className="text-4xl md:text-6xl font-extrabold text-white drop-shadow-lg mb-4 animate-slideInLeft">
            Your Little One's Journey
          </h1>
          <p className="text-lg md:text-xl text-textSecondary max-w-2xl animate-slideInRight">
            Track feedings, allergies, and preferences with ease.
          </p>
        </div>
      </header>

      {invitations.length > 0 && (
        <section className="mb-10 animate-fadeIn delay-200">
          <h2 className="text-3xl font-bold text-primary mb-6 text-center">Pending Invitations</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {invitations.map((invitation) => (
              <div key={invitation.id} className="bg-surface p-6 rounded-xl shadow-surface-dark border border-border animate-scaleUp">
                <p className="text-lg text-text mb-2">
                  <span className="font-semibold text-secondary">{invitation.inviterEmail}</span> invited you to manage{' '}
                  <span className="font-semibold text-primary">{invitation.childName}</span>'s profile.
                </p>
                <div className="flex justify-end space-x-3 mt-4">
                  <button
                    onClick={() => handleAcceptInvitation(invitation.id, invitation.childId)}
                    className="px-4 py-2 bg-success text-white rounded-lg hover:bg-opacity-90 transition-all duration-300 shadow-glow-sm"
                  >
                    Accept
                  </button>
                  <button
                    onClick={() => handleDeclineInvitation(invitation.id)}
                    className="px-4 py-2 bg-error text-white rounded-lg hover:bg-opacity-90 transition-all duration-300 shadow-glow-sm"
                  >
                    Decline
                  </button>
                </div>
              </div>
            ))}
          </div>
        </section>
      )}

      <section className="mb-10 animate-fadeIn delay-300">
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-3xl font-bold text-primary">Your Children</h2>
          <button
            onClick={() => setShowAddChildModal(true)}
            className="px-6 py-3 bg-secondary text-white rounded-xl font-semibold shadow-glow-sm hover:shadow-glow-md transition-all duration-300 ease-in-out transform hover:scale-105 focus:outline-none focus:ring-2 focus:ring-secondary focus:ring-opacity-75"
          >
            + Add New Child
          </button>
        </div>

        {children.length === 0 ? (
          <div className="bg-surface p-8 rounded-2xl text-center shadow-surface-dark border border-border animate-fadeIn">
            <p className="text-textSecondary text-lg mb-4">
              It looks like you haven't added any child profiles yet.
            </p>
            <p className="text-textSecondary text-md">
              Click the "Add New Child" button to get started!
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {children.map((child) => (
              <ChildCard key={child.id} child={child} />
            ))}
          </div>
        )}
      </section>

      {showAddChildModal && (
        <AddChildForm onClose={() => setShowAddChildModal(false)} />
      )}
    </div>
  );
};

export default HomePage;
