<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class DeliveryExpense extends Model
{
    use HasFactory;

    protected $fillable = [
        'delivery_id',
        'type',
        'amount',
        'description',
    ];

    /**
     * Relation vers la livraison
     */
    public function delivery()
    {
        return $this->belongsTo(Delivery::class);
    }

    /**
     * Traduction du type en français lisible
     */
    public function getTypeLabelAttribute()
    {
        return match ($this->type) {
            'chauffeur' => 'Chauffeur',
            'carburant' => 'Carburant',
            'peages' => 'Péages',
            'restauration' => 'Restauration',
            'entretien' => 'Entretien',
            'autres' => 'Autres',
            default => $this->type,
        };
    }
}
