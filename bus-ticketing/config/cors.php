<?php

return [

    'paths' => [
        'api/*',
        'sanctum/csrf-cookie',
        'login',
        'logout',
    ],

    'allowed_methods' => ['*'],

    'allowed_origins' => [
        'https://nilatouleltrans.com',
        'http://localhost:8081',
        'http://127.0.0.1:8081',
    ],

    'allowed_origins_patterns' => [],

    'allowed_headers' => ['*'],

    'exposed_headers' => [],

    'max_age' => 0,

    // 🔥 OBLIGATOIRE POUR SANCTUM
    'supports_credentials' => true,

];
