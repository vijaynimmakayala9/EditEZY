
import React, { useState, useEffect, useRef, useCallback } from "react";
import axios from "axios";
import {
  FiTrash2,
  FiChevronLeft,
  FiChevronRight,
  FiPlus,
  FiImage,
  FiUploadCloud,
  FiX,
  FiEye,
  FiClock,
} from "react-icons/fi";

const API_URL = "https://api.editezy.com/api/users";

const StoryPage = () => {
  const [stories, setStories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [caption, setCaption] = useState("");
  const [media, setMedia] = useState([]);
  const [uploading, setUploading] = useState(false);
  const [selectedStory, setSelectedStory] = useState(null);
  const [seenStories, setSeenStories] = useState([]);
  const [showUploadModal, setShowUploadModal] = useState(false);
  const [showNavigation, setShowNavigation] = useState({
    left: false,
    right: false,
  });

  const storiesContainerRef = useRef(null);
  const fileInputRef = useRef(null);
  const userId = localStorage.getItem("userId");

  // Load seen stories
  useEffect(() => {
    try {
      const savedSeen = JSON.parse(
        localStorage.getItem("seenStories") || "[]"
      );
      setSeenStories(Array.isArray(savedSeen) ? savedSeen : []);
    } catch {
      setSeenStories([]);
    }
  }, []);

  // Fetch active stories
  const fetchStories = useCallback(async () => {
    setLoading(true);

    try {
      const response = await axios.get(`${API_URL}/getAllStories`);
      const allStories = Array.isArray(response.data?.stories)
        ? response.data.stories
        : [];

      const validStories = allStories.filter(
        (story) =>
          story.expired_at && new Date(story.expired_at) > new Date()
      );

      setStories(validStories);
    } catch (error) {
      console.error("Error fetching stories:", error);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchStories();
  }, [fetchStories]);

  // Story carousel navigation
  const checkScrollPosition = useCallback(() => {
    const container = storiesContainerRef.current;

    if (!container) return;

    const { scrollLeft, scrollWidth, clientWidth } = container;

    setShowNavigation({
      left: scrollLeft > 5,
      right: scrollLeft + clientWidth < scrollWidth - 5,
    });
  }, []);

  useEffect(() => {
    checkScrollPosition();

    const container = storiesContainerRef.current;
    if (!container) return;

    const observer = new ResizeObserver(checkScrollPosition);
    observer.observe(container);

    return () => observer.disconnect();
  }, [stories.length, checkScrollPosition]);

  const scrollStories = (direction) => {
    const container = storiesContainerRef.current;
    if (!container) return;

    container.scrollBy({
      left: direction === "left" ? -280 : 280,
      behavior: "smooth",
    });
  };

  // File selection
  const handleFileChange = (event) => {
    const selectedFiles = Array.from(event.target.files || []);
    setMedia(selectedFiles);
  };

  // Upload story
  const handleUploadStory = async (event) => {
    event.preventDefault();

    if (!userId) {
      alert("Please log in to upload a story.");
      return;
    }

    if (!caption.trim() || media.length === 0) {
      alert("Please add a caption and select at least one media file.");
      return;
    }

    setUploading(true);

    const formData = new FormData();
    formData.append("caption", caption.trim());

    media.forEach((file) => {
      formData.append("media", file);
    });

    try {
      const response = await axios.post(
        `${API_URL}/post/${userId}`,
        formData,
        {
          headers: {
            "Content-Type": "multipart/form-data",
          },
        }
      );

      alert("Story uploaded successfully!");

      setCaption("");
      setMedia([]);
      setShowUploadModal(false);

      if (fileInputRef.current) {
        fileInputRef.current.value = "";
      }

      if (response.data?.story) {
        setStories((previous) => [
          response.data.story,
          ...previous.filter(
            (story) => story._id !== response.data.story._id
          ),
        ]);
      } else {
        await fetchStories();
      }
    } catch (error) {
      console.error("Error uploading story:", error);
      alert("Error uploading story.");
    } finally {
      setUploading(false);
    }
  };

  // Open story and mark as seen
  const handleOpenStory = (story) => {
    setSelectedStory(story);

    if (!seenStories.includes(story._id)) {
      const updatedSeen = [...seenStories, story._id];

      setSeenStories(updatedSeen);
      localStorage.setItem("seenStories", JSON.stringify(updatedSeen));
    }
  };

  // Delete story media
  const handleDeleteStory = async (storyId, mediaUrl) => {
    if (!window.confirm("Are you sure you want to delete this media?")) {
      return;
    }

    try {
      await axios.delete(
        `${API_URL}/deletestory/${userId}/${storyId}`,
        {
          data: { mediaUrl },
        }
      );

      alert("Media deleted successfully!");

      const updatedStory = {
        ...selectedStory,
        images: (selectedStory.images || []).filter(
          (image) => image !== mediaUrl
        ),
        videos: (selectedStory.videos || []).filter(
          (video) => video !== mediaUrl
        ),
      };

      if (
        updatedStory.images.length === 0 &&
        updatedStory.videos.length === 0
      ) {
        setStories((previous) =>
          previous.filter((story) => story._id !== storyId)
        );
        setSelectedStory(null);
      } else {
        setSelectedStory(updatedStory);

        setStories((previous) =>
          previous.map((story) =>
            story._id === storyId ? updatedStory : story
          )
        );
      }
    } catch (error) {
      console.error("Error deleting story:", error);
      alert("Failed to delete story.");
    }
  };

  const userStory = stories.find(
    (story) => String(story.user?._id) === String(userId)
  );

  const otherStories = stories.filter(
    (story) => String(story.user?._id) !== String(userId)
  );

  if (loading) {
    return (
      <div className="flex min-h-[60vh] items-center justify-center bg-gradient-to-br from-violet-50/70 via-white to-fuchsia-50/70 px-4">
        <div className="text-center">
          <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-3xl bg-gradient-to-br from-violet-600 to-fuchsia-600 shadow-lg shadow-violet-200">
            <span className="h-7 w-7 animate-spin rounded-full border-2 border-white/30 border-t-white" aria-label="Loading" />
          </div>
          <h3 className="text-base font-bold text-slate-800">
            Loading stories
          </h3>
          <p className="mt-1 text-sm text-slate-500">
            Getting the latest updates for you...
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="w-full overflow-hidden bg-gradient-to-br from-violet-50/60 via-white to-fuchsia-50/50 px-3 pt-4 pb-0 sm:px-5 sm:pt-5 lg:px-8">
      <div className="mx-auto max-w-7xl">
        {/* Page heading */}
        <div className="mb-6 flex flex-wrap items-center justify-between gap-3 sm:mb-8">
          <div>
            <div className="mb-2 inline-flex items-center gap-2 rounded-full border border-violet-100 bg-white px-3 py-1.5 shadow-sm">
              <span className="h-2 w-2 rounded-full bg-fuchsia-500" />
              <span className="text-xs font-semibold tracking-wide text-violet-700">
                YOUR COMMUNITY
              </span>
            </div>

            <h1 className="text-2xl font-extrabold tracking-tight text-slate-900 sm:text-3xl lg:text-4xl">
              Stories<span className="text-violet-600">.</span>
            </h1>

            <p className="mt-1 text-sm text-slate-500 sm:text-base">
              Share a moment. Catch up with everyone.
            </p>
          </div>

          <button
            type="button"
            onClick={() => setShowUploadModal(true)}
            className="inline-flex items-center gap-2 rounded-2xl bg-gradient-to-r from-violet-600 to-fuchsia-600 px-4 py-3 text-sm font-bold text-white shadow-lg shadow-violet-200 transition hover:-translate-y-0.5 hover:shadow-xl focus:outline-none focus:ring-2 focus:ring-violet-400 focus:ring-offset-2 sm:px-5"
          >
            <FiPlus size={19} />
            <span className="hidden min-[400px]:inline">Add Story</span>
            <span className="min-[400px]:hidden">Create</span>
          </button>
        </div>

        {/* Stories carousel */}
        <section className="overflow-hidden rounded-3xl border border-violet-100/80 bg-white p-4 shadow-[0_8px_30px_rgba(109,40,217,0.07)] sm:p-6">
          <div className="mb-5 flex items-center justify-between gap-3">
            <div>
              <h2 className="text-base font-bold text-slate-900 sm:text-lg">
                Recent Stories
              </h2>
              <p className="mt-0.5 text-xs text-slate-500 sm:text-sm">
                {stories.length} active{" "}
                {stories.length === 1 ? "story" : "stories"}
              </p>
            </div>

            <div className="flex items-center gap-2">
              <span className="hidden text-xs font-medium text-slate-400 sm:inline">
                Swipe to explore
              </span>

              <button
                type="button"
                aria-label="Scroll stories left"
                onClick={() => scrollStories("left")}
                disabled={!showNavigation.left}
                className="grid h-9 w-9 place-items-center rounded-xl border border-violet-100 bg-violet-50 text-violet-700 transition hover:bg-violet-100 disabled:cursor-not-allowed disabled:opacity-30"
              >
                <FiChevronLeft size={19} />
              </button>

              <button
                type="button"
                aria-label="Scroll stories right"
                onClick={() => scrollStories("right")}
                disabled={!showNavigation.right}
                className="grid h-9 w-9 place-items-center rounded-xl border border-violet-100 bg-violet-50 text-violet-700 transition hover:bg-violet-100 disabled:cursor-not-allowed disabled:opacity-30"
              >
                <FiChevronRight size={19} />
              </button>
            </div>
          </div>

          <div
            ref={storiesContainerRef}
            onScroll={checkScrollPosition}
            className="flex items-start gap-4 overflow-x-auto scroll-smooth pb-2 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden sm:gap-6"
          >
            {/* Your story */}
            <button
              type="button"
              onClick={() =>
                userStory
                  ? handleOpenStory(userStory)
                  : setShowUploadModal(true)
              }
              className="group flex w-[76px] shrink-0 flex-col items-center gap-2.5 text-center focus:outline-none sm:w-[88px]"
            >
              <span
                className={`relative flex h-[76px] w-[76px] items-center justify-center rounded-full p-[3px] transition duration-300 hover:-translate-y-1 hover:shadow-lg hover:shadow-violet-200 sm:h-[88px] sm:w-[88px] ${userStory && seenStories.includes(userStory._id) ? "bg-gray-300" : "bg-gradient-to-br from-violet-600 via-fuchsia-500 to-fuchsia-300"}`}
              >
                <span className="relative flex h-full w-full items-center justify-center overflow-hidden rounded-full border-[3px] border-white bg-violet-50">
                  {userStory ? (
                    <img
                      src={
                        userStory.images?.[0] ||
                        userStory.user?.profileImage ||
                        ""
                      }
                      alt="Your story"
                      onError={(event) => {
                        event.currentTarget.style.display = "none";
                      }}
                      className="h-full w-full object-cover transition duration-300 group-hover:scale-105"
                    />
                  ) : (
                    <span className="flex h-full w-full items-center justify-center bg-gradient-to-br from-violet-100 to-fuchsia-100 text-violet-600">
                      <FiPlus size={30} />
                    </span>
                  )}

                  {userStory && (
                    <span className="absolute bottom-0 right-0 grid h-6 w-6 place-items-center rounded-full border-2 border-white bg-violet-600 text-white">
                      <FiEye size={12} />
                    </span>
                  )}
                </span>
              </span>

              <span className="w-full truncate text-xs font-bold text-slate-800 sm:text-sm">
                Your Story
              </span>
            </button>

            {/* Other stories */}
            {otherStories.map((story) => {
              const isSeen = seenStories.includes(story._id);
              const storyImage =
                story.images?.[0] || story.user?.profileImage || "";

              return (
                <button
                  type="button"
                  key={story._id}
                  onClick={() => handleOpenStory(story)}
                  className="group flex w-[76px] shrink-0 flex-col items-center gap-2.5 text-center focus:outline-none sm:w-[88px]"
                >
                  <span
                    className={`flex h-[76px] w-[76px] items-center justify-center rounded-full p-[3px] transition duration-300 hover:-translate-y-1 hover:shadow-lg hover:shadow-violet-200 sm:h-[88px] sm:w-[88px] ${isSeen ? "bg-gray-300" : "bg-gradient-to-br from-violet-600 via-fuchsia-500 to-fuchsia-300"}`}
                  >
                    <span className="flex h-full w-full items-center justify-center overflow-hidden rounded-full border-[3px] border-white bg-gradient-to-br from-violet-100 to-fuchsia-100">
                      {storyImage ? (
                        <img
                          src={storyImage}
                          alt={`${story.user?.name || "User"}'s story`}
                          onError={(event) => {
                            event.currentTarget.style.display = "none";
                          }}
                          className="h-full w-full object-cover transition duration-300 group-hover:scale-105"
                        />
                      ) : (
                        <span className="text-xl font-bold uppercase text-violet-600">
                          {story.user?.name?.trim()?.charAt(0) || "U"}
                        </span>
                      )}
                    </span>
                  </span>

                  <span className="w-full truncate text-xs font-semibold text-slate-700 sm:text-sm">
                    {story.user?.name || "Unknown"}
                  </span>
                </button>
              );
            })}

            {stories.length === 0 && (
              <div className="flex min-h-28 min-w-0 flex-1 flex-col items-center justify-center px-3 text-center">
                <div className="mb-2 grid h-10 w-10 place-items-center rounded-2xl bg-violet-50 text-violet-500">
                  <FiImage size={20} />
                </div>
                <p className="text-sm font-semibold text-slate-700">
                  No stories yet
                </p>
                <p className="mt-1 text-xs text-slate-400">
                  Be the first to share a moment.
                </p>
              </div>
            )}
          </div>
        </section>
      </div>

      {/* Upload Story Modal */}
      {showUploadModal && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center overflow-y-auto bg-slate-950/60 p-3 backdrop-blur-sm sm:p-5"
          role="dialog"
          aria-modal="true"
          aria-labelledby="create-story-title"
          onMouseDown={(event) => {
            if (event.target === event.currentTarget && !uploading) setShowUploadModal(false);
          }}
        >
          <div className="my-auto w-full max-w-lg overflow-hidden rounded-2xl bg-white shadow-2xl shadow-violet-950/30 sm:rounded-3xl">
        <div className="bg-white">
          <div className="relative overflow-hidden bg-gradient-to-r from-violet-700 via-purple-600 to-fuchsia-600 px-5 py-5 sm:px-7">
            <div className="pointer-events-none absolute -right-8 -top-10 h-32 w-32 rounded-full bg-white/10 blur-xl" />

            <div className="relative flex items-center justify-between gap-3">
              <div className="flex items-center gap-3">
                <div className="grid h-11 w-11 place-items-center rounded-2xl border border-white/20 bg-white/15 text-white">
                  <FiUploadCloud size={23} />
                </div>
                <div>
                  <h3 id="create-story-title" className="text-lg font-bold text-white sm:text-xl">
                    Create a Story
                  </h3>
                  <p className="mt-0.5 text-xs text-violet-100">
                    Share your latest moment
                  </p>
                </div>
              </div>

              <button
                type="button"
                disabled={uploading}
                onClick={() => setShowUploadModal(false)}
                aria-label="Close upload modal"
                className="grid h-9 w-9 place-items-center rounded-xl bg-white/15 text-white transition hover:bg-white/25 disabled:opacity-50"
              >
                <FiX size={20} />
              </button>
            </div>
          </div>

          <div className="p-5 sm:p-7">
            <form onSubmit={handleUploadStory}>
              <div className="mb-4">
                <label htmlFor="story-caption" className="mb-2 block text-sm font-bold text-slate-800">
                  Story caption
                </label>
                <input
                  id="story-caption"
                  type="text"
                  value={caption}
                  onChange={(event) => setCaption(event.target.value)}
                  placeholder="What's happening today?"
                  maxLength={300}
                  required
                  className="w-full rounded-xl border border-slate-200 px-4 py-3 text-sm text-slate-800 outline-none transition placeholder:text-slate-400 focus:border-violet-400 focus:ring-4 focus:ring-violet-100"
                />
              </div>

              <div className="mb-5">
                <label htmlFor="story-media-input" className="mb-2 block text-sm font-bold text-slate-800">
                  Photos and videos
                </label>

                <input
                  ref={fileInputRef}
                  type="file"
                  multiple
                  accept="image/*,video/*"
                  onChange={handleFileChange}
                  required={media.length === 0}
                  className="hidden"
                  id="story-media-input"
                />

                <button
                  type="button"
                  onClick={() => fileInputRef.current?.click()}
                  className="flex w-full flex-col items-center justify-center rounded-2xl border-2 border-dashed border-violet-200 bg-gradient-to-br from-violet-50/80 to-fuchsia-50/80 px-4 py-7 text-center transition hover:border-violet-400 hover:bg-violet-50 sm:py-9"
                >
                  <span className="mb-3 grid h-12 w-12 place-items-center rounded-2xl bg-white text-violet-600 shadow-sm">
                    <FiImage size={24} />
                  </span>
                  <span className="text-sm font-bold text-slate-800">
                    Choose photos or videos
                  </span>
                  <span className="mt-1 text-xs text-slate-500">
                    You can select multiple files
                  </span>
                </button>

                {media.length > 0 && (
                  <div className="mt-3 rounded-xl border border-violet-100 bg-violet-50/60 p-3">
                    <div className="flex items-center justify-between gap-3">
                      <span className="text-sm font-semibold text-violet-800">
                        {media.length} file{media.length === 1 ? "" : "s"}{" "}
                        selected
                      </span>
                      <button
                        type="button"
                        onClick={() => {
                          setMedia([]);
                          if (fileInputRef.current) {
                            fileInputRef.current.value = "";
                          }
                        }}
                        className="text-xs font-semibold text-rose-600 hover:text-rose-700"
                      >
                        Remove all
                      </button>
                    </div>

                    <div className="mt-2 space-y-2">
                      {media.map((file, index) => (
                        <div
                          key={`${file.name}-${file.lastModified}-${index}`}
                          className="flex min-w-0 items-center gap-2 rounded-lg bg-white px-3 py-2"
                        >
                          <FiImage
                            className="shrink-0 text-violet-500"
                            size={16}
                          />
                          <span className="min-w-0 flex-1 truncate text-xs text-slate-700">
                            {file.name}
                          </span>
                          <span className="shrink-0 text-[10px] text-slate-400">
                            {(file.size / (1024 * 1024)).toFixed(1)} MB
                          </span>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>

              <div className="flex flex-col-reverse gap-2 sm:flex-row sm:justify-end">
                <button
                  type="button"
                  disabled={uploading}
                  onClick={() => setShowUploadModal(false)}
                  className="rounded-xl border border-slate-200 px-5 py-2.5 text-sm font-semibold text-slate-600 transition hover:bg-slate-50 disabled:opacity-60"
                >
                  Cancel
                </button>

                <button
                  type="submit"
                  disabled={uploading}
                  className="rounded-xl bg-gradient-to-r from-violet-600 to-fuchsia-600 px-5 py-2.5 text-sm font-bold text-white shadow-md transition hover:from-violet-700 hover:to-fuchsia-700 disabled:cursor-not-allowed disabled:opacity-60"
                >
                  {uploading ? (
                    <span className="inline-flex items-center gap-2">
                      <span className="h-4 w-4 animate-spin rounded-full border-2 border-white/40 border-t-white" aria-hidden="true" />
                      Uploading...
                    </span>
                  ) : (
                    <span className="inline-flex items-center gap-2">
                      <FiUploadCloud size={17} />
                      Upload Story
                    </span>
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>
          </div>
        </div>
      )}

      {/* Story Viewer Modal */}
      {selectedStory && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center overflow-y-auto bg-slate-950/60 p-3 backdrop-blur-sm sm:p-5"
          role="dialog"
          aria-modal="true"
          aria-label="Story viewer"
          onMouseDown={(event) => {
            if (event.target === event.currentTarget) setSelectedStory(null);
          }}
        >
          <div className="my-auto w-full max-w-3xl overflow-hidden rounded-2xl bg-white shadow-2xl shadow-violet-950/30 sm:rounded-3xl">
            {/* Story header */}
            <div className="relative overflow-hidden bg-gradient-to-r from-violet-700 via-purple-600 to-fuchsia-600 px-4 py-4 sm:px-6 sm:py-5">
              <div className="pointer-events-none absolute -right-8 -top-10 h-32 w-32 rounded-full bg-white/10 blur-xl" />

              <div className="relative flex items-center gap-3">
                <div className="flex h-11 w-11 shrink-0 items-center justify-center overflow-hidden rounded-2xl border border-white/30 bg-gradient-to-br from-violet-400 to-fuchsia-500 text-lg font-bold uppercase text-white">
                  {selectedStory.user?.profileImage ? (
                    <img
                      src={selectedStory.user.profileImage}
                      alt=""
                      onError={(event) => {
                        event.currentTarget.style.display = "none";
                        const fallback = event.currentTarget.nextElementSibling;
                        if (fallback) {
                          fallback.classList.remove("hidden");
                          fallback.classList.add("flex");
                        }
                      }}
                      className="h-full w-full object-cover"
                    />
                  ) : null}

                  <span
                    className={`h-full w-full items-center justify-center ${selectedStory.user?.profileImage ? "hidden" : "flex"}`}
                  >
                    {selectedStory.user?.name?.trim()?.charAt(0)?.toUpperCase() || "U"}
                  </span>
                </div>

                <div className="min-w-0 flex-1">
                  <h3 className="truncate text-base font-bold text-white sm:text-lg">
                    {selectedStory.caption || "Story"}
                  </h3>
                  <p className="mt-0.5 truncate text-xs text-violet-100 sm:text-sm">
                    by {selectedStory.user?.name || "Unknown"}
                  </p>
                </div>

                <button
                  type="button"
                  onClick={() => setSelectedStory(null)}
                  aria-label="Close story"
                  className="grid h-9 w-9 shrink-0 place-items-center rounded-xl bg-white/15 text-white transition hover:bg-white/25"
                >
                  <FiX size={21} />
                </button>
              </div>
            </div>

            {/* Story content */}
            <div className="max-h-[65vh] space-y-5 overflow-y-auto bg-gradient-to-b from-violet-50/40 to-white p-4 sm:p-6">
              {(selectedStory.images || []).map((img, index) => (
                <div
                  key={img}
                  className="relative overflow-hidden rounded-2xl border border-violet-100 bg-white shadow-sm"
                >
                  <img
                    src={img}
                    alt={`Story image ${index + 1}`}
                    className="mx-auto max-h-[60vh] w-full object-contain"
                  />

                  {String(selectedStory.user?._id) === String(userId) && (
                    <button
                      type="button"
                      aria-label="Delete image"
                      onClick={() =>
                        handleDeleteStory(selectedStory._id, img)
                      }
                      className="absolute right-3 top-3 grid h-10 w-10 place-items-center rounded-xl border border-white/30 bg-white/95 text-rose-600 shadow-lg transition hover:scale-105 hover:bg-rose-50"
                    >
                      <FiTrash2 size={19} />
                    </button>
                  )}
                </div>
              ))}

              {(selectedStory.videos || []).map((vid, index) => (
                <div
                  key={vid}
                  className="relative overflow-hidden rounded-2xl border border-violet-100 bg-black shadow-sm"
                >
                  <video
                    controls
                    playsInline
                    className="mx-auto max-h-[60vh] w-full"
                  >
                    <source src={vid} />
                    Your browser does not support video playback.
                  </video>

                  {String(selectedStory.user?._id) === String(userId) && (
                    <button
                      type="button"
                      aria-label="Delete video"
                      onClick={() =>
                        handleDeleteStory(selectedStory._id, vid)
                      }
                      className="absolute right-3 top-3 grid h-10 w-10 place-items-center rounded-xl bg-white/95 text-rose-600 shadow-lg transition hover:scale-105 hover:bg-rose-50"
                    >
                      <FiTrash2 size={19} />
                    </button>
                  )}
                </div>
              ))}

              {(!selectedStory.images ||
                selectedStory.images.length === 0) &&
                (!selectedStory.videos ||
                  selectedStory.videos.length === 0) && (
                  <div className="py-12 text-center">
                    <FiImage
                      size={32}
                      className="mx-auto mb-3 text-violet-300"
                    />
                    <p className="text-sm font-semibold text-slate-600">
                      No media available
                    </p>
                  </div>
                )}
            </div>

            {/* Story footer */}
            <div className="flex items-center justify-between gap-3 border-t border-violet-100 bg-white px-4 py-4 sm:px-6">
              <span className="inline-flex items-center gap-1.5 text-xs text-slate-400">
                <FiClock size={14} />
                Active story
              </span>

              <button
                type="button"
                onClick={() => setSelectedStory(null)}
                className="rounded-xl bg-gradient-to-r from-violet-600 to-fuchsia-600 px-5 py-2.5 text-sm font-semibold text-white shadow-sm transition hover:from-violet-700 hover:to-fuchsia-700"
              >
                Close Story
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default StoryPage;
