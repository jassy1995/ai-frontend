import { useMutation, useQuery } from "@tanstack/react-query";

import http from "../helper/lib/http";

export const useCreateChat = () => {
  return useMutation({
    mutationFn: () => {
      return http.post("/chats");
    },
  });
};

export const useGetChats = () => {
  return useQuery({
    queryKey: ["chats", "all"],
    queryFn: async () => {
      const res = await http.get("/chats");

      return res.data;
    },
  });
};

export const useGetChat = (id: string) => {
  return useQuery({
    queryKey: ["chats", id],
    queryFn: async () => {
      const res = await http.get(`/chats/${id}`);

      return res.data;
    },
    enabled: !!id,
  });
};

export const useUpdateChat = () => {
  return useMutation({
    mutationFn: async ({ id, data }: any) => {
      const res = await http.patch(`/chats/${id}`, data);

      return res.data;
    },
  });
};

export const useDeleteChat = () => {
  return useMutation({
    mutationFn: async (id) => {
      const res = await http.delete(`/chats/${id}`);

      return res.data;
    },
  });
};
