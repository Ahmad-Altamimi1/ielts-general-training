import { Fragment } from "react";
import Link from "next/link";

import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from "@/components/ui/breadcrumb";

export type Crumb = { label: string; href?: string };

/** The trail to this page. The last crumb is the page itself and is not a
 *  link, which is what screen readers expect of a breadcrumb. */
export function Breadcrumbs({ trail }: { trail: Crumb[] }) {
  return (
    <Breadcrumb className="print-hidden">
      <BreadcrumbList className="text-sm">
        {trail.map((crumb, i) => {
          const last = i === trail.length - 1;
          return (
            // The separator is itself an <li>, so it is a sibling of the
            // item and never a child of it.
            <Fragment key={`${crumb.label}-${i}`}>
              <BreadcrumbItem>
                {last || !crumb.href ? (
                  <BreadcrumbPage className="text-ink-muted">
                    {crumb.label}
                  </BreadcrumbPage>
                ) : (
                  <BreadcrumbLink asChild>
                    <Link href={crumb.href}>{crumb.label}</Link>
                  </BreadcrumbLink>
                )}
              </BreadcrumbItem>
              {last ? null : <BreadcrumbSeparator />}
            </Fragment>
          );
        })}
      </BreadcrumbList>
    </Breadcrumb>
  );
}
