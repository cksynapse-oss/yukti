import React from 'react';
import { Sparkles, CheckCircle2, ShieldCheck } from 'lucide-react';

export default function VendorPatternBanner({ pattern }) {
  if (!pattern) return null;

  return (
    <div className="vendor-pattern-banner">
      <div className="pattern-banner-icon">
        <Sparkles size={16} />
      </div>
      <div className="pattern-banner-content">
        <div className="pattern-banner-title">
          <span>Vendor Memory Active</span>
          <span className="pattern-badge">
            <CheckCircle2 size={11} />
            {pattern.correctionsCount || 1} Past Corrections Learned
          </span>
        </div>
        <p className="pattern-banner-desc">
          Auto-applied ledger: <strong>{pattern.defaultLedger}</strong>
          {pattern.defaultGstRate && (
            <span> • Default GST: <strong>{pattern.defaultGstRate}%</strong></span>
          )}
          {pattern.hsnOverride && (
            <span> • HSN: <strong>{pattern.hsnOverride}</strong></span>
          )}
        </p>
      </div>
    </div>
  );
}
