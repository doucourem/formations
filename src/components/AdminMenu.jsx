// src/components/AdminMenu.jsx
import React from 'react';
import { Menu } from 'react-admin';

const AdminMenu = () => (
  <Menu>
    <Menu.ResourceItem name="influencers" />
    <Menu.ResourceItem name="courses" />
    <Menu.ResourceItem name="projects" />
  </Menu>
);

export default AdminMenu;
