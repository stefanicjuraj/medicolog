"use client";

import React from "react";
import useAuth from "../../auth/useAuth";
import Navbar from "../../components/Navbar";
import Logout from "../../components/Logout";

export default function Profile() {
  const { user } = useAuth();

  if (!user) {
    return (
      <>
        <Navbar />
        <div className="p-4 max-w-screen-lg mx-auto mb-40">
          <p>Please log in to view your profile.</p>
        </div>
      </>
    );
  }

  return (
    <>
      <Navbar />
      <div className="p-4 max-w-screen-lg mx-auto mb-40">
        <h1 className="text-5xl font-bold">My Profile</h1>
        <div className="flex items-center space-x-4 my-8">
          {user.photoURL && (
            <img
              src={user.photoURL}
              alt="👤"
              className="w-16 h-16 rounded-full"
            />
          )}
          <div>
            <h2 className="text-2xl font-bold">{user.displayName}</h2>
            <p className="text-md text-gray-600">{user.email}</p>
          </div>
        </div>
        <Logout />
      </div>
    </>
  );
}
