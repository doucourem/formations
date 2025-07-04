import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { ThemeProvider } from '@mui/material/styles';
import CssBaseline from '@mui/material/CssBaseline';

import LoginForm from './components/LoginForm';
import RegisterForm from './components/RegisterForm';
import Dashboard from './pages/Dashboard';
import CourseCard2 from './pages/CourseCard';
import MainLayout from './layouts/MainLayout';
import InfluencerList from './pages/InfluencerList';
import InfluencerDetail from './pages/InfluencerDetail';
import CreateIAProject from './pages/CreateIAProject';
import Agenda from './pages/Agenda';
import HomePage from './pages/HomePage';
import WebinaireList from './pages/WebinaireList';
import CourseDetail from './pages/CourseDetail';
import DashboardUser from './pages/DashboardUser';
import UserProfile from './pages/UserProfile';

import About from './pages/About';
import Mission from './pages/Mission';
import Contact from './pages/Contact';
import Support from './pages/Support';
import FAQ from './pages/FAQ';
import Terms from './pages/Terms';
import Privacy from './pages/Privacy';

import { Admin, Resource } from 'react-admin';
import dataProvider from './utils/dataProvider'; // ton dataProvider personnalisé
import {
  InfluencerListAdmin,
  InfluencerEdit,
  InfluencerCreate,
  InfluencerShow
} from './resources/influencers';

import theme from './theme'; // ton thème MUI

function App() {
  return (
    <ThemeProvider theme={theme}>
      <CssBaseline />

      <Router>
        <Routes>
          {/* Partie admin dédiée */}
          <Route
            path="/admin/*"
            element={
              <Admin dataProvider={dataProvider}>
                <Resource
                  name="influencers"
                  list={InfluencerListAdmin}
                  edit={InfluencerEdit}
                  create={InfluencerCreate}
                  show={InfluencerShow}
                />
              </Admin>
            }
          />

          {/* Partie publique avec layout */}
          <Route
            path="*"
            element={
              <MainLayout>
                <Routes>
                  <Route path="/" element={<HomePage />} />
                  <Route path="/login" element={<LoginForm />} />
                  <Route path="/register" element={<RegisterForm />} />
                  <Route path="/dashboard" element={<CourseCard2 />} />
                  <Route path="/createproject" element={<CreateIAProject />} />
                  <Route path="/agenda" element={<Agenda />} />
                  <Route path="/webinairelist" element={<WebinaireList />} />
                  <Route path="/influencers" element={<InfluencerList />} />
                  <Route path="/influencers/:id" element={<InfluencerDetail />} />
                  <Route path="/cours/:id" element={<CourseDetail />} />
                  <Route path="/dashboarduser" element={<DashboardUser />} />
                  <Route path="/profil" element={<UserProfile />} />
                  <Route path="/about" element={<About />} />
                  <Route path="/mission" element={<Mission />} />
                  <Route path="/contact" element={<Contact />} />
                  <Route path="/support" element={<Support />} />
                  <Route path="/faq" element={<FAQ />} />
                  <Route path="/terms" element={<Terms />} />
                  <Route path="/privacy" element={<Privacy />} />
                </Routes>
              </MainLayout>
            }
          />
        </Routes>
      </Router>
    </ThemeProvider>
  );
}

export default App;
