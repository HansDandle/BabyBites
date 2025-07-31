// src/pages/HomePage.jsx
import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { db } from '../firebaseConfig';
import { doc, getDoc, onSnapshot } from 'firebase/firestore';
import { Link } from 'react-router-dom';
import AddChildForm from '../components/AddChildForm';

const HomePage = () => {
  const { currentUser, loading: authLoading } = useAuth();
  const [children, setChildren] = useState([]);
  const [loadingChildren, setLoadingChildren] = useState(true);
  const [error, setError] = useState('');
  const [showAddChildModal, setShowAddChildModal] = useState(false);

  useEffect(() => {
    if (authLoading || !currentUser) {
      setLoadingChildren(false);
      return;
    }

    const userRef = doc(db, 'users', currentUser.uid);

    const unsubscribe = onSnapshot(userRef, async (docSnap) => {
      if (docSnap.exists()) {
        const userData = docSnap.data();
        const childIds = userData.children || [];
        const fetchedChildren = [];

        // Fetch details for each child ID
        for (const childId of childIds) {
          try {
            const childDocRef = doc(db, 'children', childId);
            const childDocSnap = await getDoc(childDocRef);
            if (childDocSnap.exists()) {
              fetchedChildren.push({ id: childDocSnap.id, ...childDocSnap.data() });
            }
          } catch (err) {
            console.error(`Error fetching child ${childId}:`, err);
            // Optionally handle individual child fetch errors, but don't block the whole list
          }
        }
        setChildren(fetchedChildren);
      } else {
        setError('User profile not found.');
      }
      setLoadingChildren(false);
    }, (err) => {
      console.error('Error fetching user children:', err);
      setError('Failed to load your children profiles.');
      setLoadingChildren(false);
    });

    return () => unsubscribe();
  }, [currentUser, authLoading]);

  const handleChildAdded = (newChild) => {
    setChildren((prevChildren) => [...prevChildren, newChild]);
  };

  if (authLoading || loadingChildren) {
    return (
      <div className="flex items-center justify-center min-h-[calc(100vh-80px)] bg-background text-text">
        <div className="animate-spin rounded-full h-16 w-16 border-t-4 border-b-4 border-primary"></div>
        <p className="ml-4 text-lg">Loading your dashboard...</p>
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

  return (
    <div className="min-h-[calc(100vh-80px)] bg-gradient-to-br from-background to-surface p-6 md:p-10">
      <header className="relative h-64 md:h-80 rounded-2xl overflow-hidden shadow-glow-lg mb-10 animate-fadeIn">
        <img
          src="https://images.pexels.com/photos/3660374/pexels-photo-3660374.jpeg?auto=compress&cs=tinysrgb&w=1260&h=750&dpr=2"
          alt="Family background"
          className="absolute inset-0 w-full h-full object-cover object-center filter brightness-75"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-background via-transparent to-transparent opacity-90"></div>
        <div className="relative z-10 flex flex-col items-center justify-center h-full text-center p-4">
          <h1 className="text-4xl md:text-6xl font-extrabold text-white drop-shadow-lg mb-2 animate-slideInLeft">
            Welcome, {currentUser?.profile?.email || 'User'}!
          </h1>
          <p className="text-lg md:text-xl text-textSecondary animate-slideInRight">
            Manage your little ones' feeding journeys.
          </p>
        </div>
      </header>

      <section className="mb-10 animate-fadeIn delay-200">
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
              You haven't added any children yet.
            </p>
            <p className="text-textSecondary text-md">
              Click "Add New Child" to get started!
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {children.map((child) => (
              <Link
                key={child.id}
                to={`/child/${child.id}`}
                className="block bg-surface p-6 rounded-2xl shadow-surface-dark border border-border hover:shadow-glow-md transition-all duration-300 ease-in-out transform hover:-translate-y-1 group"
              >
                <div className="flex items-center mb-4">
                  <img
                    src="https://images.pexels.com/photos/160013/pexels-photo-160013.jpeg?auto=compress&cs=tinysrgb&w=1260&h=750&dpr=2"
                    alt={`Profile of ${child.name}`}
                    className="w-16 h-16 rounded-full object-cover object-center mr-4 border-2 border-primary group-hover:border-secondary transition-colors duration-300"
                  />
                  <h3 className="text-2xl font-bold text-text group-hover:text-primary transition-colors duration-300">
                    {child.name}
                  </h3>
                </div>
                <p className="text-textSecondary text-md mb-2">
                  Gender: {child.gender}
                </p>
                <p className="text-textSecondary text-md">
                  DOB: {child.dob ? new Date(child.dob.seconds * 1000).toLocaleDateString() : 'N/A'}
                </p>
                <p className="text-sm text-accent mt-4 group-hover:underline">
                  View Profile →
                </p>
              </Link>
            ))}
          </div>
        )}
      </section>

      {showAddChildModal && (
        <AddChildForm
          onClose={() => setShowAddChildModal(false)}
          onChildAdded={handleChildAdded}
        />
      )}
    </div>
  );
};

export default HomePage;
