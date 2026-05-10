import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { useState, useEffect } from 'react';
import { fetchGamesData } from './services/api';
import type { GamesData } from './types';
import HomePage from './pages/HomePage';
import GamePage from './pages/GamePage';
import AdventurePage from './pages/AdventurePage';
import './App.css';
import './pages/AdventurePage.css';

function App() {
  const [data, setData] = useState<GamesData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetchGamesData()
      .then(setData)
      .catch((err) => setError(err.message))
      .finally(() => setLoading(false));
  }, []);

  if (loading) {
    return (
      <div className="loading">
        <div className="spinner"></div>
        <p>加载中...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="error">
        <p>加载失败: {error}</p>
      </div>
    );
  }

  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<HomePage data={data!} />} />
        <Route path="/game/:slug" element={<GamePage data={data!} />} />
        <Route path="/adventure" element={<AdventurePage />} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;