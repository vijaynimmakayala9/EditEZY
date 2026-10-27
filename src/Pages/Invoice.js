import React, { useState } from "react";
import { FaArrowLeft } from "react-icons/fa";



const Invoice = () => {
  const [invoices, setInvoices] = useState([]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [formData, setFormData] = useState({
    companyName: "",
    companyLogo: "",
    customerName: "",
    customerMobile: "",
    customerAddress: "",
    items: [{
      productName: "",
      quantity: "",
      unit: "kg",
      description: "",
      price: "",
      offerPrice: "",
      hsn: ""
    }]
  });

  const handleDownload = async (invoice) => {
    try {
      // Create a printable HTML version of the invoice
      const printWindow = window.open("", "_blank");
      if (!printWindow) {
        alert("Please allow pop-ups to print the invoice.");
        return;
      }

      const htmlContent = generatePrintableHTML(invoice);
      printWindow.document.open();
      printWindow.document.write(htmlContent);
      printWindow.document.close();
      printWindow.onload = () => printWindow.print();

    } catch (error) {
      console.error('Error generating PDF:', error);
      alert('Error generating PDF. Please try again.');
    }
  };

  const generatePrintableHTML = (invoice) => {
    const subtotal = invoice.items?.reduce((total, item) => {
      return total + (parseFloat(item.offerPrice) || 0) * (parseInt(item.quantity, 10) || 0);
    }, 0) || 0;
    const money = (value) => Number(value || 0).toFixed(2);
    const escapeHtml = (value = "") => String(value).replace(/[&<>"']/g, (char) => ({
      "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;"
    }[char]));

    const itemRows = invoice.items?.length
      ? invoice.items.map((item) => `
        <tr class="border-b border-slate-200 even:bg-slate-50">
          <td class="p-3 align-top">
            <div class="font-semibold text-slate-900">${escapeHtml(item.productName)}</div>
            ${item.description ? `<div class="mt-1 text-xs text-slate-500">${escapeHtml(item.description)}</div>` : ""}
          </td>
          <td class="p-3 text-center align-top">${escapeHtml(item.quantity)}</td>
          <td class="p-3 text-center align-top">${escapeHtml(item.unit)}</td>
          <td class="p-3 text-right align-top">${money(item.price)}</td>
          <td class="p-3 text-right align-top font-semibold">${money(item.offerPrice)}</td>
          <td class="p-3 text-center align-top">${escapeHtml(item.hsn || "N/A")}</td>
        </tr>`).join("")
      : `<tr><td colspan="6" class="p-4 text-center text-slate-500">No items found</td></tr>`;

    return `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0" />
  <title>Invoice ${escapeHtml(invoice.invoiceNumber)}</title>
  <script src="https://cdn.tailwindcss.com"></script>
  <style>
    @page { size: auto; margin: 12mm; }
    @media print {
      body { -webkit-print-color-adjust: exact; print-color-adjust: exact; }
      .invoice-sheet { max-width: none !important; padding: 0 !important; }
      thead { display: table-header-group; }
      tr, .avoid-break { break-inside: avoid; }
    }
  </style>
</head>
<body class="bg-white font-sans text-xs leading-relaxed text-slate-800">
  <main class="invoice-sheet mx-auto max-w-4xl p-6 sm:p-10">
    <header class="mb-7 flex flex-col gap-5 border-b-4 border-blue-600 pb-6 sm:flex-row sm:items-start sm:justify-between">
      <section class="min-w-0">
        ${invoice.companyLogo ? `<img src="${escapeHtml(invoice.companyLogo)}" alt="Company logo" class="mb-3 max-h-16 max-w-40 object-contain" />` : ""}
        <h1 class="mb-2 break-words text-2xl font-bold text-blue-800 sm:text-3xl">${escapeHtml(invoice.companyName || "Your Company Name")}</h1>
        <div class="space-y-0.5 text-slate-500">
          <p>123 Business Street</p><p>City, State 12345</p><p>Phone: (555) 123-4567</p><p>Email: info@company.com</p>
        </div>
      </section>
      <section class="sm:text-right">
        <div class="text-3xl font-extrabold tracking-wide text-red-600 sm:text-4xl">INVOICE</div>
        <p class="mt-2 break-all text-base font-bold text-slate-700">${escapeHtml(invoice.invoiceNumber)}</p>
        <span class="mt-2 inline-flex rounded-full bg-green-100 px-3 py-1 text-[10px] font-bold uppercase tracking-wide text-green-800">Pending</span>
      </section>
    </header>

    <section class="mb-7 grid grid-cols-1 gap-3 rounded-lg bg-slate-100 p-4 sm:grid-cols-3">
      <div><p class="mb-1 text-[10px] font-bold uppercase tracking-wider text-slate-500">Issue Date</p><p class="text-sm font-bold text-slate-900">${escapeHtml(invoice.issuedDate)}</p></div>
      <div><p class="mb-1 text-[10px] font-bold uppercase tracking-wider text-slate-500">Due Date</p><p class="text-sm font-bold text-slate-900">${escapeHtml(invoice.dueDate)}</p></div>
      <div><p class="mb-1 text-[10px] font-bold uppercase tracking-wider text-slate-500">Payment Terms</p><p class="text-sm font-bold text-slate-900">Net 30</p></div>
    </section>

    <section class="mb-7 grid grid-cols-1 gap-4 sm:grid-cols-2">
      <div class="rounded-lg border border-slate-200 bg-slate-50 p-4">
        <h2 class="mb-3 text-sm font-bold uppercase tracking-wide text-blue-800">Bill To</h2>
        <p class="mb-1 text-sm font-bold text-slate-900">${escapeHtml(invoice.customerName)}</p>
        <p>Mobile: ${escapeHtml(invoice.customerMobile)}</p><p class="break-words">${escapeHtml(invoice.customerAddress)}</p>
      </div>
      <div class="rounded-lg border border-slate-200 bg-slate-50 p-4">
        <h2 class="mb-3 text-sm font-bold uppercase tracking-wide text-blue-800">Ship To</h2>
        <p class="mb-1 text-sm font-bold text-slate-900">${escapeHtml(invoice.customerName)}</p><p class="break-words">${escapeHtml(invoice.customerAddress)}</p>
      </div>
    </section>

    <section class="mb-7">
      <h2 class="rounded-t-lg bg-blue-100 px-4 py-3 text-center text-sm font-bold uppercase tracking-wide text-blue-800">Items &amp; Services</h2>
      <div class="overflow-x-auto">
        <table class="w-full min-w-[620px] border-collapse border border-slate-200 text-[11px]">
          <thead class="bg-blue-800 text-white"><tr>
            <th class="w-[35%] p-3 text-left font-bold">Product/Service</th><th class="p-3 text-center font-bold">Qty</th><th class="p-3 text-center font-bold">Unit</th><th class="p-3 text-right font-bold">Price</th><th class="p-3 text-right font-bold">Offer Price</th><th class="p-3 text-center font-bold">HSN Code</th>
          </tr></thead>
          <tbody>${itemRows}</tbody>
        </table>
      </div>
    </section>

    <section class="avoid-break ml-auto max-w-md rounded-lg border-2 border-sky-500 bg-sky-50 p-5">
      <div class="mb-2 flex items-center justify-between gap-4"><span class="font-semibold">Subtotal:</span><span class="font-bold">${money(subtotal)}</span></div>
      <div class="mb-2 flex items-center justify-between gap-4"><span class="font-semibold">Tax (0%):</span><span class="font-bold">0.00</span></div>
      <div class="mb-2 flex items-center justify-between gap-4"><span class="font-semibold">Discount:</span><span class="font-bold">0.00</span></div>
      <div class="mt-4 flex items-center justify-between gap-4 border-t-2 border-sky-500 pt-4 text-base font-extrabold text-sky-950"><span>Total Amount:</span><span>${money(invoice.amount ?? subtotal)}</span></div>
    </section>

    <footer class="mt-9 grid grid-cols-1 gap-5 border-t border-slate-300 pt-5 sm:grid-cols-2">
      <section><h2 class="mb-2 font-bold text-slate-700">Payment Information</h2><div class="text-[10px] leading-relaxed text-slate-500"><p>Please make payment within 30 days.</p><p>Bank: Your Bank Name</p><p>Account: 1234-5678-9012</p><p>Routing: 987654321</p></div></section>
      <section><h2 class="mb-2 font-bold text-slate-700">Terms &amp; Conditions</h2><div class="text-[10px] leading-relaxed text-slate-500"><p>Payment is due within 30 days.</p><p>Late payments may incur additional charges.</p><p>Thank you for your business!</p></div></section>
    </footer>
  </main>
</body>
</html>`;
  };

  const handleInputChange = (e, index = null, field = null) => {
    if (index !== null && field !== null) {
      // Handle item field changes
      const newItems = [...formData.items];
      newItems[index][field] = e.target.value;
      setFormData({ ...formData, items: newItems });
    } else {
      // Handle customer field changes
      setFormData({ ...formData, [e.target.name]: e.target.value });
    }
  };

  const handleLogoUpload = (e) => {
    const file = e.target.files[0];
    if (file) {
      // Check file type
      if (!file.type.startsWith('image/')) {
        alert('Please select an image file.');
        return;
      }

      // Check file size (limit to 5MB)
      if (file.size > 5 * 1024 * 1024) {
        alert('File size should be less than 5MB.');
        return;
      }

      // Create a FileReader to convert image to base64
      const reader = new FileReader();
      reader.onload = (event) => {
        setFormData({ ...formData, companyLogo: event.target.result });
      };
      reader.readAsDataURL(file);
    }
  };

  const removeLogo = () => {
    setFormData({ ...formData, companyLogo: "" });
  };

  const addItem = () => {
    setFormData({
      ...formData,
      items: [
        ...formData.items,
        {
          productName: "",
          quantity: "",
          unit: "kg",
          description: "",
          price: "",
          offerPrice: "",
          hsn: ""
        }
      ]
    });
  };

  const removeItem = (index) => {
    if (formData.items.length > 1) {
      const newItems = [...formData.items];
      newItems.splice(index, 1);
      setFormData({ ...formData, items: newItems });
    }
  };

  const handleSubmit = () => {
    // Validate required fields
    if (!formData.companyName || !formData.customerName || !formData.customerMobile || !formData.customerAddress) {
      alert('Please fill in all company and customer information fields.');
      return;
    }

    // Validate items
    const validItems = formData.items.filter(item =>
      item.productName && item.quantity && item.price && item.offerPrice
    );

    if (validItems.length === 0) {
      alert('Please add at least one valid item with all required fields.');
      return;
    }

    // Calculate total amount
    const totalAmount = validItems.reduce((total, item) => {
      return total + (parseFloat(item.offerPrice) || 0) * (parseInt(item.quantity) || 0);
    }, 0);

    // Generate invoice number
    const invoiceNumber = `INV-${Math.random().toString(36).substring(2, 10).toUpperCase()}`;

    // Create new invoice
    const newInvoice = {
      id: invoices.length + 1,
      invoiceNumber,
      companyName: formData.companyName,
      companyLogo: formData.companyLogo,
      customerName: formData.customerName,
      customerMobile: formData.customerMobile,
      customerAddress: formData.customerAddress,
      issuedDate: new Date().toLocaleDateString('en-US', { year: 'numeric', month: 'short', day: 'numeric' }),
      dueDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toLocaleDateString('en-US', { year: 'numeric', month: 'short', day: 'numeric' }),
      amount: totalAmount,
      items: validItems
    };

    // Add to invoices list
    setInvoices([...invoices, newInvoice]);

    // Reset form and close modal
    setFormData({
      companyName: "",
      companyLogo: "",
      customerName: "",
      customerMobile: "",
      customerAddress: "",
      items: [{
        productName: "",
        quantity: "",
        unit: "kg",
        description: "",
        price: "",
        offerPrice: "",
        hsn: ""
      }]
    });
    setIsModalOpen(false);
  };

  const inputClass = "w-full rounded-xl border border-slate-200 bg-white px-3.5 py-3 text-sm text-slate-800 outline-none transition placeholder:text-slate-400 focus:border-indigo-500 focus:ring-4 focus:ring-indigo-500/10";
  const labelClass = "mb-1.5 block text-xs font-semibold uppercase tracking-wide text-slate-500";
  const totalValue = invoices.reduce((sum, invoice) => sum + (Number(invoice.amount) || 0), 0);

  return (
    <div className="min-h-screen bg-slate-50 text-slate-900">
      <div className="mx-auto max-w-7xl px-4 py-5 sm:px-6 lg:px-8 lg:py-8">
        <header className="mb-8 flex flex-wrap items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <button onClick={() => window.history.back()} aria-label="Go back" className="flex h-11 w-11 items-center justify-center rounded-2xl border border-slate-200 bg-white text-slate-600 shadow-sm transition hover:-translate-x-0.5 hover:border-indigo-200 hover:text-indigo-600">
              <FaArrowLeft />
            </button>
            <div>
              <p className="text-xs font-bold uppercase tracking-[0.22em] text-indigo-600">Workspace / Billing</p>
              <h1 className="mt-1 text-2xl font-black tracking-tight sm:text-3xl">Invoices</h1>
            </div>
          </div>
          <button onClick={() => setIsModalOpen(true)} className="inline-flex items-center justify-center gap-2 rounded-xl bg-indigo-600 px-5 py-3 text-sm font-bold text-white shadow-lg shadow-indigo-600/20 transition hover:-translate-y-0.5 hover:bg-indigo-700 focus:outline-none focus:ring-4 focus:ring-indigo-500/20">
            <span className="text-xl leading-none">+</span> Create invoice
          </button>
        </header>

        <section className="relative mb-7 overflow-hidden rounded-3xl bg-gradient-to-br from-slate-950 via-indigo-950 to-indigo-700 p-6 text-white shadow-xl shadow-indigo-950/10 sm:p-8">
          <div className="pointer-events-none absolute -right-12 -top-24 h-64 w-64 rounded-full border-[35px] border-white/5" />
          <div className="pointer-events-none absolute -bottom-28 right-36 h-56 w-56 rounded-full bg-indigo-400/20 blur-3xl" />
          <div className="relative grid gap-7 md:grid-cols-[1.4fr_1fr] md:items-end">
            <div>
              <span className="inline-flex items-center gap-2 rounded-full border border-white/15 bg-white/10 px-3 py-1.5 text-xs font-semibold text-indigo-100"><span className="h-2 w-2 rounded-full bg-emerald-400" /> Invoice overview</span>
              <h2 className="mt-4 max-w-xl text-3xl font-black leading-tight sm:text-4xl">Keep your billing <span className="text-indigo-300">beautifully organized.</span></h2>
              <p className="mt-3 max-w-lg text-sm leading-6 text-indigo-100/80">Create professional invoices, manage customer details, and print a clean copy whenever you need it.</p>
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div className="rounded-2xl border border-white/10 bg-white/10 p-4 backdrop-blur-sm">
                <p className="text-xs font-medium text-indigo-100/80">Invoices created</p>
                <p className="mt-2 text-3xl font-black">{invoices.length}</p>
                <p className="mt-1 text-xs text-indigo-100/70">In this session</p>
              </div>
              <div className="rounded-2xl border border-white/10 bg-white/10 p-4 backdrop-blur-sm">
                <p className="text-xs font-medium text-indigo-100/80">Total value</p>
                <p className="mt-2 break-words text-2xl font-black sm:text-3xl">₹{totalValue.toLocaleString("en-IN", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</p>
                <p className="mt-1 text-xs text-indigo-100/70">Across created invoices</p>
              </div>
            </div>
          </div>
        </section>

        <section className="overflow-hidden rounded-3xl border border-slate-200/80 bg-white shadow-sm">
          <div className="flex flex-col gap-3 border-b border-slate-100 px-5 py-5 sm:flex-row sm:items-center sm:justify-between sm:px-7">
            <div>
              <h2 className="text-lg font-extrabold tracking-tight">Recent invoices</h2>
              <p className="mt-1 text-sm text-slate-500">Your recently created billing documents.</p>
            </div>
            <span className="w-fit rounded-full bg-indigo-50 px-3 py-1.5 text-xs font-bold text-indigo-700">{invoices.length} {invoices.length === 1 ? "invoice" : "invoices"}</span>
          </div>

          {invoices.length > 0 ? (
            <div className="divide-y divide-slate-100">
              {invoices.map((invoice) => (
                <article key={invoice.id} className="px-5 py-5 transition hover:bg-slate-50/80 sm:px-7">
                  <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
                    <div className="flex min-w-0 items-start gap-4">
                      <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-indigo-50 text-indigo-600">
                        <svg viewBox="0 0 24 24" fill="none" className="h-6 w-6" stroke="currentColor" strokeWidth="1.8"><path d="M7 3.75h7l4 4v12.5H7a2 2 0 0 1-2-2v-12.5a2 2 0 0 1 2-2Z"/><path d="M14 3.75v4h4M8.5 12h7M8.5 15.5h7" strokeLinecap="round"/></svg>
                      </div>
                      <div className="min-w-0 flex-1">
                        <div className="flex flex-wrap items-center gap-2">
                          <h3 className="break-all font-extrabold text-slate-900">{invoice.invoiceNumber}</h3>
                          <span className="rounded-full bg-amber-50 px-2.5 py-1 text-[10px] font-extrabold uppercase tracking-wide text-amber-700">Pending</span>
                        </div>
                        <p className="mt-1 truncate text-sm text-slate-500">{invoice.customerName}</p>
                        <div className="mt-3 grid grid-cols-2 gap-x-6 gap-y-3 sm:grid-cols-3 lg:grid-cols-4">
                          <div><p className="text-[10px] font-bold uppercase tracking-wider text-slate-400">Issued</p><p className="mt-1 text-xs font-semibold text-slate-700">{invoice.issuedDate}</p></div>
                          <div><p className="text-[10px] font-bold uppercase tracking-wider text-slate-400">Due date</p><p className="mt-1 text-xs font-semibold text-slate-700">{invoice.dueDate}</p></div>
                          <div><p className="text-[10px] font-bold uppercase tracking-wider text-slate-400">Items</p><p className="mt-1 text-xs font-semibold text-slate-700">{invoice.items?.length || 0} {(invoice.items?.length || 0) === 1 ? "item" : "items"}</p></div>
                          <div><p className="text-[10px] font-bold uppercase tracking-wider text-slate-400">Amount</p><p className="mt-1 text-sm font-black text-emerald-600">₹{Number(invoice.amount || 0).toLocaleString("en-IN", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</p></div>
                        </div>
                      </div>
                    </div>
                    <button onClick={() => handleDownload(invoice)} className="inline-flex shrink-0 items-center justify-center gap-2 rounded-xl border border-slate-200 bg-white px-4 py-2.5 text-sm font-bold text-slate-700 shadow-sm transition hover:border-indigo-200 hover:bg-indigo-50 hover:text-indigo-700">
                      <svg viewBox="0 0 24 24" fill="none" className="h-4 w-4" stroke="currentColor" strokeWidth="2"><path d="M12 3v11m0 0 4-4m-4 4-4-4M5 17v3h14v-3" strokeLinecap="round" strokeLinejoin="round"/></svg>
                      Print / Save PDF
                    </button>
                  </div>
                </article>
              ))}
            </div>
          ) : (
            <div className="px-5 py-16 text-center sm:px-8">
              <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-3xl bg-indigo-50 text-indigo-600">
                <svg viewBox="0 0 24 24" fill="none" className="h-8 w-8" stroke="currentColor" strokeWidth="1.6"><path d="M7 3.75h7l4 4v12.5H7a2 2 0 0 1-2-2v-12.5a2 2 0 0 1 2-2Z"/><path d="M14 3.75v4h4M8.5 12h7M8.5 15.5h4" strokeLinecap="round"/></svg>
              </div>
              <h3 className="mt-5 text-lg font-extrabold text-slate-900">Your invoice list is ready for its first entry</h3>
              <p className="mx-auto mt-2 max-w-md text-sm leading-6 text-slate-500">Create your first invoice to see it here. Add your company details, customer information, and the items you’re billing for.</p>
              <button onClick={() => setIsModalOpen(true)} className="mt-6 inline-flex items-center gap-2 rounded-xl bg-indigo-600 px-5 py-3 text-sm font-bold text-white shadow-lg shadow-indigo-600/20 transition hover:bg-indigo-700"><span className="text-xl leading-none">+</span> Create your first invoice</button>
            </div>
          )}
        </section>
      </div>

      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-end justify-center bg-slate-950/60 p-0 backdrop-blur-sm sm:items-center sm:p-4" onMouseDown={(e) => { if (e.target === e.currentTarget) setIsModalOpen(false); }}>
          <div className="flex max-h-[96vh] w-full max-w-5xl flex-col overflow-hidden rounded-t-3xl bg-white shadow-2xl sm:max-h-[92vh] sm:rounded-3xl">
            <div className="flex items-center justify-between gap-4 bg-gradient-to-r from-slate-950 to-indigo-900 px-5 py-5 text-white sm:px-8">
              <div><p className="text-[10px] font-bold uppercase tracking-[0.22em] text-indigo-300">Billing workspace</p><h2 className="mt-1 text-xl font-black sm:text-2xl">Create new invoice</h2><p className="mt-1 text-xs text-slate-300">Complete the details below to prepare your invoice.</p></div>
              <button type="button" onClick={() => setIsModalOpen(false)} aria-label="Close modal" className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl border border-white/15 bg-white/10 text-xl text-white transition hover:bg-white/20">×</button>
            </div>

            <div className="overflow-y-auto px-4 py-5 sm:px-8 sm:py-7">
              <div className="grid grid-cols-1 gap-6 lg:grid-cols-[0.9fr_1.1fr]">
                <div className="space-y-6">
                  <section className="rounded-2xl border border-slate-200 p-4 sm:p-5">
                    <div className="mb-4 flex items-center gap-3"><span className="flex h-9 w-9 items-center justify-center rounded-xl bg-indigo-50 text-sm font-black text-indigo-700">01</span><div><h3 className="font-extrabold">Company details</h3><p className="text-xs text-slate-500">Who is issuing this invoice?</p></div></div>
                    <label className={labelClass}>Company name *</label>
                    <input type="text" name="companyName" value={formData.companyName} onChange={handleInputChange} className={inputClass} placeholder="Enter company name" required />
                    <div className="mt-4"><label className={labelClass}>Company logo <span className="normal-case tracking-normal text-slate-400">(optional)</span></label>
                      {!formData.companyLogo ? (
                        <label className="flex cursor-pointer flex-col items-center rounded-xl border-2 border-dashed border-slate-200 bg-slate-50 px-4 py-6 text-center transition hover:border-indigo-300 hover:bg-indigo-50/50">
                          <svg viewBox="0 0 24 24" fill="none" className="h-8 w-8 text-slate-400" stroke="currentColor" strokeWidth="1.6"><rect x="3" y="3" width="18" height="18" rx="3"/><circle cx="8.5" cy="8.5" r="1.5"/><path d="m21 15-5-5L5 21" strokeLinecap="round" strokeLinejoin="round"/></svg>
                          <span className="mt-2 text-sm font-bold text-indigo-700">Upload company logo</span><span className="mt-1 text-xs text-slate-500">PNG, JPG or GIF · up to 5 MB</span>
                          <input type="file" className="sr-only" accept="image/*" onChange={handleLogoUpload} />
                        </label>
                      ) : (
                        <div className="flex items-center justify-between gap-3 rounded-xl border border-slate-200 bg-slate-50 p-3"><div className="flex min-w-0 items-center gap-3"><img src={formData.companyLogo} alt="Company logo" className="h-12 w-12 rounded-lg border border-slate-200 bg-white object-contain p-1"/><div className="min-w-0"><p className="text-sm font-bold">Logo uploaded</p><p className="text-xs text-slate-500">Ready to use</p></div></div><div className="flex shrink-0 flex-col gap-2 text-xs font-bold"><label className="cursor-pointer text-indigo-700 hover:text-indigo-900">Change<input type="file" className="sr-only" accept="image/*" onChange={handleLogoUpload}/></label><button type="button" onClick={removeLogo} className="text-rose-600 hover:text-rose-700">Remove</button></div></div>
                      )}
                    </div>
                  </section>

                  <section className="rounded-2xl border border-slate-200 p-4 sm:p-5">
                    <div className="mb-4 flex items-center gap-3"><span className="flex h-9 w-9 items-center justify-center rounded-xl bg-violet-50 text-sm font-black text-violet-700">02</span><div><h3 className="font-extrabold">Customer details</h3><p className="text-xs text-slate-500">Who will receive the invoice?</p></div></div>
                    <div className="space-y-4">
                      <div><label className={labelClass}>Customer name *</label><input type="text" name="customerName" value={formData.customerName} onChange={handleInputChange} className={inputClass} placeholder="Full name or business" required /></div>
                      <div><label className={labelClass}>Mobile number *</label><input type="tel" name="customerMobile" value={formData.customerMobile} onChange={handleInputChange} className={inputClass} placeholder="Customer phone number" required /></div>
                      <div><label className={labelClass}>Address *</label><textarea name="customerAddress" value={formData.customerAddress} onChange={handleInputChange} rows="3" className={`${inputClass} resize-y`} placeholder="Billing address" required /></div>
                    </div>
                  </section>
                </div>

                <section className="rounded-2xl border border-slate-200 p-4 sm:p-5">
                  <div className="mb-4 flex flex-wrap items-center justify-between gap-3"><div className="flex items-center gap-3"><span className="flex h-9 w-9 items-center justify-center rounded-xl bg-emerald-50 text-sm font-black text-emerald-700">03</span><div><h3 className="font-extrabold">Invoice items</h3><p className="text-xs text-slate-500">Products and services being billed.</p></div></div><span className="rounded-full bg-slate-100 px-3 py-1 text-xs font-bold text-slate-600">{formData.items.length} {formData.items.length === 1 ? "item" : "items"}</span></div>
                  <div className="space-y-4">
                    {formData.items.map((item, index) => (
                      <div key={index} className="rounded-2xl border border-slate-200 bg-slate-50/70 p-3.5 sm:p-4">
                        <div className="mb-3 flex items-center justify-between"><p className="text-xs font-extrabold uppercase tracking-wider text-slate-500">Item {String(index + 1).padStart(2, "0")}</p>{formData.items.length > 1 && <button type="button" onClick={() => removeItem(index)} className="rounded-lg px-2 py-1 text-xs font-bold text-rose-600 transition hover:bg-rose-50">Remove</button>}</div>
                        <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
                          <div className="sm:col-span-2"><label className={labelClass}>Product / service *</label><input type="text" value={item.productName} onChange={(e) => handleInputChange(e, index, "productName")} className={inputClass} placeholder="Item name" required /></div>
                          <div><label className={labelClass}>Quantity *</label><input type="number" min="1" value={item.quantity} onChange={(e) => handleInputChange(e, index, "quantity")} className={inputClass} placeholder="1" required /></div>
                          <div><label className={labelClass}>Unit</label><select value={item.unit} onChange={(e) => handleInputChange(e, index, "unit")} className={inputClass}><option value="kg">Kg</option><option value="pcs">Pieces</option><option value="box">Box</option><option value="unit">Unit</option></select></div>
                          <div><label className={labelClass}>Price *</label><input type="number" min="0" step="0.01" value={item.price} onChange={(e) => handleInputChange(e, index, "price")} className={inputClass} placeholder="0.00" required /></div>
                          <div><label className={labelClass}>Offer price *</label><input type="number" min="0" step="0.01" value={item.offerPrice} onChange={(e) => handleInputChange(e, index, "offerPrice")} className={inputClass} placeholder="0.00" required /></div>
                          <div><label className={labelClass}>HSN code</label><input type="text" value={item.hsn} onChange={(e) => handleInputChange(e, index, "hsn")} className={inputClass} placeholder="Optional" /></div>
                          <div><label className={labelClass}>Description</label><input type="text" value={item.description} onChange={(e) => handleInputChange(e, index, "description")} className={inputClass} placeholder="Optional details" /></div>
                        </div>
                        <div className="mt-3 flex items-center justify-between border-t border-slate-200 pt-3 text-xs"><span className="font-semibold text-slate-500">Line total</span><span className="font-black text-slate-900">₹{((Number(item.offerPrice) || 0) * (Number(item.quantity) || 0)).toLocaleString("en-IN", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</span></div>
                      </div>
                    ))}
                  </div>
                  <button type="button" onClick={addItem} className="mt-4 flex w-full items-center justify-center gap-2 rounded-xl border border-dashed border-indigo-300 bg-indigo-50/50 px-4 py-3 text-sm font-bold text-indigo-700 transition hover:border-indigo-500 hover:bg-indigo-50"><span className="text-xl leading-none">+</span> Add another item</button>
                  <div className="mt-5 rounded-2xl bg-slate-950 p-4 text-white"><div className="flex items-center justify-between text-sm text-slate-300"><span>Estimated total</span><span>{formData.items.length} line {formData.items.length === 1 ? "item" : "items"}</span></div><p className="mt-2 text-3xl font-black">₹{formData.items.reduce((sum, item) => sum + ((Number(item.offerPrice) || 0) * (Number(item.quantity) || 0)), 0).toLocaleString("en-IN", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</p><p className="mt-1 text-xs text-slate-400">Calculated using offer price × quantity.</p></div>
                </section>
              </div>
            </div>

            <div className="flex flex-col-reverse gap-3 border-t border-slate-100 bg-white px-4 py-4 sm:flex-row sm:justify-end sm:px-8">
              <button type="button" onClick={() => setIsModalOpen(false)} className="rounded-xl border border-slate-200 px-5 py-3 text-sm font-bold text-slate-600 transition hover:bg-slate-50">Cancel</button>
              <button type="button" onClick={handleSubmit} className="rounded-xl bg-indigo-600 px-6 py-3 text-sm font-bold text-white shadow-lg shadow-indigo-600/20 transition hover:bg-indigo-700 focus:outline-none focus:ring-4 focus:ring-indigo-500/20">Create invoice</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Invoice;
