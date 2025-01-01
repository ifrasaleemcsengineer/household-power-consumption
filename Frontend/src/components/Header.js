import React from 'react';

const Header = () => (
  <header className="bg-gradient-to-r from-blue-500 to-blue-600 text-white p-6 shadow-md sticky top-0 z-10">
    <div className="flex items-center space-x-4">
      <h1 className="text-3xl font-bold">Electric Power Consumption Dashboard</h1>
    </div>
    <p className="mt-2 text-lg">Visualize and analyze power consumption data for better insights</p>
  </header>
);

export default Header;
