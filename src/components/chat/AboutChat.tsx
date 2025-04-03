import PropTypes from 'prop-types';
import { Card, Image } from '@heroui/react';
import Drawer from '@/components/ui/Drawer';
import ChatsList from './ChatsList';

const AboutChat = ({ isOpen, onClose, onClick, selected }) => {
  const handleClose = () => {
    onClose();
  };

  return (
    <Drawer isOpen={isOpen} onClose={handleClose} padding={false}>
      <Card className="overflow-y-auto rounded-md pt-16" shadow="none">
        <div className="flex flex-col items-center">
          <Image
            src="https://www.statisense.co/images/logo-icon-inverted.png"
            alt="profilepic"
            classNames={{
              wrapper: ' object-cover w-[100px] h-[100px]',
              img: 'w-full object-cover',
            }}
            radius="full"
          />
          <div className="mt-8 flex flex-col items-center">
            <p className="overflow-hidden text-ellipsis whitespace-nowrap text-lg">Any Naming</p>
            <p className="my-1 overflow-hidden text-ellipsis whitespace-nowrap opacity-60">Quick description</p>
          </div>
        </div>
      </Card>
      <ChatsList onClick={onClick} selected={selected} />
    </Drawer>
  );
};

AboutChat.propTypes = {
  isOpen: PropTypes.bool.isRequired,
  onClose: PropTypes.func.isRequired,
};

export default AboutChat;
