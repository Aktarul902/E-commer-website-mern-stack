import { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router";

import {
  forgotPassword,
  verifyResetCode,
} from "../lib/api.js";

const VerifyResetCode = () => {
  const navigate = useNavigate();

  const [email, setEmail] = useState("");
  const [code, setCode] = useState("");

  const [loading, setLoading] = useState(false);
  const [resending, setResending] = useState(false);

  const [error, setError] = useState("");
  const [message, setMessage] = useState("");

  const [countdown, setCountdown] =
    useState(60);

  useEffect(() => {
    const savedEmail = sessionStorage.getItem(
      "printzenz_reset_email"
    );

    if (!savedEmail) {
      navigate("/forgot-password", {
        replace: true,
      });

      return;
    }

    setEmail(savedEmail);
  }, [navigate]);

  useEffect(() => {
    if (countdown <= 0) return;

    const timer = setInterval(() => {
      setCountdown((current) => current - 1);
    }, 1000);

    return () => clearInterval(timer);
  }, [countdown]);

  const handleSubmit = async (event) => {
    event.preventDefault();

    setError("");
    setMessage("");

    if (!/^\d{6}$/.test(code)) {
      setError(
        "Please enter the 6-digit verification code."
      );
      return;
    }

    try {
      setLoading(true);

      const data = await verifyResetCode({
        email,
        code,
      });

      sessionStorage.setItem(
        "printzenz_reset_token",
        data.resetToken
      );

      navigate("/reset-password");
    } catch (error) {
      setError(
        error.message ||
          "Invalid verification code."
      );
    } finally {
      setLoading(false);
    }
  };

  const handleResend = async () => {
    if (countdown > 0 || resending) {
      return;
    }

    setError("");
    setMessage("");

    try {
      setResending(true);

      await forgotPassword(email);

      setMessage(
        "A new verification code has been sent."
      );

      setCountdown(60);
      setCode("");
    } catch (error) {
      setError(
        error.message ||
          "Unable to resend the code."
      );
    } finally {
      setResending(false);
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
              Verify your email
            </h1>

            <p className="mt-3 text-sm leading-6 text-zinc-400">
              Enter the 6-digit verification code
              sent to
            </p>

            <p className="mt-1 font-medium text-white">
              {email}
            </p>
          </div>

          <div className="rounded-3xl border border-zinc-800 bg-zinc-900/80 p-6 shadow-2xl sm:p-8">
            {error && (
              <div className="mb-5 rounded-xl border border-red-500/20 bg-red-500/10 px-4 py-3 text-sm text-red-300">
                {error}
              </div>
            )}

            {message && (
              <div className="mb-5 rounded-xl border border-emerald-500/20 bg-emerald-500/10 px-4 py-3 text-sm text-emerald-300">
                {message}
              </div>
            )}

            <form
              onSubmit={handleSubmit}
              className="space-y-5"
            >
              <input
                type="text"
                inputMode="numeric"
                maxLength={6}
                value={code}
                onChange={(event) =>
                  setCode(
                    event.target.value.replace(
                      /\D/g,
                      ""
                    )
                  )
                }
                placeholder="000000"
                className="w-full rounded-xl border border-zinc-700 bg-zinc-950 px-4 py-4 text-center text-3xl font-bold tracking-[0.5em] text-white outline-none focus:border-white"
              />

              <button
                type="submit"
                disabled={
                  loading || code.length !== 6
                }
                className="w-full rounded-xl bg-white px-5 py-3.5 font-semibold text-black transition hover:bg-zinc-200 disabled:cursor-not-allowed disabled:opacity-50"
              >
                {loading
                  ? "Verifying..."
                  : "Verify code"}
              </button>
            </form>

            <div className="mt-6 text-center">
              {countdown > 0 ? (
                <p className="text-sm text-zinc-500">
                  Resend code in{" "}
                  <span className="font-semibold text-zinc-300">
                    {countdown}s
                  </span>
                </p>
              ) : (
                <button
                  type="button"
                  onClick={handleResend}
                  disabled={resending}
                  className="text-sm font-semibold text-white hover:underline disabled:opacity-50"
                >
                  {resending
                    ? "Sending..."
                    : "Resend verification code"}
                </button>
              )}
            </div>

            <div className="mt-5 text-center">
              <Link
                to="/forgot-password"
                className="text-sm text-zinc-500 hover:text-white"
              >
                Use a different email
              </Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default VerifyResetCode;