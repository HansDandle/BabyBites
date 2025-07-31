// src/components/ChildCard.jsx
import React from 'react';
import { Link } from 'react-router-dom';

const ChildCard = ({ child }) => {
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

  const getGenderIcon = (gender) => {
    if (gender === 'Boy') return '👶🏻';
    if (gender === 'Girl') return '👧🏻';
    return '👶';
  };

  return (
    <Link
      to={`/child/${child.id}`}
      className="block bg-surface p-6 rounded-2xl shadow-surface-dark border border-border transform transition-all duration-300 hover:scale-[1.02] hover:shadow-glow-sm animate-scaleUp"
    >
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-3xl font-bold text-primary">{child.name}</h3>
        <span className="text-4xl">{getGenderIcon(child.gender)}</span>
      </div>
      <p className="text-textSecondary text-lg mb-2">
        <span className="font-semibold text-text">Age:</span> {calculateAge(child.dob)}
      </p>
      <p className="text-textSecondary text-lg mb-4">
        <span className="font-semibold text-text">Gender:</span> {child.gender}
      </p>
      <button className="w-full py-2 bg-secondary text-white rounded-xl font-semibold hover:bg-opacity-90 transition-all duration-300 shadow-glow-sm">
        View Profile
      </button>
    </Link>
  );
};

export default ChildCard;
