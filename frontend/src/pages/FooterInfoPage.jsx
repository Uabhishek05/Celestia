import { useMemo } from "react";
import { Link, useSearchParams } from "react-router-dom";
import Seo from "../components/common/Seo";
import { footerSections } from "../data/footerContent";

export default function FooterInfoPage() {
  const [searchParams] = useSearchParams();
  const sectionId = searchParams.get("section");

  const orderedSections = useMemo(() => {
    if (!sectionId) {
      return footerSections;
    }

    const selected = footerSections.find((section) => section.id === sectionId);
    if (!selected) {
      return footerSections;
    }

    return [selected, ...footerSections.filter((section) => section.id !== sectionId)];
  }, [sectionId]);

  return (
    <section className="container-shell py-10">
      <Seo title="Store Guide" description="Helpful store information, category overviews, and support details." />
      <div className="mx-auto max-w-5xl">
        <div className="glass-panel p-8">
          <p className="text-xs uppercase tracking-[0.24em] text-clay">Celestia Guide</p>
          <h1 className="section-title mt-3">Store information in one place</h1>
          <p className="mt-4 max-w-3xl text-base leading-7 text-ink/70 dark:text-pearl/70">
            This page expands the footer links into readable descriptions, so the footer stays clean while customers can still open the full details in a separate tab.
          </p>

          <div className="mt-6 flex flex-wrap gap-3">
            {footerSections.map((section) => (
              <Link
                key={section.id}
                to={`/footer-info?section=${section.id}`}
                target="_blank"
                rel="noreferrer"
                className="btn-secondary"
              >
                {section.title}
              </Link>
            ))}
          </div>
        </div>

        <div className="mt-8 space-y-6">
          {orderedSections.map((section) => (
            <div key={section.id} className="glass-panel p-6">
              <h2 className="text-2xl font-semibold text-wine dark:text-pearl">{section.title}</h2>
              <p className="mt-3 text-sm leading-6 text-ink/70 dark:text-pearl/70">{section.intro}</p>

              <div className="mt-5 grid gap-4 md:grid-cols-2 xl:grid-cols-3">
                {section.items.map((item) => (
                  <div key={item.label} className="rounded-[24px] border border-white/15 bg-white/5 p-4">
                    <p className="font-semibold text-wine dark:text-pearl">{item.label}</p>
                    <p className="mt-2 text-sm leading-6 text-ink/70 dark:text-pearl/70">{item.description}</p>
                    {item.href ? (
                      <Link to={item.href} className="mt-4 inline-flex text-sm font-semibold text-clay hover:text-wine dark:hover:text-pearl">
                        Open category
                      </Link>
                    ) : null}
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
