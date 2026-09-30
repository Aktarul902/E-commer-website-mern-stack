import { useEffect, useState } from "react";
import { Link } from "react-router";

const API_URL =
  import.meta.env.VITE_API_URL || "/api";

export default function AdminSettings() {
  const [storeStatus, setStoreStatus] = useState(true);
  const [maintenance, setMaintenance] = useState(false);
  const [emailNotifications, setEmailNotifications] = useState(true);
  const [orderNotifications, setOrderNotifications] = useState(true);
  const [lowStockAlerts, setLowStockAlerts] = useState(true);

  const [storeName, setStoreName] = useState("Printzenz");
  const [storeEmail, setStoreEmail] = useState("support@printzenz.com");
  const [currency, setCurrency] = useState("INR");
  const [timezone, setTimezone] = useState("Asia/Kolkata");

  const [saved, setSaved] = useState(false);
  const [settingsLoading, setSettingsLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [settingsError, setSettingsError] = useState("");

  useEffect(() => {
    let active = true;

    const loadSettings = async () => {
      try {
        const response = await fetch(`${API_URL}/store/settings`, {
          credentials: "include",
        });
        const data = await response.json();

        if (!response.ok) {
          throw new Error(data.message || "Failed to load store settings");
        }

        if (active) {
          setMaintenance(Boolean(data.settings?.maintenanceMode));
          setStoreEmail(
            data.settings?.storeEmail || "support@printzenz.com"
          );
          setCurrency(data.settings?.currency || "INR");
          setTimezone(data.settings?.timezone || "Asia/Kolkata");
        }
      } catch (error) {
        if (active) {
          setSettingsError(error.message || "Failed to load store settings");
        }
      } finally {
        if (active) {
          setSettingsLoading(false);
        }
      }
    };

    loadSettings();

    return () => {
      active = false;
    };
  }, []);

  const handleSave = async () => {
    setSaving(true);
    setSettingsError("");

    try {
      const response = await fetch(`${API_URL}/store/settings`, {
        method: "PUT",
        credentials: "include",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          storeEmail: storeEmail.trim(),
          currency,
          timezone,
          maintenanceMode: maintenance,
        }),
      });
      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || "Failed to save maintenance mode");
      }

      setMaintenance(Boolean(data.settings?.maintenanceMode));
      setStoreEmail(data.settings?.storeEmail || storeEmail.trim());
      setCurrency(data.settings?.currency || currency);
      setTimezone(data.settings?.timezone || timezone);
      setSaved(true);
      window.setTimeout(() => setSaved(false), 2500);
    } catch (error) {
      setSettingsError(error.message || "Failed to save maintenance mode");
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-indigo-50/40">
      {/* Header */}
      <header className="sticky top-0 z-20 border-b border-slate-200/80 bg-white/85 backdrop-blur-xl">
        <div className="mx-auto flex max-w-7xl items-center justify-between px-6 py-5">
          <div>
            <Link
              to="/admin"
              className="mb-2 inline-flex items-center gap-2 rounded-lg px-2 py-1 text-sm font-medium text-slate-500 transition hover:bg-indigo-50 hover:text-indigo-600"
            >
              ← Back to Admin
            </Link>

            <h1 className="text-3xl font-black tracking-tight text-slate-900">
              Settings
            </h1>

            <p className="mt-1 text-sm text-slate-500">
              Control your store, notifications and admin preferences.
            </p>
          </div>

          <button
            onClick={handleSave}
            disabled={settingsLoading || saving}
            className="rounded-xl bg-gradient-to-r from-indigo-600 via-purple-600 to-fuchsia-600 px-6 py-3 text-sm font-bold text-white shadow-lg shadow-indigo-200 transition hover:-translate-y-0.5 hover:shadow-xl active:translate-y-0"
          >
            {saving ? "Saving..." : saved ? "✓ Saved" : "Save Changes"}
          </button>
        </div>
      </header>

      <main className="mx-auto max-w-7xl px-6 py-8">
        {settingsError && (
          <div
            role="alert"
            className="mb-6 rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm font-medium text-red-700"
          >
            {settingsError}
          </div>
        )}

        {/* Hero */}
        <section className="relative mb-8 overflow-hidden rounded-3xl bg-gradient-to-r from-indigo-600 via-purple-600 to-fuchsia-600 p-8 text-white shadow-xl shadow-indigo-200">
          <div className="absolute -right-16 -top-20 h-64 w-64 rounded-full bg-white/10 blur-2xl" />
          <div className="absolute -bottom-24 left-1/3 h-72 w-72 rounded-full bg-pink-300/20 blur-3xl" />

          <div className="relative">
            <div className="mb-4 inline-flex rounded-2xl bg-white/15 p-3 backdrop-blur">
              <span className="text-2xl">⚙️</span>
            </div>

            <h2 className="text-2xl font-black">
              Store Control Center
            </h2>

            <p className="mt-2 max-w-2xl text-sm leading-6 text-indigo-100">
              Manage the important parts of your Printzenz store from one
              beautiful control panel.
            </p>
          </div>
        </section>

        <div className="grid gap-6 lg:grid-cols-3">
          {/* LEFT */}
          <div className="space-y-6 lg:col-span-2">
            {/* Store Information */}
            <section className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
              <SectionHeader
                icon="🏪"
                title="Store Information"
                description="Basic information about your online store."
                iconClass="bg-indigo-100"
              />

              <div className="mt-6 grid gap-5 md:grid-cols-2">
                <InputField
                  label="Store Name"
                  value={storeName}
                  placeholder="Your store name"
                  readOnly
                />

                <InputField
                  label="Store Email"
                  type="email"
                  value={storeEmail}
                  onChange={(e) => setStoreEmail(e.target.value)}
                  placeholder="support@example.com"
                />

                <SelectField
                  label="Currency"
                  value={currency}
                  onChange={(e) => setCurrency(e.target.value)}
                  options={[
                    ["INR", "₹ Indian Rupee (INR)"],
                    ["USD", "$ US Dollar (USD)"],
                    ["EUR", "€ Euro (EUR)"],
                    ["GBP", "£ British Pound (GBP)"],
                  ]}
                />

                <SelectField
                  label="Timezone"
                  value={timezone}
                  onChange={(e) => setTimezone(e.target.value)}
                  options={[
                    ["Asia/Kolkata", "India Standard Time"],
                    ["UTC", "UTC"],
                    ["Asia/Dubai", "Gulf Standard Time"],
                    ["Asia/Singapore", "Singapore Time"],
                  ]}
                />
              </div>
            </section>

            {/* Store Status */}
            <section className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
              <SectionHeader
                icon="🚀"
                title="Store Status"
                description="Control whether customers can access your storefront."
                iconClass="bg-emerald-100"
              />

              <div className="mt-6 space-y-4">
                <ToggleRow
                  title="Store is live"
                  description="Customers can browse products and place orders."
                  enabled={storeStatus}
                  onChange={() => setStoreStatus(!storeStatus)}
                  color="emerald"
                />

                <ToggleRow
                  title="Maintenance mode"
                  description="Temporarily restrict access while you make changes."
                  enabled={maintenance}
                  onChange={() => setMaintenance(!maintenance)}
                  color="orange"
                  disabled={settingsLoading || saving}
                />
              </div>

              <div
                className={`mt-5 rounded-2xl border p-4 ${
                  storeStatus && !maintenance
                    ? "border-emerald-200 bg-emerald-50"
                    : "border-orange-200 bg-orange-50"
                }`}
              >
                <div className="flex items-center gap-3">
                  <div
                    className={`h-3 w-3 rounded-full ${
                      storeStatus && !maintenance
                        ? "bg-emerald-500"
                        : "bg-orange-500"
                    }`}
                  />

                  <div>
                    <p className="text-sm font-bold text-slate-800">
                      {storeStatus && !maintenance
                        ? "Your store is currently live"
                        : "Your store is currently restricted"}
                    </p>

                    <p className="mt-0.5 text-xs text-slate-500">
                      Customers will see your storefront according to these
                      settings.
                    </p>
                  </div>
                </div>
              </div>
            </section>

            {/* Notifications */}
            <section className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
              <SectionHeader
                icon="🔔"
                title="Notifications"
                description="Choose which events should notify your admin account."
                iconClass="bg-pink-100"
              />

              <div className="mt-6 space-y-4">
                <ToggleRow
                  title="Email notifications"
                  description="Receive important store notifications by email."
                  enabled={emailNotifications}
                  onChange={() =>
                    setEmailNotifications(!emailNotifications)
                  }
                  color="pink"
                />

                <ToggleRow
                  title="New order alerts"
                  description="Get notified whenever a new order is placed."
                  enabled={orderNotifications}
                  onChange={() =>
                    setOrderNotifications(!orderNotifications)
                  }
                  color="purple"
                />

                <ToggleRow
                  title="Low stock alerts"
                  description="Receive alerts when product inventory is running low."
                  enabled={lowStockAlerts}
                  onChange={() => setLowStockAlerts(!lowStockAlerts)}
                  color="orange"
                />
              </div>
            </section>
          </div>

          {/* RIGHT */}
          <div className="space-y-6">
            {/* Account */}
            <section className="overflow-hidden rounded-3xl border border-slate-200 bg-white shadow-sm">
              <div className="bg-gradient-to-br from-violet-600 to-indigo-600 p-6 text-white">
                <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-white/15 text-2xl backdrop-blur">
                  👤
                </div>

                <h3 className="mt-5 text-xl font-black">
                  Admin Account
                </h3>

                <p className="mt-1 text-sm text-indigo-100">
                  Manage your administrator profile.
                </p>
              </div>

              <div className="space-y-2 p-4">
                <Link
                  to="/myaccount"
                  className="flex items-center justify-between rounded-xl p-3 text-sm font-semibold text-slate-700 transition hover:bg-indigo-50 hover:text-indigo-600"
                >
                  <span>Personal information</span>
                  <span>→</span>
                </Link>

                <button className="flex w-full items-center justify-between rounded-xl p-3 text-left text-sm font-semibold text-slate-700 transition hover:bg-indigo-50 hover:text-indigo-600">
                  <span>Change password</span>
                  <span>→</span>
                </button>

                <button className="flex w-full items-center justify-between rounded-xl p-3 text-left text-sm font-semibold text-slate-700 transition hover:bg-indigo-50 hover:text-indigo-600">
                  <span>Security</span>
                  <span>→</span>
                </button>
              </div>
            </section>

            {/* Quick Settings */}
            <section className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
              <SectionHeader
                icon="⚡"
                title="Quick Settings"
                description="Frequently used admin controls."
                iconClass="bg-yellow-100"
              />

              <div className="mt-5 space-y-3">
                <QuickSetting
                  icon="📦"
                  title="Products"
                  description="Manage your catalog"
                  to="/admin/products"
                />

                <QuickSetting
                  icon="🛍️"
                  title="Orders"
                  description="View customer orders"
                  to="/admin/orders"
                />

                <QuickSetting
                  icon="🏷️"
                  title="Categories"
                  description="Organize your products"
                  to="/admin/categories"
                />
              </div>
            </section>

            {/* Danger Zone */}
            <section className="rounded-3xl border border-red-200 bg-gradient-to-br from-red-50 to-white p-6">
              <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-red-100 text-xl">
                ⚠️
              </div>

              <h3 className="mt-4 font-black text-red-800">
                Danger Zone
              </h3>

              <p className="mt-1 text-sm leading-5 text-red-600">
                These actions can affect your store and should be used
                carefully.
              </p>

              <button className="mt-4 w-full rounded-xl border border-red-200 bg-white px-4 py-3 text-sm font-bold text-red-600 transition hover:bg-red-600 hover:text-white">
                Clear Store Cache
              </button>
            </section>
          </div>
        </div>

        {/* Bottom Save */}
        <div className="mt-8 flex items-center justify-between rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
          <div>
            <p className="font-bold text-slate-800">
              Changes are ready to save
            </p>

            <p className="mt-1 text-xs text-slate-500">
              Save your settings when you're finished.
            </p>
          </div>

          <button
            onClick={handleSave}
            disabled={settingsLoading || saving}
            className="rounded-xl bg-slate-900 px-6 py-3 text-sm font-bold text-white transition hover:bg-indigo-600"
          >
            {saving ? "Saving..." : saved ? "✓ Settings Saved" : "Save Settings"}
          </button>
        </div>
      </main>
    </div>
  );
}

/* --------------------------------
   Section Header
-------------------------------- */

function SectionHeader({
  icon,
  title,
  description,
  iconClass,
}) {
  return (
    <div className="flex items-start gap-4">
      <div
        className={`flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl text-xl ${iconClass}`}
      >
        {icon}
      </div>

      <div>
        <h2 className="text-lg font-black text-slate-900">
          {title}
        </h2>

        <p className="mt-1 text-sm text-slate-500">
          {description}
        </p>
      </div>
    </div>
  );
}

/* --------------------------------
   Input
-------------------------------- */

function InputField({
  label,
  type = "text",
  value,
  onChange,
  placeholder,
  readOnly = false,
}) {
  return (
    <div>
      <label className="mb-2 block text-sm font-bold text-slate-700">
        {label}
      </label>

      <input
        type={type}
        value={value}
        onChange={onChange}
        placeholder={placeholder}
        readOnly={readOnly}
        className={`w-full rounded-xl border border-slate-200 px-4 py-3 text-sm font-medium text-slate-800 outline-none transition placeholder:text-slate-400 ${
          readOnly
            ? "cursor-not-allowed bg-slate-100"
            : "bg-slate-50 focus:border-indigo-500 focus:bg-white focus:ring-4 focus:ring-indigo-100"
        }`}
      />
    </div>
  );
}

/* --------------------------------
   Select
-------------------------------- */

function SelectField({
  label,
  value,
  onChange,
  options,
}) {
  return (
    <div>
      <label className="mb-2 block text-sm font-bold text-slate-700">
        {label}
      </label>

      <select
        value={value}
        onChange={onChange}
        className="w-full appearance-none rounded-xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm font-medium text-slate-800 outline-none transition focus:border-indigo-500 focus:bg-white focus:ring-4 focus:ring-indigo-100"
      >
        {options.map(([value, label]) => (
          <option key={value} value={value}>
            {label}
          </option>
        ))}
      </select>
    </div>
  );
}

/* --------------------------------
   Toggle
-------------------------------- */

function ToggleRow({
  title,
  description,
  enabled,
  onChange,
  color = "indigo",
  disabled = false,
}) {
  const colors = {
    indigo: "bg-indigo-600",
    emerald: "bg-emerald-500",
    orange: "bg-orange-500",
    pink: "bg-pink-500",
    purple: "bg-purple-600",
  };

  return (
    <div className="flex items-center justify-between rounded-2xl border border-slate-100 bg-slate-50/70 p-4 transition hover:border-slate-200 hover:bg-white">
      <div className="pr-5">
        <p className="text-sm font-bold text-slate-800">
          {title}
        </p>

        <p className="mt-1 text-xs leading-5 text-slate-500">
          {description}
        </p>
      </div>

      <button
        type="button"
        onClick={onChange}
        disabled={disabled}
        aria-pressed={enabled}
        className={`relative h-7 w-12 shrink-0 rounded-full transition ${
          enabled ? colors[color] : "bg-slate-300"
        }`}
      >
        <span
          className={`absolute top-1 h-5 w-5 rounded-full bg-white shadow transition ${
            enabled ? "left-6" : "left-1"
          }`}
        />
      </button>
    </div>
  );
}

/* --------------------------------
   Quick Setting
-------------------------------- */

function QuickSetting({
  icon,
  title,
  description,
  to,
}) {
  return (
    <Link
      to={to}
      className="group flex items-center gap-3 rounded-2xl border border-slate-100 p-3 transition hover:-translate-y-0.5 hover:border-indigo-200 hover:bg-indigo-50"
    >
      <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-slate-100 text-lg transition group-hover:bg-white">
        {icon}
      </div>

      <div className="min-w-0 flex-1">
        <p className="text-sm font-bold text-slate-800">
          {title}
        </p>

        <p className="text-xs text-slate-500">
          {description}
        </p>
      </div>

      <span className="text-slate-400 transition group-hover:translate-x-1 group-hover:text-indigo-600">
        →
      </span>
    </Link>
  );
}