// src/components/AddChildForm.jsx
import React, { useState } from 'react';
import { db } from '../firebaseConfig';
import { collection, addDoc, doc, updateDoc, arrayUnion } from 'firebase/firestore';
import { useAuth } from '../context/AuthContext';

const AddChildForm = ({ onClose }) => {
  const { currentUser } = useAuth();
  const [name, setName] = useState('');
  const [dob, setDob] = useState('');
  const [gender, setGender] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    if (!name || !dob || !gender) {
      setError('Please fill in all fields.');
      setLoading(false);
      return;
    }

    try {
      const newChildRef = await addDoc(collection(db, 'children'), {
        name,
        dob: new Date(dob), // Convert string to Date object for Firestore Timestamp
        gender,
        parentId: currentUser.uid,
        managers: [currentUser.uid], // Creator is automatically a manager
        createdAt: new Date(),
      });

      // Update the current user's profile to include this child
      await updateDoc(doc(db, 'users', currentUser.uid), {
        children: arrayUnion(newChildRef.id),
      });

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
      <div className="bg-surface p-8 rounded-2xl shadow-glow-lg border border-border w-full max-w-lg transform transition-all duration-300 hover:scale-[1.01]">
        <h2 className="text-3xl font-bold text-primary mb-6 text-center">Add New Child Profile</h2>
        {error && <p className="text-error text-center mb-4">{error}</p>}
        <form onSubmit={handleSubmit} className="space-y-5">
          <div>
            <label htmlFor="name" className="block text-textSecondary text-sm font-medium mb-2">
              Child's Name
            </label>
            <input
              type="text"
              id="name"
              value={name}
              onChange={(e) => setName(e.target.value)}
              required
              className="w-full px-4 py-3 bg-background border border-border rounded-xl text-text placeholder-textSecondary focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent transition-all duration-300"
              placeholder="e.g., Leo"
            />
          </div>
          <div>
            <label htmlFor="dob" className="block text-textSecondary text-sm font-medium mb-2">
              Date of Birth
            </label>
            <input
              type="date"
              id="dob"
              value={dob}
              onChange={(e) => setDob(e.target.value)}
              required
              className="w-full px-4 py-3 bg-background border border-border rounded-xl text-text placeholder-textSecondary focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent transition-all duration-300"
            />
          </div>
          <div>
            <label htmlFor="gender" className="block text-textSecondary text-sm font-medium mb-2">
              Gender
            </label>
            <select
              id="gender"
              value={gender}
              onChange={(e) => setGender(e.target.value)}
              required
              className="w-full px-4 py-3 bg-background border border-border rounded-xl text-text focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent transition-all duration-300"
            >
              <option value="">Select Gender</option>
              <option value="Boy">Boy</option>
              <option value="Girl">Girl</option>
              <option value="Other">Other</option>
            </select>
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
              className="px-6 py-3 bg-secondary text-white rounded-xl font-semibold shadow-glow-sm hover:shadow-glow-md transition-all duration-300 ease-in-out transform hover:scale-105 focus:outline-none focus:ring-2 focus:ring-secondary focus:ring-opacity-75 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center"
            >
              {loading ? (
                <div className="animate-spin rounded-full h-5 w-5 border-t-2 border-b-2 border-white"></div>
              ) : (
                'Add Child'
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default AddChildForm;
