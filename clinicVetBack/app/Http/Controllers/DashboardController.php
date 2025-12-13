<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use Carbon\Carbon;
use App\Models\Consultation;
use App\Models\Animal;
use App\Models\Proprietaire;

class DashboardController extends Controller
{
    public function stats(Request $request)
    {
        // Simple + robuste
        return response()->json([
            'proprietaires' => Proprietaire::count(),
            'animaux' => Animal::count(),
            'consultations_du_jour' => Consultation::whereDate('date_consultation', Carbon::today())->count(),
            'consultations_total' => Consultation::count(),
        ]);
    }

    public function agendaWeek(Request $request)
    {
        $start = Carbon::now()->startOfWeek(Carbon::MONDAY)->startOfDay();
        $end   = Carbon::now()->endOfWeek(Carbon::SUNDAY)->endOfDay();

        $items = Consultation::query()
            ->with([
                'animal:id,nom,espece,proprietaire_id',
                'animal.proprietaire:id,nom'
            ])
            ->whereBetween('date_consultation', [$start, $end])
            ->orderBy('date_consultation', 'asc')
            ->get()
            ->map(function ($c) {
                $dt = Carbon::parse($c->date_consultation);

                return [
                    'id' => $c->id,
                    'date' => $dt->toDateString(),
                    'time' => $dt->format('H:i'),
                    'dayIndex' => $dt->dayOfWeekIso, // 1..7
                    'animal' => $c->animal?->nom,
                    'espece' => $c->animal?->espece,
                    'proprietaire' => $c->animal?->proprietaire?->nom,
                    'motif' => $c->motif,
                ];
            });

        $days = [
            1 => ['label' => 'Lundi', 'items' => []],
            2 => ['label' => 'Mardi', 'items' => []],
            3 => ['label' => 'Mercredi', 'items' => []],
            4 => ['label' => 'Jeudi', 'items' => []],
            5 => ['label' => 'Vendredi', 'items' => []],
            6 => ['label' => 'Samedi', 'items' => []],
            7 => ['label' => 'Dimanche', 'items' => []],
        ];

        foreach ($items as $it) {
            $days[$it['dayIndex']]['items'][] = $it;
        }

        return response()->json([
            'weekStart' => $start->toDateString(),
            'weekEnd' => $end->toDateString(),
            'days' => $days,
        ]);
    }
}
