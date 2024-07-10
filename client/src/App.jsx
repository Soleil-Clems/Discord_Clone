import{ useState, useEffect } from 'react';
import { BrowserRouter, Routes, Route } from "react-router-dom";
import AuthPage from './pages/AuthPage';
import RegisterPage from './pages/RegisterPage';
import NoPage from './pages/NoPage';
import RoomPage from './pages/RoomPage';
import { io } from 'socket.io-client';
import ProfilPage from './pages/ProfilPage';

function App() {
  const [activeRoom, setActiveRoom] = useState('Room 1');
  const [socket, setSocket] = useState(null);

  useEffect(() => {
    const newSocket = io('http://localhost:4242/');
    setSocket(newSocket);

    return () => newSocket.close();
  }, []);

  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" >
          <Route index element={<AuthPage />} />
          <Route path="register" element={<RegisterPage />} />
          <Route path="room" element={<RoomPage socket={socket} activeRoom={activeRoom} setActiveRoom={setActiveRoom} />} />
          <Route path="profil/:id" element={<ProfilPage />} />
          <Route path="*" element={<NoPage />} />
        </Route>
      </Routes>
    </BrowserRouter>
  );
}

export default App;
