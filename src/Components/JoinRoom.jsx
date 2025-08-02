import { useState } from "react";
import { useNavigate } from "react-router-dom";
import "./style.css"; // Assuming you have some styles in this file

export default function JoinRoom() {
  const [name, setName] = useState("");
  const [room, setRoom] = useState("");
  const navigate = useNavigate();

  const handleJoin = () => {
    localStorage.setItem("username", name);
    navigate(`/room/${room}`);
  };

return (
  <div className="page-container">
    <h2>Join a Room</h2>
    <div className="form-container">
      <input
        placeholder="Enter name"
        onChange={e => setName(e.target.value)}
      />
      <input
        placeholder="Room ID"
        onChange={e => setRoom(e.target.value)}
      />
      <button onClick={handleJoin}>Join</button>
    </div>
  </div>
);
}
