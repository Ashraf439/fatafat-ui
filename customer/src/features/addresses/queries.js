import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { addressesApi } from "@/api/addresses";
import { queryKeys } from "@/api/queryKeys";
import { useAuth } from "@/features/auth/useAuth";

export function useAddresses() {
  const { isAuthenticated } = useAuth();
  return useQuery({ queryKey: queryKeys.addresses, queryFn: addressesApi.list, enabled: isAuthenticated });
}

/** One hook per mutation, all refreshing the address list afterwards. */
function useAddressMutation(mutationFn) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn,
    onSuccess: () => queryClient.invalidateQueries({ queryKey: queryKeys.addresses }),
  });
}

export const useCreateAddress = () => useAddressMutation((payload) => addressesApi.create(payload));
export const useUpdateAddress = () => useAddressMutation(({ id, payload }) => addressesApi.update(id, payload));
export const useSetDefaultAddress = () => useAddressMutation((id) => addressesApi.setDefault(id));
export const useDeleteAddress = () => useAddressMutation((id) => addressesApi.remove(id));
