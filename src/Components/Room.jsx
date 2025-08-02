import { useEffect, useRef, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import io from "socket.io-client";
import Peer from "simple-peer";
import "./style.css";

const socket = io("http://localhost:5000"); // Use your backend address here

export default function Room() {
  const { roomId } = useParams();
  const navigate = useNavigate();
  const [peers, setPeers] = useState([]);
  const [micEnabled, setMicEnabled] = useState(true);
  const [camEnabled, setCamEnabled] = useState(true);
  const myVideo = useRef();
  const userStream = useRef();
  const peersRef = useRef([]);
  const username = localStorage.getItem("username") || `User-${Math.floor(Math.random() * 1000)}`;

  useEffect(() => {
    let stream;

    async function initMediaAndConnect() {
      try {
        stream = await navigator.mediaDevices.getUserMedia({ video: true, audio: true });
        userStream.current = stream;

        if (myVideo.current) {
          myVideo.current.srcObject = stream;
        }

        socket.emit("join-room", { roomId, userName: username });

        socket.on("peer-list", (peersInRoom) => {
          const newPeers = [];
          Object.keys(peersInRoom).forEach((peerId) => {
            const peer = createPeer(peerId, socket.id, stream);
            peersRef.current.push({ peerID: peerId, peer });
            newPeers.push(peer);
          });
          setPeers(newPeers);
        });

        socket.on("user-connected", ({ socketId }) => {
          const peerExists = peersRef.current.some(p => p.peerID === socketId);
          if (!peerExists) {
            const peer = createPeer(socketId, socket.id, stream);
            peersRef.current.push({ peerID: socketId, peer });
            setPeers(prev => [...prev, peer]);
          }
        });

        socket.on("offer", ({ caller, offer }) => {
          const peer = addPeer(offer, caller, stream);
          peersRef.current.push({ peerID: caller, peer });
          setPeers(prev => [...prev, peer]);
        });

        socket.on("answer", ({ caller, answer }) => {
          const item = peersRef.current.find(p => p.peerID === caller);
          if (item) item.peer.signal(answer);
        });

        socket.on("ice-candidate", ({ from, candidate }) => {
          const item = peersRef.current.find(p => p.peerID === from);
          if (item) item.peer.signal(candidate);
        });

        socket.on("user-disconnected", id => {
          const peerObj = peersRef.current.find(p => p.peerID === id);
          if (peerObj) {
            peerObj.peer.destroy();
            peersRef.current = peersRef.current.filter(p => p.peerID !== id);
            setPeers(prev => prev.filter(p => p !== peerObj.peer));
          }
        });
      } catch (err) {
        console.error("Media error:", err);
        alert("Camera or microphone is already in use or permission denied.");
        navigate("/");
      }
    }

    initMediaAndConnect();

    return () => {
      if (stream) {
        stream.getTracks().forEach(track => track.stop());
      }
      peersRef.current.forEach(p => p.peer.destroy());
      socket.disconnect();
    };
  }, [roomId, username, navigate]);

  function createPeer(userToSignal, callerID, stream) {
    const peer = new Peer({
      initiator: true,
      trickle: false,
      stream,
    });

    peer.on("signal", signal => {
      socket.emit("offer", {
        target: userToSignal,
        offer: signal,
        userName: username,
      });
    });

    return peer;
  }

  function addPeer(incomingSignal, callerID, stream) {
    const peer = new Peer({
      initiator: false,
      trickle: false,
      stream,
    });

    peer.on("signal", signal => {
      socket.emit("answer", {
        target: callerID,
        answer: signal,
      });
    });

    peer.signal(incomingSignal);
    return peer;
  }

  function toggleMic() {
    const audioTrack = userStream.current?.getAudioTracks()[0];
    if (audioTrack) {
      audioTrack.enabled = !audioTrack.enabled;
      setMicEnabled(audioTrack.enabled);
    }
  }

  function toggleCam() {
    const videoTrack = userStream.current?.getVideoTracks()[0];
    if (videoTrack) {
      videoTrack.enabled = !videoTrack.enabled;
      setCamEnabled(videoTrack.enabled);
    }
  }

  function leaveRoom() {
    userStream.current?.getTracks().forEach(track => track.stop());
    peersRef.current.forEach(p => p.peer.destroy());
    socket.emit("leave-room", { roomId });
    navigate("/");
  }

  return (
    <div className="room-container">
      {/* Main Stream fills the screen */}
      <div className="main-stream-bg">
        <span>Main Stream Area (Not Yet Implemented)</span>
      </div>

      {/* Overlaid Top Info */}
      <div className="top-bar">
        <h2>Room ID: {roomId}</h2>
        <h3>Welcome, {username}!</h3>
      </div>

      {/* Participant Video Tiles */}
      <div className="participants-overlay">
        <video
          className="participant-video"
          playsInline
          muted
          autoPlay
          ref={myVideo}
        />
        {peers.map((peer, index) => (
          <Video key={index} peer={peer} />
        ))}
      </div>

      {/* Controls */}
      <div className="controls-overlay">
        <button onClick={toggleMic}>
          {micEnabled ? "Mute Mic" : "Unmute Mic"}
        </button>
        <button onClick={toggleCam}>
          {camEnabled ? "Turn Off Camera" : "Turn On Camera"}
        </button>
        <button className="leave-btn" onClick={leaveRoom}>
          End Call
        </button>
      </div>
    </div>
  );
}

function Video({ peer }) {
  const ref = useRef();

  useEffect(() => {
    peer.on("stream", (stream) => {
      if (ref.current) {
        ref.current.srcObject = stream;
      }
    });
  }, [peer]);

  return (
    <video
      playsInline
      autoPlay
      ref={ref}
      className="peer-video"
    />
  );
}
