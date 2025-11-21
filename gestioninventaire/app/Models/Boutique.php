<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
class Boutique extends Model {
    protected $fillable = ['name'];

    public function trimestres() {
        return $this->hasMany(Trimestre::class);
    }
}
