import {
  DetailedError,
  SerializedCircuitStep,
  SerializedHGate,
  SerializedMeasurementGate,
  SerializedPhaseGate,
  SerializedRnotGate,
  SerializedRxGate,
  SerializedRyGate,
  SerializedRzGate,
  SerializedSwapGate,
  SerializedTGate,
  SerializedXGate,
  SerializedYGate,
  SerializedZGate,
  Util,
  describe
} from '@qni/common'
import {
  Operation,
  isControlGateElement,
  isHGateElement,
  isOperation,
  isPhaseGateElement,
  isRnotGateElement,
  isRxGateElement,
  isRyGateElement,
  isRzGateElement,
  isSwapGateElement,
  isTGateElement,
  isXGateElement,
  isYGateElement,
  isZGateElement
} from './operation'
import {attr, controller} from '@github/catalyst'
import {createMachine, interpret} from 'xstate'
import {html, render} from '@github/jtml'
import {BlochDisplayElement} from './bloch-display-element'
import {CircuitBlockElement} from './circuit-block-element'
import {CircuitDropzoneElement} from './circuit-dropzone-element'
import {ControlGateElement} from './control-gate-element'
import {HGateElement} from './h-gate-element'
import {MeasurementGateElement} from './measurement-gate-element'
import {PhaseGateElement} from './phase-gate-element'
import {RnotGateElement} from './rnot-gate-element'
import {RxGateElement} from './rx-gate-element'
import {RyGateElement} from './ry-gate-element'
import {RzGateElement} from './rz-gate-element'
import {SwapGateElement} from './swap-gate-element'
import {TGateElement} from './t-gate-element'
import {WriteGateElement} from './write-gate-element'
import {XGateElement} from './x-gate-element'
import {YGateElement} from './y-gate-element'
import {ZGateElement} from './z-gate-element'
import {isControllable} from './mixin/controllable'

export const isCircuitStepElement = (arg: unknown): arg is CircuitStepElement =>
  arg !== undefined && arg !== null && arg instanceof CircuitStepElement

type ConnectionProps = {
  // Controlled-H
  disableCh: boolean
  maxChControlGates: number
  maxChTargetGates: number
  // Controlled-NOT
  disableCnot: boolean
  maxCnotControlGates: number
  maxCnotTargetGates: number
  // Controlled-Y
  disableCy: boolean
  maxCyControlGates: number
  maxCyTargetGates: number
  // Controlled-Z
  disableCz: boolean
  maxCzControlGates: number
  maxCzTargetGates: number
  // Controlled-Phase
  disableCphase: boolean
  maxCphaseControlGates: number
  maxCphaseTargetGates: number
  // Controlled-T
  disableCt: boolean
  maxCtControlGates: number
  maxCtTargetGates: number
  // Controlled-√X
  disableCrnot: boolean
  maxCrnotControlGates: number
  maxCrnotTargetGates: number
  // Controlled-Rx
  disableCrx: boolean
  maxCrxControlGates: number
  maxCrxTargetGates: number
  // Controlled-Ry
  disableCry: boolean
  maxCryControlGates: number
  maxCryTargetGates: number
  // Controlled-Rz
  disableCrz: boolean
  maxCrzControlGates: number
  maxCrzTargetGates: number
  // Controlled-Swap
  disableCswap: boolean
  maxCswapControlGates: number
  // Swap
  disableSwap: boolean
  // CZ
  disableControlControl: boolean
  maxControlControlTargetGates: number
  // CPHASE
  disablePhasePhase: boolean
  maxPhasePhaseTargetGates: number
}

const groupBy = <K, V>(
  array: readonly V[],
  getKey: (current: V, index: number, orig: readonly V[]) => K
): Array<[K, V[]]> =>
  Array.from(
    array.reduce((map, current, index, orig) => {
      const key = getKey(current, index, orig)
      const list = map.get(key)
      if (list) {
        list.push(current)
      } else {
        map.set(key, [current])
      }
      return map
    }, new Map<K, V[]>())
  )

type CircuitStepContext = Record<string, never>
type CircuitStepEvent =
  | {type: 'ACTIVATE'}
  | {type: 'DEACTIVATE'}
  | {type: 'SET_BREAKPOINT'}
  | {type: 'UNSET_BREAKPOINT'}
  | {type: 'SNAP_DROPZONE'; dropzone: CircuitDropzoneElement}
  | {type: 'UNSNAP_DROPZONE'; dropzone: CircuitDropzoneElement}
  | {type: 'DELETE_OPERATION'; dropzone: CircuitDropzoneElement}
  | {type: 'OCCUPY_DROPZONE'; dropzone: CircuitDropzoneElement}
  | {type: 'UNSHADOW'}

export class CircuitStepElement extends HTMLElement {
  @attr active = false
  @attr breakpoint = false
  @attr shadow = false
  @attr keep = false
  @attr debug = false

  private circuitStepMachine = createMachine<CircuitStepContext, CircuitStepEvent>(
    {
      id: 'circuit-step',
      initial: 'unknown',
      states: {
        unknown: {
          always: [
            {target: 'shadow', cond: 'isShadow'},
            {target: 'visible', cond: 'isVisible'}
          ]
        },
        shadow: {
          type: 'compound',
          initial: 'unknown',
          on: {
            SNAP_DROPZONE: {
              target: 'shadow',
              actions: ['setOperationBit', 'dispatchSnapEvent']
            },
            UNSNAP_DROPZONE: {
              target: 'shadow',
              actions: ['dispatchUnsnapEvent']
            },
            UNSHADOW: {
              target: 'visible',
              actions: ['unshadow']
            }
          },
          states: {
            unknown: {
              always: [
                {target: 'inactive', cond: 'isInactive'},
                {target: 'active', cond: 'isActive'}
              ]
            },
            inactive: {
              on: {
                ACTIVATE: {
                  target: 'active'
                }
              }
            },
            active: {
              on: {
                DEACTIVATE: {
                  target: 'inactive'
                }
              }
            }
          }
        },
        visible: {
          type: 'parallel',
          on: {
            SNAP_DROPZONE: {
              target: 'visible',
              actions: ['setOperationBit', 'dispatchSnapEvent']
            },
            UNSNAP_DROPZONE: {
              target: 'visible',
              actions: ['dispatchUnsnapEvent']
            },
            OCCUPY_DROPZONE: {
              target: 'visible',
              actions: ['setOperationBit']
            },
            DELETE_OPERATION: {
              target: 'visible',
              actions: ['dispatchDeleteOperationEvent']
            }
          },
          states: {
            activatable: {
              type: 'compound',
              initial: 'unknown',
              states: {
                unknown: {
                  always: [
                    {target: 'inactive', cond: 'isInactive'},
                    {target: 'active', cond: 'isActive'}
                  ]
                },
                inactive: {
                  on: {
                    ACTIVATE: {
                      target: 'active'
                    }
                  }
                },
                active: {
                  on: {
                    DEACTIVATE: {
                      target: 'inactive'
                    }
                  }
                }
              }
            },
            breakpointable: {
              type: 'compound',
              initial: 'unknown',
              states: {
                unknown: {
                  always: [
                    {target: 'breakpointOn', cond: 'isBreakpointOn'},
                    {target: 'breakpointOff', cond: 'isBreakpointOff'}
                  ]
                },
                breakpointOn: {
                  on: {
                    UNSET_BREAKPOINT: {
                      target: 'breakpointOff'
                    }
                  }
                },
                breakpointOff: {
                  on: {
                    SET_BREAKPOINT: {
                      target: 'breakpointOn'
                    }
                  }
                }
              }
            }
          }
        }
      }
    },
    {
      actions: {
        setOperationBit: (_context, event) => {
          if (event.type !== 'SNAP_DROPZONE' && event.type !== 'OCCUPY_DROPZONE') return

          const dropzone = event.dropzone
          const bit = this.bit(dropzone)
          Util.notNull(dropzone.operation)

          dropzone.operation.bit = bit
        },
        dispatchSnapEvent: (_context, event) => {
          if (event.type !== 'SNAP_DROPZONE') return

          this.dispatchEvent(
            new CustomEvent('circuit-step-snap', {
              detail: {dropzone: event.dropzone},
              bubbles: true
            })
          )
        },
        dispatchUnsnapEvent: (_context, event) => {
          if (event.type !== 'UNSNAP_DROPZONE') return

          this.dispatchEvent(
            new CustomEvent('circuit-step-unsnap', {
              detail: {dropzone: event.dropzone},
              bubbles: true
            })
          )
        },
        dispatchDeleteOperationEvent: (_context, event) => {
          if (event.type !== 'DELETE_OPERATION') return

          this.dispatchEvent(
            new CustomEvent('circuit-step-delete-operation', {
              detail: {dropzone: event.dropzone},
              bubbles: true
            })
          )
        },
        unshadow: () => {
          this.shadow = false
        }
      },
      guards: {
        isShadow: () => {
          return this.shadow
        },
        isVisible: () => {
          return !this.shadow
        },
        isActive: () => {
          return this.active
        },
        isInactive: () => {
          return !this.active
        },
        isBreakpointOn: () => {
          return this.breakpoint
        },
        isBreakpointOff: () => {
          return !this.breakpoint
        }
      }
    }
  )
  private circuitStepService = interpret(this.circuitStepMachine).onTransition(state => {
    if (this.debug) {
      // eslint-disable-next-line no-console
      console.log(`circuit-step: ${describe(state.value)}`)
    }
  })

  get wireCount(): number {
    return this.dropzones.length
  }

  get isInBlock(): boolean {
    if (this.closest('circuit-block') === null) {
      return false
    }
    return true
  }

  get block(): CircuitBlockElement {
    const block = this.closest('circuit-block') as CircuitBlockElement

    return block!
  }

  connectedCallback(): void {
    this.circuitStepService.start()

    this.addEventListener('mouseenter', this.dispatchMouseenterEvent)
    this.addEventListener('mouseleave', this.dispatchMouseleaveEvent)
    this.addEventListener('click', this.maybeDispatchClickEvent)
    this.addEventListener('circuit-dropzone-snap', this.snapDropzone)
    this.addEventListener('circuit-dropzone-unsnap', this.unsnapDropzone)
    this.addEventListener('circuit-dropzone-operation-delete', this.deleteOperation)
    this.addEventListener('circuit-dropzone-drop', this.unshadow)
    this.addEventListener('circuit-dropzone-occupy', this.occupyDropzone)

    this.attachShadow({mode: 'open'})
    this.updateOperationAttributes()
    this.update()
  }

  attributeChangedCallback(name: string, oldValue: string | null, newValue: string | null): void {
    if (oldValue === newValue) return

    if (name === 'data-active') {
      if (newValue !== null) {
        this.circuitStepService.send({type: 'ACTIVATE'})
      } else {
        this.circuitStepService.send({type: 'DEACTIVATE'})
      }
    }

    if (name === 'data-breakpoint') {
      if (newValue !== null) {
        this.circuitStepService.send({type: 'SET_BREAKPOINT'})
      } else {
        this.circuitStepService.send({type: 'UNSET_BREAKPOINT'})
      }
    }

    if (name === 'data-shadow') {
      for (const each of this.dropzones) {
        if (newValue !== null) {
          each.shadow = true
        } else {
          each.shadow = false
        }
      }
    }
  }

  update(): void {
    render(html`<slot></slot>`, this.shadowRoot!)
    this.dispatchUpdateEvent()
  }

  updateOperationAttributes(connectionProps?: ConnectionProps): void {
    for (const each of this.dropzones) {
      each.connectTop = false
      each.connectBottom = false
    }

    const controlDropzones = this.controlGateDropzones
    const controllableDropzones = this.controllableDropzones(connectionProps)
    for (const each of controllableDropzones) {
      if (isControllable(each.operation)) each.operation.controls = []
    }

    this.updateSwapConnections(connectionProps)
    this.updatePhasePhaseConnections(connectionProps)

    if (controlDropzones.length === 0) return
    if (controlDropzones.length === 1 && controllableDropzones.length === 0) {
      const controlGate = controlDropzones[0].operation as ControlGateElement
      controlGate.disable()
      return
    }

    if (controllableDropzones.length === 0) {
      this.updateControlControlConnections(connectionProps)
    } else {
      this.updateControlledUConnections(connectionProps)
    }

    this.updateFreeDropzoneConnections(connectionProps)
  }

  private updateSwapConnections(connectionProps?: ConnectionProps): void {
    const disableSwap = connectionProps?.disableSwap
    const swapDropzones = this.swapGateDropzones

    if (swapDropzones.length !== 2 || disableSwap) {
      for (const each of swapDropzones) {
        const swapGate = each.operation as SwapGateElement
        swapGate.disable()
      }
    } else {
      for (const swap of swapDropzones) {
        const swapGate = swap.operation as SwapGateElement
        swapGate.enable()
        swap.connectTop = swapDropzones.some(each => this.bit(each) < this.bit(swap))
        swap.connectBottom = swapDropzones.some(each => this.bit(each) > this.bit(swap))
      }

      const swapBits = swapDropzones.map(each => this.bit(each))
      for (const dropzone of this.freeDropzones) {
        const minBit = Math.min(...swapBits)
        const maxBit = Math.max(...swapBits)
        if (minBit < this.bit(dropzone) && this.bit(dropzone) < maxBit) {
          dropzone.connectTop = true
          dropzone.connectBottom = true
        }
      }
    }
  }

  private updatePhasePhaseConnections(connectionProps?: ConnectionProps): void {
    if (connectionProps?.disablePhasePhase) return

    const phaseDropzones = this.phaseGateDropzones

    for (const phaseDropzone of phaseDropzones) {
      const phaseGate = phaseDropzone.operation as PhaseGateElement
      if (phaseGate.angle === '') continue
      if (connectionProps !== undefined && connectionProps.maxPhasePhaseTargetGates === 1) continue

      let sameAnglePhaseBits = phaseDropzones
        .filter(each => {
          if (!isPhaseGateElement(each.operation)) throw new Error(`${each.operation} isn't a phase-gate element.`)
          return phaseGate.angle === each.operation.angle
        })
        .map(each => this.bit(each))
      if (connectionProps !== undefined && connectionProps.maxPhasePhaseTargetGates > 1) {
        sameAnglePhaseBits = sameAnglePhaseBits.slice(0, connectionProps.maxPhasePhaseTargetGates)
      }

      if (!sameAnglePhaseBits.includes(this.bit(phaseDropzone))) continue

      phaseDropzone.connectTop = sameAnglePhaseBits.some(each => each < this.bit(phaseDropzone))
      phaseDropzone.connectBottom = sameAnglePhaseBits.some(each => each > this.bit(phaseDropzone))
    }

    for (const dropzone of this.freeDropzones) {
      const controlledPhaseDropzones = this.phaseGateDropzones.filter(each => each.connectTop || each.connectBottom)
      const controlledBits = controlledPhaseDropzones.map(each => this.bit(each))
      const minBit = Math.min(...controlledBits)
      const maxBit = Math.max(...controlledBits)

      if (minBit < this.bit(dropzone) && this.bit(dropzone) < maxBit) {
        dropzone.connectTop = true
        dropzone.connectBottom = true
      }
    }
  }

  private updateControlControlConnections(connectionProps?: ConnectionProps): void {
    const controlGateDropzones = this.controlGateDropzones
    let controlBits = controlGateDropzones.map(each => this.bit(each))
    let numControl = 0

    if (connectionProps !== undefined) {
      if (connectionProps.maxControlControlTargetGates === 1) {
        controlBits = []
      } else if (connectionProps.maxControlControlTargetGates > 1) {
        controlBits = controlBits.slice(0, connectionProps.maxControlControlTargetGates)
      }
    }

    for (const each of controlGateDropzones) {
      numControl += 1

      const controlGate = each.operation as ControlGateElement

      if (connectionProps?.disableControlControl) {
        controlGate.disable()
      } else if (
        connectionProps !== undefined &&
        (connectionProps.maxControlControlTargetGates === 1 ||
          (connectionProps.maxControlControlTargetGates > 0 &&
            numControl > connectionProps.maxControlControlTargetGates))
      ) {
        controlGate.disable()
      } else {
        controlGate.enable()
        each.connectTop = controlBits.some(other => {
          return this.bit(each) > other
        })
        each.connectBottom = controlBits.some(other => {
          return this.bit(each) < other
        })
      }
    }
  }

  private updateControlledUConnections(connectionProps?: ConnectionProps): void {
    const controllableDropzones = this.controllableDropzones(connectionProps)
    const controlDropzones = this.controlGateDropzones
    const controllableOperationNames = [...new Set(controllableDropzones.map(each => each.operationName))]
    const numControlDropzones = this.numControlGateDropzones(connectionProps, controllableOperationNames)
    const allControlBits = controlDropzones.map(dz => this.bit(dz))
    const activeControlBits =
      numControlDropzones === null ? allControlBits : allControlBits.slice(0, numControlDropzones)
    const controllableBits = controllableDropzones.map(dz => this.bit(dz))
    const activeperationBits = activeControlBits.concat(controllableBits)

    for (const [i, each] of Object.entries(controlDropzones)) {
      const controlGate = each.operation as ControlGateElement

      each.connectBottom = activeperationBits.some(other => {
        return this.bit(each) < other
      })
      each.connectTop = activeperationBits.some(other => {
        return this.bit(each) > other
      })

      if (numControlDropzones === null || (numControlDropzones !== null && parseInt(i) < numControlDropzones)) {
        controlGate.enable()
      } else {
        each.connectTop = Math.max(...activeperationBits) > this.bit(each)
        controlGate.disable()
      }
    }

    for (const each of controllableDropzones) {
      if (!isControllable(each.operation)) throw new Error(`${each.operation} isn't controllable.`)

      each.operation.controls = this.controlBits(each, allControlBits, connectionProps)
      each.connectTop = activeperationBits.some(other => {
        return other < this.bit(each)
      })
      each.connectBottom = activeperationBits.some(other => {
        return other > this.bit(each)
      })
    }
  }

  private updateFreeDropzoneConnections(connectionProps?: ConnectionProps): void {
    const controllableDropzones = this.controllableDropzones(connectionProps)
    const activeControlBits = this.controlGateDropzones
      .filter(each => isControlGateElement(each.operation) && !each.operation.disabled)
      .map(each => this.bit(each))
    const controllableBits = controllableDropzones.map(dz => this.bit(dz))
    const activeOperationBits = activeControlBits.concat(controllableBits)

    const minBit = Math.min(...activeOperationBits)
    const maxBit = Math.max(...activeOperationBits)

    for (const each of this.freeDropzones) {
      if (minBit < this.bit(each) && this.bit(each) < maxBit) {
        each.connectTop = true
        each.connectBottom = true
      }
    }
  }

  private controlBits(
    dropzone: CircuitDropzoneElement,
    allControlBits: number[],
    connectionProps?: ConnectionProps
  ): number[] {
    let bits = allControlBits

    if (connectionProps) {
      if (connectionProps.maxChControlGates > 0 && dropzone.operationName === 'h-gate') {
        bits = allControlBits.slice(0, connectionProps.maxChControlGates)
      } else if (connectionProps.maxCnotControlGates > 0 && dropzone.operationName === 'x-gate') {
        bits = allControlBits.slice(0, connectionProps.maxCnotControlGates)
      } else if (connectionProps.maxCyControlGates > 0 && dropzone.operationName === 'y-gate') {
        bits = allControlBits.slice(0, connectionProps.maxCyControlGates)
      } else if (connectionProps.maxCzControlGates > 0 && dropzone.operationName === 'z-gate') {
        bits = allControlBits.slice(0, connectionProps.maxCzControlGates)
      } else if (connectionProps.maxCphaseControlGates > 0 && dropzone.operationName === 'phase-gate') {
        bits = allControlBits.slice(0, connectionProps.maxCphaseControlGates)
      } else if (connectionProps.maxCtControlGates > 0 && dropzone.operationName === 't-gate') {
        bits = allControlBits.slice(0, connectionProps.maxCtControlGates)
      } else if (connectionProps.maxCrnotControlGates > 0 && dropzone.operationName === 'rnot-gate') {
        bits = allControlBits.slice(0, connectionProps.maxCrnotControlGates)
      } else if (connectionProps.maxCrxControlGates > 0 && dropzone.operationName === 'rx-gate') {
        bits = allControlBits.slice(0, connectionProps.maxCrxControlGates)
      } else if (connectionProps.maxCryControlGates > 0 && dropzone.operationName === 'ry-gate') {
        bits = allControlBits.slice(0, connectionProps.maxCryControlGates)
      } else if (connectionProps.maxCrzControlGates > 0 && dropzone.operationName === 'rz-gate') {
        bits = allControlBits.slice(0, connectionProps.maxCrzControlGates)
      } else if (connectionProps.maxCswapControlGates > 0 && dropzone.operationName === 'swap-gate') {
        bits = allControlBits.slice(0, connectionProps.maxCswapControlGates)
      }
    }

    return bits
  }

  bit(dropzone: CircuitDropzoneElement): number {
    const bit = this.dropzones.indexOf(dropzone)
    Util.need(bit !== -1, 'circuit-dropzone not found.')

    return bit
  }

  get isEmpty(): boolean {
    if (this.keep) return false
    return this.dropzones.every(each => !each.occupied)
  }

  dropzoneAt(dropzoneIndex: number): CircuitDropzoneElement {
    const dropzone = this.dropzones[dropzoneIndex]
    Util.notNull(dropzone)

    return dropzone
  }

  get dropzones(): CircuitDropzoneElement[] {
    return Array.from(this.querySelectorAll('circuit-dropzone')) as CircuitDropzoneElement[]
  }

  get freeDropzones(): CircuitDropzoneElement[] {
    return this.dropzones.filter(each => !each.occupied)
  }

  get lastDropzone(): CircuitDropzoneElement {
    return this.dropzones[this.wireCount - 1]
  }

  appendDropzone(): CircuitDropzoneElement {
    const dropzone = new CircuitDropzoneElement()
    dropzone.shadow = this.shadow
    this.append(dropzone)
    return dropzone
  }

  appendOperation(operation: Operation): void {
    const dropzone = new CircuitDropzoneElement()
    this.append(dropzone)
    dropzone.put(operation)
  }

  private get swapGateDropzones(): CircuitDropzoneElement[] {
    return this.dropzones.filter(each => each.occupied).filter(each => each.operationName === 'swap-gate')
  }

  private get phaseGateDropzones(): CircuitDropzoneElement[] {
    return this.dropzones.filter(each => each.occupied).filter(each => each.operationName === 'phase-gate')
  }

  private get controlGateDropzones(): CircuitDropzoneElement[] {
    return this.dropzones.filter(each => each.occupied && isControlGateElement(each.operation))
  }

  private numControlGateDropzones(
    props: ConnectionProps | undefined,
    controllableOperationNames: string[]
  ): number | null {
    if (props === undefined) return null

    let ndropzones = 0
    if (controllableOperationNames.includes('h-gate') && !props.disableCh && props.maxChControlGates > ndropzones) {
      ndropzones = props.maxChControlGates
    }
    if (controllableOperationNames.includes('x-gate') && !props.disableCnot && props.maxCnotControlGates > ndropzones) {
      ndropzones = props.maxCnotControlGates
    }
    if (controllableOperationNames.includes('y-gate') && !props.disableCy && props.maxCyControlGates > ndropzones) {
      ndropzones = props.maxCyControlGates
    }
    if (controllableOperationNames.includes('z-gate') && !props.disableCz && props.maxCzControlGates > ndropzones) {
      ndropzones = props.maxCzControlGates
    }
    if (
      controllableOperationNames.includes('phase-gate') &&
      !props.disableCphase &&
      props.maxCphaseControlGates > ndropzones
    ) {
      ndropzones = props.maxCphaseControlGates
    }
    if (controllableOperationNames.includes('t-gate') && !props.disableCt && props.maxCtControlGates > ndropzones) {
      ndropzones = props.maxCtControlGates
    }
    if (
      controllableOperationNames.includes('rnot-gate') &&
      !props.disableCrnot &&
      props.maxCrnotControlGates > ndropzones
    ) {
      ndropzones = props.maxCrnotControlGates
    }
    if (controllableOperationNames.includes('rx-gate') && !props.disableCrx && props.maxCrxControlGates > ndropzones) {
      ndropzones = props.maxCrxControlGates
    }
    if (controllableOperationNames.includes('ry-gate') && !props.disableCry && props.maxCryControlGates > ndropzones) {
      ndropzones = props.maxCryControlGates
    }
    if (controllableOperationNames.includes('rz-gate') && !props.disableCrz && props.maxCrzControlGates > ndropzones) {
      ndropzones = props.maxCrzControlGates
    }
    if (
      controllableOperationNames.includes('swap-gate') &&
      !props.disableCswap &&
      props.maxCswapControlGates > ndropzones
    ) {
      ndropzones = props.maxCswapControlGates
    }

    if (ndropzones === 0) return null
    return ndropzones
  }

  private controllableDropzones(connectionProps: ConnectionProps | undefined): CircuitDropzoneElement[] {
    let numH = 0
    let numX = 0
    let numY = 0
    let numZ = 0
    let numPhase = 0
    let numT = 0
    let numRnot = 0
    let numRx = 0
    let numRy = 0
    let numRz = 0

    return this.dropzones
      .filter(each => each.occupied)
      .filter(each => isControllable(each.operation))
      .filter(each => {
        if (connectionProps === undefined) return true

        if (isHGateElement(each.operation)) {
          numH += 1
          if (connectionProps.maxChTargetGates !== 0 && numH > connectionProps.maxChTargetGates) {
            return false
          }
          return !connectionProps.disableCh
        }
        if (isXGateElement(each.operation)) {
          numX += 1
          if (connectionProps.maxCnotTargetGates !== 0 && numX > connectionProps.maxCnotTargetGates) {
            return false
          }
          return !connectionProps.disableCnot
        }
        if (isYGateElement(each.operation)) {
          numY += 1
          if (connectionProps.maxCyTargetGates !== 0 && numY > connectionProps.maxCyTargetGates) {
            return false
          }
          return !connectionProps.disableCy
        }
        if (isZGateElement(each.operation)) {
          numZ += 1
          if (connectionProps.maxCzTargetGates !== 0 && numZ > connectionProps.maxCzTargetGates) {
            return false
          }
          return !connectionProps.disableCz
        }
        if (isPhaseGateElement(each.operation)) {
          numPhase += 1
          if (connectionProps.maxCphaseTargetGates !== 0 && numPhase > connectionProps.maxCphaseTargetGates) {
            return false
          }
          return !connectionProps.disableCphase
        }
        if (isTGateElement(each.operation)) {
          numT += 1
          if (connectionProps.maxCtTargetGates !== 0 && numT > connectionProps.maxCtTargetGates) {
            return false
          }
          return !connectionProps.disableCt
        }
        if (isRnotGateElement(each.operation)) {
          numRnot += 1
          if (connectionProps.maxCrnotTargetGates !== 0 && numRnot > connectionProps.maxCrnotTargetGates) {
            return false
          }
          return !connectionProps.disableCrnot
        }
        if (isRxGateElement(each.operation)) {
          numRx += 1
          if (connectionProps.maxCrxTargetGates !== 0 && numRx > connectionProps.maxCrxTargetGates) {
            return false
          }
          return !connectionProps.disableCrx
        }
        if (isRyGateElement(each.operation)) {
          numRy += 1
          if (connectionProps.maxCryTargetGates !== 0 && numRy > connectionProps.maxCryTargetGates) {
            return false
          }
          return !connectionProps.disableCry
        }
        if (isRzGateElement(each.operation)) {
          numRz += 1
          if (connectionProps.maxCrzTargetGates !== 0 && numRz > connectionProps.maxCrzTargetGates) {
            return false
          }
          return !connectionProps.disableCrz
        }
        if (isSwapGateElement(each.operation)) return !connectionProps.disableCswap

        return true
      })
  }

  private dispatchUpdateEvent(): void {
    this.dispatchEvent(new Event('circuit-step-update', {bubbles: true}))
  }

  private deleteOperation(event: Event): void {
    const dropzone = event.target as CircuitDropzoneElement
    this.circuitStepService.send({type: 'DELETE_OPERATION', dropzone})
  }

  private dispatchMouseenterEvent(): void {
    this.dispatchEvent(new Event('circuit-step-mouseenter', {bubbles: true}))
  }

  private dispatchMouseleaveEvent(): void {
    this.dispatchEvent(new Event('circuit-step-mouseleave', {bubbles: true}))
  }

  private maybeDispatchClickEvent(event: MouseEvent): void {
    if (isOperation(event.target)) return

    this.dispatchEvent(new Event('circuit-step-click', {bubbles: true}))
  }

  private snapDropzone(event: Event): void {
    const dropzone = event.target as CircuitDropzoneElement
    this.circuitStepService.send({type: 'SNAP_DROPZONE', dropzone})
  }

  private unsnapDropzone(event: Event): void {
    const dropzone = event.target as CircuitDropzoneElement
    this.circuitStepService.send({type: 'UNSNAP_DROPZONE', dropzone})
  }

  private unshadow(): void {
    this.circuitStepService.send({type: 'UNSHADOW'})
  }

  private occupyDropzone(event: Event): void {
    const dropzone = event.target as CircuitDropzoneElement
    this.circuitStepService.send({type: 'OCCUPY_DROPZONE', dropzone})
  }

  serialize(): SerializedCircuitStep {
    const serializedStep: SerializedCircuitStep = []

    for (const [klass, sameOps] of groupBy(this.operations, op => op.constructor)) {
      switch (klass) {
        case HGateElement: {
          const hGates = sameOps as HGateElement[]
          for (const [ifStr, sameIfGates] of groupBy(hGates, gate => gate.if)) {
            for (const [controlsStr, sameControlGates] of groupBy(sameIfGates, gate => gate.controls.toString())) {
              const gate0 = sameControlGates[0]
              const opType = gate0.operationType
              const targets = sameControlGates.map(each => each.bit)
              const serializedGate: SerializedHGate = {type: opType, targets}
              if (ifStr !== '') serializedGate.if = ifStr
              if (controlsStr !== '') serializedGate.controls = gate0.controls
              serializedStep.push(serializedGate)
            }
          }
          break
        }
        case XGateElement: {
          const xGates = sameOps as XGateElement[]
          for (const [ifStr, sameIfGates] of groupBy(xGates, gate => gate.if)) {
            for (const [controlsStr, sameControlGates] of groupBy(sameIfGates, gate => gate.controls.toString())) {
              const gate0 = sameControlGates[0]
              const opType = gate0.operationType
              const targets = sameControlGates.map(each => each.bit)
              const serializedGate: SerializedXGate = {type: opType, targets}
              if (ifStr !== '') serializedGate.if = ifStr
              if (controlsStr !== '') serializedGate.controls = gate0.controls
              serializedStep.push(serializedGate)
            }
          }
          break
        }
        case YGateElement: {
          const yGates = sameOps as YGateElement[]
          for (const [ifStr, sameIfGates] of groupBy(yGates, gate => gate.if)) {
            for (const [controlsStr, sameControlGates] of groupBy(sameIfGates, gate => gate.controls.toString())) {
              const gate0 = sameControlGates[0]
              const opType = gate0.operationType
              const targets = sameControlGates.map(each => each.bit)
              const serializedGate: SerializedYGate = {type: opType, targets}
              if (ifStr !== '') serializedGate.if = ifStr
              if (controlsStr !== '') serializedGate.controls = gate0.controls
              serializedStep.push(serializedGate)
            }
          }
          break
        }
        case ZGateElement: {
          const zGates = sameOps as ZGateElement[]
          for (const [ifStr, sameIfGates] of groupBy(zGates, gate => gate.if)) {
            for (const [controlsStr, sameControlGates] of groupBy(sameIfGates, gate => gate.controls.toString())) {
              const gate0 = sameControlGates[0]
              const opType = gate0.operationType
              const targets = sameControlGates.map(each => each.bit)
              const serializedGate: SerializedZGate = {type: opType, targets}
              if (ifStr !== '') serializedGate.if = ifStr
              if (controlsStr !== '') serializedGate.controls = gate0.controls
              serializedStep.push(serializedGate)
            }
          }
          break
        }
        case PhaseGateElement: {
          const phaseGates = sameOps as PhaseGateElement[]
          for (const [angle, sameAngleGates] of groupBy(phaseGates, gate => gate.angle)) {
            for (const [ifStr, sameIfGates] of groupBy(sameAngleGates, gate => gate.if)) {
              for (const [controlsStr, sameControlGates] of groupBy(sameIfGates, gate => gate.controls.toString())) {
                const gate0 = sameControlGates[0]
                const opType = gate0.operationType
                const targets = sameControlGates.map(each => each.bit)
                const serializedGate: SerializedPhaseGate = {type: opType, targets}
                if (ifStr !== '') serializedGate.if = ifStr
                if (angle !== '') serializedGate.angle = angle
                if (controlsStr !== '') serializedGate.controls = gate0.controls
                serializedStep.push(serializedGate)
              }
            }
          }
          break
        }
        case TGateElement: {
          const tGates = sameOps as TGateElement[]
          for (const [ifStr, sameIfGates] of groupBy(tGates, gate => gate.if)) {
            for (const [controlsStr, sameControlGates] of groupBy(sameIfGates, gate => gate.controls.toString())) {
              const gate0 = sameControlGates[0]
              const opType = gate0.operationType
              const targets = sameControlGates.map(each => each.bit)
              const serializedGate: SerializedTGate = {type: opType, targets}
              if (ifStr !== '') serializedGate.if = ifStr
              if (controlsStr !== '') serializedGate.controls = gate0.controls
              serializedStep.push(serializedGate)
            }
          }
          break
        }
        case RnotGateElement: {
          const rnotGates = sameOps as RnotGateElement[]
          for (const [ifStr, sameIfGates] of groupBy(rnotGates, gate => gate.if)) {
            for (const [controlsStr, sameControlGates] of groupBy(sameIfGates, gate => gate.controls.toString())) {
              const gate0 = sameControlGates[0]
              const opType = gate0.operationType
              const targets = sameControlGates.map(each => each.bit)
              const serializedGate: SerializedRnotGate = {type: opType, targets}
              if (ifStr !== '') serializedGate.if = ifStr
              if (controlsStr !== '') serializedGate.controls = gate0.controls
              serializedStep.push(serializedGate)
            }
          }
          break
        }
        case RxGateElement: {
          const rxGates = sameOps as RxGateElement[]
          for (const [angle, sameAngleGates] of groupBy(rxGates, gate => gate.angle)) {
            for (const [ifStr, sameIfGates] of groupBy(sameAngleGates, gate => gate.if)) {
              for (const [controlsStr, sameControlGates] of groupBy(sameIfGates, gate => gate.controls.toString())) {
                const gate0 = sameControlGates[0]
                const opType = gate0.operationType
                const targets = sameControlGates.map(each => each.bit)
                const serializedGate: SerializedRxGate = {type: opType, targets}
                if (ifStr !== '') serializedGate.if = ifStr
                if (angle !== '') serializedGate.angle = angle
                if (controlsStr !== '') serializedGate.controls = gate0.controls
                serializedStep.push(serializedGate)
              }
            }
          }
          break
        }
        case RyGateElement: {
          const ryGates = sameOps as RyGateElement[]
          for (const [angle, sameAngleGates] of groupBy(ryGates, gate => gate.angle)) {
            for (const [ifStr, sameIfGates] of groupBy(sameAngleGates, gate => gate.if)) {
              for (const [controlsStr, sameControlGates] of groupBy(sameIfGates, gate => gate.controls.toString())) {
                const gate0 = sameControlGates[0]
                const opType = gate0.operationType
                const targets = sameControlGates.map(each => each.bit)
                const serializedGate: SerializedRyGate = {type: opType, targets}
                if (ifStr !== '') serializedGate.if = ifStr
                if (angle !== '') serializedGate.angle = angle
                if (controlsStr !== '') serializedGate.controls = gate0.controls
                serializedStep.push(serializedGate)
              }
            }
          }
          break
        }
        case RzGateElement: {
          const rzGates = sameOps as RzGateElement[]
          for (const [angle, sameAngleGates] of groupBy(rzGates, gate => gate.angle)) {
            for (const [ifStr, sameIfGates] of groupBy(sameAngleGates, gate => gate.if)) {
              for (const [controlsStr, sameControlGates] of groupBy(sameIfGates, gate => gate.controls.toString())) {
                const gate0 = sameControlGates[0]
                const opType = gate0.operationType
                const targets = sameControlGates.map(each => each.bit)
                const serializedGate: SerializedRzGate = {type: opType, targets}
                if (ifStr !== '') serializedGate.if = ifStr
                if (angle !== '') serializedGate.angle = angle
                if (controlsStr !== '') serializedGate.controls = gate0.controls
                serializedStep.push(serializedGate)
              }
            }
          }
          break
        }
        case SwapGateElement: {
          const swapGates = (sameOps as SwapGateElement[]).filter(each => !each.disabled)
          if (swapGates.length !== 2) break

          const opType = swapGates[0].operationType
          const controls = swapGates[0].controls
          const serializedGate: SerializedSwapGate = {type: opType, targets: [swapGates[0].bit, swapGates[1].bit]}
          if (controls !== undefined && controls.length > 0) serializedGate.controls = controls
          serializedStep.push(serializedGate)
          break
        }
        case ControlGateElement: {
          const controlGates = (sameOps as ControlGateElement[]).filter(each => !each.disabled)
          if (controlGates.length < 2) break
          if (this.operations.some(each => isControllable(each) && each.controls.length > 0)) break

          const targets = controlGates.map(each => each.bit)
          serializedStep.push({type: controlGates[0].operationType, targets})
          break
        }
        case BlochDisplayElement: {
          const blochDisplays = sameOps as BlochDisplayElement[]
          const targets = sameOps.map(each => each.bit)
          serializedStep.push({type: blochDisplays[0].operationType, targets})
          break
        }
        case WriteGateElement: {
          const writeGates = sameOps as WriteGateElement[]
          for (const [, sameValueGates] of groupBy(writeGates, gate => gate.value)) {
            const targets = sameValueGates.map(each => each.bit)
            serializedStep.push({type: sameValueGates[0].operationType, targets})
          }
          break
        }
        case MeasurementGateElement: {
          const measurementGates = sameOps as MeasurementGateElement[]
          for (const [flag, sameFlagGates] of groupBy(measurementGates, gate => gate.flag)) {
            const targets = sameFlagGates.map(each => each.bit)
            const opType = sameFlagGates[0].operationType
            const serializedGate: SerializedMeasurementGate = {type: opType, targets}
            if (flag !== '') serializedGate.flag = flag
            serializedStep.push(serializedGate)
          }
          break
        }
        default:
          throw new DetailedError('Unrecognized operation', {klass})
      }
    }
    return serializedStep
  }

  private get operations(): Operation[] {
    return this.dropzones
      .filter(each => each.occupied)
      .map(each => each.operation)
      .filter((each): each is NonNullable<Operation> => each !== null)
  }

  toJson(): string {
    const jsons = this.dropzones.map(each => each.toJson())
    while (jsons.length > 0 && jsons[jsons.length - 1] === '1') {
      jsons.pop()
    }
    if (jsons.length === 0) {
      return '[1]'
    }
    return `[${jsons.join(',')}]`
  }
}

controller(CircuitStepElement)
