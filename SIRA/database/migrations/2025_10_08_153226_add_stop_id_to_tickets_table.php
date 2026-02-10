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
            $table->unsignedBigInteger('stop_id')->nullable()->after('trip_id');

            // Optionnel : ajouter une contrainte de clé étrangère
            // $table->foreign('stop_id')
            //       ->references('id')
            //       ->on('trip_stops')
            //       ->onDelete('set null');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('tickets', function (Blueprint $table) {
            // Supprime la contrainte si elle existe
            // $table->dropForeign(['stop_id']);
            $table->dropColumn('stop_id');
        });
    }
};
