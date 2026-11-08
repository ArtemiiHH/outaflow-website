export type Drop = {
  id: string;
  title: string;
  startsAt: string;
  endsAt: string;
  productSlugs: string[];
};
// No launch date has been supplied. Add a real window here before launch.
export const drops: Drop[] = [];
export const sampleDrop: Drop = {
  id: "sample-01",
  title: "First movement",
  startsAt: "2026-01-01T00:00:00Z",
  endsAt: "2027-01-01T00:00:00Z",
  productSlugs: [
    "form-hoodie",
    "everyday-tee",
    "wide-leg-trouser",
    "field-jacket",
  ],
};
