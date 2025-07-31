// src/components/FeedingEntry.jsx
import React, { useState } from 'react';

const FeedingEntry = ({ feeding }) => {
  const [isExpanded, setIsExpanded] = useState(false);

  const formatDate = (timestamp) => {
    if (!timestamp) return 'N/A';
    const date = timestamp.toDate(); // Convert Firestore Timestamp to Date
    return date.toLocaleString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
      hour12: true,
    });
  };

  const getLikingEmoji = (liking) => {
    switch (liking) {
      case 'loved': return '😍 Loved';
      case 'liked': return '😊 Liked';
      case 'disliked': return '😟 Disliked';
      case 'refused': return '😠 Refused';
      default: return '🤷‍♀️ Unknown';
    }
  };

  const getAllergyTag = (allergy) => {
    return (
      <span key={allergy} className="inline-block bg-error text-white text-xs px-3 py-1 rounded-full mr-2 mb-2 shadow-sm">
        ⚠️ {allergy}
      </span>
    );
  };

  return (
    <div className="bg-surface p-6 rounded-2xl shadow-surface-dark border border-border animate-scaleUp">
      <div className="flex justify-between items-center mb-3">
        <h3 className="text-xl font-bold text-primary">{feeding.foodItem}</h3>
        <span className="text-textSecondary text-sm">{formatDate(feeding.timestamp)}</span>
      </div>
      <p className="text-textSecondary mb-2">
        <span className="font-semibold text-text">Quantity:</span> {feeding.quantity}
      </p>
      <p className="text-textSecondary mb-2">
        <span className="font-semibold text-text">Liking:</span> {getLikingEmoji(feeding.liking)}
      </p>

      {feeding.allergies && feeding.allergies.length > 0 && (
        <div className="mt-3">
          <p className="font-semibold text-error mb-2">Allergies/Reactions:</p>
          <div className="flex flex-wrap">
            {feeding.allergies.map(getAllergyTag)}
          </div>
        </div>
      )}

      {feeding.notes && (
        <div className="mt-3">
          <p className="font-semibold text-text mb-2">Notes:</p>
          <p className="text-textSecondary text-sm italic">{feeding.notes}</p>
        </div>
      )}
    </div>
  );
};

export default FeedingEntry;
