import React, { useRef, useState, useEffect } from "react";
import Navbar from "./Navbar";

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
    "Arial", "Verdana", "Helvetica", "Times New Roman", "Courier New",
    "Georgia", "Palatino", "Garamond", "Comic Sans MS", "Impact",
    "Lucida Sans Unicode", "Tahoma", "Trebuchet MS"
];

const LOGO_SHAPES = [
    { value: "rectangle", label: "Rectangle" },
    { value: "circle", label: "Circle" },
    { value: "rounded", label: "Rounded" },
    { value: "triangle", label: "Triangle" },
];

const PRESET_LOGOS = [
    { id: 1, name: "Circle", url: "https://cdn-icons-png.flaticon.com/512/1827/1827507.png" },
    { id: 2, name: "Oval", url: "https://cdn-icons-png.flaticon.com/512/446/446075.png" },
    { id: 3, name: "Square", url: "https://cdn-icons-png.flaticon.com/512/1827/1827523.png" },
    { id: 4, name: "Rectangle", url: "https://cdn-icons-png.flaticon.com/512/1827/1827522.png" },
    { id: 5, name: "Triangle", url: "https://cdn-icons-png.flaticon.com/512/1827/1827504.png" },
    { id: 6, name: "Pentagon", url: "https://cdn-icons-png.flaticon.com/512/1827/1827510.png" },
    { id: 7, name: "Hexagon", url: "https://cdn-icons-png.flaticon.com/512/1827/1827512.png" },
    { id: 8, name: "Heptagon", url: "https://cdn-icons-png.flaticon.com/512/1827/1827513.png" },
    { id: 9, name: "Octagon", url: "https://cdn-icons-png.flaticon.com/512/1827/1827517.png" },
    { id: 10, name: "Parallelogram", url: "https://cdn-icons-png.flaticon.com/512/6401/6401674.png" }
];

const STICKERS = [
    { id: 1, name: "Smile", url: "https://cdn-icons-png.flaticon.com/512/2583/2583345.png" },
    { id: 2, name: "Fire", url: "https://cdn-icons-png.flaticon.com/512/2583/2583325.png" },
    { id: 3, name: "Music", url: "https://cdn-icons-png.flaticon.com/512/2583/2583339.png" },
    { id: 4, name: "Camera", url: "https://cdn-icons-png.flaticon.com/512/2583/2583329.png" },
    { id: 5, name: "Book", url: "https://cdn-icons-png.flaticon.com/512/2583/2583330.png" },
    { id: 6, name: "Gift", url: "https://cdn-icons-png.flaticon.com/512/2583/2583326.png" },
    { id: 7, name: "Lightning", url: "https://cdn-icons-png.flaticon.com/512/2583/2583338.png" },
    { id: 8, name: "Flag", url: "https://cdn-icons-png.flaticon.com/512/2583/2583324.png" },
];

const LOGO_COLORS = [
    "#FF5733", "#33FF57", "#3357FF", "#F033FF", "#FF33A1",
    "#33FFF6", "#FFD833", "#8333FF", "#FF3333", "#33FF96"
];

function Logo() {
    const canvasRef = useRef(null);
    const textInputRef = useRef(null);
    const [selectedSize, setSelectedSize] = useState(null);
    const [showEditor, setShowEditor] = useState(false);
    const [bgColor, setBgColor] = useState("#ffffff");
    const [objects, setObjects] = useState([]);
    const [backgroundImg, setBackgroundImg] = useState(null);
    const [activeIndex, setActiveIndex] = useState(null);
    const [dragging, setDragging] = useState(false);
    const [resizing, setResizing] = useState(false);
    const [offset, setOffset] = useState({ x: 0, y: 0 });
    const [logoShape, setLogoShape] = useState("rectangle");
    const [showDownloadOptions, setShowDownloadOptions] = useState(false);
    const [activeTab, setActiveTab] = useState("logos");
    const [customLogoText, setCustomLogoText] = useState("LOGO");
    const [customLogoColor, setCustomLogoColor] = useState("#FF5733");
    const [customLogoFont, setCustomLogoFont] = useState("Arial");
    const [logoSize, setLogoSize] = useState(200);
    const [isMobile, setIsMobile] = useState(window.innerWidth < 768);
    const [isEditingText, setIsEditingText] = useState(false);
    const [editingTextPosition, setEditingTextPosition] = useState({ x: 0, y: 0 });
    const [resizeDirection, setResizeDirection] = useState("");
    const [canvasScale, setCanvasScale] = useState(1);
    // 🔑 NEW: Local state for inline editing (fixes 1-char bug)
    const [inlineEditText, setInlineEditText] = useState("");

    useEffect(() => {
        const handleResize = () => setIsMobile(window.innerWidth < 768);
        window.addEventListener('resize', handleResize);
        return () => window.removeEventListener('resize', handleResize);
    }, []);

    useEffect(() => {
        if (selectedSize) {
            const maxDisplayWidth = isMobile ? 300 : 600;
            const scale = Math.min(maxDisplayWidth / selectedSize.w, 1);
            setCanvasScale(scale);
        }
    }, [selectedSize, isMobile]);

    const drawDeleteIcon = (ctx, x, y) => {
        ctx.save();
        ctx.fillStyle = '#ff4444';
        ctx.strokeStyle = '#ffffff';
        ctx.lineWidth = 2;
        ctx.beginPath();
        ctx.arc(x, y, 12, 0, Math.PI * 2);
        ctx.fill();
        ctx.stroke();
        ctx.beginPath();
        ctx.moveTo(x - 5, y - 5);
        ctx.lineTo(x + 5, y + 5);
        ctx.moveTo(x + 5, y - 5);
        ctx.lineTo(x - 5, y + 5);
        ctx.stroke();
        ctx.restore();
    };

    const [isDownloading, setIsDownloading] = useState(false);

    useEffect(() => {
        if (!selectedSize) return;
        const canvas = canvasRef.current;
        const ctx = canvas.getContext("2d");
        canvas.width = selectedSize.w;
        canvas.height = selectedSize.h;

        ctx.fillStyle = bgColor;
        ctx.fillRect(0, 0, canvas.width, canvas.height);

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

        objects.forEach((obj, i) => {
            if (obj.type === "text" && !(i === activeIndex && isEditingText)) {
                ctx.font = `${obj.bold ? "bold" : ""} ${obj.italic ? "italic" : ""} ${obj.size}px ${obj.font}`;
                ctx.fillStyle = obj.color;
                ctx.fillText(obj.text, obj.x, obj.y);

                // Only draw selection indicators when NOT downloading
                if (i === activeIndex && !isDownloading) {
                    const width = ctx.measureText(obj.text).width;
                    const height = obj.size;
                    ctx.strokeStyle = "#3b82f6";
                    ctx.lineWidth = 2;
                    ctx.strokeRect(obj.x - 5, obj.y - height - 5, width + 10, height + 10);
                    const handleSize = 8;
                    ctx.fillStyle = "#3b82f6";
                    ctx.fillRect(obj.x - handleSize / 2 - 5, obj.y - height - handleSize / 2 - 5, handleSize, handleSize);
                    ctx.fillRect(obj.x + width - handleSize / 2 + 5, obj.y - height - handleSize / 2 - 5, handleSize, handleSize);
                    ctx.fillRect(obj.x - handleSize / 2 - 5, obj.y - handleSize / 2 + 5, handleSize, handleSize);
                    ctx.fillRect(obj.x + width - handleSize / 2 + 5, obj.y - handleSize / 2 + 5, handleSize, handleSize);
                    drawDeleteIcon(ctx, obj.x + width + 15, obj.y - height - 5);
                }
            }
            if (obj.type === "image" && obj.img) {
                ctx.save();
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
                ctx.restore();

                // Only draw selection indicators when NOT downloading
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
                    const handleSize = 8;
                    ctx.fillStyle = "#3b82f6";
                    ctx.fillRect(obj.x - handleSize / 2, obj.y - handleSize / 2, handleSize, handleSize);
                    ctx.fillRect(obj.x + obj.width - handleSize / 2, obj.y - handleSize / 2, handleSize, handleSize);
                    ctx.fillRect(obj.x - handleSize / 2, obj.y + obj.height - handleSize / 2, handleSize, handleSize);
                    ctx.fillRect(obj.x + obj.width - handleSize / 2, obj.y + obj.height - handleSize / 2, handleSize, handleSize);
                    drawDeleteIcon(ctx, obj.x + obj.width - 10, obj.y - 10);
                }
            }
        });
    }, [selectedSize, bgColor, objects, backgroundImg, activeIndex, isEditingText, canvasScale, isDownloading]); // Added isDownloading to dependencies

    const getEventPosition = (e) => {
        const rect = canvasRef.current.getBoundingClientRect();
        let clientX = e.clientX || (e.touches?.[0]?.clientX);
        let clientY = e.clientY || (e.touches?.[0]?.clientY);
        const x = (clientX - rect.left) / canvasScale;
        const y = (clientY - rect.top) / canvasScale;
        return { x, y };
    };

    const checkDeleteIconClick = (x, y, obj) => {
        if (obj.type === "text") {
            const ctx = canvasRef.current.getContext("2d");
            ctx.font = `${obj.bold ? "bold" : ""} ${obj.italic ? "italic" : ""} ${obj.size}px ${obj.font}`;
            const textWidth = ctx.measureText(obj.text).width;
            const deleteX = obj.x + textWidth + 15;
            const deleteY = obj.y - obj.size - 5;
            return Math.sqrt((x - deleteX) ** 2 + (y - deleteY) ** 2) <= 12;
        } else if (obj.type === "image") {
            const deleteX = obj.x + obj.width - 10;
            const deleteY = obj.y - 10;
            return Math.sqrt((x - deleteX) ** 2 + (y - deleteY) ** 2) <= 12;
        }
        return false;
    };

    const getTextResizeHandle = (x, y, obj) => {
        const ctx = canvasRef.current.getContext("2d");
        ctx.font = `${obj.bold ? "bold" : ""} ${obj.italic ? "italic" : ""} ${obj.size}px ${obj.font}`;
        const width = ctx.measureText(obj.text).width;
        const height = obj.size;
        const handleSize = 8;
        const handles = [
            { x: obj.x - handleSize / 2 - 5, y: obj.y - height - handleSize / 2 - 5, type: 'nw' },
            { x: obj.x + width - handleSize / 2 + 5, y: obj.y - height - handleSize / 2 - 5, type: 'ne' },
            { x: obj.x - handleSize / 2 - 5, y: obj.y - handleSize / 2 + 5, type: 'sw' },
            { x: obj.x + width - handleSize / 2 + 5, y: obj.y - handleSize / 2 + 5, type: 'se' }
        ];
        for (let handle of handles) {
            if (x >= handle.x && x <= handle.x + handleSize && y >= handle.y && y <= handle.y + handleSize) {
                return handle.type;
            }
        }
        return null;
    };

    const getImageResizeHandle = (x, y, obj) => {
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

    const handleStart = (e) => {
        if (!selectedSize || isEditingText) return;
        e.preventDefault();
        const { x, y } = getEventPosition(e);
        if (activeIndex !== null && objects[activeIndex]) {
            if (checkDeleteIconClick(x, y, objects[activeIndex])) {
                handleDeleteObject();
                return;
            }
        }
        if (activeIndex !== null && objects[activeIndex]) {
            const obj = objects[activeIndex];
            if (obj.type === "text") {
                const resizeHandle = getTextResizeHandle(x, y, obj);
                if (resizeHandle) {
                    setResizing(true);
                    setResizeDirection(resizeHandle);
                    return;
                }
            } else if (obj.type === "image") {
                const resizeHandle = getImageResizeHandle(x, y, obj);
                if (resizeHandle) {
                    setResizing(true);
                    setResizeDirection(resizeHandle);
                    return;
                }
            }
        }
        for (let i = objects.length - 1; i >= 0; i--) {
            const obj = objects[i];
            if (obj.type === "text") {
                const ctx = canvasRef.current.getContext("2d");
                ctx.font = `${obj.bold ? "bold" : ""} ${obj.italic ? "italic" : ""} ${obj.size}px ${obj.font}`;
                const width = ctx.measureText(obj.text).width;
                const height = obj.size;
                if (x >= obj.x - 5 && x <= obj.x + width + 5 && y >= obj.y - height - 5 && y <= obj.y + 5) {
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
        setActiveIndex(null);
        setIsEditingText(false);
    };

    const handleMove = (e) => {
        if (isEditingText || (!dragging && !resizing) || activeIndex === null) return;
        e.preventDefault();
        const { x, y } = getEventPosition(e);
        const obj = objects[activeIndex];
        if (resizing) {
            if (obj.type === "text") {
                const ctx = canvasRef.current.getContext("2d");
                ctx.font = `${obj.bold ? "bold" : ""} ${obj.italic ? "italic" : ""} ${obj.size}px ${obj.font}`;
                const currentWidth = ctx.measureText(obj.text).width;
                const currentHeight = obj.size;
                let newWidth = currentWidth;
                let newHeight = currentHeight;
                let newX = obj.x;
                let newY = obj.y;
                switch (resizeDirection) {
                    case 'se': newHeight = Math.max(10, y - obj.y); break;
                    case 'sw': newHeight = Math.max(10, y - obj.y); newX = obj.x + currentWidth - (x - obj.x); break;
                    case 'ne': newHeight = Math.max(10, obj.y - (y - currentHeight)); newY = y + newHeight; break;
                    case 'nw': newHeight = Math.max(10, obj.y - (y - currentHeight)); newX = obj.x + currentWidth - (x - obj.x); newY = y + newHeight; break;
                }
                setObjects(prev => prev.map((o, i) => i === activeIndex ? { ...o, size: newHeight, x: newX, y: newY } : o));
            } else if (obj.type === "image") {
                let newWidth = obj.width;
                let newHeight = obj.height;
                let newX = obj.x;
                let newY = obj.y;
                switch (resizeDirection) {
                    case 'se': newWidth = Math.max(20, x - obj.x); newHeight = Math.max(20, y - obj.y); break;
                    case 'sw': newWidth = Math.max(20, obj.x + obj.width - x); newHeight = Math.max(20, y - obj.y); newX = x; break;
                    case 'ne': newWidth = Math.max(20, x - obj.x); newHeight = Math.max(20, obj.y + obj.height - y); newY = y; break;
                    case 'nw': newWidth = Math.max(20, obj.x + obj.width - x); newHeight = Math.max(20, obj.y + obj.height - y); newX = x; newY = y; break;
                }
                setObjects(prev => prev.map((o, i) => i === activeIndex ? { ...o, width: newWidth, height: newHeight, x: newX, y: newY } : o));
            }
        } else if (dragging) {
            setObjects(prev => prev.map((o, i) => i === activeIndex ? { ...o, x: x - offset.x, y: y - offset.y } : o));
        }
    };

    const handleEnd = () => {
        setDragging(false);
        setResizing(false);
        setResizeDirection("");
    };

    const handleDoubleClick = (e) => {
        if (!selectedSize) return;
        const { x, y } = getEventPosition(e);
        for (let i = objects.length - 1; i >= 0; i--) {
            const obj = objects[i];
            if (obj.type === "text") {
                const ctx = canvasRef.current.getContext("2d");
                ctx.font = `${obj.bold ? "bold" : ""} ${obj.italic ? "italic" : ""} ${obj.size}px ${obj.font}`;
                const width = ctx.measureText(obj.text).width;
                const height = obj.size;
                if (x >= obj.x && x <= obj.x + width && y <= obj.y && y >= obj.y - height) {
                    setActiveIndex(i);
                    setIsEditingText(true);
                    // 🔑 Set local inline edit state
                    setInlineEditText(obj.text);
                    const rect = canvasRef.current.getBoundingClientRect();
                    setEditingTextPosition({
                        x: rect.left + (obj.x * canvasScale),
                        y: rect.top + ((obj.y - height) * canvasScale)
                    });
                    setTimeout(() => textInputRef.current?.focus(), 100);
                    return;
                }
            }
        }
    };

    useEffect(() => {
        const canvas = canvasRef.current;
        if (!canvas) return;
        canvas.addEventListener("mousedown", handleStart);
        canvas.addEventListener("mousemove", handleMove);
        canvas.addEventListener("mouseup", handleEnd);
        canvas.addEventListener("mouseleave", handleEnd);
        canvas.addEventListener("dblclick", handleDoubleClick);
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
    }, [objects, activeIndex, isEditingText, canvasScale]);

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
        setObjects(prev => [...prev, newTextObj]);
        setActiveIndex(objects.length);
    };

    const handleAddLogoFromUrl = (url) => {
        const img = new Image();
        img.crossOrigin = "anonymous";
        img.onload = () => {
            const newImageObj = {
                type: "image",
                img,
                x: 150,
                y: 150,
                width: logoSize,
                height: logoSize,
                shape: logoShape
            };
            setObjects(prev => [...prev, newImageObj]);
            setActiveIndex(objects.length);
        };
        img.src = url;
    };

    const handleAddCustomLogo = () => {
        const tempCanvas = document.createElement('canvas');
        const tempCtx = tempCanvas.getContext('2d');
        tempCanvas.width = logoSize;
        tempCanvas.height = logoSize;
        tempCtx.fillStyle = customLogoColor;
        if (logoShape === "circle") {
            tempCtx.beginPath();
            tempCtx.arc(logoSize / 2, logoSize / 2, logoSize / 2, 0, Math.PI * 2);
            tempCtx.closePath();
            tempCtx.fill();
        } else if (logoShape === "rounded") {
            const radius = 20;
            tempCtx.beginPath();
            tempCtx.moveTo(radius, 0);
            tempCtx.lineTo(logoSize - radius, 0);
            tempCtx.quadraticCurveTo(logoSize, 0, logoSize, radius);
            tempCtx.lineTo(logoSize, logoSize - radius);
            tempCtx.quadraticCurveTo(logoSize, logoSize, logoSize - radius, logoSize);
            tempCtx.lineTo(radius, logoSize);
            tempCtx.quadraticCurveTo(0, logoSize, 0, logoSize - radius);
            tempCtx.lineTo(0, radius);
            tempCtx.quadraticCurveTo(0, 0, radius, 0);
            tempCtx.closePath();
            tempCtx.fill();
        } else if (logoShape === "triangle") {
            tempCtx.beginPath();
            tempCtx.moveTo(logoSize / 2, 0);
            tempCtx.lineTo(logoSize, logoSize);
            tempCtx.lineTo(0, logoSize);
            tempCtx.closePath();
            tempCtx.fill();
        } else {
            tempCtx.fillRect(0, 0, tempCanvas.width, tempCanvas.height);
        }
        tempCtx.font = `bold ${Math.min(40, logoSize / 5)}px ${customLogoFont}`;
        tempCtx.fillStyle = '#FFFFFF';
        tempCtx.textAlign = 'center';
        tempCtx.textBaseline = 'middle';
        tempCtx.fillText(customLogoText, logoSize / 2, logoSize / 2);
        const img = new Image();
        img.onload = () => {
            const newImageObj = {
                type: "image",
                img,
                x: 150,
                y: 150,
                width: logoSize,
                height: logoSize,
                shape: logoShape
            };
            setObjects(prev => [...prev, newImageObj]);
            setActiveIndex(objects.length);
        };
        img.src = tempCanvas.toDataURL();
    };

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
                width: logoSize,
                height: logoSize,
                shape: logoShape
            };
            setObjects(prev => [...prev, newImageObj]);
            setActiveIndex(objects.length);
        };
        img.src = URL.createObjectURL(file);
    };

    const handleUploadPoster = (e) => {
        const file = e.target.files[0];
        if (!file) return;
        const img = new Image();
        img.onload = () => setBackgroundImg({ img, iw: img.width, ih: img.height });
        img.src = URL.createObjectURL(file);
    };

    const handleDeleteObject = () => {
        if (activeIndex === null) return;
        setObjects(prev => prev.filter((_, i) => i !== activeIndex));
        setActiveIndex(null);
        setIsEditingText(false);
    };

    const updateActiveObject = (changes) => {
        if (activeIndex === null) return;
        setObjects(prev => prev.map((obj, i) => i === activeIndex ? { ...obj, ...changes } : obj));
    };

    // 🔑 Handle inline text editing correctly
    const handleInlineTextChange = (e) => {
        setInlineEditText(e.target.value); // Only update local state
    };

    const handleInlineTextBlur = () => {
        if (activeIndex !== null && objects[activeIndex]?.type === "text") {
            // Sync back to object only on blur
            updateActiveObject({ text: inlineEditText });
        }
        setIsEditingText(false);
    };

    const handleInlineTextKeyDown = (e) => {
        if (e.key === 'Enter' && !e.shiftKey) {
            e.preventDefault();
            if (activeIndex !== null && objects[activeIndex]?.type === "text") {
                updateActiveObject({ text: inlineEditText });
            }
            setIsEditingText(false);
        }
        if (e.key === 'Escape') {
            setIsEditingText(false);
        }
    };

    const handleSizeSelect = (s) => {
        setSelectedSize(s);
        setShowEditor(true);
    };

    const handleDownload = (format = 'png') => {
        setIsDownloading(true);

        // Use setTimeout to ensure the canvas redraws without selection indicators
        setTimeout(() => {
            const canvas = canvasRef.current;
            const link = document.createElement('a');
            link.className = 'no-outline';
            link.style.outline = 'none';
            link.href = canvas.toDataURL(format === 'png' ? 'image/png' : 'image/jpeg', 0.9);
            link.download = `poster.${format === 'png' ? 'png' : 'jpg'}`;
            document.body.appendChild(link);
            link.click();
            document.body.removeChild(link);

            setIsDownloading(false);
            setShowDownloadOptions(false);
        }, 100);
    };

    const LogoComponent = () => (
        <div className="mt-4">
            <div className="flex border-b mb-3 overflow-x-auto">
                <button className={`px-4 py-2 whitespace-nowrap ${activeTab === 'logos' ? 'border-b-2 border-blue-500 text-blue-600' : 'text-gray-600'}`} onClick={() => setActiveTab('logos')}>Preset Logos</button>
                <button className={`px-4 py-2 whitespace-nowrap ${activeTab === 'custom' ? 'border-b-2 border-blue-500 text-blue-600' : 'text-gray-600'}`} onClick={() => setActiveTab('custom')}>Custom Logo</button>
                <button className={`px-4 py-2 whitespace-nowrap ${activeTab === 'stickers' ? 'border-b-2 border-blue-500 text-blue-600' : 'text-gray-600'}`} onClick={() => setActiveTab('stickers')}>Stickers</button>
            </div>
            {activeTab === 'logos' && (
                <div>
                    <label className="block text-sm mb-1 font-medium text-gray-700">Logo Shape</label>
                    <select value={logoShape} onChange={(e) => setLogoShape(e.target.value)} className="w-full border mb-3 px-3 py-2 rounded-lg focus:outline-none focus:ring-2 focus:ring-pink-500">
                        {LOGO_SHAPES.map(shape => <option key={shape.value} value={shape.value}>{shape.label}</option>)}
                    </select>
                    <label className="block text-sm mb-1 font-medium text-gray-700">Logo Size: {logoSize}px</label>
                    <input type="range" min="50" max="500" value={logoSize} onChange={(e) => setLogoSize(parseInt(e.target.value))} className="w-full mb-3" />
                    <div className="grid grid-cols-4 gap-2 mb-3">
                        {PRESET_LOGOS.map(logo => (
                            <div key={logo.id} className="border rounded-lg p-2 cursor-pointer hover:bg-pink-50 flex items-center justify-center" onClick={() => handleAddLogoFromUrl(logo.url)}>
                                <img src={logo.url} alt={logo.name} className="h-10 w-10 object-contain" />
                            </div>
                        ))}
                    </div>
                    <label className="block text-sm mb-1 font-medium text-gray-700">Upload Your Logo</label>
                    <input type="file" accept="image/*" onChange={handleAddLogo} className="block w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-pink-50 file:text-pink-700 hover:file:bg-pink-100" />
                </div>
            )}
            {activeTab === 'custom' && (
                <div>
                    <label className="block text-sm mb-1 font-medium text-gray-700">Logo Text</label>
                    <input type="text" value={customLogoText} onChange={(e) => setCustomLogoText(e.target.value)} className="w-full border mb-3 px-3 py-2 rounded-lg focus:outline-none focus:ring-2 focus:ring-pink-500" placeholder="Enter logo text" />
                    <label className="block text-sm mb-1 font-medium text-gray-700">Logo Size: {logoSize}px</label>
                    <input type="range" min="50" max="500" value={logoSize} onChange={(e) => setLogoSize(parseInt(e.target.value))} className="w-full mb-3" />
                    <label className="block text-sm mb-1 font-medium text-gray-700">Logo Color</label>
                    <div className="grid grid-cols-5 gap-2 mb-3">
                        {LOGO_COLORS.map(color => (
                            <div key={color} className={`h-8 w-8 rounded-full cursor-pointer ${customLogoColor === color ? 'ring-2 ring-offset-2 ring-pink-500' : ''}`} style={{ backgroundColor: color }} onClick={() => setCustomLogoColor(color)} />
                        ))}
                        <div className="relative">
                            <input type="color" value={customLogoColor} onChange={(e) => setCustomLogoColor(e.target.value)} className="absolute opacity-0 h-8 w-8 cursor-pointer" id="customColorPicker" />
                            <label htmlFor="customColorPicker" className="h-8 w-8 rounded-full border-2 border-gray-300 flex items-center justify-center cursor-pointer"><span className="text-xs">+</span></label>
                        </div>
                    </div>
                    <label className="block text-sm mb-1 font-medium text-gray-700">Font Family</label>
                    <select value={customLogoFont} onChange={(e) => setCustomLogoFont(e.target.value)} className="w-full border mb-3 px-3 py-2 rounded-lg focus:outline-none focus:ring-2 focus:ring-pink-500">
                        {FONT_OPTIONS.map(font => <option key={font} value={font}>{font}</option>)}
                    </select>
                    <button onClick={handleAddCustomLogo} className="bg-blue-500 text-white px-4 py-2 rounded-lg hover:bg-blue-600 transition-colors w-full">Create Logo</button>
                </div>
            )}
            {activeTab === 'stickers' && (
                <div>
                    <label className="block text-sm mb-1 font-medium text-gray-700">Logo Size: {logoSize}px</label>
                    <input type="range" min="50" max="500" value={logoSize} onChange={(e) => setLogoSize(parseInt(e.target.value))} className="w-full mb-3" />
                    <div className="grid grid-cols-4 gap-2">
                        {STICKERS.map(sticker => (
                            <div key={sticker.id} className="border rounded-lg p-2 cursor-pointer hover:bg-pink-50 flex items-center justify-center" onClick={() => handleAddLogoFromUrl(sticker.url)}>
                                <img src={sticker.url} alt={sticker.name} className="h-10 w-10 object-contain" />
                            </div>
                        ))}
                    </div>
                </div>
            )}
        </div>
    );

    return (
        <>
            <Navbar />
            <div className="min-h-screen bg-pink-50 p-4 mb-5">
                <div className="max-w-7xl mx-auto">
                    <div className="flex items-center mb-4">
                        {showEditor && (
                            <button onClick={() => { setShowEditor(false); setSelectedSize(null); setObjects([]); setBackgroundImg(null); setActiveIndex(null); setIsEditingText(false); }} className="mr-4 bg-blue-500 text-white px-4 py-2 rounded-lg hover:bg-blue-600 transition-colors">←</button>
                        )}
                        {!showEditor && (
                            <button onClick={() => window.history.back()} className="btn btn-primary text-white text-lg font-bold mr-3">←</button>
                        )}
                        <h1 className="text-2xl font-semibold text-gray-800">Create Custom Post</h1>
                    </div>
                    {!showEditor && (
                        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 sm:gap-6">
                            {PRESET_SIZES.map(s => (
                                <button key={s.label} onClick={() => handleSizeSelect(s)} className="bg-white rounded-2xl p-4 sm:p-6 md:p-8 shadow-md h-32 sm:h-40 flex items-center justify-center hover:shadow-lg transition-shadow">
                                    <span className="text-sm font-medium text-gray-700">{s.label}</span>
                                </button>
                            ))}
                        </div>
                    )}
                    {showEditor && selectedSize && (
                        <div className="mt-6 flex flex-col lg:flex-row gap-6">

                            <div className="flex-1 bg-white p-4 rounded-lg shadow relative">

                                {/* 🔹 Size Adjuster at the top */}
                                {activeIndex !== null && objects[activeIndex] && (
                                    <div className="mb-4 p-2 bg-gray-100 rounded flex items-center gap-3">
                                        <label className="text-sm font-medium text-gray-700">
                                            Adjust Size:
                                        </label>
                                        <input
                                            type="range"
                                            min={objects[activeIndex].type === "text" ? 10 : 20}
                                            max={objects[activeIndex].type === "text" ? 200 : 500}
                                            value={objects[activeIndex].type === "text" ? objects[activeIndex].size : objects[activeIndex].width}
                                            onChange={(e) => {
                                                const value = parseInt(e.target.value);
                                                if (objects[activeIndex].type === "text") {
                                                    updateActiveObject({ size: value });
                                                } else {
                                                    updateActiveObject({ width: value, height: value });
                                                }
                                            }}
                                            className="flex-1"
                                        />
                                        <span className="text-sm text-gray-600">
                                            {objects[activeIndex].type === "text"
                                                ? `${objects[activeIndex].size}px`
                                                : `${Math.round(objects[activeIndex].width)}px`}
                                        </span>
                                    </div>
                                )}

                                {/* 🔹 Upload & Canvas */}
                                <div className="mb-3">
                                    <label className="block text-sm mb-1 font-medium text-gray-700">Upload Background (Optional)</label>
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
                                            cursor: dragging ? "grabbing" : resizing ? "nw-resize" : "default",
                                            touchAction: "none",
                                        }}
                                    />
                                    {isEditingText && activeIndex !== null && objects[activeIndex]?.type === "text" && (
                                        <input
                                            ref={textInputRef}
                                            type="text"
                                            value={inlineEditText}
                                            onChange={handleInlineTextChange}
                                            onBlur={handleInlineTextBlur}
                                            onKeyDown={handleInlineTextKeyDown}
                                            className="absolute border-2 border-blue-500 bg-white text-black outline-none z-10"
                                            style={{
                                                left: editingTextPosition.x,
                                                top: editingTextPosition.y,
                                                fontSize: `${objects[activeIndex].size * canvasScale}px`,
                                                fontFamily: objects[activeIndex].font,
                                                fontWeight: objects[activeIndex].bold ? "bold" : "normal",
                                                fontStyle: objects[activeIndex].italic ? "italic" : "normal",
                                                color: objects[activeIndex].color,
                                                minWidth: "50px",
                                                padding: "2px 4px",
                                                borderRadius: "3px",
                                            }}
                                        />
                                    )}
                                </div>

                                {/* 🔹 Download / Share Buttons */}
                                <div className="mt-4 flex flex-wrap gap-3">
                                    <div className="relative">
                                        <button
                                            onClick={() => setShowDownloadOptions(!showDownloadOptions)}
                                            className="bg-blue-500 text-white px-4 py-2 rounded-lg hover:bg-blue-600 transition-colors"
                                        >
                                            Download
                                        </button>
                                        {showDownloadOptions && (
                                            <div className="absolute top-full left-0 mt-1 bg-white rounded-lg shadow-lg p-2 z-10">
                                                <button onClick={() => handleDownload("png")} className="block w-full text-left px-4 py-2 hover:bg-pink-50 rounded">
                                                    PNG Format
                                                </button>
                                                <button onClick={() => handleDownload("jpeg")} className="block w-full text-left px-4 py-2 hover:bg-pink-50 rounded">
                                                    JPEG Format
                                                </button>
                                            </div>
                                        )}
                                    </div>
                                    <button
                                        onClick={async () => {
                                            if (navigator.share) {
                                                try {
                                                    await navigator.share({ title: "Check this out", text: "Here is something interesting!", url: window.location.href });
                                                } catch (err) {
                                                    console.error("Error sharing:", err);
                                                }
                                            } else {
                                                alert("Web Share API is not supported in your browser.");
                                            }
                                        }}
                                        className="bg-blue-500 text-white px-4 py-2 rounded-lg hover:bg-blue-600 transition-colors w-full sm:w-auto"
                                    >
                                        Share
                                    </button>
                                </div>
                            </div>
                            <div className="w-full lg:w-80 bg-white p-4 rounded-lg shadow">
                                <h2 className="text-lg font-semibold mb-3 text-gray-800">Edit Tools</h2>
                                <div className="mb-4">
                                    <label className="block text-sm mb-1 font-medium text-gray-700">Background Color</label>
                                    <div className="flex items-center">
                                        <input type="color" value={bgColor} onChange={(e) => setBgColor(e.target.value)} className="w-10 h-10 rounded cursor-pointer" />
                                        <span className="ml-2 text-sm text-gray-600">{bgColor}</span>
                                    </div>
                                </div>
                                <div className="mb-4">
                                    <button onClick={handleAddText} className="bg-blue-500 text-white px-4 py-2 rounded-lg hover:bg-blue-600 transition-colors w-full">Add Text</button>
                                </div>
                                <LogoComponent />
                                {activeIndex !== null && objects[activeIndex] && (
                                    <div className="mt-4 border-t pt-3">
                                        <div className="flex justify-between items-center mb-2">
                                            <h3 className="text-sm font-semibold text-gray-800">Selected Object</h3>
                                            <button onClick={handleDeleteObject} className="bg-red-500 text-white px-3 py-1 rounded-lg hover:bg-red-600 transition-colors text-sm">Delete</button>
                                        </div>
                                        {objects[activeIndex].type === "text" && (
                                            <>
                                                <label className="block text-sm mb-1 font-medium text-gray-700">Text Content</label>
                                                <input type="text" value={objects[activeIndex].text} onChange={(e) => updateActiveObject({ text: e.target.value })} className="w-full border mb-3 px-3 py-2 rounded-lg focus:outline-none focus:ring-2 focus:ring-pink-500" placeholder="Enter text here" />
                                                <label className="block text-sm mb-1 font-medium text-gray-700">Font Family</label>
                                                <select value={objects[activeIndex].font} onChange={(e) => updateActiveObject({ font: e.target.value })} className="w-full border mb-3 px-3 py-2 rounded-lg focus:outline-none focus:ring-2 focus:ring-pink-500">
                                                    {FONT_OPTIONS.map(font => <option key={font} value={font}>{font}</option>)}
                                                </select>
                                                <label className="block text-sm mb-1 font-medium text-gray-700">Font Size: {objects[activeIndex].size}px</label>
                                                <input type="range" min="10" max="100" value={objects[activeIndex].size} onChange={(e) => updateActiveObject({ size: parseInt(e.target.value) })} className="w-full mb-3" />
                                                <label className="block text-sm mb-1 font-medium text-gray-700">Text Color</label>
                                                <div className="flex items-center mb-3">
                                                    <input type="color" value={objects[activeIndex].color} onChange={(e) => updateActiveObject({ color: e.target.value })} className="w-10 h-10 rounded cursor-pointer" />
                                                    <span className="ml-2 text-sm text-gray-600">{objects[activeIndex].color}</span>
                                                </div>
                                                <div className="flex gap-2 mt-2">
                                                    <button onClick={() => updateActiveObject({ bold: !objects[activeIndex].bold })} className={`px-3 py-2 border rounded-lg ${objects[activeIndex].bold ? 'bg-pink-100 border-pink-500' : 'bg-white'}`}>B</button>
                                                    <button onClick={() => updateActiveObject({ italic: !objects[activeIndex].italic })} className={`px-3 py-2 border rounded-lg italic ${objects[activeIndex].italic ? 'bg-pink-100 border-pink-500' : 'bg-white'}`}>I</button>
                                                </div>
                                            </>
                                        )}
                                        {objects[activeIndex].type === "image" && (
                                            <>
                                                <label className="block text-sm mb-1 font-medium text-gray-700">Logo Shape</label>
                                                <select value={objects[activeIndex].shape} onChange={(e) => updateActiveObject({ shape: e.target.value })} className="w-full border mb-3 px-3 py-2 rounded-lg focus:outline-none focus:ring-2 focus:ring-pink-500">
                                                    {LOGO_SHAPES.map(shape => <option key={shape.value} value={shape.value}>{shape.label}</option>)}
                                                </select>
                                                <label className="block text-sm mb-1 font-medium text-gray-700">Size: {Math.round(objects[activeIndex].width)} × {Math.round(objects[activeIndex].height)}px</label>
                                                <input type="range" min="20" max="500" value={objects[activeIndex].width} onChange={(e) => updateActiveObject({ width: parseInt(e.target.value), height: parseInt(e.target.value) })} className="w-full mb-3" />
                                            </>
                                        )}
                                    </div>
                                )}
                                {objects.length > 0 && (
                                    <div className="mt-4 border-t pt-3">
                                        <h3 className="text-sm font-semibold mb-2 text-gray-800">Layers</h3>
                                        <div className="space-y-1 max-h-32 overflow-y-auto">
                                            {objects.map((obj, i) => (
                                                <div key={i} onClick={() => setActiveIndex(i)} className={`p-2 rounded cursor-pointer text-sm ${i === activeIndex ? 'bg-blue-100 border-blue-500 border' : 'bg-gray-50 hover:bg-gray-100'}`}>
                                                    {obj.type === "text" ? `Text: ${obj.text.slice(0, 15)}${obj.text.length > 15 ? '...' : ''}` : `Image (${obj.shape})`}
                                                </div>
                                            ))}
                                        </div>
                                    </div>
                                )}
                            </div>
                        </div>
                    )}
                </div>
            </div>
        </>
    );
}

export default Logo;