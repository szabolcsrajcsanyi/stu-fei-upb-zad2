import ReactDOM from 'react-dom/client';
import './index.css';
import Home from './Home';
import SignIn from './components/SignIn';
import {
  BrowserRouter as Router,
  Routes,
  Route,
} from 'react-router-dom';
import SignUp from './components/SignUp';
import InternetBanking from './components/InternetBanking';
import ProtectedRoute from './components/ProtectedRoute';
import PublicRoute from './components/PublicRoute';

const root = ReactDOM.createRoot(document.getElementById('root') as HTMLElement);

root.render(
  <Router>
    <Routes>
      <Route path="/" element={<PublicRoute><Home /></PublicRoute>} />
      <Route path="/login" element={<PublicRoute><SignIn /></PublicRoute>} />
      <Route path="/register" element={<PublicRoute><SignUp /></PublicRoute>} />
      <Route path="/internetbanking" element={<ProtectedRoute><InternetBanking /></ProtectedRoute>} />
    </Routes>
  </Router>
);