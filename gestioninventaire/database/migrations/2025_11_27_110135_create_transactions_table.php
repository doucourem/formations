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
        Schema::create('boutique_produit', function (Blueprint $table) {
    $table->id();
    $table->foreignId('boutique_id')->constrained()->cascadeOnDelete();
    $table->foreignId('produit_id')->constrained()->cascadeOnDelete();
});

    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('boutique_produit');
    }
};
