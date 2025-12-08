import { useEffect, useRef } from 'react';
import { notificationSoundService } from '@/services/notificationSoundService';

interface GlobalNotificationSoundProps {
  username?: string;
}

export function GlobalNotificationSound({ username }: GlobalNotificationSoundProps) {
  const lastCheckRef = useRef<number>(Date.now());
  const lastOrderCountRef = useRef<number>(0);

  useEffect(() => {
    if (!username) return;

    // Get initial order count
    const savedOrders = localStorage.getItem('sponsor-orders');
    if (savedOrders) {
      const orders = JSON.parse(savedOrders);
      const creatorOrders = orders.filter((o: any) => o.creatorUsername === username);
      lastOrderCountRef.current = creatorOrders.length;
    }

    // Check for new orders periodically
    const checkForNewOrders = () => {
      const savedOrders = localStorage.getItem('sponsor-orders');
      if (!savedOrders) return;

      const orders = JSON.parse(savedOrders);
      const creatorOrders = orders.filter((o: any) => o.creatorUsername === username);
      const pendingOrders = creatorOrders.filter((o: any) => o.status === 'pending');
      
      // Check for new orders by comparing counts and timestamps
      const newOrders = creatorOrders.filter((o: any) => 
        new Date(o.createdAt).getTime() > lastCheckRef.current
      );

      if (newOrders.length > 0) {
        // Play notification sound
        notificationSoundService.play();
        lastCheckRef.current = Date.now();
      }
      
      lastOrderCountRef.current = creatorOrders.length;
    };

    // Check every 2 seconds
    const interval = setInterval(checkForNewOrders, 2000);

    // Also listen for storage events from other tabs
    const handleStorageChange = (e: StorageEvent) => {
      if (e.key === 'sponsor-orders' && e.newValue) {
        const orders = JSON.parse(e.newValue);
        const creatorOrders = orders.filter((o: any) => o.creatorUsername === username);
        
        if (creatorOrders.length > lastOrderCountRef.current) {
          notificationSoundService.play();
          lastOrderCountRef.current = creatorOrders.length;
        }
      }
    };

    window.addEventListener('storage', handleStorageChange);

    return () => {
      clearInterval(interval);
      window.removeEventListener('storage', handleStorageChange);
    };
  }, [username]);

  // This component doesn't render anything visible
  return null;
}
