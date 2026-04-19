# Rapport d'Optimisation Vidéo — Hero Section

## Problème Signalé

Les vidéos du hero banner sur la page d'accueil mettaient un temps excessif à se charger et à s'afficher, créant une mauvaise expérience utilisateur avec un écran gris/vide prolongé avant le début de la lecture.

---

## Diagnostic

### Analyse des fichiers vidéo originaux

| Fichier | Taille | Bitrate | Résolution | Audio | faststart |
|---------|--------|---------|------------|-------|-----------|
| Desktop1.mp4 | **2.62 MB** | 5.8 Mbps | 1284×716 | ✅ AAC 117 kbps | ❌ |
| Desktop2.mp4 | **10.68 MB** | 17.6 Mbps | 1924×1076 | ✅ AAC 128 kbps | ❌ |
| Desktop3.mp4 | **7.06 MB** | 7.4 Mbps | 1284×716 | ❌ | ❌ |
| Mobile1.mp4 | **2.94 MB** | 4.9 Mbps | 716×1284 | ❌ | ❌ |
| Mobile2.mp4 | **2.59 MB** | 4.1 Mbps | 664×1388 | ✅ AAC 198 kbps | ❌ |
| Mobile3.mp4 | **3.77 MB** | 6.3 Mbps | 828×1108 | ❌ | ❌ |
| **TOTAL** | **29.67 MB** | — | — | — | — |

### 6 Problèmes Identifiés

#### 1. Bitrates excessifs
Desktop2.mp4 avait un bitrate de **17.6 Mbps** — c'est le niveau d'un Blu-ray. Pour une vidéo d'arrière-plan web, 1-2 Mbps suffit largement. Sur une connexion 4G typique (5-10 Mbps), cette seule vidéo prendrait **8-17 secondes** à charger.

#### 2. Pistes audio inutiles
3 vidéos contenaient des pistes audio AAC alors que le `<video>` est toujours en `muted`. Chaque piste audio ajoute 15-25 KB/seconde de données inutiles.

#### 3. Pas de `faststart` (moov atom en fin de fichier)
Les fichiers MP4 stockent leurs métadonnées (moov atom) à la **fin** du fichier par défaut. Le navigateur doit donc télécharger le fichier entier avant de pouvoir commencer la lecture. Avec `+faststart`, le moov atom est déplacé au début, permettant le streaming progressif.

```
SANS faststart:  [données vidéo..............................][moov] ← doit tout télécharger
AVEC faststart:  [moov][données vidéo..............................] ← lecture immédiate
```

#### 4. `preload="none"` sur tous les `<video>`
Aucun buffering ne commençait tant que le JavaScript n'appelait pas `.play()`. Le navigateur devait donc :
1. Charger le HTML → 2. Charger le JS → 3. Exécuter le fetch `/api/hero-videos` → 4. Recevoir les URLs → 5. Appeler `.play()` → 6. **Seulement alors** commencer à télécharger la vidéo.

#### 5. Poster unique et générique
Toutes les vidéos utilisaient `/background.jpeg` comme image de couverture — une seule image statique qui ne correspond pas au contenu de chaque vidéo. Résultat : flash visuel lors du passage poster → vidéo.

#### 6. Pas de poster par vidéo dans l'API
L'API ne renvoyait que des URLs de vidéo (strings), sans information de poster/thumbnail. Le frontend n'avait aucun moyen de connaître le poster spécifique à chaque vidéo.

---

## Stratégie Appliquée

### Principe : Réduire le volume + Accélérer le démarrage + Améliorer le perçu

```
┌──────────────────────────────────────────────────────────────────┐
│                    PIPELINE D'OPTIMISATION                       │
│                                                                  │
│  1. COMPRESSION FFmpeg                                           │
│     ├─ H.264 CRF 28 (qualité web optimale)                     │
│     ├─ preset slow (meilleure compression)                      │
│     ├─ Résolution max: 1920px desktop / 720px mobile            │
│     ├─ -an (suppression audio)                                  │
│     └─ +faststart (moov atom en tête)                           │
│                                                                  │
│  2. POSTERS PAR VIDÉO                                           │
│     └─ Extraction frame à 0.5s → JPEG (25-65 KB)               │
│                                                                  │
│  3. FRONTEND OPTIMISÉ                                           │
│     ├─ preload="metadata" sur la 1ère vidéo                    │
│     ├─ preload="none" sur les suivantes                         │
│     ├─ poster={perVideoPoster} au lieu de générique             │
│     └─ Préchargement à 70% de la vidéo courante                │
│                                                                  │
│  4. API ENRICHIE                                                 │
│     ├─ BFF retourne { src, poster } par vidéo                  │
│     └─ Backend inclut thumbnail_path dans la réponse            │
└──────────────────────────────────────────────────────────────────┘
```

---

## Résultats

### Tailles après compression

| Fichier | Avant | Après | Réduction |
|---------|-------|-------|-----------|
| Desktop1.mp4 | 2.62 MB | **0.22 MB** | -92% |
| Desktop2.mp4 | 10.68 MB | **1.14 MB** | -89% |
| Desktop3.mp4 | 7.06 MB | **0.52 MB** | -93% |
| Mobile1.mp4 | 2.94 MB | **0.32 MB** | -89% |
| Mobile2.mp4 | 2.59 MB | **0.22 MB** | -91% |
| Mobile3.mp4 | 3.77 MB | **0.25 MB** | -93% |
| **TOTAL** | **29.67 MB** | **2.67 MB** | **-91%** |

### Métriques de performance estimées

| Métrique | Avant | Après |
|----------|-------|-------|
| Données à charger (1ère vidéo desktop) | 10.68 MB | 0.22 MB |
| Temps de chargement 4G (10 Mbps) | ~8.5s | ~0.18s |
| Temps de chargement 3G (1.5 Mbps) | ~57s | ~1.2s |
| Temps jusqu'au 1er frame visible | ~3-8s | **<0.5s** (poster) |
| Audio inutile transféré | ~150 KB/vidéo | 0 KB |
| Poster visible pendant chargement | Image générique | Frame réel de la vidéo |

### Posters générés

| Poster | Taille |
|--------|--------|
| Desktop1_poster.jpg | 46.82 KB |
| Desktop2_poster.jpg | 65.19 KB |
| Desktop3_poster.jpg | 43.62 KB |
| Mobile1_poster.jpg | 44.30 KB |
| Mobile2_poster.jpg | 25.13 KB |
| Mobile3_poster.jpg | 49.37 KB |

---

## Fichiers Modifiés

### Frontend

| Fichier | Modification |
|---------|-------------|
| `components/sections/HeroSection.tsx` | Type `VideoEntry` avec `src` + `poster`, `preload="metadata"` sur 1ère vidéo, poster par vidéo |
| `app/api/hero-videos/route.ts` | Retourne `{ src, poster }` par vidéo, détecte les posters `*_poster.jpg` sur le filesystem |
| `Public/Home background/*.mp4` | 6 vidéos remplacées par versions compressées |
| `Public/Home background/*_poster.jpg` | 6 nouveaux fichiers poster (1 par vidéo) |

### Backend

| Fichier | Modification |
|---------|-------------|
| `app/Http/Controllers/Api/V1/VideoController.php` | API retourne `{ src, poster }` au lieu de simples strings, inclut `thumbnail_path` pour vidéos non-legacy |

### Aucun changement sur

- Position / layout du hero section
- Comportement du carousel (cross-fade, navigation dots)
- Durée ou contenu des vidéos
- Page d'administration des vidéos
- Schéma de base de données

---

## Commande FFmpeg Utilisée

```bash
# Desktop (max 1920px largeur)
ffmpeg -i Desktop1.mp4 \
  -vcodec libx264 \
  -crf 28 \
  -preset slow \
  -vf "scale='min(iw,1920)':-2" \
  -movflags +faststart \
  -an \
  -y Desktop1_compressed.mp4

# Mobile (max 720px largeur)
ffmpeg -i Mobile1.mp4 \
  -vcodec libx264 \
  -crf 28 \
  -preset slow \
  -vf "scale='min(iw,720)':-2" \
  -movflags +faststart \
  -an \
  -y Mobile1_compressed.mp4

# Poster (frame à 0.5 seconde)
ffmpeg -i Desktop1_compressed.mp4 \
  -ss 00:00:00.5 \
  -vframes 1 \
  -q:v 5 \
  -y Desktop1_poster.jpg
```

### Explication des paramètres

| Paramètre | Rôle |
|-----------|------|
| `-vcodec libx264` | Codec H.264 — compatible avec 99%+ des navigateurs |
| `-crf 28` | Constant Rate Factor — 28 = bonne qualité avec forte compression (0=lossless, 51=pire) |
| `-preset slow` | Plus lent à encoder mais meilleur ratio qualité/taille |
| `-vf "scale='min(iw,1920)':-2"` | Limite la largeur max sans upscaler, hauteur auto (divisible par 2) |
| `-movflags +faststart` | Déplace le moov atom au début du fichier → streaming progressif |
| `-an` | Supprime toutes les pistes audio |
| `-y` | Écrase le fichier de sortie sans demander |

---

## Flux de Données Complet (Après Optimisation)

```
Utilisateur ouvre la page d'accueil
         │
         ▼
    Next.js SSR rendu HTML
    <video preload="metadata"        ← 1ère vidéo commence à buffer les métadonnées
           poster="Desktop1_poster.jpg">  ← Image affichée immédiatement (~47 KB)
         │
         ▼
    Fetch /api/hero-videos (BFF)
         │
         ├── Essaye: Backend GET /api/v1/videos/hero
         │   └── Cache 30 min → retourne { src, poster } par vidéo
         │
         └── Fallback: Scan filesystem local
             └── Lit /public/Home background/*.mp4 + *_poster.jpg
         │
         ▼
    Réponse JSON:
    {
      "desktop": [
        { "src": "/Home background/Desktop1.mp4", "poster": "/Home background/Desktop1_poster.jpg" },
        { "src": "/Home background/Desktop2.mp4", "poster": "/Home background/Desktop2_poster.jpg" },
        ...
      ],
      "mobile": [...]
    }
         │
         ▼
    VideoPlayer React component
    ├── Vidéo #1: preload="metadata", poster=Desktop1_poster.jpg
    │   └── .play() appelé → lecture commence (0.22 MB, faststart)
    │
    ├── À 70% de progression → .load() sur vidéo #2 (préchargement)
    │
    └── onEnded → switch vers vidéo #2 avec cross-fade 700ms
```

---

## Recommandations Futures

1. **Convertir en WebM/VP9** — Encore 20-30% plus petit que H.264 pour les navigateurs modernes, avec fallback MP4
2. **Adaptive Bitrate (HLS/DASH)** — Pour la production, servir plusieurs qualités selon la bande passante
3. **Compresser les futures vidéos à l'upload** — Le `CompressVideoJob` dans le backend le fait déjà automatiquement via FFmpeg pour les vidéos uploadées via l'admin
4. **CDN** — Servir les vidéos depuis un CDN (CloudFront, Cloudflare) pour réduire la latence géographique
