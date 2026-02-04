import React, { useState } from 'react';
import { Inertia } from '@inertiajs/inertia';
import { usePage } from '@inertiajs/react';
import {
    Box, List, ListItemButton, ListItemIcon, ListItemText, 
    Collapse, Typography, Divider
} from '@mui/material';
import {
    Dashboard as DashboardIcon,
    Flight as FlightIcon,
    LocalShipping as ParcelIcon,
    Paid as PaidIcon,
    LocationCity as LocationCityIcon,
    Groups as ClientsIcon,
    ManageAccounts as GroupIcon,
    ExpandLess,
    ExpandMore,
    Map as MapIcon,
    EventNote as EventIcon,
    DirectionsBus as FleetIcon
} from '@mui/icons-material';
import { indigo } from '@mui/material/colors';

export default function Sidebar() {
    const { auth } = usePage().props;
    // On s'assure que si le rôle est 'admin', il trouve les menus 'admin'
    const userRole = auth?.user?.role || 'agent'; 
    const [openSubMenu, setOpenSubMenu] = useState(null);

    const handleSubMenuClick = (title) => {
        setOpenSubMenu(openSubMenu === title ? null : title);
    };

    const navigate = (routeName) => {
        Inertia.get(route(routeName));
    };

    const menus = {
        admin: [
            { 
                title: "Supervision", 
                items: [{ text: "Tableau de Bord", icon: <DashboardIcon />, route: "dashboard" }] 
            },
            { 
                title: "Logistique & Transport", 
                items: [
                    { 
                        text: "Moyens de Transport", 
                        icon: <FlightIcon />, 
                        children: [
                            { text: "Flotte", route: "buses.index", icon: <FleetIcon /> },
                            { text: "Lignes & Trajets", route: "busroutes.index", icon: <MapIcon /> },
                            { text: "Planning des Vols", route: "trips.index", icon: <EventIcon /> }
                        ] 
                    },
                    { text: "Suivi des Colis", icon: <ParcelIcon />, route: "parcels.index" },
                    { text: "Transferts d'argent", icon: <PaidIcon />, route: "transfers.index" }
                ] 
            },
            { 
                title: "Administration", 
                items: [
                    { text: "Villes & Hubs", icon: <LocationCityIcon />, route: "cities.index" },
                    { text: "Gestion Clients", icon: <ClientsIcon />, route: "third-parties.index" },
                    { text: "Équipe & Utilisateurs", icon: <GroupIcon />, route: "users.index" }
                ] 
            },
        ],
        agent: [
            { title: "Opérations", items: [{ text: "Dashboard", icon: <DashboardIcon />, route: "dashboard" }] },
            { 
                title: "Gestion Quotidienne", 
                items: [
                    { text: "Réception Colis", icon: <ParcelIcon />, route: "parcels.index" },
                    { text: "Expéditions", icon: <PaidIcon />, route: "transfers.index" },
                    { text: "Répertoire Clients", icon: <ClientsIcon />, route: "third-parties.index" }
                ] 
            },
        ]
    };

    // Sécurité : si le rôle n'est pas dans l'objet, on met agent par défaut
    const currentMenu = menus[userRole] || menus.agent;

    return (
        <Box sx={{ 
            width: 280, 
            minWidth: 280, 
            bgcolor: 'background.paper', 
            height: '100vh', 
            borderRight: '1px solid #E0E0E0',
            position: 'sticky',
            top: 0
        }}>
            <Box sx={{ p: 3, textAlign: 'center', bgcolor: indigo[900], color: 'white' }}>
                <Typography variant="h6" fontWeight="900">
                    FASO <span style={{ color: '#FFD600' }}>LOGISTIQUE</span>
                </Typography>
            </Box>

            <List sx={{ px: 2, mt: 2 }}>
                {currentMenu.map((section, idx) => (
                    <Box key={idx} sx={{ mb: 3 }}>
                        <Typography variant="overline" sx={{ px: 2, fontWeight: '700', color: 'text.secondary' }}>
                            {section.title}
                        </Typography>
                        
                        {section.items.map((item, itemIdx) => (
                            <React.Fragment key={itemIdx}>
                                {item.children ? (
                                    <>
                                        <ListItemButton onClick={() => handleSubMenuClick(item.text)} sx={{ borderRadius: 2 }}>
                                            <ListItemIcon sx={{ minWidth: 40, color: indigo[500] }}>{item.icon}</ListItemIcon>
                                            <ListItemText primary={item.text} primaryTypographyProps={{ fontSize: '0.85rem' }} />
                                            {openSubMenu === item.text ? <ExpandLess /> : <ExpandMore />}
                                        </ListItemButton>
                                        <Collapse in={openSubMenu === item.text} timeout="auto" unmountOnExit>
                                            <List component="div" disablePadding sx={{ pl: 3 }}>
                                                {item.children.map((child, cIdx) => (
                                                    <ListItemButton key={cIdx} onClick={() => navigate(child.route)} sx={{ borderRadius: 2 }}>
                                                        <ListItemIcon sx={{ minWidth: 35 }}>{child.icon}</ListItemIcon>
                                                        <ListItemText primary={child.text} primaryTypographyProps={{ fontSize: '0.8rem' }} />
                                                    </ListItemButton>
                                                ))}
                                            </List>
                                        </Collapse>
                                    </>
                                ) : (
                                    <ListItemButton onClick={() => navigate(item.route)} sx={{ borderRadius: 2 }}>
                                        <ListItemIcon sx={{ minWidth: 40, color: indigo[500] }}>{item.icon}</ListItemIcon>
                                        <ListItemText primary={item.text} primaryTypographyProps={{ fontSize: '0.85rem' }} />
                                    </ListItemButton>
                                )}
                            </React.Fragment>
                        ))}
                    </Box>
                ))}
            </List>
        </Box>
    );
}