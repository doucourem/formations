import Checkbox from '@/Components/Checkbox';
import InputError from '@/Components/InputError';
import InputLabel from '@/Components/InputLabel';
import PrimaryButton from '@/Components/PrimaryButton';
import TextInput from '@/Components/TextInput';
import { Head, Link, useForm } from '@inertiajs/react';
import { Box, Container, Typography, Paper, Stack } from '@mui/material';
import { GppGood } from '@mui/icons-material';

export default function Login({ status, canResetPassword }) {
    const { data, setData, post, processing, errors, reset } = useForm({
        email: '',
        password: '',
        remember: false,
    });

    const submit = (e) => {
        e.preventDefault();
        post(route('login'), {
            onFinish: () => reset('password'),
        });
    };

    return (
        <Box sx={{ 
            minHeight: '100vh', 
            display: 'flex', 
            flexDirection: 'column',
            bgcolor: '#F8FAFC' 
        }}>
            <Head title="Connexion - SIRA MALI" />

            {/* --- HEADER SIMPLIFIÉ --- */}
            <nav className="bg-white border-b py-4">
                <Container maxWidth="lg" className="flex justify-center">
                    <Link href="/" className="flex items-center gap-3">
                        <div className="w-8 h-8 bg-slate-900 rounded-lg flex items-center justify-center">
                            <GppGood className="text-white" sx={{ fontSize: 20 }} />
                        </div>
                        <span className="text-xl font-black tracking-tighter uppercase">
                            SIRA MALI <span className="text-green-600">NUMÉRIQUE</span>
                        </span>
                    </Link>
                </Container>
            </nav>

            <div className="flex-grow flex items-center justify-center p-6">
                <div className="w-full max-w-md">
                    <Paper elevation={0} sx={{ p: 5, borderRadius: 6, border: '1px solid #e2e8f0', bgcolor: 'white' }}>
                        
                        <Stack spacing={1} sx={{ mb: 4, textAlign: 'center' }}>
                            <Typography variant="h5" fontWeight="900" color="#0f172a">
                                Espace Sécurisé
                            </Typography>
                            <Typography variant="body2" color="text.secondary">
                                Connectez-vous pour gérer vos opérations
                            </Typography>
                        </Stack>

                        {status && (
                            <div className="mb-4 text-sm font-medium text-green-600 text-center bg-green-50 p-2 rounded-lg">
                                {status}
                            </div>
                        )}

                        <form onSubmit={submit} className="space-y-5">
                            <div>
                                <InputLabel htmlFor="email" value="Adresse e-mail professionnelle" />
                                <TextInput
                                    id="email"
                                    type="email"
                                    name="email"
                                    value={data.email}
                                    className="mt-1 block w-full border-gray-200 focus:border-green-500 focus:ring-green-500 rounded-xl"
                                    autoComplete="username"
                                    isFocused={true}
                                    onChange={(e) => setData('email', e.target.value)}
                                />
                                <InputError message={errors.email} className="mt-2" />
                            </div>

                            <div>
                                <InputLabel htmlFor="password" value="Mot de passe" />
                                <TextInput
                                    id="password"
                                    type="password"
                                    name="password"
                                    value={data.password}
                                    className="mt-1 block w-full border-gray-200 focus:border-green-500 focus:ring-green-500 rounded-xl"
                                    autoComplete="current-password"
                                    onChange={(e) => setData('password', e.target.value)}
                                />
                                <InputError message={errors.password} className="mt-2" />
                            </div>

                            <div className="flex items-center justify-between">
                                <label className="flex items-center">
                                    <Checkbox
                                        name="remember"
                                        checked={data.remember}
                                        className="text-green-600 focus:ring-green-500"
                                        onChange={(e) => setData('remember', e.target.checked)}
                                    />
                                    <span className="ml-2 text-sm text-gray-600">Rester connecté</span>
                                </label>

                                {canResetPassword && (
                                    <Link
                                        href={route('password.request')}
                                        className="text-sm text-green-700 font-semibold hover:underline"
                                    >
                                        Oublié ?
                                    </Link>
                                )}
                            </div>

                            <div className="pt-2">
                                <PrimaryButton 
                                    className="w-full justify-center py-3 bg-slate-900 hover:bg-slate-800 rounded-xl text-base font-bold transition-all shadow-lg shadow-slate-200" 
                                    disabled={processing}
                                >
                                    Accéder au portail
                                </PrimaryButton>
                            </div>
                        </form>

                        <div className="mt-8 pt-6 border-t border-gray-100 text-center">
                            <Typography variant="caption" color="text.secondary" sx={{ display: 'block' }}>
                                Plateforme certifiée
                            </Typography>
                        </div>
                    </Paper>

                    <p className="mt-6 text-center text-xs text-gray-400 uppercase tracking-widest font-bold">
                        &copy; 2026 SIRA MALI • Système de Suivi Intégré
                    </p>
                </div>
            </div>
        </Box>
    );
}