// import React, { useRef, useState, useEffect } from 'react';
// import { useIsomorphicLayoutEffect, useMount } from 'react-use';
// import Markdown from 'react-markdown';
// import {
//   Avatar,
//   Button,
//   Divider,
//   Dropdown,
//   DropdownItem,
//   DropdownMenu,
//   DropdownTrigger,
//   Spinner,
//   Textarea,
// } from '@heroui/react';
// import { TbChevronLeft, TbDotsVertical, TbRobot, TbSend, TbTrash } from 'react-icons/tb';
// import { useGetMessages } from '@/api/chats';
// import { useAuth } from '@/hooks/use-auth';
// import ChatTitle from '@/components/core/chat/ChatTitle';
// import DeleteChatAlert from '@/components/core/chat/DeleteChatAlert';
// import { getCrossSubdomainCookie } from '@/lib/utils';

// const ChatDetails = ({ onBack, writer, chat, firstMessage }) => {
//   console.log('firstMessage', firstMessage);
//   const { user } = useAuth();
//   const scrollEl = useRef(null);
//   const [value, setValue] = useState(firstMessage ?? '');
//   const [messages, setMessages] = useState([]);
//   const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
//   const [isStreaming, setIsStreaming] = useState(false);
//   const { data: { conversation = [] } = {}, isLoading: isLoadingConversation } = useGetMessages(chat._id);

//   useMount(() => {
//     if (firstMessage) handleSend(firstMessage);
//   });

//   useEffect(() => {
//     if (!isLoadingConversation && conversation.length > 0) {
//       setMessages(conversation);
//     }
//   }, [conversation, isLoadingConversation]);

//   useIsomorphicLayoutEffect(() => {
//     if (!scrollEl.current) return;
//     scrollEl.current.scrollTo(0, scrollEl.current.scrollHeight);
//   }, [messages]);

//   const handleSend = async (messageText = value) => {
//     if (!messageText?.trim()) return;

//     try {
//       // Add user message immediately
//       const userMessage = {
//         role: 'user',
//         content: messageText,
//         id: Date.now().toString(),
//       };
//       setMessages((prev) => [...prev, userMessage]);

//       // Add temporary assistant message for streaming
//       const assistantMessage = {
//         role: 'assistant',
//         content: '',
//         id: `temp-${Date.now()}`,
//         isStreaming: true,
//       };
//       setMessages((prev) => [...prev, assistantMessage]);

//       setValue('');
//       setIsStreaming(true);

//       const token = getCrossSubdomainCookie('token');

//       // Call streaming endpoint
//       const response = await fetch(`${process.env.NEXT_PUBLIC_BASE_URL}/chats/${chat._id}/response`, {
//         method: 'POST',
//         headers: {
//           'Content-Type': 'application/json',
//           Accept: 'text/event-stream',
//           Authorization: `Bearer ${token}`,
//         },
//         body: JSON.stringify({ text: messageText, bot: writer.username }),
//       });

//       if (!response.ok) throw new Error('Request failed');
//       if (!response.body) throw new Error('No response body');

//       const reader = response.body.getReader();
//       const decoder = new TextDecoder();
//       let accumulatedContent = '';
//       let assistantMessageIndex = messages.length + 1; // +1 for the new assistant message

//       while (true) {
//         const { done, value } = await reader.read();
//         if (done) break;

//         const chunk = decoder.decode(value, { stream: true });
//         const lines = chunk.split('\n\n').filter((line) => line?.trim());

//         for (const line of lines) {
//           if (line.startsWith('data: ')) {
//             const data = JSON.parse(line.replace('data: ', ''));
//             if (data.content) {
//               accumulatedContent += data.content;
//               setMessages((prev) => {
//                 const newMessages = [...prev];
//                 const assistantMsgIndex = newMessages.findIndex((m) => m.id === assistantMessage.id);
//                 if (assistantMsgIndex !== -1) {
//                   newMessages[assistantMsgIndex] = {
//                     ...newMessages[assistantMsgIndex],
//                     content: accumulatedContent,
//                     isStreaming: false,
//                   };
//                 }
//                 return newMessages;
//               });
//             }
//           }
//         }
//       }
//     } catch (error) {
//       console.error('Error:', error);
//       console.log('error', error?.response?.data?.message);
//       setMessages((prev) => {
//         const newMessages = [...prev];
//         const lastMessageIndex = newMessages.length - 1;
//         if (lastMessageIndex >= 0 && newMessages[lastMessageIndex].role === 'assistant') {
//           newMessages[lastMessageIndex] = {
//             ...newMessages[lastMessageIndex],
//             content: 'Sorry, there was an error processing your message.',
//             isError: true,
//             isStreaming: false,
//           };
//         }
//         return newMessages;
//       });
//     } finally {
//       setIsStreaming(false);
//     }
//   };

//   return (
//     <div className="relative flex h-full flex-col overflow-hidden">
//       <div className="flex w-full items-center justify-between px-10 py-6">
//         <div className="flex items-center space-x-3">
//           <Button onPress={onBack} isIconOnly size="sm" variant="flat" color="default" radius="full">
//             <TbChevronLeft size="20" />
//           </Button>
//           <ChatTitle chat={chat} />
//         </div>
//         <Dropdown className="dark:bg-default-200">
//           <DropdownTrigger>
//             <Button isIconOnly variant="flat" color="default" radius="full" size="sm">
//               <TbDotsVertical size="18" />
//             </Button>
//           </DropdownTrigger>
//           <DropdownMenu aria-label="Chat actions">
//             <DropdownItem
//               key="delete"
//               className="text-danger"
//               color="danger"
//               onPress={() => setIsDeleteModalOpen(true)}
//               startContent={<TbTrash size="18" />}
//               textValue="Delete chat"
//             >
//               <p className="text-base">Delete chat</p>
//             </DropdownItem>
//           </DropdownMenu>
//         </Dropdown>
//       </div>
//       <Divider className="opacity-50" />
//       <DeleteChatAlert
//         isOpen={isDeleteModalOpen}
//         onDone={onBack}
//         onClose={() => setIsDeleteModalOpen(false)}
//         chat={chat}
//       />
//       <div className="relative flex flex-1 flex-col overflow-y-auto" ref={scrollEl}>
//         <div className="mx-auto flex w-full max-w-4xl flex-1 flex-col px-8 md:px-10">
//           {!!messages.length && (
//             <div className="flex w-full flex-col space-y-8 py-6">
//               {messages.map((message) => (
//                 <div key={message.id}>
//                   {message.role === 'assistant' && (
//                     <div className="flex flex-col justify-start space-y-3">
//                       <div
//                         className={`markdown max-w-[90%] rounded-2xl px-6 py-6 md:max-w-[85%] ${
//                           message.isError ? 'bg-danger-100 text-danger-600' : 'bg-default-100'
//                         }`}
//                       >
//                         {message.isStreaming && !message.content ? (
//                           <div className="flex items-center space-x-2">
//                             <Spinner size="sm" />
//                             <span>Thinking...</span>
//                           </div>
//                         ) : (
//                           <Markdown>{(message.content || '').replaceAll('as of June 2024', '')?.trim()}</Markdown>
//                         )}
//                       </div>
//                       <div className="flex items-center space-x-2">
//                         <Avatar icon={<TbRobot size="16" />} className="h-6 w-6" />
//                         <p>{writer?.firstName}</p>
//                       </div>
//                     </div>
//                   )}
//                   {message.role === 'user' && (
//                     <div className="flex flex-col items-end space-y-3">
//                       <div className="markdown max-w-[90%] whitespace-pre-wrap rounded-2xl bg-primary-400 px-6 py-3 text-white md:max-w-[85%]">
//                         <Markdown>{message.content}</Markdown>
//                       </div>
//                       <div className="flex items-center space-x-2">
//                         <p>You</p>
//                         <Avatar
//                           src="https://img.freepik.com/free-vector/smiling-young-man-illustration_1308-174669.jpg?semt=ais_hybrid&w=740"
//                           name={`${user?.firstName}`}
//                           showFallback
//                           className="h-6 w-6"
//                         />
//                       </div>
//                     </div>
//                   )}
//                 </div>
//               ))}
//             </div>
//           )}
//           {isLoadingConversation && (
//             <div className="flex w-full items-start py-4">
//               <div className="rounded-xl border border-default-200 px-4 py-1.5">
//                 <Spinner size="sm" />
//               </div>
//             </div>
//           )}
//         </div>
//       </div>
//       <Divider className="opacity-60" />
//       <div className="w-full py-4">
//         <div className="mx-auto flex max-w-4xl items-center space-x-2 px-8 md:px-10">
//           <Textarea
//             key="flat"
//             className="col-span-12 mb-6 md:mb-0"
//             label=""
//             labelPlacement="outside"
//             placeholder="Ask news"
//             variant="flat"
//             value={value}
//             onValueChange={setValue}
//             onKeyDown={(e) => {
//               if (e.key === 'Enter' && !e.shiftKey) {
//                 e.preventDefault();
//                 handleSend();
//               }
//             }}
//           />
//           <div>
//             <Button
//               // isLoading={isStreaming}
//               isDisabled={!value}
//               onPress={() => handleSend()}
//               isIconOnly
//               variant="solid"
//               color="primary"
//               size="md"
//               radius="full"
//               className="!h-[37px] !w-[37px] bg-white text-black"
//             >
//               <TbSend size="20" />
//             </Button>
//           </div>
//         </div>
//       </div>
//     </div>
//   );
// };

// export default ChatDetails;






// import { useState, useRef, useEffect, useCallback } from "react";
// import {
//   Card,
//   CardBody,
//   Button,
//   Textarea,
//   Chip,
//   Avatar,
//   Spinner,
// } from "@heroui/react";
// import {
//   FiSend,
//   FiUser,
//   FiLoader,
//   FiTool,
//   FiCheckCircle,
//   FiAlertCircle,
// } from "react-icons/fi";
// import { TbRobot, TbSend } from "react-icons/tb";
// import { FaRobot as FiBot } from "react-icons/fa6";
// import Markdown from "react-markdown";

// const StreamingChat = () => {
//   const [messages, setMessages] = useState<any>([]);
//   const [inputMessage, setInputMessage] = useState<any>("");
//   const [isStreaming, setIsStreaming] = useState<any>(false);
//   const [useStreaming, setUseStreaming] = useState<any>(true);
//   const [currentStreamingMessage, setCurrentStreamingMessage] =
//     useState<any>("");
//   const [toolCalls, setToolCalls] = useState<any>([]);
//   const [isExecutingTools, setIsExecutingTools] = useState(false);
//   const [streamingStatus, setStreamingStatus] = useState("");

//   // Configuration
//   const [userId] = useState("684c507136ce97be1ed9b15b");
//   const [chatId] = useState("");
//   const [bot] = useState("maxwell");
//   const [apiEndpoint] = useState("http://localhost:1350/api");

//   const messagesEndRef = useRef<any>(null);
//   const eventSourceRef = useRef(null);

//   const scrollToBottom = () => {
//     messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
//   };

//   useEffect(() => {
//     scrollToBottom();
//   }, [messages, currentStreamingMessage]);

//   const addMessage = (role: any, content: any, type: any = "text") => {
//     const newMessage = {
//       id: Date.now(),
//       role,
//       content,
//       type,
//       timestamp: new Date().toLocaleTimeString(),
//     };

//     setMessages((prev: any) => [...prev, newMessage]);
//     console.log("Added message:", newMessage);
//   };

//   // Use useCallback to prevent unnecessary re-creates
//   const handleStreamEvent = useCallback((event: any) => {
//     console.log("Processing stream event:", event.type, event);

//     switch (event.type) {
//       case "content":
//         setStreamingStatus("Adding content...");
//         // /   accumulatedContent += data.content;
//         //       setMessages((prev: any) => {
//         //         const newMessages = [...prev];
//         //         const assistantMsgIndex = newMessages.findIndex(
//         //           (m) => m.id === assistantMessage.id,
//         //         );

//         //         if (assistantMsgIndex !== -1) {
//         //           newMessages[assistantMsgIndex] = {
//         //             ...newMessages[assistantMsgIndex],
//         //             content: accumulatedContent,
//         //             isStreaming: false,
//         //           };
//         //         }

//         //         return newMessages;
//         //       });
//         // Force re-render with functional update
//         // setCurrentStreamingMessage((prev: string) => {
//         //   const newContent = prev + event.content;

//         //   console.log("Updated streaming content length:", newContent.length);

//         //   return newContent;
//         // });
//         break;

//       case "tool_call_progress":
//         setToolCalls(event.tool_calls);
//         setStreamingStatus("Building function calls...");
//         break;

//       case "tool_execution_start":
//         setStreamingStatus("Executing tools...");
//         break;

//       case "tool_executing":
//         setStreamingStatus(`Executing: ${event.tool_name}`);
//         break;

//       case "tool_result":
//         setToolCalls((prev: any) =>
//           prev.map((call: any) =>
//             call.function.name === event.tool_name
//               ? { ...call, result: event.result, completed: true }
//               : call,
//           ),
//         );
//         break;

//       case "final_response_start":
//         console.log("Final response starting");
//         setStreamingStatus("Generating final response...");
//         // setCurrentStreamingMessage(""); // Reset for final response
//         break;

//       case "final_content":
//         setStreamingStatus("Adding final content...");

//         // Force re-render with functional update
//         // setCurrentStreamingMessage((prev: string) => {
//         //   const newContent = prev + event.content;

//         //   console.log("Updated final content length:", newContent.length);

//         //   return newContent;
//         // });
//         break;

//       case "complete":
//         setStreamingStatus("Stream complete event received");

//         // Use the current streaming message as the final content
//         // setCurrentStreamingMessage((currentContent: string) => {
//         //   const finalContent = currentContent || event.final_content;

//         //   if (finalContent) {
//         //     console.log(
//         //       "Adding final message with content:",
//         //       finalContent.substring(0, 100) + "...",
//         //     );
//         //     addMessage("assistant", finalContent.replace(/<br>/g, "\n"));
//         //   } else {
//         //     console.warn("No content to add in complete event");
//         //   }

//         //   return ""; // Clear the streaming message
//         // });

//         // Reset state
//         setToolCalls([]);
//         setIsExecutingTools(false);
//         setIsStreaming(false);
//         setStreamingStatus("");
//         break;

//       case "error":
//         setStreamingStatus("Stream error...");
//         // addMessage("system", `Error: ${event.error}`, "error");
//         // setIsStreaming(false);
//         // setStreamingStatus("");
//         // setCurrentStreamingMessage("");
//         break;

//       default:
//         console.log("Unknown event type:", event.type, event);
//     }
//   }, []);

//   const handleSend = async (message: any) => {
//     if (!message?.trim()) return;
//     try {
//       // Reset state
//       setCurrentStreamingMessage("");
//       setToolCalls([]);
//       setIsExecutingTools(false);
//       setStreamingStatus("Generating response...");

//       const userMessage = {
//         role: "user",
//         content: message,
//         id: Date.now().toString(),
//       };

//       setMessages((prev: any) => [...prev, userMessage]);

//       // Add temporary assistant message for streaming
//       const assistantMessage = {
//         role: "assistant",
//         content: "",
//         id: `temp-${Date.now()}`,
//         isStreaming: true,
//       };

//       setMessages((prev: any) => [...prev, assistantMessage]);

//       setInputMessage("");
//       setIsStreaming(true);

//       const response: any = await fetch(`${apiEndpoint}/chats/messenger`, {
//         method: "POST",
//         headers: {
//           "Content-Type": "application/json",
//           Accept: "text/event-stream",
//           "Cache-Control": "no-cache",
//         },
//         body: JSON.stringify({
//           message,
//           userId,
//           chatId: chatId || undefined,
//           bot,
//         }),
//       });

//       if (!response.ok)
//         throw new Error(`HTTP error! status: ${response.status}`);
//       if (!response.body) throw new Error("No response body");

//       const reader = response.body.getReader();
//       const decoder = new TextDecoder();
//       let accumulatedContent = "";

//       while (true) {
//         const { done, value } = await reader.read();

//         if (done) break;

//         const chunk = decoder.decode(value, { stream: true });
//         const lines = chunk.split("\n\n").filter((line) => line?.trim());

//         for (const line of lines) {
//           if (line.startsWith("data: ")) {
     

//             if (line?.replace("data: ", "") === "[DONE]") {
//             console.log("Received [DONE] signal");
//             setIsStreaming(false);
//             setStreamingStatus("");
//             return;
//             }


//             const data = JSON.parse(line.replace("data: ", ""));

//             if (data.content) {
//               accumulatedContent += data.content;
//               setMessages((prev: any) => {
//                 const newMessages = [...prev];
//                 const assistantMsgIndex = newMessages.findIndex(
//                   (m) => m.id === assistantMessage.id,
//                 );

//                 if (assistantMsgIndex !== -1) {
//                   newMessages[assistantMsgIndex] = {
//                     ...newMessages[assistantMsgIndex],
//                     content: accumulatedContent,
//                     isStreaming: false,
//                   };
//                 }

//                 return newMessages;
//               });
//             }
//             // if (data && data !== "") {
//             //   try {
//                 // const parsed = JSON.parse(data);

//                 // console.log('parsed', data);

//                 handleStreamEvent(data);
//               // } catch (e) {
//               //   console.error(
//               //     "Error parsing streaming data:",
//               //     e,
//               //     "Raw data:",
//               //     data,
//               //   );
//               // }
//             }
//           }
//         }
//       // }
//     } catch (error: any) {
//       console.error("Error:", error);
//       setMessages((prev: any) => {
//         const newMessages = [...prev];
//         const lastMessageIndex = newMessages.length - 1;

//         if (
//           lastMessageIndex >= 0 &&
//           newMessages[lastMessageIndex].role === "assistant"
//         ) {
//           newMessages[lastMessageIndex] = {
//             ...newMessages[lastMessageIndex],
//             content: "Sorry, there was an error processing your message.",
//             isError: true,
//             isStreaming: false,
//           };
//         }

//         return newMessages;
//       });
//     } finally {
//       setIsStreaming(false);
//     }
//   };

//   // const handleStreamingResponse = async (message: any) => {
//   //   try {
//   //     // Reset state
//   //     setCurrentStreamingMessage("");
//   //     setToolCalls([]);
//   //     setIsExecutingTools(false);
//   //     setStreamingStatus("Generating response...");

//   //     console.log(
//   //       "Starting streaming request to:",
//   //       `${apiEndpoint}/chats/messenger`,
//   //     );

//   //     const response: any = await fetch(`${apiEndpoint}/chats/messenger`, {
//   //       method: "POST",
//   //       headers: {
//   //         "Content-Type": "application/json",
//   //         Accept: "text/event-stream",
//   //         "Cache-Control": "no-cache",
//   //       },
//   //       body: JSON.stringify({
//   //         message,
//   //         userId,
//   //         chatId: chatId || undefined,
//   //         bot,
//   //       }),
//   //     });

//   //     console.log("Response status:", response.status);

//   //     if (!response.ok) {
//   //       throw new Error(`HTTP error! status: ${response.status}`);
//   //     }

//   //     const reader = response.body.getReader();
//   //     const decoder = new TextDecoder();
//   //     let buffer = "";

//   //     try {
//   //       while (true) {
//   //         const { value, done } = await reader.read();

//   //         if (done) {
//   //           console.log("Stream completed");
//   //           break;
//   //         }

//   //         const chunk = decoder.decode(value, { stream: true });

//   //         buffer += chunk;

//   //         // Process complete lines immediately
//   //         const lines = buffer.split("\n");

//   //         buffer = lines.pop() || ""; // Keep incomplete line in buffer

//   //         for (let line of lines) {
//   //           line = line.trim();
//   //           if (!line) continue;

//   //           if (line.startsWith("data: ")) {
//   //             const data = line.slice(6).trim();

//   //             if (data === "[DONE]") {
//   //               console.log("Received [DONE] signal");
//   //               setIsStreaming(false);
//   //               setStreamingStatus("");

//   //               return;
//   //             }

//   //             if (data) {
//   //               try {
//   //                 const parsed = JSON.parse(data);

//   //                 // Process event immediately without setTimeout
//   //                 handleStreamEvent(parsed);
//   //               } catch (e) {
//   //                 console.error(
//   //                   "Error parsing streaming data:",
//   //                   e,
//   //                   "Raw data:",
//   //                   data,
//   //                 );
//   //               }
//   //             }
//   //           }
//   //         }
//   //       }
//   //     } finally {
//   //       reader.releaseLock();
//   //     }

//   //     // const reader = response.body.getReader();
//   //     // const decoder = new TextDecoder();
//   //     // let buffer = "";

//   //     // try {
//   //     //   while (true) {
//   //     //     const { value, done } = await reader.read();

//   //     //     if (done) {
//   //     //       console.log("Stream completed");
//   //     //       break;
//   //     //     }

//   //     //     const chunk = decoder.decode(value, { stream: true });
//   //     //     console.log("Received chunk:", chunk);
//   //     //     buffer += chunk;

//   //     //     // Process complete lines
//   //     //     const lines = buffer.split("\n");
//   //     //     buffer = lines.pop() || ""; // Keep incomplete line in buffer

//   //     //     for (let line of lines) {
//   //     //       line = line.trim();

//   //     //       if (line.startsWith("data: ")) {
//   //     //         const data = line.slice(6).trim();
//   //     //         console.log("Processing data line:", data);

//   //     //         if (data === "[DONE]") {
//   //     //           console.log("Received [DONE] signal");
//   //     //           setIsStreaming(false);
//   //     //           setStreamingStatus("");
//   //     //           return;
//   //     //         }

//   //     //         if (data && data !== "") {
//   //     //           try {
//   //     //             const parsed = JSON.parse(data);
//   //     //             console.log("Parsed event:", parsed);

//   //     //             // Process event immediately to ensure incremental updates
//   //     //             setTimeout(() => handleStreamEvent(parsed), 0);
//   //     //           } catch (e) {
//   //     //             console.error("Error parsing streaming data:", e, "Raw data:", data);
//   //     //           }
//   //     //         }
//   //     //       }
//   //     //     }
//   //     //   }
//   //     // } finally {
//   //     //   reader.releaseLock();
//   //     // }
//   //   } catch (error: any) {
//   //     console.error("Streaming error:", error);
//   //     addMessage("system", `Error: ${error.message}`, "error");
//   //     setIsStreaming(false);
//   //     setStreamingStatus("");
//   //     setCurrentStreamingMessage("");
//   //   }
//   // };

//   // const handleNonStreamingResponse = async (message: any) => {
//   //   const endpoint = `${apiEndpoint}/chats/messenger`;

//   //   try {
//   //     console.log("Making non-streaming request to:", endpoint);

//   //     const response = await fetch(endpoint, {
//   //       method: "POST",
//   //       headers: {
//   //         "Content-Type": "application/json",
//   //       },
//   //       body: JSON.stringify({
//   //         message,
//   //         userId,
//   //         chatId: chatId || undefined,
//   //         bot,
//   //       }),
//   //     });

//   //     const data = await response.json();

//   //     console.log("Non-streaming response:", data);

//   //     if (data.success) {
//   //       addMessage("assistant", data.response.replace(/<br>/g, "\n"));
//   //     } else {
//   //       addMessage("system", `Error: ${data.message}`, "error");
//   //     }
//   //   } catch (error: any) {
//   //     console.error("Non-streaming error:", error);
//   //     addMessage("system", `Error: ${error.message}`, "error");
//   //   } finally {
//   //     setIsStreaming(false);
//   //   }
//   // };

//   // const sendMessage = async () => {
//   //   if (!inputMessage.trim() || isStreaming) return;

//   //   console.log("Sending message:", inputMessage);
//   //   addMessage("user", inputMessage);
//   //   const messageToSend = inputMessage;

//   //   setInputMessage("");
//   //   setIsStreaming(true);

//   //   if (useStreaming) {
//   //     await handleStreamingResponse(messageToSend);
//   //   } else {
//   //     await handleNonStreamingResponse(messageToSend);
//   //   }
//   // };

//   // const renderMessage = (message: any) => {
//   //   const isUser = message.role === "user";
//   //   const isSystem = message.role === "system";

//   //   return (
//   //     <div
//   //       key={message.id}
//   //       className={`flex gap-3 p-5 ${isUser ? "justify-end" : "justify-start"}`}
//   //     >
//   //       {!isUser && (
//   //         <Avatar
//   //           color={isSystem ? "warning" : "secondary"}
//   //           icon={isSystem ? <FiAlertCircle /> : <FiBot />}
//   //           size="sm"
//   //         />
//   //       )}

//   //       <Card className={`max-w-3xl ${isUser ? "bg-primary" : ""}`}>
//   //         <CardBody className="">
//   //           <div className="flex items-center gap-2">
//   //             <span
//   //               className={`text-xs font-medium ${isUser ? "text-white" : "text-gray-600"}`}
//   //             >
//   //               {isUser ? "You" : isSystem ? "System" : "Assistant"}
//   //             </span>
//   //             <span
//   //               className={`text-xs opacity-60 ${isUser ? "text-white" : "text-gray-600"}`}
//   //             >
//   //               {message.timestamp}
//   //             </span>
//   //           </div>
//   //           <div
//   //             className={`markdown markdown-sm ${isUser ? "text-white" : "text-gray-600"}`}
//   //           >
//   //             <Markdown>{message.content}</Markdown>
//   //           </div>
//   //         </CardBody>
//   //       </Card>

//   //       {isUser && <Avatar color="primary" icon={<FiUser />} size="sm" />}
//   //     </div>
//   //   );
//   // };

//   // const renderStreamingMessage = () => {
//   //   if (!isStreaming && !currentStreamingMessage) return null;

//   //   return (
//   //     <div className="flex gap-3 mb-4 justify-start">
//   //       <Avatar color="secondary" icon={<FiBot />} size="sm" />

//   //       <Card className="max-w-[70%] border-l-4 border-l-secondary">
//   //         <CardBody className="py-2 px-3">
//   //           <div className="flex items-center gap-2 mb-2">
//   //             <span className="text-xs font-medium">Assistant</span>
//   //             <Chip
//   //               className="animate-pulse"
//   //               color="secondary"
//   //               size="sm"
//   //               variant="flat"
//   //             >
//   //               {streamingStatus || "Typing..."}
//   //             </Chip>
//   //           </div>

//   //           {toolCalls.length > 0 && (
//   //             <div className="mb-3 space-y-2">
//   //               <div className="flex items-center gap-2 text-xs font-medium">
//   //                 <FiTool className="text-warning" />
//   //                 Function Calls
//   //               </div>
//   //               {toolCalls.map((call: any, index: any) => (
//   //                 <Card key={index} className="bg-default-100">
//   //                   <CardBody className="py-2 px-3">
//   //                     <div className="flex items-center gap-2 mb-1">
//   //                       <span className="text-xs font-medium">
//   //                         {call.function.name}
//   //                       </span>
//   //                       {call.completed ? (
//   //                         <FiCheckCircle className="text-success text-xs" />
//   //                       ) : (
//   //                         <Spinner size="sm" />
//   //                       )}
//   //                     </div>
//   //                     <div className="text-xs text-default-600 mb-1">
//   //                       Args: {call.function.arguments}
//   //                     </div>
//   //                     {call.result && (
//   //                       <div className="text-xs text-success">
//   //                         Result: {call.result}
//   //                       </div>
//   //                     )}
//   //                   </CardBody>
//   //                 </Card>
//   //               ))}
//   //             </div>
//   //           )}

//   //           {currentStreamingMessage && (
//   //             <div className="text-sm whitespace-pre-wrap">
//   //               <Markdown>{currentStreamingMessage}</Markdown>
//   //               <span className="animate-pulse ml-1">▊</span>
//   //             </div>
//   //           )}

//   //           {!currentStreamingMessage && isStreaming && (
//   //             <div className="flex items-center gap-2">
//   //               <Spinner size="sm" />
//   //               <span className="text-xs">Processing...</span>
//   //             </div>
//   //           )}
//   //         </CardBody>
//   //       </Card>
//   //     </div>
//   //   );
//   // };

//   return (
//     <div className="w-full sm:w-4xl mx-auto p-4 h-screen flex flex-col">
//       {/* Debug Panel - Remove in production */}
//       <Card className="mb-4 bg-gray-50">
//         <CardBody className="p-2">
//           <div className="text-xs space-y-1">
//             <div>Messages: {messages.length}</div>
//             <div>Streaming: {isStreaming ? "Yes" : "No"}</div>
//             <div>Current Content Length: {currentStreamingMessage.length}</div>
//             <div>Status: {streamingStatus || "Idle"}</div>
//           </div>
//         </CardBody>
//       </Card>

//       <Card className="flex-1 mb-4">
//         <CardBody className="overflow-y-auto p-4">
//           {messages.length === 0 ? (
//             <div className="flex flex-col items-center justify-center h-full text-center">
//               <FiBot className="text-4xl text-default-400 mb-2" />
//               <p className="text-default-500">
//                 Start a conversation to test the API
//               </p>
//               <p className="text-xs text-default-400 mt-1">
//                 {useStreaming ? "Streaming mode enabled" : "Non-streaming mode"}
//               </p>
//             </div>
//           ) : (
//             <div className="space-y-10">
//               {/* {messages.map(renderMessage)}
//               {renderStreamingMessage()} */}
//               <Messages messages={messages} isStreaming={isStreaming} />
//               <div ref={messagesEndRef} />
//             </div>
//           )}
//         </CardBody>
//       </Card>

//       <Card>
//         <CardBody className="p-4">
//           <div className="flex gap-3">
//             <Textarea
//               className="flex-1"
//               disabled={isStreaming}
//               maxRows={4}
//               minRows={1}
//               placeholder="Type your message here..."
//               value={inputMessage}
//               onKeyDown={(e) => {
//                 if (e.key === "Enter" && !e.shiftKey) {
//                   e.preventDefault();
//                   handleSend(inputMessage);
//                 }
//               }}
//               onValueChange={setInputMessage}
//             />
//             {/* <Button
//               className="self-end"
//               color="primary"
//               isDisabled={!inputMessage.trim() || isStreaming}
//               isLoading={isStreaming}
//               startContent={isStreaming ? <FiLoader /> : <FiSend />}
//               onPress={sendMessage}
//             >
//               Send
//             </Button> */}
//             <Button
//               isIconOnly
//               className="!h-[37px] !w-[37px] bg-white text-black"
//               color="primary"
//               isDisabled={!inputMessage.trim() || isStreaming}
//               isLoading={isStreaming}
//               radius="full"
//               size="md"
//               variant="solid"
//               onPress={() => handleSend(inputMessage)}
//             >
//               <TbSend size="20" />
//             </Button>
//           </div>
//         </CardBody>
//       </Card>
//     </div>
//   );
// };

// export default StreamingChat;

// export const Messages = ({ messages, isStreaming }: any) => {
//   return (
//     <div className="relative flex flex-1 flex-col overflow-y-auto">
//       <div className="mx-auto flex w-full max-w-4xl flex-1 flex-col px-8 md:px-10">
//         {!!messages.length && (
//           <div className="flex w-full flex-col space-y-8 py-6">
//             {messages.map((message: any) => (
//               <div key={message.id}>
//                 {message.role === "assistant" && (
//                   <div className="flex flex-col justify-start space-y-3">
//                     <div
//                       className={`markdown max-w-[90%] rounded-2xl px-6 py-6 md:max-w-[85%] ${
//                         message.isError
//                           ? "bg-danger-100 text-danger-600"
//                           : "bg-default-100"
//                       }`}
//                     >
//                       {message.isStreaming && !message.content ? (
//                         <div className="flex items-center space-x-2">
//                           <Spinner size="sm" />
//                           <span>Thinking...</span>
//                         </div>
//                       ) : (
//                         <Markdown>
//                           {(message.content || "")
//                             .replaceAll("as of June 2024", "")
//                             ?.trim()}
//                         </Markdown>
//                       )}
//                     </div>
//                     <div className="flex items-center space-x-2">
//                       <Avatar
//                         className="h-6 w-6"
//                         icon={<TbRobot size="16" />}
//                       />
//                       <p>Agent</p>
//                     </div>
//                   </div>
//                 )}
//                 {message.role === "user" && (
//                   <div className="flex flex-col items-end space-y-3">
//                     <div className="markdown max-w-[90%] whitespace-pre-wrap rounded-2xl bg-primary-400 px-6 py-3 text-white md:max-w-[85%]">
//                       <Markdown>{message.content}</Markdown>
//                     </div>
//                     <div className="flex items-center space-x-2">
//                       <p>You</p>
//                       <Avatar
//                         showFallback
//                         className="h-6 w-6"
//                         name={`User`}
//                         src="https://img.freepik.com/free-vector/smiling-young-man-illustration_1308-174669.jpg?semt=ais_hybrid&w=740"
//                       />
//                     </div>
//                   </div>
//                 )}
//               </div>
//             ))}
//           </div>
//         )}
//         {isStreaming && (
//           <div className="flex w-full items-start py-4">
//             <div className="rounded-xl border border-default-200 px-4 py-1.5">
//               <Spinner size="sm" />
//             </div>
//           </div>
//         )}
//       </div>
//     </div>
//   );
// };
