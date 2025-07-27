import { useState } from "react";
import { useNavigate } from "react-router-dom";

export default function JoinRoom() {
  const [name, setName] = useState("");
  const [room, setRoom] = useState("");
  const navigate = useNavigate();

  const handleJoin = () => {
    localStorage.setItem("username", name);
    navigate(`/room/${room}`);
  };

  return (
    <div>
      <input placeholder="Enter name" onChange={e => setName(e.target.value)} />
      <input placeholder="Room ID" onChange={e => setRoom(e.target.value)} />
      <button onClick={handleJoin}>Join</button>
    </div>
  );
}
