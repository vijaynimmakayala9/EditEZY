import React, { useState, useEffect, useRef } from "react";
import axios from "axios";
import { Spinner, Modal, Button, Form } from "react-bootstrap";
import { FiTrash2, FiChevronLeft, FiChevronRight } from "react-icons/fi";

const StoryPage = () => {
  const [stories, setStories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [caption, setCaption] = useState("");
  const [media, setMedia] = useState([]);
  const [uploading, setUploading] = useState(false);
  const [selectedStory, setSelectedStory] = useState(null);
  const [seenStories, setSeenStories] = useState([]);
  const [showUploadModal, setShowUploadModal] = useState(false);
  const [showNavigation, setShowNavigation] = useState({ left: false, right: true });
  
  const storiesContainerRef = useRef(null);
  const userId = localStorage.getItem("userId");

  // Load seenStories from localStorage
  useEffect(() => {
    const savedSeen = JSON.parse(localStorage.getItem("seenStories")) || [];
    setSeenStories(savedSeen);
  }, []);

  // Fetch all stories
  useEffect(() => {
    axios
      .get("https://api.editezy.com/api/users/getAllStories")
      .then((response) => {
        const validStories = response.data.stories.filter(
          (story) => new Date(story.expired_at) > new Date()
        );
        setStories(validStories);
        setLoading(false);
      })
      .catch((error) => {
        console.error("Error fetching stories:", error);
        setLoading(false);
      });
  }, []);

  // Check scroll position to show/hide navigation buttons
  const checkScrollPosition = () => {
    if (storiesContainerRef.current) {
      const { scrollLeft, scrollWidth, clientWidth } = storiesContainerRef.current;
      setShowNavigation({
        left: scrollLeft > 0,
        right: scrollLeft < scrollWidth - clientWidth - 10
      });
    }
  };

  // Scroll stories horizontally
  const scrollStories = (direction) => {
    if (storiesContainerRef.current) {
      const scrollAmount = 300;
      const newPosition = direction === 'left' 
        ? Math.max(0, storiesContainerRef.current.scrollLeft - scrollAmount)
        : storiesContainerRef.current.scrollLeft + scrollAmount;
      
      storiesContainerRef.current.scrollTo({ left: newPosition, behavior: 'smooth' });
      
      // Check position after scrolling
      setTimeout(checkScrollPosition, 300);
    }
  };

  // Handle file input change
  const handleFileChange = (e) => {
    setMedia([...e.target.files]);
  };

  // Handle story upload
  const handleUploadStory = async (e) => {
    e.preventDefault();

    if (!caption || media.length === 0) {
      alert("Please add a caption and select at least one media file.");
      return;
    }

    setUploading(true);

    const formData = new FormData();
    formData.append("caption", caption);
    media.forEach((file) => formData.append("media", file));

    try {
      const response = await axios.post(
        `https://api.editezy.com/api/users/post/${userId}`,
        formData,
        {
          headers: { "Content-Type": "multipart/form-data" },
        }
      );

      alert("Story uploaded successfully!");
      setCaption("");
      setMedia([]);
      setUploading(false);
      setShowUploadModal(false);
      setStories([response.data.story, ...stories]);
    } catch (error) {
      console.error("Error uploading story:", error);
      setUploading(false);
      alert("Error uploading story.");
    }
  };

  // Open story & mark seen
  const handleOpenStory = (story) => {
    setSelectedStory(story);

    if (!seenStories.includes(story._id)) {
      const updatedSeen = [...seenStories, story._id];
      setSeenStories(updatedSeen);
      localStorage.setItem("seenStories", JSON.stringify(updatedSeen));
    }
  };

  // Delete Story (with mediaUrl)
  const handleDeleteStory = async (storyId, mediaUrl) => {
    if (!window.confirm("Are you sure you want to delete this media?")) return;

    try {
      await axios.delete(
        `https://api.editezy.com/api/users/deletestory/${userId}/${storyId}`,
        {
          data: { mediaUrl },
        }
      );

      alert("Media deleted successfully!");

      // Remove media from selectedStory
      const updatedStory = {
        ...selectedStory,
        images: selectedStory.images.filter((img) => img !== mediaUrl),
        videos: selectedStory.videos?.filter((vid) => vid !== mediaUrl) || [],
      };

      // Agar story khali ho gayi to list se hata do
      if (updatedStory.images.length === 0 && updatedStory.videos.length === 0) {
        setStories(stories.filter((s) => s._id !== storyId));
        setSelectedStory(null);
      } else {
        setSelectedStory(updatedStory);
        setStories(
          stories.map((s) => (s._id === storyId ? updatedStory : s))
        );
      }
    } catch (error) {
      console.error("Error deleting story:", error);
      alert("Failed to delete story.");
    }
  };

  if (loading) {
    return (
      <div
        className="d-flex justify-content-center align-items-center"
        style={{ height: "100vh" }}
      >
        <Spinner animation="border" variant="primary" />
      </div>
    );
  }

  // Find user's own story (safe check)
  const userStory = stories.find((story) => story.user?._id === userId);

  return (
    <div className="container-fluid py-4">
      <h2 className="mb-3">Stories</h2>

      {/* Stories Row with Carousel */}
      <div className="position-relative mb-4">
        {showNavigation.left && (
          <Button
            variant="light"
            className="position-absolute start-0 top-50 translate-middle-y rounded-circle p-1 shadow"
            style={{ zIndex: 2, left: "-15px" }}
            onClick={() => scrollStories('left')}
          >
            <FiChevronLeft size={20} />
          </Button>
        )}
        
        <div
          ref={storiesContainerRef}
          className="d-flex align-items-center"
          style={{ 
            overflowX: "auto", 
            gap: "15px",
            scrollBehavior: "smooth",
            scrollbarWidth: "none",
            msOverflowStyle: "none",
            padding: "5px 10px"
          }}
          onScroll={checkScrollPosition}
        >
          {/* User's Story */}
          {userStory ? (
            <div
              className="d-flex flex-column align-items-center"
              style={{ cursor: "pointer", flexShrink: 0 }}
              onClick={() => handleOpenStory(userStory)}
            >
              <img
                src={userStory.images?.[0] || userStory.user?.profileImage}
                alt="story"
                style={{
                  width: "70px",
                  height: "70px",
                  borderRadius: "50%",
                  objectFit: "cover",
                  border: seenStories.includes(userStory._id)
                    ? "3px solid gray"
                    : "3px solid green",
                  padding: "2px",
                }}
              />
              <p className="mt-2 small text-center" style={{ width: "70px" }}>Your Story</p>
            </div>
          ) : (
            // Upload Story Button (only shown if user has no active story)
            <div
              className="d-flex flex-column align-items-center"
              style={{ cursor: "pointer", flexShrink: 0 }}
              onClick={() => setShowUploadModal(true)}
            >
              <div
                style={{
                  width: "70px",
                  height: "70px",
                  borderRadius: "50%",
                  border: "2px dashed #888",
                  display: "flex",
                  justifyContent: "center",
                  alignItems: "center",
                  fontSize: "30px",
                  color: "#888",
                }}
              >
                +
              </div>
              <p className="mt-2 small text-center" style={{ width: "70px" }}>Your Story</p>
            </div>
          )}

          {/* Other Users' Stories */}
          {stories
            .filter((story) => story.user?._id !== userId)
            .map((story) => (
              <div
                key={story._id}
                className="d-flex flex-column align-items-center"
                style={{ cursor: "pointer", flexShrink: 0 }}
                onClick={() => handleOpenStory(story)}
              >
                <img
                  src={story.images?.[0] || story.user?.profileImage}
                  alt="story"
                  style={{
                    width: "70px",
                    height: "70px",
                    borderRadius: "50%",
                    objectFit: "cover",
                    border: seenStories.includes(story._id)
                      ? "3px solid gray"
                      : "3px solid green",
                    padding: "2px",
                  }}
                />
                <p className="mt-2 small text-center" style={{ width: "70px" }}>
                  {story.user?.name && story.user.name.length > 10 
                    ? `${story.user.name.substring(0, 10)}...` 
                    : story.user?.name || "Unknown"}
                </p>
              </div>
            ))}
        </div>

        {showNavigation.right && (
          <Button
            variant="light"
            className="position-absolute end-0 top-50 translate-middle-y rounded-circle p-1 shadow"
            style={{ zIndex: 2, right: "-15px" }}
            onClick={() => scrollStories('right')}
          >
            <FiChevronRight size={20} />
          </Button>
        )}
      </div>

      {/* Upload Story Modal */}
      <Modal
        show={showUploadModal}
        onHide={() => setShowUploadModal(false)}
        centered
      >
        <Modal.Header closeButton>
          <Modal.Title>Upload Story</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <Form onSubmit={handleUploadStory}>
            <Form.Group>
              <Form.Label>Caption</Form.Label>
              <Form.Control
                type="text"
                value={caption}
                onChange={(e) => setCaption(e.target.value)}
                placeholder="Enter a caption"
              />
            </Form.Group>
            <Form.Group className="mt-3">
              <Form.Label>Select Media</Form.Label>
              <Form.Control
                type="file"
                multiple
                onChange={handleFileChange}
                accept="image/*,video/*"
              />
            </Form.Group>
            <Button
              type="submit"
              className="mt-3"
              disabled={uploading}
              variant="primary"
            >
              {uploading ? "Uploading..." : "Upload"}
            </Button>
          </Form>
        </Modal.Body>
      </Modal>

      {/* Story View Modal */}
      <Modal
        show={!!selectedStory}
        onHide={() => setSelectedStory(null)}
        centered
        size="lg"
      >
        {selectedStory && (
          <>
            <Modal.Header closeButton>
              <Modal.Title>{selectedStory.caption}</Modal.Title>
              <span className="text-muted">
                by {selectedStory.user?.name || "Unknown"}
              </span>
            </Modal.Header>

            <Modal.Body className="text-center">
              {/* Images list */}
              {selectedStory.images?.map((img) => (
                <div key={img} className="position-relative mb-3">
                  <img
                    src={img}
                    alt="story"
                    style={{ maxWidth: "100%", borderRadius: "10px" }}
                  />
                  {selectedStory.user?._id === userId && (
                    <FiTrash2
                      size={22}
                      color="red"
                      style={{
                        cursor: "pointer",
                        position: "absolute",
                        top: "10px",
                        right: "10px",
                      }}
                      onClick={() =>
                        handleDeleteStory(selectedStory._id, img)
                      }
                    />
                  )}
                </div>
              ))}

              {/* Videos list */}
              {selectedStory.videos?.map((vid) => (
                <div key={vid} className="position-relative mb-3">
                  <video
                    controls
                    style={{ maxWidth: "100%", borderRadius: "10px" }}
                  >
                    <source src={vid} type="video/mp4" />
                  </video>
                  {selectedStory.user?._id === userId && (
                    <FiTrash2
                      size={22}
                      color="red"
                      style={{
                        cursor: "pointer",
                        position: "absolute",
                        top: "10px",
                        right: "10px",
                      }}
                      onClick={() =>
                        handleDeleteStory(selectedStory._id, vid)
                      }
                    />
                  )}
                </div>
              ))}
            </Modal.Body>

            <Modal.Footer>
              <Button
                variant="secondary"
                onClick={() => setSelectedStory(null)}
              >
                Close
              </Button>
            </Modal.Footer>
          </>
        )}
      </Modal>
    </div>
  );
};

export default StoryPage;