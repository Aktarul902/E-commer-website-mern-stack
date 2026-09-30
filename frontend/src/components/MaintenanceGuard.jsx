import { useEffect, useState } from "react";
import { useLocation, useNavigate } from "react-router";

const MaintenanceGuard = ({ children }) => {
  const [loading, setLoading] = useState(true);
  const [maintenance, setMaintenance] = useState(false);

  const location = useLocation();
  const navigate = useNavigate();

  const API_URL =
    import.meta.env.VITE_API_URL || "/api";

  const isAdminRoute = location.pathname.startsWith("/admin");

  const checkMaintenance = async () => {
    try {
      const response = await fetch(`${API_URL}/store/status`, {
        credentials: "include",
        cache: "no-store",
      });

      const data = await response.json();

      setMaintenance(Boolean(data.maintenanceMode));

      if (
        data.maintenanceMode &&
        !location.pathname.startsWith("/maintenance") &&
        !isAdminRoute
      ) {
        navigate("/maintenance", {
          replace: true,
        });
      }

      if (
        !data.maintenanceMode &&
        location.pathname.startsWith("/maintenance")
      ) {
        navigate("/", {
          replace: true,
        });
      }
    } catch (error) {
      console.error("Maintenance check failed:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    checkMaintenance();

    const interval = setInterval(() => {
      checkMaintenance();
    }, 30000);

    return () => clearInterval(interval);
  }, [location.pathname]);

  if (loading) {
    return (
      <div className="min-h-screen bg-white flex items-center justify-center">
        <div className="w-10 h-10 rounded-full border-4 border-gray-200 border-t-purple-600 animate-spin" />
      </div>
    );
  }

  /*
   * Never block admin.
   */
  if (isAdminRoute) {
    return children;
  }

  /*
   * Maintenance page itself.
   */
  if (
    maintenance &&
    !location.pathname.startsWith("/maintenance")
  ) {
    return null;
  }

  return children;
};

export default MaintenanceGuard;