'use client';

import React, { useState, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Mic, 
  MicOff, 
  Video, 
  VideoOff, 
  Monitor, 
  MonitorOff,
  PhoneOff, 
  Settings, 
  Volume2,
  VolumeX,
  Users,
  MessageCircle,
  Maximize,
  MoreVertical,
  Camera,
  Headphones,
  Wifi,
  WifiOff,
  Leaf,
  Sun,
  Moon
} from 'lucide-react';

interface VideoControlsProps {
  isMuted?: boolean;
  isVideoEnabled?: boolean;
  isScreenSharing?: boolean;
  isConnected?: boolean;
  participantCount?: number;
  onToggleMute?: () => void;
  onToggleVideo?: () => void;
  onToggleScreenShare?: () => void;
  onEndCall?: () => void;
  onOpenSettings?: () => void;
  onOpenChat?: () => void;
  onOpenParticipants?: () => void;
  onToggleFullscreen?: () => void;
  className?: string;
}

export default function VideoControls({
  isMuted = false,
  isVideoEnabled = true,
  isScreenSharing = false,
  isConnected = true,
  participantCount = 0,
  onToggleMute,
  onToggleVideo,
  onToggleScreenShare,
  onEndCall,
  onOpenSettings,
  onOpenChat,
  onOpenParticipants,
  onToggleFullscreen,
  className = ''
}: VideoControlsProps) {
  const [showAdvanced, setShowAdvanced] = useState(false);
  const [isHovered, setIsHovered] = useState(false);
  const [volume, setVolume] = useState(75);
  const timeoutRef = useRef<NodeJS.Timeout | null>(null);

  // Auto-hide advanced controls
  const handleMouseEnter = () => {
    setIsHovered(true);
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current);
      timeoutRef.current = null;
    }
  };

  const handleMouseLeave = () => {
    setIsHovered(false);
    timeoutRef.current = setTimeout(() => {
      setShowAdvanced(false);
    }, 2000);
  };

  // Control button component
  const ControlButton = ({ 
    icon: Icon, 
    isActive = false, 
    variant = 'default',
    onClick, 
    label,
    disabled = false,
    className: buttonClassName = '',
    size = 'medium'
  }: {
    icon: React.ComponentType<{ size?: number; className?: string }>;
    isActive?: boolean;
    variant?: 'default' | 'danger' | 'primary' | 'success';
    onClick?: () => void;
    label: string;
    disabled?: boolean;
    className?: string;
    size?: 'small' | 'medium' | 'large';
  }) => {
    const variants = {
      default: isActive 
        ? 'bg-sirius-green-vida/80 text-white border-sirius-green-vida' 
        : 'bg-black/40 hover:bg-black/60 text-white border-white/20',
      danger: 'bg-red-500/80 hover:bg-red-600/80 text-white border-red-400',
      primary: 'bg-sirius-blue-primary/80 hover:bg-sirius-blue-primary text-white border-sirius-blue-light',
      success: 'bg-sirius-green-vida/80 hover:bg-sirius-green-vida text-white border-sirius-green-vida'
    };

    const sizes = {
      small: 'w-8 h-8 p-1.5',
      medium: 'w-12 h-12 p-3',
      large: 'w-16 h-16 p-4'
    };

    const iconSizes = {
      small: 16,
      medium: 20,
      large: 24
    };

    return (
      <motion.button
        className={`
          relative rounded-full border-2 backdrop-blur-md transition-all duration-300
          ${variants[variant]}
          ${sizes[size]}
          ${disabled ? 'opacity-50 cursor-not-allowed' : 'hover:scale-110 active:scale-95'}
          ${buttonClassName}
        `}
        onClick={disabled ? undefined : onClick}
        whileHover={{ scale: disabled ? 1 : 1.1 }}
        whileTap={{ scale: disabled ? 1 : 0.95 }}
        title={label}
        disabled={disabled}
      >
        <Icon size={iconSizes[size]} className="w-full h-full" />
        
        {/* Ripple effect */}
        <motion.div
          className="absolute inset-0 rounded-full border-2 border-white/30"
          initial={{ scale: 1, opacity: 0 }}
          animate={isActive ? { scale: 1.3, opacity: [0, 0.5, 0] } : {}}
          transition={{ duration: 2, repeat: Infinity }}
        />
      </motion.button>
    );
  };

  return (
    <motion.div
      className={`
        fixed bottom-6 left-1/2 transform -translate-x-1/2 z-50
        ${className}
      `}
      onMouseEnter={handleMouseEnter}
      onMouseLeave={handleMouseLeave}
      initial={{ y: 100, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      transition={{ duration: 0.5, ease: "easeOut" }}
    >
      {/* Main Controls Container */}
      <motion.div
        className="
          bg-black/60 backdrop-blur-xl rounded-2xl border border-white/20
          px-6 py-4 flex items-center gap-4
          shadow-xl shadow-black/50
        "
        animate={{
          width: isHovered || showAdvanced ? 'auto' : 'auto',
          transition: { duration: 0.3 }
        }}
      >
        {/* Connection Status */}
        <div className="flex items-center gap-2 px-2">
          {isConnected ? (
            <Wifi size={16} className="text-sirius-green-vida animate-pulse" />
          ) : (
            <WifiOff size={16} className="text-red-400" />
          )}
          <span className="text-xs text-white/70">
            {isConnected ? 'Conectado' : 'Desconectado'}
          </span>
        </div>

        <div className="w-px h-8 bg-white/20" />

        {/* Audio Control */}
        <ControlButton
          icon={isMuted ? MicOff : Mic}
          isActive={!isMuted}
          variant={isMuted ? 'danger' : 'success'}
          onClick={onToggleMute}
          label={isMuted ? 'Activar micrófono' : 'Silenciar micrófono'}
        />

        {/* Video Control */}
        <ControlButton
          icon={isVideoEnabled ? Video : VideoOff}
          isActive={isVideoEnabled}
          variant={isVideoEnabled ? 'success' : 'danger'}
          onClick={onToggleVideo}
          label={isVideoEnabled ? 'Desactivar cámara' : 'Activar cámara'}
        />

        {/* Screen Share */}
        <ControlButton
          icon={isScreenSharing ? MonitorOff : Monitor}
          isActive={isScreenSharing}
          variant={isScreenSharing ? 'primary' : 'default'}
          onClick={onToggleScreenShare}
          label={isScreenSharing ? 'Detener compartir pantalla' : 'Compartir pantalla'}
        />

        <div className="w-px h-8 bg-white/20" />

        {/* Participants */}
        <motion.div
          className="relative flex items-center gap-2 px-2 py-1 rounded-full bg-white/10"
          whileHover={{ scale: 1.05 }}
          onClick={onOpenParticipants}
        >
          <Users size={16} className="text-sirius-blue-light" />
          <span className="text-sm text-white font-medium">{participantCount}</span>
        </motion.div>

        {/* Chat */}
        <ControlButton
          icon={MessageCircle}
          onClick={onOpenChat}
          label="Abrir chat"
          size="medium"
        />

        {/* Advanced Controls Toggle */}
        <AnimatePresence>
          {(isHovered || showAdvanced) && (
            <motion.div
              className="flex items-center gap-2"
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              transition={{ duration: 0.3 }}
            >
              <div className="w-px h-8 bg-white/20" />

              {/* Volume Control */}
              <div className="flex items-center gap-2 px-2">
                <Volume2 size={16} className="text-white/70" />
                <input
                  type="range"
                  min="0"
                  max="100"
                  value={volume}
                  onChange={(e) => setVolume(Number(e.target.value))}
                  className="w-16 h-1 bg-white/20 rounded-full appearance-none cursor-pointer
                           [&::-webkit-slider-thumb]:appearance-none
                           [&::-webkit-slider-thumb]:w-3
                           [&::-webkit-slider-thumb]:h-3
                           [&::-webkit-slider-thumb]:bg-sirius-green-vida
                           [&::-webkit-slider-thumb]:rounded-full
                           [&::-webkit-slider-thumb]:cursor-pointer"
                />
              </div>

              {/* Settings */}
              <ControlButton
                icon={Settings}
                onClick={onOpenSettings}
                label="Configuración"
                size="medium"
              />

              {/* Fullscreen */}
              <ControlButton
                icon={Maximize}
                onClick={onToggleFullscreen}
                label="Pantalla completa"
                size="medium"
              />
            </motion.div>
          )}
        </AnimatePresence>

        <div className="w-px h-8 bg-white/20" />

        {/* End Call */}
        <ControlButton
          icon={PhoneOff}
          variant="danger"
          onClick={onEndCall}
          label="Finalizar llamada"
          size="large"
        />

        {/* More Options */}
        <ControlButton
          icon={MoreVertical}
          onClick={() => setShowAdvanced(!showAdvanced)}
          label="Más opciones"
          isActive={showAdvanced}
          size="medium"
        />
      </motion.div>

      {/* Floating Action Tips */}
      <AnimatePresence>
        {isHovered && (
          <motion.div
            className="absolute -top-16 left-1/2 transform -translate-x-1/2
                     bg-black/80 backdrop-blur rounded-lg px-3 py-2
                     text-xs text-white/90 whitespace-nowrap"
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 10 }}
          >
            <div className="flex items-center gap-2">
              <Leaf size={12} className="text-sirius-green-vida" />
              Espacio: Silenciar • V: Video • S: Compartir
            </div>
            <div className="absolute bottom-0 left-1/2 transform -translate-x-1/2 translate-y-full
                          w-0 h-0 border-l-4 border-r-4 border-t-4
                          border-l-transparent border-r-transparent border-t-black/80" />
          </motion.div>
        )}
      </AnimatePresence>

      {/* Organic Growth Animation */}
      <motion.div
        className="absolute inset-0 pointer-events-none"
        animate={{
          scale: [1, 1.01, 1],
          opacity: [0.1, 0.3, 0.1]
        }}
        transition={{
          duration: 3,
          repeat: Infinity,
          ease: "easeInOut"
        }}
      >
        <div className="w-full h-full rounded-2xl bg-sirius-green-vida/20 blur-xl" />
      </motion.div>
    </motion.div>
  );
} 