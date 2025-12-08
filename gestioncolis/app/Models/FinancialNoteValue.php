<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Factories\HasFactory;

class FinancialNoteValue extends Model
{
    use HasFactory;

    protected $table = 'financial_note_values';

    protected $keyType = 'string';
    public $incrementing = false; // UUID

    protected $fillable = [
        'id',
        'note_id',
        'field_key',
        'value',
        'user_id',
        'created_at',
        'updated_at',
    ];

    protected $casts = [
        'id' => 'string',
        'note_id' => 'string',
        'value' => 'decimal:2',
        'user_id' => 'string',
        'created_at' => 'datetime',
        'updated_at' => 'datetime',
    ];

    public function note()
    {
        return $this->belongsTo(FinancialNote::class, 'note_id');
    }

    public function user()
    {
        return $this->belongsTo(User::class, 'user_id');
    }
}
