<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\DB;

class OrderStatusHistorySeeder extends Seeder
{
    // Columns: id, order_id, status, label, location, created_at
    // OrderTrackResource maps: label → note, created_at → changed_at

    public function run(): void
    {
        DB::table('order_status_histories')->insert([

            // ── Order 1 — delivered (5 entries) ─────────────────────────────
            ['order_id' => 1, 'status' => 'pending',    'label' => 'Commande reçue et en attente de confirmation',  'location' => 'Casablanca',             'created_at' => '2025-12-01 09:00:00'],
            ['order_id' => 1, 'status' => 'confirmed',  'label' => 'Commande confirmée et prise en charge',         'location' => 'Bloom HQ — Casablanca',  'created_at' => '2025-12-01 11:30:00'],
            ['order_id' => 1, 'status' => 'processing', 'label' => 'Commande en cours de préparation',              'location' => 'Bloom HQ — Casablanca',  'created_at' => '2025-12-02 08:00:00'],
            ['order_id' => 1, 'status' => 'shipped',    'label' => 'Colis expédié et remis au transporteur',        'location' => 'Centre de tri Casablanca','created_at' => '2025-12-02 16:00:00'],
            ['order_id' => 1, 'status' => 'delivered',  'label' => 'Colis livré avec succès',                       'location' => 'Casablanca',             'created_at' => '2025-12-04 10:30:00'],

            // ── Order 2 — shipped (4 entries) ────────────────────────────────
            ['order_id' => 2, 'status' => 'pending',    'label' => 'Commande reçue',                                'location' => 'Rabat',                  'created_at' => '2025-12-03 14:00:00'],
            ['order_id' => 2, 'status' => 'confirmed',  'label' => 'Commande confirmée',                            'location' => 'Bloom HQ — Casablanca',  'created_at' => '2025-12-03 15:00:00'],
            ['order_id' => 2, 'status' => 'processing', 'label' => 'En cours de préparation',                       'location' => 'Bloom HQ — Casablanca',  'created_at' => '2025-12-04 09:00:00'],
            ['order_id' => 2, 'status' => 'shipped',    'label' => 'Colis expédié en Express',                      'location' => 'Centre de tri Rabat',    'created_at' => '2025-12-04 17:00:00'],

            // ── Order 3 — delivered (5 entries) ─────────────────────────────
            ['order_id' => 3, 'status' => 'pending',    'label' => 'Commande reçue',                                'location' => 'Marrakech',              'created_at' => '2025-12-05 10:00:00'],
            ['order_id' => 3, 'status' => 'confirmed',  'label' => 'Commande confirmée',                            'location' => 'Bloom HQ — Casablanca',  'created_at' => '2025-12-05 12:00:00'],
            ['order_id' => 3, 'status' => 'processing', 'label' => 'Préparation en cours',                          'location' => 'Bloom HQ — Casablanca',  'created_at' => '2025-12-06 08:00:00'],
            ['order_id' => 3, 'status' => 'shipped',    'label' => 'Colis remis au transporteur',                   'location' => 'Centre de tri Casablanca','created_at' => '2025-12-07 14:00:00'],
            ['order_id' => 3, 'status' => 'delivered',  'label' => 'Colis livré',                                   'location' => 'Marrakech',              'created_at' => '2025-12-10 11:00:00'],

            // ── Order 4 — processing (3 entries) ─────────────────────────────
            ['order_id' => 4, 'status' => 'pending',    'label' => 'Commande reçue',                                'location' => 'Fès',                    'created_at' => '2026-02-20 08:00:00'],
            ['order_id' => 4, 'status' => 'confirmed',  'label' => 'Commande confirmée',                            'location' => 'Bloom HQ — Casablanca',  'created_at' => '2026-02-21 10:00:00'],
            ['order_id' => 4, 'status' => 'processing', 'label' => 'Commande en préparation',                       'location' => 'Bloom HQ — Casablanca',  'created_at' => '2026-02-22 09:00:00'],

            // ── Order 5 — pending (1 entry) ───────────────────────────────────
            ['order_id' => 5, 'status' => 'pending',    'label' => 'Commande reçue, en attente de traitement',      'location' => 'Agadir',                 'created_at' => '2026-02-25 07:00:00'],

            // ── Order 6 — cancelled (2 entries) ──────────────────────────────
            ['order_id' => 6, 'status' => 'pending',    'label' => 'Commande reçue',                                'location' => 'Tanger',                 'created_at' => '2026-02-10 12:00:00'],
            ['order_id' => 6, 'status' => 'cancelled',  'label' => 'Commande annulée à la demande du client',       'location' => 'Bloom HQ — Casablanca',  'created_at' => '2026-02-11 09:00:00'],

            // ── Order 7 — confirmed (2 entries) ──────────────────────────────
            ['order_id' => 7, 'status' => 'pending',    'label' => 'Commande reçue',                                'location' => 'Meknès',                 'created_at' => '2026-02-23 11:00:00'],
            ['order_id' => 7, 'status' => 'confirmed',  'label' => 'Commande confirmée',                            'location' => 'Bloom HQ — Casablanca',  'created_at' => '2026-02-23 14:00:00'],

            // ── Order 8 — shipped (4 entries) ────────────────────────────────
            ['order_id' => 8, 'status' => 'pending',    'label' => 'Commande reçue',                                'location' => 'Oujda',                  'created_at' => '2026-02-18 09:00:00'],
            ['order_id' => 8, 'status' => 'confirmed',  'label' => 'Commande confirmée',                            'location' => 'Bloom HQ — Casablanca',  'created_at' => '2026-02-18 11:00:00'],
            ['order_id' => 8, 'status' => 'processing', 'label' => 'Commande en cours de préparation',              'location' => 'Bloom HQ — Casablanca',  'created_at' => '2026-02-19 08:00:00'],
            ['order_id' => 8, 'status' => 'shipped',    'label' => 'Colis expédié',                                 'location' => 'Centre de tri Oujda',    'created_at' => '2026-02-20 15:00:00'],

            // ── Order 9 — delivered (5 entries) ─────────────────────────────
            ['order_id' => 9, 'status' => 'pending',    'label' => 'Commande reçue',                                'location' => 'Casablanca',             'created_at' => '2025-12-15 10:00:00'],
            ['order_id' => 9, 'status' => 'confirmed',  'label' => 'Commande confirmée',                            'location' => 'Bloom HQ — Casablanca',  'created_at' => '2025-12-15 13:00:00'],
            ['order_id' => 9, 'status' => 'processing', 'label' => 'Préparation soigneuse en cours',                'location' => 'Bloom HQ — Casablanca',  'created_at' => '2025-12-16 09:00:00'],
            ['order_id' => 9, 'status' => 'shipped',    'label' => 'Colis remis au transporteur',                   'location' => 'Centre de tri Casablanca','created_at' => '2025-12-17 14:00:00'],
            ['order_id' => 9, 'status' => 'delivered',  'label' => 'Colis livré avec succès',                       'location' => 'Casablanca',             'created_at' => '2025-12-20 14:00:00'],

            // ── Order 10 — pending (1 entry) ──────────────────────────────────
            ['order_id' => 10, 'status' => 'pending',   'label' => 'Commande reçue, en attente de traitement',      'location' => 'Kenitra',                'created_at' => '2026-02-25 06:00:00'],

            // ── Order 11 — processing (3 entries) ────────────────────────────
            ['order_id' => 11, 'status' => 'pending',   'label' => 'Commande reçue',                                'location' => 'Casablanca',             'created_at' => '2026-02-22 08:00:00'],
            ['order_id' => 11, 'status' => 'confirmed', 'label' => 'Commande confirmée',                            'location' => 'Bloom HQ — Casablanca',  'created_at' => '2026-02-23 10:00:00'],
            ['order_id' => 11, 'status' => 'processing','label' => 'Commande en préparation',                       'location' => 'Bloom HQ — Casablanca',  'created_at' => '2026-02-24 09:00:00'],

            // ── Order 12 — pending (1 entry) ──────────────────────────────────
            ['order_id' => 12, 'status' => 'pending',   'label' => 'Commande reçue, en attente de traitement',      'location' => 'Tétouan',                'created_at' => '2026-02-25 05:00:00'],

            // ── Order 13 — confirmed (2 entries) ─────────────────────────────
            ['order_id' => 13, 'status' => 'pending',   'label' => 'Commande reçue',                                'location' => 'Safi',                   'created_at' => '2026-02-24 11:00:00'],
            ['order_id' => 13, 'status' => 'confirmed', 'label' => 'Commande confirmée',                            'location' => 'Bloom HQ — Casablanca',  'created_at' => '2026-02-24 15:00:00'],

            // ── Order 14 — shipped (4 entries) ───────────────────────────────
            ['order_id' => 14, 'status' => 'pending',   'label' => 'Commande reçue',                                'location' => 'Nador',                  'created_at' => '2026-02-19 09:00:00'],
            ['order_id' => 14, 'status' => 'confirmed', 'label' => 'Commande confirmée',                            'location' => 'Bloom HQ — Casablanca',  'created_at' => '2026-02-19 11:00:00'],
            ['order_id' => 14, 'status' => 'processing','label' => 'Commande en préparation',                       'location' => 'Bloom HQ — Casablanca',  'created_at' => '2026-02-20 08:00:00'],
            ['order_id' => 14, 'status' => 'shipped',   'label' => 'Colis parti vers Nador',                        'location' => 'Centre de tri Oujda',    'created_at' => '2026-02-21 16:00:00'],

            // ── Order 15 — cancelled (2 entries) ─────────────────────────────
            ['order_id' => 15, 'status' => 'pending',   'label' => 'Commande reçue',                                'location' => 'El Jadida',              'created_at' => '2026-02-12 14:00:00'],
            ['order_id' => 15, 'status' => 'cancelled', 'label' => 'Commande annulée — client injoignable',         'location' => 'Bloom HQ — Casablanca',  'created_at' => '2026-02-13 10:00:00'],
        ]);
    }
}
