import React, { useCallback, useEffect, useRef, useState } from 'react';
import Drawer from '@/components/ui/Drawer';
import ChatDetails from '@/components/core/chat/ChatDetails';
import { Button, Input } from '@heroui/react';
import { TbChevronLeft, TbMessageChatbot } from 'react-icons/tb';
import useGlobalStore from '@/store/global';
import { RiArrowRightLine } from 'react-icons/ri';
import ChatHistory from '@/components/core/chat/ChatHistory';
import { useCreateChat } from '@/api/chats';
import { useToast } from '@/hooks/use-toast';
import { useQueryClient } from '@tanstack/react-query';
import { useShallow } from 'zustand/react/shallow';

const isChatEnabled = true;

const ChatbotModal = () => {
  const id = useRef(null);
  const toast = useToast();
  const message = useRef('');
  const qc = useQueryClient();
  const query = useGlobalStore(useShallow((s) => s.data.query));
  const isOpen = useGlobalStore(useShallow((s) => s.data.isChatbotModalOpen));
  const updateData = useGlobalStore(useShallow((s) => s.updateData));
  const [value, setValue] = useState(query);
  const { mutateAsync: createChat, isPending: isCreateChatLoading } = useCreateChat();
  const [view, setView] = useState('options');

  const onChatClick = (_id) => {
    id.current = _id;
    setView('chat');
  };

  const handleCreateChat = useCallback(
    async (m) => {
      if (m.length < 2) return;
      try {
        const res = await createChat(null);
        id.current = res.data.chat._id;
        message.current = m;
        setValue('');
        setView('chat');
        await qc.invalidateQueries({ queryKey: ['chats', 'all'] });
      } catch (e) {
        toast.error(e?.response?.data?.message ?? 'Something went wrong, please try again');
      }
    },
    [createChat, qc]
  );

  useEffect(() => {
    if (isOpen && !!query) {
      setValue(query);
      handleCreateChat(query);
      updateData({ query: '' });
    }
  }, [handleCreateChat, isOpen, query, updateData]);

  const handleClose = () => {
    setView('options');
    message.current = '';
    updateData({ isChatbotModalOpen: false });
  };

  return (
    <Drawer isOpen={isOpen} onClose={handleClose} padding={false}>
      {view === 'options' && (
        <div className="h-full overflow-y-auto">
          <div className="pattern-5 rounded-b-lg px-10 pb-28 pt-14 md:px-14 md:pt-24">
            <h2 className="text-2xl font-semibold leading-snug md:text-4xl">
              Hi there, I'm Bambi 👋🏽
              <br />
              How can I help you?
            </h2>
            <p className="mt-6 opacity-80">
              I am an analytic and generative AI data assistant to help you make sense of every dataset
            </p>
          </div>
          <div className="relative z-[2] -mt-14 space-y-4 px-10 pb-12 md:px-16">
            <div className="relative flex w-full items-center space-x-2">
              <Input
                radius="full"
                color="default"
                value={value}
                onChange={(e) => setValue(e.target.value)}
                onKeyUp={(e) => {
                  if (e.key.toLowerCase() === 'enter') handleCreateChat(value);
                }}
                type="text"
                variant="flat"
                placeholder="What data are you looking for?"
                classNames={{
                  input: 'text-base px-4 dark:!text-black',
                  inputWrapper: 'dark:!bg-white',
                }}
              />
            </div>
            <Button
              isLoading={isCreateChatLoading}
              onPress={() => handleCreateChat(value)}
              color="primary"
              size="lg"
              radius="full"
              className="w-full"
              endContent={<RiArrowRightLine size="20" />}
              isDisabled={value.length < 2}
            >
              Chat
            </Button>
            <ChatHistory onClick={onChatClick} />
          </div>
        </div>
      )}
      {view === 'chat' && (
        <>
          {!isChatEnabled ? (
            <div className="flex h-full flex-col overflow-hidden">
              <div className="border-b">
                <div className="mx-auto flex max-w-xl items-center px-10 py-6">
                  <Button
                    onPress={() => setView('options')}
                    startContent={<TbChevronLeft size="20" />}
                    size="sm"
                    variant="flat"
                    color="secondary"
                    className="rounded-2xl"
                  >
                    Back
                  </Button>
                </div>
              </div>
              <div className="my-auto flex flex-col items-center justify-center text-center">
                <div className="grid h-24 w-24 place-items-center rounded-full bg-primary-600">
                  <TbMessageChatbot size="52" className="text-white" />
                </div>
                <div className="mt-10 flex flex-1 flex-col">
                  <h5 className="text-xl font-semibold">Get AI Insight</h5>
                  <p className="mt-2 max-w-[300px]">
                    Our AI data assistant Bambi is readily available to provide you with any macro economic data.
                  </p>
                </div>
                <div className="mt-8 w-max rounded-full bg-red-500 px-2.5 py-1 text-xs text-white">Coming soon</div>
              </div>
            </div>
          ) : (
            <ChatDetails
              id={id.current}
              query={message.current}
              onBack={() => {
                setView('options');
                message.current = '';
              }}
            />
          )}
        </>
      )}
    </Drawer>
  );
};

export default ChatbotModal;
