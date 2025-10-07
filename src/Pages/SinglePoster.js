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
  const [isEditing, setIsEditing] = useState(false);
  const [editingText, setEditingText] = useState("");
  const [editPosition, setEditPosition] = useState({ x: 0, y: 0 });
  const [editSize, setEditSize] = useState({ width: 200, height: 30 });
  const [imagesLoaded, setImagesLoaded] = useState({});
  const [userProfile, setUserProfile] = useState(null);
  const [newTexts, setNewTexts] = useState([]);
  const [isAddingText, setIsAddingText] = useState(false);
  const [newTextContent, setNewTextContent] = useState("");
  const [newTextStyle, setNewTextStyle] = useState({
    fontSize: 24,
    color: "#000000",
    fontFamily: "Arial",
    fontWeight: "normal",
    fontStyle: "normal"
  });
  const [isDownloading, setIsDownloading] = useState(false);
  const canvasRef = useRef(null);
  const canvasContainerRef = useRef(null);
  const inputRef = useRef(null);
  const fileInputRef = useRef(null);

  useEffect(() => {
    const fetchPoster = async () => {
      try {
        console.log(posterId);
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

  const userId = localStorage.getItem("userId");

  useEffect(() => {
    const fetchUserProfile = async () => {
      try {
        const response = await axios.get(
          `https://api.editezy.com/api/users/get-profile/${userId}`
        );
        setUserProfile(response.data);
      } catch (err) {
        console.error("Error fetching user profile:", err);
      }
    };
    if (userId) {
      fetchUserProfile();
    }
  }, [userId]);

  const preloadImages = useCallback((poster) => {
    if (!poster) return;
    const imagesToLoad = [];
    const loadedImages = {};

    if (poster.designData.bgImage && poster.designData.bgImage.url) {
      imagesToLoad.push({
        key: 'background',
        url: poster.designData.bgImage.url
      });
    }

    if (poster.designData.overlayImages && poster.designData.overlayImages.length > 0) {
      poster.designData.overlayImages.forEach((overlay, index) => {
        imagesToLoad.push({
          key: `overlay-${index}`,
          url: overlay.url
        });
      });
    }

    if (userProfile && userProfile.profileImage) {
      imagesToLoad.push({
        key: 'profile',
        url: userProfile.profileImage
      });
    }

    const loadPromises = imagesToLoad.map(({ key, url }) => {
      return new Promise((resolve) => {
        const img = new Image();
        img.crossOrigin = "anonymous";
        img.onload = () => {
          loadedImages[key] = img;
          resolve();
        };
        img.onerror = () => {
          console.error(`Failed to load image: ${url}`);
          resolve();
        };
        img.src = url;
      });
    });

    Promise.all(loadPromises).then(() => {
      setImagesLoaded(loadedImages);
    });
  }, [userProfile]);

  useEffect(() => {
    preloadImages(poster);
  }, [poster, preloadImages]);

  // Initialize default positions for name, mobile, and profile image
  // Initialize default positions for name, mobile, and profile image
// Initialize default positions for name, mobile, and profile image
useEffect(() => {
  if (!poster) return;

  const CANVAS_WIDTH = 794;
  const CANVAS_HEIGHT = 1123;
  const updatedPoster = { ...poster };
  const designData = updatedPoster.designData;

  // Profile image: top-right
  if (!designData.profileImageSettings) {
    designData.profileImageSettings = {
      x: CANVAS_WIDTH - 150,
      y: 50,
      width: 100,
      height: 100,
      visible: true
    };
  }

  // Name: bottom-left (50px from left)
  if (
    designData.textSettings.nameX === undefined ||
    designData.textSettings.nameY === undefined
  ) {
    designData.textSettings.nameX = 50;
    designData.textSettings.nameY = CANVAS_HEIGHT - 20;
  }

  // ✅ Mobile: Static position (UI side)
  designData.textSettings.mobileX = 600;
  designData.textSettings.mobileY = CANVAS_HEIGHT - 80;

  // Hide email by default
  if (designData.textVisibility.email === undefined) {
    designData.textVisibility.email = 'hidden';
  }

  setPoster(updatedPoster);
}, [poster]);


  const renderPoster = useCallback(() => {
    if (!poster || !canvasRef.current || Object.keys(imagesLoaded).length === 0) return;
    const canvas = canvasRef.current;
    const ctx = canvas.getContext('2d');

    const CANVAS_WIDTH = 794;
    const CANVAS_HEIGHT = 1123;

    canvas.width = CANVAS_WIDTH;
    canvas.height = CANVAS_HEIGHT;

    ctx.clearRect(0, 0, canvas.width, canvas.height);

    const { designData } = poster;

    const bgImg = imagesLoaded['background'];
    if (bgImg) {
      if (designData.bgImageSettings && designData.bgImageSettings.filters) {
        const { brightness, contrast, saturation, grayscale, blur } = designData.bgImageSettings.filters;
        ctx.filter = `brightness(${brightness}%) contrast(${contrast}%) saturate(${saturation}%) grayscale(${grayscale}%) blur(${blur}px)`;
      }
      ctx.drawImage(bgImg, 0, 0, canvas.width, canvas.height);
      ctx.filter = 'none';
    }

    if (designData.profileImageSettings && designData.profileImageSettings.visible && userProfile && userProfile.profileImage) {
      const profileImg = imagesLoaded['profile'];
      if (profileImg) {
        const { x, y, width, height } = designData.profileImageSettings;
        ctx.save();
        ctx.beginPath();
        ctx.arc(x + width / 2, y + height / 2, width / 2, 0, Math.PI * 2);
        ctx.closePath();
        ctx.clip();
        ctx.drawImage(profileImg, x, y, width, height);
        ctx.restore();

        if (selectedOverlay === 'profile' && !isDownloading) {
          ctx.strokeStyle = '#4285f4';
          ctx.lineWidth = 2;
          ctx.strokeRect(x - 5, y - 5, width + 10, height + 10);

          const handleSize = 8;
          ctx.fillStyle = '#4285f4';
          ctx.fillRect(x - handleSize / 2, y - handleSize / 2, handleSize, handleSize);
          ctx.fillRect(x + width - handleSize / 2, y - handleSize / 2, handleSize, handleSize);
          ctx.fillRect(x - handleSize / 2, y + height - handleSize / 2, handleSize, handleSize);
          ctx.fillRect(x + width - handleSize / 2, y + height - handleSize / 2, handleSize, handleSize);

          drawDeleteIcon(ctx, x + width - 10, y - 10);
        }
      }
    }

    if (designData.overlayImages && designData.overlayImages.length > 0) {
      designData.overlayImages.forEach((overlay, index) => {
        const overlayImg = imagesLoaded[`overlay-${index}`];
        if (overlayImg) {
          const overlaySetting = designData.overlaySettings.overlays[index];
          if (overlaySetting) {
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
            ctx.filter = 'none';

            if (selectedOverlay === index && !isDownloading) {
              ctx.strokeStyle = '#4285f4';
              ctx.lineWidth = 2;
              ctx.strokeRect(
                overlaySetting.x - 5,
                overlaySetting.y - 5,
                overlaySetting.width + 10,
                overlaySetting.height + 10
              );

              const handleSize = 8;
              ctx.fillStyle = '#4285f4';
              ctx.fillRect(overlaySetting.x - handleSize / 2, overlaySetting.y - handleSize / 2, handleSize, handleSize);
              ctx.fillRect(overlaySetting.x + overlaySetting.width - handleSize / 2, overlaySetting.y - handleSize / 2, handleSize, handleSize);
              ctx.fillRect(overlaySetting.x - handleSize / 2, overlaySetting.y + overlaySetting.height - handleSize / 2, handleSize, handleSize);
              ctx.fillRect(overlaySetting.x + overlaySetting.width - handleSize / 2, overlaySetting.y + overlaySetting.height - handleSize / 2, handleSize, handleSize);

              drawDeleteIcon(ctx, overlaySetting.x + overlaySetting.width - 10, overlaySetting.y - 10);
            }
          }
        }
      });
    }

    if (!isEditing) {
      drawTextElements(ctx, designData);
    }
    drawNewTextElements(ctx);
  }, [poster, selectedText, selectedOverlay, imagesLoaded, isEditing, userProfile, newTexts, isDownloading]);

  const drawDeleteIcon = (ctx, x, y) => {
    ctx.save();
    ctx.fillStyle = '#ff4444';
    ctx.strokeStyle = '#ffffff';
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.arc(x, y, 12, 0, Math.PI * 2);
    ctx.fill();
    ctx.stroke();

    ctx.strokeStyle = '#ffffff';
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.moveTo(x - 5, y - 5);
    ctx.lineTo(x + 5, y + 5);
    ctx.moveTo(x + 5, y - 5);
    ctx.lineTo(x - 5, y + 5);
    ctx.stroke();
    ctx.restore();
  };

  useEffect(() => {
    renderPoster();
  }, [renderPoster]);

const drawTextElements = (ctx, designData) => {
  const { textSettings, textStyles, textVisibility } = designData;

  if (textVisibility.name === 'visible' && userProfile?.name) {
    drawTextElement(ctx, 'name', userProfile.name, textSettings, textStyles);
  }

  if (textVisibility.mobile === 'visible' && userProfile?.mobile) {
    drawTextElement(ctx, 'mobile', userProfile.mobile, textSettings, textStyles);
  }

    if (textVisibility.title === 'visible' && poster.title) {
      drawTextElement(ctx, 'title', poster.title, textSettings, textStyles);
    }

    if (textVisibility.description === 'visible' && poster.description) {
      drawTextElement(ctx, 'description', poster.description, textSettings, textStyles);
    }

    if (textVisibility.tags === 'visible' && poster.tags && poster.tags.length > 0) {
      const tagsText = poster.tags.join(', ');
      drawTextElement(ctx, 'tags', tagsText, textSettings, textStyles);
    }
  };

  const drawTextElement = (ctx, textType, text, textSettings, textStyles) => {
    ctx.font = `${textStyles[textType].fontStyle} ${textStyles[textType].fontWeight} ${textStyles[textType].fontSize}px ${textStyles[textType].fontFamily}`;
    ctx.fillStyle = textStyles[textType].color;
    ctx.fillText(text, textSettings[`${textType}X`], textSettings[`${textType}Y`]);

    if (selectedText === textType && !isDownloading) {
      const textWidth = ctx.measureText(text).width;
      ctx.strokeStyle = '#4285f4';
      ctx.lineWidth = 2;
      ctx.strokeRect(
        textSettings[`${textType}X`] - 5,
        textSettings[`${textType}Y`] - textStyles[textType].fontSize,
        textWidth + 10,
        textStyles[textType].fontSize + 10
      );

      const handleSize = 8;
      ctx.fillStyle = '#4285f4';
      ctx.fillRect(
        textSettings[`${textType}X`] - handleSize / 2,
        textSettings[`${textType}Y`] - textStyles[textType].fontSize - handleSize / 2,
        handleSize,
        handleSize
      );
      ctx.fillRect(
        textSettings[`${textType}X`] + textWidth - handleSize / 2,
        textSettings[`${textType}Y`] - textStyles[textType].fontSize - handleSize / 2,
        handleSize,
        handleSize
      );
      ctx.fillRect(
        textSettings[`${textType}X`] - handleSize / 2,
        textSettings[`${textType}Y`] + 5 - handleSize / 2,
        handleSize,
        handleSize
      );
      ctx.fillRect(
        textSettings[`${textType}X`] + textWidth - handleSize / 2,
        textSettings[`${textType}Y`] + 5 - handleSize / 2,
        handleSize,
        handleSize
      );
    }
  };

  const drawNewTextElements = (ctx) => {
    newTexts.forEach((textObj, index) => {
      ctx.font = `${textObj.style.fontStyle} ${textObj.style.fontWeight} ${textObj.style.fontSize}px ${textObj.style.fontFamily}`;
      ctx.fillStyle = textObj.style.color;
      ctx.fillText(textObj.content, textObj.x, textObj.y);

      if (selectedText === `new-${index}` && !isDownloading) {
        const textWidth = ctx.measureText(textObj.content).width;
        ctx.strokeStyle = '#4285f4';
        ctx.lineWidth = 2;
        ctx.strokeRect(
          textObj.x - 5,
          textObj.y - textObj.style.fontSize,
          textWidth + 10,
          textObj.style.fontSize + 10
        );

        const handleSize = 8;
        ctx.fillStyle = '#4285f4';
        ctx.fillRect(textObj.x - handleSize / 2, textObj.y - textObj.style.fontSize - handleSize / 2, handleSize, handleSize);
        ctx.fillRect(textObj.x + textWidth - handleSize / 2, textObj.y - textObj.style.fontSize - handleSize / 2, handleSize, handleSize);
        ctx.fillRect(textObj.x - handleSize / 2, textObj.y + 5 - handleSize / 2, handleSize, handleSize);
        ctx.fillRect(textObj.x + textWidth - handleSize / 2, textObj.y + 5 - handleSize / 2, handleSize, handleSize);

        drawDeleteIcon(ctx, textObj.x + textWidth + 15, textObj.y - textObj.style.fontSize - 5);
      }
    });
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

  const getScreenCoordinates = (canvasX, canvasY) => {
    const canvas = canvasRef.current;
    const rect = canvas.getBoundingClientRect();
    const scaleX = rect.width / canvas.width;
    const scaleY = rect.height / canvas.height;
    return {
      x: canvasX * scaleX + rect.left,
      y: canvasY * scaleY + rect.top
    };
  };

  const startInlineEdit = (textType, textObj = null) => {
    let currentText = "";
    let canvasX, canvasY;
    let fontSize = 24;
    if (textType.startsWith('new-')) {
      const index = parseInt(textType.split('-')[1]);
      currentText = newTexts[index].content;
      canvasX = newTexts[index].x;
      canvasY = newTexts[index].y;
      fontSize = newTexts[index].style.fontSize;
    } else {
      switch (textType) {
        case 'name':
          currentText = userProfile?.name || ""; // userProfile से लें
          canvasX = poster.designData.textSettings.nameX;
          canvasY = poster.designData.textSettings.nameY;
          fontSize = poster.designData.textStyles.name.fontSize;
          break;
        case 'mobile':
          currentText = userProfile?.mobile || ""; // userProfile से लें
          canvasX = poster.designData.textSettings.mobileX;
          canvasY = poster.designData.textSettings.mobileY;
          fontSize = poster.designData.textStyles.mobile.fontSize;
          break;
        case 'title':
          currentText = poster.title || "";
          canvasX = poster.designData.textSettings.titleX;
          canvasY = poster.designData.textSettings.titleY;
          fontSize = poster.designData.textStyles.title.fontSize;
          break;
        case 'description':
          currentText = poster.description || "";
          canvasX = poster.designData.textSettings.descriptionX;
          canvasY = poster.designData.textSettings.descriptionY;
          fontSize = poster.designData.textStyles.description.fontSize;
          break;
        case 'tags':
          currentText = poster.tags ? poster.tags.join(', ') : "";
          canvasX = poster.designData.textSettings.tagsX;
          canvasY = poster.designData.textSettings.tagsY;
          fontSize = poster.designData.textStyles.tags.fontSize;
          break;
        default:
          currentText = "";
      }
    }

    const screenPos = getScreenCoordinates(canvasX, canvasY - fontSize);
    const estimatedWidth = Math.max(200, currentText.length * (fontSize * 0.6));

    setEditingText(currentText);
    setEditPosition({ x: screenPos.x, y: screenPos.y });
    setEditSize({ width: estimatedWidth, height: fontSize + 10 });
    setIsEditing(textType);
    setSelectedText(textType);

    setTimeout(() => {
      if (inputRef.current) {
        inputRef.current.focus();
        inputRef.current.select();
        if ('visualViewport' in window) {
          window.visualViewport.addEventListener('resize', adjustInputPosition);
        }
      }
    }, 100);
  };

  const adjustInputPosition = () => {
    if (isEditing && inputRef.current) {
      const inputRect = inputRef.current.getBoundingClientRect();
      const viewportHeight = window.visualViewport.height;
      const offsetY = inputRect.bottom - viewportHeight + 20;
      if (offsetY > 0) {
        window.scrollBy({ top: offsetY, behavior: 'smooth' });
      }
    }
  };

  const finishInlineEdit = () => {
    if (!isEditing) return;
    if (isEditing.startsWith('new-')) {
      const index = parseInt(isEditing.split('-')[1]);
      const updatedTexts = [...newTexts];
      updatedTexts[index].content = editingText;
      setNewTexts(updatedTexts);
    } else {
      const updatedPoster = { ...poster };
      switch (isEditing) {
        case 'name':
          updatedPoster.name = editingText;
          break;
        case 'mobile':
          localStorage.setItem("userMobile", editingText);
          break;
        case 'title':
          updatedPoster.title = editingText;
          break;
        case 'description':
          updatedPoster.description = editingText;
          break;
        case 'tags':
          updatedPoster.tags = editingText.split(',').map(tag => tag.trim()).filter(tag => tag);
          break;
      }
      setPoster(updatedPoster);
    }
    setIsEditing(false);
    setEditingText("");
    if ('visualViewport' in window) {
      window.visualViewport.removeEventListener('resize', adjustInputPosition);
    }
  };

  const cancelInlineEdit = () => {
    setIsEditing(false);
    setEditingText("");
    if ('visualViewport' in window) {
      window.visualViewport.removeEventListener('resize', adjustInputPosition);
    }
  };

  const addNewText = () => {
    const newText = {
      id: Date.now(),
      content: newTextContent || "New Text",
      x: 100,
      y: 100,
      style: { ...newTextStyle }
    };
    setNewTexts([...newTexts, newText]);
    setNewTextContent("");
    setIsAddingText(false);
    setSelectedText(`new-${newTexts.length}`);
  };

  const handleCanvasClick = (e) => {
    if (!poster) return;
    const clientX = e.clientX || (e.touches && e.touches[0].clientX);
    const clientY = e.clientY || (e.touches && e.touches[0].clientY);
    if (clientX === undefined || clientY === undefined) return;
    const { x, y } = getCanvasCoordinates(clientX, clientY);

    if (selectedOverlay !== null || (selectedText && selectedText.startsWith('new-'))) {
      if (checkDeleteIconClick(x, y)) {
        handleDeleteSelected();
        return;
      }
    }

    const { textSettings, textStyles, textVisibility, overlaySettings, profileImageSettings } = poster.designData;

    if (profileImageSettings && profileImageSettings.visible) {
      const { x: profileX, y: profileY, width, height } = profileImageSettings;
      const centerX = profileX + width / 2;
      const centerY = profileY + height / 2;
      const radius = width / 2;
      const distance = Math.sqrt((x - centerX) ** 2 + (y - centerY) ** 2);
      if (distance <= radius + 5) {
        setSelectedOverlay('profile');
        setSelectedText(null);
        const handleSize = 8;
        if (x >= profileX - handleSize / 2 && x <= profileX + handleSize / 2 &&
          y >= profileY - handleSize / 2 && y <= profileY + handleSize / 2) {
          setResizeDirection("top-left");
        } else if (x >= profileX + width - handleSize / 2 && x <= profileX + width + handleSize / 2 &&
          y >= profileY - handleSize / 2 && y <= profileY + handleSize / 2) {
          setResizeDirection("top-right");
        } else if (x >= profileX - handleSize / 2 && x <= profileX + handleSize / 2 &&
          y >= profileY + height - handleSize / 2 && y <= profileY + height + handleSize / 2) {
          setResizeDirection("bottom-left");
        } else if (x >= profileX + width - handleSize / 2 && x <= profileX + width + handleSize / 2 &&
          y >= profileY + height - handleSize / 2 && y <= profileY + height + handleSize / 2) {
          setResizeDirection("bottom-right");
        } else {
          setResizeDirection("");
        }
        return;
      }
    }

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

    for (let i = 0; i < newTexts.length; i++) {
      const textObj = newTexts[i];
      const textWidth = measureTextWidth(textObj.content, textObj.style);
      const textHeight = textObj.style.fontSize;
      const bounds = {
        x: textObj.x - 5,
        y: textObj.y - textHeight - 5,
        width: textWidth + 10,
        height: textHeight + 10
      };
      if (
        x >= bounds.x &&
        x <= bounds.x + bounds.width &&
        y >= bounds.y &&
        y <= bounds.y + bounds.height
      ) {
        setSelectedText(`new-${i}`);
        setSelectedOverlay(null);
        const handleSize = 8;
        const topY = textObj.y - textHeight;
        const bottomY = textObj.y + 5;
        if (x >= textObj.x - handleSize / 2 && x <= textObj.x + handleSize / 2 &&
          y >= topY - handleSize / 2 && y <= topY + handleSize / 2) {
          setResizeDirection("top-left");
        } else if (x >= textObj.x + textWidth - handleSize / 2 && x <= textObj.x + textWidth + handleSize / 2 &&
          y >= topY - handleSize / 2 && y <= topY + handleSize / 2) {
          setResizeDirection("top-right");
        } else if (x >= textObj.x - handleSize / 2 && x <= textObj.x + handleSize / 2 &&
          y >= bottomY - handleSize / 2 && y <= bottomY + handleSize / 2) {
          setResizeDirection("bottom-left");
        } else if (x >= textObj.x + textWidth - handleSize / 2 && x <= textObj.x + textWidth + handleSize / 2 &&
          y >= bottomY - handleSize / 2 && y <= bottomY + handleSize / 2) {
          setResizeDirection("bottom-right");
        } else {
          setResizeDirection("");
        }
        return;
      }
    }
const checkTextHit = (textKey) => {
  // textValue को function parameter से हटाकर internally define करें
  let textValue = "";
  
  if (textKey === 'name') {
    textValue = userProfile?.name || ""; // userProfile से लें
  } else if (textKey === 'mobile') {
    textValue = userProfile?.mobile || ""; // userProfile से लें
  } else if (textKey === 'title') {
    textValue = poster?.title || "";
  } else if (textKey === 'description') {
    textValue = poster?.description || "";
  } else if (textKey === 'tags') {
    textValue = poster?.tags ? poster.tags.join(', ') : "";
  }
  
  if (!textValue || poster.designData.textVisibility[textKey] !== 'visible') return false;
  
  const textX = poster.designData.textSettings[`${textKey}X`];
  const textY = poster.designData.textSettings[`${textKey}Y`];
  const fontSize = poster.designData.textStyles[textKey].fontSize;
  const textWidth = measureTextWidth(textValue, poster.designData.textStyles[textKey]);
  
  return (
    x >= textX - 5 &&
    x <= textX + textWidth + 5 &&
    y >= textY - fontSize - 5 &&
    y <= textY + 5
  );
};

const handleTextSelection = (textKey, textX, textY, textWidth, fontSize) => {
  setSelectedText(textKey);
  setSelectedOverlay(null);
  const handleSize = 8;
  const topY = textY - fontSize;
  const bottomY = textY + 5;
  if (x >= textX - handleSize / 2 && x <= textX + handleSize / 2 &&
    y >= topY - handleSize / 2 && y <= topY + handleSize / 2) {
    setResizeDirection("top-left");
  } else if (x >= textX + textWidth - handleSize / 2 && x <= textX + textWidth + handleSize / 2 &&
    y >= topY - handleSize / 2 && y <= topY + handleSize / 2) {
    setResizeDirection("top-right");
  } else if (x >= textX - handleSize / 2 && x <= textX + handleSize / 2 &&
    y >= bottomY - handleSize / 2 && y <= bottomY + handleSize / 2) {
    setResizeDirection("bottom-left");
  } else if (x >= textX + textWidth - handleSize / 2 && x <= textX + textWidth + handleSize / 2 &&
    y >= bottomY - handleSize / 2 && y <= bottomY + handleSize / 2) {
    setResizeDirection("bottom-right");
  } else {
    setResizeDirection("");
  }
};

// Calls update करें
if (checkTextHit('name')) {
  const textX = poster.designData.textSettings.nameX;
  const textY = poster.designData.textSettings.nameY;
  const textValue = userProfile?.name || "";
  const textWidth = measureTextWidth(textValue, poster.designData.textStyles.name);
  const fontSize = poster.designData.textStyles.name.fontSize;
  handleTextSelection('name', textX, textY, textWidth, fontSize);
  return;
}

if (checkTextHit('mobile')) {
  const textX = poster.designData.textSettings.mobileX;
  const textY = poster.designData.textSettings.mobileY;
  const textValue = userProfile?.mobile || "";
  const textWidth = measureTextWidth(textValue, poster.designData.textStyles.mobile);
  const fontSize = poster.designData.textStyles.mobile.fontSize;
  handleTextSelection('mobile', textX, textY, textWidth, fontSize);
  return;
}

if (checkTextHit('title')) {
  const textX = poster.designData.textSettings.titleX;
  const textY = poster.designData.textSettings.titleY;
  const textWidth = measureTextWidth(poster.title, poster.designData.textStyles.title);
  const fontSize = poster.designData.textStyles.title.fontSize;
  handleTextSelection('title', textX, textY, textWidth, fontSize);
  return;
}

if (checkTextHit('description')) {
  const textX = poster.designData.textSettings.descriptionX;
  const textY = poster.designData.textSettings.descriptionY;
  const textWidth = measureTextWidth(poster.description, poster.designData.textStyles.description);
  const fontSize = poster.designData.textStyles.description.fontSize;
  handleTextSelection('description', textX, textY, textWidth, fontSize);
  return;
}

if (checkTextHit('tags')) {
  const textX = poster.designData.textSettings.tagsX;
  const textY = poster.designData.textSettings.tagsY;
  const tagsText = poster.tags ? poster.tags.join(', ') : "";
  const textWidth = measureTextWidth(tagsText, poster.designData.textStyles.tags);
  const fontSize = poster.designData.textStyles.tags.fontSize;
  handleTextSelection('tags', textX, textY, textWidth, fontSize);
  return;
}

    setSelectedText(null);
    setSelectedOverlay(null);
    setResizeDirection("");
  };

  const checkDeleteIconClick = (x, y) => {
    if (selectedOverlay !== null) {
      let overlayX, overlayY;
      if (selectedOverlay === 'profile') {
        const profileSettings = poster.designData.profileImageSettings;
        overlayX = profileSettings.x + profileSettings.width - 10;
        overlayY = profileSettings.y - 10;
      } else {
        const overlay = poster.designData.overlaySettings.overlays[selectedOverlay];
        overlayX = overlay.x + overlay.width - 10;
        overlayY = overlay.y - 10;
      }
      const distance = Math.sqrt((x - overlayX) ** 2 + (y - overlayY) ** 2);
      return distance <= 12;
    }
    if (selectedText && selectedText.startsWith('new-')) {
      const index = parseInt(selectedText.split('-')[1]);
      const textObj = newTexts[index];
      const textWidth = measureTextWidth(textObj.content, textObj.style);
      const deleteX = textObj.x + textWidth + 15;
      const deleteY = textObj.y - textObj.style.fontSize - 5;
      const distance = Math.sqrt((x - deleteX) ** 2 + (y - deleteY) ** 2);
      return distance <= 12;
    }
    return false;
  };

  const handleDeleteSelected = () => {
    if (selectedOverlay !== null) {
      if (selectedOverlay === 'profile') {
        const updatedPoster = { ...poster };
        updatedPoster.designData.profileImageSettings.visible = false;
        setPoster(updatedPoster);
      } else {
        const updatedPoster = { ...poster };
        updatedPoster.designData.overlayImages.splice(selectedOverlay, 1);
        updatedPoster.designData.overlaySettings.overlays.splice(selectedOverlay, 1);
        if (updatedPoster.designData.overlayImageFilters) {
          updatedPoster.designData.overlayImageFilters.splice(selectedOverlay, 1);
        }
        const updatedImages = { ...imagesLoaded };
        delete updatedImages[`overlay-${selectedOverlay}`];
        setImagesLoaded(updatedImages);
        setPoster(updatedPoster);
      }
      setSelectedOverlay(null);
    } else if (selectedText && selectedText.startsWith('new-')) {
      const index = parseInt(selectedText.split('-')[1]);
      const updatedTexts = newTexts.filter((_, i) => i !== index);
      setNewTexts(updatedTexts);
      setSelectedText(null);
    }
  };

  const measureTextWidth = (text, style) => {
    const tempCanvas = document.createElement('canvas');
    const tempCtx = tempCanvas.getContext('2d');
    tempCtx.font = `${style.fontStyle} ${style.fontWeight} ${style.fontSize}px ${style.fontFamily}`;
    return tempCtx.measureText(text).width;
  };

  const handleCanvasDoubleClick = (e) => {
    if (!selectedText) return;
    e.preventDefault();
    startInlineEdit(selectedText);
  };

  let lastTapTime = 0;
  const handleCanvasTouchStart = (e) => {
    if (e.touches.length === 1) {
      handleCanvasClick(e);
    }
  };

  const handleCanvasTouchEnd = (e) => {
    if (e.touches.length === 0 && e.changedTouches.length === 1) {
      const currentTime = new Date().getTime();
      const tapLength = currentTime - (lastTapTime || 0);
      if (tapLength < 300 && tapLength > 0 && selectedText) {
        e.preventDefault();
        startInlineEdit(selectedText);
      }
      lastTapTime = currentTime;
    }
  };

  const handleMouseDown = (e) => {
    if (!poster || isEditing) return;
    if (e.type === 'touchstart') {
      e.preventDefault();
    }
    const clientX = e.clientX || (e.touches && e.touches[0].clientX);
    const clientY = e.clientY || (e.touches && e.touches[0].clientY);
    if (clientX === undefined || clientY === undefined) return;
    const { x, y } = getCanvasCoordinates(clientX, clientY);

    if (checkDeleteIconClick(x, y)) {
      return;
    }

    if (selectedText) {
      let textX, textY, textWidth, textHeight;
      if (selectedText.startsWith('new-')) {
        const index = parseInt(selectedText.split('-')[1]);
        textX = newTexts[index].x;
        textY = newTexts[index].y;
        textWidth = measureTextWidth(newTexts[index].content, newTexts[index].style);
        textHeight = newTexts[index].style.fontSize;
      } else {
        const textSettings = poster.designData.textSettings;
        const textStyles = poster.designData.textStyles;
        textX = textSettings[`${selectedText}X`];
        textY = textSettings[`${selectedText}Y`];
        const textValue = (() => {
          switch (selectedText) {
            case 'name': return userProfile?.name || ''; // userProfile से लें
    case 'mobile': return userProfile?.mobile || ''; // userProfile से लें
    case 'tags': return poster.tags ? poster.tags.join(', ') : '';
    default: return poster[selectedText] || '';
  }
        })();
        textWidth = measureTextWidth(textValue, textStyles[selectedText]);
        textHeight = textStyles[selectedText].fontSize;
      }

      if (resizeDirection) {
        setIsResizing(true);
        return;
      }

      setDragOffset({
        x: x - textX,
        y: y - textY
      });
      setIsDragging(true);
    } else if (selectedOverlay !== null) {
      let overlay;
      if (selectedOverlay === 'profile') {
        overlay = poster.designData.profileImageSettings;
      } else {
        overlay = poster.designData.overlaySettings.overlays[selectedOverlay];
      }
      if (resizeDirection) {
        setIsResizing(true);
        setDragOffset({
          x: x - overlay.x,
          y: y - overlay.y
        });
      } else {
        setDragOffset({
          x: x - overlay.x,
          y: y - overlay.y
        });
        setIsDragging(true);
      }
    }
  };

  const handleMouseMove = (e) => {
    if (!poster || (!isDragging && !isResizing) || isEditing) return;
    const clientX = e.clientX || (e.touches && e.touches[0].clientX);
    const clientY = e.clientY || (e.touches && e.touches[0].clientY);
    if (clientX === undefined || clientY === undefined) return;
    const { x, y } = getCanvasCoordinates(clientX, clientY);

    if (isDragging && selectedText) {
      const newX = x - dragOffset.x;
      const newY = y - dragOffset.y;
      if (selectedText.startsWith('new-')) {
        const index = parseInt(selectedText.split('-')[1]);
        const updatedTexts = [...newTexts];
        updatedTexts[index].x = newX;
        updatedTexts[index].y = newY;
        setNewTexts(updatedTexts);
      } else {
        const updatedPoster = { ...poster };
        updatedPoster.designData.textSettings[`${selectedText}X`] = newX;
        updatedPoster.designData.textSettings[`${selectedText}Y`] = newY;
        setPoster(updatedPoster);
      }
    } else if (isDragging && selectedOverlay !== null) {
      const newX = x - dragOffset.x;
      const newY = y - dragOffset.y;
      const updatedPoster = { ...poster };
      if (selectedOverlay === 'profile') {
        updatedPoster.designData.profileImageSettings.x = newX;
        updatedPoster.designData.profileImageSettings.y = newY;
      } else {
        updatedPoster.designData.overlaySettings.overlays[selectedOverlay].x = newX;
        updatedPoster.designData.overlaySettings.overlays[selectedOverlay].y = newY;
      }
      setPoster(updatedPoster);
    } else if (isResizing && selectedText) {
      if (selectedText.startsWith('new-')) {
        const index = parseInt(selectedText.split('-')[1]);
        const textObj = newTexts[index];
        const textWidth = measureTextWidth(textObj.content, textObj.style);
        const textHeight = textObj.style.fontSize;
        const updatedTexts = [...newTexts];
        let newWidth = textWidth;
        let newHeight = textHeight;
        switch (resizeDirection) {
          case "top-left":
            newWidth = textWidth - (x - textObj.x);
            newHeight = textHeight - (y - (textObj.y - textHeight));
            if (newWidth > 20 && newHeight > 10) {
              updatedTexts[index].x = x;
              updatedTexts[index].y = y + newHeight;
              updatedTexts[index].style.fontSize = newHeight;
            }
            break;
          case "top-right":
            newWidth = x - textObj.x;
            newHeight = textHeight - (y - (textObj.y - textHeight));
            if (newWidth > 20 && newHeight > 10) {
              updatedTexts[index].y = y + newHeight;
              updatedTexts[index].style.fontSize = newHeight;
            }
            break;
          case "bottom-left":
            newWidth = textWidth - (x - textObj.x);
            newHeight = y - textObj.y;
            if (newWidth > 20 && newHeight > 10) {
              updatedTexts[index].x = x;
              updatedTexts[index].style.fontSize = newHeight;
            }
            break;
          case "bottom-right":
            newWidth = x - textObj.x;
            newHeight = y - textObj.y;
            if (newWidth > 20 && newHeight > 10) {
              updatedTexts[index].style.fontSize = newHeight;
            }
            break;
          default:
            break;
        }
        setNewTexts(updatedTexts);
      } else {
        const updatedPoster = { ...poster };
        const textSettings = updatedPoster.designData.textSettings;
        const textStyles = updatedPoster.designData.textStyles;
        const textValue = (() => {
          switch (selectedText) {
            case 'email': return localStorage.getItem("userEmail") || '';
            case 'mobile': return localStorage.getItem("userMobile") || '';
            case 'tags': return poster.tags ? poster.tags.join(', ') : '';
            default: return poster[selectedText] || '';
          }
        })();
        const currentWidth = measureTextWidth(textValue, textStyles[selectedText]);
        const currentHeight = textStyles[selectedText].fontSize;
        let newWidth = currentWidth;
        let newHeight = currentHeight;
        switch (resizeDirection) {
          case "top-left":
            newWidth = currentWidth - (x - textSettings[`${selectedText}X`]);
            newHeight = currentHeight - (y - (textSettings[`${selectedText}Y`] - currentHeight));
            if (newWidth > 20 && newHeight > 10) {
              textSettings[`${selectedText}X`] = x;
              textSettings[`${selectedText}Y`] = y + newHeight;
              textStyles[selectedText].fontSize = newHeight;
            }
            break;
          case "top-right":
            newWidth = x - textSettings[`${selectedText}X`];
            newHeight = currentHeight - (y - (textSettings[`${selectedText}Y`] - currentHeight));
            if (newWidth > 20 && newHeight > 10) {
              textSettings[`${selectedText}Y`] = y + newHeight;
              textStyles[selectedText].fontSize = newHeight;
            }
            break;
          case "bottom-left":
            newWidth = currentWidth - (x - textSettings[`${selectedText}X`]);
            newHeight = y - textSettings[`${selectedText}Y`];
            if (newWidth > 20 && newHeight > 10) {
              textSettings[`${selectedText}X`] = x;
              textStyles[selectedText].fontSize = newHeight;
            }
            break;
          case "bottom-right":
            newWidth = x - textSettings[`${selectedText}X`];
            newHeight = y - textSettings[`${selectedText}Y`];
            if (newWidth > 20 && newHeight > 10) {
              textStyles[selectedText].fontSize = newHeight;
            }
            break;
          default:
            break;
        }
        setPoster(updatedPoster);
      }
    } else if (isResizing && selectedOverlay !== null) {
      const updatedPoster = { ...poster };
      let overlay;
      if (selectedOverlay === 'profile') {
        overlay = updatedPoster.designData.profileImageSettings;
      } else {
        overlay = updatedPoster.designData.overlaySettings.overlays[selectedOverlay];
      }
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
    if (selectedText && selectedText.startsWith('new-')) {
      const index = parseInt(selectedText.split('-')[1]);
      const updatedTexts = [...newTexts];
      updatedTexts[index].style[property] = value;
      setNewTexts(updatedTexts);
    } else {
      const updatedPoster = { ...poster };
      updatedPoster.designData.textStyles[field][property] = value;
      setPoster(updatedPoster);
    }
  };

  const handleOverlayChange = (property, value) => {
    if (selectedOverlay === null) return;
    const updatedPoster = { ...poster };
    if (selectedOverlay === 'profile') {
      updatedPoster.designData.profileImageSettings[property] = parseInt(value);
    } else {
      updatedPoster.designData.overlaySettings.overlays[selectedOverlay][property] = parseInt(value);
    }
    setPoster(updatedPoster);
  };

  const handleProfileVisibilityChange = (visible) => {
    const updatedPoster = { ...poster };
    updatedPoster.designData.profileImageSettings.visible = visible;
    setPoster(updatedPoster);
  };

  const handleUploadLogo = (e) => {
    const file = e.target.files[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (event) => {
      const imageUrl = event.target.result;
      const img = new Image();
      img.onload = () => {
        const newKey = `overlay-${poster.designData.overlayImages.length}`;
        setImagesLoaded(prev => ({
          ...prev,
          [newKey]: img
        }));

        const updatedPoster = { ...poster };
        if (!updatedPoster.designData.overlayImages) {
          updatedPoster.designData.overlayImages = [];
        }
        updatedPoster.designData.overlayImages.push({
          url: imageUrl,
          publicId: `user-uploaded-${Date.now()}`
        });

        if (!updatedPoster.designData.overlaySettings.overlays) {
          updatedPoster.designData.overlaySettings.overlays = [];
        }
        updatedPoster.designData.overlaySettings.overlays.push({
          x: 100,
          y: 100,
          width: 100,
          height: 100,
          shape: "rectangle",
          borderRadius: 0
        });

        if (!updatedPoster.designData.overlayImageFilters) {
          updatedPoster.designData.overlayImageFilters = [];
        }
        updatedPoster.designData.overlayImageFilters.push({
          brightness: 100,
          contrast: 100,
          saturation: 100,
          grayscale: 0,
          blur: 0
        });

        setPoster(updatedPoster);
        setSelectedOverlay(updatedPoster.designData.overlayImages.length - 1);
        setSelectedText(null);
      };
      img.src = imageUrl;
    };
    reader.readAsDataURL(file);
    e.target.value = '';
  };

  const handleDownload = () => {
    if (!canvasRef.current) return;
    setIsDownloading(true);
    setTimeout(() => {
      const canvas = canvasRef.current;
      const link = document.createElement('a');
      link.href = canvas.toDataURL('image/png');
      link.download = `poster-${posterId || 'design'}.png`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      setIsDownloading(false);
    }, 100);
  };

  const handleShare = () => {
    if (!canvasRef.current) return;
    setIsDownloading(true);
    setTimeout(() => {
      canvasRef.current.toBlob((blob) => {
        if (!blob) {
          console.error('Failed to create a Blob from the canvas.');
          setIsDownloading(false);
          return;
        }
        if (navigator.share && navigator.canShare) {
          try {
            const file = new File([blob], `poster-${posterId || 'design'}.png`, { type: 'image/png' });
            if (navigator.canShare({ files: [file] })) {
              navigator.share({
                title: 'Check out my poster design',
                text: 'I created this poster using our app!',
                files: [file],
              })
                .catch((error) => {
                  console.error('Sharing failed', error);
                  handleDownload();
                });
            } else {
              console.error('Cannot share this file.');
              handleDownload();
            }
          } catch (error) {
            console.error('Error converting Blob to File:', error);
            handleDownload();
          }
        } else {
          console.error('Web Share API is not supported or cannot share files.');
          handleDownload();
        }
        setIsDownloading(false);
      }, 'image/png');
    }, 100);
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
          <button
            onClick={() => window.history.back()}
            className="bg-gray-200 text-gray-700 px-4 py-2 rounded-md hover:bg-gray-300 flex items-center gap-2"
          >
            ← Back
          </button>
          <button
            className="lg:hidden bg-blue-500 text-white px-4 py-2 rounded-md"
            onClick={() => setSidebarOpen(!sidebarOpen)}
          >
            {sidebarOpen ? 'Hide Editor' : 'Show Editor'}
          </button>
        </div>
        <div className="flex flex-col lg:flex-row gap-5 mt-5">
          <div className="flex-1 border border-gray-300 rounded-lg p-3 bg-gray-50 shadow-md" ref={canvasContainerRef}>
            <div className="flex justify-center mt-4 space-x-4 flex-wrap">
              <button
                onClick={() => setIsAddingText(true)}
                className="bg-purple-500 hover:bg-purple-600 text-white px-4 py-2 rounded-md flex items-center mb-2"
              >
                <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 6v6m0 0v6m0-6h6m-6 0H6"></path>
                </svg>
                Add Text
              </button>
              <button
                onClick={() => fileInputRef.current?.click()}
                className="bg-indigo-500 hover:bg-indigo-600 text-white px-4 py-2 rounded-md flex items-center mb-2"
              >
                <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-8l-4-4m0 0L8 8m4-4v12"></path>
                </svg>
                Upload Logo
              </button>
              <button
                onClick={handleDownload}
                className="bg-green-500 hover:bg-green-600 text-white px-4 py-2 rounded-md flex items-center mb-2"
              >
                <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4"></path>
                </svg>
                Download
              </button>
              <button
                onClick={handleShare}
                className="bg-blue-500 hover:bg-blue-600 text-white px-4 py-2 rounded-md flex items-center mb-2"
              >
                <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8.684 13.342C8.886 12.938 9 12.482 9 12c0-.482-.114-.938-.316-1.342m0 2.684a3 3 0 110-2.684 3 3 0 00-5.367-2.684 3 3 0 005.367 2.684zm0 9.316a3 3 0 105.368 2.684 3 3 0 00-5.368-2.684z"></path>
                </svg>
                Share
              </button>
              {(selectedOverlay !== null || (selectedText && selectedText.startsWith('new-'))) && (
                <button
                  onClick={handleDeleteSelected}
                  className="bg-red-500 hover:bg-red-600 text-white px-4 py-2 rounded-md flex items-center mb-2"
                >
                  <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"></path>
                  </svg>
                  Delete Selected
                </button>
              )}
            </div>
            <div className="my-3 text-sm text-gray-600 text-center">
              <p>Click to select. Double-click text to edit. Drag to move. Use handles to resize. Click X to delete.</p>
            </div>
            {(selectedText || selectedOverlay !== null) && (
              <div className="flex justify-center items-center gap-6 mb-3 bg-gray-100 p-2 rounded-md shadow">
                {selectedText && (
                  <div className="flex items-center gap-2">
                    <label className="text-sm text-gray-700">Font Size:</label>
                    <input
                      type="range"
                      min="8"
                      max="100"
                      value={selectedText.startsWith("new-")
                        ? newTexts[parseInt(selectedText.split("-")[1])]?.style.fontSize || 24
                        : poster.designData.textStyles[selectedText]?.fontSize || 24}
                      onChange={(e) =>
                        handleStyleChange(
                          selectedText,
                          "fontSize",
                          parseInt(e.target.value)
                        )
                      }
                      className="w-40"
                    />
                    <span className="text-sm text-gray-700">
                      {selectedText.startsWith("new-")
                        ? newTexts[parseInt(selectedText.split("-")[1])]?.style.fontSize || 24
                        : poster.designData.textStyles[selectedText]?.fontSize || 24}
                    </span>
                  </div>
                )}
                {selectedOverlay !== null && (
                  <div className="flex items-center gap-2">
                    <label className="text-sm text-gray-700">Size:</label>
                    <input
                      type="range"
                      min="10"
                      max="1000"
                      value={selectedOverlay === "profile"
                        ? poster.designData.profileImageSettings.width
                        : poster.designData.overlaySettings.overlays[selectedOverlay].width}
                      onChange={(e) => {
                        const newSize = parseInt(e.target.value);
                        if (selectedOverlay === "profile") {
                          handleOverlayChange("width", newSize);
                          handleOverlayChange("height", newSize);
                        } else {
                          handleOverlayChange("width", newSize);
                          handleOverlayChange("height", newSize);
                        }
                      }}
                      className="w-40"
                    />
                    <span className="text-sm text-gray-700">
                      {selectedOverlay === "profile"
                        ? poster.designData.profileImageSettings.width
                        : poster.designData.overlaySettings.overlays[selectedOverlay].width}
                    </span>
                  </div>
                )}
              </div>
            )}
            <div className="relative w-full pb-[141.42%]">
              <canvas
                ref={canvasRef}
                className="absolute top-0 left-0 w-full h-full bg-white shadow-md cursor-pointer touch-none"
                onClick={handleCanvasClick}
                onDoubleClick={handleCanvasDoubleClick}
                onMouseDown={handleMouseDown}
                onMouseMove={handleMouseMove}
                onMouseUp={handleMouseUp}
                onMouseLeave={handleMouseUp}
                onTouchStart={(e) => {
                  handleCanvasTouchStart(e);
                  handleMouseDown(e);
                }}
                onTouchMove={handleMouseMove}
                onTouchEnd={(e) => {
                  handleCanvasTouchEnd(e);
                  handleMouseUp(e);
                }}
              ></canvas>
              {isEditing && (
                <input
                  ref={inputRef}
                  type="text"
                  value={editingText}
                  onChange={(e) => setEditingText(e.target.value)}
                  onBlur={finishInlineEdit}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter') {
                      finishInlineEdit();
                    } else if (e.key === 'Escape') {
                      cancelInlineEdit();
                    }
                  }}
                  style={{
                    position: 'absolute',
                    left: editPosition.x,
                    top: editPosition.y,
                    width: `${editSize.width}px`,
                    height: `${editSize.height}px`,
                    fontSize: `16px`,
                    fontFamily: 'Arial',
                    backgroundColor: 'rgba(255, 255, 255, 0.9)',
                    border: '2px solid #4285f4',
                    outline: 'none',
                    padding: '2px 4px',
                    borderRadius: '3px',
                    zIndex: 1000,
                    WebkitUserSelect: 'text',
                    userSelect: 'text',
                    WebkitTapHighlightColor: 'transparent'
                  }}
                  inputMode="text"
                  enterKeyHint="done"
                />
              )}
            </div>
            <input
              type="file"
              ref={fileInputRef}
              onChange={handleUploadLogo}
              accept="image/*"
              style={{ display: 'none' }}
            />
            {isAddingText && (
              <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
                <div className="bg-white p-6 rounded-lg max-w-md w-full">
                  <h3 className="text-lg font-semibold mb-4">Add New Text</h3>
                  <div className="mb-4">
                    <label className="block mb-1 font-medium text-gray-700">Text Content</label>
                    <input
                      type="text"
                      className="w-full px-3 py-2 border border-gray-300 rounded-md"
                      value={newTextContent}
                      onChange={(e) => setNewTextContent(e.target.value)}
                      placeholder="Enter text here"
                    />
                  </div>
                  <div className="mb-4">
                    <label className="block mb-1 font-medium text-gray-700">Font Size</label>
                    <input
                      type="number"
                      className="w-full px-3 py-2 border border-gray-300 rounded-md"
                      value={newTextStyle.fontSize}
                      onChange={(e) => setNewTextStyle({ ...newTextStyle, fontSize: parseInt(e.target.value) })}
                    />
                  </div>
                  <div className="mb-4">
                    <label className="block mb-1 font-medium text-gray-700">Color</label>
                    <input
                      type="color"
                      className="w-full h-10 border border-gray-300 rounded cursor-pointer"
                      value={newTextStyle.color}
                      onChange={(e) => setNewTextStyle({ ...newTextStyle, color: e.target.value })}
                    />
                  </div>
                  <div className="flex justify-end space-x-2">
                    <button
                      onClick={() => setIsAddingText(false)}
                      className="px-4 py-2 text-gray-600 hover:text-gray-800"
                    >
                      Cancel
                    </button>
                    <button
                      onClick={addNewText}
                      className="px-4 py-2 bg-blue-500 text-white rounded-md hover:bg-blue-600"
                    >
                      Add Text
                    </button>
                  </div>
                </div>
              </div>
            )}
          </div>
          <div className={`w-full lg:w-80 bg-white border border-gray-300 rounded-lg p-4 shadow-md transition-all duration-300 ${sidebarOpen ? 'block' : 'hidden lg:block'}`}>
            <h3 className="text-lg font-semibold mt-0 pb-3 border-b border-gray-200">Edit Selection</h3>
            {selectedText && (
              <div className="mt-4">
                <div className="mb-4">
                  <label className="block mb-1 font-medium text-gray-700">
                    {selectedText.startsWith('new-')
                      ? 'Custom Text'
                      : selectedText.charAt(0).toUpperCase() + selectedText.slice(1)}
                  </label>
                  <input
                    type="text"
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    value={selectedText.startsWith('new-')
                      ? newTexts[parseInt(selectedText.split('-')[1])]?.content || ''
                      : (() => {
                        switch (selectedText) {
                          case 'name': return userProfile?.name || ''; // userProfile से लें
      case 'mobile': return userProfile?.mobile || ''; // userProfile से लें
      case 'tags': return poster.tags ? poster.tags.join(', ') : '';
      default: return poster[selectedText] || '';
    }
                      })()}
                    onChange={(e) => {
                      if (selectedText.startsWith('new-')) {
                        const index = parseInt(selectedText.split('-')[1]);
                        const updatedTexts = [...newTexts];
                        updatedTexts[index].content = e.target.value;
                        setNewTexts(updatedTexts);
                      } else {
                        switch (selectedText) {
                          case 'email':
                            localStorage.setItem("userEmail", e.target.value);
                            break;
                          case 'mobile':
                            localStorage.setItem("userMobile", e.target.value);
                            break;
                          case 'tags':
                            const updatedPoster = { ...poster };
                            updatedPoster.tags = e.target.value.split(',').map(tag => tag.trim()).filter(tag => tag);
                            setPoster(updatedPoster);
                            break;
                          default:
                            handleTextChange(selectedText, e.target.value);
                        }
                      }
                    }}
                  />
                  <button
                    onClick={() => startInlineEdit(selectedText)}
                    className="mt-2 text-sm text-blue-600 hover:text-blue-800"
                  >
                    Edit inline on canvas
                  </button>
                </div>
                <div className="mb-4">
                  <label className="block mb-1 font-medium text-gray-700">Font Size</label>
                  <input
                    type="number"
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    value={selectedText.startsWith('new-')
                      ? newTexts[parseInt(selectedText.split('-')[1])]?.style.fontSize || 24
                      : poster.designData.textStyles[selectedText]?.fontSize || 24}
                    onChange={(e) => handleStyleChange(selectedText, 'fontSize', parseInt(e.target.value))}
                  />
                </div>
                <div className="mb-4">
                  <label className="block mb-1 font-medium text-gray-700">Color</label>
                  <div className="flex items-center">
                    <input
                      type="color"
                      className="w-10 h-10 border border-gray-300 rounded cursor-pointer"
                      value={selectedText.startsWith('new-')
                        ? newTexts[parseInt(selectedText.split('-')[1])]?.style.color || '#000000'
                        : poster.designData.textStyles[selectedText]?.color || '#000000'}
                      onChange={(e) => handleStyleChange(selectedText, 'color', e.target.value)}
                    />
                    <span className="ml-2 text-gray-600">
                      {selectedText.startsWith('new-')
                        ? newTexts[parseInt(selectedText.split('-')[1])]?.style.color || '#000000'
                        : poster.designData.textStyles[selectedText]?.color || '#000000'}
                    </span>
                  </div>
                </div>
                <div className="mb-4">
                  <label className="block mb-1 font-medium text-gray-700">Font Family</label>
                  <select
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    value={selectedText.startsWith('new-')
                      ? newTexts[parseInt(selectedText.split('-')[1])]?.style.fontFamily || 'Arial'
                      : poster.designData.textStyles[selectedText]?.fontFamily || 'Arial'}
                    onChange={(e) => handleStyleChange(selectedText, 'fontFamily', e.target.value)}
                  >
                    <option value="Arial">Arial</option>
                    <option value="Helvetica">Helvetica</option>
                    <option value="Times New Roman">Times New Roman</option>
                    <option value="Georgia">Georgia</option>
                    <option value="Courier New">Courier New</option>
                    <option value="Verdana">Verdana</option>
                    <option value="Trebuchet MS">Trebuchet MS</option>
                    <option value="Comic Sans MS">Comic Sans MS</option>
                    <option value="Impact">Impact</option>
                    <option value="Tahoma">Tahoma</option>
                    <option value="Palatino Linotype">Palatino Linotype</option>
                    <option value="Lucida Console">Lucida Console</option>
                    <option value="Gill Sans">Gill Sans</option>
                    <option value="Segoe UI">Segoe UI</option>
                    <option value="Futura">Futura</option>
                    <option value="Franklin Gothic Medium">Franklin Gothic Medium</option>
                  </select>
                </div>
                <div className="mb-4">
                  <label className="block mb-1 font-medium text-gray-700">Font Weight</label>
                  <select
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    value={selectedText.startsWith('new-')
                      ? newTexts[parseInt(selectedText.split('-')[1])]?.style.fontWeight || 'normal'
                      : poster.designData.textStyles[selectedText]?.fontWeight || 'normal'}
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
                    value={selectedText.startsWith('new-')
                      ? newTexts[parseInt(selectedText.split('-')[1])]?.style.fontStyle || 'normal'
                      : poster.designData.textStyles[selectedText]?.fontStyle || 'normal'}
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
                <h4 className="font-medium text-gray-800 mb-3">
                  {selectedOverlay === 'profile' ? 'Profile Image Properties' : 'Overlay Image Properties'}
                </h4>
                {selectedOverlay === 'profile' && (
                  <div className="mb-4">
                    <label className="block mb-1 font-medium text-gray-700">Visibility</label>
                    <div className="flex items-center">
                      <input
                        type="checkbox"
                        checked={poster.designData.profileImageSettings.visible}
                        onChange={(e) => handleProfileVisibilityChange(e.target.checked)}
                        className="mr-2"
                      />
                      <span>Show profile image</span>
                    </div>
                  </div>
                )}
                <div className="mb-4">
                  <label className="block mb-1 font-medium text-gray-700">Position X</label>
                  <input
                    type="number"
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    value={selectedOverlay === 'profile'
                      ? poster.designData.profileImageSettings.x
                      : poster.designData.overlaySettings.overlays[selectedOverlay].x}
                    onChange={(e) => handleOverlayChange('x', e.target.value)}
                  />
                </div>
                <div className="mb-4">
                  <label className="block mb-1 font-medium text-gray-700">Position Y</label>
                  <input
                    type="number"
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    value={selectedOverlay === 'profile'
                      ? poster.designData.profileImageSettings.y
                      : poster.designData.overlaySettings.overlays[selectedOverlay].y}
                    onChange={(e) => handleOverlayChange('y', e.target.value)}
                  />
                </div>
                <div className="mb-4">
                  <label className="block mb-1 font-medium text-gray-700">Width</label>
                  <input
                    type="number"
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    value={selectedOverlay === 'profile'
                      ? poster.designData.profileImageSettings.width
                      : poster.designData.overlaySettings.overlays[selectedOverlay].width}
                    onChange={(e) => handleOverlayChange('width', e.target.value)}
                  />
                </div>
                <div className="mb-4">
                  <label className="block mb-1 font-medium text-gray-700">Height</label>
                  <input
                    type="number"
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    value={selectedOverlay === 'profile'
                      ? poster.designData.profileImageSettings.height
                      : poster.designData.overlaySettings.overlays[selectedOverlay].height}
                    onChange={(e) => handleOverlayChange('height', e.target.value)}
                  />
                </div>
              </div>
            )}
            {!selectedText && selectedOverlay === null && (
              <div className="text-center text-gray-600 py-5">
                <p>Select a text element or image on the canvas to edit its properties</p>
                <p className="text-sm mt-2">Double-click on text to edit it directly on the canvas</p>
                <p className="text-sm mt-1">Click the red X icon to delete added elements</p>
              </div>
            )}
          </div>
        </div>
      </div>
    </>
  );
};

export default SinglePoster;