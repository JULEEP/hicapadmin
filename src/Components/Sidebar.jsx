import React, { useState } from "react";
import { FaChevronDown } from "react-icons/fa";
import { Link } from "react-router-dom";
import axios from "axios";

const Sidebar = ({ isCollapsed, isMobile }) => {
  const [openDropdown, setOpenDropdown] = useState(null);

  const toggleDropdown = (name) => {
    setOpenDropdown(openDropdown === name ? null : name);
  };

  const handleLogout = async () => {
    try {
      await axios.post(
        "https://credenhealth.onrender.com/api/admin/logout",
        {},
        { withCredentials: true }
      );
      localStorage.removeItem("authToken");
      alert("Logout successful");
      window.location.href = "/";
    } catch (error) {
      console.error("Logout error:", error);
      alert("Logout failed. Please try again.");
    }
  };

  const elements = [
    {
      icon: <i className="ri-dashboard-fill text-white"></i>,
      name: "Dashboard",
      path: "/dashboard",
    },
    {
      icon: <i className="ri-user-fill text-white"></i>,
      name: "Users",
      dropdown: [
        { name: "Get All Users", path: "/users" },
        { name: "Create User", path: "/createuser" },
      ],
    },
    {
      icon: <i className="ri-book-open-fill text-white"></i>,
      name: "Courses",
      dropdown: [
        { name: "Create Course", path: "/create-course" },
        { name: "Get All Courses", path: "/courselist" },
      ],
    },
    {
      icon: <i className="ri-archive-fill text-white"></i>,
      name: "Enrollments",
      dropdown: [
        { name: "Get All Enrollments", path: "/allenrollments" },
        { name: "Create Enrollment", path: "/create-enrollment" },
      ],
    },
    {
      icon: <i className="ri-user-star-fill text-white"></i>,
      name: "Mentors",
      dropdown: [
        { name: "Register Mentor", path: "/creatementor" },
        { name: "All Mentors", path: "/mentorlist" },
      ],
    },
    {
      icon: <i className="ri-layout-fill text-white"></i>,
      name: "Classes",
      dropdown: [
        { name: "Create Live Class", path: "/createliveclass" },
        { name: "Get All LiceClasses", path: "/liveclasses" },
      ],
    },
    {
      icon: <i className="ri-questionnaire-fill text-white"></i>,
      name: "Interviews",
      dropdown: [
        { name: "Schedule Interview", path: "/add-interview" },
        { name: "Get All Interviews", path: "/interviewlist" },
      ],
    },
    {
      icon: <i className="ri-file-fill text-white"></i>,
      name: "Invoices",
      dropdown: [
        { name: "Create Invoice", path: "/create-invoice" },
        { name: "Get All Invoices", path: "/invoices" },
      ],
    },
    {
      icon: <i className="ri-shopping-cart-fill text-white"></i>,
      name: "Orders",
      dropdown: [
        { name: "Get All Orders", path: "/orders" },
        { name: "Create Order", path: "/create-order" },
      ],
    },
    {
      icon: <i className="ri-money-dollar-box-fill text-white"></i>,
      name: "Payments",
      dropdown: [
        { name: "Get All Payments", path: "/paymentlist" },
        { name: "Create Payment", path: "/create-payment" },
      ],
    },
    {
      icon: <i className="ri-logout-box-fill text-white"></i>,
      name: "Logout",
      action: handleLogout,
    },
  ];

  return (
    <div
      className={`transition-all duration-300 ${isMobile ? (isCollapsed ? "w-0" : "w-64") : isCollapsed ? "w-16" : "w-64"
        } h-screen overflow-y-scroll no-scrollbar flex flex-col bg-blue-800`}
    >
      <div className="sticky top-0 p-4 font-bold text-white flex justify-center text-xl">
        <span>Admin Dashboard</span>
      </div>
      <div className="border-b-4 border-gray-800 my-2"></div>

      <nav className={`flex flex-col ${isCollapsed && "items-center"} space-y-4 mt-4`}>
        {elements.map((item, idx) => (
          <div key={idx}>
            {item.dropdown ? (
              <>
                <div
                  className="flex items-center py-3 px-4 font-semibold text-sm text-white mx-4 rounded-lg hover:bg-gray-700 hover:text-[#00B074] duration-300 cursor-pointer"
                  onClick={() => toggleDropdown(item.name)}
                >
                  <span className="text-xl">{item.icon}</span>
                  <span className={`ml-4 ${isCollapsed && !isMobile ? "hidden" : "block"}`}>
                    {item.name}
                  </span>
                  <FaChevronDown
                    className={`ml-auto text-xs transform ${openDropdown === item.name ? "rotate-180" : "rotate-0"
                      }`}
                  />
                </div>
                {openDropdown === item.name && (
                  <ul className="ml-10 text-sm text-white space-y-1">
                    {item.dropdown.map((subItem, subIdx) => (
                      <li key={subIdx}>
                        <Link
                          to={subItem.path}
                          className="flex items-center space-x-2 py-2 font-medium cursor-pointer hover:text-[#00B074] hover:underline"
                          onClick={() => setOpenDropdown(null)}
                        >
                          <span className="text-[#00B074]">•</span>
                          <span>{subItem.name}</span>
                        </Link>
                      </li>
                    ))}
                  </ul>
                )}
              </>
            ) : (
              <Link
                to={item.path}
                className="flex items-center py-3 px-4 font-semibold text-sm text-white mx-4 rounded-lg hover:bg-gray-700 hover:text-[#00B074] duration-300 cursor-pointer"
                onClick={item.action ? item.action : null}
              >
                <span className="text-xl">{item.icon}</span>
                <span className={`ml-4 ${isCollapsed && !isMobile ? "hidden" : "block"}`}>
                  {item.name}
                </span>
              </Link>
            )}
          </div>
        ))}
      </nav>
    </div>
  );
};

export default Sidebar;
