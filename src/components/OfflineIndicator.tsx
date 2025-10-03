import { useEffect, useState } from 'react';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { WifiOff, Wifi } from 'lucide-react';

export function OfflineIndicator() {
  const [isOnline, setIsOnline] = useState(() => 
    typeof window !== 'undefined' ? navigator.onLine : true
  );
  const [showOnlineMessage, setShowOnlineMessage] = useState(false);
  const [isMounted, setIsMounted] = useState(false);

  useEffect(() => {
    setIsMounted(true);
    
    const handleOnline = () => {
      setIsOnline(true);
      setShowOnlineMessage(true);
      setTimeout(() => setShowOnlineMessage(false), 3000);
    };

    const handleOffline = () => {
      setIsOnline(false);
      setShowOnlineMessage(false);
    };

    if (typeof window !== 'undefined') {
      window.addEventListener('online', handleOnline);
      window.addEventListener('offline', handleOffline);
    }

    return () => {
      if (typeof window !== 'undefined') {
        window.removeEventListener('online', handleOnline);
        window.removeEventListener('offline', handleOffline);
      }
    };
  }, []);

  if (!isMounted || (isOnline && !showOnlineMessage)) {
    return null;
  }

  return (
    <div className="fixed top-4 left-1/2 -translate-x-1/2 z-50 w-full max-w-md px-4">
      <Alert 
        className={`
          shadow-lg border-2 transition-all
          ${isOnline 
            ? 'bg-green-50 border-green-500 text-green-900' 
            : 'bg-amber-50 border-amber-500 text-amber-900'
          }
        `}
      >
        <div className="flex items-center gap-2">
          {isOnline ? (
            <Wifi className="h-4 w-4" />
          ) : (
            <WifiOff className="h-4 w-4" />
          )}
          <AlertDescription className="font-medium">
            {isOnline 
              ? '✓ Je bent weer online!' 
              : 'Geen internetverbinding - Sommige functies zijn beperkt'
            }
          </AlertDescription>
        </div>
      </Alert>
    </div>
  );
}
