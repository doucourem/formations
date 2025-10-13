<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Foundation\Auth\User as Authenticatable;
use Illuminate\Notifications\Notifiable;

class User extends Authenticatable
{
    use HasFactory, Notifiable;

    protected $fillable = [
        'name',       // Nom de famille
        'prenom',     // Prénom
        'email',
        'password',
        'agence_id',  // Agence de l'utilisateur
        'role',       // Nouveau champ rôle
    ];

    protected $hidden = [
        'password',
        'remember_token',
    ];

    protected $casts = [
        'email_verified_at' => 'datetime',
        'password' => 'hashed',
    ];

    // Relation avec l'agence
    public function agence()
    {
        return $this->belongsTo(Agency::class);
    }

    public function agency()
{
    return $this->belongsTo(Agency::class);
}

}
