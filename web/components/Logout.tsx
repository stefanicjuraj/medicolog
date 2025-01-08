"use client";

import React from "react";
import { signOutUser } from "../auth/authHelpers";

const Logout: React.FC = () => {
  const handleLogout = async () => {
    try {
      await signOutUser();
      console.log("User logged out successfully");
    } catch (error) {
      console.error("Logout failed:", error);
    }
  };

  return (
    <button
      onClick={handleLogout}
      className="px-7 py-4 bg-blue-300 border border-b-4 border-black border-r-4 rounded hover:shadow-lg"
    >
      Logout
    </button>
  );
};

export default Logout;
