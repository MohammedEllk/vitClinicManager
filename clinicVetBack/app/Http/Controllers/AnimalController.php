<?php

namespace App\Http\Controllers;

use App\Models\Animal;
use App\Models\Proprietaire;
use Illuminate\Http\Request;

class AnimalController extends Controller
{
    // GET /api/animaux?q=...
    public function index(Request $request)
    {
        $q = $request->query('q');

        $query = Animal::with('proprietaire')->orderBy('nom');

        if ($q) {
            $query->where(function($sub) use ($q) {
                $sub->where('nom', 'ilike', "%{$q}%")
                    ->orWhere('espece', 'ilike', "%{$q}%")
                    ->orWhereHas('proprietaire', function($p) use ($q) {
                        $p->where('nom', 'ilike', "%{$q}%")
                          ->orWhere('telephone', 'ilike', "%{$q}%");
                    });
            });
        }

        return $query->get();
    }

    // POST /api/animaux
    public function store(Request $request)
    {
        $data = $request->validate([
            'nom' => 'required|string|max:255',
            'espece' => 'required|string|max:255',
            'race' => 'nullable|string|max:255',
            'sexe' => 'nullable|string|max:20',
            'date_naissance' => 'nullable|date',
            'proprietaire_id' => 'required|exists:proprietaires,id',
        ]);

        $animal = Animal::create($data);

        return response()->json($animal->load('proprietaire'), 201);
    }

    // GET /api/animaux/{animal}
    public function show(Animal $animal)
    {
        return $animal->load('proprietaire');
    }

    // PUT /api/animaux/{animal}
    public function update(Request $request, Animal $animal)
    {
        $data = $request->validate([
            'nom' => 'sometimes|required|string|max:255',
            'espece' => 'sometimes|required|string|max:255',
            'race' => 'nullable|string|max:255',
            'sexe' => 'nullable|string|max:20',
            'date_naissance' => 'nullable|date',
            'proprietaire_id' => 'sometimes|required|exists:proprietaires,id',
        ]);

        $animal->update($data);

        return $animal->load('proprietaire');
    }

    // DELETE /api/animaux/{animal}
    public function destroy(Animal $animal)
    {
        $animal->delete();
        return response()->noContent();
    }

    // GET /api/proprietaires/{proprietaire}/animaux
    public function byOwner(Proprietaire $proprietaire)
    {
        return $proprietaire->animaux()->orderBy('nom')->get();
    }
}
