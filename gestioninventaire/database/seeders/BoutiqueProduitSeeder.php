<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;
use App\Models\Boutique;
use App\Models\Produit;

class BoutiqueProduitSeeder extends Seeder
{
    public function run()
    {
        $boutiques = Boutique::all();
        $produits = Produit::all();

        foreach ($produits as $produit) {
            $randomBoutiques = $boutiques->random(rand(1, 3));
            $produit->boutiques()->attach($randomBoutiques);
        }
    }
}
