import React, { useState, useEffect } from "react";
import jsPDF from "jspdf";
import {
    FaUpload,
    FaPhone,
    FaWhatsapp,
    FaEnvelope,
    FaMapMarkerAlt,
    FaRegFilePdf,
    FaShareAlt,
    FaTimes,
    FaClock,
    FaBuilding,
    FaPlus,
    FaSearch,
    FaEye,
    FaBriefcase,
} from "react-icons/fa";
import Navbar from "./Navbar";

const emptyForm = {
    name: "",
    phone: "",
    whatsapp: "",
    email: "",
    address: "",
    businessHours: "",
    logo: null,
    description: "",
};

const inputClass =
    "w-full rounded-xl border border-slate-200 bg-white px-4 py-3 text-sm text-slate-800 outline-none transition placeholder:text-slate-400 focus:border-indigo-500 focus:ring-4 focus:ring-indigo-100";
const labelClass = "mb-2 block text-sm font-semibold text-slate-700";

export default function BusinessCardManager() {
    const [cards, setCards] = useState([]);
    const [form, setForm] = useState(emptyForm);
    const [viewCard, setViewCard] = useState(null);
    const [showForm, setShowForm] = useState(false);
    const [searchTerm, setSearchTerm] = useState("");

    useEffect(() => {
        try {
            const savedCards = JSON.parse(localStorage.getItem("businessCards") || "[]");
            if (Array.isArray(savedCards)) setCards(savedCards);
        } catch (error) {
            console.error("Could not load saved business cards:", error);
        }
    }, []);

    const saveCardsToLocalStorage = (newCards) => {
        try {
            localStorage.setItem("businessCards", JSON.stringify(newCards));
        } catch (error) {
            console.error("Could not save business cards:", error);
            alert("Could not save this card. The logo may be too large for browser storage.");
        }
    };

    const handleChange = (e) => {
        const { name, value } = e.target;
        setForm((current) => ({ ...current, [name]: value }));
    };

    const handleImageUpload = (e) => {
        const file = e.target.files?.[0];
        if (!file) return;
        if (!file.type.startsWith("image/")) {
            alert("Please select an image file.");
            e.target.value = "";
            return;
        }
        if (file.size > 5 * 1024 * 1024) {
            alert("Please choose an image smaller than 5MB.");
            e.target.value = "";
            return;
        }
        const reader = new FileReader();
        reader.onloadend = () => setForm((current) => ({ ...current, logo: reader.result }));
        reader.readAsDataURL(file);
    };

    const handleAdd = (e) => {
        e.preventDefault();
        if (!form.name.trim()) {
            alert("Please enter at least a business name.");
            return;
        }
        const newCard = { ...form, name: form.name.trim(), id: Date.now() };
        const updatedCards = [...cards, newCard];
        setCards(updatedCards);
        saveCardsToLocalStorage(updatedCards);
        setForm(emptyForm);
        setShowForm(false);
    };

    const handleDownload = (card) => {
        const doc = new jsPDF();
        const pageWidth = doc.internal.pageSize.width;
        const pageHeight = doc.internal.pageSize.height;
        const margin = 15;
        let y = 42;

        doc.setFillColor(49, 46, 129);
        doc.rect(0, 0, pageWidth, 38, "F");
        doc.setFont("helvetica", "bold");
        doc.setFontSize(19);
        doc.setTextColor(255, 255, 255);
        doc.text(doc.splitTextToSize(card.name || "Business", pageWidth - 2 * margin), margin, 18);
        doc.setFont("helvetica", "normal");
        doc.setFontSize(9);
        doc.text("BUSINESS PROFILE", margin, 29);

        if (card.logo) {
            try {
                const format = card.logo.startsWith("data:image/png") ? "PNG" : "JPEG";
                doc.addImage(card.logo, format, pageWidth - 38, 6, 25, 25);
            } catch (error) {
                console.warn("Logo could not be added to PDF:", error);
            }
        }

        const addSection = (title) => {
            if (y > pageHeight - 35) {
                doc.addPage();
                y = 20;
            }
            doc.setFillColor(238, 242, 255);
            doc.roundedRect(margin, y, pageWidth - margin * 2, 10, 2, 2, "F");
            doc.setFont("helvetica", "bold");
            doc.setFontSize(11);
            doc.setTextColor(67, 56, 202);
            doc.text(title, margin + 4, y + 6.7);
            y += 17;
        };

        const addLine = (label, value) => {
            if (!value) return;
            const lines = doc.splitTextToSize(`${label}: ${value}`, pageWidth - margin * 2 - 4);
            const needed = lines.length * 6 + 4;
            if (y + needed > pageHeight - 20) {
                doc.addPage();
                y = 20;
            }
            doc.setFont("helvetica", "bold");
            doc.setFontSize(10);
            doc.setTextColor(51, 65, 85);
            doc.text(`${label}:`, margin + 2, y);
            doc.setFont("helvetica", "normal");
            const labelWidth = doc.getTextWidth(`${label}: `);
            const valueLines = doc.splitTextToSize(String(value), pageWidth - margin * 2 - labelWidth - 4);
            doc.text(valueLines, margin + 2 + labelWidth, y);
            y += Math.max(7, valueLines.length * 5.5 + 2);
        };

        addSection("ABOUT THE BUSINESS");
        addLine("Description", card.description || "No description provided");
        addSection("CONTACT INFORMATION");
        addLine("Phone", card.phone);
        addLine("WhatsApp", card.whatsapp);
        addLine("Email", card.email);
        addLine("Address", card.address);
        addSection("BUSINESS HOURS");
        addLine("Hours", card.businessHours || "Not provided");

        doc.setFont("helvetica", "normal");
        doc.setFontSize(8);
        doc.setTextColor(148, 163, 184);
        doc.text("Generated by Business Card Manager", pageWidth / 2, pageHeight - 8, {
            align: "center",
        });
        const safeName = (card.name || "business").replace(/[^\w-]+/g, "_");
        doc.save(`${safeName}_business_card.pdf`);
    };

    const handleShare = async (card) => {
        const shareText = [
            `Check out ${card.name}'s business profile!`,
            card.description ? `About: ${card.description}` : "",
            card.phone ? `Phone: ${card.phone}` : "",
            card.whatsapp ? `WhatsApp: ${card.whatsapp}` : "",
            card.email ? `Email: ${card.email}` : "",
            card.address ? `Address: ${card.address}` : "",
            card.businessHours ? `Business Hours: ${card.businessHours}` : "",
        ].filter(Boolean).join("\n");

        if (navigator.share) {
            try {
                await navigator.share({
                    title: `${card.name} - Business Profile`,
                    text: shareText,
                    url: window.location.href,
                });
            } catch (error) {
                if (error?.name !== "AbortError") console.error("Sharing failed:", error);
            }
        } else if (navigator.clipboard?.writeText) {
            try {
                await navigator.clipboard.writeText(shareText);
                alert("Business details copied. You can now share them.");
            } catch {
                alert("Sharing is not supported in this browser. Please download the PDF instead.");
            }
        } else {
            alert("Sharing is not supported in this browser. Please download the PDF instead.");
        }
    };

    const filteredCards = cards.filter((card) =>
        [card.name, card.email, card.phone, card.address]
            .some((value) => String(value || "").toLowerCase().includes(searchTerm.toLowerCase()))
    );

    const contactRows = viewCard
        ? [
            { label: "Phone", value: viewCard.phone, icon: <FaPhone />, color: "text-indigo-600" },
            { label: "WhatsApp", value: viewCard.whatsapp, icon: <FaWhatsapp />, color: "text-emerald-600" },
            { label: "Email", value: viewCard.email, icon: <FaEnvelope />, color: "text-violet-600" },
            { label: "Address", value: viewCard.address, icon: <FaMapMarkerAlt />, color: "text-rose-600" },
            { label: "Business hours", value: viewCard.businessHours, icon: <FaClock />, color: "text-amber-600" },
        ].filter((item) => item.value)
        : [];

    return (
        <>
            <Navbar />
            <main className="min-h-screen bg-slate-50 pb-16">
                <section className="mx-auto w-full max-w-7xl px-4 py-7 sm:px-6 lg:px-8">
                    <div className="overflow-hidden rounded-3xl bg-gradient-to-br from-slate-950 via-indigo-950 to-indigo-800 px-5 py-8 text-white shadow-xl sm:px-8 sm:py-10 lg:px-12">
                        <div className="flex flex-col gap-8 md:flex-row md:items-center md:justify-between">
                            <div className="max-w-2xl">
                                <div className="mb-4 inline-flex items-center gap-2 rounded-full border border-white/20 bg-white/10 px-3 py-1.5 text-xs font-semibold tracking-wide text-indigo-100">
                                    <FaBriefcase /> BUSINESS WORKSPACE
                                </div>
                                <h1 className="text-3xl font-bold tracking-tight sm:text-4xl lg:text-5xl">
                                    Business Card Manager
                                </h1>
                                <p className="mt-3 max-w-xl text-sm leading-6 text-indigo-100 sm:text-base">
                                    Keep your business details organized, create polished profiles, and share them in a few clicks.
                                </p>
                                <div className="mt-6 flex flex-wrap gap-3">
                                    <button
                                        type="button"
                                        onClick={() => setShowForm((open) => !open)}
                                        className="inline-flex items-center justify-center gap-2 rounded-xl bg-white px-5 py-3 text-sm font-bold text-indigo-950 shadow-lg transition hover:-translate-y-0.5 hover:bg-indigo-50 focus:outline-none focus:ring-4 focus:ring-white/30"
                                    >
                                        <FaPlus /> {showForm ? "Close form" : "Add business card"}
                                    </button>
                                    <div className="inline-flex items-center gap-2 rounded-xl border border-white/20 bg-white/10 px-4 py-3 text-sm font-medium text-white">
                                        <FaBuilding className="text-indigo-200" />
                                        {cards.length} {cards.length === 1 ? "profile" : "profiles"} saved
                                    </div>
                                </div>
                            </div>
                            <div className="hidden h-36 w-36 shrink-0 items-center justify-center rounded-[2rem] border border-white/20 bg-white/10 shadow-2xl md:flex lg:h-44 lg:w-44">
                                <FaBuilding className="text-6xl text-indigo-100 lg:text-7xl" />
                            </div>
                        </div>
                    </div>

                    <div className="mt-7 grid grid-cols-1 gap-4 sm:grid-cols-3">
                        <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
                            <p className="text-sm font-medium text-slate-500">Saved profiles</p>
                            <p className="mt-2 text-3xl font-bold tracking-tight text-slate-900">{cards.length}</p>
                            <p className="mt-1 text-xs text-slate-400">Business cards stored on this device</p>
                        </div>
                        <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
                            <p className="text-sm font-medium text-slate-500">Contact details</p>
                            <p className="mt-2 text-3xl font-bold tracking-tight text-slate-900">
                                {cards.filter((card) => card.phone || card.email || card.whatsapp).length}
                            </p>
                            <p className="mt-1 text-xs text-slate-400">Profiles with contact information</p>
                        </div>
                        <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
                            <p className="text-sm font-medium text-slate-500">Logo profiles</p>
                            <p className="mt-2 text-3xl font-bold tracking-tight text-slate-900">
                                {cards.filter((card) => card.logo).length}
                            </p>
                            <p className="mt-1 text-xs text-slate-400">Profiles with a brand logo</p>
                        </div>
                    </div>

                    {showForm && (
                        <form onSubmit={handleAdd} className="mt-8 rounded-3xl border border-slate-200 bg-white p-5 shadow-sm sm:p-8">
                            <div className="mb-7 flex flex-col gap-2 border-b border-slate-100 pb-5 sm:flex-row sm:items-center sm:justify-between">
                                <div>
                                    <p className="text-xs font-bold uppercase tracking-[0.18em] text-indigo-600">New profile</p>
                                    <h2 className="mt-1 text-2xl font-bold text-slate-900">Add business details</h2>
                                    <p className="mt-1 text-sm text-slate-500">Fields marked with * are required.</p>
                                </div>
                                <button type="button" onClick={() => { setShowForm(false); setForm(emptyForm); }} className="self-start rounded-xl p-2 text-slate-400 transition hover:bg-slate-100 hover:text-slate-700 sm:self-center" aria-label="Close form">
                                    <FaTimes />
                                </button>
                            </div>

                            <div className="grid grid-cols-1 gap-8 lg:grid-cols-2">
                                <div className="space-y-5">
                                    <div>
                                        <label className={labelClass} htmlFor="business-name">Business name *</label>
                                        <input id="business-name" name="name" value={form.name} onChange={handleChange} className={inputClass} placeholder="e.g. Acme Studio" required />
                                    </div>
                                    <div>
                                        <label className={labelClass} htmlFor="business-description">About your business</label>
                                        <textarea id="business-description" name="description" value={form.description} onChange={handleChange} className={`${inputClass} min-h-32 resize-y`} placeholder="Tell customers what your business does..." rows={4} />
                                    </div>
                                    <div>
                                        <label className={labelClass} htmlFor="business-logo">Brand logo <span className="font-normal text-slate-400">(optional, max 5MB)</span></label>
                                        <label htmlFor="business-logo" className="flex cursor-pointer flex-col items-center justify-center rounded-2xl border-2 border-dashed border-slate-200 bg-slate-50 px-5 py-7 text-center transition hover:border-indigo-300 hover:bg-indigo-50/50">
                                            {form.logo ? (
                                                <img src={form.logo} alt="Logo preview" className="mb-3 h-20 w-20 rounded-xl border border-slate-200 bg-white object-contain p-2" />
                                            ) : (
                                                <span className="mb-3 flex h-12 w-12 items-center justify-center rounded-xl bg-indigo-100 text-xl text-indigo-600"><FaUpload /></span>
                                            )}
                                            <span className="text-sm font-semibold text-slate-800">{form.logo ? "Choose a different logo" : "Upload a logo"}</span>
                                            <span className="mt-1 text-xs text-slate-500">PNG, JPG, GIF or other image formats</span>
                                        </label>
                                        <input id="business-logo" type="file" accept="image/*" onChange={handleImageUpload} className="sr-only" />
                                        {form.logo && (
                                            <button type="button" onClick={() => setForm((current) => ({ ...current, logo: null }))} className="mt-2 text-sm font-semibold text-rose-600 hover:text-rose-700">Remove logo</button>
                                        )}
                                    </div>
                                </div>

                                <div className="space-y-5">

                                    {/* Phone number */}
                                    <div className="w-full min-w-0">
                                        <label className={labelClass} htmlFor="business-phone">
                                            Phone number
                                        </label>
                                        <div className="relative w-full">
                                            <FaPhone className="pointer-events-none absolute left-4 top-1/2 z-10 h-4 w-4 -translate-y-1/2 text-slate-400" />
                                            <input
                                                id="business-phone"
                                                type="tel"
                                                name="phone"
                                                value={form.phone}
                                                onChange={handleChange}
                                                className={`${inputClass} !box-border !w-full !min-w-0 !pl-11`}
                                                placeholder="Phone number"
                                            />
                                        </div>
                                    </div>

                                    {/* WhatsApp number */}
                                    <div className="w-full min-w-0">
                                        <label className={labelClass} htmlFor="business-whatsapp">
                                            WhatsApp number
                                        </label>
                                        <div className="relative w-full">
                                            <FaWhatsapp className="pointer-events-none absolute left-4 top-1/2 z-10 h-4 w-4 -translate-y-1/2 text-emerald-500" />
                                            <input
                                                id="business-whatsapp"
                                                type="tel"
                                                name="whatsapp"
                                                value={form.whatsapp}
                                                onChange={handleChange}
                                                className={`${inputClass} !box-border !w-full !min-w-0 !pl-11`}
                                                placeholder="WhatsApp number"
                                            />
                                        </div>
                                    </div>

                                    {/* Email address */}
                                    <div className="w-full min-w-0">
                                        <label className={labelClass} htmlFor="business-email">
                                            Email address
                                        </label>
                                        <div className="relative w-full">
                                            <FaEnvelope className="pointer-events-none absolute left-4 top-1/2 z-10 h-4 w-4 -translate-y-1/2 text-slate-400" />
                                            <input
                                                id="business-email"
                                                type="email"
                                                name="email"
                                                value={form.email}
                                                onChange={handleChange}
                                                className={`${inputClass} !box-border !w-full !min-w-0 !pl-11`}
                                                placeholder="you@company.com"
                                            />
                                        </div>
                                    </div>

                                    {/* Business hours */}
                                    <div className="w-full min-w-0">
                                        <label className={labelClass} htmlFor="business-hours">
                                            Business hours
                                        </label>
                                        <div className="relative w-full">
                                            <FaClock className="pointer-events-none absolute left-4 top-1/2 z-10 h-4 w-4 -translate-y-1/2 text-slate-400" />
                                            <input
                                                id="business-hours"
                                                name="businessHours"
                                                value={form.businessHours}
                                                onChange={handleChange}
                                                className={`${inputClass} !box-border !w-full !min-w-0 !pl-11`}
                                                placeholder="Mon-Fri, 9 AM-5 PM"
                                            />
                                        </div>
                                    </div>

                                </div>
                            </div>

                            <div className="mt-8 flex flex-col-reverse gap-3 border-t border-slate-100 pt-5 sm:flex-row sm:justify-end">
                                <button type="button" onClick={() => { setShowForm(false); setForm(emptyForm); }} className="rounded-xl border border-slate-200 px-5 py-3 text-sm font-semibold text-slate-700 transition hover:bg-slate-50">Cancel</button>
                                <button type="submit" disabled={!form.name.trim()} className="inline-flex items-center justify-center gap-2 rounded-xl bg-indigo-600 px-6 py-3 text-sm font-bold text-white shadow-lg shadow-indigo-200 transition hover:bg-indigo-700 disabled:cursor-not-allowed disabled:bg-indigo-300 disabled:shadow-none">
                                    <FaPlus /> Save business card
                                </button>
                            </div>
                        </form>
                    )}

                    <div className="mt-9">
                        <div className="mb-5 flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
                            <div>
                                <p className="text-xs font-bold uppercase tracking-[0.18em] text-indigo-600">Your directory</p>
                                <h2 className="mt-1 text-2xl font-bold text-slate-900">Saved business cards</h2>
                                <p className="mt-1 text-sm text-slate-500">Open a card to view, share, or download its profile.</p>
                            </div>
                            <div className="relative w-full sm:max-w-xs">
                                <FaSearch className="pointer-events-none absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" />
                                <input value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)} className={`${inputClass} pl-11`} placeholder="Search business cards..." aria-label="Search business cards" />
                            </div>
                        </div>

                        {filteredCards.length > 0 ? (
                            <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 xl:grid-cols-3">
                                {filteredCards.map((card) => (
                                    <button key={card.id} type="button" onClick={() => setViewCard(card)} className="group relative overflow-hidden rounded-2xl border border-slate-200 bg-white p-5 text-left shadow-sm transition duration-200 hover:-translate-y-1 hover:border-indigo-200 hover:shadow-xl focus:outline-none focus:ring-4 focus:ring-indigo-100">
                                        <div className="absolute inset-x-0 top-0 h-1 bg-gradient-to-r from-indigo-500 via-violet-500 to-sky-400" />
                                        <div className="flex items-start gap-4">
                                            <div className="flex h-16 w-16 shrink-0 items-center justify-center overflow-hidden rounded-2xl border border-slate-100 bg-indigo-50">
                                                {card.logo ? <img src={card.logo} alt={`${card.name} logo`} className="h-full w-full object-contain p-2" /> : <FaBuilding className="text-2xl text-indigo-400" />}
                                            </div>
                                            <div className="min-w-0 flex-1">
                                                <h3 className="truncate text-lg font-bold text-slate-900 transition group-hover:text-indigo-700">{card.name}</h3>
                                                <p className="mt-1 line-clamp-2 text-sm text-slate-500">{card.description || "No business description added yet."}</p>
                                            </div>
                                        </div>
                                        <div className="mt-5 space-y-2 border-t border-slate-100 pt-4">
                                            {card.email && <p className="flex min-w-0 items-center gap-2 text-sm text-slate-600"><FaEnvelope className="shrink-0 text-indigo-400" /><span className="truncate">{card.email}</span></p>}
                                            {card.phone && <p className="flex items-center gap-2 text-sm text-slate-600"><FaPhone className="shrink-0 text-indigo-400" /><span>{card.phone}</span></p>}
                                            {!card.email && !card.phone && <p className="text-sm italic text-slate-400">No contact details added</p>}
                                        </div>
                                        <div className="mt-5 flex items-center justify-between text-sm font-semibold text-indigo-600">
                                            <span className="inline-flex items-center gap-2"><FaEye /> View profile</span>
                                            <span className="transition group-hover:translate-x-1">→</span>
                                        </div>
                                    </button>
                                ))}
                            </div>
                        ) : (
                            <div className="rounded-3xl border-2 border-dashed border-slate-200 bg-white px-5 py-14 text-center">
                                <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-2xl bg-indigo-50 text-2xl text-indigo-500"><FaBuilding /></div>
                                <h3 className="mt-5 text-lg font-bold text-slate-900">{searchTerm ? "No matching cards found" : "Your business directory is empty"}</h3>
                                <p className="mx-auto mt-2 max-w-md text-sm leading-6 text-slate-500">
                                    {searchTerm ? "Try another business name, email, phone number, or address." : "Create your first business profile to keep your company details ready to share."}
                                </p>
                                {!searchTerm && <button type="button" onClick={() => setShowForm(true)} className="mt-5 inline-flex items-center gap-2 rounded-xl bg-indigo-600 px-5 py-3 text-sm font-bold text-white transition hover:bg-indigo-700"><FaPlus /> Add your first card</button>}
                            </div>
                        )}
                    </div>
                </section>
            </main>

            {viewCard && (
                <div className="fixed inset-0 z-50 flex items-end justify-center bg-slate-950/60 p-0 backdrop-blur-sm sm:items-center sm:p-4" onClick={() => setViewCard(null)}>
                    <section role="dialog" aria-modal="true" aria-labelledby="business-card-title" onClick={(e) => e.stopPropagation()} className="max-h-[95vh] w-full max-w-2xl overflow-y-auto rounded-t-3xl bg-white shadow-2xl sm:rounded-3xl">
                        <div className="relative overflow-hidden bg-gradient-to-br from-slate-950 via-indigo-950 to-indigo-700 px-5 py-7 text-white sm:px-8">
                            <button type="button" onClick={() => setViewCard(null)} aria-label="Close preview" className="absolute right-4 top-4 rounded-xl border border-white/20 bg-white/10 p-2 text-white transition hover:bg-white/20"><FaTimes /></button>
                            <div className="flex items-center gap-4 pr-10">
                                <div className="flex h-20 w-20 shrink-0 items-center justify-center overflow-hidden rounded-2xl border border-white/20 bg-white/10">
                                    {viewCard.logo ? <img src={viewCard.logo} alt={`${viewCard.name} logo`} className="h-full w-full bg-white object-contain p-2" /> : <FaBuilding className="text-3xl text-indigo-100" />}
                                </div>
                                <div className="min-w-0">
                                    <p className="text-xs font-bold uppercase tracking-[0.18em] text-indigo-200">Business profile</p>
                                    <h2 id="business-card-title" className="mt-1 break-words text-2xl font-bold sm:text-3xl">{viewCard.name}</h2>
                                    {viewCard.businessHours && <p className="mt-2 flex items-center gap-2 text-sm text-indigo-100"><FaClock /> {viewCard.businessHours}</p>}
                                </div>
                            </div>
                        </div>
                        <div className="space-y-6 p-5 sm:p-8">
                            <div>
                                <h3 className="text-xs font-bold uppercase tracking-[0.16em] text-indigo-600">About the business</h3>
                                <p className="mt-3 whitespace-pre-wrap text-sm leading-7 text-slate-600">{viewCard.description || "No description provided."}</p>
                            </div>
                            <div>
                                <h3 className="mb-3 text-xs font-bold uppercase tracking-[0.16em] text-indigo-600">Contact information</h3>
                                {contactRows.length ? (
                                    <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
                                        {contactRows.map((item) => (
                                            <div key={item.label} className="flex min-w-0 items-start gap-3 rounded-2xl border border-slate-100 bg-slate-50 p-4">
                                                <span className={`mt-0.5 shrink-0 text-lg ${item.color}`}>{item.icon}</span>
                                                <div className="min-w-0">
                                                    <p className="text-xs font-semibold text-slate-400">{item.label}</p>
                                                    <p className="mt-1 break-words text-sm font-medium text-slate-800">{item.value}</p>
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                ) : (
                                    <p className="rounded-xl bg-slate-50 p-4 text-sm text-slate-500">No contact details have been added.</p>
                                )}
                            </div>
                        </div>
                        <div className="flex flex-col gap-3 border-t border-slate-100 bg-slate-50 p-5 sm:flex-row sm:justify-end sm:px-8">
                            <button type="button" onClick={() => handleDownload(viewCard)} className="inline-flex items-center justify-center gap-2 rounded-xl bg-rose-600 px-5 py-3 text-sm font-bold text-white transition hover:bg-rose-700"><FaRegFilePdf /> Download PDF</button>
                            <button type="button" onClick={() => handleShare(viewCard)} className="inline-flex items-center justify-center gap-2 rounded-xl bg-indigo-600 px-5 py-3 text-sm font-bold text-white transition hover:bg-indigo-700"><FaShareAlt /> Share profile</button>
                        </div>
                    </section>
                </div>
            )}
        </>
    );
}
