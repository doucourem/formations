<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    /**
     * Run the migrations.
     */
    public function up(): void
    {
       Schema::table('tickets', function (Blueprint $table) {
    $table->foreignId('start_stop_id')->nullable()->constrained('route_stops');
    $table->foreignId('end_stop_id')->nullable()->constrained('route_stops');
});
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('tickets', function (Blueprint $table) {
            //
        });
    }
};
