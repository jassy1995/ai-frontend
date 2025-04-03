import React, { useCallback, useRef, useState } from 'react';
import { useIsomorphicLayoutEffect, useMount, useUnmount } from 'react-use';
import { io } from 'socket.io-client';
import Markdown from 'react-markdown';
import {
  Avatar,
  Button,
  Divider,
  Dropdown,
  DropdownItem,
  DropdownMenu,
  DropdownTrigger,
  Input,
  Spinner,
} from '@heroui/react';
import { TbChevronLeft, TbDotsVertical, TbRobot, TbSend, TbTrash } from 'react-icons/tb';
import { useGetChat } from '@/api/chats';
import { useAuth } from '@/hooks/use-auth';
import { useQueryClient } from '@tanstack/react-query';
import ChatTitle from '@/components/core/chat/ChatTitle';
import DeleteChatAlert from '@/components/core/chat/DeleteChatAlert';
import { getImageLink } from '@/lib/utils';

const BASE_URL = process.env.NEXT_PUBLIC_BASE_URL;

const Chat = ({ chat, onBack, query }) => {
  const { user } = useAuth();
  const qc = useQueryClient();
  const socket = useRef(null);
  const scrollEl = useRef(null);
  const [value, setValue] = useState('');
  const [waiting, setWaiting] = useState(false);
  const [messages, setMessages] = useState([]);
  const [connected, setConnected] = useState(false);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);

  const send = useCallback((m = '') => {
    if (!m.length) return;
    socket.current.emit('chatbot/message', { text: m });
    setValue('');
    setWaiting(true);
  }, []);

  const start = useCallback(() => {
    socket.current = io(BASE_URL, {
      query: { type: 'user', user: user._id, id: chat._id },
    });
    socket.current.on('connect', () => {
      setConnected(true);
    });
    socket.current.on('disconnect', () => {
      setConnected(false);
      setMessages([]);
      setValue('');
      setWaiting(false);
    });
    socket.current.on('chatbot/message', async (args) => {
      if (!args.messages.filter((m) => m.role !== 'system').length && socket.current.connected) {
        if (query) send(query);
        return;
      }
      setMessages(args.messages.filter((m) => m.role !== 'system'));
      if (args.title) {
        qc.setQueryData(['chats', chat._id], (old) => {
          return { ...old, chat: { ...old.chat, title: args.title } };
        });
        qc.setQueryData(['chats', 'all'], (old) => {
          return {
            ...old,
            chats: old.chats.map((c) => (c._id === chat._id ? { ...c, title: args.title } : c)),
          };
        });
      }
      if (args.messages.at(-1).role === 'assistant') setWaiting(false);
    });
  }, [chat._id, qc, query, send, socket, user._id]);

  useMount(() => {
    if (!socket.current) start();
  });

  useUnmount(() => {
    if (socket.current?.connected) socket.current.disconnect();
  });

  useUnmount(() => stop());

  useIsomorphicLayoutEffect(() => {
    if (!scrollEl.current) return;
    scrollEl.current.scrollTo(0, scrollEl.current.scrollHeight);
  }, [messages]);

  const handleSend = () => {
    if (waiting) return;
    send(value);
  };

  return (
    <div className="relative flex h-full flex-col overflow-hidden">
      {!connected ? (
        <div className="flex h-full flex-col items-center justify-center px-10 py-20 text-center">
          <Spinner />
          <p className="mt-6">Loading messages..</p>
        </div>
      ) : (
        <>
          <div className="flex w-full items-center justify-between px-10 py-6">
            <div className="flex items-center space-x-3">
              <Button onPress={onBack} isIconOnly size="sm" variant="flat" color="default" radius="full">
                <TbChevronLeft size="20" />
              </Button>
              <ChatTitle chat={chat} />
            </div>
            <Dropdown className="dark:bg-default-200">
              <DropdownTrigger>
                <Button isIconOnly variant="flat" color="default" radius="full" size="sm">
                  <TbDotsVertical size="18" />
                </Button>
              </DropdownTrigger>
              <DropdownMenu aria-label="Chat actions">
                <DropdownItem
                  key="delete"
                  className="text-danger"
                  color="danger"
                  onPress={() => setIsDeleteModalOpen(true)}
                  startContent={<TbTrash size="18" />}
                  textValue="Delete chat"
                >
                  <p className="text-base">Delete chat</p>
                </DropdownItem>
              </DropdownMenu>
            </Dropdown>
          </div>
          <Divider className="opacity-50" />
          <DeleteChatAlert
            isOpen={isDeleteModalOpen}
            onDone={onBack}
            onClose={() => setIsDeleteModalOpen(false)}
            chat={chat}
          />
          <div className="relative flex flex-1 flex-col overflow-y-auto" ref={scrollEl}>
            <div className="mx-auto flex w-full max-w-4xl flex-1 flex-col px-8 md:px-10">
              {!!messages.length && (
                <div className="flex w-full flex-col space-y-8 py-6">
                  {messages.map((message, i) => (
                    <div key={i}>
                      {message.role === 'assistant' && (
                        <div className="flex flex-col justify-start space-y-3">
                          <div className="markdown max-w-[90%] whitespace-pre-wrap rounded-2xl bg-default-100 px-6 py-3 md:max-w-[85%]">
                            <Markdown>{message.content}</Markdown>
                          </div>
                          <div className="flex items-center space-x-2">
                            <Avatar icon={<TbRobot size="16" />} className="h-6 w-6" />
                            <p>Bambi</p>
                          </div>
                        </div>
                      )}
                      {message.role === 'user' && (
                        <div className="flex flex-col items-end space-y-3">
                          <div className="markdown max-w-[90%] whitespace-pre-wrap rounded-2xl bg-primary-400 px-6 py-3 text-white md:max-w-[85%]">
                            <Markdown>{message.content}</Markdown>
                          </div>
                          <div className="flex items-center space-x-2">
                            <p>You</p>
                            <Avatar
                              src={getImageLink(user.image)}
                              name={`${user.firstName} ${user.lastName}`}
                              showFallback
                              className="h-6 w-6"
                            />
                          </div>
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              )}
              {waiting && (
                <div className="flex w-full items-start py-4">
                  <div className="rounded-xl border border-default-200 px-4 py-1.5">
                    <Spinner size="sm" />
                  </div>
                </div>
              )}
            </div>
          </div>
          <Divider className="opacity-60" />
          <div className="w-full py-4">
            <div className="mx-auto flex max-w-4xl items-center space-x-2 px-8 md:px-10">
              <Input
                radius="full"
                color="default"
                value={value}
                onChange={(e) => setValue(e.target.value)}
                onKeyUp={(e) => {
                  if (e.key.toLowerCase() === 'enter') handleSend(value);
                }}
                type="text"
                variant="flat"
                placeholder="Ask me anything.."
                classNames={{ input: 'text-base px-4' }}
              />
              <div>
                <Button onPress={() => handleSend(value)} isIconOnly radius="full" color="primary">
                  <TbSend size="20" />
                </Button>
              </div>
            </div>
          </div>
        </>
      )}
    </div>
  );
};

const ChatDetails = ({ id, onBack, query }) => {
  const { data: { chat } = {}, isLoading: isChatLoading } = useGetChat(id);

  return (
    <>
      {isChatLoading ? (
        <div className="flex h-full flex-col items-center justify-center">
          <Spinner />
          <p className="mt-5">Loading chat..</p>
        </div>
      ) : (
        <Chat chat={chat} onBack={onBack} query={query} />
      )}
    </>
  );
};

export default ChatDetails;
