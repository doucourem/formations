import InputError from '@/Components/InputError';
import InputLabel from '@/Components/InputLabel';
import PrimaryButton from '@/Components/PrimaryButton';
import TextInput from '@/Components/TextInput';
import { Head, Link, useForm } from '@inertiajs/react';
import { Box, Container, Typography, Paper, Stack, Grid } from '@mui/material';
import { GppGood, PersonAddAlt1 } from '@mui/icons-material';

export default function Register() {
    const { data, setData, post, processing, errors, reset } = useForm({
        name: '',
        email: '',
        password: '',
        password_confirmation: '',
    });

    const submit = (e) => {
        e.preventDefault();
        post(route('register'), {
            onFinish: () => reset('password', 'password_confirmation'),
        });
    };

    return (
        <Box sx={{ minHeight: '100vh', bgcolor: '#F8FAFC', display: 'flex', flexDirection: 'column' }}>
            <Head title="Inscription - SIRA MALI" />

            {/* --- HEADER --- */}
            <nav className="bg-white border-b py-4">
                <Container maxWidth="lg" className="flex justify-between items-center">
                    <Link href="/" className="flex items-center gap-3">
                        <div className="w-8 h-8 bg-slate-900 rounded-lg flex items-center justify-center">
                            <GppGood className="text-white" sx={{ fontSize: 20 }} />
                        </div>
                        <span className="text-xl font-black tracking-tighter uppercase">
                            SIRA MALI <span className="text-green-600">NUMÉRIQUE</span>
                        </span>
                    </Link>
                    <Link href={route('login')} className="text-sm font-bold text-slate-600 hover:text-green-600">
                        Déjà inscrit ? Connexion
                    </Link>
                </Container>
            </nav>

            <div className="flex-grow flex items-center justify-center p-6">
                <div className="w-full max-w-2xl">
                    <Paper elevation={0} sx={{ p: { xs: 4, md: 6 }, borderRadius: 8, border: '1px solid #e2e8f0' }}>
                        
                        <Stack spacing={1} sx={{ mb: 5, textAlign: 'center' }}>
                            <PersonAddAlt1 sx={{ fontSize: 40, color: '#10b981', mx: 'auto', mb: 1 }} />
                            <Typography variant="h4" fontWeight="900" color="#0f172a">
                                Créer un compte
                            </Typography>
                            <Typography variant="body1" color="text.secondary">
                                Rejoignez le réseau national de gestion du transport
                            </Typography>
                        </Stack>

                        <form onSubmit={submit}>
                            <Grid container spacing={3}>
                                {/* Nom Complet */}
                                <Grid item xs={12}>
                                    <InputLabel htmlFor="name" value="Nom complet ou Dénomination" />
                                    <TextInput
                                        id="name"
                                        name="name"
                                        value={data.name}
                                        className="mt-1 block w-full border-gray-200 focus:border-green-500 focus:ring-green-500 rounded-xl"
                                        autoComplete="name"
                                        isFocused={true}
                                        onChange={(e) => setData('name', e.target.value)}
                                        required
                                    />
                                    <InputError message={errors.name} className="mt-2" />
                                </Grid>

                                {/* Email */}
                                <Grid item xs={12}>
                                    <InputLabel htmlFor="email" value="Adresse e-mail professionnelle" />
                                    <TextInput
                                        id="email"
                                        type="email"
                                        name="email"
                                        value={data.email}
                                        className="mt-1 block w-full border-gray-200 focus:border-green-500 focus:ring-green-500 rounded-xl"
                                        autoComplete="username"
                                        onChange={(e) => setData('email', e.target.value)}
                                        required
                                    />
                                    <InputError message={errors.email} className="mt-2" />
                                </Grid>

                                {/* Mot de passe */}
                                <Grid item xs={12} md={6}>
                                    <InputLabel htmlFor="password" value="Mot de passe" />
                                    <TextInput
                                        id="password"
                                        type="password"
                                        name="password"
                                        value={data.password}
                                        className="mt-1 block w-full border-gray-200 focus:border-green-500 focus:ring-green-500 rounded-xl"
                                        autoComplete="new-password"
                                        onChange={(e) => setData('password', e.target.value)}
                                        required
                                    />
                                    <InputError message={errors.password} className="mt-2" />
                                </Grid>

                                {/* Confirmation */}
                                <Grid item xs={12} md={6}>
                                    <InputLabel htmlFor="password_confirmation" value="Confirmation" />
                                    <TextInput
                                        id="password_confirmation"
                                        type="password"
                                        name="password_confirmation"
                                        value={data.password_confirmation}
                                        className="mt-1 block w-full border-gray-200 focus:border-green-500 focus:ring-green-500 rounded-xl"
                                        autoComplete="new-password"
                                        onChange={(e) => setData('password_confirmation', e.target.value)}
                                        required
                                    />
                                    <InputError message={errors.password_confirmation} className="mt-2" />
                                </Grid>
                            </Grid>

                            <Box sx={{ mt: 5 }}>
                                <PrimaryButton 
                                    className="w-full justify-center py-4 bg-slate-900 hover:bg-slate-800 rounded-xl text-lg font-bold transition-all shadow-xl shadow-slate-200" 
                                    disabled={processing}
                                >
                                    Finaliser l'inscription
                                </PrimaryButton>
                            </Box>
                        </form>
                    </Paper>
                    
                    <Typography variant="body2" color="text.secondary" align="center" sx={{ mt: 4 }}>
                        En vous inscrivant, vous acceptez les conditions d'utilisation du système SIRA.
                    </Typography>
                </div>
            </div>
        </Box>
    );
}