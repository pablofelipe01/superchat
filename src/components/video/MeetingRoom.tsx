'use client';

import React, { useState, useEffect, useCallback, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import VideoGrid from './VideoGrid';
import VideoControls from './VideoControls';
import { ParticipantData } from './ParticipantHex';
import { useAgora } from '@/lib/agora/hooks/useAgora';
import type { SiriusRemoteUser } from '@/lib/agora/types';

interface MeetingRoomProps {
  roomId: string;
  userId: string;
  userName: string;
  userEmail?: string;
  isHost?: boolean;
  onLeaveRoom?: () => void;
  className?: string;
}

interface MeetingState {
  isJoined: boolean;
  isMuted: boolean;
  isVideoEnabled: boolean;
  isScreenSharing: boolean;
  isConnected: boolean;
  connectionQuality: 'excellent' | 'good' | 'fair' | 'poor';
}

export default function MeetingRoom({
  roomId,
  userId,
  userName,
  userEmail,
  isHost = false,
  onLeaveRoom,
  className = ''
}: MeetingRoomProps) {
  // Meeting state
  const [meetingState, setMeetingState] = useState<MeetingState>({
    isJoined: false,
    isMuted: false,
    isVideoEnabled: true,
    isScreenSharing: false,
    isConnected: false,
    connectionQuality: 'excellent'
  });

  const [participants, setParticipants] = useState<ParticipantData[]>([]);
  const [activeParticipantId, setActiveParticipantId] = useState<string>('');
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [showSettings, setShowSettings] = useState(false);
  const [showChat, setShowChat] = useState(false);
  const [showParticipants, setShowParticipants] = useState(false);

  // Agora integration with real hook
  const {
    client,
    isClientReady,
    localVideoTrack,
    localAudioTrack,
    localScreenTrack,
    remoteUsers,
    connectionState,
    isConnected,
    isScreenSharing,
    joinChannel,
    leaveChannel,
    toggleAudio,
    toggleVideo,
    startScreenShare,
    stopScreenShare,
    error: agoraError
  } = useAgora();

  // Initialize meeting
  useEffect(() => {
    // Wait for Agora client to be ready
    if (!isClientReady) {
      return;
    }

    const initializeMeeting = async () => {
      try {
        setIsLoading(true);
        setError(null);

        // Double check client is ready before proceeding
        if (!isClientReady) {
          throw new Error('Client not ready');
        }

        // 🧪 TEMPORARY: Using working token for development
        // TODO: Replace with proper token generation once credentials are configured
        const token = "007eJxTYHgmVbXQ7tl0zfCv2lruHAcTjfb3Xn/5rT3R1rHr31kTkQQFhuTktETTNHOTNCA0MU0ysUxOMzU3MjVONDZIMU+0NFr3riyjIZCRYYXVTmZGBggE8XkYSlKLS3TSMxLz8lJzGBgAjD4jdA==";
        
        // 🚀 WORKING: No token needed in testing mode!
        console.log('🚀 Using Agora in testing mode (no token required)');
        
        // Join the room (no token needed in testing mode)
        await joinChannel(roomId, null, userId);
        
        setMeetingState(prev => ({
          ...prev,
          isJoined: true,
          isConnected: true
        }));

        // Add local user to participants
        const localUser: ParticipantData = {
          id: userId,
          name: userName,
          email: userEmail,
          isLocalUser: true,
          isMuted: meetingState.isMuted,
          isVideoEnabled: meetingState.isVideoEnabled,
          isSpeaking: false,
          connectionQuality: meetingState.connectionQuality,
          role: isHost ? 'host' : 'participant',
          joinedAt: new Date(),
          videoTrack: localVideoTrack || undefined,
          audioTrack: localAudioTrack || undefined
        };

        setParticipants([localUser]);
        setActiveParticipantId(userId);

      } catch (err) {
        console.error('Failed to initialize meeting:', err);
        setError(err instanceof Error ? err.message : 'Error desconocido');
      } finally {
        setIsLoading(false);
      }
    };

    initializeMeeting();

    // Cleanup on unmount
    return () => {
      if (isConnected) {
        leaveChannel();
      }
    };
  }, [roomId, userId, userName, userEmail, isHost, joinChannel, isClientReady]);

  // Handle Agora errors
  useEffect(() => {
    if (agoraError) {
      setError(agoraError.message);
    }
  }, [agoraError]);

  // Update meeting state based on connection
  useEffect(() => {
    setMeetingState(prev => ({
      ...prev,
      isConnected: isConnected,
      isMuted: localAudioTrack ? !localAudioTrack.enabled : true,
      isVideoEnabled: localVideoTrack ? localVideoTrack.enabled : false,
      isScreenSharing: isScreenSharing
    }));
  }, [isConnected, localAudioTrack, localVideoTrack, isScreenSharing]);

  // Update local participant when tracks change
  useEffect(() => {
    console.log('🔄 Updating local participant tracks:', { 
      hasAudio: !!localAudioTrack, 
      hasVideo: !!localVideoTrack,
      audioEnabled: localAudioTrack?.enabled,
      videoEnabled: localVideoTrack?.enabled
    });
    
    setParticipants(prev => 
      prev.map(p => 
        p.isLocalUser 
          ? { 
              ...p, 
              isMuted: localAudioTrack ? !localAudioTrack.enabled : true,
              isVideoEnabled: localVideoTrack ? localVideoTrack.enabled : false,
              videoTrack: localVideoTrack || undefined,
              audioTrack: localAudioTrack || undefined
            } 
          : p
      )
    );
  }, [localAudioTrack, localVideoTrack]);

  // Update participants from remote users  
  useEffect(() => {
    const remoteParticipants: ParticipantData[] = remoteUsers.map((user: SiriusRemoteUser) => ({
      id: user.uid.toString(),
      name: `Usuario ${user.uid}`, // This would come from user database
      isLocalUser: false,
      isMuted: !user.audioTrack,
      isVideoEnabled: !!user.videoTrack,
      isSpeaking: false, // This would come from voice activity detection
      connectionQuality: 'good', // This would come from connection stats
      role: 'participant',
      joinedAt: new Date(),
      videoTrack: user.videoTrack, // Pass the actual video track
      audioTrack: user.audioTrack  // Pass the actual audio track
    }));

    // Combine local user with remote participants
    setParticipants(prev => {
      const localUser = prev.find(p => p.isLocalUser);
      return localUser ? [localUser, ...remoteParticipants] : remoteParticipants;
    });
  }, [remoteUsers]);

  // Event handlers
  const handleToggleMute = useCallback(async () => {
    try {
      await toggleAudio();
      setMeetingState(prev => ({ ...prev, isMuted: !prev.isMuted }));
      
      // Update local participant
      setParticipants(prev => 
        prev.map(p => 
          p.isLocalUser ? { ...p, isMuted: !p.isMuted } : p
        )
      );
    } catch (err) {
      console.error('Failed to toggle mute:', err);
    }
  }, [toggleAudio]);

  const handleToggleVideo = useCallback(async () => {
    try {
      await toggleVideo();
      setMeetingState(prev => ({ ...prev, isVideoEnabled: !prev.isVideoEnabled }));
      
      // Update local participant
      setParticipants(prev => 
        prev.map(p => 
          p.isLocalUser ? { ...p, isVideoEnabled: !p.isVideoEnabled } : p
        )
      );
    } catch (err) {
      console.error('Failed to toggle video:', err);
    }
  }, [toggleVideo]);

  const handleToggleScreenShare = useCallback(async () => {
    try {
      if (isScreenSharing) {
        await stopScreenShare();
      } else {
        await startScreenShare();
      }
      setMeetingState(prev => ({ ...prev, isScreenSharing: !prev.isScreenSharing }));
    } catch (err) {
      console.error('Failed to toggle screen share:', err);
    }
  }, [isScreenSharing, startScreenShare, stopScreenShare]);

  const handleEndCall = useCallback(async () => {
    try {
      await leaveChannel();
      onLeaveRoom?.();
    } catch (err) {
      console.error('Failed to leave room:', err);
      // Force leave anyway
      onLeaveRoom?.();
    }
  }, [leaveChannel, onLeaveRoom]);

  const handleParticipantClick = useCallback((participant: ParticipantData) => {
    setActiveParticipantId(participant.id);
  }, []);

  const handleToggleFullscreen = useCallback(() => {
    if (document.fullscreenElement) {
      document.exitFullscreen();
    } else {
      document.documentElement.requestFullscreen();
    }
  }, []);

  // Keyboard shortcuts
  useEffect(() => {
    const handleKeyPress = (event: KeyboardEvent) => {
      // Only handle shortcuts when not typing in input fields
      if (event.target instanceof HTMLInputElement || event.target instanceof HTMLTextAreaElement) {
        return;
      }

      switch (event.key.toLowerCase()) {
        case ' ':
          event.preventDefault();
          handleToggleMute();
          break;
        case 'v':
          event.preventDefault();
          handleToggleVideo();
          break;
        case 's':
          event.preventDefault();
          handleToggleScreenShare();
          break;
        case 'c':
          event.preventDefault();
          setShowChat(!showChat);
          break;
        case 'p':
          event.preventDefault();
          setShowParticipants(!showParticipants);
          break;
        case 'escape':
          if (document.fullscreenElement) {
            document.exitFullscreen();
          }
          break;
      }
    };

    window.addEventListener('keydown', handleKeyPress);
    return () => window.removeEventListener('keydown', handleKeyPress);
  }, [handleToggleMute, handleToggleVideo, handleToggleScreenShare, showChat, showParticipants]);

  // Loading state
  if (isLoading) {
    return (
      <div className={`w-full h-screen flex items-center justify-center bg-background ${className}`}>
        <motion.div
          className="text-center text-white"
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.5 }}
        >
          <motion.div
            className="w-20 h-20 border-4 border-sirius-green-vida border-t-transparent rounded-full mx-auto mb-6"
            animate={{ rotate: 360 }}
            transition={{ duration: 2, repeat: Infinity, ease: "linear" }}
          />
          <h2 className="text-2xl font-semibold mb-2">Conectando al ecosistema...</h2>
          <p className="text-white/70">Preparando tu espacio natural para la videollamada</p>
        </motion.div>
      </div>
    );
  }

  // Error state
  if (error) {
    return (
      <div className={`w-full h-screen flex items-center justify-center bg-background ${className}`}>
        <motion.div
          className="text-center text-white max-w-md"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
        >
          <div className="w-16 h-16 bg-red-500/20 rounded-full flex items-center justify-center mx-auto mb-4">
            <span className="text-2xl">🌿</span>
          </div>
          <h2 className="text-xl font-semibold mb-2">Error de conexión</h2>
          <p className="text-white/70 mb-6">{error}</p>
          <div className="flex gap-3 flex-wrap justify-center">
            <button
              onClick={async () => {
                try {
                  await navigator.mediaDevices.getUserMedia({ video: true, audio: true });
                  console.log('✅ Permissions granted manually');
                  window.location.reload();
                } catch (err) {
                  console.error('❌ Permission denied:', err);
                  alert('Por favor permite el acceso a tu cámara y micrófono en la configuración del navegador');
                }
              }}
              className="bg-sirius-blue-primary hover:bg-sirius-blue-primary/80 text-white px-4 py-2 rounded-full transition-colors text-sm"
            >
              Permitir Cámara
            </button>
            <button
              onClick={() => {
                console.log('🔄 Manual retry...');
                setError(null);
                setIsLoading(true);
                window.location.reload();
              }}
              className="bg-sirius-green-vida hover:bg-sirius-green-vida/80 text-white px-4 py-2 rounded-full transition-colors text-sm"
            >
              Reintentar
            </button>
            <button
              onClick={() => window.location.reload()}
              className="bg-gray-600 hover:bg-gray-700 text-white px-4 py-2 rounded-full transition-colors text-sm"
            >
              Recargar Página
            </button>
          </div>
        </motion.div>
      </div>
    );
  }

  return (
    <div className={`relative w-full h-screen bg-background overflow-hidden ${className}`}>
      {/* Background Effects */}
      <div className="absolute inset-0 pointer-events-none">
        <div className="absolute inset-0 bg-gradient-to-br from-sirius-blue-primary/5 via-transparent to-sirius-green-vida/5" />
        <motion.div
          className="absolute inset-0 opacity-20"
          animate={{
            backgroundPosition: ['0% 0%', '100% 100%'],
          }}
          transition={{
            duration: 20,
            repeat: Infinity,
            repeatType: 'reverse',
            ease: 'linear'
          }}
          style={{
            backgroundImage: 'radial-gradient(circle at 25% 25%, rgba(102,176,50,0.1) 0%, transparent 50%), radial-gradient(circle at 75% 75%, rgba(0,102,204,0.1) 0%, transparent 50%)',
            backgroundSize: '100% 100%'
          }}
        />
      </div>

      {/* Main Video Grid */}
      <motion.div
        className="absolute inset-0"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 1 }}
      >
        <VideoGrid
          participants={participants}
          localUserId={userId}
          activeParticipantId={activeParticipantId}
          onParticipantClick={handleParticipantClick}
          onToggleMute={handleToggleMute}
          onToggleVideo={handleToggleVideo}
          className="w-full h-full"
        />
      </motion.div>

      {/* Video Controls */}
      <VideoControls
        isMuted={meetingState.isMuted}
        isVideoEnabled={meetingState.isVideoEnabled}
        isScreenSharing={meetingState.isScreenSharing}
        isConnected={meetingState.isConnected}
        participantCount={participants.length}
        onToggleMute={handleToggleMute}
        onToggleVideo={handleToggleVideo}
        onToggleScreenShare={handleToggleScreenShare}
        onEndCall={handleEndCall}
        onOpenSettings={() => setShowSettings(true)}
        onOpenChat={() => setShowChat(true)}
        onOpenParticipants={() => setShowParticipants(true)}
        onToggleFullscreen={handleToggleFullscreen}
      />

      {/* Meeting Info Overlay */}
      <motion.div
        className="absolute top-4 right-4 bg-black/40 backdrop-blur rounded-lg px-4 py-2 text-white"
        initial={{ opacity: 0, x: 20 }}
        animate={{ opacity: 1, x: 0 }}
        transition={{ delay: 0.5 }}
      >
        <div className="text-sm font-medium">Sala: {roomId}</div>
        <div className="text-xs text-white/70">
          {meetingState.connectionQuality === 'excellent' && '🟢 Excelente'}
          {meetingState.connectionQuality === 'good' && '🟡 Buena'}
          {meetingState.connectionQuality === 'fair' && '🟠 Regular'}
          {meetingState.connectionQuality === 'poor' && '🔴 Mala'}
        </div>
      </motion.div>

      {/* Chat Panel */}
      <AnimatePresence>
        {showChat && (
          <motion.div
            className="absolute right-4 top-1/2 transform -translate-y-1/2 w-80 h-2/3 bg-black/80 backdrop-blur-xl rounded-xl border border-white/20"
            initial={{ opacity: 0, x: 400 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: 400 }}
            transition={{ duration: 0.3 }}
          >
            <div className="p-4 border-b border-white/20">
              <h3 className="text-white font-semibold">Chat Grupal</h3>
              <button
                onClick={() => setShowChat(false)}
                className="absolute top-4 right-4 text-white/50 hover:text-white"
              >
                ✕
              </button>
            </div>
            <div className="flex-1 p-4 text-white/70">
              <p className="text-center text-sm">Chat próximamente...</p>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Participants Panel */}
      <AnimatePresence>
        {showParticipants && (
          <motion.div
            className="absolute left-4 top-1/2 transform -translate-y-1/2 w-80 h-2/3 bg-black/80 backdrop-blur-xl rounded-xl border border-white/20"
            initial={{ opacity: 0, x: -400 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -400 }}
            transition={{ duration: 0.3 }}
          >
            <div className="p-4 border-b border-white/20">
              <h3 className="text-white font-semibold">Participantes ({participants.length})</h3>
              <button
                onClick={() => setShowParticipants(false)}
                className="absolute top-4 right-4 text-white/50 hover:text-white"
              >
                ✕
              </button>
            </div>
            <div className="flex-1 p-4 space-y-2 overflow-y-auto">
              {participants.map(participant => (
                <div key={participant.id} className="flex items-center gap-3 p-2 rounded-lg bg-white/5">
                  <div className="w-8 h-8 rounded-full bg-sirius-green-vida/60 flex items-center justify-center text-white text-sm font-semibold">
                    {participant.name.charAt(0).toUpperCase()}
                  </div>
                  <div className="flex-1">
                    <div className="text-white text-sm">{participant.name}</div>
                    <div className="text-white/50 text-xs">{participant.role}</div>
                  </div>
                  {participant.isLocalUser && (
                    <span className="text-xs text-sirius-green-vida">Tú</span>
                  )}
                </div>
              ))}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
} 