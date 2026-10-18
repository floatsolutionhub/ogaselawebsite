import Image from "next/image";
import { Container } from "../Container";
import { FadeIn, StaggerGroup, StaggerItem } from "../FadeIn";

const tiles = [
  {
    src: "/images/market-square.jpg",
    alt: "A bustling market square in Nigeria",
    label: "Market squares",
    sub: "The energy of local markets, online",
  },
  {
    src: "/images/women-market.jpg",
    alt: "Women trading fresh produce at a Lagos market",
    label: "Everyday traders",
    sub: "Real sellers, in every neighborhood",
  },
  {
    src: "/images/electronics-store.jpg",
    alt: "Electronics stores at Computer Village, Lagos",
    label: "Electronics hubs",
    sub: "From Computer Village to your phone",
  },
  {
    src: "/images/vehicles-lot.jpg",
    alt: "A lot full of cars for sale",
    label: "Vehicles",
    sub: "Find your next ride, nearby",
  },
];

const credits = [
  { name: "Oyeloye", license: "CC BY 3.0", url: "https://commons.wikimedia.org/wiki/File:Aerial_view_of_ipetumodu_market_square_and_town_hall.jpeg" },
  { name: "Tsemaye Jemide", license: "CC BY-SA 4.0", url: "https://commons.wikimedia.org/wiki/File:Market_Lady,_Lekki,_Lagos.jpg" },
  { name: "Lightfast Media", license: "CC BY-SA 4.0", url: "https://commons.wikimedia.org/wiki/File:Computer_Village,_Ikeja_Lagos.jpg" },
  { name: "Zarerh", license: "CC BY-SA 4.0", url: "https://commons.wikimedia.org/wiki/File:Cars_at_parking_slots_in_Maiduguri_Borno_State_(5).jpg" },
];

export function CategoryGallery() {
  return (
    <section className="bg-white py-24">
      <Container>
        <FadeIn className="mx-auto max-w-2xl text-center">
          <p className="text-sm font-semibold uppercase tracking-wide text-brand-600">
            The marketplace, everywhere
          </p>
          <h2 className="mt-3 text-3xl font-bold tracking-tight text-ink-900 sm:text-4xl">
            From the market square to your pocket
          </h2>
          <p className="mt-4 text-lg text-ink-500">
            Whatever you&apos;re looking for — groceries, gadgets, or your next car —
            it&apos;s already being traded near you.
          </p>
        </FadeIn>

        <StaggerGroup className="mt-14 grid grid-cols-2 gap-4 lg:grid-cols-4">
          {tiles.map((tile) => (
            <StaggerItem key={tile.src}>
              <div className="group relative aspect-[3/4] overflow-hidden rounded-3xl bg-ink-900">
                <Image
                  src={tile.src}
                  alt={tile.alt}
                  fill
                  sizes="(min-width: 1024px) 25vw, 50vw"
                  className="object-cover transition-transform duration-500 ease-out group-hover:scale-110"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-ink-900/85 via-ink-900/10 to-transparent" />
                <div className="absolute inset-x-0 bottom-0 p-4">
                  <p className="font-bold text-white">{tile.label}</p>
                  <p className="mt-0.5 text-xs text-white/75">{tile.sub}</p>
                </div>
              </div>
            </StaggerItem>
          ))}
        </StaggerGroup>

        <p className="mt-6 text-center text-xs text-ink-300">
          Photos: {" "}
          {credits.map((c, i) => (
            <span key={c.url}>
              <a href={c.url} target="_blank" rel="noopener noreferrer" className="hover:text-ink-500 hover:underline">
                {c.name}
              </a>{" "}
              ({c.license}){i < credits.length - 1 ? ", " : ""}
            </span>
          ))}
          {" "}via Wikimedia Commons.
        </p>
      </Container>
    </section>
  );
}
