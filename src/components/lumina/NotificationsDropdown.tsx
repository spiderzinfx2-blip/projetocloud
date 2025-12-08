import React, { useState, useEffect, useRef } from 'react';
import { Bell, Package, Check, X, Volume2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { ScrollArea } from '@/components/ui/scroll-area';
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/components/ui/popover';
import { cn } from '@/lib/utils';
import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import { notificationSoundService } from '@/services/notificationSoundService';

interface Notification {
  id: string;
  type: 'new_order' | 'order_paid' | 'general';
  orderCode?: string;
  message: string;
  buyerName?: string;
  createdAt: string;
  read: boolean;
}

interface NotificationsDropdownProps {
  username: string;
}

export function NotificationsDropdown({ username }: NotificationsDropdownProps) {
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [isOpen, setIsOpen] = useState(false);
  const lastCheckRef = useRef<number>(Date.now());

  // Load notifications
  const loadNotifications = () => {
    const saved = localStorage.getItem(`creator_notifications_${username}`);
    if (saved) {
      const parsed: Notification[] = JSON.parse(saved);
      setNotifications(parsed);
      return parsed;
    }
    return [];
  };

  // Check for new notifications periodically
  useEffect(() => {
    loadNotifications();

    const interval = setInterval(() => {
      const currentNotifs = loadNotifications();
      const newUnread = currentNotifs.filter(
        n => !n.read && new Date(n.createdAt).getTime() > lastCheckRef.current
      );
      
      if (newUnread.length > 0) {
        // Play notification sound using global service
        notificationSoundService.play();
        lastCheckRef.current = Date.now();
      }
    }, 3000); // Check every 3 seconds

    return () => clearInterval(interval);
  }, [username]);

  const markAsRead = (id: string) => {
    const updated = notifications.map(n => 
      n.id === id ? { ...n, read: true } : n
    );
    setNotifications(updated);
    localStorage.setItem(`creator_notifications_${username}`, JSON.stringify(updated));
  };

  const markAllAsRead = () => {
    const updated = notifications.map(n => ({ ...n, read: true }));
    setNotifications(updated);
    localStorage.setItem(`creator_notifications_${username}`, JSON.stringify(updated));
  };

  const removeNotification = (id: string) => {
    const updated = notifications.filter(n => n.id !== id);
    setNotifications(updated);
    localStorage.setItem(`creator_notifications_${username}`, JSON.stringify(updated));
  };

  const unreadCount = notifications.filter(n => !n.read).length;

  const getNotificationIcon = (type: string) => {
    switch (type) {
      case 'new_order':
        return <Package className="w-4 h-4 text-primary" />;
      default:
        return <Bell className="w-4 h-4 text-muted-foreground" />;
    }
  };

  return (
    <Popover open={isOpen} onOpenChange={setIsOpen}>
      <PopoverTrigger asChild>
        <Button variant="ghost" size="icon" className="relative">
          <Bell className="w-5 h-5" />
          {unreadCount > 0 && (
            <span className="absolute -top-1 -right-1 w-5 h-5 rounded-full bg-destructive text-destructive-foreground text-xs font-bold flex items-center justify-center animate-pulse">
              {unreadCount > 9 ? '9+' : unreadCount}
            </span>
          )}
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-80 p-0" align="end">
        <div className="flex items-center justify-between p-3 border-b border-border">
          <h4 className="font-semibold text-sm">Notificações</h4>
          {unreadCount > 0 && (
            <Button variant="ghost" size="sm" className="text-xs h-7" onClick={markAllAsRead}>
              <Check className="w-3 h-3 mr-1" />
              Marcar todas como lidas
            </Button>
          )}
        </div>
        
        <ScrollArea className="h-[300px]">
          {notifications.length === 0 ? (
            <div className="p-6 text-center text-muted-foreground">
              <Bell className="w-10 h-10 mx-auto mb-2 opacity-20" />
              <p className="text-sm">Nenhuma notificação</p>
            </div>
          ) : (
            <div className="divide-y divide-border">
              {notifications.map((notification) => (
                <div
                  key={notification.id}
                  className={cn(
                    "p-3 hover:bg-muted/50 transition-colors relative group",
                    !notification.read && "bg-primary/5"
                  )}
                  onClick={() => markAsRead(notification.id)}
                >
                  <div className="flex items-start gap-3">
                    <div className="mt-0.5">
                      {getNotificationIcon(notification.type)}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className={cn(
                        "text-sm",
                        !notification.read && "font-medium"
                      )}>
                        {notification.message}
                      </p>
                      {notification.orderCode && (
                        <Badge variant="outline" className="mt-1 text-xs">
                          {notification.orderCode}
                        </Badge>
                      )}
                      {notification.buyerName && (
                        <p className="text-xs text-muted-foreground mt-1">
                          De: {notification.buyerName}
                        </p>
                      )}
                      <p className="text-xs text-muted-foreground mt-1">
                        {format(new Date(notification.createdAt), "dd/MM 'às' HH:mm", { locale: ptBR })}
                      </p>
                    </div>
                    <button
                      onClick={(e) => { e.stopPropagation(); removeNotification(notification.id); }}
                      className="opacity-0 group-hover:opacity-100 transition-opacity p-1 hover:bg-muted rounded"
                    >
                      <X className="w-3 h-3 text-muted-foreground" />
                    </button>
                  </div>
                  {!notification.read && (
                    <div className="absolute left-1 top-1/2 -translate-y-1/2 w-2 h-2 rounded-full bg-primary" />
                  )}
                </div>
              ))}
            </div>
          )}
        </ScrollArea>
      </PopoverContent>
    </Popover>
  );
}