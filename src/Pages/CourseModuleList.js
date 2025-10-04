import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import { FaEdit, FaTrash, FaEye, FaSearch, FaPlus, FaBook, FaUsers, FaCalendar } from 'react-icons/fa';

const CourseModulesList = () => {
  const [modules, setModules] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedModule, setSelectedModule] = useState(null);
  const [viewMode, setViewMode] = useState('table'); // 'table' or 'single'
  const [currentPage, setCurrentPage] = useState(1);
  const navigate = useNavigate();

  const itemsPerPage = 10;

  // Fetch all course modules
  const fetchData = async () => {
    setLoading(true);
    setError('');
    try {
      const modulesResponse = await axios.get('https://api.techsterker.com/api/course-modules');
      const modulesData = modulesResponse.data.data || [];
      setModules(modulesData);
    } catch (error) {
      setError('Failed to fetch data');
      console.error('Error fetching data:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  // Filter modules based on search term
  const filteredModules = modules.filter(module => {
    const courseName = module?.courseId?.name || '';
    const mentorName = module?.mentorName || '';
    return (
      courseName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      mentorName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      module._id.toLowerCase().includes(searchTerm.toLowerCase())
    );
  });

  // Pagination
  const indexOfLastItem = currentPage * itemsPerPage;
  const indexOfFirstItem = indexOfLastItem - itemsPerPage;
  const currentModules = filteredModules.slice(indexOfFirstItem, indexOfLastItem);
  const totalPages = Math.ceil(filteredModules.length / itemsPerPage);

  // View single module
  const handleViewModule = (module) => {
    setSelectedModule(module);
    setViewMode('single');
  };

  // Delete module
  const handleDeleteModule = async (id) => {
    if (!window.confirm('Are you sure you want to delete this course module?')) {
      return;
    }

    try {
      await axios.delete(`https://api.techsterker.com/api/course-modules/${id}`);
      setModules(modules.filter(module => module._id !== id));
      alert('Course module deleted successfully!');
    } catch (error) {
      setError('Failed to delete course module');
      console.error('Error deleting module:', error);
    }
  };

  // Edit module
  const handleEditModule = (id) => {
    navigate(`/course-modules/edit/${id}`);
  };

  // Create new module
  const handleCreateModule = () => {
    navigate('/course-modules/create');
  };

  // Render single module view
  const renderSingleView = () => {
    if (!selectedModule) return null;

    return (
      <div className="bg-white shadow-lg rounded-lg p-6">
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-2xl font-bold text-gray-800">Module Details</h2>
          <button
            onClick={() => setViewMode('table')}
            className="bg-gray-500 text-white px-4 py-2 rounded hover:bg-gray-600"
          >
            Back to List
          </button>
        </div>

        <div className="space-y-6">
          {/* Course Information */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="bg-blue-50 p-4 rounded-lg">
              <h3 className="font-semibold text-lg mb-3 text-blue-800">Course Information</h3>
              <div className="space-y-2">
                <div className="flex items-center">
                  <FaBook className="text-blue-600 mr-2" />
                  <span><strong>Course:</strong> {selectedModule.courseId?.name || 'N/A'}</span>
                </div>
                <div><strong>Description:</strong> {selectedModule.courseId?.description || 'N/A'}</div>
                <div><strong>Duration:</strong> {selectedModule.courseId?.duration || 'N/A'}</div>
                <div><strong>Category:</strong> {selectedModule.courseId?.category || 'N/A'}</div>
              </div>
            </div>

            <div className="bg-green-50 p-4 rounded-lg">
              <h3 className="font-semibold text-lg mb-3 text-green-800">Mentor Information</h3>
              <div className="space-y-2">
                <div className="flex items-center">
                  <FaUsers className="text-green-600 mr-2" />
                  <span><strong>Mentor:</strong> {selectedModule.mentorName || 'N/A'}</span>
                </div>
                <div><strong>Email:</strong> {selectedModule.mentorId?.email || 'N/A'}</div>
                <div><strong>Phone:</strong> {selectedModule.mentorId?.phoneNumber || 'N/A'}</div>
                <div><strong>Expertise:</strong> {selectedModule.mentorId?.expertise || 'N/A'}</div>
              </div>
            </div>
          </div>

          {/* Module Information */}
          <div className="bg-yellow-50 p-4 rounded-lg">
            <h3 className="font-semibold text-lg mb-3 text-yellow-800">Module Information</h3>
            <div className="grid grid-cols-2 gap-4">
              <div><strong>Total Modules:</strong> {selectedModule.modules?.length || 0}</div>
              <div><strong>Created At:</strong> {new Date(selectedModule.createdAt).toLocaleDateString()}</div>
            </div>
          </div>

          {/* Modules Structure */}
          <div>
            <h3 className="text-xl font-semibold mb-4 text-gray-800">Modules Structure</h3>
            {selectedModule.modules?.map((mod, moduleIndex) => (
              <div key={moduleIndex} className="border border-gray-200 rounded-lg p-4 mb-4">
                <h4 className="font-semibold text-lg mb-2 text-blue-700">
                  Subject: {mod.subjectName}
                </h4>

                {mod.topics?.map((topic, topicIndex) => (
                  <div key={topicIndex} className="ml-4 border-l-2 border-blue-200 pl-4 mb-3">
                    <h5 className="font-medium mb-1 text-green-700">
                      Topic {topicIndex + 1}: {topic.topicName}
                    </h5>

                    {topic.lessons?.map((lesson, lessonIndex) => (
                      <div key={lessonIndex} className="ml-4 border-l-2 border-green-200 pl-4 mb-2">
                        <h6 className="font-medium text-purple-700">
                          Lesson {lessonIndex + 1}: {lesson.name}
                        </h6>
                        <div className="text-xs text-gray-500">
                          {lesson.videoId && <span>Video ID: {lesson.videoId} | </span>}
                          {lesson.date && <span>Date: {new Date(lesson.date).toLocaleDateString()} | </span>}
                          {lesson.duration && <span>Duration: {lesson.duration}</span>}
                        </div>
                        {lesson.resources?.length > 0 && (
                          <div className="text-xs text-blue-600 mt-1">
                            Resources:
                            <ul className="list-disc ml-4">
                              {lesson.resources.map((res) => (
                                <li key={res._id}>
                                  <a href={res.file} target="_blank" rel="noreferrer" className="underline">
                                    {res.name}
                                  </a>
                                </li>
                              ))}
                            </ul>
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                ))}
              </div>
            ))}
          </div>

          {/* Action Buttons */}
          <div className="flex space-x-3 pt-4 border-t">
            <button
              onClick={() => handleEditModule(selectedModule._id)}
              className="bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600 flex items-center"
            >
              <FaEdit className="mr-2" /> Edit Module
            </button>
            <button
              onClick={() => handleDeleteModule(selectedModule._id)}
              className="bg-red-500 text-white px-4 py-2 rounded hover:bg-red-600 flex items-center"
            >
              <FaTrash className="mr-2" /> Delete Module
            </button>
          </div>
        </div>
      </div>
    );
  };

  // Render table view
  const renderTableView = () => (
    <div className="bg-white shadow-lg rounded-lg p-6">
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-2xl font-bold text-gray-800">All Course Modules</h2>
        <button
          onClick={handleCreateModule}
          className="bg-green-500 text-white px-4 py-2 rounded hover:bg-green-600 flex items-center"
        >
          <FaPlus className="mr-2" /> Create New Module
        </button>
      </div>

      {/* Search Bar */}
      <div className="mb-6">
        <div className="relative">
          <FaSearch className="absolute left-3 top-3 text-gray-400" />
          <input
            type="text"
            placeholder="Search by course name, mentor name, or ID..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded focus:outline-none focus:border-blue-500"
          />
        </div>
      </div>

      {error && (
        <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4">
          {error}
        </div>
      )}

      {loading ? (
        <div className="text-center py-8">
          <p className="text-lg">Loading course modules...</p>
        </div>
      ) : (
        <>
          <div className="overflow-x-auto">
            <table className="w-full border-collapse border border-gray-300">
              <thead>
                <tr className="bg-blue-600 text-white">
                  <th className="p-3 border text-left">#</th>
                  <th className="p-3 border text-left">Course Name</th>
                  <th className="p-3 border text-left">Mentor Name</th>
                  <th className="p-3 border text-left">Total Modules</th>
                  <th className="p-3 border text-left">Created At</th>
                  <th className="p-3 border text-left">Actions</th>
                </tr>
              </thead>
              <tbody>
                {currentModules.length === 0 ? (
                  <tr>
                    <td colSpan={6} className="p-6 text-center text-gray-500">
                      <div className="flex flex-col items-center justify-center">
                        <span className="text-xl mb-2">📚</span>
                        <p className="text-lg">No course modules found</p>
                        {searchTerm && (
                          <p className="text-sm mt-1">
                            Try adjusting your search term: "{searchTerm}"
                          </p>
                        )}
                      </div>
                    </td>
                  </tr>
                ) : (
                  currentModules.map((module, index) => (
                    <tr key={module._id} className="border-b hover:bg-gray-50">
                      <td className="p-3 border">{index + 1 + indexOfFirstItem}</td>
                      <td className="p-3 border font-medium">{module.courseId?.name || 'N/A'}</td>
                      <td className="p-3 border">{module.mentorName || 'N/A'}</td>
                      <td className="p-3 border">{module.modules?.length || 0}</td>
                      <td className="p-3 border">{new Date(module.createdAt).toLocaleDateString()}</td>
                      <td className="p-3 border">
                        <div className="flex gap-2">
                          <button
                            onClick={() => handleViewModule(module)}
                            className="bg-blue-500 text-white p-2 rounded hover:bg-blue-600 transition-colors"
                            title="View Details"
                          >
                            <FaEye />
                          </button>
                          <button
                            onClick={() => handleEditModule(module._id)}
                            className="bg-green-500 text-white p-2 rounded hover:bg-green-600 transition-colors"
                            title="Edit Module"
                          >
                            <FaEdit />
                          </button>
                          <button
                            onClick={() => handleDeleteModule(module._id)}
                            className="bg-red-500 text-white p-2 rounded hover:bg-red-600 transition-colors"
                            title="Delete Module"
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
          {filteredModules.length > itemsPerPage && (
            <div className="flex justify-between items-center mt-4">
              <div className="text-sm text-gray-600">
                Showing {indexOfFirstItem + 1} to {Math.min(indexOfLastItem, filteredModules.length)} of {filteredModules.length} modules
              </div>
              
              <div className="flex gap-2">
                <button
                  onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))}
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
                  onClick={() => setCurrentPage(prev => Math.min(prev + 1, totalPages))}
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

  return (
    <div className="container mx-auto px-4 py-8">
      {viewMode === 'table' ? renderTableView() : renderSingleView()}
    </div>
  );
};

export default CourseModulesList;
