<?php

use App\Http\Middleware\EncryptCookies;
use App\Http\Middleware\VerifyCsrfToken;

return [
    'stateful' => explode(',', env('SANCTUM_STATEFUL_DOMAINS', 'localhost,127.0.0.1,localhost:3000')),
    'expiration' => null,
    'middleware' => [
        'verify_csrf_token' => [
            VerifyCsrfToken::class,
        ],
        'encrypt_cookies' => [
            EncryptCookies::class,
        ],
    ],
];
