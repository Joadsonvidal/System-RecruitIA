import { useState, useCallback } from "react";

export interface Notification {
  id: string;
  title: string;
  description: string;
  time: string;
  read: boolean;
}

const defaultNotifications: Notification[] = [
  { id: "1", title: "Novo candidato", description: "Bruno Alves foi adicionado ao pipeline", time: "Agora", read: false },
  { id: "2", title: "Entrevista hoje", description: "Juliana Santos às 10:00", time: "Há 1h", read: false },
  { id: "3", title: "Follow-up atrasado", description: "Carlos Oliveira aguarda retorno", time: "Há 3h", read: false },
];

export const useNotifications = () => {
  const [notifications, setNotifications] = useState<Notification[]>(defaultNotifications);

  const unreadCount = notifications.filter((n) => !n.read).length;

  const markAsRead = useCallback((id: string) => {
    setNotifications((prev) => prev.map((n) => (n.id === id ? { ...n, read: true } : n)));
  }, []);

  const markAllRead = useCallback(() => {
    setNotifications((prev) => prev.map((n) => ({ ...n, read: true })));
  }, []);

  const clearAll = useCallback(() => {
    setNotifications([]);
  }, []);

  return { notifications, unreadCount, markAsRead, markAllRead, clearAll };
};
