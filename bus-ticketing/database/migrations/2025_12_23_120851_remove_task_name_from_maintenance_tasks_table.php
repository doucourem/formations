<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up()
    {
        Schema::table('maintenance_tasks', function (Blueprint $table) {
            $table->dropColumn('task_name');
        });
    }

    public function down()
    {
        Schema::table('maintenance_tasks', function (Blueprint $table) {
            $table->string('task_name')->nullable();
        });
    }
};

