
import { useState } from "react";
import { Link, useNavigate } from "react-router";
import { useMutation, useQueryClient } from "@tanstack/react-query";

import GoogleLoginButton from "../../components/googleloginbutton.jsx";
import { googleLogin, loginUser } from "../../lib/api.js";

const Login = () => {
  const navigate = useNavigate();
  const queryClient = useQueryClient();

  const [formData, setFormData] = useState({
    email: "",
    password: "",
  });

  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState("");

  const loginMutation = useMutation({
    mutationFn: loginUser,

    onSuccess: (data) => {
      // Backend has already created the HTTP-only
      // JWT cookie.
      const userId = data.user._id || data.user.id;
      queryClient.setQueryData(["authuser"], {
        ...data,
        user: { ...data.user, _id: userId },
      });
      navigate(`/myaccount/${userId}`);
    },

    onError: (error) => {
      setError(error.message || "Login failed");
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

    if (!formData.email.trim()) {
      setError("Please enter your email address.");
      return;
    }

    if (!formData.password) {
      setError("Please enter your password.");
      return;
    }

    loginMutation.mutate(formData);
  };

  const isLoading = loginMutation.isPending;

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
    <div className="min-h-screen relative overflow-hidden bg-gradient-to-br from-violet-700 via-fuchsia-600 to-orange-400 flex items-center justify-center p-4">

      {/* Background Glow */}
      <div className="absolute -top-40 -left-40 w-[450px] h-[450px] bg-purple-400/40 rounded-full blur-3xl" />

      <div className="absolute top-1/4 -right-40 w-[450px] h-[450px] bg-pink-400/40 rounded-full blur-3xl" />

      <div className="absolute -bottom-40 left-1/3 w-[450px] h-[450px] bg-orange-300/40 rounded-full blur-3xl" />

      {/* Decorative dots */}
      <div className="absolute top-20 right-20 w-4 h-4 bg-white/30 rounded-full" />
      <div className="absolute bottom-20 left-20 w-6 h-6 bg-white/20 rounded-full" />

      {/* Main Card */}
      <div className="relative w-full max-w-6xl bg-white rounded-[32px] shadow-2xl overflow-hidden grid lg:grid-cols-2">

        {/* Left Side */}
        <div className="hidden lg:flex bg-gradient-to-br from-violet-700 via-fuchsia-600 to-pink-500 text-white p-12 flex-col justify-between">

          <div>
            <div className="text-3xl font-black tracking-tight">
              Printzenz
            </div>

            <p className="mt-2 text-white/80">
              Your style. Your choice. Your Printzenz.
            </p>
          </div>

          <div>
            <h2 className="text-5xl font-black leading-tight">
              Welcome
              <br />
              back.
            </h2>

            <p className="mt-6 text-white/80 text-lg max-w-md">
              Sign in to continue exploring your favorite
              products and manage your Printzenz account.
            </p>

            <div className="mt-10 rounded-3xl bg-white/10 backdrop-blur-md border border-white/10 p-6">

              <div className="text-3xl">
                ✨
              </div>

              <p className="mt-4 font-bold text-xl">
                Your account, your world.
              </p>

              <p className="mt-2 text-white/70">
                Keep track of your orders, wishlist, cart
                and personalized shopping experience.
              </p>

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
            <div className="text-3xl font-black text-transparent bg-clip-text bg-gradient-to-r from-violet-600 via-fuchsia-500 to-orange-500">
              Printzenz
            </div>
          </div>

          <div className="max-w-md mx-auto">

            {/* Heading */}
            <div className="mb-8">
              <h1 className="text-3xl sm:text-4xl font-black text-gray-900">
                Welcome back
              </h1>

              <p className="mt-2 text-gray-500">
                Login to your Printzenz account.
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
                  className="w-full px-4 py-3.5 rounded-xl border border-gray-200 focus:border-fuchsia-500 focus:ring-4 focus:ring-fuchsia-500/10 outline-none transition disabled:bg-gray-100"
                />
              </div>

              {/* Password */}
              <div>
                <div className="flex items-center justify-between mb-2">

                  <label className="block text-sm font-semibold text-gray-700">
                    Password
                  </label>

                  <Link
                    to="/forgot-password"
                    className="text-sm font-semibold text-fuchsia-600 hover:text-purple-600"
                  >
                    Forgot password?
                  </Link>

                </div>

                <div className="relative">

                  <input
                    type={
                      showPassword
                        ? "text"
                        : "password"
                    }
                    name="password"
                    value={formData.password}
                    onChange={handleChange}
                    placeholder="Enter your password"
                    disabled={isLoading}
                    autoComplete="current-password"
                    className="w-full px-4 py-3.5 pr-14 rounded-xl border border-gray-200 focus:border-fuchsia-500 focus:ring-4 focus:ring-fuchsia-500/10 outline-none transition disabled:bg-gray-100"
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

              {/* Remember */}
              <label className="flex items-center gap-3 text-sm text-gray-500">

                <input
                  type="checkbox"
                  disabled={isLoading}
                  className="accent-fuchsia-600"
                />

                Remember me

              </label>

              {/* Submit */}
              <button
                type="submit"
                disabled={isLoading}
                className="w-full py-4 rounded-xl text-white font-bold text-lg bg-gradient-to-r from-violet-600 via-fuchsia-600 to-orange-500 hover:opacity-90 transition shadow-lg shadow-fuchsia-500/20 disabled:opacity-60 disabled:cursor-not-allowed"
              >
                {isLoading ? (
                  <span className="flex items-center justify-center gap-3">
                    <span className="w-5 h-5 border-2 border-white/40 border-t-white rounded-full animate-spin" />
                    Logging in...
                  </span>
                ) : (
                  "Login"
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

            {/* Signup */}
            <p className="text-center text-gray-500 mt-7">
              Don't have an account?{" "}

              <Link
                to="/api/signup"
                className="font-bold text-fuchsia-600 hover:text-purple-600"
              >
                Create account
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

export default Login;

