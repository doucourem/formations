<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;
use App\Models\Ticket;
use App\Models\Trip;
use App\Models\User;
use App\Models\Bus;
use App\Models\Route;
use Carbon\Carbon;
use Illuminate\Support\Facades\DB;

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

        // Simulation sur les 30 derniers jours
        for ($i = 30; $i >= 0; $i--) {
            $date = Carbon::now()->subDays($i);
            $tripsPerDay = rand(5, 12);

            for ($j = 0; $j < $tripsPerDay; $j++) {
                $route = $routes->random();
                $bus = $buses->random();

                // 1. CRÉATION DU VOYAGE
                $trip = Trip::create([
                    'bus_id' => $bus->id,
                    'route_id' => $route->id,
                    'driver_id' => rand(1, 5),
                    'departure_time' => $date->copy()->setHour(rand(6, 22)),
                    'status' => $date->isPast() ? 'completed' : 'scheduled',
                    'created_at' => $date,
                ]);

                // 2. LOGIQUE DIFFÉRENCIÉE SELON LE TYPE DE VÉHICULE
                if ($bus->product_type === 'bus') {
                    // C'est un bus : On génère des passagers (Tickets)
                    $fillRate = rand(floor($bus->capacity * 0.5), floor($bus->capacity * 0.95));
                    
                    for ($k = 0; $k < $fillRate; $k++) {
                        Ticket::create([
                            'trip_id' => $trip->id,
                            'user_id' => $admin->id,
                            'client_name' => fake()->name(),
                            'client_nina' => fake()->numerify('################'),
                            'client_phone' => fake()->phoneNumber(),
                            'seat_number' => $k + 1,
                            'price' => $route->price,
                            'status' => 'paid',
                            'created_at' => $date->copy()->subHours(rand(1, 48)),
                        ]);
                    }
                } else {
                    // C'est un Truck ou Tanker : On génère des revenus de Fret (Colis/Cargo)
                    // On simule une livraison unique mais à forte valeur
                    DB::table('parcels')->insert([
                        'trip_id' => $trip->id,
                        'sender_name' => 'Client Industriel',
                        'receiver_name' => 'Distributeur Regional',
                        'description' => $bus->product_type === 'tanker' ? 'Hydrocarbures 45kL' : 'Marchandises Diverses',
                        'weight' => $bus->max_load ?? 0,
                        'price' => rand(150000, 450000), // Revenu beaucoup plus élevé que les billets
                        'status' => 'delivered',
                        'created_at' => $date,
                    ]);
                }

                // 3. GÉNÉRATION DES DÉPENSES (Rentabilité)
                if ($date->isPast()) {
                    // Carburant
                    DB::table('trip_expenses')->insert([
                        'trip_id' => $trip->id,
                        'type' => 'Carburant',
                        'amount' => rand(40000, 95000),
                        'description' => 'Plein gazole',
                        'created_at' => $date
                    ]);

                    // Frais de route (Péages, Police, etc.)
                    DB::table('trip_expenses')->insert([
                        'trip_id' => $trip->id,
                        'type' => 'Frais de route',
                        'amount' => rand(5000, 15000),
                        'description' => 'Péages et frais divers',
                        'created_at' => $date
                    ]);
                }
            }
        }
    }
}