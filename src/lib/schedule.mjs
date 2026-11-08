export function activeDrop(drops, now = Date.now()) {
  return (
    drops.find(
      (drop) =>
        Number.isFinite(Date.parse(drop.startsAt)) &&
        Number.isFinite(Date.parse(drop.endsAt)) &&
        now >= Date.parse(drop.startsAt) &&
        now < Date.parse(drop.endsAt),
    ) ?? null
  );
}
