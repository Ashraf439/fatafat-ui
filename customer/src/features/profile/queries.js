import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { profileApi } from "@/api/profile";
import { queryKeys } from "@/api/queryKeys";
import { useAuth } from "@/features/auth/useAuth";

export function useMyProfile() {
  const { isAuthenticated } = useAuth();
  return useQuery({ queryKey: queryKeys.profile, queryFn: profileApi.get, enabled: isAuthenticated });
}

export function useUpdateProfile() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (payload) => profileApi.update(payload),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: queryKeys.profile }),
  });
}