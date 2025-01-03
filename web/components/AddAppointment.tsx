"use client";

import React, { useEffect, useState } from "react";
import { addDoc, collection } from "firebase/firestore";
import { db } from "../firebase";
import useAuth from "../auth/useAuth";

interface AddAppointmentModalProps {
  isOpen: boolean;
  onClose: () => void;
}

const AddAppointmentModal: React.FC<AddAppointmentModalProps> = ({
  isOpen,
  onClose,
}) => {
  const [appointmentType, setAppointmentType] = useState("Family Doctor");
  const [specificPurpose, setSpecificPurpose] = useState("");
  const [startDate, setStartDate] = useState("");
  const [step, setStep] = useState(0);
  const { user } = useAuth();

  const familyDoctorOptions = [
    "Checkup",
    "Vaccination",
    "Consultation",
    "Follow-up",
    "Prescription",
    "Screening",
  ];
  const dentistOptions = [
    "Checkup",
    "Cleaning",
    "Filling",
    "Extraction",
    "Whitening",
    "Braces",
  ];
  const gynecologistOptions = [
    "Checkup",
    "Pregnancy",
    "Ultrasound",
    "Contraception",
    "Screening",
    "Menopause",
  ];
  const dermatologistOptions = [
    "Checkup",
    "Screening",
    "Acne",
    "Eczema",
    "Moles",
    "Rashes",
  ];
  const cardiologistOptions = [
    "Checkup",
    "Stress Test",
    "Echocardiogram",
    "ECG",
    "Screening",
    "Consultation",
  ];
  const otherOptions = ["Custom Purpose"];

  const appointmentOptionsMap: { [key: string]: string[] } = {
    "Family Doctor": familyDoctorOptions,
    Dentist: dentistOptions,
    Gynecologist: gynecologistOptions,
    Dermatologist: dermatologistOptions,
    Cardiologist: cardiologistOptions,
    Other: otherOptions,
  };

  const currentPurposeOptions = appointmentOptionsMap[appointmentType] || [];

  const handleAddAppointment = async () => {
    if (!user) {
      return;
    }

    try {
      const appointmentsCollection = collection(db, "appointments");
      await addDoc(appointmentsCollection, {
        purpose: specificPurpose,
        type: appointmentType,
        startDate: startDate || null,
        uid: user.uid,
      });

      setAppointmentType("Family Doctor");
      setSpecificPurpose("");
      setStartDate("");
      setStep(0);
      onClose();
    } catch (error) {
      console.error(error);
    }
  };

  const handleNextStep = () => {
    if (step === 1 && specificPurpose.trim() === "") {
      alert("Please select or enter a specific purpose.");
      return;
    }

    setStep((prevStep) => Math.min(prevStep + 1, 3));
  };

  const handlePreviousStep = () => {
    setStep((prevStep) => Math.max(prevStep - 1, 0));
  };

  const handleCancel = () => {
    setAppointmentType("Family Doctor");
    setSpecificPurpose("");
    setStartDate("");
    setStep(0);
    onClose();
  };

  useEffect(() => {
    setSpecificPurpose("");
  }, [appointmentType]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 backdrop-blur-md flex justify-center items-center z-50 p-2">
      <div className="bg-white p-8 rounded-lg shadow-lg sm:w-2/6 w-full relative">
        <button
          onClick={handleCancel}
          className="absolute top-7 right-4 text-sm text-black px-4 py-2 bg-gray-100 rounded focus:outline-none focus:ring-0"
          aria-label="Close"
        >
          x
        </button>

        {step === 0 && (
          <div>
            <label className="block text-2xl font-bold mb-4">
              Appointment Type
            </label>
            <div className="grid grid-cols-2 gap-4">
              {[
                "Family Doctor",
                "Dentist",
                "Gynecologist",
                "Dermatologist",
                "Cardiologist",
                "Other",
              ].map((type) => (
                <div
                  key={type}
                  onClick={() => setAppointmentType(type)}
                  className={`p-4 border rounded-lg text-center cursor-pointer border-r-4 border-b-4 ${
                    appointmentType === type
                      ? "border-black bg-blue-300"
                      : "border-black"
                  }`}
                >
                  {type}
                </div>
              ))}
            </div>
          </div>
        )}

        {step === 1 && (
          <div>
            <label className="block text-2xl font-bold mb-4">
              {appointmentType} Purpose
            </label>
            <div className="grid grid-cols-2 gap-4">
              {currentPurposeOptions.map((option) => (
                <div
                  key={option}
                  onClick={() => setSpecificPurpose(option)}
                  className={`p-4 border rounded-lg text-center cursor-pointer border-r-4 border-b-4 ${
                    specificPurpose === option
                      ? "border-black bg-blue-300"
                      : "border-black"
                  }`}
                >
                  {option}
                </div>
              ))}
            </div>
            <input
              type="text"
              placeholder="Or enter a custom purpose"
              value={specificPurpose}
              onChange={(e) => setSpecificPurpose(e.target.value)}
              maxLength={50}
              className="w-full p-4 mt-4 border border-black border-r-4 border-b-4 rounded focus:outline-none focus:ring-0 focus:border-black"
            />
          </div>
        )}

        {step === 2 && (
          <div>
            <label className="block text-2xl font-bold mb-4">
              Appointment Date
            </label>
            <input
              type="date"
              value={startDate}
              onChange={(e) => setStartDate(e.target.value)}
              className="w-full p-4 border border-black border-r-4 border-b-4 rounded focus:outline-none focus:ring-0 focus:border-black cursor-pointer"
            />
          </div>
        )}

        <div className="flex justify-between">
          {step > 0 && (
            <button
              onClick={handlePreviousStep}
              className="px-4 py-4 text-lg bg-gray-100 font-bold border border-b-4 border-black border-r-4 rounded hover:shadow-lg my-4"
            >
              ⬅ Previous
            </button>
          )}
          {step < 2
            ? (
              <button
                onClick={handleNextStep}
                className="px-8 py-4 text-lg bg-blue-300 font-bold border border-b-4 border-black border-r-4 rounded hover:shadow-lg my-4"
              >
                Next ⮕
              </button>
            )
            : (
              <button
                onClick={handleAddAppointment}
                className="px-8 py-4 text-lg bg-blue-300 font-bold border border-b-4 border-black border-r-4 rounded hover:shadow-lg my-4"
              >
                Submit
              </button>
            )}
        </div>
        <div className="flex items-center text-xs mt-4 whitespace-nowrap">
          <span className="font-bold">{step + 1} / 3</span>
          <div className="w-full bg-gray-200 h-2 rounded-full ml-4">
            <div
              className={`h-2 bg-blue-300 rounded-full`}
              style={{ width: `${((step + 1) / 3) * 100}%` }}
            >
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AddAppointmentModal;
