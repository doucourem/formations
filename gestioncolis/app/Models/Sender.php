<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;


class Sender extends Model
{
    protected $fillable = ['name', 'phone', 'id_type', 'id_number'];
}
