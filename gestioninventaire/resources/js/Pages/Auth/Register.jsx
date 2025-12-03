import InputError from '@/Components/InputError';
import InputLabel from '@/Components/InputLabel';
import PrimaryButton from '@/Components/PrimaryButton';
import TextInput from '@/Components/TextInput';
import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import { Head, Link, useForm } from '@inertiajs/react';

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
        <AuthenticatedLayout>
            <Head title="Inscription" />

            <div className="flex justify-center items-center min-h-screen bg-gray-100 px-4">
                <div className="w-full max-w-sm bg-white p-6 rounded-xl shadow-lg">
                    <h1 className="text-center text-2xl font-semibold mb-6 text-gray-800">
                        Créer un compte
                    </h1>

                    <form onSubmit={submit} className="space-y-4">

                        {/* NAME */}
                        <div>
                            <InputLabel htmlFor="name" value="Nom complet" />
                            <TextInput
                                id="name"
                                name="name"
                                value={data.name}
                                className="mt-1 block w-full rounded-md border-gray-300 px-3 py-2 text-sm focus:ring-blue-500 focus:border-blue-500"
                                autoComplete="name"
                                isFocused={true}
                                onChange={(e) => setData('name', e.target.value)}
                                required
                            />
                            <InputError message={errors.name} className="mt-1 text-sm" />
                        </div>

                        {/* EMAIL */}
                        <div>
                            <InputLabel htmlFor="email" value="Adresse e-mail" />
                            <TextInput
                                id="email"
                                type="email"
                                name="email"
                                value={data.email}
                                className="mt-1 block w-full rounded-md border-gray-300 px-3 py-2 text-sm focus:ring-blue-500 focus:border-blue-500"
                                autoComplete="username"
                                onChange={(e) => setData('email', e.target.value)}
                                required
                            />
                            <InputError message={errors.email} className="mt-1 text-sm" />
                        </div>

                        {/* PASSWORD */}
                        <div>
                            <InputLabel htmlFor="password" value="Mot de passe" />
                            <TextInput
                                id="password"
                                type="password"
                                name="password"
                                value={data.password}
                                className="mt-1 block w-full rounded-md border-gray-300 px-3 py-2 text-sm focus:ring-blue-500 focus:border-blue-500"
                                autoComplete="new-password"
                                onChange={(e) => setData('password', e.target.value)}
                                required
                            />
                            <InputError message={errors.password} className="mt-1 text-sm" />
                        </div>

                        {/* PASSWORD CONFIRMATION */}
                        <div>
                            <InputLabel htmlFor="password_confirmation" value="Confirmer le mot de passe" />
                            <TextInput
                                id="password_confirmation"
                                type="password"
                                name="password_confirmation"
                                value={data.password_confirmation}
                                className="mt-1 block w-full rounded-md border-gray-300 px-3 py-2 text-sm focus:ring-blue-500 focus:border-blue-500"
                                autoComplete="new-password"
                                onChange={(e) => setData('password_confirmation', e.target.value)}
                                required
                            />
                            <InputError message={errors.password_confirmation} className="mt-1 text-sm" />
                        </div>

                        {/* BUTTON */}
                        <div className="flex items-center justify-between pt-4">
                            <Link href={route('login')} className="text-sm text-blue-600 hover:underline">
                                Déjà inscrit ?
                            </Link>

                            <PrimaryButton disabled={processing}>
                                S'inscrire
                            </PrimaryButton>
                        </div>
                    </form>
                </div>
            </div>
        </AuthenticatedLayout>
    );
}