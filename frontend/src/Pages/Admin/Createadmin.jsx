import { useState } from "react";
import {
  Link,
  useNavigate,
} from "react-router";

import {
  ShieldCheck,
  UserPlus,
  Mail,
  Phone,
  Lock,
  User,
  ArrowLeft,
  Eye,
  EyeOff,
  CheckCircle2,
  AlertCircle,
  Sparkles,
  KeyRound,
  
} from "lucide-react";

import { createAdmin } from "../../lib/adminapi.js";

export default function CreateAdmin() {
  const navigate = useNavigate();

  const [formData, setFormData] = useState({
    firstName: "",
    lastName: "",
    email: "",
    phone: "",
    password: "",
    confirmPassword: "",
  });

  const [showPassword, setShowPassword] =
    useState(false);

  const [showConfirmPassword, setShowConfirmPassword] =
    useState(false);

  const [loading, setLoading] = useState(false);

  const [error, setError] = useState("");

  const [success, setSuccess] = useState("");

  const handleChange = (e) => {
    const { name, value } = e.target;

    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));

    setError("");
    setSuccess("");
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    setError("");
    setSuccess("");

    // -----------------------------------------
    // Validation
    // -----------------------------------------

    if (!formData.firstName.trim()) {
      setError("First name is required.");
      return;
    }

    if (!formData.lastName.trim()) {
      setError("Last name is required.");
      return;
    }

    if (!formData.email.trim()) {
      setError("Email address is required.");
      return;
    }

    if (!formData.password) {
      setError("Password is required.");
      return;
    }

    if (formData.password.length < 8) {
      setError(
        "Password must contain at least 8 characters."
      );
      return;
    }

    if (
      formData.password !==
      formData.confirmPassword
    ) {
      setError("Passwords do not match.");
      return;
    }

    try {
      setLoading(true);

      const response = await createAdmin({
        firstName: formData.firstName.trim(),
        lastName: formData.lastName.trim(),
        email: formData.email.trim().toLowerCase(),
        phone: formData.phone.trim(),
        password: formData.password,
      });

      setSuccess(
        response?.message ||
          "Admin created successfully."
      );

      setFormData({
        firstName: "",
        lastName: "",
        email: "",
        phone: "",
        password: "",
        confirmPassword: "",
      });

      // Redirect after success
      setTimeout(() => {
        navigate("/admin");
      }, 1500);
    } catch (err) {
      console.error("Create admin error:", err);

      setError(
        err?.message ||
          "Unable to create admin account."
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen overflow-hidden bg-[#f6f7fb] text-gray-900">

      {/* =====================================================
          BACKGROUND DECORATION
      ===================================================== */}

      <div className="pointer-events-none fixed inset-0 overflow-hidden">
        <div className="absolute -left-32 -top-32 h-96 w-96 animate-pulse rounded-full bg-violet-300/20 blur-3xl" />

        <div
          className="absolute -right-32 top-1/4 h-96 w-96 animate-pulse rounded-full bg-fuchsia-300/20 blur-3xl"
          style={{
            animationDelay: "700ms",
          }}
        />

        <div
          className="absolute bottom-0 left-1/3 h-96 w-96 animate-pulse rounded-full bg-pink-300/10 blur-3xl"
          style={{
            animationDelay: "1200ms",
          }}
        />
      </div>

      {/* =====================================================
          HEADER
      ===================================================== */}

      <header className="sticky top-0 z-40 border-b border-gray-200/70 bg-white/85 backdrop-blur-xl">

        <div className="mx-auto flex h-[72px] max-w-[1500px] items-center justify-between px-5 lg:px-8">

          <div className="flex items-center gap-4">

            <Link
              to="/admin"
              className="flex h-10 w-10 items-center justify-center rounded-xl border border-gray-200 bg-white text-gray-600 transition hover:-translate-x-0.5 hover:border-gray-300 hover:bg-gray-50 hover:text-gray-950"
            >
              <ArrowLeft size={19} />
            </Link>

            <div>

              <div className="flex items-center gap-2 text-sm text-gray-400">
                <span>Admin</span>

                <span>/</span>

                <span className="font-semibold text-gray-700">
                  Create Admin
                </span>
              </div>

              <h1 className="text-lg font-black tracking-tight sm:text-xl">
                Create Admin Account
              </h1>

            </div>

          </div>

          <div className="hidden items-center gap-2 rounded-full border border-violet-200 bg-violet-50 px-4 py-2 text-xs font-bold text-violet-700 sm:flex">
            <ShieldCheck size={15} />
            Admin Only
          </div>

        </div>

      </header>

      {/* =====================================================
          CONTENT
      ===================================================== */}

      <main className="relative z-10 mx-auto max-w-6xl px-5 py-8 sm:py-12 lg:px-8">

        <div className="grid gap-8 lg:grid-cols-[0.8fr_1.2fr] lg:items-start">

          {/* =================================================
              LEFT INFO
          ================================================= */}

          <section className="overflow-hidden rounded-[2rem] bg-gradient-to-br from-gray-950 via-violet-950 to-fuchsia-900 p-7 text-white shadow-2xl shadow-violet-200 sm:p-9">

            <div className="mb-8 flex h-16 w-16 items-center justify-center rounded-2xl bg-white/10 ring-1 ring-white/20 backdrop-blur-xl">
              <ShieldCheck size={31} />
            </div>

            <div className="inline-flex items-center gap-2 rounded-full border border-white/15 bg-white/10 px-3 py-1.5 text-xs font-bold uppercase tracking-wider text-violet-100">
              <Sparkles size={13} />
              Printzenz Admin
            </div>

            <h2 className="mt-6 text-3xl font-black tracking-tight sm:text-4xl">
              Add a new
              <span className="block bg-gradient-to-r from-violet-200 via-fuchsia-200 to-pink-200 bg-clip-text text-transparent">
                administrator.
              </span>
            </h2>

            <p className="mt-4 max-w-md text-sm leading-7 text-white/65 sm:text-base">
              Create a secure administrator account for
              your Printzenz store. The new account will
              receive admin permissions after creation.
            </p>

            <div className="mt-8 space-y-4">

              <InfoItem
                icon={ShieldCheck}
                title="Protected access"
                text="Only authenticated administrators can create admins."
              />

              <InfoItem
                icon={Lock}
                title="Encrypted password"
                text="Passwords are securely hashed before being saved."
              />

              <InfoItem
                icon={KeyRound}
                title="Admin permissions"
                text="The new account is stored with the admin role."
              />

            </div>

            <div className="mt-9 rounded-2xl border border-white/10 bg-white/5 p-4">
              <p className="text-xs font-semibold uppercase tracking-wider text-white/40">
                Security
              </p>

              <p className="mt-2 text-sm leading-6 text-white/65">
                Never share administrator passwords.
                Each administrator should have their own
                account.
              </p>
            </div>

          </section>

          {/* =================================================
              FORM
          ================================================= */}

          <section className="rounded-[2rem] border border-gray-200 bg-white p-5 shadow-xl shadow-gray-200/50 sm:p-8">

            <div className="mb-7">

              <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-2xl bg-gradient-to-br from-violet-600 to-fuchsia-500 text-white shadow-lg shadow-violet-200">
                <UserPlus size={22} />
              </div>

              <h2 className="text-2xl font-black tracking-tight text-gray-950">
                Administrator details
              </h2>

              <p className="mt-1 text-sm text-gray-500">
                Enter the details for the new admin account.
              </p>

            </div>

            {/* ALERT */}

            {error && (
              <div className="mb-6 flex items-start gap-3 rounded-2xl border border-red-200 bg-red-50 p-4 text-sm text-red-700">
                <AlertCircle
                  size={19}
                  className="mt-0.5 shrink-0"
                />

                <span>{error}</span>
              </div>
            )}

            {success && (
              <div className="mb-6 flex items-start gap-3 rounded-2xl border border-emerald-200 bg-emerald-50 p-4 text-sm text-emerald-700">
                <CheckCircle2
                  size={19}
                  className="mt-0.5 shrink-0"
                />

                <span>{success}</span>
              </div>
            )}

            <form
              onSubmit={handleSubmit}
              className="space-y-6"
            >

              {/* NAME */}

              <div className="grid gap-5 sm:grid-cols-2">

                <Input
                  label="First name"
                  name="firstName"
                  value={formData.firstName}
                  onChange={handleChange}
                  placeholder="Enter first name"
                  icon={User}
                />

                <Input
                  label="Last name"
                  name="lastName"
                  value={formData.lastName}
                  onChange={handleChange}
                  placeholder="Enter last name"
                  icon={User}
                />

              </div>

              {/* CONTACT */}

              <div className="grid gap-5 sm:grid-cols-2">

                <Input
                  label="Email address"
                  name="email"
                  type="email"
                  value={formData.email}
                  onChange={handleChange}
                  placeholder="admin@example.com"
                  icon={Mail}
                />

                <Input
                  label="Phone number"
                  name="phone"
                  type="tel"
                  value={formData.phone}
                  onChange={handleChange}
                  placeholder="+91 9876543210"
                  icon={Phone}
                />

              </div>

              {/* PASSWORD */}

              <PasswordInput
                label="Password"
                name="password"
                value={formData.password}
                onChange={handleChange}
                placeholder="Minimum 8 characters"
                show={showPassword}
                setShow={setShowPassword}
              />

              {/* CONFIRM PASSWORD */}

              <PasswordInput
                label="Confirm password"
                name="confirmPassword"
                value={formData.confirmPassword}
                onChange={handleChange}
                placeholder="Re-enter password"
                show={showConfirmPassword}
                setShow={setShowConfirmPassword}
              />

              {/* PASSWORD RULE */}

              <div className="rounded-2xl bg-gray-50 p-4">

                <p className="text-xs font-bold uppercase tracking-wider text-gray-400">
                  Password requirements
                </p>

                <div className="mt-3 grid gap-2 text-sm text-gray-600 sm:grid-cols-2">

                  <Requirement
                    valid={
                      formData.password.length >= 8
                    }
                    text="At least 8 characters"
                  />

                  <Requirement
                    valid={
                      formData.password ===
                        formData.confirmPassword &&
                      formData.confirmPassword.length > 0
                    }
                    text="Passwords match"
                  />

                </div>

              </div>

              {/* SUBMIT */}

              <button
                type="submit"
                disabled={loading}
                className="group relative flex w-full items-center justify-center gap-2 overflow-hidden rounded-2xl bg-gradient-to-r from-violet-600 via-fuchsia-500 to-pink-500 px-5 py-4 text-sm font-bold text-white shadow-xl shadow-fuchsia-200 transition duration-300 hover:-translate-y-0.5 hover:shadow-2xl disabled:cursor-not-allowed disabled:opacity-60"
              >

                <span className="absolute inset-0 -translate-x-full bg-white/15 transition duration-700 group-hover:translate-x-full" />

                {loading ? (
                  <>
                    <span className="h-5 w-5 animate-spin rounded-full border-2 border-white/30 border-t-white" />
                    Creating admin...
                  </>
                ) : (
                  <>
                    <UserPlus size={18} />
                    Create Admin Account
                  </>
                )}

              </button>

              <p className="text-center text-xs leading-5 text-gray-400">
                By creating this account, the user will
                receive administrator permissions.
              </p>

            </form>

          </section>

        </div>

      </main>

    </div>
  );
}

/* ============================================================
   INPUT
============================================================ */

function Input({
  label,
  name,
  type = "text",
  value,
  onChange,
  placeholder,
  icon: Icon,
}) {
  return (
    <label className="block">

      <span className="mb-2 block text-sm font-bold text-gray-800">
        {label}
      </span>

      <div className="relative">

        <Icon
          size={18}
          className="pointer-events-none absolute left-4 top-1/2 -translate-y-1/2 text-gray-400"
        />

        <input
          type={type}
          name={name}
          value={value}
          onChange={onChange}
          placeholder={placeholder}
          autoComplete="off"
          className="w-full rounded-2xl border border-gray-200 bg-gray-50 py-3.5 pl-11 pr-4 text-sm font-medium text-gray-900 outline-none transition placeholder:text-gray-400 hover:border-gray-300 focus:border-violet-500 focus:bg-white focus:ring-4 focus:ring-violet-100"
        />

      </div>

    </label>
  );
}

/* ============================================================
   PASSWORD INPUT
============================================================ */

function PasswordInput({
  label,
  name,
  value,
  onChange,
  placeholder,
  show,
  setShow,
}) {
  return (
    <label className="block">

      <span className="mb-2 block text-sm font-bold text-gray-800">
        {label}
      </span>

      <div className="relative">

        <Lock
          size={18}
          className="pointer-events-none absolute left-4 top-1/2 -translate-y-1/2 text-gray-400"
        />

        <input
          type={show ? "text" : "password"}
          name={name}
          value={value}
          onChange={onChange}
          placeholder={placeholder}
          autoComplete="new-password"
          className="w-full rounded-2xl border border-gray-200 bg-gray-50 py-3.5 pl-11 pr-12 text-sm font-medium text-gray-900 outline-none transition placeholder:text-gray-400 hover:border-gray-300 focus:border-violet-500 focus:bg-white focus:ring-4 focus:ring-violet-100"
        />

        <button
          type="button"
          onClick={() => setShow((prev) => !prev)}
          className="absolute right-3 top-1/2 flex h-9 w-9 -translate-y-1/2 items-center justify-center rounded-xl text-gray-400 transition hover:bg-gray-100 hover:text-gray-700"
        >
          {show ? (
            <EyeOff size={18} />
          ) : (
            <Eye size={18} />
          )}
        </button>

      </div>

    </label>
  );
}

/* ============================================================
   REQUIREMENT
============================================================ */

function Requirement({ valid, text }) {
  return (
    <div
      className={`flex items-center gap-2 ${
        valid
          ? "text-emerald-600"
          : "text-gray-400"
      }`}
    >
      <CheckCircle2 size={15} />
      {text}
    </div>
  );
}

/* ============================================================
   INFO ITEM
============================================================ */

function InfoItem({
  icon: Icon,
  title,
  text,
}) {
  return (
    <div className="flex gap-3">

      <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-white/10 text-violet-200">
        <Icon size={18} />
      </div>

      <div>
        <p className="text-sm font-bold">
          {title}
        </p>

        <p className="mt-1 text-xs leading-5 text-white/50">
          {text}
        </p>
      </div>

    </div>
  );
}