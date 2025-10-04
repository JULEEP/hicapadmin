import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { useNavigate } from "react-router-dom";

const API_BASE = 'https://api.techsterker.com/api';

const AddInterview = () => {
  const [enrollments, setEnrollments] = useState([]);
  const [selectedEnrollment, setSelectedEnrollment] = useState('');
  const [companyName, setCompanyName] = useState('');
  const [role, setRole] = useState('');
  const [experience, setExperience] = useState('');
  const [location, setLocation] = useState('');

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [successMessage, setSuccessMessage] = useState('');


  const navigate = useNavigate(); // initialize navigate

  // 🔁 Fetch all enrollments
  useEffect(() => {
    const fetchEnrollments = async () => {
      try {
        const res = await axios.get(`${API_BASE}/allenrollments`);
        if (res.data.success) {
          setEnrollments(res.data.data);
        } else {
          setError('Failed to load enrollments');
        }
      } catch (err) {
        console.error('Error fetching enrollments:', err);
        setError('Error fetching enrollments');
      }
    };

    fetchEnrollments();
  }, []);

  // 🧾 Handle Interview Submit
  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    setSuccessMessage('');

    if (!selectedEnrollment || !companyName || !role || !experience || !location) {
      setError('All fields are required.');
      setLoading(false);
      return;
    }

    try {
      const payload = {
        enrolledId: selectedEnrollment,
        companyName,
        role,
        experience,
        location
      };

      const res = await axios.post(`${API_BASE}/add-interview`, payload);
      if (res.data.success) {
        setSuccessMessage(`Interview(s) created for ${res.data.data.length} user(s)`);

        // Reset form
        setCompanyName('');
        setRole('');
        setExperience('');
        setLocation('');
        setSelectedEnrollment('');

        // ✅ Navigate to /interviewlist
        navigate('/interviewlist');
      } else {
        setError(res.data.message || 'Failed to create interviews');
      }
    } catch (err) {
      console.error('Interview creation error:', err);
      setError('Server error while creating interviews');
    } finally {
      setLoading(false);
    }
  };


  return (
    <div className="max-w-2xl mx-auto p-6 bg-white border shadow-lg rounded-lg">
      <h2 className="text-2xl font-bold text-blue-800 mb-6">Add Interview</h2>

      {error && <p className="text-red-600 mb-4">{error}</p>}
      {successMessage && <p className="text-green-600 mb-4">{successMessage}</p>}

      <form onSubmit={handleSubmit}>
        {/* Enrollment Selection */}
        <div className="mb-4">
          <label className="block text-gray-700 mb-1">Select Enrollment</label>
          <select
            value={selectedEnrollment}
            onChange={(e) => setSelectedEnrollment(e.target.value)}
            className="w-full p-2 border rounded"
            required
          >
            <option value="">-- Select Batch --</option>
            {enrollments.map((enrollment) => (
              <option key={enrollment._id} value={enrollment._id}>
                {enrollment.batchName} ({enrollment.batchNumber})
              </option>
            ))}
          </select>
        </div>

        {/* Company Name */}
        <div className="mb-4">
          <label className="block text-gray-700 mb-1">Company Name</label>
          <input
            type="text"
            value={companyName}
            onChange={(e) => setCompanyName(e.target.value)}
            className="w-full p-2 border rounded"
            placeholder="Enter company name"
            required
          />
        </div>

        {/* Role */}
        <div className="mb-4">
          <label className="block text-gray-700 mb-1">Role</label>
          <input
            type="text"
            value={role}
            onChange={(e) => setRole(e.target.value)}
            className="w-full p-2 border rounded"
            placeholder="Enter role for interview"
            required
          />
        </div>

        {/* Experience */}
        <div className="mb-4">
          <label className="block text-gray-700 mb-1">Experience</label>
          <input
            type="text"
            value={experience}
            onChange={(e) => setExperience(e.target.value)}
            className="w-full p-2 border rounded"
            placeholder="e.g. 0-1 years, 2+ years"
            required
          />
        </div>

        {/* Location */}
        <div className="mb-6">
          <label className="block text-gray-700 mb-1">Location</label>
          <input
            type="text"
            value={location}
            onChange={(e) => setLocation(e.target.value)}
            className="w-full p-2 border rounded"
            placeholder="Enter job location"
            required
          />
        </div>

        {/* Submit Button */}
        <button
          type="submit"
          className="bg-blue-600 text-white px-6 py-2 rounded hover:bg-blue-700 disabled:opacity-50"
          disabled={loading}
        >
          {loading ? 'Creating Interview...' : 'Create Interview'}
        </button>
      </form>
    </div>
  );
};

export default AddInterview;
