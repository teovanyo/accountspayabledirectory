import Link from "next/link";
import { notFound } from "next/navigation";
import type { Metadata } from "next";
import { firmsByType, typeStateCounts, FIRM_TYPE_LABELS, FIRM_TYPES, type FirmType } from "@/lib/data";
import { Breadcrumbs, Pagination } from "@/components/Nav";
import { FirmCard } from "@/components/FirmCard";
import { StealthAgentsAd } from "@/components/StealthAgentsAd";

type Props = {
  params: Promise<{ type: string }>;
  searchParams: Promise<{ page?: string }>;
};

const COPY: Record<FirmType, { title: string; intro: string; seoDescription: string; short: string }> = {
  outsourcing: {
    title: "Outsourced accounts payable companies",
    intro:
      "Outsourced AP providers run the invoice-to-pay process for you: invoice intake, coding, approvals, vendor master, payment runs, statement reconciliation and AP reporting.",
    seoDescription:
      "Compare outsourced accounts payable companies across the US. Find managed AP teams for invoice processing, vendor management, payments and month-end close.",
    short: "Find managed AP teams for invoice processing and payments.",
  },
  automation: {
    title: "AP automation platforms",
    intro:
      "AP automation platforms capture invoices, extract line items, apply coding and approval rules, detect duplicates, route exceptions and integrate with the ERP and payment rails.",
    seoDescription:
      "Compare AP automation platforms across the US. Find accounts payable software for invoice capture, approval workflows, duplicate detection and ERP integration.",
    short: "Find AP software for capture, approvals and ERP integration.",
  },
  invoice: {
    title: "Invoice processing and data capture services",
    intro:
      "Invoice processing providers handle mailroom and email intake, scanning, OCR, line-item extraction, validation, duplicate checks and indexing into the client's ERP or AP platform.",
    seoDescription:
      "Compare invoice processing services across the US. Find providers for scanning, OCR, data extraction, validation and ERP indexing.",
    short: "Find providers for scanning, OCR and invoice data extraction.",
  },
  bookkeeping: {
    title: "Bookkeeping and accounts payable services",
    intro:
      "Bookkeeping and accounting firms cover transaction recording, reconciliation, bill pay, payroll support, month-end close and financial statements, often with AP included.",
    seoDescription:
      "Compare bookkeeping and accounts payable services across the US. Find firms for bill pay, reconciliation, month-end close and financial reporting.",
    short: "Find firms for bill pay, reconciliation and month-end close.",
  },
  bpo: {
    title: "Finance and accounting BPO providers",
    intro:
      "Finance and accounting BPO providers run AP, AR, payroll, general ledger, reconciliation and reporting from shared-service or offshore delivery centers.",
    seoDescription:
      "Compare finance and accounting BPO providers across the US. Find outsourced AP, AR, payroll and reporting teams with documented SLAs and controls.",
    short: "Find outsourced finance teams for AP, AR and reporting.",
  },
};

const TYPE_GUIDE: Record<
  FirmType,
  {
    heading: string;
    what: string;
    fees: string;
    questions: string;
    faqs: { q: string; a: string }[];
  }
> = {
  outsourcing: {
    heading: "Outsourced accounts payable: what finance teams should know",
    what: "An outsourced AP provider takes over some or all of the invoice-to-pay cycle. That usually means receiving invoices by email, mail or portal, capturing and coding them, matching purchase orders and receipts, routing approvals, maintaining the vendor master, running payment files, reconciling vendor statements and producing AP reports. Many providers also handle vendor inquiries and 1099 preparation.",
    fees: "Pricing is usually per invoice or per dedicated full-time equivalent, with a monthly minimum. Per-invoice pricing can range from a few cents for capture to several dollars for full processing with exceptions. Dedicated staff are commonly priced monthly. Implementation, integrations, payment processing and reporting may be separate. Compare the all-in monthly cost at your real volume, including peak months.",
    questions: "Ask how invoices arrive, how coding and approvals are handled, how duplicate and vendor-bank-change fraud controls work, what the exception SLA is and who owns escalations. Confirm ERP and AP platform integrations, security certifications, data ownership, reporting, volume commitments, price escalation and termination assistance. Ask for a sample month-end close and a reference with your invoice profile.",
    faqs: [
      {
        q: "How much does outsourced accounts payable cost?",
        a: "Most providers price per invoice or per dedicated FTE. Per-invoice rates commonly run from a few cents for capture to several dollars for full processing, and dedicated AP staff are often priced monthly. Implementation, integrations and payments may be separate. Request an all-in monthly estimate at your current and peak volume.",
      },
      {
        q: "What does an outsourced AP provider do?",
        a: "Typical work includes invoice intake, capture, coding, matching, approval routing, vendor master maintenance, payment runs, statement reconciliation and AP reporting. Some providers also handle vendor inquiries, 1099s and audit support. Confirm the exact scope in the service agreement.",
      },
      {
        q: "Should I outsource AP or hire an in-house clerk?",
        a: "Outsourcing can be faster to start and easier to scale, and it may bring stronger controls and coverage than a single clerk. An in-house hire may fit better when invoice volume is low, approvals require deep internal context or you want the work on site. Compare total cost, coverage, controls and management time.",
      },
    ],
  },
  automation: {
    heading: "AP automation: what the software actually does",
    what: "AP automation platforms capture invoices from email, EDI and supplier portals, extract line-item data, apply coding and approval rules, detect duplicates, route exceptions and hand approved bills to the ERP or payment system. Most include dashboards, audit trails, role-based access and integrations with tools such as NetSuite, QuickBooks, Sage Intacct, SAP, Oracle, Coupa and Bill.com. Some platforms also run payments.",
    fees: "Pricing is usually a subscription based on invoice volume, users and modules, plus an implementation fee for process mapping, integration and training. Payment processing may be included or priced per transaction. Compare the total first-year cost, including implementation and any ERP customization, and ask how the price changes as volume grows.",
    questions: "Ask for a live demo using your own invoice types and approval rules, not a generic sample. Confirm which integrations are native, how the data mapping is maintained, how exceptions are handled, how duplicates and vendor bank changes are detected, and what the audit trail shows. Ask about security certifications, uptime, data ownership, implementation timeline and exit/data-export terms.",
    faqs: [
      {
        q: "How much does AP automation cost?",
        a: "Most platforms charge a subscription based on invoice volume, users and modules, plus implementation. Smaller deployments can start in the hundreds per month; larger multi-entity implementations with ERP integration cost more. Ask for a total first-year cost and the price at 2x volume.",
      },
      {
        q: "What does AP automation software do?",
        a: "It captures invoices, extracts line-item data, applies coding and approval rules, detects duplicates, routes exceptions, stores an audit trail and integrates with the ERP and payment system. Some platforms also execute payments and reconcile statements.",
      },
      {
        q: "Do I still need an AP team with automation?",
        a: "Usually yes, but the work changes. Automation reduces keying and chasing; people still handle exceptions, vendor issues, controls, month-end close and judgment calls. Some companies pair automation with an outsourced team for exactly that reason.",
      },
    ],
  },
  invoice: {
    heading: "Invoice processing and data capture",
    what: "Invoice processing providers convert paper, PDF and portal invoices into clean data in your ERP or AP platform. The work can include mailroom handling, scanning, OCR, line-item extraction, validation against purchase orders or contracts, duplicate checks, coding, exception routing and indexing. Some providers also process expense receipts, remittances and other financial documents.",
    fees: "Pricing is commonly per document, per 1,000 invoices or per FTE, with volume tiers. Paper mail handling, scanning, validation and exception handling may be priced separately. Compare the cost per clean, validated invoice rather than the cost per scan, and ask how rejected or illegible documents are handled.",
    questions: "Ask for a sample of extracted line items from your own invoice formats, not a demo file. Confirm accuracy targets, how exceptions and illegible documents are handled, turnaround times, duplicate detection, security and data retention. Ask how the provider handles new invoice templates, supplier portals and peak volume, and what happens when volume drops.",
    faqs: [
      {
        q: "How much does invoice processing cost?",
        a: "Most providers charge per document or per 1,000 invoices, often with volume tiers. Capture-only work is cheaper than full validation, coding and exception handling. Ask for the cost per clean, validated invoice and any minimum monthly volume.",
      },
      {
        q: "What is the difference between invoice processing and AP automation?",
        a: "Invoice processing is a service that extracts and validates invoice data, often with people involved. AP automation is software that also handles workflow, approvals, duplicates and sometimes payments. Many companies use a processing service to feed an AP automation platform.",
      },
      {
        q: "How accurate is OCR invoice extraction?",
        a: "Accuracy depends on invoice quality, format variety and validation rules. Straightforward digital invoices can be very accurate; scans, handwriting and unusual layouts are harder. Ask for the accuracy target and the exception process, and test with your own invoice mix.",
      },
    ],
  },
  bookkeeping: {
    heading: "Bookkeeping and accounts payable",
    what: "Bookkeeping and accounting firms record transactions, reconcile bank and credit card accounts, pay bills, support payroll, close the books monthly and produce financial statements. For many small and mid-sized businesses, AP is handled inside the monthly close rather than as a separate service. Firms usually work in QuickBooks Online, Xero, NetSuite or Sage.",
    fees: "Pricing is often a flat monthly fee based on transaction volume, entity count, payroll and reporting depth. Catch-up work, cleanup, tax filing and advisory are commonly separate. Ask what the monthly fee includes, how the close calendar works, what happens during tax season and whether AP approval workflows are included.",
    questions: "Ask who will actually do the work, how often accounts are reconciled, what the close calendar looks like, which reports you receive and how sales tax, payroll and 1099s are handled. Confirm the software, document request process, response time, security controls and what happens if you leave.",
    faqs: [
      {
        q: "How much does bookkeeping with AP cost?",
        a: "Most firms charge a flat monthly fee based on transaction volume, entity count, payroll and reporting. Simple single-entity bookkeeping can start in the hundreds per month; multi-entity businesses with AP workflows and reporting cost more. Ask what is included and what is billed separately.",
      },
      {
        q: "Does a bookkeeper handle accounts payable?",
        a: "Often, yes, at least bill entry, payment scheduling and reconciliation. Some bookkeepers also run approval workflows and vendor management; others expect the client to approve bills. Confirm the AP scope in writing.",
      },
      {
        q: "Can a bookkeeper replace an AP department?",
        a: "For small businesses, a bookkeeper can often cover AP as part of the monthly close. For higher invoice volume, multi-entity operations or complex approvals, a dedicated AP team or automation platform is usually a better fit, sometimes alongside the bookkeeper.",
      },
    ],
  },
  bpo: {
    heading: "Finance and accounting BPO",
    what: "Finance and accounting BPO providers run AP, AR, payroll, general ledger, reconciliation and reporting for clients, often from shared-service or offshore delivery centers. Engagements range from staff augmentation to a managed process or a full finance function. Mature providers document SLAs, controls, escalation paths and business continuity.",
    fees: "Pricing is usually custom and often expressed per FTE or per transaction. Multi-process engagements bundle AP, AR and GL, so compare the cost per transaction and the total monthly fee rather than the headcount rate alone. Implementation, transition, technology and peak-volume support may be separate.",
    questions: "Ask which processes are in scope, which are excluded and who owns exceptions. Confirm the delivery locations, time-zone coverage, language support, security certifications, subprocessors, controls, reporting and business continuity plan. Ask for references at your scale, a transition plan and clear exit and data-return terms.",
    faqs: [
      {
        q: "What does a finance and accounting BPO do?",
        a: "It runs finance processes such as AP, AR, payroll, general ledger, reconciliation and reporting, either as staff augmentation or a managed service. Scope, SLAs and controls should be documented in the agreement.",
      },
      {
        q: "How is finance BPO priced?",
        a: "Pricing is usually custom, often per FTE or per transaction. Multi-process deals bundle several functions, so compare the all-in monthly cost and cost per transaction, including implementation and technology fees.",
      },
      {
        q: "Is finance BPO safe for sensitive AP data?",
        a: "It can be, if the provider has strong controls. Ask for SOC 2 or ISO 27001 evidence, access management, background checks, encryption, a subprocessor list, breach notification and a tested continuity plan. Confirm data ownership and return terms before signing.",
      },
    ],
  },
};

export function generateStaticParams() {
  return FIRM_TYPES.map((type) => ({ type }));
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { type } = await params;
  if (!FIRM_TYPES.includes(type as FirmType)) return { title: "Not found" };
  const copy = COPY[type as FirmType];
  const count = firmsByType(type as FirmType).length;
  const states = typeStateCounts(type as FirmType).length;
  const year = new Date().getFullYear();
  const canonical = `https://accountspayabledirectory.com/type/${type}`;
  const title = `${copy.title} in the US (${year})`;
  const description = `Compare ${count.toLocaleString()} ${copy.title.toLowerCase()} across ${states} states. ${copy.short}`;
  return {
    title: { absolute: title },
    description,
    keywords: [
      copy.title.toLowerCase(),
      `${type} accounts payable`,
      `${type} accounts payable providers`,
      `find ${type} accounts payable`,
      `best ${type} accounts payable companies`,
    ],
    alternates: { canonical },
    openGraph: {
      type: "website",
      url: canonical,
      siteName: "Accounts Payable Directory",
      title,
      description,
    },
    twitter: { card: "summary", title, description },
    robots: { index: true, follow: true },
  };
}

export default async function TypePage({ params, searchParams }: Props) {
  const { type } = await params;
  const { page } = await searchParams;
  if (!FIRM_TYPES.includes(type as FirmType)) notFound();
  const t = type as FirmType;
  const copy = COPY[t];
  const firms = [...firmsByType(t)].sort(
    (a, b) => (b.reviews || 0) - (a.reviews || 0) || a.name.localeCompare(b.name)
  );
  const states = typeStateCounts(t);
  const guide = TYPE_GUIDE[t];
  const topFirms = firms.slice(0, 10);
  const year = new Date().getFullYear();
  const canonical = `https://accountspayabledirectory.com/type/${t}`;
  const jsonLd = {
    "@context": "https://schema.org",
    "@graph": [
      {
        "@type": "CollectionPage",
        "@id": canonical,
        url: canonical,
        name: `${copy.title} in the United States`,
        description: copy.intro,
        isPartOf: { "@type": "WebSite", "@id": "https://accountspayabledirectory.com/#website" },
        breadcrumb: { "@id": `${canonical}#breadcrumb` },
        mainEntity: { "@id": `${canonical}#firms` },
      },
      {
        "@type": "BreadcrumbList",
        "@id": `${canonical}#breadcrumb`,
        itemListElement: [
          { "@type": "ListItem", position: 1, name: "Home", item: "https://accountspayabledirectory.com/" },
          { "@type": "ListItem", position: 2, name: FIRM_TYPE_LABELS[t], item: canonical },
        ],
      },
      {
        "@type": "ItemList",
        "@id": `${canonical}#firms`,
        name: copy.title,
        numberOfItems: topFirms.length,
        itemListElement: topFirms.map((f, i) => ({
          "@type": "ListItem",
          position: i + 1,
          name: f.name,
          url: `https://accountspayabledirectory.com/firm/${f.slug}`,
        })),
      },
      {
        "@type": "FAQPage",
        "@id": `${canonical}#faq`,
        mainEntity: guide.faqs.map((faq) => ({
          "@type": "Question",
          name: faq.q,
          acceptedAnswer: { "@type": "Answer", text: faq.a },
        })),
      },
    ],
  };
  const perPage = 24;
  const current = Math.max(1, Number(page) || 1);
  const slice = firms.slice((current - 1) * perPage, current * perPage);
  const pages = Math.ceil(firms.length / perPage);

  return (
    <div>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />
      <section className="border-b border-stone-200 bg-gradient-to-b from-white to-paper">
        <div className="mx-auto max-w-6xl px-4 py-8 sm:py-10">
          <Breadcrumbs items={[{ label: "Home", href: "/" }, { label: FIRM_TYPE_LABELS[t] }]} />
          <div className="flex flex-wrap items-end justify-between gap-6">
            <div className="max-w-2xl">
              <h1 className="font-display text-3xl tracking-tight sm:text-4xl">{copy.title}</h1>
              <p className="mt-2 text-stone-600">{copy.intro}</p>
            </div>
            <dl className="flex gap-6 text-sm">
              <div>
                <dt className="text-[11px] font-semibold uppercase tracking-wide text-stone-500">Firms</dt>
                <dd className="text-xl font-semibold text-brand">{firms.length.toLocaleString()}</dd>
              </div>
              <div>
                <dt className="text-[11px] font-semibold uppercase tracking-wide text-stone-500">States</dt>
                <dd className="text-xl font-semibold text-brand">{states.length}</dd>
              </div>
            </dl>
          </div>
        </div>
      </section>

      <div className="mx-auto max-w-6xl px-4 py-8">
        <section className="mb-10 rounded-2xl border border-stone-200 bg-white p-6 sm:p-8">
          <h2 className="font-display text-2xl tracking-tight">{guide.heading}</h2>
          <div className="mt-4 grid gap-6 lg:grid-cols-3">
            <div>
              <h3 className="text-sm font-semibold uppercase tracking-wide text-stone-500">
                What the work includes
              </h3>
              <p className="mt-2 text-[14px] leading-6 text-stone-700">{guide.what}</p>
            </div>
            <div>
              <h3 className="text-sm font-semibold uppercase tracking-wide text-stone-500">
                How fees usually work
              </h3>
              <p className="mt-2 text-[14px] leading-6 text-stone-700">{guide.fees}</p>
            </div>
            <div>
              <h3 className="text-sm font-semibold uppercase tracking-wide text-stone-500">
                What to ask before hiring
              </h3>
              <p className="mt-2 text-[14px] leading-6 text-stone-700">{guide.questions}</p>
            </div>
          </div>
          <p className="mt-5 text-[13px] leading-6 text-stone-500">
            Updated {year}. The firms below are ranked by public review volume by default. Use the state
            links to narrow the list, or open a firm profile to compare ratings, contact details and
            local alternatives.
          </p>
        </section>

        <StealthAgentsAd
          variant="band"
          image="desk"
          placement="type-top"
          headline="Running an accounts payable company?"
          body="Stealth Agents places dedicated AP assistants who can carry invoice intake, vendor follow-ups, payment tracking and reporting for your clients."
          cta="See AP assistants"
          className="mb-8"
        />

        <div className="mb-6 flex flex-wrap gap-1.5">
          {states.slice(0, 12).map((s) => (
            <Link
              key={s.state}
              href={`/state/${s.state.toLowerCase()}`}
              className="rounded-full border border-stone-300 bg-white px-3 py-1 text-[13px] text-stone-700 hover:border-brand/50 hover:text-brand"
            >
              {s.name} <span className="text-stone-500">{s.count.toLocaleString()}</span>
            </Link>
          ))}
        </div>

        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          {slice.slice(0, 8).map((f) => (
            <FirmCard key={f.slug} firm={f} />
          ))}
          <div className="col-span-full">
            <StealthAgentsAd
              variant="strip"
              image="flatlay"
              placement="type-listings-inline"
              headline="15-25 hours back every week."
              body="Finance teams typically reclaim 15-25 hours a week by delegating repetitive AP work to a dedicated Stealth Agents assistant."
              cta="See the service"
            />
          </div>
          {slice.slice(8).map((f) => (
            <FirmCard key={f.slug} firm={f} />
          ))}
        </div>

        <Pagination
          page={current}
          pages={pages}
          makeHref={(p) => `/type/${t}${p === 1 ? "" : `?page=${p}`}`}
        />

        <section className="mt-14" aria-labelledby="type-faq-heading">
          <h2 id="type-faq-heading" className="font-display text-xl tracking-tight">
            Common questions about {copy.title.toLowerCase()}
          </h2>
          <div className="mt-4 divide-y divide-stone-200 rounded-xl border border-stone-200 bg-white">
            {guide.faqs.map((faq) => (
              <details key={faq.q} className="group px-5 py-4 open:bg-stone-50/60">
                <summary className="flex cursor-pointer list-none items-center justify-between gap-4 text-[15px] font-medium text-ink">
                  {faq.q}
                  <span className="grid h-6 w-6 shrink-0 place-items-center rounded-full border border-stone-300 text-stone-500 transition group-open:rotate-45">
                    +
                  </span>
                </summary>
                <p className="mt-3 text-sm leading-relaxed text-stone-600">{faq.a}</p>
              </details>
            ))}
          </div>
        </section>
      </div>
    </div>
  );
}
