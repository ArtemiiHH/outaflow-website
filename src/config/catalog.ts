export type Variant = { size: string; color: string; merchandiseId: string };
export type Product = {
  slug: string;
  name: string;
  color: string;
  price: number;
  currency: string;
  images: { src: string; alt: string }[];
  description: string;
  sections: { title: string; content: string }[];
  variants: Variant[];
  sample: boolean;
};
const sizes = ["XS", "S", "M", "L", "XL", "XXL"];
const product = (
  slug: string,
  name: string,
  color: string,
  price: number,
  image: string,
): Product => ({
  slug,
  name,
  color,
  price,
  currency: "EUR",
  images: [
    {
      src: `/images/${image}.jpg`,
      alt: `Illustrative ${color.toLowerCase()} ${name.toLowerCase()} product photograph`,
    },
    ...(image === "hoodie"
      ? [
          {
            src: "/images/hoodie-detail.jpg",
            alt: "Closer crop of the illustrative hoodie photograph",
          },
        ]
      : []),
  ],
  description:
    "An everyday silhouette, with room to move. This is a sample product for storefront preview; final materials, fit and imagery will be confirmed before release.",
  sections: [
    {
      title: "Product details",
      content:
        "Sample presentation only. Replace with verified composition, construction and fit information before launch.",
    },
    {
      title: "Sizing",
      content:
        "Sample sizes XS–XXL. Add garment measurements and your verified size guide before release.",
    },
    {
      title: "Shipping",
      content:
        "Shipping destinations, rates and delivery estimates will be confirmed at launch and calculated by Shopify at checkout.",
    },
    {
      title: "Care",
      content:
        "Follow the care instructions on the finished garment. Product-specific care guidance will be added before release.",
    },
  ],
  variants: sizes.map((size) => ({ size, color, merchandiseId: "" })),
  sample: true,
});
export const catalog: Product[] = [
  product("form-hoodie", "Form hoodie", "Washed black", 110, "hoodie"),
  product("everyday-tee", "Everyday tee", "Chalk", 45, "tee"),
  product("wide-leg-trouser", "Wide leg trouser", "Graphite", 95, "trousers"),
  product("field-jacket", "Field jacket", "Black", 165, "jacket"),
];
