<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::table('vehicle_rental_payments', function (Blueprint $table) {
            // In SQLite, you cannot change a column easily. 
            // Workaround: If using Laravel >= 8, use doctrine/dbal package
            $table->string('payment_method')->default('cash')->nullable(false)->change();
        });
    }

    public function down(): void
    {
        Schema::table('vehicle_rental_payments', function (Blueprint $table) {
            $table->string('payment_method')->nullable()->default(null)->change();
        });
    }
};