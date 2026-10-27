// Plano esquemático de la casa (una planta), en metros, a partir del plano del arquitecto.
// Cambios respecto al original: el baño entre Dormitorio niños y Despacho ya no existe
// (la habitación de los niños es más grande) y no hay puerta de la cocina al Baño niños.
// Arriba del lavadero está el portal de la rampa; a la izquierda, la carretera.
window.PLANO = {
  escala: 56,
  caja: [-1.1, -2.6, 13.3, 16.1], // x, y, ancho, alto (metros)
  salas: [
    {
      id: 'exterior',
      puntos: [[0, -2.4], [12, -2.4], [12, 13.2], [10.2, 13.2], [10.2, 2.85], [6.35, 2.85], [6.35, -0.12], [0, -0.12]],
      etiqueta: [8.6, 1.05],
      extras: [
        { texto: 'Portal rampa', x: 2.6, y: -1.25 },
        { texto: 'Terraza', x: 11.1, y: 8.2, vertical: true },
      ],
    },
    { id: 'lavadero', puntos: rect(0, 0, 4.05, 2.85), etiqueta: [2.02, 1.35] },
    { id: 'entrada', puntos: rect(4.15, 0, 6.25, 2.85), etiqueta: [5.2, 1.35] },
    { id: 'cocina', puntos: rect(0, 2.95, 3.25, 7.35), etiqueta: [1.62, 5.05] },
    { id: 'bano-ninos', puntos: rect(0, 7.45, 3.25, 9.05), etiqueta: [1.62, 8.15] },
    {
      id: 'pasillo',
      puntos: [[3.35, 2.95], [4.55, 2.95], [4.55, 10.15], [1.4, 10.15], [1.4, 9.15], [3.35, 9.15]],
      etiqueta: [3.95, 6.0],
      vertical: true,
    },
    { id: 'salon', puntos: rect(4.65, 2.95, 10.03, 8.6), etiqueta: [7.34, 5.65] },
    {
      id: 'dormitorio-ninos',
      puntos: [[0, 9.15], [1.3, 9.15], [1.3, 10.25], [3.35, 10.25], [3.35, 13.2], [0, 13.2]],
      etiqueta: [1.68, 11.6],
    },
    { id: 'despacho', puntos: rect(3.45, 10.25, 5.6, 13.2), etiqueta: [4.52, 11.6] },
    {
      id: 'dormitorio-avis',
      puntos: [[4.65, 8.7], [10.03, 8.7], [10.03, 11.0], [7.7, 11.0], [7.7, 13.2], [5.7, 13.2], [5.7, 10.15], [4.65, 10.15]],
      etiqueta: [7.6, 9.75],
    },
    { id: 'bano-avis', puntos: rect(7.8, 11.1, 10.03, 13.2), etiqueta: [8.92, 11.95] },
  ],
  notas: [
    { texto: 'Carretera', x: -0.55, y: 6.5, vertical: true },
  ],
};

function rect(x1, y1, x2, y2) {
  return [[x1, y1], [x2, y1], [x2, y2], [x1, y2]];
}
