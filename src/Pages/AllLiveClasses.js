import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { utils, writeFile } from 'xlsx';

const API_BASE = 'https://api.techsterker.com/api';

const AllLiveClasses = () => {
  const [classes, setClasses] = useState([]);
  const [search, setSearch] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const [exportLimit, setExportLimit] = useState(10);

  const classesPerPage = 5;

  useEffect(() => {
    fetchLiveClasses();
  }, []);

  const fetchLiveClasses = async () => {
    setLoading(true);
    setError('');
    try {
      const res = await axios.get(`${API_BASE}/liveclass`);
      if (res.data?.success && Array.isArray(res.data.data)) {
        setClasses(res.data.data);
      } else {
        setError('No live classes found.');
      }
    } catch (err) {
      console.error('Error fetching live classes:', err);
      setError('Failed to fetch live classes.');
    } finally {
      setLoading(false);
    }
  };

  const filteredClasses = classes.filter((cls) =>
    cls.className?.toLowerCase().includes(search.toLowerCase())
  );

  const indexOfLast = currentPage * classesPerPage;
  const indexOfFirst = indexOfLast - classesPerPage;
  const currentClasses = filteredClasses.slice(indexOfFirst, indexOfLast);
  const totalPages = Math.ceil(filteredClasses.length / classesPerPage);

  const exportData = (type) => {
    const data = filteredClasses.slice(0, exportLimit).map((cls) => ({
      ID: cls._id,
      ClassName: cls.className || 'N/A',
      Subject: cls.subjectName || 'N/A',
      Date: cls.date ? new Date(cls.date).toLocaleDateString() : 'N/A',
      Time: cls.timing || 'N/A',
      Link: cls.link || 'N/A'
    }));

    if (data.length === 0) {
      alert('No data to export.');
      return;
    }

    const ws = utils.json_to_sheet(data);
    const wb = utils.book_new();
    utils.book_append_sheet(wb, ws, 'LiveClasses');
    writeFile(wb, `live-classes.${type}`);
  };

  return (
    <div className="p-4 border rounded-lg shadow-lg bg-white">
      <div className="flex justify-between items-center mb-4">
        <h2 className="text-xl font-semibold text-blue-900">All Live Classes</h2>
      </div>

      <div className="flex justify-between mb-4">
        <input
          className="w-1/3 p-2 border rounded"
          placeholder="Search by class name..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
        />
        <div className="flex gap-2 items-center">
          <span className="text-sm text-gray-600">
            Showing {filteredClasses.length} classes
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
          <p className="text-lg">Loading live classes...</p>
        </div>
      ) : error ? (
        <div className="text-center py-8">
          <p className="text-red-600 text-lg">{error}</p>
          <button
            onClick={fetchLiveClasses}
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
                  <th className="p-3 border text-left">Class Name</th>
                  <th className="p-3 border text-left">Subject</th>
                  <th className="p-3 border text-left">Date</th>
                  <th className="p-3 border text-left">Time</th>
                  <th className="p-3 border text-left">Link</th>
                </tr>
              </thead>
              <tbody>
                {currentClasses.length === 0 ? (
                  <tr>
                    <td colSpan={6} className="p-6 text-center text-gray-500">
                      <div className="flex flex-col items-center justify-center">
                        <span className="text-xl mb-2">📚</span>
                        <p className="text-lg">No live classes found</p>
                        {search && (
                          <p className="text-sm mt-1">
                            Try adjusting your search: "{search}"
                          </p>
                        )}
                      </div>
                    </td>
                  </tr>
                ) : (
                  currentClasses.map((cls, index) => (
                    <tr key={cls._id} className="border-b hover:bg-gray-50">
                      <td className="p-3 border">{index + 1 + indexOfFirst}</td>
                      <td className="p-3 border">{cls.className || 'N/A'}</td>
                      <td className="p-3 border">{cls.subjectName || 'N/A'}</td>
                      <td className="p-3 border">
                        {cls.date ? new Date(cls.date).toLocaleDateString() : 'N/A'}
                      </td>
                      <td className="p-3 border">{cls.timing || 'N/A'}</td>
                      <td className="p-3 border">
                        {cls.link ? (
                          <a
                            href={cls.link}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="text-blue-600 hover:underline"
                          >
                            Open Link
                          </a>
                        ) : (
                          'N/A'
                        )}
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>

          {/* Pagination */}
          {filteredClasses.length > classesPerPage && (
            <div className="flex justify-between items-center mt-4">
              <div className="text-sm text-gray-600">
                Showing {indexOfFirst + 1} to {Math.min(indexOfLast, filteredClasses.length)} of {filteredClasses.length} classes
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

export default AllLiveClasses;
