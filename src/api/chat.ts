import { useQuery } from "@tanstack/react-query";

import http from "../helper/lib/http";

export const useGetChatMessages = (chatId: string) => {
  return useQuery({
    queryKey: ["chats", chatId],
    queryFn: async () => {
      const res = await http.get(`api/chats/chat/${chatId}`);

      return res.data;
    },
    enabled: !!chatId,
  });
};
export interface StreamChatParams {
  message: string;
  userId: string;
  chatId: string;
  bot: string;
  tool: "web_search" | "custom_function";
}

export interface StreamChatData {
  content?: string;
  isError?: boolean;
  isEnd?: boolean;
}

export async function* streamChat({
  message,
  userId,
  chatId,
  bot,
  tool,
}: StreamChatParams): AsyncGenerator<StreamChatData, void, unknown> {
  const response = await fetch(
    `${import.meta.env.VITE_BASE_URL}/api/chats/messenger`,
    {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Accept: "text/event-stream",
        "Cache-Control": "no-cache",
      },
      body: JSON.stringify({
        message,
        userId,
        chatId,
        bot,
        tool,
      }),
    }
  );

  if (!response.ok) throw new Error("Request failed");
  if (!response.body) throw new Error("No response body");

  const reader = response.body.getReader();
  const decoder = new TextDecoder();

  while (true) {
    const { done, value } = await reader.read();

    if (done) break;

    const chunk = decoder.decode(value, { stream: true });
    const lines = chunk.split("\n\n").filter((line) => line?.trim());

    for (const line of lines) {
      if (!line.startsWith("data: ")) continue;

      const data: StreamChatData = JSON.parse(line.replace("data: ", ""));

      yield data;
    }
  }
}
