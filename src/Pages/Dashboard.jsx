import { useState, useEffect } from "react";
import {
  FiUsers,
  FiBook,
  FiUserCheck,
  FiDollarSign,
  FiGrid,
  FiPlusCircle,
  FiActivity,
  FiBarChart2,
  FiTrendingUp,
  FiCalendar,
  FiClock,
  FiStar,
  FiVideo,
  FiAward,
} from "react-icons/fi";
import { AreaChart, Area, ResponsiveContainer, BarChart, Bar, XAxis, YAxis, Tooltip } from "recharts";
import { useNavigate } from "react-router-dom";

const Dashboard = () => {
  const [revenueFilter, setRevenueFilter] = useState("weekly");
  const [enrollmentFilter, setEnrollmentFilter] = useState("weekly");
  const [courseFilter, setCourseFilter] = useState("weekly");
  const [topCoursesFilter, setTopCoursesFilter] = useState("weekly");
  const [currentPage, setCurrentPage] = useState(1);
  const [currentMentorPage, setCurrentMentorPage] = useState(1);
  const [dashboardData, setDashboardData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const navigate = useNavigate();

  const studentsPerPage = 5;
  const mentorsPerPage = 5;

  // API integration
  const fetchDashboardData = async () => {
    try {
      setLoading(true);
      setError(null);
      
      const response = await fetch('https://api.techsterker.com/api/dashboard');
      
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      
      const result = await response.json();
      
      if (result.success) {
        setDashboardData(result.data);
      } else {
        throw new Error('API returned unsuccessful response');
      }
    } catch (err) {
      console.error('Error fetching dashboard data:', err);
      setError('Failed to load dashboard data. Please try again later.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDashboardData();
  }, []);

  // Format date for display
  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-IN', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric'
    });
  };

  // Mock chart data since your API doesn't provide detailed chart data
  const getMockChartData = (filter) => {
    const baseData = [
      { name: 'Mon', revenue: 4000, enrolled: 24 },
      { name: 'Tue', revenue: 3000, enrolled: 18 },
      { name: 'Wed', revenue: 2000, enrolled: 12 },
      { name: 'Thu', revenue: 2780, enrolled: 20 },
      { name: 'Fri', revenue: 1890, enrolled: 15 },
      { name: 'Sat', revenue: 2390, enrolled: 17 },
      { name: 'Sun', revenue: 3490, enrolled: 22 },
    ];

    if (filter === 'today') {
      return [{ name: 'Today', revenue: 1200, enrolled: 8 }];
    } else if (filter === 'monthly') {
      return [
        { name: 'Week 1', revenue: 12000, enrolled: 80 },
        { name: 'Week 2', revenue: 15000, enrolled: 95 },
        { name: 'Week 3', revenue: 18000, enrolled: 110 },
        { name: 'Week 4', revenue: 22000, enrolled: 130 },
      ];
    }
    return baseData;
  };

  // Mock course data
  const getMockCourseData = (filter) => {
    return [
      { name: 'JavaScript', enrolled: 45, revenue: 45000 },
      { name: 'React', enrolled: 38, revenue: 38000 },
      { name: 'Node.js', enrolled: 32, revenue: 32000 },
      { name: 'Python', enrolled: 28, revenue: 28000 },
      { name: 'Data Science', enrolled: 25, revenue: 25000 },
      { name: 'Machine Learning', enrolled: 22, revenue: 22000 },
    ];
  };

  // Loading state
  if (loading) {
    return (
      <div className="flex justify-center items-center h-screen">
        <div className="text-xl">Loading dashboard data...</div>
      </div>
    );
  }

  // Error state
  if (error) {
    return (
      <div className="flex justify-center items-center h-screen">
        <div className="text-xl text-red-600 text-center">
          {error}
          <button 
            onClick={fetchDashboardData}
            className="ml-4 bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600"
          >
            Retry
          </button>
        </div>
      </div>
    );
  }

  // No data state
  if (!dashboardData) {
    return (
      <div className="flex justify-center items-center h-screen">
        <div className="text-xl">No data available</div>
      </div>
    );
  }

  // Pagination logic for students
  const indexOfLastStudent = currentPage * studentsPerPage;
  const indexOfFirstStudent = indexOfLastStudent - studentsPerPage;
  const currentStudents = dashboardData.tables?.studentInsightsData?.slice(indexOfFirstStudent, indexOfLastStudent) || [];
  const totalPages = Math.ceil((dashboardData.tables?.studentInsightsData?.length || 0) / studentsPerPage);

  // Pagination logic for mentors
  const indexOfLastMentor = currentMentorPage * mentorsPerPage;
  const indexOfFirstMentor = indexOfLastMentor - mentorsPerPage;
  const currentMentors = dashboardData.tables?.mentorInsightsData?.slice(indexOfFirstMentor, indexOfLastMentor) || [];
  const totalMentorPages = Math.ceil((dashboardData.tables?.mentorInsightsData?.length || 0) / mentorsPerPage);

  return (
    <div className="bg-gray-100 min-h-screen p-6">
      {/* Top Summary Stats */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
        <StatCard icon={FiUsers} label="Total Students" value={dashboardData.totals?.students || 0} color="blue" />
        <StatCard icon={FiBook} label="Total Courses" value={dashboardData.totals?.courses || 0} color="green" />
        <StatCard icon={FiUserCheck} label="Total Mentors" value={dashboardData.totals?.mentors || 0} color="purple" />
        <StatCard icon={FiGrid} label="Total Categories" value={dashboardData.totals?.categories || 0} color="yellow" />
      </div>

      {/* Today's Stats */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 mb-6">
        <StatCard icon={FiPlusCircle} label="Today's Enrollments" value={dashboardData.todayStats?.todaysEnrollments || 0} color="orange" />
        <StatCard icon={FiActivity} label="Completed Courses" value={dashboardData.todayStats?.completedCoursesToday || 0} color="red" />
        <StatCard 
          icon={FiBarChart2} 
          label="Revenue from Courses" 
          value={`₹${(dashboardData.todayStats?.revenueToday || 0).toLocaleString()}`} 
          color="emerald" 
        />
      </div>

      {/* Active Students Summary */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 mb-6">
        <StatCard icon={FiClock} label="Daily Active Students" value={dashboardData.activeStudents?.daily || 0} color="blue" />
        <StatCard icon={FiTrendingUp} label="Weekly Active Students" value={dashboardData.activeStudents?.weekly || 0} color="green" />
        <StatCard icon={FiCalendar} label="Monthly Active Students" value={dashboardData.activeStudents?.monthly || 0} color="purple" />
      </div>

      {/* Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 mb-6">
        {/* Revenue Chart */}
        <div className="bg-white rounded-lg shadow-md p-4">
          <div className="flex justify-between items-center mb-2">
            <h3 className="text-xl font-semibold">Revenue</h3>
            <select
              className="border border-gray-300 rounded px-2 py-1 text-sm"
              value={revenueFilter}
              onChange={(e) => setRevenueFilter(e.target.value)}
            >
              <option value="today">Today</option>
              <option value="weekly">Weekly</option>
              <option value="monthly">Monthly</option>
            </select>
          </div>
          <div className="h-40">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={getMockChartData(revenueFilter)}>
                <defs>
                  <linearGradient id="colorRevenue" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.8} />
                    <stop offset="95%" stopColor="#3b82f6" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <Area
                  type="monotone"
                  dataKey="revenue"
                  stroke="#3b82f6"
                  strokeWidth={2}
                  fill="url(#colorRevenue)"
                  dot={{ fill: '#3b82f6', strokeWidth: 2, r: 4 }}
                />
                <Tooltip />
                <XAxis dataKey="name" />
                <YAxis />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Enrollment Trends Chart */}
        <div className="bg-white rounded-lg shadow-md p-4">
          <div className="flex justify-between items-center mb-2">
            <h3 className="text-xl font-semibold">Course Enrollment Trends</h3>
            <select
              className="border border-gray-300 rounded px-2 py-1 text-sm"
              value={enrollmentFilter}
              onChange={(e) => setEnrollmentFilter(e.target.value)}
            >
              <option value="today">Today</option>
              <option value="weekly">Weekly</option>
              <option value="monthly">Monthly</option>
            </select>
          </div>
          <div className="h-40">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={getMockChartData(enrollmentFilter)}>
                <defs>
                  <linearGradient id="colorEnroll" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#10b981" stopOpacity={0.8} />
                    <stop offset="95%" stopColor="#10b981" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <Area
                  type="monotone"
                  dataKey="enrolled"
                  stroke="#10b981"
                  strokeWidth={2}
                  fill="url(#colorEnroll)"
                  dot={{ fill: '#10b981', strokeWidth: 2, r: 4 }}
                />
                <Tooltip />
                <XAxis dataKey="name" />
                <YAxis />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>

      {/* New Course Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 mb-6">
        {/* Enrollment by Course Chart */}
        <div className="bg-white rounded-lg shadow-md p-4">
          <div className="flex justify-between items-center mb-2">
            <h3 className="text-xl font-semibold">Enrollment by Course</h3>
            <select
              className="border border-gray-300 rounded px-2 py-1 text-sm"
              value={courseFilter}
              onChange={(e) => setCourseFilter(e.target.value)}
            >
              <option value="today">Today</option>
              <option value="weekly">Weekly</option>
              <option value="monthly">Monthly</option>
            </select>
          </div>
          <div className="h-80">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart
                data={getMockCourseData(courseFilter)}
                margin={{ top: 5, right: 5, left: 5, bottom: 5 }}
              >
                <XAxis dataKey="name" tick={{ fontSize: 12 }} />
                <YAxis tick={{ fontSize: 12 }} />
                <Tooltip />
                <Bar
                  dataKey="enrolled"
                  name="Students Enrolled"
                  fill="#8884d8"
                  radius={[4, 4, 0, 0]}
                />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Top 10 Performing Courses Chart */}
        <div className="bg-white rounded-lg shadow-md p-4">
          <div className="flex justify-between items-center mb-2">
            <h3 className="text-xl font-semibold">Top Performing Courses</h3>
            <select
              className="border border-gray-300 rounded px-2 py-1 text-sm"
              value={topCoursesFilter}
              onChange={(e) => setTopCoursesFilter(e.target.value)}
            >
              <option value="today">Today</option>
              <option value="weekly">Weekly</option>
              <option value="monthly">Monthly</option>
            </select>
          </div>
          <div className="h-80">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart
                data={getMockCourseData(topCoursesFilter)}
                margin={{ top: 5, right: 5, left: 5, bottom: 5 }}
              >
                <XAxis dataKey="name" tick={{ fontSize: 12 }} />
                <YAxis yAxisId="left" orientation="left" stroke="#8884d8" tick={{ fontSize: 12 }} />
                <YAxis yAxisId="right" orientation="right" stroke="#82ca9d" tick={{ fontSize: 12 }} />
                <Tooltip />
                <Bar
                  yAxisId="left"
                  dataKey="revenue"
                  name="Revenue (₹)"
                  fill="#8884d8"
                  radius={[4, 4, 0, 0]}
                />
                <Bar
                  yAxisId="right"
                  dataKey="enrolled"
                  name="Students Enrolled"
                  fill="#82ca9d"
                  radius={[4, 4, 0, 0]}
                />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>

      {/* Student Activity Insights Table */}
      <div className="bg-white rounded-lg shadow-md p-4 mt-6">
        <h3 className="text-2xl font-bold mb-4">Student Activity Insights</h3>
        {currentStudents.length > 0 ? (
          <>
            <div className="overflow-x-auto">
              <table className="min-w-full text-sm text-left">
                <thead className="bg-gray-100 text-gray-700">
                  <tr>
                    <th className="px-4 py-2">Name</th>
                    <th className="px-4 py-2">Email</th>
                    <th className="px-4 py-2">Mobile</th>
                    <th className="px-4 py-2">Account Created</th>
                  </tr>
                </thead>
                <tbody>
                  {currentStudents.map((student, idx) => (
                    <tr key={student._id} className="border-t">
                      <td className="px-4 py-2 font-medium">{student.name}</td>
                      <td className="px-4 py-2">{student.email}</td>
                      <td className="px-4 py-2">{student.mobile}</td>
                      <td className="px-4 py-2">{formatDate(student.createdAt)}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {/* Pagination Controls */}
            {totalPages > 1 && (
              <div className="flex justify-end mt-4 space-x-2">
                <button
                  onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))}
                  disabled={currentPage === 1}
                  className="px-3 py-1 rounded bg-gray-200 disabled:opacity-50"
                >
                  Previous
                </button>
                {Array.from({ length: Math.min(totalPages, 5) }, (_, i) => {
                  const pageNumber = i + 1;
                  return (
                    <button
                      key={pageNumber}
                      onClick={() => setCurrentPage(pageNumber)}
                      className={`px-3 py-1 rounded ${currentPage === pageNumber ? "bg-blue-500 text-white" : "bg-gray-200"}`}
                    >
                      {pageNumber}
                    </button>
                  );
                })}
                <button
                  onClick={() => setCurrentPage(prev => Math.min(prev + 1, totalPages))}
                  disabled={currentPage === totalPages}
                  className="px-3 py-1 rounded bg-gray-200 disabled:opacity-50"
                >
                  Next
                </button>
              </div>
            )}
          </>
        ) : (
          <div className="text-center py-4 text-gray-500">No student data available</div>
        )}
      </div>

      {/* Mentor Insights Table */}
      <div className="bg-white rounded-lg shadow-md p-4 mt-8">
        <h3 className="text-2xl font-bold mb-4">Mentor Insights</h3>
        {currentMentors.length > 0 ? (
          <>
            <div className="overflow-x-auto">
              <table className="min-w-full text-sm text-left">
                <thead className="bg-gray-100 text-gray-700">
                  <tr>
                    <th className="px-4 py-2">Expertise</th>
                    <th className="px-4 py-2">Joined Date</th>
                  </tr>
                </thead>
                <tbody>
                  {currentMentors.map((mentor, idx) => (
                    <tr key={mentor._id} className="border-t">
                      <td className="px-4 py-2 font-medium">{mentor.expertise}</td>
                      <td className="px-4 py-2">{formatDate(mentor.createdAt)}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {/* Pagination Controls */}
            {totalMentorPages > 1 && (
              <div className="flex justify-end mt-4 space-x-2">
                <button
                  onClick={() => setCurrentMentorPage(prev => Math.max(prev - 1, 1))}
                  disabled={currentMentorPage === 1}
                  className="px-3 py-1 rounded bg-gray-200 disabled:opacity-50"
                >
                  Previous
                </button>
                {Array.from({ length: Math.min(totalMentorPages, 5) }, (_, i) => {
                  const pageNumber = i + 1;
                  return (
                    <button
                      key={pageNumber}
                      onClick={() => setCurrentMentorPage(pageNumber)}
                      className={`px-3 py-1 rounded ${currentMentorPage === pageNumber ? "bg-blue-500 text-white" : "bg-gray-200"}`}
                    >
                      {pageNumber}
                    </button>
                  );
                })}
                <button
                  onClick={() => setCurrentMentorPage(prev => Math.min(prev + 1, totalMentorPages))}
                  disabled={currentMentorPage === totalMentorPages}
                  className="px-3 py-1 rounded bg-gray-200 disabled:opacity-50"
                >
                  Next
                </button>
              </div>
            )}
          </>
        ) : (
          <div className="text-center py-4 text-gray-500">No mentor data available</div>
        )}
      </div>

      {/* Quick Actions */}
      <div className="bg-white rounded-lg shadow-md p-4 mt-8">
        <h3 className="text-2xl font-bold mb-4">Quick Actions</h3>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <button
            onClick={() => navigate("/create-course")}
            className="bg-purple-600 text-white py-2 px-4 rounded hover:bg-purple-700 transition"
          >
            Create Course
          </button>
          <button
            onClick={() => navigate("/mentor-list")}
            className="bg-purple-600 text-white py-2 px-4 rounded hover:bg-purple-700 transition"
          >
            Manage Mentors
          </button>
          <button
            onClick={() => navigate("/course-modules")}
            className="bg-purple-600 text-white py-2 px-4 rounded hover:bg-purple-700 transition"
          >
            Course Module
          </button>
          <button
            onClick={() => navigate("/courselist")}
            className="bg-purple-600 text-white py-2 px-4 rounded hover:bg-purple-700 transition"
          >
            View Courses
          </button>
        </div>
      </div>
    </div>
  );
};

// Reusable Stat Card Component
const StatCard = ({ icon: Icon, label, value, color }) => {
  const colorClasses = {
    blue: "text-blue-600 bg-blue-100",
    green: "text-green-600 bg-green-100",
    purple: "text-purple-600 bg-purple-100",
    yellow: "text-yellow-600 bg-yellow-100",
    orange: "text-orange-600 bg-orange-100",
    red: "text-red-600 bg-red-100",
    emerald: "text-emerald-600 bg-emerald-100",
  };

  return (
    <div className="bg-white rounded-lg shadow-md p-4 flex items-center justify-between">
      <div className={`p-3 rounded-full ${colorClasses[color]}`}>
        <Icon className="text-2xl" />
      </div>
      <div className="text-right">
        <p className="text-gray-500 text-sm">{label}</p>
        <p className="text-xl font-bold">{value}</p>
      </div>
    </div>
  );
};

export default Dashboard;