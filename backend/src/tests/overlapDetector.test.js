const { timesOverlap, timeToMinutes } = require('../utils/overlapDetector');

describe('timeToMinutes', () => {
  test('convierte "10:00" a 600', () => expect(timeToMinutes('10:00')).toBe(600));
  test('convierte "10:30" a 630', () => expect(timeToMinutes('10:30')).toBe(630));
  test('convierte "00:00" a 0',   () => expect(timeToMinutes('00:00')).toBe(0));
  test('convierte "23:59" a 1439',() => expect(timeToMinutes('23:59')).toBe(1439));
});

describe('timesOverlap — escenarios del enunciado', () => {
  // Escenario 1: Solapamiento total (nueva dentro de existente)
  test('nueva dentro de existente → conflicto', () => {
    expect(timesOverlap('10:15', '10:45', '10:00', '11:00')).toBe(true);
  });

  // Escenario 2: Solapamiento parcial inicio
  test('nueva empieza antes y termina dentro → conflicto', () => {
    expect(timesOverlap('09:30', '10:30', '10:00', '11:00')).toBe(true);
  });

  // Escenario 3: Solapamiento parcial fin
  test('nueva empieza dentro y termina después → conflicto', () => {
    expect(timesOverlap('10:30', '11:30', '10:00', '11:00')).toBe(true);
  });

  // Escenario 4: Citas consecutivas (NO conflicto)
  test('citas consecutivas exactas → sin conflicto', () => {
    expect(timesOverlap('11:00', '12:00', '10:00', '11:00')).toBe(false);
  });

  // Escenario 6: Nueva envuelve a existente
  test('nueva envuelve a existente → conflicto', () => {
    expect(timesOverlap('09:00', '12:00', '10:00', '11:00')).toBe(true);
  });

  // Extra: misma hora exacta
  test('misma hora exacta → conflicto', () => {
    expect(timesOverlap('10:00', '11:00', '10:00', '11:00')).toBe(true);
  });

  // Extra: sin ningún solapamiento
  test('citas completamente separadas → sin conflicto', () => {
    expect(timesOverlap('08:00', '09:00', '10:00', '11:00')).toBe(false);
  });
});