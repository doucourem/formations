<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;
use App\Models\Trip;
use App\Models\Parcel;
use App\Models\TripExpense;
use Carbon\Carbon;

class LogisticsAndExpensesSeeder extends Seeder
{
    public function run(): void
    {
        // On récupère les voyages avec leurs bus pour adapter les colis
        $trips = Trip::with('bus')->get();

        foreach ($trips as $trip) {
            $date = Carbon::parse($trip->departure_time);
            $bus = $trip->bus;

            // -------------------------------------------------------
            // 1. GÉNÉRATION DES COLIS / FRET
            // -------------------------------------------------------
            // Si c'est un "Bus", on met des petits colis. 
            // Si c'est un "Truck" ou "Tanker", on met du fret lourd.
            
            $isHeavy = in_array($bus->product_type, ['truck', 'tanker']);
            $parcelCount = $isHeavy ? rand(1, 2) : rand(3, 8);
            
            for ($i = 0; $i < $parcelCount; $i++) {
                Parcel::create([
                    'trip_id'      => $trip->id,
                    'sender_name'  => fake()->company(),
                    'sender_phone' => fake()->phoneNumber(),
                    'receiver_name'=> fake()->name(),
                    'receiver_phone'=> fake()->phoneNumber(),
                    'description'  => $isHeavy 
                                      ? ($bus->product_type === 'tanker' ? 'Hydrocarbures' : 'Matériaux de construction')
                                      : fake()->randomElement(['Carton de pièces', 'Sac de riz', 'Matériel médical', 'Documents']),
                    'weight'       => $isHeavy ? rand(5000, 30000) : rand(1, 50),
                    'price'        => $isHeavy ? rand(150000, 500000) : rand(2500, 15000), 
                    'status'       => 'delivered',
                    'created_at'   => $date,
                ]);
            }

            // -------------------------------------------------------
            // 2. GÉNÉRATION DES DÉPENSES (Logique de Rentabilité)
            // -------------------------------------------------------
            
            // A. Carburant : Plus élevé pour les gros porteurs
            $fuelBase = $isHeavy ? rand(150000, 300000) : rand(45000, 90000);
            TripExpense::create([
                'trip_id'     => $trip->id,
                'type'        => 'Carburant',
                'amount'      => $fuelBase,
                'description' => 'Plein gazole complet',
                'created_at'  => $date,
            ]);

            // B. Autres dépenses
            $otherExpenses = [
                ['type' => 'Péage', 'min' => 2000, 'max' => 5000],
                ['type' => 'Restauration', 'min' => 5000, 'max' => 10000],
                ['type' => 'Maintenance Rapide', 'min' => 15000, 'max' => 40000],
            ];

            foreach ($otherExpenses as $ex) {
                if (rand(0, 1)) { 
                    TripExpense::create([
                        'trip_id'     => $trip->id,
                        'type'        => $ex['type'],
                        'amount'      => rand($ex['min'], $ex['max']),
                        'description' => 'Frais opérationnels',
                        'created_at'  => $date,
                    ]);
                }
            }
        }
    }
}