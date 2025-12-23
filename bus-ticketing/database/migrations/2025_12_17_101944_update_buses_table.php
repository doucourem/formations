<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::table('buses', function (Blueprint $table) {

            // 🔄 Amélioration du statut
            $table->enum('status', ['active', 'maintenance', 'inactive'])
                  ->default('active')
                  ->change();

            // ➕ Suivi maintenance
            $table->date('last_maintenance_date')->nullable()->after('status');
            $table->date('next_maintenance_date')->nullable()->after('last_maintenance_date');

            // ➕ Infos techniques
            $table->string('fuel_type')->nullable()->after('capacity'); // diesel, essence
            $table->decimal('fuel_capacity', 8, 2)->nullable()->after('fuel_type');

            // ➕ Exploitation
            $table->integer('year')->nullable()->after('model');
            $table->string('chassis_number')->nullable()->after('year');
            $table->integer('mileage')->default(0)->after('chassis_number');
        });
    }

    public function down(): void
    {
        Schema::table('buses', function (Blueprint $table) {

            // ⬇️ Suppression des champs ajoutés
            $table->dropColumn([
                'last_maintenance_date',
                'next_maintenance_date',
                'fuel_type',
                'fuel_capacity',
                'year',
                'chassis_number',
                'mileage',
            ]);

            // ⬇️ Retour ancien statut
            $table->string('status')->default('available')->change();
        });
    }
};
