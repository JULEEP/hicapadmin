import React, { useEffect, useState } from "react";
import { FaEdit, FaTrash, FaEye, FaUserPlus, FaTimes } from "react-icons/fa";
import { Link } from "react-router-dom";
import { utils, writeFile } from "xlsx";
import axios from "axios";

export default function UserList() {
  const [users, setUsers] = useState([]);
  const [enrollments, setEnrollments] = useState([]);
  const [search, setSearch] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const [usersPerPage] = useState(10);
  const [downloadLimit, setDownloadLimit] = useState(50);
  const [error, setError] = useState("");
  const [editModal, setEditModal] = useState(false);
  const [enrollmentModal, setEnrollmentModal] = useState(false);
  const [viewModal, setViewModal] = useState(false);
  const [editedUser, setEditedUser] = useState(null);
  const [selectedUser, setSelectedUser] = useState(null);
  const [selectedEnrollment, setSelectedEnrollment] = useState("");
  const [loading, setLoading] = useState(false);
  const [enrollLoading, setEnrollLoading] = useState(false);

  useEffect(() => {
    fetchUsers();
    fetchEnrollments();
  }, []);

  const fetchUsers = async () => {
    try {
      const res = await fetch("https://api.techsterker.com/api/allusers");
      const data = await res.json();
      if (!res.ok) throw new Error(data.message);
      setUsers(data.data);
      setError("");
    } catch (err) {
      setError(err.message);
    }
  };

  // Fetch enrollments
  const fetchEnrollments = async () => {
    try {
      const res = await axios.get("https://api.techsterker.com/api/allenrollments");
      setEnrollments(res.data.data || []);
    } catch (err) {
      console.error("Error fetching enrollments:", err);
      setError("Failed to load enrollments");
    }
  };

  // Open View modal with complete user data
  const openViewModal = (user) => {
    setSelectedUser(user);
    setViewModal(true);
  };

  // Open Edit modal with user data
  const openEditModal = (user) => {
    setEditedUser({ ...user });
    setEditModal(true);
  };

  // Open Enrollment modal
  const openEnrollmentModal = (user) => {
    setSelectedUser(user);
    setSelectedEnrollment("");
    setEnrollmentModal(true);
  };

  // Handle input changes in edit modal
  const handleEditChange = (e) => {
    const { name, value } = e.target;
    setEditedUser((prev) => ({ ...prev, [name]: value }));
  };

  // Save updated user
  const handleSave = async () => {
    if (!editedUser || !editedUser._id) return;

    setLoading(true);
    try {
      const res = await fetch(
        `https://api.techsterker.com/api/updateusers/${editedUser._id}`,
        {
          method: "PUT",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            name: editedUser.name,
            email: editedUser.email,
            mobile: editedUser.mobile,
            city: editedUser.city,
            zipcode: editedUser.zipcode,
            dateOfBirth: editedUser.dateOfBirth,
            course: editedUser.course,
            role: editedUser.role,
          }),
        }
      );
      const data = await res.json();
      if (!res.ok) throw new Error(data.message || "Update failed");
      
      setUsers((prev) =>
        prev.map((u) => (u._id === editedUser._id ? data.updatedUser : u))
      );
      setEditModal(false);
      setEditedUser(null);
      setError("");
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  // Handle enrollment submission
  const handleEnrollmentSubmit = async () => {
    if (!selectedUser || !selectedEnrollment) {
      setError("Please select an enrollment");
      return;
    }

    setEnrollLoading(true);
    try {
      const res = await axios.post("https://api.techsterker.com/api/enrollments/add-user", {
        userId: selectedUser._id,
        enrollmentId: selectedEnrollment
      });

      if (res.data.success) {
        setEnrollmentModal(false);
        setSelectedUser(null);
        setSelectedEnrollment("");
        setError("");
        alert("User enrolled successfully!");
      } else {
        throw new Error(res.data.message || "Enrollment failed");
      }
    } catch (err) {
      setError(err.response?.data?.message || err.message || "Enrollment failed");
    } finally {
      setEnrollLoading(false);
    }
  };

  // Delete user
  const handleDelete = async (userId) => {
    if (!window.confirm("Are you sure you want to delete this user?")) return;

    setLoading(true);
    try {
      const res = await fetch(
        `https://api.techsterker.com/api/deleteusers/${userId}`,
        {
          method: "DELETE",
        }
      );
      const data = await res.json();
      if (!res.ok) throw new Error(data.message || "Delete failed");

      setUsers((prev) => prev.filter((u) => u._id !== userId));
      setError("");
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  // Filter users by name search
  const filtered = users.filter((u) =>
    (u.name || "").toLowerCase().includes(search.toLowerCase())
  );

  const indexOfLast = currentPage * usersPerPage;
  const indexOfFirst = indexOfLast - usersPerPage;
  const currentUsers = filtered.slice(indexOfFirst, indexOfLast);
  const totalPages = Math.ceil(filtered.length / usersPerPage);

  const exportData = (type) => {
    const exportUsers = filtered.slice(0, downloadLimit).map((u) => ({
      id: u._id,
      name: u.name || "",
      email: u.email || "",
      phone: u.mobile || "",
      course: u.course || "",
      role: u.role || "",
      createdAt: u.createdAt,
      updatedAt: u.updatedAt,
    }));
    const ws = utils.json_to_sheet(exportUsers);
    const wb = utils.book_new();
    utils.book_append_sheet(wb, ws, "Users");
    writeFile(wb, `users_export.${type}`);
  };

  // Format date for display
  const formatDate = (dateString) => {
    if (!dateString) return "N/A";
    return new Date(dateString).toLocaleDateString("en-IN", {
      year: "numeric",
      month: "long",
      day: "numeric",
    });
  };

  return (
    <div className="p-4 bg-white shadow rounded relative">
      <h2 className="text-xl font-semibold mb-4">All Users</h2>
      {error && <div className="text-red-500 mb-4">{error}</div>}

      <div className="flex justify-between mb-4 gap-2">
        <input
          className="w-1/3 p-2 border rounded"
          placeholder="Search by name..."
          value={search}
          onChange={(e) => {
            setSearch(e.target.value);
            setCurrentPage(1);
          }}
        />
        <div className="flex gap-2">
          <select
            value={downloadLimit}
            onChange={(e) => setDownloadLimit(Number(e.target.value))}
            className="p-2 border rounded"
          >
            {[10, 50, 100, 200].map((v) => (
              <option key={v} value={v}>
                {v}
              </option>
            ))}
          </select>
          <button
            onClick={() => exportData("csv")}
            className="bg-gray-200 px-4 py-2 rounded"
          >
            Export CSV
          </button>
        </div>
      </div>

      <table className="w-full table-auto border-collapse border border-gray-300 mb-4">
        <thead>
          <tr className="bg-blue-600 text-white">
            <th className="p-2 border">Sl</th>
            <th className="p-2 border">Name</th>
            <th className="p-2 border">Email</th>
            <th className="p-2 border">Phone</th>
            <th className="p-2 border">Course</th>
            <th className="p-2 border">Role</th>
            <th className="p-2 border">Actions</th>
          </tr>
        </thead>
        <tbody>
          {currentUsers.map((u, idx) => (
            <tr key={u._id}>
              <td className="p-2 border">{indexOfFirst + idx + 1}</td>
              <td className="p-2 border">{u.name}</td>
              <td className="p-2 border">{u.email}</td>
              <td className="p-2 border">{u.mobile}</td>
              <td className="p-2 border">{u.course}</td>
              <td className="p-2 border">{u.role}</td>
              <td className="p-2 border flex gap-2">
                <button
                  className="bg-green-500 text-white p-1 rounded"
                  title="View"
                  onClick={() => openViewModal(u)}
                >
                  <FaEye />
                </button>
                <button
                  className="bg-blue-500 text-white p-1 rounded"
                  title="Edit"
                  onClick={() => openEditModal(u)}
                >
                  <FaEdit />
                </button>
                <button
                  className="bg-purple-500 text-white p-1 rounded"
                  title="Enroll"
                  onClick={() => openEnrollmentModal(u)}
                >
                  <FaUserPlus />
                </button>
                <button
                  className="bg-red-500 text-white p-1 rounded"
                  title="Delete"
                  onClick={() => handleDelete(u._id)}
                >
                  <FaTrash />
                </button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>

      <div className="flex justify-center gap-2 mb-4">
        <button
          onClick={() => setCurrentPage((p) => Math.max(p - 1, 1))}
          disabled={currentPage === 1}
          className="bg-gray-300 px-4 py-2 rounded"
        >
          Previous
        </button>
        {[...Array(totalPages)].map((_, i) => (
          <button
            key={i}
            onClick={() => setCurrentPage(i + 1)}
            className={`px-4 py-2 rounded ${
              currentPage === i + 1 ? "bg-blue-500 text-white" : "bg-gray-200"
            }`}
          >
            {i + 1}
          </button>
        ))}
        <button
          onClick={() => setCurrentPage((p) => Math.min(p + 1, totalPages))}
          disabled={currentPage === totalPages}
          className="bg-gray-300 px-4 py-2 rounded"
        >
          Next
        </button>
      </div>

      {/* View User Modal - Complete User Data */}
      {viewModal && selectedUser && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg shadow-xl w-full max-w-4xl max-h-[90vh] overflow-y-auto">
            <div className="flex justify-between items-center p-6 border-b">
              <h3 className="text-2xl font-bold text-gray-800">User Details</h3>
              <button
                onClick={() => setViewModal(false)}
                className="text-gray-500 hover:text-gray-700 transition-colors"
              >
                <FaTimes size={24} />
              </button>
            </div>
            
            <div className="p-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* Personal Information */}
                <div className="space-y-4">
                  <h4 className="text-lg font-semibold text-blue-600 border-b pb-2">Personal Information</h4>
                  
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-600">User ID</label>
                      <p className="mt-1 text-sm text-gray-900">{selectedUser.userId || "N/A"}</p>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-600">Name</label>
                      <p className="mt-1 text-sm text-gray-900">{selectedUser.name || "N/A"}</p>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-600">Email</label>
                      <p className="mt-1 text-sm text-gray-900 break-words">{selectedUser.email || "N/A"}</p>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-600">Mobile</label>
                      <p className="mt-1 text-sm text-gray-900">{selectedUser.mobile || "N/A"}</p>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-600">Degree</label>
                      <p className="mt-1 text-sm text-gray-900">{selectedUser.degree || "N/A"}</p>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-600">Department</label>
                      <p className="mt-1 text-sm text-gray-900">{selectedUser.department || "N/A"}</p>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-600">Passout Year</label>
                      <p className="mt-1 text-sm text-gray-900">{selectedUser.yearOfPassedOut || "N/A"}</p>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-600">Role</label>
                      <p className="mt-1 text-sm text-gray-900">{selectedUser.role || "N/A"}</p>
                    </div>
                  </div>
                </div>

                {/* Course & Professional Information */}
                <div className="space-y-4">
                  <h4 className="text-lg font-semibold text-blue-600 border-b pb-2">Course & Professional</h4>
                  
                  <div className="grid grid-cols-1 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-600">Course</label>
                      <p className="mt-1 text-sm text-gray-900">{selectedUser.course || "N/A"}</p>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-600">Company</label>
                      <p className="mt-1 text-sm text-gray-900">{selectedUser.company || "N/A"}</p>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-600">Experience</label>
                      <p className="mt-1 text-sm text-gray-900">{selectedUser.experience || "N/A"}</p>
                    </div>
                  </div>

                  {/* Payment Information */}
                  <h4 className="text-lg font-semibold text-blue-600 border-b pb-2 mt-4">Payment Information</h4>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-600">Payment Status</label>
                      <p className={`mt-1 text-sm font-medium ${
                        selectedUser.paymentStatus === "Paid" ? "text-green-600" : "text-red-600"
                      }`}>
                        {selectedUser.paymentStatus || "N/A"}
                      </p>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-600">Advance Payment</label>
                      <p className="mt-1 text-sm text-gray-900">₹{selectedUser.advancePayment?.toLocaleString() || "0"}</p>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-600">Total Price</label>
                      <p className="mt-1 text-sm text-gray-900">₹{selectedUser.totalPrice?.toLocaleString() || "0"}</p>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-600">Remaining Payment</label>
                      <p className="mt-1 text-sm text-gray-900">₹{selectedUser.remainingPayment?.toLocaleString() || "0"}</p>
                    </div>
                  </div>
                </div>

                {/* Enrolled Courses */}
                {selectedUser.enrolledCourses && selectedUser.enrolledCourses.length > 0 && (
                  <div className="md:col-span-2 space-y-4">
                    <h4 className="text-lg font-semibold text-blue-600 border-b pb-2">Enrolled Courses</h4>
                    <div className="space-y-3">
                      {selectedUser.enrolledCourses.map((course, index) => (
                        <div key={course._id} className="border rounded-lg p-4 bg-gray-50">
                          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div>
                              <label className="block text-sm font-medium text-gray-600">Batch</label>
                              <p className="mt-1 text-sm text-gray-900">{course.batchName} ({course.batchNumber})</p>
                            </div>
                            <div>
                              <label className="block text-sm font-medium text-gray-600">Start Date</label>
                              <p className="mt-1 text-sm text-gray-900">{formatDate(course.startDate)}</p>
                            </div>
                            <div>
                              <label className="block text-sm font-medium text-gray-600">Timings</label>
                              <p className="mt-1 text-sm text-gray-900">{course.timings || "N/A"}</p>
                            </div>
                            <div>
                              <label className="block text-sm font-medium text-gray-600">Duration</label>
                              <p className="mt-1 text-sm text-gray-900">{course.duration || "N/A"}</p>
                            </div>
                            <div>
                              <label className="block text-sm font-medium text-gray-600">Category</label>
                              <p className="mt-1 text-sm text-gray-900">{course.category || "N/A"}</p>
                            </div>
                            {course.courseId && (
                              <div className="md:col-span-2">
                                <label className="block text-sm font-medium text-gray-600">Course Description</label>
                                <p className="mt-1 text-sm text-gray-900">{course.courseId.description || "N/A"}</p>
                              </div>
                            )}
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* Additional Information */}
                <div className="md:col-span-2 space-y-4">
                  <h4 className="text-lg font-semibold text-blue-600 border-b pb-2">Additional Information</h4>
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-600">Generated Password</label>
                      <p className="mt-1 text-sm text-gray-900 font-mono">{selectedUser.generatedPassword || "N/A"}</p>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-600">Interviews</label>
                      <p className="mt-1 text-sm text-gray-900">{selectedUser.interviews?.length || 0}</p>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-600">Certificates</label>
                      <p className="mt-1 text-sm text-gray-900">{selectedUser.certificates?.length || 0}</p>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-600">Recommended Courses</label>
                      <p className="mt-1 text-sm text-gray-900">{selectedUser.recommendedCourses?.length || 0}</p>
                    </div>
                  </div>
                </div>

                {/* Timestamps */}
                <div className="md:col-span-2 space-y-4">
                  <h4 className="text-lg font-semibold text-blue-600 border-b pb-2">Timestamps</h4>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-600">Created At</label>
                      <p className="mt-1 text-sm text-gray-900">{formatDate(selectedUser.createdAt)}</p>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-600">Updated At</label>
                      <p className="mt-1 text-sm text-gray-900">{formatDate(selectedUser.updatedAt)}</p>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            <div className="flex justify-end gap-2 p-6 border-t bg-gray-50">
              <button
                onClick={() => setViewModal(false)}
                className="bg-gray-300 hover:bg-gray-400 px-4 py-2 rounded transition-colors"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Edit User Modal */}
      {editModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white p-6 rounded shadow-lg w-96">
            <h3 className="text-xl mb-4">Edit User</h3>
            <div className="mb-4">
              <label className="block mb-1">Name</label>
              <input
                type="text"
                name="name"
                value={editedUser.name || ""}
                onChange={handleEditChange}
                className="w-full p-2 border rounded"
              />
            </div>
            <div className="mb-4">
              <label className="block mb-1">Email</label>
              <input
                type="email"
                name="email"
                value={editedUser.email || ""}
                onChange={handleEditChange}
                className="w-full p-2 border rounded"
              />
            </div>
            <div className="mb-4">
              <label className="block mb-1">Phone</label>
              <input
                type="text"
                name="mobile"
                value={editedUser.mobile || ""}
                onChange={handleEditChange}
                className="w-full p-2 border rounded"
              />
            </div>
            <div className="mb-4">
              <label className="block mb-1">City</label>
              <input
                type="text"
                name="city"
                value={editedUser.city || ""}
                onChange={handleEditChange}
                className="w-full p-2 border rounded"
              />
            </div>
            <div className="mb-4">
              <label className="block mb-1">Course</label>
              <input
                type="text"
                name="course"
                value={editedUser.course || ""}
                onChange={handleEditChange}
                className="w-full p-2 border rounded"
              />
            </div>
            <div className="mb-4">
              <label className="block mb-1">Role</label>
              <input
                type="text"
                name="role"
                value={editedUser.role || ""}
                onChange={handleEditChange}
                className="w-full p-2 border rounded"
              />
            </div>

            <div className="flex justify-end gap-2">
              <button
                onClick={() => setEditModal(false)}
                className="bg-gray-300 px-4 py-2 rounded"
              >
                Cancel
              </button>
              <button
                onClick={handleSave}
                className="bg-blue-500 text-white px-4 py-2 rounded"
                disabled={loading}
              >
                {loading ? "Saving..." : "Save Changes"}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Enrollment Modal */}
      {enrollmentModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white p-6 rounded shadow-lg w-96">
            <h3 className="text-xl mb-4">Enroll User</h3>
            
            {selectedUser && (
              <div className="mb-4 p-3 bg-gray-50 rounded">
                <p><strong>User:</strong> {selectedUser.name}</p>
                <p><strong>Email:</strong> {selectedUser.email}</p>
              </div>
            )}

            <div className="mb-4">
              <label className="block mb-1 font-medium text-gray-700">Select Enrollment</label>
              <select
                value={selectedEnrollment}
                onChange={(e) => setSelectedEnrollment(e.target.value)}
                className="w-full p-2 border rounded focus:ring-2 focus:ring-blue-500"
              >
                <option value="">-- Select Enrollment --</option>
                {enrollments.map((enrollment) => (
                  <option key={enrollment._id} value={enrollment._id}>
                    {enrollment.batchName}{" "}
                    {enrollment.courseId?.name ? `(${enrollment.courseId.name})` : ""}
                  </option>
                ))}
              </select>
            </div>

            <div className="flex justify-end gap-2">
              <button
                onClick={() => setEnrollmentModal(false)}
                className="bg-gray-300 px-4 py-2 rounded"
                disabled={enrollLoading}
              >
                Cancel
              </button>
              <button
                onClick={handleEnrollmentSubmit}
                className="bg-purple-500 text-white px-4 py-2 rounded"
                disabled={enrollLoading || !selectedEnrollment}
              >
                {enrollLoading ? "Enrolling..." : "Enroll User"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}