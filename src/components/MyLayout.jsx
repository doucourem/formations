import { Layout, AppBar, UserMenu, useGetIdentity,useLogout  } from 'react-admin';
import { Typography } from '@mui/material';

const MyAppBar = (props) => {
  const { data: user } = useGetIdentity();
 const { data: identity } = useGetIdentity();
  const logout = useLogout();
  return (
    <AppBar {...props} userMenu={<UserMenu />}>
      <Typography
        variant="h6"
        color="inherit"
        sx={{ flex: 1, textAlign: 'center' }}
      >
        Admin - Bienvenue {user?.email || ''}
        {identity?.fullName || 'Utilisateur'}
      </Typography>
    </AppBar>
  );
};

const MyLayout = (props) => <Layout {...props} appBar={MyAppBar} />;

export default MyLayout;
