<?php

namespace App\Http\Controllers;

use App\Models\Animal;
use Illuminate\Http\Request;

class AnimalController extends Controller
{
    public function index()
    {
        return Animal::with('proprietaire')
            ->orderBy('nom')
            ->get();
    }

    public function store(Request $request)
    {
        $data = $request->validate([
            'proprietaire_id' => 'required|exists:proprietaires,id',
            'nom'             => 'required|string|max:255',
            'espece'          => 'required|string|max:100',   // chien, chat...
            'race'            => 'nullable|string|max:100',
            'sexe'            => 'nullable|string|max:10',
            'date_naissance'  => 'nullable|date',
            'poids'           => 'nullable|numeric',
            'remarques'       => 'nullable|string',
        ]);

        $animal = Animal::create($data);

        return response()->json($animal, 201);
    }

    public function show(Animal $animal)
    {
        $animal->load('proprietaire', 'consultations');
        return $animal;
    }

    public function update(Request $request, Animal $animal)
    {
        $data = $request->validate([
            'proprietaire_id' => 'sometimes|required|exists:proprietaires,id',
            'nom'             => 'sometimes|required|string|max:255',
            'espece'          => 'sometimes|required|string|max:100',
            'race'            => 'nullable|string|max:100',
            'sexe'            => 'nullable|string|max:10',
            'date_naissance'  => 'nullable|date',
            'poids'           => 'nullable|numeric',
            'remarques'       => 'nullable|string',
        ]);

        $animal->update($data);

        return $animal;
    }

    public function destroy(Animal $animal)
    {
        $animal->delete();

        return response()->noContent();
    }
}
