export type AccountRole = "guest" | "founder" | "investor";

export type Account = {
  id: string;
  name: string;
  label: string;
  role: AccountRole;
  title?: string;
  bio?: string;
  startupId?: string;
};

export type Startup = {
  id: string;
  slug: string;
  name: string;
  monogram: string;
  industry: string;
  stage: string;
  location: string;
  description: string;
  founder: string;
  founderTitle: string;
  targetRaise: number;
  committed: number;
  valuationMin: number;
  valuationMax: number;
  minInvestment: number;
  instrument: string;
  traction: string;
  customers: string;
  revenue: string;
  problem: string;
  solution: string;
  businessModel: string;
  market: string;
  advantage: string;
  accent: string;
};

export type OfferStatus =
  | "pending"
  | "countered"
  | "accepted"
  | "committed"
  | "declined"
  | "info_requested";

export type OfferEvent = {
  id: string;
  at: string;
  actor: string;
  label: string;
  valuation?: number;
};

export type Offer = {
  id: string;
  startupId: string;
  investorId: string;
  amount: number;
  valuation: number;
  valuationBasis: "pre" | "post";
  instrument: string;
  message: string;
  status: OfferStatus;
  meetingRequested: boolean;
  communicationApproved: boolean;
  createdAt: string;
  history: OfferEvent[];
};

export type Meeting = {
  id: string;
  offerId: string;
  startupId: string;
  investorId: string;
  status: "requested" | "approved" | "booked" | "rejected" | "cancelled";
  slot?: string;
};

export type Message = {
  id: string;
  offerId: string;
  senderId: string;
  body: string;
  sentAt: string;
  read: boolean;
};

export type DraftApplication = {
  step: number;
  editingStartupId?: string;
  values: Record<string, string>;
  founders: string[];
  team: string[];
};

export type DemoData = {
  startups: Startup[];
  offers: Offer[];
  meetings: Meeting[];
  messages: Message[];
};
