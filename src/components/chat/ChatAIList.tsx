import { useCreateChat, useGetChats } from '@/api/chats.js';
import PropTypes from 'prop-types';
import { Button, Card, cn, Divider, Image, Input, Skeleton } from '@heroui/react';
import React, { useCallback } from 'react';
import { TbInfoCircle, TbSearch, TbSquareRoundedPlus } from 'react-icons/tb';
import { useGetWritersQuery } from '@/api/users';
import { useQueryClient } from '@tanstack/react-query';
import { useToast } from '@/hooks/use-toast';

const ChatAIList = ({ onClick, selected }) => {
  const toast = useToast();
  const qc = useQueryClient();
  const { data: { chats = [] } = {} } = useGetChats();
  const { data: { pages = [] } = {}, isLoading: isWritersLoading } = useGetWritersQuery();

  const writers = pages.map((p) => p.users).flat();
  const { mutateAsync: create } = useCreateChat();

  const handleCreate = useCallback(async () => {
    if (chats.length === 10) return toast.error('You can only have 10 active chats at a time');
    try {
      const res = await create(null);
      onClick(res.data.chat._id);
      await qc.invalidateQueries({ queryKey: ['chats', 'all'] });
    } catch (e) {
      toast.error(e?.response?.data?.message ?? e?.message ?? 'Something went wrong, please try again');
    }
  }, [chats, create, onClick, qc, toast]);

  return (
    <Card className="card-shadow flex-1 overflow-hidden rounded-2xl" shadow="none">
      <div className="custom-scrollbar h-full overflow-y-auto py-6">
        <div className="mb-6 flex items-center justify-between">
          <h3 className="px-8 text-xl font-medium">Chats</h3>
          <div className="mr-5 flex gap-2">
            <Button isIconOnly size="md" variant="light">
              <TbSquareRoundedPlus size="20" />
            </Button>
            <Button isIconOnly size="md" variant="light">
              <TbInfoCircle size="20" />
            </Button>
          </div>
        </div>
        <div className="mb-5 px-8">
          <div className="relative">
            <Input
              type="text"
              name="query"
              id="query"
              size="sm"
              classNames={{ input: 'text-base', base: 'transition-all duration-300', inputWrapper: 'h-11' }}
              startContent={<TbSearch size="24" className="mx-2 opacity-30" />}
              placeholder="Search insights.."
              radius="full"
            />
          </div>
        </div>
        {isWritersLoading ? (
          <div>
            <Skeleton className="py-10"></Skeleton>
            <Divider />
            <Skeleton className="py-10"></Skeleton>
            <Divider />
            <Skeleton className="py-10"></Skeleton>
          </div>
        ) : (
          <>
            {!!writers.length && (
              <>
                <div
                  onClick={() => handleCreate()}
                  className={cn(
                    'flex w-full cursor-pointer items-center space-x-3 border-b border-b-black/5 px-8 py-4 last-of-type:border-b-0 dark:border-b-white/5'
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
                    <p className="overflow-hidden text-ellipsis whitespace-nowrap">Bambi</p>
                    <p className="overflow-hidden text-ellipsis whitespace-nowrap text-black/60 dark:text-white/60">
                      Quick description
                    </p>
                  </div>
                </div>
                {writers.map((writer) => (
                  <div
                    key={writer._id}
                    onClick={() => handleCreate()}
                    className={cn(
                      'flex w-full cursor-pointer items-center space-x-3 border-b border-b-black/5 px-8 py-4 last-of-type:border-b-0 dark:border-b-white/5',
                      selected === writer._id ? 'bg-default-100' : 'hover:bg-default-100'
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
                      <p className="overflow-hidden text-ellipsis whitespace-nowrap">
                        {writer.firstName} {writer.lastName}
                      </p>
                      <p className="overflow-hidden text-ellipsis whitespace-nowrap text-black/60 dark:text-white/60">
                        {writer.bio}
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

ChatAIList.propTypes = {
  selected: PropTypes.string,
  onClick: PropTypes.func.isRequired,
};

export default ChatAIList;
