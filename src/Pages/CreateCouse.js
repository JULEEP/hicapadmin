import React, { useState } from "react";
import axios from "axios";

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

    // FAQs (JSON format)
    formData.append("faq", JSON.stringify(faq));

    // Features - send as JSON string without images
    const featuresData = features.map(feature => ({
      title: feature.title,
      imageName: feature.imageName
    }));
    formData.append("features", JSON.stringify(featuresData));

    // Reviews - send as JSON string without images
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
    features.forEach((feature, index) => {
      if (feature.image) {
        formData.append("featureImages", feature.image);
      }
    });

    // Reviews images
    reviews.forEach((review, index) => {
      if (review.image) {
        formData.append("reviewImages", review.image);
      }
    });

    // Tools images
    toolsImages.forEach((file) => {
      formData.append("toolsImages", file);
    });

    // Log form data for debugging
    console.log("FormData contents:");
    for (let [key, value] of formData.entries()) {
      console.log(key, value);
    }

    try {
      console.log("Submitting form data...");
      
      const response = await axios.post("http://localhost:5001/api/create-course", formData, {
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

  return (
    <div className="max-w-4xl mx-auto bg-white shadow-md rounded p-6">
      <h2 className="text-2xl font-semibold mb-6 text-blue-900">Create New Course</h2>

      {errorMessage && <p className="text-red-600 mb-4 p-3 bg-red-100 rounded">{errorMessage}</p>}

      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Course Details */}
        <div className="grid grid-cols-1 gap-4">
          <input
            type="text"
            className="w-full p-3 border rounded focus:outline-none focus:border-blue-500"
            placeholder="Course Name *"
            value={name}
            onChange={(e) => setName(e.target.value)}
            required
          />
          <textarea
            className="w-full p-3 border rounded focus:outline-none focus:border-blue-500"
            placeholder="Course Description *"
            rows="3"
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            required
          />
        </div>

        {/* Mode and Category */}
        <div className="grid grid-cols-2 gap-4">
          <select
            className="w-full p-3 border rounded focus:outline-none focus:border-blue-500"
            value={mode}
            onChange={(e) => setMode(e.target.value)}
            required
          >
            <option value="">Select Mode *</option>
            <option value="Online">Online</option>
            <option value="Offline">Offline</option>
            <option value="Hybrid">Hybrid</option>
          </select>
          <input
            type="text"
            className="w-full p-3 border rounded focus:outline-none focus:border-blue-500"
            placeholder="Category *"
            value={category}
            onChange={(e) => setCategory(e.target.value)}
            required
          />
        </div>

        {/* Price and Duration */}
        <div className="grid grid-cols-2 gap-4">
          <input
            type="number"
            className="w-full p-3 border rounded focus:outline-none focus:border-blue-500"
            placeholder="Price *"
            value={price}
            onChange={(e) => setPrice(e.target.value)}
            required
          />
          <input
            type="text"
            className="w-full p-3 border rounded focus:outline-none focus:border-blue-500"
            placeholder="Duration (e.g., 10 weeks) *"
            value={duration}
            onChange={(e) => setDuration(e.target.value)}
            required
          />
        </div>

        {/* Number of Lessons and Students */}
        <div className="grid grid-cols-2 gap-4">
          <input
            type="number"
            className="w-full p-3 border rounded focus:outline-none focus:border-blue-500"
            placeholder="Number of Lessons"
            value={noOfLessons}
            onChange={(e) => setNoOfLessons(e.target.value)}
          />
          <input
            type="number"
            className="w-full p-3 border rounded focus:outline-none focus:border-blue-500"
            placeholder="Number of Students"
            value={noOfStudents}
            onChange={(e) => setNoOfStudents(e.target.value)}
          />
        </div>

        {/* FAQ Section */}
        <div className="border rounded p-4">
          <h3 className="font-semibold text-lg text-blue-900 mb-3">FAQs</h3>
          <div className="grid grid-cols-1 gap-3">
            <input
              type="text"
              className="w-full p-3 border rounded"
              placeholder="FAQ Question"
              value={faqInput}
              onChange={(e) => setFaqInput(e.target.value)}
            />
            <textarea
              className="w-full p-3 border rounded"
              placeholder="FAQ Answer"
              rows="2"
              value={faqAnswer}
              onChange={(e) => setFaqAnswer(e.target.value)}
            />
            <button
              type="button"
              className="bg-green-500 text-white p-2 rounded hover:bg-green-600"
              onClick={handleAddFaq}
            >
              Add FAQ
            </button>
          </div>
          
          {faq.length > 0 && (
            <div className="mt-4">
              <h4 className="font-medium mb-2">Added FAQs ({faq.length}):</h4>
              {faq.map((item, index) => (
                <div key={index} className="flex justify-between items-center bg-gray-100 p-3 rounded mb-2">
                  <div className="flex-1">
                    <div><strong>Q:</strong> {item.question}</div>
                    <div><strong>A:</strong> {item.answer}</div>
                  </div>
                  <button
                    type="button"
                    className="bg-red-500 text-white px-2 py-1 rounded ml-2"
                    onClick={() => handleRemoveFaq(index)}
                  >
                    Remove
                  </button>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Features Section */}
        <div className="border rounded p-4">
          <h3 className="font-semibold text-lg text-blue-900 mb-3">Features</h3>
          <div className="grid grid-cols-1 gap-3">
            <input
              type="text"
              className="w-full p-3 border rounded"
              placeholder="Feature Title *"
              value={featuresInput}
              onChange={(e) => setFeaturesInput(e.target.value)}
            />
            <div>
              <label className="block mb-1">Feature Image *:</label>
              <input
                type="file"
                className="w-full p-3 border rounded"
                onChange={(e) => setFeaturesImage(e.target.files[0])}
                accept="image/*"
                required
              />
              {featuresImage && <span className="text-sm text-green-600">Selected: {featuresImage.name}</span>}
            </div>
            <button
              type="button"
              className="bg-green-500 text-white p-2 rounded hover:bg-green-600"
              onClick={handleAddFeature}
            >
              Add Feature
            </button>
          </div>
          
          {features.length > 0 && (
            <div className="mt-4">
              <h4 className="font-medium mb-2">Added Features ({features.length}):</h4>
              {features.map((item, index) => (
                <div key={index} className="flex justify-between items-center bg-gray-100 p-3 rounded mb-2">
                  <div className="flex-1">
                    <div><strong>Title:</strong> {item.title}</div>
                    <div><strong>Image:</strong> {item.imageName}</div>
                  </div>
                  <button
                    type="button"
                    className="bg-red-500 text-white px-2 py-1 rounded ml-2"
                    onClick={() => handleRemoveFeature(index)}
                  >
                    Remove
                  </button>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Reviews Section */}
        <div className="border rounded p-4">
          <h3 className="font-semibold text-lg text-blue-900 mb-3">Reviews</h3>
          <div className="grid grid-cols-1 gap-3">
            <input
              type="text"
              className="w-full p-3 border rounded"
              placeholder="Reviewer's Name *"
              value={reviewsName}
              onChange={(e) => setReviewsName(e.target.value)}
            />
            <input
              type="number"
              className="w-full p-3 border rounded"
              placeholder="Rating (1-5) *"
              min="1"
              max="5"
              value={reviewsRating}
              onChange={(e) => setReviewsRating(e.target.value)}
            />
            <textarea
              className="w-full p-3 border rounded"
              placeholder="Review Content *"
              rows="2"
              value={reviewsContent}
              onChange={(e) => setReviewsContent(e.target.value)}
            />
            <div>
              <label className="block mb-1">Reviewer Image *:</label>
              <input
                type="file"
                className="w-full p-3 border rounded"
                onChange={(e) => setReviewsImage(e.target.files[0])}
                accept="image/*"
                required
              />
              {reviewsImage && <span className="text-sm text-green-600">Selected: {reviewsImage.name}</span>}
            </div>
            <button
              type="button"
              className="bg-green-500 text-white p-2 rounded hover:bg-green-600"
              onClick={handleAddReview}
            >
              Add Review
            </button>
          </div>
          
          {reviews.length > 0 && (
            <div className="mt-4">
              <h4 className="font-medium mb-2">Added Reviews ({reviews.length}):</h4>
              {reviews.map((item, index) => (
                <div key={index} className="flex justify-between items-center bg-gray-100 p-3 rounded mb-2">
                  <div className="flex-1">
                    <div><strong>Name:</strong> {item.name}</div>
                    <div><strong>Rating:</strong> {item.rating} ⭐</div>
                    <div><strong>Review:</strong> {item.content}</div>
                    <div><strong>Image:</strong> {item.imageName || "No image"}</div>
                  </div>
                  <button
                    type="button"
                    className="bg-red-500 text-white px-2 py-1 rounded ml-2"
                    onClick={() => handleRemoveReview(index)}
                  >
                    Remove
                  </button>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* File Uploads */}
        <div className="border rounded p-4">
          <h3 className="font-semibold text-lg text-blue-900 mb-3">Upload Files</h3>
          <div className="grid grid-cols-1 gap-3">
            <div>
              <label className="block mb-1">Course Image *:</label>
              <input
                type="file"
                className="w-full p-3 border rounded"
                onChange={(e) => setImage(e.target.files[0])}
                accept="image/*"
                required
              />
              {image && <span className="text-sm text-green-600">Selected: {image.name}</span>}
            </div>
            <div>
              <label className="block mb-1">Logo Image:</label>
              <input
                type="file"
                className="w-full p-3 border rounded"
                onChange={(e) => setLogoImage(e.target.files[0])}
                accept="image/*"
              />
              {logoImage && <span className="text-sm text-green-600">Selected: {logoImage.name}</span>}
            </div>
            <div>
              <label className="block mb-1">Course PDF:</label>
              <input
                type="file"
                className="w-full p-3 border rounded"
                onChange={(e) => setPdf(e.target.files[0])}
                accept=".pdf"
              />
              {pdf && <span className="text-sm text-green-600">Selected: {pdf.name}</span>}
            </div>
            <div>
              <label className="block mb-1">Tools Images (Multiple):</label>
              <input
                type="file"
                multiple
                className="w-full p-3 border rounded"
                onChange={(e) => setToolsImages([...e.target.files])}
                accept="image/*"
              />
              {toolsImages.length > 0 && (
                <span className="text-sm text-green-600">Selected: {toolsImages.length} files</span>
              )}
            </div>
          </div>
        </div>

        {/* Submit Button */}
        <button
          type="submit"
          className="w-full bg-blue-500 text-white p-3 rounded mt-4 hover:bg-blue-600 transition duration-200"
        >
          Create Course
        </button>
      </form>
    </div>
  );
};

export default CreateCourse;