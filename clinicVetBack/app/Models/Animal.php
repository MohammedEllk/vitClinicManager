<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class Animal extends Model
{
    use HasFactory;

    protected $fillable = [
        'proprietaire_id',
        'nom',
        'espece',
        'race',
        'sexe',
        'date_naissance',
        'poids',
        'remarques',
    ];

    protected $casts = [
        'date_naissance' => 'date',
        'poids'          => 'float',
    ];

    public function proprietaire()
    {
        return $this->belongsTo(Proprietaire::class);
    }

    public function consultations()
    {
        return $this->hasMany(Consultation::class);
    }
}
