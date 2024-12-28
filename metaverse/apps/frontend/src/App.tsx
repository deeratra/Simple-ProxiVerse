import { BrowserRouter, Route, Routes } from 'react-router-dom';
import './App.css';
import Register from './pages/Register';
import Login from './pages/Login';
import Home from './pages/Home';
import MapsPage from './pages/Maps';
import AddElementsToMap from './components/AddElementsToMap';
import Arena from './pages/Arena';

function App() {
  return (
    <BrowserRouter>
      <Routes>
        {/* <Route path="/" element={isLoggedIn ? <Posts /> : <Signin setIsLoggedIn={setIsLoggedIn} />} /> */}
        <Route path="/signup" element={<Register />}></Route>
        <Route path="/signin" element={<Login />}></Route>
        <Route path="/home" element={<Home />}></Route>
        <Route path="/maps" element={<MapsPage />}></Route>
        <Route path="/addElementsToMap/:mapId" element={<AddElementsToMap />} />
        <Route path="/arena/:roomId" element={<Arena />} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;
