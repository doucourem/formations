<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;
use App\Models\Delivery;
use App\Models\Bus;
use App\Models\Driver;
use Carbon\Carbon;
use Illuminate\Support\Facades\DB;

class DeliverySeeder extends Seeder
{
    public function run(): void
    {
        $buses = Bus::all();
        $drivers = Driver::all();

        if ($buses->isEmpty() || $drivers->isEmpty()) {
            $this->command->error("Veuillez remplir d'abord les tables buses et drivers !");
            return;
        }

        // Générer 20 livraisons aléatoires
        for ($i = 0; $i < 20; $i++) {

            $bus = $buses->random();
            $driver = $drivers->random();
            $departure = Carbon::now()->subDays(rand(0, 30))->setHour(rand(6, 10));
            $arrival = (clone $departure)->addHours(rand(2, 12));

            $quantityLoaded = rand(100, 1000);
            $quantityDelivered = rand(50, $quantityLoaded);

            $delivery = Delivery::create([
                'vehicle_id' => $bus->id,
                'driver_id' => $driver->id,
                'product_name' => fake()->word() . ' ' . fake()->word(),
                'product_lot' => strtoupper(fake()->bothify('LOT-###??')),
                'quantity_loaded' => $quantityLoaded,
                'quantity_delivered' => $quantityDelivered,
                'departure_at' => $departure,
                'arrival_at' => $arrival,
                'status' => ['pending','in_transit','delivered'][rand(0,2)],
                'price' => rand(50000, 200000),
                'distance_km' => rand(10, 500),
                'client_name' => fake()->name(),
                'departure_place' => fake()->city(),
                'arrival_place' => fake()->city(),
                'created_at' => $departure,
                'updated_at' => $arrival,
            ]);

            // Dépenses liées à la livraison
            if (DB::getSchemaBuilder()->hasTable('delivery_expenses')) {
                $numExpenses = rand(1,3);
                for ($j=0; $j<$numExpenses; $j++) {
                    $delivery->expenses()->create([
    'type' => fake()->randomElement(['chauffeur','carburant','peages','restauration','entretien','autres']),
    'amount' => rand(5000, 50000),
    'description' => fake()->sentence(),
    'created_at' => $departure->copy()->addHours(rand(1,6)),
    'updated_at' => $departure->copy()->addHours(rand(1,6)),
]);

                }
            }
        }
    }
}
