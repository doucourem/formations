<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\DB;

class UsersSeeder extends Seeder
{
    public function run(): void
    {
        // Récupérer toutes les agences existantes
        $agences = DB::table('agencies')->pluck('id')->toArray();
        if (empty($agences)) {
            $this->command->error("Pas d'agences en base ! Veuillez d'abord exécuter le seeder des agences.");
            return;
        }

        // --- 1. L'utilisateur ministre ---
        DB::table('users')->updateOrInsert(
            ['email' => 'ministre@transport.ml'],
            [
                'prenom' => 'Ministre',
                'name' => 'Transport',
                'password' => bcrypt('direction2026'),
                'role' => 'admin',
                'agence_id' => null,
                'created_at' => now(),
                'updated_at' => now(),
            ]
        );

        // --- 2. Définition des rôles ---
        $roles = [
            'super_admin'    => 'Super Administrateur',
            'admin'          => 'Administrateur',
            'garage'         => 'Garagiste',
            'manager'        => 'Manager',
            'manageragence'  => 'Chef d\'agence',
            'agent'          => 'Billetaire',
            'chauffeur'      => 'Chauffeur',
            'logistique'     => 'Responsable logistique',
            'etat'           => 'Etat malien',
        ];

        // Listes de prénoms et noms maliens
        $prenoms = ['Moussa','Fatoumata','Ousmane','Aminata','Ibrahim','Mariama','Adama','Awa','Souleymane','Salif','Hawa','Abdoulaye','Bintou','Yacouba','Nafissatou','Cheick','Kadidia','Mahamadou','Fanta','Seydou'];
        $noms = ['Diallo','Traoré','Coulibaly','Koné','Diarra','Keita','Cissé','Maïga','Sissoko','Sanogo','Camara','Tounkara','Bagayoko','Fofana','Gassama','Bambara','Kone','Ouattara','Sidibé'];

        // --- 3. Création des utilisateurs avec agence ---
        foreach ($roles as $roleValue => $roleLabel) {
            $agenceId = in_array($roleValue, ['super_admin', 'etat']) ? null : $agences[array_rand($agences)];
            $email = strtolower($roleValue) . '@transport.ml';
            $prenom = $prenoms[array_rand($prenoms)];
            $nom = $noms[array_rand($noms)];

            DB::table('users')->updateOrInsert(
                ['email' => $email],
                [
                    'prenom' => $prenom,
                    'name' => $nom,
                    'password' => bcrypt('password2026'),
                    'role' => $roleValue,
                    'agence_id' => $agenceId,
                    'created_at' => now(),
                    'updated_at' => now(),
                ]
            );
        }

        // --- 4. Génération d'utilisateurs supplémentaires ---
        $additionalUsers = [
            'chauffeur' => 2,
            'agent' => 10,
            'manager' => 3,
        ];

        foreach ($additionalUsers as $role => $count) {
            for ($i = 1; $i <= $count; $i++) {
                $email = $role . $i . '@transport.ml';
                $prenom = $prenoms[array_rand($prenoms)];
                $nom = $noms[array_rand($noms)];
                $agenceId = $agences[array_rand($agences)];

                DB::table('users')->updateOrInsert(
                    ['email' => $email],
                    [
                        'prenom' => $prenom,
                        'name' => $nom,
                        'password' => bcrypt('password2026'),
                        'role' => $role,
                        'agence_id' => $agenceId,
                        'created_at' => now(),
                        'updated_at' => now(),
                    ]
                );
            }
        }
    }
}
