import { Routes, Route } from 'react-router-dom';
import { HomePage } from './pages/HomePage';
import { LobbyPage } from './pages/LobbyPage';
import { GamePage } from './pages/GamePage';

function App() {
  return (
    <div className="ocean-bg">
      <Routes>
        <Route path="/" element={<HomePage />} />
        <Route path="/lobby" element={<LobbyPage />} />
        <Route path="/game/:roomId" element={<GamePage />} />
      </Routes>
    </div>
  );
}

export default App;
