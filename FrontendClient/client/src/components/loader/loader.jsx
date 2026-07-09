// components/loader/loader.jsx - Beautiful Unified Loader
import React from "react";

const Loader = ({
  size = "medium",
  color = "primary",
  text = "",
  overlay = true,
  fullScreen = true,
  type = "spinner",
  className = "",
}) => {
  const colorMap = {
    primary: "#A67C52",
    secondary: "#0A1F3D",
    success: "#059669",
    warning: "#F59E0B",
    danger: "#DC2626",
    dark: "#0A1F3D",
    light: "#F9FAFB",
  };

  const sizeMap = {
    small: { width: "24px", height: "24px", fontSize: "0.75rem", borderWidth: "2px" },
    medium: { width: "40px", height: "40px", fontSize: "0.875rem", borderWidth: "3px" },
    large: { width: "56px", height: "56px", fontSize: "1rem", borderWidth: "4px" },
    xlarge: { width: "72px", height: "72px", fontSize: "1.125rem", borderWidth: "4px" },
  };

  const currentColor = colorMap[color] || colorMap.primary;
  const currentSize = sizeMap[size] || sizeMap.medium;

  const containerStyle = {
    display: "flex",
    flexDirection: "column",
    alignItems: "center",
    justifyContent: "center",
    gap: "16px",
    zIndex: 9999,
    position: "fixed",
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: overlay ? "rgba(4,4,4,0.6)" : "transparent",
    backdropFilter: overlay ? "blur(4px)" : "none",
    padding: "2rem",
  };

  const renderSpinner = () => (
    <div style={{
      width: currentSize.width,
      height: currentSize.height,
      borderRadius: "50%",
      border: `${currentSize.borderWidth} solid ${currentColor}20`,
      borderTopColor: currentColor,
      animation: "loaderSpin 0.8s cubic-bezier(0.4, 0, 0.2, 1) infinite",
      boxShadow: `0 0 20px ${currentColor}30`,
      willChange: "transform",
    }} />
  );

  const renderDots = () => (
    <div style={{
      display: "flex",
      gap: "8px",
      alignItems: "center",
    }}>
      {[0, 1, 2].map((index) => (
        <div
          key={index}
          style={{
            width: parseInt(currentSize.width) / 3,
            height: parseInt(currentSize.width) / 3,
            borderRadius: "50%",
            backgroundColor: currentColor,
            animation: `loaderBounce 1.4s ease-in-out infinite`,
            animationDelay: `${index * 0.16}s`,
            boxShadow: `0 0 10px ${currentColor}60`,
          }}
        />
      ))}
    </div>
  );

  const renderPulse = () => (
    <div style={{
      width: currentSize.width,
      height: currentSize.height,
      borderRadius: "50%",
      backgroundColor: currentColor,
      animation: "loaderPulse 1.5s ease-in-out infinite",
      boxShadow: `0 0 30px ${currentColor}50`,
    }} />
  );

  const renderLoader = () => {
    switch (type) {
      case "dots":
        return renderDots();
      case "pulse":
        return renderPulse();
      case "spinner":
      default:
        return renderSpinner();
    }
  };

  return (
    <div style={containerStyle} className={className}>
      {renderLoader()}
      {text && (
        <div style={{
          fontSize: currentSize.fontSize,
          color: "#a0a0a0",
          fontWeight: "400",
          textAlign: "center",
          letterSpacing: "0.05em",
        }}>
          {text}
        </div>
      )}
    </div>
  );
};

// Global animations - Beautiful smooth animations
export const GlobalLoaderStyles = () => (
  <style>
    {`
      @keyframes loaderSpin {
        0% { transform: rotate(0deg); }
        100% { transform: rotate(360deg); }
      }
      @keyframes loaderBounce {
        0%, 80%, 100% { 
          transform: scale(0.6);
          opacity: 0.5;
        }
        40% { 
          transform: scale(1);
          opacity: 1;
        }
      }
      @keyframes loaderPulse {
        0%, 100% { 
          transform: scale(0.95);
          opacity: 0.7;
        }
        50% { 
          transform: scale(1.05);
          opacity: 1;
        }
      }
    `}
  </style>
);

export default Loader;