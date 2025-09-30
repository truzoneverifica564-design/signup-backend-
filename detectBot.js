module.exports = {
  analyze(behavior) {
    const b = behavior || {};
    const avgKeyDelay = b.avgKeyDelay || 200;
    const timeOnForm = b.timeOnForm || 10000;
    const mouseMoves = b.mouseMoves || 5;
    const usedPaste = !!b.usedPaste;
    let score = 0;
    if (avgKeyDelay < 50) score += 3;
    if (timeOnForm < 2000) score += 2;
    if (mouseMoves < 1) score += 2;
    if (usedPaste) score += 3;
    return { score };
  }
};
