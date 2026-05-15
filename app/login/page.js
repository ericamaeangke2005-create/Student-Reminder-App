"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { GoogleAuthProvider, signInWithPopup } from "firebase/auth";
import { auth } from "@/firebase/firebase";
import { useAuth } from "@/context/authcontext";

export default function Login() {
  const router = useRouter();
  const { user, loading } = useAuth();
  const [status, setStatus] = useState("");

  useEffect(() => {
    if (!loading && user) {
      router.replace("/");
    }
  }, [user, loading, router]);

  const login = async () => {
    setStatus("Signing in..");

    try {
      const provider = new GoogleAuthProvider();
      await signInWithPopup(auth, provider);
      setStatus("Login successful. Redirecting...");
    } catch (error) {
      console.error("Login error:", error);
      setStatus(`Login failed: ${error.message}`);
    }
  };

  return (
    <div className="flex items-center justify-center h-screen bg-black text-white">
      <div className="space-y-4 text-center">
        <button onClick={login} className="bg-blue-500 px-6 py-3 rounded">
          Login with Google
        </button>
        <p>{loading ? "Checking authentication.." : status}</p>
        {!loading && user && <p>Already signed in. Redirecting...</p>}
      </div>
    </div>
  );
}