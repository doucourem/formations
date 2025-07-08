import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { ThemeProvider } from '@mui/material/styles';
import CssBaseline from '@mui/material/CssBaseline';

import LoginForm from './components/LoginForm';
import RegisterForm from './components/RegisterForm';
import Dashboard from './pages/Dashboard';
import CourseCard2 from './pages/CourseCard';
import MainLayout from './layouts/MainLayout';
import InfluencerListFrontend from './pages/InfluencerList';
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
import authProvider from './utils/authProvider'; // 👈
import {
  InfluencerList,
  InfluencerEdit,
  InfluencerCreate,
  InfluencerShow
} from './resources/influencers';

import {
  ProjectList,
  ProjectEdit,
  ProjectCreate,
  ProjectShow,
} from './resources/projects';

import {
  CourseList,
  CourseEdit,
  CourseCreate,
  CourseShow
} from './resources/courses';
import theme from './theme'; // ton thème MUI
import AdminMenu from './components/AdminMenu';
import DashboardAdmin from './pages/DashboardAdmin'; // 👈
import frenchMessages from 'ra-language-french';
import polyglotI18nProvider from 'ra-i18n-polyglot';
import CustomLoginPage from './components/CustomLoginPage';
import MyLayout from './components/MyLayout'; // 🔁 ton chemin réel

const customFrenchMessages = {
  ...frenchMessages,
  resources: {
    influencers: {
      name: 'Influenceur |||| Influenceurs',
    },
    courses: {
      name: 'Cours |||| Cours',
    },
    projects: {
      name: 'Projet IA |||| Projets IA',
    },
  },
};

// Création du i18nProvider
const i18nProvider = polyglotI18nProvider(() => customFrenchMessages, 'fr');


function PublicRoutes() {
  return (
    <MainLayout>
                <Routes>
                  <Route path="/" element={<HomePage />} />
                  <Route path="/login" element={<LoginForm />} />
                  <Route path="/register" element={<RegisterForm />} />
                  <Route path="/dashboard" element={<CourseCard2 />} />
                  <Route path="/createproject" element={<CreateIAProject />} />
                  <Route path="/agenda" element={<Agenda />} />
                  <Route path="/webinairelist" element={<WebinaireList />} />
                  <Route path="/influencer" element={<InfluencerListFrontend />} />
                  <Route path="/influencer/:id" element={<InfluencerDetail />} />
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
  );
}
function App() {
  return (
    <ThemeProvider theme={theme}>
      <CssBaseline />
      <Router>
        <Routes>
          <Route
            path="/admin/*"
            element={
                  <Admin
                   basename="/admin"
                   dashboard={DashboardAdmin}
      dataProvider={dataProvider}
        menu={AdminMenu}// 👈 Protection activée
        authProvider={authProvider} // 👈
        i18nProvider={i18nProvider}
        loginPage={CustomLoginPage} 
        layout={MyLayout}
    >
                <Resource
                  name="influencers"
                  list={InfluencerList}
                  edit={InfluencerEdit}
                  create={InfluencerCreate}
                  show={InfluencerShow}
                />
                  <Resource
    name="courses"
    list={CourseList}
    edit={CourseEdit}
    create={CourseCreate}
    show={CourseShow}
  />
    <Resource
    name="projects"
    list={ProjectList}
    edit={ProjectEdit}
    create={ProjectCreate}
    show={ProjectShow}
  />
              </Admin>
            }
          />
          <Route path="/*" element={<PublicRoutes />} />
        </Routes>
      </Router>
    </ThemeProvider>
  );
}

export default App;

