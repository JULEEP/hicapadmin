import React, { useState, useEffect } from 'react';
import { FaEdit, FaTrash } from 'react-icons/fa';
import { utils, writeFile } from 'xlsx';
import axios from 'axios';

const API_BASE = 'http://localhost:5001/api';

const AllEnrollments = () => {
  const [enrollments, setEnrollments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const [exportLimit, setExportLimit] = useState(10);
  const enrollmentsPerPage = 5;

  useEffect(() => {
    // Fetch enrollments from the API
    const fetchEnrollments = async () => {
      try {
        const res = await axios.get(`${API_BASE}/allenrollments`);
        if (res.data.success) {
          setEnrollments(res.data.data);
        } else {
          setError('Failed to fetch enrollments');
        }
      } catch (err) {
        setError('An error occurred while fetching enrollments');
        console.error(err);
      } finally {
        setLoading(false);
      }
    };

    fetchEnrollments();
  }, []);

  // Export to CSV or Excel
  const exportData = (type) => {
    const exportItems = enrollments
      .slice(0, exportLimit)
      .map(({ _id, batchName, courseId, startDate, timings, duration, category }) => ({
        id: _id,
        batchName: batchName || 'N/A',
        courseName: courseId.name || 'N/A',
        startDate: new Date(startDate).toLocaleDateString(),
        timings: timings || 'N/A',
        duration: duration || 'N/A',
        category: category || 'N/A',
      }));

    const ws = utils.json_to_sheet(exportItems);
    const wb = utils.book_new();
    utils.book_append_sheet(wb, ws, 'Enrollments');
    writeFile(wb, `enrollments.${type}`);
  };

  // Pagination logic
  const indexOfLast = currentPage * enrollmentsPerPage;
  const indexOfFirst = indexOfLast - enrollmentsPerPage;
  const currentEnrollments = enrollments.slice(indexOfFirst, indexOfLast);
  const totalPages = Math.ceil(enrollments.length / enrollmentsPerPage);

  return (
    <div className="p-4 border rounded-lg shadow-lg bg-white">
      <div className="flex justify-between items-center mb-4">
        <h2 className="text-xl font-semibold text-blue-900">All Enrollments</h2>
      </div>

      <div className="flex justify-between mb-4">
        <div className="flex gap-2 items-center">
          <select
            className="border border-gray-300 p-2 rounded"
            value={exportLimit}
            onChange={(e) => setExportLimit(parseInt(e.target.value, 10))}
          >
            <option value={10}>10</option>
            <option value={100}>100</option>
            <option value={500}>500</option>
            <option value={1000}>1000</option>
          </select>
          <button
            className="bg-gray-200 px-4 py-2 rounded"
            onClick={() => exportData('csv')}
          >
            CSV
          </button>
          <button
            className="bg-gray-200 px-4 py-2 rounded"
            onClick={() => exportData('xlsx')}
          >
            Excel
          </button>
        </div>
      </div>

      {loading ? (
        <p className="text-center">Loading enrollments...</p>
      ) : error ? (
        <p className="text-center text-red-600">{error}</p>
      ) : (
        <>
          <div className="overflow-x-auto mb-4">
            <table className="w-full border-collapse border border-gray-300">
              <thead>
                <tr className="bg-blue-600 text-white">
                  <th className="p-2 border">Sl</th>
                  <th className="p-2 border">Batch Name</th>
                  <th className="p-2 border">Course Name</th>
                  <th className="p-2 border">Start Date</th>
                  <th className="p-2 border">Timings</th>
                  <th className="p-2 border">Duration</th>
                  <th className="p-2 border">Category</th>
                  <th className="p-2 border">Actions</th>
                </tr>
              </thead>
              <tbody>
                {currentEnrollments.length === 0 ? (
                  <tr>
                    <td colSpan={8} className="p-4 text-center text-gray-500">
                      No enrollments found.
                    </td>
                  </tr>
                ) : (
                  currentEnrollments.map((enrollment, index) => (
                    <tr key={enrollment._id} className="border-b">
                      <td className="p-2 border">{index + 1 + indexOfFirst}</td>
                      <td className="p-2 border">{enrollment.batchName || 'N/A'}</td>
                      <td className="p-2 border">{enrollment.courseId.name || 'N/A'}</td>
                      <td className="p-2 border">
                        {new Date(enrollment.startDate).toLocaleDateString()}
                      </td>
                      <td className="p-2 border">{enrollment.timings || 'N/A'}</td>
                      <td className="p-2 border">{enrollment.duration || 'N/A'}</td>
                      <td className="p-2 border">{enrollment.category || 'N/A'}</td>
                      <td className="p-2 border flex gap-2">
                        <button
                          className="bg-blue-500 text-white p-1 rounded"
                          onClick={() => alert('Edit functionality not implemented')}
                        >
                          <FaEdit />
                        </button>
                        <button
                          className="bg-red-500 text-white p-1 rounded"
                          onClick={() => alert('Delete functionality not implemented')}
                        >
                          <FaTrash />
                        </button>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>

          {/* Pagination */}
          <div className="flex justify-center mt-4 gap-4">
            <button
              onClick={() => setCurrentPage((prev) => Math.max(prev - 1, 1))}
              disabled={currentPage === 1}
              className="bg-gray-300 px-4 py-2 rounded"
            >
              Previous
            </button>
            {[...Array(totalPages)].map((_, index) => (
              <button
                key={index}
                onClick={() => setCurrentPage(index + 1)}
                className={`px-4 py-2 rounded ${
                  currentPage === index + 1 ? 'bg-blue-500 text-white' : 'bg-gray-200'
                }`}
              >
                {index + 1}
              </button>
            ))}
            <button
              onClick={() => setCurrentPage((prev) => Math.min(prev + 1, totalPages))}
              disabled={currentPage === totalPages}
              className="bg-gray-300 px-4 py-2 rounded"
            >
              Next
            </button>
          </div>
        </>
      )}
    </div>
  );
};

export default AllEnrollments;

