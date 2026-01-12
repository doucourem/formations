<?php 
namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class Delivery extends Model
{
    use HasFactory;

    protected $fillable = [
        'vehicle_id', 'driver_id', 'product_name', 'product_lot',
        'quantity_loaded', 'quantity_delivered', 'departure_at',
        'arrival_at', 'status','price', 'distance_km',
        'client_name','departure_place','arrival_place',
        
    ];

   

    public function bus()
{
    return $this->belongsTo(Bus::class, 'vehicle_id'); // clé étrangère correcte
}


    public function driver() {
        return $this->belongsTo(Driver::class);
    }

    public function logs() {
        return $this->hasMany(DeliveryLog::class);
    }

    public function updateStatus()
{
    // Exemple simple : mettre à jour le statut en fonction du dernier log
    $lastLog = $this->logs()->latest()->first();

    if (!$lastLog) {
        $this->status = 'pending';
    } else {
        switch ($lastLog->action) {
            case 'chargement':
                $this->status = 'pending';
                break;
            case 'depart':
                $this->status = 'in_transit';
                break;
            case 'livraison':
                $this->status = 'delivered';
                break;
            case 'incident':
                $this->status = 'pending'; // ou gérer selon ton besoin
                break;
        }
    }

    $this->save();
}

}
