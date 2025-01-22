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
import AddAppointmentModal from "../../components/AddAppointment";

interface Appointment {
  id: string;
  purpose: string;
  type: string;
  startDate: string | null;
  notes: string;
  uid: string;
}

const EditAppointmentModal: React.FC<{
  isOpen: boolean;
  appointment: Appointment | null;
  onClose: () => void;
}> = ({ isOpen, appointment, onClose }) => {
  const [editedAppointment, setEditedAppointment] = useState<
    Appointment | null
  >(appointment);

  useEffect(() => {
    setEditedAppointment(appointment);
  }, [appointment]);

  const handleInputChange = (key: keyof Appointment, value: string) => {
    if (!editedAppointment) return;
    setEditedAppointment({ ...editedAppointment, [key]: value });
  };

  const handleSave = async () => {
    if (!editedAppointment) return;

    try {
      const docRef = doc(db, "appointments", editedAppointment.id);

      const updatedData = {
        purpose: editedAppointment.purpose || "",
        type: editedAppointment.type || "",
        startDate: editedAppointment.startDate || null,
        notes: editedAppointment.notes || "",
      };

      await updateDoc(docRef, updatedData);

      onClose();
    } catch (error) {
      console.error("Failed to update appointment:", error);
    }
  };

  if (!isOpen || !appointment) return null;

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

        {/* Edit Appointment */}
        <h2 className="text-2xl font-bold mb-8">Edit Appointment</h2>
        <div>
          {/* Type */}
          <label className="block mb-2 font-bold">Type:</label>
          <input
            type="text"
            value={editedAppointment?.type || ""}
            onChange={(e) => handleInputChange("type", e.target.value)}
            className="w-full p-3 border border-black border-r-4 border-b-4 rounded mb-4 focus:outline-none focus:ring-0 focus:border-black"
          />
          {/* Purpose */}
          <label className="block mb-2 font-bold">Purpose:</label>
          <input
            type="text"
            value={editedAppointment?.purpose || ""}
            onChange={(e) => handleInputChange("purpose", e.target.value)}
            className="w-full p-3 border border-black border-r-4 border-b-4 rounded mb-4 focus:outline-none focus:ring-0 focus:border-black"
          />
          {/* Date */}
          <label className="block mb-2 font-bold">Date:</label>
          <input
            type="date"
            value={editedAppointment?.startDate
              ? new Date(editedAppointment.startDate)
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

const Appointments = () => {
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [appointments, setAppointments] = useState<Appointment[]>([]);
  const [selectedAppointment, setSelectedAppointment] = useState<
    Appointment | null
  >(null);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const { user } = useAuth();

  const handleOpenAddModal = () => setIsAddModalOpen(true);
  const handleCloseAddModal = () => setIsAddModalOpen(false);

  const handleEditModalOpen = (appointment: Appointment) => {
    setSelectedAppointment(appointment);
    setIsEditModalOpen(true);
  };

  const handleEditModalClose = () => {
    setSelectedAppointment(null);
    setIsEditModalOpen(false);
  };

  const handleDeleteModalOpen = (appointment: Appointment) => {
    setSelectedAppointment(appointment);
    setIsDeleteModalOpen(true);
  };

  const handleDeleteModalClose = () => {
    setSelectedAppointment(null);
    setIsDeleteModalOpen(false);
  };

  const handleDelete = async () => {
    if (!selectedAppointment) return;

    try {
      const docRef = doc(db, "appointments", selectedAppointment.id);
      await deleteDoc(docRef);
      setSelectedAppointment(null);
      setIsDeleteModalOpen(false);
    } catch (error) {
      console.error("Failed to delete appointment:", error);
      alert("Failed to delete appointment. Please try again.");
    }
  };

  const appointmentTypeEmojis: { [key: string]: string } = {
    "Family Doctor": "👨‍⚕️",
    Dentist: "🦷",
    Gynecologist: "👩‍⚕️",
    Dermatologist: "🩺",
    Cardiologist: "❤️",
    Other: "📅",
  };

  const appointmentTypeColors: { [key: string]: string } = {
    "Family Doctor": "bg-blue-100",
    Dentist: "bg-white",
    Gynecologist: "bg-pink-100",
    Dermatologist: "bg-green-100",
    Cardiologist: "bg-red-100",
    Other: "bg-gray-100",
  };

  useEffect(() => {
    if (!user) return;

    const appointmentsCollection = collection(db, "appointments");
    const q = query(appointmentsCollection, where("uid", "==", user.uid));

    const unsubscribe = onSnapshot(q, (snapshot) => {
      const appointmentList = snapshot.docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
      })) as Appointment[];
      setAppointments(appointmentList);
    });

    return () => unsubscribe();
  }, [user]);

  if (!user) {
    return (
      <div>
        <Navbar />
        <div className="p-4 max-w-screen-lg mx-auto">
          <h1 className="text-5xl font-bold">My Appointments</h1>
          <p className="text-black mt-8">
            Please log in to view your appointments.
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
        <h1 className="text-5xl font-bold">My Appointments</h1>
        {/* Add Appointment Button */}
        <button
          onClick={handleOpenAddModal}
          className="px-7 py-3 text-lg bg-blue-300 font-bold border border-b-4 border-black border-r-4 rounded hover:shadow-lg my-8"
        >
          Add Appointment
        </button>

        {/* Add Appointment Modal */}
        <AddAppointmentModal
          isOpen={isAddModalOpen}
          onClose={handleCloseAddModal}
        />

        {/* Appointment */}
        <div className="flex flex-col space-y-4 animation delay-1">
          {appointments.length === 0
            ? (
              <p className="text-gray-600">
                No appointments added yet.
              </p>
            )
            : (
              appointments.map((appointment) => (
                <div
                  key={appointment.id}
                  className={`${
                    appointmentTypeColors[appointment.type] ||
                    "bg-blue-50"
                  } sm:p-6 p-4 rounded-lg border border-black border-b-4 border-r-4 shadow-md hover:shadow-lg flex items-center`}
                >
                  <div className="sm:text-4xl text-3xl sm:mr-6 mr-4 flex-shrink-0 rounded-xl p-3">
                    {appointmentTypeEmojis[appointment.type] ||
                      "📅"}
                  </div>
                  <div className="flex-1">
                    <div className="flex justify-between items-center">
                      <div>
                        <h2 className="sm:text-xl text-md font-bold mb-1">
                          {appointment.type}
                        </h2>
                        <p className="mb-1 text-sm font-semibold">
                          {appointment.purpose}
                        </p>
                        <p className="text-sm">
                          {appointment.startDate
                            ? new Date(
                              appointment.startDate,
                            ).toLocaleDateString()
                            : "No Date Set"}
                        </p>
                      </div>
                      <div className="flex sm:space-x-4 space-x-2">
                        <button
                          onClick={() =>
                            handleEditModalOpen(
                              appointment,
                            )}
                          aria-label="Edit Appointment"
                        >
                          <img
                            src="/icons/edit.svg"
                            className="sm:h-10 sm:w-10 w-8 h-8 p-1"
                            alt="Edit appointment"
                          />
                        </button>
                        <button
                          onClick={() =>
                            handleDeleteModalOpen(
                              appointment,
                            )}
                          aria-label="Delete Appointment"
                        >
                          <img
                            src="/icons/delete.svg"
                            className="sm:h-10 sm:w-10 w-8 h-8 p-1"
                            alt="Delete appointment"
                          />
                        </button>
                      </div>
                    </div>
                    {appointment.notes && (
                      <div className="mt-4">
                        <h3 className="font-bold">
                          Notes:
                        </h3>
                        <p className="text-gray-700">
                          {appointment.notes}
                        </p>
                      </div>
                    )}
                  </div>
                </div>
              ))
            )}
        </div>

        {/* Edit Appointment Modal */}
        <EditAppointmentModal
          isOpen={isEditModalOpen}
          appointment={selectedAppointment}
          onClose={handleEditModalClose}
        />

        {/* Delete Appointment Modal */}
        {isDeleteModalOpen && selectedAppointment && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex justify-center items-center z-50 p-2">
            <div className="bg-white p-6 rounded-lg shadow-lg sm:w-1/4 w-full">
              <h2 className="text-xl font-bold mb-4">
                Confirm Deletion
              </h2>
              <p>
                Are you sure you want to delete the appointment
                "{selectedAppointment.purpose}"?
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

export default Appointments;
