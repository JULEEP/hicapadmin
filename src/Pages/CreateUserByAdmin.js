import React, { useState, useEffect } from 'react';
import axios from 'axios';

const API_BASE = 'http://localhost:5001/api';

const CreateUserByAdmin = () => {
  const [courses, setCourses] = useState([]);
  const [formData, setFormData] = useState({
    name: '',
    mobile: '',
    email: '',
    courseId: '',
    course: '',
    degree: '',
    department: '',
    yearOfPassedOut: '',
    company: '',
    role: '',
    experience: '',
    transactionId: '',
    advancePayment: 0,
    isAdvancePayment: false,
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [successMessage, setSuccessMessage] = useState('');

  // Fetch all courses on component mount
  useEffect(() => {
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

  // Handle input field change
  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData((prevState) => ({
      ...prevState,
      [name]: value,
    }));
  };

  // Handle form submission
  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    setSuccessMessage('');

    try {
      const res = await axios.post(`${API_BASE}/register-by-admin`, formData);
      if (res.data.success) {
        setSuccessMessage('User registered successfully!');
        setFormData({
          name: '',
          mobile: '',
          email: '',
          courseId: '',
          course: '',
          degree: '',
          department: '',
          yearOfPassedOut: '',
          company: '',
          role: '',
          experience: '',
          transactionId: '',
          advancePayment: 0,
          isAdvancePayment: false,
        });
      } else {
        setError('Failed to register user');
      }
    } catch (err) {
      console.error(err);
      setError('An error occurred while registering the user');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="p-4 border rounded-lg shadow-lg bg-white">
      <h2 className="text-xl font-semibold text-blue-900 mb-4">Create User (Admin)</h2>

      {error && <p className="text-red-600">{error}</p>}
      {successMessage && <p className="text-green-600">{successMessage}</p>}

      <form onSubmit={handleSubmit}>
        {/* Name */}
        <div className="mb-4">
          <label className="block text-gray-700">Name</label>
          <input
            type="text"
            name="name"
            value={formData.name}
            onChange={handleInputChange}
            className="w-full p-2 border rounded"
            required
          />
        </div>

        {/* Mobile */}
        <div className="mb-4">
          <label className="block text-gray-700">Mobile</label>
          <input
            type="text"
            name="mobile"
            value={formData.mobile}
            onChange={handleInputChange}
            className="w-full p-2 border rounded"
            required
          />
        </div>

        {/* Email */}
        <div className="mb-4">
          <label className="block text-gray-700">Email</label>
          <input
            type="email"
            name="email"
            value={formData.email}
            onChange={handleInputChange}
            className="w-full p-2 border rounded"
            required
          />
        </div>

        {/* Course Selection */}
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

        {/* Degree */}
        <div className="mb-4">
          <label className="block text-gray-700">Degree</label>
          <input
            type="text"
            name="degree"
            value={formData.degree}
            onChange={handleInputChange}
            className="w-full p-2 border rounded"
            required
          />
        </div>

        {/* Department */}
        <div className="mb-4">
          <label className="block text-gray-700">Department</label>
          <input
            type="text"
            name="department"
            value={formData.department}
            onChange={handleInputChange}
            className="w-full p-2 border rounded"
            required
          />
        </div>

        {/* Year of Passed Out */}
        <div className="mb-4">
          <label className="block text-gray-700">Year of Passing Out</label>
          <input
            type="text"
            name="yearOfPassedOut"
            value={formData.yearOfPassedOut}
            onChange={handleInputChange}
            className="w-full p-2 border rounded"
            required
          />
        </div>

        {/* Company */}
        <div className="mb-4">
          <label className="block text-gray-700">Company</label>
          <input
            type="text"
            name="company"
            value={formData.company}
            onChange={handleInputChange}
            className="w-full p-2 border rounded"
            required
          />
        </div>

        {/* Role */}
        <div className="mb-4">
          <label className="block text-gray-700">Role</label>
          <input
            type="text"
            name="role"
            value={formData.role}
            onChange={handleInputChange}
            className="w-full p-2 border rounded"
            required
          />
        </div>

        {/* Experience */}
        <div className="mb-4">
          <label className="block text-gray-700">Experience</label>
          <input
            type="text"
            name="experience"
            value={formData.experience}
            onChange={handleInputChange}
            className="w-full p-2 border rounded"
            required
          />
        </div>

        {/* Transaction ID */}
        <div className="mb-4">
          <label className="block text-gray-700">Transaction ID</label>
          <input
            type="text"
            name="transactionId"
            value={formData.transactionId}
            onChange={handleInputChange}
            className="w-full p-2 border rounded"
            required
          />
        </div>

        {/* Advance Payment */}
        <div className="mb-4">
          <label className="block text-gray-700">Advance Payment</label>
          <input
            type="number"
            name="advancePayment"
            value={formData.advancePayment}
            onChange={handleInputChange}
            className="w-full p-2 border rounded"
            required
          />
        </div>

        {/* Is Advance Payment? */}
        <div className="mb-4">
          <label className="block text-gray-700">Is Advance Payment?</label>
          <select
            name="isAdvancePayment"
            value={formData.isAdvancePayment}
            onChange={handleInputChange}
            className="w-full p-2 border rounded"
            required
          >
            <option value={false}>No</option>
            <option value={true}>Yes</option>
          </select>
        </div>

        <button
          type="submit"
          className="bg-blue-500 text-white px-6 py-2 rounded"
          disabled={loading}
        >
          {loading ? 'Creating User...' : 'Create User'}
        </button>
      </form>
    </div>
  );
};

export default CreateUserByAdmin;
