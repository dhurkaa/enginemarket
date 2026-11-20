/**
 * Legal texts, English. PLACEHOLDER drafts written from the brief: the client's lawyer must review them
 * before launch (see PLACEHOLDER_DATA.md). Add legal.sk.ts, legal.cs.ts, legal.de.ts with the same shape.
 */
import { site } from "@/config/site";

export type LegalDoc = { title: string; description: string; updated: string; sections: { h: string; p: string[]; list?: string[] }[] };

const operator = site.legal.companyName || `${site.name} (${site.operator} network)`;

export const legal: Record<"terms" | "privacy" | "imprint" | "cookies", LegalDoc> = {
  terms: {
    title: "Terms of sale",
    description: "How reservations, fit checks, payment, delivery, warranty and returns work when you buy an engine from EngineMarket.",
    updated: "2026-11-20",
    sections: [
      {
        h: "1. Who sells",
        p: [`The seller is ${operator}, shipping from ${site.legal.country}. Contact: ${site.contact.email}, ${site.contact.phone}.`],
      },
      {
        h: "2. Reserving an engine",
        p: [
          `A reservation is free and holds one engine for ${site.reservationHours} hours. It is not an order and costs you nothing. While it runs, nobody else can reserve or buy that engine.`,
          "If we cannot confirm the fit, or you do not confirm, the reservation ends and the engine goes back on the list.",
        ],
      },
      {
        h: "3. Fit check by VIN",
        p: ["Before you pay, we check your vehicle identification number (VIN) against the engine code and the donor car and tell you the result. The contract is made only when you accept our invoice after that check."],
      },
      {
        h: "4. Prices and payment",
        p: [
          `Prices are in euro and include ${Math.round(site.vatRate * 100)}% Slovak VAT. Business customers with a valid EU VAT ID are invoiced without VAT under the reverse-charge rule.`,
          "We do not take card payments on this website. You pay by bank transfer against our invoice. The engine ships once the payment has arrived.",
        ],
      },
      {
        h: "5. Delivery",
        p: ["Engines travel drained and sealed on a pallet. The delivery price and the usual time for each country are on the delivery page. Check the pallet when it arrives and note any damage on the carrier's delivery note."],
      },
      {
        h: "6. Warranty",
        p: ["The warranty runs from the day of delivery for the months its grade sets: R 12 months, A 6 months, B 6 months, C 3 months. What it covers and how to claim are on the grades page. Your statutory rights as a consumer are not limited by it."],
      },
      {
        h: "7. Withdrawal for consumers",
        p: ["If you buy as a consumer, you may withdraw from the contract within 14 days of delivery without giving a reason. Tell us by email; return the engine unused, drained and on its pallet. We refund the price within 14 days of receiving it. The cost of the return is yours."],
      },
      {
        h: "8. Disputes",
        p: [`Slovak law applies. Consumers may also use the EU online dispute resolution platform. Write to ${site.contact.email} first: most questions are settled by a call.`],
      },
    ],
  },
  privacy: {
    title: "Privacy policy",
    description: "What personal data EngineMarket collects through its forms, why, how long it keeps it and your rights under the GDPR.",
    updated: "2026-11-20",
    sections: [
      {
        h: "Who is responsible",
        p: [`The controller is ${operator}, ${site.legal.country}. Write to ${site.contact.email} for any question about your data.`],
      },
      {
        h: "What we collect, and why",
        p: ["We collect only what you type into a form:"],
        list: [
          "Reservation: name, email, phone, delivery country, VIN and notes, to hold the engine, check the fit and send the invoice (Art. 6(1)(b) GDPR).",
          "Question about an engine: name, email and your question, to answer it (Art. 6(1)(b) GDPR).",
          "Engine search: name, email, phone if given, your car, engine code or VIN and notes, to search and send an offer (Art. 6(1)(b) GDPR).",
          "Trade account: company, VAT ID, name, email, phone and monthly volume, to check the VAT ID and open the account (Art. 6(1)(b) and (c) GDPR).",
        ],
      },
      {
        h: "How long we keep it",
        p: ["Reservation records are deleted 30 days after the hold ends. Emails about an offer that did not lead to a sale are deleted after 12 months. Invoices and the data on them are kept for 10 years, as Slovak accounting law requires."],
      },
      {
        h: "Who else sees it",
        p: ["Our hosting provider and our email provider process the data on our behalf under data processing agreements. A carrier receives your name, address and phone to deliver. We never sell data or use it for advertising."],
      },
      {
        h: "Your rights",
        p: ["You may ask for a copy of your data, its correction or deletion, a restriction, or object to its use, and take it elsewhere. Write to us; we answer within one month. You may also complain to the Office for Personal Data Protection of the Slovak Republic (Úrad na ochranu osobných údajov SR)."],
      },
      {
        h: "Cookies",
        p: ["This website sets no tracking or advertising cookies. See the cookie notice."],
      },
    ],
  },
  imprint: {
    title: "Imprint",
    description: "Company details of EngineMarket, the operator of enginemarket.eu.",
    updated: "2026-11-20",
    sections: [
      {
        h: "Operator",
        p: [
          [
            operator,
            [site.legal.street, site.legal.town].filter(Boolean).join(", "),
            site.legal.country,
            site.legal.registerNumber && `Company register: ${site.legal.registerNumber}`,
            site.legal.vatId && `VAT ID: ${site.legal.vatId}`,
            site.legal.managingDirector && `Managing director: ${site.legal.managingDirector}`,
          ]
            .filter(Boolean)
            .join(" · "),
        ],
      },
      {
        h: "Contact",
        p: [`Phone ${site.contact.phone} · Email ${site.contact.email}`],
      },
      {
        h: "Responsible for the content",
        p: [`${operator}. Car and engine names on this website are trademarks of their owners and are used only to describe which cars an engine fits.`],
      },
    ],
  },
  cookies: {
    title: "Cookies",
    description: "EngineMarket uses no tracking or advertising cookies. What the website stores in your browser, and why.",
    updated: "2026-11-20",
    sections: [
      {
        h: "What we use",
        p: ["This website sets no cookies of its own for tracking, analytics or advertising, so it asks for no consent. Fonts load from Google Fonts, which receives your IP address to send them."],
      },
      {
        h: "If this changes",
        p: ["If we add analytics, we will ask for your consent first with a choice to refuse, and list each cookie here with its purpose and lifetime."],
      },
    ],
  },
};
