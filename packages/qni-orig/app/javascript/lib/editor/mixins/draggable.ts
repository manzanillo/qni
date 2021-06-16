import interact from "interactjs"
import { CircuitElement } from "../gates"
import { DragEventHandlers, Interactable } from "./interactable"
import { DraggableSource, Dropzone } from ".."
import { InternalError } from "lib/error"
import { Mixin } from "ts-mixer"
import { attributeNameFor, classNameFor } from "lib/base"

export class Draggable extends Mixin(Interactable) {
  setInteract(handlers: DragEventHandlers): void {
    if (interact.isSet(this.element)) return
    this.unsetInteract()
    interact(this.element as Interact.Target)
      .draggable({
        onstart: handlers.onStart,
        onmove: handlers.onMove,
        onend: handlers.onEnd,
      })
      .styleCursor(false)
  }

  move(dx: number, dy: number): void {
    const x = this.x + dx
    const y = this.y + dy

    this.moveTo(x, y)
  }

  protected moveTo(x: number, y: number): void {
    this.element.style.transform = `translate(${x}px, ${y}px)`
    this.element.setAttribute(attributeNameFor("draggable:x"), x.toString())
    this.element.setAttribute(attributeNameFor("draggable:y"), y.toString())
  }

  protected moveToGrabbedPosition(event: MouseEvent): void {
    const draggableElement = this.draggableElement(event)

    const centerX = draggableElement.clientWidth / 2
    const centerY = draggableElement.clientHeight / 2
    const dx = event.offsetX - centerX
    const dy = event.offsetY - centerY

    this.move(dx, dy)
  }

  private draggableElement(event: MouseEvent): HTMLElement {
    const eventTarget = event.target
    if (!eventTarget) throw new InternalError("event target not found")
    const className = classNameFor("draggable")

    const el = (eventTarget as Element).closest(`.${className}`)
    if (!el) throw new InternalError(`.${className} not found`)

    return el as HTMLElement
  }

  remove(): void {
    interact(this.element).unset()
    this.getDropzone().element.removeChild(this.element)
  }

  // Coordinates

  private get x(): number {
    const x = parseFloat(
      this.element.getAttribute(attributeNameFor("draggable:x")) || "0",
    )

    return x
  }

  private get y(): number {
    const y = parseFloat(
      this.element.getAttribute(attributeNameFor("draggable:y")) || "0",
    )

    return y
  }

  // Instruction

  get circuitElement(): CircuitElement {
    return CircuitElement.create(this.element)
  }

  // Dropzone

  protected getDropzone(): Dropzone {
    return Dropzone.create(this.dropzoneEl)
  }

  protected get dropzoneEl(): HTMLElement {
    const el = this.element.closest(`.${classNameFor("dropzone")}`)
    if (!el) throw new InternalError("dropzone not found")

    return el as HTMLElement
  }

  // Draggable source element

  createSource(): DraggableSource {
    const el = this.element.cloneNode(true) as HTMLElement

    interact(el).unset()
    el.classList.remove(classNameFor("draggable:state:dragging"))
    el.classList.remove(classNameFor("gate:state:updated"))
    el.classList.add(classNameFor("draggable:type:source"))
    this.getDropzone().element.insertBefore(el, this.element)

    return DraggableSource.create(el)
  }

  get source(): DraggableSource | null {
    return this.getDropzone().draggableSource
  }

  // Status & types

  protected set grabbed(flag: boolean) {
    this.setClassName("draggable:state:grabbed", flag)
  }

  isGrabbed(): boolean {
    return this.isClassNamed("draggable:state:grabbed")
  }

  set dropped(flag: boolean) {
    this.setClassName("draggable:state:dropped", flag)
  }

  get isDropped(): boolean {
    return this.isClassNamed("draggable:state:dropped")
  }

  set dragging(flag: boolean) {
    this.setClassName("draggable:state:dragging", flag)
  }
}
