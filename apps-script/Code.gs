/**
 * Puente entre la web "Domótica de Avi" y la Hoja de Google del inventario.
 *
 * Se pega en: Hoja de Google > Extensiones > Apps Script.
 * El PIN NO va en el código: Configuración del proyecto (⚙️) > Propiedades de la secuencia de comandos >
 * añadir la propiedad PIN con el valor que queráis (mejor 6 cifras o más). Se puede cambiar cuando se quiera.
 */

const HOJAS = { estancias: 'Estancias', dispositivos: 'Dispositivos', escenas: 'Escenas' };
const EDITABLES = ['dispositivos', 'escenas'];
const MAX_FALLOS = 8;              // intentos de PIN fallidos antes de bloquear
const BLOQUEO_SEGUNDOS = 15 * 60;  // 15 minutos

function doGet(e) {
  return responder(() => {
    comprobarPin(e.parameter.pin);
    return leerTodo();
  });
}

function doPost(e) {
  return responder(() => {
    const peticion = JSON.parse(e.postData.contents);
    comprobarPin(peticion.pin);
    if (!EDITABLES.includes(peticion.hoja)) throw new Error('Hoja no editable: ' + peticion.hoja);

    const lock = LockService.getScriptLock();
    lock.waitLock(10000);
    try {
      if (peticion.accion === 'guardar') return { registro: guardar(peticion.hoja, peticion.registro) };
      if (peticion.accion === 'borrar') return { borrado: borrar(peticion.hoja, peticion.id) };
      throw new Error('Acción desconocida: ' + peticion.accion);
    } finally {
      lock.releaseLock();
    }
  });
}

function responder(fn) {
  let salida;
  try {
    salida = Object.assign({ ok: true }, fn());
  } catch (err) {
    salida = { ok: false, error: err.message };
  }
  return ContentService.createTextOutput(JSON.stringify(salida)).setMimeType(ContentService.MimeType.JSON);
}

function comprobarPin(pin) {
  const cache = CacheService.getScriptCache();
  const fallos = Number(cache.get('fallos') || 0);
  if (fallos >= MAX_FALLOS) throw new Error('bloqueado');
  const correcto = PropertiesService.getScriptProperties().getProperty('PIN');
  if (!correcto) throw new Error('Falta configurar el PIN en las propiedades del proyecto');
  if (String(pin || '') !== correcto) {
    cache.put('fallos', String(fallos + 1), BLOQUEO_SEGUNDOS);
    throw new Error('pin');
  }
}

function hoja(nombre) {
  const h = SpreadsheetApp.getActive().getSheetByName(HOJAS[nombre]);
  if (!h) throw new Error('No existe la pestaña ' + HOJAS[nombre]);
  return h;
}

function leerHoja(nombre) {
  const valores = hoja(nombre).getDataRange().getValues();
  const cabecera = valores.shift().map(String);
  const zona = Session.getScriptTimeZone();
  // Las fechas escritas a mano en la hoja se devuelven como AAAA-MM-DD, que es lo que entiende la web.
  const texto = (c, v) => v instanceof Date
    ? Utilities.formatDate(v, zona, c === 'actualizado' ? 'yyyy-MM-dd HH:mm' : 'yyyy-MM-dd')
    : String(v);
  return valores
    .filter(fila => fila[0] !== '')
    .map(fila => Object.fromEntries(cabecera.map((c, i) => [c, texto(c, fila[i])])));
}

function leerTodo() {
  return {
    estancias: leerHoja('estancias'),
    dispositivos: leerHoja('dispositivos'),
    escenas: leerHoja('escenas'),
    leido: new Date().toISOString(),
  };
}

function guardar(nombre, registro) {
  const h = hoja(nombre);
  const valores = h.getDataRange().getValues();
  const cabecera = valores[0];
  const colId = cabecera.indexOf('id');

  if (!registro.id) registro.id = idNuevo(registro.nombre, valores.slice(1).map(f => String(f[colId])));
  registro.actualizado = Utilities.formatDate(new Date(), Session.getScriptTimeZone(), 'yyyy-MM-dd HH:mm');

  const fila = cabecera.map(c => limpiar(registro[c]));
  const indice = valores.findIndex((f, i) => i > 0 && String(f[colId]) === registro.id);
  if (indice > 0) {
    h.getRange(indice + 1, 1, 1, fila.length).setValues([fila]);
  } else {
    h.appendRow(fila);
  }
  return registro;
}

function borrar(nombre, id) {
  const h = hoja(nombre);
  const valores = h.getDataRange().getValues();
  const colId = valores[0].indexOf('id');
  const indice = valores.findIndex((f, i) => i > 0 && String(f[colId]) === id);
  if (indice < 1) throw new Error('No encontrado: ' + id);
  h.deleteRow(indice + 1);
  return id;
}

// Evita que un texto que empiece por "=" se guarde como fórmula.
function limpiar(valor) {
  const texto = valor == null ? '' : String(valor);
  return /^[=+\-@]/.test(texto) ? "'" + texto : texto;
}

function idNuevo(nombre, existentes) {
  const base = String(nombre || 'nuevo')
    .toLowerCase()
    .normalize('NFD').replace(/[̀-ͯ]/g, '')
    .replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '') || 'nuevo';
  let id = base;
  for (let n = 2; existentes.includes(id); n++) id = base + '-' + n;
  return id;
}
