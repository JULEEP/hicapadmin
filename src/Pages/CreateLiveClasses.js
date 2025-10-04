import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useNavigate } from "react-router-dom";

const API_BASE = 'https://api.techsterker.com/api';

const CreateLiveClass = () => {
  const [enrollments, setEnrollments] = useState([]);
  const [mentors, setMentors] = useState([]);

  const [className, setClassName] = useState('');
  const [selectedEnrollment, setSelectedEnrollment] = useState('');
  const [subjectName, setSubjectName] = useState('');
  const [date, setDate] = useState('');
  const [timing, setTiming] = useState('');
  const [link, setLink] = useState('');
  const [mentorId, setMentorId] = useState('');

  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [successMessage, setSuccessMessage] = useState('');
   const navigate = useNavigate(); // initialize navigate

  // 🔁 Fetch Enrollments
  useEffect(() => {
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
      }
    };

    fetchEnrollments();
  }, []);

  // 🔁 Fetch Mentors
  useEffect(() => {
    const fetchMentors = async () => {
      try {
        const res = await axios.get(`${API_BASE}/our-mentor/mentors`);
        if (res.data.success) {
          setMentors(res.data.data);
        } else {
          setError('Failed to fetch mentors');
        }
      } catch (err) {
        setError('An error occurred while fetching mentors');
        console.error(err);
      }
    };

    fetchMentors();
  }, []);

  const handleCreateLiveClass = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    setSuccessMessage('');

    if (!className || !subjectName || !date || !timing || !link || !selectedEnrollment) {
      setError('All fields are required');
      setLoading(false);
      return;
    }

    try {
      const liveClassData = {
        className,
        enrollmentId: selectedEnrollment,
        mentorId: mentorId || '', // optional
        subjectName,
        date,
        timing,
        link,
      };

      const response = await axios.post(`${API_BASE}/createliveclass`, liveClassData);
      if (response.data.success) {
        setSuccessMessage('Live class created successfully');

        // Reset form
        setClassName('');
        setSubjectName('');
        setDate('');
        setTiming('');
        setLink('');
        setSelectedEnrollment('');
        setMentorId('');

        // ✅ Navigate to /liveclasses
        navigate('/liveclasses');
      } else {
        setError(response.data.message || 'Something went wrong');
      }
    } catch (err) {
      setError('Failed to create live class');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="p-4 border rounded-lg shadow-lg bg-white max-w-3xl mx-auto">
      <h2 className="text-2xl font-semibold text-blue-900 mb-4">Create Live Class</h2>

      {error && <p className="text-red-600 mb-4">{error}</p>}
      {successMessage && <p className="text-green-600 mb-4">{successMessage}</p>}

      <form onSubmit={handleCreateLiveClass}>
        {/* Enrollment Dropdown */}
        <div className="mb-4">
          <label className="block text-gray-700">Select Enrollment</label>
          <select
            id="enrollment"
            value={selectedEnrollment}
            onChange={(e) => setSelectedEnrollment(e.target.value)}
            className="w-full p-2 border rounded"
            required
          >
            <option value="">Select an enrollment</option>
            {enrollments.map((enrollment) => (
              <option key={enrollment._id} value={enrollment._id}>
                {enrollment.batchName} ({enrollment.batchNumber})
              </option>
            ))}
          </select>
        </div>

        {/* Class Name */}
        <div className="mb-4">
          <label htmlFor="className" className="block text-gray-700">Class Name</label>
          <input
            id="className"
            type="text"
            value={className}
            onChange={(e) => setClassName(e.target.value)}
            className="w-full p-2 border rounded"
            placeholder="Enter class name"
            required
          />
        </div>

        {/* Subject Name */}
        <div className="mb-4">
          <label htmlFor="subjectName" className="block text-gray-700">Subject Name</label>
          <input
            id="subjectName"
            type="text"
            value={subjectName}
            onChange={(e) => setSubjectName(e.target.value)}
            className="w-full p-2 border rounded"
            placeholder="Enter subject name"
            required
          />
        </div>

        {/* Date */}
        <div className="mb-4">
          <label htmlFor="date" className="block text-gray-700">Date</label>
          <input
            id="date"
            type="date"
            value={date}
            onChange={(e) => setDate(e.target.value)}
            className="w-full p-2 border rounded"
            required
          />
        </div>

        {/* Timing */}
        <div className="mb-4">
          <label htmlFor="timing" className="block text-gray-700">Timing</label>
          <input
            id="timing"
            type="time"
            value={timing}
            onChange={(e) => setTiming(e.target.value)}
            className="w-full p-2 border rounded"
            required
          />
        </div>

        {/* Class Link */}
        <div className="mb-4">
          <label htmlFor="link" className="block text-gray-700">Class Link</label>
          <input
            id="link"
            type="url"
            value={link}
            onChange={(e) => setLink(e.target.value)}
            className="w-full p-2 border rounded"
            placeholder="Enter class link"
            required
          />
        </div>

        {/* Mentor Dropdown */}
        <div className="mb-4">
          <label htmlFor="mentorId" className="block text-gray-700">Select Mentor (Optional)</label>
          <select
            id="mentorId"
            value={mentorId}
            onChange={(e) => setMentorId(e.target.value)}
            className="w-full p-2 border rounded"
          >
            <option value="">Select a mentor</option>
            {mentors.map((mentor) => (
              <option key={mentor._id} value={mentor._id}>
                {mentor.firstName} {mentor.lastName}
              </option>
            ))}
          </select>
        </div>

        {/* Submit Button */}
        <button
          type="submit"
          className="bg-blue-500 text-white px-6 py-2 rounded"
          disabled={loading}
        >
          {loading ? 'Creating Live Class...' : 'Create Live Class'}
        </button>
      </form>
    </div>
  );
};

export default CreateLiveClass;
