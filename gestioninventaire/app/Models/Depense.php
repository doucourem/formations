<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class Depense extends Model
{
    protected $table = 'depenses'; // Nom de la table dans la base de données
    protected $fillable = [
        'trimestre_id',
        'amount',
        'description',
    ];

    // Relation vers le trimestre
    public function trimestre()
    {
        return $this->belongsTo(Trimestre::class);
    }
}

