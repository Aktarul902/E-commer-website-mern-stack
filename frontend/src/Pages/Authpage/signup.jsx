
import { useState } from "react";
import { Link, useNavigate } from "react-router";
import { useMutation, useQueryClient } from "@tanstack/react-query";

import GoogleLoginButton from "../../components/googleloginbutton.jsx";
import { googleLogin, signupUser } from "../../lib/api.js";

const Signup = () => {
  const navigate = useNavigate();
  const queryClient = useQueryClient();

  const [formData, setFormData] = useState({
    firstName: "",
    lastName: "",
    email: "",
    phone : "",
    password: "",
    confirmPassword: "",
  });

  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [error, setError] = useState("");

  const signupMutation = useMutation({
    mutationFn: signupUser,

    onSuccess: (data) => {
      // JWT is already stored by the backend
      // as an HTTP-only cookie.
      const userId = data.user._id || data.user.id;
      queryClient.setQueryData(["authuser"], {
        ...data,
        user: { ...data.user, _id: userId },
      });
      navigate(`/myaccount/${userId}`);
    },

    onError: (error) => {
      setError(error.message || "Signup failed");
    },
  });

  const handleChange = (event) => {
    const { name, value } = event.target;

    setFormData((previous) => ({
      ...previous,
      [name]: value,
    }));

    setError("");
  };

  const handleSubmit = (event) => {
    event.preventDefault();
    setError("");

    if (
      !formData.firstName.trim() ||
      !formData.lastName.trim() ||
      !formData.phone.trim()  ||
      !formData.email.trim() ||
      !formData.password ||
      !formData.confirmPassword
    ) {
      setError("Please fill in all fields.");
      return;
    }

    if (formData.password.length < 6) {
      setError("Password must contain at least 6 characters.");
      return;
    }

    if (formData.password !== formData.confirmPassword) {
      setError("Passwords do not match.");
      return;
    }

    signupMutation.mutate(formData);
  };

  const isLoading = signupMutation.isPending;

  const handleGoogleSuccess = async (credential) => {
    try {
      setError("");

      const data = await googleLogin({ credential });
      const userId = data.user?._id || data.user?.id;

      queryClient.setQueryData(["authuser"], {
        ...data,
        user: { ...data.user, _id: userId },
      });

      navigate(`/myaccount/${userId}`);
    } catch (err) {
      setError(err.message || "Google login failed");
    }
  };

  return (
    <div className="min-h-screen relative overflow-hidden bg-gradient-to-br from-orange-400 via-pink-500 to-purple-700 flex items-center justify-center p-4">

      {/* Background Glow */}
      <div className="absolute -top-40 -left-40 w-[450px] h-[450px] bg-yellow-300/30 rounded-full blur-3xl" />

      <div className="absolute top-1/4 -right-40 w-[450px] h-[450px] bg-pink-300/40 rounded-full blur-3xl" />

      <div className="absolute -bottom-40 left-1/3 w-[450px] h-[450px] bg-purple-300/40 rounded-full blur-3xl" />

      {/* Decorative dots */}
      <div className="absolute top-20 left-20 w-4 h-4 bg-white/30 rounded-full" />
      <div className="absolute bottom-20 right-20 w-6 h-6 bg-white/20 rounded-full" />

      {/* Main Card */}
      <div className="relative w-full max-w-6xl bg-white rounded-[32px] shadow-2xl overflow-hidden grid lg:grid-cols-2">

        {/* Left Side */}
        <div className="hidden lg:flex bg-gradient-to-br from-orange-500 via-pink-500 to-purple-700 text-white p-12 flex-col justify-between">

          <div>
            <div className="text-3xl font-black tracking-tight">
              Printzenz
            </div>

            <p className="mt-2 text-white/80">
              Create. Explore. Express.
            </p>
          </div>

          <div>
            <h2 className="text-5xl font-black leading-tight">
              Create your
              <br />
              account.
            </h2>

            <p className="mt-6 text-white/80 text-lg max-w-md">
              Join Printzenz and discover products made for your
              style, creativity and everyday life.
            </p>

            <div className="mt-10 grid grid-cols-3 gap-4">

              <div className="bg-white/10 backdrop-blur-md rounded-2xl p-5">
                <div className="text-2xl">🎨</div>
                <p className="mt-2 font-semibold">
                  Creative
                </p>
              </div>

              <div className="bg-white/10 backdrop-blur-md rounded-2xl p-5">
                <div className="text-2xl">🛍️</div>
                <p className="mt-2 font-semibold">
                  Shop
                </p>
              </div>

              <div className="bg-white/10 backdrop-blur-md rounded-2xl p-5">
                <div className="text-2xl">✨</div>
                <p className="mt-2 font-semibold">
                  Enjoy
                </p>
              </div>

            </div>
          </div>

          <p className="text-sm text-white/60">
            © {new Date().getFullYear()} Printzenz
          </p>
        </div>

        {/* Right Side */}
        <div className="p-7 sm:p-10 lg:p-12">

          {/* Mobile Logo */}
          <div className="lg:hidden mb-8">
            <div className="text-3xl font-black text-transparent bg-clip-text bg-gradient-to-r from-orange-500 via-pink-500 to-purple-600">
              Printzenz
            </div>
          </div>

          <div className="max-w-md mx-auto">

            {/* Heading */}
            <div className="mb-8">
              <h1 className="text-3xl sm:text-4xl font-black text-gray-900">
                Create your account
              </h1>

              <p className="mt-2 text-gray-500">
                Start your Printzenz journey today.
              </p>
            </div>

            {/* Error */}
            {error && (
              <div className="mb-5 rounded-xl bg-red-50 border border-red-200 text-red-600 px-4 py-3 text-sm">
                {error}
              </div>
            )}

            <form
              onSubmit={handleSubmit}
              className="space-y-5"
            >

              {/* First + Last Name */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">

                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">
                    First name
                  </label>

                  <input
                    type="text"
                    name="firstName"
                    value={formData.firstName}
                    onChange={handleChange}
                    placeholder="First name"
                    disabled={isLoading}
                    autoComplete="given-name"
                    className="w-full px-4 py-3.5 rounded-xl border border-gray-200 focus:border-pink-500 focus:ring-4 focus:ring-pink-500/10 outline-none transition disabled:bg-gray-100"
                  />
                </div>

                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">
                    Last name
                  </label>

                  <input
                    type="text"
                    name="lastName"
                    value={formData.lastName}
                    onChange={handleChange}
                    placeholder="Last name"
                    disabled={isLoading}
                    autoComplete="family-name"
                    className="w-full px-4 py-3.5 rounded-xl border border-gray-200 focus:border-pink-500 focus:ring-4 focus:ring-pink-500/10 outline-none transition disabled:bg-gray-100"
                  />
                </div>

              </div>

              {/* Email */}
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  Email address
                </label>

                <input
                  type="email"
                  name="email"
                  value={formData.email}
                  onChange={handleChange}
                  placeholder="you@example.com"
                  disabled={isLoading}
                  autoComplete="email"
                  className="w-full px-4 py-3.5 rounded-xl border border-gray-200 focus:border-pink-500 focus:ring-4 focus:ring-pink-500/10 outline-none transition disabled:bg-gray-100"
                />
              </div>
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                 Phone Number
                </label>

                <input
                  type="text"
                  name="phone"
                  value={formData.phone}
                  onChange={handleChange}
                  placeholder="91xxxxxxxx"
                  disabled={isLoading}
                  autoComplete="email"
                  className="w-full px-4 py-3.5 rounded-xl border border-gray-200 focus:border-pink-500 focus:ring-4 focus:ring-pink-500/10 outline-none transition disabled:bg-gray-100"
                />
              </div>

              {/* Password */}
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  Password
                </label>

                <div className="relative">
                  <input
                    type={showPassword ? "text" : "password"}
                    name="password"
                    value={formData.password}
                    onChange={handleChange}
                    placeholder="Create a password"
                    disabled={isLoading}
                    autoComplete="new-password"
                    className="w-full px-4 py-3.5 pr-14 rounded-xl border border-gray-200 focus:border-pink-500 focus:ring-4 focus:ring-pink-500/10 outline-none transition disabled:bg-gray-100"
                  />

                  <button
                    type="button"
                    onClick={() =>
                      setShowPassword(!showPassword)
                    }
                    className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-500 hover:text-gray-800"
                  >
                    {showPassword ? "🙈" : "👁️"}
                  </button>
                </div>
              </div>

              {/* Confirm Password */}
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  Confirm password
                </label>

                <div className="relative">
                  <input
                    type={
                      showConfirmPassword
                        ? "text"
                        : "password"
                    }
                    name="confirmPassword"
                    value={formData.confirmPassword}
                    onChange={handleChange}
                    placeholder="Confirm your password"
                    disabled={isLoading}
                    autoComplete="new-password"
                    className="w-full px-4 py-3.5 pr-14 rounded-xl border border-gray-200 focus:border-pink-500 focus:ring-4 focus:ring-pink-500/10 outline-none transition disabled:bg-gray-100"
                  />

                  <button
                    type="button"
                    onClick={() =>
                      setShowConfirmPassword(
                        !showConfirmPassword
                      )
                    }
                    className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-500 hover:text-gray-800"
                  >
                    {showConfirmPassword
                      ? "🙈"
                      : "👁️"}
                  </button>
                </div>
              </div>

              {/* Terms */}
              <label className="flex items-start gap-3 text-sm text-gray-500">
                <input
                  type="checkbox"
                  required
                  disabled={isLoading}
                  className="mt-1 accent-pink-600"
                />

                <span>
                  I agree to the{" "}
                  <Link
                    to="/terms"
                    className="text-pink-600 font-semibold hover:text-purple-600"
                  >
                    Terms
                  </Link>{" "}
                  and{" "}
                  <Link
                    to="/privacy"
                    className="text-pink-600 font-semibold hover:text-purple-600"
                  >
                    Privacy Policy
                  </Link>
                  .
                </span>
              </label>

              {/* Submit */}
              <button
                type="submit"
                disabled={isLoading}
                className="w-full py-4 rounded-xl text-white font-bold text-lg bg-gradient-to-r from-orange-500 via-pink-500 to-purple-600 hover:opacity-90 transition shadow-lg shadow-pink-500/20 disabled:opacity-60 disabled:cursor-not-allowed"
              >
                {isLoading ? (
                  <span className="flex items-center justify-center gap-3">
                    <span className="w-5 h-5 border-2 border-white/40 border-t-white rounded-full animate-spin" />
                    Creating account...
                  </span>
                ) : (
                  "Create Account"
                )}
              </button>

            </form>

            {/* Google */}
            <div className="mt-4 w-full">
              <GoogleLoginButton
                onSuccess={handleGoogleSuccess}
                onError={(err) => setError(err.message || "Google login failed")}
                className="w-full"
              />
            </div>

            {/* Login */}
            <p className="text-center text-gray-500 mt-7">
              Already have an account?{" "}
              <Link
                to="/api/login"
                className="font-bold text-pink-600 hover:text-purple-600"
              >
                Login
              </Link>
            </p>

            {/* Back */}
            <Link
              to="/"
              className="block text-center mt-5 text-sm text-gray-400 hover:text-gray-700"
            >
              ← Back to store
            </Link>

          </div>
        </div>
      </div>
    </div>
  );
};

export default Signup;
