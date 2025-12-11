<?php

namespace App\Http\Controllers;

use App\Models\Consultation;
use Illuminate\Http\Request;

class ConsultationController extends Controller
{
    public function index()
    {
        return Consultation::with(['animal.proprietaire', 'veterinaire'])
            ->orderByDesc('date_consultation')
            ->get();
    }

    public function store(Request $request)
    {
        $data = $request->validate([
            'animal_id'         => 'required|exists:animaux,id',
            'date_consultation' => 'required|date',
            'motif'             => 'nullable|string',
            'diagnostic'        => 'nullable|string',
            'traitement'        => 'nullable|string',
            'recommandations'   => 'nullable|string',
        ]);

        $data['veterinaire_id'] = $request->user()->id;

        $consultation = Consultation::create($data);

        return response()->json($consultation, 201);
    }

    public function show(Consultation $consultation)
    {
        $consultation->load(['animal.proprietaire', 'veterinaire', 'diagnostiques', 'documents']);
        return $consultation;
    }

    public function update(Request $request, Consultation $consultation)
    {
        $data = $request->validate([
            'animal_id'         => 'sometimes|required|exists:animaux,id',
            'date_consultation' => 'sometimes|required|date',
            'motif'             => 'nullable|string',
            'diagnostic'        => 'nullable|string',
            'traitement'        => 'nullable|string',
            'recommandations'   => 'nullable|string',
        ]);

        $consultation->update($data);

        return $consultation;
    }

    public function destroy(Consultation $consultation)
    {
        $consultation->delete();

        return response()->noContent();
    }
}
