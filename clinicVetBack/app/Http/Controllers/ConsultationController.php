<?php

namespace App\Http\Controllers;

use App\Models\Consultation;
use App\Models\Animal;
use Illuminate\Http\Request;

class ConsultationController extends Controller
{
    // GET /api/consultations?animal_id=1&q=...
    public function index(Request $request)
    {
        $animalId = $request->query('animal_id');
        $q = $request->query('q');

        $query = Consultation::with(['animal.proprietaire'])
            ->orderByDesc('date_consultation');

        if ($animalId) {
            $query->where('animal_id', $animalId);
        }

        if ($q) {
            $query->where(function ($sub) use ($q) {
                $sub->where('motif', 'ilike', "%{$q}%")
                    ->orWhere('diagnostic', 'ilike', "%{$q}%")
                    ->orWhere('traitement', 'ilike', "%{$q}%")
                    ->orWhere('recommandations', 'ilike', "%{$q}%")
                    ->orWhereHas('animal', function ($a) use ($q) {
                        $a->where('nom', 'ilike', "%{$q}%")
                          ->orWhere('espece', 'ilike', "%{$q}%")
                          ->orWhereHas('proprietaire', function ($p) use ($q) {
                              $p->where('nom', 'ilike', "%{$q}%")
                                ->orWhere('telephone', 'ilike', "%{$q}%");
                          });
                    });
            });
        }

        return $query->get();
    }

    // POST /api/consultations
    public function store(Request $request)
    {
        $data = $request->validate([
            'animal_id' => 'required|exists:animals,id',
            'date_consultation' => 'required|date',
            'motif' => 'nullable|string',
            'diagnostic' => 'nullable|string',
            'traitement' => 'nullable|string',
            'recommandations' => 'nullable|string',
            'poids' => 'nullable|numeric',
            'temperature' => 'nullable|numeric',
        ]);

        $c = Consultation::create($data);

        return response()->json($c->load(['animal.proprietaire']), 201);
    }

    // GET /api/consultations/{consultation}
    public function show(Consultation $consultation)
    {
        return $consultation->load(['animal.proprietaire']);
    }

    // PUT /api/consultations/{consultation}
    public function update(Request $request, Consultation $consultation)
    {
        $data = $request->validate([
            'animal_id' => 'sometimes|required|exists:animals,id',
            'date_consultation' => 'sometimes|required|date',
            'motif' => 'nullable|string',
            'diagnostic' => 'nullable|string',
            'traitement' => 'nullable|string',
            'recommandations' => 'nullable|string',
            'poids' => 'nullable|numeric',
            'temperature' => 'nullable|numeric',
        ]);

        $consultation->update($data);

        return $consultation->load(['animal.proprietaire']);
    }

    // DELETE /api/consultations/{consultation}
    public function destroy(Consultation $consultation)
    {
        $consultation->delete();
        return response()->noContent();
    }

    // GET /api/animaux/{animal}/consultations
    public function historyByAnimal(Animal $animal)
    {
        return Consultation::with(['animal.proprietaire'])
            ->where('animal_id', $animal->id)
            ->orderByDesc('date_consultation')
            ->get();
    }
}
