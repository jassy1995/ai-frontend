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

export function chatMessenger({
  message,
  userId,
  chatId,
  bot,
  onChunk,
}: {
  message: string;
  userId: string;
  chatId: string;
  bot: string;
  onChunk?: (chunk: string, fullText: string) => void;
}) {
  return new Promise<string>((resolve, _reject) => {
    let fullText = "";
    const url = `${import.meta.env.VITE_BASE_URL}/api/chats/messenger`;
    const errorMsg = "The server is busy now! Try again later";

    fetch(url, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Accept: "text/event-stream",
        "Cache-Control": "no-cache",
      },
      body: JSON.stringify({ message, userId, chatId, bot }),
    })
      .then((response) => {
        if (!response.ok) {
          throw new Error(`HTTP error! status: ${response.status}`);
        }

        const reader = response.body!.getReader();
        const decoder = new TextDecoder();

        function readStream() {
          reader
            .read()
            .then(({ done, value }) => {
              if (done) {
                if (!fullText) {
                  fullText = errorMsg;
                  if (onChunk) onChunk(errorMsg, fullText);
                }

                resolve(fullText);

                return;
              }

              const chunk = decoder.decode(value, { stream: true });

              const lines = chunk.split("\n");

              for (const line of lines) {
                if (line.startsWith("data: ")) {
                  const data = line.slice(6); // Remove 'data: ' prefix

                  if (data.startsWith("[ERROR]:")) {
                    fullText = errorMsg;
                    if (onChunk) onChunk(errorMsg, fullText);
                    resolve(fullText);

                    return;
                  }
                  if (data.startsWith("[END]:")) {
                    const residual = data.slice(6);

                    if (residual && !fullText.endsWith(residual)) {
                      fullText += residual;
                      if (onChunk) onChunk(residual, fullText);
                    }
                  } else {
                    fullText += data;
                    if (onChunk) onChunk(data, fullText);
                  }
                }
              }
              readStream();
            })
            .catch((_e) => {
              fullText = errorMsg;
              if (onChunk) onChunk(errorMsg, fullText);
              resolve(fullText);
            });
        }

        readStream();
      })
      .catch((_e) => {
        fullText = errorMsg;
        if (onChunk) onChunk(errorMsg, fullText);
        resolve(fullText);
      });
  });
}
