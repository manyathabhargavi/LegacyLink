import { Navigate, Route, Routes } from "react-router-dom";
import Layout from "./components/Layout";
import ProtectedRoute from "./components/ProtectedRoute";
import { LoginPage, RegisterPage } from "./pages/AuthPages";
import Dashboard from "./pages/Dashboard";
import Assets from "./pages/Assets";
import Contacts from "./pages/Contacts";
import Designations from "./pages/Designations";
import AccessRequests from "./pages/AccessRequests";
import Reviewer from "./pages/Reviewer";
import Monitoring from "./pages/Monitoring";

function PrivateLayout() {
  return <ProtectedRoute><Layout /></ProtectedRoute>;
}

export default function App() {
  return <Routes>
    <Route path="/login" element={<LoginPage />} />
    <Route path="/register" element={<RegisterPage />} />
    <Route element={<PrivateLayout />}>
      <Route index element={<Dashboard />} />
      <Route path="/assets" element={<Assets />} />
      <Route path="/contacts" element={<Contacts />} />
      <Route path="/designations" element={<Designations />} />
      <Route path="/access-requests" element={<AccessRequests />} />
      <Route path="/reviewer" element={<Reviewer />} />
      <Route path="/monitoring" element={<Monitoring />} />
    </Route>
    <Route path="*" element={<Navigate to="/" replace />} />
  </Routes>;
}
