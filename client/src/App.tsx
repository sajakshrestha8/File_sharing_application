import { Route, Routes } from "react-router-dom";
import "./App.css";
import Dashboard from "./pages/dashboard/dashboard";
import Room from "./pages/room/rooms";

function App() {
  return (
    <>
      <Routes>
        <Route path="/" Component={Dashboard} />
        <Route path="/:slug" Component={Room} />
      </Routes>
    </>
  );
}

export default App;
