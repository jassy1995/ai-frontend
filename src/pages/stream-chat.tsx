import { useRef, useState, useEffect } from "react";
import Markdown from "react-markdown";
import { Avatar, Button, Divider, Spinner, Textarea } from "@heroui/react";
import { TbRobot, TbSend } from "react-icons/tb";
import { useIsomorphicLayoutEffect } from "react-use";

import { chatMessenger, useGetChatMessages } from "@/api/chat";

const StreamingChat = () => {
  const scrollEl = useRef<HTMLDivElement>(null);
  const [value, setValue] = useState("");
  const [messages, setMessages] = useState<any>([]);
  const [isStreaming, setIsStreaming] = useState(false);
  const [userId] = useState("684c507136ce97be1ed9b15b");

  const [chatId] = useState("685c46a619723eab9ea6e4d1");

  const [bot] = useState("maxwell");

  const { data: history = [] } = useGetChatMessages(chatId);

  useEffect(() => {
    if (history && history?.messages?.length) {
      setMessages(history.messages);
    }
  }, []);

  useIsomorphicLayoutEffect(() => {
    if (!scrollEl.current) return;
    const timer = setTimeout(() => {
      scrollEl?.current?.scrollTo(0, scrollEl?.current?.scrollHeight);
    }, 50);

    return () => clearTimeout(timer);
  }, [messages]);

  const handleSend = async () => {
    if (!value) return;
    const userMessage = {
      role: "user",
      content: value,
      id: Date.now().toString(),
    };

    setMessages((prev: any) => [...prev, userMessage]);

    const assistantMessage = {
      role: "assistant",
      content: "",
      id: `temp-${Date.now()}`,
      isStreaming: true,
    };

    setMessages((prev: any) => [...prev, assistantMessage]);
    setIsStreaming(true);

    setValue("");
    try {
      await chatMessenger({
        message: value,
        userId,
        chatId,
        bot,
        onChunk: (_chunk: any, fullText: any) => {
          const isErrorMsg =
            fullText === "The server is busy now! Try again later";

          setMessages((prev: any) => {
            const newMessages = [...prev];
            const assistantMsgIndex = newMessages.findIndex(
              (m) => m.id === assistantMessage.id
            );

            if (assistantMsgIndex !== -1) {
              newMessages[assistantMsgIndex] = {
                ...newMessages[assistantMsgIndex],
                content: fullText,
                isStreaming: false,
                isError: isErrorMsg,
              };
            }

            return newMessages;
          });
        },
      });
    } finally {
      setIsStreaming(false);
    }
  };

  return (
    <div className="relative flex h-full flex-col overflow-hidden">
      <div
        ref={scrollEl}
        className="relative flex flex-1 flex-col overflow-y-auto"
      >
        <div className="mx-auto flex w-full max-w-4xl flex-1 flex-col px-8 md:px-10">
          {!!messages.length && (
            <div className="flex w-full flex-col space-y-8 py-6">
              {messages.map((message: any) => (
                <div key={message.id}>
                  {message.role === "assistant" && (
                    <div className="flex flex-col justify-start space-y-3">
                      <div
                        className={`markdown max-w-[90%] rounded-2xl px-6 py-6 md:max-w-[85%] ${
                          message.isError
                            ? "bg-danger-100 text-danger-600"
                            : "bg-default-100"
                        }`}
                      >
                        {message.isStreaming && !message.content ? (
                          <div className="flex items-center space-x-2">
                            <Spinner size="sm" />
                            <span>Thinking...</span>
                          </div>
                        ) : (
                          <Markdown>{message.content}</Markdown>
                        )}
                      </div>
                      <div className="flex items-center space-x-2">
                        <Avatar
                          className="h-6 w-6"
                          icon={<TbRobot size="16" />}
                        />
                        <p className="text-sm capitalize">{bot}</p>
                      </div>
                    </div>
                  )}
                  {message.role === "user" && (
                    <div className="flex flex-col items-end space-y-3">
                      <div className="markdown max-w-[90%] whitespace-pre-wrap rounded-2xl bg-primary-400 px-6 py-3 text-white md:max-w-[85%]">
                        <Markdown>{message.content}</Markdown>
                      </div>
                      <div className="flex items-center space-x-2">
                        <p>You</p>
                        <Avatar
                          showFallback
                          className="h-6 w-6"
                          name="user"
                          src="https://img.freepik.com/free-vector/smiling-young-man-illustration_1308-174669.jpg?semt=ais_hybrid&w=740"
                        />
                      </div>
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
      <Divider className="opacity-60" />
      <div className="w-full py-4">
        <div className="mx-auto flex max-w-4xl items-center space-x-2 px-8 md:px-10">
          <Textarea
            key="flat"
            className="col-span-12  mb-6 md:mb-0"
            label=""
            labelPlacement="outside"
            placeholder="Ask anything"
            value={value}
            variant="flat"
            onKeyDown={(e) => {
              if (e.key === "Enter" && !e.shiftKey) {
                e.preventDefault();
                handleSend();
              }
            }}
            onValueChange={setValue}
          />
          <div>
            <Button
              isIconOnly
              className="h-[50px] w-[50px] rounded-full bg-blue-600 text-white disabled:cursor-not-allowed"
              color="primary"
              isDisabled={!value}
              isLoading={isStreaming}
              radius="full"
              size="md"
              variant="solid"
              onPress={() => handleSend()}
            >
              <TbSend size="20" />
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default StreamingChat;
