<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::table('parcels', function (Blueprint $table) {
            $table->foreignId('departure_agency_id')
                ->nullable()
                ->constrained('agencies')
                ->onDelete('set null');

            $table->foreignId('arrival_agency_id')
                ->nullable()
                ->constrained('agencies')
                ->onDelete('set null');
        });
    }

    public function down(): void
    {
        Schema::table('parcels', function (Blueprint $table) {
            $table->dropForeign(['departure_agency_id']);
            $table->dropForeign(['arrival_agency_id']);
            $table->dropColumn(['departure_agency_id', 'arrival_agency_id']);
        });
    }
};

