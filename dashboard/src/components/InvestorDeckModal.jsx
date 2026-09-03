import React, { useState, useEffect } from 'react';
import { 
  X, 
  ChevronLeft, 
  ChevronRight, 
  Sparkles, 
  ArrowRight, 
  TrendingUp, 
  ShieldCheck, 
  Building2, 
  CheckCircle2, 
  Maximize2, 
  Minimize2,
  Layers,
  Clock,
  Zap
} from 'lucide-react';

export default function InvestorDeckModal({ isOpen, onClose, onLaunchDemo }) {
  const [currentSlide, setCurrentSlide] = useState(1);
  const totalSlides = 13;

  useEffect(() => {
    if (!isOpen) return;

    const handleKeyDown = (e) => {
      if (e.key === 'ArrowRight' || e.key === ' ') {
        e.preventDefault();
        setCurrentSlide((prev) => Math.min(prev + 1, totalSlides));
      } else if (e.key === 'ArrowLeft') {
        e.preventDefault();
        setCurrentSlide((prev) => Math.max(prev - 1, 1));
      } else if (e.key === 'Escape') {
        e.preventDefault();
        onClose();
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  const nextSlide = () => setCurrentSlide((prev) => Math.min(prev + 1, totalSlides));
  const prevSlide = () => setCurrentSlide((prev) => Math.max(prev - 1, 1));

  return (
    <div className="deck-overlay">
      {/* Top Header Bar */}
      <div className="deck-header">
        <div className="deck-brand">
          <div className="deck-logo">
            <Sparkles size={16} />
          </div>
          <span className="deck-title-text">Yukti • Angel Investor Briefing</span>
          <span className="deck-badge">CONFIDENTIAL</span>
        </div>

        <div className="deck-actions">
          <button 
            className="deck-btn-demo"
            onClick={() => {
              onClose();
              if (onLaunchDemo) onLaunchDemo();
            }}
          >
            <Zap size={14} />
            <span>Launch Live Product Demo</span>
          </button>
          <button className="deck-btn-close" onClick={onClose} title="Close (Esc)">
            <X size={18} />
          </button>
        </div>
      </div>

      {/* Slide Canvas */}
      <div className="deck-canvas">
        {/* SLIDE 1: Title */}
        {currentSlide === 1 && (
          <div className="deck-slide">
            <span className="deck-pill">July 2026 • Seed Thesis</span>
            <h1 className="deck-hero-title">
              Yukti<span className="text-brand">.ai</span>
            </h1>
            <p className="deck-hero-sub">
              Your clients use Tally to keep books.<br />
              <strong className="text-primary">You need an operating system to run your practice.</strong>
            </p>
            <div className="deck-callout mt-6">
              <span className="text-secondary text-sm">
                The GST Compliance Capacity Engine for India's 100,000 CA Firms.
              </span>
            </div>
            <div className="deck-meta-footer">
              <span>Use <strong>← / →</strong> or <strong>Space</strong> to navigate • Click 'Launch Live Demo' anytime</span>
            </div>
          </div>
        )}

        {/* SLIDE 2: The Problem */}
        {currentSlide === 2 && (
          <div className="deck-slide">
            <span className="deck-pill">The Problem</span>
            <h2 className="deck-slide-title">
              CA firms don't lack clients.<br />
              <span className="text-brand">They lack the capacity to serve them.</span>
            </h2>
            <div className="deck-stats-grid">
              <div className="deck-stat-card">
                <span className="deck-stat-num">72%</span>
                <span className="deck-stat-label">of India's 1 lakh CA firms are small practices (1-3 partners, ICAI 2025)</span>
              </div>
              <div className="deck-stat-card">
                <span className="deck-stat-num">~10 hrs</span>
                <span className="deck-stat-label">per client per month burned on manual GST compliance grind</span>
              </div>
              <div className="deck-stat-card">
                <span className="deck-stat-num">65-70%</span>
                <span className="deck-stat-label">of junior clerk work is rote typing, matching Excel sheets, and chasing</span>
              </div>
            </div>
            <div className="deck-quote-box">
              A 40-client CA firm burns <strong>400 hours/month</strong> on GST alone. That's 2.5 full-time junior accountants just typing invoices into Tally and wrestling GSTR-2B spreadsheets. Juniors take 6 months to train and leave after 18.
            </div>
          </div>
        )}

        {/* SLIDE 3: Why Now */}
        {currentSlide === 3 && (
          <div className="deck-slide">
            <span className="deck-pill">Market Timing</span>
            <h2 className="deck-slide-title">
              The government just made accuracy <span className="text-brand">non-optional</span>.
            </h2>
            <div className="deck-grid-2x2">
              <div className="deck-card">
                <div className="deck-card-header text-red">
                  <span className="deck-card-tag">July 2025</span>
                  <h4>GSTR-3B Hard-Lock</h4>
                </div>
                <p>Tax liability fields are now permanently non-editable in GSTR-3B. The "fix it later" culture is dead. Accuracy upstream is mandatory.</p>
              </div>
              <div className="deck-card">
                <div className="deck-card-header text-amber">
                  <span className="deck-card-tag">2026 Mandate</span>
                  <h4>ITC Filing Blocks</h4>
                </div>
                <p>Mismatches between GSTR-2B and GSTR-3B now trigger Section 16(2)(aa) automated DRC-01B notices. Cash tax is payable immediately.</p>
              </div>
              <div className="deck-card">
                <div className="deck-card-header text-brand">
                  <span className="deck-card-tag">Late 2025</span>
                  <h4>ClearTax Exits Small CAs</h4>
                </div>
                <p>ClearTax raised minimum pricing to ₹50k+/yr and migrated small firms away to focus on enterprise ERPs. 80,000 firms are stranded.</p>
              </div>
              <div className="deck-card">
                <div className="deck-card-header text-green">
                  <span className="deck-card-tag">2026 Tech</span>
                  <h4>Serverless Indian AI</h4>
                </div>
                <p>Document intelligence that required custom ML teams in 2022 is now achievable via fast Indic vision models at under ₹0.15/bill.</p>
              </div>
            </div>
          </div>
        )}

        {/* SLIDE 4: The Solution */}
        {currentSlide === 4 && (
          <div className="deck-slide">
            <span className="deck-pill">The Solution</span>
            <h2 className="deck-slide-title">
              Yukti makes the CA's team <span className="text-brand">2× more productive</span>.
            </h2>
            <p className="deck-sub-text">We don't try to replace the Chartered Accountant. We eliminate 80% of junior data-entry grind.</p>
            <div className="deck-stats-grid">
              <div className="deck-step-card">
                <div className="deck-step-num">1</div>
                <h4>📥 Frictionless Intake</h4>
                <p>Direct ingestion from Tally purchase register exports and supplier bills. No manual typing into Tally vouchers.</p>
              </div>
              <div className="deck-step-card">
                <div className="deck-step-num">2</div>
                <h4>⚡ 3-Pass DuckDB Recon</h4>
                <p>Exact hash + RapidFuzz normalized Levenshtein + tolerance matcher reconciles 10,000 rows in under 2 seconds.</p>
              </div>
              <div className="deck-step-card">
                <div className="deck-step-num">3</div>
                <h4>🎯 Exception-First Review</h4>
                <p>Senior CA sees only the 5% that needs judgment, sorted by ₹ impact. Triage 300 items/hr via keyboard hotkeys.</p>
              </div>
            </div>
          </div>
        )}

        {/* SLIDE 5: Before vs After */}
        {currentSlide === 5 && (
          <div className="deck-slide">
            <span className="deck-pill">The Transformation</span>
            <h2 className="deck-slide-title">Before Yukti vs. After Yukti</h2>
            <div className="deck-table-wrapper">
              <table className="deck-table">
                <thead>
                  <tr>
                    <th style={{ width: '25%' }}>Workflow Stage</th>
                    <th style={{ width: '37.5%' }}>Traditional CA Practice</th>
                    <th style={{ width: '37.5%' }} className="text-brand">With Yukti</th>
                  </tr>
                </thead>
                <tbody>
                  <tr>
                    <td><strong>Collect Invoices</strong></td>
                    <td>Clients dump shoeboxes or zip folders on the 10th</td>
                    <td className="text-brand">Continuous digital intake & drag-and-drop batch</td>
                  </tr>
                  <tr>
                    <td><strong>Tally Data Entry</strong></td>
                    <td>Junior types 3-5 min per invoice (typos, wrong HSN)</td>
                    <td className="text-brand">Auto-generated balanced Tally XML vouchers</td>
                  </tr>
                  <tr>
                    <td><strong>2B Reconciliation</strong></td>
                    <td>Manual Excel VLOOKUP (1-2 days per client)</td>
                    <td className="text-brand"><strong>10,000 records in 1.2 seconds</strong> via DuckDB</td>
                  </tr>
                  <tr>
                    <td><strong>Chase Missing Vendors</strong></td>
                    <td>Manual phone calls; often skipped, losing ITC</td>
                    <td className="text-brand">1-Click WhatsApp Section 16(2)(aa) notices</td>
                  </tr>
                  <tr>
                    <td><strong>Return Filing</strong></td>
                    <td>Manual portal data-entry with hard-lock anxiety</td>
                    <td className="text-brand">1-Click verified GSTN JSON export (GSTR-1/3B)</td>
                  </tr>
                </tbody>
              </table>
            </div>
            <div className="deck-quote-box mt-4">
              <strong>Bottom Line:</strong> Compliance time per client drops from <strong>10 hours to under 2 hours/month</strong>. A 40-client firm reclaims ~280 hours every month.
            </div>
          </div>
        )}

        {/* SLIDE 6: Reconciliation Engine */}
        {currentSlide === 6 && (
          <div className="deck-slide">
            <span className="deck-pill">Core Engine</span>
            <h2 className="deck-slide-title">
              Reconciliation that <span className="text-brand">recovers cold, hard cash</span>.
            </h2>
            <div className="deck-grid-2x2">
              <div className="deck-card">
                <h4>3-Pass Algorithmic Core</h4>
                <ul className="deck-list">
                  <li><strong>Pass 1 (Exact Match)</strong>: Hash match on GSTIN + Norm Invoice # + Amount (75-80%)</li>
                  <li><strong>Pass 2 (Fuzzy Match)</strong>: RapidFuzz token sort ratio on messy Indian bill numbers (12-18%)</li>
                  <li><strong>Pass 3 (Tolerance & Consolidate)</strong>: Multi-bill vendor subset sum & ₹10 rounding tolerance (3-5%)</li>
                </ul>
              </div>
              <div className="deck-card">
                <h4>Rupee-Quantified Discrepancies</h4>
                <ul className="deck-list">
                  <li><strong>Missing in 2B</strong>: In books, supplier didn't file → ITC blocked under Sec 16(2)(aa)</li>
                  <li><strong>On Portal Only</strong>: On portal, missing in books → Unclaimed ITC recovered</li>
                  <li><strong>Rate Mismatch</strong>: 18% billed vs 12% portal → Audit penalty exposure flagged</li>
                </ul>
              </div>
            </div>
            <div className="deck-callout mt-4">
              Yukti sorts the senior review queue by <strong>₹ impact descending</strong>. This turns compliance software into an active profit-recovery tool for the CA's client.
            </div>
          </div>
        )}

        {/* SLIDE 7: AI & The Moat */}
        {currentSlide === 7 && (
          <div className="deck-slide">
            <span className="deck-pill">Defensibility</span>
            <h2 className="deck-slide-title">
              The Real Moat: <span className="text-brand">The Vendor Intelligence Graph</span>.
            </h2>
            <div className="deck-stats-grid">
              <div className="deck-card">
                <h4>🧠 Per-Vendor Pattern Store</h4>
                <p>When a CA fixes a ledger head or strips a prefix from an invoice number, Yukti permanently learns that vendor's rule for that firm. Month 1: 70% automation → Month 3: 92% automation.</p>
              </div>
              <div className="deck-card">
                <h4>🌐 Cross-Firm Counterparty Network</h4>
                <p>Vendor X sells to clients across multiple CA firms. When one firm identifies a filing pattern or invoice idiosyncrasy, all participating firms benefit immediately.</p>
              </div>
              <div className="deck-card">
                <h4>🔒 Tally Schema Lock-In</h4>
                <p>Tally charts of accounts are notoriously idiosyncratic. Once Yukti masterfully maps purchase line items into a CA's exact ledger hierarchy, switching costs become insurmountable.</p>
              </div>
            </div>
          </div>
        )}

        {/* SLIDE 8: Positioning */}
        {currentSlide === 8 && (
          <div className="deck-slide">
            <span className="deck-pill">Market Positioning</span>
            <h2 className="deck-slide-title">
              Yukti <span className="text-brand">+</span> Tally. Never Yukti vs. Tally.
            </h2>
            <div className="deck-grid-2x2">
              <div className="deck-card">
                <h4>Tally Prime = The Bookkeeping Engine</h4>
                <p className="text-muted text-xs mb-2">Used by the client's business & in-house accountant</p>
                <ul className="deck-list">
                  <li>Accounting entries & day-to-day vouchers</li>
                  <li>Single-company desktop focus</li>
                  <li>10M+ SME users entrenched across India</li>
                </ul>
              </div>
              <div className="deck-card" style={{ borderColor: 'var(--brand)' }}>
                <h4>Yukti = The CA Practice Intelligence OS</h4>
                <p className="text-brand text-xs mb-2 font-semibold">Used by the CA firm managing 30-80 clients</p>
                <ul className="deck-list">
                  <li>Multi-client unified dashboard across all companies</li>
                  <li>Sub-second DuckDB reconciliation across GSTR-2B</li>
                  <li>Exception-only triage with keyboard hotkeys</li>
                  <li>Automatic XML purchase voucher generator</li>
                </ul>
              </div>
            </div>
            <p className="deck-quote-box mt-4 text-center">
              "Yukti reads from Tally. Yukti generates vouchers for Tally. Your Tally stays your Tally."
            </p>
          </div>
        )}

        {/* SLIDE 9: Business Model */}
        {currentSlide === 9 && (
          <div className="deck-slide">
            <span className="deck-pill">Unit Economics</span>
            <h2 className="deck-slide-title">
              Frictionless Pricing: <span className="text-brand">Immediate ROI</span>.
            </h2>
            <div className="deck-stats-grid">
              <div className="deck-card text-center">
                <span className="deck-card-tag">Starter Firm</span>
                <div className="deck-stat-num text-primary" style={{ fontSize: '28px' }}>₹4,999<span className="text-xs text-muted">/mo</span></div>
                <p className="text-xs text-muted mt-1">Up to 25 SME Clients</p>
                <hr className="my-3 border-subtle" />
                <ul className="deck-list text-left text-xs">
                  <li>Tally & GSTR-2B 3-Pass Recon</li>
                  <li>Senior Exception Queue</li>
                  <li>GSTN JSON & Tally XML Export</li>
                </ul>
              </div>
              <div className="deck-card text-center" style={{ borderColor: 'var(--brand)', backgroundColor: 'var(--brand-light)' }}>
                <span className="deck-card-tag bg-brand text-white">Growth Firm</span>
                <div className="deck-stat-num text-brand" style={{ fontSize: '28px' }}>₹9,999<span className="text-xs text-muted">/mo</span></div>
                <p className="text-xs text-muted mt-1">Up to 60 SME Clients</p>
                <hr className="my-3 border-subtle" />
                <ul className="deck-list text-left text-xs">
                  <li>All Starter Features</li>
                  <li>WhatsApp Vendor Dispute Chaser</li>
                  <li>Vendor Pattern Memory Engine</li>
                  <li>Direct Tally XML Sync</li>
                </ul>
              </div>
              <div className="deck-card text-center">
                <span className="deck-card-tag">Enterprise / Multi-Branch</span>
                <div className="deck-stat-num text-primary" style={{ fontSize: '28px' }}>₹19,999<span className="text-xs text-muted">/mo</span></div>
                <p className="text-xs text-muted mt-1">100+ Clients & Multi-Partner</p>
                <hr className="my-3 border-subtle" />
                <ul className="deck-list text-left text-xs">
                  <li>All Growth Features</li>
                  <li>Multi-Branch RBAC & Audit Trails</li>
                  <li>Dedicated Support & Onboarding</li>
                </ul>
              </div>
            </div>
            <div className="deck-callout mt-4">
              <strong>The Math:</strong> One junior clerk costs ₹15,000–₹22,000/month. If Yukti reclaims 1 FTE of capacity, the software pays for itself on Day 1. More importantly, the firm can take on 10 new clients without hiring.
            </div>
          </div>
        )}

        {/* SLIDE 10: Market Size */}
        {currentSlide === 10 && (
          <div className="deck-slide">
            <span className="deck-pill">Market Opportunity</span>
            <h2 className="deck-slide-title">
              A ₹2,400 Cr ($300M) CA Software Market, <br />
              <span className="text-brand">Expanding into B2B SME Supply-Chain</span>.
            </h2>
            <div className="deck-stats-grid">
              <div className="deck-stat-card">
                <span className="deck-stat-num">100,000+</span>
                <span className="deck-stat-label">Active CA practices & tax consulting firms in India</span>
              </div>
              <div className="deck-stat-card">
                <span className="deck-stat-num">1.4 Crore</span>
                <span className="deck-stat-label">GST-registered businesses filing monthly returns in India</span>
              </div>
              <div className="deck-stat-card">
                <span className="deck-stat-num">₹60K-1.2L</span>
                <span className="deck-stat-label">Average annual software budget per growing CA practice</span>
              </div>
            </div>
            <div className="deck-quote-box mt-4">
              <strong>The Trojan Horse Strategy:</strong> CA firms are the trusted distribution gatekeepers to millions of SMEs. By owning the CA practice intelligence layer, Yukti aggregates verified supply-chain invoice data to underwrite B2B invoice financing and vendor credit in Phase 2.
            </div>
          </div>
        )}

        {/* SLIDE 11: 12-Month Milestones */}
        {currentSlide === 11 && (
          <div className="deck-slide">
            <span className="deck-pill">Roadmap & Milestones</span>
            <h2 className="deck-slide-title">12-Month Execution Roadmap</h2>
            <div className="deck-grid-2x2">
              <div className="deck-card">
                <span className="deck-card-tag">Months 1-3</span>
                <h4>Pilot & Polish</h4>
                <p>Onboard 10 friendly CA firms in Mumbai/Pune. Zero out false positives. Achieve 90%+ auto-reconciliation rate across live client books.</p>
              </div>
              <div className="deck-card">
                <span className="deck-card-tag">Months 4-6</span>
                <h4>Commercial Expansion</h4>
                <p>Launch self-serve onboarding. Distribute free 2B FastMatcher utility across ICAI study circles. Reach 50 paying firms (₹3.5L MRR).</p>
              </div>
              <div className="deck-card">
                <span className="deck-card-tag">Months 7-9</span>
                <h4>Desktop Tally Auto-Sync</h4>
                <p>Ship zero-config background Tally desktop sync agent. Cross 150 CA firms and 5,000 underlying SME client books.</p>
              </div>
              <div className="deck-card">
                <span className="deck-card-tag">Months 10-12</span>
                <h4>Network Expansion</h4>
                <p>Launch the Counterparty Filing Reliability Score. Scale to 300 paying firms (₹20L MRR / $300k ARR). Cash-flow positive.</p>
              </div>
            </div>
          </div>
        )}

        {/* SLIDE 12: The Ask */}
        {currentSlide === 12 && (
          <div className="deck-slide">
            <span className="deck-pill">The Round</span>
            <h2 className="deck-slide-title">
              Angel Round: <span className="text-brand">₹50L - ₹1 Cr ($60K - $120K)</span>
            </h2>
            <div className="deck-stats-grid">
              <div className="deck-card">
                <h4>🎯 Objective</h4>
                <p>18-month runway to reach <strong>250 paying CA firms</strong>, ₹15L MRR, and category leadership in automated ITC reconciliation.</p>
              </div>
              <div className="deck-card">
                <h4>💼 Use of Funds</h4>
                <ul className="deck-list text-xs">
                  <li><strong>Engineering (55%)</strong>: 2 fullstack engineers for Tally background sync & GSTN GSP API pipes.</li>
                  <li><strong>Distribution (30%)</strong>: ICAI study circle sponsorships, CA community partnerships, direct firm visits.</li>
                  <li><strong>Ops & Infra (15%)</strong>: AWS Mumbai compliant infrastructure & DPDP certifications.</li>
                </ul>
              </div>
            </div>
            <div className="deck-quote-box mt-4">
              <strong>Why Us:</strong> Founder has deep technical systems fluency, working product already handling DuckDB reconciliation and Tally XML generation, partnered directly with practicing Chartered Accountants.
            </div>
          </div>
        )}

        {/* SLIDE 13: The Close */}
        {currentSlide === 13 && (
          <div className="deck-slide text-center">
            <span className="deck-pill">Ready to Deploy</span>
            <h1 className="deck-hero-title mt-4" style={{ fontSize: '38px' }}>
              Tally keeps their books.<br />
              <span className="text-brand">Yukti runs their practice.</span>
            </h1>
            <p className="deck-hero-sub mx-auto" style={{ maxWidth: '540px' }}>
              Experience the live software in action. Let's inspect a real reconciliation run right now.
            </p>
            <div className="mt-8 flex justify-center gap-4" style={{ display: 'flex', justifyContent: 'center', gap: '16px' }}>
              <button 
                className="btn btn-primary" 
                style={{ padding: '12px 28px', fontSize: '15px', fontWeight: 700 }}
                onClick={() => {
                  onClose();
                  if (onLaunchDemo) onLaunchDemo();
                }}
              >
                <Zap size={18} />
                <span>Launch Live Product Demo</span>
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Slide Navigation Footer */}
      <div className="deck-footer">
        <button 
          className="deck-nav-btn" 
          onClick={prevSlide}
          disabled={currentSlide === 1}
        >
          <ChevronLeft size={18} />
          <span>Previous</span>
        </button>

        <div className="deck-slide-dots">
          {Array.from({ length: totalSlides }).map((_, i) => (
            <span 
              key={i} 
              className={`deck-dot ${currentSlide === i + 1 ? 'active' : ''}`}
              onClick={() => setCurrentSlide(i + 1)}
              title={`Slide ${i + 1}`}
            />
          ))}
          <span className="deck-slide-count">{currentSlide} / {totalSlides}</span>
        </div>

        <button 
          className="deck-nav-btn" 
          onClick={nextSlide}
          disabled={currentSlide === totalSlides}
        >
          <span>Next</span>
          <ChevronRight size={18} />
        </button>
      </div>
    </div>
  );
}
