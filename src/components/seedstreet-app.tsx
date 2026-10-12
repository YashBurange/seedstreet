"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import {
  ArrowLeft, ArrowRight, Bookmark, Building2, CalendarDays, Check, ChevronRight,
  Download, FileUp, Grid2X2, LayoutList, MessageSquare, Pencil, Plus,
  Search, Send, SlidersHorizontal, Upload, UserRound,
} from "lucide-react";
import { accounts, useSeedStreetStore } from "@/store/useSeedStreetStore";
import { equityMath, money, percent } from "@/lib/finance";
import type { DraftApplication, Offer, Startup } from "@/lib/models";
import { Badge, Button, Input, Progress, Select, Textarea } from "@/components/ui/primitives";

type View = "choose" | "discover" | "profile" | "investor" | "investorMeetings" | "founder" | "founderMeetings" | "list";

const slots = [
  "2026-10-15T14:00:00.000Z", "2026-10-15T16:30:00.000Z", "2026-10-16T15:00:00.000Z",
  "2026-10-19T17:00:00.000Z", "2026-10-20T14:30:00.000Z", "2026-10-21T18:00:00.000Z",
];

const offerLabel: Record<string, string> = {
  pending: "Founder review", countered: "Counter received", accepted: "Accepted in principle",
  committed: "Committed", declined: "Declined", info_requested: "Information requested",
};

const formatDate = (date: string) => new Intl.DateTimeFormat("en-US", { month: "short", day: "numeric", hour: "numeric", minute: "2-digit" }).format(new Date(date));

export default function SeedStreetApp({ view = "choose", slug }: { view?: View; slug?: string }) {
  const store = useSeedStreetStore();
  const account = accounts.find((item) => item.id === store.accountId) ?? accounts[0];
  const startup = slug ? store.startups.find((item) => item.slug === slug) : undefined;
  const { setHydrated, setAccount } = store;

  useEffect(() => {
    void useSeedStreetStore.persist.rehydrate();
    setHydrated(true);
  }, [setHydrated]);

  useEffect(() => {
    if (!store.hydrated) return;
    if ((view === "discover" || view === "investor" || view === "investorMeetings") && account.role !== "investor") setAccount("alex");
    if ((view === "founder" || view === "founderMeetings" || view === "list") && account.role !== "founder") setAccount("maya");
  }, [account.role, setAccount, store.hydrated, view]);

  if (!store.hydrated) {
    return <div className="loading-screen"><span className="brand-mark"><i /><i /><i /></span><strong>SeedStreet</strong><p>Loading your workspace...</p></div>;
  }

  if (view === "choose") return <RoleChooser onChoose={store.setAccount} />;

  const roleContext = view === "founder" || view === "founderMeetings" || view === "list" || account.role === "founder" ? "founder" : "investor";
  const roleAccounts = accounts.filter((item) => roleContext === "founder" ? item.id === "maya" : ["alex", "jordan"].includes(item.id));
  const founderStartup = store.startups.find((item) => item.id === "s1");

  return (
    <div className={`app-shell ${roleContext}-shell`}>
      <header className={`site-header ${roleContext}-header`}>
        <div className="header-inner">
          <Link href="/" className="wordmark" aria-label="SeedStreet home"><span className="brand-mark"><i /><i /><i /></span>SeedStreet</Link>
          <nav className="main-nav" aria-label="Primary navigation">
            {roleContext === "investor" ? <>
              <Link className={view === "discover" ? "active" : ""} href="/investor">Discover</Link>
              <Link className={view === "investor" ? "active" : ""} href="/investor/portfolio">Portfolio</Link>
              <Link className={view === "investorMeetings" ? "active" : ""} href="/investor/meetings">Meetings</Link>
            </> : <>
              <Link className={view === "founder" ? "active" : ""} href="/founder">Offers</Link>
              <Link className={view === "founderMeetings" ? "active" : ""} href="/founder/meetings">Meetings</Link>
              <Link className={view === "list" ? "active" : ""} href="/founder/list">Edit company</Link>
            </>}
          </nav>
          <div className="account-tools">
            <Select aria-label={`${roleContext === "founder" ? "Founder" : "Investor"} account`} value={roleAccounts.some((item) => item.id === store.accountId) ? store.accountId : roleAccounts[0]?.id} onChange={(event) => store.setAccount(event.target.value)} className="account-select">
              {roleAccounts.map((item) => <option value={item.id} key={item.id}>{item.name}{item.title ? ` - ${item.title}` : ""}</option>)}
            </Select>
            <details className="account-menu">
              <summary aria-label="Account options"><UserRound size={18} /></summary>
              <div className="menu-popover">
                <div><strong>{account.name}</strong><span>{account.title ?? "Marketplace visitor"}</span></div>
                {roleContext === "founder" && <Link href="/founder"><Building2 size={16} /> Founder workspace</Link>}
                {roleContext === "founder" && <Link href="/founder/meetings"><CalendarDays size={16} /> Meetings</Link>}
                {roleContext === "founder" && <Link href="/founder/list"><Pencil size={16} /> Edit company</Link>}
                {roleContext === "founder" && founderStartup && <Link href={`/startups/${founderStartup.slug}`}><ArrowRight size={16} /> Public profile</Link>}
                {roleContext === "investor" && <Link href="/investor"><Search size={16} /> Discover companies</Link>}
                {roleContext === "investor" && <Link href="/investor/portfolio"><UserRound size={16} /> Portfolio</Link>}
                {roleContext === "investor" && <Link href="/investor/meetings"><CalendarDays size={16} /> Meetings</Link>}
                <Link href="/"><ArrowLeft size={16} /> Switch role</Link>
              </div>
            </details>
          </div>
        </div>
      </header>

      {view === "discover" && <Discovery />}
      {view === "profile" && (startup ? <StartupProfile startup={startup} /> : <NotFound />)}
      {view === "investor" && <InvestorDashboard />}
      {view === "investorMeetings" && <InvestorMeetings />}
      {view === "founder" && <FounderDashboard />}
      {view === "founderMeetings" && <FounderMeetings />}
      {view === "list" && <FounderApplication />}
    </div>
  );
}

function RoleChooser({ onChoose }: { onChoose: (accountId: string) => void }) {
  return (
    <main className="role-choice">
      <header><span className="wordmark"><span className="brand-mark"><i /><i /><i /></span>SeedStreet</span><span>Choose your workspace</span></header>
      <section className="role-choice-intro"><h1>Are you a founder or an investor?</h1></section>
      <div className="role-paths">
        <article className="investor-path"><div className="role-icon"><Search /></div><span>Investor</span><h2>Find companies worth backing.</h2><Link href="/investor" onClick={() => onChoose("alex")}>Enter investor workspace <ArrowRight /></Link></article>
        <article className="founder-path"><div className="role-icon"><Building2 /></div><span>Founder</span><h2>Run your raise with clarity.</h2><Link href="/founder" onClick={() => onChoose("maya")}>Enter founder workspace <ArrowRight /></Link></article>
      </div>
    </main>
  );
}

function Discovery() {
  const { startups } = useSeedStreetStore();
  const [search, setSearch] = useState("");
  const [industry, setIndustry] = useState("All industries");
  const [stage, setStage] = useState("All stages");
  const [valuation, setValuation] = useState("Any valuation");
  const [sort, setSort] = useState("featured");
  const [layout, setLayout] = useState<"grid" | "list">("grid");
  const industries = [...new Set(startups.map((item) => item.industry))].sort();
  const filtered = (() => {
    const term = search.toLowerCase();
    const result = startups.filter((item) =>
      (!term || `${item.name} ${item.description} ${item.industry}`.toLowerCase().includes(term)) &&
      (industry === "All industries" || item.industry === industry) &&
      (stage === "All stages" || item.stage === stage) &&
      (valuation === "Any valuation" || (valuation === "Under $5M" ? item.valuationMin < 5000000 : valuation === "$5M–$10M" ? item.valuationMin >= 5000000 && item.valuationMin <= 10000000 : item.valuationMin > 10000000))
    );
    return [...result].sort((a, b) => sort === "most-funded" ? b.committed - a.committed : sort === "lowest-minimum" ? a.minInvestment - b.minInvestment : sort === "newest" ? b.id.localeCompare(a.id) : percent(b.committed, b.targetRaise) - percent(a.committed, a.targetRaise));
  })();

  return (
    <main>
      <section className="discovery-intro">
        <h1>Discover the next generation of startups</h1>
      </section>
      <section className="marketplace-band">
        <div className="filters">
          <label className="search-box"><Search size={18} /><Input value={search} onChange={(event) => setSearch(event.target.value)} placeholder="Search companies or industries" /></label>
          <Select aria-label="Filter by industry" value={industry} onChange={(event) => setIndustry(event.target.value)}><option>All industries</option>{industries.map((item) => <option key={item}>{item}</option>)}</Select>
          <Select aria-label="Filter by stage" value={stage} onChange={(event) => setStage(event.target.value)}><option>All stages</option><option>Pre-seed</option><option>Seed</option><option>Series A</option></Select>
          <Select aria-label="Filter by valuation" value={valuation} onChange={(event) => setValuation(event.target.value)}><option>Any valuation</option><option>Under $5M</option><option>$5M–$10M</option><option>Over $10M</option></Select>
        </div>
        <div className="results-toolbar">
          <p><strong>{filtered.length}</strong> opportunities <span>matched to your filters</span></p>
          <div><Select aria-label="Sort results" value={sort} onChange={(event) => setSort(event.target.value)}><option value="featured">Featured</option><option value="most-funded">Most funded</option><option value="lowest-minimum">Lowest minimum</option><option value="newest">Newest</option></Select><span className="segmented"><button onClick={() => setLayout("grid")} className={layout === "grid" ? "selected" : ""} aria-label="Grid view"><Grid2X2 size={17} /></button><button onClick={() => setLayout("list")} className={layout === "list" ? "selected" : ""} aria-label="List view"><LayoutList size={18} /></button></span></div>
        </div>
        {filtered.length ? <div className={`startup-${layout}`}>{filtered.map((item) => <StartupCard startup={item} key={item.id} />)}</div> : <div className="empty-state"><SlidersHorizontal /><h2>No exact matches</h2><p>Try clearing one of the filters or searching for a broader term.</p></div>}
      </section>
    </main>
  );
}

function StartupCard({ startup }: { startup: Startup }) {
  const { saved, accountId, toggleSaved } = useSeedStreetStore();
  const isSaved = saved[accountId]?.includes(startup.id);
  const funding = percent(startup.committed, startup.targetRaise);
  return (
    <article className="startup-card">
      <div className="card-visual" style={{ "--accent": startup.accent } as React.CSSProperties}>
        <span className="sector-pattern"><i /><i /><i /></span>
        <span className="logo-tile">{startup.monogram}</span>
        <Badge>{startup.stage}</Badge>
      </div>
      <div className="card-content">
        <div className="card-heading"><div><span>{startup.industry}</span><h2>{startup.name}</h2></div><button aria-label={isSaved ? "Remove from watchlist" : "Save to watchlist"} onClick={() => toggleSaved(startup.id)} className={isSaved ? "save-button saved" : "save-button"}><Bookmark size={19} fill={isSaved ? "currentColor" : "none"} /></button></div>
        <p className="description">{startup.description}</p>
        <div className="funding-line"><span><strong>{money(startup.committed, true)}</strong> committed</span><span>{funding}%</span></div>
        <Progress value={funding} />
        <div className="terms"><span><small>Target</small>{money(startup.targetRaise, true)}</span><span><small>Valuation</small>{money(startup.valuationMin, true)}–{money(startup.valuationMax, true)}</span><span><small>Minimum</small>{money(startup.minInvestment, true)}</span></div>
        <div className="card-footer"><div className="founder-avatar">{startup.founder.split(" ").map((word) => word[0]).join("").slice(0, 2)}</div><span>Led by <strong>{startup.founder}</strong></span><Link href={`/startups/${startup.slug}`}>View company <ArrowRight size={16} /></Link></div>
      </div>
    </article>
  );
}

function StartupProfile({ startup }: { startup: Startup }) {
  const { offers, accountId, saved, toggleSaved, submitOffer } = useSeedStreetStore();
  const account = accounts.find((item) => item.id === accountId)!;
  const [amount, setAmount] = useState(startup.minInvestment);
  const [valuation, setValuation] = useState(startup.valuationMin);
  const [basis, setBasis] = useState<"pre" | "post">("pre");
  const [instrument, setInstrument] = useState(startup.instrument);
  const [message, setMessage] = useState("");
  const [meeting, setMeeting] = useState(true);
  const [submitted, setSubmitted] = useState(false);
  const math = equityMath(amount || 0, valuation || 0, basis);
  const isSafe = instrument.toLowerCase().includes("safe") || instrument.toLowerCase().includes("convertible");
  const valid = account.role === "investor" && amount > 0 && valuation > 0 && (!meeting || amount >= startup.minInvestment);
  const existing = offers.filter((offer) => offer.startupId === startup.id && offer.investorId === accountId);

  const submit = () => {
    if (!valid) return;
    submitOffer({ startupId: startup.id, investorId: accountId, amount, valuation, valuationBasis: basis, instrument, message, meetingRequested: meeting });
    setSubmitted(true);
  };

  return (
    <main className="profile-page">
      <div className="profile-topline"><Link href={account.role === "founder" ? "/founder" : "/investor"}><ArrowLeft size={17} /> {account.role === "founder" ? "Founder workspace" : "All opportunities"}</Link><span>Updated 2 days ago</span></div>
      <div className="profile-layout">
        <div className="profile-story">
          <div className="product-stage" style={{ "--accent": startup.accent } as React.CSSProperties}><div className="product-grid" /><span>{startup.monogram}</span><div><strong>{startup.name}</strong></div></div>
          <ProfileSection title="The problem" body={startup.problem} />
          <ProfileSection title="Our solution" body={startup.solution} />
          <div className="split-story"><ProfileSection title="Business model" body={startup.businessModel} /><ProfileSection title="Market opportunity" body={startup.market} /></div>
          <ProfileSection title="Why this team can win" body={startup.advantage} />
          <section className="profile-section"><h2>Founder</h2><div className="founder-profile"><div className="founder-large">{startup.founder.split(" ").map((word) => word[0]).join("").slice(0, 2)}</div><div><h3>{startup.founder}</h3><span>{startup.founderTitle}</span></div></div></section>
          <section className="profile-section"><h2>Company updates</h2><div className="update"><time>October 2026</time><h3>Milestone reached</h3><p>{startup.traction}</p></div></section>
        </div>
        <aside className="deal-panel">
          <div className="deal-summary"><span><strong>{money(startup.committed)}</strong> committed</span><span>{percent(startup.committed, startup.targetRaise)}% of {money(startup.targetRaise)} target</span></div>
          <Progress value={percent(startup.committed, startup.targetRaise)} />
          <div className="deal-terms"><span><small>Valuation range</small><strong>{money(startup.valuationMin)} – {money(startup.valuationMax)}</strong></span><span><small>Minimum investment</small><strong>{money(startup.minInvestment)}</strong></span><span><small>Instrument</small><strong>{startup.instrument}</strong></span></div>
          <button className={saved[accountId]?.includes(startup.id) ? "save-wide saved" : "save-wide"} onClick={() => toggleSaved(startup.id)}><Bookmark size={17} /> {saved[accountId]?.includes(startup.id) ? "Saved to watchlist" : "Save startup"}</button>
          <div className="offer-divider"><span>Make an offer</span></div>
          {account.role !== "investor" ? <div className="role-notice"><Building2 /><strong>Founder profile preview</strong></div> : submitted ? <div className="success-notice"><Check /><strong>Offer sent to {startup.founder}</strong><Link href="/investor/portfolio">View investor portfolio <ArrowRight size={16} /></Link></div> : <div className="offer-form">
            <label>Investment amount<Input type="number" min={1000} step={5000} value={amount} onChange={(event) => setAmount(Number(event.target.value))} /></label>
            <label>Proposed valuation<Input type="number" min={100000} step={100000} value={valuation} onChange={(event) => setValuation(Number(event.target.value))} /></label>
            <label>Valuation basis<span className="segmented text"><button className={basis === "pre" ? "selected" : ""} onClick={() => setBasis("pre")}>Pre-money</button><button className={basis === "post" ? "selected" : ""} onClick={() => setBasis("post")}>Post-money</button></span></label>
            <label>Instrument<Select value={instrument} onChange={(event) => setInstrument(event.target.value)}><option>Priced equity</option><option>SAFE</option><option>Convertible note</option></Select></label>
            <div className="calculation"><span><small>Pre-money</small>{money(math.preMoney)}</span><span><small>Post-money</small>{money(math.postMoney)}</span><span><small>{isSafe ? "Ownership" : "Indicative ownership"}</small>{isSafe ? "Converts later" : `${math.ownership.toFixed(2)}%`}</span></div>
            <label>Message to founder<Textarea value={message} onChange={(event) => setMessage(event.target.value)} placeholder="Share your interest and relevant experience" /></label>
            <label className="check-row"><input type="checkbox" checked={meeting} onChange={(event) => setMeeting(event.target.checked)} /> Request a founder meeting</label>
            {meeting && amount < startup.minInvestment && <p className="field-error">Meeting requests require at least {money(startup.minInvestment)}.</p>}
            <Button disabled={!valid} onClick={submit}>Submit offer <ArrowRight size={17} /></Button>
          </div>}
          {existing.length > 0 && <p className="existing-note">You already have {existing.length} offer{existing.length > 1 ? "s" : ""} associated with this company.</p>}
        </aside>
      </div>
    </main>
  );
}

function ProfileSection({ title, body }: { title: string; body: string }) { return <section className="profile-section"><h2>{title}</h2><p>{body}</p></section>; }

function InvestorDashboard() {
  const { accountId, startups, offers, saved, updateOffer, confirmCommitment } = useSeedStreetStore();
  const account = accounts.find((item) => item.id === accountId)!;
  const [selectedId, setSelectedId] = useState<string | null>(null);
  if (account.role !== "investor") return <RoleGate role="investor" />;
  const mine = offers.filter((offer) => offer.investorId === accountId);
  const selected = mine.find((offer) => offer.id === selectedId) ?? mine[0];
  const startup = selected ? startups.find((item) => item.id === selected.startupId) : undefined;
  return (
    <main className="dashboard-page investor-dashboard-page offer-workspace-page">
      <div className="dashboard-layout">
        <section className="dashboard-main"><div className="section-heading"><div><h2>Your offers</h2></div><Link href="/investor">Browse startups</Link></div>
          {mine.length ? <div className="offer-table investor-offer-table"><div className="offer-table-head"><span>Company</span><span>Amount</span><span>Valuation</span><span>Date</span><span>Status</span></div>{mine.map((offer) => { const company = startups.find((item) => item.id === offer.startupId)!; return <button key={offer.id} onClick={() => setSelectedId(offer.id)} className={selected?.id === offer.id ? "selected" : ""}><span><i style={{ background: company.accent, color: "white" }}>{company.monogram}</i><strong>{company.name}</strong></span><span>{money(offer.amount)}</span><span>{money(offer.valuation)}</span><span>{formatDate(offer.createdAt).split(",")[0]}</span><Badge className={`status-${offer.status}`}>{offerLabel[offer.status]}</Badge></button>; })}</div> : <Empty title="No offers yet" body="Browse the marketplace and start with a company that matches your thesis." />}
          <div id="saved" className="section-heading saved-heading"><div><h2>Saved companies</h2></div></div>
          <div className="saved-strip">{startups.filter((item) => saved[accountId]?.includes(item.id)).map((item) => <Link href={`/startups/${item.slug}`} key={item.id}><span className="mini-logo" style={{ background: item.accent }}>{item.monogram}</span><span><strong>{item.name}</strong><small>{item.industry} · {money(item.minInvestment, true)} minimum</small></span><ArrowRight size={17} /></Link>)}</div>
        </section>
        <aside className="activity-panel">{selected && startup ? <>
          <div className="offer-party-context"><div className="detail-title"><span className="mini-logo" style={{ background: startup.accent }}>{startup.monogram}</span><div><small>Founder</small><h2>{startup.name}</h2><p>{startup.founder}</p></div></div><p className="investor-bio">{startup.industry}</p></div>
          <div className="offer-terms"><dl><div><dt>Investment</dt><dd>{money(selected.amount)}</dd></div><div><dt>{selected.valuationBasis === "pre" ? "Pre-money" : "Post-money"}</dt><dd>{money(selected.valuation)}</dd></div><div><dt>Instrument</dt><dd>{selected.instrument}</dd></div></dl><blockquote>“{selected.message || "Interested in learning more about the round."}”</blockquote></div>
          <div className="offer-decision"><Badge className={`status-${selected.status}`}>{offerLabel[selected.status]}</Badge>{selected.status === "countered" && <Button onClick={() => updateOffer(selected.id, "accept_counter")}>Accept counteroffer</Button>}{selected.status === "accepted" && <Button onClick={() => confirmCommitment(selected.id)}>Record commitment</Button>}</div>
          <div className="offer-followup"><Conversation offer={selected} /><div className="timeline"><h3>Negotiation history</h3>{[...selected.history].reverse().map((event) => <div key={event.id}><i /><span><strong>{event.label}</strong><small>{event.actor} · {formatDate(event.at)}</small></span>{event.valuation && <em>{money(event.valuation)}</em>}</div>)}</div></div>
        </> : <Empty title="Select an offer" body="Offer details and next actions will appear here." />}</aside>
      </div>
    </main>
  );
}

function FounderDashboard() {
  const { accountId, startups, offers, updateOffer } = useSeedStreetStore();
  const account = accounts.find((item) => item.id === accountId)!;
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [counter, setCounter] = useState(5000000);
  if (account.role !== "founder" || !account.startupId) return <RoleGate role="founder" />;
  const startup = startups.find((item) => item.id === account.startupId)!;
  const incoming = offers.filter((item) => item.startupId === startup.id);
  const selected = incoming.find((item) => item.id === selectedId) ?? incoming[0];
  const investor = selected ? accounts.find((item) => item.id === selected.investorId) : undefined;
  return (
    <main className="dashboard-page founder-dashboard-page offer-workspace-page">
      <div className="dashboard-layout">
        <section id="offers" className="dashboard-main"><div className="section-heading"><div><h2>Incoming offers</h2></div><span>{incoming.length} total</span></div>
          <div className="offer-table"><div className="offer-table-head"><span>Investor</span><span>Amount</span><span>Valuation</span><span>Date</span><span>Status</span></div>{incoming.map((offer) => { const person = accounts.find((item) => item.id === offer.investorId); return <button key={offer.id} onClick={() => setSelectedId(offer.id)} className={selected?.id === offer.id ? "selected" : ""}><span><i>{person?.name.split(" ").map((word) => word[0]).join("").slice(0, 2)}</i><strong>{person?.name}</strong></span><span>{money(offer.amount)}</span><span>{money(offer.valuation)}</span><span>{formatDate(offer.createdAt).split(",")[0]}</span><Badge className={`status-${offer.status}`}>{offerLabel[offer.status]}</Badge></button>; })}</div>
        </section>
        <aside className="activity-panel">{selected && investor ? <>
          <div className="offer-party-context"><div className="detail-title"><div className="investor-avatar">{investor.name.split(" ").map((word) => word[0]).join("").slice(0, 2)}</div><div><small>Investor</small><h2>{investor.name}</h2><p>{investor.title}</p></div></div><p className="investor-bio">{investor.bio}</p></div>
          <div className="offer-terms"><dl><div><dt>Amount</dt><dd>{money(selected.amount)}</dd></div><div><dt>{selected.valuationBasis === "pre" ? "Pre-money" : "Post-money"}</dt><dd>{money(selected.valuation)}</dd></div><div><dt>Instrument</dt><dd>{selected.instrument}</dd></div></dl><blockquote>“{selected.message || "Interested in learning more about the round."}”</blockquote></div>
          <div className="offer-decision">{selected.status === "pending" || selected.status === "info_requested" ? <div className="founder-actions"><Button onClick={() => updateOffer(selected.id, "accept")}>Accept in principle</Button><div className="counter-box"><label>Counter valuation<Input type="number" step={100000} value={counter} onChange={(event) => setCounter(Number(event.target.value))} /></label><button onClick={() => updateOffer(selected.id, "accept", counter)}>Send counter</button></div><div className="button-row"><button onClick={() => updateOffer(selected.id, "info")}>Request info</button><button className="danger" onClick={() => updateOffer(selected.id, "decline")}>Decline</button></div></div> : <Badge className={`status-${selected.status}`}>{offerLabel[selected.status]}</Badge>}</div>
          <div className="offer-followup"><Conversation offer={selected} /><div className="timeline"><h3>Negotiation history</h3>{[...selected.history].reverse().map((event) => <div key={event.id}><i /><span><strong>{event.label}</strong><small>{event.actor} · {formatDate(event.at)}</small></span></div>)}</div></div>
        </> : <Empty title="No offer selected" body="Choose an investor offer to review its details." />}</aside>
      </div>
    </main>
  );
}

function InvestorMeetings() {
  const { accountId, startups, offers, meetings, bookMeeting, cancelMeeting } = useSeedStreetStore();
  const account = accounts.find((item) => item.id === accountId)!;
  const [selectedId, setSelectedId] = useState<string | null>(null);
  if (account.role !== "investor") return <RoleGate role="investor" />;
  const mine = meetings.filter((item) => item.investorId === accountId);
  const selected = mine.find((item) => item.id === selectedId) ?? mine[0];
  const offer = selected ? offers.find((item) => item.id === selected.offerId) : undefined;
  const startup = selected ? startups.find((item) => item.id === selected.startupId) : undefined;
  const usedSlots = new Set(meetings.filter((item) => item.status === "booked" && item.id !== selected?.id).map((item) => item.slot));

  return (
    <main className="dashboard-page meetings-page">
      <DashboardHeader title="Founder conversations" />
      <div className="dashboard-layout">
        <section className="dashboard-main">
          <div className="section-heading"><div><h2>Your meeting requests</h2></div><Link href="/investor">Find companies</Link></div>
          {mine.length ? <div className="meeting-list">{mine.map((meeting) => {
            const company = startups.find((item) => item.id === meeting.startupId);
            const relatedOffer = offers.find((item) => item.id === meeting.offerId);
            if (!company || !relatedOffer) return null;
            return <button key={meeting.id} onClick={() => setSelectedId(meeting.id)} className={selected?.id === meeting.id ? "meeting-row selected" : "meeting-row"}><span className="mini-logo" style={{ background: company.accent }}>{company.monogram}</span><span><strong>{company.name}</strong><small>{money(relatedOffer.amount)} offer</small></span><Badge>{meeting.status}</Badge><span className="meeting-time">{meeting.slot ? formatDate(meeting.slot) : "Not scheduled"}</span><ChevronRight /></button>;
          })}</div> : <Empty title="No meeting requests" body="Request a meeting when you submit an offer to a founder." />}
        </section>
        <aside className="activity-panel">{selected && startup && offer ? <>
          <div className="detail-title"><span className="mini-logo" style={{ background: startup.accent }}>{startup.monogram}</span><div><small>Founder meeting</small><h2>{startup.name}</h2><p>{startup.founder}</p></div></div>
          <Badge>{selected.status}</Badge>
          <dl><div><dt>Offer</dt><dd>{money(offer.amount)}</dd></div><div><dt>Valuation</dt><dd>{money(offer.valuation)}</dd></div><div><dt>Format</dt><dd>30 minute video call</dd></div></dl>
          {selected.status === "requested" && <div className="callout"><CalendarDays /><strong>Waiting for founder approval</strong></div>}
          {selected.status === "approved" && <div className="schedule"><h3>Choose a time</h3>{slots.map((slot) => <button disabled={usedSlots.has(slot)} key={slot} onClick={() => bookMeeting(offer.id, slot)}><CalendarDays size={16} /><span><strong>{formatDate(slot)}</strong><small>{usedSlots.has(slot) ? "Already booked" : "30 minute founder call"}</small></span></button>)}</div>}
          {selected.status === "booked" && selected.slot && <div className="callout success"><CalendarDays /><strong>Meeting confirmed</strong><p>{formatDate(selected.slot)}</p><div className="button-row"><button onClick={() => downloadIcs(startup.name, selected.slot!)}><Download size={15} /> Add to calendar</button><button onClick={() => cancelMeeting(offer.id)}>Cancel</button></div></div>}
          {selected.status === "rejected" && <div className="callout"><strong>Request declined</strong></div>}
          {selected.status === "cancelled" && <div className="callout"><strong>Meeting cancelled</strong></div>}
          <Link className="panel-link" href="/investor/portfolio">Review the offer <ArrowRight size={16} /></Link>
        </> : <Empty title="Select a meeting" body="Request details and scheduling controls will appear here." />}</aside>
      </div>
    </main>
  );
}

function FounderMeetings() {
  const { accountId, startups, offers, meetings, approveMeeting } = useSeedStreetStore();
  const account = accounts.find((item) => item.id === accountId)!;
  const [selectedId, setSelectedId] = useState<string | null>(null);
  if (account.role !== "founder" || !account.startupId) return <RoleGate role="founder" />;
  const startup = startups.find((item) => item.id === account.startupId)!;
  const companyMeetings = meetings.filter((item) => item.startupId === startup.id);
  const selected = companyMeetings.find((item) => item.id === selectedId) ?? companyMeetings[0];
  const offer = selected ? offers.find((item) => item.id === selected.offerId) : undefined;
  const investor = offer ? accounts.find((item) => item.id === offer.investorId) : undefined;

  return (
    <main className="dashboard-page meetings-page">
      <DashboardHeader title="Investor access" />
      <div className="dashboard-layout">
        <section className="dashboard-main">
          <div className="section-heading"><div><h2>Requests and bookings</h2></div><Link href="/founder">Review offers</Link></div>
          {companyMeetings.length ? <div className="meeting-list">{companyMeetings.map((meeting) => {
            const relatedOffer = offers.find((item) => item.id === meeting.offerId);
            const person = relatedOffer ? accounts.find((item) => item.id === relatedOffer.investorId) : undefined;
            if (!relatedOffer || !person) return null;
            return <button key={meeting.id} onClick={() => setSelectedId(meeting.id)} className={selected?.id === meeting.id ? "meeting-row selected" : "meeting-row"}><span className="investor-avatar">{person.name.split(" ").map((word) => word[0]).join("").slice(0, 2)}</span><span><strong>{person.name}</strong><small>{money(relatedOffer.amount)} offer</small></span><Badge>{meeting.status}</Badge><span className="meeting-time">{meeting.slot ? formatDate(meeting.slot) : "Awaiting action"}</span><ChevronRight /></button>;
          })}</div> : <Empty title="No meeting requests" body="New investor meeting requests will appear here." />}
        </section>
        <aside className="activity-panel">{selected && offer && investor ? <>
          <div className="detail-title"><div className="investor-avatar">{investor.name.split(" ").map((word) => word[0]).join("").slice(0, 2)}</div><div><small>Meeting request</small><h2>{investor.name}</h2><p>{investor.title}</p></div></div>
          <p className="investor-bio">{investor.bio}</p>
          <dl><div><dt>Offer</dt><dd>{money(offer.amount)}</dd></div><div><dt>Valuation</dt><dd>{money(offer.valuation)}</dd></div><div><dt>Minimum check</dt><dd>{money(startup.minInvestment)}</dd></div></dl>
          {selected.status === "requested" && <div className="callout amber"><CalendarDays /><strong>Approval needed</strong><div className="button-row"><Button onClick={() => approveMeeting(offer.id, true)}>Approve meeting</Button><button onClick={() => approveMeeting(offer.id, false)}>Reject</button></div></div>}
          {selected.status === "approved" && <div className="callout success"><Check /><strong>Investor can schedule</strong></div>}
          {selected.status === "booked" && selected.slot && <div className="callout success"><CalendarDays /><strong>Upcoming meeting</strong><p>{formatDate(selected.slot)}</p><button onClick={() => downloadIcs(investor.name, selected.slot!)}><Download size={15} /> Add to calendar</button></div>}
          {selected.status === "rejected" && <div className="callout"><strong>Request rejected</strong></div>}
          {selected.status === "cancelled" && <div className="callout"><strong>Meeting cancelled</strong></div>}
        </> : <Empty title="Select a request" body="Investor context and approval controls will appear here." />}</aside>
      </div>
    </main>
  );
}

function Conversation({ offer }: { offer: Offer }) {
  const { messages, accountId, sendMessage } = useSeedStreetStore();
  const [body, setBody] = useState("");
  const thread = messages.filter((item) => item.offerId === offer.id);
  const submit = () => { if (body.trim()) { sendMessage(offer.id, body.trim()); setBody(""); } };
  return <div className="conversation"><h3><MessageSquare size={17} /> Offer conversation</h3><div className="messages">{thread.map((message) => <div className={message.senderId === accountId ? "mine" : ""} key={message.id}><p>{message.body}</p><span>{formatDate(message.sentAt)}{!message.read && message.senderId !== accountId ? " · unread" : ""}</span></div>)}</div><div className="message-compose"><Input value={body} onChange={(event) => setBody(event.target.value)} onKeyDown={(event) => { if (event.key === "Enter") submit(); }} placeholder="Write a message" /><button onClick={submit} aria-label="Send message"><Send size={17} /></button></div></div>;
}

const applicationSteps = [
  { title: "Company basics", note: "Identity and company details", fields: [["name", "Company name"], ["description", "One-line description"], ["website", "Website"], ["industry", "Industry"], ["location", "Location"], ["founded", "Founding date"]] },
  { title: "Founders", note: "The people building this", fields: [["education", "Education"], ["experience", "Past experience"], ["ownership", "Founder ownership (%)"]] },
  { title: "Problem", note: "Customer and urgency", fields: [["targetUser", "Target user"], ["problem", "Problem"], ["alternatives", "Current alternatives"], ["whyNow", "Why it matters now"]] },
  { title: "Solution", note: "Product and defensibility", fields: [["solution", "Product and how it works"], ["differentiation", "Differentiation"], ["advantage", "Competitive advantage"]] },
  { title: "Market", note: "Market and distribution", fields: [["idealCustomer", "Ideal customer"], ["market", "TAM and market opportunity"], ["competitors", "Competitors"], ["pricing", "Pricing"], ["businessModel", "Go-to-market"]] },
  { title: "Traction", note: "Evidence and momentum", fields: [["revenue", "Revenue"], ["customers", "Customers"], ["pilots", "Pilots"], ["partnerships", "Partnerships"], ["growth", "Growth"], ["traction", "Milestones"]] },
  { title: "Fundraising", note: "Round structure", fields: [["raise", "Amount to raise"], ["valuationMin", "Minimum valuation"], ["valuationMax", "Maximum valuation"], ["instrument", "Investment instrument"], ["minInvestment", "Minimum check size"], ["useOfFunds", "Use of funds"], ["stage", "Funding stage"]] },
  { title: "Review", note: "Preview and publish", fields: [] },
];

function draftFromStartup(startup: Startup): DraftApplication {
  return {
    step: 0,
    editingStartupId: startup.id,
    founders: [startup.founder],
    team: [""],
    values: {
      name: startup.name,
      description: startup.description,
      industry: startup.industry,
      location: startup.location,
      stage: startup.stage,
      raise: String(startup.targetRaise),
      valuationMin: String(startup.valuationMin),
      valuationMax: String(startup.valuationMax),
      minInvestment: String(startup.minInvestment),
      instrument: startup.instrument,
      traction: startup.traction,
      customers: startup.customers,
      revenue: startup.revenue,
      problem: startup.problem,
      solution: startup.solution,
      businessModel: startup.businessModel,
      market: startup.market,
      advantage: startup.advantage,
    },
  };
}

function FounderApplication() {
  const { accountId, startups, draft, setDraft, publishDraft } = useSeedStreetStore();
  const founderStartupId = accounts.find((item) => item.id === accountId)?.startupId;
  const founderStartup = startups.find((item) => item.id === founderStartupId);
  const [published, setPublished] = useState<{ slug: string; edited: boolean } | null>(null);
  useEffect(() => {
    if (founderStartup && draft.editingStartupId !== founderStartup.id) setDraft(draftFromStartup(founderStartup));
  }, [draft.editingStartupId, founderStartup, setDraft]);
  const step = applicationSteps[draft.step];
  const update = (key: string, value: string) => setDraft({ ...draft, values: { ...draft.values, [key]: value } });
  const next = () => { if (draft.step === 0 && (!draft.values.name || !draft.values.description)) return; setDraft({ ...draft, step: Math.min(7, draft.step + 1) }); };
  const publish = () => { const slug = publishDraft(); if (slug) setPublished({ slug, edited: Boolean(draft.editingStartupId) }); };
  if (published) return <main className="application-success"><div><Check /><span>{published.edited ? "Profile updated" : "Listing published"}</span><h1>Your SeedStreet profile is live.</h1><Link href={`/startups/${published.slug}`}>View company profile <ArrowRight /></Link></div></main>;
  return (
    <main className="application-page">
      <aside className="application-sidebar"><div><Badge>Company editor</Badge><h1>Edit {founderStartup?.name ?? "company profile"}</h1></div><ol>{applicationSteps.map((item, index) => <li key={item.title} className={index === draft.step ? "active" : index < draft.step ? "done" : ""}><button onClick={() => setDraft({ ...draft, step: index })}><span>{index < draft.step ? <Check size={15} /> : index + 1}</span><div><strong>{item.title}</strong></div></button></li>)}</ol></aside>
      <section className="application-content"><div className="mobile-step">Step {draft.step + 1} of 8 <Progress value={((draft.step + 1) / 8) * 100} /></div><div className="application-heading"><span>Step {draft.step + 1}</span><h2>{step.title}</h2></div>
        {draft.step === 1 && <PeopleEditor draft={draft} setDraft={setDraft} />}
        {draft.step < 7 && <div className="application-fields">{step.fields.map(([key, label]) => <label key={key}>{label}{["problem", "alternatives", "whyNow", "solution", "differentiation", "advantage", "market", "businessModel", "traction", "useOfFunds"].includes(key) ? <Textarea value={draft.values[key] ?? ""} onChange={(event) => update(key, event.target.value)} /> : key === "instrument" ? <Select value={draft.values[key] ?? ""} onChange={(event) => update(key, event.target.value)}><option value="">Select instrument</option><option>Priced equity</option><option>SAFE</option><option>Convertible note</option></Select> : key === "stage" ? <Select value={draft.values[key] ?? ""} onChange={(event) => update(key, event.target.value)}><option value="">Select stage</option><option>Pre-seed</option><option>Seed</option><option>Series A</option></Select> : <Input type={["raise", "valuationMin", "valuationMax", "minInvestment", "ownership"].includes(key) ? "number" : key === "founded" ? "date" : "text"} value={draft.values[key] ?? ""} onChange={(event) => update(key, event.target.value)} />}</label>)}</div>}
        {draft.step === 0 && <div className="upload-zone"><Upload /><div><strong>Add a company logo or product image</strong><span>PNG or JPG, up to 1 MB.</span></div><Input type="file" accept="image/png,image/jpeg" onChange={(event) => { const file = event.target.files?.[0]; if (file && file.size > 1024 * 1024) window.alert("Please choose a file smaller than 1 MB."); }} /></div>}
        {draft.step === 6 && <div className="upload-zone"><FileUp /><div><strong>Attach a pitch deck</strong><span>PDF, up to 3 MB.</span></div><Input type="file" accept="application/pdf" onChange={(event) => { const file = event.target.files?.[0]; if (file && file.size > 3 * 1024 * 1024) window.alert("Please choose a PDF smaller than 3 MB."); }} /></div>}
        {draft.step === 7 && <ApplicationReview draft={draft} />}
        {draft.step === 0 && (!draft.values.name || !draft.values.description) && <p className="field-error">Company name and one-line description are required to continue.</p>}
        <div className="application-actions"><Button className="secondary" disabled={draft.step === 0} onClick={() => setDraft({ ...draft, step: Math.max(0, draft.step - 1) })}><ArrowLeft /> Back</Button><span>Changes saved</span>{draft.step < 7 ? <Button onClick={next}>Continue <ArrowRight /></Button> : <Button onClick={publish}>Save changes <Check /></Button>}</div>
      </section>
    </main>
  );
}

function PeopleEditor({ draft, setDraft }: { draft: DraftApplication; setDraft: (draft: DraftApplication) => void }) {
  const edit = (key: "founders" | "team", index: number, value: string) => { const list = [...draft[key]]; list[index] = value; setDraft({ ...draft, [key]: list }); };
  return <div className="people-editor"><h3>Founders</h3>{draft.founders.map((value, index) => <label key={`founder-${index}`}>Founder {index + 1}<Input value={value} onChange={(event) => edit("founders", index, event.target.value)} placeholder="Full name and role" /></label>)}<button onClick={() => setDraft({ ...draft, founders: [...draft.founders, ""] })}><Plus /> Add founder</button><h3>Team members</h3>{draft.team.map((value, index) => <label key={`team-${index}`}>Team member {index + 1}<Input value={value} onChange={(event) => edit("team", index, event.target.value)} placeholder="Full name and role" /></label>)}<button onClick={() => setDraft({ ...draft, team: [...draft.team, ""] })}><Plus /> Add team member</button></div>;
}

function ApplicationReview({ draft }: { draft: DraftApplication }) { return <div className="review-sheet"><div><span className="profile-logo">{(draft.values.name || "SS").slice(0, 2).toUpperCase()}</span><div><Badge>{draft.values.industry || "Industry"}</Badge><h2>{draft.values.name || "Untitled company"}</h2><p>{draft.values.description || "Add a concise company description."}</p></div></div><dl><div><dt>Founder</dt><dd>{draft.founders.filter(Boolean).join(", ") || "Not added"}</dd></div><div><dt>Target raise</dt><dd>{money(Number(draft.values.raise) || 0)}</dd></div><div><dt>Valuation range</dt><dd>{money(Number(draft.values.valuationMin) || 0)} – {money(Number(draft.values.valuationMax) || 0)}</dd></div><div><dt>Minimum check</dt><dd>{money(Number(draft.values.minInvestment) || 0)}</dd></div><div><dt>Instrument</dt><dd>{draft.values.instrument || "Not selected"}</dd></div></dl><p><strong>Problem</strong>{draft.values.problem || "Not provided"}</p><p><strong>Solution</strong>{draft.values.solution || "Not provided"}</p></div>; }

function DashboardHeader({ title }: { title: string }) { return <section className="dashboard-header"><h1>{title}</h1></section>; }
function RoleGate({ role }: { role: "founder" | "investor" }) { return <main className="role-gate"><div><UserRound /><span>Demo account needed</span><h1>Switch to a {role} account</h1><p>Use the account switcher in the header to open this workspace with its seeded data.</p><Link href="/">Return to marketplace</Link></div></main>; }
function Empty({ title, body }: { title: string; body: string }) { return <div className="empty-state"><Search /><h2>{title}</h2><p>{body}</p></div>; }
function NotFound() { return <main className="role-gate"><div><h1>Company not found</h1><p>This listing may have been removed from the local demo data.</p><Link href="/">Return to marketplace</Link></div></main>; }

function downloadIcs(company: string, slot: string) {
  const start = new Date(slot);
  const end = new Date(start.getTime() + 30 * 60 * 1000);
  const stamp = (date: Date) => date.toISOString().replace(/[-:]/g, "").replace(/\.\d{3}/, "");
  const body = `BEGIN:VCALENDAR\nVERSION:2.0\nBEGIN:VEVENT\nUID:${Date.now()}@seedstreet.local\nDTSTAMP:${stamp(new Date())}\nDTSTART:${stamp(start)}\nDTEND:${stamp(end)}\nSUMMARY:SeedStreet meeting with ${company}\nDESCRIPTION:Simulated founder meeting scheduled through SeedStreet.\nEND:VEVENT\nEND:VCALENDAR`;
  const url = URL.createObjectURL(new Blob([body], { type: "text/calendar" }));
  const link = document.createElement("a"); link.href = url; link.download = `${company.toLowerCase().replace(/\s+/g, "-")}-meeting.ics`; link.click(); URL.revokeObjectURL(url);
}
