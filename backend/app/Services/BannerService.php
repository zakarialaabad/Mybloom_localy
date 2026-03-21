<?php

namespace App\Services;

use App\Models\Banner;
use Illuminate\Http\UploadedFile;
use Illuminate\Support\Facades\Storage;
use Illuminate\Validation\ValidationException;

class BannerService
{
    private const MAX_HOMEPAGE_SLOTS = 4;

    // ── Queries ────────────────────────────────────────────────────────────────

    public function getHomepageBanners(): \Illuminate\Database\Eloquent\Collection
    {
        return Banner::where('type', 'homepage_slot')
            ->where('is_active', true)
            ->orderBy('position')
            ->limit(self::MAX_HOMEPAGE_SLOTS)
            ->get();
    }

    public function getCollectionHero(?int $collectionId = null): ?Banner
    {
        $query = Banner::where('type', 'collection_hero')->where('is_active', true);

        if ($collectionId) {
            $query->where('collection_id', $collectionId);
        } else {
            $query->whereNull('collection_id');
        }

        return $query->first();
    }

    // ── Mutations ──────────────────────────────────────────────────────────────

    public function store(array $data, ?UploadedFile $image): Banner
    {
        $this->enforceConstraints($data);

        $path = $image
            ? $image->store('banners', 'public')
            : ($data['image_path'] ?? '');

        return Banner::create([
            'title'         => $data['title'] ?? null,
            'image_path'    => $path,
            'type'          => $data['type'],
            'collection_id' => $data['collection_id'] ?? null,
            'position'      => $data['position'] ?? 1,
            'link'          => $data['link'] ?? null,
            'is_active'     => $data['is_active'] ?? true,
        ]);
    }

    public function update(Banner $banner, array $data, ?UploadedFile $image): Banner
    {
        if ($image) {
            Storage::disk('public')->delete($banner->image_path);
            $data['image_path'] = $image->store('banners', 'public');
        }

        $banner->update([
            'title'         => $data['title']         ?? $banner->title,
            'image_path'    => $data['image_path']     ?? $banner->image_path,
            'type'          => $data['type']           ?? $banner->type,
            'collection_id' => array_key_exists('collection_id', $data)
                                   ? $data['collection_id']
                                   : $banner->collection_id,
            'position'      => $data['position']       ?? $banner->position,
            'link'          => array_key_exists('link', $data) ? $data['link'] : $banner->link,
            'is_active'     => $data['is_active']      ?? $banner->is_active,
        ]);

        return $banner->fresh();
    }

    public function destroy(Banner $banner): void
    {
        Storage::disk('public')->delete($banner->image_path);
        $banner->delete();
    }

    // ── Business rules ─────────────────────────────────────────────────────────

    private function enforceConstraints(array $data): void
    {
        if ($data['type'] === 'homepage_slot') {
            $count = Banner::where('type', 'homepage_slot')->count();
            if ($count >= self::MAX_HOMEPAGE_SLOTS) {
                throw ValidationException::withMessages([
                    'type' => ['Maximum ' . self::MAX_HOMEPAGE_SLOTS . ' homepage slot banners allowed.'],
                ]);
            }
        }

        if ($data['type'] === 'collection_hero' && ! empty($data['collection_id'])) {
            $exists = Banner::where('type', 'collection_hero')
                ->where('collection_id', $data['collection_id'])
                ->exists();

            if ($exists) {
                throw ValidationException::withMessages([
                    'collection_id' => ['A hero banner already exists for this collection.'],
                ]);
            }
        }
    }
}
