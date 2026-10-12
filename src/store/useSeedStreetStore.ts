"use client";

import { create } from "zustand";
import { persist, createJSONStorage } from "zustand/middleware";
import startupFixture from "@/data/startups.json";
import offerFixture from "@/data/offers.json";
import investorFixture from "@/data/investors.json";
import type { Account, DemoData, DraftApplication, Meeting, Offer, Startup } from "@/lib/models";

const initialStartups = startupFixture as Startup[];
const initialOffers = offerFixture as Offer[];
export const accounts = investorFixture as Account[];

const blankDraft: DraftApplication = { step: 0, values: {}, founders: [""], team: [""] };

type NewOffer = Omit<Offer, "id" | "createdAt" | "history" | "status" | "communicationApproved">;

type SeedStreetStore = DemoData & {
  accountId: string;
  saved: Record<string, string[]>;
  draft: DraftApplication;
  hydrated: boolean;
  setHydrated: (value: boolean) => void;
  setAccount: (id: string) => void;
  toggleSaved: (startupId: string) => void;
  submitOffer: (offer: NewOffer) => string;
  updateOffer: (offerId: string, action: "accept" | "decline" | "info" | "accept_counter", valuation?: number) => void;
  approveMeeting: (offerId: string, approved: boolean) => void;
  bookMeeting: (offerId: string, slot: string) => void;
  cancelMeeting: (offerId: string) => void;
  confirmCommitment: (offerId: string) => void;
  sendMessage: (offerId: string, body: string) => void;
  setDraft: (draft: DraftApplication) => void;
  publishDraft: () => string | null;
  importData: (data: DemoData) => void;
  resetDemo: () => void;
};

const now = () => new Date().toISOString();
const uid = (prefix: string) => `${prefix}-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`;

export const useSeedStreetStore = create<SeedStreetStore>()(
  persist(
    (set, get) => ({
      startups: initialStartups,
      offers: initialOffers,
      meetings: [
        { id: "m1", offerId: "o1", startupId: "s1", investorId: "jordan", status: "requested" },
        { id: "m2", offerId: "o3", startupId: "s2", investorId: "alex", status: "requested" },
      ],
      messages: [
        { id: "msg1", offerId: "o2", senderId: "maya", body: "Thanks for the thoughtful offer. I have opened this thread for diligence questions.", sentAt: "2026-10-06T10:02:00.000Z", read: false },
      ],
      accountId: "guest",
      saved: { alex: ["s1", "s7"], jordan: ["s2", "s6"] },
      draft: blankDraft,
      hydrated: false,
      setHydrated: (hydrated) => set({ hydrated }),
      setAccount: (accountId) => set({ accountId }),
      toggleSaved: (startupId) => {
        const { accountId, saved } = get();
        if (accountId === "guest" || accountId === "maya") return;
        const current = saved[accountId] ?? [];
        set({ saved: { ...saved, [accountId]: current.includes(startupId) ? current.filter((id) => id !== startupId) : [...current, startupId] } });
      },
      submitOffer: (input) => {
        const id = uid("offer");
        const actor = accounts.find((item) => item.id === input.investorId)?.name ?? "Investor";
        const createdAt = now();
        const offer: Offer = { ...input, id, createdAt, status: "pending", communicationApproved: false, history: [{ id: uid("event"), at: createdAt, actor, label: "Submitted offer", valuation: input.valuation }] };
        const meeting: Meeting | null = input.meetingRequested ? { id: uid("meeting"), offerId: id, startupId: input.startupId, investorId: input.investorId, status: "requested" } : null;
        set((state) => ({ offers: [offer, ...state.offers], meetings: meeting ? [meeting, ...state.meetings] : state.meetings }));
        return id;
      },
      updateOffer: (offerId, action, valuation) => set((state) => ({
        offers: state.offers.map((offer) => {
          if (offer.id !== offerId) return offer;
          const account = accounts.find((item) => item.id === state.accountId)?.name ?? "Demo user";
          const label = action === "accept" ? "Accepted in principle" : action === "decline" ? "Declined" : action === "info" ? "Requested more information" : action === "accept_counter" ? "Accepted counteroffer" : "Updated";
          const status = action === "decline" ? "declined" : action === "info" ? "info_requested" : "accepted";
          return { ...offer, valuation: valuation ?? offer.valuation, status: valuation && action === "accept" ? "countered" : status, communicationApproved: action !== "decline", history: [...offer.history, { id: uid("event"), at: now(), actor: account, label: valuation && action === "accept" ? "Countered offer" : label, valuation }] };
        }),
      })),
      approveMeeting: (offerId, approved) => set((state) => ({
        meetings: state.meetings.map((meeting) => meeting.offerId === offerId ? { ...meeting, status: approved ? "approved" : "rejected", slot: undefined } : meeting),
        offers: state.offers.map((offer) => offer.id === offerId ? { ...offer, communicationApproved: approved || offer.communicationApproved, history: [...offer.history, { id: uid("event"), at: now(), actor: "Maya Chen", label: approved ? "Approved meeting request" : "Rejected meeting request" }] } : offer),
      })),
      bookMeeting: (offerId, slot) => set((state) => state.meetings.some((meeting) => meeting.status === "booked" && meeting.slot === slot && meeting.offerId !== offerId) ? state : ({ meetings: state.meetings.map((meeting) => meeting.offerId === offerId ? { ...meeting, status: "booked", slot } : meeting) })),
      cancelMeeting: (offerId) => set((state) => ({ meetings: state.meetings.map((meeting) => meeting.offerId === offerId ? { ...meeting, status: "cancelled", slot: undefined } : meeting) })),
      confirmCommitment: (offerId) => set((state) => {
        const offer = state.offers.find((item) => item.id === offerId);
        if (!offer || offer.status === "committed") return state;
        return {
          offers: state.offers.map((item) => item.id === offerId ? { ...item, status: "committed", history: [...item.history, { id: uid("event"), at: now(), actor: accounts.find((a) => a.id === state.accountId)?.name ?? "Investor", label: "Recorded simulated commitment" }] } : item),
          startups: state.startups.map((startup) => startup.id === offer.startupId ? { ...startup, committed: startup.committed + offer.amount } : startup),
        };
      }),
      sendMessage: (offerId, body) => set((state) => ({ messages: [...state.messages, { id: uid("message"), offerId, senderId: state.accountId, body, sentAt: now(), read: false }] })),
      setDraft: (draft) => set({ draft }),
      publishDraft: () => {
        const { draft } = get();
        if (!draft.values.name || !draft.values.description) return null;
        const existing = draft.editingStartupId ? get().startups.find((item) => item.id === draft.editingStartupId) : undefined;
        const id = existing?.id ?? uid("startup");
        const name = draft.values.name;
        const startup: Startup = {
          id,
          slug: existing?.slug ?? `${name.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "")}-${Date.now().toString().slice(-4)}`,
          name,
          monogram: name.split(/\s+/).map((part) => part[0]).join("").slice(0, 2).toUpperCase(),
          industry: draft.values.industry || "Technology",
          stage: draft.values.stage || "Pre-seed",
          location: draft.values.location || "Remote",
          description: draft.values.description,
          founder: draft.founders.filter(Boolean).join(" & ") || "Demo Founder",
          founderTitle: "Founder",
          targetRaise: Number(draft.values.raise) || 500000,
          committed: existing?.committed ?? 0,
          valuationMin: Number(draft.values.valuationMin) || 2000000,
          valuationMax: Number(draft.values.valuationMax) || 3500000,
          minInvestment: Number(draft.values.minInvestment) || 10000,
          instrument: draft.values.instrument || "SAFE",
          traction: draft.values.traction || "Newly launched",
          customers: draft.values.customers || "Early pilots",
          revenue: draft.values.revenue || "Pre-revenue",
          problem: draft.values.problem || "A meaningful customer problem.",
          solution: draft.values.solution || "A focused solution.",
          businessModel: draft.values.businessModel || "Recurring subscription.",
          market: draft.values.market || "A growing addressable market.",
          advantage: draft.values.advantage || "Founder insight and execution speed.",
          accent: existing?.accent ?? "#17684B",
        };
        set((state) => ({
          startups: existing ? state.startups.map((item) => item.id === existing.id ? startup : item) : [startup, ...state.startups],
          draft: blankDraft,
        }));
        return startup.slug;
      },
      importData: (data) => set({ startups: data.startups, offers: data.offers, meetings: data.meetings, messages: data.messages }),
      resetDemo: () => set({ startups: initialStartups, offers: initialOffers, meetings: [{ id: "m1", offerId: "o1", startupId: "s1", investorId: "jordan", status: "requested" }, { id: "m2", offerId: "o3", startupId: "s2", investorId: "alex", status: "requested" }], messages: [], saved: { alex: ["s1", "s7"], jordan: ["s2", "s6"] }, draft: blankDraft, accountId: "guest" }),
    }),
    {
      name: "seedstreet-demo-v1",
      storage: createJSONStorage(() => localStorage),
      skipHydration: true,
      partialize: ({ startups, offers, meetings, messages, accountId, saved, draft }) => ({ startups, offers, meetings, messages, accountId, saved, draft }),
      onRehydrateStorage: () => (state) => state?.setHydrated(true),
    },
  ),
);
