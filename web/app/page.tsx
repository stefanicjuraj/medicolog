"use client";

import React from "react";
import useAuth from "../auth/useAuth";
import Login from "../components/Login";
import Navbar from "../components/Navbar";

const Home: React.FC = () => {
  const { user } = useAuth();

  return (
    <div>
      <Navbar />
      {!user ? <Login /> : (
        <div className="p-4 max-w-screen-md mx-auto">
          <h2 className="text-4xl font-bold mb-4">
            Welcome, <br />
            {user.displayName} 👋
          </h2>
        </div>
      )}
    </div>
  );
};

export default Home;
