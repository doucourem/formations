<?php 
namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class DeliveryLog extends Model
{
    use HasFactory;

    public $timestamps = false;

    protected $fillable = [
        'delivery_id', 'action', 'quantity', 'location', 'timestamp',
    ];

    public function delivery() {
        return $this->belongsTo(Delivery::class);
    }
}
