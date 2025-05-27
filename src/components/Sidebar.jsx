// src/components/Sidebar.jsx
import React from 'react';
import { NavLink } from 'react-router-dom';
// ... other imports

export default function Sidebar() {
  return (
    <nav className="w-64 bg-card p-4 flex flex-col space-y-2">
      {/* existing links */}
      <NavLink
        to="/uploads"
        className={({ isActive }) =>
          `px-3 py-2 rounded ${isActive ? 'bg-primary text-primary-foreground' : 'hover:bg-secondary'}`
        }
      >
        Documents
      </NavLink>
    </nav>
  );
}
