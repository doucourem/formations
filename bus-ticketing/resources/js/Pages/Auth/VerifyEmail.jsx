import PrimaryButton from '@/Components/PrimaryButton';
import GuestLayout from '@/Layouts/GuestLayout';
import { Head, Link, useForm } from '@inertiajs/react';

export default function VerifyEmail({ status }) {
    const { post, processing } = useForm({});

    const submit = (e) => {
        e.preventDefault();
        post(route('verification.send'));
    };

    return (
        <GuestLayout>
            <Head title="Vérification de l'adresse e-mail" />

            <div className="mb-4 text-sm text-gray-600">
                Merci pour votre inscription ! Avant de commencer, veuillez vérifier
                votre adresse e-mail en cliquant sur le lien que nous venons de vous envoyer.
                Si vous n’avez pas reçu l’e-mail, nous vous en renverrons un avec plaisir.
            </div>

            {status === 'verification-link-sent' && (
                <div className="mb-4 text-sm font-medium text-green-600">
                    Un nouveau lien de vérification a été envoyé à l’adresse e-mail
                    que vous avez fournie lors de votre inscription.
                </div>
            )}

            <form onSubmit={submit}>
                <div className="mt-4 flex items-center justify-between">
                    <PrimaryButton disabled={processing}>
                        Renvoyer l’e-mail de vérification
                    </PrimaryButton>

                    <Link
                        href={route('logout')}
                        method="post"
                        as="button"
                        className="rounded-md text-sm text-gray-600 underline hover:text-gray-900 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2"
                    >
                        Se déconnecter
                    </Link>
                </div>
            </form>
        </GuestLayout>
    );
}
