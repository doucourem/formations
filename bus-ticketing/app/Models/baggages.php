<?php
// app/Models/Baggage.php
namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class baggages extends Model
{
    protected $fillable = ['ticket_id', 'weight', 'price'];

    public function ticket()
    {
        return $this->belongsTo(Ticket::class);
    }
}
