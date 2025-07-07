import React from 'react';
import { Menu } from 'react-admin';
import PeopleIcon from '@mui/icons-material/People';
import SchoolIcon from '@mui/icons-material/School';
import RocketLaunchIcon from '@mui/icons-material/RocketLaunch';

const AdminMenu = () => (
  <Menu>
    <Menu.ResourceItem name="influencers" icon={<PeopleIcon />} label="Influenceurs" />
    <Menu.ResourceItem name="courses" icon={<SchoolIcon />} label="Cours" />
    <Menu.ResourceItem name="projects" icon={<RocketLaunchIcon />} label="Projets IA" />
  </Menu>
);

export default AdminMenu;
