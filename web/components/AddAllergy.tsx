"use client";

import React, { useEffect, useState } from "react";
import { addDoc, collection } from "firebase/firestore";
import { db } from "../firebase";
import useAuth from "../auth/useAuth";

interface AddAllergyModalProps {
  isOpen: boolean;
  onClose: () => void;
}

const AddAllergyModal: React.FC<AddAllergyModalProps> = ({
  isOpen,
  onClose,
}) => {
  const [selectedAllergy, setSelectedAllergy] = useState("");
  const [customAllergy, setCustomAllergy] = useState("");
  const [selectedSubType, setSelectedSubType] = useState("");
  const [customSubType, setCustomSubType] = useState("");
  const [selectedSeverity, setSelectedSeverity] = useState("");
  const [selectedSymptoms, setSelectedSymptoms] = useState<string[]>([]);
  const [step, setStep] = useState(0);
  const { user } = useAuth();

  const subTypeOptionsMap: { [key: string]: string[] } = {
    "Pet Dander": ["Cat", "Dog", "Bird", "Other"],
    Medication: ["Ibuprofen", "Penicillin", "Aspirin", "Other"],
    "Insect Stings": ["Bee", "Wasp", "Hornet", "Other"],
  };

  const allergyOptions = [
    "Pollen",
    "Peanuts",
    "Fish Products",
    "Pet Dander",
    "Insect Stings",
    "Medication",
  ];

  const severityOptions = ["Mild", "Moderate", "Severe", "Extreme"];

  const symptomOptions = [
    "Sneezing",
    "Itchy Eyes",
    "Runny Nose",
    "Cough",
    "Difficulty Breathing",
    "Hives",
    "Swelling",
    "Anaphylaxis",
  ];

  const requiresSubType = selectedAllergy && subTypeOptionsMap[selectedAllergy];

  const totalSteps = requiresSubType ? 4 : 3;

  const handleAddRecord = async () => {
    if (!user) {
      alert("You must be logged in to add an allergy.");
      return;
    }

    try {
      const allergiesCollection = collection(db, "allergies");
      await addDoc(allergiesCollection, {
        allergy: selectedAllergy || customAllergy,
        subType: selectedSubType || customSubType || null,
        severity: selectedSeverity,
        symptoms: selectedSymptoms,
        uid: user.uid,
        createdAt: new Date(),
      });

      setSelectedAllergy("");
      setCustomAllergy("");
      setSelectedSubType("");
      setCustomSubType("");
      setSelectedSeverity("");
      setSelectedSymptoms([]);
      setStep(0);
      onClose();
    } catch (error) {
      console.error("Error adding allergy:", error);
      alert("There was an error adding your allergy. Please try again.");
    }
  };

  const handleNextStep = () => {
    if (step === 0) {
      if (!selectedAllergy && !customAllergy.trim()) {
        alert("Please select an allergy or enter a custom one.");
        return;
      }
    } else if (step === 1 && requiresSubType) {
      if (!selectedSubType && !customSubType.trim()) {
        alert("Please select a sub-type or enter a custom one.");
        return;
      }
    } else if (step === (requiresSubType ? 2 : 1)) {
      if (!selectedSeverity) {
        alert("Please select the severity.");
        return;
      }
    }

    setStep((prevStep) => {
      const nextStep = prevStep + 1;
      if (
        requiresSubType && prevStep === 0 && !subTypeOptionsMap[selectedAllergy]
      ) {
        return nextStep + 1;
      }
      return Math.min(nextStep, totalSteps - 1);
    });
  };

  const handlePreviousStep = () => {
    setStep((prevStep) => {
      let prev = prevStep - 1;
      if (
        requiresSubType && prevStep === 3 && !subTypeOptionsMap[selectedAllergy]
      ) {
        prev = prev - 1;
      }
      return Math.max(prev, 0);
    });
  };

  const handleCancel = () => {
    setSelectedAllergy("");
    setCustomAllergy("");
    setSelectedSubType("");
    setCustomSubType("");
    setSelectedSeverity("");
    setSelectedSymptoms([]);
    setStep(0);
    onClose();
  };

  useEffect(() => {
    setSelectedSubType("");
    setCustomSubType("");
  }, [selectedAllergy]);

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
            <h2 className="block text-2xl font-bold mb-4">Select Allergy</h2>
            <div className="grid grid-cols-2 gap-4 max-h-60 overflow-y-auto">
              {allergyOptions.map((option) => (
                <div
                  key={option}
                  onClick={() => {
                    setSelectedAllergy(option);
                    setCustomAllergy("");
                  }}
                  className={`p-4 border rounded-lg text-center cursor-pointer border-r-4 border-b-4 ${
                    selectedAllergy === option
                      ? "border-black bg-blue-300"
                      : "border-black"
                  }`}
                >
                  {option}
                </div>
              ))}
            </div>
            <div className="mt-4">
              <input
                type="text"
                placeholder="Or enter a custom allergy"
                value={customAllergy}
                onChange={(e) => {
                  setCustomAllergy(e.target.value);
                  setSelectedAllergy("");
                }}
                maxLength={50}
                className="w-full p-4 border border-black rounded focus:outline-none focus:ring-0 focus:border-black"
              />
            </div>
          </div>
        )}

        {step === 1 && requiresSubType && (
          <div>
            <h2 className="block text-2xl font-bold mb-4">Select Sub-Type</h2>
            <div className="grid grid-cols-2 gap-4 max-h-60 overflow-y-auto">
              {subTypeOptionsMap[selectedAllergy].map((option) => (
                <div
                  key={option}
                  onClick={() => {
                    setSelectedSubType(option);
                    setCustomSubType("");
                  }}
                  className={`p-4 border rounded-lg text-center cursor-pointer border-r-4 border-b-4 ${
                    selectedSubType === option
                      ? "border-black bg-blue-300"
                      : "border-black"
                  }`}
                >
                  {option}
                </div>
              ))}
            </div>
            <div className="mt-4">
              <input
                type="text"
                placeholder="Or enter a custom sub-type"
                value={customSubType}
                onChange={(e) => {
                  setCustomSubType(e.target.value);
                  setSelectedSubType("");
                }}
                maxLength={50}
                className="w-full p-4 border border-black rounded focus:outline-none focus:ring-0 focus:border-black"
              />
            </div>
          </div>
        )}

        {(step === (requiresSubType ? 2 : 1)) && (
          <div>
            <h2 className="block text-2xl font-bold mb-4">Select Severity</h2>
            <div className="grid grid-cols-2 gap-4">
              {severityOptions.map((option) => (
                <div
                  key={option}
                  onClick={() => setSelectedSeverity(option)}
                  className={`p-4 border rounded-lg text-center cursor-pointer border-r-4 border-b-4 ${
                    selectedSeverity === option
                      ? "border-black bg-blue-300"
                      : "border-black"
                  }`}
                >
                  {option}
                </div>
              ))}
            </div>
          </div>
        )}

        {(step === (requiresSubType ? 3 : 2)) && (
          <div>
            <h2 className="block text-2xl font-bold mb-4">Select Symptoms</h2>
            <div className="grid grid-cols-2 gap-4 max-h-60 overflow-y-auto">
              {symptomOptions.map((option) => (
                <div
                  key={option}
                  onClick={() => {
                    if (selectedSymptoms.includes(option)) {
                      setSelectedSymptoms(
                        selectedSymptoms.filter((sym) => sym !== option),
                      );
                    } else {
                      setSelectedSymptoms([...selectedSymptoms, option]);
                    }
                  }}
                  className={`p-4 border rounded-lg text-center cursor-pointer border-r-4 border-b-4 ${
                    selectedSymptoms.includes(option)
                      ? "border-black bg-blue-300"
                      : "border-black"
                  }`}
                >
                  {option}
                </div>
              ))}
            </div>
          </div>
        )}

        <div className="flex justify-between mt-6">
          {step > 0 && (
            <button
              onClick={handlePreviousStep}
              className="px-4 py-4 text-lg bg-gray-100 font-bold border border-b-4 border-black border-r-4 rounded hover:shadow-lg my-4"
            >
              ⬅ Previous
            </button>
          )}
          {step < totalSteps - 1
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
                onClick={handleAddRecord}
                className="px-8 py-4 text-lg bg-blue-300 font-bold border border-b-4 border-black border-r-4 rounded hover:shadow-lg my-4"
              >
                Submit
              </button>
            )}
        </div>

        <div className="flex items-center text-xs mt-4">
          <span className="font-bold">{step + 1} / {totalSteps}</span>
          <div className="w-full bg-gray-200 h-2 rounded-full ml-4">
            <div
              className="h-2 bg-blue-300 rounded-full"
              style={{ width: `${((step + 1) / totalSteps) * 100}%` }}
            >
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AddAllergyModal;
