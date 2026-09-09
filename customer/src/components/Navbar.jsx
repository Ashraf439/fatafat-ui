import React from 'react';
import { Link } from 'react-router-dom';

const Navbar = () => {
  return (
    <nav className="flex items-center px-8 py-5 border-b border-ink/10">
      <Link to="/" className="text-xl font-bold text-cherry">Fatafat</Link>
    </nav>
  );
};

export default Navbar;