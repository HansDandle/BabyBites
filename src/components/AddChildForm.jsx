// src/components/AddChildForm.jsx
import React, { useState } from 'react';
import { db } from '../firebaseConfig';
import { collection, addDoc, doc, updateDoc, arrayUnion, Timestamp } from 'firebase/firestore';
import { useAuth } from '../context/AuthContext';

const AddChildForm = ({ onClose, onChildAdded }) => {
  const { currentUser } = useAuth();
  const [name, setName] = useState('');
  const [dob, setDob] = useState('');
  const [gender, setGender] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!currentUser) {
      setError('You must be logged in to add a child.');
      return;
    }
    if (!name || !dob || !gender) {
      setError('Please fill in all fields.');
      return;
    }

    setLoading(true);
    setError('');

    try {
      // Convert DOB string to Firestore Timestamp
      const dobTimestamp = Timestamp.fromDate(new Date(dob));

      const newChildRef = await addDoc(collection(db, 'children'), {
        name,
        dob: dobTimestamp,
        gender,
        managers: [currentUser.uid], // CRITICAL: Add current user as manager
        createdAt: Timestamp.now(),
      });

      // Update the current user's profile to include the new child's ID
      const userRef = doc(db, 'users', currentUser.uid);
      await updateDoc(userRef, {
        children: arrayUnion(newChildRef.id),
      });

      onChildAdded({ id: newChildRef.id, name, dob: dobTimestamp, gender, managers: [currentUser.uid] });
      onClose();
    } catch (err) {
      console.error('Error adding child:', err);
      setError('Failed to add child. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-70 flex items-center justify-center z-50 p-4 animate-fadeIn">
      <div className="bg-surface p-8 rounded-2xl shadow-glow-lg w-full max-w-md border border-border transform scale-95 animate-scaleIn">
        <h2 className="text-3xl font-bold text-primary mb-6 text-center">Add New Child</h2>
        <form onSubmit={handleSubmit} className="space-y-5">
          <div>
            <label htmlFor="name" className="block text-textSecondary text-sm font-medium mb-2">Child's Name</label>
            <input
              type="text"
              id="name"
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="w-full p-3 bg-background border border-border rounded-lg text-text focus:ring-2 focus:ring-primary focus:border-transparent transition-all duration-200"
              placeholder="e.g., Baby Bolt"
              required
            />
          </div>
          <div>
            <label htmlFor="dob" className="block text-textSecondary text-sm font-medium mb-2">Date of Birth</label>
            <input
              type="date"
              id="dob"
              value={dob}
              onChange={(e) => setDob(e.target.value)}
              className="w-full p-3 bg-background border border-border rounded-lg text-text focus:ring-2 focus:ring-primary focus:border-transparent transition-all duration-200"
              required
            />
          </div>
          <div>
            <label htmlFor="gender" className="block text-textSecondary text-sm font-medium mb-2">Gender</label>
            <select
              id="gender"
              value={gender}
              onChange={(e) => setGender(e.target.value)}
              className="w-full p-3 bg-background border border-border rounded-lg text-text focus:ring-2 focus:ring-primary focus:border-transparent transition-all duration-200"
              required
            >
              <option value="">Select Gender</option>
              <option value="Male">Male</option>
              <option value="Female">Female</option>
              <option value="Other">Other</option>
            </select>
          </div>
          {error && <p className="text-error text-sm text-center">{error}</p>}
          <div className="flex justify-end space-x-4 mt-6">
            <button
              type="button"
              onClick={onClose}
              className="px-6 py-3 bg-gray-700 text-white rounded-xl font-semibold shadow-md hover:bg-gray-600 transition-all duration-300 ease-in-out transform hover:scale-105 focus:outline-none focus:ring-2 focus:ring-gray-500 focus:ring-opacity-75"
              disabled={loading}
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-6 py-3 bg-primary text-white rounded-xl font-semibold shadow-glow-sm hover:shadow-glow-md transition-all duration-300 ease-in-out transform hover:scale-105 focus:outline-none focus:ring-2 focus:ring-primary focus:ring-opacity-75 disabled:opacity-50 disabled:cursor-not-allowed"
              disabled={loading}
            >
              {loading ? 'Adding...' : 'Add Child'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default AddChildForm;
