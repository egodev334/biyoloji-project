import { useEffect } from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { Toaster } from 'react-hot-toast';
import { useAuthStore } from './store/authStore';

// Layout
import Layout from './components/common/Layout';
import AdminLayout from './components/admin/AdminLayout';

// Pages
import HomePage from './pages/HomePage';
import LoginPage from './pages/LoginPage';
import RegisterPage from './pages/RegisterPage';
import ModulesPage from './pages/ModulesPage';
import ModuleDetailPage from './pages/ModuleDetailPage';
import ExamPage from './pages/ExamPage';
import ForumPage from './pages/ForumPage';
import ForumCategoryPage from './pages/ForumCategoryPage';
import ForumTopicPage from './pages/ForumTopicPage';
import ProfilePage from './pages/ProfilePage';
import MobileAppPage from './pages/MobileAppPage';
import PracticePage from './pages/PracticePage';

// Admin Pages
import AdminDashboard from './pages/admin/AdminDashboard';
import AdminModules from './pages/admin/AdminModules';
import AdminModuleEdit from './pages/admin/AdminModuleEdit';
import AdminUsers from './pages/admin/AdminUsers';
import AdminExams from './pages/admin/AdminExams';
import AdminPractice from './pages/admin/AdminPractice';
import AdminForum from './pages/admin/AdminForum';

function PrivateRoute({ children }: { children: React.ReactNode }) {
  const { user } = useAuthStore();
  if (!user) return <Navigate to="/login" replace />;
  return <>{children}</>;
}

function AdminRoute({ children }: { children: React.ReactNode }) {
  const { user } = useAuthStore();
  if (!user) return <Navigate to="/login" replace />;
  if (user.role !== 'admin') return <Navigate to="/" replace />;
  return <>{children}</>;
}

function PublicRoute({ children }: { children: React.ReactNode }) {
  const { user } = useAuthStore();
  if (user) return <Navigate to="/" replace />;
  return <>{children}</>;
}

export default function App() {
  const { initFromStorage } = useAuthStore();

  useEffect(() => {
    initFromStorage();
  }, []);

  return (
    <BrowserRouter>
      <Toaster
        position="top-right"
        toastOptions={{
          duration: 3500,
          style: {
            fontSize: '14px',
            maxWidth: '380px',
          },
        }}
      />
      <Routes>
        {/* Public Routes */}
        <Route element={<Layout />}>
          <Route path="/" element={<HomePage />} />
          <Route path="/modules" element={<ModulesPage />} />
          <Route path="/modules/:id" element={<ModuleDetailPage />} />
          <Route path="/forum" element={<ForumPage />} />
          <Route path="/forum/:categoryId" element={<ForumCategoryPage />} />
          <Route path="/forum/topic/:topicId" element={<ForumTopicPage />} />
          <Route path="/mobil-uygulama" element={<MobileAppPage />} />

          {/* Auth Required */}
          <Route path="/exam/:id" element={<PrivateRoute><ExamPage /></PrivateRoute>} />
          <Route path="/profil/:id" element={<PrivateRoute><ProfilePage /></PrivateRoute>} />
          <Route path="/calisma-sorulari" element={<PrivateRoute><PracticePage /></PrivateRoute>} />
        </Route>

        {/* Auth pages */}
        <Route path="/login" element={<PublicRoute><LoginPage /></PublicRoute>} />
        <Route path="/register" element={<PublicRoute><RegisterPage /></PublicRoute>} />

        {/* Admin Routes */}
        <Route path="/admin" element={<AdminRoute><AdminLayout /></AdminRoute>}>
          <Route index element={<AdminDashboard />} />
          <Route path="modules" element={<AdminModules />} />
          <Route path="modules/new" element={<AdminModuleEdit />} />
          <Route path="modules/:id/edit" element={<AdminModuleEdit />} />
          <Route path="users" element={<AdminUsers />} />
          <Route path="exams" element={<AdminExams />} />
          <Route path="practice" element={<AdminPractice />} />
          <Route path="forum" element={<AdminForum />} />
        </Route>

        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </BrowserRouter>
  );
}
