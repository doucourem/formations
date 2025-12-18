<?php

// ================================
// MIGRATION: maintenance_plans
// ================================
use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration {
    public function up(): void
    {
        Schema::create('maintenance_plans', function (Blueprint $table) {
            $table->id();
            $table->string('name');
            $table->enum('interval_type', ['days', 'km']);
            $table->integer('interval_value');
            $table->string('vehicle_type'); // bus, truck, citerne, btp
            $table->text('description')->nullable();
            $table->timestamps();
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('maintenance_plans');
    }
};

// ================================
// MIGRATION: maintenance_tasks
// ================================
return new class extends Migration {
    public function up(): void
    {
        Schema::create('maintenance_tasks', function (Blueprint $table) {
            $table->id();
            $table->foreignId('maintenance_plan_id')->constrained()->cascadeOnDelete();
            $table->string('task_name');
            $table->boolean('mandatory')->default(true);
            $table->timestamps();
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('maintenance_tasks');
    }
};

// ================================
// MIGRATION: maintenances (update)
// ================================
return new class extends Migration {
    public function up(): void
    {
        Schema::table('maintenances', function (Blueprint $table) {
            $table->foreignId('maintenance_plan_id')->nullable()->after('bus_id');
            $table->date('next_due_date')->nullable();
            $table->integer('next_due_mileage')->nullable();
            $table->enum('status', ['planned', 'done', 'overdue'])->default('done');
        });
    }

    public function down(): void
    {
        Schema::table('maintenances', function (Blueprint $table) {
            $table->dropColumn(['maintenance_plan_id', 'next_due_date', 'next_due_mileage', 'status']);
        });
    }
};

// ================================
// MODELS
// ================================




// ================================
// ROUTE API
// ================================
// routes/web.php
