import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useNavigate } from "react-router-dom"; // import navigate

const API_BASE = 'https://api.techsterker.com/api';

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
    isAdvancePayment: false,
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [successMessage, setSuccessMessage] = useState('');
  const [invoiceData, setInvoiceData] = useState(null);

    const navigate = useNavigate(); // hook initialize

  // Fetch all courses on component mount
  useEffect(() => {
    const fetchCourses = async () => {
      try {
        const res = await axios.get(`${API_BASE}/allcourses`);
        if (res.data.success) {
          setCourses(res.data.data);
        }
      } catch (err) {
        setError('Failed to fetch courses');
      }
    };

    fetchCourses();
  }, []);

  // Handle course selection change
  const handleCourseChange = (e) => {
    const courseId = e.target.value;
    const selectedCourse = courses.find(course => course._id === courseId);
    
    setFormData((prevState) => ({
      ...prevState,
      courseId: courseId,
      course: selectedCourse ? selectedCourse.name : ''
    }));
  };

  // Handle input field change
  const handleInputChange = (e) => {
    const { name, value, type } = e.target;
    setFormData((prevState) => ({
      ...prevState,
      [name]: type === 'checkbox' ? e.target.checked : value,
    }));
  };

   // Handle form submission
  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    setSuccessMessage('');
    setInvoiceData(null);

    try {
      const res = await axios.post(`${API_BASE}/userregisterbyadmin`, formData);
      
      if (res.data.success) {
        setSuccessMessage('User registered and invoice created successfully!');
        setInvoiceData(res.data.data);

        // Reset form
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
          isAdvancePayment: false,
        });

        // ✅ Navigate to /users after success
        navigate("/users"); 
      } else {
        setError(res.data.message || 'Failed to register user');
      }
    } catch (err) {
      console.error('Registration error:', err);
      if (err.response && err.response.data) {
        setError(err.response.data.message || 'An error occurred while registering the user');
      } else {
        setError('Network error. Please try again.');
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-4xl mx-auto p-6 bg-white rounded-lg shadow-lg">
      <h2 className="text-2xl font-bold text-blue-900 mb-6 text-center">Create User (Admin)</h2>

      {error && (
        <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4">
          {error}
        </div>
      )}

      {successMessage && (
        <div className="bg-green-100 border border-green-400 text-green-700 px-4 py-3 rounded mb-4">
          {successMessage}
        </div>
      )}

      <form onSubmit={handleSubmit} className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {/* Personal Information */}
        <div className="md:col-span-2">
          <h3 className="text-lg font-semibold text-gray-700 mb-3">Personal Information</h3>
        </div>

        <div>
          <label className="block text-gray-700 text-sm font-bold mb-2">Name *</label>
          <input
            type="text"
            name="name"
            value={formData.name}
            onChange={handleInputChange}
            className="w-full p-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            required
          />
        </div>

        <div>
          <label className="block text-gray-700 text-sm font-bold mb-2">Mobile *</label>
          <input
            type="text"
            name="mobile"
            value={formData.mobile}
            onChange={handleInputChange}
            className="w-full p-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            required
            maxLength="10"
          />
        </div>

        <div>
          <label className="block text-gray-700 text-sm font-bold mb-2">Email *</label>
          <input
            type="email"
            name="email"
            value={formData.email}
            onChange={handleInputChange}
            className="w-full p-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            required
          />
        </div>

        {/* Course Information */}
        <div className="md:col-span-2 mt-4">
          <h3 className="text-lg font-semibold text-gray-700 mb-3">Course Information</h3>
        </div>

        <div className="md:col-span-2">
          <label className="block text-gray-700 text-sm font-bold mb-2">Select Course *</label>
          <select
            name="courseId"
            value={formData.courseId}
            onChange={handleCourseChange}
            className="w-full p-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            required
          >
            <option value="">Select a Course</option>
            {courses.map((course) => (
              <option key={course._id} value={course._id}>
                {course.name} - ₹{course.price?.toLocaleString()}
              </option>
            ))}
          </select>
        </div>

        {/* Educational Background */}
        <div className="md:col-span-2 mt-4">
          <h3 className="text-lg font-semibold text-gray-700 mb-3">Educational Background</h3>
        </div>

        <div>
          <label className="block text-gray-700 text-sm font-bold mb-2">Degree *</label>
          <input
            type="text"
            name="degree"
            value={formData.degree}
            onChange={handleInputChange}
            className="w-full p-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            required
          />
        </div>

        <div>
          <label className="block text-gray-700 text-sm font-bold mb-2">Department *</label>
          <input
            type="text"
            name="department"
            value={formData.department}
            onChange={handleInputChange}
            className="w-full p-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            required
          />
        </div>

        <div>
          <label className="block text-gray-700 text-sm font-bold mb-2">Year of Passing *</label>
          <input
            type="text"
            name="yearOfPassedOut"
            value={formData.yearOfPassedOut}
            onChange={handleInputChange}
            className="w-full p-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            required
          />
        </div>

        {/* Professional Information */}
        <div className="md:col-span-2 mt-4">
          <h3 className="text-lg font-semibold text-gray-700 mb-3">Professional Information</h3>
        </div>

        <div>
          <label className="block text-gray-700 text-sm font-bold mb-2">Company</label>
          <input
            type="text"
            name="company"
            value={formData.company}
            onChange={handleInputChange}
            className="w-full p-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>

        <div>
          <label className="block text-gray-700 text-sm font-bold mb-2">Role</label>
          <input
            type="text"
            name="role"
            value={formData.role}
            onChange={handleInputChange}
            className="w-full p-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>

        <div>
          <label className="block text-gray-700 text-sm font-bold mb-2">Experience</label>
          <input
            type="text"
            name="experience"
            value={formData.experience}
            onChange={handleInputChange}
            className="w-full p-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>

        {/* Payment Information */}
        <div className="md:col-span-2 mt-4">
          <h3 className="text-lg font-semibold text-gray-700 mb-3">Payment Information</h3>
        </div>

        <div className="md:col-span-2">
          <label className="flex items-center">
            <input
              type="checkbox"
              name="isAdvancePayment"
              checked={formData.isAdvancePayment}
              onChange={(e) => setFormData(prev => ({ 
                ...prev, 
                isAdvancePayment: e.target.checked 
              }))}
              className="mr-2"
            />
            <span className="text-gray-700">Advance Payment (₹15,000 + GST)</span>
          </label>
          <p className="text-sm text-gray-600 mt-1">
            {formData.isAdvancePayment 
              ? 'Student will pay ₹15,000 + GST now and remaining amount later' 
              : 'Full payment will be collected'}
          </p>
        </div>

        {/* Submit Button */}
        <div className="md:col-span-2 mt-6">
          <button
            type="submit"
            disabled={loading}
            className="w-full bg-blue-600 hover:bg-blue-700 text-white font-bold py-3 px-4 rounded-lg focus:outline-none focus:shadow-outline disabled:opacity-50"
          >
            {loading ? 'Creating User and Generating Invoice...' : 'Create User & Generate Invoice'}
          </button>
        </div>
      </form>

      {/* Invoice Details */}
      {invoiceData && (
        <div className="mt-8 p-6 border border-green-200 rounded-lg bg-green-50">
          <h3 className="text-xl font-semibold text-green-800 mb-4">User Created Successfully!</h3>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <h4 className="font-semibold text-gray-700">User Login Details:</h4>
              <p><strong>User ID:</strong> {invoiceData.userId}</p>
              <p><strong>Password:</strong> {invoiceData.generatedPassword || 'Sent via Email/SMS'}</p>
              <p><strong>Name:</strong> {invoiceData.name}</p>
              <p><strong>Email:</strong> {invoiceData.email}</p>
              <p><strong>Mobile:</strong> {invoiceData.mobile}</p>
            </div>

            <div>
              <h4 className="font-semibold text-gray-700">Payment Details:</h4>
              <p><strong>Course:</strong> {invoiceData.course}</p>
              <p><strong>Course Price:</strong> ₹{invoiceData.coursePrice?.toLocaleString()}</p>
              <p><strong>GST (5%):</strong> ₹{invoiceData.gstAmount?.toLocaleString()}</p>
              <p><strong>Total Price:</strong> ₹{invoiceData.totalPrice?.toLocaleString()}</p>
              <p><strong>Advance Paid:</strong> ₹{invoiceData.advancePayment?.toLocaleString()}</p>
              <p><strong>Remaining:</strong> ₹{invoiceData.remainingPayment?.toLocaleString()}</p>
            </div>
          </div>

          <div className="mt-4">
            <h4 className="font-semibold text-gray-700">Notifications:</h4>
            <p>Email: {invoiceData.notifications?.emailSent ? '✅ Sent' : '❌ Failed'}</p>
            <p>SMS: {invoiceData.notifications?.smsSent ? '✅ Sent' : '❌ Failed'}</p>
          </div>

          <div className="mt-6">
            <a
              href={invoiceData.invoice?.fullPdfUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-block bg-blue-600 hover:bg-blue-700 text-white px-6 py-2 rounded-lg font-semibold"
            >
              📄 Download Invoice PDF
            </a>
            <p className="text-sm text-gray-600 mt-2">
              Invoice has been sent to student's email and mobile. Student can pay via UPI using the invoice.
            </p>
          </div>
        </div>
      )}
    </div>
  );
};

export default CreateUserByAdmin;