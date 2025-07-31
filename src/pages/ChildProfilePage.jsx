// src/pages/ChildProfilePage.jsx
import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { db } from '../firebaseConfig';
import { doc, getDoc, collection, query, where, orderBy, onSnapshot } from 'firebase/firestore';
import FeedingForm from '../components/FeedingForm';
import FeedingEntry from '../components/FeedingEntry';
import InviteUsersForm from '../components/InviteUsersForm';

const ChildProfilePage = () => {
  const { id: childId } = useParams();
  const [child, setChild] = useState(null);
  const [feedings, setFeedings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [showAddFeedingModal, setShowAddFeedingModal] = useState(false);
  const [showInviteUsersModal, setShowInviteUsersModal] = useState(false);

  useEffect(() => {
    if (!childId) return;

    const fetchChildData = async () => {
      try {
        const childRef = doc(db, 'children', childId);
        const childSnap = await getDoc(childRef);
        if (childSnap.exists()) {
          setChild({ id: childSnap.id, ...childSnap.data() });
        } else {
          setError('Child profile not found.');
        }
      } catch (err) {
        console.error('Error fetching child data:', err);
        setError('Failed to load child profile.');
      } finally {
        setLoading(false);
      }
    };

    const feedingsQuery = query(
      collection(db, 'feedings'),
      where('childId', '==', childId),
      orderBy('timestamp', 'desc')
    );

    const unsubscribeFeedings = onSnapshot(feedingsQuery, (snapshot) => {
      const feedingsData = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
      setFeedings(feedingsData);
    }, (err) => {
      console.error('Error fetching feedings:', err);
      setError('Failed to load feeding history.');
    });

    fetchChildData();

    return () => unsubscribeFeedings();
  }, [childId]);

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[calc(100vh-80px)] bg-background text-text">
        <div className="animate-spin rounded-full h-16 w-16 border-t-4 border-b-4 border-primary"></div>
        <p className="ml-4 text-lg">Loading child profile...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-[calc(100vh-80px)] flex items-center justify-center bg-background text-error text-xl p-4">
        {error}
      </div>
    );
  }

  if (!child) {
    return (
      <div className="min-h-[calc(100vh-80px)] flex items-center justify-center bg-background text-text text-xl p-4">
        Child profile not found.
      </div>
    );
  }

  const calculateAge = (dob) => {
    if (!dob) return 'N/A';
    const birthDate = dob.toDate(); // Convert Firestore Timestamp to Date
    const today = new Date();
    let ageYears = today.getFullYear() - birthDate.getFullYear();
    let ageMonths = today.getMonth() - birthDate.getMonth();
    let ageDays = today.getDate() - birthDate.getDate();

    if (ageDays < 0) {
      ageMonths--;
      ageDays += new Date(today.getFullYear(), today.getMonth(), 0).getDate(); // Days in previous month
    }
    if (ageMonths < 0) {
      ageYears--;
      ageMonths += 12;
    }

    if (ageYears > 0) return `${ageYears} year${ageYears > 1 ? 's' : ''}`;
    if (ageMonths > 0) return `${ageMonths} month${ageMonths > 1 ? 's' : ''}`;
    return `${ageDays} day${ageDays > 1 ? 's' : ''}`;
  };

  return (
    <div className="min-h-[calc(100vh-80px)] bg-gradient-to-br from-background to-surface p-6 md:p-10">
      <header className="relative h-64 md:h-80 rounded-2xl overflow-hidden shadow-glow-lg mb-10 animate-fadeIn">
        <img
          src="https://images.pexels.com/photos/160013/pexels-photo-160013.jpeg?auto=compress&cs=tinysrgb&w=1260&h=750&dpr=2"
          alt={`Profile of ${child.name}`}
          className="absolute inset-0 w-full h-full object-cover object-center filter brightness-75"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-background via-transparent to-transparent opacity-90"></div>
        <div className="relative z-10 flex flex-col items-center justify-center h-full text-center p-4">
          <h1 className="text-4xl md:text-6xl font-extrabold text-white drop-shadow-lg mb-2 animate-slideInLeft">
            {child.name}'s Journey
          </h1>
          <p className="text-lg md:text-xl text-textSecondary animate-slideInRight">
            Age: {calculateAge(child.dob)} | Gender: {child.gender}
          </p>
        </div>
      </header>

      <section className="mb-10 animate-fadeIn delay-200">
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-3xl font-bold text-primary">Feeding History</h2>
          <div className="flex space-x-4">
            <button
              onClick={() => setShowAddFeedingModal(true)}
              className="px-6 py-3 bg-secondary text-white rounded-xl font-semibold shadow-glow-sm hover:shadow-glow-md transition-all duration-300 ease-in-out transform hover:scale-105 focus:outline-none focus:ring-2 focus:ring-secondary focus:ring-opacity-75"
            >
              + Add Feeding
            </button>
            <button
              onClick={() => setShowInviteUsersModal(true)}
              className="px-6 py-3 bg-accent text-white rounded-xl font-semibold shadow-glow-sm hover:shadow-glow-md transition-all duration-300 ease-in-out transform hover:scale-105 focus:outline-none focus:ring-2 focus:ring-accent focus:ring-opacity-75"
            >
              Invite Managers
            </button>
          </div>
        </div>

        {feedings.length === 0 ? (
          <div className="bg-surface p-8 rounded-2xl text-center shadow-surface-dark border border-border animate-fadeIn">
            <p className="text-textSecondary text-lg mb-4">
              No feeding records yet for {child.name}.
            </p>
            <p className="text-textSecondary text-md">
              Click "Add Feeding" to log their first meal!
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {feedings.map((feeding) => (
              <FeedingEntry key={feeding.id} feeding={feeding} />
            ))}
          </div>
        )}
      </section>

      {showAddFeedingModal && (
        <FeedingForm childId={childId} onClose={() => setShowAddFeedingModal(false)} />
      )}

      {showInviteUsersModal && (
        <InviteUsersForm childId={childId} childName={child.name} onClose={() => setShowInviteUsersModal(false)} />
      )}
    </div>
  );
};

export default ChildProfilePage;
