import React, { useState } from 'react';
import { Users, FileCheck, TrendingUp, AlertCircle, Search, ArrowUpRight } from 'lucide-react';

const ClientOverview = ({ firmInfo, globalStats, clients, onSelectClient }) => {
  const [searchQuery, setSearchQuery] = useState('');

  const filteredClients = clients.filter(client => {
    const query = searchQuery.toLowerCase();
    return (client.name && client.name.toLowerCase().includes(query)) || 
           (client.gstin && client.gstin.toLowerCase().includes(query));
  });

  const getStatusBadgeClass = (status) => {
    if (status === 'GSTR-1 Ready') return 'badge-green';
    if (status === 'Mismatches Open') return 'badge-amber';
    if (status === 'GSTR-3B Pending') return 'badge-indigo';
    return 'badge-indigo';
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '32px' }}>
      
      {/* TOP ROW STATS */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '16px' }}>
        <div className="glass-panel" style={{ padding: '20px', display: 'flex', alignItems: 'center', gap: '16px' }}>
          <div style={{ width: '48px', height: '48px', borderRadius: '50%', background: 'var(--accent-indigo-glow, rgba(99, 102, 241, 0.15))', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--accent-indigo, #818cf8)' }}>
            <Users size={24} />
          </div>
          <div>
            <div style={{ fontSize: '12px', color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Total Clients</div>
            <div className="tabular-nums" style={{ fontSize: '24px', fontWeight: 'bold', color: 'var(--text-primary)', marginTop: '4px' }}>
              {firmInfo?.totalClients || 0}
            </div>
          </div>
        </div>

        <div className="glass-panel" style={{ padding: '20px', display: 'flex', alignItems: 'center', gap: '16px' }}>
          <div style={{ width: '48px', height: '48px', borderRadius: '50%', background: 'var(--accent-green-glow, rgba(16, 185, 129, 0.15))', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--accent-green, #34d399)' }}>
            <FileCheck size={24} />
          </div>
          <div>
            <div style={{ fontSize: '12px', color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Active Invoices</div>
            <div className="tabular-nums" style={{ fontSize: '24px', fontWeight: 'bold', color: 'var(--text-primary)', marginTop: '4px' }}>
              {globalStats?.totalInvoices || 0}
            </div>
          </div>
        </div>

        <div className="glass-panel" style={{ padding: '20px', display: 'flex', alignItems: 'center', gap: '16px' }}>
          <div style={{ width: '48px', height: '48px', borderRadius: '50%', background: 'var(--accent-amber-glow, rgba(245, 158, 11, 0.15))', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--accent-amber, #fbbf24)' }}>
            <TrendingUp size={24} />
          </div>
          <div>
            <div style={{ fontSize: '12px', color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Auto-Posted Rate</div>
            <div className="tabular-nums" style={{ fontSize: '24px', fontWeight: 'bold', color: 'var(--text-primary)', marginTop: '4px' }}>
              {globalStats?.autoPostedPct || 0}%
            </div>
          </div>
        </div>

        <div className="glass-panel" style={{ padding: '20px', display: 'flex', alignItems: 'center', gap: '16px' }}>
          <div style={{ width: '48px', height: '48px', borderRadius: '50%', background: 'var(--accent-red-glow, rgba(239, 68, 68, 0.15))', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--accent-red, #f87171)' }}>
            <AlertCircle size={24} />
          </div>
          <div>
            <div style={{ fontSize: '12px', color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.05em' }}>ITC at Risk</div>
            <div className="tabular-nums" style={{ fontSize: '24px', fontWeight: 'bold', color: 'var(--text-primary)', marginTop: '4px' }}>
              {globalStats?.totalITCRisk || '₹0'}
            </div>
          </div>
        </div>
      </div>

      {/* SEARCH BAR */}
      <div className="glass-panel" style={{ padding: '16px', display: 'flex', alignItems: 'center', gap: '12px' }}>
        <Search size={20} style={{ color: 'var(--text-muted)' }} />
        <input 
          type="text" 
          placeholder="Search clients by name or GSTIN..." 
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          style={{ 
            background: 'transparent', 
            border: 'none', 
            outline: 'none', 
            color: 'var(--text-primary)', 
            width: '100%', 
            fontSize: '16px' 
          }} 
        />
      </div>

      {/* CLIENT GRID */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '20px' }}>
        {filteredClients.map(client => (
          <div key={client.id} className="glass-panel" style={{ padding: '24px', display: 'flex', flexDirection: 'column', gap: '20px' }}>
            
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
              <div>
                <div style={{ fontSize: '18px', fontWeight: 'bold', color: 'var(--text-primary)', marginBottom: '4px' }}>
                  {client.name}
                </div>
                <div style={{ fontFamily: 'monospace', fontSize: '12px', color: 'var(--text-muted)' }}>
                  {client.gstin}
                </div>
              </div>
              <span className={`badge ${getStatusBadgeClass(client.status)}`}>
                {client.status}
              </span>
            </div>

            <div>
              <span className="badge" style={{ background: 'var(--bg-card)', border: '1px solid var(--border-color)', color: 'var(--text-secondary)' }}>
                {client.category}
              </span>
            </div>

            <div style={{ display: 'flex', justifyContent: 'space-between', borderTop: '1px solid var(--border-color)', borderBottom: '1px solid var(--border-color)', padding: '12px 0' }}>
              <div>
                <div style={{ fontSize: '11px', color: 'var(--text-muted)', textTransform: 'uppercase' }}>Invoices</div>
                <div className="tabular-nums" style={{ fontSize: '16px', color: 'var(--text-primary)', fontWeight: '500' }}>
                  {client.invoicesCount}
                </div>
              </div>
              <div style={{ textAlign: 'right' }}>
                <div style={{ fontSize: '11px', color: 'var(--text-muted)', textTransform: 'uppercase' }}>ITC at Risk</div>
                <div className="tabular-nums" style={{ fontSize: '16px', color: 'var(--accent-red)', fontWeight: '500' }}>
                  {client.itcAtRisk}
                </div>
              </div>
            </div>

            <div>
              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '8px', fontSize: '12px' }}>
                <span style={{ color: 'var(--text-secondary)' }}>Auto-Posted</span>
                <span className="tabular-nums" style={{ color: 'var(--text-primary)', fontWeight: '500' }}>{client.autoPostedPct}%</span>
              </div>
              <div className="progress-container">
                <div 
                  className={`progress-bar ${client.autoPostedPct >= 85 ? 'progress-bar-green' : 'progress-bar-indigo'}`}
                  style={{ width: `${client.autoPostedPct}%` }}
                ></div>
              </div>
            </div>

            <button 
              onClick={() => onSelectClient(client)}
              style={{
                marginTop: 'auto',
                background: 'transparent',
                border: '1px solid var(--accent-indigo)',
                color: 'var(--accent-indigo)',
                padding: '10px 16px',
                borderRadius: '6px',
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: '8px',
                fontSize: '14px',
                fontWeight: '500',
                transition: 'all 0.2s ease'
              }}
              onMouseOver={(e) => {
                e.currentTarget.style.background = 'var(--accent-indigo-glow, rgba(99, 102, 241, 0.1))';
              }}
              onMouseOut={(e) => {
                e.currentTarget.style.background = 'transparent';
              }}
            >
              Open Review Queue <ArrowUpRight size={16} />
            </button>
            
          </div>
        ))}
      </div>
    </div>
  );
};

export default ClientOverview;
