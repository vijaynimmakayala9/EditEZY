import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";

const RegisterPage = () => {
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    mobile: "",
    dob: "",
    marriageAnniversaryDate: "",
    referralCode: ""
  });
  const [error, setError] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const navigate = useNavigate();

  // Handle input changes
  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prevState => ({
      ...prevState,
      [name]: value
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setIsLoading(true);

    const { name, mobile, dob } = formData;
    
    if (!name || !mobile || !dob) {
      setError("Name, Mobile, and Date of Birth are required.");
      setIsLoading(false);
      return;
    }

    // Mobile number validation
    const mobileRegex = /^[0-9]{10}$/;
    if (!mobileRegex.test(mobile)) {
      setError("Please enter a valid 10-digit mobile number.");
      setIsLoading(false);
      return;
    }

    // Date validation
    const currentDate = new Date();
    const dobDate = new Date(dob);
    if (dobDate >= currentDate) {
      setError("Date of Birth must be in the past.");
      setIsLoading(false);
      return;
    }

    try {
      const response = await axios.post(
        "https://api.editezy.com/api/users/register",
        formData,
        {
          headers: {
            'Content-Type': 'application/json',
          }
        }
      );

      if (response.status === 201) {
        // Reset form
        setFormData({
          name: "",
          email: "",
          mobile: "",
          dob: "",
          marriageAnniversaryDate: "",
          referralCode: ""
        });
        
        // Redirect to login or success page
        navigate("/", { 
          state: { message: "Registration successful! Please login." } 
        });
      }
    } catch (error) {
      setError(error.response?.data?.message || "Registration failed. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="container-fluid min-vh-100 d-flex align-items-center justify-content-center bg-light py-4">
      <div className="row w-100 justify-content-center">
        <div className="col-12 col-md-10 col-lg-8 col-xl-6">
          {/* Card Container */}
          <div className="card shadow-lg border-0 rounded-3 overflow-hidden">
            <div className="row g-0">
              {/* Left Side - Illustration (Hidden on mobile) */}
              <div className="col-md-6 d-none d-md-flex bg-primary">
                <div className="card-body d-flex flex-column justify-content-center align-items-center text-white p-4 p-lg-5">
                  <div className="text-center mb-4">
                    <i className="bi bi-person-plus-fill display-1 mb-3"></i>
                    <h2 className="h3 fw-bold">Join Our Community</h2>
                    <p className="mb-0">Create your account and start your journey with us</p>
                  </div>
                  
                  <div className="mt-4 text-center">
                    <div className="bg-white bg-opacity-10 rounded-3 p-3">
                      <i className="bi bi-shield-check display-4 d-block mb-2"></i>
                      <h5 className="fw-bold">Secure & Reliable</h5>
                      <small>Your data is protected with advanced security</small>
                    </div>
                  </div>
                </div>
              </div>

              {/* Right Side - Form */}
              <div className="col-md-6">
                <div className="card-body p-4 p-lg-5">
                  {/* Header */}
                  <div className="text-center mb-4">
                    <h1 className="h3 fw-bold text-primary">Create Account</h1>
                    <p className="text-muted">Please fill in the details below</p>
                  </div>

                  {/* Error Message */}
                  {error && (
                    <div className="alert alert-danger d-flex align-items-center" role="alert">
                      <i className="bi bi-exclamation-triangle-fill me-2"></i>
                      <div>{error}</div>
                    </div>
                  )}

                  {/* Registration Form */}
                  <form onSubmit={handleSubmit} noValidate>
                    {/* Full Name */}
                    <div className="mb-3">
                      <label htmlFor="name" className="form-label fw-semibold">
                        Full Name <span className="text-danger">*</span>
                      </label>
                      <div className="input-group">
                        <span className="input-group-text bg-light border-end-0">
                          <i className="bi bi-person text-muted"></i>
                        </span>
                        <input
                          type="text"
                          className="form-control border-start-0"
                          id="name"
                          name="name"
                          value={formData.name}
                          onChange={handleInputChange}
                          placeholder="Enter your full name"
                          required
                        />
                      </div>
                      <div className="form-text">Please enter your full legal name</div>
                    </div>

                    {/* Email Address */}
                    <div className="mb-3">
                      <label htmlFor="email" className="form-label fw-semibold">
                        Email Address <span className="text-muted">(Optional)</span>
                      </label>
                      <div className="input-group">
                        <span className="input-group-text bg-light border-end-0">
                          <i className="bi bi-envelope text-muted"></i>
                        </span>
                        <input
                          type="email"
                          className="form-control border-start-0"
                          id="email"
                          name="email"
                          value={formData.email}
                          onChange={handleInputChange}
                          placeholder="Enter your email address"
                        />
                      </div>
                    </div>

                    {/* Mobile Number */}
                    <div className="mb-3">
                      <label htmlFor="mobile" className="form-label fw-semibold">
                        Mobile Number <span className="text-danger">*</span>
                      </label>
                      <div className="input-group">
                        <span className="input-group-text bg-light border-end-0">
                          <i className="bi bi-phone text-muted"></i>
                        </span>
                        <input
                          type="tel"
                          className="form-control border-start-0"
                          id="mobile"
                          name="mobile"
                          value={formData.mobile}
                          onChange={handleInputChange}
                          placeholder="Enter 10-digit mobile number"
                          pattern="[0-9]{10}"
                          maxLength="10"
                          required
                        />
                      </div>
                      <div className="form-text">10 digits without country code</div>
                    </div>

                    {/* Date of Birth */}
                    <div className="mb-3">
                      <label htmlFor="dob" className="form-label fw-semibold">
                        Date of Birth <span className="text-danger">*</span>
                      </label>
                      <div className="input-group">
                        <span className="input-group-text bg-light border-end-0">
                          <i className="bi bi-calendar-event text-muted"></i>
                        </span>
                        <input
                          type="date"
                          className="form-control border-start-0"
                          id="dob"
                          name="dob"
                          value={formData.dob}
                          onChange={handleInputChange}
                          required
                        />
                      </div>
                    </div>

                    {/* Marriage Anniversary */}
                    <div className="mb-3">
                      <label htmlFor="marriageAnniversaryDate" className="form-label fw-semibold">
                        Marriage Anniversary <span className="text-muted">(Optional)</span>
                      </label>
                      <div className="input-group">
                        <span className="input-group-text bg-light border-end-0">
                          <i className="bi bi-heart text-muted"></i>
                        </span>
                        <input
                          type="date"
                          className="form-control border-start-0"
                          id="marriageAnniversaryDate"
                          name="marriageAnniversaryDate"
                          value={formData.marriageAnniversaryDate}
                          onChange={handleInputChange}
                        />
                      </div>
                    </div>

                    {/* Referral Code */}
                    <div className="mb-4">
                      <label htmlFor="referralCode" className="form-label fw-semibold">
                        Referral Code <span className="text-muted">(Optional)</span>
                      </label>
                      <div className="input-group">
                        <span className="input-group-text bg-light border-end-0">
                          <i className="bi bi-gift text-muted"></i>
                        </span>
                        <input
                          type="text"
                          className="form-control border-start-0"
                          id="referralCode"
                          name="referralCode"
                          value={formData.referralCode}
                          onChange={handleInputChange}
                          placeholder="Enter referral code (if any)"
                        />
                      </div>
                    </div>

                    {/* Submit Button */}
                    <div className="d-grid gap-2">
                      <button
                        type="submit"
                        className="btn btn-primary btn-lg fw-semibold"
                        disabled={isLoading}
                      >
                        {isLoading ? (
                          <>
                            <span className="spinner-border spinner-border-sm me-2" role="status" aria-hidden="true"></span>
                            Creating Account...
                          </>
                        ) : (
                          <>
                            <i className="bi bi-person-plus me-2"></i>
                            Create Account
                          </>
                        )}
                      </button>
                    </div>
                  </form>

                  {/* Login Link */}
                  <div className="text-center mt-4">
                    <p className="text-muted mb-0">
                      Already have an account?{" "}
                      <a href="/" className="text-primary text-decoration-none fw-semibold">
                        Sign In
                      </a>
                    </p>
                  </div>

                  
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default RegisterPage;