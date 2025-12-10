<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration {
    public function up(): void
    {
        Schema::create('user_fields', function (Blueprint $table) {
    $table->id();
    $table->unsignedBigInteger('user_id');  // BIGINT UNSIGNED pour correspondre à users.id
    $table->text('field_key');
    $table->text('label');
    $table->text('category');
    $table->decimal('value', 12, 2)->nullable()->default(0);
    $table->smallInteger('display_order')->nullable();
    $table->boolean('is_active')->default(true);
    $table->timestampsTz();

    $table->foreign('user_id')->references('id')->on('users');
});

    }

    public function down(): void
    {
        Schema::dropIfExists('user_fields');
    }
};
