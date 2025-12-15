<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class Produit extends Model
{
    use HasFactory;

    protected $fillable = [
        'name',
        'description',
        'sale_price',
        'photo',
    ];

    // Relation many-to-many avec Boutique
    public function boutiques()
    {
        return $this->belongsToMany(Boutique::class, 'boutique_produit');
    }
}
