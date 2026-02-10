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
    Schema::dropIfExists('tickets');
}

public function down(): void
{
    // Optionnel : recréer la table si rollback
    Schema::create('tickets', function (Blueprint $table) {
        $table->id();
        $table->timestamps();
    });
}
};
