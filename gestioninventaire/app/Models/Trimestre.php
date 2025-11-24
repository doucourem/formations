<?php
namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
class Trimestre extends Model {
    protected $fillable = [
        'boutique_id', 'start_date', 'end_date', 'cash_start', 'cash_end', 'capital_start', 'capital_end', 'result'
    ];

    public function boutique() {
        return $this->belongsTo(Boutique::class);
    }

    public function stocks() {
        return $this->hasMany(StockTrimestre::class);
    }

    public function depenses() {
    return $this->hasMany(Depense::class);
}

public function credits() {
    return $this->hasMany(Credit::class);
}

}