"use client";

import React, { useEffect } from "react";
import { useRouter } from "next/navigation";
import useAuth from "../../auth/useAuth";
import Navbar from "../../components/Navbar";
import Logout from "../../components/Logout";

export default function Profile() {
  const { user } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (!user) {
      router.push("/");
    }
  }, [user, router]);

  if (!user) {
    return null;
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
            <h1 className="text-2xl font-bold">{user.displayName}</h1>
            <p className="text-md text-gray-600">{user.email}</p>
          </div>
        </div>

        <Logout />
      </div>
    </>
  );
}
