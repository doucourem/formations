<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;
use App\Models\Ticket;
use App\Models\Trip;
use App\Models\User;
use App\Models\Bus;
use App\Models\Route;
use Carbon\Carbon;

class TripsAndTicketsSeeder extends Seeder
{
    public function run(): void
    {
        $admin = User::where('role', 'admin')->first() ?? User::factory()->create(['role' => 'admin']);
        $buses = Bus::all();
        $routes = Route::all();

        if ($routes->isEmpty() || $buses->isEmpty()) {
            $this->command->error("Veuillez d'abord remplir les tables buses et routes !");
            return;
        }

        // Boucle sur les 30 derniers jours
        for ($i = 30; $i >= 0; $i--) {
            $date = Carbon::now()->subDays($i);
            
            // Créer entre 5 et 10 voyages par jour pour simuler une grosse activité
            $tripsPerDay = rand(5, 10);

            for ($j = 0; $j < $tripsPerDay; $j++) {
                $route = $routes->random();
                $bus = $buses->random();

                $trip = Trip::create([
                    'bus_id' => $bus->id,
                    'route_id' => $route->id, // Assurez-vous que le nom de la colonne correspond
                    'driver_id' => rand(1, 5), // Assume que vous avez des chauffeurs
                    'departure_time' => $date->copy()->setHour(rand(6, 22)),
                    'status' => $date->isPast() ? 'completed' : 'scheduled',
                    'created_at' => $date,
                    'updated_at' => $date,
                ]);

                // Remplissage aléatoire du bus (entre 40% et 95%)
                $ticketsToCreate = rand(floor($bus->capacity * 0.4), floor($bus->capacity * 0.95));

                for ($k = 0; $k < $ticketsToCreate; $k++) {
                    Ticket::create([
                        'trip_id' => $trip->id,
                        'user_id' => $admin->id,
                        'client_name' => fake()->name(),
                        'client_nina' => fake()->numerify('################'), // NINA malien
                        'client_phone' => fake()->phoneNumber(),
                        'seat_number' => $k + 1,
                        'price' => $route->price,
                        'status' => 'paid',
                        'created_at' => $date->copy()->subHours(rand(1, 24)), // Acheté un peu avant
                    ]);
                }

                // AJOUT DE DÉPENSES pour tester la rentabilité (Carburant, Péage)
                if ($date->isPast()) {
                    $fuelPrice = rand(40000, 80000);
                    \DB::table('trip_expenses')->insert([
                        'trip_id' => $trip->id,
                        'type' => 'Carburant',
                        'amount' => $fuelPrice,
                        'description' => 'Plein gazole',
                        'created_at' => $date
                    ]);
                }
            }
        }
    }
}