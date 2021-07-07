import { CircuitDraggable, CircuitDropzone, CircuitStep } from "./editor"
import { DropEventHandlers } from "./editor/mixins"
import { CircuitElement, QubitLabel } from "./editor/gates"
import { InternalError } from "./error"
import { classNameFor, Util } from "./base"

class CircuitWire {
  public elements: HTMLElement[]

  constructor(elements: HTMLElement[]) {
    this.elements = elements
  }

  clone(): CircuitWire {
    const elements = this.elements.map((each) => {
      return each.cloneNode(true) as HTMLElement
    })
    return new CircuitWire(elements)
  }

  clear(): CircuitWire {
    this.elements.forEach((each) => {
      if (each.classList.contains(classNameFor("dropzone"))) {
        const circuitDropzone = CircuitDropzone.create(each)
        circuitDropzone.clear()
        circuitDropzone.wireActive = false
      }
    })
    return this
  }

  get isEmpty(): boolean {
    return this.elements
      .slice(2)
      .filter((each) => {
        return each.classList.contains(classNameFor("dropzone"))
      })
      .map((each) => {
        return CircuitDropzone.create(each)
      })
      .every((each) => {
        return !each.isOccupied()
      })
  }

  get dropzones(): CircuitDropzone[] {
    return this.elements
      .filter((each) => {
        return each.classList.contains(classNameFor("dropzone"))
      })
      .map((each) => {
        return CircuitDropzone.create(each)
      })
  }

  incrementQubitLabelValue(): CircuitWire {
    this.elements.forEach((each) => {
      if (
        each.classList.contains(classNameFor("instruction:type:qubitLabel"))
      ) {
        const qubitLabel = QubitLabel.create(each)
        if (/^0x/.exec(qubitLabel.value)) {
          const labelValue = parseInt(qubitLabel.value)
          qubitLabel.value = `0x${(labelValue * 2).toString(16)}`
        }
      }
    })
    return this
  }

  remove() {
    this.elements.forEach((each) => {
      if (each.classList.contains(classNameFor("dropzone"))) {
        CircuitDropzone.create(each).unsetInteract()
      }
      each.parentNode?.removeChild(each)
    })
  }
}

export class Circuit {
  private element: Element

  constructor() {
    const el = document.getElementById("circuit")

    if (!el) {
      throw new Error("circuit element not found")
    }
    this.element = el
  }

  toJson(): string {
    let circuitBlock: Element | null = null
    const cols: string[] = []

    this.steps
      .filter((each) => {
        return !(each.instructions[0] instanceof QubitLabel)
      })
      .filter((each) => {
        return !each.element.classList.contains(
          classNameFor("circuitStep:type:shadowSource"),
        )
      })
      .forEach((each) => {
        if (each.circuitBlock()) {
          if (circuitBlock === null) {
            circuitBlock = each.circuitBlock()
            const circuitBlockLabel = circuitBlock
              ?.getElementsByClassName("circuit-block__label")
              .item(0)
            Util.notNull(circuitBlockLabel)
            const label = circuitBlockLabel.textContent?.trim()
            Util.notNull(label)
            cols.push(`["{${label}"]`)
          }
        } else {
          if (circuitBlock !== null) {
            circuitBlock = null
            cols.push("[\"}\"]")
          }
        }
        cols.push(each.toJson())
      })
    if (circuitBlock) cols.push("[\"}\"]")
    return `{"cols":[${cols.join(",")}],"init":false}`
  }

  get steps(): CircuitStep[] {
    return Array.from(
      this.element.getElementsByClassName(classNameFor("circuitStep")),
    ).map((each) => {
      return CircuitStep.create(each)
    })
  }

  get emptySteps(): CircuitStep[] {
    return this.steps
      .filter((each) => {
        return each.isEmpty
      })
      .slice(0, -1)
  }

  get draggables(): CircuitDraggable[] {
    return Array.from(
      this.element.getElementsByClassName(
        classNameFor("draggable:type:circuit"),
      ),
    ).map((each) => {
      return new CircuitDraggable(each as HTMLElement)
    })
  }

  get dropzones(): CircuitDropzone[] {
    return Array.from(
      this.element.getElementsByClassName(
        classNameFor("dropzone:type:circuit"),
      ),
    ).map((each) => {
      return CircuitDropzone.create(each)
    })
  }

  instructions(): CircuitElement[] {
    return this.dropzones.map((each) => {
      return each.instruction
    })
  }

  appendNewWire(dropzoneHandlers: DropEventHandlers): void {
    const wires = this.wires
    const newWire = wires[wires.length - 1]
      .clone()
      .clear()
      .incrementQubitLabelValue()

    newWire.dropzones.forEach((each) => {
      each.setInteract(dropzoneHandlers)
    })
    this.appendWire(newWire)
  }

  removeEmptyWire(): void {
    this.wires.forEach((each) => {
      if (each.isEmpty) each.remove()
    })
    this.updateNqubit()
  }

  get nqubit(): number {
    const dataNqubit = this.element.getAttribute("data-nqubit")
    if (!dataNqubit) throw new InternalError("Couldn't get data-nqubit")

    return parseInt(dataNqubit)
  }

  updateNqubit(): void {
    this.element.setAttribute("data-nqubit", this.wires.length.toString())
  }

  get wires(): CircuitWire[] {
    const wireElements: HTMLElement[][] = []

    this.steps.map((step) => {
      step.childElements.forEach((child, i) => {
        if (!wireElements[i]) wireElements.push([])
        wireElements[i].push(child as HTMLElement)
      })
    })

    return wireElements.map((each) => {
      return new CircuitWire(each)
    })
  }

  private appendWire(wire: CircuitWire): void {
    this.steps.forEach((each, i) => {
      each.appendChild(wire.elements[i])
    })
  }
}
