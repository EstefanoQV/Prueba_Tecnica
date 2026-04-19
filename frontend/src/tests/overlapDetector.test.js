import { describe, test, expect } from 'vitest'

function timeToMinutes(t) {
  const [h, m] = t.split(':').map(Number)
  return h * 60 + m
}

function timesOverlap(s1, e1, s2, e2) {
  return timeToMinutes(s1) < timeToMinutes(e2) &&
         timeToMinutes(e1) > timeToMinutes(s2)
}

describe('Detección de solapamientos', () => {
  test('solapamiento total',           () => expect(timesOverlap('10:15','10:45','10:00','11:00')).toBe(true))
  test('solapamiento parcial inicio',  () => expect(timesOverlap('09:30','10:30','10:00','11:00')).toBe(true))
  test('solapamiento parcial fin',     () => expect(timesOverlap('10:30','11:30','10:00','11:00')).toBe(true))
  test('citas consecutivas OK',        () => expect(timesOverlap('11:00','12:00','10:00','11:00')).toBe(false))
  test('nueva envuelve existente',     () => expect(timesOverlap('09:00','12:00','10:00','11:00')).toBe(true))
  test('sin solapamiento ninguno',     () => expect(timesOverlap('08:00','09:00','10:00','11:00')).toBe(false))
})