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
import AddLogsModal from "../../components/AddLog";

interface IntakeLog {
  id: string;
  intakeType: string;
  specificIntake: string;
  intakeDate: string | null;
  uid: string;
}

const EditLogsModal: React.FC<{
  isOpen: boolean;
  log: IntakeLog | null;
  onClose: () => void;
}> = ({ isOpen, log, onClose }) => {
  const [editedLog, setEditedLog] = useState<IntakeLog | null>(log);

  useEffect(() => {
    setEditedLog(log);
  }, [log]);

  const handleInputChange = (
    key: keyof IntakeLog,
    value: string,
  ) => {
    if (!editedLog) return;
    setEditedLog({ ...editedLog, [key]: value });
  };

  const handleSave = async () => {
    if (!editedLog) return;

    try {
      const docRef = doc(db, "logs", editedLog.id);
      const updatedData = {
        intakeType: editedLog.intakeType || "",
        specificIntake: editedLog.specificIntake || "",
        intakeDate: editedLog.intakeDate || null,
      };
      await updateDoc(docRef, updatedData);
      onClose();
    } catch (error) {
      console.error("Failed to update log:", error);
    }
  };

  if (!isOpen || !log) return null;

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
        <h2 className="text-2xl font-bold mb-8">Edit Intake Log</h2>
        <div>
          <label className="block mb-2 font-bold">Intake Type:</label>
          <input
            type="text"
            value={editedLog?.intakeType || ""}
            onChange={(e) => handleInputChange("intakeType", e.target.value)}
            className="w-full p-3 border border-black border-r-4 border-b-4 rounded mb-4 focus:outline-none focus:ring-0 focus:border-black"
          />
          <label className="block mb-2 font-bold">
            Specific Intake:
          </label>
          <input
            type="text"
            value={editedLog?.specificIntake || ""}
            onChange={(e) =>
              handleInputChange("specificIntake", e.target.value)}
            className="w-full p-3 border border-black border-r-4 border-b-4 rounded mb-4 focus:outline-none focus:ring-0 focus:border-black"
          />
          <label className="block mb-2 font-bold">Date:</label>
          <input
            type="date"
            value={editedLog?.intakeDate
              ? new Date(editedLog.intakeDate)
                .toISOString()
                .split("T")[0]
              : ""}
            onChange={(e) => handleInputChange("intakeDate", e.target.value)}
            className="w-full p-3 border border-black border-r-4 border-b-4 rounded mb-4 focus:outline-none focus:ring-0 focus:border-black"
          />
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

const Logs = () => {
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [logs, setLogs] = useState<IntakeLog[]>([]);
  const [selectedLog, setSelectedLog] = useState<IntakeLog | null>(null);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const { user } = useAuth();

  const handleOpenAddModal = () => setIsAddModalOpen(true);
  const handleCloseAddModal = () => setIsAddModalOpen(false);

  const handleEditModalOpen = (log: IntakeLog) => {
    setSelectedLog(log);
    setIsEditModalOpen(true);
  };

  const handleEditModalClose = () => {
    setSelectedLog(null);
    setIsEditModalOpen(false);
  };

  const handleDeleteModalOpen = (log: IntakeLog) => {
    setSelectedLog(log);
    setIsDeleteModalOpen(true);
  };

  const handleDeleteModalClose = () => {
    setSelectedLog(null);
    setIsDeleteModalOpen(false);
  };

  const handleDelete = async () => {
    if (!selectedLog) return;
    try {
      const docRef = doc(db, "logs", selectedLog.id);
      await deleteDoc(docRef);
      setSelectedLog(null);
      setIsDeleteModalOpen(false);
    } catch (error) {
      console.error("Failed to delete log:", error);
      alert("Failed to delete log. Please try again.");
    }
  };

  const intakeTypeEmojis: { [key: string]: string } = {
    Food: "🍎",
    Drink: "🥤",
    Cream: "🧴",
    Supplement: "💊",
    Other: "📋",
  };

  const intakeTypeColors: { [key: string]: string } = {
    Food: "bg-green-100",
    Drink: "bg-blue-100",
    Cream: "bg-pink-100",
    Supplement: "bg-yellow-100",
    Other: "bg-gray-100",
  };

  useEffect(() => {
    if (!user) return;
    const logsCollection = collection(db, "logs");
    const q = query(
      logsCollection,
      where("uid", "==", user.uid),
    );
    const unsubscribe = onSnapshot(q, (snapshot) => {
      const logsList = snapshot.docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
      })) as IntakeLog[];
      setLogs(logsList);
    });
    return () => unsubscribe();
  }, [user]);

  if (!user) {
    return (
      <div>
        <Navbar />
        <div className="p-4 max-w-screen-lg mx-auto">
          <h1 className="text-5xl font-bold">My Intake Log</h1>
          <p className="text-black mt-8">
            Please log in to view your logs.
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
        <h1 className="text-5xl font-bold">My Intake Log</h1>
        <button
          onClick={handleOpenAddModal}
          className="px-7 py-3 text-lg bg-blue-300 font-bold border border-b-4 border-black border-r-4 rounded hover:shadow-lg my-8"
        >
          Add Log
        </button>

        <AddLogsModal
          isOpen={isAddModalOpen}
          onClose={handleCloseAddModal}
        />

        <div className="flex flex-col space-y-4 animation delay-1">
          {logs.length === 0
            ? (
              <p className="text-gray-600">
                No logs added yet.
              </p>
            )
            : (
              logs.map((log) => (
                <div
                  key={log.id}
                  className={`${
                    intakeTypeColors[log.intakeType] ||
                    "bg-blue-50"
                  } sm:p-6 p-4 rounded-lg border border-black border-b-4 border-r-4 shadow-md hover:shadow-lg flex items-center`}
                >
                  <div className="sm:text-4xl text-3xl sm:mr-6 mr-4 flex-shrink-0 rounded-xl p-3">
                    {intakeTypeEmojis[log.intakeType] ||
                      "📋"}
                  </div>
                  <div className="flex-1">
                    <div className="flex justify-between items-center">
                      <div>
                        <h2 className="sm:text-xl text-md font-bold mb-1">
                          {log.specificIntake}
                        </h2>
                        <p className="mb-1 text-sm font-semibold">
                          {log.intakeType}
                        </p>
                        <p className="text-sm">
                          {log.intakeDate
                            ? new Date(
                              log.intakeDate,
                            ).toLocaleDateString()
                            : "No Date Set"}
                        </p>
                      </div>
                      <div className="flex sm:space-x-4 space-x-2">
                        <button
                          onClick={() => handleEditModalOpen(log)}
                          aria-label="Edit Log"
                        >
                          <img
                            src="/icons/edit.svg"
                            className="sm:h-10 sm:w-10 w-8 h-8 p-1"
                            alt="Edit log"
                          />
                        </button>
                        <button
                          onClick={() => handleDeleteModalOpen(log)}
                          aria-label="Delete Log"
                        >
                          <img
                            src="/icons/delete.svg"
                            className="sm:h-10 sm:w-10 w-8 h-8 p-1"
                            alt="Delete log"
                          />
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              ))
            )}
        </div>

        <EditLogsModal
          isOpen={isEditModalOpen}
          log={selectedLog}
          onClose={handleEditModalClose}
        />

        {isDeleteModalOpen && selectedLog && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex justify-center items-center z-50 p-2">
            <div className="bg-white p-6 rounded-lg shadow-lg sm:w-1/4 w-full">
              <h2 className="text-xl font-bold mb-4">
                Confirm Deletion
              </h2>
              <p>
                Are you sure you want to delete the log for "
                {selectedLog.specificIntake}"?
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

export default Logs;
