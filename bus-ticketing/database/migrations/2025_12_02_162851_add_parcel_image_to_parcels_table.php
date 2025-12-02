<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::table('parcels', function (Blueprint $table) {
            if (!Schema::hasColumn('parcels', 'sender_phone')) {
                // Nullable pour éviter l'erreur SQLite
                $table->string('sender_phone', 50)->nullable()->after('sender_name');
            }
            if (!Schema::hasColumn('parcels', 'recipient_phone')) {
                $table->string('recipient_phone', 50)->nullable()->after('recipient_name');
            }
            if (!Schema::hasColumn('parcels', 'parcel_image')) {
                $table->string('parcel_image')->nullable()->after('description');
            }
        });

        // Optionnel : remplir les valeurs vides pour les colis existants
        \DB::table('parcels')->whereNull('sender_phone')->update(['sender_phone' => '']);
        \DB::table('parcels')->whereNull('recipient_phone')->update(['recipient_phone' => '']);
    }

    public function down(): void
    {
        Schema::table('parcels', function (Blueprint $table) {
            if (Schema::hasColumn('parcels', 'sender_phone')) {
                $table->dropColumn('sender_phone');
            }
            if (Schema::hasColumn('parcels', 'recipient_phone')) {
                $table->dropColumn('recipient_phone');
            }
            if (Schema::hasColumn('parcels', 'parcel_image')) {
                $table->dropColumn('parcel_image');
            }
        });
    }
};

