/**
 * Тактильный отклик. Вызывается на каждое успешное действие (DESIGN.md).
 * Обёрнут в проверку поддержки — на десктопе и iOS Safari Vibration API нет,
 * там вызов просто ничего не делает.
 */
export function haptic(durationMs = 10): void {
  if (typeof navigator === 'undefined') return;
  if (typeof navigator.vibrate !== 'function') return;
  try {
    navigator.vibrate(durationMs);
  } catch {
    // некоторые браузеры кидают при частых вызовах — молча игнорируем
  }
}
