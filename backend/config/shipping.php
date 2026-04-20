<?php

return [

    /*
    |--------------------------------------------------------------------------
    | Free Shipping Threshold
    |--------------------------------------------------------------------------
    |
    | Orders with subtotal >= this value (in DH) get free shipping.
    | This value should match the FREE_SHIPPING_THRESHOLD constant in the frontend.
    |
    */

    'free_shipping_threshold' => (float) env('FREE_SHIPPING_THRESHOLD', 600.00),

];
