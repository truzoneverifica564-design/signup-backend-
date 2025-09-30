// Simple in-process task queue to simulate bot workers picking jobs.
const queue = [];
module.exports = {
  push(job) { queue.push(job); },
  pop() { return queue.shift(); },
  size() { return queue.length; }
};
