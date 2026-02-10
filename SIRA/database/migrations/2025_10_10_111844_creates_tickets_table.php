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
        Schema::create('tickets', function (Blueprint $table) {
            $table->id();

            // Liens
            $table->unsignedBigInteger('trip_id')->nullable(); // Si lié à un voyage
            $table->unsignedBigInteger('user_id')->nullable(); // Créateur / vendeur

            // Infos client
            $table->string('client_name');   // Nom complet du client
            $table->string('client_nina')->nullable(); // Identifiant NINA
            $table->string('client_phone')->nullable();
            $table->string('client_email')->nullable();

            // Infos billet
            $table->string('seat_number')->nullable(); // Numéro de place
            $table->decimal('price', 10, 2); // Prix du billet
            
            // Statut
            $table->enum('status', ['reserved', 'paid', 'canceled'])->default('reserved');
            
            $table->timestamps();

            // Contraintes (optionnelles si relations)
            // $table->foreign('trip_id')->references('id')->on('trips')->onDelete('cascade');
            // $table->foreign('user_id')->references('id')->on('users')->onDelete('cascade');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('tickets');
    }
};
