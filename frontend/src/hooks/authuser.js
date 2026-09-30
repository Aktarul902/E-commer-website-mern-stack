import { useQuery } from "@tanstack/react-query";
import { getCurrentUser } from "../lib/api";

const useAuthuser = () => {
  const authuser = useQuery({
    queryKey: ["authuser"],
    queryFn: getCurrentUser,
    retry: false,
  });

  return {
    isLoading: authuser.isLoading,
    authuser: authuser.data?.user,
  };
};

export default useAuthuser;