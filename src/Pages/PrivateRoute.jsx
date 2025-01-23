import React from 'react';
import { Navigate } from 'react-router-dom';
import { auth } from '../../firebase';

const PrivateRoute = ({ children, adminOnly = false }) => {
  const user = auth.currentUser;

  if (!user) {
    // Not logged in, redirect to login
    return <Navigate to="/account" replace />;
  }

  if (adminOnly && user.email !== 'admfouekicker@gmail.com') {
    // Not an admin, redirect to home
    return <Navigate to="/" replace />;
  }

  return children;
};

export default PrivateRoute;