<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
   public function up(): void
{
    Schema::table('buses', function (Blueprint $table) {
        $table->string('vehicle_type')->after('type')->default('bus');
    });
}

public function down(): void
{
    Schema::table('buses', function (Blueprint $table) {
        $table->dropColumn('vehicle_type');
    });
}

};
