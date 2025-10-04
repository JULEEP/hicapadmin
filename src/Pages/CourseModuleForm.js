import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useParams, useNavigate } from 'react-router-dom';

const CourseModuleForm = () => {
  const { id } = useParams(); // For edit mode
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [enrollments, setEnrollments] = useState([]);
  const [selectedEnrollment, setSelectedEnrollment] = useState(null);
  const [courseData, setCourseData] = useState(null);

  // Form state
  const [formData, setFormData] = useState({
    enrolledId: '',
    modules: [
      {
        moduleName: '',
        subjectName: '',
        moduleDescription: '',
        topics: [
          {
            topicName: '',
            topicDescription: '',
            lessons: [
              {
                lessonName: '',
                name: '',
                lessonDescription: '',
                videoId: '',
                duration: '',
                date: '',
                resources: []
              }
            ]
          }
        ]
      }
    ]
  });

  const [files, setFiles] = useState([]);

  // Fetch enrollments and module data
  useEffect(() => {
    fetchEnrollments();
    if (id) {
      fetchModuleData();
    }
  }, [id]);

  // Fetch all enrollments
  const fetchEnrollments = async () => {
    try {
      const response = await axios.get('https://api.techsterker.com/api/allenrollments');
      setEnrollments(response.data.data || []);
    } catch (error) {
      console.error('Error fetching enrollments:', error);
      setError('Failed to fetch enrollments');
    }
  };

  // Fetch course data when enrollment is selected
  const fetchCourseData = async (courseId) => {
    try {
      const response = await axios.get(`https://api.techsterker.com/api/coursecontroller/${courseId}`);
      setCourseData(response.data.data);
    } catch (error) {
      console.error('Error fetching course data:', error);
    }
  };

  // Fetch module data for editing
  const fetchModuleData = async () => {
    try {
      setLoading(true);
      const response = await axios.get(`https://api.techsterker.com/api/course-modules/${id}`);
      const moduleData = response.data.data;
      setFormData(moduleData);
      
      // Find and set the corresponding enrollment
      const enrollment = enrollments.find(e => e._id === moduleData.enrolledId);
      if (enrollment) {
        setSelectedEnrollment(enrollment);
        fetchCourseData(enrollment.courseId._id);
      }
    } catch (error) {
      setError('Failed to fetch module data');
      console.error('Error fetching module:', error);
    } finally {
      setLoading(false);
    }
  };

  // Handle enrollment selection
  const handleEnrollmentChange = (enrollmentId) => {
    const enrollment = enrollments.find(e => e._id === enrollmentId);
    setSelectedEnrollment(enrollment);
    setFormData(prev => ({ ...prev, enrolledId: enrollmentId }));
    
    if (enrollment && enrollment.courseId) {
      fetchCourseData(enrollment.courseId._id);
    }
  };

  // Handle form input changes
  const handleInputChange = (path, value) => {
    const keys = path.split('.');
    setFormData(prev => {
      const updated = { ...prev };
      let current = updated;
      
      for (let i = 0; i < keys.length - 1; i++) {
        if (!current[keys[i]]) current[keys[i]] = {};
        current = current[keys[i]];
      }
      
      current[keys[keys.length - 1]] = value;
      return updated;
    });
  };

  // Handle array field changes
  const handleArrayChange = (arrayPath, index, field, value) => {
    const keys = arrayPath.split('.');
    setFormData(prev => {
      const updated = JSON.parse(JSON.stringify(prev));
      let current = updated;
      
      for (const key of keys) {
        current = current[key];
      }
      
      current[index][field] = value;
      return updated;
    });
  };

  // Handle resource field changes
  const handleResourceChange = (moduleIndex, topicIndex, lessonIndex, resourceIndex, field, value) => {
    setFormData(prev => {
      const updated = JSON.parse(JSON.stringify(prev));
      updated.modules[moduleIndex].topics[topicIndex].lessons[lessonIndex].resources[resourceIndex][field] = value;
      return updated;
    });
  };

  // Add new module
  const addModule = () => {
    setFormData(prev => ({
      ...prev,
      modules: [
        ...prev.modules,
        {
          moduleName: '',
          subjectName: '',
          moduleDescription: '',
          topics: [
            {
              topicName: '',
              topicDescription: '',
              lessons: [
                {
                  lessonName: '',
                  name: '',
                  lessonDescription: '',
                  videoId: '',
                  duration: '',
                  date: '',
                  resources: []
                }
              ]
            }
          ]
        }
      ]
    }));
  };

  // Add topic to module
  const addTopic = (moduleIndex) => {
    setFormData(prev => {
      const updated = JSON.parse(JSON.stringify(prev));
      updated.modules[moduleIndex].topics.push({
        topicName: '',
        topicDescription: '',
        lessons: [
          {
            lessonName: '',
            name: '',
            lessonDescription: '',
            videoId: '',
            duration: '',
            date: '',
            resources: []
          }
        ]
      });
      return updated;
    });
  };

  // Add lesson to topic
  const addLesson = (moduleIndex, topicIndex) => {
    setFormData(prev => {
      const updated = JSON.parse(JSON.stringify(prev));
      updated.modules[moduleIndex].topics[topicIndex].lessons.push({
        lessonName: '',
        name: '',
        lessonDescription: '',
        videoId: '',
        duration: '',
        date: '',
        resources: []
      });
      return updated;
    });
  };

  // Add resource to lesson
  const addResource = (moduleIndex, topicIndex, lessonIndex) => {
    setFormData(prev => {
      const updated = JSON.parse(JSON.stringify(prev));
      updated.modules[moduleIndex].topics[topicIndex].lessons[lessonIndex].resources.push({
        name: '',
        type: '',
        file: ''
      });
      return updated;
    });
  };

  // Handle resource file upload for specific lesson
  const handleResourceFileChange = (moduleIndex, topicIndex, lessonIndex, resourceIndex, e) => {
    const file = e.target.files[0];
    if (file) {
      // Add file to main files array
      setFiles(prev => [...prev, file]);
      
      // Update resource name with filename
      handleResourceChange(moduleIndex, topicIndex, lessonIndex, resourceIndex, 'name', file.name);
    }
  };

  // Remove items
  const removeModule = (index) => {
    setFormData(prev => ({
      ...prev,
      modules: prev.modules.filter((_, i) => i !== index)
    }));
  };

  const removeTopic = (moduleIndex, topicIndex) => {
    setFormData(prev => {
      const updated = JSON.parse(JSON.stringify(prev));
      updated.modules[moduleIndex].topics = updated.modules[moduleIndex].topics.filter((_, i) => i !== topicIndex);
      return updated;
    });
  };

  const removeLesson = (moduleIndex, topicIndex, lessonIndex) => {
    setFormData(prev => {
      const updated = JSON.parse(JSON.stringify(prev));
      updated.modules[moduleIndex].topics[topicIndex].lessons = 
        updated.modules[moduleIndex].topics[topicIndex].lessons.filter((_, i) => i !== lessonIndex);
      return updated;
    });
  };

  const removeResource = (moduleIndex, topicIndex, lessonIndex, resourceIndex) => {
    setFormData(prev => {
      const updated = JSON.parse(JSON.stringify(prev));
      updated.modules[moduleIndex].topics[topicIndex].lessons[lessonIndex].resources = 
        updated.modules[moduleIndex].topics[topicIndex].lessons[lessonIndex].resources.filter((_, i) => i !== resourceIndex);
      return updated;
    });
  };

  // Handle file uploads
  const handleFileChange = (e) => {
    setFiles([...e.target.files]);
  };

  // Submit form
  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    setSuccess('');

    if (!formData.enrolledId) {
      setError('Please select an enrollment');
      setLoading(false);
      return;
    }

    // Validate required fields
    const hasEmptyFields = formData.modules.some(module => 
      !module.subjectName || 
      !module.moduleName ||
      module.topics.some(topic => 
        !topic.topicName ||
        topic.lessons.some(lesson => 
          !lesson.name || 
          !lesson.lessonName || 
          !lesson.videoId || 
          !lesson.date
        )
      )
    );

    if (hasEmptyFields) {
      setError('Please fill all required fields including subject name, topic name, lesson name, video ID, and date');
      setLoading(false);
      return;
    }

    try {
      const submitData = new FormData();
      submitData.append('data', JSON.stringify(formData));
      submitData.append('enrolledId', formData.enrolledId);
      
      // Append all files (both general files and resource files)
      files.forEach(file => {
        submitData.append('files', file);
      });

      let response;
      if (id) {
        // Update existing module
        response = await axios.put(`https://api.techsterker.com/api/course-modules/${id}`, submitData, {
          headers: { 'Content-Type': 'multipart/form-data' }
        });
      } else {
        // Create new module
        response = await axios.post('https://api.techsterker.com/api/course-modules', submitData, {
          headers: { 'Content-Type': 'multipart/form-data' }
        });
      }

      setSuccess(id ? 'Course module updated successfully!' : 'Course module created successfully!');
      setTimeout(() => {
        navigate('/course-modules');
      }, 2000);
    } catch (error) {
      setError(error.response?.data?.message || 'Failed to save course module');
      console.error('Error saving module:', error);
    } finally {
      setLoading(false);
    }
  };

  if (loading && id) {
    return <div className="text-center py-8">Loading module data...</div>;
  }

  return (
    <div className="max-w-6xl mx-auto bg-white shadow-lg rounded-lg p-6">
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-2xl font-bold text-gray-800">
          {id ? 'Edit Course Module' : 'Create Course Module'}
        </h2>
        <button
          onClick={() => navigate('/course-modules')}
          className="bg-gray-500 text-white px-4 py-2 rounded hover:bg-gray-600"
        >
          Back to List
        </button>
      </div>

      {error && (
        <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4">
          {error}
        </div>
      )}

      {success && (
        <div className="bg-green-100 border border-green-400 text-green-700 px-4 py-3 rounded mb-4">
          {success}
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Enrollment Selection */}
        <div className="bg-blue-50 p-4 rounded-lg">
          <h3 className="text-lg font-semibold mb-3">Select Enrollment</h3>
          <select
            value={formData.enrolledId}
            onChange={(e) => handleEnrollmentChange(e.target.value)}
            className="w-full p-3 border border-gray-300 rounded focus:outline-none focus:border-blue-500"
            required
            disabled={!!id} // Disable in edit mode
          >
            <option value="">Select an Enrollment *</option>
            {enrollments.map((enrollment) => (
              <option key={enrollment._id} value={enrollment._id}>
                {enrollment.batchName} - {enrollment.courseId?.name} (Batch: {enrollment.batchNumber})
              </option>
            ))}
          </select>
        </div>

        {/* Course Information Display */}
        {selectedEnrollment && courseData && (
          <div className="bg-green-50 p-4 rounded-lg">
            <h3 className="text-lg font-semibold mb-3">Course Information</h3>
            <div className="grid grid-cols-2 gap-4 text-sm">
              <div>
                <strong>Course:</strong> {courseData.name}
              </div>
              <div>
                <strong>Duration:</strong> {courseData.duration}
              </div>
              <div>
                <strong>Mode:</strong> {courseData.mode}
              </div>
              <div>
                <strong>Category:</strong> {courseData.category}
              </div>
              <div className="col-span-2">
                <strong>Description:</strong> {courseData.description}
              </div>
            </div>
          </div>
        )}

        {/* Enrollment Information Display */}
        {selectedEnrollment && (
          <div className="bg-yellow-50 p-4 rounded-lg">
            <h3 className="text-lg font-semibold mb-3">Enrollment Information</h3>
            <div className="grid grid-cols-2 gap-4 text-sm">
              <div>
                <strong>Batch:</strong> {selectedEnrollment.batchName}
              </div>
              <div>
                <strong>Start Date:</strong> {new Date(selectedEnrollment.startDate).toLocaleDateString()}
              </div>
              <div>
                <strong>Timings:</strong> {selectedEnrollment.timings}
              </div>
              <div>
                <strong>Status:</strong> {selectedEnrollment.status}
              </div>
            </div>
          </div>
        )}

        {/* Modules Section */}
        <div className="border rounded-lg">
          <div className="bg-blue-50 p-4 rounded-t-lg flex justify-between items-center">
            <h3 className="text-lg font-semibold">Course Modules Structure</h3>
            <button
              type="button"
              onClick={addModule}
              className="bg-blue-500 text-white px-3 py-1 rounded hover:bg-blue-600"
            >
              Add Module
            </button>
          </div>

          <div className="p-4 space-y-4">
            {formData.modules.map((module, moduleIndex) => (
              <div key={moduleIndex} className="border border-gray-200 rounded-lg p-4">
                <div className="flex justify-between items-center mb-3">
                  <h4 className="font-semibold">Module {moduleIndex + 1}</h4>
                  <button
                    type="button"
                    onClick={() => removeModule(moduleIndex)}
                    className="bg-red-500 text-white px-2 py-1 rounded text-sm hover:bg-red-600"
                  >
                    Remove
                  </button>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-3 mb-4">
                  <input
                    type="text"
                    placeholder="Module Name *"
                    value={module.moduleName}
                    onChange={(e) => handleArrayChange('modules', moduleIndex, 'moduleName', e.target.value)}
                    className="w-full p-2 border border-gray-300 rounded"
                    required
                  />
                  <input
                    type="text"
                    placeholder="Subject Name *"
                    value={module.subjectName}
                    onChange={(e) => handleArrayChange('modules', moduleIndex, 'subjectName', e.target.value)}
                    className="w-full p-2 border border-gray-300 rounded"
                    required
                  />
                  <div className="md:col-span-2">
                    <textarea
                      placeholder="Module Description"
                      value={module.moduleDescription}
                      onChange={(e) => handleArrayChange('modules', moduleIndex, 'moduleDescription', e.target.value)}
                      className="w-full p-2 border border-gray-300 rounded"
                      rows="2"
                    />
                  </div>
                </div>

                {/* Topics Section */}
                <div className="ml-4 border-l-2 border-gray-200 pl-4">
                  <div className="flex justify-between items-center mb-3">
                    <h5 className="font-medium">Topics</h5>
                    <button
                      type="button"
                      onClick={() => addTopic(moduleIndex)}
                      className="bg-green-500 text-white px-2 py-1 rounded text-sm hover:bg-green-600"
                    >
                      Add Topic
                    </button>
                  </div>

                  {module.topics.map((topic, topicIndex) => (
                    <div key={topicIndex} className="border border-gray-200 rounded p-3 mb-3">
                      <div className="flex justify-between items-center mb-2">
                        <h6 className="font-medium">Topic {topicIndex + 1}</h6>
                        <button
                          type="button"
                          onClick={() => removeTopic(moduleIndex, topicIndex)}
                          className="bg-red-500 text-white px-2 py-1 rounded text-xs hover:bg-red-600"
                        >
                          Remove
                        </button>
                      </div>

                      <div className="grid grid-cols-1 gap-2 mb-3">
                        <input
                          type="text"
                          placeholder="Topic Name *"
                          value={topic.topicName}
                          onChange={(e) => {
                            const path = `modules.${moduleIndex}.topics`;
                            handleArrayChange(path, topicIndex, 'topicName', e.target.value);
                          }}
                          className="w-full p-2 border border-gray-300 rounded"
                          required
                        />
                        <textarea
                          placeholder="Topic Description"
                          value={topic.topicDescription}
                          onChange={(e) => {
                            const path = `modules.${moduleIndex}.topics`;
                            handleArrayChange(path, topicIndex, 'topicDescription', e.target.value);
                          }}
                          className="w-full p-2 border border-gray-300 rounded"
                          rows="2"
                        />
                      </div>

                      {/* Lessons Section */}
                      <div className="ml-4 border-l-2 border-gray-300 pl-4">
                        <div className="flex justify-between items-center mb-2">
                          <h6 className="font-medium">Lessons</h6>
                          <button
                            type="button"
                            onClick={() => addLesson(moduleIndex, topicIndex)}
                            className="bg-purple-500 text-white px-2 py-1 rounded text-xs hover:bg-purple-600"
                          >
                            Add Lesson
                          </button>
                        </div>

                        {topic.lessons.map((lesson, lessonIndex) => (
                          <div key={lessonIndex} className="border border-gray-200 rounded p-2 mb-2">
                            <div className="flex justify-between items-center mb-2">
                              <h6 className="font-medium">Lesson {lessonIndex + 1}</h6>
                              <button
                                type="button"
                                onClick={() => removeLesson(moduleIndex, topicIndex, lessonIndex)}
                                className="bg-red-500 text-white px-2 py-1 rounded text-xs hover:bg-red-600"
                              >
                                Remove
                              </button>
                            </div>

                            <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
                              <input
                                type="text"
                                placeholder="Lesson Name *"
                                value={lesson.lessonName}
                                onChange={(e) => {
                                  const path = `modules.${moduleIndex}.topics.${topicIndex}.lessons`;
                                  handleArrayChange(path, lessonIndex, 'lessonName', e.target.value);
                                }}
                                className="w-full p-2 border border-gray-300 rounded"
                                required
                              />
                              <input
                                type="text"
                                placeholder="Name *"
                                value={lesson.name}
                                onChange={(e) => {
                                  const path = `modules.${moduleIndex}.topics.${topicIndex}.lessons`;
                                  handleArrayChange(path, lessonIndex, 'name', e.target.value);
                                }}
                                className="w-full p-2 border border-gray-300 rounded"
                                required
                              />
                              <div className="md:col-span-2">
                                <textarea
                                  placeholder="Lesson Description"
                                  value={lesson.lessonDescription}
                                  onChange={(e) => {
                                    const path = `modules.${moduleIndex}.topics.${topicIndex}.lessons`;
                                    handleArrayChange(path, lessonIndex, 'lessonDescription', e.target.value);
                                  }}
                                  className="w-full p-2 border border-gray-300 rounded"
                                  rows="2"
                                />
                              </div>
                              <input
                                type="text"
                                placeholder="YouTube Video ID *"
                                value={lesson.videoId}
                                onChange={(e) => {
                                  const path = `modules.${moduleIndex}.topics.${topicIndex}.lessons`;
                                  handleArrayChange(path, lessonIndex, 'videoId', e.target.value);
                                }}
                                className="w-full p-2 border border-gray-300 rounded"
                                required
                              />
                              <input
                                type="text"
                                placeholder="Duration"
                                value={lesson.duration}
                                onChange={(e) => {
                                  const path = `modules.${moduleIndex}.topics.${topicIndex}.lessons`;
                                  handleArrayChange(path, lessonIndex, 'duration', e.target.value);
                                }}
                                className="w-full p-2 border border-gray-300 rounded"
                              />
                              <input
                                type="date"
                                placeholder="Date *"
                                value={lesson.date}
                                onChange={(e) => {
                                  const path = `modules.${moduleIndex}.topics.${topicIndex}.lessons`;
                                  handleArrayChange(path, lessonIndex, 'date', e.target.value);
                                }}
                                className="w-full p-2 border border-gray-300 rounded"
                                required
                              />
                            </div>

                            {/* Resources Section for Lesson */}
                            <div className="mt-3 ml-4 border-l-2 border-gray-400 pl-4">
                              <div className="flex justify-between items-center mb-2">
                                <h6 className="font-medium text-sm">Resources</h6>
                                <button
                                  type="button"
                                  onClick={() => addResource(moduleIndex, topicIndex, lessonIndex)}
                                  className="bg-indigo-500 text-white px-2 py-1 rounded text-xs hover:bg-indigo-600"
                                >
                                  Add Resource
                                </button>
                              </div>

                              {lesson.resources.map((resource, resourceIndex) => (
                                <div key={resourceIndex} className="border border-gray-200 rounded p-2 mb-2 bg-gray-50">
                                  <div className="flex justify-between items-center mb-2">
                                    <h6 className="font-medium text-xs">Resource {resourceIndex + 1}</h6>
                                    <button
                                      type="button"
                                      onClick={() => removeResource(moduleIndex, topicIndex, lessonIndex, resourceIndex)}
                                      className="bg-red-500 text-white px-2 py-1 rounded text-xs hover:bg-red-600"
                                    >
                                      Remove
                                    </button>
                                  </div>

                                  <div className="grid grid-cols-1 gap-2">
                                    <input
                                      type="text"
                                      placeholder="Resource Name"
                                      value={resource.name}
                                      onChange={(e) => handleResourceChange(moduleIndex, topicIndex, lessonIndex, resourceIndex, 'name', e.target.value)}
                                      className="w-full p-2 border border-gray-300 rounded text-sm"
                                    />
                                    <input
                                      type="text"
                                      placeholder="Resource Type (pdf, doc, etc.)"
                                      value={resource.type}
                                      onChange={(e) => handleResourceChange(moduleIndex, topicIndex, lessonIndex, resourceIndex, 'type', e.target.value)}
                                      className="w-full p-2 border border-gray-300 rounded text-sm"
                                    />
                                    <input
                                      type="file"
                                      onChange={(e) => handleResourceFileChange(moduleIndex, topicIndex, lessonIndex, resourceIndex, e)}
                                      className="w-full p-2 border border-gray-300 rounded text-sm"
                                    />
                                    {resource.file && (
                                      <div className="text-xs text-green-600">
                                        Current file: {resource.file}
                                      </div>
                                    )}
                                  </div>
                                </div>
                              ))}
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* General File Upload */}
        <div className="bg-gray-50 p-4 rounded-lg">
          <h3 className="text-lg font-semibold mb-3">Upload Additional Files</h3>
          <input
            type="file"
            multiple
            onChange={handleFileChange}
            className="w-full p-2 border border-gray-300 rounded"
          />
          <p className="text-sm text-gray-600 mt-1">
            Select additional files to upload
          </p>
        </div>

        {/* Submit Button */}
        <div className="flex justify-end space-x-3">
          <button
            type="button"
            onClick={() => navigate('/course-modules')}
            className="bg-gray-500 text-white px-6 py-2 rounded hover:bg-gray-600"
          >
            Cancel
          </button>
          <button
            type="submit"
            disabled={loading || !formData.enrolledId}
            className="bg-blue-500 text-white px-6 py-2 rounded hover:bg-blue-600 disabled:opacity-50"
          >
            {loading ? 'Saving...' : (id ? 'Update Module' : 'Create Module')}
          </button>
        </div>
      </form>
    </div>
  );
};

export default CourseModuleForm;