import { NAV, SITE, waLink } from "@/data/site";
import { DAY_SHORT, HOURS, WEEK_ORDER } from "@/data/hours";
import { hm } from "@/utils/format";
import { IconFacebook, IconInstagram, IconWhatsApp } from "@/components/ui/Icons";

export function Footer() {
  const open = WEEK_ORDER.filter((d) => HOURS[d]);
  return (
    <footer className="border-t border-text/10 pb-[calc(var(--dock-h)+32px)] pt-16 lg:pb-12">
      <div className="container-x grid gap-12 md:grid-cols-[1.2fr_1fr_1fr_1fr]">
        <div>
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src="/brand/logo.svg" alt="The Bridge Burger & Co." width={180} height={203} className="h-auto w-[150px]" />
          <p className="mt-5 max-w-[30ch] text-sm leading-relaxed text-muted">{SITE.bio}</p>
        </div>

        <div>
          <h2 className="text-sm font-semibold text-text">Endereço</h2>
          <address className="mt-3 text-sm not-italic leading-relaxed text-muted">
            {SITE.address.street}
            <br />
            {SITE.address.complement}
            <br />
            {SITE.address.district}, {SITE.address.city} - {SITE.address.state}
            <br />
            {SITE.address.postalCode}
          </address>
          <a href={SITE.directionsUrl} target="_blank" rel="noopener noreferrer" className="mt-3 inline-block text-sm text-primary underline-offset-4 hover:underline">
            Como chegar
          </a>
        </div>

        <div>
          <h2 className="text-sm font-semibold text-text">Horário</h2>
          <ul className="mt-3 space-y-1 text-sm text-muted">
            {open.map((d) => (
              <li key={d} className="flex justify-between gap-4 tabular-nums">
                <span>{DAY_SHORT[d]}</span>
                <span>
                  {hm(HOURS[d]!.open)}–{hm(HOURS[d]!.close)}
                </span>
              </li>
            ))}
            <li className="flex justify-between gap-4">
              <span>Seg e Ter</span>
              <span>Fechado</span>
            </li>
          </ul>
        </div>

        <div>
          <h2 className="text-sm font-semibold text-text">Contato</h2>
          <ul className="mt-3 space-y-2 text-sm">
            <li>
              <a href={waLink("Olá, The Bridge!")} target="_blank" rel="noopener noreferrer" className="inline-flex items-center gap-2 text-muted transition-colors hover:text-text">
                <IconWhatsApp size={16} /> {SITE.phoneDisplay}
              </a>
            </li>
            <li>
              <a href={SITE.instagram.url} target="_blank" rel="noopener noreferrer" className="inline-flex items-center gap-2 text-muted transition-colors hover:text-text">
                <IconInstagram size={16} /> {SITE.instagram.handle}
              </a>
            </li>
            <li>
              <a href={SITE.facebook} target="_blank" rel="noopener noreferrer" className="inline-flex items-center gap-2 text-muted transition-colors hover:text-text">
                <IconFacebook size={16} /> Facebook
              </a>
            </li>
          </ul>
        </div>
      </div>

      <div className="container-x mt-14 flex flex-col gap-4 border-t border-text/10 pt-6 text-xs text-muted sm:flex-row sm:items-center sm:justify-between">
        <p>© {new Date().getFullYear()} {SITE.legalName} · Hamburgueria artesanal em Guarulhos</p>
        <nav aria-label="Rodapé">
          <ul className="flex gap-5">
            {NAV.map((n) => (
              <li key={n.href}>
                <a href={n.href} className="hover:text-text">
                  {n.label}
                </a>
              </li>
            ))}
          </ul>
        </nav>
      </div>
    </footer>
  );
}
