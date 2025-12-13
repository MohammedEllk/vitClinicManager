<?php

namespace App\Http\Controllers;

use App\Models\Document;
use App\Models\Consultation;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Storage;

class DocumentController extends Controller
{
    /**
     * Liste des documents d’une consultation
     */
    public function index(Consultation $consultation)
    {
        return response()->json(
            $consultation->documents()->latest()->get()
        );
    }

    /**
     * Upload document
     */
    public function store(Request $request, Consultation $consultation)
    {
        $request->validate([
            'file' => 'required|file|mimes:pdf,jpg,jpeg,png|max:5120',
            'type_document' => 'nullable|string|max:100',
            'description' => 'nullable|string',
        ]);

        $file = $request->file('file');

        // Stockage
        $path = $file->store(
            "consultations/{$consultation->id}",
            'public'
        );

        $document = Document::create([
            'consultation_id' => $consultation->id,
            'nom_original'    => $file->getClientOriginalName(),
            'chemin'          => $path,
            'type_mime'       => $file->getMimeType(),
            'taille'          => $file->getSize(),
            'type_document'   => $request->type_document,
            'description'     => $request->description,
        ]);

        return response()->json($document, 201);
    }

    /**
     * Télécharger un document
     */
    public function download(Document $document)
    {
        return Storage::disk('public')->download(
            $document->chemin,
            $document->nom_original
        );
    }

    /**
     * Supprimer document
     */
    public function destroy(Document $document)
    {
        Storage::disk('public')->delete($document->chemin);
        $document->delete();

        return response()->json(['message' => 'Document supprimé']);
    }
}
