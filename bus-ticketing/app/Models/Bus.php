<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class Bus extends Model
{
    use HasFactory;

    protected $fillable = [
        'registration_number',
        'model',
        'capacity',
        'status',
        'agency_id',
    ];

    /**
     * Relation : un bus appartient à une agence
     */
    public function agency()
    {
        return $this->belongsTo(Agency::class);
    }
}
