# PIXEL-MOTS 🎮
## Puzzle de mots Tech & Multimédia — C++/SFML

Un jeu de puzzle sans gravité où vous placez des blocs de lettres pour former des mots du vocabulaire technologique et multimédia.

---

## 🚀 Compilation

### Méthode 1 — Makefile (recommandée)
```bash
make
./PixelMots
```

### Méthode 2 — g++ direct
```bash
g++ -std=c++17 main.cpp -lsfml-graphics -lsfml-window -lsfml-system -o PixelMots
./PixelMots
```

### Méthode 3 — CMake
```bash
mkdir build && cd build
cmake ..
make
./PixelMots
```

### Prérequis
- **SFML 2.5+** installé

**Ubuntu/Debian :**
```bash
sudo apt install libsfml-dev
```

**macOS (Homebrew) :**
```bash
brew install sfml
```

**Arch Linux :**
```bash
sudo pacman -S sfml
```

---

## 🎮 Contrôles

| Touche | Action |
|--------|--------|
| ← → ↑ ↓ | Déplacer le bloc actuel |
| Espace / Entrée | Placer le bloc sur la grille |

---

## 🧩 Règles du jeu

1. **Objectif** : Former des mots de vocabulaire tech horizontalement ou verticalement
2. **Blocs pré-placés** : Certains blocs sont déjà sur la grille comme indices — ils ne bougent pas
3. **Définitions** : À droite de la grille, les définitions des mots à trouver s'affichent
4. **Validation** : Quand un mot valide est formé → animation + disparition + score
5. **Erreurs** : Placement invalide → flash rouge + perte d'une vie
6. **Vies** : 3 vies au départ, +1 si niveau réussi (max 3), 0 vie = retour au menu

---

## 📊 Niveaux

| Niveau | Titre | Mots | Difficulté |
|--------|-------|------|------------|
| 1 | Initiation | BIT, CPU, RAM | ⭐ |
| 2 | Débutant | WIFI, USB, OCTET | ⭐⭐ |
| 3 | Intermédiaire | PIXEL, MODEM, CACHE | ⭐⭐⭐ |
| 4 | Avancé | RESEAU, SERVEUR, BINAIRE | ⭐⭐⭐⭐ |
| 5 | Expert | CODEC, FIBRE, NOYAU, PROXY | ⭐⭐⭐⭐⭐ |

---

## 🏗️ Architecture

```
main.cpp
├── struct EntreeDictionnaire   — mot + définition
├── struct Bloc                 — bloc de lettres
├── struct ConfigNiveau         — configuration d'un niveau
├── struct ResultatVerification — résultat de validation
├── class GestionnaireMots      — dictionnaire + validation
├── class Grille                — grille de jeu + logique placement
├── class FabriqueNiveaux       — génération des 5 niveaux
├── class Interface             — rendu SFML (texte, formes)
└── class Jeu                   — orchestration principale
```

---

## 🎨 Palette graphique

- Fond sombre cyber : `#0A0C14`
- Bloc actif : cyan `#00C8FF`
- Accent : magenta `#FF4682`
- Score/Or : `#FFD23C`
- Succès : vert `#32E678`
- Erreur : rouge `#FF3C3C`

---

*Développé en C++17 avec SFML 2.5 — Tout en français 🇫🇷*
