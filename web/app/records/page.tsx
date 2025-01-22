"use client";

import React, { useEffect, useState } from "react";
import {
  collection,
  deleteDoc,
  doc,
  onSnapshot,
  query,
  updateDoc,
  where,
} from "firebase/firestore";
import { db } from "../../firebase";
import useAuth from "../../auth/useAuth";
import Login from "../../components/Login";
import Navbar from "../../components/Navbar";
import AddRecordModal from "../../components/AddRecord";

interface Record {
  id: string;
  purpose: string;
  type: string;
  startDate: string | null;
  notes: string;
  uid: string;
}

const EditRecordModal: React.FC<{
  isOpen: boolean;
  record: Record | null;
  onClose: () => void;
}> = ({ isOpen, record, onClose }) => {
  const [editedRecord, setEditedRecord] = useState<
    Record | null
  >(record);

  useEffect(() => {
    setEditedRecord(record);
  }, [record]);

  const handleInputChange = (key: keyof Record, value: string) => {
    if (!editedRecord) return;
    setEditedRecord({ ...editedRecord, [key]: value });
  };

  const handleSave = async () => {
    if (!editedRecord) return;

    try {
      const docRef = doc(db, "records", editedRecord.id);

      const updatedData = {
        purpose: editedRecord.purpose || "",
        type: editedRecord.type || "",
        startDate: editedRecord.startDate || null,
        notes: editedRecord.notes || "",
      };

      await updateDoc(docRef, updatedData);

      onClose();
    } catch (error) {
      console.error("Failed to update record:", error);
    }
  };

  if (!isOpen || !record) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex justify-center items-center z-50 p-2">
      <div className="bg-white p-8 rounded-lg shadow-lg sm:w-2/6 w-full relative">
        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute top-5 right-4 text-sm text-black px-4 py-2 bg-gray-100 rounded focus:outline-none focus:ring-0"
          aria-label="Close"
        >
          x
        </button>

        {/* Edit Record */}
        <h2 className="text-2xl font-bold mb-8">Edit Record</h2>
        <div>
          {/* Type */}
          <label className="block mb-2 font-bold">Type:</label>
          <input
            type="text"
            value={editedRecord?.type || ""}
            onChange={(e) => handleInputChange("type", e.target.value)}
            className="w-full p-3 border border-black border-r-4 border-b-4 rounded mb-4 focus:outline-none focus:ring-0 focus:border-black"
          />
          {/* Purpose */}
          <label className="block mb-2 font-bold">Purpose:</label>
          <input
            type="text"
            value={editedRecord?.purpose || ""}
            onChange={(e) => handleInputChange("purpose", e.target.value)}
            className="w-full p-3 border border-black border-r-4 border-b-4 rounded mb-4 focus:outline-none focus:ring-0 focus:border-black"
          />
          {/* Date */}
          <label className="block mb-2 font-bold">Date:</label>
          <input
            type="date"
            value={editedRecord?.startDate
              ? new Date(editedRecord.startDate)
                .toISOString()
                .split("T")[0]
              : ""}
            onChange={(e) => handleInputChange("startDate", e.target.value)}
            className="w-full p-3 border border-black border-r-4 border-b-4 rounded mb-4 focus:outline-none focus:ring-0 focus:border-black"
          />
        </div>

        <div className="flex justify-start space-x-4 mt-6">
          {/* Save Button */}
          <button
            onClick={handleSave}
            className="px-8 py-4 text-lg bg-blue-300 font-bold border border-b-4 border-black border-r-4 rounded hover:shadow-lg my-4"
          >
            Save
          </button>
          {/* Cancel Button */}
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

const Records = () => {
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [records, setRecords] = useState<Record[]>([]);
  const [selectedRecord, setselectedRecord] = useState<
    Record | null
  >(null);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const { user } = useAuth();

  const handleOpenAddModal = () => setIsAddModalOpen(true);
  const handleCloseAddModal = () => setIsAddModalOpen(false);

  const handleEditModalOpen = (record: Record) => {
    setselectedRecord(record);
    setIsEditModalOpen(true);
  };

  const handleEditModalClose = () => {
    setselectedRecord(null);
    setIsEditModalOpen(false);
  };

  const handleDeleteModalOpen = (record: Record) => {
    setselectedRecord(record);
    setIsDeleteModalOpen(true);
  };

  const handleDeleteModalClose = () => {
    setselectedRecord(null);
    setIsDeleteModalOpen(false);
  };

  const handleDelete = async () => {
    if (!selectedRecord) return;

    try {
      const docRef = doc(db, "records", selectedRecord.id);
      await deleteDoc(docRef);
      setselectedRecord(null);
      setIsDeleteModalOpen(false);
    } catch (error) {
      console.error("Failed to delete record:", error);
      alert("Failed to delete record. Please try again.");
    }
  };

  const recordTypeEmojis: { [key: string]: string } = {
    "Diagnosis": "📝",
    Prescription: "💊",
  };

  const recordTypeColors: { [key: string]: string } = {
    "Diagnosis": "bg-blue-100",
    Prescription: "bg-green-100",
    Other: "bg-gray-100",
  };

  useEffect(() => {
    if (!user) return;

    const recordsCollection = collection(db, "records");
    const q = query(recordsCollection, where("uid", "==", user.uid));

    const unsubscribe = onSnapshot(q, (snapshot) => {
      const recordList = snapshot.docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
      })) as Record[];
      setRecords(recordList);
    });

    return () => unsubscribe();
  }, [user]);

  if (!user) {
    return (
      <div>
        <Navbar />
        <div className="p-4 max-w-screen-lg mx-auto">
          <h1 className="text-5xl font-bold">My Medical Records</h1>
          <p className="text-black mt-8">
            Please log in to view your medical records.
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
        <h1 className="text-5xl font-bold">My Medical Records</h1>
        {/* Add Record Button */}
        <button
          onClick={handleOpenAddModal}
          className="px-7 py-3 text-lg bg-blue-300 font-bold border border-b-4 border-black border-r-4 rounded hover:shadow-lg my-8"
        >
          Add Record
        </button>

        {/* Add Record Modal */}
        <AddRecordModal
          isOpen={isAddModalOpen}
          onClose={handleCloseAddModal}
        />

        {/* Record */}
        <div className="flex flex-col space-y-4 animation delay-1">
          {records.length === 0
            ? (
              <p className="text-gray-600">
                No medical records added yet.
              </p>
            )
            : (
              records.map((record) => (
                <div
                  key={record.id}
                  className={`${
                    recordTypeColors[record.type] ||
                    "bg-blue-50"
                  } sm:p-6 p-4 rounded-lg border border-black border-b-4 border-r-4 shadow-md hover:shadow-lg flex items-center`}
                >
                  <div className="sm:text-4xl text-3xl sm:mr-6 mr-4 flex-shrink-0 rounded-xl p-3">
                    {recordTypeEmojis[record.type] ||
                      "📅"}
                  </div>
                  <div className="flex-1">
                    <div className="flex justify-between items-center">
                      <div>
                        <h2 className="sm:text-xl text-md font-bold mb-1">
                          {record.type}
                        </h2>
                        <p className="mb-1 text-sm font-semibold">
                          {record.purpose}
                        </p>
                        <p className="text-sm">
                          {record.startDate
                            ? new Date(
                              record.startDate,
                            ).toLocaleDateString()
                            : "No Date Set"}
                        </p>
                      </div>
                      <div className="flex sm:space-x-4 space-x-2">
                        <button
                          onClick={() =>
                            handleEditModalOpen(
                              record,
                            )}
                          aria-label="Edit Record"
                        >
                          <img
                            src="/icons/edit.svg"
                            className="sm:h-10 sm:w-10 w-8 h-8 p-1"
                            alt="Edit Record"
                          />
                        </button>
                        <button
                          onClick={() =>
                            handleDeleteModalOpen(
                              record,
                            )}
                          aria-label="Delete Record"
                        >
                          <img
                            src="/icons/delete.svg"
                            className="sm:h-10 sm:w-10 w-8 h-8 p-1"
                            alt="Delete Record"
                          />
                        </button>
                      </div>
                    </div>
                    {record.notes && (
                      <div className="mt-4">
                        <h3 className="font-bold">
                          Notes:
                        </h3>
                        <p className="text-gray-700">
                          {record.notes}
                        </p>
                      </div>
                    )}
                  </div>
                </div>
              ))
            )}
        </div>

        {/* Edit Record Modal */}
        <EditRecordModal
          isOpen={isEditModalOpen}
          record={selectedRecord}
          onClose={handleEditModalClose}
        />

        {/* Delete Record Modal */}
        {isDeleteModalOpen && selectedRecord && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex justify-center items-center z-50 p-2">
            <div className="bg-white p-6 rounded-lg shadow-lg sm:w-1/4 w-full">
              <h2 className="text-xl font-bold mb-4">
                Confirm Deletion
              </h2>
              <p>
                Are you sure you want to delete the record "{selectedRecord
                  .purpose}"?
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

export default Records;
