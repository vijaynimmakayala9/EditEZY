import React, { useRef, useState, useEffect } from "react";
// Mock Navbar component
const Navbar = () => (
    <nav className="bg-white shadow-sm border-b px-4 py-3">
        <div className="max-w-7xl mx-auto">
            <h1 className="text-xl font-semibold text-gray-800">Poster Editor</h1>
        </div>
    </nav>
);
const PRESET_SIZES = [
    { w: 2400, h: 2400, label: "2400×2400" },
    { w: 750, h: 1334, label: "750×1334" },
    { w: 812, h: 312, label: "812×312" },
    { w: 1200, h: 1200, label: "1200×1200" },
    { w: 1080, h: 1350, label: "1080×1350" },
    { w: 1280, h: 720, label: "1280×720" },
    { w: 2480, h: 3507, label: "2480×3507" },
    { w: 850, h: 1100, label: "850×1100" },
];
const FONT_OPTIONS = [
    "Arial",
    "Verdana",
    "Helvetica",
    "Times New Roman",
    "Courier New",
    "Georgia",
    "Palatino",
    "Garamond",
    "Comic Sans MS",
    "Impact",
    "Lucida Sans Unicode",
    "Tahoma",
    "Trebuchet MS",
];
const LOGO_SHAPES = [
    { value: "rectangle", label: "Rectangle" },
    { value: "circle", label: "Circle" },
    { value: "rounded", label: "Rounded" },
    { value: "triangle", label: "Triangle" },
];

function CustomPosterEditor() {
    const canvasRef = useRef(null);
    const textInputRef = useRef(null);
    const textareaRef = useRef(null);
    const [selectedSize, setSelectedSize] = useState(null);
    const [showEditor, setShowEditor] = useState(false);
    const [bgColor, setBgColor] = useState("#ffffff");
    const [objects, setObjects] = useState([]);
    const [backgroundImg, setBackgroundImg] = useState(null);
    const [activeIndex, setActiveIndex] = useState(null);
    const [dragging, setDragging] = useState(false);
    const [resizing, setResizing] = useState(false);
    const [offset, setOffset] = useState({ x: 0, y: 0 });
    const [textInput, setTextInput] = useState("");
    const [logoShape, setLogoShape] = useState("rectangle");
    const [showDownloadOptions, setShowDownloadOptions] = useState(false);
    const [showShareOptions, setShowShareOptions] = useState(false);
    const [isMobile, setIsMobile] = useState(window.innerWidth < 768);
    const [isEditingText, setIsEditingText] = useState(false);
    const [editingTextPosition, setEditingTextPosition] = useState({ x: 0, y: 0 });
    const [canvasScale, setCanvasScale] = useState(1);
    const [profileLogo, setProfileLogo] = useState(null);
    const [profileLogoSettings, setProfileLogoSettings] = useState({
        x: 0,
        y: 0,
        width: 300,
        height: 300,
        shape: "circle",
        visible: true
    });
    const [isResizingProfile, setIsResizingProfile] = useState(false);
    const [profileResizeHandle, setProfileResizeHandle] = useState(null);
    const [userProfile, setUserProfile] = useState(null);
    const [profileLoading, setProfileLoading] = useState(true);
    const [isDownloading, setIsDownloading] = useState(false);

    const userId = localStorage.getItem("userId");
    const userMobile = localStorage.getItem("userMobile");
    const userEmail = localStorage.getItem("userEmail");

    // Load user profile from API
    useEffect(() => {
        const fetchUserProfile = async () => {
            try {
                const response = await fetch(`https://api.editezy.com/api/users/get-profile/${userId}`);
                const data = await response.json();
                setUserProfile(data);
                // Load profile image automatically
                if (data.profileImage) {
                    const img = new Image();
                    img.crossOrigin = 'anonymous'; // Handle CORS
                    img.onload = () => {
                        setProfileLogo(img);
                        setProfileLoading(false);
                    };
                    img.onerror = () => {
                        console.error('Failed to load profile image');
                        setProfileLoading(false);
                    };
                    img.src = data.profileImage;
                } else {
                    setProfileLoading(false);
                }
            } catch (error) {
                console.error('Failed to fetch user profile:', error);
                setProfileLoading(false);
            }
        };
        if (userId) fetchUserProfile();
    }, [userId]);

    // Handle responsiveness
    useEffect(() => {
        const handleResize = () => {
            setIsMobile(window.innerWidth < 768);
        };
        window.addEventListener('resize', handleResize);
        return () => window.removeEventListener('resize', handleResize);
    }, []);

    // Calculate canvas scale for responsive display
    useEffect(() => {
        if (selectedSize) {
            const maxDisplayWidth = isMobile ? 320 : 600;
            const scale = Math.min(maxDisplayWidth / selectedSize.w, 1);
            setCanvasScale(scale);
            // Update profile logo position to top right corner
            setProfileLogoSettings(prev => ({
                ...prev,
                x: selectedSize.w - 120,
                y: 20
            }));
        }
    }, [selectedSize, isMobile]);

    // Draw text with line breaks
    const drawMultilineText = (ctx, text, x, y, font, size, color, bold, italic, maxWidth) => {
        ctx.font = `${bold ? "bold" : ""} ${italic ? "italic" : ""} ${size}px ${font}`;
        ctx.fillStyle = color;
        const lines = text.split('\n');
        const lineHeight = size * 1.2;
        for (let i = 0; i < lines.length; i++) {
            const line = lines[i];
            if (maxWidth && ctx.measureText(line).width > maxWidth) {
                // Wrap long lines
                const words = line.split(' ');
                let currentLine = '';
                let lineY = y + (i * lineHeight);
                for (let j = 0; j < words.length; j++) {
                    const testLine = currentLine + words[j] + ' ';
                    const testWidth = ctx.measureText(testLine).width;
                    if (testWidth > maxWidth && j > 0) {
                        ctx.fillText(currentLine, x, lineY);
                        currentLine = words[j] + ' ';
                        lineY += lineHeight;
                    } else {
                        currentLine = testLine;
                    }
                }
                ctx.fillText(currentLine, x, lineY);
            } else {
                ctx.fillText(line, x, y + (i * lineHeight));
            }
        }
        return lines.length * lineHeight;
    };

    // Get text dimensions including line breaks
    const getTextDimensions = (ctx, text, font, size, bold, italic) => {
        ctx.font = `${bold ? "bold" : ""} ${italic ? "italic" : ""} ${size}px ${font}`;
        const lines = text.split('\n');
        let maxWidth = 0;
        const lineHeight = size * 1.2;
        lines.forEach(line => {
            const width = ctx.measureText(line).width;
            if (width > maxWidth) maxWidth = width;
        });
        return {
            width: maxWidth,
            height: lines.length * lineHeight,
            lineCount: lines.length
        };
    };

    useEffect(() => {
        if (!selectedSize) return;
        const canvas = canvasRef.current;
        const ctx = canvas.getContext("2d");
        canvas.width = selectedSize.w;
        canvas.height = selectedSize.h;
        // background fill
        ctx.fillStyle = bgColor;
        ctx.fillRect(0, 0, canvas.width, canvas.height);
        // background poster image
        if (backgroundImg) {
            const { iw, ih, img } = backgroundImg;
            const { w: cw, h: ch } = selectedSize;
            const scale = Math.min(cw / iw, ch / ih);
            const nw = iw * scale;
            const nh = ih * scale;
            const x = (cw - nw) / 2;
            const y = (ch - nh) / 2;
            ctx.drawImage(img, x, y, nw, nh);
        }
        // draw objects
        objects.forEach((obj, i) => {
            if (obj.type === "text" && !(i === activeIndex && isEditingText)) {
                drawMultilineText(ctx, obj.text, obj.x, obj.y, obj.font, obj.size, obj.color, obj.bold, obj.italic);
            }
            if (obj.type === "image" && obj.img) {
                // Save current context
                ctx.save();
                // Apply shape transformations
                if (obj.shape === "circle") {
                    ctx.beginPath();
                    ctx.arc(obj.x + obj.width / 2, obj.y + obj.height / 2, obj.width / 2, 0, Math.PI * 2);
                    ctx.closePath();
                    ctx.clip();
                } else if (obj.shape === "rounded") {
                    const radius = 20;
                    ctx.beginPath();
                    ctx.moveTo(obj.x + radius, obj.y);
                    ctx.lineTo(obj.x + obj.width - radius, obj.y);
                    ctx.quadraticCurveTo(obj.x + obj.width, obj.y, obj.x + obj.width, obj.y + radius);
                    ctx.lineTo(obj.x + obj.width, obj.y + obj.height - radius);
                    ctx.quadraticCurveTo(obj.x + obj.width, obj.y + obj.height, obj.x + obj.width - radius, obj.y + obj.height);
                    ctx.lineTo(obj.x + radius, obj.y + obj.height);
                    ctx.quadraticCurveTo(obj.x, obj.y + obj.height, obj.x, obj.y + obj.height - radius);
                    ctx.lineTo(obj.x, obj.y + radius);
                    ctx.quadraticCurveTo(obj.x, obj.y, obj.x + radius, obj.y);
                    ctx.closePath();
                    ctx.clip();
                } else if (obj.shape === "triangle") {
                    ctx.beginPath();
                    ctx.moveTo(obj.x + obj.width / 2, obj.y);
                    ctx.lineTo(obj.x + obj.width, obj.y + obj.height);
                    ctx.lineTo(obj.x, obj.y + obj.height);
                    ctx.closePath();
                    ctx.clip();
                }
                ctx.drawImage(obj.img, obj.x, obj.y, obj.width, obj.height);
                // Restore context for the selection border
                ctx.restore();
                // Draw selection indicators for active image - ONLY when not downloading
                if (i === activeIndex && !isDownloading) {
                    ctx.strokeStyle = "#3b82f6";
                    ctx.lineWidth = 2;
                    if (obj.shape === "circle") {
                        ctx.beginPath();
                        ctx.arc(obj.x + obj.width / 2, obj.y + obj.height / 2, obj.width / 2, 0, Math.PI * 2);
                        ctx.stroke();
                    } else if (obj.shape === "rounded") {
                        const radius = 20;
                        ctx.beginPath();
                        ctx.moveTo(obj.x + radius, obj.y);
                        ctx.lineTo(obj.x + obj.width - radius, obj.y);
                        ctx.quadraticCurveTo(obj.x + obj.width, obj.y, obj.x + obj.width, obj.y + radius);
                        ctx.lineTo(obj.x + obj.width, obj.y + obj.height - radius);
                        ctx.quadraticCurveTo(obj.x + obj.width, obj.y + obj.height, obj.x + obj.width - radius, obj.y + obj.height);
                        ctx.lineTo(obj.x + radius, obj.y + obj.height);
                        ctx.quadraticCurveTo(obj.x, obj.y + obj.height, obj.x, obj.y + obj.height - radius);
                        ctx.lineTo(obj.x, obj.y + radius);
                        ctx.quadraticCurveTo(obj.x, obj.y, obj.x + radius, obj.y);
                        ctx.closePath();
                        ctx.stroke();
                    } else if (obj.shape === "triangle") {
                        ctx.beginPath();
                        ctx.moveTo(obj.x + obj.width / 2, obj.y);
                        ctx.lineTo(obj.x + obj.width, obj.y + obj.height);
                        ctx.lineTo(obj.x, obj.y + obj.height);
                        ctx.closePath();
                        ctx.stroke();
                    } else {
                        ctx.strokeRect(obj.x, obj.y, obj.width, obj.height);
                    }
                    // Draw resize handles
                    const handleSize = 8;
                    ctx.fillStyle = "#3b82f6";
                    // Corner handles
                    const handles = [
                        { x: obj.x - handleSize / 2, y: obj.y - handleSize / 2 },
                        { x: obj.x + obj.width - handleSize / 2, y: obj.y - handleSize / 2 },
                        { x: obj.x - handleSize / 2, y: obj.y + obj.height - handleSize / 2 },
                        { x: obj.x + obj.width - handleSize / 2, y: obj.y + obj.height - handleSize / 2 }
                    ];
                    handles.forEach(handle => {
                        ctx.fillRect(handle.x, handle.y, handleSize, handleSize);
                    });
                }
            }
        });
        // Draw profile logo if visible
        if (profileLogo && profileLogoSettings.visible) {
            const { x, y, width, height, shape } = profileLogoSettings;
            ctx.save();
            // Apply shape clipping
            if (shape === "circle") {
                ctx.beginPath();
                ctx.arc(x + width / 2, y + height / 2, width / 2, 0, Math.PI * 2);
                ctx.closePath();
                ctx.clip();
            } else if (shape === "rounded") {
                const radius = 20;
                ctx.beginPath();
                ctx.moveTo(x + radius, y);
                ctx.lineTo(x + width - radius, y);
                ctx.quadraticCurveTo(x + width, y, x + width, y + radius);
                ctx.lineTo(x + width, y + height - radius);
                ctx.quadraticCurveTo(x + width, y + height, x + width - radius, y + height);
                ctx.lineTo(x + radius, y + height);
                ctx.quadraticCurveTo(x, y + height, x, y + height - radius);
                ctx.lineTo(x, y + radius);
                ctx.quadraticCurveTo(x, y, x + radius, y);
                ctx.closePath();
                ctx.clip();
            } else if (shape === "triangle") {
                ctx.beginPath();
                ctx.moveTo(x + width / 2, y);
                ctx.lineTo(x + width, y + height);
                ctx.lineTo(x, y + height);
                ctx.closePath();
                ctx.clip();
            }
            ctx.drawImage(profileLogo, x, y, width, height);
            ctx.restore();
            // Draw selection border and resize handles if profile logo is active - ONLY when not downloading
            if (activeIndex === 'profile' && !isDownloading) {
                ctx.strokeStyle = "#3b82f6";
                ctx.lineWidth = 2;
                if (shape === "circle") {
                    ctx.beginPath();
                    ctx.arc(x + width / 2, y + height / 2, width / 2, 0, Math.PI * 2);
                    ctx.stroke();
                } else if (shape === "rounded") {
                    const radius = 20;
                    ctx.beginPath();
                    ctx.moveTo(x + radius, y);
                    ctx.lineTo(x + width - radius, y);
                    ctx.quadraticCurveTo(x + width, y, x + width, y + radius);
                    ctx.lineTo(x + width, y + height - radius);
                    ctx.quadraticCurveTo(x + width, y + height, x + width - radius, y + height);
                    ctx.lineTo(x + radius, y + height);
                    ctx.quadraticCurveTo(x, y + height, x, y + height - radius);
                    ctx.lineTo(x, y + radius);
                    ctx.quadraticCurveTo(x, y, x + radius, y);
                    ctx.closePath();
                    ctx.stroke();
                } else if (shape === "triangle") {
                    ctx.beginPath();
                    ctx.moveTo(x + width / 2, y);
                    ctx.lineTo(x + width, y + height);
                    ctx.lineTo(x, y + height);
                    ctx.closePath();
                    ctx.stroke();
                } else {
                    ctx.strokeRect(x, y, width, height);
                }
                // Draw resize handles
                const handleSize = 8;
                ctx.fillStyle = "#3b82f6";
                const handles = [
                    { x: x - handleSize / 2, y: y - handleSize / 2 },
                    { x: x + width - handleSize / 2, y: y - handleSize / 2 },
                    { x: x - handleSize / 2, y: y + height - handleSize / 2 },
                    { x: x + width - handleSize / 2, y: y + height - handleSize / 2 }
                ];
                handles.forEach(handle => {
                    ctx.fillRect(handle.x, handle.y, handleSize, handleSize);
                });
            }
        }
        // Draw text selection border (only when selected but not editing) - ONLY when not downloading
        if (activeIndex !== null && objects[activeIndex] && objects[activeIndex].type === "text" && !isEditingText && !isDownloading) {
            const obj = objects[activeIndex];
            const dimensions = getTextDimensions(ctx, obj.text, obj.font, obj.size, obj.bold, obj.italic);
            const width = dimensions.width;
            const height = dimensions.height;
            ctx.strokeStyle = "#ef4444";
            ctx.lineWidth = 2;
            ctx.strokeRect(obj.x - 2, obj.y - obj.size - 2, width + 4, height + 4);
            // Draw resize handles for text
            const handleSize = 8;
            ctx.fillStyle = "#ef4444";
            const textBottom = obj.y + height - obj.size;
            const textTop = obj.y - obj.size;
            ctx.fillRect(obj.x - handleSize / 2, textTop - handleSize / 2, handleSize, handleSize); // top-left
            ctx.fillRect(obj.x + width - handleSize / 2, textTop - handleSize / 2, handleSize, handleSize); // top-right
            ctx.fillRect(obj.x - handleSize / 2, textBottom - handleSize / 2, handleSize, handleSize); // bottom-left
            ctx.fillRect(obj.x + width - handleSize / 2, textBottom - handleSize / 2, handleSize, handleSize); // bottom-right
        }
    }, [selectedSize, bgColor, objects, backgroundImg, activeIndex, isEditingText, profileLogo, profileLogoSettings, isDownloading]);

    // Update text input when active object changes
    useEffect(() => {
        if (activeIndex !== null && objects[activeIndex] && objects[activeIndex].type === "text") {
            setTextInput(objects[activeIndex].text);
        } else {
            setTextInput("");
        }
    }, [activeIndex, objects]);

    // Handle touch and mouse events
    const getEventPosition = (e) => {
        const rect = canvasRef.current.getBoundingClientRect();
        let clientX, clientY;
        if (e.touches) {
            clientX = e.touches[0].clientX;
            clientY = e.touches[0].clientY;
        } else {
            clientX = e.clientX;
            clientY = e.clientY;
        }
        const x = (clientX - rect.left) / canvasScale;
        const y = (clientY - rect.top) / canvasScale;
        return { x, y };
    };

    // Check if click is on resize handle for text
    const getTextResizeHandle = (x, y, obj) => {
        const ctx = canvasRef.current.getContext("2d");
        const dimensions = getTextDimensions(ctx, obj.text, obj.font, obj.size, obj.bold, obj.italic);
        const width = dimensions.width;
        const height = dimensions.height;
        const textTop = obj.y - obj.size;
        const textBottom = obj.y + height - obj.size;
        const handleSize = 8;
        // Define handle positions
        const handles = [
            { x: obj.x - handleSize / 2, y: textTop - handleSize / 2, type: 'nw' },
            { x: obj.x + width - handleSize / 2, y: textTop - handleSize / 2, type: 'ne' },
            { x: obj.x - handleSize / 2, y: textBottom - handleSize / 2, type: 'sw' },
            { x: obj.x + width - handleSize / 2, y: textBottom - handleSize / 2, type: 'se' }
        ];
        for (let handle of handles) {
            if (x >= handle.x && x <= handle.x + handleSize && y >= handle.y && y <= handle.y + handleSize) {
                return handle.type;
            }
        }
        return null;
    };

    // Check if click is on profile logo resize handle
    const getProfileResizeHandle = (x, y) => {
        const { x: px, y: py, width, height } = profileLogoSettings;
        const handleSize = 8;
        const handles = [
            { x: px - handleSize / 2, y: py - handleSize / 2, type: 'nw' },
            { x: px + width - handleSize / 2, y: py - handleSize / 2, type: 'ne' },
            { x: px - handleSize / 2, y: py + height - handleSize / 2, type: 'sw' },
            { x: px + width - handleSize / 2, y: py + height - handleSize / 2, type: 'se' }
        ];
        for (let handle of handles) {
            if (x >= handle.x && x <= handle.x + handleSize && y >= handle.y && y <= handle.y + handleSize) {
                return handle.type;
            }
        }
        return null;
    };

    // Check if click is on profile logo
    const isClickOnProfileLogo = (x, y) => {
        if (!profileLogoSettings.visible) return false;
        const { x: px, y: py, width, height, shape } = profileLogoSettings;
        if (shape === "circle") {
            const centerX = px + width / 2;
            const centerY = py + height / 2;
            const radius = width / 2;
            return Math.pow(x - centerX, 2) + Math.pow(y - centerY, 2) <= Math.pow(radius, 2);
        } else if (shape === "triangle") {
            const barycentric = (x1, y1, x2, y2, x3, y3, x, y) => {
                const denominator = ((y2 - y3) * (x1 - x3) + (x3 - x2) * (y1 - y3));
                const a = ((y2 - y3) * (x - x3) + (x3 - x2) * (y - y3)) / denominator;
                const b = ((y3 - y1) * (x - x3) + (x1 - x3) * (y - y3)) / denominator;
                const c = 1 - a - b;
                return { a, b, c };
            };
            const { a, b, c } = barycentric(
                px + width / 2, py,
                px + width, py + height,
                px, py + height,
                x, y
            );
            return a >= 0 && a <= 1 && b >= 0 && b <= 1 && c >= 0 && c <= 1;
        } else {
            return x >= px && x <= px + width && y >= py && y <= py + height;
        }
    };

    const handleStart = (e) => {
        if (!selectedSize || isEditingText) return;
        e.preventDefault();
        const { x, y } = getEventPosition(e);
        // Check for profile logo first
        if (profileLogo && profileLogoSettings.visible) {
            const resizeHandle = getProfileResizeHandle(x, y);
            if (resizeHandle) {
                setIsResizingProfile(true);
                setProfileResizeHandle(resizeHandle);
                return;
            }
            if (isClickOnProfileLogo(x, y)) {
                setActiveIndex('profile');
                setDragging(true);
                setOffset({ x: x - profileLogoSettings.x, y: y - profileLogoSettings.y });
                return;
            }
        }
        // Check for resize handles on text objects
        if (activeIndex !== null && typeof activeIndex === 'number' && objects[activeIndex] && objects[activeIndex].type === "text") {
            const resizeHandle = getTextResizeHandle(x, y, objects[activeIndex]);
            if (resizeHandle) {
                setResizing(resizeHandle);
                return;
            }
        }
        // Check for resize handles on image objects
        if (activeIndex !== null && typeof activeIndex === 'number' && objects[activeIndex] && objects[activeIndex].type === "image") {
            const resizeHandle = getResizeHandle(x, y, objects[activeIndex]);
            if (resizeHandle) {
                setResizing(resizeHandle);
                return;
            }
        }
        // Check for object selection
        for (let i = objects.length - 1; i >= 0; i--) {
            const obj = objects[i];
            if (obj.type === "text") {
                const canvas = canvasRef.current;
                const ctx = canvas.getContext("2d");
                const dimensions = getTextDimensions(ctx, obj.text, obj.font, obj.size, obj.bold, obj.italic);
                const width = dimensions.width;
                const height = dimensions.height;
                if (x >= obj.x && x <= obj.x + width && y <= obj.y && y >= obj.y - obj.size - height + obj.size) {
                    setActiveIndex(i);
                    setDragging(true);
                    setOffset({ x: x - obj.x, y: y - obj.y });
                    return;
                }
            }
            if (obj.type === "image") {
                let isInside = false;
                if (obj.shape === "circle") {
                    const centerX = obj.x + obj.width / 2;
                    const centerY = obj.y + obj.height / 2;
                    const radius = obj.width / 2;
                    isInside = Math.pow(x - centerX, 2) + Math.pow(y - centerY, 2) <= Math.pow(radius, 2);
                } else if (obj.shape === "triangle") {
                    const barycentric = (x1, y1, x2, y2, x3, y3, x, y) => {
                        const denominator = ((y2 - y3) * (x1 - x3) + (x3 - x2) * (y1 - y3));
                        const a = ((y2 - y3) * (x - x3) + (x3 - x2) * (y - y3)) / denominator;
                        const b = ((y3 - y1) * (x - x3) + (x1 - x3) * (y - y3)) / denominator;
                        const c = 1 - a - b;
                        return { a, b, c };
                    };
                    const { a, b, c } = barycentric(
                        obj.x + obj.width / 2, obj.y,
                        obj.x + obj.width, obj.y + obj.height,
                        obj.x, obj.y + obj.height,
                        x, y
                    );
                    isInside = a >= 0 && a <= 1 && b >= 0 && b <= 1 && c >= 0 && c <= 1;
                } else {
                    isInside = x >= obj.x && x <= obj.x + obj.width && y >= obj.y && y <= obj.y + obj.height;
                }
                if (isInside) {
                    setActiveIndex(i);
                    setDragging(true);
                    setOffset({ x: x - obj.x, y: y - obj.y });
                    return;
                }
            }
        }
        // Clicked on empty space - deselect
        setActiveIndex(null);
        setIsEditingText(false);
    };

    // Check if click is on resize handle for images
    const getResizeHandle = (x, y, obj) => {
        if (obj.type !== "image") return null;
        const handleSize = 8;
        const handles = [
            { x: obj.x - handleSize / 2, y: obj.y - handleSize / 2, type: 'nw' },
            { x: obj.x + obj.width - handleSize / 2, y: obj.y - handleSize / 2, type: 'ne' },
            { x: obj.x - handleSize / 2, y: obj.y + obj.height - handleSize / 2, type: 'sw' },
            { x: obj.x + obj.width - handleSize / 2, y: obj.y + obj.height - handleSize / 2, type: 'se' }
        ];
        for (let handle of handles) {
            if (x >= handle.x && x <= handle.x + handleSize && y >= handle.y && y <= handle.y + handleSize) {
                return handle.type;
            }
        }
        return null;
    };

    const handleMove = (e) => {
        if (isEditingText) return;
        if (!dragging && !resizing && !isResizingProfile) return;
        e.preventDefault();
        const { x, y } = getEventPosition(e);
        if (isResizingProfile && profileLogo) {
            const { x: px, y: py, width, height } = profileLogoSettings;
            let newWidth = width;
            let newHeight = height;
            let newX = px;
            let newY = py;
            switch (profileResizeHandle) {
                case 'se':
                    newWidth = Math.max(20, x - px);
                    newHeight = Math.max(20, y - py);
                    break;
                case 'sw':
                    newWidth = Math.max(20, px + width - x);
                    newHeight = Math.max(20, y - py);
                    newX = x;
                    break;
                case 'ne':
                    newWidth = Math.max(20, x - px);
                    newHeight = Math.max(20, py + height - y);
                    newY = y;
                    break;
                case 'nw':
                    newWidth = Math.max(20, px + width - x);
                    newHeight = Math.max(20, py + height - y);
                    newX = x;
                    newY = y;
                    break;
            }
            setProfileLogoSettings({
                ...profileLogoSettings,
                width: newWidth,
                height: newHeight,
                x: newX,
                y: newY
            });
        } else if (resizing && activeIndex !== null && typeof activeIndex === 'number') {
            const obj = objects[activeIndex];
            if (obj.type === "image") {
                let newWidth = obj.width;
                let newHeight = obj.height;
                let newX = obj.x;
                let newY = obj.y;
                switch (resizing) {
                    case 'se':
                        newWidth = Math.max(20, x - obj.x);
                        newHeight = Math.max(20, y - obj.y);
                        break;
                    case 'sw':
                        newWidth = Math.max(20, obj.x + obj.width - x);
                        newHeight = Math.max(20, y - obj.y);
                        newX = x;
                        break;
                    case 'ne':
                        newWidth = Math.max(20, x - obj.x);
                        newHeight = Math.max(20, obj.y + obj.height - y);
                        newY = y;
                        break;
                    case 'nw':
                        newWidth = Math.max(20, obj.x + obj.width - x);
                        newHeight = Math.max(20, obj.y + obj.height - y);
                        newX = x;
                        newY = y;
                        break;
                }
                setObjects((prev) =>
                    prev.map((o, i) =>
                        i === activeIndex
                            ? { ...o, width: newWidth, height: newHeight, x: newX, y: newY }
                            : o
                    )
                );
            } else if (obj.type === "text") {
                // Handle text resizing by adjusting font size
                const ctx = canvasRef.current.getContext("2d");
                const dimensions = getTextDimensions(ctx, obj.text, obj.font, obj.size, obj.bold, obj.italic);
                let newSize = obj.size;
                let newX = obj.x;
                let newY = obj.y;
                switch (resizing) {
                    case 'se':
                        newSize = Math.max(10, obj.size + (y - obj.y) / 5);
                        break;
                    case 'sw':
                        newSize = Math.max(10, obj.size + (y - obj.y) / 5);
                        break;
                    case 'ne':
                        newSize = Math.max(10, obj.size - (y - obj.y) / 5);
                        break;
                    case 'nw':
                        newSize = Math.max(10, obj.size - (y - obj.y) / 5);
                        break;
                }
                setObjects((prev) =>
                    prev.map((o, i) =>
                        i === activeIndex
                            ? {
                                ...o,
                                size: newSize,
                                x: newX,
                                y: newY
                            }
                            : o
                    )
                );
            }
        } else if (dragging) {
            if (activeIndex === 'profile') {
                setProfileLogoSettings({
                    ...profileLogoSettings,
                    x: x - offset.x,
                    y: y - offset.y
                });
            } else if (activeIndex !== null && typeof activeIndex === 'number') {
                setObjects((prev) =>
                    prev.map((obj, i) =>
                        i === activeIndex ? { ...obj, x: x - offset.x, y: y - offset.y } : obj
                    )
                );
            }
        }
    };

    const handleEnd = () => {
        setDragging(false);
        setResizing(false);
        setIsResizingProfile(false);
        setProfileResizeHandle(null);
    };

    // Double-click to edit text
    const handleDoubleClick = (e) => {
        if (!selectedSize) return;
        const { x, y } = getEventPosition(e);
        // Check if double-clicked on profile logo
        if (profileLogo && profileLogoSettings.visible && isClickOnProfileLogo(x, y)) {
            // Don't edit profile logo on double-click
            return;
        }
        // Check for text objects
        for (let i = objects.length - 1; i >= 0; i--) {
            const obj = objects[i];
            if (obj.type === "text") {
                const canvas = canvasRef.current;
                const ctx = canvas.getContext("2d");
                const dimensions = getTextDimensions(ctx, obj.text, obj.font, obj.size, obj.bold, obj.italic);
                const width = dimensions.width;
                const height = dimensions.height;
                if (x >= obj.x && x <= obj.x + width && y <= obj.y && y >= obj.y - obj.size - height + obj.size) {
                    setActiveIndex(i);
                    setIsEditingText(true);
                    const rect = canvasRef.current.getBoundingClientRect();
                    setEditingTextPosition({
                        x: rect.left + (obj.x * canvasScale),
                        y: rect.top + ((obj.y - obj.size) * canvasScale)
                    });
                    setTimeout(() => {
                        textareaRef.current?.focus();
                        textareaRef.current?.select();
                    }, 100);
                    return;
                }
            }
        }
    };

    // Add event listeners for touch and mouse
    useEffect(() => {
        const canvas = canvasRef.current;
        if (!canvas) return;
        // Mouse events
        canvas.addEventListener("mousedown", handleStart);
        canvas.addEventListener("mousemove", handleMove);
        canvas.addEventListener("mouseup", handleEnd);
        canvas.addEventListener("mouseleave", handleEnd);
        canvas.addEventListener("dblclick", handleDoubleClick);
        // Touch events
        canvas.addEventListener("touchstart", handleStart);
        canvas.addEventListener("touchmove", handleMove);
        canvas.addEventListener("touchend", handleEnd);
        return () => {
            canvas.removeEventListener("mousedown", handleStart);
            canvas.removeEventListener("mousemove", handleMove);
            canvas.removeEventListener("mouseup", handleEnd);
            canvas.removeEventListener("mouseleave", handleEnd);
            canvas.removeEventListener("dblclick", handleDoubleClick);
            canvas.removeEventListener("touchstart", handleStart);
            canvas.removeEventListener("touchmove", handleMove);
            canvas.removeEventListener("touchend", handleEnd);
        };
    });

    // Add Text
    const handleAddText = () => {
        const newTextObj = {
            type: "text",
            text: "New Text",
            x: 100,
            y: 100,
            size: 40,
            color: "black",
            font: "Arial",
            bold: false,
            italic: false,
        };
        setObjects((prev) => [...prev, newTextObj]);
        setActiveIndex(objects.length);
    };

    // Add Logo
    const handleAddLogo = (e) => {
        const file = e.target.files[0];
        if (!file) return;
        const img = new Image();
        img.onload = () => {
            const newImageObj = {
                type: "image",
                img,
                x: 150,
                y: 150,
                width: 200,
                height: 200,
                shape: logoShape,
            };
            setObjects((prev) => {
                const updated = [...prev, newImageObj];
                setActiveIndex(updated.length - 1);
                return updated;
            });
        };
        img.src = URL.createObjectURL(file);
    };

    // Upload Poster (background image)
    const handleUploadPoster = (e) => {
        const file = e.target.files[0];
        if (!file) return;
        const img = new Image();
        img.onload = () => {
            setBackgroundImg({ img, iw: img.width, ih: img.height });
        };
        img.src = URL.createObjectURL(file);
    };

    // Upload Profile Logo
    const handleUploadProfileLogo = (e) => {
        const file = e.target.files[0];
        if (!file) return;
        const img = new Image();
        img.onload = () => {
            setProfileLogo(img);
            // If this is the first time setting the profile logo, position it at top right
            if (selectedSize) {
                setProfileLogoSettings({
                    ...profileLogoSettings,
                    x: selectedSize.w - 120,
                    y: 20,
                    width: 100,
                    height: 100,
                    visible: true
                });
            }
            setActiveIndex('profile');
        };
        img.src = URL.createObjectURL(file);
    };

    // Update active object props
    const updateActiveObject = (changes) => {
        if (activeIndex === null) return;
        if (activeIndex === 'profile') {
            setProfileLogoSettings(prev => ({ ...prev, ...changes }));
        } else if (typeof activeIndex === 'number') {
            setObjects((prev) =>
                prev.map((obj, i) => (i === activeIndex ? { ...obj, ...changes } : obj))
            );
        }
    };

    // Handle text edit (editable field)
    const handleTextChange = (e) => {
        const updatedText = e.target.value;
        setTextInput(updatedText);
        if (activeIndex !== null && typeof activeIndex === 'number') {
            updateActiveObject({ text: updatedText });
        }
    };

    // Handle inline text editing
    const handleInlineTextChange = (e) => {
        const updatedText = e.target.value;
        setTextInput(updatedText);
        if (activeIndex !== null && typeof activeIndex === 'number') {
            updateActiveObject({ text: updatedText });
        }
    };

    const handleInlineTextBlur = () => {
        setIsEditingText(false);
    };

    const handleInlineTextKeyDown = (e) => {
        if (e.key === 'Enter' && e.ctrlKey) {
            e.preventDefault();
            setIsEditingText(false);
        }
        if (e.key === 'Escape') {
            setIsEditingText(false);
        }
    };

    // Handle size selection
    const handleSizeSelect = (s) => {
        setSelectedSize(s);
        setShowEditor(true);

        // Create initial objects including user info
        const initialObjects = [];

        // Profile logo position
        setProfileLogoSettings(prev => ({
            ...prev,
            x: s.w - 120,
            y: 20
        }));

        // Add mobile number at bottom right
        if (userMobile) {
            initialObjects.push({
                type: "text",
                text: userMobile,
                x: s.w - 300, // adjust as needed
                y: s.h - 50,
                size: 36,
                color: "#333333",
                font: "Arial",
                bold: false,
                italic: false,
            });
        }

        // Add email at bottom left
        if (userEmail) {
            initialObjects.push({
                type: "text",
                text: userEmail,
                x: 50,
                y: s.h - 50,
                size: 36,
                color: "#333333",
                font: "Arial",
                bold: false,
                italic: false,
            });
        }

        setObjects(initialObjects);
    };

    // Download poster
    const handleDownload = (format = 'png') => {
        setIsDownloading(true);
        // Use setTimeout to ensure the canvas redraws without selection indicators
        setTimeout(() => {
            const canvas = canvasRef.current;
            const link = document.createElement('a');
            link.className = 'no-outline';
            link.style.outline = 'none';
            if (format === 'png') {
                link.href = canvas.toDataURL('image/png');
                link.download = 'poster.png';
            } else if (format === 'jpeg') {
                link.href = canvas.toDataURL('image/jpeg', 0.9);
                link.download = 'poster.jpg';
            }
            document.body.appendChild(link);
            link.click();
            document.body.removeChild(link);
            setIsDownloading(false);
            setShowDownloadOptions(false);
        }, 100);
    };

    // Share poster
    const handleShare = async () => {
        if (navigator.share) {
            try {
                const canvas = canvasRef.current;
                const dataUrl = canvas.toDataURL('image/jpeg', 0.9);
                const response = await fetch(dataUrl);
                const blob = await response.blob();
                const file = new File([blob], 'poster.jpg', { type: 'image/jpeg' });
                await navigator.share({
                    title: 'My Poster Design',
                    files: [file]
                });
            } catch (err) {
                console.error('Error sharing:', err);
            }
        } else {
            alert('Web Share API is not supported in your browser.');
        }
    };

    // Close dropdowns when clicking outside
    useEffect(() => {
        const handleClickOutside = () => {
            setShowDownloadOptions(false);
            setShowShareOptions(false);
        };
        document.addEventListener('click', handleClickOutside);
        return () => document.removeEventListener('click', handleClickOutside);
    }, []);

    return (
        <>
            <Navbar />
            <div className="min-h-screen bg-pink-50 p-4 mb-5">
                <div className="max-w-7xl mx-auto">
                    <div className="flex items-center mb-4">
                        {showEditor && (
                            <button
                                onClick={() => {
                                    setShowEditor(false);
                                    setSelectedSize(null);
                                    setObjects([]);
                                    setBackgroundImg(null);
                                    setActiveIndex(null);
                                    setIsEditingText(false);
                                }}
                                className="mr-4 bg-blue-500 text-white px-4 py-2 rounded-lg hover:bg-blue-600 transition-colors"
                            >
                                ←
                            </button>
                        )}
                        {!showEditor && (
                            <button
                                onClick={() => window.history.back()}
                                className="bg-blue-500 text-white px-4 py-2 rounded-lg hover:bg-blue-600 transition-colors text-lg font-bold mr-3"
                            >
                                ←
                            </button>
                        )}
                        <h1 className="text-2xl font-semibold text-gray-800">Create Custom Post</h1>
                        {userProfile && (
                            <div className="ml-auto flex items-center bg-white rounded-lg px-3 py-2 shadow-sm">
                                <div className="w-8 h-8 rounded-full overflow-hidden mr-2">
                                    {profileLogo && (
                                        <img
                                            src={userProfile.profileImage}
                                            alt={userProfile.name}
                                            className="w-full h-full object-cover"
                                        />
                                    )}
                                </div>
                                <span className="text-sm font-medium text-gray-700">{userProfile.name}</span>
                            </div>
                        )}
                    </div>
                    {profileLoading && (
                        <div className="bg-blue-100 border border-blue-400 text-blue-700 px-4 py-3 rounded mb-4">
                            Loading your profile...
                        </div>
                    )}
                    {/* Size Grid */}
                    {!showEditor && (
                        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 sm:gap-6">
                            {PRESET_SIZES.map((s) => (
                                <button
                                    key={s.label}
                                    onClick={() => handleSizeSelect(s)}
                                    className="bg-white rounded-2xl p-4 sm:p-6 md:p-8 shadow-md h-32 sm:h-40 flex items-center justify-center hover:shadow-lg transition-shadow"
                                >
                                    <span className="text-sm font-medium text-gray-700">{s.label}</span>
                                </button>
                            ))}
                        </div>
                    )}
                    {/* Editor */}
                    {showEditor && selectedSize && (
                        <div className="mt-6 flex flex-col lg:flex-row gap-4 sm:gap-6">
                            {/* Left: Canvas with poster upload */}
                            <div className="flex-1 bg-white p-3 sm:p-4 rounded-lg shadow relative">
                                {/* 🔹 Size Adjuster at the top of canvas */}
                                {(activeIndex !== null || activeIndex === 'profile') && (
                                    <div className="mb-4 p-2 bg-gray-100 rounded flex items-center gap-3">
                                        <label className="text-sm font-medium text-gray-700">Adjust Size:</label>
                                        <input
                                            type="range"
                                            min={(activeIndex === 'profile' || (objects[activeIndex]?.type === 'image')) ? 20 : 10}
                                            max={(activeIndex === 'profile' || (objects[activeIndex]?.type === 'image')) ? 1000 : 200}
                                            value={
                                                activeIndex === 'profile'
                                                    ? profileLogoSettings.width
                                                    : objects[activeIndex]?.type === 'image'
                                                        ? objects[activeIndex].width
                                                        : objects[activeIndex]?.size
                                            }
                                            onChange={(e) => {
                                                const newSize = parseInt(e.target.value);
                                                if (activeIndex === 'profile') {
                                                    setProfileLogoSettings(prev => ({ ...prev, width: newSize, height: newSize }));
                                                } else if (objects[activeIndex]?.type === 'image') {
                                                    updateActiveObject({ width: newSize, height: newSize });
                                                } else if (objects[activeIndex]?.type === 'text') {
                                                    updateActiveObject({ size: newSize });
                                                }
                                            }}
                                            className="flex-1"
                                        />
                                        <span className="text-sm text-gray-600">
                                            {activeIndex === 'profile'
                                                ? `${Math.round(profileLogoSettings.width)}px`
                                                : objects[activeIndex]?.type === 'image'
                                                    ? `${Math.round(objects[activeIndex].width)}px`
                                                    : `${objects[activeIndex]?.size}px`}
                                        </span>
                                    </div>
                                )}
                                {/* Canvas & Uploads */}
                                <div className="mb-3">
                                    <label className="block text-sm mb-1 font-medium text-gray-700">Upload Poster (Background)</label>
                                    <input
                                        type="file"
                                        accept="image/*"
                                        onChange={handleUploadPoster}
                                        className="block w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-pink-50 file:text-pink-700 hover:file:bg-pink-100"
                                    />
                                </div>
                                <div className="border mt-3 rounded overflow-hidden inline-block max-w-full relative">
                                    <canvas
                                        ref={canvasRef}
                                        style={{
                                            width: selectedSize.w * canvasScale,
                                            height: selectedSize.h * canvasScale,
                                            maxWidth: "100%",
                                            height: "auto",
                                            border: "1px solid #ccc",
                                            cursor: dragging ? "grabbing" : (resizing || isResizingProfile) ? "nw-resize" : "default",
                                            touchAction: "none",
                                        }}
                                    />
                                    {/* Inline text editing textarea */}
                                    {isEditingText && activeIndex !== null && typeof activeIndex === 'number' && objects[activeIndex] && (
                                        <textarea
                                            ref={textareaRef}
                                            value={textInput}
                                            onChange={handleInlineTextChange}
                                            onBlur={handleInlineTextBlur}
                                            onKeyDown={handleInlineTextKeyDown}
                                            className="absolute border-2 border-blue-500 bg-white bg-opacity-90 text-black outline-none resize-none overflow-hidden"
                                            style={{
                                                left: editingTextPosition.x - (canvasRef.current?.getBoundingClientRect().left || 0),
                                                top: editingTextPosition.y - (canvasRef.current?.getBoundingClientRect().top || 0),
                                                fontSize: `${objects[activeIndex].size * canvasScale}px`,
                                                fontFamily: objects[activeIndex].font,
                                                fontWeight: objects[activeIndex].bold ? 'bold' : 'normal',
                                                fontStyle: objects[activeIndex].italic ? 'italic' : 'normal',
                                                color: objects[activeIndex].color,
                                                minWidth: '100px',
                                                minHeight: `${objects[activeIndex].size * canvasScale}px`,
                                                lineHeight: '1.2',
                                                padding: '2px',
                                                zIndex: 1000
                                            }}
                                            rows={textInput.split('\n').length || 1}
                                        />
                                    )}
                                </div>
                                {/* Download & Share Buttons */}
                                <div className="mt-4 flex flex-wrap gap-3">
                                    <div className="relative w-full sm:w-auto">
                                        <button
                                            onClick={(e) => {
                                                e.stopPropagation();
                                                setShowDownloadOptions(!showDownloadOptions);
                                                setShowShareOptions(false);
                                            }}
                                            className="bg-blue-500 text-white px-4 py-2 rounded-lg hover:bg-blue-600 transition-colors w-full sm:w-auto"
                                        >
                                            Download
                                        </button>
                                        {showDownloadOptions && (
                                            <div className="absolute top-full left-0 mt-1 bg-white rounded-lg shadow-lg p-2 z-10 min-w-full">
                                                <button onClick={() => handleDownload('png')} className="block w-full text-left px-4 py-2 hover:bg-pink-50 rounded whitespace-nowrap">
                                                    PNG Format
                                                </button>
                                                <button onClick={() => handleDownload('jpeg')} className="block w-full text-left px-4 py-2 hover:bg-pink-50 rounded whitespace-nowrap">
                                                    JPEG Format
                                                </button>
                                            </div>
                                        )}
                                    </div>
                                    <button
                                        onClick={handleShare}
                                        className="bg-green-500 text-white px-4 py-2 rounded-lg hover:bg-green-600 transition-colors w-full sm:w-auto"
                                    >
                                        Share
                                    </button>
                                </div>
                            </div>
                            {/* Right: Tools */}
                            <div className="w-full lg:w-80 bg-white p-3 sm:p-4 rounded-lg shadow">
                                <h2 className="text-lg font-semibold mb-3 text-gray-800">Edit Tools</h2>
                                {/* Background Color */}
                                <div className="mb-4">
                                    <label className="block text-sm mb-1 font-medium text-gray-700">Background Color</label>
                                    <div className="flex items-center">
                                        <input
                                            type="color"
                                            value={bgColor}
                                            onChange={(e) => setBgColor(e.target.value)}
                                            className="w-10 h-10 rounded cursor-pointer"
                                        />
                                        <span className="ml-2 text-sm text-gray-600">{bgColor}</span>
                                    </div>
                                </div>
                                {/* Add Buttons */}
                                <div className="mb-4">
                                    <button
                                        onClick={handleAddText}
                                        className="bg-blue-500 text-white px-4 py-2 rounded-lg hover:bg-blue-600 transition-colors w-full"
                                    >
                                        Add Text
                                    </button>
                                </div>
                                <div className="mb-4">
                                    <label className="block text-sm mb-1 font-medium text-gray-700">Logo Shape</label>
                                    <select
                                        value={logoShape}
                                        onChange={(e) => setLogoShape(e.target.value)}
                                        className="w-full border px-3 py-2 rounded-lg focus:outline-none focus:ring-2 focus:ring-pink-500"
                                    >
                                        {LOGO_SHAPES.map(shape => (
                                            <option key={shape.value} value={shape.value}>{shape.label}</option>
                                        ))}
                                    </select>
                                </div>
                                <div className="mb-4">
                                    <label className="block text-sm mb-1 font-medium text-gray-700">Add Logo</label>
                                    <input
                                        type="file"
                                        accept="image/*"
                                        onChange={handleAddLogo}
                                        className="block w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-pink-50 file:text-pink-700 hover:file:bg-pink-100"
                                    />
                                </div>
                                {/* Profile Logo Settings */}
                                {profileLogo && (
                                    <div className="mb-4 p-3 bg-gray-50 rounded-lg">
                                        <h3 className="text-sm font-semibold mb-2 text-gray-800">Profile Logo</h3>
                                        <div className="flex items-center mb-2">
                                            <input
                                                type="checkbox"
                                                checked={profileLogoSettings.visible}
                                                onChange={(e) => updateActiveObject({ visible: e.target.checked })}
                                                className="mr-2"
                                            />
                                            <label className="text-sm text-gray-700">Show Profile Logo</label>
                                        </div>
                                        <div className="mb-2">
                                            <label className="block text-xs mb-1 font-medium text-gray-700">Shape</label>
                                            <select
                                                value={profileLogoSettings.shape}
                                                onChange={(e) => updateActiveObject({ shape: e.target.value })}
                                                className="w-full text-xs border px-2 py-1 rounded focus:outline-none focus:ring-1 focus:ring-pink-500"
                                            >
                                                {LOGO_SHAPES.map(shape => (
                                                    <option key={shape.value} value={shape.value}>{shape.label}</option>
                                                ))}
                                            </select>
                                        </div>
                                        <div className="mb-2">
                                            <label className="block text-xs mb-1 font-medium text-gray-700">Size: {Math.round(profileLogoSettings.width)} × {Math.round(profileLogoSettings.height)}px</label>
                                            <input
                                                type="range"
                                                min="20"
                                                max="300"
                                                value={profileLogoSettings.width}
                                                onChange={(e) => {
                                                    const newSize = parseInt(e.target.value);
                                                    updateActiveObject({
                                                        width: newSize,
                                                        height: newSize,
                                                    });
                                                }}
                                                className="w-full"
                                            />
                                        </div>
                                        <button
                                            onClick={() => setActiveIndex('profile')}
                                            className={`w-full mt-2 px-3 py-1 text-xs rounded ${activeIndex === 'profile' ? 'bg-blue-100 text-blue-800 border border-blue-500' : 'bg-gray-200 text-gray-700 hover:bg-gray-300'}`}
                                        >
                                            {activeIndex === 'profile' ? 'Profile Logo Selected' : 'Select Profile Logo'}
                                        </button>
                                    </div>
                                )}
                                {/* Delete Selected Object */}
                                {activeIndex !== null && (
                                    <div className="mb-4">
                                        <button
                                            onClick={() => {
                                                if (activeIndex === 'profile') {
                                                    setProfileLogoSettings(prev => ({ ...prev, visible: false }));
                                                    setActiveIndex(null);
                                                } else if (typeof activeIndex === 'number') {
                                                    setObjects(prev => prev.filter((_, i) => i !== activeIndex));
                                                    setActiveIndex(null);
                                                    setIsEditingText(false);
                                                }
                                            }}
                                            className="bg-red-500 text-white px-4 py-2 rounded-lg hover:bg-red-600 transition-colors w-full"
                                        >
                                            {activeIndex === 'profile' ? 'Hide Profile Logo' : 'Delete Selected'}
                                        </button>
                                    </div>
                                )}
                                {/* Active Object Props */}
                                {activeIndex !== null && (
                                    <div className="mt-4 border-t pt-3">
                                        <h3 className="text-sm font-semibold mb-2 text-gray-800">
                                            {activeIndex === 'profile' ? 'Profile Logo Settings' : 'Selected Object'}
                                        </h3>
                                        {activeIndex !== 'profile' && objects[activeIndex] && objects[activeIndex].type === "text" && (
                                            <>
                                                <label className="block text-sm mb-1 font-medium text-gray-700">Text Content (Multi-line supported)</label>
                                                <textarea
                                                    value={textInput}
                                                    onChange={handleTextChange}
                                                    className="w-full border mb-3 px-3 py-2 rounded-lg focus:outline-none focus:ring-2 focus:ring-pink-500"
                                                    placeholder="Enter text here... Use Enter for new lines"
                                                    rows={3}
                                                />
                                                <label className="block text-sm mb-1 font-medium text-gray-700">Font Family</label>
                                                <select
                                                    value={objects[activeIndex].font}
                                                    onChange={(e) => updateActiveObject({ font: e.target.value })}
                                                    className="w-full border mb-3 px-3 py-2 rounded-lg focus:outline-none focus:ring-2 focus:ring-pink-500"
                                                >
                                                    {FONT_OPTIONS.map(font => (
                                                        <option key={font} value={font}>{font}</option>
                                                    ))}
                                                </select>
                                                <label className="block text-sm mb-1 font-medium text-gray-700">Font Size: {objects[activeIndex].size}px</label>
                                                <input
                                                    type="range"
                                                    min="10"
                                                    max="100"
                                                    value={objects[activeIndex].size}
                                                    onChange={(e) => updateActiveObject({ size: parseInt(e.target.value) })}
                                                    className="w-full mb-3"
                                                />
                                                <label className="block text-sm mb-1 font-medium text-gray-700">Text Color</label>
                                                <div className="flex items-center mb-3">
                                                    <input
                                                        type="color"
                                                        value={objects[activeIndex].color}
                                                        onChange={(e) => updateActiveObject({ color: e.target.value })}
                                                        className="w-10 h-10 rounded cursor-pointer"
                                                    />
                                                    <span className="ml-2 text-sm text-gray-600">{objects[activeIndex].color}</span>
                                                </div>
                                                <div className="flex gap-2 mt-2">
                                                    <button
                                                        onClick={() => updateActiveObject({ bold: !objects[activeIndex].bold })}
                                                        className={`px-3 py-2 border rounded-lg font-bold ${objects[activeIndex].bold ? 'bg-pink-100 border-pink-500' : 'bg-white'}`}
                                                    >
                                                        B
                                                    </button>
                                                    <button
                                                        onClick={() => updateActiveObject({ italic: !objects[activeIndex].italic })}
                                                        className={`px-3 py-2 border rounded-lg italic ${objects[activeIndex].italic ? 'bg-pink-100 border-pink-500' : 'bg-white'}`}
                                                    >
                                                        I
                                                    </button>
                                                </div>
                                                <div className="mt-3 text-xs text-gray-500">
                                                    💡 Tip: Double-click text on canvas to edit inline with multi-line support, drag corners to resize. Press Ctrl+Enter or click outside to finish editing.
                                                </div>
                                            </>
                                        )}
                                        {activeIndex !== 'profile' && objects[activeIndex] && objects[activeIndex].type === "image" && (
                                            <>
                                                <label className="block text-sm mb-1 font-medium text-gray-700">Logo Shape</label>
                                                <select
                                                    value={objects[activeIndex].shape}
                                                    onChange={(e) => updateActiveObject({ shape: e.target.value })}
                                                    className="w-full border mb-3 px-3 py-2 rounded-lg focus:outline-none focus:ring-2 focus:ring-pink-500"
                                                >
                                                    {LOGO_SHAPES.map(shape => (
                                                        <option key={shape.value} value={shape.value}>{shape.label}</option>
                                                    ))}
                                                </select>
                                                <label className="block text-sm mb-1 font-medium text-gray-700">Size: {Math.round(objects[activeIndex].width)} × {Math.round(objects[activeIndex].height)}px</label>
                                                <input
                                                    type="range"
                                                    min="20"
                                                    max="500"
                                                    value={objects[activeIndex].width}
                                                    onChange={(e) => {
                                                        const newSize = parseInt(e.target.value);
                                                        updateActiveObject({
                                                            width: newSize,
                                                            height: newSize,
                                                        });
                                                    }}
                                                    className="w-full mb-3"
                                                />
                                                <div className="mt-3 text-xs text-gray-500">
                                                    💡 Tip: Drag corner handles on canvas to resize freely
                                                </div>
                                            </>
                                        )}
                                        {activeIndex === 'profile' && (
                                            <>
                                                <label className="block text-sm mb-1 font-medium text-gray-700">Logo Shape</label>
                                                <select
                                                    value={profileLogoSettings.shape}
                                                    onChange={(e) => updateActiveObject({ shape: e.target.value })}
                                                    className="w-full border mb-3 px-3 py-2 rounded-lg focus:outline-none focus:ring-2 focus:ring-pink-500"
                                                >
                                                    {LOGO_SHAPES.map(shape => (
                                                        <option key={shape.value} value={shape.value}>{shape.label}</option>
                                                    ))}
                                                </select>
                                                <label className="block text-sm mb-1 font-medium text-gray-700">Size: {Math.round(profileLogoSettings.width)} × {Math.round(profileLogoSettings.height)}px</label>
                                                <input
                                                    type="range"
                                                    min="20"
                                                    max="300"
                                                    value={profileLogoSettings.width}
                                                    onChange={(e) => {
                                                        const newSize = parseInt(e.target.value);
                                                        updateActiveObject({
                                                            width: newSize,
                                                            height: newSize,
                                                        });
                                                    }}
                                                    className="w-full mb-3"
                                                />
                                                <label className="block text-sm mb-1 font-medium text-gray-700">Position X</label>
                                                <input
                                                    type="number"
                                                    value={Math.round(profileLogoSettings.x)}
                                                    onChange={(e) => updateActiveObject({ x: parseInt(e.target.value) })}
                                                    className="w-full border mb-3 px-3 py-2 rounded-lg focus:outline-none focus:ring-2 focus:ring-pink-500"
                                                />
                                                <label className="block text-sm mb-1 font-medium text-gray-700">Position Y</label>
                                                <input
                                                    type="number"
                                                    value={Math.round(profileLogoSettings.y)}
                                                    onChange={(e) => updateActiveObject({ y: parseInt(e.target.value) })}
                                                    className="w-full border mb-3 px-3 py-2 rounded-lg focus:outline-none focus:ring-2 focus:ring-pink-500"
                                                />
                                                <div className="mt-3 text-xs text-gray-500">
                                                    💡 Tip: Drag profile logo on canvas to reposition, drag corners to resize
                                                </div>
                                            </>
                                        )}
                                    </div>
                                )}
                                {/* Layer Management */}
                                {(objects.length > 0 || profileLogo) && (
                                    <div className="mt-4 border-t pt-3">
                                        <h3 className="text-sm font-semibold mb-2 text-gray-800">Layers</h3>
                                        <div className="space-y-1 max-h-32 overflow-y-auto">
                                            {profileLogo && profileLogoSettings.visible && (
                                                <div
                                                    onClick={() => setActiveIndex('profile')}
                                                    className={`p-2 rounded cursor-pointer text-sm ${activeIndex === 'profile'
                                                        ? 'bg-blue-100 border-blue-500 border'
                                                        : 'bg-gray-50 hover:bg-gray-100'
                                                        }`}
                                                >
                                                    Profile Logo ({profileLogoSettings.shape})
                                                </div>
                                            )}
                                            {objects.map((obj, i) => (
                                                <div
                                                    key={i}
                                                    onClick={() => setActiveIndex(i)}
                                                    className={`p-2 rounded cursor-pointer text-sm ${i === activeIndex
                                                        ? 'bg-blue-100 border-blue-500 border'
                                                        : 'bg-gray-50 hover:bg-gray-100'
                                                        }`}
                                                >
                                                    {obj.type === "text" ? `Text: ${obj.text.split('\n')[0].slice(0, 15)}${obj.text.length > 15 ? '...' : ''}` : `Image (${obj.shape})`}
                                                </div>
                                            ))}
                                        </div>
                                    </div>
                                )}
                                {/* Keyboard Shortcuts */}
                                <div className="mt-4 border-t pt-3">
                                    <h3 className="text-sm font-semibold mb-2 text-gray-800">Shortcuts & Features</h3>
                                    <div className="text-xs text-gray-600 space-y-1">
                                        <div>• Profile image auto-loads from your account</div>
                                        <div>• Multi-line text support with Enter key</div>
                                        <div>• Double-click text to edit inline</div>
                                        <div>• Ctrl+Enter or click outside to finish editing</div>
                                        <div>• Drag objects to move, corners to resize</div>
                                        <div>• Profile logo appears at top right by default</div>
                                        <div>• Mobile & email auto-added from your account</div>
                                        <div>• All shapes: Circle, Rectangle, Rounded, Triangle</div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    )}
                </div>
            </div>
        </>
    );
}
export default CustomPosterEditor;