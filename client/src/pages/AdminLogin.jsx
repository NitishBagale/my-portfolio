import { useState } from "react";
import { LockKeyhole } from "lucide-react";
import { API_URL } from "../config/api";

export default function AdminLogin() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [message, setMessage] = useState("");
  const [loading, setLoading] = useState(false);

  const handleLogin = async (e) => {
    e.preventDefault();

    setMessage("");
    setLoading(true);

    try {
      const response = await fetch(`${API_URL}/api/auth/login`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          email: email.trim(),
          password,
        }),
      });

      const data = await response.json().catch(() => ({}));

      if (!response.ok) {
        setMessage(
          response.status >= 500
            ? "The login server has a configuration or database error. Check the backend logs and JWT_SECRET."
            : data.message || "Login failed",
        );
        return;
      }

      if (!data.token || !data.user?.isAdmin) {
        setMessage("Admin access required");
        return;
      }

      localStorage.setItem("adminToken", data.token);
      localStorage.setItem("adminUser", JSON.stringify(data.user));

      setMessage("Login successful!");

      window.location.href = "/admin/dashboard";
    } catch (error) {
      console.error(error);
      setMessage("Unable to connect to server");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#080808] flex items-center justify-center px-6">
      <form
        onSubmit={handleLogin}
        className="w-full max-w-md rounded-2xl border border-white/10 bg-[#101010] p-8 shadow-2xl shadow-black/30"
      >
        {/* Icon */}
        <div
          className="mb-6 flex h-12 w-12 items-center justify-center rounded-xl border"
          style={{
            borderColor: "rgba(255, 140, 0, 0.25)",
            backgroundColor: "rgba(255, 140, 0, 0.10)",
          }}
        >
          <LockKeyhole size={22} style={{ color: "#FF8C00" }} />
        </div>

        {/* Heading */}
        <h1 className="text-3xl font-semibold text-white">Admin Login</h1>

        <p className="mt-2 mb-8 text-sm text-gray-500">
          Sign in to access your dashboard.
        </p>

        {/* Email */}
        <div className="mb-5">
          <label className="mb-2 block text-sm text-gray-300">Email</label>

          <input
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="Enter your email"
            className="w-full rounded-xl border border-white/10 bg-[#080808] px-4 py-3 text-white outline-none placeholder:text-gray-600 transition"
            style={{
              caretColor: "#FF8C00",
            }}
            onFocus={(e) => {
              e.currentTarget.style.borderColor = "#FF8C00";
              e.currentTarget.style.boxShadow =
                "0 0 0 1px rgba(255, 140, 0, 0.2)";
            }}
            onBlur={(e) => {
              e.currentTarget.style.borderColor = "rgba(255, 255, 255, 0.1)";
              e.currentTarget.style.boxShadow = "none";
            }}
            required
          />
        </div>

        {/* Password */}
        <div className="mb-6">
          <label className="mb-2 block text-sm text-gray-300">Password</label>

          <input
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            placeholder="Enter your password"
            className="w-full rounded-xl border border-white/10 bg-[#080808] px-4 py-3 text-white outline-none placeholder:text-gray-600 transition"
            style={{
              caretColor: "#FF8C00",
            }}
            onFocus={(e) => {
              e.currentTarget.style.borderColor = "#FF8C00";
              e.currentTarget.style.boxShadow =
                "0 0 0 1px rgba(255, 140, 0, 0.2)";
            }}
            onBlur={(e) => {
              e.currentTarget.style.borderColor = "rgba(255, 255, 255, 0.1)";
              e.currentTarget.style.boxShadow = "none";
            }}
            required
          />
        </div>

        {/* Login Button */}
        <button
          type="submit"
          disabled={loading}
          className="w-full rounded-xl py-3 font-medium text-black transition disabled:cursor-not-allowed disabled:opacity-50"
          style={{
            backgroundColor: "#FF8C00",
          }}
          onMouseEnter={(e) => {
            if (!loading) {
              e.currentTarget.style.backgroundColor = "#ff9d26";
            }
          }}
          onMouseLeave={(e) => {
            if (!loading) {
              e.currentTarget.style.backgroundColor = "#FF8C00";
            }
          }}
        >
          {loading ? "Logging in..." : "Login"}
        </button>

        {/* Message */}
        {message && (
          <p className="mt-4 text-center text-sm text-gray-400">{message}</p>
        )}
      </form>
    </div>
  );
}
