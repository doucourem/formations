<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class Agency extends Model
{
    use HasFactory;

    protected $fillable = [
        'name',
        'city_id',
        'address',
    ];

    /**
     * Une agence appartient à une ville
     */
    public function city()
    {
        return $this->belongsTo(City::class);
    }

    /**
     * Une agence possède plusieurs bus
     */
    public function buses()
    {
        return $this->hasMany(Bus::class);
    }
}
