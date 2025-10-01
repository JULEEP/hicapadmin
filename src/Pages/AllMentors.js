import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { FaEdit, FaTrash } from 'react-icons/fa';
import { utils, writeFile } from 'xlsx';

const API_BASE = 'http://localhost:5001/api';

const AllMentors = () => {
  const [mentors, setMentors] = useState([]);
  const [search, setSearch] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const [exportLimit, setExportLimit] = useState(10);

  const mentorsPerPage = 5;

  useEffect(() => {
    fetchMentors();
  }, []);

  const fetchMentors = async () => {
    setLoading(true);
    setError('');
    try {
      const res = await axios.get(`${API_BASE}/our-mentor/mentors`);
      if (res.data?.success && Array.isArray(res.data.data)) {
        setMentors(res.data.data);
      } else {
        setError('No mentors found.');
      }
    } catch (err) {
      console.error('Error fetching mentors:', err);
      setError('Failed to fetch mentors.');
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteMentor = async (id) => {
    if (!window.confirm('Are you sure you want to delete this mentor?')) return;
    try {
      await axios.delete(`${API_BASE}/our-mentor/mentor/${id}`);
      setMentors((prev) => prev.filter((m) => m._id !== id));
    } catch (err) {
      console.error('Error deleting mentor:', err);
      alert('Failed to delete mentor');
    }
  };

  const handleUpdateMentor = async (id) => {
    const updatedName = prompt('Enter new first name:');
    if (!updatedName) return;

    try {
      await axios.put(`${API_BASE}/our-mentor/mentor/${id}`, {
        firstName: updatedName,
      });
      fetchMentors();
    } catch (err) {
      console.error('Error updating mentor:', err);
      alert('Failed to update mentor');
    }
  };

  const filteredMentors = mentors.filter((mentor) =>
    mentor.firstName?.toLowerCase().includes(search.toLowerCase())
  );

  const indexOfLast = currentPage * mentorsPerPage;
  const indexOfFirst = indexOfLast - mentorsPerPage;
  const currentMentors = filteredMentors.slice(indexOfFirst, indexOfLast);
  const totalPages = Math.ceil(filteredMentors.length / mentorsPerPage);

  const exportData = (type) => {
    const data = filteredMentors.slice(0, exportLimit).map((mentor) => ({
      ID: mentor._id,
      FirstName: mentor.firstName || 'N/A',
      LastName: mentor.lastName || 'N/A',
      Email: mentor.email || 'N/A',
      Phone: mentor.phoneNumber || 'N/A',
      Expertise: mentor.expertise || 'N/A',
    }));

    if (data.length === 0) {
      alert('No data to export.');
      return;
    }

    const ws = utils.json_to_sheet(data);
    const wb = utils.book_new();
    utils.book_append_sheet(wb, ws, 'Mentors');
    writeFile(wb, `mentors.${type}`);
  };

  return (
    <div className="p-4 border rounded-lg shadow-lg bg-white">
      <div className="flex justify-between items-center mb-4">
        <h2 className="text-xl font-semibold text-blue-900">All Mentors</h2>
      </div>

      <div className="flex justify-between mb-4">
        <input
          className="w-1/3 p-2 border rounded"
          placeholder="Search by first name..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
        />
        <div className="flex gap-2 items-center">
          <span className="text-sm text-gray-600">
            Showing {filteredMentors.length} mentors
          </span>
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
            className="bg-green-600 text-white px-4 py-2 rounded hover:bg-green-700"
            onClick={() => exportData('csv')}
          >
            Export CSV
          </button>
          <button
            className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700"
            onClick={() => exportData('xlsx')}
          >
            Export Excel
          </button>
        </div>
      </div>

      {loading ? (
        <div className="text-center py-8">
          <p className="text-lg">Loading mentors...</p>
        </div>
      ) : error ? (
        <div className="text-center py-8">
          <p className="text-red-600 text-lg">{error}</p>
          <button
            onClick={fetchMentors}
            className="mt-2 bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600"
          >
            Retry
          </button>
        </div>
      ) : (
        <>
          <div className="overflow-x-auto mb-4">
            <table className="w-full border-collapse border border-gray-300">
              <thead>
                <tr className="bg-blue-600 text-white">
                  <th className="p-3 border text-left">#</th>
                  <th className="p-3 border text-left">First Name</th>
                  <th className="p-3 border text-left">Last Name</th>
                  <th className="p-3 border text-left">Email</th>
                  <th className="p-3 border text-left">Phone</th>
                  <th className="p-3 border text-left">Expertise</th>
                  <th className="p-3 border text-left">Actions</th>
                </tr>
              </thead>
              <tbody>
                {currentMentors.length === 0 ? (
                  <tr>
                    <td colSpan={7} className="p-6 text-center text-gray-500">
                      <div className="flex flex-col items-center justify-center">
                        <span className="text-xl mb-2">👨‍🏫</span>
                        <p className="text-lg">No mentors found</p>
                        {search && (
                          <p className="text-sm mt-1">
                            Try adjusting your search: "{search}"
                          </p>
                        )}
                      </div>
                    </td>
                  </tr>
                ) : (
                  currentMentors.map((mentor, index) => (
                    <tr key={mentor._id} className="border-b hover:bg-gray-50">
                      <td className="p-3 border">{index + 1 + indexOfFirst}</td>
                      <td className="p-3 border">{mentor.firstName || 'N/A'}</td>
                      <td className="p-3 border">{mentor.lastName || 'N/A'}</td>
                      <td className="p-3 border">{mentor.email || 'N/A'}</td>
                      <td className="p-3 border">{mentor.phoneNumber || 'N/A'}</td>
                      <td className="p-3 border">{mentor.expertise || 'N/A'}</td>
                      <td className="p-3 border">
                        <div className="flex gap-2">
                          <button
                            className="bg-blue-500 text-white p-2 rounded hover:bg-blue-600 transition-colors"
                            onClick={() => handleUpdateMentor(mentor._id)}
                            title="Edit Mentor"
                          >
                            <FaEdit />
                          </button>
                          <button
                            className="bg-red-500 text-white p-2 rounded hover:bg-red-600 transition-colors"
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
                Showing {indexOfFirst + 1} to {Math.min(indexOfLast, filteredMentors.length)} of {filteredMentors.length} mentors
              </div>

              <div className="flex gap-2">
                <button
                  onClick={() => setCurrentPage((prev) => Math.max(prev - 1, 1))}
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
                        ? 'bg-blue-500 text-white'
                        : 'bg-gray-200 hover:bg-gray-300'
                    }`}
                  >
                    {index + 1}
                  </button>
                ))}

                <button
                  onClick={() => setCurrentPage((prev) => Math.min(prev + 1, totalPages))}
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
    </div>
  );
};

export default AllMentors;
