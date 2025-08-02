import { HashRouter, Routes, Route } from 'react-router-dom';
import JoinRoom from './Components/JoinRoom';
import Room from './Components/Room';

function App() {
  return (
    <HashRouter basename='/ConferenceRoomsClient/'>
      <Routes>
        <Route path="/" element={<JoinRoom />} />
        <Route path="/room/:roomId" element={<Room />} />
      </Routes>
    </HashRouter>
  );
}

export default App;
