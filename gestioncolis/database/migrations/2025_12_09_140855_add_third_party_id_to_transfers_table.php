<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::table('transfers', function (Blueprint $table) {
            $table->foreignId('third_party_id')
                  ->nullable() // si tu veux que ce champ soit optionnel
                  ->constrained('third_parties')
                  ->cascadeOnDelete();
        });
    }

    public function down(): void
    {
        Schema::table('transfers', function (Blueprint $table) {
            $table->dropForeign(['third_party_id']);
            $table->dropColumn('third_party_id');
        });
    }
};
