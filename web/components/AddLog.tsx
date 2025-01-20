"use client";

import React, { useEffect, useState } from "react";
import { addDoc, collection } from "firebase/firestore";
import { db } from "../firebase";
import useAuth from "../auth/useAuth";

interface AddLogsModalProps {
  isOpen: boolean;
  onClose: () => void;
}

const AddLogsModal: React.FC<AddLogsModalProps> = ({ isOpen, onClose }) => {
  const [intakeType, setIntakeType] = useState("Food");
  const [mealCategory, setMealCategory] = useState("");
  const [foodOption, setFoodOption] = useState("");
  const [specificIntake, setSpecificIntake] = useState("");
  const [intakeDate, setIntakeDate] = useState("");
  const [step, setStep] = useState(0);
  const { user } = useAuth();

  const drinkOptions = [
    "Water",
    "Juice",
    "Soda",
    "Coffee",
    "Tea",
  ];
  const creamOptions = [
    "Moisturizer",
    "Sunscreen",
    "Medicine Cream",
  ];
  const supplementOptions = [
    "Vitamin",
    "Protein Shake",
    "Mineral Supplement",
  ];

  const mealCategories = [
    "Breakfast",
    "Lunch",
    "Dinner",
    "Snack",
  ];

  const foodOptionsMap: { [key: string]: string[] } = {
    Breakfast: ["Eggs", "Toast", "Cereal", "Omelette"],
    Lunch: ["Pasta", "Salad", "Sandwich", "Burger"],
    Dinner: ["Steak", "Pizza", "Soup", "Sandwich"],
    Snack: ["Fruit", "Chips", "Yogurt", "Nuts"],
  };

  const intakeOptionsMap: { [key: string]: string[] } = {
    Drink: drinkOptions,
    Cream: creamOptions,
    Supplement: supplementOptions,
  };

  const maxStep = intakeType === "Food" ? 3 : 2;

  useEffect(() => {
    setMealCategory("");
    setFoodOption("");
    setSpecificIntake("");
    setStep(0);
  }, [intakeType]);

  const handleAddLog = async () => {
    if (!user) return;

    let finalSpecificIntake = "";
    if (intakeType === "Food") {
      finalSpecificIntake = foodOption;
    } else {
      finalSpecificIntake = specificIntake;
    }

    try {
      const logsCollection = collection(db, "logs");
      await addDoc(logsCollection, {
        intakeType,
        specificIntake: finalSpecificIntake,
        intakeDate: intakeDate || null,
        notes: "",
        uid: user.uid,
      });
      setIntakeType("Food");
      setMealCategory("");
      setFoodOption("");
      setSpecificIntake("");
      setIntakeDate("");
      setStep(0);
      onClose();
    } catch (error) {
      console.error("Failed to add log:", error);
    }
  };

  const handleNextStep = () => {
    if (intakeType === "Food") {
      if (step === 1 && mealCategory.trim() === "") {
        alert("Please select a meal category.");
        return;
      }
      if (step === 2 && foodOption.trim() === "") {
        alert("Please select or enter a food option.");
        return;
      }
    } else {
      if (step === 1 && specificIntake.trim() === "") {
        alert("Please select or enter a specific intake.");
        return;
      }
    }
    setStep((prevStep) => Math.min(prevStep + 1, maxStep));
  };

  const handlePreviousStep = () => {
    setStep((prevStep) => Math.max(prevStep - 1, 0));
  };

  const handleCancel = () => {
    setIntakeType("Food");
    setMealCategory("");
    setFoodOption("");
    setSpecificIntake("");
    setIntakeDate("");
    setStep(0);
    onClose();
  };

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
              Intake Type
            </label>
            <div className="grid grid-cols-2 gap-4">
              {["Food", "Drink", "Cream", "Supplement", "Other"].map(
                (type) => (
                  <div
                    key={type}
                    onClick={() => setIntakeType(type)}
                    className={`p-4 border rounded-lg text-center cursor-pointer border-r-4 border-b-4 ${
                      intakeType === type
                        ? "border-black bg-blue-300"
                        : "border-black"
                    }`}
                  >
                    {type}
                  </div>
                ),
              )}
            </div>
          </div>
        )}

        {intakeType === "Food" && step === 1 && (
          <div>
            <label className="block text-2xl font-bold mb-4">
              Meal Category
            </label>
            <div className="grid grid-cols-2 gap-4">
              {mealCategories.map((meal) => (
                <div
                  key={meal}
                  onClick={() => setMealCategory(meal)}
                  className={`p-4 border rounded-lg text-center cursor-pointer border-r-4 border-b-4 ${
                    mealCategory === meal
                      ? "border-black bg-blue-300"
                      : "border-black"
                  }`}
                >
                  {meal}
                </div>
              ))}
            </div>
          </div>
        )}

        {intakeType === "Food" && step === 2 && (
          <div>
            <label className="block text-2xl font-bold mb-4">
              {mealCategory} Options
            </label>
            <div className="grid grid-cols-2 gap-4">
              {(mealCategory ? foodOptionsMap[mealCategory] : []).map((
                option,
              ) => (
                <div
                  key={option}
                  onClick={() => setFoodOption(option)}
                  className={`p-4 border rounded-lg text-center cursor-pointer border-r-4 border-b-4 ${
                    foodOption === option
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
              placeholder="Or enter a custom food option"
              value={foodOption}
              onChange={(e) => setFoodOption(e.target.value)}
              maxLength={50}
              className="w-full p-4 mt-4 border border-black border-r-4 border-b-4 rounded focus:outline-none focus:ring-0 focus:border-black"
            />
          </div>
        )}

        {intakeType !== "Food" && step === 1 && (
          <div>
            <label className="block text-2xl font-bold mb-4">
              {intakeType} Intake
            </label>
            <div className="grid grid-cols-2 gap-4">
              {(intakeOptionsMap[intakeType] || []).map(
                (option) => (
                  <div
                    key={option}
                    onClick={() => setSpecificIntake(option)}
                    className={`p-4 border rounded-lg text-center cursor-pointer border-r-4 border-b-4 ${
                      specificIntake === option
                        ? "border-black bg-blue-300"
                        : "border-black"
                    }`}
                  >
                    {option}
                  </div>
                ),
              )}
            </div>
            <input
              type="text"
              placeholder="Or enter a custom intake"
              value={specificIntake}
              onChange={(e) => setSpecificIntake(e.target.value)}
              maxLength={50}
              className="w-full p-4 mt-4 border border-black border-r-4 border-b-4 rounded focus:outline-none focus:ring-0 focus:border-black"
            />
          </div>
        )}

        {((intakeType === "Food" && step === 3) ||
          (intakeType !== "Food" && step === 2)) && (
          <div>
            <label className="block text-2xl font-bold mb-4">
              Intake Date
            </label>
            <input
              type="date"
              value={intakeDate}
              onChange={(e) => setIntakeDate(e.target.value)}
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
          {step < maxStep
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
                onClick={handleAddLog}
                className="px-8 py-4 text-lg bg-blue-300 font-bold border border-b-4 border-black border-r-4 rounded hover:shadow-lg my-4"
              >
                Submit
              </button>
            )}
        </div>
        <div className="flex items-center text-xs mt-4 whitespace-nowrap">
          <span className="font-bold">{step + 1} / {maxStep + 1}</span>
          <div className="w-full bg-gray-200 h-2 rounded-full ml-4">
            <div
              className="h-2 bg-blue-300 rounded-full"
              style={{
                width: `${((step + 1) / (maxStep + 1)) * 100}%`,
              }}
            >
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AddLogsModal;
