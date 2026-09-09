import React from 'react';
import { Link } from 'react-router-dom';

const NotFoundPage = () => {
  return (
    <div className="flex flex-col items-center justify-center py-24 gap-3">
      <h1 className="text-xl font-bold">Page not found</h1>
      <Link to="/" className="text-cherry font-medium">Go back home</Link>
    </div>
  );
};

export default NotFoundPage;