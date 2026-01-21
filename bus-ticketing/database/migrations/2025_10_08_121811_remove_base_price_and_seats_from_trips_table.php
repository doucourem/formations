<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::table('trips', function (Blueprint $table) {
            if (Schema::hasColumn('trips', 'base_price')) {
                $table->dropColumn('base_price');
            }
            if (Schema::hasColumn('trips', 'seats_available')) {
                $table->dropColumn('seats_available');
            }
        });
    }

    public function down(): void
    {
        Schema::table('trips', function (Blueprint $table) {
            $table->decimal('base_price', 10, 2)->default(0);
            $table->integer('seats_available')->default(0);
        });
    }
};
