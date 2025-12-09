<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class Receiver extends Model
{
    use HasFactory;

    // Champs autorisés en mass assignment
    protected $fillable = [
        'name',
        'phone',
        'user_id', // Ajout du champ user_id
    ];

    /**
     * Relation avec l'utilisateur qui a créé le destinataire
     */
    public function user()
    {
        return $this->belongsTo(User::class);
    }
}
