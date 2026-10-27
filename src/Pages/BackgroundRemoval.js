import React, { useRef, useState } from "react";
import {
  FiArrowLeft,
  FiHelpCircle,
  FiImage,
  FiCamera,
  FiDownload,
  FiShare2,
  FiUploadCloud,
  FiX,
  FiCheckCircle,
  FiRefreshCw,
  FiShield,
  FiZap,
  FiImage as FiImageIcon,
} from "react-icons/fi";
import Navbar from "./Navbar";

function BackgroundRemover() {
  const [originalImage, setOriginalImage] = useState(null);
  const [originalFile, setOriginalFile] = useState(null);
  const [processedImage, setProcessedImage] = useState(null);
  const [isProcessing, setIsProcessing] = useState(false);
  const [error, setError] = useState("");
  const [showInstructions, setShowInstructions] = useState(false);
  const [dragActive, setDragActive] = useState(false);
  const fileInputRef = useRef(null);
  const cameraInputRef = useRef(null);

  // Configure this through your build environment. A frontend key is still visible to users;
  // for production, proxy this request through your backend instead.
  const API_KEY = process.env.REACT_APP_REMOVE_BG_API_KEY || "";

  const handleFile = (file) => {
    if (!file) return;
    setError("");
    setProcessedImage(null);

    if (!file.type.startsWith("image/")) {
      setError("Please choose a valid image file.");
      return;
    }
    if (file.size > 5 * 1024 * 1024) {
      setError("This image is larger than 5MB. Please choose a smaller file.");
      return;
    }

    const reader = new FileReader();
    reader.onload = (event) => {
      setOriginalImage(event.target?.result || null);
      setOriginalFile(file);
    };
    reader.onerror = () => setError("We couldn't read this image. Please try another file.");
    reader.readAsDataURL(file);
  };

  const handleImageUpload = (event) => {
    handleFile(event.target.files?.[0]);
    event.target.value = "";
  };

  const handleDrop = (event) => {
    event.preventDefault();
    setDragActive(false);
    handleFile(event.dataTransfer.files?.[0]);
  };

  const removeBackground = async () => {
    if (!originalFile || isProcessing) return;
    if (!API_KEY) {
      setError("Add REACT_APP_REMOVE_BG_API_KEY to your environment configuration, or connect this tool to your backend API.");
      return;
    }

    setIsProcessing(true);
    setError("");
    setProcessedImage(null);

    try {
      const formData = new FormData();
      formData.append("image_file", originalFile);
      formData.append("size", "auto");

      const response = await fetch("https://api.remove.bg/v1.0/removebg", {
        method: "POST",
        headers: { "X-Api-Key": API_KEY },
        body: formData,
      });

      if (!response.ok) {
        let message = "Background removal failed. Please try again.";
        try {
          const data = await response.json();
          message = data?.errors?.[0]?.title || message;
        } catch {
          // Keep the fallback message if the response isn't JSON.
        }
        throw new Error(message);
      }

      const resultBlob = await response.blob();
      setProcessedImage(URL.createObjectURL(resultBlob));
    } catch (err) {
      setError(err?.message || "Something went wrong. Please try again.");
    } finally {
      setIsProcessing(false);
    }
  };

  const downloadImage = () => {
    if (!processedImage) return;
    const link = document.createElement("a");
    link.href = processedImage;
    link.download = "background-removed.png";
    document.body.appendChild(link);
    link.click();
    link.remove();
  };

  const shareImage = async () => {
    if (!processedImage) return;
    try {
      const response = await fetch(processedImage);
      const blob = await response.blob();
      const file = new File([blob], "background-removed.png", { type: "image/png" });

      if (navigator.canShare?.({ files: [file] }) && navigator.share) {
        await navigator.share({ title: "Background Removed Image", files: [file] });
      } else if (navigator.share) {
        await navigator.share({ title: "Background Removed Image", text: "My background-removed image" });
      } else {
        setError("Sharing isn't supported in this browser. Download the image to share it.");
      }
    } catch (err) {
      if (err?.name !== "AbortError") setError("Couldn't share the image. You can download it instead.");
    }
  };

  const resetImages = () => {
    setOriginalImage(null);
    setOriginalFile(null);
    setProcessedImage(null);
    setError("");
    setIsProcessing(false);
    if (fileInputRef.current) fileInputRef.current.value = "";
    if (cameraInputRef.current) cameraInputRef.current.value = "";
  };

  return (
    <>
      <Navbar />
      <main className="min-h-screen bg-slate-50 text-slate-900">
        <div className="mx-auto w-full max-w-7xl px-4 py-6 sm:px-6 sm:py-10 lg:px-8">
          {/* Page heading */}
          <div className="mb-8 flex items-start justify-between gap-4">
            <div className="flex min-w-0 items-start gap-3 sm:gap-4">
              <button
                type="button"
                onClick={() => window.history.back()}
                aria-label="Go back"
                className="mt-1 flex h-10 w-10 shrink-0 items-center justify-center rounded-xl border border-slate-200 bg-white text-slate-600 shadow-sm transition hover:border-violet-200 hover:text-violet-700 focus:outline-none focus:ring-2 focus:ring-violet-500"
              >
                <FiArrowLeft size={19} />
              </button>
              <div className="min-w-0">
                <div className="mb-2 inline-flex items-center gap-2 rounded-full border border-violet-100 bg-violet-50 px-3 py-1 text-xs font-semibold text-violet-700">
                  <FiZap size={13} /> AI image tool
                </div>
                <h1 className="text-2xl font-extrabold tracking-tight text-slate-950 sm:text-3xl lg:text-4xl">
                  Background Remover
                </h1>
                <p className="mt-2 max-w-2xl text-sm leading-6 text-slate-500 sm:text-base">
                  Make your subject stand out. Remove the background from a photo in a few clicks.
                </p>
              </div>
            </div>
            <button
              type="button"
              onClick={() => setShowInstructions((value) => !value)}
              aria-label="How to use background remover"
              aria-expanded={showInstructions}
              className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl border border-slate-200 bg-white text-slate-600 shadow-sm transition hover:border-violet-200 hover:text-violet-700 focus:outline-none focus:ring-2 focus:ring-violet-500"
            >
              <FiHelpCircle size={19} />
            </button>
          </div>

          {showInstructions && (
            <section className="mb-6 rounded-2xl border border-violet-100 bg-violet-50 p-4 sm:p-5" aria-label="Instructions">
              <div className="mb-3 flex items-center justify-between gap-3">
                <h2 className="font-bold text-violet-950">How it works</h2>
                <button type="button" onClick={() => setShowInstructions(false)} className="rounded-lg p-1 text-violet-700 hover:bg-violet-100" aria-label="Close instructions">
                  <FiX size={18} />
                </button>
              </div>
              <ol className="grid gap-2 text-sm leading-6 text-violet-900 sm:grid-cols-3">
                <li><span className="font-bold">01.</span> Upload a JPG, PNG, or other image file under 5MB.</li>
                <li><span className="font-bold">02.</span> Select Remove background and wait for processing.</li>
                <li><span className="font-bold">03.</span> Preview your transparent image, then download or share it.</li>
              </ol>
              <p className="mt-3 text-xs leading-5 text-violet-800">
                This tool uses the Remove.bg API. For production use, keep the API key on your backend rather than exposing it in browser code.
              </p>
            </section>
          )}

          <div className="grid items-start gap-6 lg:grid-cols-[0.9fr_1.1fr] lg:gap-8">
            {/* Upload and controls */}
            <section className="overflow-hidden rounded-3xl border border-slate-200 bg-white shadow-sm">
              <div className="border-b border-slate-100 px-5 py-5 sm:px-6">
                <div className="flex items-center gap-3">
                  <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-violet-100 text-violet-700">
                    <FiUploadCloud size={22} />
                  </div>
                  <div>
                    <h2 className="font-bold text-slate-900">Upload your image</h2>
                    <p className="mt-0.5 text-sm text-slate-500">Choose an image from your device</p>
                  </div>
                </div>
              </div>

              <div className="p-5 sm:p-6">
                <button
                  type="button"
                  onClick={() => fileInputRef.current?.click()}
                  onDragOver={(event) => { event.preventDefault(); setDragActive(true); }}
                  onDragLeave={() => setDragActive(false)}
                  onDrop={handleDrop}
                  className={`flex min-h-56 w-full flex-col items-center justify-center rounded-2xl border-2 border-dashed px-4 py-8 text-center transition focus:outline-none focus:ring-2 focus:ring-violet-500 focus:ring-offset-2 sm:min-h-64 ${dragActive ? "border-violet-500 bg-violet-50" : "border-slate-300 bg-slate-50 hover:border-violet-400 hover:bg-violet-50/60"}`}
                >
                  {originalImage ? (
                    <>
                      <div className="mb-4 flex h-14 w-14 items-center justify-center rounded-2xl bg-emerald-100 text-emerald-600">
                        <FiCheckCircle size={27} />
                      </div>
                      <span className="max-w-full break-words text-sm font-bold text-slate-800">{originalFile?.name || "Image selected"}</span>
                      <span className="mt-2 text-sm text-slate-500">Click to choose a different image</span>
                    </>
                  ) : (
                    <>
                      <div className="mb-4 flex h-16 w-16 items-center justify-center rounded-2xl bg-violet-100 text-violet-700">
                        <FiImage size={29} />
                      </div>
                      <span className="text-base font-bold text-slate-800">Drop your image here</span>
                      <span className="mt-2 text-sm text-slate-500">or click to browse your files</span>
                      <span className="mt-4 rounded-full bg-white px-3 py-1 text-xs font-medium text-slate-500 ring-1 ring-slate-200">Max file size: 5MB</span>
                    </>
                  )}
                </button>
                <input ref={fileInputRef} type="file" accept="image/*" onChange={handleImageUpload} className="hidden" />
                <input ref={cameraInputRef} type="file" accept="image/*" capture="environment" onChange={handleImageUpload} className="hidden" />

                <div className="mt-4 grid grid-cols-2 gap-3">
                  <button
                    type="button"
                    onClick={() => fileInputRef.current?.click()}
                    className="flex min-h-11 items-center justify-center gap-2 rounded-xl border border-slate-200 bg-white px-3 py-3 text-sm font-semibold text-slate-700 transition hover:border-violet-300 hover:bg-violet-50 focus:outline-none focus:ring-2 focus:ring-violet-500"
                  >
                    <FiImage size={17} /> Gallery
                  </button>
                  <button
                    type="button"
                    onClick={() => cameraInputRef.current?.click()}
                    className="flex min-h-11 items-center justify-center gap-2 rounded-xl border border-slate-200 bg-white px-3 py-3 text-sm font-semibold text-slate-700 transition hover:border-violet-300 hover:bg-violet-50 focus:outline-none focus:ring-2 focus:ring-violet-500"
                  >
                    <FiCamera size={17} /> Camera
                  </button>
                </div>

                {error && (
                  <div role="alert" className="mt-4 flex items-start gap-2 rounded-xl border border-red-200 bg-red-50 px-3 py-3 text-sm leading-5 text-red-700">
                    <FiX className="mt-0.5 shrink-0" size={16} />
                    <span>{error}</span>
                  </div>
                )}

                <button
                  type="button"
                  onClick={removeBackground}
                  disabled={!originalImage || isProcessing}
                  className="mt-5 flex min-h-12 w-full items-center justify-center gap-2 rounded-xl bg-violet-600 px-4 py-3 text-sm font-bold text-white shadow-lg shadow-violet-600/20 transition hover:bg-violet-700 focus:outline-none focus:ring-2 focus:ring-violet-500 focus:ring-offset-2 disabled:cursor-not-allowed disabled:bg-slate-200 disabled:text-slate-400 disabled:shadow-none"
                >
                  {isProcessing ? <><span className="h-4 w-4 animate-spin rounded-full border-2 border-white/40 border-t-white" /> Removing background...</> : <><FiZap size={17} /> Remove background</>}
                </button>

                <div className="mt-4 flex items-start gap-2 rounded-xl bg-slate-50 p-3 text-xs leading-5 text-slate-500">
                  <FiShield className="mt-0.5 shrink-0 text-emerald-600" size={15} />
                  <p>Your original image stays unchanged. Upload only images you have permission to use.</p>
                </div>
              </div>
            </section>

            {/* Preview panel */}
            <section className="overflow-hidden rounded-3xl border border-slate-200 bg-white shadow-sm">
              <div className="flex flex-wrap items-center justify-between gap-3 border-b border-slate-100 px-5 py-5 sm:px-6">
                <div>
                  <h2 className="font-bold text-slate-900">Image preview</h2>
                  <p className="mt-1 text-sm text-slate-500">Compare your original and finished image</p>
                </div>
                {processedImage && (
                  <span className="inline-flex items-center gap-1.5 rounded-full bg-emerald-50 px-3 py-1.5 text-xs font-bold text-emerald-700">
                    <FiCheckCircle size={14} /> Ready to download
                  </span>
                )}
              </div>

              <div className="grid gap-4 p-5 sm:p-6 xl:grid-cols-2">
                <div className="min-w-0">
                  <div className="mb-2 flex items-center justify-between gap-2">
                    <h3 className="text-sm font-bold text-slate-700">Original</h3>
                    <span className="text-xs text-slate-400">Before</span>
                  </div>
                  <div className="flex h-64 min-w-0 items-center justify-center overflow-hidden rounded-2xl border border-slate-200 bg-slate-50 p-3 sm:h-72">
                    {originalImage ? (
                      <img src={originalImage} alt="Original upload" className="max-h-full max-w-full object-contain" />
                    ) : (
                      <div className="flex flex-col items-center text-center text-slate-400">
                        <FiImage size={30} />
                        <p className="mt-3 text-sm">Your original image appears here</p>
                      </div>
                    )}
                  </div>
                </div>

                <div className="min-w-0">
                  <div className="mb-2 flex items-center justify-between gap-2">
                    <h3 className="text-sm font-bold text-slate-700">Background removed</h3>
                    <span className="text-xs text-slate-400">After</span>
                  </div>
                  <div className="relative flex h-64 min-w-0 items-center justify-center overflow-hidden rounded-2xl border border-slate-200 bg-[linear-gradient(45deg,#f1f5f9_25%,transparent_25%),linear-gradient(-45deg,#f1f5f9_25%,transparent_25%),linear-gradient(45deg,transparent_75%,#f1f5f9_75%),linear-gradient(-45deg,transparent_75%,#f1f5f9_75%)] bg-[length:20px_20px] bg-[position:0_0,0_10px,10px_-10px,-10px_0px] p-3 sm:h-72">
                    {isProcessing ? (
                      <div className="flex flex-col items-center text-center">
                        <div className="h-10 w-10 animate-spin rounded-full border-4 border-violet-100 border-t-violet-600" />
                        <p className="mt-4 text-sm font-semibold text-slate-700">Working on your image...</p>
                        <p className="mt-1 text-xs text-slate-500">This usually takes a few moments</p>
                      </div>
                    ) : processedImage ? (
                      <img src={processedImage} alt="Background removed result" className="max-h-full max-w-full object-contain" />
                    ) : (
                      <div className="flex flex-col items-center text-center text-slate-400">
                        <FiImageIcon size={30} />
                        <p className="mt-3 text-sm">Your result will appear here</p>
                        <p className="mt-1 text-xs">The background will be transparent</p>
                      </div>
                    )}
                  </div>
                </div>
              </div>

              {processedImage ? (
                <div className="flex flex-col gap-3 border-t border-slate-100 bg-slate-50/70 p-5 sm:flex-row sm:px-6">
                  <button type="button" onClick={downloadImage} className="flex min-h-11 flex-1 items-center justify-center gap-2 rounded-xl bg-emerald-600 px-4 py-3 text-sm font-bold text-white transition hover:bg-emerald-700 focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:ring-offset-2">
                    <FiDownload size={17} /> Download PNG
                  </button>
                  <button type="button" onClick={shareImage} className="flex min-h-11 flex-1 items-center justify-center gap-2 rounded-xl border border-slate-200 bg-white px-4 py-3 text-sm font-bold text-slate-700 transition hover:border-violet-300 hover:bg-violet-50 focus:outline-none focus:ring-2 focus:ring-violet-500">
                    <FiShare2 size={17} /> Share
                  </button>
                  <button type="button" onClick={resetImages} className="flex min-h-11 items-center justify-center gap-2 rounded-xl border border-slate-200 bg-white px-4 py-3 text-sm font-bold text-slate-600 transition hover:bg-slate-100 focus:outline-none focus:ring-2 focus:ring-slate-400">
                    <FiRefreshCw size={16} /> Start over
                  </button>
                </div>
              ) : (
                <div className="border-t border-slate-100 px-5 py-4 text-xs leading-5 text-slate-500 sm:px-6">
                  <span className="font-semibold text-slate-700">Tip:</span> For best results, use a clear photo with your subject in focus.
                </div>
              )}
            </section>
          </div>

          <p className="mt-6 text-center text-xs leading-5 text-slate-400">
            Background removal is processed using the Remove.bg service. Results may vary depending on image quality.
          </p>
        </div>
      </main>
    </>
  );
}

export default BackgroundRemover;
