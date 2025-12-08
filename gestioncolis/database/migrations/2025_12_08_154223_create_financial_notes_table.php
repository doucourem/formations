<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration {
    public function up(): void
    {
        Schema::create('financial_notes', function (Blueprint $table) {
            $table->uuid('id')->primary();
            $table->timestampsTz(); // created_at et updated_at
            $table->decimal('global_cash_balance', 12, 2)->default(0);
            $table->decimal('yawi_ash_balance', 12, 2)->default(0);
            $table->decimal('lpv_balance', 12, 2)->default(0);
            $table->decimal('airtel_money_balance', 12, 2)->default(0);
            $table->decimal('available_cash', 12, 2)->default(0);
            $table->decimal('balde_alpha_debt', 12, 2)->default(0);
            $table->decimal('md_owes_us', 12, 2)->default(0);
            $table->decimal('we_owe_md', 12, 2)->default(0);
            $table->text('notes')->nullable();
            $table->uuid('created_by');
            $table->uuid('updated_by')->nullable();

            $table->foreign('created_by')->references('id')->on('users');
            $table->foreign('updated_by')->references('id')->on('users');
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('financial_notes');
    }
};

