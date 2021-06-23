import {
  ControlGateInstruction,
  HadamardGateInstruction,
  NotGateInstruction,
  PhaseGateInstruction,
  ReadoutInstruction,
  RootNotGateInstruction,
  SeriarizedInstruction,
  SwapGateInstruction,
  WriteInstruction,
} from "lib/editor/gates"
import { StateVector } from "lib/simulator/stateVector"
import { PARSE_COMPLEX_TOKEN_MAP_RAD, Complex } from "./math"
import { parseFormula } from "./math"

export class Simulator {
  public state: StateVector
  public bits: { [bit: number]: number }
  public flags: { [key: string]: boolean }

  constructor(bits: string | StateVector) {
    if ("string" === typeof bits) {
      this.state = new StateVector(bits)
    } else {
      this.state = bits
    }
    this.bits = {}
    this.flags = {}
  }

  runStep(instructions: SeriarizedInstruction[]): Simulator {
    const doneSwapTargets: [number, number][] = []
    const doneCPhaseTargets: [number, number][] = []
    const controlOn: { [bit: number]: boolean } = {}

    instructions.forEach((each, bit) => {
      switch (each.type) {
        case "qubit-label":
        case "i-gate":
          break
        case "write":
          this.handleWriteGate(each, bit)
          break
        case "readout":
          this.handleReadoutGate(each, bit)
          break
        case "not-gate":
          this.handleNotGate(each, bit, controlOn)
          break
        case "root-not-gate":
          this.handleRootNotGate(each, bit)
          break
        case "phase-gate":
          this.handlePhaseGate(each, bit, doneCPhaseTargets, controlOn)
          break
        case "hadamard-gate":
          this.handleHadamardGate(each, bit, controlOn)
          break
        case "control-gate":
          this.handleControlGate(each, instructions, doneCPhaseTargets)
          break
        case "swap-gate":
          this.handleSwapGate(each, doneSwapTargets)
          break
        default:
          throw new Error("Unknown instruction")
      }
    })

    return this
  }

  write(value: number, ...targets: number[]): Simulator {
    targets.forEach((t) => {
      const pZero = this.pZero(t)
      if ((value == 0 && pZero == 0) || (value == 1 && pZero == 1)) {
        this.x(t)
      }
    })
    return this
  }

  x(...targets: number[]): Simulator {
    targets.forEach((t) => {
      for (let bit = 0; bit < 1 << this.state.nqubit; bit++) {
        if ((bit & (1 << t)) == 0) {
          const a0 = bit
          const a1 = a0 ^ (1 << t)
          const va0 = this.state.amplifier(a0)
          const va1 = this.state.amplifier(a1)

          this.state.setAmplifier(a0, va1)
          this.state.setAmplifier(a1, va0)
        }
      }
    })
    return this
  }

  h(...targets: number[]): Simulator {
    targets.forEach((t) => {
      for (let bit = 0; bit < 1 << this.state.nqubit; bit++) {
        if ((bit & (1 << t)) == 0) {
          const a0 = bit
          const a1 = a0 ^ (1 << t)
          const va0 = this.state.amplifier(a0)
          const va1 = this.state.amplifier(a1)

          this.state.setAmplifier(a0, va0.plus(va1).dividedBy(Math.sqrt(2)))
          this.state.setAmplifier(a1, va0.minus(va1).dividedBy(Math.sqrt(2)))
        }
      }
    })
    return this
  }

  phase(phi: string, ...targets: number[]): Simulator {
    const numPhi = parseFormula<number>(phi, PARSE_COMPLEX_TOKEN_MAP_RAD)
    const u11 = new Complex(Math.cos(numPhi), Math.sin(numPhi))

    targets.forEach((t) => {
      for (let bit = 0; bit < 1 << this.state.nqubit; bit++) {
        if ((bit & (1 << t)) == 0) {
          const a0 = bit
          const a1 = a0 ^ (1 << t)
          const va1 = this.state.amplifier(a1)

          this.state.setAmplifier(a1, u11.times(va1))
        }
      }
    })
    return this
  }

  rnot(...targets: number[]): Simulator {
    targets.forEach((t) => {
      for (let bit = 0; bit < 1 << this.state.nqubit; bit++) {
        if ((bit & (1 << t)) == 0) {
          const a0 = bit
          const a1 = a0 ^ (1 << t)
          const va0 = this.state.amplifier(a0)
          const va1 = this.state.amplifier(a1)

          this.state.setAmplifier(
            a0,
            new Complex(0, -1)
              .plus(1)
              .times(va0)
              .plus(Complex.I.plus(1).times(va1))
              .dividedBy(2),
          )
          this.state.setAmplifier(
            a1,
            Complex.I.plus(1)
              .times(va0)
              .plus(new Complex(0, -1).plus(1).times(va1))
              .dividedBy(2),
          )
        }
      }
    })
    return this
  }

  swap(target0: number, target1: number): Simulator {
    this.cnot(target0, target1).cnot(target1, target0).cnot(target0, target1)
    return this
  }

  cswap(control: number, target0: number, target1: number): Simulator {
    this.ccnot(control, target0, target1)
      .ccnot(control, target1, target0)
      .ccnot(control, target0, target1)
    return this
  }

  cnot(control: number, ...targets: number[]): Simulator {
    targets.forEach((t) => {
      for (let bit = 0; bit < 1 << this.state.nqubit; bit++) {
        if ((bit & (1 << t)) == 0 && (bit & (1 << control)) != 0) {
          const a0 = bit
          const a1 = a0 ^ (1 << t)
          const va0 = this.state.amplifier(a0)
          const va1 = this.state.amplifier(a1)

          this.state.setAmplifier(a0, va1)
          this.state.setAmplifier(a1, va0)
        }
      }
    })
    return this
  }

  cr(phi: string, control: number, ...targets: number[]): Simulator {
    const numPhi = parseFormula<number>(phi, PARSE_COMPLEX_TOKEN_MAP_RAD)
    const e = new Complex(Math.E, 0)
    const i = Complex.I

    targets.forEach((t) => {
      for (let bit = 0; bit < 1 << this.state.nqubit; bit++) {
        if ((bit & (1 << t)) == 0 && (bit & (1 << control)) != 0) {
          const a0 = bit
          const a1 = a0 ^ (1 << t)
          const va1 = this.state.amplifier(a1)

          this.state.setAmplifier(a1, va1.times(e.raisedTo(i.times(numPhi))))
        }
      }
    })
    return this
  }

  ch(control: number, ...targets: number[]): Simulator {
    targets.forEach((t) => {
      for (let bit = 0; bit < 1 << this.state.nqubit; bit++) {
        if ((bit & (1 << t)) == 0 && (bit & (1 << control)) != 0) {
          const a0 = bit
          const a1 = a0 ^ (1 << t)
          const va0 = this.state.amplifier(a0)
          const va1 = this.state.amplifier(a1)

          this.state.setAmplifier(a0, va0.plus(va1).times(Math.sqrt(0.5)))
          this.state.setAmplifier(a1, va0.minus(va1).times(Math.sqrt(0.5)))
        }
      }
    })
    return this
  }

  cphase(phi: string, target0: number, target1: number): Simulator {
    const numPhi = parseFormula<number>(phi, PARSE_COMPLEX_TOKEN_MAP_RAD)
    const u11 = new Complex(Math.cos(numPhi), Math.sin(numPhi))

    for (let bit = 0; bit < 1 << this.state.nqubit; bit++) {
      if ((bit & (1 << target0)) == 0 && (bit & (1 << target1)) != 0) {
        const a0 = bit
        const a1 = a0 ^ (1 << target0)
        const va1 = this.state.amplifier(a1)

        this.state.setAmplifier(a1, u11.times(va1))
      }
    }
    return this
  }

  ccz(control1: number, control2: number, target: number): Simulator {
    for (let bit = 0; bit < 1 << this.state.nqubit; bit++) {
      if (
        (bit & (1 << target)) != 0 &&
        (bit & (1 << control1)) != 0 &&
        (bit & (1 << control2)) != 0
      ) {
        this.state.setAmplifier(bit, this.state.amplifier(bit).times(-1))
      }
    }
    return this
  }

  ccnot(control1: number, control2: number, target: number): Simulator {
    this.h(target).ccz(control1, control2, target).h(target)
    return this
  }

  read(...targets: number[]): Simulator {
    targets.forEach((t) => {
      const pZero = this.pZero(t)
      const rand = Math.random()

      if (rand <= pZero) {
        for (let bit = 0; bit < 1 << this.state.nqubit; bit++) {
          if ((bit & (1 << t)) != 0) this.state.setAmplifier(bit, Complex.ZERO)
          this.state.setAmplifier(
            bit,
            this.state.amplifier(bit).dividedBy(Math.sqrt(pZero)),
          )
        }
        this.bits[t] = 0
      } else {
        for (let bit = 0; bit < 1 << this.state.nqubit; bit++) {
          if ((bit & (1 << t)) == 0) this.state.setAmplifier(bit, Complex.ZERO)
          this.state.setAmplifier(
            bit,
            this.state.amplifier(bit).dividedBy(Math.sqrt(1 - pZero)),
          )
        }
        this.bits[t] = 1
      }
    })
    return this
  }

  magnitudes(): number[] {
    const m = []
    for (let r = 0; r < this.state.matrix.height; r++) {
      m.push(this.state.matrix.cell(0, r).abs())
    }
    return m
  }

  phases(): number[] {
    const p = []
    for (let r = 0; r < this.state.matrix.height; r++) {
      p.push((this.state.matrix.cell(0, r).phase() / Math.PI) * 180)
    }
    return p
  }

  private pZero(target: number): number {
    let p = 0
    for (let bit = 0; bit < 1 << this.state.nqubit; bit++) {
      if ((bit & (1 << target)) == 0) {
        p += Math.pow(this.state.amplifier(bit).abs(), 2)
      }
    }
    return this.round(p, 5)
  }

  private round(n: number, decimal: number): number {
    return Math.round(n * Math.pow(10, decimal)) / Math.pow(10, decimal)
  }

  private handleWriteGate(gate: WriteInstruction, bit: number): void {
    this.write(gate.value, bit)
  }

  private handleReadoutGate(gate: ReadoutInstruction, bit: number): void {
    this.read(bit)
    if (gate.set) {
      this.flags[gate.set] = this.bits[bit] == 1
    }
  }

  private handleNotGate(
    gate: NotGateInstruction,
    bit: number,
    controlOn: { [bit: number]: boolean },
  ): void {
    const controls = gate.controls

    if (controls.length == 0) {
      if (gate.if) {
        if (this.flags[gate.if]) {
          this.x(bit)
        }
      } else {
        this.x(bit)
      }
    } else if (controls.length == 1) {
      this.cnot(controls[0], bit)
    } else {
      const allControlsOn = controls
        .map((c) => {
          if (controlOn[c] === undefined) {
            const pZero = this.pZero(c)
            controlOn[c] = pZero != 1
          }
          return controlOn[c]
        })
        .every((c) => {
          return c
        })
      if (!allControlsOn) return

      this.x(bit)
    }
  }

  private handleRootNotGate(gate: RootNotGateInstruction, bit: number): void {
    if (gate.if) {
      if (this.flags[gate.if]) {
        this.rnot(bit)
      }
    } else {
      this.rnot(bit)
    }
  }

  private handlePhaseGate(
    gate: PhaseGateInstruction,
    bit: number,
    gatesDone: [number, number][],
    controlOn: { [bit: number]: boolean },
  ): void {
    const controls = gate.controls
    const targets = gate.targets

    if (controls.length == 0) {
      if (targets.length == 0) {
        if (gate.phi) {
          this.phase(gate.phi, bit)
        }
      } else if (targets.length == 2) {
        if (
          gatesDone.some((done) => {
            return done[0] === targets[0] && done[1] === targets[1]
          })
        ) {
          return
        }
        this.cphase(gate.phi, targets[0], targets[1])
        gatesDone.push(targets)
      }
    } else if (controls.length == 1) {
      this.cr(gate.phi, controls[0], bit)
    } else {
      const allControlsOn = controls
        .map((c) => {
          if (controlOn[c] === undefined) {
            const pZero = this.pZero(c)
            controlOn[c] = pZero != 1
          }
          return controlOn[c]
        })
        .every((c) => {
          return c
        })
      if (!allControlsOn) return

      this.phase(gate.phi, bit)
    }
  }

  private handleHadamardGate(
    gate: HadamardGateInstruction,
    bit: number,
    controlOn: { [bit: number]: boolean },
  ): void {
    if (gate.controls.length == 0) {
      if (gate.if) {
        if (this.flags[gate.if]) {
          this.h(bit)
        }
      } else {
        this.h(bit)
      }
    } else {
      const controls = gate.controls
      const allControlsOn = controls
        .map((c) => {
          if (controlOn[c] === undefined) {
            const pZero = this.pZero(c)
            controlOn[c] = pZero != 1
          }
          return controlOn[c]
        })
        .every((c) => {
          return c
        })
      if (!allControlsOn) return

      this.h(bit)
    }
  }

  private handleControlGate(
    gate: ControlGateInstruction,
    instructions: SeriarizedInstruction[],
    gatesDone: [number, number][],
  ): void {
    const targets = gate.targets

    if (
      targets.length == 2 &&
      instructions[targets[0]].type === "control-gate" &&
      instructions[targets[1]].type === "control-gate"
    ) {
      if (
        gatesDone.some((done) => {
          return done[0] === targets[0] && done[1] === targets[1]
        })
      ) {
        return
      }

      this.cphase("pi", targets[0], targets[1])
      gatesDone.push(targets)
    }
  }

  private handleSwapGate(
    gate: SwapGateInstruction,
    gatesDone: [number, number][],
  ): void {
    const targets = gate.targets

    if (targets.length != 2) return
    if (
      gatesDone.some((done) => {
        return done[0] === targets[0] && done[1] === targets[1]
      })
    ) {
      return
    }

    if (gate.controls.length == 0) {
      this.swap(targets[0], targets[1])
      gatesDone.push(targets)
    } else if (gate.controls.length == 1) {
      gatesDone.push(targets)
      this.cswap(gate.controls[0], targets[0], targets[1])
    }
  }
}
