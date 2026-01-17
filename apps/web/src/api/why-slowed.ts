export async function getWhySlowed() {
  const res = await fetch("/api/ledger?type=SLOWDOWN_EXPLANATION");
  return res.json();
}
