import { useQuery } from "@tanstack/react-query";

import http from "@/helper/lib/http";

export const useGetUserQuery = (username: string) => {
  return useQuery({
    queryKey: ["users", username],
    queryFn: async () => {
      const res = await http.get(`api/users/${username}`);

      return res.data;
    },
  });
};
