import React, { useState, useEffect } from 'react';
import axios from 'axios';
import * as XLSX from 'xlsx'; // For Excel export
import { saveAs } from 'file-saver'; // For CSV export

const AttendanceList = () => {
  const [attendanceData, setAttendanceData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [filterDate, setFilterDate] = useState('');
  const [filterSubject, setFilterSubject] = useState('');

  useEffect(() => {
    fetchAttendanceData();
  }, []);

  const fetchAttendanceData = async () => {
    try {
      setLoading(true);
      const response = await axios.get('https://api.techsterker.com/api/allattendance');
      setAttendanceData(response.data.attendance || []);
    } catch (error) {
      console.error('Error fetching attendance data:', error);
      setError('Failed to fetch attendance data');
    } finally {
      setLoading(false);
    }
  };

  // Filter attendance data
  const filteredData = attendanceData.filter(record => {
    const matchesDate = filterDate ? 
      record.attendance.some(item => item.date.includes(filterDate)) : true;
    const matchesSubject = filterSubject ? 
      record.attendance.some(item => 
        item.subject.toLowerCase().includes(filterSubject.toLowerCase())
      ) : true;
    return matchesDate && matchesSubject;
  });

  // Get unique subjects for filter
  const uniqueSubjects = [...new Set(
    attendanceData.flatMap(record => 
      record.attendance.map(item => item.subject)
    )
  )];

  // Format date for display
  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('en-IN', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric'
    });
  };

  // Format time for display
  const formatTime = (timing) => {
    return timing;
  };

  // Export to Excel
  const exportToExcel = () => {
    const exportData = filteredData.flatMap(record => 
      record.attendance.map(item => ({
        'Mentor Name': `${record.mentorId.firstName} ${record.mentorId.lastName}`,
        'Mentor Email': record.mentorId.email,
        'Student Name': item.studentName,
        'Enrollment ID': item.enrollmentId,
        'Subject': item.subject,
        'Date': formatDate(item.date),
        'Timing': item.timing,
        'Status': item.status,
        'Record Date': new Date(record.createdAt).toLocaleString()
      }))
    );

    const worksheet = XLSX.utils.json_to_sheet(exportData);
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, 'Attendance');
    
    // Auto-size columns
    const colWidths = [
      { wch: 20 }, // Mentor Name
      { wch: 25 }, // Mentor Email
      { wch: 20 }, // Student Name
      { wch: 15 }, // Enrollment ID
      { wch: 15 }, // Subject
      { wch: 12 }, // Date
      { wch: 15 }, // Timing
      { wch: 10 }, // Status
      { wch: 20 }  // Record Date
    ];
    worksheet['!cols'] = colWidths;

    XLSX.writeFile(workbook, `attendance_records_${new Date().toISOString().split('T')[0]}.xlsx`);
  };

  // Export to CSV
  const exportToCSV = () => {
    const exportData = filteredData.flatMap(record => 
      record.attendance.map(item => ({
        'Mentor Name': `${record.mentorId.firstName} ${record.mentorId.lastName}`,
        'Mentor Email': record.mentorId.email,
        'Student Name': item.studentName,
        'Enrollment ID': item.enrollmentId,
        'Subject': item.subject,
        'Date': formatDate(item.date),
        'Timing': item.timing,
        'Status': item.status,
        'Record Date': new Date(record.createdAt).toLocaleString()
      }))
    );

    const headers = ['Mentor Name', 'Mentor Email', 'Student Name', 'Enrollment ID', 'Subject', 'Date', 'Timing', 'Status', 'Record Date'];
    const csvContent = [
      headers.join(','),
      ...exportData.map(row => 
        headers.map(header => `"${row[header] || ''}"`).join(',')
      )
    ].join('\n');

    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    saveAs(blob, `attendance_records_${new Date().toISOString().split('T')[0]}.csv`);
  };

  // Export to PDF (simple version)
  const exportToPDF = () => {
    const printContent = document.getElementById('attendance-content');
    const originalContents = document.body.innerHTML;
    
    document.body.innerHTML = printContent.innerHTML;
    window.print();
    document.body.innerHTML = originalContents;
    window.location.reload();
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="text-lg">Loading attendance data...</div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded max-w-4xl mx-auto mt-4">
        {error}
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto p-6">
      <div className="bg-white shadow-lg rounded-lg overflow-hidden">
        {/* Header with Export Buttons */}
        <div className="bg-blue-600 text-white px-6 py-4">
          <div className="flex flex-col md:flex-row md:items-center md:justify-between">
            <div>
              <h1 className="text-2xl font-bold">Attendance Records</h1>
              <p className="text-blue-100 mt-1">View and manage student attendance</p>
            </div>
            <div className="flex space-x-2 mt-4 md:mt-0">
              <button
                onClick={exportToExcel}
                className="bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded flex items-center space-x-2"
              >
                <span>📊 Excel</span>
              </button>
              <button
                onClick={exportToCSV}
                className="bg-blue-500 hover:bg-blue-600 text-white px-4 py-2 rounded flex items-center space-x-2"
              >
                <span>📄 CSV</span>
              </button>
              <button
                onClick={exportToPDF}
                className="bg-red-500 hover:bg-red-600 text-white px-4 py-2 rounded flex items-center space-x-2"
              >
                <span>📝 Print</span>
              </button>
            </div>
          </div>
        </div>

        {/* Filters */}
        <div className="bg-gray-50 px-6 py-4 border-b">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Filter by Date
              </label>
              <input
                type="date"
                value={filterDate}
                onChange={(e) => setFilterDate(e.target.value)}
                className="w-full p-2 border border-gray-300 rounded focus:outline-none focus:border-blue-500"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Filter by Subject
              </label>
              <select
                value={filterSubject}
                onChange={(e) => setFilterSubject(e.target.value)}
                className="w-full p-2 border border-gray-300 rounded focus:outline-none focus:border-blue-500"
              >
                <option value="">All Subjects</option>
                {uniqueSubjects.map(subject => (
                  <option key={subject} value={subject}>
                    {subject}
                  </option>
                ))}
              </select>
            </div>
            <div className="flex items-end space-x-2">
              <button
                onClick={() => {
                  setFilterDate('');
                  setFilterSubject('');
                }}
                className="bg-gray-500 text-white px-4 py-2 rounded hover:bg-gray-600 w-full"
              >
                Clear Filters
              </button>
              <button
                onClick={fetchAttendanceData}
                className="bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600 w-full"
              >
                Refresh
              </button>
            </div>
          </div>
        </div>

        {/* Attendance Records */}
        <div id="attendance-content" className="p-6">
          {filteredData.length === 0 ? (
            <div className="text-center py-8 text-gray-500">
              No attendance records found
            </div>
          ) : (
            <div className="space-y-6">
              {filteredData.map((record, recordIndex) => (
                <div key={record._id} className="border border-gray-200 rounded-lg overflow-hidden">
                  {/* Record Header */}
                  <div className="bg-green-50 px-4 py-3 border-b">
                    <div className="flex flex-col md:flex-row md:items-center md:justify-between">
                      <div>
                        <h3 className="font-semibold text-gray-800">
                          Mentor: {record.mentorId.firstName} {record.mentorId.lastName}
                        </h3>
                        <p className="text-sm text-gray-600">
                          Email: {record.mentorId.email} | Phone: {record.mentorId.phoneNumber}
                        </p>
                        <p className="text-sm text-gray-600">
                          Expertise: {record.mentorId.expertise}
                        </p>
                      </div>
                      <div className="text-sm text-gray-500 mt-2 md:mt-0">
                        Created: {new Date(record.createdAt).toLocaleString()}
                      </div>
                    </div>
                  </div>

                  {/* Attendance Table */}
                  <div className="overflow-x-auto">
                    <table className="min-w-full divide-y divide-gray-200">
                      <thead className="bg-gray-50">
                        <tr>
                          <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                            Student
                          </th>
                          <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                            Enrollment ID
                          </th>
                          <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                            Subject
                          </th>
                          <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                            Date
                          </th>
                          <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                            Timing
                          </th>
                          <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                            Status
                          </th>
                        </tr>
                      </thead>
                      <tbody className="bg-white divide-y divide-gray-200">
                        {record.attendance.map((item, itemIndex) => (
                          <tr 
                            key={item._id} 
                            className={itemIndex % 2 === 0 ? 'bg-white' : 'bg-gray-50'}
                          >
                            <td className="px-4 py-3 whitespace-nowrap text-sm font-medium text-gray-900">
                              {item.studentName}
                            </td>
                            <td className="px-4 py-3 whitespace-nowrap text-sm text-gray-500">
                              {item.enrollmentId}
                            </td>
                            <td className="px-4 py-3 whitespace-nowrap text-sm text-gray-500">
                              {item.subject}
                            </td>
                            <td className="px-4 py-3 whitespace-nowrap text-sm text-gray-500">
                              {formatDate(item.date)}
                            </td>
                            <td className="px-4 py-3 whitespace-nowrap text-sm text-gray-500">
                              {formatTime(item.timing)}
                            </td>
                            <td className="px-4 py-3 whitespace-nowrap">
                              <span
                                className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                                  item.status === 'present'
                                    ? 'bg-green-100 text-green-800'
                                    : item.status === 'absent'
                                    ? 'bg-red-100 text-red-800'
                                    : 'bg-yellow-100 text-yellow-800'
                                }`}
                              >
                                {item.status.charAt(0).toUpperCase() + item.status.slice(1)}
                              </span>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>

                  {/* Summary */}
                  <div className="bg-blue-50 px-4 py-2 border-t">
                    <div className="flex justify-between items-center text-sm">
                      <span className="text-gray-600">
                        Total Students: {record.attendance.length}
                      </span>
                      <span className="text-green-600 font-medium">
                        Present: {record.attendance.filter(item => item.status === 'present').length}
                      </span>
                      <span className="text-red-600 font-medium">
                        Absent: {record.attendance.filter(item => item.status === 'absent').length}
                      </span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Overall Statistics */}
        {filteredData.length > 0 && (
          <div className="bg-gray-50 px-6 py-4 border-t">
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4 text-center">
              <div className="bg-white p-4 rounded-lg shadow">
                <div className="text-2xl font-bold text-blue-600">
                  {filteredData.length}
                </div>
                <div className="text-sm text-gray-600">Total Records</div>
              </div>
              <div className="bg-white p-4 rounded-lg shadow">
                <div className="text-2xl font-bold text-green-600">
                  {filteredData.flatMap(record => record.attendance)
                    .filter(item => item.status === 'present').length}
                </div>
                <div className="text-sm text-gray-600">Total Present</div>
              </div>
              <div className="bg-white p-4 rounded-lg shadow">
                <div className="text-2xl font-bold text-red-600">
                  {filteredData.flatMap(record => record.attendance)
                    .filter(item => item.status === 'absent').length}
                </div>
                <div className="text-sm text-gray-600">Total Absent</div>
              </div>
              <div className="bg-white p-4 rounded-lg shadow">
                <div className="text-2xl font-bold text-purple-600">
                  {[...new Set(filteredData.flatMap(record => 
                    record.attendance.map(item => item.studentName)
                  ))].length}
                </div>
                <div className="text-sm text-gray-600">Unique Students</div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default AttendanceList;