<?php

namespace App\Http\Controllers;

use App\Models\Proprietaire;
use Illuminate\Http\Request;

class ProprietaireController extends Controller
{
    public function index(Request $request)
    {
        $q = $request->query('q');
        $perPage = (int) $request->query('per_page', 8); // 8 cards par page
        $perPage = max(1, min($perPage, 50)); // sécurité

        $query = Proprietaire::query()->orderBy('nom');

        if ($q) {
            $query->where(function ($sub) use ($q) {
                $sub->where('nom', 'ilike', "%$q%")
                    ->orWhere('telephone', 'ilike', "%$q%");
            });
        }

        // retourne: data, current_page, last_page, total, etc.
        return $query->paginate($perPage);
    }
    public function store(Request $request)
    {
        $data = $request->validate([
            'nom' => ['required','string','max:255'],
            'telephone' => ['nullable','string','max:50'],
            'email' => ['nullable','email','max:255'],
            'adresse' => ['nullable','string','max:255'],
        ]);

        return Proprietaire::create($data);
    }

    public function update(Request $request, Proprietaire $proprietaire)
    {
        $data = $request->validate([
            'nom' => ['required','string','max:255'],
            'telephone' => ['nullable','string','max:50'],
            'email' => ['nullable','email','max:255'],
            'adresse' => ['nullable','string','max:255'],
        ]);

        $proprietaire->update($data);

        return $proprietaire->fresh();
    }

    public function destroy(Proprietaire $proprietaire)
    {
        // Si tu veux empêcher suppression si il a des animaux:
        // if ($proprietaire->animaux()->exists()) {
        //   return response()->json(['message' => 'Impossible de supprimer : propriétaire possède des animaux.'], 422);
        // }

        $proprietaire->delete();
        return response()->json(['message' => 'Propriétaire supprimé']);
    }

    public function details(Proprietaire $proprietaire)
    {
        // suppose relation Proprietaire->animaux()
        $proprietaire->load(['animaux' => function ($q) {
            $q->orderBy('nom');
        }]);

        return $proprietaire;
    }
}
