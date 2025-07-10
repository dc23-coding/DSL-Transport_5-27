// src/components/pages/UnauthorizedPage.jsx
import React from 'react';
import { Link } from 'react-router-dom';

const UnauthorizedPage = () => {
  return (
    <div className="text-center mt-20">
      <h1 className="text-3xl font-bold text-red-600">🚫 Access Denied</h1>
      <p className="mt-4 text-gray-600">You do not have permission to view this page.</p>
      <Link
        to="/login"
        className="inline-block mt-6 px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
      >
        Go to Login
      </Link>
    </div>
  );
};

export default UnauthorizedPage;
