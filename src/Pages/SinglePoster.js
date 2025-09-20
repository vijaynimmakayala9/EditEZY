import React, { useEffect, useState, useRef, useCallback } from "react";
import { useParams } from "react-router-dom";
import axios from "axios";
import Navbar from "./Navbar";

const SinglePoster = () => {
  const { posterId } = useParams();
  const [poster, setPoster] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [selectedText, setSelectedText] = useState(null);
  const [selectedOverlay, setSelectedOverlay] = useState(null);
  const [isDragging, setIsDragging] = useState(false);
  const [isResizing, setIsResizing] = useState(false);
  const [dragOffset, setDragOffset] = useState({ x: 0, y: 0 });
  const [resizeDirection, setResizeDirection] = useState("");
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const canvasRef = useRef(null);
  const canvasContainerRef = useRef(null);

  useEffect(() => {
    const fetchPoster = async () => {
      try {
        setLoading(true);
        const response = await axios.get(
          `https://api.editezy.com/api/poster/singlecanvasposters/${posterId}`
        );
        setPoster(response.data.poster || null);
        setLoading(false);
      } catch (err) {
        console.error("Error fetching poster:", err);
        setError("Failed to load poster");
        setLoading(false);
      }
    };

    fetchPoster();
  }, [posterId]);

  // Use useCallback to memoize the render function
  const renderPoster = useCallback(() => {
    if (!poster || !canvasRef.current) return;

    const canvas = canvasRef.current;
    const ctx = canvas.getContext('2d');

    // Clear canvas
    ctx.clearRect(0, 0, canvas.width, canvas.height);

    // Set canvas size (assuming A4 size at 96 DPI)
    canvas.width = 794; // A4 width in pixels at 96 DPI
    canvas.height = 1123; // A4 height in pixels at 96 DPI

    const { designData } = poster;

    // Draw background image
    if (designData.bgImage && designData.bgImage.url) {
      const bgImg = new Image();
      bgImg.crossOrigin = "anonymous";
      bgImg.onload = () => {
        // Apply background image filters if available
        if (designData.bgImageSettings && designData.bgImageSettings.filters) {
          const { brightness, contrast, saturation, grayscale, blur } = designData.bgImageSettings.filters;

          // Apply filters
          ctx.filter = `brightness(${brightness}%) contrast(${contrast}%) saturate(${saturation}%) grayscale(${grayscale}%) blur(${blur}px)`;
        }

        ctx.drawImage(bgImg, 0, 0, canvas.width, canvas.height);
        ctx.filter = 'none'; // Reset filter

        // Draw overlay images
        if (designData.overlayImages && designData.overlayImages.length > 0) {
          designData.overlayImages.forEach((overlay, index) => {
            const overlayImg = new Image();
            overlayImg.crossOrigin = "anonymous";
            overlayImg.onload = () => {
              // Get corresponding overlay settings
              const overlaySetting = designData.overlaySettings.overlays[index];

              if (overlaySetting) {
                // Apply filters if available
                if (designData.overlayImageFilters && designData.overlayImageFilters[index]) {
                  const { brightness, contrast, saturation, grayscale, blur } = designData.overlayImageFilters[index];
                  ctx.filter = `brightness(${brightness}%) contrast(${contrast}%) saturate(${saturation}%) grayscale(${grayscale}%) blur(${blur}px)`;
                }

                ctx.drawImage(
                  overlayImg,
                  overlaySetting.x,
                  overlaySetting.y,
                  overlaySetting.width,
                  overlaySetting.height
                );
                ctx.filter = 'none'; // Reset filter

                // Draw selection indicator if this overlay is selected
                if (selectedOverlay === index) {
                  ctx.strokeStyle = '#4285f4';
                  ctx.lineWidth = 2;
                  ctx.strokeRect(
                    overlaySetting.x - 5,
                    overlaySetting.y - 5,
                    overlaySetting.width + 10,
                    overlaySetting.height + 10
                  );

                  // Draw resize handles
                  ctx.fillStyle = '#4285f4';
                  const handleSize = 8;

                  // Top-left
                  ctx.fillRect(
                    overlaySetting.x - handleSize / 2,
                    overlaySetting.y - handleSize / 2,
                    handleSize,
                    handleSize
                  );

                  // Top-right
                  ctx.fillRect(
                    overlaySetting.x + overlaySetting.width - handleSize / 2,
                    overlaySetting.y - handleSize / 2,
                    handleSize,
                    handleSize
                  );

                  // Bottom-left
                  ctx.fillRect(
                    overlaySetting.x - handleSize / 2,
                    overlaySetting.y + overlaySetting.height - handleSize / 2,
                    handleSize,
                    handleSize
                  );

                  // Bottom-right
                  ctx.fillRect(
                    overlaySetting.x + overlaySetting.width - handleSize / 2,
                    overlaySetting.y + overlaySetting.height - handleSize / 2,
                    handleSize,
                    handleSize
                  );
                }
              }
            };
            overlayImg.src = overlay.url;
          });
        }

        // Draw text elements
        drawTextElements(ctx, designData);
      };
      bgImg.src = designData.bgImage.url;
    }
  }, [poster, selectedText, selectedOverlay]);

  // Add useEffect to re-render when poster or selected elements change
  useEffect(() => {
    renderPoster();
  }, [poster, selectedText, selectedOverlay, renderPoster]);

  const drawTextElements = (ctx, designData) => {
    const { textSettings, textStyles, textVisibility } = designData;

    // Draw name if visible
    if (textVisibility.name === 'visible' && poster.name) {
      ctx.font = `${textStyles.name.fontStyle} ${textStyles.name.fontWeight} ${textStyles.name.fontSize}px ${textStyles.name.fontFamily}`;
      ctx.fillStyle = textStyles.name.color;
      ctx.fillText(poster.name, textSettings.nameX, textSettings.nameY);

      // Draw selection indicator if this text is selected
      if (selectedText === 'name') {
        const textWidth = ctx.measureText(poster.name).width;
        ctx.strokeStyle = '#4285f4';
        ctx.lineWidth = 2;
        ctx.strokeRect(
          textSettings.nameX - 5,
          textSettings.nameY - textStyles.name.fontSize,
          textWidth + 10,
          textStyles.name.fontSize + 10
        );
      }
    }

    // Draw email if visible
    // Draw email if visible - Get from localStorage
    if (textVisibility.email === 'visible') {
      const userEmail = localStorage.getItem("userEmail");
      if (userEmail) {
        ctx.font = `${textStyles.email.fontStyle} ${textStyles.email.fontWeight} ${textStyles.email.fontSize}px ${textStyles.email.fontFamily}`;
        ctx.fillStyle = textStyles.email.color;
        ctx.fillText(userEmail, textSettings.emailX, textSettings.emailY);

        if (selectedText === 'email') {
          const textWidth = ctx.measureText(userEmail).width;
          ctx.strokeStyle = '#4285f4';
          ctx.lineWidth = 2;
          ctx.strokeRect(
            textSettings.emailX - 5,
            textSettings.emailY - textStyles.email.fontSize,
            textWidth + 10,
            textStyles.email.fontSize + 10
          );
        }
      }
    }

    // Draw mobile if visible - Get from localStorage
    if (textVisibility.mobile === 'visible') {
      const userMobile = localStorage.getItem("userMobile");
      if (userMobile) {
        ctx.font = `${textStyles.mobile.fontStyle} ${textStyles.mobile.fontWeight} ${textStyles.mobile.fontSize}px ${textStyles.mobile.fontFamily}`;
        ctx.fillStyle = textStyles.mobile.color;
        ctx.fillText(userMobile, textSettings.mobileX, textSettings.mobileY);

        if (selectedText === 'mobile') {
          const textWidth = ctx.measureText(userMobile).width;
          ctx.strokeStyle = '#4285f4';
          ctx.lineWidth = 2;
          ctx.strokeRect(
            textSettings.mobileX - 5,
            textSettings.mobileY - textStyles.mobile.fontSize,
            textWidth + 10,
            textStyles.mobile.fontSize + 10
          );
        }
      }
    }

    // Draw title if visible
    if (textVisibility.title === 'visible' && poster.title) {
      ctx.font = `${textStyles.title.fontStyle} ${textStyles.title.fontWeight} ${textStyles.title.fontSize}px ${textStyles.title.fontFamily}`;
      ctx.fillStyle = textStyles.title.color;
      ctx.fillText(poster.title, textSettings.titleX, textSettings.titleY);

      if (selectedText === 'title') {
        const textWidth = ctx.measureText(poster.title).width;
        ctx.strokeStyle = '#4285f4';
        ctx.lineWidth = 2;
        ctx.strokeRect(
          textSettings.titleX - 5,
          textSettings.titleY - textStyles.title.fontSize,
          textWidth + 10,
          textStyles.title.fontSize + 10
        );
      }
    }

    // Draw description if visible
    if (textVisibility.description === 'visible' && poster.description) {
      ctx.font = `${textStyles.description.fontStyle} ${textStyles.description.fontWeight} ${textStyles.description.fontSize}px ${textStyles.description.fontFamily}`;
      ctx.fillStyle = textStyles.description.color;
      ctx.fillText(poster.description, textSettings.descriptionX, textSettings.descriptionY);

      if (selectedText === 'description') {
        const textWidth = ctx.measureText(poster.description).width;
        ctx.strokeStyle = '#4285f4';
        ctx.lineWidth = 2;
        ctx.strokeRect(
          textSettings.descriptionX - 5,
          textSettings.descriptionY - textStyles.description.fontSize,
          textWidth + 10,
          textStyles.description.fontSize + 10
        );
      }
    }

    // Draw tags if visible
    if (textVisibility.tags === 'visible' && poster.tags && poster.tags.length > 0) {
      ctx.font = `${textStyles.tags.fontStyle} ${textStyles.tags.fontWeight} ${textStyles.tags.fontSize}px ${textStyles.tags.fontFamily}`;
      ctx.fillStyle = textStyles.tags.color;
      const tagsText = poster.tags.join(', ');
      ctx.fillText(tagsText, textSettings.tagsX, textSettings.tagsY);

      if (selectedText === 'tags') {
        const textWidth = ctx.measureText(tagsText).width;
        ctx.strokeStyle = '#4285f4';
        ctx.lineWidth = 2;
        ctx.strokeRect(
          textSettings.tagsX - 5,
          textSettings.tagsY - textStyles.tags.fontSize,
          textWidth + 10,
          textStyles.tags.fontSize + 10
        );
      }
    }
  };

  const getCanvasCoordinates = (clientX, clientY) => {
    const canvas = canvasRef.current;
    const rect = canvas.getBoundingClientRect();
    const scaleX = canvas.width / rect.width;
    const scaleY = canvas.height / rect.height;

    return {
      x: (clientX - rect.left) * scaleX,
      y: (clientY - rect.top) * scaleY
    };
  };

  const handleCanvasClick = (e) => {
    if (!poster) return;

    // Handle both mouse and touch events
    const clientX = e.clientX || (e.touches && e.touches[0].clientX);
    const clientY = e.clientY || (e.touches && e.touches[0].clientY);

    if (clientX === undefined || clientY === undefined) return;

    const { x, y } = getCanvasCoordinates(clientX, clientY);

    const { textSettings, textStyles, textVisibility, overlaySettings } = poster.designData;

    // First check if any overlay was clicked
    if (overlaySettings && overlaySettings.overlays) {
      for (let i = 0; i < overlaySettings.overlays.length; i++) {
        const overlay = overlaySettings.overlays[i];
        if (
          x >= overlay.x - 5 &&
          x <= overlay.x + overlay.width + 5 &&
          y >= overlay.y - 5 &&
          y <= overlay.y + overlay.height + 5
        ) {
          setSelectedOverlay(i);
          setSelectedText(null);

          // Check if clicked on a resize handle
          const handleSize = 8;
          if (x >= overlay.x - handleSize / 2 && x <= overlay.x + handleSize / 2 &&
            y >= overlay.y - handleSize / 2 && y <= overlay.y + handleSize / 2) {
            setResizeDirection("top-left");
          } else if (x >= overlay.x + overlay.width - handleSize / 2 && x <= overlay.x + overlay.width + handleSize / 2 &&
            y >= overlay.y - handleSize / 2 && y <= overlay.y + handleSize / 2) {
            setResizeDirection("top-right");
          } else if (x >= overlay.x - handleSize / 2 && x <= overlay.x + handleSize / 2 &&
            y >= overlay.y + overlay.height - handleSize / 2 && y <= overlay.y + overlay.height + handleSize / 2) {
            setResizeDirection("bottom-left");
          } else if (x >= overlay.x + overlay.width - handleSize / 2 && x <= overlay.x + overlay.width + handleSize / 2 &&
            y >= overlay.y + overlay.height - handleSize / 2 && y <= overlay.y + overlay.height + handleSize / 2) {
            setResizeDirection("bottom-right");
          } else {
            setResizeDirection("");
          }

          return;
        }
      }
    }

    // Check if any text element was clicked
    const checkTextHit = (textKey, textValue) => {
      if (!textValue || textVisibility[textKey] !== 'visible') return false;

      const textX = textSettings[`${textKey}X`];
      const textY = textSettings[`${textKey}Y`];
      const fontSize = textStyles[textKey].fontSize;

      // Create a temporary canvas to measure text
      const tempCanvas = document.createElement('canvas');
      const tempCtx = tempCanvas.getContext('2d');
      tempCtx.font = `${textStyles[textKey].fontStyle} ${textStyles[textKey].fontWeight} ${fontSize}px ${textStyles[textKey].fontFamily}`;
      const textWidth = tempCtx.measureText(textValue).width;

      // Check if click is within text bounds
      return (
        x >= textX - 5 &&
        x <= textX + textWidth + 5 &&
        y >= textY - fontSize - 5 &&
        y <= textY + 5
      );
    };

    if (checkTextHit('name', poster.name)) {
      setSelectedText('name');
      setSelectedOverlay(null);
      return;
    }

    // For email
    if (checkTextHit('email', localStorage.getItem("userEmail"))) {
      setSelectedText('email');
      setSelectedOverlay(null);
      return;
    }

    // For mobile
    if (checkTextHit('mobile', localStorage.getItem("userMobile"))) {
      setSelectedText('mobile');
      setSelectedOverlay(null);
      return;
    }

    if (checkTextHit('title', poster.title)) {
      setSelectedText('title');
      setSelectedOverlay(null);
      return;
    }

    if (checkTextHit('description', poster.description)) {
      setSelectedText('description');
      setSelectedOverlay(null);
      return;
    }

    if (checkTextHit('tags', poster.tags && poster.tags.join(', '))) {
      setSelectedText('tags');
      setSelectedOverlay(null);
      return;
    }

    // If no text or overlay was clicked, deselect everything
    setSelectedText(null);
    setSelectedOverlay(null);
  };

  const handleMouseDown = (e) => {
    if (!poster) return;

    // Prevent default for touch events to avoid scrolling
    if (e.type === 'touchstart') {
      e.preventDefault();
    }

    const clientX = e.clientX || (e.touches && e.touches[0].clientX);
    const clientY = e.clientY || (e.touches && e.touches[0].clientY);

    if (clientX === undefined || clientY === undefined) return;

    const { x, y } = getCanvasCoordinates(clientX, clientY);

    if (selectedText) {
      const textSettings = poster.designData.textSettings;
      const textX = textSettings[`${selectedText}X`];
      const textY = textSettings[`${selectedText}Y`];

      setDragOffset({
        x: x - textX,
        y: y - textY
      });

      setIsDragging(true);
    } else if (selectedOverlay !== null) {
      const overlay = poster.designData.overlaySettings.overlays[selectedOverlay];

      if (resizeDirection) {
        // We're resizing an overlay
        setIsResizing(true);
        setDragOffset({
          x: x - overlay.x,
          y: y - overlay.y
        });
      } else {
        // We're moving an overlay
        setDragOffset({
          x: x - overlay.x,
          y: y - overlay.y
        });

        setIsDragging(true);
      }
    }
  };

  const handleMouseMove = (e) => {
    if (!poster || (!isDragging && !isResizing)) return;

    const clientX = e.clientX || (e.touches && e.touches[0].clientX);
    const clientY = e.clientY || (e.touches && e.touches[0].clientY);

    if (clientX === undefined || clientY === undefined) return;

    const { x, y } = getCanvasCoordinates(clientX, clientY);

    if (isDragging && selectedText) {
      const newX = x - dragOffset.x;
      const newY = y - dragOffset.y;

      // Update the poster data with new position
      const updatedPoster = { ...poster };
      updatedPoster.designData.textSettings[`${selectedText}X`] = newX;
      updatedPoster.designData.textSettings[`${selectedText}Y`] = newY;

      setPoster(updatedPoster);
    } else if (isDragging && selectedOverlay !== null) {
      const newX = x - dragOffset.x;
      const newY = y - dragOffset.y;

      // Update the poster data with new overlay position
      const updatedPoster = { ...poster };
      updatedPoster.designData.overlaySettings.overlays[selectedOverlay].x = newX;
      updatedPoster.designData.overlaySettings.overlays[selectedOverlay].y = newY;

      setPoster(updatedPoster);
    } else if (isResizing && selectedOverlay !== null) {
      const updatedPoster = { ...poster };
      const overlay = updatedPoster.designData.overlaySettings.overlays[selectedOverlay];

      switch (resizeDirection) {
        case "top-left":
          overlay.width = overlay.width + (overlay.x - x) + dragOffset.x;
          overlay.height = overlay.height + (overlay.y - y) + dragOffset.y;
          overlay.x = x - dragOffset.x;
          overlay.y = y - dragOffset.y;
          break;
        case "top-right":
          overlay.width = x - overlay.x;
          overlay.height = overlay.height + (overlay.y - y) + dragOffset.y;
          overlay.y = y - dragOffset.y;
          break;
        case "bottom-left":
          overlay.width = overlay.width + (overlay.x - x) + dragOffset.x;
          overlay.height = y - overlay.y;
          overlay.x = x - dragOffset.x;
          break;
        case "bottom-right":
          overlay.width = x - overlay.x;
          overlay.height = y - overlay.y;
          break;
        default:
          break;
      }

      // Ensure minimum size
      overlay.width = Math.max(10, overlay.width);
      overlay.height = Math.max(10, overlay.height);

      setPoster(updatedPoster);
    }
  };

  const handleMouseUp = () => {
    setIsDragging(false);
    setIsResizing(false);
    setResizeDirection("");
  };

  const handleTextChange = (field, value) => {
    const updatedPoster = { ...poster };
    updatedPoster[field] = value;
    setPoster(updatedPoster);
  };

  const handleStyleChange = (field, property, value) => {
    const updatedPoster = { ...poster };
    updatedPoster.designData.textStyles[field][property] = value;
    setPoster(updatedPoster);
  };

  const handleOverlayChange = (property, value) => {
    if (selectedOverlay === null) return;

    const updatedPoster = { ...poster };
    updatedPoster.designData.overlaySettings.overlays[selectedOverlay][property] = parseInt(value);
    setPoster(updatedPoster);
  };

  const handleDownload = () => {
    if (!canvasRef.current) return;

    const canvas = canvasRef.current;
    const image = canvas.toDataURL('image/png');

    const link = document.createElement('a');
    link.href = image;
    link.download = `poster-${posterId || 'design'}.png`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const handleShare = () => {
    if (!canvasRef.current) return;

    // Create a Blob from the canvas content
    canvasRef.current.toBlob((blob) => {
      // Check if Blob was successfully created
      if (!blob) {
        console.error('Failed to create a Blob from the canvas.');
        return;
      }

      // Check if the Web Share API and canShare are supported
      if (navigator.share && navigator.canShare) {
        // Attempt to convert Blob to File
        try {
          const file = new File([blob], `poster-${posterId || 'design'}.png`, { type: 'image/png' });

          // Check if the file can be shared
          if (navigator.canShare({ files: [file] })) {
            // Proceed with sharing the file
            navigator.share({
              title: 'Check out my poster design',
              text: 'I created this poster using our app!',
              files: [file],
            })
              .catch((error) => {
                console.error('Sharing failed', error);
                handleDownload(); // Fallback to download if sharing fails
              });
          } else {
            console.error('Cannot share this file.');
            handleDownload(); // Fallback to download
          }
        } catch (error) {
          console.error('Error converting Blob to File:', error);
          handleDownload(); // Fallback to download
        }
      } else {
        console.error('Web Share API is not supported or cannot share files.');
        handleDownload(); // Fallback to download
      }
    }, 'image/png'); // Ensure the Blob is created with the correct MIME type
  };

  if (loading) {
    return <div className="flex justify-center items-center h-screen text-gray-600 text-lg">Loading poster...</div>;
  }

  if (error) {
    return <div className="flex justify-center items-center h-screen text-red-600 text-lg">{error}</div>;
  }

  if (!poster) {
    return <div className="flex justify-center items-center h-screen text-red-600 text-lg">No poster data available</div>;
  }

  return (
    <>
      <Navbar />
      <div className="p-4 font-sans max-w-7xl mx-auto mb-5">
        <div className="flex justify-between items-center mb-5">
          {/* Back Button */}
          <button
            onClick={() => {
              setSidebarOpen(false); // optionally close sidebar
              // add other reset logic if needed
              window.history.back(); // go back
            }}
            className="bg-gray-200 text-gray-700 px-4 py-2 rounded-md hover:bg-gray-300 flex items-center gap-2"
          >
            ← Back
          </button>

          {/* Sidebar Toggle Button (mobile) */}
          <button
            className="lg:hidden bg-blue-500 text-white px-4 py-2 rounded-md"
            onClick={() => setSidebarOpen(!sidebarOpen)}
          >
            {sidebarOpen ? 'Hide Editor' : 'Show Editor'}
          </button>
        </div>


        <div className="flex flex-col lg:flex-row gap-5 mt-5">
          <div className="flex-1 border border-gray-300 rounded-lg p-3 bg-gray-50 shadow-md" ref={canvasContainerRef}>
            <div className="relative w-full pb-[141.42%]"> {/* Aspect ratio container for A4 (1:1.414) */}
              <canvas
                ref={canvasRef}
                className="absolute top-0 left-0 w-full h-full bg-white shadow-md cursor-pointer touch-none"
                onClick={handleCanvasClick}
                onMouseDown={handleMouseDown}
                onMouseMove={handleMouseMove}
                onMouseUp={handleMouseUp}
                onMouseLeave={handleMouseUp}
                onTouchStart={handleMouseDown}
                onTouchMove={handleMouseMove}
                onTouchEnd={handleMouseUp}
              ></canvas>
            </div>

            {/* Download and Share buttons */}
            <div className="flex justify-center mt-4 space-x-4">
              <button
                onClick={handleDownload}
                className="bg-green-500 hover:bg-green-600 text-white px-4 py-2 rounded-md flex items-center"
              >
                <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4"></path>
                </svg>
                Download
              </button>

              <button
                onClick={handleShare}
                className="bg-blue-500 hover:bg-blue-600 text-white px-4 py-2 rounded-md flex items-center"
              >
                <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8.684 13.342C8.886 12.938 9 12.482 9 12c0-.482-.114-.938-.316-1.342m0 2.684a3 3 0 110-2.684m0 2.684l6.632 3.316m-6.632-6l6.632-3.316m0 0a3 3 0 105.367-2.684 3 3 0 00-5.367 2.684zm0 9.316a3 3 0 105.368 2.684 3 3 0 00-5.368-2.684z"></path>
                </svg>
                Share
              </button>
            </div>
          </div>

          <div className={`w-full lg:w-80 bg-white border border-gray-300 rounded-lg p-4 shadow-md transition-all duration-300 ${sidebarOpen ? 'block' : 'hidden lg:block'}`}>
            <h3 className="text-lg font-semibold mt-0 pb-3 border-b border-gray-200">Edit Selection</h3>

            {selectedText && (
              <div className="mt-4">
                <div className="mb-4">
                  <label className="block mb-1 font-medium text-gray-700">
                    {selectedText.charAt(0).toUpperCase() + selectedText.slice(1)}
                  </label>
                  <input
                    type="text"
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    value={poster[selectedText] || ''}
                    onChange={(e) => handleTextChange(selectedText, e.target.value)}
                  />
                </div>

                <div className="mb-4">
                  <label className="block mb-1 font-medium text-gray-700">Font Size</label>
                  <input
                    type="number"
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    value={poster.designData.textStyles[selectedText].fontSize}
                    onChange={(e) => handleStyleChange(selectedText, 'fontSize', parseInt(e.target.value))}
                  />
                </div>

                <div className="mb-4">
                  <label className="block mb-1 font-medium text-gray-700">Color</label>
                  <div className="flex items-center">
                    <input
                      type="color"
                      className="w-10 h-10 border border-gray-300 rounded cursor-pointer"
                      value={poster.designData.textStyles[selectedText].color}
                      onChange={(e) => handleStyleChange(selectedText, 'color', e.target.value)}
                    />
                    <span className="ml-2 text-gray-600">{poster.designData.textStyles[selectedText].color}</span>
                  </div>
                </div>

                <div className="mb-4">
                  <label className="block mb-1 font-medium text-gray-700">Font Family</label>
                  <select
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    value={poster.designData.textStyles[selectedText].fontFamily}
                    onChange={(e) => handleStyleChange(selectedText, 'fontFamily', e.target.value)}
                  >
                    <option value="Arial">Arial</option>
                    <option value="Helvetica">Helvetica</option>
                    <option value="Times New Roman">Times New Roman</option>
                    <option value="Georgia">Georgia</option>
                    <option value="Courier New">Courier New</option>
                    <option value="Verdana">Verdana</option>
                  </select>
                </div>

                <div className="mb-4">
                  <label className="block mb-1 font-medium text-gray-700">Font Weight</label>
                  <select
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    value={poster.designData.textStyles[selectedText].fontWeight}
                    onChange={(e) => handleStyleChange(selectedText, 'fontWeight', e.target.value)}
                  >
                    <option value="normal">Normal</option>
                    <option value="bold">Bold</option>
                    <option value="lighter">Lighter</option>
                  </select>
                </div>

                <div className="mb-4">
                  <label className="block mb-1 font-medium text-gray-700">Font Style</label>
                  <select
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    value={poster.designData.textStyles[selectedText].fontStyle}
                    onChange={(e) => handleStyleChange(selectedText, 'fontStyle', e.target.value)}
                  >
                    <option value="normal">Normal</option>
                    <option value="italic">Italic</option>
                    <option value="oblique">Oblique</option>
                  </select>
                </div>
              </div>
            )}

            {selectedOverlay !== null && (
              <div className="mt-4">
                <h4 className="font-medium text-gray-800 mb-3">Overlay Image Properties</h4>

                <div className="mb-4">
                  <label className="block mb-1 font-medium text-gray-700">Position X</label>
                  <input
                    type="number"
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    value={poster.designData.overlaySettings.overlays[selectedOverlay].x}
                    onChange={(e) => handleOverlayChange('x', e.target.value)}
                  />
                </div>

                <div className="mb-4">
                  <label className="block mb-1 font-medium text-gray-700">Position Y</label>
                  <input
                    type="number"
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    value={poster.designData.overlaySettings.overlays[selectedOverlay].y}
                    onChange={(e) => handleOverlayChange('y', e.target.value)}
                  />
                </div>

                <div className="mb-4">
                  <label className="block mb-1 font-medium text-gray-700">Width</label>
                  <input
                    type="number"
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    value={poster.designData.overlaySettings.overlays[selectedOverlay].width}
                    onChange={(e) => handleOverlayChange('width', e.target.value)}
                  />
                </div>

                <div className="mb-4">
                  <label className="block mb-1 font-medium text-gray-700">Height</label>
                  <input
                    type="number"
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    value={poster.designData.overlaySettings.overlays[selectedOverlay].height}
                    onChange={(e) => handleOverlayChange('height', e.target.value)}
                  />
                </div>
              </div>
            )}

            {!selectedText && selectedOverlay === null && (
              <div className="text-center text-gray-600 py-5">
                <p>Select a text element or image on the canvas to edit its properties</p>
              </div>
            )}
          </div>
        </div>
      </div>
    </>
  );
};

export default SinglePoster;