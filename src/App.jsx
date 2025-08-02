import { HashRouter as Router, Routes, Route } from 'react-router-dom';
import JoinRoom from './Components/JoinRoom';
import Room from './Components/Room';

function App() {
  return (
    <>
      <Router>
      <Routes>
        <Route path="/" element={<JoinRoom />} />
        <Route path="/room/:roomId" element={<Room />} />
      </Routes>
      </Router>  
    </>
  );
}

export default App;
