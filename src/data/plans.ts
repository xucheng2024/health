import type { Plan } from "@/lib/types";

export const plans: Plan[] = [
  {
    id: "starter",
    name: "Starter Clinic",
    tagline: "Fast setup for small clinics",
    description:
      "Core cloud clinic operations with bilingual onboarding support.",
    suitableFor: "New clinics and 1-5 practitioner teams",
    currency: "SGD",
    unitPrice: 1200,
    features: [
      "Patient registration and appointment workflow",
      "Basic billing and invoice records",
      "Inventory essentials",
      "English/Chinese onboarding",
    ],
    exclusions: [
      "Advanced analytics dashboard",
      "Custom integration",
    ],
    optionalAddons: [
      { name: "Extra training session", price: 280 },
      { name: "Data migration (small)", price: 450 },
    ],
    termsSummary: [
      "Payment term: 50% upfront, 50% upon go-live.",
      "Validity: quotation valid for 30 days.",
      "Delay caused by client-side readiness may incur additional charges.",
      "Liability is limited to direct service scope in this quotation.",
    ],
  },
  {
    id: "growth",
    name: "Growth Clinic",
    tagline: "Operational depth for scaling teams",
    description:
      "Expanded workflow, CRM, and reporting aligned to your quotation template.",
    suitableFor: "Growing clinics and multi-room operations",
    currency: "SGD",
    unitPrice: 2600,
    features: [
      "Everything in Starter",
      "Advanced billing rules and package plans",
      "CRM and follow-up automation",
      "Monthly operation report",
    ],
    exclusions: ["Custom API development"],
    optionalAddons: [
      { name: "Advanced analytics pack", price: 780 },
      { name: "Data migration (medium)", price: 980 },
    ],
    termsSummary: [
      "Payment term: 50% upfront, 50% upon go-live.",
      "Quotation covers modules listed in scope of supply only.",
      "Confidentiality and data handling follow PDPA and contract terms.",
      "Any scope expansion requires written change confirmation.",
    ],
  },
  {
    id: "enterprise",
    name: "Enterprise Health",
    tagline: "Customised systems and governance",
    description:
      "For groups requiring custom workflows, controls, and implementation governance.",
    suitableFor: "Multi-branch or enterprise healthcare groups",
    currency: "SGD",
    unitPrice: 5200,
    features: [
      "Everything in Growth",
      "Custom module configuration",
      "Multi-site governance setup",
      "Dedicated implementation lead",
    ],
    exclusions: ["Third-party license fees"],
    optionalAddons: [
      { name: "Custom integration connector", price: 1500 },
      { name: "On-site deployment support", price: 1200 },
    ],
    termsSummary: [
      "Payment milestones are set in project schedule appendix.",
      "Client is responsible for legal approvals and internal policy compliance.",
      "Data disclosure follows legal and regulatory obligations.",
      "Final acceptance requires signed acceptance section.",
    ],
  },
];

export function getPlanById(id: string): Plan | undefined {
  return plans.find((plan) => plan.id === id);
}
