<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class Boutique extends Model
{
    // Champs remplissables
    protected $fillable = [
        'name',
        'adresse',
        'telephone',
        'email',
        'description',
    ];

    // Relation avec les trimestres
    public function trimestres()
    {
        return $this->hasMany(Trimestre::class);
    }



// Boutique.php
public function produits()
{
    return $this->belongsToMany(Produit::class, 'boutique_produit');
}

}
