<?php

use Illuminate\Support\Facades\Route;
use Illuminate\Support\Facades\Storage;

/*
|--------------------------------------------------------------------------
| Web Routes (Static File Server)
|--------------------------------------------------------------------------
|
| Fallback route for serving storage files
|
*/

// Test route to verify routing works
Route::get('/test', function () {
    return "Test route works!";
});

// Serve storage files using Laravel's Storage facade
Route::get('/storage/{path}', function ($path) {
    // Security: Prevent directory traversal
    if (str_contains($path, '..') || str_starts_with($path, '/')) {
        abort(403);
    }

    $disk = Storage::disk('public');
    
    if (!$disk->exists($path)) {
        abort(404);
    }

    // Get the file content and serve it
    $content = $disk->get($path);
    
    // Determine MIME type
    $mimeTypes = [
        'webp' => 'image/webp',
        'jpg' => 'image/jpeg',
        'jpeg' => 'image/jpeg',
        'png' => 'image/png',
        'gif' => 'image/gif',
        'pdf' => 'application/pdf',
        'mp4' => 'video/mp4',
    ];

    $ext = strtolower(pathinfo($path, PATHINFO_EXTENSION));
    $mimeType = $mimeTypes[$ext] ?? 'application/octet-stream';

    return response($content)
        ->header('Content-Type', $mimeType)
        ->header('Cache-Control', 'max-age=31536000, public');
})->where('path', '.+');

