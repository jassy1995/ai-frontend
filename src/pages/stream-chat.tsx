import { useRef, useState, useEffect } from "react";
import Markdown from "react-markdown";
import { Avatar, Button, Divider, Spinner, Textarea } from "@heroui/react";
import {
  TbRobot,
  TbMicrophone,
  TbMicrophoneOff,
  TbPlus,
  TbAdjustmentsHorizontal,
} from "react-icons/tb";
import { useIsomorphicLayoutEffect } from "react-use";
import { HiArrowSmUp } from "react-icons/hi";
import {
  Dropdown,
  DropdownTrigger,
  DropdownMenu,
  DropdownItem,
} from "@heroui/dropdown";

import { chatMessenger, useGetChatMessages } from "@/api/chat";

const markdownComponents = {
  // eslint-disable-next-line react/no-unstable-nested-components
  a: ({ _node, ...props }: any) => (
    // eslint-disable-next-line jsx-a11y/anchor-has-content
    <a
      {...props}
      className={`${props.className ?? ""} underline text-blue-500`}
      rel="noopener noreferrer"
      target="_blank"
    />
  ),
};

const StreamingChat = () => {
  const scrollEl = useRef<HTMLDivElement>(null);
  const [value, setValue] = useState("");
  const [messages, setMessages] = useState<any>([]);
  const [isStreaming, setIsStreaming] = useState(false);
  const [userId] = useState("684c507136ce97be1ed9b15b");
  const [isRecording, setIsRecording] = useState(false);
  const recognitionRef = useRef<any>(null);
  const isRecordingRef = useRef(false);
  const transcriptBufferRef = useRef("");
  const manualStopRef = useRef(false);
  const [webSearchEnabled, setWebSearchEnabled] = useState(false);
  const [customFunctionEnabled, setCustomFunctionEnabled] = useState(true);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const [chatId] = useState("");

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

  useEffect(() => {
    isRecordingRef.current = isRecording;
  }, [isRecording]);

  const handleSend = async (inputText?: string | any) => {
    const textToSend = inputText ?? value;

    if (!textToSend) return;
    const userMessage = {
      role: "user",
      content: textToSend,
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

    if (!inputText) {
      setValue("");
    }
    const tool = webSearchEnabled ? "web_search" : "custom_function";

    try {
      await chatMessenger({
        message: textToSend,
        userId,
        chatId,
        bot,
        tool,
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

  const toggleRecording = () => {
    if (isRecording) {
      manualStopRef.current = true;
      recognitionRef.current?.stop?.();
      setIsRecording(false);

      return;
    }

    // @ts-ignore
    const SpeechRecognition =
      typeof window !== "undefined" &&
      ((window as any).SpeechRecognition ||
        (window as any).webkitSpeechRecognition);

    if (!SpeechRecognition) {
      alert("Voice recognition is not supported in this browser.");

      return;
    }

    const recognition = new SpeechRecognition();

    transcriptBufferRef.current = "";
    manualStopRef.current = false;

    recognition.continuous = true;
    recognition.lang = "en-US";
    recognition.interimResults = false;
    recognition.maxAlternatives = 1;

    recognition.onresult = (event: any) => {
      for (let i = event.resultIndex; i < event.results.length; i += 1) {
        const res = event.results[i];

        if (res.isFinal) {
          transcriptBufferRef.current += `${res[0].transcript} `;
        }
      }
    };

    recognition.onerror = (event: any) => {
      // eslint-disable-next-line no-console
      console.error("Speech recognition error:", event);
    };

    recognition.onend = () => {
      if (isRecordingRef.current) {
        recognition.start();
      } else if (manualStopRef.current) {
        const finalTranscript = transcriptBufferRef.current.trim();

        transcriptBufferRef.current = "";
        manualStopRef.current = false;
        if (finalTranscript) {
          handleSend(finalTranscript);
        }
      }
    };

    recognitionRef.current = recognition;
    recognition.start();
    setIsRecording(true);
  };

  const handleFileButtonClick = () => {
    fileInputRef.current?.click();
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];

    if (file) {
      // eslint-disable-next-line no-console
      console.log("Selected file:", file);
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
                        className={`markdown markdown-sm max-w-[90%] rounded-2xl px-6 py-6 md:max-w-[85%] ${
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
                          <Markdown components={markdownComponents}>
                            {message.content}
                          </Markdown>
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
                        <Markdown components={markdownComponents}>
                          {message.content}
                        </Markdown>
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
        <div className="flex flex-col space-y-2 mx-auto w-full max-w-4xl p-4 border border-default-100 rounded-3xl">
          <Textarea
            key="flat"
            disableAutosize
            className=""
            classNames={{
              base: "",
              input: "text-md",
              inputWrapper: "!bg-white !p-0 !shadow-none",
              innerWrapper: "!shadow-none",
            }}
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

          <div className="flex items-center justify-between">
            <div className=" flex items-center space-x-2">
              <div className="relative">
                <Button
                  isIconOnly
                  className="h-[32px] w-[32px] rounded-full bg-default-100 hover:bg-default-200 text-default-700"
                  radius="full"
                  size="sm"
                  variant="light"
                  onPress={handleFileButtonClick}
                >
                  <TbPlus size="18" />
                </Button>
                <input
                  ref={fileInputRef}
                  className="hidden"
                  type="file"
                  onChange={handleFileChange}
                />
              </div>
              <Dropdown placement="top-start">
                <DropdownTrigger>
                  <Button
                    className="h-[32px] w-[24px] px-3 bg-default-100 hover:bg-default-200 text-default-700 rounded-full"
                    size="sm"
                    variant="light"
                  >
                    <span className="flex items-center space-x-1">
                      <TbAdjustmentsHorizontal size="16" />
                      <span className="text-xs">Tools</span>
                    </span>
                  </Button>
                </DropdownTrigger>
                <DropdownMenu aria-label="Tools Menu" variant="flat">
                  <DropdownItem key="search_web" className="w-full">
                    <div className="flex items-center space-x-5 justify-between w-full">
                      <div className="flex items-center space-x-2">
                        <img
                          alt="Browser icon"
                          className="w-5 h-5"
                          src="/browser.svg"
                        />
                        <span className="text-sm text-slate-600">
                          Search the Web
                        </span>
                      </div>
                      <label
                        aria-label="Toggle Search the Web"
                        className="relative inline-flex items-center cursor-pointer"
                      >
                        <input
                          checked={webSearchEnabled}
                          className="sr-only peer"
                          type="checkbox"
                          onChange={() =>
                            setWebSearchEnabled((prev) => {
                              const newVal = !prev;

                              if (newVal) setCustomFunctionEnabled(false);

                              return newVal;
                            })
                          }
                        />
                        <div className="w-9 h-5 bg-gray-200 rounded-full peer-focus:outline-none peer-focus:ring-2 peer-focus:ring-primary-300 dark:bg-gray-700 peer-checked:bg-primary-600 after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:rounded-full after:h-4 after:w-4 after:transition-all peer-checked:after:translate-x-4" />
                      </label>
                    </div>
                  </DropdownItem>
                  <DropdownItem key="custom_function" className="w-full">
                    <div className="flex items-center space-x-5 justify-between w-full">
                      <div className="flex items-center space-x-2">
                        <img
                          alt="Function Tool icon"
                          className="w-5 h-5 text-slate-100"
                          src="/function-tool.svg"
                        />
                        <span className="text-sm text-slate-600">
                          Custom Function
                        </span>
                      </div>
                      <label
                        aria-label="Toggle Custom Function"
                        className="relative inline-flex items-center cursor-pointer"
                      >
                        <input
                          checked={customFunctionEnabled}
                          className="sr-only peer"
                          type="checkbox"
                          onChange={() =>
                            setCustomFunctionEnabled((prev) => {
                              const newVal = !prev;

                              if (newVal) setWebSearchEnabled(false);

                              return newVal;
                            })
                          }
                        />
                        <div className="w-9 h-5 bg-gray-200 rounded-full peer-focus:outline-none peer-focus:ring-2 peer-focus:ring-primary-300 dark:bg-gray-700 peer-checked:bg-primary-600 after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:rounded-full after:h-4 after:w-4 after:transition-all peer-checked:after:translate-x-4" />
                      </label>
                    </div>
                  </DropdownItem>
                </DropdownMenu>
              </Dropdown>
            </div>

            <div className="flex items-center space-x-2">
              <div className="relative h-[32px] w-[32px]">
                {isRecording && (
                  <span className="absolute inline-flex h-full w-full rounded-full bg-green-500 opacity-75 animate-ping" />
                )}
                <Button
                  isIconOnly
                  className="h-[32px] w-[32px] rounded-full bg-white hover:bg-slate-100 text-slate-700"
                  radius="full"
                  size="sm"
                  variant="solid"
                  onPress={toggleRecording}
                >
                  {isRecording ? (
                    <TbMicrophoneOff size="22" />
                  ) : (
                    <TbMicrophone size="22" />
                  )}
                </Button>
              </div>

              <Button
                isIconOnly
                className="h-[32px] w-[32px] rounded-full bg-black text-white"
                isDisabled={!value || isStreaming}
                radius="full"
                size="sm"
                variant="solid"
                onPress={() => handleSend()}
              >
                <HiArrowSmUp size="22" />
              </Button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default StreamingChat;
