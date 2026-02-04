<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\DB;
use App\Models\Bus;
use App\Models\Company;
use Carbon\Carbon;

class DeliveryAndRentalSeeder extends Seeder
{
    public function run(): void
    {
        $buses = Bus::all();
        $companies = Company::all();

        // 1. MODULE LIVRAISON (Colis non liés à un trajet spécifique)
        // Utile pour montrer la gestion des stocks en entrepôt (Gare)
        for ($i = 0; $i < 20; $i++) {
            DB::table('parcels')->insert([
                'sender_name' => fake()->name(),
                'receiver_name' => fake()->name(),
                'receiver_phone' => fake()->phoneNumber(),
                'description' => fake()->randomElement(['Documents confidentiels', 'Électronique', 'Produits périssables']),
                'weight' => rand(1, 100),
                'price' => rand(5000, 25000),
                'status' => fake()->randomElement(['pending', 'in_transit', 'delivered']),
                'tracking_code' => 'ML-' . strtoupper(fake()->bothify('??###')),
                'created_at' => Carbon::now()->subDays(rand(1, 15)),
            ]);
        }

        // 2. MODULE LOCATION (Contrats Spéciaux)
        // Idéal pour montrer la rentabilité des véhicules VIP
        $vipBus = $buses->where('model', 'like', '%VIP%')->first();
        
        $rentals = [
            [
                'bus_id' => $vipBus->id ?? 1,
                'client_name' => 'ONG Action Mali',
                'start_date' => Carbon::now()->addDays(2),
                'end_date' => Carbon::now()->addDays(5),
                'total_price' => 750000, // 250.000 / jour
                'status' => 'active',
            ],
            [
                'bus_id' => $buses->where('product_type', 'truck')->first()->id ?? 2,
                'client_name' => 'Société de Construction BKO',
                'start_date' => Carbon::now()->subDays(10),
                'end_date' => Carbon::now()->subDays(7),
                'total_price' => 450000,
                'status' => 'completed',
            ]
        ];

        foreach ($rentals as $rental) {
            DB::table('rentals')->insert(array_merge($rental, ['created_at' => now()]));
        }
    }
}