<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up()
    {
        Schema::table('maintenance_tasks', function (Blueprint $table) {
            $table->unsignedBigInteger('maintenance_plan_task_id')->nullable()->after('bus_maintenance_id');
            // Vous pouvez ajouter la foreign key sur MySQL/PostgreSQL plus tard
        });
    }

    public function down()
    {
        Schema::table('maintenance_tasks', function (Blueprint $table) {
            $table->dropColumn('maintenance_plan_task_id');
        });
    }
};

