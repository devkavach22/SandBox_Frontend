import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { useState, useEffect } from "react"; // 1. Hooks import karein
import Home from "../page/LandingPage";
import Login from "../page/Login";
import Register from "../page/Register";
import Dashboard from "../page/Dashboard";
import AdminPanel from "../page/AdminPenal";
import Apis from "../page/Apis";
import APIHistory from "../page/APIHistory";
import Payment from "../page/Payment";
import Sandbox from "../page/Sandbox";
import Profile from "../page/Profile";

// function ProtectedRoute({ children, role }) {
//   const user = JSON.parse(localStorage.getItem("user"));
//   if (!user) return <Navigate to="/login" replace />;
//   if (role && user.role !== role) return <Navigate to="/login" replace />;
//   return children;
// }

// export default function AppRoutes() {
//   const user = JSON.parse(localStorage.getItem("user"));

//   return (
//     <BrowserRouter>
//       <Routes>
//         <Route path="/" element={<Home />} />
//         <Route path="/login" element={user ? <Navigate to="/dashboard" replace /> : <Login />} />
//         <Route path="/register" element={user ? <Navigate to="/dashboard" replace /> : <Register />} />
//         <Route path="/admin" element={
//           <ProtectedRoute role="admin"><AdminPanel /></ProtectedRoute>
//         } />
//         <Route path="/apis" element={
//           <ProtectedRoute role="customer"><Apis /></ProtectedRoute>
//         } />
//         <Route path="/profile" element={
//           <ProtectedRoute><Profile /></ProtectedRoute>
//         } />
//         <Route path="/dashboard" element={
//           <ProtectedRoute role="customer"><Dashboard /></ProtectedRoute>
//         } />
//         <Route path="/sandbox/:apiId" element={
//           <ProtectedRoute role="customer"><Sandbox /></ProtectedRoute>
//         } />
//         <Route path="/history" element={
//           <ProtectedRoute><APIHistory /></ProtectedRoute>
//         } />
//         <Route path="/payments" element={
//           <ProtectedRoute><Payment /></ProtectedRoute>
//         } />
//         <Route path="*" element={<Navigate to="/" />} />
//       </Routes>
//     </BrowserRouter>
//   );
// }


function ProtectedRoute({ children, role }) {
  const user = JSON.parse(localStorage.getItem("user"));
  if (!user) return <Navigate to="/login" replace />;
  if (role && user.role !== role) return <Navigate to="/login" replace />;
  return children;
}

export default function AppRoutes() {
  // 2. Local storage ki jagah state use karein
  const [user, setUser] = useState(JSON.parse(localStorage.getItem("user")));

  // 3. Ek effect lagayein jo storage change hone par state update kare
  // Isse logout hone par UI turant update hogi
  useEffect(() => {
    const handleStorageChange = () => {
      setUser(JSON.parse(localStorage.getItem("user")));
    };

    window.addEventListener("storage", handleStorageChange);
    return () => window.removeEventListener("storage", handleStorageChange);
  }, []);

  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Home />} />
        
        {/* Yahan 'user' ab state se aa raha hai, isliye change hote hi effect dikhega */}
        <Route path="/login" element={user ? <Navigate to="/dashboard" replace /> : <Login />} />
        <Route path="/register" element={user ? <Navigate to="/dashboard" replace /> : <Register />} />
        
        <Route path="/admin" element={
          <ProtectedRoute role="admin"><AdminPanel /></ProtectedRoute>
        } />
        <Route path="/apis" element={
          <ProtectedRoute role="customer"><Apis /></ProtectedRoute>
        } />
        <Route path="/profile" element={
          <ProtectedRoute><Profile /></ProtectedRoute>
        } />
        <Route path="/dashboard" element={
          <ProtectedRoute role="customer"><Dashboard /></ProtectedRoute>
        } />
        <Route path="/sandbox/:apiId" element={
          <ProtectedRoute role="customer"><Sandbox /></ProtectedRoute>
        } />
        <Route path="/history" element={
          <ProtectedRoute><APIHistory /></ProtectedRoute>
        } />
        <Route path="/payments" element={
          <ProtectedRoute><Payment /></ProtectedRoute>
        } />
        <Route path="*" element={<Navigate to="/" />} />
      </Routes>
    </BrowserRouter>
  );
}