<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration {
    public function up(): void
    {
        Schema::table('vehicle_rentals', function (Blueprint $table) {
            $table
                ->foreignId('driver_id')
                ->after('vehicle_id')
                 ->nullable()
                 ->constrained()
          ->nullOnDelete();
        });
    }

    public function down(): void
    {
        Schema::table('vehicle_rentals', function (Blueprint $table) {
            $table->dropForeign(['driver_id']);
            $table->dropColumn('driver_id');
        });
    }
};
