import type { Body, Dataset } from '../types'

export const bodiesMock: Body[] = [
  { id: 'mars', name: 'Mars', missionCount: 8 },
  { id: 'moon', name: 'Moon', missionCount: 6 },
]

export const datasetsMock: Dataset[] = [
  { id: 'ds-01', name: 'Lunar elevation tiles', source: 'NASA LRO', updated: '2026-11-10' },
  { id: 'ds-02', name: 'Sun and Earth ephemeris kernels', source: 'NASA NAIF SPICE', updated: '2026-11-09' },
  { id: 'ds-03', name: 'Lunar imagery index', source: 'NASA LROC', updated: '2026-11-06' },
  { id: 'ds-04', name: 'Mission status feed', source: 'NASA PDS', updated: '2026-11-12' },
]