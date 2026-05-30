---
titre: "Comment j'ai réimplémenté malloc — et ce que ça m'a appris sur la mémoire"
resume: "Post-mortem de mon allocateur mémoire en C : first-fit, coalescence, fragmentation, et pourquoi la glibc fait ce qu'elle fait."
date: 2026-05-12
tags: ["C", "mémoire", "systèmes"]
tempsLecture: 8
projetLie: "memory-allocator-c"
publie: true
---

## Le problème

On utilise `malloc` des milliers de fois sans jamais se demander ce qui se passe
en dessous. J'ai voulu lever le capot.

## Le cœur : trouver un bloc libre

```c
Block* find_free_block(size_t size) {
    Block* current = head;
    while (current) {
        if (current->is_free && current->size >= size) return current;
        current = current->next;
    }
    return NULL;
}
```

C'est la stratégie **first-fit** : on prend le premier bloc assez grand. Simple,
rapide, mais elle fragmente.

> La fragmentation externe, c'est de la mémoire libre… mais inutilisable car
> découpée en miettes trop petites.

## La leçon

La coalescence — fusionner les blocs libres adjacents au moment du `free` — a réduit
ma fragmentation de **38 %** sur mon benchmark. C'est exactement pour ça que les vrais
allocateurs sont complexes.
