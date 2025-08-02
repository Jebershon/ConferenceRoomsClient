import { useEffect, useRef, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import io from "socket.io-client";
import Peer from "simple-peer";
import "./style.css"; // Assuming you have some styles in this file

const socket = io("http://localhost:3001");

export default function Room() {
  const { roomId } = useParams();
  const navigate = useNavigate();
  const [peers, setPeers] = useState([]);
  const [micEnabled, setMicEnabled] = useState(true);
  const myVideo = useRef();
  const userStream = useRef();
  const peersRef = useRef([]);
  const username = localStorage.getItem("username");

  useEffect(() => {
    navigator.mediaDevices.getUserMedia({ video: true, audio: true }).then(stream => {
      userStream.current = stream;
      myVideo.current.srcObject = stream;

      socket.emit("join-room", { roomId, username });

      socket.on("user-joined", ({ id }) => {
        const peer = createPeer(id, socket.id, stream);
        peersRef.current.push({ peerID: id, peer });
        setPeers(prev => [...prev, peer]);
      });

      socket.on("signal", ({ from, signal }) => {
        const item = peersRef.current.find(p => p.peerID === from);
        if (item) item.peer.signal(signal);
      });

      socket.on("user-disconnected", ({ id }) => {
        const peerObj = peersRef.current.find(p => p.peerID === id);
        if (peerObj) {
          peerObj.peer.destroy();
          peersRef.current = peersRef.current.filter(p => p.peerID !== id);
          setPeers(prev => prev.filter(p => p !== peerObj.peer));
        }
      });
    });

    return () => {
      socket.disconnect();
    };
  }, []);

  function createPeer(userToSignal, callerID, stream) {
    const peer = new Peer({
      initiator: true,
      trickle: false,
      stream
    });

    peer.on("signal", signal => {
      socket.emit("signal", { userToSignal, signal, from: callerID });
    });

    return peer;
  }

  function toggleMic() {
    const audioTrack = userStream.current.getAudioTracks()[0];
    if (audioTrack) {
      audioTrack.enabled = !audioTrack.enabled;
      setMicEnabled(audioTrack.enabled);
    }
  }

  function leaveRoom() {
    userStream.current.getTracks().forEach(track => track.stop());
    peersRef.current.forEach(p => p.peer.destroy());
    socket.emit("leave-room", { roomId });
    navigate("/"); // Or replace with a landing route
  }

return (
  <div className="page-container">
    <h2>Room: {roomId}</h2>

    <div className="video-grid">
      <video playsInline muted autoPlay ref={myVideo} />
      {peers.map((peer, index) => (
        <Video key={index} peer={peer} />
      ))}
    </div>

    <div className="controls">
      <button onClick={toggleMic}>
        {micEnabled ? "Mute Mic" : "Unmute Mic"}
      </button>
      <button onClick={leaveRoom} className="leave">
        Leave Room
      </button>
    </div>
  </div>
);
}

function Video({ peer }) {
  const ref = useRef();

  useEffect(() => {
    peer.on("stream", stream => {
      ref.current.srcObject = stream;
    });
  }, [peer]);

  return <video playsInline autoPlay ref={ref} style={{ width: "200px" }} />;
}
