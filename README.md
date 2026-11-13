# 🪖 Tank Turn Tactics

Juego de estrategia por turnos de tanques, en 2D vista desde arriba. De 2 a **14 jugadores** en el mismo dispositivo (por turnos). Gana el **último tanque en pie**.

Hecho con HTML, CSS y JavaScript puro. Sin frameworks, sin servidor, sin base de datos.

## Descargar

Con Git:

```bash
git clone https://github.com/TU_USUARIO/tank-turn-tactics.git
cd tank-turn-tactics
```

O desde GitHub: **Code → Download ZIP** y descomprime la carpeta.

## Ejecutar

Abre `index.html` con doble clic en cualquier navegador moderno (Chrome, Firefox, Edge, Safari). No hay que instalar nada.

Para publicarlo online: en tu repositorio ve a **Settings → Pages**, elige la rama `main` y la carpeta `/ (root)`.

## Cómo jugar

1. En el menú elige el número de jugadores (2 a 14) y pulsa **Jugar**.
2. Cada tanque tiene **100 de vida**. El banner superior indica de quién es el turno (color + nombre) y las acciones restantes.
3. En tu turno tienes **2 acciones**, que puedes gastar en mover o disparar:
   - **Mover:** clic en una casilla vecina resaltada en blanco, o teclas **flechas / WASD**.
   - **Disparar:** clic en un enemigo marcado en rojo. Alcance de 4 casillas, sin muros en medio. Cada impacto quita **25 de vida**.
4. El turno pasa solo al agotar las acciones, o pulsa **Terminar turno** (o `Enter`).
5. Un tanque sin vida queda eliminado. Gana el último que sobreviva.

Botones: **Reiniciar partida** (misma cantidad de jugadores) y **Menú**.

## Estructura

```
index.html   Estructura y menús
style.css    Estilos
script.js    Lógica del juego y dibujo en canvas
README.md    Este archivo
```

## Personalizar

Al inicio de `script.js` puedes cambiar `DAMAGE`, `RANGE`, `AP_PER_TURN`, `MAX_HP` y el mapa (`MAP`, donde `#` es un muro y `.` es terreno libre; debe tener 18×18 casillas).

## Licencia

Libre para usar y modificar. Añade la licencia que prefieras (por ejemplo MIT).
