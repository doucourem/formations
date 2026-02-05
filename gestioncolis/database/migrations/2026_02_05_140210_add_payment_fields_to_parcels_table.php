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
        Schema::table('parcels', function (Blueprint $table) {
            $table->decimal('paid_amount', 15, 2)
                  ->default(0)
                  ->after('price')
                  ->comment('Montant déjà payé pour le colis');

            $table->decimal('remaining_amount', 15, 2)
                  ->default(0)
                  ->after('paid_amount')
                  ->comment('Montant restant à payer pour le colis');
        });

        DB::table('parcels')->update([
    'remaining_amount' => DB::raw('price')
]);
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('parcels', function (Blueprint $table) {
            $table->dropColumn(['paid_amount', 'remaining_amount']);
        });
    }
};
