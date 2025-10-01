import React, { useState, useEffect } from 'react';
import axios from 'axios';

const API_BASE = 'http://localhost:5001';

const RegisterMentor = () => {
  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    email: '',
    phoneNumber: '',
    password: '',
    confirmpassword: '',
    expertise: '',
    assignedCourses: '',
  });

  const [courses, setCourses] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [successMessage, setSuccessMessage] = useState('');

  useEffect(() => {
    const fetchCourses = async () => {
      try {
        const res = await axios.get(`${API_BASE}/api/allcourses`);
        if (res.data.success) {
          setCourses(res.data.data);
        }
      } catch (err) {
        console.error('Error fetching courses:', err);
      }
    };

    fetchCourses();
  }, []);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    setSuccessMessage('');

    const {
      firstName,
      lastName,
      email,
      phoneNumber,
      password,
      confirmpassword,
      expertise,
      assignedCourses,
    } = formData;

    if (!firstName || !lastName || !email || !phoneNumber || !password || !confirmpassword || !assignedCourses) {
      setError('All required fields must be filled.');
      setLoading(false);
      return;
    }

    if (password !== confirmpassword) {
      setError('Passwords do not match.');
      setLoading(false);
      return;
    }

    try {
      const response = await axios.post(`${API_BASE}/api/our-mentor/mentor/register`, {
        firstName,
        lastName,
        email,
        phoneNumber,
        password,
        confirmpassword,
        expertise,
        assignedCourses,
      });

      if (response.data.success) {
        setSuccessMessage('Mentor registered successfully!');
        setFormData({
          firstName: '',
          lastName: '',
          email: '',
          phoneNumber: '',
          password: '',
          confirmpassword: '',
          expertise: '',
          assignedCourses: '',
        });
      } else {
        setError(response.data.message || 'Something went wrong.');
      }
    } catch (err) {
      console.error(err);
      setError(err.response?.data?.message || 'Server error. Try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="p-6 max-w-3xl mx-auto bg-white shadow-lg rounded">
      <h2 className="text-2xl font-bold mb-4 text-blue-900">Register Mentor</h2>

      {error && <p className="text-red-600 mb-4">{error}</p>}
      {successMessage && <p className="text-green-600 mb-4">{successMessage}</p>}

      <form onSubmit={handleSubmit}>

        <div className="flex gap-4 mb-4">
          <div className="w-1/2">
            <label className="block text-gray-700">First Name *</label>
            <input
              type="text"
              name="firstName"
              value={formData.firstName}
              onChange={handleChange}
              className="w-full p-2 border rounded"
              required
            />
          </div>
          <div className="w-1/2">
            <label className="block text-gray-700">Last Name *</label>
            <input
              type="text"
              name="lastName"
              value={formData.lastName}
              onChange={handleChange}
              className="w-full p-2 border rounded"
              required
            />
          </div>
        </div>

        <div className="mb-4">
          <label className="block text-gray-700">Email *</label>
          <input
            type="email"
            name="email"
            value={formData.email}
            onChange={handleChange}
            className="w-full p-2 border rounded"
            required
          />
        </div>

        <div className="mb-4">
          <label className="block text-gray-700">Phone Number *</label>
          <input
            type="tel"
            name="phoneNumber"
            value={formData.phoneNumber}
            onChange={handleChange}
            className="w-full p-2 border rounded"
            required
          />
        </div>

        <div className="flex gap-4 mb-4">
          <div className="w-1/2">
            <label className="block text-gray-700">Password *</label>
            <input
              type="password"
              name="password"
              value={formData.password}
              onChange={handleChange}
              className="w-full p-2 border rounded"
              required
            />
          </div>
          <div className="w-1/2">
            <label className="block text-gray-700">Confirm Password *</label>
            <input
              type="password"
              name="confirmpassword"
              value={formData.confirmpassword}
              onChange={handleChange}
              className="w-full p-2 border rounded"
              required
            />
          </div>
        </div>

        <div className="mb-4">
          <label className="block text-gray-700">Expertise</label>
          <input
            type="text"
            name="expertise"
            value={formData.expertise}
            onChange={handleChange}
            className="w-full p-2 border rounded"
            placeholder="E.g., Math, Science, etc."
          />
        </div>

        <div className="mb-4">
          <label className="block text-gray-700">Assigned Course *</label>
          <select
            name="assignedCourses"
            value={formData.assignedCourses}
            onChange={handleChange}
            className="w-full p-2 border rounded"
            required
          >
            <option value="">Select a course</option>
            {courses.map((course) => (
              <option key={course._id} value={course._id}>
                {course.name}
              </option>
            ))}
          </select>
        </div>

        <button
          type="submit"
          className="bg-blue-600 text-white px-6 py-2 rounded"
          disabled={loading}
        >
          {loading ? 'Registering...' : 'Register Mentor'}
        </button>
      </form>
    </div>
  );
};

export default RegisterMentor;
