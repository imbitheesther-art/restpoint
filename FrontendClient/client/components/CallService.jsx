import React, { useState, useEffect, useRef } from 'react';
import io from 'socket.io-client';
import './CallService.css';

export function CallService() {
  const [isCallActive, setIsCallActive] = useState(false);
  const [availableUsers, setAvailableUsers] = useState([]);
  const [selectedUser, setSelectedUser] = useState(null);
  const [incomingCall, setIncomingCall] = useState(null);
  const [callDuration, setCallDuration] = useState(0);
  const [socket, setSocket] = useState(null);
  const [localStream, setLocalStream] = useState(null);
  const localVideoRef = useRef(null);
  const remoteVideoRef = useRef(null);

  useEffect(() => {
    const newSocket = io(process.env.REACT_APP_SOCKETIO_URL || 'http://localhost:5000', {
      auth: { token: localStorage.getItem('authToken') }
    });

    newSocket.on('users-in-mortuary', (users) => {
      setAvailableUsers(users || []);
    });

    newSocket.on('incoming-call', (data) => {
      setIncomingCall(data);
    });

    newSocket.on('call-rejected', (data) => {
      alert(data.userName + ' rejected your call');
      endCall();
    });

    setSocket(newSocket);
    return () => newSocket.disconnect();
  }, []);

  const startCall = async (user) => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        video: { width: 320, height: 240 },
        audio: true
      });
      setLocalStream(stream);
      if (localVideoRef.current) {
        localVideoRef.current.srcObject = stream;
      }

      if (socket) {
        socket.emit('call-user', {
          targetUserId: user.userId,
          userName: localStorage.getItem('userName')
        });
      }

      setSelectedUser(user);
      setIsCallActive(true);
    } catch (error) {
      alert('Failed to access camera/microphone');
    }
  };

  const acceptCall = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        video: { width: 320, height: 240 },
        audio: true
      });
      setLocalStream(stream);
      if (localVideoRef.current) {
        localVideoRef.current.srcObject = stream;
      }

      if (socket) {
        socket.emit('call-accepted', {
          targetUserId: incomingCall.fromUserId
        });
      }

      setSelectedUser(incomingCall);
      setIsCallActive(true);
      setIncomingCall(null);
    } catch (error) {
      alert('Failed to accept call');
    }
  };

  const rejectCall = () => {
    if (socket) {
      socket.emit('call-rejected', {
        targetUserId: incomingCall.fromUserId
      });
    }
    setIncomingCall(null);
  };

  const endCall = () => {
    if (localStream) {
      localStream.getTracks().forEach(track => track.stop());
      setLocalStream(null);
    }

    if (socket && selectedUser) {
      socket.emit('call-ended', { targetUserId: selectedUser.userId });
    }

    setIsCallActive(false);
    setSelectedUser(null);
    if (localVideoRef.current) localVideoRef.current.srcObject = null;
  };

  return (
    <div className="call-service">
      {incomingCall && (
        <div className="call-popup">
          <div className="call-popup-content">
            <h3>Incoming Call</h3>
            <p>{incomingCall.userName} is calling...</p>
            <div className="call-popup-actions">
              <button className="btn-accept" onClick={acceptCall}>Accept</button>
              <button className="btn-reject" onClick={rejectCall}>Reject</button>
            </div>
          </div>
        </div>
      )}

      {!isCallActive ? (
        <div className="users-directory">
          <h3>Call Someone</h3>
          <div className="users-grid">
            {availableUsers.map(user => (
              <button key={user.userId} className="user-btn" onClick={() => startCall(user)}>
                <span className="user-initial">{user.name.charAt(0)}</span>
                <div>
                  <p>{user.name}</p>
                  <small>{user.role}</small>
                </div>
              </button>
            ))}
          </div>
        </div>
      ) : (
        <div className="call-active">
          <div className="videos">
            <video ref={localVideoRef} autoPlay muted className="video local" />
            <video ref={remoteVideoRef} autoPlay className="video remote" />
          </div>
          <button className="btn-end-call" onClick={endCall}>End Call</button>
        </div>
      )}
    </div>
  );
}