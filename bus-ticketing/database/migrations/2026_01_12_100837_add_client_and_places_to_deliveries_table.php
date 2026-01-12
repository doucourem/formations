<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
   public function up(): void
{
    Schema::table('deliveries', function (Blueprint $table) {
        $table->string('client_name')->nullable()->after('driver_id');
        $table->string('departure_place')->nullable()->after('client_name');
        $table->string('arrival_place')->nullable()->after('departure_place');
    });
}


    public function down(): void
    {
        Schema::table('deliveries', function (Blueprint $table) {
            $table->dropColumn([
                'client_name',
                'departure_place',
                'arrival_place',
            ]);
        });
    }
};
