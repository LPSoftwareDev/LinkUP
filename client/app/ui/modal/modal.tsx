'use client';

import { Suspense, useContext, useEffect, useRef, useState } from 'react';
import { useRouter } from 'next/navigation';
import { createPortal } from 'react-dom';
import clsx from 'clsx';
import { RoomContext } from '@/app/lib/room_provider';
import { WebsocketContext } from '@/app/lib/ws_provider';

interface ModalProps {
  children: React.ReactNode;
  className: string;
  onClose?: () => void;
}

export default function Modal({ children, onClose, className }: ModalProps) {
  const router = useRouter();
  const overlayRef = useRef<HTMLDivElement>(null);
  const contentRef = useRef<HTMLDivElement>(null);
  const [mounted, setMounted] = useState(false);
  const roomContext = useContext(RoomContext)
  const { conn, setConn } = useContext(WebsocketContext);

  useEffect(() => {
    setMounted(true);
    return () => setMounted(false);
  }, []);

  useEffect(() => {
    function handleEscape(e: KeyboardEvent) {
      if (e.key === 'Escape') {
        if (onClose) {
          onClose();
        } else {
          router.push('/');
          roomContext?.setCurrentRoomId(null)
          roomContext?.setCurrentRoomName(null)
          setConn(null)
        }
      }
    }

    function handleClickOutside(e: MouseEvent) {
      if (overlayRef.current === e.target) {
        if (onClose) {
          onClose();
        } else {
          router.push('/');
          roomContext?.setCurrentRoomId(null)
          roomContext?.setCurrentRoomName(null)
          setConn(null)
        }
      }
    }

    function handleTab(e: KeyboardEvent) {
      if (e.key === 'Tab' && contentRef.current) {
        const focusableElements = contentRef.current.querySelectorAll(
          'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])'
        );
        const firstElement = focusableElements[0] as HTMLElement;
        const lastElement = focusableElements[focusableElements.length - 1] as HTMLElement;

        if (e.shiftKey && document.activeElement === firstElement) {
          e.preventDefault();
          lastElement?.focus();
        } else if (!e.shiftKey && document.activeElement === lastElement) {
          e.preventDefault();
          firstElement?.focus();
        }
      }
    }

    document.addEventListener('keydown', handleEscape);
    document.addEventListener('keydown', handleTab);
    document.addEventListener('mousedown', handleClickOutside);
    document.body.style.overflow = 'hidden';

    return () => {
      document.removeEventListener('keydown', handleEscape);
      document.removeEventListener('keydown', handleTab);
      document.removeEventListener('mousedown', handleClickOutside);
      document.body.style.overflow = 'unset';
    };
  }, [onClose, router]);

  if (!mounted) {
    return null;
  }

  return createPortal(
    <div
      ref={overlayRef}
      className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-60 backdrop-blur-sm duration-300 animate-in fade-in"
      role="dialog"
      aria-modal="true"
    >
      <div
        ref={contentRef}
        className="relative z-50 overflow-auto"
      >
        <div className={clsx('flex w-64 bg-[#332F4B] rounded-lg p-4', className)}>
          <Suspense fallback={
            <h1>loading</h1>
          }>
            {children}
          </Suspense>
        </div>
      </div>
    </div>,
    document.body
  );
}
