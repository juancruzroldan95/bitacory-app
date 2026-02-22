import { useConvexAuth } from "convex/react";

const useAuth = () => {
  const { isLoading, isAuthenticated } = useConvexAuth();
  return { isAuthenticated, isInitialized: !isLoading };
};

export default useAuth;
