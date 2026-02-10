<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::table('buses', function (Blueprint $table) {
            $table->integer('capacity')->nullable()->change(); // déjà existant
            $table->decimal('max_load', 8, 2)->nullable();    // Camion
            $table->decimal('tank_capacity', 10, 2)->nullable(); // Citerne
            $table->string('product_type')->nullable();      // Citerne
            $table->integer('compartments')->nullable();
            $table->string('tank_material')->nullable();
            $table->string('pump_type')->nullable();
            $table->boolean('adr_certified')->default(false);
            $table->boolean('fire_extinguisher')->default(false);
            $table->date('last_inspection_date')->nullable();
            $table->date('next_inspection_date')->nullable();
        });
    }

    public function down(): void
    {
        Schema::table('buses', function (Blueprint $table) {
            $table->dropColumn([
                'max_load',
                'tank_capacity',
                'product_type',
                'compartments',
                'tank_material',
                'pump_type',
                'adr_certified',
                'fire_extinguisher',
                'last_inspection_date',
                'next_inspection_date',
            ]);
        });
    }
};

