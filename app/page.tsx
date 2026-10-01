import Link from "next/link";

import { navTree } from "@/lib/content/nav";

export default function HomePage() {
  const tree = navTree();

  return (
    <div>
      <header>
        <h1 className="font-heading text-3xl font-semibold tracking-tight">
          IELTS General Training
        </h1>
        <p className="measure mt-3 text-ink-muted">
          The method, marked practice, and an explanation for every answer.
        </p>
      </header>

      <nav aria-label="Course contents" className="mt-10">
        <h2 className="font-heading text-xs font-semibold tracking-wide text-ink-muted uppercase">
          Contents
        </h2>
        <ul className="measure mt-3 border-t border-rule">
          {tree.map((part) => (
            <li key={part.id} className="border-b border-rule">
              <Link
                href={part.href}
                className="grid gap-x-3 py-3.5 hover:bg-surface-hover focus-visible:bg-surface-hover sm:grid-cols-[5.5rem_1fr]"
              >
                <span className="font-heading text-xs font-semibold tracking-wide text-brand uppercase sm:pt-0.5">
                  {part.label}
                </span>
                <span>
                  <span className="block">{part.title}</span>
                  <span className="block text-sm text-ink-muted">
                    {part.summary}
                  </span>
                </span>
              </Link>
            </li>
          ))}
        </ul>
      </nav>
    </div>
  );
}
