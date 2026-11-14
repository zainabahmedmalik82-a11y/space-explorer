import { bodiesMock, datasetsMock } from '../mocks/home'
import type { Body, Dataset } from '../types'
import { respond } from './mockClient'

export const getBodies = () => respond<Body[]>(bodiesMock)
export const getDatasets = () => respond<Dataset[]>(datasetsMock)