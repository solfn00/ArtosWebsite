import Image from "next/image";
import { nav, photos, site } from "@/content/site";
import { Ridge } from "./Graphics";
import Socials from "./Socials";

export default function Footer() {
  return (
    <footer className="relative bg-navy pb-[calc(6rem+env(safe-area-inset-bottom))] pt-20 text-cream lg:pb-10">
      <Ridge className="absolute inset-x-0 -top-px h-10 w-full rotate-180 text-sand sm:h-14" />
      <div className="mx-auto grid max-w-7xl gap-10 px-5 sm:px-8 md:grid-cols-[1fr_auto] md:items-end">
        <div className="flex items-center gap-5">
          {/* decorative here: the name is spelled out beside it */}
          <Image src={photos.logo.src} alt="" width={88} height={88} className="h-20 w-20 rounded-full" />
          <div>
            <p className="font-display text-3xl font-black">{site.nameHe}</p>
            <p className="text-muted-dark">
              {site.slogan} · {site.location}
            </p>
            <div className="mt-4">
              <Socials variant="icons" />
            </div>
          </div>
        </div>
        <nav aria-label="ניווט תחתון">
          <ul role="list" className="flex flex-wrap gap-x-6 gap-y-2">
            {nav.map((n) => (
              <li key={n.id}>
                <a href={`#${n.id}`} className="inline-flex min-h-11 items-center px-1 text-muted-dark transition-colors hover:text-turq">
                  {n.label}
                </a>
              </li>
            ))}
          </ul>
        </nav>
      </div>
      <div className="mx-auto mt-14 flex max-w-7xl flex-wrap justify-between gap-2 border-t border-cream/15 px-5 pt-6 text-sm text-faint-dark sm:px-8">
        <p>© {new Date().getFullYear()} {site.nameHe} | <span lang="en">{site.nameEn}</span></p>
        <p>{site.location}, {site.region}</p>
      </div>
    </footer>
  );
}
