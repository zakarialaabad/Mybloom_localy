<?php

namespace App\DTOs;

class ImageProcessResult
{
    public function __construct(
        public string $relativePath,      // products/abc123.webp
        public string $url,               // /storage/products/abc123.webp
        public string $filename,          // abc123.webp
        public int $filesize,             // bytes
        public string $mimeType,          // image/webp
        public array $dimensions,         // ['width' => 1200, 'height' => 900]
        public bool $converted,           // was converted to WebP
        public string $originalExtension  // original input extension
    ) {}

    /**
     * Get dimensions as string (width x height)
     */
    public function getDimensionsString(): string
    {
        return "{$this->dimensions['width']}x{$this->dimensions['height']}";
    }

    /**
     * Get file size in human-readable format (KB, MB, GB)
     */
    public function getHumanReadableSize(): string
    {
        $bytes = $this->filesize;
        $units = ['B', 'KB', 'MB', 'GB'];
        $bytes = max($bytes, 0);
        $pow = floor(($bytes ? log($bytes) : 0) / log(1024));
        $pow = min($pow, count($units) - 1);
        $bytes /= (1 << (10 * $pow));

        return round($bytes, 2) . ' ' . $units[$pow];
    }

    /**
     * Get conversion summary
     */
    public function getConversionSummary(): string
    {
        if (!$this->converted) {
            return "Original: {$this->originalExtension}";
        }
        return "Converted: {$this->originalExtension} → WebP";
    }

    /**
     * Convert to array for storage/response
     */
    public function toArray(): array
    {
        return [
            'relativePath' => $this->relativePath,
            'url' => $this->url,
            'filename' => $this->filename,
            'filesize' => $this->filesize,
            'mimeType' => $this->mimeType,
            'dimensions' => $this->dimensions,
            'converted' => $this->converted,
            'originalExtension' => $this->originalExtension,
        ];
    }

    /**
     * Create from array
     */
    public static function fromArray(array $data): self
    {
        return new self(
            relativePath: $data['relativePath'],
            url: $data['url'],
            filename: $data['filename'],
            filesize: $data['filesize'],
            mimeType: $data['mimeType'],
            dimensions: $data['dimensions'],
            converted: $data['converted'],
            originalExtension: $data['originalExtension']
        );
    }
}
