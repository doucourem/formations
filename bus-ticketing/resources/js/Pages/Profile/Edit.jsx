import GuestLayout from '@/Layouts/GuestLayout';
import { Head } from '@inertiajs/react';
import DeleteUserForm from './Partials/DeleteUserForm';
import UpdatePasswordForm from './Partials/UpdatePasswordForm';
import UpdateProfileInformationForm from './Partials/UpdateProfileInformationForm';

export default function Edit({ mustVerifyEmail, status }) {
    return (
        <GuestLayout
            header={
                <h2 className="text-xl font-semibold leading-tight text-gray-800">
                    Profil utilisateur
                </h2>
            }
        >
            <Head title="Profil" />

            <div className="py-12">
                <div className="mx-auto max-w-7xl space-y-6 sm:px-6 lg:px-8">
                    
                    {/* 🔹 Mise à jour des informations personnelles */}
                    <div className="bg-white p-4 shadow sm:rounded-lg sm:p-8">
                        <h3 className="text-lg font-medium text-gray-900 mb-4">
                            Mettre à jour mes informations personnelles
                        </h3>
                        <UpdateProfileInformationForm
                            mustVerifyEmail={mustVerifyEmail}
                            status={status}
                            className="max-w-xl"
                        />
                    </div>

                    {/* 🔹 Mise à jour du mot de passe */}
                    <div className="bg-white p-4 shadow sm:rounded-lg sm:p-8">
                        <h3 className="text-lg font-medium text-gray-900 mb-4">
                            Modifier mon mot de passe
                        </h3>
                        <UpdatePasswordForm className="max-w-xl" />
                    </div>

                    {/* 🔹 Suppression du compte */}
                    <div className="bg-white p-4 shadow sm:rounded-lg sm:p-8">
                        <h3 className="text-lg font-medium text-gray-900 mb-4 text-red-600">
                            Supprimer mon compte
                        </h3>
                        <DeleteUserForm className="max-w-xl" />
                    </div>
                </div>
            </div>
        </GuestLayout>
    );
}
