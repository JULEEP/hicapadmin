import React, { useEffect, useState } from "react";
import { FaEdit, FaTrashAlt, FaDownload, FaEye } from "react-icons/fa";
import { utils, writeFile } from "xlsx";

export default function InvoicesList() {
  const [invoices, setInvoices] = useState([]);
  const [search, setSearch] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const [invoicesPerPage] = useState(10);
  const [downloadLimit, setDownloadLimit] = useState(50);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  // Modal states
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [selectedInvoice, setSelectedInvoice] = useState(null);
  const [updatedStatus, setUpdatedStatus] = useState("");

  useEffect(() => {
    fetchInvoices();
  }, []);

  const fetchInvoices = async () => {
    setLoading(true);
    try {
      const res = await fetch("https://api.techsterker.com/api/getallinvoices");
      const data = await res.json();
      if (!res.ok) throw new Error(data.message);
      setInvoices(data.data);
      setError("");
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  // Filter invoices by search query
  const filtered = invoices.filter((inv) =>
    (inv.student?.name || "").toLowerCase().includes(search.toLowerCase())
  );

  const indexOfLast = currentPage * invoicesPerPage;
  const indexOfFirst = indexOfLast - invoicesPerPage;
  const currentInvoices = filtered.slice(indexOfFirst, indexOfLast);
  const totalPages = Math.ceil(filtered.length / invoicesPerPage);

  const exportData = (type) => {
    const exportInvoices = filtered
      .slice(0, downloadLimit)
      .map((inv) => ({
        invoiceNumber: inv.invoiceNumber,
        studentName: inv.student?.name || "",
        studentEmail: inv.student?.email || "",
        studentMobile: inv.student?.mobile || "",
        course: inv.student?.course || "",
        totalAmount: inv.totalAmount,
        paymentStatus: inv.status,
        issueDate: inv.issueDate,
        dueDate: inv.dueDate,
      }));
    const ws = utils.json_to_sheet(exportInvoices);
    const wb = utils.book_new();
    utils.book_append_sheet(wb, ws, "Invoices");
    writeFile(wb, `invoices_export.${type}`);
  };

  const openEditModal = (invoice) => {
    setSelectedInvoice(invoice);
    setUpdatedStatus(invoice.status);
    setIsEditModalOpen(true);
  };

  const handleEditStatus = async () => {
    if (!updatedStatus) {
      alert("Please select a status.");
      return;
    }

    try {
      const res = await fetch(
        `https://api.techsterker.com/api/updateinvoice/${selectedInvoice._id}`,
        {
          method: "PUT",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({ status: updatedStatus }),
        }
      );
      const data = await res.json();
      if (!res.ok) throw new Error(data.message);

      setIsEditModalOpen(false);
      fetchInvoices();
    } catch (err) {
      setError(err.message);
    }
  };

  const handleDelete = async (invoiceId) => {
    if (window.confirm("Are you sure you want to delete this invoice?")) {
      try {
        const res = await fetch(
          `https://api.techsterker.com/api/deleteinvoice/${invoiceId}`,
          { method: "DELETE" }
        );
        const data = await res.json();
        if (!res.ok) throw new Error(data.message);

        fetchInvoices();
      } catch (err) {
        setError(err.message);
      }
    }
  };

  return (
    <div className="p-6 bg-white shadow rounded-lg relative">
      <h2 className="text-xl font-semibold mb-4">All Invoices</h2>
      {error && <div className="text-red-500 mb-4">{error}</div>}
      {loading && <div className="mb-4">Loading invoices...</div>}

      <div className="flex justify-between mb-4 gap-2">
        <div className="flex gap-2 w-full">
          <input
            className="w-3/4 p-2 border rounded-md"
            placeholder="Search by student name..."
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
            <th className="p-2 border">Student Name</th>
            <th className="p-2 border">Email</th>
            <th className="p-2 border">Course</th>
            <th className="p-2 border">Total Amount</th>
            <th className="p-2 border">Payment Status</th>
            <th className="p-2 border">Actions</th>
          </tr>
        </thead>
        <tbody>
          {currentInvoices.map((inv, idx) => (
            <tr key={inv._id}>
              <td className="p-2 border">{indexOfFirst + idx + 1}</td>
              <td className="p-2 border">{inv.student?.name}</td>
              <td className="p-2 border">{inv.student?.email}</td>
              <td className="p-2 border">{inv.student?.course}</td>
              <td className="p-2 border">{inv.totalAmount}</td>
              <td className="p-2 border">{inv.status}</td>
              <td className="p-2 border flex gap-2">
                <a
                  href={inv.fullPdfUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="bg-green-500 text-white p-2 rounded-md hover:bg-green-400"
                  title="View Invoice"
                >
                  <FaEye />
                </a>
                <button
                  className="bg-yellow-500 text-white p-2 rounded-md hover:bg-yellow-400"
                  title="Edit"
                  onClick={() => openEditModal(inv)}
                >
                  <FaEdit />
                </button>
                <button
                  className="bg-red-500 text-white p-2 rounded-md hover:bg-red-400"
                  title="Delete"
                  onClick={() => handleDelete(inv._id)}
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

      {/* Edit Status Modal */}
      {isEditModalOpen && (
        <div className="fixed inset-0 bg-gray-500 bg-opacity-50 flex justify-center items-center z-50">
          <div className="bg-white p-6 rounded-md shadow-lg w-96">
            <h3 className="text-lg font-semibold mb-4">Edit Invoice Status</h3>
            <select
              value={updatedStatus}
              onChange={(e) => setUpdatedStatus(e.target.value)}
              className="p-2 border rounded-md w-full mb-4"
            >
              <option value="">Select Status</option>
              <option value="sent">Sent</option>
              <option value="Paid">Paid</option>
              <option value="Pending">Pending</option>
              <option value="Cancelled">Cancelled</option>
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
