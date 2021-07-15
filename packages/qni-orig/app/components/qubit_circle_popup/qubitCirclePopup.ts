import { Util } from "lib/base"
import { Complex } from "lib/math"
import tippy, {
  CreateSingletonInstance,
  CreateSingletonProps,
  Instance,
  Props,
  ReferenceElement,
  createSingleton,
  roundArrow,
} from "tippy.js"

export function initQubitCirclePopup(
  qubitCircles: HTMLElement[],
): CreateSingletonInstance<CreateSingletonProps<Props>> {
  const tippyInstances = tippy(qubitCircles)
  return createSingleton(tippyInstances, {
    allowHTML: true,
    animation: false,
    arrow: roundArrow + roundArrow,
    delay: 0,
    theme: "qni",
  })
}

export function cleanupPopup(
  qubitCircles: HTMLElement[],
  tippySingleton: CreateSingletonInstance<CreateSingletonProps<Props>>,
): void {
  qubitCircles.forEach((each) => {
    (each as ReferenceElement)._tippy?.destroy()
  })
  tippySingleton.destroy()
}

export function setQubitCirclePopupContent(
  popupEl: HTMLElement,
  qubitCircleEl: HTMLElement,
  ket: number,
  amplitude: Complex,
  nqubit: number,
): void {
  const tippy = (qubitCircleEl as ReferenceElement)._tippy as Instance
  tippy.setContent(popupContent(popupEl, ket, amplitude, nqubit))
}

function popupContent(
  popupEl: HTMLElement,
  ket: number,
  amplitude: Complex,
  nqubit: number,
): string {
  const magnitude = amplitude.abs()
  const phase = (amplitude.phase() / Math.PI) * 180

  popupKetBinaryEl(popupEl).textContent = ket.toString(2).padStart(nqubit, "0")
  popupKetDecimalEl(popupEl).textContent = ket.toString()
  popupAmplitudeRealEl(popupEl).textContent = forceSigned(amplitude.real, 5)
  popupAmplitudeImagEl(popupEl).textContent =
    forceSigned(amplitude.imag, 5) + "i"
  popupProbabilityEl(popupEl).textContent =
    forceSigned(magnitude * magnitude * 100, 4) + "%"
  popupPhaseEl(popupEl).textContent = forceSigned(phase, 2) + "°"

  return popupEl.innerHTML
}

function forceSigned(value: number, d: number): string {
  return (value >= 0 ? "+" : "") + value.toFixed(d)
}

function popupKetBinaryEl(popupEl: HTMLElement): HTMLElement {
  const el = popupEl
    .getElementsByClassName("qubit-circle-popup__ket-binary")
    .item(0) as HTMLElement
  Util.notNull(el)

  return el
}

function popupKetDecimalEl(popupEl: HTMLElement): HTMLElement {
  const el = popupEl
    .getElementsByClassName("qubit-circle-popup__ket-decimal")
    .item(0) as HTMLElement
  Util.notNull(el)

  return el
}

function popupAmplitudeRealEl(popupEl: HTMLElement): HTMLElement {
  const el = popupEl
    .getElementsByClassName("qubit-circle-popup__amplitude-real")
    .item(0) as HTMLElement
  Util.notNull(el)

  return el
}

function popupAmplitudeImagEl(popupEl: HTMLElement): HTMLElement {
  const el = popupEl
    .getElementsByClassName("qubit-circle-popup__amplitude-imag")
    .item(0) as HTMLElement
  Util.notNull(el)

  return el
}

function popupProbabilityEl(popupEl: HTMLElement): HTMLElement {
  const el = popupEl
    .getElementsByClassName("qubit-circle-popup__probability")
    .item(0) as HTMLElement
  Util.notNull(el)

  return el
}

function popupPhaseEl(popupEl: HTMLElement): HTMLElement {
  const el = popupEl
    .getElementsByClassName("qubit-circle-popup__phase")
    .item(0) as HTMLElement
  Util.notNull(el)

  return el
}
