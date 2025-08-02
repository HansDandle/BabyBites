// src/components/FeedingForm.jsx
import React, { useState } from 'react';
import { db } from '../firebaseConfig';
import { collection, addDoc } from 'firebase/firestore';

const FeedingForm = ({ childId, onClose }) => {
  const [foodItem, setFoodItem] = useState('');
  const [quantity, setQuantity] = useState('');
  const [liking, setLiking] = useState('');
  const [allergies, setAllergies] = useState([]);
  const [newAllergy, setNewAllergy] = useState('');
  const [notes, setNotes] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleAddAllergy = () => {
    if (newAllergy.trim() && !allergies.includes(newAllergy.trim())) {
      setAllergies([...allergies, newAllergy.trim()]);
      setNewAllergy('');
    }
  };

  const handleRemoveAllergy = (allergyToRemove) => {
    setAllergies(allergies.filter(allergy => allergy !== allergyToRemove));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    if (!foodItem || !quantity || !liking) {
      setError('Please fill in all required fields (Food Item, Quantity, Liking).');
      setLoading(false);
      return;
    }

    try {
      await addDoc(collection(db, 'feedings'), {
        childId,
        foodItem,
        quantity,
        liking,
        allergies,
        notes,
        timestamp: new Date(),
      });
      onClose();
    } catch (err) {
      console.error('Error adding feeding:', err);
      setError('Failed to add feeding record. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-70 flex items-center justify-center z-50 p-4 animate-fadeIn">
      <div className="bg-surface p-8 rounded-2xl shadow-glow-lg border border-border w-full max-w-lg transform transition-all duration-300 hover:scale-[1.01] max-h-[90vh] overflow-y-auto">
        <h2 className="text-3xl font-bold text-primary mb-6 text-center">Add New Feeding Record</h2>
        {error && <p className="text-error text-center mb-4">{error}</p>}
        <form onSubmit={handleSubmit} className="space-y-5">
          <div>
            <label htmlFor="foodItem" className="block text-textSecondary text-sm font-medium mb-2">
              Food Item
            </label>
            <input
              type="text"
              id="foodItem"
              value={foodItem}
              onChange={(e) => setFoodItem(e.target.value)}
              required
              className="w-full px-4 py-3 bg-background border border-border rounded-xl text-text placeholder-textSecondary focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent transition-all duration-300"
              placeholder="e.g., Pureed Carrots"
            />
          </div>
          <div>
            <label htmlFor="quantity" className="block text-textSecondary text-sm font-medium mb-2">
              Quantity
            </label>
            <input
              type="text"
              id="quantity"
              value={quantity}
              onChange={(e) => setQuantity(e.target.value)}
              required
              className="w-full px-4 py-3 bg-background border border-border rounded-xl text-text placeholder-textSecondary focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent transition-all duration-300"
              placeholder="e.g., 4 oz, 1/2 cup"
            />
          </div>
          <div>
            <label htmlFor="liking" className="block text-textSecondary text-sm font-medium mb-2">
              How well was it liked?
            </label>
            <select
              id="liking"
              value={liking}
              onChange={(e) => setLiking(e.target.value)}
              required
              className="w-full px-4 py-3 bg-background border border-border rounded-xl text-text focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent transition-all duration-300"
            >
              <option value="">Select an option</option>
              <option value="loved">Loved 😍</option>
              <option value="liked">Liked 😊</option>
              <option value="disliked">Disliked 😟</option>
              <option value="refused">Refused 😠</option>
            </select>
          </div>
          <div>
            <label htmlFor="newAllergy" className="block text-textSecondary text-sm font-medium mb-2">
              Allergies/Reactions (optional)
            </label>
            <div className="flex space-x-2 mb-2">
              <input
                type="text"
                id="newAllergy"
                value={newAllergy}
                onChange={(e) => setNewAllergy(e.target.value)}
                onKeyPress={(e) => { if (e.key === 'Enter') { e.preventDefault(); handleAddAllergy(); } }}
                className="flex-grow px-4 py-3 bg-background border border-border rounded-xl text-text placeholder-textSecondary focus:outline-none focus:ring-2 focus:ring-error focus:border-transparent transition-all duration-300"
                placeholder="e.g., Rash, Upset Stomach"
              />
              <button
                type="button"
                onClick={handleAddAllergy}
                className="px-4 py-2 bg-accent text-white rounded-xl shadow-glow-sm hover:shadow-glow-md transition-all duration-300"
              >
                Add
              </button>
            </div>
            <div className="flex flex-wrap gap-2">
              {allergies.map((allergy, index) => (
                <span
                  key={index}
                  className="inline-flex items-center bg-error text-white text-sm px-3 py-1 rounded-full shadow-sm cursor-pointer hover:bg-opacity-80 transition-all duration-300"
                  onClick={() => handleRemoveAllergy(allergy)}
                >
                  {allergy} <span className="ml-1 font-bold">x</span>
                </span>
              ))}
            </div>
          </div>
          <div>
            <label htmlFor="notes" className="block text-textSecondary text-sm font-medium mb-2">
              Notes (optional)
            </label>
            <textarea
              id="notes"
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              rows="3"
              className="w-full px-4 py-3 bg-background border border-border rounded-xl text-text placeholder-textSecondary focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent transition-all duration-300"
              placeholder="Any additional observations..."
            ></textarea>
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
                'Add Record'
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default FeedingForm;
