// src/components/CustomerPage.jsx
import React, { useState, useEffect } from 'react';
import axios from 'axios';
import {
  FaUserFriends,
  FaEdit,
  FaTrash,
  FaArrowLeft,
  FaPlus,
  FaEnvelope,
  FaPhone,
} from 'react-icons/fa';
import Navbar from './Navbar';

const CustomerPage = () => {
  const userId = localStorage.getItem('userId'); // store userId in localStorage before

  // ✅ Check plan validity from localStorage
  const hasValidPlan = () => {
    const plans = JSON.parse(localStorage.getItem('subscribedPlans') || '[]');
    if (plans.length === 0) return false;

    const currentDate = new Date();
    return plans.some((plan) => new Date(plan.endDate) > currentDate);
  };

  const [customers, setCustomers] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const [showPopup, setShowPopup] = useState(false);
  const [showModal, setShowModal] = useState(false);

  const [form, setForm] = useState({
    name: '',
    mobile: '',
    email: '',
    gender: '',
    dob: '',
    marriageAnniversaryDate: '',
    address: '',
  });
  const [editId, setEditId] = useState(null);

  // fetch all customers
  const fetchCustomers = async () => {
    try {
      setLoading(true);
      const res = await axios.get(
        `https://api.editezy.com/api/users/allcustomers/${userId}`
      );
      setCustomers(res.data.customers || res.data || []);
    } catch (err) {
      setError('Failed to fetch customers');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCustomers();
  }, []);

  // handle Add button click
  const handleAddClick = () => {
    if (!hasValidPlan()) {
      // user के पास valid plan नहीं है → popup दिखाओ
      setShowPopup(true);
    } else {
      // valid plan है → modal दिखाओ
      setEditId(null);
      setForm({
        name: '',
        mobile: '',
        email: '',
        gender: '',
        dob: '',
        marriageAnniversaryDate: '',
        address: '',
      });
      setShowModal(true);
    }
  };

  // handle submit add/edit
  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      if (editId) {
        await axios.put(
          `https://api.editezy.com/api/users/update-customers/${userId}/${editId}`,
          { customer: form }
        );
      } else {
        await axios.post(
          `https://api.editezy.com/api/users/addcustomer/${userId}`,
          { customer: form }
        );
      }
      setShowModal(false);
      setForm({
        name: '',
        mobile: '',
        email: '',
        gender: '',
        dob: '',
        marriageAnniversaryDate: '',
        address: '',
      });
      setEditId(null);
      fetchCustomers();
    } catch (err) {
      alert('Error saving customer');
    }
  };

  // delete customer
  const deleteCustomer = async (id) => {
    if (!window.confirm('Are you sure?')) return;
    try {
      await axios.delete(
        `https://api.editezy.com/api/users/delete-customers/${userId}/${id}`
      );
      fetchCustomers();
    } catch (err) {
      alert('Error deleting customer');
    }
  };

  return (
    <>
      <Navbar />
      <div className="bg-gray-50 min-h-screen">
        {/* Header */}
        <div className="bg-gradient-to-r from-purple-500 to-indigo-500 p-4 flex justify-between items-center">
          <button
            onClick={() => window.history.back()}
            className="text-white text-lg font-bold mr-3 flex items-center gap-2"
          >
            <FaArrowLeft />
          </button>
          <h1 className="text-white text-lg font-bold">Add Your Customer</h1>
          <button
            onClick={handleAddClick}
            className="bg-white text-purple-600 px-3 py-1 rounded-lg font-bold text-lg flex items-center gap-2"
          >
            <FaPlus /> Add
          </button>
        </div>

        {/* Total Customers */}
        <div className="m-4 bg-white rounded-xl shadow p-4 flex items-center gap-3">
          <div className="bg-purple-100 text-purple-600 p-3 rounded-lg">
            <FaUserFriends size={24} />
          </div>
          <div>
            <p className="font-bold">{customers.length} Total Customers</p>
            <p className="text-gray-500 text-sm">
              Manage and organize your customer base
            </p>
          </div>
        </div>

        {/* Customer Cards */}
        <div className="space-y-3 px-4">
          {loading && <p>Loading...</p>}
          {error && <p className="text-red-400">{error}</p>}
          {customers.map((c) => (
            <div
              key={c._id}
              className="bg-white rounded-xl shadow p-4 flex justify-between items-center"
            >
              <div className="flex items-center space-x-3">
                <div className="bg-purple-500 text-white w-10 h-10 rounded-full flex items-center justify-center text-lg">
                  {c.name?.[0]?.toUpperCase() || '?'}
                </div>
                <div>
                  <p className="font-bold">{c.name}</p>
                  <p className="text-sm text-gray-500 flex items-center space-x-1">
                    <FaEnvelope className="text-gray-400" />
                    <span>{c.email || 'No Email'}</span>
                  </p>
                  <p className="text-sm text-gray-500 flex items-center space-x-1">
                    <FaPhone className="text-gray-400" />
                    <span>{c.mobile || 'No Mobile'}</span>
                  </p>
                </div>
              </div>
              <div className="flex space-x-2">
                <button
                  onClick={() => {
                    setEditId(c._id);
                    setForm({
                      name: c.name,
                      mobile: c.mobile,
                      email: c.email,
                      gender: c.gender,
                      dob: c.dob,
                      marriageAnniversaryDate: c.marriageAnniversaryDate,
                      address: c.address,
                    });
                    setShowModal(true);
                  }}
                  className="bg-green-100 text-green-600 p-2 rounded-lg"
                >
                  <FaEdit />
                </button>
                <button
                  onClick={() => deleteCustomer(c._id)}
                  className="bg-red-100 text-red-600 p-2 rounded-lg"
                >
                  <FaTrash />
                </button>
              </div>
            </div>
          ))}
        </div>

        {/* Modal */}
        {showModal && (
          <div className="fixed inset-0 bg-white/30 backdrop-blur-lg flex justify-center items-center z-50">
            <div className="bg-white rounded-2xl p-6 w-11/12 max-w-md shadow-lg">
              <h2 className="text-lg font-bold mb-4">
                {editId ? 'Edit Customer' : 'Add New Customer'}
              </h2>
              <form onSubmit={handleSubmit} className="space-y-3">
                <input
                  type="text"
                  placeholder="Name"
                  value={form.name}
                  onChange={(e) =>
                    setForm({ ...form, name: e.target.value })
                  }
                  className="w-full border rounded-lg p-2"
                  required
                />
                <input
                  type="text"
                  placeholder="Mobile Number"
                  value={form.mobile}
                  onChange={(e) =>
                    setForm({ ...form, mobile: e.target.value })
                  }
                  className="w-full border rounded-lg p-2"
                  required
                />
                <input
                  type="email"
                  placeholder="Email (Optional)"
                  value={form.email}
                  onChange={(e) =>
                    setForm({ ...form, email: e.target.value })
                  }
                  className="w-full border rounded-lg p-2"
                />
                <select
                  value={form.gender}
                  onChange={(e) =>
                    setForm({ ...form, gender: e.target.value })
                  }
                  className="w-full border rounded-lg p-2"
                >
                  <option value="">Select Gender</option>
                  <option value="male">Male</option>
                  <option value="female">Female</option>
                </select>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Date of Birth
                </label>
                <input
                  type="date"
                  value={form.dob}
                  onChange={(e) =>
                    setForm({ ...form, dob: e.target.value })
                  }
                  className="w-full border rounded-lg p-2 mb-4"
                />

                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Marriage Anniversary
                </label>
                <input
                  type="date"
                  value={form.marriageAnniversaryDate}
                  onChange={(e) =>
                    setForm({
                      ...form,
                      marriageAnniversaryDate: e.target.value,
                    })
                  }
                  className="w-full border rounded-lg p-2"
                />

                <input
                  type="text"
                  placeholder="Address (Optional)"
                  value={form.address}
                  onChange={(e) =>
                    setForm({ ...form, address: e.target.value })
                  }
                  className="w-full border rounded-lg p-2"
                />
                <div className="flex justify-end space-x-2 mt-4">
                  <button
                    type="button"
                    onClick={() => setShowModal(false)}
                    className="px-4 py-2 rounded-lg bg-gray-200"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="px-4 py-2 rounded-lg bg-blue-600 text-white"
                  >
                    Save
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}

        {/* Popup */}
        {showPopup && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-2xl p-6 max-w-sm w-full shadow-2xl text-center">
              <div className="flex items-center justify-center w-14 h-14 rounded-xl bg-yellow-100 mx-auto mb-4">
                <svg
                  className="w-8 h-8 text-yellow-500"
                  fill="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path d="M12 2a10 10 0 100 20 10 10 0 000-20zm-1 14.59V7h2v9.59l2.3-2.3 1.4 1.42-4 4-4-4 1.4-1.42 2.3 2.3z" />
                </svg>
              </div>
              <h2 className="text-lg font-bold text-gray-800 mb-2">
                Premium Customer Management
              </h2>
              <p className="text-sm text-gray-600 mb-6">
                Add and manage unlimited customers with contact details,
                purchase history, and advanced organization tools.
              </p>
              <div className="flex justify-center gap-3">
                <button
                  onClick={() => setShowPopup(false)}
                  className="px-4 py-2 rounded-lg text-indigo-600 bg-indigo-50 hover:bg-indigo-100 font-medium"
                >
                  Maybe Later
                </button>
                <button
                  onClick={() => {
                    setShowPopup(false);
                    window.location.href = '/home';
                  }}
                  className="px-4 py-2 rounded-lg bg-indigo-600 text-white hover:bg-indigo-700 font-medium"
                >
                  Upgrade Now
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </>
  );
};

export default CustomerPage;