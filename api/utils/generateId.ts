export function generateId() {
  return String(Math.floor((1 + Math.random()) * 10 ** 6));
}
