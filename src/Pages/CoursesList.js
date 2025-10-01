import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { FaEdit, FaTrash } from 'react-icons/fa';
import { utils, writeFile } from 'xlsx';

const API_BASE = 'http://localhost:5001/api';

export default function AllCourses() {
  const [courses, setCourses] = useState([]);
  const [search, setSearch] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [exportLimit, setExportLimit] = useState(10);

  const coursesPerPage = 5;

  // Fetch courses from the API - CORRECTED
  const fetchCourses = async () => {
    setLoading(true);
    setError('');
    try {
      const res = await axios.get(`${API_BASE}/allcourses`);
      console.log('API Response:', res.data);
      
      // Corrected: Use res.data.data instead of res.data.courses
      if (res.data && res.data.success && res.data.data) {
        setCourses(res.data.data);
      } else {
        setError('No courses found');
      }
    } catch (err) {
      console.error('Error fetching courses:', err);
      setError('Failed to fetch courses');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCourses();
  }, []);

  // Export to CSV or Excel - CORRECTED (added null checks)
  const exportData = (type) => {
    const exportItems = filteredCourses
      .slice(0, exportLimit)
      .map(({ _id, name, description, price, duration }) => ({
        id: _id || 'N/A',
        name: name || 'N/A',
        description: description || 'N/A',
        price: price || 'N/A',
        duration: duration || 'N/A',
      }));

    if (exportItems.length === 0) {
      alert('No data to export');
      return;
    }

    const ws = utils.json_to_sheet(exportItems);
    const wb = utils.book_new();
    utils.book_append_sheet(wb, ws, 'Courses');
    writeFile(wb, `courses.${type}`);
  };

  // Filter courses by search term - CORRECTED (added null check)
  const filteredCourses = courses.filter((course) =>
    course.name && course.name.toLowerCase().includes(search.toLowerCase())
  );

  // Pagination logic
  const indexOfLast = currentPage * coursesPerPage;
  const indexOfFirst = indexOfLast - coursesPerPage;
  const currentCourses = filteredCourses.slice(indexOfFirst, indexOfLast);
  const totalPages = Math.ceil(filteredCourses.length / coursesPerPage);

  // Handle delete course
  const handleDeleteCourse = async (id) => {
    if (!window.confirm('Are you sure you want to delete this course?')) return;

    try {
      await axios.delete(`${API_BASE}/delete-course/${id}`);
      setCourses((prev) => prev.filter((course) => course._id !== id));
    } catch (err) {
      console.error('Error deleting course:', err);
      alert('Failed to delete course');
    }
  };

  return (
    <div className="p-4 border rounded-lg shadow-lg bg-white">
      <div className="flex justify-between items-center mb-4">
        <h2 className="text-xl font-semibold text-blue-900">All Courses</h2>
      </div>

      <div className="flex justify-between mb-4">
        <input
          className="w-1/3 p-2 border rounded"
          placeholder="Search by course name..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
        />
        <div className="flex gap-2 items-center">
          <span className="text-sm text-gray-600">
            Showing {filteredCourses.length} courses
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
          <p className="text-lg">Loading courses...</p>
        </div>
      ) : error ? (
        <div className="text-center py-8">
          <p className="text-red-600 text-lg">{error}</p>
          <button 
            onClick={fetchCourses}
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
                  <th className="p-3 border text-left">Course Name</th>
                  <th className="p-3 border text-left">Description</th>
                  <th className="p-3 border text-left">Price</th>
                  <th className="p-3 border text-left">Duration</th>
                  <th className="p-3 border text-left">Actions</th>
                </tr>
              </thead>
              <tbody>
                {currentCourses.length === 0 ? (
                  <tr>
                    <td colSpan={6} className="p-6 text-center text-gray-500">
                      <div className="flex flex-col items-center justify-center">
                        <span className="text-xl mb-2">📚</span>
                        <p className="text-lg">No courses found</p>
                        {search && (
                          <p className="text-sm mt-1">
                            Try adjusting your search term: "{search}"
                          </p>
                        )}
                      </div>
                    </td>
                  </tr>
                ) : (
                  currentCourses.map((course, index) => (
                    <tr key={course._id} className="border-b hover:bg-gray-50">
                      <td className="p-3 border">{index + 1 + indexOfFirst}</td>
                      <td className="p-3 border font-medium">{course.name || 'N/A'}</td>
                      <td className="p-3 border max-w-md truncate">
                        {course.description || 'N/A'}
                      </td>
                      <td className="p-3 border">
                        {course.price ? `₹${course.price}` : 'N/A'}
                      </td>
                      <td className="p-3 border">{course.duration || 'N/A'}</td>
                      <td className="p-3 border">
                        <div className="flex gap-2">
                          <button
                            className="bg-blue-500 text-white p-2 rounded hover:bg-blue-600 transition-colors"
                            title="Edit Course"
                          >
                            <FaEdit />
                          </button>
                          <button
                            className="bg-red-500 text-white p-2 rounded hover:bg-red-600 transition-colors"
                            onClick={() => handleDeleteCourse(course._id)}
                            title="Delete Course"
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
          {filteredCourses.length > coursesPerPage && (
            <div className="flex justify-between items-center mt-4">
              <div className="text-sm text-gray-600">
                Showing {indexOfFirst + 1} to {Math.min(indexOfLast, filteredCourses.length)} of {filteredCourses.length} courses
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
}