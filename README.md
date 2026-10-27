# Domótica de Avi

Inventario interactivo de la domótica de casa: plano pinchable, ficha de cada dispositivo (qué hace, cómo se le habla a Alexa, en qué escenas sale), rutinas de Alexa y automatizaciones de Smart Life por separado, y una lista de pendientes por confirmar.

```
docs/          La web (HTML + CSS + JS, sin instalar nada). GitHub Pages la publica desde aquí.
apps-script/   Code.gs: el "puente" entre la web y la Hoja de Google.
datos/         Datos iniciales (NO se suben a GitHub: están en .gitignore).
  Inventario_Domotica_Avi.xlsx   -> se sube a Google Drive una sola vez.
  inventario_inicial.json        -> solo para probar la web en local.
  generar_datos.py               -> genera los dos archivos anteriores.
```

**Dónde están los datos:** en una Hoja de Google de la cuenta de Avi. La web lee y escribe en ella. Si un día la web falla, la hoja se sigue pudiendo abrir y editar con la app de Hojas de cálculo.

---

## Puesta en marcha (una sola vez)

### 1. Crear la Hoja de Google (con la cuenta de Avi)

1. Entra en [drive.google.com](https://drive.google.com) con la cuenta de Avi.
2. Sube `datos/Inventario_Domotica_Avi.xlsx`.
3. Ábrelo y ve a **Archivo → Guardar como Hojas de cálculo de Google**. Después ya puedes borrar el `.xlsx` de Drive.
4. Pulsa **Compartir** y añade tu cuenta como **Editor**.

Las pestañas **Dispositivos**, **Escenas** y **Estancias** son la base de datos. No cambies los nombres de las pestañas ni la primera fila (los títulos de las columnas).

### 2. Conectar el puente (Apps Script)

1. En la Hoja: **Extensiones → Apps Script**.
2. Borra lo que haya, pega todo el contenido de `apps-script/Code.gs` y guarda (icono del disquete).
3. **PIN**: ⚙️ **Configuración del proyecto → Propiedades de la secuencia de comandos → Añadir propiedad**. Nombre `PIN`, valor el que queráis (mejor 6 cifras o más). Se puede cambiar cuando se quiera, sin volver a implementar.
4. Pulsa **Implementar → Nueva implementación**:
   - Tipo: **Aplicación web**.
   - Ejecutar como: **Yo** (la cuenta de Avi).
   - Quién tiene acceso: **Cualquier usuario**. Sin el PIN no se ve nada, y si alguien falla el PIN 8 veces, queda bloqueado 15 minutos.
5. Autoriza el acceso. Saldrá *"Google no ha verificado esta aplicación"*: pulsa **Configuración avanzada → Ir a … (no seguro)**. Es normal, porque el script lo habéis creado vosotros.
6. Copia la **URL de la aplicación web** (termina en `/exec`).

### 3. Poner la URL en la web

Abre `docs/config.js` y pega la URL:

```js
window.CONFIG = {
  API_URL: 'https://script.google.com/macros/s/XXXXXXXX/exec',
};
```

### 4. Publicar la web (GitHub Pages, gratis)

1. En la cuenta de GitHub de Avi, el repositorio **`domotica-avi`** (público). Solo contiene el código: la carpeta `datos/` no se sube y los datos de la casa están en la Hoja de Google, detrás del PIN.
2. **Settings → Pages → Build and deployment**: *Deploy from a branch*, rama `main` y carpeta **`/docs`**.
3. La dirección queda `https://<usuario>.github.io/domotica-avi/`.

Cada vez que se cambia algo en `docs/` (también desde la web de GitHub, con el lápiz ✏️), se publica solo en un minuto o dos.

### 5. En el móvil de Avi (Android)

1. Abre la dirección en Chrome e introduce el PIN.
2. Menú **⋮ → Añadir a pantalla de inicio**. Quedará como una app más.

En el PC con Windows, igual: abre la dirección y guárdala en marcadores.

---

## Uso diario

- **Plano**: toca una habitación para ver sus aparatos y las escenas que la usan.
- **Dispositivos**: buscador y filtros por estancia, tipo y estado. Cada ficha muestra qué hace el aparato, cómo pedírselo a Alexa, sus canales (en los relés) y en qué escenas aparece.
- **Escenas**: Alexa y Smart Life por separado. Cuando paséis una rutina de Alexa a Smart Life, editadla y cambiad la **Plataforma**.
- **Pendientes**: dudas que quedan por confirmar. Abre cada una, corrige la ficha y pulsa **Marcar como resuelto**.
- **Añadir**: botón **+** en Dispositivos y en Escenas. Desde el plano también se puede añadir un dispositivo directamente en una habitación.

El botón de arriba a la derecha indica si está **Al día**; si pone **Sin conexión**, púlsalo para volver a cargar.

## Si cambias el código del puente

Si modificas `Code.gs`: **Implementar → Gestionar implementaciones → ✏️ → Versión: Nueva versión → Implementar**. Así se mantiene la misma URL.

## Probar en local

Desde la carpeta del proyecto:

```sh
python3 -m http.server 8765
```

Abre <http://127.0.0.1:8765/docs/>. Si `config.js` no tiene URL, la web funciona en **modo prueba** con `datos/inventario_inicial.json`, y los cambios solo se guardan en ese navegador.
