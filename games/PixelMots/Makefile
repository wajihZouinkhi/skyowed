# ═══════════════════════════════════════════════════════════
#  Makefile — PIXEL-MOTS (C++/SFML)
#  Usage : make        → compile
#          make run    → compile + exécuter
#          make clean  → nettoyer
# ═══════════════════════════════════════════════════════════

CXX      = g++
CXXFLAGS = -std=c++17 -Wall -O2
SFML     = -lsfml-graphics -lsfml-window -lsfml-system
TARGET   = PixelMots
SRC      = main.cpp

# Compilation principale
$(TARGET): $(SRC)
	$(CXX) $(CXXFLAGS) $(SRC) $(SFML) -o $(TARGET)
	@echo "✓ Compilation réussie → ./$(TARGET)"

# Compiler et lancer
run: $(TARGET)
	./$(TARGET)

# Nettoyer
clean:
	rm -f $(TARGET)
	@echo "✓ Nettoyé"

.PHONY: run clean
