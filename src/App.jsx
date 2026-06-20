import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { Toaster } from 'sonner';

import ProtectedRoute from './components/ProtectedRoute';

import Login from './app/(auth)/login/page';
import Signup from './app/(auth)/signup/page';
import StudentLayout from './app/(student)/layout';
import Dashboard from './app/(student)/dashboard/page';
import Notes from './app/(student)/notes/page';
import Events from './app/(student)/events/page';
import Deadlines from './app/(student)/deadlines/page';
import Placement from './app/(student)/placement/page';
import LostFound from './app/(student)/lost-found/page';
import Forum from './app/(student)/forum/page';
import Notices from './app/(student)/notices/page';
import Clubs from './app/(student)/clubs/page';
import Settings from './app/(student)/settings/page';
import Profile from './app/(student)/profile/page';

// Admin imports
import AdminLayout from './app/admin/layout';
import AdminDashboard from './app/admin/dashboard/page';
import AdminNotices from './app/admin/notices/page';
import AdminPlacements from './app/admin/placements/page';
import AdminEvents from './app/admin/events/page';
import AdminUsers from './app/admin/users/page';
import AdminAnalytics from './app/admin/analytics/page';
import AdminClubs from './app/admin/clubs/page';

function Placeholder() {
  return (
    <div className="flex items-center justify-center h-full text-text-muted font-body-md">
      This page is under construction.
    </div>
  );
}

export default function App() {
  return (
    <>
      <Toaster position="top-center" richColors />
      <BrowserRouter>
      <Routes>
        <Route path="/" element={<Navigate to="/login" />} />
        
        {/* Auth Routes */}
        <Route path="/login" element={<Login />} />
        <Route path="/signup" element={<Signup />} />
        
        {/* Student Routes */}
        <Route element={<ProtectedRoute><StudentLayout /></ProtectedRoute>}>
          <Route path="/dashboard" element={<Dashboard />} />
          <Route path="/notes" element={<Notes />} />
          <Route path="/events" element={<Events />} />
          <Route path="/deadlines" element={<Deadlines />} />
          <Route path="/placement" element={<Placement />} />
          <Route path="/lost-found" element={<LostFound />} />
          <Route path="/forum" element={<Forum />} />
          <Route path="/notices" element={<Notices />} />
          <Route path="/clubs" element={<Clubs />} />
          <Route path="/settings" element={<Settings />} />
          <Route path="/profile" element={<Profile />} />
          <Route path="*" element={<Placeholder />} />
        </Route>
        
        {/* Admin Routes */}
        <Route path="/admin" element={<ProtectedRoute requireAdmin={true}><AdminLayout /></ProtectedRoute>}>
          <Route path="dashboard" element={<AdminDashboard />} />
          <Route path="notices" element={<AdminNotices />} />
          <Route path="placements" element={<AdminPlacements />} />
          <Route path="events" element={<AdminEvents />} />
          <Route path="users" element={<AdminUsers />} />
          <Route path="analytics" element={<AdminAnalytics />} />
          <Route path="clubs" element={<AdminClubs />} />
        </Route>
      </Routes>
    </BrowserRouter>
    </>
  );
}
