import { BrowserRouter, Routes, Route } from 'react-router-dom';
import JoinRoom from './Components/JoinRoom';
import Room from './Components/Room';

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<JoinRoom />} />
        <Route path="/room/:roomId" element={<Room />} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;
