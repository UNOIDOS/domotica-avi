(() => {
  'use strict';

  // ------------------------------------------------------------------ Configuración
  const API_URL = String((window.CONFIG && window.CONFIG.API_URL) || '').trim();
  const MODO_PRUEBA = !API_URL;
  const URL_PRUEBA = '../datos/inventario_inicial.json';
  const LS = { pin: 'avi-pin', cache: 'avi-cache', prueba: 'avi-prueba' };
  const VISTAS = ['plano', 'dispositivos', 'escenas', 'pendientes'];

  const CAMPOS_DISP = ['id', 'nombre', 'estancia', 'zona', 'tipo', 'padre', 'app', 'nombre_alexa', 'funcion', 'estado',
    'protocolo', 'alimentacion', 'marca', 'modelo', 'fecha_compra', 'enlace_compra', 'pila', 'ultimo_cambio_pila',
    'consumo_w', 'notas', 'pendiente', 'actualizado'];
  const CAMPOS_ESC = ['id', 'plataforma', 'nombre', 'estado', 'disparador', 'cuando', 'condiciones', 'acciones',
    'frase_voz', 'dispositivos', 'notas', 'pendiente', 'actualizado'];

  const CATEGORIAS = [
    { nombre: 'Luces e interruptores', tipos: ['Relé', 'Canal de relé', 'Luz'] },
    { nombre: 'Enchufes', tipos: ['Enchufe'] },
    { nombre: 'Persianas', tipos: ['Persiana', 'Grupo'] },
    { nombre: 'Sensores', tipos: ['Sensor de contacto', 'Sensor de presencia', 'Sensor de presencia (radar)',
      'Sensor de movimiento (PIR)', 'Sensor de temperatura', 'Sensor de agua', 'Sensor de humo'] },
    { nombre: 'Seguridad', tipos: ['Sirena', 'Cámara'] },
    { nombre: 'Otros', tipos: ['Concentrador (hub)', 'Mando IR', 'Aparato por IR', 'Altavoz Echo', 'Localizador', 'Otro'] },
  ];
  const TIPOS = CATEGORIAS.flatMap(c => c.tipos);
  const ESTADOS_DISP = ['Activo', 'Fuera de línea', 'Temporada', 'Sin uso'];
  const APPS = ['Smart Life', 'Tapo', 'Alexa', 'Otra'];
  const PROTOCOLOS = ['', 'Zigbee', 'WiFi', 'Bluetooth', 'Otro'];
  const ALIMENTACION = ['', 'Red eléctrica', 'Pilas', 'Batería recargable'];
  const PLATAFORMAS = ['Alexa', 'Smart Life'];
  const ESTADOS_ESC = ['Activa', 'Desactivada', 'Temporada'];
  const DISPARADORES = ['Voz', 'Horario', 'Sol', 'Sensor', 'Por confirmar'];
  const ACTUADORES = ['Relé', 'Canal de relé', 'Enchufe', 'Luz', 'Persiana', 'Grupo'];

  const DATOS_TECNICOS = {
    app: 'App', nombre_alexa: 'Nombre en Alexa', protocolo: 'Conexión', alimentacion: 'Alimentación',
    marca: 'Marca', modelo: 'Modelo', fecha_compra: 'Fecha de compra', enlace_compra: 'Enlace de compra',
    pila: 'Tipo de pila', ultimo_cambio_pila: 'Último cambio de pila', consumo_w: 'Consumo (W)',
  };

  // ------------------------------------------------------------------ Iconos
  const P = {
    luz: '<path d="M9 18h6M10 22h4M12 2a7 7 0 0 0-4 12.7V17h8v-2.3A7 7 0 0 0 12 2z"/>',
    rele: '<rect x="1" y="6" width="22" height="12" rx="6"/><circle cx="17" cy="12" r="3"/>',
    enchufe: '<path d="M9 2v6M15 2v6M6 8h12v3a6 6 0 0 1-12 0zM12 17v5"/>',
    persiana: '<path d="M3 3h18M20 7H4M20 11H4M20 15H4M12 15v4"/><circle cx="12" cy="20" r="1"/>',
    contacto: '<rect x="5" y="3" width="10" height="18" rx="1"/><path d="M19 6v12M12 12h.01"/>',
    presencia: '<path d="M4.9 19.1a10 10 0 0 1 0-14.2M7.8 16.2a6 6 0 0 1 0-8.4M19.1 4.9a10 10 0 0 1 0 14.2M16.2 7.8a6 6 0 0 1 0 8.4"/><circle cx="12" cy="12" r="2"/>',
    temp: '<path d="M14 14.8V4a2 2 0 0 0-4 0v10.8a4 4 0 1 0 4 0z"/>',
    agua: '<path d="M12 2.7l5.7 5.6a8 8 0 1 1-11.3 0z"/>',
    humo: '<path d="M8.5 14.5A2.5 2.5 0 0 0 11 12c0-1.4-.5-2-1-3-1.1-2.1-.2-4 2-6 .5 2.5 2 4.9 4 6.5 2 1.6 3 3.5 3 5.5a7 7 0 1 1-14 0c0-1.2.4-2.3 1-3.3.3 1.6 1.3 2.8 2.5 2.8z"/>',
    sirena: '<path d="M6 8a6 6 0 0 1 12 0c0 7 3 9 3 9H3s3-2 3-9M10.3 21a1.9 1.9 0 0 0 3.4 0"/>',
    camara: '<path d="M23 7l-7 5 7 5V7z"/><rect x="1" y="5" width="15" height="14" rx="2"/>',
    hub: '<rect x="2" y="14" width="20" height="8" rx="2"/><path d="M6 18h.01M10 18h.01M15 10v4M17.8 7.2a4 4 0 0 0-5.6 0M20.7 4.3a8 8 0 0 0-11.4 0"/>',
    ir: '<rect x="7" y="2" width="10" height="20" rx="3"/><circle cx="12" cy="8" r="2"/><path d="M12 14h.01M12 17h.01"/>',
    tv: '<rect x="2" y="7" width="20" height="13" rx="2"/><path d="M17 2l-5 5-5-5"/>',
    altavoz: '<rect x="5" y="2" width="14" height="20" rx="2"/><circle cx="12" cy="14" r="4"/><path d="M12 6h.01"/>',
    llave: '<circle cx="7.5" cy="15.5" r="5.5"/><path d="M21 2l-9.6 9.6M15.5 7.5l3 3L22 7l-3-3"/>',
    grupo: '<path d="M12 2l10 5-10 5L2 7z"/><path d="M2 17l10 5 10-5M2 12l10 5 10-5"/>',
    otro: '<circle cx="12" cy="12" r="9"/><path d="M12 8v8M8 12h8"/>',
    buscar: '<circle cx="11" cy="11" r="8"/><path d="M21 21l-4.3-4.3"/>',
    mas: '<path d="M12 5v14M5 12h14"/>',
    cerrar: '<path d="M18 6L6 18M6 6l12 12"/>',
    volver: '<path d="M19 12H5M12 19l-7-7 7-7"/>',
    lapiz: '<path d="M17 3a2.8 2.8 0 1 1 4 4L7.5 20.5 2 22l1.5-5.5z"/>',
    papelera: '<path d="M3 6h18M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6M8 6V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"/>',
    flecha: '<path d="M9 18l6-6-6-6"/>',
    rayo: '<path d="M13 2L3 14h9l-1 8 10-12h-9z"/>',
    alerta: '<circle cx="12" cy="12" r="10"/><path d="M12 8v4M12 16h.01"/>',
    micro: '<rect x="9" y="2" width="6" height="12" rx="3"/><path d="M19 10v1a7 7 0 0 1-14 0v-1M12 18v4"/>',
    recargar: '<path d="M21 12a9 9 0 1 1-3-6.7L21 8M21 3v5h-5"/>',
    ok: '<path d="M20 6L9 17l-5-5"/>',
    nube: '<path d="M17.5 19H9a7 7 0 1 1 6.7-9h1.8a4.5 4.5 0 1 1 0 9z"/>',
  };
  const ICONO_TIPO = {
    'Relé': 'rele', 'Canal de relé': 'luz', 'Luz': 'luz', 'Enchufe': 'enchufe', 'Persiana': 'persiana', 'Grupo': 'grupo',
    'Sensor de contacto': 'contacto', 'Sensor de presencia': 'presencia', 'Sensor de presencia (radar)': 'presencia',
    'Sensor de movimiento (PIR)': 'presencia', 'Sensor de temperatura': 'temp', 'Sensor de agua': 'agua',
    'Sensor de humo': 'humo', 'Sirena': 'sirena', 'Cámara': 'camara', 'Concentrador (hub)': 'hub', 'Mando IR': 'ir',
    'Aparato por IR': 'tv', 'Altavoz Echo': 'altavoz', 'Localizador': 'llave',
  };
  const icono = nombre => `<svg viewBox="0 0 24 24" aria-hidden="true">${P[nombre] || P.otro}</svg>`;
  const iconoTipo = tipo => icono(ICONO_TIPO[tipo] || 'otro');

  // ------------------------------------------------------------------ Utilidades
  const $ = sel => document.querySelector(sel);
  const esc = v => String(v == null ? '' : v).replace(/[&<>"']/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));
  const norm = v => String(v || '').normalize('NFD').replace(/[̀-ͯ]/g, '').toLowerCase();
  const refs = texto => String(texto || '').split(',').map(s => s.trim()).filter(Boolean);
  const porNombre = (a, b) => a.nombre.localeCompare(b.nombre, 'es', { numeric: true });
  const ahora = () => {
    const d = new Date();
    const dos = n => String(n).padStart(2, '0');
    return `${d.getFullYear()}-${dos(d.getMonth() + 1)}-${dos(d.getDate())} ${dos(d.getHours())}:${dos(d.getMinutes())}`;
  };

  function leerLS(clave) {
    try { return JSON.parse(localStorage.getItem(clave)); } catch { return null; }
  }
  function escribirLS(clave, valor) {
    try { valor == null ? localStorage.removeItem(clave) : localStorage.setItem(clave, JSON.stringify(valor)); } catch { /* sin almacenamiento */ }
  }

  function idNuevo(nombre, existentes, prefijo = '') {
    const base = prefijo + (norm(nombre).replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '') || 'nuevo');
    let id = base;
    for (let n = 2; existentes.has(id); n++) id = `${base}-${n}`;
    return id;
  }

  // ------------------------------------------------------------------ Estado
  const estado = {
    datos: { estancias: [], dispositivos: [], escenas: [] },
    cargado: false,
    sync: 'cargando',
    pedirPin: false,
    errorPin: '',
    confirmarBorrado: false,
    vistaPintada: '',
    sucio: true,
    filtros: { q: '', estancia: '', categoria: '', estadoDisp: '', escQ: '', plataforma: 'Alexa', estadoEsc: '' },
  };
  let idx = { est: new Map(), disp: new Map(), hijos: new Map(), escPor: new Map(), esc: new Map() };

  function normalizar(j) {
    const filas = (lista, campos) => (Array.isArray(lista) ? lista : [])
      .filter(x => x && x.id)
      .map(x => Object.fromEntries(campos.map(c => [c, x[c] == null ? '' : String(x[c])])));
    return {
      estancias: filas(j.estancias, ['id', 'nombre', 'notas']),
      dispositivos: filas(j.dispositivos, CAMPOS_DISP),
      escenas: filas(j.escenas, CAMPOS_ESC),
    };
  }

  function indexar() {
    const { estancias, dispositivos, escenas } = estado.datos;
    idx = {
      est: new Map(estancias.map(e => [e.id, e])),
      disp: new Map(dispositivos.map(d => [d.id, d])),
      esc: new Map(escenas.map(e => [e.id, e])),
      hijos: new Map(),
      escPor: new Map(),
    };
    for (const d of dispositivos) {
      if (d.padre) (idx.hijos.get(d.padre) || idx.hijos.set(d.padre, []).get(d.padre)).push(d);
    }
    for (const e of escenas) {
      for (const id of refs(e.dispositivos)) (idx.escPor.get(id) || idx.escPor.set(id, []).get(id)).push(e);
    }
    estado.sucio = true;
  }

  const esFisico = d => d.tipo !== 'Canal de relé' && d.tipo !== 'Grupo';
  const nombreEstancia = id => (idx.est.get(id) || {}).nombre || id || 'Sin estancia';
  const categoriaDe = tipo => Math.max(0, CATEGORIAS.findIndex(c => c.tipos.includes(tipo)));
  const hijosDe = id => (idx.hijos.get(id) || []).slice().sort(porNombre);
  const pendientes = () => ({
    dispositivos: estado.datos.dispositivos.filter(d => d.pendiente.trim()).sort(porNombre),
    escenas: estado.datos.escenas.filter(e => e.pendiente.trim()).sort(porNombre),
  });

  function escenasDe(ids) {
    const vistas = new Set();
    for (const id of ids) for (const e of idx.escPor.get(id) || []) vistas.add(e);
    return [...vistas].sort((a, b) => ESTADOS_ESC.indexOf(a.estado) - ESTADOS_ESC.indexOf(b.estado) || porNombre(a, b));
  }
  const escenasDeDispositivo = d => escenasDe([d.id, ...hijosDe(d.id).map(h => h.id)]);

  // ------------------------------------------------------------------ Conexión con la Hoja de Google
  const pin = () => leerLS(LS.pin) || '';

  async function apiCargar() {
    if (MODO_PRUEBA) {
      const guardado = leerLS(LS.prueba);
      if (guardado) return guardado;
      const r = await fetch(URL_PRUEBA, { cache: 'no-store' });
      if (!r.ok) throw new Error('No encuentro los datos de prueba');
      return r.json();
    }
    const r = await fetch(`${API_URL}?pin=${encodeURIComponent(pin())}`, { cache: 'no-store' });
    const j = await r.json();
    if (!j.ok) throw new Error(j.error);
    return j;
  }

  async function apiEnviar(cuerpo) {
    if (MODO_PRUEBA) {
      escribirLS(LS.prueba, estado.datos);
      return { ok: true };
    }
    const r = await fetch(API_URL, {
      method: 'POST',
      headers: { 'Content-Type': 'text/plain;charset=utf-8' },
      body: JSON.stringify(Object.assign({ pin: pin() }, cuerpo)),
    });
    const j = await r.json();
    if (!j.ok) throw new Error(j.error);
    return j;
  }

  async function cargar() {
    ponerSync('cargando');
    try {
      estado.datos = normalizar(await apiCargar());
      estado.cargado = true;
      estado.pedirPin = false;
      indexar();
      if (!MODO_PRUEBA) escribirLS(LS.cache, estado.datos);
      ponerSync(MODO_PRUEBA ? 'prueba' : 'ok');
    } catch (err) {
      tratarError(err, estado.cargado ? 'offline' : 'error');
    }
    render();
  }

  async function guardarRegistro(hoja, registro) {
    const lista = estado.datos[hoja];
    const anterior = lista.slice();
    registro.actualizado = ahora();
    const i = lista.findIndex(x => x.id === registro.id);
    if (i >= 0) lista[i] = registro; else lista.push(registro);
    indexar();
    render();
    ponerSync('guardando');
    try {
      await apiEnviar({ accion: 'guardar', hoja, registro });
      if (!MODO_PRUEBA) escribirLS(LS.cache, estado.datos);
      ponerSync(MODO_PRUEBA ? 'prueba' : 'ok');
      aviso('Guardado');
      return true;
    } catch (err) {
      estado.datos[hoja] = anterior;
      indexar();
      render();
      tratarError(err, 'offline', 'No se ha podido guardar');
      return false;
    }
  }

  async function borrarRegistro(hoja, id) {
    const anterior = estado.datos[hoja].slice();
    estado.datos[hoja] = anterior.filter(x => x.id !== id);
    indexar();
    render();
    ponerSync('guardando');
    try {
      await apiEnviar({ accion: 'borrar', hoja, id });
      if (!MODO_PRUEBA) escribirLS(LS.cache, estado.datos);
      ponerSync(MODO_PRUEBA ? 'prueba' : 'ok');
      aviso('Borrado');
    } catch (err) {
      estado.datos[hoja] = anterior;
      indexar();
      render();
      tratarError(err, 'offline', 'No se ha podido borrar');
    }
  }

  function tratarError(err, sync, prefijo) {
    const msg = err && err.message;
    if (msg === 'pin') {
      escribirLS(LS.pin, null);
      estado.pedirPin = true;
      estado.errorPin = 'El PIN no es correcto.';
      ponerSync('error');
    } else if (msg === 'bloqueado') {
      estado.pedirPin = true;
      estado.errorPin = 'Demasiados intentos. Espera 15 minutos y vuelve a probar.';
      ponerSync('error');
    } else {
      ponerSync(sync);
      aviso(prefijo ? `${prefijo}: revisa la conexión.` : 'Sin conexión: se muestra la última copia guardada.');
    }
  }

  // ------------------------------------------------------------------ Indicadores
  const SYNC = {
    cargando: ['recargar', 'Cargando…'],
    guardando: ['nube', 'Guardando…'],
    ok: ['ok', 'Al día'],
    offline: ['recargar', 'Sin conexión'],
    error: ['recargar', 'Reintentar'],
    prueba: ['alerta', 'Modo prueba'],
  };
  function ponerSync(s) {
    estado.sync = s;
    const [ic, texto] = SYNC[s];
    $('#estado').innerHTML = `${icono(ic)}<span>${texto}</span>`;
  }

  let temporizadorAviso;
  function aviso(texto) {
    const el = $('#aviso');
    el.textContent = texto;
    el.classList.add('visible');
    clearTimeout(temporizadorAviso);
    temporizadorAviso = setTimeout(() => el.classList.remove('visible'), 2600);
  }

  // ------------------------------------------------------------------ Navegación (#vista/tipo/id)
  function ruta() {
    const [vista, tipo = '', ...resto] = decodeURIComponent(location.hash.slice(1)).split('/');
    return { vista: VISTAS.includes(vista) ? vista : 'plano', tipo, id: resto.join('/') };
  }
  const nivel = () => (history.state && history.state.nivel) || 0;

  function abrir(tipo, id = '') {
    const hash = [ruta().vista, tipo, id].filter(Boolean).map(encodeURIComponent).join('/');
    history.pushState({ nivel: nivel() + 1 }, '', `#${hash}`);
    estado.confirmarBorrado = false;
    render();
  }
  function sustituir(tipo, id) {
    const hash = [ruta().vista, tipo, id].filter(Boolean).map(encodeURIComponent).join('/');
    history.replaceState({ nivel: nivel() }, '', `#${hash}`);
    render();
  }
  function cerrar(todo) {
    const n = nivel();
    estado.confirmarBorrado = false;
    if (n > 0) {
      history.go(todo ? -n : -1);
    } else {
      history.replaceState(null, '', `#${ruta().vista}`);
      render();
    }
  }

  // ------------------------------------------------------------------ Render general
  function render() {
    const r = ruta();
    document.querySelectorAll('#pestanas a').forEach(a => {
      if (a.dataset.vista === r.vista) a.setAttribute('aria-current', 'page'); else a.removeAttribute('aria-current');
    });
    const p = pendientes();
    $('#num-pendientes').textContent = estado.cargado ? (p.dispositivos.length + p.escenas.length || '') : '';

    const vista = $('#vista');
    if (estado.pedirPin) {
      vista.innerHTML = htmlPin();
      estado.vistaPintada = 'pin';
      const input = $('#pin-input');
      if (input) input.focus();
      pintarPanel(null);
      return;
    }
    if (!estado.cargado) {
      vista.innerHTML = `<p class="vacio">${estado.sync === 'error' ? 'No se han podido cargar los datos. Pulsa «Reintentar» arriba.' : 'Cargando…'}</p>`;
      estado.vistaPintada = '';
      return;
    }
    if (estado.vistaPintada !== r.vista || estado.sucio) {
      const enfocado = document.activeElement && document.activeElement.dataset && document.activeElement.dataset.filtro;
      vista.innerHTML = (MODO_PRUEBA ? htmlFranjaPrueba() : '') + VISTA_HTML[r.vista]();
      estado.vistaPintada = r.vista;
      estado.sucio = false;
      if (enfocado) {
        const el = vista.querySelector(`[data-filtro="${enfocado}"]`);
        if (el) { el.focus(); if (el.setSelectionRange) el.setSelectionRange(el.value.length, el.value.length); }
      }
    }
    pintarPanel(r);
  }

  const htmlFranjaPrueba = () =>
    '<div class="franja"><b>Modo prueba.</b> Los cambios solo se guardan en este navegador. ' +
    'Cuando esté conectada la Hoja de Google, se guardarán allí y los veréis los dos.</div>';

  function htmlPin() {
    return `
      <form class="pin" data-form="pin">
        <h2>Introduce el PIN</h2>
        <p>Para ver y editar el inventario de la casa.</p>
        <input id="pin-input" name="pin" type="password" inputmode="numeric" autocomplete="current-password" required>
        <p class="error">${esc(estado.errorPin)}</p>
        <button class="boton boton--principal boton--ancho" type="submit">Entrar</button>
      </form>`;
  }

  // ------------------------------------------------------------------ Vista: plano
  function vistaPlano() {
    const fisicos = estado.datos.dispositivos.filter(esFisico);
    const sinConexion = fisicos.filter(d => d.estado === 'Fuera de línea').length;
    const escenas = estado.datos.escenas;
    const activas = plat => escenas.filter(e => e.plataforma === plat && e.estado === 'Activa').length;
    const total = plat => escenas.filter(e => e.plataforma === plat).length;
    return `
      <div class="cifras">
        <button class="cifra" data-accion="cifra" data-vista="dispositivos"><b>${fisicos.length}</b><span>dispositivos</span></button>
        <button class="cifra" data-accion="cifra" data-vista="dispositivos" data-estado="Fuera de línea"><b>${sinConexion}</b><span>fuera de línea</span></button>
        <button class="cifra" data-accion="cifra" data-vista="escenas" data-plataforma="Alexa"><b>${activas('Alexa')}<small>/${total('Alexa')}</small></b><span>rutinas Alexa activas</span></button>
        <button class="cifra" data-accion="cifra" data-vista="escenas" data-plataforma="Smart Life"><b>${activas('Smart Life')}<small>/${total('Smart Life')}</small></b><span>automatizaciones Smart Life activas</span></button>
      </div>
      <div class="plano-caja">${svgPlano()}</div>
      <p class="plano-ayuda">Toca una habitación para ver qué hay y qué escenas la usan.</p>`;
  }

  function svgPlano() {
    const plano = window.PLANO;
    const s = plano.escala;
    const [cx, cy, cw, ch] = plano.caja.map(v => v * s);
    const texto = (t, x, y, clase, vertical) =>
      `<text class="${clase}" x="${x}" y="${y}"${vertical ? ` transform="rotate(-90 ${x} ${y})"` : ''}>${esc(t)}</text>`;

    const salas = plano.salas.map(sala => {
      const nombre = nombreEstancia(sala.id);
      const n = estado.datos.dispositivos.filter(d => d.estancia === sala.id && esFisico(d)).length;
      const puntos = sala.puntos.map(([x, y]) => `${x * s},${y * s}`).join(' ');
      const [lx, ly] = sala.etiqueta.map(v => v * s);
      let etiqueta;
      let yContador = ly + 34;
      if (sala.vertical) {
        etiqueta = texto(nombre, lx, ly, 'etiqueta', true);
        yContador = ly + 80;
      } else if (nombre.length > 11 && nombre.includes(' ')) {
        const corte = nombre.indexOf(' ');
        etiqueta = texto(nombre.slice(0, corte), lx, ly - 12, 'etiqueta') + texto(nombre.slice(corte + 1), lx, ly + 12, 'etiqueta');
        yContador = ly + 48;
      } else {
        etiqueta = texto(nombre, lx, ly, 'etiqueta');
      }
      const extras = (sala.extras || []).map(x => texto(x.texto, x.x * s, x.y * s, 'extra', x.vertical)).join('');
      return `
        <g class="sala" data-accion="ir-s" data-id="${esc(sala.id)}" tabindex="0" role="button" aria-label="${esc(nombre)}: ${n} dispositivos">
          <polygon points="${puntos}"/>
          ${etiqueta}${extras}
          <g class="contador"><circle cx="${lx}" cy="${yContador}" r="15"/><text x="${lx}" y="${yContador + 1}">${n}</text></g>
        </g>`;
    }).join('');
    const notas = plano.notas.map(x => texto(x.texto, x.x * s, x.y * s, 'extra', x.vertical)).join('');
    return `<svg class="plano" viewBox="${cx} ${cy} ${cw} ${ch}" role="img" aria-label="Plano de la casa">${salas}${notas}</svg>`;
  }

  // ------------------------------------------------------------------ Vista: dispositivos
  function vistaDispositivos() {
    const f = estado.filtros;
    const opciones = (lista, actual, todos) =>
      `<option value="">${todos}</option>` + lista.map(([v, t]) => `<option value="${esc(v)}"${v === actual ? ' selected' : ''}>${esc(t)}</option>`).join('');
    return `
      <div class="herramientas">
        <label class="buscador">${icono('buscar')}<input type="search" placeholder="Buscar (nombre, función, zona…)" value="${esc(f.q)}" data-filtro="q" aria-label="Buscar dispositivos"></label>
        <select data-filtro="estancia" aria-label="Estancia">${opciones(estado.datos.estancias.map(e => [e.id, e.nombre]), f.estancia, 'Todas las estancias')}</select>
        <select data-filtro="categoria" aria-label="Tipo">${opciones(CATEGORIAS.map((c, i) => [String(i), c.nombre]), f.categoria, 'Todos los tipos')}</select>
        <select data-filtro="estadoDisp" aria-label="Estado">${opciones(ESTADOS_DISP.map(e => [e, e]), f.estadoDisp, 'Cualquier estado')}</select>
      </div>
      <div id="resultados">${listaDispositivos()}</div>
      <button class="flotante" data-accion="nuevo-d">${icono('mas')}Añadir dispositivo</button>`;
  }

  function filtrarDispositivos() {
    const f = estado.filtros;
    const q = norm(f.q);
    return estado.datos.dispositivos.filter(d =>
      (!f.estancia || d.estancia === f.estancia) &&
      (f.categoria === '' || String(categoriaDe(d.tipo)) === f.categoria) &&
      (!f.estadoDisp || d.estado === f.estadoDisp) &&
      (!q || norm([d.nombre, d.funcion, d.zona, d.tipo, d.nombre_alexa, d.notas, d.marca, d.modelo, nombreEstancia(d.estancia)].join(' ')).includes(q)));
  }

  function listaDispositivos() {
    const visibles = filtrarDispositivos();
    if (!visibles.length) return '<p class="vacio">No hay dispositivos con estos filtros.</p>';
    const ordenar = lista => lista.slice().sort((a, b) => categoriaDe(a.tipo) - categoriaDe(b.tipo) || porNombre(a, b));
    return estado.datos.estancias.map(est => {
      const aqui = visibles.filter(d => d.estancia === est.id);
      if (!aqui.length) return '';
      const ids = new Set(aqui.map(d => d.id));
      const filas = [];
      for (const d of ordenar(aqui.filter(d => !d.padre || !ids.has(d.padre)))) {
        filas.push(filaDispositivo(d, false));
        for (const h of hijosDe(d.id)) if (ids.has(h.id)) filas.push(filaDispositivo(h, true));
      }
      const fisicos = aqui.filter(esFisico).length;
      return `<section class="grupo"><div class="grupo__cabecera">${esc(est.nombre)}<small>${fisicos} ${fisicos === 1 ? 'dispositivo' : 'dispositivos'}</small></div>${filas.join('')}</section>`;
    }).join('') + sinEstancia(visibles);
  }

  function sinEstancia(visibles) {
    const huerfanos = visibles.filter(d => !idx.est.has(d.estancia));
    if (!huerfanos.length) return '';
    return `<section class="grupo"><div class="grupo__cabecera">Sin estancia</div>${huerfanos.map(d => filaDispositivo(d, false)).join('')}</section>`;
  }

  function filaDispositivo(d, comoCanal) {
    const padre = d.padre && idx.disp.get(d.padre);
    const sub = comoCanal ? 'Canal' : [d.tipo, d.zona, padre ? `de ${padre.nombre}` : ''].filter(Boolean).join(' · ');
    return `
      <button class="fila${comoCanal ? ' fila--canal' : ''}" data-accion="ir-d" data-id="${esc(d.id)}">
        <span class="fila__icono">${iconoTipo(d.tipo)}</span>
        <span class="fila__texto"><span class="fila__titulo">${esc(d.nombre)}</span><span class="fila__sub">${esc(sub)}</span></span>
        <span class="fila__fin">${etqEstadoDisp(d.estado, true)}${d.pendiente ? '<span class="etq etq--pend">pendiente</span>' : ''}${icono('flecha')}</span>
      </button>`;
  }

  function etqEstadoDisp(valor, soloSiRaro) {
    if (valor === 'Activo') return soloSiRaro ? '' : '<span class="etq etq--ok">Activo</span>';
    const clase = valor === 'Fuera de línea' ? 'etq--mal' : 'etq--off';
    return `<span class="etq ${clase}">${esc(valor || 'Sin estado')}</span>`;
  }
  function etqEstadoEsc(valor) {
    const clase = valor === 'Activa' ? 'etq--ok' : 'etq--off';
    return `<span class="etq ${clase}">${esc(valor || 'Sin estado')}</span>`;
  }
  const etqPlataforma = p => `<span class="etq ${p === 'Alexa' ? 'etq--alexa' : 'etq--smartlife'}">${esc(p)}</span>`;

  // ------------------------------------------------------------------ Vista: escenas
  function vistaEscenas() {
    const f = estado.filtros;
    const cuenta = p => estado.datos.escenas.filter(e => e.plataforma === p).length;
    const chips = [['', 'Todas'], ...ESTADOS_ESC.map(e => [e, e === 'Activa' ? 'Activas' : e === 'Desactivada' ? 'Desactivadas' : e])];
    return `
      <div class="segmento" role="group" aria-label="Plataforma">
        ${PLATAFORMAS.map(p => `<button data-accion="plataforma" data-valor="${esc(p)}" aria-pressed="${f.plataforma === p}">${esc(p)} (${cuenta(p)})</button>`).join('')}
      </div>
      <div class="herramientas">
        <label class="buscador">${icono('buscar')}<input type="search" placeholder="Buscar escena o dispositivo" value="${esc(f.escQ)}" data-filtro="escQ" aria-label="Buscar escenas"></label>
      </div>
      <div class="chips" role="group" aria-label="Estado">
        ${chips.map(([v, t]) => `<button data-accion="estado-esc" data-valor="${esc(v)}" aria-pressed="${f.estadoEsc === v}">${esc(t)}</button>`).join('')}
      </div>
      <div id="resultados">${listaEscenas()}</div>
      <button class="flotante" data-accion="nuevo-e">${icono('mas')}Añadir escena</button>`;
  }

  function listaEscenas() {
    const f = estado.filtros;
    const q = norm(f.escQ);
    const lista = estado.datos.escenas
      .filter(e => e.plataforma === f.plataforma && (!f.estadoEsc || e.estado === f.estadoEsc))
      .filter(e => !q || norm([e.nombre, e.cuando, e.condiciones, e.acciones, e.frase_voz, e.notas,
        ...refs(e.dispositivos).map(id => (idx.disp.get(id) || {}).nombre)].join(' ')).includes(q))
      .sort((a, b) => ESTADOS_ESC.indexOf(a.estado) - ESTADOS_ESC.indexOf(b.estado) || porNombre(a, b));
    if (!lista.length) return '<p class="vacio">No hay escenas con estos filtros.</p>';
    return `<div class="tarjetas">${lista.map(tarjetaEscena).join('')}</div>`;
  }

  function tarjetaEscena(e) {
    const cuando = [e.cuando || e.disparador, e.condiciones].filter(Boolean).join(' · ');
    return `
      <button class="tarjeta" data-accion="ir-e" data-id="${esc(e.id)}">
        <div class="tarjeta__cabecera"><span class="tarjeta__titulo">${esc(e.nombre)}</span>${etqEstadoEsc(e.estado)}</div>
        ${cuando ? `<p><b>Cuándo:</b> ${esc(cuando)}</p>` : ''}
        ${e.acciones ? `<p><b>Qué hace:</b> ${esc(e.acciones)}</p>` : ''}
        ${e.frase_voz ? `<div class="voz">${icono('micro')}«${esc(e.frase_voz)}»</div>` : ''}
        ${e.pendiente ? '<p><span class="etq etq--pend">pendiente de confirmar</span></p>' : ''}
      </button>`;
  }

  // ------------------------------------------------------------------ Vista: pendientes
  function vistaPendientes() {
    const p = pendientes();
    if (!p.dispositivos.length && !p.escenas.length) return '<h2>Pendientes</h2><p class="vacio">No queda nada por confirmar.</p>';
    const fila = (accion, x, ic, sub) => `
      <button class="fila" data-accion="${accion}" data-id="${esc(x.id)}">
        <span class="fila__icono">${ic}</span>
        <span class="fila__texto"><span class="fila__titulo">${esc(x.nombre)} <small>· ${esc(sub)}</small></span><span class="fila__sub">${esc(x.pendiente)}</span></span>
        <span class="fila__fin">${icono('flecha')}</span>
      </button>`;
    return `
      <h2>Pendientes de confirmar</h2>
      <p>Dudas que quedan del inventario. Abre cada una, corrige lo que haga falta y pulsa <b>Marcar como resuelto</b>.</p>
      ${p.dispositivos.length ? `<section class="grupo"><div class="grupo__cabecera">Dispositivos<small>${p.dispositivos.length}</small></div>
        ${p.dispositivos.map(d => fila('ir-d', d, iconoTipo(d.tipo), nombreEstancia(d.estancia))).join('')}</section>` : ''}
      ${p.escenas.length ? `<section class="grupo"><div class="grupo__cabecera">Escenas<small>${p.escenas.length}</small></div>
        ${p.escenas.map(e => fila('ir-e', e, icono('rayo'), e.plataforma)).join('')}</section>` : ''}`;
  }

  const VISTA_HTML = { plano: vistaPlano, dispositivos: vistaDispositivos, escenas: vistaEscenas, pendientes: vistaPendientes };

  // ------------------------------------------------------------------ Panel lateral / inferior
  function pintarPanel(r) {
    const panel = $('#panel');
    const html = r && estado.cargado && PANEL_HTML[r.tipo] ? PANEL_HTML[r.tipo](r.id) : '';
    if (!html) {
      if (!panel.hidden) { panel.hidden = true; document.body.style.overflow = ''; }
      return;
    }
    const contenido = $('#panel-contenido');
    const mismo = panel.dataset.clave === `${r.tipo}/${r.id}` && !panel.hidden;
    const scroll = contenido.scrollTop;
    contenido.innerHTML = html;
    panel.dataset.clave = `${r.tipo}/${r.id}`;
    if (panel.hidden) { panel.hidden = false; document.body.style.overflow = 'hidden'; }
    contenido.scrollTop = mismo ? scroll : 0;
    if (!mismo) {
      const primero = contenido.querySelector('input:not([type="search"]), h2');
      if (primero && primero.tagName === 'INPUT') primero.focus();
    }
  }

  function cabeceraPanel(titulo) {
    const atras = nivel() > 1 ? `<button class="boton-icono" data-accion="volver" aria-label="Volver">${icono('volver')}</button>` : '';
    return `<div class="panel__cabecera">${atras}<h2 id="panel-titulo">${esc(titulo)}</h2>
      <button class="boton-icono" data-accion="cerrar-todo" aria-label="Cerrar">${icono('cerrar')}</button></div>`;
  }

  function bloquePendiente(hoja, x) {
    if (!x.pendiente) return '';
    return `<div class="bloque bloque--pend"><h3>${icono('alerta')}Pendiente de confirmar</h3><p>${esc(x.pendiente)}</p>
      <div class="acciones"><button class="boton" data-accion="resolver" data-hoja="${hoja}" data-id="${esc(x.id)}">${icono('ok')}Marcar como resuelto</button></div></div>`;
  }

  function botonesEditar(hoja, x, editar) {
    if (estado.confirmarBorrado) {
      const usos = hoja === 'dispositivos' ? escenasDeDispositivo(x).length : 0;
      return `<div class="bloque"><p><b>¿Borrar «${esc(x.nombre)}»?</b> ${usos ? `Aparece en ${usos} escenas; en ellas saldrá como «ya no existe». ` : ''}Se borrará también de la Hoja de Google.</p>
        <div class="acciones"><button class="boton boton--peligro boton--ancho" data-accion="borrar-si" data-hoja="${hoja}" data-id="${esc(x.id)}">Sí, borrar</button>
        <button class="boton boton--ancho" data-accion="borrar-no">Cancelar</button></div></div>`;
    }
    return `<div class="acciones">
      <button class="boton boton--principal boton--ancho" data-accion="${editar}" data-id="${esc(x.id)}">${icono('lapiz')}Editar</button>
      <button class="boton boton--peligro" data-accion="borrar" aria-label="Borrar">${icono('papelera')}</button></div>
      ${x.actualizado ? `<p class="fila__sub" style="margin-top:10px">Última modificación: ${esc(x.actualizado)}</p>` : ''}`;
  }

  function filasEscenas(lista) {
    return lista.map(e => `
      <button class="fila" data-accion="ir-e" data-id="${esc(e.id)}">
        <span class="fila__icono">${icono('rayo')}</span>
        <span class="fila__texto"><span class="fila__titulo">${esc(e.nombre)}</span><span class="fila__sub">${esc(e.cuando || e.disparador)}</span></span>
        <span class="fila__fin">${e.estado !== 'Activa' ? etqEstadoEsc(e.estado) : ''}${icono('flecha')}</span>
      </button>`).join('');
  }

  function bloqueEscenas(lista, vacio) {
    if (!lista.length) return `<div class="bloque"><h3>Escenas</h3><p class="fila__sub">${vacio}</p></div>`;
    return PLATAFORMAS.map(p => {
      const deEsta = lista.filter(e => e.plataforma === p);
      if (!deEsta.length) return '';
      return `<div class="bloque"><h3>${etqPlataforma(p)} ${deEsta.length} ${p === 'Alexa' ? (deEsta.length === 1 ? 'rutina' : 'rutinas') : (deEsta.length === 1 ? 'automatización' : 'automatizaciones')}</h3>
        <div class="grupo">${filasEscenas(deEsta)}</div></div>`;
    }).join('');
  }

  // ---- Ficha de estancia
  function panelEstancia(id) {
    const est = idx.est.get(id);
    if (!est) return '';
    const aqui = estado.datos.dispositivos.filter(d => d.estancia === id);
    const ids = new Set(aqui.map(d => d.id));
    const grupos = CATEGORIAS.map((c, i) => {
      const lista = aqui.filter(d => categoriaDe(d.tipo) === i && (!d.padre || !ids.has(d.padre))).sort(porNombre);
      if (!lista.length) return '';
      const filas = lista.flatMap(d => [filaDispositivo(d, false), ...hijosDe(d.id).filter(h => ids.has(h.id)).map(h => filaDispositivo(h, true))]);
      return `<section class="grupo"><div class="grupo__cabecera">${esc(c.nombre)}</div>${filas.join('')}</section>`;
    }).join('');
    const fisicos = aqui.filter(esFisico).length;
    return `${cabeceraPanel(est.nombre)}
      ${est.notas ? `<p class="ficha-sub">${esc(est.notas)}</p>` : ''}
      <p class="seccion-titulo">${fisicos} ${fisicos === 1 ? 'dispositivo' : 'dispositivos'}</p>
      ${grupos || '<p class="vacio">Todavía no hay dispositivos aquí.</p>'}
      <button class="boton boton--ancho" style="width:100%" data-accion="nuevo-d" data-estancia="${esc(id)}">${icono('mas')}Añadir dispositivo aquí</button>
      <p class="seccion-titulo">Escenas que usan esta estancia</p>
      ${bloqueEscenas(escenasDe([...ids]), 'Ninguna escena usa dispositivos de esta estancia.')}`;
  }

  // ---- Ficha de dispositivo
  function comandosVoz(d) {
    const lista = [];
    const tieneCanales = hijosDe(d.id).length > 0;
    if (ACTUADORES.includes(d.tipo) && !tieneCanales) {
      const supuesto = !d.nombre_alexa && d.tipo !== 'Canal de relé';
      const nombre = d.nombre_alexa || (supuesto ? d.nombre : '');
      if (nombre) {
        const [si, no] = d.tipo === 'Persiana' || d.tipo === 'Grupo' ? ['abre', 'cierra'] : ['enciende', 'apaga'];
        const nota = supuesto ? 'Con el nombre de Smart Life (en Alexa debería llamarse igual)' : 'Nombre en Alexa';
        lista.push({ frase: `Alexa, ${si} ${nombre.toLowerCase()}`, nota }, { frase: `Alexa, ${no} ${nombre.toLowerCase()}`, nota });
      } else {
        lista.push({ falta: true });
      }
    }
    for (const e of escenasDeDispositivo(d)) {
      if (e.frase_voz) lista.push({ frase: e.frase_voz, nota: `Rutina «${e.nombre}»${e.estado !== 'Activa' ? ` (${e.estado.toLowerCase()})` : ''}` });
    }
    return lista;
  }

  function panelDispositivo(id) {
    const d = idx.disp.get(id);
    if (!d) return `${cabeceraPanel('No encontrado')}<p class="vacio">Este dispositivo ya no existe.</p>`;
    const padre = d.padre && idx.disp.get(d.padre);
    const hijos = hijosDe(d.id);
    const voz = comandosVoz(d);
    const esSensor = categoriaDe(d.tipo) === 3;
    const tecnicos = Object.entries(DATOS_TECNICOS).filter(([c]) => d[c]);
    const valor = (c, v) => c === 'enlace_compra' && /^https?:\/\//.test(v)
      ? `<a href="${esc(v)}" target="_blank" rel="noopener">Abrir enlace</a>` : esc(v);

    return `${cabeceraPanel(d.nombre)}
      <div class="ficha-sub">${iconoTipo(d.tipo)} ${esc(d.tipo)} ·
        <a href="#" data-accion="ir-s" data-id="${esc(d.estancia)}">${esc(nombreEstancia(d.estancia))}</a>${d.zona ? ` · ${esc(d.zona)}` : ''}
        ${etqEstadoDisp(d.estado)} ${d.app ? `<span class="etq etq--off">${esc(d.app)}</span>` : ''}</div>
      ${bloquePendiente('dispositivos', d)}
      ${d.funcion ? `<div class="bloque"><h3>Qué hace</h3><p>${esc(d.funcion)}</p></div>` : ''}
      ${voz.length ? `<div class="bloque"><h3>Por voz</h3>${voz.map(v => v.falta
        ? '<p class="fila__sub">Falta saber cómo se llama en Alexa. Pulsa «Editar» y rellena «Nombre en Alexa».</p>'
        : `<div class="voz">${icono('micro')}<span>«${esc(v.frase)}»<small>${esc(v.nota)}</small></span></div>`).join('')}</div>`
        : esSensor ? '<div class="bloque"><h3>Por voz</h3><p class="fila__sub">Es un sensor: no se controla por voz, sirve para disparar escenas.</p></div>' : ''}
      ${hijos.length ? `<div class="bloque"><h3>Canales (${hijos.length})</h3><div class="grupo">${hijos.map(h => filaDispositivo(h, false)).join('')}</div></div>` : ''}
      ${padre ? `<div class="bloque"><h3>Depende de</h3><div class="grupo">${filaDispositivo(padre, false)}</div></div>` : ''}
      ${bloqueEscenas(escenasDeDispositivo(d), 'No aparece en ninguna rutina de Alexa ni automatización de Smart Life.')}
      <div class="bloque"><h3>Datos</h3>${tecnicos.length
        ? `<dl class="datos">${tecnicos.map(([c, t]) => `<dt>${t}</dt><dd>${valor(c, d[c])}</dd>`).join('')}</dl>` : ''}
        ${tecnicos.length < 6 ? `<p class="fila__sub"${tecnicos.length ? ' style="margin-top:8px"' : ''}>Faltan datos (marca, modelo, pila, fecha de compra…). Pulsa «Editar» para completarlos.</p>` : ''}</div>
      ${d.notas ? `<div class="bloque"><h3>Notas</h3><p>${esc(d.notas)}</p></div>` : ''}
      ${botonesEditar('dispositivos', d, 'editar-d')}`;
  }

  // ---- Ficha de escena
  function panelEscena(id) {
    const e = idx.esc.get(id);
    if (!e) return `${cabeceraPanel('No encontrada')}<p class="vacio">Esta escena ya no existe.</p>`;
    const ids = refs(e.dispositivos);
    const filas = ids.map(i => {
      const d = idx.disp.get(i);
      if (!d) return `<div class="fila"><span class="fila__icono">${icono('alerta')}</span><span class="fila__texto"><span class="fila__titulo">Ya no existe</span><span class="fila__sub">${esc(i)}</span></span></div>`;
      return `<button class="fila" data-accion="ir-d" data-id="${esc(d.id)}"><span class="fila__icono">${iconoTipo(d.tipo)}</span>
        <span class="fila__texto"><span class="fila__titulo">${esc(d.nombre)}</span><span class="fila__sub">${esc(nombreEstancia(d.estancia))}${d.zona ? ` · ${esc(d.zona)}` : ''}</span></span>
        <span class="fila__fin">${etqEstadoDisp(d.estado, true)}${icono('flecha')}</span></button>`;
    }).join('');
    return `${cabeceraPanel(e.nombre)}
      <div class="ficha-sub">${etqPlataforma(e.plataforma)} ${etqEstadoEsc(e.estado)} ${e.disparador ? `<span class="etq etq--off">${esc(e.disparador)}</span>` : ''}</div>
      ${bloquePendiente('escenas', e)}
      ${e.frase_voz ? `<div class="voz">${icono('micro')}«${esc(e.frase_voz)}»</div>` : ''}
      <div class="bloque"><h3>Cuándo se activa</h3><p>${esc(e.cuando || 'Por confirmar')}</p>
        ${e.condiciones ? `<p style="margin-top:6px"><b>Solo si:</b> ${esc(e.condiciones)}</p>` : ''}</div>
      <div class="bloque"><h3>Qué hace</h3><p>${esc(e.acciones || 'Por confirmar')}</p></div>
      <div class="bloque"><h3>Dispositivos (${ids.length})</h3>${ids.length ? `<div class="grupo">${filas}</div>` : '<p class="fila__sub">No usa dispositivos concretos.</p>'}</div>
      ${e.notas ? `<div class="bloque"><h3>Notas</h3><p>${esc(e.notas)}</p></div>` : ''}
      ${botonesEditar('escenas', e, 'editar-e')}`;
  }

  // ---- Formularios
  const opcionesSelect = (lista, actual) =>
    lista.map(v => Array.isArray(v) ? v : [v, v || '—'])
      .map(([v, t]) => `<option value="${esc(v)}"${v === actual ? ' selected' : ''}>${esc(t)}</option>`).join('');
  const campo = (etiqueta, html, ayuda = '') => `<label><span>${etiqueta}</span>${html}${ayuda ? `<small>${ayuda}</small>` : ''}</label>`;
  const entrada = (nombre, valor, extra = '') => `<input name="${nombre}" value="${esc(valor)}" ${extra}>`;
  const area = (nombre, valor) => `<textarea name="${nombre}">${esc(valor)}</textarea>`;

  function formDispositivo(id, nuevo) {
    const d = nuevo ? Object.fromEntries(CAMPOS_DISP.map(c => [c, ''])) : idx.disp.get(id);
    if (!d) return '';
    if (nuevo) Object.assign(d, { estancia: id || '', estado: 'Activo', app: 'Smart Life' });
    const padres = estado.datos.dispositivos.filter(x => x.id !== d.id && x.tipo !== 'Canal de relé').sort(porNombre)
      .map(x => [x.id, `${x.nombre} (${nombreEstancia(x.estancia)})`]);
    return `${cabeceraPanel(nuevo ? 'Nuevo dispositivo' : `Editar ${d.nombre}`)}
      <form class="formulario" data-form="dispositivo" data-id="${esc(nuevo ? '' : d.id)}">
        ${campo('Nombre *', entrada('nombre', d.nombre, 'required'), 'Mejor igual que en Smart Life.')}
        <div class="dos">
          ${campo('Estancia *', `<select name="estancia" required><option value="">Elige…</option>${opcionesSelect(estado.datos.estancias.map(e => [e.id, e.nombre]), d.estancia)}</select>`)}
          ${campo('Zona', entrada('zona', d.zona, 'placeholder="Vestidor, terraza…"'))}
        </div>
        <div class="dos">
          ${campo('Tipo *', `<select name="tipo" required><option value="">Elige…</option>${opcionesSelect(TIPOS, d.tipo)}</select>`)}
          ${campo('Estado', `<select name="estado">${opcionesSelect(ESTADOS_DISP, d.estado)}</select>`)}
        </div>
        ${campo('Qué hace', area('funcion', d.funcion))}
        <div class="dos">
          ${campo('App', `<select name="app">${opcionesSelect(['', ...APPS], d.app)}</select>`)}
          ${campo('Nombre en Alexa', entrada('nombre_alexa', d.nombre_alexa), 'Para saber qué decirle.')}
        </div>
        ${campo('Depende de', `<select name="padre"><option value="">— Nada —</option>${opcionesSelect(padres, d.padre)}</select>`, 'Por ejemplo: un canal depende de su relé.')}
        <fieldset><legend>Datos técnicos</legend>
          <div class="dos">
            ${campo('Conexión', `<select name="protocolo">${opcionesSelect(PROTOCOLOS, d.protocolo)}</select>`)}
            ${campo('Alimentación', `<select name="alimentacion">${opcionesSelect(ALIMENTACION, d.alimentacion)}</select>`)}
            ${campo('Marca', entrada('marca', d.marca))}
            ${campo('Modelo', entrada('modelo', d.modelo))}
            ${campo('Fecha de compra', entrada('fecha_compra', d.fecha_compra, 'type="date"'))}
            ${campo('Consumo (W)', entrada('consumo_w', d.consumo_w, 'inputmode="decimal"'))}
            ${campo('Tipo de pila', entrada('pila', d.pila, 'placeholder="CR2032…"'))}
            ${campo('Último cambio de pila', entrada('ultimo_cambio_pila', d.ultimo_cambio_pila, 'type="date"'))}
          </div>
          ${campo('Enlace de compra', entrada('enlace_compra', d.enlace_compra, 'type="url" placeholder="https://…"'))}
        </fieldset>
        ${campo('Notas', area('notas', d.notas))}
        ${campo('Pendiente de confirmar', area('pendiente', d.pendiente), 'Déjalo vacío si no hay dudas.')}
        <div class="acciones"><button class="boton boton--principal boton--ancho" type="submit">Guardar</button>
          <button class="boton" type="button" data-accion="volver">Cancelar</button></div>
      </form>`;
  }

  function formEscena(id, nuevo) {
    const e = nuevo ? Object.fromEntries(CAMPOS_ESC.map(c => [c, ''])) : idx.esc.get(id);
    if (!e) return '';
    if (nuevo) Object.assign(e, { plataforma: estado.filtros.plataforma, estado: 'Activa' });
    const marcados = new Set(refs(e.dispositivos));
    const selector = estado.datos.estancias.map(est => {
      const lista = estado.datos.dispositivos.filter(d => d.estancia === est.id).sort(porNombre);
      if (!lista.length) return '';
      return `<div data-grupo><h4>${esc(est.nombre)}</h4>${lista.map(d => `
        <label data-texto="${esc(norm(d.nombre + ' ' + est.nombre))}"><input type="checkbox" name="dispositivos" value="${esc(d.id)}"${marcados.has(d.id) ? ' checked' : ''}>
        <span>${esc(d.nombre)}</span></label>`).join('')}</div>`;
    }).join('');
    return `${cabeceraPanel(nuevo ? 'Nueva escena' : `Editar ${e.nombre}`)}
      <form class="formulario" data-form="escena" data-id="${esc(nuevo ? '' : e.id)}">
        ${campo('Nombre *', entrada('nombre', e.nombre, 'required'), 'Igual que en la app de Alexa o Smart Life.')}
        <div class="dos">
          ${campo('Plataforma *', `<select name="plataforma" required>${opcionesSelect(PLATAFORMAS, e.plataforma)}</select>`, 'Si la pasas de Alexa a Smart Life, cámbiala aquí.')}
          ${campo('Estado', `<select name="estado">${opcionesSelect(ESTADOS_ESC, e.estado)}</select>`)}
        </div>
        ${campo('Se activa por', `<select name="disparador">${opcionesSelect(['', ...DISPARADORES], e.disparador)}</select>`)}
        ${campo('Cuándo', entrada('cuando', e.cuando, 'placeholder="Cada día a las 23:45 / Al abrir el armario…"'))}
        ${campo('Solo si (condiciones)', entrada('condiciones', e.condiciones, 'placeholder="De 17:00 a 8:00, de noche…"'))}
        ${campo('Qué hace', area('acciones', e.acciones))}
        ${campo('Frase para Alexa', entrada('frase_voz', e.frase_voz, 'placeholder="Alexa, buenas noches"'), 'Solo si se activa por voz.')}
        <label><span>Dispositivos que usa</span>
          <div class="selector"><input type="search" placeholder="Filtrar…" data-filtrar-selector>${selector}</div></label>
        ${campo('Notas', area('notas', e.notas))}
        ${campo('Pendiente de confirmar', area('pendiente', e.pendiente), 'Déjalo vacío si no hay dudas.')}
        <div class="acciones"><button class="boton boton--principal boton--ancho" type="submit">Guardar</button>
          <button class="boton" type="button" data-accion="volver">Cancelar</button></div>
      </form>`;
  }

  const PANEL_HTML = {
    s: panelEstancia,
    d: panelDispositivo,
    e: panelEscena,
    nd: id => formDispositivo(id, true),
    ed: id => formDispositivo(id, false),
    ne: id => formEscena(id, true),
    ee: id => formEscena(id, false),
  };

  // ------------------------------------------------------------------ Eventos
  document.addEventListener('click', ev => {
    const el = ev.target.closest('[data-accion]');
    if (!el) return;
    const { accion, id, hoja } = el.dataset;
    if (el.tagName === 'A') ev.preventDefault();
    switch (accion) {
      case 'ir-d': return abrir('d', id);
      case 'ir-e': return abrir('e', id);
      case 'ir-s': return abrir('s', id);
      case 'nuevo-d': return abrir('nd', el.dataset.estancia || '');
      case 'nuevo-e': return abrir('ne');
      case 'editar-d': return abrir('ed', id);
      case 'editar-e': return abrir('ee', id);
      case 'volver': return cerrar(false);
      case 'cerrar':
      case 'cerrar-todo': return cerrar(true);
      case 'borrar': estado.confirmarBorrado = true; return render();
      case 'borrar-no': estado.confirmarBorrado = false; return render();
      case 'borrar-si':
        estado.confirmarBorrado = false;
        cerrar(false);
        return borrarRegistro(hoja, id);
      case 'resolver': {
        const x = hoja === 'dispositivos' ? idx.disp.get(id) : idx.esc.get(id);
        if (x) guardarRegistro(hoja, Object.assign({}, x, { pendiente: '' }));
        return;
      }
      case 'plataforma': estado.filtros.plataforma = el.dataset.valor; estado.sucio = true; return render();
      case 'estado-esc': estado.filtros.estadoEsc = el.dataset.valor; estado.sucio = true; return render();
      case 'cifra':
        Object.assign(estado.filtros, { q: '', estancia: '', categoria: '', estadoDisp: el.dataset.estado || '', estadoEsc: '' });
        if (el.dataset.plataforma) estado.filtros.plataforma = el.dataset.plataforma;
        estado.sucio = true;
        location.hash = el.dataset.vista;
        return;
      default:
    }
  });

  document.addEventListener('keydown', ev => {
    if (ev.key === 'Escape' && !$('#panel').hidden) return cerrar(true);
    if ((ev.key === 'Enter' || ev.key === ' ') && ev.target.matches('.sala')) {
      ev.preventDefault();
      abrir('s', ev.target.dataset.id);
    }
  });

  document.addEventListener('input', ev => {
    const el = ev.target;
    if (el.dataset.filtro) {
      estado.filtros[el.dataset.filtro] = el.value;
      const res = $('#resultados');
      if (res) res.innerHTML = ruta().vista === 'escenas' ? listaEscenas() : listaDispositivos();
    } else if (el.matches('[data-filtrar-selector]')) {
      const q = norm(el.value);
      const caja = el.closest('.selector');
      caja.querySelectorAll('label[data-texto]').forEach(l => { l.hidden = !!q && !l.dataset.texto.includes(q); });
      caja.querySelectorAll('[data-grupo]').forEach(g => { g.hidden = !g.querySelector('label:not([hidden])'); });
    }
  });
  document.addEventListener('change', ev => {
    if (ev.target.matches('select[data-filtro]')) ev.target.dispatchEvent(new Event('input', { bubbles: true }));
  });

  document.addEventListener('submit', async ev => {
    const form = ev.target.closest('form[data-form]');
    if (!form) return;
    ev.preventDefault();
    const tipo = form.dataset.form;
    const valores = new FormData(form);

    if (tipo === 'pin') {
      escribirLS(LS.pin, String(valores.get('pin') || '').trim());
      estado.errorPin = '';
      estado.pedirPin = false;
      estado.vistaPintada = '';
      render();
      return cargar();
    }

    const boton = form.querySelector('[type="submit"]');
    boton.disabled = true;
    const hoja = tipo === 'dispositivo' ? 'dispositivos' : 'escenas';
    const campos = hoja === 'dispositivos' ? CAMPOS_DISP : CAMPOS_ESC;
    const anterior = form.dataset.id ? (hoja === 'dispositivos' ? idx.disp.get(form.dataset.id) : idx.esc.get(form.dataset.id)) : null;
    const registro = Object.fromEntries(campos.map(c => [c, anterior ? anterior[c] : '']));
    for (const c of campos) {
      if (c === 'dispositivos') registro[c] = valores.getAll('dispositivos').join(', ');
      else if (valores.has(c)) registro[c] = String(valores.get(c)).trim();
    }
    if (!anterior) {
      const prefijo = hoja === 'escenas' ? (registro.plataforma === 'Alexa' ? 'al-' : 'sl-') : '';
      registro.id = idNuevo(registro.nombre, new Set(estado.datos[hoja].map(x => x.id)), prefijo);
    }
    const ok = await guardarRegistro(hoja, registro);
    boton.disabled = false;
    if (ok) sustituir(hoja === 'dispositivos' ? 'd' : 'e', registro.id);
  });

  $('#estado').addEventListener('click', () => { if (estado.sync !== 'cargando' && estado.sync !== 'guardando') cargar(); });
  window.addEventListener('popstate', () => { estado.confirmarBorrado = false; render(); });
  window.addEventListener('hashchange', render);

  // ------------------------------------------------------------------ Arranque
  function iniciar() {
    if (!MODO_PRUEBA) {
      const cache = leerLS(LS.cache);
      if (cache) {
        estado.datos = normalizar(cache);
        estado.cargado = true;
        indexar();
      }
      if (!pin()) {
        estado.pedirPin = true;
        ponerSync('error');
        render();
        return;
      }
    }
    render();
    cargar();
  }

  iniciar();
})();
