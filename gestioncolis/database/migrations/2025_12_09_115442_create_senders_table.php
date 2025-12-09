<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::table('senders', function (Blueprint $table) {
            $table->foreignId('user_id')->nullable()->constrained()->onDelete('set null')->after('id_number');
        });
    }

    public function down(): void
    {
        Schema::table('senders', function (Blueprint $table) {
            $table->dropConstrainedForeignId('user_id');
        });
    }
};

