<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    /**
     * Run the migrations.
     */
    public function up()
{
    Schema::table('route_stops', function (Blueprint $table) {
        $table->unsignedBigInteger('to_city_id')->nullable()->after('city_id');
    });

    Schema::table('tickets', function (Blueprint $table) {
    $table->foreignId('start_stop_id')->nullable()->constrained('route_stops');
    $table->foreignId('end_stop_id')->nullable()->constrained('route_stops');
});
}

public function down()
{
    Schema::table('route_stops', function (Blueprint $table) {
        $table->dropColumn('to_city_id');
    });
}


    /**
     * Reverse the migrations.
     */
   
};
