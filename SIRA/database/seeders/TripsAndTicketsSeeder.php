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

        // 🔹 Bases de prénoms et noms maliens
        $prenomsMaliensBase = [
            'Moussa','Fatoumata','Ousmane','Aminata','Ibrahim','Mariama','Adama','Awa','Souleymane','Salif',
            'Hawa','Abdoulaye','Bintou','Yacouba','Nafissatou','Cheick','Kadidia','Mahamadou','Fanta','Seydou',
        ];

        $nomMaliensBase = [
            'Diallo','Traoré','Coulibaly','Koné','Diarra','Keita','Cissé','Maïga','Sissoko','Sanogo',
            'Camara','Tounkara','Bagayoko','Fofana','Gassama','Bambara','Kone','Ouattara','Sidibé',
        ];

        // 🔹 Générer plus de 1000 éléments
        $prenomsMaliens = [];
        $nomMaliens = [];
        for ($i = 0; $i < 50; $i++) { // 20 x 50 = 1000+
            $prenomsMaliens = array_merge($prenomsMaliens, $prenomsMaliensBase);
            $nomMaliens = array_merge($nomMaliens, $nomMaliensBase);
        }
        shuffle($prenomsMaliens);
        shuffle($nomMaliens);

        // 🔹 Simulation sur les 30 derniers jours
        for ($i = 30; $i >= 0; $i--) {
            $date = Carbon::now()->subDays($i);
            $tripsPerDay = rand(5, 12);

            for ($j = 0; $j < $tripsPerDay; $j++) {
                $route = $routes->random();
                $bus = $buses->random();

                // 1️⃣ CRÉATION DU VOYAGE
                $trip = Trip::create([
                    'bus_id' => $bus->id,
                    'route_id' => $route->id,
                    'departure_at' => $date->copy()->setHour(rand(6, 22)),
                    'arrival_at' => $date->copy()->setHour(rand(23, 23)),
                    'created_at' => $date,
                ]);

                // 2️⃣ Tickets pour bus
                if ($bus->product_type === 'bus') {
                    $fillRate = rand(floor($bus->capacity * 0.5), floor($bus->capacity * 0.95));
                    for ($k = 0; $k < $fillRate; $k++) {
                        $client_name = $prenomsMaliens[array_rand($prenomsMaliens)] . ' ' 
                                     . $nomMaliens[array_rand($nomMaliens)];

                        Ticket::create([
                            'trip_id' => $trip->id,
                            'user_id' => $admin->id,
                            'client_name' => $client_name,
                            'client_nina' => fake()->numerify('################'),
                            'client_phone' => fake()->phoneNumber(),
                            'seat_number' => $k + 1,
                            'price' => $route->price,
                            'status' => 'paid',
                            'created_at' => $date->copy()->subHours(rand(1, 48)),
                        ]);
                    }
                } else {
                    // 3️⃣ Parcels pour Truck/Tanker
                    DB::table('parcels')->insert([
                        'trip_id' => $trip->id,
                        'tracking_number' => 'PN' . str_pad(rand(1,999999), 6, '0', STR_PAD_LEFT),
                        'sender_name' => 'Client Industriel',
                        'sender_phone' => fake()->phoneNumber(),
                        'recipient_name' => 'Distributeur Regional',
                        'recipient_phone' => fake()->phoneNumber(),
                        'description' => $bus->product_type === 'tanker' ? 'Hydrocarbures 45kL' : 'Marchandises Diverses',
                        'weight_kg' => $bus->max_load ?? 0,
                        'price' => rand(150000, 450000),
                        'status' => 'pending',
                        'created_at' => $date,
                        'updated_at' => $date,
                    ]);
                }

                // 4️⃣ Trip Expenses
                if ($date->isPast()) {
                    DB::table('trip_expenses')->insert([
                        'trip_id' => $trip->id,
                        'type' => 'maintenance', // ENUM / CHECK
                        'amount' => rand(40000, 95000),
                        'description' => 'Plein gazole',
                        'created_at' => $date,
                        'updated_at' => $date,
                    ]);

                    DB::table('trip_expenses')->insert([
                        'trip_id' => $trip->id,
                        'type' => 'other', // ENUM / CHECK
                        'amount' => rand(5000, 15000),
                        'description' => 'Péages et frais divers',
                        'created_at' => $date,
                        'updated_at' => $date,
                    ]);
                }
            }
        }
    }
}
