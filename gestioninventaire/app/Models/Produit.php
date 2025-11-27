<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
class Produit extends Model {
    protected $fillable = ['name', 'sale_price', 'photo'];


        // Produit.php
public function boutiques()
{
    return $this->belongsToMany(Boutique::class, 'boutique_produit');
}
}
