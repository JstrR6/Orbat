import React from 'react';
import { Link } from 'react-router-dom';

const NavBar = () => {
  return (
    <nav className="bg-gray-800 p-4">
      <div className="container mx-auto flex justify-between">
        <Link to="/" className="text-white text-lg font-semibold">ORBAT Dashboard</Link>
        <div>
          <Link to="/units" className="text-gray-300 hover:text-white mx-2">Units</Link>
          <Link to="/forms" className="text-gray-300 hover:text-white mx-2">Forms</Link>
        </div>
      </div>
    </nav>
  );
};

export default NavBar;
