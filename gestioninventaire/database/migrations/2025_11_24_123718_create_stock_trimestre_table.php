<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('stock_trimestre', function (Blueprint $table) {
            $table->id();
            $table->foreignId('trimestre_id')
                  ->constrained()
                  ->onDelete('cascade');
            $table->foreignId('produit_id')
                  ->constrained()
                  ->onDelete('cascade');
            $table->integer('quantity_start')->default(0);
            $table->integer('quantity_end')->default(0);
            $table->decimal('value_start', 10, 2)->default(0);
            $table->decimal('value_end', 10, 2)->default(0);
            $table->timestamps();
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('stock_trimestre');
    }
};
