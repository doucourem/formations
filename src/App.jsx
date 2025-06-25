import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { ThemeProvider } from '@mui/material/styles';
import CssBaseline from '@mui/material/CssBaseline';

import LoginForm from './components/LoginForm';
import RegisterForm from './components/RegisterForm';
import Dashboard from './pages/Dashboard';
import CourseCard2 from './pages/CourseCard'; // Si besoin
import MainLayout from './layouts/MainLayout';
import InfluencerList from './pages/InfluencerList';
import InfluencerDetail from './pages/InfluencerDetail';
import CreateIAProject from './pages/CreateIAProject';
import Agenda from './pages/Agenda';
import HomePage from './pages/HomePage';
import WebinaireList from './pages/WebinaireList'

import theme from './theme';  // chemin vers ton thème
import CourseDetail from './pages/CourseDetail';
import DashboardUser from './pages/DashboardUser'; // Si besoin
import UserProfile from './pages/UserProfile';



function App() {
  return (
    <ThemeProvider theme={theme}>
      <CssBaseline />
      <Router>
        <MainLayout>
          <Routes>
            <Route path="/" element={<HomePage />} />
            <Route path="/login" element={<LoginForm />} />
             <Route path="/webinairelist" element={<WebinaireList />} />
            <Route path="/register" element={<RegisterForm />} />
            <Route path="/dashboard" element={<CourseCard2 />} />
            <Route path="/createproject" element={<CreateIAProject />} />
            <Route path="/agenda" element={<Agenda />} />
            <Route path="/influencers" element={<InfluencerList />} />
            <Route path="/influencers/:id" element={<InfluencerDetail />} />
            <Route path="/cours/:id" element={<CourseDetail />} />
            <Route path="/dashboarduser" element={<DashboardUser />} />
            <Route path="/profil" element={<UserProfile />} />

            DashboardUser
          </Routes>
        </MainLayout>
      </Router>
    </ThemeProvider>
  );
}

export default App;
