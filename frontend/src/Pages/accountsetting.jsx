import { useState } from "react";
import { Link } from "react-router";
import toast from "react-hot-toast";
import {
  User,
  Lock,
  Bell,
  ShieldCheck,
  ArrowLeft,
  Save,
  Eye,
  EyeOff,
} from "lucide-react";

export default function AccountSetting() {
  const [profile, setProfile] = useState({
    firstName: "Your",
    lastName: "Name",
    email: "you@example.com",
    phone: "+91 98765 43210",
  });

  const [password, setPassword] = useState({
    current: "",
    newPassword: "",
    confirm: "",
  });

  const [showCurrent, setShowCurrent] =
    useState(false);

  const [showNew, setShowNew] =
    useState(false);

  const [showConfirm, setShowConfirm] =
    useState(false);

  const [notifications, setNotifications] =
    useState({
      orders: true,
      offers: true,
      newsletter: false,
    });

  const [saved, setSaved] =
    useState(false);

  const handleProfileChange = (e) => {
    setProfile({
      ...profile,
      [e.target.name]: e.target.value,
    });
  };

  const handlePasswordChange = (e) => {
    setPassword({
      ...password,
      [e.target.name]: e.target.value,
    });
  };

  const saveProfile = (e) => {
    e.preventDefault();

    setSaved(true);

    setTimeout(() => {
      setSaved(false);
    }, 2500);
  };

  const changePassword = (e) => {
    e.preventDefault();

    if (
      !password.current ||
      !password.newPassword ||
      !password.confirm
    ) {
      toast.error("Please fill all password fields.");
      return;
    }

    if (
      password.newPassword !==
      password.confirm
    ) {
      toast.error("New passwords do not match.");
      return;
    }

    toast.success("Password updated successfully.");

    setPassword({
      current: "",
      newPassword: "",
      confirm: "",
    });
  };

  return (
    <div className="min-h-screen bg-gray-50">

      {/* Header */}
      <section className="bg-white border-b border-gray-100">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 py-8">

          <Link
            to="/myaccount/jngogl"
            className="inline-flex items-center gap-2 text-sm font-semibold text-gray-500 hover:text-black mb-5"
          >
            <ArrowLeft size={17} />
            Back to Account
          </Link>

          <p className="text-sm font-bold uppercase tracking-widest text-gray-400">
            My Account
          </p>

          <h1 className="text-3xl sm:text-4xl font-black mt-1">
            Account Settings
          </h1>

          <p className="text-gray-500 mt-2">
            Manage your profile, password and preferences.
          </p>

        </div>
      </section>

      {/* Content */}
      <main className="max-w-6xl mx-auto px-4 sm:px-6 py-8">

        {/* Success */}
        {saved && (
          <div className="mb-6 rounded-xl bg-green-50 border border-green-200 text-green-700 px-5 py-4 font-semibold">
            Your profile has been saved successfully.
          </div>
        )}

        <div className="grid grid-cols-1 lg:grid-cols-[230px_1fr] gap-7">

          {/* Sidebar */}
          <aside className="bg-white border border-gray-200 rounded-2xl p-3 h-fit">

            <Link
              to="/myaccount/jngogl"
              className="flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-semibold hover:bg-gray-50"
            >
              <User size={18} />
              Account
            </Link>

            <Link
              to="/account/addresses"
              className="flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-semibold hover:bg-gray-50"
            >
              <ShieldCheck size={18} />
              Addresses
            </Link>

            <div className="flex items-center gap-3 px-4 py-3 rounded-xl bg-black text-white text-sm font-bold">
              <User size={18} />
              Settings
            </div>

          </aside>

          {/* Main */}
          <div className="space-y-6">

            {/* Profile */}
            <section className="bg-white border border-gray-200 rounded-2xl p-5 sm:p-7">

              <div className="flex items-center gap-3 mb-7">

                <div className="w-11 h-11 rounded-xl bg-gray-100 flex items-center justify-center">
                  <User size={21} />
                </div>

                <div>
                  <h2 className="text-xl font-black">
                    Personal Information
                  </h2>

                  <p className="text-sm text-gray-500">
                    Update your account information.
                  </p>
                </div>

              </div>

              <form
                onSubmit={saveProfile}
                className="space-y-5"
              >

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">

                  <div>
                    <label className="block text-sm font-bold mb-2">
                      First Name
                    </label>

                    <input
                      type="text"
                      name="firstName"
                      value={profile.firstName}
                      onChange={handleProfileChange}
                      className="w-full h-12 px-4 rounded-xl border border-gray-200 outline-none focus:border-black"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-bold mb-2">
                      Last Name
                    </label>

                    <input
                      type="text"
                      name="lastName"
                      value={profile.lastName}
                      onChange={handleProfileChange}
                      className="w-full h-12 px-4 rounded-xl border border-gray-200 outline-none focus:border-black"
                    />
                  </div>

                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">

                  <div>
                    <label className="block text-sm font-bold mb-2">
                      Email Address
                    </label>

                    <input
                      type="email"
                      name="email"
                      value={profile.email}
                      onChange={handleProfileChange}
                      className="w-full h-12 px-4 rounded-xl border border-gray-200 outline-none focus:border-black"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-bold mb-2">
                      Phone Number
                    </label>

                    <input
                      type="tel"
                      name="phone"
                      value={profile.phone}
                      onChange={handleProfileChange}
                      className="w-full h-12 px-4 rounded-xl border border-gray-200 outline-none focus:border-black"
                    />
                  </div>

                </div>

                <button
                  type="submit"
                  className="inline-flex items-center gap-2 px-6 py-3 rounded-xl bg-black text-white font-bold hover:bg-gray-800"
                >
                  <Save size={17} />
                  Save Changes
                </button>

              </form>
            </section>

            {/* Password */}
            <section className="bg-white border border-gray-200 rounded-2xl p-5 sm:p-7">

              <div className="flex items-center gap-3 mb-7">

                <div className="w-11 h-11 rounded-xl bg-gray-100 flex items-center justify-center">
                  <Lock size={21} />
                </div>

                <div>
                  <h2 className="text-xl font-black">
                    Change Password
                  </h2>

                  <p className="text-sm text-gray-500">
                    Keep your account secure.
                  </p>
                </div>

              </div>

              <form
                onSubmit={changePassword}
                className="space-y-5"
              >

                {/* Current */}
                <div>
                  <label className="block text-sm font-bold mb-2">
                    Current Password
                  </label>

                  <div className="relative">

                    <input
                      type={
                        showCurrent
                          ? "text"
                          : "password"
                      }
                      name="current"
                      value={password.current}
                      onChange={
                        handlePasswordChange
                      }
                      className="w-full h-12 px-4 pr-12 rounded-xl border border-gray-200 outline-none focus:border-black"
                    />

                    <button
                      type="button"
                      onClick={() =>
                        setShowCurrent(
                          !showCurrent
                        )
                      }
                      className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400"
                    >
                      {showCurrent ? (
                        <EyeOff size={18} />
                      ) : (
                        <Eye size={18} />
                      )}
                    </button>

                  </div>
                </div>

                {/* New */}
                <div>
                  <label className="block text-sm font-bold mb-2">
                    New Password
                  </label>

                  <div className="relative">

                    <input
                      type={
                        showNew
                          ? "text"
                          : "password"
                      }
                      name="newPassword"
                      value={password.newPassword}
                      onChange={
                        handlePasswordChange
                      }
                      className="w-full h-12 px-4 pr-12 rounded-xl border border-gray-200 outline-none focus:border-black"
                    />

                    <button
                      type="button"
                      onClick={() =>
                        setShowNew(!showNew)
                      }
                      className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400"
                    >
                      {showNew ? (
                        <EyeOff size={18} />
                      ) : (
                        <Eye size={18} />
                      )}
                    </button>

                  </div>
                </div>

                {/* Confirm */}
                <div>
                  <label className="block text-sm font-bold mb-2">
                    Confirm New Password
                  </label>

                  <div className="relative">

                    <input
                      type={
                        showConfirm
                          ? "text"
                          : "password"
                      }
                      name="confirm"
                      value={password.confirm}
                      onChange={
                        handlePasswordChange
                      }
                      className="w-full h-12 px-4 pr-12 rounded-xl border border-gray-200 outline-none focus:border-black"
                    />

                    <button
                      type="button"
                      onClick={() =>
                        setShowConfirm(
                          !showConfirm
                        )
                      }
                      className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400"
                    >
                      {showConfirm ? (
                        <EyeOff size={18} />
                      ) : (
                        <Eye size={18} />
                      )}
                    </button>

                  </div>
                </div>

                <button
                  type="submit"
                  className="px-6 py-3 rounded-xl bg-black text-white font-bold hover:bg-gray-800"
                >
                  Update Password
                </button>

              </form>
            </section>

            {/* Notifications */}
            <section className="bg-white border border-gray-200 rounded-2xl p-5 sm:p-7">

              <div className="flex items-center gap-3 mb-6">

                <div className="w-11 h-11 rounded-xl bg-gray-100 flex items-center justify-center">
                  <Bell size={21} />
                </div>

                <div>
                  <h2 className="text-xl font-black">
                    Notifications
                  </h2>

                  <p className="text-sm text-gray-500">
                    Choose what you want to receive.
                  </p>
                </div>

              </div>

              <div className="space-y-4">

                <label className="flex items-center justify-between gap-5 cursor-pointer">

                  <div>
                    <p className="font-bold">
                      Order Updates
                    </p>

                    <p className="text-sm text-gray-500">
                      Get updates about your orders.
                    </p>
                  </div>

                  <input
                    type="checkbox"
                    checked={notifications.orders}
                    onChange={() =>
                      setNotifications({
                        ...notifications,
                        orders:
                          !notifications.orders,
                      })
                    }
                    className="w-5 h-5 accent-black"
                  />

                </label>

                <label className="flex items-center justify-between gap-5 cursor-pointer">

                  <div>
                    <p className="font-bold">
                      Offers & Promotions
                    </p>

                    <p className="text-sm text-gray-500">
                      Receive special offers and discounts.
                    </p>
                  </div>

                  <input
                    type="checkbox"
                    checked={notifications.offers}
                    onChange={() =>
                      setNotifications({
                        ...notifications,
                        offers:
                          !notifications.offers,
                      })
                    }
                    className="w-5 h-5 accent-black"
                  />

                </label>

                <label className="flex items-center justify-between gap-5 cursor-pointer">

                  <div>
                    <p className="font-bold">
                      Newsletter
                    </p>

                    <p className="text-sm text-gray-500">
                      Receive the latest Printzenz news.
                    </p>
                  </div>

                  <input
                    type="checkbox"
                    checked={notifications.newsletter}
                    onChange={() =>
                      setNotifications({
                        ...notifications,
                        newsletter:
                          !notifications.newsletter,
                      })
                    }
                    className="w-5 h-5 accent-black"
                  />

                </label>

              </div>
            </section>

            {/* Security */}
            <section className="bg-white border border-gray-200 rounded-2xl p-5 sm:p-7">

              <div className="flex items-start gap-4">

                <div className="w-11 h-11 shrink-0 rounded-xl bg-green-50 text-green-600 flex items-center justify-center">
                  <ShieldCheck size={21} />
                </div>

                <div>
                  <h2 className="font-black text-lg">
                    Account Security
                  </h2>

                  <p className="text-sm text-gray-500 mt-1 leading-6">
                    Your account information is protected.
                    Never share your password or verification
                    codes with anyone.
                  </p>
                </div>

              </div>
            </section>

          </div>
        </div>
      </main>
    </div>
  );
}