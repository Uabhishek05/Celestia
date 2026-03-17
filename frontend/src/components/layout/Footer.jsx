import { footerSections } from "../../data/footerContent";

export default function Footer() {
  return (
    <footer className="border-t border-white/20 bg-white/50 py-10 dark:bg-white/5">
      <div className="container-shell grid gap-8 md:grid-cols-4">
        <div>
          <h3 className="font-display text-2xl text-wine dark:text-pearl">Celestia</h3>
          <p className="mt-3 text-sm text-ink/70 dark:text-pearl/70">
            Premium accessories, curated gifting, and elevated everyday details.
          </p>
        </div>
        <div>
          <h4 className="font-semibold">{footerSections[0].title}</h4>
          <ul className="mt-3 space-y-2 text-sm text-ink/70 dark:text-pearl/70">
            {footerSections[0].items.map((item) => (
              <li key={item.label}>
                <a
                  href="/footer-info?section=shop"
                  target="_blank"
                  rel="noreferrer"
                  className="transition hover:text-wine dark:hover:text-pearl"
                >
                  {item.label}
                </a>
              </li>
            ))}
          </ul>
        </div>
        <div>
          <h4 className="font-semibold">{footerSections[1].title}</h4>
          <ul className="mt-3 space-y-2 text-sm text-ink/70 dark:text-pearl/70">
            {footerSections[1].items.map((item) => (
              <li key={item.label}>
                <a
                  href="/footer-info?section=support"
                  target="_blank"
                  rel="noreferrer"
                  className="transition hover:text-wine dark:hover:text-pearl"
                >
                  {item.label}
                </a>
              </li>
            ))}
          </ul>
        </div>
        <div>
          <h4 className="font-semibold">{footerSections[2].title}</h4>
          <ul className="mt-3 space-y-2 text-sm text-ink/70 dark:text-pearl/70">
            {footerSections[2].items.map((item) => (
              <li key={item.label}>
                <a
                  href="/footer-info?section=newsletter"
                  target="_blank"
                  rel="noreferrer"
                  className="transition hover:text-wine dark:hover:text-pearl"
                >
                  {item.label}
                </a>
              </li>
            ))}
          </ul>
        </div>
      </div>
    </footer>
  );
}
