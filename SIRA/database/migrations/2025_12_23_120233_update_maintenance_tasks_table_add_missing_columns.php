<?php
use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up()
    {
        Schema::table('maintenance_tasks', function (Blueprint $table) {
            $table->string('status')->nullable()->after('maintenance_plan_task_id');
            // Les foreign keys peuvent être ajoutées plus tard si besoin
        });
    }

    public function down()
    {
        Schema::table('maintenance_tasks', function (Blueprint $table) {
            $table->dropColumn('status');
        });
    }
};

