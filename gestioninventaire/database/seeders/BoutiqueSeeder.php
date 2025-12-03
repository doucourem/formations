<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;
use App\Models\Boutique;
use Faker\Factory as Faker;

class BoutiqueSeeder extends Seeder
{
    public function run()
    {
        $faker = Faker::create('fr_FR'); // Pour noms français, optionnel

        for ($i = 0; $i < 5; $i++) {
            Boutique::create([
                'name' => $faker->name,                    // Nom de personne
                'adresse' => $faker->address,             // Adresse aléatoire
                'telephone' => $faker->phoneNumber,       // Téléphone aléatoire
                'email' => $faker->unique()->safeEmail,   // Email unique
                'description' => $faker->sentence,        // Description courte
            ]);
        }
    }
}
