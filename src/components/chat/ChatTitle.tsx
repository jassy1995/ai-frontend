import { useEffect, useState } from 'react';
import { useQueryClient } from '@tanstack/react-query';
import { useUpdateChat } from '@/api/chats.js';
import { useToast } from '@/hooks/use-toast.jsx';
import PropTypes from 'prop-types';
import { Button, Input } from '@heroui/react';
import { TbCheck, TbPencilMinus, TbX } from 'react-icons/tb';

const ChatTitle = ({ chat }) => {
  const toast = useToast();
  const qc = useQueryClient();
  const [editing, setEditing] = useState(false);
  const [title, setTitle] = useState(chat.title || '');
  const { mutateAsync: update, isPending: isUpdateLoading } = useUpdateChat();

  useEffect(() => {
    setTitle(chat.title);
  }, [chat]);

  useEffect(() => setEditing(false), [chat.title]);

  const handleUpdate = async () => {
    if (!title) return;
    try {
      await update({ id: chat._id, data: { title } });
      setEditing(false);
      await Promise.all([
        qc.invalidateQueries({
          queryKey: ['chats', chat._id],
        }),
        qc.invalidateQueries({ queryKey: ['chats', 'all'] }),
      ]);
    } catch (e) {
      toast.error(e?.response?.data?.message ?? e?.message ?? 'Something went wrong, please try again');
    }
  };

  return (
    <>
      {editing ? (
        <div className="flex items-center space-x-2 py-1">
          <Input
            type="text"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            maxLength="32"
            radius="full"
            size="sm"
            classNames={{ input: 'px-2 pt-0.5 text-base', base: 'w-[160px] h-auto', inputWrapper: 'h-auto' }}
          />
          <Button onPress={() => setEditing(false)} isIconOnly variant="flat" size="sm" color="danger" radius="full">
            <TbX size="20" />
          </Button>
          <Button
            onPress={handleUpdate}
            isLoading={isUpdateLoading}
            leftIcon={<TbCheck size="20" />}
            variant="solid"
            size="sm"
            color="success"
            className="text-base"
            radius="full"
          >
            Save
          </Button>
        </div>
      ) : (
        <div className="flex items-center space-x-2 pl-4">
          <h2 className="whitespace-nowrap">{chat.title}</h2>
          <Button onPress={() => setEditing(true)} isIconOnly radius="full" variant="light" size="sm" color="default">
            <TbPencilMinus size="18" />
          </Button>
        </div>
      )}
    </>
  );
};

ChatTitle.propTypes = {
  chat: PropTypes.object.isRequired,
};

export default ChatTitle;
