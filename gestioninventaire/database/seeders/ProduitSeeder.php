<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;
use App\Models\Produit;
use Faker\Factory as Faker;

class ProduitSeeder extends Seeder
{
    public function run()
    {
        $faker = Faker::create('fr_FR');

        // Liste d'exemples de produits alimentaires
        $aliments = [
            'Pain', 'Fromage', 'Lait', 'Beurre', 'Yaourt',
            'Pomme', 'Banane', 'Orange', 'Riz', 'Pâtes',
            'Poulet', 'Boeuf', 'Poisson', 'Œufs', 'Tomate',
            'Carotte', 'Pomme de terre', 'Chocolat', 'Café', 'Thé',
            'Jus d’orange', 'Eau minérale', 'Biscuits', 'Miel', 'Confiture'
        ];

        for ($i = 0; $i < 100; $i++) {
            Produit::create([
                'name' => $faker->randomElement($aliments) . ' ' . $faker->word, // Exemple : "Pain doux"
                'sale_price' => $faker->numberBetween(100, 2000),                 // Prix entre 1 et 20 €
                'photo' => 'https://via.placeholder.com/150',                     // Placeholder pour photo
            ]);
        }
    }
}
