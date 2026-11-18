import Link from "next/link";
import {
  AlertCircle,
  ArrowRight,
  BadgeCheck,
  Building2,
  Calculator,
  Check,
  FileText,
  Globe,
  Layers,
  ListChecks,
  MapPin,
  RefreshCw,
  Scale,
  Search,
  ShieldCheck,
  Star,
  Users,
} from "lucide-react";
import { FIRM_TYPE_LABELS, getHighlights, getIndex } from "@/lib/data";
import { StealthAgentsAd } from "@/components/StealthAgentsAd";

const FEATURES = [
  {
    icon: Search,
    title: "Search every state, city and town",
    body: "Start with the market where your finance team or shared-service center is based and see every accounts payable provider listed there. The directory covers large metros and smaller markets, so you can compare nearby options instead of settling for the first result.",
    href: "/directory",
    link: "Browse the directory",
  },
  {
    icon: Star,
    title: "Compare ratings and review volume",
    body: "Each listing shows the provider's public rating and how many reviews sit behind it. A 4.9 from eight reviews is a very different signal from a 4.3 from 8,000, and the profiles explain that difference instead of hiding it.",
    href: "/top-rated",
    link: "See top-rated firms",
  },
  {
    icon: FileText,
    title: "Read an editorial profile, not a directory stub",
    body: "Provider pages include a plain-English brief and a longer review covering specialties, local market context, what the public rating suggests, who the firm may suit and what to ask before signing.",
    href: "/about",
    link: "How profiles work",
  },
  {
    icon: Layers,
    title: "Filter by the AP service you need",
    body: "Outsourced AP teams, automation platforms, invoice processors, bookkeeping firms and finance BPO providers do different work. Browse by specialty so you compare providers that solve the part of the invoice-to-pay cycle you need help with.",
    href: "/type/outsourcing",
    link: "Explore provider types",
  },
  {
    icon: MapPin,
    title: "Get contact details without a signup",
    body: "Phone numbers, websites, addresses and map links are visible on every listing. There is no paywall, no lead form and no obligation to hand over your email before you can call a provider.",
    href: "/search",
    link: "Search by name or city",
  },
  {
    icon: Scale,
    title: "Find alternatives in the same market",
    body: "Every provider page includes a comparison table and related providers in the same city, plus links to nearby cities. That makes it easy to build a shortlist of three or four firms and compare them on the same criteria.",
    href: "/directory",
    link: "Find local alternatives",
  },
];

const WHY = [
  {
    icon: Building2,
    title: "Invoice volume has outgrown the team",
    body: "When every invoice still needs a human to open, code and route it, month-end becomes a scramble. An AP provider adds capacity without a long hiring cycle, and can scale up for busy periods without permanent headcount.",
  },
  {
    icon: Users,
    title: "You are adding entities or markets",
    body: "New subsidiaries, currencies and payment rails multiply the work: vendor masters, tax forms, approval matrices and reconciliations. A provider that has done this before can standardize the process instead of rebuilding it for every entity.",
  },
  {
    icon: ShieldCheck,
    title: "You need stronger controls and an audit trail",
    body: "Duplicate payments, missed approvals and vendor fraud are expensive. Professional AP teams bring documented controls, segregation of duties, duplicate detection and a clean audit trail that stands up to review.",
  },
  {
    icon: RefreshCw,
    title: "You want faster closes and cleaner cash flow",
    body: "Late invoice capture hides liabilities and misses early-payment discounts. Better intake, coding and approval flow can shorten the close, reduce late fees and give finance a reliable view of what is due.",
  },
  {
    icon: Calculator,
    title: "You want AP reporting you can trust",
    body: "A good provider gives you an aging report, accruals, spend by vendor and entity, exception logs and payment status without a spreadsheet reconstruction. If your team currently chases receipts and approvals, this is often the biggest gain.",
  },
  {
    icon: AlertCircle,
    title: "You want a plan for exceptions and audits",
    body: "Missing POs, disputed invoices, vendor bank changes and audit sample requests are where AP breaks down. Ask any provider how exceptions are logged, who owns them and how fast they close before you need them.",
  },
];

const CHOOSE_STEPS = [
  {
    title: "Map your current invoice-to-pay process",
    body: "Write down how invoices arrive, who opens them, how they are coded and approved, which systems hold the vendor master and how payments are released. Include entity count, currencies, invoice volume and the peak month. That map is the brief every provider should respond to.",
  },
  {
    title: "Confirm system integrations and data flow",
    body: "Ask which ERPs and AP platforms the provider supports and how data moves between systems. Confirm whether integrations are native, API-based or file-based, who owns the mapping, and what happens when a field or approval rule changes.",
  },
  {
    title: "Compare the full pricing model",
    body: "Per-invoice, per-FTE, platform subscription and implementation fees are not directly comparable. Ask for an all-in monthly estimate at your current volume, plus the rate at a 2x spike. Confirm what is included for exceptions, vendor support, payments and reporting.",
  },
  {
    title: "Read the service agreement and SLAs line by line",
    body: "Look for turnaround commitments, accuracy targets, exception ownership, escalation paths, business-hours coverage, volume commitments, price escalation, termination notice and data return. If an SLA is vague, ask for a sample monthly scorecard.",
  },
  {
    title: "Check security, privacy and business continuity",
    body: "AP data includes bank details and vendor tax information. Ask for SOC 2 or ISO 27001 evidence, access controls, encryption, background checks, data residency, subprocessor list, breach notification and a tested continuity plan.",
  },
  {
    title: "Ask how duplicate and fraud controls work",
    body: "Confirm how the provider detects duplicate invoices, validates vendor bank changes, separates duties and flags unusual payments. Ask for the exception log from a recent month and how false positives are handled.",
  },
  {
    title: "Review a sample month-end close",
    body: "Ask for a redacted close calendar and a sample reporting pack. It should show accruals, aging, payment status, exceptions and open items without requiring the client to rebuild the numbers in a spreadsheet.",
  },
  {
    title: "Check communication and time-zone coverage",
    body: "Ask who answers questions, how quickly non-urgent requests are acknowledged, how urgent payment issues are routed and whether you get a named contact. A provider that is responsive during the sales process may behave differently after onboarding, so put the service standard in writing.",
  },
  {
    title: "Talk to references with your profile",
    body: "Ask for references from companies with similar invoice volume, ERP and entity structure. Read recent public reviews for patterns around accuracy, turnaround, communication and month-end support. One bad review is noise; a repeated complaint is a signal.",
  },
  {
    title: "Plan the transition and exit",
    body: "Confirm the implementation plan, data migration, parallel run, training and go-live support. Also confirm what happens at exit: who owns the data, how it is returned, how long access continues and whether there is a termination assistance fee.",
  },
];

const SERVICES = [
  {
    icon: Building2,
    title: "Outsourced accounts payable",
    body: "A managed team handles invoice intake, coding, approvals, vendor master, payment runs, statement reconciliation and AP reporting. Pricing is usually per invoice or per dedicated FTE, with a monthly minimum.",
  },
  {
    icon: RefreshCw,
    title: "AP automation platforms",
    body: "Software captures invoices, extracts line items, applies coding and approval rules, detects duplicates, routes exceptions and integrates with the ERP and payment rails. Pricing is commonly a subscription plus implementation.",
  },
  {
    icon: FileText,
    title: "Invoice processing and data capture",
    body: "Mailroom, email and portal intake, scanning, OCR, line-item extraction, validation, duplicate checks and indexing into the client's ERP or AP platform. Often priced per document or per 1,000 invoices.",
  },
  {
    icon: Calculator,
    title: "Bookkeeping and bill pay",
    body: "Transaction recording, bank reconciliation, bill payment, payroll support, month-end close and financial statements. Often a flat monthly fee based on transaction volume and entity count.",
  },
  {
    icon: Globe,
    title: "Finance and accounting BPO",
    body: "AP, AR, payroll, general ledger, reconciliation and reporting delivered from shared-service or offshore centers, with documented SLAs, controls and multi-entity support.",
  },
  {
    icon: ListChecks,
    title: "AP staffing and specialist support",
    body: "Dedicated AP clerks, specialists or interim controllers placed in your team, plus project support for ERP migrations, cleanup backlogs, vendor master remediation and audit preparation.",
  },
];

const FEES = [
  {
    service: "Per-invoice processing",
    range: "$0.25-$5.00 per invoice",
    note: "Low end is capture only; higher end includes coding, approvals, exceptions and vendor support. Confirm the minimum monthly volume.",
  },
  {
    service: "Dedicated AP FTE",
    range: "$1,200-$4,500 per month",
    note: "Offshore, nearshore and US-based rates vary widely. Confirm hours, time zone, supervision and what is included.",
  },
  {
    service: "AP automation subscription",
    range: "$500-$5,000+ per month",
    note: "Usually priced by invoice volume, users and modules. Implementation and ERP integration are often separate.",
  },
  {
    service: "Implementation and onboarding",
    range: "$0-$25,000+",
    note: "Covers process mapping, data migration, integration, training and parallel run. Larger ERP projects cost more.",
  },
  {
    service: "Payment processing",
    range: "Per payment or basis points",
    note: "Card, ACH and check fees may be bundled or passed through. Ask who earns rebates and how payment timing is controlled.",
  },
  {
    service: "Bookkeeping and bill pay",
    range: "$300-$2,500+ per month",
    note: "Driven by transaction volume, entity count, payroll and reporting depth. Confirm the close calendar.",
  },
  {
    service: "AP audit and cleanup project",
    range: "$2,500-$50,000+",
    note: "Scoped by backlog size, duplicates, vendor master issues and reconciliation gaps. Ask for a fixed-fee option.",
  },
  {
    service: "Finance and accounting BPO",
    range: "Custom, often per FTE",
    note: "Multi-process engagements are negotiated. Compare the cost per transaction, not only the monthly fee.",
  },
];

export function HomeContent() {
  const { firms, states, topCities } = getIndex();
  const { typeCounts, avgRating, ratedCount, reviewTotal } = getHighlights();
  const cityCount = topCities.length;
  const withSite = firms.filter((f) => f.website).length;
  const topStates = states.slice(0, 8);

  return (
    <div>
      <section id="features" className="border-t border-stone-200 bg-white">
        <div className="mx-auto max-w-6xl px-4 py-14">
          <div className="max-w-3xl">
            <p className="text-[11px] font-semibold uppercase tracking-wide text-brand">What you can do here</p>
            <h2 className="mt-2 font-display text-3xl tracking-tight sm:text-4xl">
              Compare local accounts payable providers in one place
            </h2>
            <p className="mt-4 text-[15px] leading-7 text-stone-600">
              Most finance teams do not need a list of every accounts payable provider in the country. They need a
              shortlist they can trust, in the market where they operate, with enough context to ask
              better questions. AccountsPayableDirectory.com is built around that job: find the relevant
              providers, compare the signals that matter, and contact them directly. The directory currently
              lists {firms.length.toLocaleString()} firms across {states.length} states and{" "}
              {cityCount.toLocaleString()} cities and towns, with {withSite.toLocaleString()} firms
              publishing a website and {reviewTotal.toLocaleString()} public reviews represented in the
              ratings shown on the site.
            </p>
          </div>

          <div className="mt-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {FEATURES.map((feature) => {
              const Icon = feature.icon;
              return (
                <div
                  key={feature.title}
                  className="flex h-full flex-col rounded-2xl border border-stone-200 bg-paper/60 p-5"
                >
                  <div className="grid h-10 w-10 place-items-center rounded-xl bg-brand/5 text-brand">
                    <Icon className="h-5 w-5" aria-hidden />
                  </div>
                  <h3 className="mt-4 font-semibold text-ink">{feature.title}</h3>
                  <p className="mt-2 flex-1 text-[14px] leading-6 text-stone-600">{feature.body}</p>
                  <Link
                    href={feature.href}
                    className="mt-4 inline-flex items-center gap-1 text-[13px] font-medium text-brand hover:underline"
                  >
                    {feature.link} <ArrowRight className="h-3.5 w-3.5" aria-hidden />
                  </Link>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      <section id="why-hire" className="border-t border-stone-200 bg-paper">
        <div className="mx-auto max-w-6xl px-4 py-14">
          <div className="grid gap-10 lg:grid-cols-[0.9fr_1.1fr] lg:gap-16">
            <div>
              <p className="text-[11px] font-semibold uppercase tracking-wide text-brand">
                When outsourcing AP pays off
              </p>
              <h2 className="mt-2 font-display text-3xl tracking-tight sm:text-4xl">
                What an accounts payable provider handles
              </h2>
              <p className="mt-4 text-[15px] leading-7 text-stone-600">
                A good AP provider clears the invoice backlog, tightens controls and produces a close you
                can audit. It is not right for every finance team, though. The question is whether the
                fee buys back more time, accuracy and control than it costs. For a 2,000-invoice-a-month
                company, the answer is often yes; for a 50-invoice business with a clean process, maybe not.
              </p>
              <p className="mt-4 text-[15px] leading-7 text-stone-600">
                Below are the situations where an outside AP provider tends to pay for itself, and the
                situations where an in-house team may reasonably keep the work. Use the comparison pages
                to see which providers specialize in the part of the process you need before you decide.
              </p>
              <div className="mt-6 flex flex-wrap gap-2">
                {(["Outsourced AP", "AP automation", "Invoice processing", "Bookkeeping", "Finance BPO"] as const).map(
                  (label, i) => {
                    const keys = ["outsourcing", "automation", "invoice", "bookkeeping", "bpo"] as const;
                    const key = keys[i];
                    return (
                      <Link
                        key={label}
                        href={`/type/${key}`}
                        className="inline-flex items-center gap-1.5 rounded-full border border-stone-300 bg-white px-3 py-1.5 text-[13px] text-stone-700 transition hover:border-brand/50 hover:text-brand"
                      >
                        {label}
                        <span className="text-stone-400">{typeCounts[key]?.toLocaleString()}</span>
                      </Link>
                    );
                  }
                )}
              </div>
            </div>

            <div className="grid gap-4 sm:grid-cols-2">
              {WHY.map((item) => {
                const Icon = item.icon;
                return (
                  <div key={item.title} className="rounded-xl border border-stone-200 bg-white p-4">
                    <div className="flex items-center gap-2">
                      <Icon className="h-4 w-4 text-brand" aria-hidden />
                      <h3 className="text-sm font-semibold text-ink">{item.title}</h3>
                    </div>
                    <p className="mt-2 text-[13px] leading-6 text-stone-600">{item.body}</p>
                  </div>
                );
              })}
            </div>
          </div>

          <div className="mt-8 rounded-2xl border border-amber-200 bg-amber-50/70 p-5 sm:p-6">
            <div className="flex items-start gap-3">
              <AlertCircle className="mt-0.5 h-5 w-5 shrink-0 text-amber-700" aria-hidden />
              <div>
                <h3 className="font-semibold text-amber-900">When you may not need an outside provider</h3>
                <p className="mt-1.5 text-[14px] leading-6 text-amber-900/80">
                  If your invoice volume is low, the process is already clean, approvals are fast and
                  your ERP handles most of the work, an outside provider may not pay off. The calculation
                  changes when volume grows, entities multiply, the backlog is aged, audit findings are
                  open or key AP staff leave. Compare the fee against overtime, late-payment penalties,
                  duplicate payments and the cost of a bad close.
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>

      <section id="how-to-choose" className="border-t border-stone-200 bg-white">
        <div className="mx-auto max-w-6xl px-4 py-14">
          <div className="max-w-3xl">
            <p className="text-[11px] font-semibold uppercase tracking-wide text-brand">
              A practical checklist
            </p>
            <h2 className="mt-2 font-display text-3xl tracking-tight sm:text-4xl">
              How to choose an accounts payable provider
            </h2>
            <p className="mt-4 text-[15px] leading-7 text-stone-600">
              A good process matters more than a polished website. Work through the same
              ten questions with every firm on your shortlist. The answers will separate firms that
              have a real operating process from firms that are selling a low headline fee.
            </p>
          </div>

          <ol className="mt-8 grid gap-4 sm:grid-cols-2">
            {CHOOSE_STEPS.map((step, i) => (
              <li key={step.title} className="flex gap-4 rounded-xl border border-stone-200 bg-paper/60 p-5">
                <span className="grid h-8 w-8 shrink-0 place-items-center rounded-full bg-brand text-sm font-semibold text-white">
                  {i + 1}
                </span>
                <div>
                  <h3 className="font-semibold text-ink">{step.title}</h3>
                  <p className="mt-1.5 text-[14px] leading-6 text-stone-600">{step.body}</p>
                </div>
              </li>
            ))}
          </ol>

          <div className="mt-6 flex flex-wrap items-center gap-3 text-[13px] text-stone-600">
            <span className="inline-flex items-center gap-1.5">
              <Check className="h-4 w-4 text-brand" aria-hidden /> Same checklist for every firm
            </span>
            <span className="inline-flex items-center gap-1.5">
              <Check className="h-4 w-4 text-brand" aria-hidden /> Get fees and terms in writing
            </span>
            <span className="inline-flex items-center gap-1.5">
              <Check className="h-4 w-4 text-brand" aria-hidden /> Ask for a sample month-end close
            </span>
          </div>
        </div>
      </section>

      <section id="services" className="border-t border-stone-200 bg-paper">
        <div className="mx-auto max-w-6xl px-4 py-14">
          <div className="max-w-3xl">
            <p className="text-[11px] font-semibold uppercase tracking-wide text-brand">
              What AP providers do
            </p>
            <h2 className="mt-2 font-display text-3xl tracking-tight sm:text-4xl">
              Accounts payable services, by provider type
            </h2>
            <p className="mt-4 text-[15px] leading-7 text-stone-600">
              The label &ldquo;accounts payable&rdquo; covers very different jobs. A managed AP team that
              processes invoices is not interchangeable with an automation platform that routes approvals,
              an invoice-capture shop that keys PDFs, or a BPO running the whole finance function. Use the
              specialty pages to filter for the work you need.
            </p>
          </div>
          <div className="mt-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {SERVICES.map((service) => {
              const Icon = service.icon;
              return (
                <div key={service.title} className="rounded-xl border border-stone-200 bg-white p-5">
                  <div className="flex items-center gap-2.5">
                    <span className="grid h-9 w-9 place-items-center rounded-lg bg-brand/5 text-brand">
                      <Icon className="h-4.5 w-4.5" aria-hidden />
                    </span>
                    <h3 className="text-sm font-semibold text-ink">{service.title}</h3>
                  </div>
                  <p className="mt-3 text-[13px] leading-6 text-stone-600">{service.body}</p>
                </div>
              );
            })}
          </div>

          <div className="mt-10">
            <StealthAgentsAd
              variant="strip"
              tone="dark"
              image="desk"
              placement="home-services"
              headline="Your AP inbox shouldn't own your week."
              body="Finance teams typically reclaim 15-25 hours a week by delegating invoice intake, coding, vendor follow-ups and payment tracking to a dedicated Stealth Agents assistant."
              cta="Hire an AP assistant"
            />
          </div>
        </div>
      </section>

      <section id="fees" className="border-t border-stone-200 bg-white">
        <div className="mx-auto max-w-6xl px-4 py-14">
          <div className="grid gap-10 lg:grid-cols-[0.8fr_1.2fr] lg:gap-14">
            <div>
              <p className="text-[11px] font-semibold uppercase tracking-wide text-brand">
                Pricing guide
              </p>
              <h2 className="mt-2 font-display text-3xl tracking-tight sm:text-4xl">
                What accounts payable services usually cost
              </h2>
              <p className="mt-4 text-[15px] leading-7 text-stone-600">
                The ranges below are typical US market ranges, not quotes. Fees vary by state, invoice
                volume, entity count, systems and the scope of work. A low per-invoice rate that excludes
                exceptions, vendor support and payments can be more expensive than a higher rate with a
                transparent all-in schedule.
              </p>
              <p className="mt-4 text-[15px] leading-7 text-stone-600">
                Ask every provider for a written fee schedule and a sample invoice. Confirm what is
                included, what is billed separately, and which fees apply at peak volume, for exceptions,
                for payment processing and at termination.
              </p>
              <div className="mt-6 rounded-xl border border-stone-200 bg-paper p-4 text-[13px] leading-6 text-stone-600">
                <p className="font-semibold text-ink">Rule of thumb</p>
                <p className="mt-1">
                  Compare the all-in monthly cost at your real invoice volume, not the headline
                  per-invoice rate. Include implementation, integrations, exceptions, vendor support,
                  payments, reporting and any minimum-volume charge.
                </p>
              </div>
            </div>

            <div className="overflow-x-auto rounded-xl border border-stone-200">
              <table className="w-full min-w-[620px] border-collapse text-left text-sm">
                <thead>
                  <tr className="border-b border-stone-200 bg-stone-50 text-[11px] uppercase tracking-wide text-stone-500">
                    <th scope="col" className="px-4 py-3 font-semibold">Fee type</th>
                    <th scope="col" className="px-4 py-3 font-semibold">Typical range</th>
                    <th scope="col" className="px-4 py-3 font-semibold">What to confirm</th>
                  </tr>
                </thead>
                <tbody>
                  {FEES.map((fee) => (
                    <tr key={fee.service} className="border-b border-stone-100 last:border-0">
                      <td className="px-4 py-3 font-medium text-ink">{fee.service}</td>
                      <td className="px-4 py-3 text-stone-700">
                        {fee.range}
                      </td>
                      <td className="px-4 py-3 text-stone-600">{fee.note}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      </section>

      <section id="methodology" className="border-t border-stone-200 bg-paper">
        <div className="mx-auto max-w-6xl px-4 py-14">
          <div className="grid gap-10 lg:grid-cols-2 lg:gap-16">
            <div>
              <p className="text-[11px] font-semibold uppercase tracking-wide text-brand">
                Trust and methodology
              </p>
              <h2 className="mt-2 font-display text-3xl tracking-tight sm:text-4xl">
                How firms get listed
              </h2>
              <p className="mt-4 text-[15px] leading-7 text-stone-600">
                Listings come from public business profiles. Firms do not
                pay to appear, and payment does not change the order of search results. The public
                rating and review count shown on a listing come from the underlying business profile;
                they are not our own star ratings.
              </p>
              <p className="mt-4 text-[15px] leading-7 text-stone-600">
                The longer company profiles use the listing data and local market context: the
                firm&rsquo;s categories, city, state, public rating, review volume and the mix of AP
                specialties around it. They help you ask better questions. They are not customer reviews or
                endorsements.
              </p>
              <p className="mt-4 text-[15px] leading-7 text-stone-600">
                Data changes. A firm may move, change its phone number, add a service line or stop
                taking new clients. If you spot something that is out of date, use the correction link
                on the listing. Firms can also claim their listing to correct details or ask for it to
                be removed.
              </p>
              <div className="mt-6 flex flex-wrap gap-3">
                <Link
                  href="/about"
                  className="inline-flex items-center gap-1.5 rounded-lg bg-brand px-4 py-2.5 text-sm font-semibold text-white hover:bg-brand-light"
                >
                  About the data <ArrowRight className="h-4 w-4" aria-hidden />
                </Link>
                <Link
                  href="/top-rated"
                  className="inline-flex items-center gap-1.5 rounded-lg border border-stone-300 bg-white px-4 py-2.5 text-sm font-semibold text-stone-800 hover:border-brand/50 hover:text-brand"
                >
                  How top-rated works
                </Link>
              </div>
            </div>

            <div className="grid gap-4 sm:grid-cols-2">
              <div className="rounded-xl border border-stone-200 bg-white p-5">
                <BadgeCheck className="h-5 w-5 text-brand" aria-hidden />
                <p className="mt-3 text-2xl font-semibold text-brand">{firms.length.toLocaleString()}</p>
                <p className="mt-1 text-sm font-medium text-ink">Firms listed</p>
                <p className="mt-1 text-[12px] leading-5 text-stone-600">
                  Outsourced AP, automation, invoice processing, bookkeeping and finance BPO.
                </p>
              </div>
              <div className="rounded-xl border border-stone-200 bg-white p-5">
                <MapPin className="h-5 w-5 text-brand" aria-hidden />
                <p className="mt-3 text-2xl font-semibold text-brand">{states.length}</p>
                <p className="mt-1 text-sm font-medium text-ink">States and DC</p>
                <p className="mt-1 text-[12px] leading-5 text-stone-600">
                  Browse every state, then every city and town within it.
                </p>
              </div>
              <div className="rounded-xl border border-stone-200 bg-white p-5">
                <Star className="h-5 w-5 text-amber-500" aria-hidden />
                <p className="mt-3 text-2xl font-semibold text-brand">{avgRating.toFixed(1)}</p>
                <p className="mt-1 text-sm font-medium text-ink">Average public rating</p>
                <p className="mt-1 text-[12px] leading-5 text-stone-600">
                  Across {ratedCount.toLocaleString()} firms with a public rating.
                </p>
              </div>
              <div className="rounded-xl border border-stone-200 bg-white p-5">
                <Users className="h-5 w-5 text-brand" aria-hidden />
                <p className="mt-3 text-2xl font-semibold text-brand">{reviewTotal.toLocaleString()}</p>
                <p className="mt-1 text-sm font-medium text-ink">Public reviews represented</p>
                <p className="mt-1 text-[12px] leading-5 text-stone-600">
                  Review volume is shown so you can judge how much weight a rating deserves.
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>

      <section id="coverage" className="border-t border-stone-200 bg-white">
        <div className="mx-auto max-w-6xl px-4 py-14">
          <div className="flex flex-wrap items-end justify-between gap-4">
            <div className="max-w-3xl">
              <p className="text-[11px] font-semibold uppercase tracking-wide text-brand">Coverage</p>
              <h2 className="mt-2 font-display text-3xl tracking-tight sm:text-4xl">
                National coverage, local comparison
              </h2>
              <p className="mt-4 text-[15px] leading-7 text-stone-600">
                The directory spans {states.length} states and {cityCount.toLocaleString()} cities and
                towns, from the largest metros to smaller markets where the local provider may be the only
                professional option. Coverage is strongest in states with dense finance, insurance,
                healthcare and professional-services sectors, but every state page lists its cities and
                every city page lists the providers we have found there.
              </p>
            </div>
            <Link href="/directory" className="text-sm font-medium text-brand hover:underline">
              All states and cities →
            </Link>
          </div>

          <div className="mt-6 grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
            {topStates.map((s) => (
              <Link
                key={s.code}
                href={`/state/${s.code.toLowerCase()}`}
                className="group rounded-xl border border-stone-200 bg-paper/60 px-4 py-3 transition hover:border-brand/30 hover:bg-white"
              >
                <div className="flex items-center justify-between">
                  <span className="font-semibold text-ink group-hover:text-brand">{s.name}</span>
                  <span className="rounded bg-stone-100 px-1.5 py-0.5 text-[11px] font-medium text-stone-600">
                    {s.code}
                  </span>
                </div>
                <div className="mt-1 text-[12px] text-stone-600">
                  {s.count.toLocaleString()} firms · {s.cities} cities
                </div>
              </Link>
            ))}
          </div>

          <div className="mt-6 rounded-xl border border-stone-200 bg-paper/60 p-5">
            <p className="text-[13px] leading-6 text-stone-600">
              Looking for a specific provider? Search by company name. Looking for a market? Start with the
              state and city pages. Looking for a specialty? Use the provider-type pages to compare
              outsourced AP, automation, invoice processing, bookkeeping and BPO firms on the same criteria.
            </p>
            <div className="mt-3 flex flex-wrap gap-2">
              <Link
                href="/type/outsourcing"
                className="rounded-full border border-stone-300 bg-white px-3 py-1.5 text-[12px] text-stone-700 hover:border-brand/50 hover:text-brand"
              >
                {FIRM_TYPE_LABELS.outsourcing} ({typeCounts.outsourcing?.toLocaleString()})
              </Link>
              <Link
                href="/type/automation"
                className="rounded-full border border-stone-300 bg-white px-3 py-1.5 text-[12px] text-stone-700 hover:border-brand/50 hover:text-brand"
              >
                {FIRM_TYPE_LABELS.automation} ({typeCounts.automation?.toLocaleString()})
              </Link>
              <Link
                href="/type/invoice"
                className="rounded-full border border-stone-300 bg-white px-3 py-1.5 text-[12px] text-stone-700 hover:border-brand/50 hover:text-brand"
              >
                {FIRM_TYPE_LABELS.invoice} ({typeCounts.invoice?.toLocaleString()})
              </Link>
              <Link
                href="/type/bookkeeping"
                className="rounded-full border border-stone-300 bg-white px-3 py-1.5 text-[12px] text-stone-700 hover:border-brand/50 hover:text-brand"
              >
                {FIRM_TYPE_LABELS.bookkeeping} ({typeCounts.bookkeeping?.toLocaleString()})
              </Link>
              <Link
                href="/type/bpo"
                className="rounded-full border border-stone-300 bg-white px-3 py-1.5 text-[12px] text-stone-700 hover:border-brand/50 hover:text-brand"
              >
                {FIRM_TYPE_LABELS.bpo} ({typeCounts.bpo?.toLocaleString()})
              </Link>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
