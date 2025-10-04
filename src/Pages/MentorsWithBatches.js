import React, { useState, useEffect } from "react";
import axios from "axios";
import { FaEdit, FaTrash, FaEye } from "react-icons/fa";

const API_BASE = "https://api.techsterker.com/api";

const MentorsWithBatches = () => {
  const [mentors, setMentors] = useState([]);
  const [search, setSearch] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const [selectedMentor, setSelectedMentor] = useState(null); // For popup
  const mentorsPerPage = 5;

  useEffect(() => {
    fetchMentors();
  }, []);

  const fetchMentors = async () => {
    setLoading(true);
    setError("");
    try {
      const res = await axios.get(`${API_BASE}/mentors/with-batches`);
      if (res.data && Array.isArray(res.data.data)) {
        setMentors(res.data.data);
      } else {
        setError("Invalid data format received from server.");
        console.error("Invalid data format:", res.data);
      }
    } catch (err) {
      console.error("Error fetching mentors:", err);
      setError("Failed to fetch mentors.");
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteMentor = async (id) => {
    if (!window.confirm("Are you sure you want to delete this mentor?")) return;
    try {
      await axios.delete(`${API_BASE}/our-mentor/mentor/${id}`);
      setMentors((prev) => prev.filter((m) => m._id !== id));
    } catch (err) {
      console.error("Error deleting mentor:", err);
      alert("Failed to delete mentor");
    }
  };

  const handleUpdateMentor = async (id) => {
    const updatedName = prompt("Enter new mentor name:");
    if (!updatedName) return;
    try {
      await axios.put(`${API_BASE}/our-mentor/mentor/${id}`, {
        name: updatedName,
      });
      fetchMentors();
    } catch (err) {
      console.error("Error updating mentor:", err);
      alert("Failed to update mentor");
    }
  };

  // Filter
  const filteredMentors = mentors.filter((mentor) =>
    `${mentor.firstName} ${mentor.lastName}`
      .toLowerCase()
      .includes(search.toLowerCase())
  );

  // Pagination
  const indexOfLast = currentPage * mentorsPerPage;
  const indexOfFirst = indexOfLast - mentorsPerPage;
  const currentMentors = filteredMentors.slice(indexOfFirst, indexOfLast);
  const totalPages = Math.ceil(filteredMentors.length / mentorsPerPage);

  return (
    <div className="p-4 border rounded-lg shadow-lg bg-white">
      <div className="flex justify-between items-center mb-4">
        <h2 className="text-xl font-semibold text-blue-900">All Mentors With Batches</h2>
        <button
          onClick={fetchMentors}
          className="bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600"
        >
          Refresh Data
        </button>
      </div>

      {/* Search */}
      <div className="flex justify-between mb-4">
        <input
          className="w-1/3 p-2 border rounded"
          placeholder="Search by mentor name..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
        />
      </div>

      {loading ? (
        <div className="text-center py-8">
          <p className="text-lg">Loading mentors...</p>
        </div>
      ) : error ? (
        <div className="text-center py-8">
          <p className="text-red-600 text-lg">{error}</p>
        </div>
      ) : (
        <>
          <div className="overflow-x-auto mb-4">
            <table className="w-full border-collapse border border-gray-300">
              <thead>
                <tr className="bg-blue-600 text-white">
                  <th className="p-3 border text-left">#</th>
                  <th className="p-3 border text-left">Name</th>
                  <th className="p-3 border text-left">Email</th>
                  <th className="p-3 border text-left">Expertise</th>
                  <th className="p-3 border text-left">Subjects</th>
                  <th className="p-3 border text-left">Batches</th>
                  <th className="p-3 border text-left">Actions</th>
                </tr>
              </thead>
              <tbody>
                {currentMentors.length === 0 ? (
                  <tr>
                    <td colSpan={7} className="p-6 text-center text-gray-500">
                      No mentors found
                    </td>
                  </tr>
                ) : (
                  currentMentors.map((mentor, index) => (
                    <tr key={mentor._id} className="border-b hover:bg-gray-50">
                      <td className="p-3 border">{index + 1 + indexOfFirst}</td>
                      <td className="p-3 border font-medium">
                        {mentor.firstName} {mentor.lastName}
                      </td>
                      <td className="p-3 border">{mentor.email}</td>
                      <td className="p-3 border">{mentor.expertise || "N/A"}</td>
                      <td className="p-3 border">
                        {mentor.subjects && mentor.subjects.length > 0
                          ? mentor.subjects.join(", ")
                          : "N/A"}
                      </td>
                      <td className="p-3 border">
                        {mentor.enrolledBatches?.length || 0}
                      </td>
                      <td className="p-3 border">
                        <div className="flex gap-2">
                          <button
                            className="bg-green-500 text-white p-2 rounded hover:bg-green-600"
                            onClick={() => setSelectedMentor(mentor)}
                            title="View Details"
                          >
                            <FaEye />
                          </button>
                          <button
                            className="bg-blue-500 text-white p-2 rounded hover:bg-blue-600"
                            onClick={() => handleUpdateMentor(mentor._id)}
                            title="Edit Mentor"
                          >
                            <FaEdit />
                          </button>
                          <button
                            className="bg-red-500 text-white p-2 rounded hover:bg-red-600"
                            onClick={() => handleDeleteMentor(mentor._id)}
                            title="Delete Mentor"
                          >
                            <FaTrash />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>

          {/* Pagination */}
          {filteredMentors.length > mentorsPerPage && (
            <div className="flex justify-between items-center mt-4">
              <div className="text-sm text-gray-600">
                Showing {indexOfFirst + 1} to{" "}
                {Math.min(indexOfLast, filteredMentors.length)} of{" "}
                {filteredMentors.length} mentors
              </div>
              <div className="flex gap-2">
                <button
                  onClick={() =>
                    setCurrentPage((prev) => Math.max(prev - 1, 1))
                  }
                  disabled={currentPage === 1}
                  className="bg-gray-300 px-4 py-2 rounded disabled:opacity-50 hover:bg-gray-400"
                >
                  Previous
                </button>
                {[...Array(totalPages)].map((_, index) => (
                  <button
                    key={index}
                    onClick={() => setCurrentPage(index + 1)}
                    className={`px-4 py-2 rounded ${
                      currentPage === index + 1
                        ? "bg-blue-500 text-white"
                        : "bg-gray-200 hover:bg-gray-300"
                    }`}
                  >
                    {index + 1}
                  </button>
                ))}
                <button
                  onClick={() =>
                    setCurrentPage((prev) => Math.min(prev + 1, totalPages))
                  }
                  disabled={currentPage === totalPages}
                  className="bg-gray-300 px-4 py-2 rounded disabled:opacity-50 hover:bg-gray-400"
                >
                  Next
                </button>
              </div>
            </div>
          )}
        </>
      )}

      {/* Popup for full details */}
      {selectedMentor && (
        <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-50 z-50">
          <div className="bg-white p-6 rounded-lg max-w-3xl w-full shadow-lg overflow-y-auto max-h-[90vh]">
            <h3 className="text-xl font-bold mb-4 text-blue-900">
              Mentor Details
            </h3>
            <p>
              <strong>Name:</strong> {selectedMentor.firstName}{" "}
              {selectedMentor.lastName}
            </p>
            <p>
              <strong>Email:</strong> {selectedMentor.email}
            </p>
            <p>
              <strong>Phone:</strong> {selectedMentor.phoneNumber}
            </p>
            <p>
              <strong>Expertise:</strong> {selectedMentor.expertise}
            </p>
            <p>
              <strong>Subjects:</strong>{" "}
              {selectedMentor.subjects?.length > 0
                ? selectedMentor.subjects.join(", ")
                : "N/A"}
            </p>

            <h4 className="mt-4 font-semibold text-blue-800">Assigned Courses</h4>
            {selectedMentor.assignedCourses?.length > 0 ? (
              <ul className="list-disc ml-6">
                {selectedMentor.assignedCourses.map((course) => (
                  <li key={course._id}>
                    {course.batchName} ({course.batchNumber})
                  </li>
                ))}
              </ul>
            ) : (
              <p className="text-gray-600">No assigned courses</p>
            )}

            <h4 className="mt-4 font-semibold text-blue-800">Enrolled Batches</h4>
            {selectedMentor.enrolledBatches?.length > 0 ? (
              <ul className="list-disc ml-6">
                {selectedMentor.enrolledBatches.map((batch) => (
                  <li key={batch._id}>
                    {batch.batchName} ({batch.batchNumber}) - {batch.category} |{" "}
                    Duration: {batch.courseId?.duration}
                  </li>
                ))}
              </ul>
            ) : (
              <p className="text-gray-600">No enrolled batches</p>
            )}

            <button
              className="mt-6 bg-red-500 text-white px-4 py-2 rounded hover:bg-red-600"
              onClick={() => setSelectedMentor(null)}
            >
              Close
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default MentorsWithBatches;
