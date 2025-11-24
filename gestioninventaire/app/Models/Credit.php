<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class Credit extends Model
{
    protected $table = 'credits'; // Nom de la table dans la base de données
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
