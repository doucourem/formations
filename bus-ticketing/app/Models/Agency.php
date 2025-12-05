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

    /**
     * Une agence possède plusieurs utilisateurs
     */
    public function users()
    {
        return $this->hasMany(User::class);
    }

    /**
     * Une agence peut accéder indirectement aux tickets via ses utilisateurs
     */
    public function tickets()
{
    return $this->hasManyThrough(
        Ticket::class,   // Modèle final
        User::class,     // Modèle intermédiaire
        'agence_id',     // FK dans users vers agency
        'user_id',       // FK dans tickets vers user
        'id',            // PK dans agency
        'id'             // PK dans user
    );
}

}
