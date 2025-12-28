<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Foundation\Auth\User as Authenticatable;
use Illuminate\Notifications\Notifiable;

// ✅ Ajout du trait pour Sanctum
use Laravel\Sanctum\HasApiTokens;

class User extends Authenticatable
{
    use HasApiTokens, HasFactory, Notifiable;

    // Champs autorisés à la création/modification
    protected $fillable = [
        'name',       // Nom
        'prenom',     // Prénom
        'email',
        'password',
        'agence_id',  // Agence associée
        'role',       // Rôle de l'utilisateur
    ];

    // Champs masqués lors de la sérialisation
    protected $hidden = [
        'password',
        'remember_token',
    ];

    // Casting des attributs
    protected $casts = [
        'email_verified_at' => 'datetime',
        'password' => 'hashed',
    ];

    /**
     * Relation avec l'agence.
     * Un utilisateur appartient à une seule agence.
     */
    public function agency()
    {
        return $this->belongsTo(Agency::class, 'agence_id');
    }
}
