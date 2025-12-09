<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class ThirdParty extends Model
{
    use HasFactory;

    // Champs autorisés en mass assignment
    protected $fillable = [
        'name',
        'phone',
        'user_id', // Ajout du champ user_id
    ];

    /**
     * Relation avec l'utilisateur qui a créé le tiers
     */
    public function user()
    {
        return $this->belongsTo(User::class);
    }

    public function transfersAsThirdParty()
{
    return $this->hasMany(Transfer::class, 'third_party_id');
}
public function transfers()
{
    return $this->hasMany(Transfer::class, 'third_party_id');
}


}
