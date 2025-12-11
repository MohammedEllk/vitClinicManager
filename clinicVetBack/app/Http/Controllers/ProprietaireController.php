<?php

namespace App\Http\Controllers;

use App\Models\Proprietaire;
use Illuminate\Http\Request;

class ProprietaireController extends Controller
{
    public function index()
    {
        // Tu peux ajouter pagination plus tard
        return Proprietaire::withCount('animaux')
            ->orderBy('nom')
            ->get();
    }

    public function store(Request $request)
    {
        $data = $request->validate([
            'nom'       => 'required|string|max:255',
            'prenom'    => 'nullable|string|max:255',
            'telephone' => 'nullable|string|max:50',
            'email'     => 'nullable|email|max:255',
            'adresse'   => 'nullable|string',
        ]);

        $proprietaire = Proprietaire::create($data);

        return response()->json($proprietaire, 201);
    }

    public function show(Proprietaire $proprietaire)
    {
        // Charger les animaux du propriétaire si besoin
        $proprietaire->load('animaux');
        return $proprietaire;
    }

    public function update(Request $request, Proprietaire $proprietaire)
    {
        $data = $request->validate([
            'nom'       => 'sometimes|required|string|max:255',
            'prenom'    => 'nullable|string|max:255',
            'telephone' => 'nullable|string|max:50',
            'email'     => 'nullable|email|max:255',
            'adresse'   => 'nullable|string',
        ]);

        $proprietaire->update($data);

        return $proprietaire;
    }

    public function destroy(Proprietaire $proprietaire)
    {
        $proprietaire->delete();

        return response()->noContent();
    }
}
