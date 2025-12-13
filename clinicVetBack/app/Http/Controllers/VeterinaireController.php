<?php

namespace App\Http\Controllers;

use App\Models\User;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Hash;

class VeterinaireController extends Controller
{
    // Liste des vétérinaires (admin only)
    public function index()
    {
        return User::where('role', 'veterinaire')
            ->orderBy('name')
            ->get();
    }

    // Créer un vétérinaire
    public function store(Request $request)
    {
        $data = $request->validate([
            'name'     => 'required|string|max:255',
            'email'    => 'required|email|unique:users,email',
            'password' => 'required|string|min:6',
        ]);

        $vet = User::create([
            'name'     => $data['name'],
            'email'    => $data['email'],
            'password' => Hash::make($data['password']),
            'role'     => 'veterinaire',
        ]);

        return response()->json($vet, 201);
    }

    // Voir un vétérinaire
    public function show(User $veterinaire)
    {
        abort_if($veterinaire->role !== 'veterinaire', 404);
        return $veterinaire;
    }

    // Modifier un vétérinaire
    public function update(Request $request, User $veterinaire)
    {
        abort_if($veterinaire->role !== 'veterinaire', 404);

        $data = $request->validate([
            'name'     => 'sometimes|required|string|max:255',
            'email'    => 'sometimes|required|email|unique:users,email,' . $veterinaire->id,
            'password' => 'nullable|string|min:6',
        ]);

        if (!empty($data['password'])) {
            $data['password'] = Hash::make($data['password']);
        } else {
            unset($data['password']);
        }

        $veterinaire->update($data);
        return $veterinaire;
    }

    // Supprimer un vétérinaire
    public function destroy(User $veterinaire)
    {
        abort_if($veterinaire->role !== 'veterinaire', 404);
        $veterinaire->delete();
        return response()->noContent();
    }
}
