import React, { useState } from 'react';
import { X, Building2, Upload, FileText, CheckCircle2, AlertCircle } from 'lucide-react';

export default function AddClientModal({ isOpen, onClose, onClientCreated }) {
  const [formData, setFormData] = useState({
    business_name: '',
    primary_gstin: '',
    pan: '',
    industry: 'Logistics & Transport',
    turnover: '₹5 Cr - ₹10 Cr',
  });
  const [tallyFile, setTallyFile] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  if (!isOpen) return null;

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => {
      const updated = { ...prev, [name]: value };
      if (name === 'primary_gstin' && value.length >= 12 && !prev.pan) {
        updated.pan = value.substring(2, 12).toUpperCase();
      }
      return updated;
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    try {
      // Create Client API call
      const res = await fetch('http://127.0.0.1:8000/api/v1/clients', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          business_name: formData.business_name,
          primary_gstin: formData.primary_gstin.toUpperCase(),
          pan: formData.pan.toUpperCase(),
          industry: formData.industry,
          turnover: formData.turnover
        })
      });

      if (!res.ok) {
        throw new Error('Failed to create client in database');
      }

      const client = await res.json();

      // If Tally file was provided, upload it
      if (tallyFile) {
        const fileData = new FormData();
        fileData.append('file', tallyFile);
        await fetch(`http://127.0.0.1:8000/api/v1/clients/${client.id}/import-tally`, {
          method: 'POST',
          body: fileData
        });
      }

      onClientCreated?.(client);
      onClose();
    } catch (err) {
      setError(err.message || 'Error creating client');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="modal-overlay">
      <div className="modal-content max-w-xl">
        <div className="modal-header">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-emerald-50 text-emerald-700 flex items-center justify-center font-bold">
              <Building2 className="w-4 h-4" />
            </div>
            <div>
              <h2 className="text-base font-semibold text-gray-900">Onboard New Client Business</h2>
              <p className="text-xs text-gray-500">Add client to firm roster and import Tally purchase books</p>
            </div>
          </div>
          <button onClick={onClose} className="text-gray-400 hover:text-gray-600">
            <X className="w-5 h-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          {error && (
            <div className="p-3 bg-red-50 border border-red-200 rounded-lg text-xs text-red-700 flex items-center gap-2">
              <AlertCircle className="w-4 h-4 text-red-500 shrink-0" />
              <span>{error}</span>
            </div>
          )}

          <div>
            <label className="block text-xs font-semibold text-gray-700 mb-1">
              Business Legal Name *
            </label>
            <input
              type="text"
              name="business_name"
              required
              value={formData.business_name}
              onChange={handleChange}
              placeholder="e.g. Bharat Agro Foods Private Limited"
              className="w-full px-3 py-2 text-sm border border-gray-200 rounded-lg focus:outline-none focus:border-emerald-600"
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-gray-700 mb-1">
                Primary GSTIN *
              </label>
              <input
                type="text"
                name="primary_gstin"
                required
                maxLength={15}
                value={formData.primary_gstin}
                onChange={handleChange}
                placeholder="27AAACB9999P1Z3"
                className="w-full px-3 py-2 text-sm font-mono uppercase border border-gray-200 rounded-lg focus:outline-none focus:border-emerald-600"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-gray-700 mb-1">
                PAN Number
              </label>
              <input
                type="text"
                name="pan"
                maxLength={10}
                value={formData.pan}
                onChange={handleChange}
                placeholder="AAACB9999P"
                className="w-full px-3 py-2 text-sm font-mono uppercase border border-gray-200 rounded-lg focus:outline-none focus:border-emerald-600"
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-gray-700 mb-1">
                Industry Sector
              </label>
              <select
                name="industry"
                value={formData.industry}
                onChange={handleChange}
                className="w-full px-3 py-2 text-sm border border-gray-200 rounded-lg focus:outline-none focus:border-emerald-600"
              >
                <option value="Logistics & Transport">Logistics & Transport</option>
                <option value="Manufacturing">Manufacturing</option>
                <option value="Wholesale & Distribution">Wholesale & Distribution</option>
                <option value="Software & IT Services">Software & IT Services</option>
                <option value="Retail FMCG">Retail FMCG</option>
                <option value="Healthcare & Pharma">Healthcare & Pharma</option>
              </select>
            </div>
            <div>
              <label className="block text-xs font-semibold text-gray-700 mb-1">
                Turnover Bracket
              </label>
              <select
                name="turnover"
                value={formData.turnover}
                onChange={handleChange}
                className="w-full px-3 py-2 text-sm border border-gray-200 rounded-lg focus:outline-none focus:border-emerald-600"
              >
                <option value="₹1 Cr - ₹5 Cr">₹1 Cr - ₹5 Cr</option>
                <option value="₹5 Cr - ₹10 Cr">₹5 Cr - ₹10 Cr</option>
                <option value="₹10 Cr - ₹25 Cr">₹10 Cr - ₹25 Cr</option>
                <option value="₹25 Cr+">₹25 Cr+</option>
              </select>
            </div>
          </div>

          <div className="pt-2 border-t border-gray-100">
            <label className="block text-xs font-semibold text-gray-700 mb-1">
              Import Tally Purchase Register (Optional)
            </label>
            <div className="border border-dashed border-gray-200 rounded-lg p-4 text-center hover:bg-gray-50 cursor-pointer">
              <input
                type="file"
                id="tally-file-input"
                className="hidden"
                accept=".xlsx,.xls,.csv"
                onChange={(e) => setTallyFile(e.target.files[0])}
              />
              <label htmlFor="tally-file-input" className="cursor-pointer">
                {tallyFile ? (
                  <div className="flex items-center justify-center gap-2 text-xs font-medium text-emerald-700">
                    <FileText className="w-4 h-4" />
                    <span>{tallyFile.name}</span>
                  </div>
                ) : (
                  <div className="space-y-1">
                    <Upload className="w-5 h-5 mx-auto text-gray-400" />
                    <p className="text-xs text-gray-600 font-medium">Click to attach Tally Excel / CSV Export</p>
                    <p className="text-[11px] text-gray-400">Yukti will auto-parse all vendor vouchers</p>
                  </div>
                )}
              </label>
            </div>
          </div>

          <div className="flex justify-end gap-3 pt-4 border-t border-gray-100">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-xs font-medium text-gray-600 hover:text-gray-800 border border-gray-200 rounded-lg"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={loading}
              className="px-4 py-2 text-xs font-medium text-white bg-emerald-800 hover:bg-emerald-900 rounded-lg shadow-sm flex items-center gap-1.5"
            >
              {loading ? 'Onboarding...' : 'Complete Client Onboarding'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
