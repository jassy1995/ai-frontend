// import React, { useCallback, useEffect, useRef, useState } from "react";
// import { io } from "socket.io-client";
// import { useIsomorphicLayoutEffect, useUnmount } from "react-use";
// import PropTypes from "prop-types";
// import {
//   Avatar,
//   Button,
//   Card,
//   CardBody,
//   Divider,
//   Image,
//   Input,
//   Spinner,
//   useDisclosure,
// } from "@heroui/react";
// import { TbInfoCircle, TbSend, TbSquareRoundedPlus } from "react-icons/tb";
// import Markdown from "react-markdown";
// import { useQueryClient } from "@tanstack/react-query";
// import { format } from "date-fns";
// import { RiCheckDoubleLine } from "react-icons/ri";
// import { useShallow } from "zustand/react/shallow";

// import AboutChat from "./AboutChat.js";
// import DeleteChatAlert from "./DeleteChatAlert.js";

// import { useToast } from "@/hooks/use-toast.jsx";
// import useGlobalStore from "@/store/global";
// import { getImageLink } from "@/lib/utils";
// import { useCreateChat, useGetChat, useGetChats } from "@/api/chat.js";
// import { useAuth } from "@/hooks/use-auth.js";

// const baseURL = process.env.NEXT_PUBLIC_BASE_URL;

// export interface ChatWindowProps {
//   selected: any;
//   onClose: () => void;
//   onClick: (id: string) => void;
// }

// const ChatWindow = ({ selected, onClose, onClick }: ChatWindowProps) => {
//   const {
//     isOpen: isAboutChatOpen,
//     onOpen: onAboutChatOpen,
//     onClose: onAboutChatClose,
//   } = useDisclosure();
//   const { data: { chats = [] } = {} } = useGetChats();
//   const { user } = useAuth();
//   const qc = useQueryClient();
//   const socket = useRef(null as any); 
//   const scrollEl = useRef(null as any);
//   const [value, setValue] = useState("");
//   const [waiting, setWaiting] = useState(false);
//   const [messages, setMessages] = useState([]);
//   const [connected, setConnected] = useState(false);
//   const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
//   const [query, updateData] = useGlobalStore(
//     useShallow((s:any) => [s.data.query, s.updateData]),
//   );
//   const [defaultId, setdefaultId] = useState(null);
//   const { data: { chat = {} } = {}, isLoading: isChatLoading } = useGetChat(
//     selected || defaultId,
//   );
//   const toast = useToast();
//   const { mutateAsync: create } = useCreateChat();

//   const handleCreate = useCallback(async () => {
//     if (chats.length === 10)
//       return toast.error("You can only have 10 active chats at a time");
//     try {
//       const res = await create(null as any);

//       onClick(res.data.chat._id);
//       await qc.invalidateQueries({ queryKey: ["chats", "all"] });
//     } catch (e:any) {
//       toast.error(
//         e?.response?.data?.message ??
//           e?.message ??
//           "Something went wrong, please try again",
//       );
//     }
//   }, [chats, create, onClick, qc, toast]);

//   useEffect(() => {
//     setdefaultId(chats[0]?._id);
//   }, [chats]);

//   const send = useCallback((m = "") => {
//     if (!m.length) return;
//     socket.current?.emit("chatbot/message", { text: m });
//     setValue("");
//     setWaiting(true);
//   }, []);

//   const stop = () => socket.current?.disconnect();

//   useEffect(() => {
//     if (connected && messages.length && query) {
//       send(query);
//       updateData({ query: "" });
//     }
//   }, [connected, messages.length, query, send, updateData]);

//   const handleConnected = useCallback(() => {
//     setConnected(true);
//   }, []);

//   const handleDisconnect = useCallback(() => {
//     setConnected(false);
//     setMessages([]);
//     setValue("");
//     setWaiting(false);
//   }, []);

//   const handleMessage = useCallback(
//     async (args:any) => {
//       setMessages(args.messages);
//       if (args.title) {
//         qc.setQueryData(["chats", chat._id], (old:any) => {
//           return { ...old, chat: { ...old.chat, title: args.title } };
//         });
//         qc.setQueryData(["chats", "all"], (old:any) => {
//           return {
//             ...old,
//             chats: old.chats.map((c:any) =>
//               c._id === chat._id ? { ...c, title: args.title } : c,
//             ),
//           };
//         });
//       }
//       if (args.messages.at(-1).role === "assistant") setWaiting(false);
//     },
//     [chat._id, qc],
//   );

//   const start = useCallback(() => {
//     socket.current = io(baseURL, {
//       query: { type: "user", user: user._id, id: chat._id },
//     });
//     socket.current?.on("connect", handleConnected);
//     socket.current.on("disconnect", handleDisconnect);
//     socket.current.on("chatbot/message", handleMessage);
//   }, [chat._id, handleConnected, handleDisconnect, handleMessage, user._id]);

//   useEffect(() => {
//     handleDisconnect();
//     if (!chat._id) stop();
//     else start();

//     return () => stop();
//   }, [handleDisconnect, chat._id, start]);

//   useUnmount(() => stop());

//   useIsomorphicLayoutEffect(() => {
//     if (!scrollEl.current) return;
//     scrollEl.current.scrollTo(0, scrollEl.current.scrollHeight);
//   }, [messages]);

//   const handleSend = () => {
//     if (waiting) return;
//     send(value);
//   };

//   return (
//     <Card className="card-shadow h-full rounded-none" shadow="none">
//       <CardBody className="flex h-full flex-col p-0">
//         <div className="flex h-full flex-col overflow-hidden">
//           {!selected && !defaultId ? (
//             <p className="m-auto p-10 text-center opacity-50">
//               Create a new chat or select an existing to get started
//             </p>
//           ) : (
//             <>
//               {!connected || !messages.length || isChatLoading ? (
//                 <div className="flex h-full flex-col items-center justify-center px-10 py-20 text-center">
//                   <Spinner />
//                   <p className="mt-6">Loading messages..</p>
//                 </div>
//               ) : (
//                 <>
//                   <div className="flex items-center gap-4 px-8 py-4">
//                     <Image
//                       alt="profilepic"
//                       classNames={{
//                         wrapper: " object-cover w-[40px] h-[40px]",
//                         img: "w-full object-cover",
//                       }}
//                       radius="full"
//                       src="https://www.statisense.co/images/logo-icon-inverted.png"
//                     />
//                     <div className="flex flex-col">
//                       <p className="overflow-hidden text-ellipsis whitespace-nowrap">
//                         Any Naming
//                       </p>
//                       <p className="overflow-hidden text-ellipsis whitespace-nowrap text-black/60 dark:text-white/60">
//                         Quick description
//                       </p>
//                     </div>
//                     <div className="ml-auto flex gap-2">
//                       <Button
//                         isIconOnly
//                         size="md"
//                         variant="light"
//                         onPress={handleCreate}
//                       >
//                         <TbSquareRoundedPlus size="20" />
//                       </Button>
//                       <Button
//                         isIconOnly
//                         size="md"
//                         variant="light"
//                         onPress={onAboutChatOpen}
//                       >
//                         <TbInfoCircle size="20" />
//                       </Button>
//                     </div>
//                   </div>
//                   <Divider className="opacity-50" />
//                   <div
//                     ref={scrollEl}
//                     className="custom-scrollbar relative flex flex-1 flex-col overflow-y-auto pt-16"
//                   >
//                     <div className="mx-auto flex w-full flex-1 flex-col px-8">
//                       {!!messages.length && (
//                         <div className="flex w-full flex-col space-y-8 py-6">
//                           {messages
//                             .filter((m:any) => m.role.match(/^assistant|user$/i))
//                             .map((message:any, i:number) => (
//                               <div key={i}>
//                                 {message.role === "assistant" && (
//                                   <div className="flex flex-col justify-start">
//                                     <div className="markdown max-w-[90%] whitespace-pre-wrap rounded-2xl bg-slate-200 px-6 py-3 dark:bg-default-100 md:max-w-[75%]">
//                                       <Markdown>{message.content}</Markdown>
//                                     </div>
//                                     <p className="mt-2 text-sm opacity-60">
//                                       {message.createdAt &&
//                                         format(
//                                           new Date(message.createdAt),
//                                           "eee hh:mm aaa",
//                                         )}
//                                     </p>
//                                   </div>
//                                 )}
//                                 {message.role === "user" && (
//                                   <div className="flex justify-end space-x-4">
//                                     <div className="flex max-w-[90%] flex-col items-end md:max-w-[75%]">
//                                       <div className="markdown w-full whitespace-pre-wrap rounded-2xl bg-primary-400 px-6 py-3 text-white">
//                                         <Markdown>{message.content}</Markdown>
//                                       </div>
//                                       <div className="mt-2 flex items-end gap-2">
//                                         <p className="text-sm opacity-60">
//                                           {message.createdAt &&
//                                             format(
//                                               new Date(message.createdAt),
//                                               "eee hh:mm aaa",
//                                             )}
//                                         </p>
//                                         <RiCheckDoubleLine
//                                           className="text-2xl text-green-500"
//                                           size="16"
//                                         />
//                                       </div>
//                                     </div>
//                                     <div className="mt-1">
//                                       <Avatar
//                                         showFallback
//                                         name={`${user.firstName} ${user.lastName}`}
//                                         size="sm"
//                                         src={getImageLink(user.image)}
//                                       />
//                                     </div>
//                                   </div>
//                                 )}
//                               </div>
//                             ))}
//                         </div>
//                       )}
//                       {waiting && (
//                         <div className="flex w-full items-start py-4">
//                           <div className="rounded-xl border border-default-200 px-4 py-1.5">
//                             <Spinner size="sm" />
//                           </div>
//                         </div>
//                       )}
//                       {!messages.filter((m:any) => m.role !== "system").length &&
//                         !waiting && (
//                           <p className="m-auto p-10 text-center opacity-50">
//                             What type of data are you looking for?
//                           </p>
//                         )}
//                     </div>
//                   </div>
//                   <Divider className="opacity-60" />
//                   <div className="w-full px-8 py-4">
//                     <div className="relative w-full">
//                       <Input
//                         classNames={{
//                           input: "text-base px-4 w-full bg-transparent",
//                           inputWrapper: "hover:bg-red-400 shadow-none",
//                         }}
//                         color="default"
//                         placeholder="Ask me anything.."
//                         radius="full"
//                         type="text"
//                         value={value}
//                         variant="flat"
//                         onChange={(e:any) => setValue(e.target.value)}
//                         onKeyUp={(e:any) => {
//                           if (e.key.toLowerCase() === "enter") send(value);
//                         }}
//                       />
//                       <div className="absolute right-2 top-1/2 -translate-y-1/2">
//                         <Button
//                           isIconOnly
//                           color="success"
//                           radius="full"
//                           size="md"
//                           onPress={() => handleSend()}
//                         >
//                           <TbSend color="white" size="20" />
//                         </Button>
//                       </div>
//                     </div>
//                   </div>
//                 </>
//               )}
//             </>
//           )}

//           {!!chat && (
//             <DeleteChatAlert
//               chat={chat}
//               isOpen={isDeleteModalOpen}
//               // size="sm"
//               onClose={() => setIsDeleteModalOpen(false)}
//               onDone={onClose}
//             />
//           )}
//         </div>
//       </CardBody>
//       <AboutChat
//         isOpen={isAboutChatOpen}
//         selected={selected}
//         onClick={onClick}
//         onClose={onAboutChatClose}
//       />
//     </Card>
//   );
// };

// ChatWindow.propTypes = {
//   selected: PropTypes.string,
//   onClose: PropTypes.func.isRequired,
// };

// export default ChatWindow;
