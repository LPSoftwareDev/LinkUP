'use client'

import React from 'react';
import { MessageType } from './chat';

interface MessageBubbleProps {
  message: MessageType;
}

const Message: React.FC<MessageBubbleProps> = ({ message }) => {
  const isUser = message.type === 'user';

  const containerClass = isUser
    ? 'flex w-full h-fit flex-none flex-col items-end my-1'
    : 'flex w-full h-fit flex-none flex-col items-start my-1';

  const bubbleClass = isUser
    ? 'w-fit max-w-[80%] h-fit bg-[#3476AD] rounded-2xl px-2 py-1'
    : 'w-fit max-w-[80%] h-fit bg-[#443F64] rounded-2xl px-2 py-1';

  return (
    <div className={containerClass}>
      {!isUser && message.username && (
        <p className="text-md text-gray-400 mb-1 mx-1">
          {message.username}
        </p>
      )}
      <div className={bubbleClass}>
        <p className="text-lg text-gray-50 break-words whitespace-pre-wrap overflow-wrap-anywhere">
          {message.content}
        </p>
      </div>
    </div>
  );
};

export default Message;
