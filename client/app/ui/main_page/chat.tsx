'use client';

import { API_URL } from '@/constants';
import { useState, useRef, ChangeEvent, KeyboardEvent, FC, useContext, useEffect } from 'react';
import Image from 'next/image';
import { useRouter } from 'next/navigation';
import Message from './message';
import { WebsocketContext } from '@/app/lib/ws_provider';
import { RoomContext } from '@/app/lib/room_provider';

export type MessageType = {
  content: string;
  client_id: string;
  room_id: string;
  username: string;
  type: 'contact' | 'user';
};

const ChatComponent: FC = () => {
  const [chatMessages, setChatMessages] = useState<Array<MessageType>>([]);
  const [inputValue, setInputValue] = useState<string>('');
  const [, setUsers] = useState<Array<{ username: string }>>([]);
  const { conn } = useContext(WebsocketContext);
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const router = useRouter();
  const room = useContext(RoomContext)

  useEffect(() => {
    const userInfo = localStorage.getItem('user_info');
    if (userInfo) {
      const user = JSON.parse(userInfo);
      if (room) {
        if (!conn) {
          return;
        }

        const parsedUrl = new URL(conn.url);

        const params: URLSearchParams = parsedUrl.searchParams;

        const roomId: string | null = params.get("room_id");

        async function getMessages() {
          try {
            const res = await fetch(`${API_URL}/ws/get-messages/${roomId}`, {
              method: 'GET',
              headers: { 'Content-Type': 'application/json' },
            });
            const data = await res.json();
            const processedMessages = data.map((m: MessageType) => ({
              ...m,
              type: user?.username === m.username ? 'user' : 'contact',
            }));
            setChatMessages(processedMessages.reverse());
          } catch (error) {
            console.error(error);
          }
        }
        getMessages();
      }
    }
  }, [room, conn])

  useEffect(() => {
    if (!conn) {
      router.push('/');
      return;
    }

    const parsedUrl = new URL(conn.url);

    const params: URLSearchParams = parsedUrl.searchParams;

    const roomId: string | null = params.get("room_id");

    async function getUsers() {
      try {
        const res = await fetch(`${API_URL}/ws/get-clients/${roomId}`, {
          method: 'GET',
          headers: { 'Content-Type': 'application/json' },
        });
        const data = await res.json();
        setUsers(data);
      } catch (error) {
        console.error(error);
      }
    }
    getUsers();
  }, [conn, router]);

  useEffect(() => {
    if (!conn) {
      router.push('/');
      return;
    }

    const handleMessage = (message: MessageEvent) => {
      const m: MessageType = JSON.parse(message.data);
      const userInfo = localStorage.getItem('user_info');
      if (userInfo) {
        const user = JSON.parse(userInfo);
        console.log(m.username);
        console.log(user.username)

        if (m.content === 'A new user has joined the room') {
          setUsers((prevUsers) => [...prevUsers, { username: m.username }]);
          return;
        }

        if (m.content === 'user left the chat') {
          setUsers((prevUsers) => prevUsers.filter((u) => u.username !== m.username));
          setChatMessages((prevMessages) => [...prevMessages, m]);
          return;
        }

        m.type = user?.username === m.username ? 'user' : 'contact';
        setChatMessages((prevMessages) => [m, ...prevMessages]);
      }
    };

    conn.onmessage = handleMessage;
    conn.onclose = () => setChatMessages([]);
    conn.onerror = () => setChatMessages([]);
    conn.onopen = () => { };

    // Cleanup event handlers on component unmount
    return () => {
      conn.onmessage = null;
      conn.onclose = null;
      conn.onerror = null;
      conn.onopen = null;
    };
  }, [conn, router]);

  // Function to handle sending a message.
  const sendMessage = async () => {
    if (!inputValue) return;
    if (!conn) {
      console.log('WS: No connection in chat');
      return;
    }
    conn.send(inputValue);
    setInputValue('');
  };

  // Handle textarea input and adjust height.
  const handleInputChange = (e: ChangeEvent<HTMLTextAreaElement>) => {
    setInputValue(e.target.value);
    e.target.style.height = 'auto';
    e.target.style.height = `${e.target.scrollHeight}px`;
  };

  // Listen for the Enter key (without Shift) to send a message.
  const handleKeyDown = (e: KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      sendMessage();
    }
  };

  return (
    <div id="main-container" className="flex h-full max-h-[calc(100dvh-4.5rem)] w-full flex-col">
      <div
        id="chat"
        className="flex h-full w-full flex-grow flex-col-reverse overflow-auto rounded-lg bg-[#332F4B] p-2 outline outline-2 outline-[#443F64]"
      >
        {chatMessages.map((msg, index) => (
          <Message key={index} message={msg} />
        ))}
      </div>
      <div className="flex flex-row">
        <textarea
          placeholder="Type your message..."
          id="input-area"
          name="input-area"
          ref={textareaRef}
          className="mt-3 max-h-20 w-full resize-none overflow-y-scroll rounded-lg bg-[#332F4B] p-2 text-gray-50 outline outline-2 outline-[#443F64]"
          rows={1}
          value={inputValue}
          onChange={handleInputChange}
          onKeyDown={handleKeyDown}
        />
        <div className="ml-2 flex h-10 w-10 flex-shrink-0 items-center justify-center self-end">
          <button type="button" className="flex h-8 w-8" onClick={sendMessage}>
            <Image
              src="/send_icon.png"
              width={32}
              height={32}
              alt="Send"
              className="object-scale-down"
            />
          </button>
        </div>
      </div>
    </div>
  );
};

export default ChatComponent;
