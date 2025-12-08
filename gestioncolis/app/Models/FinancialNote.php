<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Support\Str;

class FinancialNote extends Model
{
    use HasFactory;

    protected $table = 'financial_notes';

    protected $keyType = 'string';
    public $incrementing = false; // UUID non auto-incrémenté

    protected $fillable = [
        'id',
        'global_cash_balance',
        'yawi_ash_balance',
        'lpv_balance',
        'airtel_money_balance',
        'available_cash',
        'balde_alpha_debt',
        'md_owes_us',
        'we_owe_md',
        'notes',
        'created_by',
        'updated_by',
        'created_at',
        'updated_at',
    ];

    protected $casts = [
        'id' => 'string',
        'global_cash_balance' => 'decimal:2',
        'yawi_ash_balance' => 'decimal:2',
        'lpv_balance' => 'decimal:2',
        'airtel_money_balance' => 'decimal:2',
        'available_cash' => 'decimal:2',
        'balde_alpha_debt' => 'decimal:2',
        'md_owes_us' => 'decimal:2',
        'we_owe_md' => 'decimal:2',
        'created_at' => 'datetime',
        'updated_at' => 'datetime',
    ];

    protected static function boot()
    {
        parent::boot();
        static::creating(function ($model) {
            if (!$model->id) {
                $model->id = (string) Str::uuid();
            }
        });
    }
    // Relations avec User
    public function creator()
    {
        return $this->belongsTo(User::class, 'created_by');
    }

    public function updater()
    {
        return $this->belongsTo(User::class, 'updated_by');
    }
}
