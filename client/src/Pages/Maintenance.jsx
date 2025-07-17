import React from 'react';
import maintenanceImage from "../assets/images.png";

function Maintenance() {
  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-white text-center px-4 sm:px-6 lg:px-8">
      <img 
        src={maintenanceImage}
        alt="Maintenance" 
        className="w-48 h-48 sm:w-64 sm:h-64 lg:w-72 lg:h-72 object-contain mb-6"
      />
      <h1 className="text-2xl sm:text-3xl lg:text-4xl font-bold text-gray-800 mb-3">
        We’ll Be Back Soon!
      </h1>
      <p className="text-base sm:text-lg lg:text-xl text-gray-600 max-w-2xl">
        Our website is currently undergoing scheduled maintenance. We appreciate your patience and understanding. Please check back shortly.
      </p>
    </div>
  );
}

export default Maintenance;
