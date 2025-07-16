'use client';

import React, { useMemo, useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import ParticipantHex, { ParticipantData } from './ParticipantHex';

interface VideoGridProps {
  participants: ParticipantData[];
  localUserId?: string;
  activeParticipantId?: string;
  onParticipantClick?: (participant: ParticipantData) => void;
  onToggleMute?: (participantId: string) => void;
  onToggleVideo?: (participantId: string) => void;
  maxVisibleParticipants?: number;
  className?: string;
}

interface HexPosition {
  x: number;
  y: number;
  size: 'small' | 'medium' | 'large';
  ring: number;
}

export default function VideoGrid({
  participants,
  localUserId,
  activeParticipantId,
  onParticipantClick,
  onToggleMute,
  onToggleVideo,
  maxVisibleParticipants = 50,
  className = ''
}: VideoGridProps) {
  const [containerSize, setContainerSize] = useState({ width: 0, height: 0 });
  const [gridScale, setGridScale] = useState(1);

  // Calculate responsive hex size based on participant count and container size
  const hexSize = useMemo(() => {
    const count = Math.min(participants.length, maxVisibleParticipants);
    if (count <= 4) return 'large';
    if (count <= 12) return 'medium';
    return 'small';
  }, [participants.length, maxVisibleParticipants]);

  // Hexagonal grid position calculator
  const calculateHexPositions = useMemo(() => {
    const positions: HexPosition[] = [];
    const count = Math.min(participants.length, maxVisibleParticipants);
    
    if (count === 0) return positions;

    // Size configurations
    const sizeConfig = {
      small: { width: 120, height: 104, spacing: 140 },
      medium: { width: 180, height: 156, spacing: 200 },
      large: { width: 240, height: 208, spacing: 260 }
    };

    const config = sizeConfig[hexSize];
    const hexWidth = config.width;
    const hexHeight = config.height;
    const spacing = config.spacing;
    
    // Calculate rows and columns for hexagonal arrangement
    const rings = Math.ceil(Math.sqrt(count / 3));
    let placedCount = 0;

    // Center position (ring 0)
    if (count > 0) {
      positions.push({
        x: 0,
        y: 0,
        size: hexSize,
        ring: 0
      });
      placedCount++;
    }

    // Place hexagons in concentric rings
    for (let ring = 1; ring <= rings && placedCount < count; ring++) {
      const hexesInRing = ring === 1 ? 6 : 6 * (ring - 1);
      const ringRadius = ring * spacing * 0.75;
      
      for (let i = 0; i < hexesInRing && placedCount < count; i++) {
        const angle = (i / hexesInRing) * 2 * Math.PI;
        const x = Math.cos(angle) * ringRadius;
        const y = Math.sin(angle) * ringRadius;
        
        positions.push({
          x,
          y,
          size: hexSize,
          ring
        });
        placedCount++;
      }
    }

    return positions;
  }, [participants.length, maxVisibleParticipants, hexSize]);

  // Container resize observer
  useEffect(() => {
    const updateContainerSize = () => {
      const container = document.getElementById('video-grid-container');
      if (container) {
        const rect = container.getBoundingClientRect();
        setContainerSize({ width: rect.width, height: rect.height });
        
        // Calculate scale to fit all hexagons
        if (calculateHexPositions.length > 0) {
          const maxX = Math.max(...calculateHexPositions.map(pos => Math.abs(pos.x)));
          const maxY = Math.max(...calculateHexPositions.map(pos => Math.abs(pos.y)));
          const sizeConfig = {
            small: 140,
            medium: 200,
            large: 260
          };
          const hexSpacing = sizeConfig[hexSize];
          
          const requiredWidth = (maxX + hexSpacing) * 2;
          const requiredHeight = (maxY + hexSpacing) * 2;
          
          const scaleX = rect.width / requiredWidth;
          const scaleY = rect.height / requiredHeight;
          const scale = Math.min(scaleX, scaleY, 1);
          
          setGridScale(scale * 0.9); // 90% to add some padding
        }
      }
    };

    updateContainerSize();
    window.addEventListener('resize', updateContainerSize);
    
    return () => window.removeEventListener('resize', updateContainerSize);
  }, [calculateHexPositions, hexSize]);

  // Visible participants (prioritize local user and active speaker)
  const visibleParticipants = useMemo(() => {
    const sortedParticipants = [...participants];
    
    // Sort priority: local user first, then active speaker, then by join time
    sortedParticipants.sort((a, b) => {
      if (a.id === localUserId) return -1;
      if (b.id === localUserId) return 1;
      if (a.id === activeParticipantId) return -1;
      if (b.id === activeParticipantId) return 1;
      if (a.isSpeaking && !b.isSpeaking) return -1;
      if (b.isSpeaking && !a.isSpeaking) return 1;
      return 0;
    });

    return sortedParticipants.slice(0, maxVisibleParticipants);
  }, [participants, localUserId, activeParticipantId, maxVisibleParticipants]);

  // Animate grid entrance
  const gridVariants = {
    hidden: { opacity: 0, scale: 0.8 },
    visible: { opacity: 1, scale: gridScale }
  };

  const hexVariants = {
    hidden: { opacity: 0, scale: 0, rotate: 180 },
    visible: { opacity: 1, scale: 1, rotate: 0 }
  };

  return (
    <div
      id="video-grid-container"
      className={`relative w-full h-full overflow-hidden ${className}`}
      style={{ minHeight: '400px' }}
    >
      {/* Background Pattern */}
      <div className="absolute inset-0 opacity-10">
        <div className="w-full h-full bg-gradient-to-r from-sirius-blue-primary/20 via-transparent to-sirius-green-vida/20" />
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_50%,rgba(102,176,50,0.1)_0%,transparent_70%)]" />
      </div>

      {/* Hexagonal Grid */}
      <motion.div
        className="absolute inset-0 flex items-center justify-center"
        variants={gridVariants}
        initial="hidden"
        animate="visible"
        style={{
          transformOrigin: 'center center'
        }}
      >
        <div className="relative">
          <AnimatePresence mode="popLayout">
            {visibleParticipants.map((participant, index) => {
              const position = calculateHexPositions[index];
              if (!position) return null;

              return (
                <motion.div
                  key={participant.id}
                  className="absolute"
                  style={{
                    left: '50%',
                    top: '50%',
                    transform: `translate(calc(-50% + ${position.x}px), calc(-50% + ${position.y}px))`
                  }}
                  variants={hexVariants}
                  layout
                  layoutId={participant.id}
                  initial="hidden"
                  animate="visible"
                  exit="hidden"
                  transition={{
                    layout: { duration: 0.6, ease: "easeInOut" }
                  }}
                >
                  <ParticipantHex
                    participant={participant}
                    size={position.size}
                    isActive={participant.id === activeParticipantId}
                    onToggleMute={
                      participant.isLocalUser 
                        ? () => onToggleMute?.(participant.id)
                        : undefined
                    }
                    onToggleVideo={
                      participant.isLocalUser
                        ? () => onToggleVideo?.(participant.id)
                        : undefined
                    }
                    onParticipantClick={onParticipantClick}
                  />
                </motion.div>
              );
            })}
          </AnimatePresence>

          {/* Center Growth Animation */}
          <motion.div
            className="absolute inset-0 pointer-events-none"
            animate={{
              scale: [1, 1.02, 1],
              opacity: [0.3, 0.1, 0.3]
            }}
            transition={{
              duration: 4,
              repeat: Infinity,
              ease: "easeInOut"
            }}
          >
            <div 
              className="w-full h-full rounded-full bg-gradient-radial from-sirius-green-vida/10 to-transparent"
              style={{
                width: '200px',
                height: '200px',
                marginLeft: '-100px',
                marginTop: '-100px'
              }}
            />
          </motion.div>
        </div>
      </motion.div>

      {/* Participant Count Indicator */}
      <motion.div
        className="absolute top-4 left-4 bg-black/50 backdrop-blur rounded-full px-3 py-1 text-white text-sm"
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.5 }}
      >
        <span className="flex items-center gap-2">
          <div className="w-2 h-2 bg-sirius-green-vida rounded-full animate-pulse" />
          {visibleParticipants.length} de {participants.length} participantes
        </span>
      </motion.div>

      {/* Overflow Indicator */}
      {participants.length > maxVisibleParticipants && (
        <motion.div
          className="absolute top-4 right-4 bg-yellow-500/80 backdrop-blur rounded-full px-3 py-1 text-black text-sm font-semibold"
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.7 }}
        >
          +{participants.length - maxVisibleParticipants} más
        </motion.div>
      )}

      {/* Loading State */}
      {participants.length === 0 && (
        <motion.div
          className="absolute inset-0 flex items-center justify-center"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.5 }}
        >
          <div className="text-center text-white/70">
            <motion.div
              className="w-16 h-16 border-4 border-sirius-green-vida border-t-transparent rounded-full mx-auto mb-4"
              animate={{ rotate: 360 }}
              transition={{ duration: 2, repeat: Infinity, ease: "linear" }}
            />
            <p className="text-lg font-medium">Preparando el ecosistema...</p>
            <p className="text-sm opacity-70">Esperando participantes</p>
          </div>
        </motion.div>
      )}

      {/* Connection Quality Overlay */}
      <div className="absolute bottom-4 left-4 flex items-center gap-2 bg-black/30 backdrop-blur rounded-full px-3 py-1">
        <div className="w-2 h-2 bg-green-400 rounded-full animate-pulse" />
        <span className="text-white text-xs">Conexión estable</span>
      </div>
    </div>
  );
} 