import Checkbox from '@/Components/Checkbox';
import InputError from '@/Components/InputError';
import InputLabel from '@/Components/InputLabel';
import PrimaryButton from '@/Components/PrimaryButton';
import TextInput from '@/Components/TextInput';
import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import { Head, Link, useForm } from '@inertiajs/react';

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
        <AuthenticatedLayout>
            <Head title="Connexion" />

            <div className="flex justify-center items-center min-h-screen bg-gray-100 px-4">
                <div className="w-full max-w-sm bg-white p-6 rounded-xl shadow-lg">
                    {status && (
                        <div className="mb-4 text-sm font-medium text-green-600 text-center">
                            {status}
                        </div>
                    )}

                    <form onSubmit={submit} className="space-y-4">
                        {/* Email */}
                        <div>
                            <InputLabel htmlFor="email" value="Adresse e-mail" />

                            <TextInput
                                id="email"
                                type="email"
                                name="email"
                                value={data.email}
                                className="mt-1 block w-full rounded-md border-gray-300 px-3 py-2 text-sm focus:ring-blue-500 focus:border-blue-500"
                                autoComplete="username"
                                isFocused={true}
                                onChange={(e) => setData('email', e.target.value)}
                            />

                            <InputError message={errors.email} className="mt-1 text-sm" />
                        </div>

                        {/* Password */}
                        <div>
                            <InputLabel htmlFor="password" value="Mot de passe" />

                            <TextInput
                                id="password"
                                type="password"
                                name="password"
                                value={data.password}
                                className="mt-1 block w-full rounded-md border-gray-300 px-3 py-2 text-sm focus:ring-blue-500 focus:border-blue-500"
                                autoComplete="current-password"
                                onChange={(e) => setData('password', e.target.value)}
                            />

                            <InputError message={errors.password} className="mt-1 text-sm" />
                        </div>

                        {/* Remember me */}
                        <div className="flex items-center">
                            <Checkbox
                                name="remember"
                                checked={data.remember}
                                onChange={(e) => setData('remember', e.target.checked)}
                            />
                            <span className="ml-2 text-sm text-gray-600">Se souvenir de moi</span>
                        </div>

                        {/* Buttons & links */}
                        <div className="flex items-center justify-between">
                            {canResetPassword && (
                                <Link
                                    href={route('password.request')}
                                    className="text-sm text-gray-600 underline hover:text-gray-900"
                                >
                                    Mot de passe oublié ?
                                </Link>
                            )}

                            <PrimaryButton
                                className="ml-2 px-4 py-2 text-sm"
                                disabled={processing}
                            >
                                Se connecter
                            </PrimaryButton>
                        </div>
                    </form>
                </div>
            </div>
        </AuthenticatedLayout>
    );
}
