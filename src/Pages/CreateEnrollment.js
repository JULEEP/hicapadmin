import React, { useState, useEffect } from 'react';
import axios from 'axios';

const API_BASE = 'http://localhost:5001/api';

const CreateEnrollment = () => {
  const [courses, setCourses] = useState([]);
  const [formData, setFormData] = useState({
    batchNumber: '',
    batchName: '',
    courseId: '',
    startDate: '',
    timings: '',
    duration: '',
    category: '',
    status: 'Upcoming',
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [successMessage, setSuccessMessage] = useState('');

  useEffect(() => {
    // Fetch courses from API
    const fetchCourses = async () => {
      try {
        const res = await axios.get(`${API_BASE}/allcourses`);
        if (res.data.success) {
          setCourses(res.data.data); // Assuming 'data' contains courses
        }
      } catch (err) {
        setError('Failed to fetch courses');
      }
    };

    fetchCourses();
  }, []);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData((prevState) => ({
      ...prevState,
      [name]: value,
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    setSuccessMessage('');

    try {
      const res = await axios.post(`${API_BASE}/create-enrollment`, formData);
      if (res.data.success) {
        setSuccessMessage('Enrollment created successfully!');
        setFormData({
          batchNumber: '',
          batchName: '',
          courseId: '',
          startDate: '',
          timings: '',
          duration: '',
          category: '',
          status: 'Upcoming',
        });
      } else {
        setError('Failed to create enrollment');
      }
    } catch (err) {
      console.error(err);
      setError('An error occurred while creating the enrollment');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="p-4 border rounded-lg shadow-lg bg-white">
      <h2 className="text-xl font-semibold text-blue-900 mb-4">Create Enrollment</h2>

      {error && <p className="text-red-600">{error}</p>}
      {successMessage && <p className="text-green-600">{successMessage}</p>}

      <form onSubmit={handleSubmit}>
        <div className="mb-4">
          <label className="block text-gray-700">Batch Number</label>
          <input
            type="text"
            name="batchNumber"
            value={formData.batchNumber}
            onChange={handleInputChange}
            className="w-full p-2 border rounded"
            required
          />
        </div>

        <div className="mb-4">
          <label className="block text-gray-700">Batch Name</label>
          <input
            type="text"
            name="batchName"
            value={formData.batchName}
            onChange={handleInputChange}
            className="w-full p-2 border rounded"
            required
          />
        </div>

        <div className="mb-4">
          <label className="block text-gray-700">Select Course</label>
          <select
            name="courseId"
            value={formData.courseId}
            onChange={handleInputChange}
            className="w-full p-2 border rounded"
            required
          >
            <option value="">Select a Course</option>
            {courses.map((course) => (
              <option key={course._id} value={course._id}>
                {course.name}
              </option>
            ))}
          </select>
        </div>

        <div className="mb-4">
          <label className="block text-gray-700">Start Date</label>
          <input
            type="date"
            name="startDate"
            value={formData.startDate}
            onChange={handleInputChange}
            className="w-full p-2 border rounded"
            required
          />
        </div>

        <div className="mb-4">
          <label className="block text-gray-700">Timings</label>
          <input
            type="text"
            name="timings"
            value={formData.timings}
            onChange={handleInputChange}
            className="w-full p-2 border rounded"
            required
          />
        </div>

        <div className="mb-4">
          <label className="block text-gray-700">Duration</label>
          <input
            type="text"
            name="duration"
            value={formData.duration}
            onChange={handleInputChange}
            className="w-full p-2 border rounded"
            required
          />
        </div>

        <div className="mb-4">
          <label className="block text-gray-700">Category</label>
          <input
            type="text"
            name="category"
            value={formData.category}
            onChange={handleInputChange}
            className="w-full p-2 border rounded"
            required
          />
        </div>

        <div className="mb-4">
          <label className="block text-gray-700">Status</label>
          <select
            name="status"
            value={formData.status}
            onChange={handleInputChange}
            className="w-full p-2 border rounded"
          >
            <option value="Upcoming">Upcoming</option>
            <option value="Ongoing">Ongoing</option>
            <option value="Completed">Completed</option>
          </select>
        </div>

        <button
          type="submit"
          className="bg-blue-500 text-white px-6 py-2 rounded"
          disabled={loading}
        >
          {loading ? 'Creating Enrollment...' : 'Create Enrollment'}
        </button>
      </form>
    </div>
  );
};

export default CreateEnrollment;
