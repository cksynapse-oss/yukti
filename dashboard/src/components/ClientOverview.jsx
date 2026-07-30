import React, { useState } from 'react';
import { Users, FileCheck, TrendingUp, ShieldAlert, Search, ArrowUpRight } from 'lucide-react';

const ClientOverview = ({ firmInfo, globalStats, clients = [], onSelectClient }) => {
  const [searchTerm, setSearchTerm] = useState('');

  const filteredClients = clients.filter(client => 
    client.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    client.gstin.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const formatCurrency = (val) => {
    if (val == null) return '₹0';
    return new Intl.NumberFormat('en-IN', { style: 'currency', currency: 'INR', maximumFractionDigits: 0 }).format(val);
  };

  const getBadgeClass = (status) => {
    const s = status?.toLowerCase() || '';
    if (s.includes('filed')) return 'badge-filed';
    if (s.includes('draft') || s.includes('pending')) return 'badge-draft';
    if (s.includes('overdue')) return 'badge-overdue';
    return 'badge-amber';
  };

  return (
    <div style={{ padding: '24px', backgroundColor: '#F7FAFC', color: '#062E24', minHeight: '100vh', fontFamily: 'Inter, system-ui, sans-serif' }}>
      
      {/* Header Context */}
      <div style={{ marginBottom: '24px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <div>
          <h1 style={{ margin: 0, fontSize: '24px', color: '#0F5A47' }}>Client Overview</h1>
          <p style={{ margin: '4px 0 0 0', color: '#6B8F82' }}>
            {firmInfo?.name} {firmInfo?.activeSeason ? `• Active Season: ${firmInfo.activeSeason}` : ''}
          </p>
        </div>
      </div>

      {/* STATS ROW */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: '20px', marginBottom: '32px' }}>
        <div className="glass-panel" style={{ backgroundColor: '#FFFFFF', border: '1px solid #D1E7DD', borderRadius: '12px', padding: '20px', display: 'flex', alignItems: 'center' }}>
          <div style={{ backgroundColor: '#F2F9F5', padding: '12px', borderRadius: '50%', marginRight: '16px', color: '#0F5A47' }}>
            <Users size={24} />
          </div>
          <div>
            <p style={{ margin: 0, color: '#6B8F82', fontSize: '14px', fontWeight: 500 }}>Total Clients</p>
            <h3 style={{ margin: '4px 0 0 0', fontSize: '24px', color: '#062E24' }}>{firmInfo?.totalClients || clients.length}</h3>
          </div>
        </div>

        <div className="glass-panel" style={{ backgroundColor: '#FFFFFF', border: '1px solid #D1E7DD', borderRadius: '12px', padding: '20px', display: 'flex', alignItems: 'center' }}>
          <div style={{ backgroundColor: '#F2F9F5', padding: '12px', borderRadius: '50%', marginRight: '16px', color: '#0F5A47' }}>
            <FileCheck size={24} />
          </div>
          <div>
            <p style={{ margin: 0, color: '#6B8F82', fontSize: '14px', fontWeight: 500 }}>Active Invoices</p>
            <h3 style={{ margin: '4px 0 0 0', fontSize: '24px', color: '#062E24' }}>{globalStats?.totalInvoices?.toLocaleString() || 0}</h3>
          </div>
        </div>

        <div className="glass-panel" style={{ backgroundColor: '#FFFFFF', border: '1px solid #D1E7DD', borderRadius: '12px', padding: '20px', display: 'flex', alignItems: 'center' }}>
          <div style={{ backgroundColor: '#F2F9F5', padding: '12px', borderRadius: '50%', marginRight: '16px', color: '#10B981' }}>
            <TrendingUp size={24} />
          </div>
          <div>
            <p style={{ margin: 0, color: '#6B8F82', fontSize: '14px', fontWeight: 500 }}>Auto-Post Rate</p>
            <h3 style={{ margin: '4px 0 0 0', fontSize: '24px', color: '#062E24' }}>{globalStats?.autoPostedPct || 0}%</h3>
          </div>
        </div>

        <div className="glass-panel" style={{ backgroundColor: '#FFFFFF', border: '1px solid #D1E7DD', borderRadius: '12px', padding: '20px', display: 'flex', alignItems: 'center' }}>
          <div style={{ backgroundColor: '#FFF0F2', padding: '12px', borderRadius: '50%', marginRight: '16px', color: '#E11D48' }}>
            <ShieldAlert size={24} />
          </div>
          <div>
            <p style={{ margin: 0, color: '#6B8F82', fontSize: '14px', fontWeight: 500 }}>Total ITC at Risk</p>
            <h3 style={{ margin: '4px 0 0 0', fontSize: '24px', color: '#E11D48' }}>{formatCurrency(globalStats?.totalITCRisk)}</h3>
          </div>
        </div>
      </div>

      {/* SEARCH BAR */}
      <div style={{ marginBottom: '20px', display: 'flex', alignItems: 'center', backgroundColor: '#FFFFFF', border: '1px solid #D1E7DD', borderRadius: '8px', padding: '8px 16px', maxWidth: '400px' }}>
        <Search size={20} color="#6B8F82" style={{ marginRight: '12px' }} />
        <input 
          type="text" 
          placeholder="Search clients by name or GSTIN..." 
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          style={{ border: 'none', outline: 'none', width: '100%', fontSize: '15px', color: '#062E24', backgroundColor: 'transparent' }}
        />
      </div>

      {/* COMPLIANCE TABLE */}
      <div style={{ backgroundColor: '#FFFFFF', border: '1px solid #D1E7DD', borderRadius: '12px', overflowX: 'auto', boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.05)' }}>
        <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left' }}>
          <thead style={{ backgroundColor: '#F2F9F5', borderBottom: '2px solid #D1E7DD', position: 'sticky', top: 0 }}>
            <tr>
              <th style={{ padding: '16px', color: '#3D6B5E', fontWeight: 600, fontSize: '13px', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Client Details</th>
              <th style={{ padding: '16px', color: '#3D6B5E', fontWeight: 600, fontSize: '13px', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Category</th>
              <th style={{ padding: '16px', color: '#3D6B5E', fontWeight: 600, fontSize: '13px', textTransform: 'uppercase', letterSpacing: '0.05em' }}>GSTR-1 Status</th>
              <th style={{ padding: '16px', color: '#3D6B5E', fontWeight: 600, fontSize: '13px', textTransform: 'uppercase', letterSpacing: '0.05em' }}>GSTR-3B Status</th>
              <th style={{ padding: '16px', color: '#3D6B5E', fontWeight: 600, fontSize: '13px', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Pending Exceptions</th>
              <th style={{ padding: '16px', color: '#3D6B5E', fontWeight: 600, fontSize: '13px', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Unclaimed ITC</th>
              <th style={{ padding: '16px', color: '#3D6B5E', fontWeight: 600, fontSize: '13px', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Next Deadline</th>
              <th style={{ padding: '16px', color: '#3D6B5E', fontWeight: 600, fontSize: '13px', textTransform: 'uppercase', letterSpacing: '0.05em', textAlign: 'right' }}>Action</th>
            </tr>
          </thead>
          <tbody>
            {filteredClients.map((client, idx) => {
              const pendingExceeds = client.pendingExceptions > 5;
              
              let deadlineIsNear = false;
              if (client.nextDeadline) {
                const parts = client.nextDeadline.split('-');
                if (parts.length === 3) {
                    // Try to parse YYYY-MM-DD
                    const isYYYY = parts[0].length === 4;
                    const parsedDate = isYYYY ? new Date(`${parts[0]}-${parts[1]}-${parts[2]}`) : new Date(`${parts[2]}-${parts[1]}-${parts[0]}`);
                    const today = new Date('2026-07-30');
                    const diffDays = (parsedDate - today) / (1000 * 60 * 60 * 24);
                    if (diffDays >= 0 && diffDays < 5) deadlineIsNear = true;
                }
              }

              return (
                <tr 
                  key={client.id || idx} 
                  style={{ 
                    borderBottom: '1px solid #E2E8F0',
                    transition: 'background-color 0.2s',
                    cursor: 'default'
                  }}
                  onMouseEnter={(e) => e.currentTarget.style.backgroundColor = '#F0FAF4'}
                  onMouseLeave={(e) => e.currentTarget.style.backgroundColor = 'transparent'}
                >
                  <td style={{ padding: '16px' }}>
                    <div style={{ fontWeight: 600, color: '#062E24', marginBottom: '4px' }}>{client.name}</div>
                    <div style={{ fontFamily: 'monospace', fontSize: '12px', color: '#6B8F82' }}>{client.gstin}</div>
                  </td>
                  <td style={{ padding: '16px', color: '#3D6B5E', fontSize: '14px' }}>{client.category}</td>
                  <td style={{ padding: '16px' }}>
                    <span className={getBadgeClass(client.gstr1Status)}>{client.gstr1Status}</span>
                  </td>
                  <td style={{ padding: '16px' }}>
                    <span className={getBadgeClass(client.gstr3bStatus)}>{client.gstr3bStatus}</span>
                  </td>
                  <td style={{ padding: '16px', fontWeight: pendingExceeds ? 600 : 400, color: pendingExceeds ? '#E11D48' : '#3D6B5E' }}>
                    {client.pendingExceptions}
                  </td>
                  <td style={{ padding: '16px', color: '#062E24', fontWeight: 500 }}>
                    {formatCurrency(client.unclaimedITC)}
                  </td>
                  <td style={{ padding: '16px', color: deadlineIsNear ? '#E11D48' : '#3D6B5E', fontWeight: deadlineIsNear ? 600 : 400, fontSize: '14px' }}>
                    {client.nextDeadline}
                  </td>
                  <td style={{ padding: '16px', textAlign: 'right' }}>
                    <button 
                      onClick={() => onSelectClient && onSelectClient(client)}
                      style={{
                        backgroundColor: 'transparent',
                        border: '1px solid #0F5A47',
                        color: '#0F5A47',
                        padding: '6px 12px',
                        borderRadius: '6px',
                        cursor: 'pointer',
                        fontSize: '13px',
                        fontWeight: 500,
                        display: 'inline-flex',
                        alignItems: 'center',
                        transition: 'all 0.2s'
                      }}
                      onMouseEnter={(e) => { e.currentTarget.style.backgroundColor = '#0F5A47'; e.currentTarget.style.color = '#FFFFFF'; }}
                      onMouseLeave={(e) => { e.currentTarget.style.backgroundColor = 'transparent'; e.currentTarget.style.color = '#0F5A47'; }}
                    >
                      Review <ArrowUpRight size={16} style={{ marginLeft: '4px' }} />
                    </button>
                  </td>
                </tr>
              )
            })}
            
            {filteredClients.length === 0 && (
              <tr>
                <td colSpan="8" style={{ padding: '32px', textAlign: 'center', color: '#6B8F82' }}>
                  No clients found matching your search.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

    </div>
  );
};

export default ClientOverview;
