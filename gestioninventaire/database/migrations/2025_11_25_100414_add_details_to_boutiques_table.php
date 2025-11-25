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
        Schema::table('boutiques', function (Blueprint $table) {
            $table->string('adresse')->nullable()->after('name');
            $table->string('telephone')->nullable()->after('adresse');
            $table->string('email')->nullable()->after('telephone');
            $table->text('description')->nullable()->after('email');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('boutiques', function (Blueprint $table) {
            $table->dropColumn(['adresse', 'telephone', 'email', 'description']);
        });
    }
};
