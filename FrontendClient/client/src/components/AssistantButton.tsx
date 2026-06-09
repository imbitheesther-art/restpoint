import React, { useState } from 'react';
import { motion } from 'framer-motion';
import SearchPanel from './SearchPanel';

interface AssistantButtonProps {
  disabled?: boolean;
}

export const AssistantButton: React.FC<AssistantButtonProps> = ({ disabled = false }) => {
  const [isOpen, setIsOpen] = useState(false);
  const [isHovered, setIsHovered] = useState(false);
  const [isSearching, setIsSearching] = useState(false);

  const handleClick = () => {
    setIsOpen(true);
  };

  const handleClose = () => {
    setIsOpen(false);
  };

  // Keyboard shortcut
  React.useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.ctrlKey || e.metaKey) && e.key === 'k') {
        e.preventDefault();
        setIsOpen(prev => !prev);
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);

  if (disabled) return null;

  return (
    <>
      {/* Floating Button */}
      <motion.button
        onClick={handleClick}
        onHoverStart={() => setIsHovered(true)}
        onHoverEnd={() => setIsHovered(false)}
        whileHover={{ scale: 1.05 }}
        whileTap={{ scale: 0.95 }}
        className="fixed bottom-8 right-8 z-30 p-3 bg-gradient-to-br from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white rounded-full shadow-lg hover:shadow-xl transition-all duration-300 group"
        title="Search (Ctrl+K)"
      >
        {/* Animated SVG Icon */}
        <svg 
          className="w-6 h-6" 
          viewBox="0 0 24 24" 
          fill="none" 
          xmlns="http://www.w3.org/2000/svg"
        >
          <motion.circle
            cx="10"
            cy="10"
            r="7"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            initial={{ pathLength: 0, opacity: 0 }}
            animate={{ pathLength: 1, opacity: 1 }}
            transition={{ duration: 0.5, delay: 0.2 }}
          />
          <motion.path
            d="M15 15L21 21"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            initial={{ pathLength: 0, opacity: 0 }}
            animate={{ pathLength: 1, opacity: 1 }}
            transition={{ duration: 0.3, delay: 0.5 }}
          />
          {/* Animated loading dots when searching */}
          {isSearching && (
            <>
              <motion.circle
                cx="10"
                cy="10"
                r="3"
                fill="currentColor"
                initial={{ scale: 0 }}
                animate={{ scale: [0, 1, 0] }}
                transition={{ duration: 1, repeat: Infinity }}
              />
              <motion.circle
                cx="16"
                cy="16"
                r="2"
                fill="currentColor"
                initial={{ scale: 0 }}
                animate={{ scale: [0, 1, 0] }}
                transition={{ duration: 1, delay: 0.3, repeat: Infinity }}
              />
            </>
          )}
          {/* Ripple effect on hover */}
          {isHovered && (
            <motion.circle
              cx="10"
              cy="10"
              r="10"
              stroke="currentColor"
              strokeWidth="1"
              initial={{ scale: 1, opacity: 0.5 }}
              animate={{ scale: 1.5, opacity: 0 }}
              transition={{ duration: 1, repeat: Infinity }}
            />
          )}
        </svg>
      </motion.button>

      {/* Keyboard hint - animated SVG version */}
      <div className="fixed bottom-24 right-8 z-20 pointer-events-none">
        <motion.div
          initial={{ opacity: 0, y: 10, scale: 0.9 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          transition={{ delay: 1 }}
          className="bg-gray-900/90 backdrop-blur-sm text-white text-xs px-3 py-2 rounded-lg whitespace-nowrap shadow-lg flex items-center gap-2"
        >
          <svg className="w-3 h-3" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
            <rect x="2" y="6" width="20" height="12" rx="2" stroke="currentColor" strokeWidth="1.5" fill="none" />
            <path d="M7 10L10 13L17 8" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
          </svg>
          <span>Press</span>
          <kbd className="bg-gray-800 px-2 py-0.5 rounded text-xs font-mono flex items-center gap-1">
            <svg className="w-2.5 h-2.5" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
              <path d="M15 6L12 3L9 6" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
              <path d="M9 18L12 21L15 18" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
              <path d="M12 3V21" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/>
            </svg>
            Ctrl+K
          </kbd>
        </motion.div>
      </div>

      {/* Search Panel */}
      <SearchPanel 
        isOpen={isOpen} 
        onClose={handleClose}
        onSearchStart={() => setIsSearching(true)}
        onSearchEnd={() => setIsSearching(false)}
      />
    </>
  );
};

// Alternative: Animated Gradient Button with SVG Sparkles
export const AssistantButtonGradient: React.FC<AssistantButtonProps> = ({ disabled = false }) => {
  const [isOpen, setIsOpen] = useState(false);
  const [mousePosition, setMousePosition] = useState({ x: 0, y: 0 });

  const handleClick = () => {
    setIsOpen(true);
  };

  const handleClose = () => {
    setIsOpen(false);
  };

  const handleMouseMove = (e: React.MouseEvent<HTMLButtonElement>) => {
    const rect = e.currentTarget.getBoundingClientRect();
    setMousePosition({
      x: e.clientX - rect.left,
      y: e.clientY - rect.top
    });
  };

  React.useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.ctrlKey || e.metaKey) && e.key === 'k') {
        e.preventDefault();
        setIsOpen(prev => !prev);
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);

  if (disabled) return null;

  return (
    <>
      {/* Animated Gradient Button */}
      <motion.button
        onClick={handleClick}
        onMouseMove={handleMouseMove}
        whileHover={{ scale: 1.05 }}
        whileTap={{ scale: 0.95 }}
        className="fixed bottom-8 right-8 z-30 p-4 rounded-full relative overflow-hidden group"
        style={{
          background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
          boxShadow: '0 10px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04)'
        }}
      >
        {/* Animated gradient overlay */}
        <motion.div
          className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-300"
          style={{
            background: 'linear-gradient(135deg, #764ba2 0%, #667eea 100%)'
          }}
        />
        
        {/* Mouse light effect */}
        <motion.div
          className="absolute w-20 h-20 bg-white rounded-full filter blur-xl opacity-0 group-hover:opacity-20 transition-opacity duration-300 pointer-events-none"
          animate={{
            x: mousePosition.x - 40,
            y: mousePosition.y - 40
          }}
        />
        
        {/* SVG Icon */}
        <svg className="w-6 h-6 relative z-10" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
          <defs>
            <linearGradient id="searchGradient" x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stopColor="#fff" />
              <stop offset="100%" stopColor="#e0e0e0" />
            </linearGradient>
          </defs>
          
          {/* Search circle with pulse */}
          <motion.circle
            cx="10"
            cy="10"
            r="7"
            stroke="url(#searchGradient)"
            strokeWidth="2"
            strokeLinecap="round"
            initial={{ pathLength: 0 }}
            animate={{ pathLength: 1 }}
            transition={{ duration: 0.8, ease: "easeInOut" }}
          />
          
          {/* Search handle */}
          <motion.path
            d="M15 15L21 21"
            stroke="url(#searchGradient)"
            strokeWidth="2"
            strokeLinecap="round"
            initial={{ pathLength: 0 }}
            animate={{ pathLength: 1 }}
            transition={{ duration: 0.5, delay: 0.3 }}
          />
          
          {/* Sparkle effects */}
          <motion.g
            initial={{ opacity: 0, scale: 0 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: 0.5 }}
          >
            <path
              d="M18 4L18.5 5.5L20 6L18.5 6.5L18 8L17.5 6.5L16 6L17.5 5.5L18 4Z"
              fill="white"
            />
            <path
              d="M5 2L5.3 3.2L6.5 3.5L5.3 3.8L5 5L4.7 3.8L3.5 3.5L4.7 3.2L5 2Z"
              fill="white"
            />
            <path
              d="M20 16L20.2 16.8L21 17L20.2 17.2L20 18L19.8 17.2L19 17L19.8 16.8L20 16Z"
              fill="white"
            />
          </motion.g>
          
          {/* Rotating ring */}
          <motion.circle
            cx="10"
            cy="10"
            r="9"
            stroke="white"
            strokeWidth="0.5"
            strokeDasharray="4 12"
            initial={{ rotate: 0 }}
            animate={{ rotate: 360 }}
            transition={{ duration: 3, repeat: Infinity, ease: "linear" }}
            opacity="0.3"
          />
        </svg>
      </motion.button>

      {/* Search Panel */}
      <SearchPanel isOpen={isOpen} onClose={handleClose} />
    </>
  );
};

export default AssistantButton;