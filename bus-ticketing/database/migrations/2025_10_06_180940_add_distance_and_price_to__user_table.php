<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration {
    public function up(): void
    {
        Schema::table('users', function (Blueprint $table) {
            $table->string('prenom')->after('name')->nullable();
            $table->foreignId('agence_id')->nullable()->constrained('agencies')->cascadeOnDelete()->after('email');
        });
    }

    public function down(): void
    {
        Schema::table('users', function (Blueprint $table) {
            $table->dropForeign(['agence_id']);
            $table->dropColumn(['prenom', 'agence_id']);
        });
    }
};
