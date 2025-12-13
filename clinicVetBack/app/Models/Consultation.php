<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class Consultation extends Model
{
    use HasFactory;

    protected $fillable = [
        'animal_id',
        'veterinaire_id',
        'date_consultation',
        'motif',
        'diagnostic',
        'traitement',
        'poids',
        'temperature',
        'recommandations',
    ];

    protected $casts = [
        'date_consultation' => 'datetime',
    ];

    public function animal()
    {
        return $this->belongsTo(Animal::class);
    }

    public function veterinaire()
    {
        return $this->belongsTo(User::class, 'veterinaire_id');
    }

    public function diagnostiques()
    {
        return $this->hasMany(Diagnostique::class);
    }

    public function documents()
    {
        return $this->hasMany(Document::class);
    }
}
