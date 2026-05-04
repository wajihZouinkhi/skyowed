cmake_minimum_required(VERSION 3.10)
project(PixelMots)

set(CMAKE_CXX_STANDARD 17)
set(CMAKE_CXX_STANDARD_REQUIRED ON)

# Chercher SFML
find_package(SFML 2.5 COMPONENTS graphics window system REQUIRED)

add_executable(PixelMots main.cpp)

target_link_libraries(PixelMots sfml-graphics sfml-window sfml-system)

# Installation optionnelle
install(TARGETS PixelMots DESTINATION bin)
