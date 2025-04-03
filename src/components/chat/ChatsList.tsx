import { useGetChats } from '@/api/chats.js';
import PropTypes from 'prop-types';
import { Card, cn, Image, Input, Skeleton } from '@heroui/react';
import React from 'react';
import { TbSearch } from 'react-icons/tb';

const ChatsList = ({ onClick, selected }) => {
  const { data: { chats = [] } = {}, isLoading: isChatsLoading } = useGetChats();

  return (
    <Card className="flex-1 overflow-hidden rounded-none" shadow="none">
      <div className="custom-scrollbar h-full overflow-y-auto py-6">
        <h3 className="mb-6 px-8 text-xl font-medium">Chats</h3>
        <div className="mb-5 px-8">
          <div className="relative">
            <Input
              type="text"
              name="query"
              id="query"
              size="sm"
              classNames={{ input: 'text-base', base: 'transition-all duration-300', inputWrapper: 'h-11' }}
              startContent={<TbSearch size="24" className="mx-2 opacity-30" />}
              placeholder="Search chats.."
              radius="full"
            />
          </div>
        </div>
        {isChatsLoading ? (
          <div className="space-y-4">
            <Skeleton className="mx-4 my-1 py-6"></Skeleton>
            <Skeleton className="mx-4 my-1 py-6"></Skeleton>
            <Skeleton className="mx-4 my-1 py-6"></Skeleton>
          </div>
        ) : (
          <>
            {!!chats.length && (
              <>
                {chats.map((chat) => (
                  <div
                    key={chat._id}
                    onClick={() => onClick(chat._id)}
                    className={cn(
                      'flex w-full cursor-pointer items-center space-x-3 border-b border-b-black/5 px-8 py-4 last-of-type:border-b-0 dark:border-b-white/5',
                      selected === chat._id ? 'bg-default-100' : 'hover:bg-default-100'
                    )}
                  >
                    <Image
                      src="https://www.statisense.co/images/logo-icon-inverted.png"
                      alt="profilepic"
                      width="36px"
                      height="36px"
                      radius="full"
                    />
                    <div className="flex flex-col">
                      <p className="overflow-hidden text-ellipsis whitespace-nowrap">{chat.title}</p>
                      <p className="overflow-hidden text-ellipsis whitespace-nowrap text-black/60 dark:text-white/60">
                        Quick description
                      </p>
                    </div>
                  </div>
                ))}
              </>
            )}
          </>
        )}
      </div>
    </Card>
  );
};

ChatsList.propTypes = {
  selected: PropTypes.string,
  onClick: PropTypes.func.isRequired,
};

export default ChatsList;
