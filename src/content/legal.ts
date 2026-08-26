/**
 * The legal shelf: terms, privacy, cookies, and the refund policy.
 *
 * These documents describe THIS site as it is actually built, which is why they
 * are unusually short. kenzed.in is a static export: there is no application
 * server, no database, no analytics tag and no advertising pixel. Every form on
 * the site composes a message and hands it to WhatsApp or to a mail client —
 * the browser posts nothing back to us. The privacy policy says exactly that
 * rather than reciting the boilerplate of a product that collects far more.
 *
 * If that ever changes — a lead API comes back, an analytics tag is added, a
 * payment flow lands — the affected section here has to change with it in the
 * same commit. `_disabled/api` holds the routes that were switched off; turning
 * any of them back on invalidates §"What the website itself collects".
 */

import { site } from "@/content/site";

export type LegalBlock =
  | { kind: "p"; text: string }
  | { kind: "list"; items: string[] }
  | { kind: "table"; head: [string, string]; rows: [string, string][] };

export type LegalSection = {
  id: string;
  heading: string;
  blocks: LegalBlock[];
};

export type LegalDoc = {
  slug: string;
  /** Nav label and <h1>. */
  title: string;
  /** The "07 / Terms" eyebrow. */
  eyebrow: string;
  /** Page <title> and meta description. */
  metaTitle: string;
  metaDescription: string;
  lead: string;
  /** Rendered as the "in short" card above the document proper. */
  summary: string[];
  sections: LegalSection[];
};

/** One date for the whole shelf: these documents were published together. */
export const LEGAL_EFFECTIVE = "26 August 2026";
/** The same date for schema.org, which wants ISO 8601. */
export const LEGAL_ISO = "2026-08-26";

const CONTACT_BLOCK: LegalBlock[] = [
  {
    kind: "p",
    text: `Questions about this document, or any request you are entitled to make under it, should go to ${site.email}. Post reaches us at the engineering centre: Rajbandh, Durgapur – 713212, West Bengal, India.`,
  },
  {
    kind: "p",
    text: "We answer within one business day in the ordinary course, and within thirty days at the outside for anything that needs a formal response.",
  },
];

export const termsDoc: LegalDoc = {
  slug: "terms",
  title: "Terms & Conditions",
  eyebrow: "Legal / Terms",
  metaTitle: `Terms & Conditions | ${site.name}`,
  metaDescription:
    "The terms that govern use of the Kenzed Tech Lab website, enquiries made through it, and the engagements that follow.",
  lead: "The terms that govern your use of this website and any enquiry you send us through it. Engagements themselves run on a signed agreement, not on this page.",
  summary: [
    "Using this site means you accept these terms.",
    "Everything on the site is information, not an offer — work is governed by a signed agreement.",
    "Our designs, code and words stay ours; yours stay yours.",
    "Indian law applies, and the courts at Durgapur, West Bengal have jurisdiction.",
  ],
  sections: [
    {
      id: "acceptance",
      heading: "1. Acceptance",
      blocks: [
        {
          kind: "p",
          text: `This website is operated by ${site.legalName} ("Kenzed Tech Lab", "we", "us"). By opening, browsing or sending an enquiry through kenzed.in you accept these terms. If you do not accept them, please do not use the site.`,
        },
        {
          kind: "p",
          text: "We may revise these terms as the business changes. The revision date at the top of this page is the operative one, and continued use of the site after that date is acceptance of the revised terms.",
        },
      ],
    },
    {
      id: "site-use",
      heading: "2. Permitted use of the site",
      blocks: [
        { kind: "p", text: "You may read, print and share this site for your own evaluation of our services. You may not:" },
        {
          kind: "list",
          items: [
            "copy, republish or resell any part of the site, its copy, its design system or its source, except as ordinary quotation with attribution;",
            "scrape, crawl or harvest the site by automated means beyond what a well-behaved search-engine crawler does under our robots.txt;",
            "probe, scan or test the site's security, or attempt to defeat any technical measure on it, without our prior written permission;",
            "use the site, its contact channels or its forms to transmit unlawful, infringing, misleading or malicious material, including any attempt to deliver malware or to phish our team;",
            "impersonate Kenzed Tech Lab, or represent yourself as a partner, reseller or agent of ours without a written agreement saying so.",
          ],
        },
        {
          kind: "p",
          text: "If you believe you have found a security flaw in this site, we would rather hear about it than not. Report it to us at the address in the final section and give us a reasonable window to fix it before disclosing it publicly. We will not pursue anyone who reports in good faith and does not access, alter or exfiltrate data belonging to others.",
        },
      ],
    },
    {
      id: "not-an-offer",
      heading: "3. The site is information, not an offer",
      blocks: [
        {
          kind: "p",
          text: "Everything published here — service descriptions, product pages, the technology stack, delivery timelines, capacity and infrastructure claims — is descriptive of how we work. None of it is a contractual offer, a quotation, or a commitment to deliver on particular terms.",
        },
        {
          kind: "p",
          text: "A binding engagement begins only when both parties sign a proposal, statement of work, master services agreement or purchase order. Where anything on this site conflicts with a signed agreement, the signed agreement governs.",
        },
        {
          kind: "p",
          text: "Prices, packages and product tiers shown on the site are indicative and subject to scope, and we may change them without notice. Any figure quoted to you directly is valid for the period stated in that quotation.",
        },
      ],
    },
    {
      id: "enquiries",
      heading: "4. Enquiries, forms and WhatsApp hand-off",
      blocks: [
        {
          kind: "p",
          text: "Every form on this site — the contact form, the product enquiry modal, the internship application and the newsletter box — validates your entry in your own browser and then composes a message and opens it in WhatsApp, or in your mail client. Nothing is posted to a Kenzed server, because this site does not have one.",
        },
        {
          kind: "p",
          text: "That means you are always the one who sends the message, and you can read and edit it before you do. It also means the message travels over WhatsApp and is subject to WhatsApp's own terms and privacy policy in addition to ours. If you would rather not use WhatsApp, email us instead — the address is on the contact page and at the foot of every page.",
        },
        {
          kind: "p",
          text: "Please do not send confidential technical material, credentials, personal data belonging to third parties, or anything covered by an NDA through a first-contact channel. Tell us it exists and we will put a proper agreement and a secure channel in place first.",
        },
        {
          kind: "p",
          text: "An enquiry does not create a client relationship, a duty of confidence, or an obligation on us to respond. Unsolicited ideas, specifications or proposals sent to us are received on a non-confidential basis and we accept no obligation in respect of them.",
        },
      ],
    },
    {
      id: "ip",
      heading: "5. Intellectual property",
      blocks: [
        {
          kind: "p",
          text: `The Kenzed Tech Lab name, the wordmark, the visual system on this site, its copy, its illustrations and its source code are owned by ${site.legalName} or used under licence. Nothing on this site transfers any right in them to you.`,
        },
        {
          kind: "p",
          text: "Third-party names, logos and marks that appear on our technology and industries pages belong to their respective owners. We show them to describe the tools we work with; their appearance is not a claim of endorsement, partnership or certification unless we say so explicitly.",
        },
        {
          kind: "p",
          text: "Ownership of work we build for you is settled in the engagement agreement, not here. Our standard position is that on full payment you own the deliverables, and we retain ownership of our pre-existing tools, frameworks and general know-how, with a licence to you to use them as embedded in the deliverables.",
        },
      ],
    },
    {
      id: "third-party",
      heading: "6. Third-party links and services",
      blocks: [
        {
          kind: "p",
          text: "This site links out to third-party destinations — WhatsApp, our published project links, and the sites of tools we name. We do not control them, we do not review them continuously, and we are not responsible for their content, availability or practices. Following an outbound link is at your own risk and under that destination's terms.",
        },
      ],
    },
    {
      id: "warranty",
      heading: "7. No warranty on the site itself",
      blocks: [
        {
          kind: "p",
          text: 'The site is provided "as is" and "as available". We take care to keep it accurate and online, but we do not warrant that it will be uninterrupted, error-free, or free of harmful components, nor that any description, figure or timeline on it is complete or current at the moment you read it.',
        },
        {
          kind: "p",
          text: "The service levels, uptime targets and support commitments we quote in engagements apply to the systems we build and run for clients under a signed agreement. They do not apply to this marketing site.",
        },
      ],
    },
    {
      id: "liability",
      heading: "8. Limitation of liability",
      blocks: [
        {
          kind: "p",
          text: "To the fullest extent permitted by law, we are not liable for indirect, incidental, special or consequential loss, or for loss of profit, revenue, goodwill, data or anticipated savings, arising from your use of or inability to use this website.",
        },
        {
          kind: "p",
          text: "Our total liability arising out of this website, on any basis, is limited to ₹10,000. Liability arising from a client engagement is governed by the limitation clause in that engagement's agreement, not by this one.",
        },
        {
          kind: "p",
          text: "Nothing here excludes or limits liability that cannot be excluded or limited under applicable law, including liability for fraud or for death or personal injury caused by negligence.",
        },
      ],
    },
    {
      id: "indemnity",
      heading: "9. Indemnity",
      blocks: [
        {
          kind: "p",
          text: "You agree to indemnify us against claims, losses and reasonable costs arising from your breach of these terms, your misuse of the site, or your infringement of any third-party right through your use of it.",
        },
      ],
    },
    {
      id: "law",
      heading: "10. Governing law and jurisdiction",
      blocks: [
        {
          kind: "p",
          text: "These terms are governed by the laws of India. The courts at Durgapur, West Bengal have exclusive jurisdiction over any dispute arising from them, and you and we submit to that jurisdiction.",
        },
        {
          kind: "p",
          text: "If any provision of these terms is held unenforceable, it is severed and the rest continues in force. A failure by us to enforce a provision is not a waiver of it.",
        },
      ],
    },
    { id: "terms-contact", heading: "11. Contact", blocks: CONTACT_BLOCK },
  ],
};

export const privacyDoc: LegalDoc = {
  slug: "privacy",
  title: "Privacy Policy",
  eyebrow: "Legal / Privacy",
  metaTitle: `Privacy Policy | ${site.name}`,
  metaDescription:
    "How Kenzed Tech Lab handles personal data — what this website collects (almost nothing), what happens to an enquiry, and the rights you hold over your data.",
  lead: "What this website collects, what happens to an enquiry once you send it, how we handle data inside a client engagement, and the rights you hold over all of it.",
  summary: [
    "This website has no server, no database, no analytics and no advertising pixels.",
    "It sets no cookies. Two preferences live in your browser's local storage and never leave it.",
    "Forms compose a message and hand it to WhatsApp or your mail client — you send it, not us.",
    "Data you send us by any channel is used to answer you, and for nothing else.",
  ],
  sections: [
    {
      id: "who",
      heading: "1. Who is responsible",
      blocks: [
        {
          kind: "p",
          text: `${site.legalName}, of Rajbandh, Durgapur – 713212, West Bengal, India, decides why and how personal data reaching us through this site is handled. In the language of India's Digital Personal Data Protection Act, 2023 we are the Data Fiduciary; under the GDPR we are the controller. Reach us at ${site.email}.`,
        },
        {
          kind: "p",
          text: "Where we process data on a client's behalf inside an engagement, that client is the controller and we act as processor under the terms of the agreement between us. Section 6 covers that case.",
        },
      ],
    },
    {
      id: "site-collects",
      heading: "2. What the website itself collects",
      blocks: [
        {
          kind: "p",
          text: "Nothing, in the ordinary sense. kenzed.in is a statically exported set of files. There is no application server behind it, no database, no analytics tag, no advertising or social pixel, no session tracking and no profiling of visitors. We do not know who visits, how often, or what they read.",
        },
        {
          kind: "p",
          text: "Typefaces are compiled into the site at build time and served from our own origin, so loading a page makes no request to Google Fonts or to any other third-party host.",
        },
        {
          kind: "p",
          text: "Two small preferences are written to your browser's local storage so the site behaves the way you left it. They stay on your device, are never transmitted anywhere, and clearing your site data removes them:",
        },
        {
          kind: "table",
          head: ["Stored value", "Why it exists"],
          rows: [
            ["Theme choice", "Remembers whether you selected the light or dark theme, so the page does not flash the wrong one on your next visit."],
            ["Assistant greeting flag", "Records that the chat assistant has already introduced itself, so it does not greet you again on every page."],
          ],
        },
        {
          kind: "p",
          text: "Our hosting provider will keep ordinary server logs — IP address, timestamp, requested path, user agent — as every web host does, for delivery and abuse prevention. We do not use those logs to build any profile of you and we do not combine them with anything else.",
        },
      ],
    },
    {
      id: "enquiries",
      heading: "3. What happens when you send an enquiry",
      blocks: [
        {
          kind: "p",
          text: "Every form on this site — contact, product enquiry, internship application, newsletter — is validated in your browser and then assembled into a message that opens in WhatsApp, or in your mail client. Your entries are not posted to us in the background; the browser hands the composed message to you, and you send it.",
        },
        { kind: "p", text: "Depending on the form, that message contains what you typed:" },
        {
          kind: "list",
          items: [
            "your name, work email, and optionally your company and phone or WhatsApp number;",
            "the service or product you are enquiring about, and any budget band you chose;",
            "the message you wrote;",
            "for an internship application, the role, your education and the links you supplied.",
          ],
        },
        {
          kind: "p",
          text: "Once sent, the message sits in our WhatsApp Business inbox or our mailbox. It travels over WhatsApp's infrastructure and is subject to WhatsApp's own privacy policy alongside this one; if you would rather not involve WhatsApp, email us directly instead.",
        },
        {
          kind: "p",
          text: "The honeypot field on our forms is a hidden input that only automated submitters fill. If it is filled we discard the submission silently. It records nothing about you.",
        },
      ],
    },
    {
      id: "why",
      heading: "4. Why we use it, and on what basis",
      blocks: [
        {
          kind: "table",
          head: ["What we do with it", "Lawful basis"],
          rows: [
            ["Reply to your enquiry, scope the work, and send you a proposal", "Steps taken at your request before entering a contract (DPDP: your consent, given by sending the enquiry; GDPR Art. 6(1)(b))"],
            ["Deliver and support an engagement you have signed", "Performance of a contract (GDPR Art. 6(1)(b))"],
            ["Assess an internship or job application", "Steps at your request before a contract, and our legitimate interest in recruiting"],
            ["Send you the occasional update if you asked for one", "Your consent, withdrawable at any time"],
            ["Keep records of what was agreed, invoiced and paid", "Legal obligation, and our legitimate interest in defending claims"],
            ["Protect the site and our systems from abuse", "Our legitimate interest in security"],
          ],
        },
        {
          kind: "p",
          text: "We do not sell personal data. We do not share it with advertisers or data brokers. We do not use it to train models, our own or anyone else's. We do not make automated decisions about you that produce legal or similarly significant effects.",
        },
      ],
    },
    {
      id: "sharing",
      heading: "5. Who else touches it",
      blocks: [
        { kind: "p", text: "A short list, and it is the whole list:" },
        {
          kind: "list",
          items: [
            "WhatsApp (Meta) — carries an enquiry message if you choose that route;",
            "our email and hosting providers — carry and store mail and serve this site;",
            "professional advisers, and a regulator or court where we are legally required to disclose;",
            "an acquirer, if the business is ever sold — with notice to you and no change of purpose.",
          ],
        },
        {
          kind: "p",
          text: "Where a provider is outside India, the transfer rests on the recipient being in a jurisdiction not restricted under the DPDP Act, and for personal data covered by the GDPR, on Standard Contractual Clauses or an adequacy decision.",
        },
      ],
    },
    {
      id: "client-data",
      heading: "6. Data inside a client engagement",
      blocks: [
        {
          kind: "p",
          text: "When we build or run a system for a client, we may process personal data belonging to that client's users. In that relationship the client decides the purpose and we act on documented instructions, under the data-processing terms of the signed agreement.",
        },
        {
          kind: "p",
          text: "Our standing commitments in that role: least-privilege access for named engineers only; encryption in transit and at rest; environment separation between development, staging and production; and no use of client data to train models or improve our own products.",
        },
        {
          kind: "p",
          text: "We operate our own GPU compute at the Durgapur engineering centre, which is why private and on-premise inference is possible for clients who cannot send data to a third-party model provider. Where an engagement does use an external model API, that is agreed in writing and named in the agreement.",
        },
        {
          kind: "p",
          text: "If you are an end user of a system we built for someone else, that organisation is the controller and its privacy notice governs. We will pass your request on to them; ask us and we will tell you who to approach.",
        },
      ],
    },
    {
      id: "retention",
      heading: "7. How long we keep it",
      blocks: [
        {
          kind: "table",
          head: ["Category", "Retention"],
          rows: [
            ["An enquiry that does not become an engagement", "Up to 24 months, then deleted"],
            ["Engagement records, contracts and invoices", "8 years from the end of the engagement, to meet Indian tax and company-law requirements"],
            ["Unsuccessful internship and job applications", "12 months, unless you ask us to keep you on file for longer"],
            ["Newsletter subscription", "Until you unsubscribe"],
            ["Client data processed under an engagement", "As the agreement specifies — returned or destroyed at the end of it"],
          ],
        },
      ],
    },
    {
      id: "rights",
      heading: "8. Your rights",
      blocks: [
        {
          kind: "p",
          text: "Whatever framework applies to you, you can ask us to do these things, and we will not charge you or treat you differently for asking:",
        },
        {
          kind: "list",
          items: [
            "tell you what personal data of yours we hold and what we have done with it;",
            "correct anything that is wrong, incomplete or out of date;",
            "delete it, where we are not required to keep it;",
            "give you a copy in a portable format, or send it to someone else;",
            "stop, or restrict, a particular use — including any use resting on legitimate interest;",
            "withdraw a consent you gave, without affecting what was lawful before you withdrew it;",
            "nominate someone to exercise these rights for you if you cannot (a right the DPDP Act gives you specifically).",
          ],
        },
        {
          kind: "p",
          text: `Write to ${site.email} and we will verify who you are and respond — ordinarily within a business day, and within thirty days at the outside. If you are not satisfied you may complain to the Data Protection Board of India, or to your local supervisory authority in the EU or UK.`,
        },
      ],
    },
    {
      id: "children",
      heading: "9. Children",
      blocks: [
        {
          kind: "p",
          text: "This site is aimed at businesses and is not directed at children. We do not knowingly collect personal data from anyone under 18. If a child's data has reached us, tell us and we will delete it.",
        },
        {
          kind: "p",
          text: "Several of our education products are used by institutions whose students may be minors. In those deployments the institution is the controller and holds any consent required under the DPDP Act; we process only on its instructions.",
        },
      ],
    },
    {
      id: "security",
      heading: "10. Security",
      blocks: [
        {
          kind: "p",
          text: "The site is served over HTTPS as static files, which leaves it very little to attack. Our internal systems run on least-privilege access, encrypted storage, multi-factor authentication and a physically secured facility with CCTV and biometric access control.",
        },
        {
          kind: "p",
          text: "No system is perfectly secure. If a breach affects your personal data we will notify you and the appropriate authority as the law requires, and tell you plainly what happened and what to do about it.",
        },
      ],
    },
    {
      id: "changes",
      heading: "11. Changes to this policy",
      blocks: [
        {
          kind: "p",
          text: "We update this policy when what we do changes — not on a schedule. The date at the top is the operative one. A change that materially affects how we handle data already given to us will be notified to the people affected before it takes effect.",
        },
      ],
    },
    { id: "privacy-contact", heading: "12. Contact", blocks: CONTACT_BLOCK },
  ],
};

export const cookiesDoc: LegalDoc = {
  slug: "cookies",
  title: "Cookie Policy",
  eyebrow: "Legal / Cookies",
  metaTitle: `Cookie Policy | ${site.name}`,
  metaDescription:
    "Kenzed Tech Lab sets no cookies on kenzed.in. What we do store, why, and how to clear it.",
  lead: "The short version: this website sets no cookies at all. Here is what it does store, and how to get rid of it.",
  summary: [
    "kenzed.in sets no cookies — not necessary ones, not analytics, not advertising.",
    "Two preferences live in local storage on your own device and never leave it.",
    "There is no consent banner because there is nothing to consent to.",
  ],
  sections: [
    {
      id: "none",
      heading: "1. We do not use cookies",
      blocks: [
        {
          kind: "p",
          text: "This site writes no cookies of any kind. There is no analytics cookie, no advertising or retargeting cookie, no social-embed cookie, and no session cookie — a static site has no session to keep.",
        },
        {
          kind: "p",
          text: "That is also why you will not see a consent banner here. A banner exists to collect consent for tracking; with nothing to track, one would be theatre.",
        },
      ],
    },
    {
      id: "storage",
      heading: "2. What we do store on your device",
      blocks: [
        {
          kind: "p",
          text: "Two values are written to your browser's local storage. Local storage is not a cookie: it is never attached to a network request, so it cannot travel to us or to anyone else. Both exist purely so the site behaves the way you last left it.",
        },
        {
          kind: "table",
          head: ["Stored value", "Purpose and lifetime"],
          rows: [
            ["Theme choice", "Remembers light or dark so the page does not flash the wrong theme on your next visit. Persists until you clear site data."],
            ["Assistant greeting flag", "Records that the chat assistant has already introduced itself, so it does not repeat the greeting on every page. Persists until you clear site data."],
          ],
        },
      ],
    },
    {
      id: "third-party",
      heading: "3. Third-party content",
      blocks: [
        {
          kind: "p",
          text: "We embed no third-party scripts, fonts, maps, video players or social widgets. Typefaces are compiled into the site at build time and served from our own origin, so no request leaves for a font CDN.",
        },
        {
          kind: "p",
          text: "Links that take you off the site — to WhatsApp, or to a published project — land you on someone else's property, where their own cookie policy applies.",
        },
      ],
    },
    {
      id: "clearing",
      heading: "4. Clearing what is stored",
      blocks: [
        {
          kind: "p",
          text: "Clear site data for kenzed.in in your browser's settings, or use a private window. The only effect is that the site forgets your theme choice and the assistant introduces itself once more. Nothing else changes and nothing breaks.",
        },
        {
          kind: "p",
          text: "If we ever add anything that does need a cookie, this page and the privacy policy change first, and a consent mechanism arrives with it.",
        },
      ],
    },
    { id: "cookies-contact", heading: "5. Contact", blocks: CONTACT_BLOCK },
  ],
};

export const refundDoc: LegalDoc = {
  slug: "refund",
  title: "Refund & Cancellation",
  eyebrow: "Legal / Refunds",
  metaTitle: `Refund & Cancellation Policy | ${site.name}`,
  metaDescription:
    "How cancellations, refunds and unused engagement time are handled at Kenzed Tech Lab across fixed-scope projects, retainers and product subscriptions.",
  lead: "How cancellation and refunds work across fixed-scope projects, retainers and product subscriptions — and what happens to work already delivered.",
  summary: [
    "Nothing is sold on this website; every engagement starts with a signed agreement.",
    "Fixed-scope work is billed by milestone — you can stop after any completed one.",
    "Retainers cancel on 30 days' notice; unused prepaid time is refunded.",
    "Refunds go back the way they came, within 7–10 business days of approval.",
  ],
  sections: [
    {
      id: "scope",
      heading: "1. What this policy covers",
      blocks: [
        {
          kind: "p",
          text: "This policy applies to paid engagements and product subscriptions with Kenzed Tech Lab. It does not describe a checkout on this website — there isn't one. Nothing is sold here; every engagement begins with a proposal and a signed agreement, and payment terms live in that agreement.",
        },
        {
          kind: "p",
          text: "Where a signed agreement states different commercial terms, that agreement governs and this page is the fallback for anything it leaves unsaid.",
        },
      ],
    },
    {
      id: "fixed-scope",
      heading: "2. Fixed-scope projects",
      blocks: [
        {
          kind: "p",
          text: "Fixed-scope work is broken into milestones and billed against them, which is deliberate: it gives you a real exit at every boundary rather than one decision at the start.",
        },
        {
          kind: "list",
          items: [
            "Cancel before we begin — before any discovery session or engineering time is booked — and the advance is refunded in full.",
            "Cancel mid-milestone and we invoice the work completed to that point, evidenced by the commit history and the time record, and refund the balance of what you have paid.",
            "Cancel at a milestone boundary and nothing further is owed. Delivered milestones are not refundable, because they are complete and handed over.",
            "A discovery or architecture phase that has been delivered is not refundable — its output is the specification, and you keep it.",
          ],
        },
        {
          kind: "p",
          text: "On cancellation we hand over everything paid for: source, credentials, documentation and infrastructure access, in a working state.",
        },
      ],
    },
    {
      id: "retainers",
      heading: "3. Retainers and dedicated teams",
      blocks: [
        {
          kind: "list",
          items: [
            "Either side may cancel a monthly retainer with 30 days' written notice. The notice period is billed because the team is held for you through it.",
            "Prepaid hours or capacity not consumed by the end of the notice period are refunded pro rata, or carried forward if you prefer.",
            "Retainers are not refundable retrospectively for a month already worked.",
            "Unused hours roll forward one month within a running retainer; they lapse after that unless the agreement says otherwise.",
          ],
        },
      ],
    },
    {
      id: "subscriptions",
      heading: "4. Product subscriptions and hosted platforms",
      blocks: [
        {
          kind: "list",
          items: [
            "Cancel a monthly subscription any time. It runs to the end of the paid period; the current month is not refunded.",
            "Cancel an annual subscription within 14 days of the start of a term and the unused remainder is refunded in full. After 14 days it runs to the end of the term.",
            "Setup, migration, implementation and training fees are consumed on delivery and are not refundable.",
            "Third-party costs we pass through at cost — cloud, model APIs, licences, SMS and telephony — are not refundable once incurred.",
            "You may export your data at any time while the subscription is live, and for 30 days after it ends. After that it is deleted.",
          ],
        },
      ],
    },
    {
      id: "not-refundable",
      heading: "5. What is not refundable",
      blocks: [
        {
          kind: "list",
          items: [
            "Work delivered and accepted, whether or not you go on to deploy it.",
            "Time spent on scope changes you requested in writing.",
            "Third-party costs already incurred on your behalf.",
            "Custom hardware or licences procured to your specification.",
            "Delay or non-delivery caused by required inputs, approvals, access or content not arriving from your side.",
          ],
        },
        {
          kind: "p",
          text: "If a deliverable does not meet the agreed specification, the remedy is that we fix it. We will rework it at our cost within the warranty period stated in the agreement — 30 days from handover where nothing else is stated. A refund is what happens when rework cannot resolve it.",
        },
      ],
    },
    {
      id: "process",
      heading: "6. How to cancel, and how a refund runs",
      blocks: [
        {
          kind: "p",
          text: `Send written notice to ${site.email} from the email address on record, naming the engagement or subscription and the date you want it to end.`,
        },
        {
          kind: "list",
          items: [
            "We acknowledge within 2 business days.",
            "We issue a reconciliation statement within 7 business days: delivered work, time consumed, third-party costs, and the resulting balance either way.",
            "Once you approve it, an approved refund is initiated within 7–10 business days.",
            "Refunds return by the original payment method. Bank settlement times are your bank's, not ours; international transfers typically take longer.",
            "Bank charges, gateway fees and currency-conversion differences on the original payment are not recoverable.",
          ],
        },
      ],
    },
    {
      id: "disputes",
      heading: "7. Disputes",
      blocks: [
        {
          kind: "p",
          text: "Raise it with your engagement lead first — most disagreements are a scope misunderstanding and get resolved in a call. If that does not settle it, escalate in writing to the address above and a director will respond within 10 business days.",
        },
        {
          kind: "p",
          text: "Unresolved disputes go to arbitration by a sole arbitrator under the Arbitration and Conciliation Act, 1996, seated at Durgapur, West Bengal, conducted in English, under Indian law.",
        },
      ],
    },
    { id: "refund-contact", heading: "8. Contact", blocks: CONTACT_BLOCK },
  ],
};

export const legalDocs: LegalDoc[] = [termsDoc, privacyDoc, cookiesDoc, refundDoc];

export const legalNav = legalDocs.map((doc) => ({
  label: doc.title,
  href: `/${doc.slug}`,
}));
