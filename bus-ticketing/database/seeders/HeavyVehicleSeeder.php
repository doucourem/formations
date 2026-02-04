<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\DB;
use Carbon\Carbon;

class HeavyVehicleSeeder extends Seeder
{
    public function run(): void
    {
        // 1. AJOUT DE COMPAGNIES DE FRET (Type 'cargo' selon votre migration)
        $logisticsCompanies = [
            [
                'name' => 'Mali Fret Logistique (MFL)',
                'type' => 'cargo', // Correspond à l'enum de votre migration
                'address' => 'Zone Industrielle, Bamako',
                'contact' => '+223 20 22 44 55',
                'created_at' => now(),
            ],
            [
                'name' => 'Hydro-Mali Transport',
                'type' => 'cargo',
                'address' => 'Avenue de la Liberté, Kayes',
                'contact' => '+223 77 00 11 22',
                'created_at' => now(),
            ],
        ];

        // On récupère les IDs après insertion pour les lier aux véhicules
        foreach ($logisticsCompanies as $company) {
            $companyId = DB::table('companies')->insertGetId($company);

            // 2. INSERTION DES VÉHICULES LOURDS POUR CHAQUE COMPAGNIE
            if ($company['name'] === 'Mali Fret Logistique (MFL)') {
                DB::table('buses')->insert([
                    [
                        'registration_number' => 'LOURD-001-MD',
                        'model' => 'Renault Kerax 440 (Plateau)',
                        'capacity' => 40000,
                        'status' => 'available',
                        'agency_id' => 1, // Bamako
                        'company_id' => $companyId,
                        'created_at' => now(),
                    ],
                    [
                        'registration_number' => 'MINE-04-MD',
                        'model' => 'Scania G440 (Benne)',
                        'capacity' => 35000,
                        'status' => 'maintenance',
                        'agency_id' => 9, // Kenieba
                        'company_id' => $companyId,
                        'created_at' => now(),
                    ]
                ]);
            } else {
                DB::table('buses')->insert([
                    [
                        'registration_number' => 'CITERNE-09-MD',
                        'model' => 'Mercedes Actros (Citerne)',
                        'capacity' => 45000,
                        'status' => 'available',
                        'agency_id' => 2, // Kayes
                        'company_id' => $companyId,
                        'created_at' => now(),
                    ]
                ]);
            }
        }
    }
}