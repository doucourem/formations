<?php

namespace Database\Factories;

use Illuminate\Database\Eloquent\Factories\Factory;
use App\Models\Ticket;
use App\Models\Trip;
use App\Models\User;

/**
 * @extends \Illuminate\Database\Eloquent\Factories\Factory<\App\Models\Ticket>
 */
class TicketFactory extends Factory
{
    protected $model = Ticket::class;

    public function definition(): array
    {
        return [
            'trip_id' => Trip::factory(), // Si tu as des voyages
            'user_id' => User::factory(), // Créateur
            'client_name' => $this->faker->name(),
            'client_nina' => $this->faker->numerify('#########'),
            'client_phone' => $this->faker->phoneNumber(),
            'client_email' => $this->faker->unique()->safeEmail(),
            'seat_number' => strtoupper($this->faker->randomLetter()) . $this->faker->numberBetween(1,50),
            'price' => $this->faker->numberBetween(1000, 5000),
            'status' => $this->faker->randomElement(['reserved', 'paid', 'canceled']),
            'created_at' => now(),
            'updated_at' => now(),
        ];
    }
}
