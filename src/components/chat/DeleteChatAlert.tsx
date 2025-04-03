import { useDeleteChat } from '@/api/chats.js';
import { useToast } from '@/hooks/use-toast.jsx';
import { useQueryClient } from '@tanstack/react-query';
import PropTypes from 'prop-types';
import { Button, Card } from '@heroui/react';
import { AnimatePresence, motion } from 'motion/react';

const DeleteChatAlert = ({ isOpen, onClose, onDone, chat }) => {
  const toast = useToast();
  const qc = useQueryClient();
  const { mutateAsync: deleteChat, isPending: isDeleteLoading } = useDeleteChat();

  let query = qc.getQueryState(['chats', 'all']);
  const isFetching = query?.isInvalidated && query?.fetchStatus === 'fetching';

  const handleDelete = async () => {
    try {
      await deleteChat(chat._id);
      await qc.invalidateQueries({ queryKey: ['chats', 'all'] });
      await qc.removeQueries({ queryKey: ['chats', chat._id] });
      onClose();
      onDone();
    } catch (e) {
      toast.error(e?.response?.data?.message ?? 'Something went wrong, please try again');
    }
  };

  return (
    <>
      <AnimatePresence mode="popLayout">
        {!!isOpen && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            className="absolute left-0 top-20 z-[1] mt-6 flex w-full justify-center px-8"
          >
            <Card className="rounded-2xl bg-default-100 shadow">
              <h3 className="flex h-auto flex-col gap-1 px-10 pb-2 pt-6">Delete {chat.title}</h3>
              <p className="px-10 opacity-80">
                Are you sure you want to continue? All messages in this chat will be lost forever
              </p>
              <div className="mt-6 space-x-2 px-10 pb-6">
                <Button
                  color="danger"
                  variant="faded"
                  onPress={handleDelete}
                  isLoading={isDeleteLoading || isFetching}
                  className="text-base"
                >
                  Yes delete
                </Button>
                <Button
                  color="default"
                  variant="faded"
                  onPress={onClose}
                  isDisabled={isDeleteLoading || isFetching}
                  className="text-base"
                >
                  Cancel
                </Button>
              </div>
            </Card>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
};

DeleteChatAlert.propTypes = {
  isOpen: PropTypes.bool.isRequired,
  onClose: PropTypes.func.isRequired,
  onDone: PropTypes.func.isRequired,
  chat: PropTypes.object.isRequired,
};

export default DeleteChatAlert;
