import React from "react";

const Loader = ({
  size = "medium",
  color = "multicolor", // 'multicolor', 'brass', 'verdigris', 'accent', 'ink'
  text = "Loading",
  overlay = true,
  fullScreen = true,
  className = "",
}) => {
  const colorMap = {
    brass: "#A98F6E",
    verdigris: "#4D6359",
    accent: "#C77B5E",
    ink: "#15171A",
    bone: "#FAF8F4",
    multicolor: "multicolor",
    primary: "#A98F6E",
    secondary: "#4D6359",
  };

  // The different colors for the dots
  const dotColors = ["#A98F6E", "#C77B5E", "#4D6359", "#15171A", "#A98F6E", "#C77B5E", "#4D6359", "#15171A"];

  const sizeMap = {
    small: { dot: 5, radius: 14, fontSize: "0.7rem" },
    medium: { dot: 8, radius: 22, fontSize: "0.8rem" },
    large: { dot: 10, radius: 30, fontSize: "0.9rem" },
    xlarge: { dot: 14, radius: 40, fontSize: "1rem" },
  };

  const activeColor = colorMap[color] || colorMap.brass;
  const currentSize = sizeMap[size] || sizeMap.medium;

  // Soft, light frosted glass background (no dark card!)
  const wrapperStyle = {
    display: "flex",
    flexDirection: "column",
    alignItems: "center",
    justifyContent: "center",
    gap: "1.5rem",
    zIndex: 9999,
    position: fullScreen ? "fixed" : "absolute",
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    // Very subtle light tint and blur so it blends beautifully
    backgroundColor: overlay ? "rgba(250, 248, 244, 0.6)" : "transparent",
    backdropFilter: overlay ? "blur(6px)" : "none",
    WebkitBackdropFilter: overlay ? "blur(6px)" : "none",
  };

  // Generate the spinning ring of dots
  const renderDotsSpinner = () => {
    const numDots = 8;
    const dots = [];

    for (let i = 0; i < numDots; i++) {
      const angle = (i * 360) / numDots;

      // Determine the color for this specific dot
      let dotColor = activeColor;
      if (activeColor === "multicolor") {
        dotColor = dotColors[i % dotColors.length];
      }

      // Calculate scale and opacity for the "chasing tail" effect
      const scale = 0.6 + (i / numDots) * 0.6; // Grows from 0.6x to 1.2x
      const opacity = 0.3 + (i / numDots) * 0.7; // Fades from 0.3 to 1.0

      dots.push(
        <div
          key={i}
          style={{
            position: "absolute",
            top: "50%",
            left: "50%",
            width: `${currentSize.dot * scale}px`,
            height: `${currentSize.dot * scale}px`,
            margin: `-${(currentSize.dot * scale) / 2}px 0 0 -${(currentSize.dot * scale) / 2}px`,
            backgroundColor: dotColor,
            borderRadius: "50%",
            opacity: opacity,
            // Place dot on the circle edge
            transform: `rotate(${angle}deg) translateY(-${currentSize.radius}px)`,
            transition: "background-color 0.3s ease",
          }}
        />
      );
    }

    return (
      <div
        style={{
          position: "relative",
          width: `${currentSize.radius * 2}px`,
          height: `${currentSize.radius * 2}px`,
          // Spin the entire container continuously
          animation: "spinDots 1s linear infinite",
        }}
      >
        {dots}
      </div>
    );
  };

  return (
    <div style={wrapperStyle} className={className}>
      {renderDotsSpinner()}
      {text && (
        <div style={{
          fontSize: currentSize.fontSize,
          color: "#15171A", // Dark text for the light background
          fontFamily: "'JetBrains Mono', monospace",
          letterSpacing: "0.15em",
          textTransform: "uppercase",
          fontWeight: "500",
          display: "flex",
          alignItems: "center",
        }}>
          {text}
          {/* Animated text dots */}
          <span style={{ display: "inline-block", width: '1.5em', textAlign: 'left', animation: "loaderTextDots 1.5s steps(4, end) infinite" }}>. </span>
        </div>
      )}
    </div>
  );
};

// Global animations
export const GlobalLoaderStyles = () => (
  <style>
    {`
      @keyframes spinDots {
        0% { transform: rotate(0deg); }
        100% { transform: rotate(360deg); }
      }
      
      @keyframes loaderTextDots {
        0%, 20% { content: ""; opacity: 0; }
        25% { content: "."; opacity: 1; }
        50% { content: ".."; opacity: 1; }
        75%, 100% { content: "..."; opacity: 1; }
      }
    `}
  </style>
);

export default Loader;