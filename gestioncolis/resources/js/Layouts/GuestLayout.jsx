import Sidebar from '@/Components/Sidebar';
import { Box } from '@mui/material';

export default function GuestLayout({ children }) {
    return (
        <Box sx={{ display: 'flex' }}> {/* C'est ce Flex qui met la sidebar à gauche */}
            <Sidebar />
            <Box component="main" sx={{ flexGrow: 1, p: 3, bgcolor: '#F5F5F5', minHeight: '100vh' }}>
                {children} {/* C'est ici que s'affichera votre tableau de trajets */}
            </Box>
        </Box>
    );
}