<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::table('vehicle_rentals', function (Blueprint $table) {
            // On commence par rendre les colonnes nullable pour SQLite
            $table->string('departure_location')->nullable()->after('rental_end');
            $table->string('arrival_location')->nullable()->after('departure_location');
        });
    }

    public function down(): void
    {
        Schema::table('vehicle_rentals', function (Blueprint $table) {
            $table->dropColumn(['departure_location', 'arrival_location']);
        });
    }
};
