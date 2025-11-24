<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;


class StockTrimestre extends Model {
    protected $table = 'stock_trimestre';
    protected $fillable = ['trimestre_id', 'produit_id', 'quantity_start', 'quantity_end', 'value_start', 'value_end'];

    public function produit() {
        return $this->belongsTo(Produit::class);
    }

    public function trimestre() {
        return $this->belongsTo(Trimestre::class);
    }
}