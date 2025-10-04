import React, { useState, useEffect } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";

const AddMentorToEnrollment = () => {
  const [enrollments, setEnrollments] = useState([]);
  const [mentors, setMentors] = useState([]);
  const [selectedEnrollment, setSelectedEnrollment] = useState("");
  const [selectedMentor, setSelectedMentor] = useState("");
  const [subjects, setSubjects] = useState("");
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState("");

   const navigate = useNavigate(); // init navigate

  // Fetch enrollments
  useEffect(() => {
    const fetchEnrollments = async () => {
      try {
        const res = await axios.get("https://api.techsterker.com/api/allenrollments");
        setEnrollments(res.data.data || []); // adjust if backend sends {data: [...]}
      } catch (err) {
        console.error("Error fetching enrollments:", err);
      }
    };

    const fetchMentors = async () => {
      try {
        const res = await axios.get("https://api.techsterker.com/api/our-mentor/mentors");
        setMentors(res.data.data || []); // adjust if backend sends {data: [...]}
      } catch (err) {
        console.error("Error fetching mentors:", err);
      }
    };

    fetchEnrollments();
    fetchMentors();
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!selectedEnrollment || !selectedMentor) {
      setMessage("Please select both Enrollment and Mentor.");
      return;
    }

    setLoading(true);
    setMessage("");

    try {
      const res = await axios.post("https://api.techsterker.com/api/mentor/enrollment/add", {
        enrollmentId: selectedEnrollment,
        mentorId: selectedMentor,
        subjects: subjects.split(",").map((s) => s.trim()), // subjects as array
      });

      setMessage("Mentor successfully assigned to enrollment!");
      setSelectedEnrollment("");
      setSelectedMentor("");
      setSubjects("");

      // ✅ Navigate to /mentorswithbatches after success
      navigate("/mentorswithbatches");
    } catch (err) {
      console.error("Error assigning mentor:", err);
      setMessage("Error assigning mentor. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-lg mx-auto p-6 bg-white rounded shadow-md">
      <h2 className="text-xl font-semibold mb-4 text-blue-900 text-center">
        Assign Mentor to Enrollment
      </h2>

      {message && <p className="mb-4 text-center text-red-600">{message}</p>}

      <form onSubmit={handleSubmit} className="space-y-4">
        {/* Enrollment Dropdown */}
       {/* Enrollment Dropdown */}
<div>
  <label className="block mb-1 font-medium text-gray-700">Select Enrollment</label>
  <select
    value={selectedEnrollment}
    onChange={(e) => setSelectedEnrollment(e.target.value)}
    className="w-full p-2 border rounded focus:ring-2 focus:ring-blue-500"
  >
    <option value="">-- Select Enrollment --</option>
    {enrollments.map((enrollment) => (
      <option key={enrollment._id} value={enrollment._id}>
        {enrollment.batchName}{" "}
        {enrollment.courseId?.name ? `(${enrollment.courseId.name})` : ""}
      </option>
    ))}
  </select>
</div>


        {/* Mentor Dropdown */}
        <div>
          <label className="block mb-1 font-medium text-gray-700">Select Mentor</label>
          <select
            value={selectedMentor}
            onChange={(e) => setSelectedMentor(e.target.value)}
            className="w-full p-2 border rounded focus:ring-2 focus:ring-blue-500"
          >
            <option value="">-- Select Mentor --</option>
            {mentors.map((mentor) => (
              <option key={mentor._id} value={mentor._id}>
                {mentor.firstName} {mentor.lastName}
              </option>
            ))}
          </select>
        </div>

        {/* Subjects Input */}
        <div>
          <label className="block mb-1 font-medium text-gray-700">
            Subjects (comma separated)
          </label>
          <input
            type="text"
            value={subjects}
            onChange={(e) => setSubjects(e.target.value)}
            placeholder="e.g. Math, Science, English"
            className="w-full p-2 border rounded focus:ring-2 focus:ring-blue-500"
          />
        </div>

        <button
          type="submit"
          disabled={loading}
          className="w-full bg-blue-900 text-white py-2 rounded hover:bg-blue-800 transition duration-300"
        >
          {loading ? "Assigning..." : "Assign Mentor"}
        </button>
      </form>
    </div>
  );
};

export default AddMentorToEnrollment;
