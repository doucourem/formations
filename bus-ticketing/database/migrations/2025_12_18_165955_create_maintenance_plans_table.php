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
    Schema::table('bus_maintenances', function (Blueprint $table) {
        $table->foreignId('maintenance_plan_id')->nullable()->after('bus_id');
        $table->date('next_due_date')->nullable();
        $table->integer('next_due_mileage')->nullable();
        $table->enum('status', ['planned', 'done', 'overdue'])->default('done');
    });
}

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('bus_maintenances', function (Blueprint $table) {
            //
        });
    }
};
