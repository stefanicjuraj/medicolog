"use client";

import React, { useEffect, useState } from "react";
import {
  collection,
  deleteDoc,
  doc,
  onSnapshot,
  query,
  Timestamp,
  updateDoc,
  where,
} from "firebase/firestore";
import { db } from "../../firebase";
import useAuth from "../../auth/useAuth";
import Login from "../../components/Login";
import Navbar from "../../components/Navbar";
import AddAllergyModal from "../../components/AddAllergy";

interface Allergy {
  id: string;
  allergy: string;
  subType?: string | null;
  severity: string;
  symptoms: string[];
  uid: string;
  createdAt: Timestamp;
}

const EditAllergyModal: React.FC<{
  isOpen: boolean;
  allergy: Allergy | null;
  onClose: () => void;
}> = ({ isOpen, allergy, onClose }) => {
  const [editedAllergy, setEditedAllergy] = useState<Allergy | null>(null);

  useEffect(() => {
    if (allergy) {
      setEditedAllergy(allergy);
    }
  }, [allergy]);

  const handleInputChange = (key: keyof Allergy, value: string) => {
    if (!editedAllergy) return;
    setEditedAllergy({ ...editedAllergy, [key]: value });
  };

  const handleSeverityChange = (value: string) => {
    if (!editedAllergy) return;
    setEditedAllergy({ ...editedAllergy, severity: value });
  };

  const handleSymptomToggle = (symptom: string) => {
    if (!editedAllergy) return;
    const currentSymptoms = editedAllergy.symptoms || [];
    if (currentSymptoms.includes(symptom)) {
      setEditedAllergy({
        ...editedAllergy,
        symptoms: currentSymptoms.filter((s) => s !== symptom),
      });
    } else {
      setEditedAllergy({
        ...editedAllergy,
        symptoms: [...currentSymptoms, symptom],
      });
    }
  };

  const handleSave = async () => {
    if (!editedAllergy) return;

    try {
      const docRef = doc(db, "allergies", editedAllergy.id);

      const updatedData = {
        allergy: editedAllergy.allergy || "",
        severity: editedAllergy.severity || "",
        symptoms: editedAllergy.symptoms || [],
      };

      await updateDoc(docRef, updatedData);

      onClose();
    } catch (error) {
      console.error("Failed to update allergy:", error);
      alert("Failed to update allergy. Please try again.");
    }
  };

  if (!isOpen || !allergy || !editedAllergy) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex justify-center items-center z-50 p-2">
      <div className="bg-white p-8 rounded-lg shadow-lg sm:w-2/6 w-full relative">
        <button
          onClick={onClose}
          className="absolute top-5 right-4 text-sm text-black px-4 py-2 bg-gray-100 rounded focus:outline-none focus:ring-0"
          aria-label="Close"
        >
          x
        </button>

        <h2 className="text-2xl font-bold mb-8">Edit Allergy</h2>
        <div>
          <label className="block mb-2 font-bold">Allergy:</label>
          <input
            type="text"
            value={editedAllergy.allergy || ""}
            onChange={(e) => handleInputChange("allergy", e.target.value)}
            className="w-full p-3 border border-black border-r-4 border-b-4 rounded mb-4 focus:outline-none focus:ring-0 focus:border-black"
          />

          {
            /* Sub-Type
          <label className="block mb-2 font-bold">Sub-Type:</label>
          <input
            type="text"
            value={editedAllergy.subType || ""}
            onChange={(e) => handleInputChange("subType", e.target.value)}
            className="w-full p-3 border border-black border-r-4 border-b-4 rounded mb-4 focus:outline-none focus:ring-0 focus:border-black"
          /> */
          }

          <label className="block mb-2 font-bold">Severity:</label>
          <select
            value={editedAllergy.severity || ""}
            onChange={(e) => handleSeverityChange(e.target.value)}
            className="w-full p-3 border border-black border-r-4 border-b-4 rounded mb-4 focus:outline-none focus:ring-0 focus:border-black"
          >
            <option value="">Select Severity</option>
            <option value="Mild">Mild</option>
            <option value="Moderate">Moderate</option>
            <option value="Severe">Severe</option>
            <option value="Extreme">Extreme</option>
          </select>

          <label className="block mb-2 font-bold">Symptoms:</label>
          <div className="grid grid-cols-2 gap-4 max-h-60 overflow-y-auto">
            {[
              "Sneezing",
              "Itchy Eyes",
              "Runny Nose",
              "Cough",
              "Difficulty Breathing",
              "Hives",
              "Swelling",
              "Anaphylaxis",
            ].map((symptom) => (
              <div
                key={symptom}
                onClick={() => handleSymptomToggle(symptom)}
                className={`p-4 border rounded-lg text-center cursor-pointer border-r-4 border-b-4 ${
                  editedAllergy.symptoms.includes(symptom)
                    ? "border-black bg-blue-300"
                    : "border-black"
                }`}
              >
                {symptom}
              </div>
            ))}
          </div>
        </div>

        <div className="flex justify-start space-x-4 mt-6">
          <button
            onClick={handleSave}
            className="px-8 py-4 text-lg bg-blue-300 font-bold border border-b-4 border-black border-r-4 rounded hover:shadow-lg my-4"
          >
            Save
          </button>
          <button
            onClick={onClose}
            className="px-8 py-4 text-lg bg-gray-100 font-bold border border-b-4 border-black border-r-4 rounded hover:shadow-lg my-4"
          >
            Cancel
          </button>
        </div>
      </div>
    </div>
  );
};

const Allergies = () => {
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [allergies, setAllergies] = useState<Allergy[]>([]);
  const [selectedAllergy, setSelectedAllergy] = useState<Allergy | null>(null);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const { user } = useAuth();

  const handleOpenAddModal = () => setIsAddModalOpen(true);
  const handleCloseAddModal = () => setIsAddModalOpen(false);

  const handleEditModalOpen = (allergy: Allergy) => {
    setSelectedAllergy(allergy);
    setIsEditModalOpen(true);
  };

  const handleEditModalClose = () => {
    setSelectedAllergy(null);
    setIsEditModalOpen(false);
  };

  const handleDeleteModalOpen = (allergy: Allergy) => {
    setSelectedAllergy(allergy);
    setIsDeleteModalOpen(true);
  };

  const handleDeleteModalClose = () => {
    setSelectedAllergy(null);
    setIsDeleteModalOpen(false);
  };

  const handleDelete = async () => {
    if (!selectedAllergy) return;

    try {
      const docRef = doc(db, "allergies", selectedAllergy.id);
      await deleteDoc(docRef);
      setSelectedAllergy(null);
      setIsDeleteModalOpen(false);
    } catch (error) {
      console.error("Failed to delete allergy:", error);
      alert("Failed to delete allergy. Please try again.");
    }
  };

  const allergyTypeEmojis: { [key: string]: string } = {
    Dust: "🌫️",
    Peanuts: "🥜",
    "Fish Products": "🐟",
    "Pet Dander": "🐾",
    "Insect Stings": "🐝",
    Medication: "💊",
    Other: "📋",
  };

  const allergyTypeColors: { [key: string]: string } = {
    Pollen: "bg-blue-100",
    Dust: "bg-gray-100",
    Peanuts: "bg-yellow-100",
    "Fish Products": "bg-teal-100",
    "Pet Dander": "bg-pink-100",
    "Insect Stings": "bg-orange-100",
    Medication: "bg-green-100",
    Other: "bg-purple-100",
  };

  useEffect(() => {
    if (!user) return;

    const allergiesCollection = collection(db, "allergies");
    const q = query(allergiesCollection, where("uid", "==", user.uid));

    const unsubscribe = onSnapshot(q, (snapshot) => {
      const allergyList = snapshot.docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
      })) as Allergy[];
      setAllergies(allergyList);
    });

    return () => unsubscribe();
  }, [user]);

  if (!user) {
    return (
      <div>
        <Navbar />
        <div className="p-4 max-w-screen-lg mx-auto">
          <h1 className="text-5xl font-bold">My Allergies</h1>
          <p className="text-black mt-8">
            Please log in to view your allergies.
          </p>
          <Login />
        </div>
      </div>
    );
  }

  return (
    <>
      <Navbar />
      <div className="p-4 max-w-screen-lg mx-auto mb-40">
        <h1 className="text-5xl font-bold">My Allergies</h1>
        <button
          onClick={handleOpenAddModal}
          className="px-7 py-3 text-lg bg-blue-300 font-bold border border-b-4 border-black border-r-4 rounded hover:shadow-lg my-8"
        >
          Add Allergy
        </button>

        <AddAllergyModal
          isOpen={isAddModalOpen}
          onClose={handleCloseAddModal}
        />

        <div className="flex flex-col space-y-4 animation delay-1">
          {allergies.length === 0
            ? <p className="text-gray-600">No allergies added yet.</p>
            : (
              allergies.map((allergy) => (
                <div
                  key={allergy.id}
                  className={`${
                    allergyTypeColors[allergy.allergy] || "bg-blue-50"
                  } sm:p-6 p-4 rounded-lg border border-black border-b-4 border-r-4 shadow-md hover:shadow-lg flex items-center`}
                >
                  <div className="sm:text-4xl text-3xl sm:mr-6 mr-4 flex-shrink-0 rounded-xl p-3">
                    {allergyTypeEmojis[allergy.allergy] || "📋"}
                  </div>
                  <div className="flex-1">
                    <div className="flex justify-between items-center">
                      <div>
                        <h2 className="sm:text-xl text-md font-bold mb-1">
                          {allergy.allergy}
                        </h2>
                        {allergy.subType && (
                          <p className="mb-1 text-sm font-semibold">
                            {allergy.subType}
                          </p>
                        )}
                        <p className="mb-1 text-sm font-semibold">
                          Severity: {""}
                          <span className="font-normal">
                            {allergy.severity}
                          </span>
                        </p>
                      </div>
                      <div className="flex sm:space-x-4 space-x-2">
                        <button
                          onClick={() => handleEditModalOpen(allergy)}
                          aria-label="Edit Allergy"
                        >
                          <img
                            src="/icons/edit.svg"
                            className="sm:h-10 sm:w-10 w-8 h-8 p-1"
                            alt="Edit Allergy"
                          />
                        </button>
                        <button
                          onClick={() => handleDeleteModalOpen(allergy)}
                          aria-label="Delete Allergy"
                        >
                          <img
                            src="/icons/delete.svg"
                            className="sm:h-10 sm:w-10 w-8 h-8 p-1"
                            alt="Delete Allergy"
                          />
                        </button>
                      </div>
                    </div>
                    {allergy.symptoms && allergy.symptoms.length > 0 && (
                      <div className="mt-0">
                        <h3 className="font-bold text-sm">
                          Symptoms:{" "}
                          <span className="font-normal">
                            {allergy.symptoms.join(", ")}
                          </span>
                        </h3>
                      </div>
                    )}
                    <p className="text-sm mt-2">
                      {allergy.createdAt.toDate().toLocaleDateString()}
                    </p>
                  </div>
                </div>
              ))
            )}
        </div>

        <EditAllergyModal
          isOpen={isEditModalOpen}
          allergy={selectedAllergy}
          onClose={handleEditModalClose}
        />

        {isDeleteModalOpen && selectedAllergy && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex justify-center items-center z-50 p-2">
            <div className="bg-white p-6 rounded-lg shadow-lg sm:w-1/4 w-full">
              <h2 className="text-xl font-bold mb-4">Confirm Deletion</h2>
              <p>
                Are you sure you want to delete the allergy "{selectedAllergy
                  .allergy}"?
              </p>
              <div className="flex justify-center mt-6 space-x-4">
                <button
                  onClick={handleDeleteModalClose}
                  className="px-7 py-3 text-lg bg-gray-100 hover:bg-gray-200 font-bold border-b-4 border-black border-r-4 rounded hover:shadow-lg"
                >
                  Cancel
                </button>
                <button
                  onClick={handleDelete}
                  className="px-7 py-3 text-lg bg-red-400 hover:bg-red-500 font-bold border-b-4 border-black border-r-4 rounded hover:shadow-lg"
                >
                  Delete
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </>
  );
};

export default Allergies;
