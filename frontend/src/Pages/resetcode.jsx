import { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router";

import { resetPassword } from "../lib/api.js";

const ResetPassword = () => {
  const navigate = useNavigate();

  const [resetToken, setResetToken] =
    useState("");

  const [password, setPassword] =
    useState("");

  const [confirmPassword, setConfirmPassword] =
    useState("");

  const [showPassword, setShowPassword] =
    useState(false);

  const [loading, setLoading] =
    useState(false);

  const [error, setError] = useState("");

  useEffect(() => {
    const token = sessionStorage.getItem(
      "printzenz_reset_token"
    );

    if (!token) {
      navigate("/forgot-password", {
        replace: true,
      });

      return;
    }

    setResetToken(token);
  }, [navigate]);

  const passwordLength = password.length >= 8;
  const passwordsMatch =
    password.length > 0 &&
    password === confirmPassword;

  const handleSubmit = async (event) => {
    event.preventDefault();

    setError("");

    if (password.length < 8) {
      setError(
        "Password must be at least 8 characters."
      );
      return;
    }

    if (password !== confirmPassword) {
      setError("Passwords do not match.");
      return;
    }

    try {
      setLoading(true);

      await resetPassword({
        resetToken,
        password,
        confirmPassword,
      });

      // Reset token can no longer be used.
      sessionStorage.removeItem(
        "printzenz_reset_token"
      );

      sessionStorage.removeItem(
        "printzenz_reset_email"
      );

      navigate("/login", {
        replace: true,
        state: {
          passwordResetSuccess: true,
        },
      });
    } catch (error) {
      setError(
        error.message ||
          "Unable to reset your password."
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-zinc-950 px-4 py-10 text-white">
      <div className="mx-auto flex min-h-[85vh] max-w-md items-center justify-center">
        <div className="w-full">
          <div className="mb-8 text-center">
            <Link
              to="/"
              className="text-3xl font-black"
            >
              PRINTZENZ
            </Link>

            <h1 className="mt-8 text-3xl font-bold">
              Create a new password
            </h1>

            <p className="mt-3 text-sm leading-6 text-zinc-400">
              Choose a strong password for your
              Printzenz account.
            </p>
          </div>

          <div className="rounded-3xl border border-zinc-800 bg-zinc-900/80 p-6 shadow-2xl sm:p-8">
            {error && (
              <div className="mb-5 rounded-xl border border-red-500/20 bg-red-500/10 px-4 py-3 text-sm text-red-300">
                {error}
              </div>
            )}

            <form
              onSubmit={handleSubmit}
              className="space-y-5"
            >
              <div>
                <label className="mb-2 block text-sm font-medium text-zinc-200">
                  New password
                </label>

                <div className="relative">
                  <input
                    type={
                      showPassword
                        ? "text"
                        : "password"
                    }
                    value={password}
                    onChange={(event) =>
                      setPassword(
                        event.target.value
                      )
                    }
                    placeholder="Enter new password"
                    autoComplete="new-password"
                    className="w-full rounded-xl border border-zinc-700 bg-zinc-950 px-4 py-3.5 pr-20 text-white outline-none focus:border-white"
                  />

                  <button
                    type="button"
                    onClick={() =>
                      setShowPassword(
                        (current) => !current
                      )
                    }
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-xs font-medium text-zinc-400 hover:text-white"
                  >
                    {showPassword
                      ? "Hide"
                      : "Show"}
                  </button>
                </div>
              </div>

              <div>
                <label className="mb-2 block text-sm font-medium text-zinc-200">
                  Confirm new password
                </label>

                <input
                  type={
                    showPassword
                      ? "text"
                      : "password"
                  }
                  value={confirmPassword}
                  onChange={(event) =>
                    setConfirmPassword(
                      event.target.value
                    )
                  }
                  placeholder="Confirm new password"
                  autoComplete="new-password"
                  className="w-full rounded-xl border border-zinc-700 bg-zinc-950 px-4 py-3.5 text-white outline-none focus:border-white"
                />
              </div>

              <div className="space-y-2 rounded-xl bg-zinc-950 p-4 text-sm">
                <div
                  className={
                    passwordLength
                      ? "text-emerald-400"
                      : "text-zinc-500"
                  }
                >
                  {passwordLength ? "✓" : "○"} At
                  least 8 characters
                </div>

                <div
                  className={
                    passwordsMatch
                      ? "text-emerald-400"
                      : "text-zinc-500"
                  }
                >
                  {passwordsMatch ? "✓" : "○"}{" "}
                  Passwords match
                </div>
              </div>

              <button
                type="submit"
                disabled={
                  loading ||
                  !passwordLength ||
                  !passwordsMatch
                }
                className="w-full rounded-xl bg-white px-5 py-3.5 font-semibold text-black transition hover:bg-zinc-200 disabled:cursor-not-allowed disabled:opacity-50"
              >
                {loading
                  ? "Updating password..."
                  : "Reset password"}
              </button>
            </form>

            <div className="mt-6 text-center">
              <Link
                to="/api/login"
                className="text-sm text-zinc-500 hover:text-white"
              >
                ← Back to login
              </Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ResetPassword;