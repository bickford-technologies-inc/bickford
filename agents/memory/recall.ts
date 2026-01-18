import { list, byLevel } from "./store";

export function recallAll() {
  return list();
}

export function recallCanon() {
  return byLevel("canon");
}

export function recallPromoted() {
  return byLevel("promoted");
}
