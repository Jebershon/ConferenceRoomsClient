import { useEffect, useRef, useState } from "react";
import MainStream from "./MainStream";
import { useParams } from "react-router-dom";
import io from "socket.io-client";
import Peer from "simple-peer";

const socket = io("http://localhost:3001");

export default function Room() {
  const { roomId } = useParams();
  const [peers, setPeers] = useState([]);
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
    });
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

  return (
    <div>
      <h2>Room: {roomId}</h2>
      
      <div>
        <video playsInline muted autoPlay ref={myVideo} style={{ width: "200px" }} />
        {peers.map((peer, index) => (
          <Video key={index} peer={peer} />
        ))}
      </div>
      <hr />
      <MainStream/>
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
