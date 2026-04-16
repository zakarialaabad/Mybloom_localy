<?php

return [
    /**
     * Global image optimization settings
     */
    'enabled' => env('IMAGE_OPTIMIZATION_ENABLED', true),

    /**
     * Default storage disk for images
     */
    'disk' => env('IMAGE_OPTIMIZATION_DISK', 'public'),

    /**
     * Default compression quality (0-100)
     */
    'quality' => env('IMAGE_OPTIMIZATION_QUALITY', 80),

    /**
     * Convert images to WebP format
     */
    'convert_to_webp' => env('IMAGE_CONVERT_WEBP', true),

    /**
     * Keep original file if WebP conversion fails
     */
    'keep_original_on_webp_fail' => true,

    /**
     * Strip EXIF metadata
     */
    'strip_metadata' => env('IMAGE_STRIP_METADATA', true),

    /**
     * Progressive JPEG encoding
     */
    'progressive_jpeg' => true,

    /**
     * Image type specific configurations
     */
    'types' => [
        'products' => [
            'path' => 'products',
            'max_width' => 2000,
            'max_height' => 2000,
            'min_width' => 400,
            'min_height' => 400,
            'quality' => 85,
            'allowed_mimes' => ['image/jpeg', 'image/png', 'image/webp'],
            'max_file_size' => 10 * 1024 * 1024, // 10MB
            'convert_to_webp' => true,
            'generate_thumbnail' => [
                'enabled' => false,
                'width' => 300,
                'height' => 300,
            ],
        ],
        'reviews' => [
            'path' => 'reviews',
            'max_width' => 1500,
            'max_height' => 1500,
            'min_width' => 300,
            'min_height' => 300,
            'quality' => 80,
            'allowed_mimes' => ['image/jpeg', 'image/png', 'image/webp'],
            'max_file_size' => 8 * 1024 * 1024, // 8MB
            'convert_to_webp' => true,
            'generate_thumbnail' => [
                'enabled' => false,
                'width' => 200,
                'height' => 200,
            ],
        ],
        'review-images' => [
            'path' => 'review-images',
            'max_width' => 1500,
            'max_height' => 1500,
            'min_width' => 300,
            'min_height' => 300,
            'quality' => 80,
            'allowed_mimes' => ['image/jpeg', 'image/png', 'image/webp'],
            'max_file_size' => 8 * 1024 * 1024, // 8MB
            'convert_to_webp' => true,
            'generate_thumbnail' => [
                'enabled' => false,
                'width' => 200,
                'height' => 200,
            ],
        ],
        'admin_profiles' => [
            'path' => 'admin_profiles',
            'max_width' => 800,
            'max_height' => 800,
            'min_width' => 200,
            'min_height' => 200,
            'quality' => 85,
            'allowed_mimes' => ['image/jpeg', 'image/png', 'image/webp'],
            'max_file_size' => 5 * 1024 * 1024, // 5MB
            'convert_to_webp' => true,
            'generate_thumbnail' => [
                'enabled' => false,
                'width' => 150,
                'height' => 150,
            ],
        ],
        'banners' => [
            'path' => 'banners',
            'max_width' => 3000,
            'max_height' => 1500,
            'min_width' => 1200,
            'min_height' => 600,
            'quality' => 90,
            'allowed_mimes' => ['image/jpeg', 'image/png', 'image/webp'],
            'max_file_size' => 15 * 1024 * 1024, // 15MB
            'convert_to_webp' => true,
            'generate_thumbnail' => [
                'enabled' => false,
                'width' => 600,
                'height' => 300,
            ],
        ],
        'ingredients' => [
            'path' => 'ingredients',
            'max_width' => 1000,
            'max_height' => 1000,
            'min_width' => 400,
            'min_height' => 400,
            'quality' => 85,
            'allowed_mimes' => ['image/jpeg', 'image/png', 'image/webp'],
            'max_file_size' => 5 * 1024 * 1024, // 5MB
            'convert_to_webp' => true,
            'generate_thumbnail' => [
                'enabled' => false,
                'width' => 300,
                'height' => 300,
            ],
        ],
    ],

    /**
     * Default type configuration (used if type not found in 'types' array)
     */
    'default_type' => [
        'max_width' => 2000,
        'max_height' => 2000,
        'min_width' => 300,
        'min_height' => 300,
        'quality' => 80,
        'allowed_mimes' => ['image/jpeg', 'image/png', 'image/webp'],
        'max_file_size' => 10 * 1024 * 1024, // 10MB
        'convert_to_webp' => true,
        'generate_thumbnail' => [
            'enabled' => false,
            'width' => 300,
            'height' => 300,
        ],
    ],

    /**
     * Filename generation strategy
     * 'hash' => Uses SHA-256 hash
     * 'timestamp' => Uses timestamp + original name
     * 'original' => Keeps original filename (not recommended)
     */
    'filename_strategy' => env('IMAGE_FILENAME_STRATEGY', 'hash'),

    /**
     * Hash algorithm for filename generation
     * Supported: 'sha256', 'sha1', 'md5'
     */
    'hash_algorithm' => 'sha256',

    /**
     * Cache busting for image URLs
     * Adds timestamp query parameter to images
     */
    'cache_busting' => true,

    /**
     * Image format fallback
     * If WebP fails, fall back to original format
     */
    'format_fallback' => true,

    /**
     * Cleanup options
     */
    'cleanup' => [
        'remove_original_on_webp_success' => false, // Keep originals for backward compatibility
        'remove_thumbnails_on_delete' => true,
    ],

    /**
     * Allow external URL optimization
     * Downloads external images and optimizes them
     */
    'allow_external_urls' => true,
    'external_url_download_timeout' => 30,

    /**
     * Logging
     */
    'logging' => [
        'enabled' => env('IMAGE_OPTIMIZATION_LOGGING', true),
        'channel' => env('LOG_CHANNEL', 'single'),
    ],

    /**
     * Performance optimization
     * Use queues for large file processing
     */
    'queue_processing' => [
        'enabled' => env('IMAGE_QUEUE_PROCESSING', false),
        'queue' => env('IMAGE_QUEUE', 'default'),
    ],
];
