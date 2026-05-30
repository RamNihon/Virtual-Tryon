import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import Home from "./pages/Home";
import Login from "./pages/Login";
import Register from "./pages/Register";
import Dashboard from "./pages/Dashboard";
import Shop from "./pages/Shop";
import Navbar from "./components/Navbar";
import { useAuth } from "./context/AuthContext";

const RedirectIfLogin = ({ children }) => {
  const { token } = useAuth();
  return token ? <Navigate to="/dashboard" replace /> : children;
};
const ProtectedRoute = ({ children }) => {
  const { token } = useAuth();
  return token ? children : <Navigate to="/login" replace />;
};

function App() {
  return (
    <BrowserRouter>
      <Navbar />
      <Routes>
        <Route path="/" element={<Home />} />
        <Route
          path="/login"
          element={
            <RedirectIfLogin>
              <Login />
            </RedirectIfLogin>
          }
        />

        <Route
          path="/register"
          element={
            <RedirectIfLogin>
              <Register />
            </RedirectIfLogin>
          }
        />
        <Route
          path="/dashboard"
          element={
            <ProtectedRoute>
              <Dashboard />
            </ProtectedRoute>
          }
        />
        <Route path="/shop/:sellerId" element={<Shop />} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;
