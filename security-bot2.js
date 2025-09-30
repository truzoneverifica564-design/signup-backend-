/*
security-botX.js
Each bot receives userData object. Expect userData.behavior (optional) with:
 - avgKeyDelay (ms)
 - timeOnForm (ms)
 - mouseMoves (count)
 - scrolls (count)
 - usedPaste (bool)
 - keystrokeUniform (bool)
Return: { suspicious: boolean, reason: string|null }
*/

module.exports.check = async function(userData) {
  const b = userData.behavior || {};
  // default safe values if not provided
  const avgKeyDelay = b.avgKeyDelay || 200;
  const timeOnForm = b.timeOnForm || 10000;
  const mouseMoves = b.mouseMoves || 5;
  const scrolls = b.scrolls || 1;
  const usedPaste = !!b.usedPaste;
  const keystrokeUniform = !!b.keystrokeUniform;

  let suspicious = false;
  let reason = null;

  // Bot-specific simple heuristics - vary slightly per bot
  if (avgKeyDelay < 50) { suspicious = true; reason = 'typing_too_fast'; }
  if (timeOnForm < 1500) { suspicious = true; reason = 'filled_too_fast'; }
  if (mouseMoves < 1) { suspicious = true; reason = 'no_mouse_movement'; }
  if (usedPaste) { suspicious = true; reason = 'used_paste'; }
  if (keystrokeUniform) { suspicious = true; reason = 'uniform_keystrokes'; }

  return { suspicious, reason };
};
