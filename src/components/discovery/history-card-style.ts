export const historyDepth = 3
export const historyStep = 32

export function historyCardStyle(index: number, depth = historyDepth) {
  const level = index + 1
  return {
    top: (depth - level) * historyStep,
    transform: `scale(${1 - level * 0.04})`,
    zIndex: 40 - level * 10,
  }
}
