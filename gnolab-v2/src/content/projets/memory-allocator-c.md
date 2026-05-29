---
titre: "Allocateur mémoire en C (first-fit / best-fit)"
resume: "Réimplémentation de malloc sur un pool mémoire fixe, avec coalescence des blocs libres et benchmark face à la glibc."
domaine: "Systèmes"
type: "repo"
track: "A"
niveau: "Intermédiaire-Avancé"
statut: "terminé"
phase: 1
dateDebut: 2026-05-01
dateFin: 2026-05-11
technos: ["C", "Make", "valgrind", "ASAN"]
methodes: []
livrables:
  - { type: "github", url: "https://github.com/laije-belthassar/memory-allocator-c", label: "Code source" }
  - { type: "demo", url: "#", label: "Benchmark ASCII" }
featured: true
ordre: 1
---

## Contexte

La `glibc` gère la mémoire pour nous — mais **comment ?** J'ai voulu le comprendre
en réimplémentant deux allocateurs (`first-fit` et `best-fit`) sur un pool fixe.

## Architecture

Chaque bloc porte un en-tête (`size`, `is_free`, `next`) suivi des données utilisateur.
La **coalescence** fusionne les blocs libres adjacents lors du `free` pour limiter la
fragmentation externe.

```c
void* my_malloc(size_t size) {
    Block* block = find_free_block(size);  // first-fit
    if (!block) return NULL;
    if (block->size > size + sizeof(Block)) split_block(block, size);
    block->is_free = 0;
    return block + 1;
}
```

## Ce que j'ai appris

- Le rôle de `sbrk()` et `mmap()` derrière `malloc` en conditions réelles.
- Pourquoi la coalescence est indispensable (mesurée : -38 % de fragmentation).
- Comment benchmarker proprement en C avec `clock()`.
