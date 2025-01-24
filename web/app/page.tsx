"use client";

import React from "react";
import useAuth from "../auth/useAuth";
import Login from "../components/Login";
import Navbar from "../components/Navbar";
import Link from "next/link";

const Home: React.FC = () => {
  const { user } = useAuth();

  const features = [
    {
      title: "Appointments",
      description:
        "Effortlessly organize and stay on top of your medical visits and consultations.",
      image: "/images/appointments.png",
      link: "/appointments",
    },
    {
      title: "Records",
      description:
        "Securely store and retrieve your health information whenever you need it.",
      image: "/images/records.png",
      link: "/records",
    },
    {
      title: "Allergies",
      description:
        "Document and communicate your allergies for safer and more informed care.",
      image: "/images/allergies.png",
      link: "/allergies",
    },
    {
      title: "Logs",
      description:
        "Track and analyze your daily health patterns and symptoms for better insights.",
      image: "/images/intake.png",
      link: "/logs",
    },
  ];

  return (
    <div>
      <Navbar />
      {!user
        ? (
          <div className="p-6 max-w-screen-lg mx-auto">
            <div className="mx-auto text-center">
              <h2 className="mt-10 text-center text-6xl font-bold">
                Welcome to Medicolog
              </h2>
              <h3 className="mt-10 text-lg max-w-screen-sm mx-auto">
                Your personal health assistant, designed to help you manage
                appointments, track medical records, monitor allergies, and
                maintain health logs — all in one place.
              </h3>
              <Login />
            </div>

            {features.map((feature, index) => (
              <div
                key={index}
                className={`flex flex-col md:flex-row items-center justify-center my-20 ${
                  index % 2 !== 0 ? "md:flex-row-reverse" : ""
                }`}
              >
                <div className="flex-1 flex flex-col items-start justify-center p-4">
                  <h3 className="text-4xl font-bold mb-3 text-left">
                    {feature.title}
                  </h3>
                  <p className="text-xl text-left">
                    {feature.description}
                  </p>
                </div>

                <div className="flex-1 mt-6 mx-3">
                  <img
                    src={feature.image}
                    alt={`${feature.title} Illustration`}
                    className="w-full h-auto border border-black border-2 border-r-8 border-b-8 p-2 rounded"
                  />
                </div>
              </div>
            ))}
          </div>
        )
        : (
          <div className="p-4 max-w-screen-lg mx-auto">
            <h2 className="text-4xl font-bold mb-4">
              Welcome, <br />
              {user.displayName} 👋
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-10 p-4">
              {features.map((feature, index) => (
                <Link href={feature.link} key={index}>
                  <div className="bg-blue-50 border border-black border-2 border-r-8 border-b-8 p-12 rounded-lg relative min-h-[250px]">
                    <h3 className="text-3xl font-bold mb-4">
                      {feature.title}
                    </h3>
                    <p className="text-gray-600 max-w-xs">
                      {feature.description}
                    </p>
                    <div className="absolute bottom-4 right-8">
                      <img src="/icons/arrow.svg" className="h-8" alt="Arrow" />
                    </div>
                  </div>
                </Link>
              ))}
            </div>
          </div>
        )}
    </div>
  );
};

export default Home;
