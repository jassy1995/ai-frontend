import React from 'react';
import { useGetChats } from '@/api/chats';
import { Card, Skeleton } from '@heroui/react';
import { formatDistanceToNowStrict } from 'date-fns';

const ChatHistory = ({ onClick }) => {
  const { data: { chats = [] } = {}, isLoading } = useGetChats();

  return (
    <div>
      {isLoading ? (
        <div className="mt-10 space-y-3">
          <Skeleton className="h-[50px] rounded-2xl" />
          <Skeleton className="h-[50px] rounded-2xl" />
          <Skeleton className="h-[50px] rounded-2xl" />
        </div>
      ) : (
        <>
          {!!chats.length && (
            <>
              <h4 className="mb-6 mt-8 px-2 font-medium">History</h4>
              <div className="space-y-3">
                {chats.map((c) => (
                  <Card
                    key={c._id}
                    isPressable
                    isHoverable
                    onPress={() => onClick(c._id)}
                    className="flex w-full flex-row items-center justify-between rounded-2xl border px-6 py-4 text-left shadow hover:bg-default-100 dark:border-0 dark:bg-default-100/70 dark:shadow-none hover:dark:!bg-default-200"
                  >
                    <span>{c.title}</span>
                    <span className="text-sm opacity-50">{formatDistanceToNowStrict(new Date(c.updatedAt))}</span>
                  </Card>
                ))}
              </div>
            </>
          )}
        </>
      )}
    </div>
  );
};

export default ChatHistory;
