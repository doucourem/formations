<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up()
    {
        Schema::table('maintenance_tasks', function (Blueprint $table) {
            $table->unsignedBigInteger('bus_maintenance_id')->nullable()->after('id');
        });
    }

    public function down()
    {
        Schema::table('maintenance_tasks', function (Blueprint $table) {
            $table->dropColumn('bus_maintenance_id');
        });
    }
};
