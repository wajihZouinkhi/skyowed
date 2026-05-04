/**
 * ╔══════════════════════════════════════════════════════════════════╗
 * ║           PIXEL-MOTS — Jeu de puzzle de mots tech/multimédia   ║
 * ║           Développé en C++ avec SFML                            ║
 * ║           Sans gravité — placement stratégique de blocs lettres ║
 * ╚══════════════════════════════════════════════════════════════════╝
 *
 * Compilation :
 *   g++ -std=c++17 main.cpp -lsfml-graphics -lsfml-window -lsfml-system -lsfml-audio -o PixelMots
 *   (ou avec cmake / makefile selon votre environnement)
 *
 * Dépendances : SFML 2.5+
 */

#include <SFML/Graphics.hpp>
#include <SFML/Window.hpp>
#include <SFML/System.hpp>
// Note : SFML Audio optionnel – commenté si non disponible
// #include <SFML/Audio.hpp>

#include <iostream>
#include <vector>
#include <string>
#include <map>
#include <set>
#include <algorithm>
#include <random>
#include <sstream>
#include <chrono>
#include <functional>

// ═══════════════════════════════════════════════════════════════════
//  CONSTANTES GLOBALES
// ═══════════════════════════════════════════════════════════════════

// Dimensions de la fenêtre
const int LARGEUR_FENETRE   = 1100;
const int HAUTEUR_FENETRE   = 750;

// Grille de jeu
const int COLS_GRILLE       = 12;   // colonnes de la grille
const int LIGNES_GRILLE     = 12;   // lignes de la grille
const int TAILLE_CELLULE    = 52;   // pixels par cellule
const int OFFSET_X_GRILLE   = 20;   // décalage X de la grille
const int OFFSET_Y_GRILLE   = 80;   // décalage Y de la grille

// Panneau latéral
const int PANEL_X           = OFFSET_X_GRILLE + COLS_GRILLE * TAILLE_CELLULE + 20;
const int PANEL_LARGEUR     = LARGEUR_FENETRE - PANEL_X - 10;

// Couleurs (palette cyber/rétro)
const sf::Color COULEUR_FOND          (10,  12,  20);   // Fond sombre
const sf::Color COULEUR_GRILLE        (30,  35,  60);   // Lignes de grille
const sf::Color COULEUR_BLOC_ACTIF    (0,   200, 255);  // Bloc en cours (cyan)
const sf::Color COULEUR_BLOC_PLACE    (50,  160, 220);  // Bloc placé
const sf::Color COULEUR_BLOC_FIXE     (80,  90,  140);  // Bloc pré-placé (grisé)
const sf::Color COULEUR_TEXTE         (220, 230, 255);  // Texte principal
const sf::Color COULEUR_ACCENT        (255, 70,  130);  // Accent magenta
const sf::Color COULEUR_OR            (255, 210, 60);   // Or (score/niveau)
const sf::Color COULEUR_VERT          (50,  230, 120);  // Succès
const sf::Color COULEUR_ROUGE         (255, 60,  60);   // Erreur
const sf::Color COULEUR_PANEL         (15,  18,  35);   // Fond panneau
const sf::Color COULEUR_SURBRILLANCE  (255, 255, 100, 180); // Mot validé
const sf::Color COULEUR_CIBLE         (0,  200, 255, 35);   // Ghost target
const sf::Color COULEUR_CORRECT       (50, 230, 120, 120);  // Block at correct pos


// ═══════════════════════════════════════════════════════════════════
//  STRUCTURES DE DONNÉES
// ═══════════════════════════════════════════════════════════════════

/** Représente un mot du dictionnaire avec sa définition */
struct EntreeDictionnaire {
    std::string mot;
    std::string definition;
};

/** Position dans la grille */
struct Position {
    int col, ligne;
    bool operator==(const Position& a) const { return col == a.col && ligne == a.ligne; }
};

/** Un bloc lettre (1 à 3 lettres) */
struct Bloc {
    std::string lettres;    // contenu du bloc (ex: "RE", "PIX")
    Position    pos;        // position dans la grille
    Position    cible;      // position cible correcte (pour validation)
    bool        estFixe;    // vrai = pré-placé, non déplaçable
    bool        estPlace;   // vrai = déjà posé sur la grille
    sf::Color   couleur;    // couleur d'affichage

    Bloc() : lettres(""), pos({0,0}), cible({0,0}), estFixe(false), estPlace(false), couleur(COULEUR_BLOC_PLACE) {}
    Bloc(const std::string& l, int c, int li, bool fixe = false)
        : lettres(l), pos({c, li}), cible({c, li}), estFixe(fixe), estPlace(fixe),
          couleur(fixe ? COULEUR_BLOC_FIXE : COULEUR_BLOC_PLACE) {}
};

/** Configuration d'un niveau */
struct ConfigNiveau {
    int                        numero;
    std::string                titre;
    std::vector<EntreeDictionnaire> mots;       // mots à former
    std::vector<Bloc>          blocsPreplaces;  // blocs pré-placés (indices)
    std::vector<Bloc>          blocsAJouer;     // blocs à jouer
    int                        nombreVies;      // vies données à ce niveau
};

/** Résultat d'une vérification de mot */
struct ResultatVerification {
    bool         motTrouve;
    std::string  mot;
    Position     debut;
    bool         horizontal;
    int          longueur;
    int          scoreGagne;
};


// ═══════════════════════════════════════════════════════════════════
//  GESTIONNAIRE DE MOTS — dictionnaire et vérification
// ═══════════════════════════════════════════════════════════════════
class GestionnaireMots {
public:
    // Dictionnaire interne (mots tech/multimédia + définitions françaises)
    std::vector<EntreeDictionnaire> dictionnaire = {
        {"PIXEL",    "Plus petite unité d'image sur un écran numérique"},
        {"CODEC",    "Logiciel codant et décodant des données multimédia"},
        {"RESEAU",   "Ensemble d'appareils connectés pour communiquer"},
        {"SERVEUR",  "Ordinateur fournissant des services à d'autres machines"},
        {"BINAIRE",  "Système numérique à base 2 : zéros et uns"},
        {"OCTET",    "Unité d'info composée de 8 bits"},
        {"BIT",      "Plus petite unité d'information numérique"},
        {"CPU",      "Cerveau de l'ordinateur, il exécute les calculs"},
        {"RAM",      "Mémoire vive, stockage rapide et temporaire"},
        {"USB",      "Interface de connexion universelle en série"},
        {"CACHE",    "Mémoire intermédiaire rapide pour accélérer les accès"},
        {"FIBRE",    "Câble transmettant des données par lumière"},
        {"DOSSIER",  "Répertoire regroupant des fichiers informatiques"},
        {"ECRAN",    "Surface d'affichage des images numériques"},
        {"ICONE",    "Petit symbole graphique représentant une action"},
        {"LASER",    "Rayon lumineux concentré utilisé en lecture optique"},
        {"MODEM",    "Appareil modulant le signal pour transmission réseau"},
        {"NOYAU",    "Cœur du système d'exploitation gérant le matériel"},
        {"PATCH",    "Mise à jour corrigeant un bug ou faille logicielle"},
        {"PROXY",    "Serveur intermédiaire entre client et destination"},
        {"QUEUE",    "Structure de données Premier Entré, Premier Sorti"},
        {"TOKEN",    "Jeton numérique d'authentification ou de session"},
        {"VIDEO",    "Séquence d'images animées enregistrée numériquement"},
        {"VIRUS",    "Programme malveillant se répliquant dans le système"},
        {"WIFI",     "Réseau sans fil utilisant des ondes radio"},
        {"XML",      "Langage de balisage structurant les données textuelles"},
        {"ZIP",      "Format de compression réduisant la taille des fichiers"},
        {"API",      "Interface permettant la communication entre logiciels"},
        {"GPU",      "Processeur dédié au calcul graphique et 3D"},
        {"SSD",      "Disque dur à mémoire flash, très rapide"},
        {"LAN",      "Réseau local reliant des machines proches"},
        {"WAN",      "Réseau étendu couvrant de grandes distances"},
        {"DNS",      "Système traduisant les noms de domaine en adresses IP"},
        {"FTP",      "Protocole de transfert de fichiers via réseau"},
        {"HTTP",     "Protocole de communication du Web"},
        {"IP",       "Adresse unique identifiant un appareil sur le réseau"},
        {"OS",       "Système d'exploitation gérant les ressources machine"},
        {"CD",       "Disque optique de stockage de données numérique"},
        {"HD",       "Haute Définition, résolution d'image supérieure"},
        {"MP3",      "Format audio compressé très répandu sur le Web"},
        {"PNG",      "Format image numérique sans perte avec transparence"},
        {"SQL",      "Langage d'interrogation des bases de données"},
        {"VPN",      "Réseau privé virtuel sécurisant la connexion Internet"},
        {"HTML",     "Langage de balisage structurant les pages Web"},
        {"DATA",     "Ensemble de données numériques stockées ou traitées"},
    };

    /** Vérifie si un mot existe dans le dictionnaire */
    bool estMotValide(const std::string& mot) const {
        for (const auto& entree : dictionnaire) {
            if (entree.mot == mot) return true;
        }
        return false;
    }

    /** Retourne la définition d'un mot */
    std::string getDefinition(const std::string& mot) const {
        for (const auto& entree : dictionnaire) {
            if (entree.mot == mot) return entree.definition;
        }
        return "";
    }

    /** Sélectionne aléatoirement N entrées du dictionnaire */
    std::vector<EntreeDictionnaire> selectionnerMots(int n, std::mt19937& rng) {
        auto copie = dictionnaire;
        std::shuffle(copie.begin(), copie.end(), rng);
        copie.resize(std::min(n, (int)copie.size()));
        return copie;
    }
};


// ═══════════════════════════════════════════════════════════════════
//  GRILLE — gestion de la grille de jeu
// ═══════════════════════════════════════════════════════════════════
class Grille {
public:
    // Tableau 2D : chaque cellule contient une lettre ou vide ""
    std::vector<std::vector<std::string>> cellules;
    // Tableau indiquant si la cellule est fixe (pré-placée)
    std::vector<std::vector<int>>        estFixe;

    Grille() {
        cellules.assign(LIGNES_GRILLE, std::vector<std::string>(COLS_GRILLE, ""));
        estFixe.assign(LIGNES_GRILLE,  std::vector<int>(COLS_GRILLE, 0));
    }

    /** Réinitialise la grille */
    void reinitialiser() {
        for (auto& ligne : cellules)
            for (auto& c : ligne) c = "";
        for (auto& ligne : estFixe)
            for (auto& c : ligne) c = false;
    }

    /** Vérifie si une position est dans les limites */
    bool estDansLimites(int col, int ligne) const {
        return col >= 0 && col < COLS_GRILLE && ligne >= 0 && ligne < LIGNES_GRILLE;
    }

    /** Vérifie si des cases sont libres pour un bloc (plusieurs lettres) */
    bool peutPlacer(const Bloc& bloc, int col, int ligne) const {
        int nbLettres = (int)bloc.lettres.size();
        // On place horizontalement si plus d'une lettre
        for (int i = 0; i < nbLettres; i++) {
            if (!estDansLimites(col + i, ligne)) return false;
            if (!cellules[ligne][col + i].empty()) return false;
        }
        return true;
    }

    /** Place un bloc dans la grille */
    void placerBloc(const Bloc& bloc, bool fixe = false) {
        int nbLettres = (int)bloc.lettres.size();
        for (int i = 0; i < nbLettres; i++) {
            if (estDansLimites(bloc.pos.col + i, bloc.pos.ligne)) {
                cellules[bloc.pos.ligne][bloc.pos.col + i] = std::string(1, bloc.lettres[i]);
                estFixe[bloc.pos.ligne][bloc.pos.col + i]  = fixe;
            }
        }
    }

    /** Efface les cellules d'un bloc */
    void effacerBloc(const Bloc& bloc) {
        int nbLettres = (int)bloc.lettres.size();
        for (int i = 0; i < nbLettres; i++) {
            if (estDansLimites(bloc.pos.col + i, bloc.pos.ligne)) {
                if (!estFixe[bloc.pos.ligne][bloc.pos.col + i]) {
                    cellules[bloc.pos.ligne][bloc.pos.col + i] = "";
                }
            }
        }
    }

    /** Lit la chaîne horizontale à partir d'une position */
    std::string lireHorizontal(int col, int ligne, int longueur) const {
        std::string res = "";
        for (int i = 0; i < longueur; i++) {
            if (!estDansLimites(col + i, ligne) || cellules[ligne][col + i].empty())
                return "";
            res += cellules[ligne][col + i];
        }
        return res;
    }

    /** Lit la chaîne verticale à partir d'une position */
    std::string lireVertical(int col, int ligne, int longueur) const {
        std::string res = "";
        for (int i = 0; i < longueur; i++) {
            if (!estDansLimites(col, ligne + i) || cellules[ligne + i][col].empty())
                return "";
            res += cellules[ligne + i][col];
        }
        return res;
    }

    /** Cherche tous les mots formés après un placement */
    std::vector<ResultatVerification> chercherMots(
        const GestionnaireMots& gm,
        const std::vector<EntreeDictionnaire>& motsNiveau) const
    {
        std::vector<ResultatVerification> trouves;
        // Construire un ensemble des mots du niveau
        std::set<std::string> objectifs;
        for (const auto& e : motsNiveau) objectifs.insert(e.mot);

        // Parcourir toutes les lignes horizontalement
        for (int li = 0; li < LIGNES_GRILLE; li++) {
            for (int co = 0; co < COLS_GRILLE; co++) {
                for (int lon = 2; lon <= COLS_GRILLE - co; lon++) {
                    std::string mot = lireHorizontal(co, li, lon);
                    if (mot.size() >= 2 && objectifs.count(mot) && gm.estMotValide(mot)) {
                        // Vérifier qu'il n'est pas inclus dans un mot plus long
                        bool bord_gauche = (co == 0 || cellules[li][co-1].empty());
                        bool bord_droit  = (co+lon >= COLS_GRILLE || cellules[li][co+lon].empty());
                        if (bord_gauche && bord_droit) {
                            ResultatVerification r;
                            r.motTrouve  = true;
                            r.mot        = mot;
                            r.debut      = {co, li};
                            r.horizontal = true;
                            r.longueur   = lon;
                            r.scoreGagne = (int)mot.size() * 50 + 100;
                            trouves.push_back(r);
                        }
                    }
                }
            }
        }

        // Parcourir toutes les colonnes verticalement
        for (int co = 0; co < COLS_GRILLE; co++) {
            for (int li = 0; li < LIGNES_GRILLE; li++) {
                for (int lon = 2; lon <= LIGNES_GRILLE - li; lon++) {
                    std::string mot = lireVertical(co, li, lon);
                    if (mot.size() >= 2 && objectifs.count(mot) && gm.estMotValide(mot)) {
                        bool bord_haut = (li == 0 || cellules[li-1][co].empty());
                        bool bord_bas  = (li+lon >= LIGNES_GRILLE || cellules[li+lon][co].empty());
                        if (bord_haut && bord_bas) {
                            ResultatVerification r;
                            r.motTrouve  = true;
                            r.mot        = mot;
                            r.debut      = {co, li};
                            r.horizontal = false;
                            r.longueur   = lon;
                            r.scoreGagne = (int)mot.size() * 50 + 120;
                            trouves.push_back(r);
                        }
                    }
                }
            }
        }
        return trouves;
    }

    /** Efface les lettres d'un mot validé (unused in improved version) */
    void effacerMot(const ResultatVerification& res) {
        // Words now stay on the grid as validated — no erasing
    }
};


// ═══════════════════════════════════════════════════════════════════
//  FABRIQUE DE NIVEAUX — génère les 5 niveaux
// ═══════════════════════════════════════════════════════════════════
class FabriqueNiveaux {
public:
    /**
     * Génère la configuration des 5 niveaux.
     * Chaque niveau a :
     *   - Des mots disposés dans la grille (certains pré-placés comme indices)
     *   - Des blocs à jouer (lettres restantes)
     */
    static std::vector<ConfigNiveau> genererNiveaux() {
        std::vector<ConfigNiveau> niveaux;

        // ─── NIVEAU 1 : Mots courts, beaucoup d'indices ─────────────────
        {
            ConfigNiveau n;
            n.numero = 1;
            n.titre  = "NIVEAU 1 — Initiation";
            n.nombreVies = 5;

            // Mots du niveau : BIT (col0 ligne1), CPU (col0 ligne3), RAM (col0 ligne5)
            n.mots = {
                {"BIT",  "Plus petite unité d'information numérique"},
                {"CPU",  "Cerveau de l'ordinateur, il exécute les calculs"},
                {"RAM",  "Mémoire vive, stockage rapide et temporaire"},
            };

            // BIT → B(0,1) I(1,1) T(2,1)  — pré-placer B et I, joueur doit mettre T
            n.blocsPreplaces = {
                Bloc("B",  0, 1, true),
                Bloc("I",  1, 1, true),
                // CPU → C(0,3) P(1,3) U(2,3) — pré-placer C
                Bloc("C",  0, 3, true),
                // RAM → R(0,5) A(1,5) M(2,5) — pré-placer R et A
                Bloc("R",  0, 5, true),
                Bloc("A",  1, 5, true),
            };

            // Blocs restants à jouer (avec leurs coordonnées cibles)
            n.blocsAJouer = {
                Bloc("T",  2, 1),   // pour BIT
                Bloc("PU", 1, 3),   // pour CPU
                Bloc("M",  2, 5),   // pour RAM
            };

            niveaux.push_back(n);
        }

        // ─── NIVEAU 2 : Mots moyens, indices réduits ────────────────────
        {
            ConfigNiveau n;
            n.numero = 2;
            n.titre  = "NIVEAU 2 — Débutant";
            n.nombreVies = 5;

            n.mots = {
                {"WIFI",   "Réseau sans fil utilisant des ondes radio"},
                {"USB",    "Interface de connexion universelle en série"},
                {"OCTET",  "Unité d'info composée de 8 bits"},
            };

            // WIFI → W(0,0) I(1,0) F(2,0) I(3,0)
            n.blocsPreplaces = {
                Bloc("W",  0, 0, true),
                Bloc("IF", 1, 0, true),   // bloc de 2 lettres pré-placé
                // USB → U(0,2) S(1,2) B(2,2) — seulement U
                Bloc("U",  0, 2, true),
                // OCTET → O(0,4) C(1,4) T(2,4) E(3,4) T(4,4) — O et C
                Bloc("OC", 0, 4, true),
            };

            n.blocsAJouer = {
                Bloc("I",   3, 0),    // fin de WIFI
                Bloc("SB",  1, 2),    // SB pour USB
                Bloc("TET", 2, 4),    // TET pour OCTET
            };

            niveaux.push_back(n);
        }

        // ─── NIVEAU 3 : Mots plus longs, peu d'indices ──────────────────
        {
            ConfigNiveau n;
            n.numero = 3;
            n.titre  = "NIVEAU 3 — Intermédiaire";
            n.nombreVies = 5;

            n.mots = {
                {"PIXEL",   "Plus petite unité d'image sur un écran numérique"},
                {"MODEM",   "Appareil modulant le signal pour transmission réseau"},
                {"CACHE",   "Mémoire intermédiaire rapide pour accélérer les accès"},
            };

            // PIXEL → P(0,0) I(1,0) X(2,0) E(3,0) L(4,0)
            n.blocsPreplaces = {
                Bloc("PIX", 0, 0, true),   // 3 premières lettres
                // MODEM → M(0,2) O(1,2) D(2,2) E(3,2) M(4,2) — seulement MO
                Bloc("MO",  0, 2, true),
                // CACHE → C(0,4) A(1,4) C(2,4) H(3,4) E(4,4) — seulement C
                Bloc("C",   0, 4, true),
            };

            n.blocsAJouer = {
                Bloc("EL",  3, 0),     // EL pour PIXEL
                Bloc("DEM", 2, 2),     // DEM pour MODEM
                Bloc("ACH", 1, 4),     // ACH pour CACHE
                Bloc("E",   4, 4),     // E final pour CACHE
            };

            niveaux.push_back(n);
        }

        // ─── NIVEAU 4 : Mots longs, très peu d'indices ──────────────────
        {
            ConfigNiveau n;
            n.numero = 4;
            n.titre  = "NIVEAU 4 — Avancé";
            n.nombreVies = 5;

            n.mots = {
                {"RESEAU",  "Ensemble d'appareils connectés pour communiquer"},
                {"SERVEUR", "Ordinateur fournissant des services à d'autres machines"},
                {"BINAIRE", "Système numérique à base 2 : zéros et uns"},
            };

            // RESEAU horizontal ligne 0
            n.blocsPreplaces = {
                Bloc("RE",  0, 0, true),
                // SERVEUR horizontal ligne 2 — seulement S
                Bloc("S",   0, 2, true),
                // BINAIRE horizontal ligne 4 — seulement BI
                Bloc("BI",  0, 4, true),
            };

            n.blocsAJouer = {
                Bloc("SE",  2, 0),     // pour RESEAU
                Bloc("AU",  4, 0),     // fin de RESEAU
                Bloc("ERV", 1, 2),     // pour SERVEUR
                Bloc("EUR", 4, 2),     // fin de SERVEUR
                Bloc("NAI", 2, 4),     // pour BINAIRE
                Bloc("RE",  5, 4),     // fin de BINAIRE
            };

            niveaux.push_back(n);
        }

        // ─── NIVEAU 5 : Expert — mots longs, blocs ambigus ──────────────
        {
            ConfigNiveau n;
            n.numero = 5;
            n.titre  = "NIVEAU 5 — EXPERT";
            n.nombreVies = 5;

            n.mots = {
                {"CODEC",   "Logiciel codant et décodant des données multimédia"},
                {"FIBRE",   "Câble transmettant des données par lumière"},
                {"NOYAU",   "Cœur du système d'exploitation gérant le matériel"},
                {"PROXY",   "Serveur intermédiaire entre client et destination"},
            };

            // Très peu d'indices : seulement 1 lettre par mot
            n.blocsPreplaces = {
                Bloc("C",   0, 0, true),   // début CODEC
                Bloc("F",   0, 2, true),   // début FIBRE
                Bloc("NO",  0, 4, true),   // début NOYAU
                Bloc("P",   0, 6, true),   // début PROXY
            };

            n.blocsAJouer = {
                Bloc("ODE", 1, 0),   // pour CODEC
                Bloc("C",   4, 0),   // fin CODEC
                Bloc("IBR", 1, 2),   // pour FIBRE
                Bloc("E",   4, 2),   // fin FIBRE
                Bloc("YAU", 2, 4),   // fin NOYAU
                Bloc("ROX", 1, 6),   // pour PROXY
                Bloc("Y",   4, 6),   // fin PROXY
            };

            niveaux.push_back(n);
        }

        return niveaux;
    }
};


// ═══════════════════════════════════════════════════════════════════
//  INTERFACE — rendu graphique et texte
// ═══════════════════════════════════════════════════════════════════
class Interface {
public:
    sf::Font            police;
    bool                policeChargee;

    // Chargement unique de la police Windows au démarrage
    Interface() : policeChargee(false) {
        // Chemins Windows système — ordre de préférence
        const std::vector<std::string> cheminsFonts = {
            "/usr/share/fonts/truetype/dejavu/DejaVuSans.ttf",
            "/usr/share/fonts/truetype/dejavu/DejaVuSans-Bold.ttf",
            "/usr/share/fonts/truetype/liberation/LiberationSans-Regular.ttf",
            "/usr/share/fonts/truetype/freefont/FreeSans.ttf",
            "/usr/share/fonts/truetype/ubuntu/Ubuntu-R.ttf",
            "C:/Windows/Fonts/arial.ttf",
            "C:/Windows/Fonts/arialbd.ttf",
            "C:/Windows/Fonts/verdana.ttf",
            "C:/Windows/Fonts/tahoma.ttf",
            "C:/Windows/Fonts/trebucbd.ttf",
            "C:/Windows/Fonts/cour.ttf"
        };

        for (const auto& chemin : cheminsFonts) {
            if (police.loadFromFile(chemin)) {
                policeChargee = true;
                std::cout << "[Police] Chargée : " << chemin << std::endl;
                break;
            }
        }

        if (!policeChargee) {
            std::cerr << "[Police] ERREUR : Aucune police Windows trouvée dans C:/Windows/Fonts/." << std::endl;
            std::cerr << "         Vérifiez que les fichiers arial.ttf / verdana.ttf existent." << std::endl;
            // SFML affichera quand même le texte avec sa police interne de secours
        }
    }

    /** Dessine un texte avec correction UTF-8 et contour automatique */
    void texte(sf::RenderWindow& fen, const std::string& msg,
               float x, float y, unsigned int taille,
               const sf::Color& couleur = COULEUR_TEXTE,
               bool centre = false)
    {
        sf::Text t;
        t.setFont(police);
        // UTF-8 fix : fromUtf8 décode correctement les accents, ♥, ✓, →, etc.
        t.setString(sf::String::fromUtf8(msg.begin(), msg.end()));
        t.setCharacterSize(taille);
        t.setFillColor(couleur);
        // Contour auto pour grands caractères — lisibilité sur fond sombre
        if (taille >= 18) {
            t.setOutlineColor(sf::Color(0, 0, 0, 200));
            t.setOutlineThickness(taille >= 40 ? 2.5f : 1.5f);
        }
        if (centre) {
            sf::FloatRect bounds = t.getLocalBounds();
            t.setPosition(
                x - bounds.left - bounds.width  / 2.f,
                y - bounds.top
            );
        } else {
            t.setPosition(x, y);
        }
        fen.draw(t);
    }

    /** Texte avec ombre portée (double passe) — idéal pour les titres */
    void texteOmbre(sf::RenderWindow& fen, const std::string& msg,
                    float x, float y, unsigned int taille,
                    const sf::Color& couleur, bool centre = false)
    {
        // Ombre décalée semi-transparente
        texte(fen, msg, x + 3.f, y + 3.f, taille, sf::Color(0, 0, 0, 130), centre);
        // Texte principal par-dessus
        texte(fen, msg, x, y, taille, couleur, centre);
    }

    /**
     * Lettre centrée pixel-perfect dans une cellule — UTF-8 + contour pour lisibilité.
     */
    void texteCell(sf::RenderWindow& fen, const std::string& msg,
                   float cellX, float cellY, float cellW, float cellH,
                   unsigned int taille, const sf::Color& couleur)
    {
        sf::Text t;
        t.setFont(police);
        t.setString(sf::String::fromUtf8(msg.begin(), msg.end()));
        t.setCharacterSize(taille);
        t.setFillColor(couleur);
        t.setOutlineColor(sf::Color(0, 0, 0, 220));
        t.setOutlineThickness(1.8f);
        sf::FloatRect b = t.getLocalBounds();
        t.setPosition(
            cellX + (cellW - b.left - b.width)  / 2.f,
            cellY + (cellH - b.top  - b.height) / 2.f
        );
        fen.draw(t);
    }

    /** Dessine un rectangle plein */
    void rectangle(sf::RenderWindow& fen, float x, float y, float w, float h,
                   const sf::Color& couleur, float arrondi = 0)
    {
        sf::RectangleShape rect({w, h});
        rect.setPosition(x, y);
        rect.setFillColor(couleur);
        fen.draw(rect);
    }

    /** Dessine un rectangle contour seulement */
    void contour(sf::RenderWindow& fen, float x, float y, float w, float h,
                 const sf::Color& couleur, float epaisseur = 1.5f)
    {
        sf::RectangleShape rect({w, h});
        rect.setPosition(x, y);
        rect.setFillColor(sf::Color::Transparent);
        rect.setOutlineColor(couleur);
        rect.setOutlineThickness(epaisseur);
        fen.draw(rect);
    }

    /** Découpe une ligne de texte en plusieurs lignes selon largeur max */
    std::vector<std::string> decouperTexte(const std::string& texte, unsigned int maxChars) {
        std::vector<std::string> lignes;
        std::string mot;
        std::string ligne;
        std::istringstream iss(texte);
        while (iss >> mot) {
            if (ligne.size() + mot.size() + 1 > maxChars && !ligne.empty()) {
                lignes.push_back(ligne);
                ligne = mot;
            } else {
                if (!ligne.empty()) ligne += " ";
                ligne += mot;
            }
        }
        if (!ligne.empty()) lignes.push_back(ligne);
        return lignes;
    }
};


// ═══════════════════════════════════════════════════════════════════
//  JEU — classe principale orchestrant tout
// ═══════════════════════════════════════════════════════════════════
class Jeu {
private:
    sf::RenderWindow        fenetre;
    Grille                  grille;
    GestionnaireMots        gestMots;
    Interface               ui;

    // État du jeu
    int                     scoreTotal;
    int                     vies;
    int                     niveauActuel;      // 1..5
    std::vector<ConfigNiveau> niveaux;

    // Blocs du niveau en cours
    std::vector<Bloc>       blocsAJouer;       // file de blocs à placer
    int                     indexBlocActuel;   // index dans blocsAJouer
    Bloc                    blocCurseur;        // bloc que le joueur déplace
    bool                    enCoursDeJeu;
    bool                    niveauTermine;

    // Mots déjà trouvés (pour ne pas les re-valider)
    std::set<std::string>   motsTrouves;
    std::vector<EntreeDictionnaire> motsNiveau; // objectifs du niveau

    // Animation flash rouge (erreur)
    float                   tempsFlashRouge;   // > 0 = flash actif
    bool                    flashActif;

    // Animation surbrillance mot trouvé
    struct AnimMot {
        ResultatVerification res;
        float                temps;     // durée restante
        float                alpha;
    };
    std::vector<AnimMot>    animMots;

    // État général
    enum class Etat { MENU, JEU, NIVEAU_TERMINE, GAME_OVER, VICTOIRE };
    Etat                    etat;

    // Horloge
    sf::Clock               horloge;

    // Générateur aléatoire
    std::mt19937            rng;

    // Message temporaire à l'écran
    std::string             messageTemp;
    float                   tempsMessage;

public:
    Jeu()
        : fenetre(sf::VideoMode(LARGEUR_FENETRE, HAUTEUR_FENETRE), "PIXEL-MOTS — Puzzle de Mots Tech"),
          scoreTotal(0), vies(5), niveauActuel(1),
          indexBlocActuel(0), enCoursDeJeu(false),
          niveauTermine(false), tempsFlashRouge(0), flashActif(false),
          etat(Etat::MENU), tempsMessage(0)
    {
        fenetre.setFramerateLimit(60);
        niveaux = FabriqueNiveaux::genererNiveaux();
        rng.seed(std::chrono::steady_clock::now().time_since_epoch().count());
    }

    /** Lance la boucle principale du jeu */
    void lancer() {
        while (fenetre.isOpen()) {
            float dt = horloge.restart().asSeconds();
            gererEvenements();
            mettreAJour(dt);
            dessiner();
        }
    }

private:

    // ─── INITIALISATION D'UN NIVEAU ──────────────────────────────────
    void initialiserNiveau(int num) {
        niveauActuel = num;
        grille.reinitialiser();
        motsTrouves.clear();
        animMots.clear();
        flashActif = false;
        tempsFlashRouge = 0;
        niveauTermine = false;

        // Récupérer la config du niveau (index 0..4)
        const ConfigNiveau& cfg = niveaux[num - 1];
        motsNiveau = cfg.mots;

        // Placer les blocs pré-placés (indices fixes)
        for (const Bloc& b : cfg.blocsPreplaces) {
            grille.placerBloc(b, true);
        }

        // Copier les blocs à jouer dans l'ordre des mots (pas mélangé)
        blocsAJouer = cfg.blocsAJouer;

        indexBlocActuel = 0;
        chargerProchainBloc();

        etat = Etat::JEU;
        afficherMessage("Niveau " + std::to_string(num) + " — Placez les blocs !", 3.0f);
    }

    /** Charge le prochain bloc dans le curseur — démarre près de la cible */
    void chargerProchainBloc() {
        if (indexBlocActuel < (int)blocsAJouer.size()) {
            blocCurseur = blocsAJouer[indexBlocActuel];
            // Start block near its target row but offset right so player can see it
            int startCol = std::min(blocCurseur.cible.col + 3, COLS_GRILLE - (int)blocCurseur.lettres.size());
            blocCurseur.pos = {startCol, blocCurseur.cible.ligne};
            blocCurseur.estPlace = false;
        } else {
            // Plus de blocs à jouer → vérifier si le niveau est terminé
            verifierNiveauTermine();
        }
    }

    /** Vérifie si tous les mots ont été trouvés */
    void verifierNiveauTermine() {
        if ((int)motsTrouves.size() >= (int)motsNiveau.size()) {
            niveauTermine = true;
            vies = std::min(5, vies + 1);  // +1 vie (max 5)
            scoreTotal += niveauActuel * 500; // bonus de niveau
            if (niveauActuel >= 5) {
                etat = Etat::VICTOIRE;
            } else {
                etat = Etat::NIVEAU_TERMINE;
            }
        }
    }

    // ─── GESTION DES ÉVÉNEMENTS ───────────────────────────────────────
    void gererEvenements() {
        sf::Event evt;
        while (fenetre.pollEvent(evt)) {
            if (evt.type == sf::Event::Closed) {
                fenetre.close();
            }

            if (evt.type == sf::Event::KeyPressed) {
                switch (etat) {
                    case Etat::MENU:
                        if (static_cast<sf::Keyboard::Key>(evt.key.code) == sf::Keyboard::Return ||
                            static_cast<sf::Keyboard::Key>(evt.key.code) == sf::Keyboard::Space) {
                            scoreTotal = 0;
                            vies = 5;
                            initialiserNiveau(1);
                        }
                        break;

                    case Etat::JEU:
                        gererTouchesJeu(static_cast<sf::Keyboard::Key>(evt.key.code));
                        break;

                    case Etat::NIVEAU_TERMINE:
                        if (static_cast<sf::Keyboard::Key>(evt.key.code) == sf::Keyboard::Return ||
                            static_cast<sf::Keyboard::Key>(evt.key.code) == sf::Keyboard::Space) {
                            initialiserNiveau(niveauActuel + 1);
                        }
                        break;

                    case Etat::GAME_OVER:
                    case Etat::VICTOIRE:
                        if (static_cast<sf::Keyboard::Key>(evt.key.code) == sf::Keyboard::Return ||
                            static_cast<sf::Keyboard::Key>(evt.key.code) == sf::Keyboard::Space) {
                            etat = Etat::MENU;
                        }
                        break;

                    default: break;
                }
            }
        }
    }

    /** Gestion des touches pendant le jeu */
    void gererTouchesJeu(sf::Keyboard::Key touche) {
        if (indexBlocActuel >= (int)blocsAJouer.size()) return;

        int dx = 0, dy = 0;
        bool placer = false;

        switch (touche) {
            case sf::Keyboard::Left:  dx = -1; break;
            case sf::Keyboard::Right: dx = +1; break;
            case sf::Keyboard::Up:    dy = -1; break;
            case sf::Keyboard::Down:  dy = +1; break;
            case sf::Keyboard::Space:
            case sf::Keyboard::Return: placer = true; break;
            default: break;
        }

        // Déplacer le curseur
        if (dx != 0 || dy != 0) {
            int nouvCol  = blocCurseur.pos.col  + dx;
            int nouvLigne = blocCurseur.pos.ligne + dy;
            int nbL = (int)blocCurseur.lettres.size();

            // Vérifier les limites
            if (nouvCol >= 0 && nouvCol + nbL - 1 < COLS_GRILLE &&
                nouvLigne >= 0 && nouvLigne < LIGNES_GRILLE) {
                blocCurseur.pos = {nouvCol, nouvLigne};
            }
        }

        // Placer le bloc
        if (placer) {
            tenterPlacement();
        }
    }

    /** Tente de placer le bloc courant sur la grille */
    void tenterPlacement() {
        if (!grille.peutPlacer(blocCurseur, blocCurseur.pos.col, blocCurseur.pos.ligne)) {
            // Case occupée — gentle rejection
            declencherFlashRouge();
            afficherMessage("Case occupee !", 1.5f);
            return; // no life lost
        }

        // Vérification : le bloc doit être placé à sa position cible
        if (blocCurseur.pos.col == blocCurseur.cible.col && blocCurseur.pos.ligne == blocCurseur.cible.ligne) {
            // BON PLACEMENT
            grille.placerBloc(blocCurseur, false);
            int scoreGagne = (int)blocCurseur.lettres.size() * 50;
            scoreTotal += scoreGagne * niveauActuel;

            // Vérifier si des mots sont complètement formés
            auto resultats = grille.chercherMots(gestMots, motsNiveau);
            bool nouveauMot = false;
            for (const auto& r : resultats) {
                if (motsTrouves.find(r.mot) == motsTrouves.end()) {
                    motsTrouves.insert(r.mot);
                    scoreTotal += r.scoreGagne * niveauActuel;
                    // Mark word cells as validated (green) — don't erase them
                    for (int i = 0; i < r.longueur; i++) {
                        int wco = r.debut.col  + (r.horizontal ? i : 0);
                        int wli = r.debut.ligne + (r.horizontal ? 0 : i);
                        if (grille.estDansLimites(wco, wli)) {
                            grille.estFixe[wli][wco] = 2; // 2 = validated word (green)
                        }
                    }
                    afficherMessage("\xe2\x9c\x93 " + r.mot + " ! +" + std::to_string(r.scoreGagne), 2.0f);
                    nouveauMot = true;
                }
            }

            if (!nouveauMot) {
                afficherMessage("Bien place ! +" + std::to_string(scoreGagne), 1.5f);
            }

            // Passer au bloc suivant
            indexBlocActuel++;
            chargerProchainBloc();

            // Vérifier si le niveau est terminé
            if ((int)motsTrouves.size() >= (int)motsNiveau.size() || indexBlocActuel >= (int)blocsAJouer.size()) {
                verifierNiveauTermine();
            }

        } else {
            // MAUVAIS PLACEMENT — gentle rejection, no life lost
            declencherFlashRouge();
            afficherMessage("Pas ici ! Cherchez le bon emplacement.", 1.5f);
            // The block stays active, player can retry
        }
    }

    /** Déclenche l'animation de flash rouge */
    void declencherFlashRouge() {
        flashActif = true;
        tempsFlashRouge = 0.5f;
    }

    /** Retire une vie et vérifie game over */
    void perdreVie() {
        vies--;
        if (vies <= 0) {
            vies = 0;
            etat = Etat::GAME_OVER;
        }
    }

    /** Affiche un message temporaire */
    void afficherMessage(const std::string& msg, float duree) {
        messageTemp   = msg;
        tempsMessage  = duree;
    }

    // ─── MISE À JOUR ──────────────────────────────────────────────────
    void mettreAJour(float dt) {
        // Flash rouge
        if (tempsFlashRouge > 0) {
            tempsFlashRouge -= dt;
            if (tempsFlashRouge <= 0) {
                tempsFlashRouge = 0;
                flashActif = false;
            }
        }

        // Animations de mots trouvés
        for (auto& anim : animMots) {
            anim.temps -= dt;
            anim.alpha = std::max(0.f, anim.alpha - dt * 100.f);
        }
        // Supprimer les animations terminées et effacer les mots
        animMots.erase(
            std::remove_if(animMots.begin(), animMots.end(),
                [&](const AnimMot& a) {
                    if (a.temps <= 0) {
                        grille.effacerMot(a.res);
                        return true;
                    }
                    return false;
                }),
            animMots.end()
        );

        // Message temporaire
        if (tempsMessage > 0) tempsMessage -= dt;
    }

    // ─── RENDU PRINCIPAL ─────────────────────────────────────────────
    void dessiner() {
        fenetre.clear(COULEUR_FOND);

        switch (etat) {
            case Etat::MENU:           dessinerMenu();           break;
            case Etat::JEU:            dessinerJeu();            break;
            case Etat::NIVEAU_TERMINE: dessinerNiveauTermine();  break;
            case Etat::GAME_OVER:      dessinerGameOver();       break;
            case Etat::VICTOIRE:       dessinerVictoire();       break;
        }

        fenetre.display();
    }

    // ─── MENU PRINCIPAL ───────────────────────────────────────────────
    void dessinerMenu() {
        // Fond animé : pixels qui dérivent selon le temps
        float t = horloge.getElapsedTime().asSeconds();
        for (int i = 0; i < 50; i++) {
            float px = std::fmod(i * 211.3f + t * 18.f, (float)LARGEUR_FENETRE);
            float py = std::fmod(i * 97.7f  + t * 9.f,  (float)HAUTEUR_FENETRE);
            float alpha = 30.f + 25.f * std::sin(t * 1.5f + i * 0.7f);
            sf::RectangleShape dot({3.f, 3.f});
            dot.setPosition(px, py);
            dot.setFillColor(sf::Color(40, 80, 160, (unsigned char)alpha));
            fenetre.draw(dot);
        }

        // Titre avec ombre portée
        ui.texteOmbre(fenetre, "PIXEL-MOTS", LARGEUR_FENETRE / 2.f, 110, 64,
                      COULEUR_ACCENT, true);
        // Sous-titre
        ui.texte(fenetre, "Puzzle de mots Tech & Multimedia",
                 LARGEUR_FENETRE / 2.f, 190, 20, COULEUR_TEXTE, true);

        // Séparateur lumineux
        ui.rectangle(fenetre, 150, 232, LARGEUR_FENETRE - 300, 1, sf::Color(60, 80, 140));
        ui.rectangle(fenetre, 150, 233, LARGEUR_FENETRE - 300, 1, COULEUR_ACCENT);

        // Instructions
        float y = 265;
        ui.texte(fenetre, "COMMENT JOUER :", LARGEUR_FENETRE / 2.f, y, 18, COULEUR_OR, true);
        y += 32;
        std::vector<std::string> instructions = {
            "[ Fleches ]  Deplacer le bloc",
            "[ ESPACE / ENTREE ]  Placer le bloc sur la grille",
            "[ But ]  Former des mots horizontalement ou verticalement",
            "[ Aide ]  Des cibles en pointilles montrent ou placer",
            "[ Astuce ]  Le bloc devient VERT au bon emplacement !",
            "[ Vies ]  5 vies - les cases occupees en coutent une",
        };
        for (const auto& inst : instructions) {
            ui.texte(fenetre, inst, LARGEUR_FENETRE / 2.f, y, 15, sf::Color(180, 195, 230), true);
            y += 26;
        }

        // Bouton avec double bordure (effet premium)
        float bx = LARGEUR_FENETRE / 2.f - 140, by = y + 32;
        ui.rectangle(fenetre, bx - 2, by - 2, 284, 54, sf::Color(200, 50, 100));
        ui.rectangle(fenetre, bx, by, 280, 50, COULEUR_ACCENT);
        ui.texte(fenetre, "APPUYEZ SUR ENTREE", LARGEUR_FENETRE / 2.f, by + 13, 18,
                 sf::Color(10, 12, 20), true);
    }

    // ─── SCÈNE DE JEU ─────────────────────────────────────────────────
    void dessinerJeu() {
        dessinerEntete();
        dessinerGrille();
        dessinerBlocCurseur();
        dessinerAnimationsMots();
        dessinerPanneauLateral();
        dessinerFlashRouge();
        dessinerMessageTemp();
    }

    /** Barre d'en-tête : titre, score, vies, niveau */
    void dessinerEntete() {
        // Fond dégradé simulé (2 rectangles)
        ui.rectangle(fenetre, 0, 0, LARGEUR_FENETRE, 72, sf::Color(12, 15, 35));
        ui.rectangle(fenetre, 0, 0, LARGEUR_FENETRE, 36, sf::Color(18, 22, 48));

        // Titre avec contour cyan
        ui.texte(fenetre, "PIXEL-MOTS", 18, 8, 28, COULEUR_ACCENT);
        ui.texte(fenetre, niveaux[niveauActuel-1].titre, 195, 12, 15, COULEUR_TEXTE);

        // Score
        ui.texte(fenetre, "SCORE", 195, 38, 11, sf::Color(120, 130, 160));
        ui.texte(fenetre, std::to_string(scoreTotal), 240, 35, 17, COULEUR_OR);

        // Vies : losanges graphiques (pas de caractère Unicode)
        float hx = LARGEUR_FENETRE - 190.f;
        ui.texte(fenetre, "VIES", hx, 12, 11, sf::Color(120, 130, 160));
        for (int i = 0; i < 5; i++) {
            sf::Color fill = (i < vies) ? sf::Color(220, 40, 70) : sf::Color(45, 45, 65);
            sf::Color outline = (i < vies) ? sf::Color(255, 80, 100) : sf::Color(70, 70, 90);
            sf::RectangleShape losange({14.f, 14.f});
            losange.setOrigin(7.f, 7.f);
            losange.setRotation(45.f);
            losange.setPosition(hx + 42.f + i * 30.f, 38.f);
            losange.setFillColor(fill);
            losange.setOutlineColor(outline);
            losange.setOutlineThickness(1.5f);
            fenetre.draw(losange);
        }

        // Ligne séparatrice double
        ui.rectangle(fenetre, 0, 69, LARGEUR_FENETRE, 1, sf::Color(40, 50, 90));
        ui.rectangle(fenetre, 0, 70, LARGEUR_FENETRE, 2, COULEUR_ACCENT);
    }

    /** Dessine la grille de jeu */
    void dessinerGrille() {
        // Fond général de la grille
        ui.rectangle(fenetre,
            OFFSET_X_GRILLE, OFFSET_Y_GRILLE,
            COLS_GRILLE * TAILLE_CELLULE, LIGNES_GRILLE * TAILLE_CELLULE,
            sf::Color(10, 13, 25));

        // Draw ghost targets for remaining blocks
        dessinerCibles();

        for (int li = 0; li < LIGNES_GRILLE; li++) {
            for (int co = 0; co < COLS_GRILLE; co++) {
                float x = OFFSET_X_GRILLE + co * TAILLE_CELLULE;
                float y = OFFSET_Y_GRILLE + li * TAILLE_CELLULE;
                int fixeVal = grille.estFixe[li][co]; // 0=normal, 1=preplaced, 2=validated
                bool occupe = !grille.cellules[li][co].empty();

                // 1. Ombre décalée (bas-droite)
                if (occupe) {
                    sf::RectangleShape ombre({(float)TAILLE_CELLULE - 3, (float)TAILLE_CELLULE - 3});
                    ombre.setPosition(x + 4, y + 4);
                    ombre.setFillColor(sf::Color(0, 0, 0, 60));
                    fenetre.draw(ombre);
                }

                // 2. Fond principal de la cellule
                sf::Color fondCellule;
                if (occupe) {
                    if (fixeVal == 2) fondCellule = sf::Color(15, 60, 35);      // validated green
                    else if (fixeVal == 1) fondCellule = sf::Color(30, 38, 75); // preplaced
                    else fondCellule = sf::Color(18, 60, 105);                  // player-placed
                } else {
                    fondCellule = sf::Color(16, 20, 36);
                }
                ui.rectangle(fenetre, x + 1, y + 1, TAILLE_CELLULE - 2, TAILLE_CELLULE - 2, fondCellule);

                // 3. Reflet haut-gauche (cellules occupées seulement)
                if (occupe) {
                    unsigned char refletH = (fixeVal >= 1) ? 18 : 30;
                    unsigned char refletV = (fixeVal >= 1) ? 12 : 20;
                    ui.rectangle(fenetre, x + 1, y + 1, TAILLE_CELLULE - 2, 2,
                                 sf::Color(255, 255, 255, refletH));
                    ui.rectangle(fenetre, x + 1, y + 1, 2, TAILLE_CELLULE - 2,
                                 sf::Color(255, 255, 255, refletV));
                }

                // 4. Contour de cellule
                sf::Color contourCol;
                if (occupe) {
                    if (fixeVal == 2) contourCol = sf::Color(40, 180, 90);      // validated green
                    else if (fixeVal == 1) contourCol = sf::Color(60, 80, 140); // preplaced
                    else contourCol = sf::Color(0, 140, 210);                   // player-placed
                } else {
                    contourCol = sf::Color(25, 32, 55);
                }
                ui.contour(fenetre, x, y, TAILLE_CELLULE, TAILLE_CELLULE, contourCol, 1);

                // 5. Lettre centrée
                if (occupe) {
                    sf::Color couleurLettre;
                    if (fixeVal == 2) couleurLettre = sf::Color(80, 240, 140);      // validated green
                    else if (fixeVal == 1) couleurLettre = sf::Color(140, 160, 220); // preplaced
                    else couleurLettre = sf::Color(100, 210, 255);                  // player-placed
                    ui.texteCell(fenetre, grille.cellules[li][co],
                                 x + 2, y + 2, TAILLE_CELLULE - 4, TAILLE_CELLULE - 4,
                                 26, couleurLettre);
                }
            }
        }

        // Contour global accent
        ui.contour(fenetre,
            OFFSET_X_GRILLE, OFFSET_Y_GRILLE,
            COLS_GRILLE * TAILLE_CELLULE, LIGNES_GRILLE * TAILLE_CELLULE,
            COULEUR_ACCENT, 2);
    }

    /** Draw ghost target outlines for blocks not yet placed */
    void dessinerCibles() {
        float elapsed = horloge.getElapsedTime().asSeconds();
        float pulse = 0.4f + 0.6f * std::abs(std::sin(elapsed * 2.f));

        for (int i = indexBlocActuel; i < (int)blocsAJouer.size(); i++) {
            const Bloc& b = blocsAJouer[i];
            int nbL = (int)b.lettres.size();
            bool isCurrent = (i == indexBlocActuel);

            for (int j = 0; j < nbL; j++) {
                int col = b.cible.col + j;
                int row = b.cible.ligne;
                if (!grille.estDansLimites(col, row)) continue;
                if (!grille.cellules[row][col].empty()) continue;

                float x = OFFSET_X_GRILLE + col * TAILLE_CELLULE;
                float y = OFFSET_Y_GRILLE + row * TAILLE_CELLULE;

                // Ghost fill
                unsigned char alpha = isCurrent ? (unsigned char)(40 * pulse) : 15;
                ui.rectangle(fenetre, x + 2, y + 2, TAILLE_CELLULE - 4, TAILLE_CELLULE - 4,
                             sf::Color(0, 200, 255, alpha));

                // Dashed border effect (draw corner marks)
                sf::Color borderCol = isCurrent
                    ? sf::Color(0, 200, 255, (unsigned char)(100 * pulse))
                    : sf::Color(0, 200, 255, 30);
                float dashLen = 10.f;
                // top-left corner
                ui.rectangle(fenetre, x, y, dashLen, 1.5f, borderCol);
                ui.rectangle(fenetre, x, y, 1.5f, dashLen, borderCol);
                // top-right corner
                ui.rectangle(fenetre, x + TAILLE_CELLULE - dashLen, y, dashLen, 1.5f, borderCol);
                ui.rectangle(fenetre, x + TAILLE_CELLULE - 1.5f, y, 1.5f, dashLen, borderCol);
                // bottom-left corner
                ui.rectangle(fenetre, x, y + TAILLE_CELLULE - 1.5f, dashLen, 1.5f, borderCol);
                ui.rectangle(fenetre, x, y + TAILLE_CELLULE - dashLen, 1.5f, dashLen, borderCol);
                // bottom-right corner
                ui.rectangle(fenetre, x + TAILLE_CELLULE - dashLen, y + TAILLE_CELLULE - 1.5f, dashLen, 1.5f, borderCol);
                ui.rectangle(fenetre, x + TAILLE_CELLULE - 1.5f, y + TAILLE_CELLULE - dashLen, 1.5f, dashLen, borderCol);

                // Ghost letter (faint)
                if (isCurrent) {
                    std::string lettre(1, b.lettres[j]);
                    ui.texteCell(fenetre, lettre,
                                 x + 2, y + 2, TAILLE_CELLULE - 4, TAILLE_CELLULE - 4,
                                 26, sf::Color(0, 200, 255, (unsigned char)(50 * pulse)));
                }
            }
        }
    }

    /** Dessine le bloc curseur avec effet de lueur — green when at correct position */
    void dessinerBlocCurseur() {
        if (indexBlocActuel >= (int)blocsAJouer.size()) return;

        float elapsed = horloge.getElapsedTime().asSeconds();
        float pulse = 0.5f + 0.5f * std::sin(elapsed * 5.f);
        int nbL = (int)blocCurseur.lettres.size();

        // Check if block is at the correct position
        bool atCorrect = (blocCurseur.pos.col == blocCurseur.cible.col &&
                          blocCurseur.pos.ligne == blocCurseur.cible.ligne);

        for (int i = 0; i < nbL; i++) {
            float x = OFFSET_X_GRILLE + (blocCurseur.pos.col + i) * TAILLE_CELLULE;
            float y = OFFSET_Y_GRILLE + blocCurseur.pos.ligne * TAILLE_CELLULE;

            // Anneaux de lueur — green if correct, cyan otherwise
            for (int ring = 4; ring >= 1; ring--) {
                float off = ring * 2.5f;
                unsigned char a = (unsigned char)(pulse * 18 * ring);
                sf::RectangleShape glow({TAILLE_CELLULE + off * 2, TAILLE_CELLULE + off * 2});
                glow.setPosition(x - off, y - off);
                if (atCorrect)
                    glow.setFillColor(sf::Color(50, 230, 120, (unsigned char)(a * 1.5f)));
                else
                    glow.setFillColor(sf::Color(0, 200, 255, a));
                fenetre.draw(glow);
            }

            // Fond principal pulse — green tint if correct
            sf::Color fondCurseur;
            if (atCorrect) {
                fondCurseur = sf::Color(
                    (int)(10  + pulse * 20),
                    (int)(160 + pulse * 70),
                    (int)(60  + pulse * 40)
                );
            } else {
                fondCurseur = sf::Color(
                    (int)(10  + pulse * 30),
                    (int)(130 + pulse * 70),
                    (int)(200 + pulse * 55)
                );
            }
            ui.rectangle(fenetre, x + 1, y + 1, TAILLE_CELLULE - 2, TAILLE_CELLULE - 2, fondCurseur);

            // Reflet haut
            ui.rectangle(fenetre, x + 2, y + 2, TAILLE_CELLULE - 4, 3,
                         sf::Color(255, 255, 255, 50));

            // Contour vif — green if correct
            sf::Color contourBloc = atCorrect ? COULEUR_VERT : COULEUR_BLOC_ACTIF;
            ui.contour(fenetre, x, y, TAILLE_CELLULE, TAILLE_CELLULE, contourBloc, 2.f);

            // Lettre blanche avec contour
            std::string lettre(1, blocCurseur.lettres[i]);
            ui.texteCell(fenetre, lettre,
                         x + 1, y + 1, TAILLE_CELLULE - 2, TAILLE_CELLULE - 2,
                         27, sf::Color(255, 255, 255));
        }
    }

    /** Dessine les animations de surbrillance des mots trouvés */
    void dessinerAnimationsMots() {
        for (const auto& anim : animMots) {
            sf::Color c = COULEUR_SURBRILLANCE;
            c.a = (unsigned char)anim.alpha;

            int lon = anim.res.longueur;
            for (int i = 0; i < lon; i++) {
                int co = anim.res.debut.col  + (anim.res.horizontal ? i : 0);
                int li = anim.res.debut.ligne + (anim.res.horizontal ? 0 : i);
                float x = OFFSET_X_GRILLE + co * TAILLE_CELLULE;
                float y = OFFSET_Y_GRILLE + li * TAILLE_CELLULE;
                ui.rectangle(fenetre, x + 1, y + 1, TAILLE_CELLULE - 2, TAILLE_CELLULE - 2, c);
            }
        }
    }

    /** Panneau latéral : définitions, bloc actuel, prochain bloc */
    void dessinerPanneauLateral() {
        float px = PANEL_X;
        float py = OFFSET_Y_GRILLE;
        float pw = PANEL_LARGEUR;

        // Fond du panneau
        ui.rectangle(fenetre, px - 5, py, pw + 5, LIGNES_GRILLE * TAILLE_CELLULE, COULEUR_PANEL);
        ui.contour(fenetre, px - 5, py, pw + 5, LIGNES_GRILLE * TAILLE_CELLULE, COULEUR_ACCENT, 1.5f);

        float y = py + 10;

        // ── Définitions des mots à trouver ──
        ui.texte(fenetre, "DEFINITIONS", px + 5, y, 14, COULEUR_ACCENT);
        ui.rectangle(fenetre, px, y + 20, pw - 5, 1.5f, sf::Color(50, 60, 100));
        y += 28;

        for (const auto& entree : motsNiveau) {
            bool trouve = motsTrouves.count(entree.mot) > 0;

            // Indicateur trouvé / non trouvé
            sf::Color couleurDef = trouve ? COULEUR_VERT : COULEUR_TEXTE;
            std::string prefixe = trouve ? "[v] " : "[?] ";

            // Show partial word progress: placed letters + blanks
            std::string wordProgress = prefixe;
            if (trouve) {
                wordProgress += entree.mot;
            } else {
                // Build progress from grid state
                // Find which letters of this word are on the grid
                for (size_t ci = 0; ci < entree.mot.size(); ci++) {
                    // Search grid for this letter position
                    bool foundOnGrid = false;
                    for (int li = 0; li < LIGNES_GRILLE && !foundOnGrid; li++) {
                        for (int co = 0; co < COLS_GRILLE && !foundOnGrid; co++) {
                            if (!grille.cellules[li][co].empty() && grille.estFixe[li][co]) {
                                // Check all level configs to find this word's position
                                // Simple approach: just show letter count
                            }
                        }
                    }
                    // For simplicity, show placed (fixed) letters and _ for missing
                    wordProgress += "_ ";
                }
                // Override with simpler approach: show (N lettres)
                wordProgress = prefixe + "(" + std::to_string(entree.mot.size()) + " lettres)";
            }
            ui.texte(fenetre, wordProgress, px + 5, y, 13, couleurDef);
            y += 18;

            // Définition découpée
            auto lignesDef = ui.decouperTexte(entree.definition, 22);
            for (const auto& ld : lignesDef) {
                if (y > py + LIGNES_GRILLE * TAILLE_CELLULE - 10) break;
                ui.texte(fenetre, ld, px + 8, y, 12, sf::Color(160, 170, 200));
                y += 16;
            }
            y += 6;
        }

        // ── Bloc actuel ──
        y = py + LIGNES_GRILLE * TAILLE_CELLULE + 10;
        // (Affichage en-dessous si place suffisante)
        if (y + 100 < HAUTEUR_FENETRE) {
            ui.texte(fenetre, "BLOC ACTUEL :", px + 5, y, 14, COULEUR_ACCENT);
            y += 22;

            if (indexBlocActuel < (int)blocsAJouer.size()) {
                const std::string& lett = blocCurseur.lettres;
                for (int i = 0; i < (int)lett.size(); i++) {
                    float bx = px + 10 + i * 44;
                    float by = y;
                    ui.rectangle(fenetre, bx, by, 40, 40, sf::Color(20, 80, 130));
                    ui.contour(fenetre, bx, by, 40, 40, COULEUR_BLOC_ACTIF, 2);
                    ui.texteCell(fenetre, std::string(1, lett[i]), bx, by, 40, 40, 22, sf::Color(255, 255, 255));
                }
                y += 50;

                // Prochain bloc
                int suivant = indexBlocActuel + 1;
                if (suivant < (int)blocsAJouer.size()) {
                    ui.texte(fenetre, "SUIVANT :", px + 5, y, 13, sf::Color(120, 130, 160));
                    y += 20;
                    const std::string& ls = blocsAJouer[suivant].lettres;
                    for (int i = 0; i < (int)ls.size(); i++) {
                        float bx = px + 10 + i * 34;
                        float by = y;
                        ui.rectangle(fenetre, bx, by, 30, 30, sf::Color(20, 40, 70));
                        ui.contour(fenetre, bx, by, 30, 30, sf::Color(60, 80, 120), 1.5f);
                        ui.texteCell(fenetre, std::string(1, ls[i]), bx, by, 30, 30, 18, sf::Color(140, 150, 180));
                    }
                }
            } else {
                ui.texte(fenetre, "Aucun bloc restant", px + 5, y, 13, COULEUR_TEXTE);
            }
        }

        // ── Blocs restants ──
        {
            int restants = (int)blocsAJouer.size() - indexBlocActuel;
            std::string nbRest = "Blocs restants: " + std::to_string(std::max(0, restants));
            ui.texte(fenetre, nbRest, px + 5, HAUTEUR_FENETRE - 55, 13, sf::Color(120, 140, 160));
        }

        // ── Contrôles ──
        ui.texte(fenetre, "Fleches: deplacer", px + 5, HAUTEUR_FENETRE - 38, 12, sf::Color(90, 100, 130));
        ui.texte(fenetre, "ESPACE/ENTREE: placer", px + 5, HAUTEUR_FENETRE - 22, 12, sf::Color(90, 100, 130));
    }

    /** Flash rouge en cas d'erreur */
    void dessinerFlashRouge() {
        if (!flashActif || tempsFlashRouge <= 0) return;
        float alpha = (tempsFlashRouge / 0.5f) * 100.f;
        sf::RectangleShape overlay({(float)LARGEUR_FENETRE, (float)HAUTEUR_FENETRE});
        overlay.setFillColor(sf::Color(255, 0, 0, (unsigned char)alpha));
        fenetre.draw(overlay);
    }

    /** Message temporaire centré */
    void dessinerMessageTemp() {
        if (tempsMessage <= 0) return;
        float alpha = std::min(1.f, tempsMessage) * 230.f;
        sf::Color c = COULEUR_OR;
        c.a = (unsigned char)alpha;
        ui.texte(fenetre, messageTemp,
                 OFFSET_X_GRILLE + COLS_GRILLE * TAILLE_CELLULE / 2.f,
                 HAUTEUR_FENETRE - 45, 18, c, true);
    }

    // ─── ÉCRAN NIVEAU TERMINÉ ─────────────────────────────────────────
    void dessinerNiveauTermine() {
        dessinerFondSombre();
        ui.texte(fenetre, "NIVEAU TERMINE !", LARGEUR_FENETRE / 2.f, 180, 50, COULEUR_VERT, true);
        ui.texte(fenetre, "Bravo ! Tous les mots trouves.", LARGEUR_FENETRE / 2.f, 255, 22, COULEUR_TEXTE, true);
        ui.texte(fenetre, "Score: " + std::to_string(scoreTotal), LARGEUR_FENETRE / 2.f, 305, 28, COULEUR_OR, true);
        ui.texte(fenetre, "+1 vie bonus !", LARGEUR_FENETRE / 2.f, 345, 20, COULEUR_ACCENT, true);
        ui.texte(fenetre, "APPUYEZ SUR ENTREE pour le niveau suivant",
                 LARGEUR_FENETRE / 2.f, 430, 18, COULEUR_TEXTE, true);
    }

    // ─── ÉCRAN GAME OVER ─────────────────────────────────────────────
    void dessinerGameOver() {
        dessinerFondSombre();
        ui.texte(fenetre, "GAME OVER", LARGEUR_FENETRE / 2.f, 180, 60, COULEUR_ROUGE, true);
        ui.texte(fenetre, "Vous n'avez plus de vies.", LARGEUR_FENETRE / 2.f, 265, 22, COULEUR_TEXTE, true);
        ui.texte(fenetre, "Score final: " + std::to_string(scoreTotal), LARGEUR_FENETRE / 2.f, 310, 28, COULEUR_OR, true);
        ui.texte(fenetre, "ENTREE pour retourner au menu", LARGEUR_FENETRE / 2.f, 400, 18, COULEUR_TEXTE, true);
    }

    // ─── ÉCRAN VICTOIRE ───────────────────────────────────────────────
    void dessinerVictoire() {
        dessinerFondSombre();
        ui.texte(fenetre, "VICTOIRE !", LARGEUR_FENETRE / 2.f, 150, 65, COULEUR_OR, true);
        ui.texte(fenetre, "Vous avez termine tous les niveaux !", LARGEUR_FENETRE / 2.f, 240, 22, COULEUR_VERT, true);
        ui.texte(fenetre, "Score final: " + std::to_string(scoreTotal), LARGEUR_FENETRE / 2.f, 295, 32, COULEUR_OR, true);
        ui.texte(fenetre, "Vous etes un expert du vocabulaire Tech !", LARGEUR_FENETRE / 2.f, 360, 18, COULEUR_ACCENT, true);
        ui.texte(fenetre, "ENTREE pour rejouer", LARGEUR_FENETRE / 2.f, 450, 18, COULEUR_TEXTE, true);
    }

    /** Fond semi-transparent pour écrans overlay */
    void dessinerFondSombre() {
        sf::RectangleShape fond({(float)LARGEUR_FENETRE, (float)HAUTEUR_FENETRE});
        fond.setFillColor(sf::Color(5, 8, 20, 220));
        fenetre.draw(fond);
    }
};


// ═══════════════════════════════════════════════════════════════════
//  POINT D'ENTRÉE
// ═══════════════════════════════════════════════════════════════════
int main() {
    // Afficher des infos de démarrage dans la console
    std::cout << "╔═══════════════════════════════════════╗\n";
    std::cout << "║         PIXEL-MOTS démarrage          ║\n";
    std::cout << "║  Puzzle de mots Tech/Multimédia       ║\n";
    std::cout << "║  Développé en C++ avec SFML           ║\n";
    std::cout << "╚═══════════════════════════════════════╝\n";
    std::cout << "Contrôles : Flèches = déplacer | Espace/Entrée = placer\n\n";

    Jeu jeu;
    jeu.lancer();

    std::cout << "Au revoir !\n";
    return 0;
}
