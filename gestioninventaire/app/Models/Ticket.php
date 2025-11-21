<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class Ticket extends Model
{
    use HasFactory;

    protected $fillable = [
        'trip_id',
        'user_id',
        'client_name',
        'client_nina',
        'seat_number',
        'price',
        'status',
        'start_stop_id',  // ajouté
        'end_stop_id',    // ajouté
    ];

    public function trip()
    {
        return $this->belongsTo(Trip::class);
    }

    public function user()
    {
        return $this->belongsTo(User::class);
    }

    public function startStop()
    {
        return $this->belongsTo(RouteStop::class, 'start_stop_id');
    }

    public function endStop()
    {
        return $this->belongsTo(RouteStop::class, 'end_stop_id');
    }
}

class Produit extends Model {
    protected $fillable = ['name'];
}


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
