'use client';

import { useParams, useRouter } from 'next/navigation';
import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import MeetingRoom from '@/components/video/MeetingRoom';
import { Leaf, Users, Video } from 'lucide-react';

export default function MeetingPage() {
  const params = useParams();
  const router = useRouter();
  const roomId = params.roomId as string;
  
  const [isJoining, setIsJoining] = useState(true);
  const [userInfo, setUserInfo] = useState({
    userId: '',
    userName: '',
    userEmail: '',
    isHost: false
  });

  // Initialize user info (in a real app, this would come from authentication)
  useEffect(() => {
    const initUserInfo = () => {
      // Generate a unique user ID
      const userId = `user_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
      
      // For demo purposes, use a default name (in production, this would come from auth)
      const userName = localStorage.getItem('userName') || `Usuario ${Date.now().toString().slice(-4)}`;
      const userEmail = localStorage.getItem('userEmail') || '';
      
      // Check if user is host (first to join or has host parameter)
      const urlParams = new URLSearchParams(window.location.search);
      const isHost = urlParams.get('host') === 'true' || localStorage.getItem(`host_${roomId}`) === 'true';
      
      setUserInfo({
        userId,
        userName,
        userEmail,
        isHost
      });

      // Store host status for this room
      if (isHost) {
        localStorage.setItem(`host_${roomId}`, 'true');
      }

      setIsJoining(false);
    };

    initUserInfo();
  }, [roomId]);

  const handleLeaveRoom = () => {
    // Clean up local storage
    localStorage.removeItem(`host_${roomId}`);
    
    // Navigate back to home
    router.push('/');
  };

  // Loading/joining state
  if (isJoining) {
    return (
      <div className="w-full h-screen flex items-center justify-center bg-background">
        <motion.div
          className="text-center text-white max-w-md"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
        >
          <motion.div
            className="w-20 h-20 border-4 border-sirius-green-vida border-t-transparent rounded-full mx-auto mb-6"
            animate={{ rotate: 360 }}
            transition={{ duration: 2, repeat: Infinity, ease: "linear" }}
          />
          
          <div className="flex items-center justify-center gap-2 mb-4">
            <Leaf className="text-sirius-green-vida" size={24} />
            <h1 className="text-2xl font-semibold">Sirius Video</h1>
          </div>
          
          <h2 className="text-xl mb-2">Uniéndose al ecosistema...</h2>
          <p className="text-white/70 mb-4">Sala: {roomId}</p>
          
          <div className="space-y-2 text-sm text-white/60">
            <div className="flex items-center justify-center gap-2">
              <Video size={16} />
              <span>Preparando cámara y micrófono</span>
            </div>
            <div className="flex items-center justify-center gap-2">
              <Users size={16} />
              <span>Conectando con otros participantes</span>
            </div>
          </div>
        </motion.div>
      </div>
    );
  }

  return (
    <div className="w-full h-screen">
      {/* Meeting Room Component */}
      <MeetingRoom
        roomId={roomId}
        userId={userInfo.userId}
        userName={userInfo.userName}
        userEmail={userInfo.userEmail}
        isHost={userInfo.isHost}
        onLeaveRoom={handleLeaveRoom}
        className="w-full h-full"
      />

      {/* Room Info Overlay (for development/testing) */}
      {process.env.NODE_ENV === 'development' && (
        <motion.div
          className="fixed top-4 left-4 bg-black/60 backdrop-blur rounded-lg p-3 text-white text-xs"
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: 1 }}
        >
          <div className="space-y-1">
            <div><strong>Sala:</strong> {roomId}</div>
            <div><strong>Usuario:</strong> {userInfo.userName}</div>
            <div><strong>ID:</strong> {userInfo.userId}</div>
            <div><strong>Rol:</strong> {userInfo.isHost ? 'Host' : 'Participante'}</div>
          </div>
        </motion.div>
      )}
    </div>
  );
} 