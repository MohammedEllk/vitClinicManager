<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class Document extends Model
{
    use HasFactory;

    protected $fillable = [
        'consultation_id',
        'nom_original',
        'chemin',
        'type_mime',
        'taille',
        'type_document',
        'description',
    ];

    public function consultation()
    {
        return $this->belongsTo(Consultation::class);
    }
}
