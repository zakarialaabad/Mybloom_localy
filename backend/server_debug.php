<?php
// Wrapper that bootstraps Laravel and handles one request, logging any fatal
ini_set('display_errors', 1);
ini_set('log_errors', 1);
ini_set('error_log', 'C:/xampp/php/logs/laravel_fatal.log');

// Include the Laravel bootstrap router used by `php artisan serve` / `php -S`
$dir = __DIR__;
if (file_exists($dir.'/vendor/laravel/framework/src/Illuminate/Foundation/resources/server.php')) {
    require $dir.'/vendor/laravel/framework/src/Illuminate/Foundation/resources/server.php';
} else {
    require $dir.'/public/index.php';
}
