<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration {
    public function up(): void
    {
        Schema::create('financial_note_values', function (Blueprint $table) {
            $table->uuid('id')->primary();
            $table->uuid('note_id');
            $table->text('field_key');
            $table->decimal('value', 12, 2)->default(0);
            $table->timestampsTz();
            $table->uuid('user_id');

            $table->unique(['note_id','user_id','field_key']);
            $table->foreign('note_id')->references('id')->on('financial_notes')->onDelete('cascade');
            $table->foreign('user_id')->references('id')->on('users');
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('financial_note_values');
    }
};

