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

  return <button onClick={handleLogout}>Logout</button>;
};

export default Logout;
