import React, { useState } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";

const CreateCourse = () => {
  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [mode, setMode] = useState("");
  const [category, setCategory] = useState("");
  const [price, setPrice] = useState("");
  const [duration, setDuration] = useState("");
  const [faqInput, setFaqInput] = useState("");
  const [faqAnswer, setFaqAnswer] = useState("");
  const [faq, setFaq] = useState([]);
  const [featuresInput, setFeaturesInput] = useState("");
  const [featuresImage, setFeaturesImage] = useState(null);
  const [features, setFeatures] = useState([]);
  const [reviewsContent, setReviewsContent] = useState("");
  const [reviewsName, setReviewsName] = useState("");
  const [reviewsRating, setReviewsRating] = useState("");
  const [reviewsImage, setReviewsImage] = useState(null);
  const [reviews, setReviews] = useState([]);
  const [image, setImage] = useState(null);
  const [logoImage, setLogoImage] = useState(null);
  const [pdf, setPdf] = useState(null);
  const [toolsImages, setToolsImages] = useState([]);
  const [errorMessage, setErrorMessage] = useState("");
  const [noOfLessons, setNoOfLessons] = useState("");
  const [noOfStudents, setNoOfStudents] = useState("");

  const navigate = useNavigate();

  // File upload handler with cloud icon style
  const FileUploadField = ({ label, accept, multiple = false, onChange, value, required = false }) => {
    const [isDragging, setIsDragging] = useState(false);
    
    const handleDragOver = (e) => {
      e.preventDefault();
      setIsDragging(true);
    };
    
    const handleDragLeave = (e) => {
      e.preventDefault();
      setIsDragging(false);
    };
    
    const handleDrop = (e) => {
      e.preventDefault();
      setIsDragging(false);
      const files = e.dataTransfer.files;
      if (files.length > 0) {
        if (multiple) {
          onChange([...files]);
        } else {
          onChange(files[0]);
        }
      }
    };

    const getFileName = () => {
      if (multiple && Array.isArray(value)) {
        return `${value.length} files selected`;
      }
      if (value) {
        return value.name;
      }
      return "No file chosen";
    };

    return (
      <div className="mb-4">
        <label className="block text-sm font-medium text-gray-700 mb-2">
          {label} {required && <span className="text-red-500">*</span>}
        </label>
        
        <div
          className={`border-2 border-dashed rounded-lg p-6 text-center cursor-pointer transition-all duration-200 ${
            isDragging 
              ? 'border-blue-500 bg-blue-50' 
              : 'border-gray-300 hover:border-blue-400 hover:bg-blue-50'
          }`}
          onDragOver={handleDragOver}
          onDragLeave={handleDragLeave}
          onDrop={handleDrop}
          onClick={() => document.getElementById(`file-${label.replace(/\s+/g, '-')}`).click()}
        >
          {/* Cloud Icon */}
          <div className="flex justify-center mb-3">
            <svg className="w-12 h-12 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} 
                    d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" />
            </svg>
          </div>
          
          <div className="flex flex-col items-center justify-center">
            <p className="text-sm text-gray-600 mb-1">
              <span className="text-blue-600 font-medium">Click to upload</span> or drag and drop
            </p>
            <p className="text-xs text-gray-500">
              {accept === "image/*" ? "PNG, JPG, GIF up to 10MB" : 
               accept === ".pdf" ? "PDF files only" : 
               "Any file type"}
            </p>
          </div>
          
          <input
            id={`file-${label.replace(/\s+/g, '-')}`}
            type="file"
            className="hidden"
            accept={accept}
            multiple={multiple}
            onChange={(e) => onChange(multiple ? [...e.target.files] : e.target.files[0])}
            required={required}
          />
        </div>
        
        {/* Selected file info */}
        {value && (
          <div className="mt-2 p-3 bg-green-50 border border-green-200 rounded-lg">
            <div className="flex items-center text-green-700">
              <svg className="w-5 h-5 mr-2" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
              </svg>
              <span className="text-sm font-medium">{getFileName()}</span>
            </div>
          </div>
        )}
      </div>
    );
  };

  // Add FAQ
  const handleAddFaq = () => {
    if (faqInput.trim() !== "" && faqAnswer.trim() !== "") {
      setFaq([...faq, { question: faqInput.trim(), answer: faqAnswer.trim() }]);
      setFaqInput("");
      setFaqAnswer("");
    }
  };

  // Add Feature
  const handleAddFeature = () => {
    if (featuresInput.trim() !== "" && featuresImage) {
      setFeatures([
        ...features,
        { 
          title: featuresInput.trim(), 
          image: featuresImage,
          imageName: featuresImage.name 
        }
      ]);
      setFeaturesInput("");
      setFeaturesImage(null);
    }
  };

  // Add Review
  const handleAddReview = () => {
    if (reviewsContent.trim() !== "" && reviewsName.trim() !== "" && reviewsRating !== "") {
      const newReview = {
        name: reviewsName.trim(),
        rating: parseInt(reviewsRating),
        content: reviewsContent.trim(),
        image: reviewsImage,
        imageName: reviewsImage ? reviewsImage.name : null
      };
      
      setReviews([...reviews, newReview]);
      setReviewsContent("");
      setReviewsName("");
      setReviewsRating("");
      setReviewsImage(null);
    }
  };

  // Remove items
  const handleRemoveFaq = (index) => {
    const updatedFaq = faq.filter((_, i) => i !== index);
    setFaq(updatedFaq);
  };

  const handleRemoveFeature = (index) => {
    const updatedFeatures = features.filter((_, i) => i !== index);
    setFeatures(updatedFeatures);
  };

  const handleRemoveReview = (index) => {
    const updatedReviews = reviews.filter((_, i) => i !== index);
    setReviews(updatedReviews);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    // Validation
    if (!name || !description || !mode || !category || !price || !duration || !image) {
      setErrorMessage("Please fill in all required fields (*)");
      return;
    }

    const formData = new FormData();
    
    // Basic course data
    formData.append("name", name);
    formData.append("description", description);
    formData.append("mode", mode);
    formData.append("category", category);
    formData.append("price", price);
    formData.append("duration", duration);
    formData.append("noOfLessons", noOfLessons);
    formData.append("noOfStudents", noOfStudents);

    // FAQs
    formData.append("faq", JSON.stringify(faq));

    // Features
    const featuresData = features.map(feature => ({
      title: feature.title,
      imageName: feature.imageName
    }));
    formData.append("features", JSON.stringify(featuresData));

    // Reviews
    const reviewsData = reviews.map(review => ({
      name: review.name,
      rating: review.rating,
      content: review.content,
      imageName: review.imageName
    }));
    formData.append("reviews", JSON.stringify(reviewsData));

    // Main files
    if (image) formData.append("image", image);
    if (logoImage) formData.append("logoImage", logoImage);
    if (pdf) formData.append("pdf", pdf);
    
    // Features images
    features.forEach((feature) => {
      if (feature.image) {
        formData.append("featureImages", feature.image);
      }
    });

    // Reviews images
    reviews.forEach((review) => {
      if (review.image) {
        formData.append("reviewImages", review.image);
      }
    });

    // Tools images
    toolsImages.forEach((file) => {
      formData.append("toolsImages", file);
    });

    try {
      console.log("Submitting form data...");
      
      const response = await axios.post("https://api.techsterker.com/api/create-course", formData, {
        headers: { 
          "Content-Type": "multipart/form-data" 
        },
      });
      
      alert("Course created successfully!");
      console.log("Response:", response.data);

      // Reset form
      setName("");
      setDescription("");
      setMode("");
      setCategory("");
      setPrice("");
      setDuration("");
      setFaq([]);
      setFeatures([]);
      setReviews([]);
      setImage(null);
      setLogoImage(null);
      setPdf(null);
      setToolsImages([]);
      setNoOfLessons("");
      setNoOfStudents("");
      setErrorMessage("");

      // Navigate to /courselist after success
      navigate("/courselist");

    } catch (error) {
      console.error("Error creating course:", error);
      if (error.response) {
        console.error("Server response:", error.response.data);
        setErrorMessage(`Error: ${error.response.data.message || "Failed to create course"}`);
      } else {
        setErrorMessage("Failed to create course. Please try again.");
      }
    }
  };

  // Section wrapper component for consistent styling
  const Section = ({ title, children, className = "" }) => (
    <div className={`bg-white rounded-xl shadow-sm border border-gray-200 p-6 mb-6 ${className}`}>
      <h3 className="text-xl font-semibold text-gray-800 mb-4 pb-2 border-b border-gray-100 flex items-center">
        <svg className="w-5 h-5 text-blue-600 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
        </svg>
        {title}
      </h3>
      {children}
    </div>
  );

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 py-8 px-4">
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <div className="text-center mb-8">
          <h1 className="text-3xl md:text-4xl font-bold text-gray-800 mb-3">
            Create New Course
          </h1>
          <p className="text-gray-600 max-w-2xl mx-auto">
            Fill in the details below to create an amazing learning experience for your students
          </p>
        </div>

        {errorMessage && (
          <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-xl flex items-center">
            <svg className="w-5 h-5 text-red-500 mr-3" fill="currentColor" viewBox="0 0 20 20">
              <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
            </svg>
            <span className="text-red-700">{errorMessage}</span>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Course Details Section */}
          <Section title="Course Details">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Course Name <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  className="w-full p-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200"
                  placeholder="Enter course name"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  required
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Category <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  className="w-full p-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200"
                  placeholder="e.g., Web Development"
                  value={category}
                  onChange={(e) => setCategory(e.target.value)}
                  required
                />
              </div>
            </div>

            <div className="mt-4">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Course Description <span className="text-red-500">*</span>
              </label>
              <textarea
                className="w-full p-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200"
                placeholder="Describe what students will learn in this course..."
                rows="4"
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                required
              />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Mode <span className="text-red-500">*</span>
                </label>
                <select
                  className="w-full p-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200"
                  value={mode}
                  onChange={(e) => setMode(e.target.value)}
                  required
                >
                  <option value="">Select Mode</option>
                  <option value="Online">Online</option>
                  <option value="Offline">Offline</option>
                  <option value="Hybrid">Hybrid</option>
                </select>
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Duration <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  className="w-full p-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200"
                  placeholder="e.g., 10 weeks"
                  value={duration}
                  onChange={(e) => setDuration(e.target.value)}
                  required
                />
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Price ($) <span className="text-red-500">*</span>
                </label>
                <input
                  type="number"
                  className="w-full p-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200"
                  placeholder="0.00"
                  value={price}
                  onChange={(e) => setPrice(e.target.value)}
                  required
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Number of Lessons
                </label>
                <input
                  type="number"
                  className="w-full p-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200"
                  placeholder="e.g., 25"
                  value={noOfLessons}
                  onChange={(e) => setNoOfLessons(e.target.value)}
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Number of Students
                </label>
                <input
                  type="number"
                  className="w-full p-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200"
                  placeholder="e.g., 150"
                  value={noOfStudents}
                  onChange={(e) => setNoOfStudents(e.target.value)}
                />
              </div>
            </div>
          </Section>

          {/* FAQ Section */}
          <Section title="Frequently Asked Questions">
            <div className="space-y-4">
              <div className="grid grid-cols-1 gap-3">
                <input
                  type="text"
                  className="w-full p-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder="Enter question..."
                  value={faqInput}
                  onChange={(e) => setFaqInput(e.target.value)}
                />
                <textarea
                  className="w-full p-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder="Enter answer..."
                  rows="3"
                  value={faqAnswer}
                  onChange={(e) => setFaqAnswer(e.target.value)}
                />
                <button
                  type="button"
                  className="bg-green-500 text-white p-3 rounded-lg hover:bg-green-600 transition duration-200 font-medium flex items-center justify-center"
                  onClick={handleAddFaq}
                >
                  <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                  </svg>
                  Add FAQ
                </button>
              </div>
              
              {faq.length > 0 && (
                <div className="mt-6">
                  <h4 className="font-semibold text-gray-700 mb-3">Added FAQs ({faq.length})</h4>
                  <div className="space-y-3">
                    {faq.map((item, index) => (
                      <div key={index} className="flex justify-between items-start bg-blue-50 p-4 rounded-lg border border-blue-100">
                        <div className="flex-1">
                          <div className="flex items-start mb-2">
                            <span className="font-semibold text-blue-700 mr-2">Q:</span>
                            <span className="text-gray-800">{item.question}</span>
                          </div>
                          <div className="flex items-start">
                            <span className="font-semibold text-green-600 mr-2">A:</span>
                            <span className="text-gray-700">{item.answer}</span>
                          </div>
                        </div>
                        <button
                          type="button"
                          className="bg-red-100 text-red-600 p-2 rounded-lg hover:bg-red-200 transition duration-200 ml-4"
                          onClick={() => handleRemoveFaq(index)}
                        >
                          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                          </svg>
                        </button>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </Section>

          {/* Features Section */}
          <Section title="Course Features">
            <div className="space-y-4">
              <div className="grid grid-cols-1 gap-3">
                <input
                  type="text"
                  className="w-full p-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder="Feature title..."
                  value={featuresInput}
                  onChange={(e) => setFeaturesInput(e.target.value)}
                />
                
                <FileUploadField
                  label="Feature Image"
                  accept="image/*"
                  onChange={setFeaturesImage}
                  value={featuresImage}
                  required={true}
                />
                
                <button
                  type="button"
                  className="bg-green-500 text-white p-3 rounded-lg hover:bg-green-600 transition duration-200 font-medium flex items-center justify-center"
                  onClick={handleAddFeature}
                >
                  <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                  </svg>
                  Add Feature
                </button>
              </div>
              
              {features.length > 0 && (
                <div className="mt-6">
                  <h4 className="font-semibold text-gray-700 mb-3">Added Features ({features.length})</h4>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {features.map((item, index) => (
                      <div key={index} className="bg-white border border-gray-200 rounded-lg p-4 shadow-sm">
                        <div className="flex justify-between items-start">
                          <div className="flex-1">
                            <h5 className="font-semibold text-gray-800 mb-2">{item.title}</h5>
                            <p className="text-sm text-gray-600 flex items-center">
                              <svg className="w-4 h-4 mr-1 text-green-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                              </svg>
                              {item.imageName}
                            </p>
                          </div>
                          <button
                            type="button"
                            className="bg-red-100 text-red-600 p-2 rounded-lg hover:bg-red-200 transition duration-200 ml-2"
                            onClick={() => handleRemoveFeature(index)}
                          >
                            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                            </svg>
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </Section>

          {/* Reviews Section */}
          <Section title="Student Reviews">
            <div className="space-y-4">
              <div className="grid grid-cols-1 gap-3">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                  <input
                    type="text"
                    className="w-full p-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    placeholder="Reviewer name..."
                    value={reviewsName}
                    onChange={(e) => setReviewsName(e.target.value)}
                  />
                  <input
                    type="number"
                    className="w-full p-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    placeholder="Rating (1-5)"
                    min="1"
                    max="5"
                    value={reviewsRating}
                    onChange={(e) => setReviewsRating(e.target.value)}
                  />
                </div>
                
                <textarea
                  className="w-full p-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder="Review content..."
                  rows="3"
                  value={reviewsContent}
                  onChange={(e) => setReviewsContent(e.target.value)}
                />
                
                <FileUploadField
                  label="Reviewer Image"
                  accept="image/*"
                  onChange={setReviewsImage}
                  value={reviewsImage}
                  required={true}
                />
                
                <button
                  type="button"
                  className="bg-green-500 text-white p-3 rounded-lg hover:bg-green-600 transition duration-200 font-medium flex items-center justify-center"
                  onClick={handleAddReview}
                >
                  <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                  </svg>
                  Add Review
                </button>
              </div>
              
              {reviews.length > 0 && (
                <div className="mt-6">
                  <h4 className="font-semibold text-gray-700 mb-3">Added Reviews ({reviews.length})</h4>
                  <div className="space-y-4">
                    {reviews.map((item, index) => (
                      <div key={index} className="bg-white border border-gray-200 rounded-lg p-4 shadow-sm">
                        <div className="flex justify-between items-start">
                          <div className="flex-1">
                            <div className="flex items-center justify-between mb-2">
                              <h5 className="font-semibold text-gray-800">{item.name}</h5>
                              <div className="flex items-center">
                                {[...Array(5)].map((_, i) => (
                                  <svg
                                    key={i}
                                    className={`w-4 h-4 ${i < item.rating ? 'text-yellow-400' : 'text-gray-300'}`}
                                    fill="currentColor"
                                    viewBox="0 0 20 20"
                                  >
                                    <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                                  </svg>
                                ))}
                              </div>
                            </div>
                            <p className="text-gray-600 mb-2">{item.content}</p>
                            {item.imageName && (
                              <p className="text-sm text-gray-500 flex items-center">
                                <svg className="w-4 h-4 mr-1 text-green-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                                </svg>
                                {item.imageName}
                              </p>
                            )}
                          </div>
                          <button
                            type="button"
                            className="bg-red-100 text-red-600 p-2 rounded-lg hover:bg-red-200 transition duration-200 ml-4"
                            onClick={() => handleRemoveReview(index)}
                          >
                            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                            </svg>
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </Section>

          {/* File Uploads Section */}
          <Section title="Course Media">
            <div className="grid grid-cols-1 gap-6">
              <FileUploadField
                label="Course Thumbnail Image"
                accept="image/*"
                onChange={setImage}
                value={image}
                required={true}
              />
              
              <FileUploadField
                label="Course Logo"
                accept="image/*"
                onChange={setLogoImage}
                value={logoImage}
              />
              
              <FileUploadField
                label="Course PDF/Syllabus"
                accept=".pdf"
                onChange={setPdf}
                value={pdf}
              />
              
              <FileUploadField
                label="Tools & Software Images"
                accept="image/*"
                multiple={true}
                onChange={setToolsImages}
                value={toolsImages}
              />
            </div>
          </Section>

          {/* Submit Button */}
          <div className="flex justify-center pt-4">
            <button
              type="submit"
              className="bg-gradient-to-r from-blue-600 to-indigo-700 text-white py-4 px-8 rounded-xl hover:from-blue-700 hover:to-indigo-800 transition-all duration-200 font-semibold text-lg shadow-lg hover:shadow-xl transform hover:-translate-y-1 flex items-center"
            >
              <svg className="w-6 h-6 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
              </svg>
              Create Course
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default CreateCourse;