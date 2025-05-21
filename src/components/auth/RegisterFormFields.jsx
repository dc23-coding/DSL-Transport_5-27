
import React from 'react';

const RegisterFormFields = ({
  fullName, setFullName,
  email, setEmail,
  password, setPassword,
  confirmPassword, setConfirmPassword,
  adminPassword, setAdminPassword, // This is adminPasswordAttempt from Register.jsx
  selectedRole
}) => {
  return (
    <>
      <div>
        <label htmlFor="fullName" className="block text-sm font-medium mb-2">
          Full Name
        </label>
        <input
          type="text"
          id="fullName"
          value={fullName}
          onChange={(e) => setFullName(e.target.value)}
          className="w-full px-3 py-2 rounded-md border bg-background focus:outline-none focus:ring-2 focus:ring-primary"
          required
        />
      </div>
      <div>
        <label htmlFor="email" className="block text-sm font-medium mb-2">
          Email Address
        </label>
        <input
          type="email"
          id="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          className="w-full px-3 py-2 rounded-md border bg-background focus:outline-none focus:ring-2 focus:ring-primary"
          required
        />
      </div>

      <div>
        <label htmlFor="password_register" className="block text-sm font-medium mb-2">
          Password
        </label>
        <input
          type="password"
          id="password_register"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          className="w-full px-3 py-2 rounded-md border bg-background focus:outline-none focus:ring-2 focus:ring-primary"
          required
          minLength="6"
        />
      </div>

      <div>
        <label
          htmlFor="confirmPassword_register"
          className="block text-sm font-medium mb-2"
        >
          Confirm Password
        </label>
        <input
          type="password"
          id="confirmPassword_register"
          value={confirmPassword}
          onChange={(e) => setConfirmPassword(e.target.value)}
          className="w-full px-3 py-2 rounded-md border bg-background focus:outline-none focus:ring-2 focus:ring-primary"
          required
          minLength="6"
        />
      </div>

      {selectedRole === 'admin' && (
        <div>
          <label
            htmlFor="adminPassword_register"
            className="block text-sm font-medium mb-2"
          >
            Admin Password
          </label>
          <input
            type="password"
            id="adminPassword_register"
            value={adminPassword}
            onChange={(e) => setAdminPassword(e.target.value)}
            className="w-full px-3 py-2 rounded-md border bg-background focus:outline-none focus:ring-2 focus:ring-primary"
            required
          />
        </div>
      )}
    </>
  );
};

export default RegisterFormFields;
