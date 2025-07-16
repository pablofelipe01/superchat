'use client';

import React, { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Mic, MicOff, Video, VideoOff, Volume2, VolumeX, Leaf, Wifi, WifiOff } from 'lucide-react';
import type { IRemoteVideoTrack, IRemoteAudioTrack, ILocalVideoTrack, ILocalAudioTrack } from 'agora-rtc-sdk-ng';

export interface ParticipantData {
  id: string;
  name: string;
  email?: string;
  isLocalUser?: boolean;
  isMuted?: boolean;
  isVideoEnabled?: boolean;
  isSpeaking?: boolean;
  connectionQuality?: 'excellent' | 'good' | 'fair' | 'poor';
  avatarUrl?: string;
  role?: 'host' | 'moderator' | 'participant';
  joinedAt?: Date;
  videoTrack?: IRemoteVideoTrack | ILocalVideoTrack; // Agora video track
  audioTrack?: IRemoteAudioTrack | ILocalAudioTrack; // Agora audio track
}

interface ParticipantHexProps {
  participant: ParticipantData;
  videoRef?: React.RefObject<HTMLVideoElement>;
  size?: 'small' | 'medium' | 'large';
  isActive?: boolean;
  onToggleMute?: () => void;
  onToggleVideo?: () => void;
  onParticipantClick?: (participant: ParticipantData) => void;
  className?: string;
}

export default function ParticipantHex({
  participant,
  videoRef,
  size = 'medium',
  isActive = false,
  onToggleMute,
  onToggleVideo,
  onParticipantClick,
  className = ''
}: ParticipantHexProps) {
  const [isHovered, setIsHovered] = useState(false);
  const [showControls, setShowControls] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  // Simulate loading state
  useEffect(() => {
    const timer = setTimeout(() => setIsLoading(false), 1000);
    return () => clearTimeout(timer);
  }, []);

  // Size configurations
  const sizeConfig = {
    small: {
      width: 120,
      height: 104,
      fontSize: 'text-xs',
      iconSize: 12
    },
    medium: {
      width: 180,
      height: 156,
      fontSize: 'text-sm',
      iconSize: 16
    },
    large: {
      width: 240,
      height: 208,
      fontSize: 'text-base',
      iconSize: 20
    }
  };

  const config = sizeConfig[size];

  // Connection quality colors
  const qualityColors = {
    excellent: 'text-green-400',
    good: 'text-sirius-green-vida',
    fair: 'text-yellow-400',
    poor: 'text-red-400'
  };

  // Role colors
  const roleColors = {
    host: 'border-yellow-400/60',
    moderator: 'border-sirius-blue-light/60',
    participant: 'border-sirius-green-vida/40'
  };

  const handleClick = () => {
    onParticipantClick?.(participant);
  };

  return (
    <motion.div
      className={`relative group cursor-pointer ${className}`}
      style={{ width: config.width, height: config.height }}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      onClick={handleClick}
      initial={{ scale: 0, opacity: 0, rotate: 180 }}
      animate={{ 
        scale: 1, 
        opacity: 1, 
        rotate: 0,
        y: isActive ? -8 : 0
      }}
      exit={{ scale: 0, opacity: 0, rotate: -180 }}
      transition={{ 
        type: 'spring', 
        stiffness: 260, 
        damping: 20,
        duration: 0.6
      }}
      whileHover={{ 
        scale: 1.05, 
        y: -4,
        transition: { duration: 0.3 }
      }}
      whileTap={{ scale: 0.95 }}
    >
      {/* Hexagon Container with Natural Border */}
      <div 
        className={`
          relative w-full h-full overflow-hidden
          ${roleColors[participant.role || 'participant']}
          ${isActive ? 'border-4' : 'border-2'}
          ${participant.isSpeaking ? 'shadow-lg shadow-sirius-green-vida/30' : 'shadow-md shadow-black/20'}
          transition-all duration-300
        `}
        style={{
          clipPath: 'polygon(25% 0%, 75% 0%, 100% 50%, 75% 100%, 25% 100%, 0% 50%)',
          background: participant.isVideoEnabled 
            ? 'transparent' 
            : 'linear-gradient(135deg, rgba(10, 26, 10, 0.9) 0%, rgba(74, 93, 35, 0.6) 100%)'
        }}
      >
        {/* Video Stream or Avatar */}
        <div className="absolute inset-0">
          {participant.isVideoEnabled && participant.videoTrack ? (
            <div className="relative w-full h-full">
              <div
                ref={(ref) => {
                  if (ref && participant.videoTrack) {
                    console.log('🎥 Playing video for participant:', participant.id, participant.videoTrack);
                    // Play the video track in this div
                    participant.videoTrack.play(ref);
                  } else {
                    console.log('❌ No video track or ref for participant:', participant.id, { ref: !!ref, track: !!participant.videoTrack });
                  }
                }}
                className="w-full h-full object-cover"
                style={{
                  clipPath: 'polygon(25% 0%, 75% 0%, 100% 50%, 75% 100%, 25% 100%, 0% 50%)'
                }}
              />
              {/* Video Loading Overlay */}
              <AnimatePresence>
                {isLoading && (
                  <motion.div
                    className="absolute inset-0 bg-black/50 flex items-center justify-center"
                    initial={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    transition={{ duration: 0.5 }}
                  >
                    <div className="animate-spin w-6 h-6 border-2 border-sirius-green-vida border-t-transparent rounded-full" />
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          ) : (
            <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-sirius-blue-primary/20 to-sirius-green-vida/20">
              {participant.avatarUrl ? (
                <img
                  src={participant.avatarUrl}
                  alt={participant.name}
                  className="w-1/2 h-1/2 rounded-full object-cover border-2 border-white/30"
                />
              ) : (
                <div className="w-1/2 h-1/2 rounded-full bg-sirius-green-vida/60 flex items-center justify-center text-white font-semibold text-xl">
                  {participant.name.charAt(0).toUpperCase()}
                </div>
              )}
            </div>
          )}
        </div>

        {/* Organic Border Animation */}
        <AnimatePresence>
          {participant.isSpeaking && (
            <motion.div
              className="absolute inset-0 pointer-events-none"
              style={{
                clipPath: 'polygon(25% 0%, 75% 0%, 100% 50%, 75% 100%, 25% 100%, 0% 50%)',
              }}
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
            >
              <div className="w-full h-full border-4 border-sirius-green-vida/60 animate-pulse" 
                   style={{
                     clipPath: 'polygon(25% 0%, 75% 0%, 100% 50%, 75% 100%, 25% 100%, 0% 50%)',
                     filter: 'drop-shadow(0 0 8px rgba(102, 176, 50, 0.4))'
                   }} 
              />
            </motion.div>
          )}
        </AnimatePresence>

        {/* Connection Quality Indicator */}
        <div className="absolute top-2 right-2 flex items-center gap-1">
          {participant.connectionQuality && (
            <div className={`${qualityColors[participant.connectionQuality]} opacity-80`}>
              {participant.connectionQuality === 'poor' ? (
                <WifiOff size={config.iconSize} />
              ) : (
                <Wifi size={config.iconSize} />
              )}
            </div>
          )}
        </div>

        {/* Status Indicators */}
        <div className="absolute bottom-2 left-2 flex items-center gap-1">
          {!participant.isMuted ? (
            <div className="bg-black/50 backdrop-blur rounded-full p-1">
              <Mic size={config.iconSize} className="text-white" />
            </div>
          ) : (
            <div className="bg-red-500/80 backdrop-blur rounded-full p-1">
              <MicOff size={config.iconSize} className="text-white" />
            </div>
          )}
          
          {!participant.isVideoEnabled && (
            <div className="bg-red-500/80 backdrop-blur rounded-full p-1">
              <VideoOff size={config.iconSize} className="text-white" />
            </div>
          )}
        </div>

        {/* Participant Info Overlay */}
        <AnimatePresence>
          {(isHovered || showControls) && (
            <motion.div
              className="absolute inset-0 bg-black/60 backdrop-blur-sm flex flex-col items-center justify-center text-white p-2"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.2 }}
            >
              <h3 className={`${config.fontSize} font-semibold text-center mb-1 truncate w-full`}>
                {participant.name}
              </h3>
              
              {participant.role && (
                <div className="flex items-center gap-1 mb-2">
                  <Leaf size={config.iconSize} className="text-sirius-green-vida" />
                  <span className="text-xs capitalize">{participant.role}</span>
                </div>
              )}

              {/* Quick Controls for Local User */}
              {participant.isLocalUser && (
                <div className="flex gap-2">
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      onToggleMute?.();
                    }}
                    className="bg-white/20 hover:bg-white/30 rounded-full p-1 transition-colors"
                  >
                    {participant.isMuted ? (
                      <MicOff size={config.iconSize} className="text-red-400" />
                    ) : (
                      <Mic size={config.iconSize} className="text-green-400" />
                    )}
                  </button>
                  
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      onToggleVideo?.();
                    }}
                    className="bg-white/20 hover:bg-white/30 rounded-full p-1 transition-colors"
                  >
                    {participant.isVideoEnabled ? (
                      <Video size={config.iconSize} className="text-green-400" />
                    ) : (
                      <VideoOff size={config.iconSize} className="text-red-400" />
                    )}
                  </button>
                </div>
              )}
            </motion.div>
          )}
        </AnimatePresence>

        {/* Role Badge */}
        {participant.role === 'host' && (
          <div className="absolute -top-1 -right-1">
            <div className="bg-yellow-400 text-black text-xs px-2 py-1 rounded-full font-semibold shadow-lg">
              Host
            </div>
          </div>
        )}
      </div>

      {/* Organic Growth Effect */}
      <AnimatePresence>
        {isActive && (
          <motion.div
            className="absolute inset-0 pointer-events-none"
            initial={{ scale: 0.8, opacity: 0 }}
            animate={{ scale: 1.2, opacity: 0.3 }}
            exit={{ scale: 0.8, opacity: 0 }}
            transition={{ duration: 1, repeat: Infinity, repeatType: 'reverse' }}
          >
            <div 
              className="w-full h-full bg-sirius-green-vida/20 blur-xl"
              style={{
                clipPath: 'polygon(25% 0%, 75% 0%, 100% 50%, 75% 100%, 25% 100%, 0% 50%)'
              }}
            />
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
} 