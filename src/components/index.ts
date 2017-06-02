import * as D3 from 'd3'

export type D3BaseElement = D3.BaseType
export type D3BaseSelection = D3.Selection<D3BaseElement, any, any, any>
export type D3Selection<D> = D3.Selection<D3BaseElement, D, any, any>
export type D3Element<T> = D3.Selection<D3BaseElement, T, any, any>

export type RefreshHandler = (rect: ClientRect) => void
export type ReloadHandler = () => void

export * from './component-base'
export * from './graph'
