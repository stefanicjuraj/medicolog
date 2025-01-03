import React from "react";
import { signInWithGoogle } from "../auth/authHelpers";

const Login: React.FC = () => {
  const handleGoogleLogin = async () => {
    try {
      const user = await signInWithGoogle();
    } catch (error) {
      console.error("Login failed:", error);
    }
  };

  return (
    <div className="mx-auto text-center mt-20">
      <button
        onClick={handleGoogleLogin}
        className="px-7 py-4 bg-blue-300 border border-b-4 border-black border-r-4 rounded hover:shadow-lg"
      >
        Sign in with Google
      </button>
    </div>
  );
};

export default Login;
