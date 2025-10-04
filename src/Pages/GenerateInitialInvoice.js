import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useNavigate } from "react-router-dom";

const API_BASE = 'https://api.techsterker.com/api';

const GenerateInitialInvoice = () => {
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
    totalAmount: '',
    upiId: '',
    paymentMode: 'UPI'
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [successMessage, setSuccessMessage] = useState('');
  const [invoiceData, setInvoiceData] = useState(null);


    const navigate = useNavigate(); // initialize navigate

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

  // Handle course selection to auto-fill course name and price
  const handleCourseChange = (e) => {
    const selectedCourseId = e.target.value;
    const selectedCourse = courses.find(course => course._id === selectedCourseId);
    
    if (selectedCourse) {
      setFormData(prevState => ({
        ...prevState,
        courseId: selectedCourseId,
        course: selectedCourse.name,
        totalAmount: selectedCourse.price || ''
      }));
    }
  };

  // Handle input field change
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
    setInvoiceData(null);

    // Validation
    if (!formData.name || !formData.mobile || !formData.course || !formData.totalAmount) {
      setError('Name, mobile, course, and total amount are required fields');
      setLoading(false);
      return;
    }

    try {
      const res = await axios.post(`${API_BASE}/generateinvoice`, formData);
      if (res.data.success) {
        setSuccessMessage('Initial invoice generated successfully!');
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
          totalAmount: '',
          upiId: '',
          paymentMode: 'UPI'
        });

        // ✅ Navigate to /invoicelist
        navigate('/invoicelist');
      } else {
        setError(res.data.message || 'Failed to generate invoice');
      }
    } catch (err) {
      console.error('Invoice generation error:', err);
      setError(err.response?.data?.message || 'An error occurred while generating the invoice');
    } finally {
      setLoading(false);
    }
  };


  return (
    <div className="p-6 border rounded-lg shadow-lg bg-white max-w-4xl mx-auto">
      <h2 className="text-2xl font-bold text-blue-900 mb-6">Generate Initial Invoice (Admin)</h2>
      <p className="text-gray-600 mb-6">Create and send invoice to user for payment</p>

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

      {/* Invoice Success Details */}
      {invoiceData && (
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-6">
          <h3 className="text-lg font-semibold text-blue-800 mb-3">✅ Invoice Generated Successfully</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <p><strong>User ID:</strong> {invoiceData.userId}</p>
              <p><strong>Name:</strong> {invoiceData.name}</p>
              <p><strong>Course:</strong> {invoiceData.course}</p>
              <p><strong>Total Amount Due:</strong> ₹{invoiceData.totalAmountDue?.toLocaleString()}</p>
            </div>
            <div>
              <p><strong>Payment Status:</strong> <span className="text-red-600">{invoiceData.paymentStatus}</span></p>
              <p><strong>UPI ID:</strong> {invoiceData.paymentInstructions?.upiId}</p>
              <p><strong>Due Date:</strong> {new Date(invoiceData.invoice?.dueDate).toLocaleDateString()}</p>
            </div>
          </div>
          {invoiceData.invoice?.fullPdfUrl && (
            <div className="mt-3">
              <a 
                href={invoiceData.invoice.fullPdfUrl} 
                target="_blank" 
                rel="noopener noreferrer"
                className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700 inline-block"
              >
                📄 View Invoice PDF
              </a>
            </div>
          )}
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Personal Information */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Name */}
          <div>
            <label className="block text-gray-700 font-medium mb-2">Student Name *</label>
            <input
              type="text"
              name="name"
              value={formData.name}
              onChange={handleInputChange}
              className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              required
              placeholder="Enter student name"
            />
          </div>

          {/* Mobile */}
          <div>
            <label className="block text-gray-700 font-medium mb-2">Mobile Number *</label>
            <input
              type="text"
              name="mobile"
              value={formData.mobile}
              onChange={handleInputChange}
              className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              required
              placeholder="Enter mobile number"
            />
          </div>
        </div>

        {/* Email */}
        <div>
          <label className="block text-gray-700 font-medium mb-2">Email Address</label>
          <input
            type="email"
            name="email"
            value={formData.email}
            onChange={handleInputChange}
            className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            placeholder="Enter email address"
          />
        </div>

        {/* Course Information */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Course Selection */}
          <div>
            <label className="block text-gray-700 font-medium mb-2">Select Course *</label>
            <select
              name="courseId"
              value={formData.courseId}
              onChange={handleCourseChange}
              className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              required
            >
              <option value="">Select a Course</option>
              {courses.map((course) => (
                <option key={course._id} value={course._id}>
                  {course.name} {course.price ? `(₹${course.price.toLocaleString()})` : ''}
                </option>
              ))}
            </select>
          </div>

          {/* Total Amount */}
          <div>
            <label className="block text-gray-700 font-medium mb-2">Total Amount (₹) *</label>
            <input
              type="number"
              name="totalAmount"
              value={formData.totalAmount}
              onChange={handleInputChange}
              className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              required
              placeholder="Enter total amount"
            />
          </div>
        </div>

        {/* Educational Information */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {/* Degree */}
          <div>
            <label className="block text-gray-700 font-medium mb-2">Degree</label>
            <input
              type="text"
              name="degree"
              value={formData.degree}
              onChange={handleInputChange}
              className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              placeholder="e.g., B.Tech, B.Sc"
            />
          </div>

          {/* Department */}
          <div>
            <label className="block text-gray-700 font-medium mb-2">Department</label>
            <input
              type="text"
              name="department"
              value={formData.department}
              onChange={handleInputChange}
              className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              placeholder="e.g., Computer Science"
            />
          </div>

          {/* Year of Passed Out */}
          <div>
            <label className="block text-gray-700 font-medium mb-2">Year of Passing</label>
            <input
              type="text"
              name="yearOfPassedOut"
              value={formData.yearOfPassedOut}
              onChange={handleInputChange}
              className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              placeholder="e.g., 2023"
            />
          </div>
        </div>

        {/* Professional Information */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {/* Company */}
          <div>
            <label className="block text-gray-700 font-medium mb-2">Company</label>
            <input
              type="text"
              name="company"
              value={formData.company}
              onChange={handleInputChange}
              className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              placeholder="Current company"
            />
          </div>

          {/* Role */}
          <div>
            <label className="block text-gray-700 font-medium mb-2">Role</label>
            <input
              type="text"
              name="role"
              value={formData.role}
              onChange={handleInputChange}
              className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              placeholder="Current role"
            />
          </div>

          {/* Experience */}
          <div>
            <label className="block text-gray-700 font-medium mb-2">Experience (Years)</label>
            <input
              type="text"
              name="experience"
              value={formData.experience}
              onChange={handleInputChange}
              className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              placeholder="e.g., 2 years"
            />
          </div>
        </div>

        {/* Payment Information */}
        <div className="bg-gray-50 p-6 rounded-lg">
          <h3 className="text-lg font-semibold text-gray-800 mb-4">Payment Instructions</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* UPI ID */}
            <div>
              <label className="block text-gray-700 font-medium mb-2">UPI ID for Payment</label>
              <input
                type="text"
                name="upiId"
                value={formData.upiId}
                onChange={handleInputChange}
                className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                placeholder="e.g., yourname@upi"
              />
            </div>

            {/* Payment Mode */}
            <div>
              <label className="block text-gray-700 font-medium mb-2">Payment Mode</label>
              <select
                name="paymentMode"
                value={formData.paymentMode}
                onChange={handleInputChange}
                className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              >
                <option value="UPI">UPI Transfer</option>
                <option value="Bank Transfer">Bank Transfer</option>
                <option value="Cash">Cash</option>
                <option value="Other">Other</option>
              </select>
            </div>
          </div>
          <p className="text-sm text-gray-600 mt-3">
            Note: This information will be included in the invoice for the user to make payment.
          </p>
        </div>

        {/* Submit Button */}
        <div className="flex justify-center">
          <button
            type="submit"
            disabled={loading}
            className="bg-blue-600 text-white px-8 py-3 rounded-lg font-semibold hover:bg-blue-700 focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed transition duration-200"
          >
            {loading ? (
              <span className="flex items-center">
                <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                </svg>
                Generating Invoice...
              </span>
            ) : (
              '📄 Generate Initial Invoice'
            )}
          </button>
        </div>
      </form>
    </div>
  );
};

export default GenerateInitialInvoice;