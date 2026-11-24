import type { Metadata } from "next";
import Link from "next/link";
import { Breadcrumbs } from "@/components/Nav";

export const metadata: Metadata = {
  title: { absolute: "Contact Accounts Payable Directory" },
  description:
    "Contact AccountsPayableDirectory.com about a listing, a correction or removal, or general questions about the directory.",
  alternates: { canonical: "https://accountspayabledirectory.com/contact" },
  robots: { index: true, follow: true },
};

export default function ContactPage() {
  return (
    <div className="mx-auto max-w-3xl px-4 py-10">
      <Breadcrumbs items={[{ label: "Home", href: "/" }, { label: "Contact" }]} />
      <p className="text-[11px] font-bold uppercase tracking-[0.18em] text-brand-light">Contact</p>
      <h1 className="mt-1 font-display text-4xl tracking-tight sm:text-5xl">
        Contact AccountsPayableDirectory.com
      </h1>
      <p className="mt-4 text-stone-600">
        Questions about a listing, a correction or removal, or the directory itself? Email us and we
        usually reply within one business day.
      </p>
      <a
        className="mt-6 inline-flex rounded-lg bg-brand px-5 py-3 text-sm font-semibold text-white hover:bg-brand-light"
        href="mailto:support@accountspayabledirectory.com"
      >
        support@accountspayabledirectory.com
      </a>

      <div className="mt-10 space-y-5 text-[15px] leading-7 text-stone-600">
        <p>
          <strong className="text-ink">Listing corrections.</strong> Include the company name, city
          and the detail that needs changing. We review requests and update a listing where the
          public record supports the change.
        </p>
        <p>
          <strong className="text-ink">Removals and claims.</strong> Email from a company address, or
          include enough detail for us to confirm that you own or manage the listed company.
        </p>
        <p>
          <strong className="text-ink">Looking for an accounts payable provider?</strong> Compare
          companies directly through the phone number and website on each listing in the{" "}
          <Link className="text-brand underline" href="/directory">
            directory
          </Link>
          . We do not act as a middleman for quotes.
        </p>
      </div>
    </div>
  );
}
