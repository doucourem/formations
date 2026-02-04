<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;
use App\Models\Trip;
use App\Models\Parcel;
use App\Models\TripExpense;
use Carbon\Carbon;
use Illuminate\Support\Facades\DB;

class LogisticsAndExpensesSeeder extends Seeder
{
    public function run(): void
    {
        $trips = Trip::all();

        foreach ($trips as $trip) {
            $date = Carbon::parse($trip->departure_time);

            // -------------------------------------------------------
            // 1. GÉNÉRATION DES COLIS (Revenus Additionnels)
            // -------------------------------------------------------
            // Chaque voyage transporte entre 3 et 8 colis
            $parcelCount = rand(3, 8);
            
            for ($i = 0; $i < $parcelCount; $i++) {
                Parcel::create([
                    'trip_id'      => $trip->id,
                    'sender_name'  => fake()->company(),
                    'sender_phone' => fake()->phoneNumber(),
                    'receiver_name'=> fake()->name(),
                    'receiver_phone'=> fake()->phoneNumber(),
                    'description'  => fake()->randomElement(['Carton de pièces', 'Sac de riz', 'Matériel médical', 'Documents']),
                    'weight'       => rand(1, 50),
                    'price'        => rand(2500, 15000), // Revenu colis
                    'status'       => 'delivered',
                    'created_at'   => $date,
                ]);
            }

            // -------------------------------------------------------
            // 2. GÉNÉRATION DES DÉPENSES (Contrôle des Coûts)
            // -------------------------------------------------------
            // A. Dépense Carburant (Systématique pour un voyage)
            TripExpense::create([
                'trip_id'     => $trip->id,
                'type'        => 'Carburant',
                'amount'      => rand(45000, 90000),
                'description' => 'Plein gazole avant départ',
                'created_at'  => $date,
            ]);

            // B. Dépenses Aléatoires (Péages, Police, Entretien mineur)
            $otherExpenses = [
                ['type' => 'Péage', 'min' => 2000, 'max' => 5000],
                ['type' => 'Restauration', 'min' => 5000, 'max' => 10000],
                ['type' => 'Maintenance Rapide', 'min' => 15000, 'max' => 30000],
            ];

            foreach ($otherExpenses as $ex) {
                if (rand(0, 1)) { // 50% de chance d'avoir cette dépense
                    TripExpense::create([
                        'trip_id'     => $trip->id,
                        'type'        => $ex['type'],
                        'amount'      => rand($ex['min'], $ex['max']),
                        'description' => 'Frais de route standard',
                        'created_at'  => $date,
                    ]);
                }
            }
        }
    }
}