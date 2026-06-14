import React, { useState, useEffect, useRef, useCallback } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Phone, PhoneOff, Mic, MicOff, Volume2, Users, LogIn } from 'lucide-react';
import { createCallSocket, getTenantCallRoom, callTenant } from '../../api/callApi';

// Styling
const styles = {
  container: {
    minHeight: 'calc(100vh - 4rem)',
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    background: 'linear-gradient(135deg, #0f0f0f 0%, #1a1a2e 100%)',
    borderRadius: '20px',
    padding: '2rem',
    color: '#fff',
    fontFamily: "'Inter', sans-serif",
  },
  header: {
    textAlign: 'center',
    marginBottom: '2rem',
  },
  title: {
    fontSize: '1.8rem',
    fontWeight: 700,
    color: '#fff',
    marginBottom: '0.5rem',
  },
  subtitle: {
    fontSize: '0.9rem',
    color: 'rgba(255,255,255,0.6)',
  },
  roomCard: {
    background: 'rgba(255,255,255,0.05)',
    border: '1px solid rgba(255,255,255,0.1)',
    borderRadius: '16px',
    padding: '1.5rem',
    width: '100%',
    maxWidth: '500px',
    marginBottom: '2rem',
    backdropFilter: 'blur(10px)',
  },
  roomHeader: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: '1rem',
    paddingBottom: '1rem',
    borderBottom: '1px solid rgba(255,255,255,0.1)',
  },
  roomName: {
    fontSize: '1rem',
    fontWeight: 600,
    color: '#fff',
  },
  userList: {
    display: 'flex',
    flexDirection: 'column',
    gap: '0.5rem',
  },
  userItem: {
    display: 'flex',
    alignItems: 'center',
    gap: '0.75rem',
    padding: '0.5rem 0.75rem',
    borderRadius: '10px',
    background: 'rgba(255,255,255,0.03)',
    transition: 'all 0.2s ease',
  },
  userAvatar: {
    width: '36px',
    height: '36px',
    borderRadius: '50%',
    background: 'linear-gradient(135deg, #04c800, #2980B9)',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    fontSize: '0.85rem',
    fontWeight: 700,
    color: '#fff',
    flexShrink: 0,
  },
  userName: {
    fontSize: '0.9rem',
    fontWeight: 500,
    color: '#fff',
    flex: 1,
  },
  speakingIndicator: {
    width: '10px',
    height: '10px',
    borderRadius: '50%',
    background: '#04c800',
    animation: 'pulse 0.5s ease-in-out infinite',
  },
  controls: {
    display: 'flex',
    gap: '1rem',
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: '1.5rem',
  },
  controlButton: {
    width: '56px',
    height: '56px',
    borderRadius: '50%',
    border: 'none',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    cursor: 'pointer',
    transition: 'all 0.2s ease',
    background: 'rgba(255,255,255,0.1)',
    color: '#fff',
  },
  callButton: {
    width: '64px',
    height: '64px',
    borderRadius: '50%',
    border: 'none',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    cursor: 'pointer',
    transition: 'all 0.2s ease',
    background: '#04c800',
    color: '#fff',
    boxShadow: '0 4px 20px rgba(4, 200, 0, 0.3)',
  },
  endCallButton: {
    width: '64px',
    height: '64px',
    borderRadius: '50%',
    border: 'none',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    cursor: 'pointer',
    transition: 'all 0.2s ease',
    background: '#e74c3c',
    color: '#fff',
    boxShadow: '0 4px 20px rgba(231, 76, 60, 0.3)',
  },
  crossCallSection: {
    width: '100%',
    maxWidth: '500px',
    marginTop: '2rem',
    padding: '1.5rem',
    background: 'rgba(255,255,255,0.03)',
    border: '1px solid rgba(255,255,255,0.08)',
    borderRadius: '16px',
  },
  input: {
    width: '100%',
    padding: '0.75rem 1rem',
    borderRadius: '10px',
    border: '1px solid rgba(255,255,255,0.15)',
    background: 'rgba(255,255,255,0.05)',
    color: '#fff',
    fontSize: '0.9rem',
    outline: 'none',
    boxSizing: 'border-box',
    marginBottom: '1rem',
  },
  secondaryButton: {
    padding: '0.75rem 1.5rem',
    borderRadius: '10px',
    border: '1px solid rgba(4, 200, 0, 0.3)',
    background: 'rgba(4, 200, 0, 0.1)',
    color: '#04c800',
    fontSize: '0.9rem',
    fontWeight: 600,
    cursor: 'pointer',
    transition: 'all 0.2s ease',
    display: 'flex',
    alignItems: 'center',
    gap: '0.5rem',
    justifyContent: 'center',
  },
  statusBadge: {
    padding: '0.25rem 0.75rem',
    borderRadius: '20px',
    fontSize: '0.75rem',
    fontWeight: 600,
    textTransform: 'uppercase',
    letterSpacing: '0.05em',
  },
  inactiveBadge: {
    background: 'rgba(255,255,255,0.1)',
    color: 'rgba(255,255,255,0.6)',
  },
  activeBadge: {
    background: 'rgba(4, 200, 0, 0.2)',
    color: '#04c800',
  },
};

// WebRTC Peer Connection
const PeerConnection = ({ localStream, remoteStream, setRemoteStream, socket, targetSocketId, roomId, speaking }) => {
  const peerConnectionRef = useRef(null);
  const remoteAudioRef = useRef(null);

  useEffect(() => {
    if (!socket || !targetSocketId) return;

    const config = {
      iceServers: [
        { urls: 'stun:stun.l.google.com:19302' },
        { urls: 'stun:stun1.l.google.com:19302' },
      ],
    };

    const pc = new RTCPeerConnection(config);
    peerConnectionRef.current = pc;

    if (localStream) {
      localStream.getTracks().forEach(track => {
        if (localStream) pc.addTrack(track, localStream);
      });
    }

    pc.ontrack = (event) => {
      if (event.streams && event.streams[0]) {
        setRemoteStream(event.streams[0]);
        if (remoteAudioRef.current) {
          remoteAudioRef.current.srcObject = event.streams[0];
        }
      }
    };

    pc.onicecandidate = (event) => {
      if (event.candidate) {
        socket.emit('ice-candidate', {
          targetSocketId,
          candidate: event.candidate,
          roomId,
        });
      }
    };

    pc.onconnectionstatechange = () => {
      if (pc.connectionState === 'disconnected' || pc.connectionState === 'failed') {
        console.log('[PeerConnection] Disconnected');
      }
    };

    // Handle signaling messages
    const handleOffer = async (data) => {
      if (data.from !== targetSocketId) return;
      await pc.setRemoteDescription(new RTCSessionDescription(data.offer));
      const answer = await pc.createAnswer();
      await pc.setLocalDescription(answer);
      socket.emit('answer', {
        targetSocketId: data.from,
        answer,
        roomId,
      });
    };

    const handleAnswer = async (data) => {
      if (data.from !== targetSocketId) return;
      await pc.setRemoteDescription(new RTCSessionDescription(data.answer));
    };

    const handleIceCandidate = async (data) => {
      if (data.from !== targetSocketId) return;
      try {
        await pc.addIceCandidate(new RTCIceCandidate(data.candidate));
      } catch (e) {
        console.error('[PeerConnection] Error adding ICE candidate:', e);
      }
    };

    socket.on('offer', handleOffer);
    socket.on('answer', handleAnswer);
    socket.on('ice-candidate', handleIceCandidate);

    // If we initiated the call, create offer
    const initiateCall = async () => {
      try {
        const offer = await pc.createOffer();
        await pc.setLocalDescription(offer);
        socket.emit('offer', {
          targetSocketId,
          offer,
          roomId,
        });
      } catch (err) {
        console.error('[PeerConnection] Error creating offer:', err);
      }
    };

    // Small delay to ensure socket handlers are registered
    setTimeout(initiateCall, 500);

    return () => {
      socket.off('offer', handleOffer);
      socket.off('answer', handleAnswer);
      socket.off('ice-candidate', handleIceCandidate);
      pc.close();
    };
  }, [socket, targetSocketId, roomId, localStream, setRemoteStream]);

  return (
    <audio ref={remoteAudioRef} autoPlay style={{ display: 'none' }} />
  );
};

// Main Call Page Component
const CallPage = () => {
  const { slug } = useParams();
  const navigate = useNavigate();
  const [socket, setSocket] = useState(null);
  const [connected, setConnected] = useState(false);
  const [users, setUsers] = useState([]);
  const [localStream, setLocalStream] = useState(null);
  const [remoteStream, setRemoteStream] = useState(null);
  const [inCall, setInCall] = useState(false);
  const [isMuted, setIsMuted] = useState(false);
  const [speaking, setSpeaking] = useState(false);
  const [callTarget, setCallTarget] = useState(null);
  const [targetTenantSlug, setTargetTenantSlug] = useState('');
  const [crossCallResult, setCrossCallResult] = useState(null);
  const [roomInfo, setRoomInfo] = useState(null);
  const audioContextRef = useRef(null);
  const analyserRef = useRef(null);
  const speakIntervalRef = useRef(null);

  const userStr = localStorage.getItem('user');
  const user = userStr ? JSON.parse(userStr) : {};
  const userId = user?.user_id || user?.id || 'unknown';
  const userName = user?.full_name || user?.name || 'User';
  const authToken = localStorage.getItem('authToken') || localStorage.getItem('token');
  const roomId = `call-${slug}`;

  // Initialize socket connection
  useEffect(() => {
    if (!slug || !authToken) return;

    const newSocket = createCallSocket(slug, userId, userName, authToken);
    setSocket(newSocket);

    newSocket.on('connect', () => {
      setConnected(true);
    });

    newSocket.on('disconnect', () => {
      setConnected(false);
    });

    newSocket.on('room-users', (data) => {
      setUsers(data.users || []);
    });

    newSocket.on('user-joined', (data) => {
      setUsers(data.users || []);
    });

    newSocket.on('user-left', (data) => {
      setUsers(prev => prev.filter(u => u.socketId !== data.socketId));
    });

    newSocket.on('incoming-call', (data) => {
      // Handle incoming call from another user
      setCallTarget(data.from);
    });

    newSocket.on('call-ended', () => {
      setInCall(false);
      setRemoteStream(null);
      setCallTarget(null);
    });

    newSocket.on('peer-voice-activity', (data) => {
      // Update peer speaking indicator
      setUsers(prev => prev.map(u => 
        u.socketId === data.socketId ? { ...u, speaking: data.speaking } : u
      ));
    });

    // Fetch room info
    getTenantCallRoom(slug).then(res => {
      if (res.success) setRoomInfo(res.data);
    }).catch(err => console.error('[CallPage] Error fetching room info:', err));

    return () => {
      newSocket.close();
      if (localStream) {
        localStream.getTracks().forEach(track => track.stop());
      }
    };
  }, [slug]);

  // Get local microphone stream
  const getLocalStream = useCallback(async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true, video: false });
      setLocalStream(stream);

      // Set up audio level detection
      const audioCtx = new (window.AudioContext || window.webkitAudioContext)();
      const source = audioCtx.createMediaStreamSource(stream);
      const analyser = audioCtx.createAnalyser();
      analyser.fftSize = 256;
      source.connect(analyser);
      audioContextRef.current = audioCtx;
      analyserRef.current = analyser;

      // Monitor speaking activity
      const dataArray = new Uint8Array(analyser.frequencyBinCount);
      speakIntervalRef.current = setInterval(() => {
        analyser.getByteFrequencyData(dataArray);
        const avg = dataArray.reduce((a, b) => a + b, 0) / dataArray.length;
        const isSpeaking = avg > 15;
        setSpeaking(isSpeaking);
        if (socket && socket.connected) {
          socket.emit('voice-activity', { roomId, speaking: isSpeaking });
        }
      }, 200);

      return stream;
    } catch (err) {
      console.error('[CallPage] Error getting microphone:', err);
      alert('Could not access microphone. Please check permissions.');
      return null;
    }
  }, [socket, roomId]);

  // Cleanup audio context
  useEffect(() => {
    return () => {
      if (speakIntervalRef.current) clearInterval(speakIntervalRef.current);
      if (audioContextRef.current) audioContextRef.current.close();
    };
  }, []);

  // Join call (start listening)
  const handleJoinCall = async () => {
    const stream = await getLocalStream();
    if (stream) {
      setInCall(true);
    }
  };

  // End call
  const handleEndCall = () => {
    if (socket && socket.connected) {
      socket.emit('end-call', { roomId });
    }
    if (localStream) {
      localStream.getTracks().forEach(track => track.stop());
      setLocalStream(null);
    }
    setRemoteStream(null);
    setInCall(false);
    setCallTarget(null);
  };

  // Toggle mute
  const handleToggleMute = () => {
    if (localStream) {
      const audioTrack = localStream.getAudioTracks()[0];
      if (audioTrack) {
        audioTrack.enabled = !audioTrack.enabled;
        setIsMuted(!audioTrack.enabled);
      }
    }
  };

  // Initiate cross-tenant call
  const handleCrossTenantCall = async () => {
    if (!targetTenantSlug.trim()) return;
    try {
      const result = await callTenant(targetTenantSlug.trim(), slug);
      setCrossCallResult(result);
      
      if (result.success) {
        // Navigate to the target tenant's call room
        navigate(`/rptenant/${targetTenantSlug.trim()}/call`);
      }
    } catch (err) {
      console.error('[CallPage] Cross-tenant call error:', err);
      setCrossCallResult({ success: false, message: err.message });
    }
  };

  // Call a specific user in the room
  const handleCallUser = (targetSocketId) => {
    if (socket && socket.connected) {
      socket.emit('initiate-call', {
        targetUserId: targetSocketId,
        targetTenantSlug: slug,
      });
      setCallTarget(targetSocketId);
    }
  };

  const getInitials = (name) => {
    if (!name) return '?';
    return name.slice(0, 2).toUpperCase();
  };

  return (
    <div style={styles.container}>
      <style>
        {`
          @keyframes pulse {
            0%, 100% { opacity: 1; transform: scale(1); }
            50% { opacity: 0.5; transform: scale(0.8); }
          }
        `}
      </style>

      <div style={styles.header}>
        <h1 style={styles.title}>
          <Phone size={24} style={{ marginRight: '0.5rem', verticalAlign: 'middle', color: '#04c800' }} />
          Voice Call Room
        </h1>
        <p style={styles.subtitle}>
          {connected ? `Connected to ${slug}` : 'Connecting...'}
          <span style={{ 
            display: 'inline-block', 
            width: '8px', 
            height: '8px', 
            borderRadius: '50%', 
            marginLeft: '0.5rem',
            background: connected ? '#04c800' : '#e74c3c',
            verticalAlign: 'middle'
          }} />
        </p>
      </div>

      {/* Room Info Card */}
      <div style={styles.roomCard}>
        <div style={styles.roomHeader}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <Users size={18} color="rgba(255,255,255,0.6)" />
            <span style={styles.roomName}>Room: {slug}</span>
          </div>
          <span style={{ ...styles.statusBadge, ...(connected ? styles.activeBadge : styles.inactiveBadge) }}>
            {connected ? 'Online' : 'Offline'}
          </span>
        </div>

        {/* Users in room */}
        <div style={styles.userList}>
          <div style={styles.userItem}>
            <div style={styles.userAvatar}>
              {getInitials(userName)}
            </div>
            <span style={styles.userName}>{userName} (You)</span>
            {speaking && <div style={styles.speakingIndicator} />}
            <span style={{ fontSize: '0.75rem', color: 'rgba(255,255,255,0.4)' }}>Me</span>
          </div>

          {users
            .filter(u => u.socketId !== socket?.id)
            .map((user) => (
              <div key={user.socketId} style={styles.userItem}>
                <div style={styles.userAvatar}>
                  {getInitials(user.userName)}
                </div>
                <span style={styles.userName}>{user.userName}</span>
                {user.speaking && <div style={styles.speakingIndicator} />}
                <button
                  onClick={() => handleCallUser(user.socketId)}
                  style={{
                    ...styles.secondaryButton,
                    padding: '0.35rem 0.75rem',
                    fontSize: '0.75rem',
                  }}
                >
                  <Phone size={12} />
                  Call
                </button>
              </div>
            ))}

          {users.length === 0 && (
            <p style={{ textAlign: 'center', color: 'rgba(255,255,255,0.4)', fontSize: '0.85rem', padding: '1rem' }}>
              No other users in this room yet
            </p>
          )}
        </div>

        {/* Call Controls */}
        <div style={styles.controls}>
          {!inCall ? (
            <button
              onClick={handleJoinCall}
              style={styles.callButton}
              title="Join Call (Enable Microphone)"
            >
              <Phone size={24} />
            </button>
          ) : (
            <>
              <button
                onClick={handleToggleMute}
                style={{
                  ...styles.controlButton,
                  background: isMuted ? 'rgba(231, 76, 60, 0.2)' : 'rgba(255,255,255,0.1)',
                  color: isMuted ? '#e74c3c' : '#fff',
                }}
                title={isMuted ? 'Unmute' : 'Mute'}
              >
                {isMuted ? <MicOff size={20} /> : <Mic size={20} />}
              </button>

              <button
                onClick={handleEndCall}
                style={styles.endCallButton}
                title="End Call"
              >
                <PhoneOff size={24} />
              </button>

              <button
                style={styles.controlButton}
                title="Volume"
              >
                <Volume2 size={20} />
              </button>
            </>
          )}
        </div>

        {inCall && (
          <p style={{ textAlign: 'center', color: 'rgba(255,255,255,0.5)', fontSize: '0.8rem', marginTop: '1rem' }}>
            {remoteStream ? 'Connected - Voice active' : 'Waiting for peers...'}
          </p>
        )}
      </div>

      {/* Cross-Mortuary Calling */}
      <div style={styles.crossCallSection}>
        <h3 style={{ fontSize: '1rem', fontWeight: 600, color: '#fff', marginBottom: '1rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
          <LogIn size={16} color="#04c800" />
          Call Another Mortuary
        </h3>
        <p style={{ fontSize: '0.8rem', color: 'rgba(255,255,255,0.5)', marginBottom: '0.75rem' }}>
          Each mortuary has its own call room. Enter a tenant slug to call them.
        </p>
        <input
          style={styles.input}
          type="text"
          placeholder="Enter tenant slug (e.g., kenya-mortuary)"
          value={targetTenantSlug}
          onChange={(e) => setTargetTenantSlug(e.target.value)}
        />
        <button
          onClick={handleCrossTenantCall}
          style={styles.secondaryButton}
        >
          <Phone size={16} />
          Call {targetTenantSlug || 'Another Mortuary'}
        </button>
        {crossCallResult && (
          <p style={{
            marginTop: '0.75rem',
            fontSize: '0.8rem',
            color: crossCallResult.success ? '#04c800' : '#e74c3c',
          }}>
            {crossCallResult.message}
          </p>
        )}
      </div>

      {/* Hidden WebRTC Peer Audio */}
      {inCall && socket && callTarget && (
        <PeerConnection
          localStream={localStream}
          remoteStream={remoteStream}
          setRemoteStream={setRemoteStream}
          socket={socket}
          targetSocketId={callTarget}
          roomId={roomId}
          speaking={speaking}
        />
      )}
    </div>
  );
};

export default CallPage;