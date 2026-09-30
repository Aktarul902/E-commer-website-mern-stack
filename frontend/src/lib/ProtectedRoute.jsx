
import { Navigate, Outlet, useParams } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";

import { getCurrentUser } from "../lib/api";

const ProtectedRoute = () => {
  const { id } = useParams();

  const {
    data,
    isLoading,
    isError,
  } = useQuery({
    queryKey: ["auth", "user"],
    queryFn: getCurrentUser,
    retry: false,
    staleTime: 5 * 60 * 1000,
    refetchOnWindowFocus: false,
  });
  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-violet-700 via-fuchsia-600 to-orange-400">
        <div className="bg-white rounded-2xl shadow-xl px-8 py-6 text-center">

          <div className="w-10 h-10 mx-auto border-4 border-gray-200 border-t-fuchsia-600 rounded-full animate-spin" />

          <p className="mt-4 text-gray-600 font-medium">
            Checking your account...
          </p>

        </div>
      </div>
    );
  }

  // Not logged in
  if (isError || !data?.user) {
    return (
      <Navigate
        to="/login"
        replace
        state={{
          from: `/myaccount/${id}`,
        }}
      />
    );
  }

  const loggedInUserId = String(data.user.id);

  const requestedUserId = String(id);

  // Logged-in user cannot access another user's account
  if (loggedInUserId !== requestedUserId) {
    return (
      <Navigate
        to={`/myaccount/${loggedInUserId}`}
        replace
      />
    );
  }

  return <Outlet />;
};

export default ProtectedRoute;
