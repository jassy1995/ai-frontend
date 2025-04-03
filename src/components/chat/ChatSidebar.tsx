import { Button, Card } from '@heroui/react';
import { TbClock, TbMessageCircle, TbMessagePlus } from 'react-icons/tb';

const ChatSidebar = () => {
  return (
    <Card className="card-shadow flex h-full flex-col items-center !rounded-l-none rounded-r-2xl px-4 py-6">
      <div className="flex flex-col gap-6">
        <Button isIconOnly variant="light">
          <TbMessageCircle size="24" />
        </Button>
        <Button isIconOnly variant="light">
          <TbMessagePlus size="24" />
        </Button>
        <Button isIconOnly variant="light">
          <TbClock size="24" />
        </Button>
      </div>
    </Card>
  );
};

export default ChatSidebar;
