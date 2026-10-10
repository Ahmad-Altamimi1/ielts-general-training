import Image from "next/image";

import { brandLogos } from "@/lib/brand";
import { COURSE } from "@/lib/course";
import { cn } from "@/lib/utils";

/**
 * The name of the course, with the school's logo in front of it when there
 * is one. Used in the sidebar and in the top bar.
 *
 * With no logo file present this is just the wordmark — no empty frame and
 * no placeholder, because a box reserved for something that is not there
 * looks like a fault rather than a slot.
 */
export function BrandMark({
  className,
  logoClassName = "h-7 w-auto",
}: {
  className?: string;
  logoClassName?: string;
}) {
  const [logo] = brandLogos();

  return (
    <span className={cn("flex min-w-0 items-center gap-2.5", className)}>
      {logo ? (
        <Image
          src={logo.src}
          alt=""
          width={logo.width}
          height={logo.height}
          className={cn("shrink-0 object-contain", logoClassName)}
          unoptimized={logo.vector}
          priority
        />
      ) : null}
      <span className="font-heading truncate text-base leading-tight font-semibold tracking-tight">
        {COURSE.title}
      </span>
    </span>
  );
}
