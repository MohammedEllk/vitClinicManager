<?php

namespace App\Http\Controllers;

use App\Models\Consultation;
use App\Models\Document;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Storage;



class DocumentController extends Controller
{
    public function index(Consultation $consultation)
    {
        // On ajoute l'URL public générée à la volée
        return $consultation->documents->map(function ($doc) {
            $doc->url = Storage::disk('public')->url($doc->chemin);
            return $doc;
        });
    }

    public function store(Request $request, Consultation $consultation)
    {
        $data = $request->validate([
            'file'          => 'required|file|mimes:jpg,jpeg,png,pdf|max:5120', // 5 Mo
            'type_document' => 'nullable|string|max:100',
            'description'   => 'nullable|string',
        ]);

        $file = $request->file('file');

        $path = $file->store("consultations/{$consultation->id}", 'public');

        $document = $consultation->documents()->create([
            'nom_original' => $file->getClientOriginalName(),
            'chemin'       => $path,
            'type_mime'    => $file->getClientMimeType(),
            'taille'       => $file->getSize(),
            'type_document'=> $data['type_document'] ?? null,
            'description'  => $data['description'] ?? null,
        ]);

        // Rajouter l'URL au retour
        $document->url = Storage::disk('public')->url($document->chemin);

        return response()->json($document, 201);
    }

    public function show(Document $document)
    {
        $document->url = Storage::disk('public')->url($document->chemin);
        return $document;
    }

    public function update(Request $request, Document $document)
    {
        $data = $request->validate([
            'type_document' => 'nullable|string|max:100',
            'description'   => 'nullable|string',
        ]);

        $document->update($data);

        $document->url = Storage::disk('public')->url($document->chemin);

        return $document;
    }

    public function download(Document $document)
    {
        if (!Storage::disk('public')->exists($document->chemin)) {
            return response()->json(['message' => 'Fichier introuvable'], 404);
        }

        return Storage::disk('public')->download($document->chemin, $document->nom_original);
    }

    public function destroy(Document $document)
    {
        // Supprimer le fichier physique
        if ($document->chemin && Storage::disk('public')->exists($document->chemin)) {
            Storage::disk('public')->delete($document->chemin);
        }

        $document->delete();

        return response()->noContent();
    }
}
