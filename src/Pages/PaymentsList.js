import React, { useEffect, useState } from "react";
import { FaEdit, FaTrashAlt, FaDownload } from "react-icons/fa";
import { utils, writeFile } from "xlsx";

export default function PaymentsList() {
  const [payments, setPayments] = useState([]);
  const [search, setSearch] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const [paymentsPerPage] = useState(10);
  const [downloadLimit, setDownloadLimit] = useState(50);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  // Modal states
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [selectedPayment, setSelectedPayment] = useState(null);
  const [updatedStatus, setUpdatedStatus] = useState("");

  useEffect(() => {
    fetchPayments();
  }, []);

  const fetchPayments = async () => {
    try {
      const res = await fetch("http://localhost:5001/api/userpayments");
      const data = await res.json();
      if (!res.ok) throw new Error(data.message);
      setPayments(data.data);
      setError("");
    } catch (err) {
      setError(err.message);
    }
  };

  // Filter payments by search query
  const filtered = payments.filter((payment) =>
    (payment.userName || "").toLowerCase().includes(search.toLowerCase())
  );

  const indexOfLast = currentPage * paymentsPerPage;
  const indexOfFirst = indexOfLast - paymentsPerPage;
  const currentPayments = filtered.slice(indexOfFirst, indexOfLast);
  const totalPages = Math.ceil(filtered.length / paymentsPerPage);

  const exportData = (type) => {
    const exportPayments = filtered.slice(0, downloadLimit).map((p) => ({
      userId: p.userId,
      userName: p.userName || "",
      userEmail: p.userEmail || "",
      courseName: p.courseName || "",
      totalAmount: p.totalAmount,
      advancePayment: p.advancePayment,
      remainingAmount: p.remainingAmount,
      paymentStatus: p.paymentStatus || "",
      createdAt: p.createdAt,
      updatedAt: p.updatedAt,
    }));
    const ws = utils.json_to_sheet(exportPayments);
    const wb = utils.book_new();
    utils.book_append_sheet(wb, ws, "Payments");
    writeFile(wb, `payments_export.${type}`);
  };

  const openEditModal = (payment) => {
    setSelectedPayment(payment);
    setUpdatedStatus(payment.paymentStatus);
    setIsEditModalOpen(true);
  };

  const handleEditStatus = async () => {
    if (!updatedStatus) {
      alert("Please select a status.");
      return;
    }

    // Update the payment status
    try {
      const res = await fetch(
        `http://localhost:5001/api/userpayments/${selectedPayment.userId}`,
        {
          method: "PUT",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({ paymentStatus: updatedStatus }),
        }
      );
      const data = await res.json();
      if (!res.ok) throw new Error(data.message);

      // Close the modal and refresh the list
      setIsEditModalOpen(false);
      fetchPayments();
    } catch (err) {
      setError(err.message);
    }
  };

  const handleDelete = async (paymentId) => {
    if (window.confirm("Are you sure you want to delete this payment?")) {
      try {
        const res = await fetch(
          `http://localhost:5001/api/userpayments/${paymentId}`,
          {
            method: "DELETE",
          }
        );
        const data = await res.json();
        if (!res.ok) throw new Error(data.message);

        // Refresh the payment list
        fetchPayments();
      } catch (err) {
        setError(err.message);
      }
    }
  };

  return (
    <div className="p-6 bg-white shadow rounded-lg relative">
      <h2 className="text-xl font-semibold mb-4">All Payments</h2>
      {error && <div className="text-red-500 mb-4">{error}</div>}

      <div className="flex justify-between mb-4 gap-2">
        <div className="flex gap-2 w-full">
          <input
            className="w-3/4 p-2 border rounded-md"
            placeholder="Search by user name..."
            value={search}
            onChange={(e) => {
              setSearch(e.target.value);
              setCurrentPage(1);
            }}
          />
          <button
            className="bg-gray-200 p-2 rounded-md hover:bg-gray-300"
            onClick={() => exportData("csv")}
          >
            <FaDownload /> Export CSV
          </button>
        </div>

        <div className="flex gap-2">
          <select
            value={downloadLimit}
            onChange={(e) => setDownloadLimit(Number(e.target.value))}
            className="p-2 border rounded-md"
          >
            {[10, 50, 100, 200].map((v) => (
              <option key={v} value={v}>
                {v}
              </option>
            ))}
          </select>
        </div>
      </div>

      <table className="w-full table-auto border-collapse border border-gray-300 mb-4">
        <thead>
          <tr className="bg-blue-600 text-white">
            <th className="p-2 border">Sl</th>
            <th className="p-2 border">User Name</th>
            <th className="p-2 border">Email</th>
            <th className="p-2 border">Course</th>
            <th className="p-2 border">Total Amount</th>
            <th className="p-2 border">Advance Payment</th>
            <th className="p-2 border">Remaining Payment</th>
            <th className="p-2 border">Payment Status</th>
            <th className="p-2 border">Actions</th>
          </tr>
        </thead>
        <tbody>
          {currentPayments.map((payment, idx) => (
            <tr key={payment.userId}>
              <td className="p-2 border">{indexOfFirst + idx + 1}</td>
              <td className="p-2 border">{payment.userName}</td>
              <td className="p-2 border">{payment.userEmail}</td>
              <td className="p-2 border">{payment.courseName}</td>
              <td className="p-2 border">{payment.totalAmount}</td>
              <td className="p-2 border">{payment.advancePayment}</td>
              <td className="p-2 border">{payment.remainingAmount}</td>
              <td className="p-2 border">{payment.paymentStatus}</td>
              <td className="p-2 border flex gap-2">
                <button
                  className="bg-yellow-500 text-white p-2 rounded-md hover:bg-yellow-400"
                  title="Edit"
                  onClick={() => openEditModal(payment)}
                >
                  <FaEdit />
                </button>
                <button
                  className="bg-red-500 text-white p-2 rounded-md hover:bg-red-400"
                  title="Delete"
                  onClick={() => handleDelete(payment.userId)}
                >
                  <FaTrashAlt />
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
          className="bg-gray-300 px-4 py-2 rounded-md"
        >
          Previous
        </button>
        {[...Array(totalPages)].map((_, i) => (
          <button
            key={i}
            onClick={() => setCurrentPage(i + 1)}
            className={`px-4 py-2 rounded-md ${
              currentPage === i + 1
                ? "bg-blue-500 text-white"
                : "bg-gray-200 hover:bg-gray-300"
            }`}
          >
            {i + 1}
          </button>
        ))}
        <button
          onClick={() => setCurrentPage((p) => Math.min(p + 1, totalPages))}
          disabled={currentPage === totalPages}
          className="bg-gray-300 px-4 py-2 rounded-md"
        >
          Next
        </button>
      </div>

      {/* Custom Edit Status Modal */}
      {isEditModalOpen && (
        <div className="fixed inset-0 bg-gray-500 bg-opacity-50 flex justify-center items-center z-50">
          <div className="bg-white p-6 rounded-md shadow-lg w-96">
            <h3 className="text-lg font-semibold mb-4">Edit Payment Status</h3>
            <select
              value={updatedStatus}
              onChange={(e) => setUpdatedStatus(e.target.value)}
              className="p-2 border rounded-md w-full mb-4"
            >
              <option value="">Select Status</option>
              <option value="Pending">Pending</option>
              <option value="Paid">Paid</option>
              <option value="Failed">Failed</option>
            </select>
            <div className="flex justify-end gap-2">
              <button
                onClick={() => setIsEditModalOpen(false)}
                className="bg-gray-300 p-2 rounded-md hover:bg-gray-400"
              >
                Cancel
              </button>
              <button
                onClick={handleEditStatus}
                className="bg-blue-500 text-white p-2 rounded-md hover:bg-blue-600"
              >
                Save Changes
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
