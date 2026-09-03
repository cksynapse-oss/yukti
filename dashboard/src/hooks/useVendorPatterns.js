import { useState, useEffect } from 'react';
import { SEED_VENDOR_PATTERNS } from '../data/mockData';

const STORAGE_KEY = 'yukti_vendor_patterns_v1';

export function useVendorPatterns() {
  const [patterns, setPatterns] = useState(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY);
      if (saved) {
        return JSON.parse(saved);
      }
    } catch (e) {
      console.warn('Failed to load vendor patterns from localStorage:', e);
    }
    // Default seed patterns
    const initialMap = {};
    SEED_VENDOR_PATTERNS.forEach((p) => {
      initialMap[p.supplierGstin.toUpperCase()] = p;
    });
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(initialMap));
    } catch (e) {
      // ignore
    }
    return initialMap;
  });

  const persist = (updated) => {
    setPatterns(updated);
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(updated));
    } catch (e) {
      console.error('Failed to persist vendor patterns:', e);
    }
  };

  const getPattern = (supplierGstin) => {
    if (!supplierGstin) return null;
    const clean = supplierGstin.trim().toUpperCase();
    return patterns[clean] || null;
  };

  const savePattern = (supplierGstin, supplierName, corrections = {}, metadata = {}) => {
    if (!supplierGstin) return null;
    const cleanGstin = supplierGstin.trim().toUpperCase();
    const existing = patterns[cleanGstin] || {
      supplierGstin: cleanGstin,
      supplierName: supplierName || 'Unknown Vendor',
      defaultLedger: 'General Purchase Account',
      defaultGstRate: 18.0,
      hsnOverride: null,
      correctionsCount: 0,
      notes: 'Learned from CA manual verification.',
    };

    const count = (existing.correctionsCount || 0) + 1;
    const updatedPattern = {
      ...existing,
      supplierName: supplierName || existing.supplierName,
      defaultLedger: corrections.defaultLedger !== undefined ? corrections.defaultLedger : existing.defaultLedger,
      defaultGstRate: corrections.defaultGstRate !== undefined ? corrections.defaultGstRate : existing.defaultGstRate,
      hsnOverride: corrections.hsnOverride !== undefined ? corrections.hsnOverride : existing.hsnOverride,
      dateFormatHint: corrections.dateFormatHint || existing.dateFormatHint || 'YYYY-MM-DD',
      correctionsCount: count,
      lastCorrected: new Date().toISOString().split('T')[0],
      notes: metadata.notes || existing.notes || 'Auto-tuned by senior reviewer.',
    };

    const next = {
      ...patterns,
      [cleanGstin]: updatedPattern,
    };

    persist(next);
    return updatedPattern;
  };

  const applyPatternToInvoice = (invoice) => {
    if (!invoice || !invoice.supplierGstin) return invoice;
    const pattern = getPattern(invoice.supplierGstin);
    if (!pattern) return invoice;

    return {
      ...invoice,
      suggestedLedger: pattern.defaultLedger || invoice.suggestedLedger,
      hsnCode: pattern.hsnOverride || invoice.hsnCode,
      hasLearnedPattern: true,
      patternMatch: pattern,
    };
  };

  const getAllPatterns = () => {
    return Object.values(patterns);
  };

  const deletePattern = (supplierGstin) => {
    if (!supplierGstin) return;
    const clean = supplierGstin.trim().toUpperCase();
    const next = { ...patterns };
    delete next[clean];
    persist(next);
  };

  const resetPatterns = () => {
    const initialMap = {};
    SEED_VENDOR_PATTERNS.forEach((p) => {
      initialMap[p.supplierGstin.toUpperCase()] = p;
    });
    persist(initialMap);
  };

  return {
    patterns,
    getPattern,
    savePattern,
    applyPatternToInvoice,
    getAllPatterns,
    deletePattern,
    resetPatterns,
  };
}
