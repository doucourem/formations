<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Factories\HasFactory;

class UserField extends Model
{
    use HasFactory;

    protected $table = 'user_fields';

    protected $fillable = [
        'user_id',
        'field_key',
        'label',
        'category',
        'value',
        'display_order',
        'is_active',
        'created_at',
        'updated_at',
    ];

    protected $casts = [
        'user_id' => 'string',
        'value' => 'decimal:2',
        'display_order' => 'integer',
        'is_active' => 'boolean',
        'created_at' => 'datetime',
        'updated_at' => 'datetime',
    ];

    public function user()
    {
        return $this->belongsTo(User::class, 'user_id');
    }
}
