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
        Schema::create('parcels', function (Blueprint $table) {
            $table->id();
            
            // Clé étrangère vers la table 'trips'
            $table->foreignId('trip_id')->constrained()->onDelete('cascade');

            $table->string('tracking_number')->unique();
            
            // --- Informations Expéditeur / Destinataire ---
            $table->string('sender_name');
            $table->string('sender_phone', 50);      // Ajout du téléphone expéditeur
            $table->string('recipient_name');
            $table->string('recipient_phone', 50);   // Ajout du téléphone destinataire
            
            // --- Détails Colis ---
            $table->decimal('weight_kg', 8, 2);
            $table->decimal('price', 8, 2);          // Ajout du prix (précision 8 chiffres, 2 décimales)
            $table->text('description')->nullable();
            
            // --- Statut et Dates ---
            $table->string('status')->default('pending'); // Ex: 'pending', 'in_transit', 'delivered'
            
            $table->timestamp('sent_at')->nullable();
            $table->timestamp('delivered_at')->nullable();

            $table->timestamps();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('parcels');
    }
};