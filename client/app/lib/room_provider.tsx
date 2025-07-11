'use client';

import { createContext, useState, ReactNode } from 'react';

interface RoomContextType {
  currentRoomId: string | null;
  setCurrentRoomId: (id: string | null) => void;
  currentRoomName: string | null;
  setCurrentRoomName: (name: string | null) => void;
}

export const RoomContext = createContext<RoomContextType | undefined>(undefined);

export function RoomProvider({ children }: { children: ReactNode }) {
  const [currentRoomId, setCurrentRoomId] = useState<string | null>(null);
  const [currentRoomName, setCurrentRoomName] = useState<string | null>(null);

  return (
    <RoomContext.Provider value={{ currentRoomId, setCurrentRoomId, currentRoomName, setCurrentRoomName, }}>
      {children}
    </RoomContext.Provider>
  );
}
