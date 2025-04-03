import React, { useRef, useState } from 'react';
import ChatWindow from '@/components/chat/ChatWindow';
import useGlobalStore from '@/store/global';
import { useCreateChat } from '@/api/chats';
import { useQueryClient } from '@tanstack/react-query';
import { useIsomorphicLayoutEffect, useMount } from 'react-use';
import { useToast } from '@/hooks/use-toast';
import ChatSidebar from '@/components/core/chat/ChatSidebar';
import ChatAIList from '@/components/core/chat/ChatAIList';
import { useShallow } from 'zustand/react/shallow';

const ChatPageContent = () => {
  const toast = useToast();
  const qc = useQueryClient();
  const query = useGlobalStore(useShallow((s) => s.data.query));
  const [id, setId] = useState(null);
  const triggered = useRef(false);
  const { mutateAsync: create } = useCreateChat();

  const handleClick = (id) => {
    setId(id);
  };

  useIsomorphicLayoutEffect(() => {
    document.scrollingElement.overflowY = 'hidden';
    return () => {
      document.scrollingElement.overflowY = 'initial';
    };
  }, []);

  useMount(async () => {
    if (query && !triggered.current) {
      triggered.current = true;
      try {
        const res = await create(null);
        handleClick(res.data.chat._id);
        await qc.invalidateQueries({ queryKey: ['chats', 'all'] });
      } catch (e) {
        toast.error(e?.response?.data?.message ?? e?.message ?? 'Something went wrong, please try again');
      }
    }
  });

  return (
    <div className="overflow-hidden">
      <div className="fixed left-0 top-[96px] hidden flex-col md:flex">
        <ChatSidebar />
      </div>
      <div className="container grid h-full grid-cols-[1fr] gap-6 overflow-y-hidden md:grid-cols-[360px_1fr]">
        <div className="mt-[70px] flex flex-col pt-[25px] md:h-[calc(100vh_-_100px)]">
          <ChatAIList onClick={handleClick} selected={id} />
        </div>
        <div className="flex h-[calc(100vh_-_100px)] flex-1 flex-col pt-6 md:mt-[70px]">
          <ChatWindow onClick={handleClick} selected={id} onClose={() => setId(null)} />
        </div>
      </div>
    </div>
  );
};

export default ChatPageContent;
