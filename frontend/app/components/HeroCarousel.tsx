import Link from 'next/link';

const slides = [
  {
    id: 1,
    title: "Step into a World of Mithaas - Vardayini Sweet Mart",
    primaryCtaLink: "/categories/sweets",
    image: "/images/hero-world-of-mithaas.png?v=14"
  }
];

export default function HeroCarousel() {
  const slide = slides[0];

  return (
    <div className="w-full relative overflow-hidden rounded-2xl shadow-md border border-amber-900/10">
      {/* Widescreen Banner Container — 100% full fill, zero side bars, zero crop */}
      <div className="relative w-full aspect-[2.65/1] min-h-[160px] max-h-[480px] overflow-hidden bg-[#FAF4EB]">
        <Link href={slide.primaryCtaLink} className="block w-full h-full">
          <img
            src={slide.image}
            alt={slide.title}
            className="w-full h-full object-cover block"
          />
        </Link>
      </div>
    </div>
  );
}
