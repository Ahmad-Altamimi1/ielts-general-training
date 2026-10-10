import Image from "next/image";

import { COURSE } from "@/lib/course";
import { cn } from "@/lib/utils";

/* ===================================================================== *
 * The school's letterhead.
 *
 * This is the header the school puts at the top of its printed worksheets,
 * rebuilt rather than pasted in as a picture: the emblems are images, but
 * the school's name, the council and the zone are text, so they can be
 * read aloud, searched, translated and reflowed on a phone — none of which
 * a screenshot can do.
 *
 * It is light in both themes, on purpose. A letterhead is a sheet of
 * paper, the four emblems were drawn for white, and inverting them would
 * turn an official mark into an artefact.
 * ===================================================================== */

const LOGOS = {
  /** The ministry emblem with its name beside it. */
  ministry: {
    src: "/brand/school/ministry.png",
    width: 828,
    height: 288,
    alt: "United Arab Emirates Ministry of Education",
  },
  /** The ministry's own wordmark: "Education". */
  education: {
    src: "/brand/school/education.png",
    width: 435,
    height: 360,
    alt: "Ministry of Education",
  },
  /** The National Charter for Education. */
  charter: {
    src: "/brand/school/charter.png",
    width: 567,
    height: 345,
    alt: "The National Charter for Education",
  },
  /** We the UAE 2031. */
  uae2031: {
    src: "/brand/school/uae2031.png",
    width: 441,
    height: 444,
    alt: "We the UAE 2031",
  },
} as const;

function Emblem({
  logo,
  className,
}: {
  logo: (typeof LOGOS)[keyof typeof LOGOS];
  className: string;
}) {
  return (
    <Image
      src={logo.src}
      alt={logo.alt}
      width={logo.width}
      height={logo.height}
      className={cn("w-auto shrink-0 object-contain", className)}
      priority
    />
  );
}

export function SchoolHeader({ className }: { className?: string }) {
  return (
    <section
      aria-label="School"
      className={cn(
        "overflow-hidden rounded-xl border border-layer-border bg-letterhead-paper text-letterhead-ink print:rounded-none print:border-0 print:border-b print:border-black",
        className,
      )}
    >
      {/* ---- The ministry, the council, the school ------------------- */}
      <div className="flex items-center gap-3 px-3 py-2.5 sm:gap-6 sm:px-5 sm:py-3">
        <Emblem logo={LOGOS.ministry} className="h-7 sm:h-11" />

        <p
          dir="rtl"
          lang="ar"
          className="min-w-0 flex-1 text-center leading-snug text-[0.6875rem] font-semibold sm:text-sm"
        >
          <span className="block">{COURSE.school.council}</span>
          <span className="block">{COURSE.school.zone}</span>
          <span className="block">{COURSE.school.name}</span>
          <span className="block">{COURSE.school.principal}</span>
        </p>

        <Emblem logo={LOGOS.education} className="h-8 sm:h-12" />
      </div>

      {/* ---- The title band ------------------------------------------ */}
      <div className="flex items-center gap-3 bg-letterhead-band px-3 py-2 text-letterhead-band-ink sm:gap-6 sm:px-5 sm:py-2.5 print:border-t print:border-black">
        <Emblem logo={LOGOS.charter} className="h-8 sm:h-12" />

        <p className="min-w-0 flex-1 text-center">
          <span className="font-heading block text-base leading-tight font-bold tracking-tight sm:text-2xl">
            {COURSE.title}
          </span>
          <span className="mt-0.5 block text-[0.625rem] leading-snug opacity-85 sm:text-xs">
            {COURSE.level} · {COURSE.teacherRole} {COURSE.teacherName}
          </span>
        </p>

        <Emblem logo={LOGOS.uae2031} className="h-9 sm:h-14" />
      </div>
    </section>
  );
}
