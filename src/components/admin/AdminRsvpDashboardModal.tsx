import React, { useState, useMemo } from 'react';
import { PublicSite, GuestRsvp } from '../../types/invitation';
import {
  Heart,
  Users,
  Search,
  Filter,
  Download,
  Trash2,
  CheckCircle2,
  XCircle,
  X,
  MessageSquare,
  Calendar,
  Globe,
  Printer,
  Sparkles,
} from 'lucide-react';

interface AdminRsvpDashboardModalProps {
  isOpen: boolean;
  onClose: () => void;
  sites: PublicSite[];
  activeSiteId: string;
  onDeleteRsvp: (siteId: string, rsvpId: string) => void;
  onClearSiteRsvps: (siteId: string) => void;
}

export const AdminRsvpDashboardModal: React.FC<AdminRsvpDashboardModalProps> = ({
  isOpen,
  onClose,
  sites,
  activeSiteId,
  onDeleteRsvp,
  onClearSiteRsvps,
}) => {
  const [selectedSiteFilter, setSelectedSiteFilter] = useState<string>('all');
  const [statusFilter, setStatusFilter] = useState<'all' | 'attending' | 'declined'>('all');
  const [searchQuery, setSearchQuery] = useState<string>('');

  if (!isOpen) return null;

  // Flatten all RSVPs with site metadata
  const allFlattenedRsvps = useMemo(() => {
    const list: Array<{
      siteId: string;
      siteTitle: string;
      babyName: string;
      rsvp: GuestRsvp;
    }> = [];

    sites.forEach((site) => {
      site.rsvps.forEach((rsvp) => {
        list.push({
          siteId: site.id,
          siteTitle: site.title,
          babyName: site.data.babyName,
          rsvp,
        });
      });
    });

    // Sort newest first
    return list.sort((a, b) => b.rsvp.id.localeCompare(a.rsvp.id));
  }, [sites]);

  // Filtered RSVPs
  const filteredRsvps = useMemo(() => {
    return allFlattenedRsvps.filter((item) => {
      // Site filter
      if (selectedSiteFilter !== 'all' && item.siteId !== selectedSiteFilter) {
        return false;
      }
      // Status filter
      if (statusFilter === 'attending' && !item.rsvp.attending) {
        return false;
      }
      if (statusFilter === 'declined' && item.rsvp.attending) {
        return false;
      }
      // Search query
      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase().trim();
        const matchesName = item.rsvp.name.toLowerCase().includes(q);
        const matchesMessage = (item.rsvp.message || '').toLowerCase().includes(q);
        const matchesBaby = item.babyName.toLowerCase().includes(q);
        if (!matchesName && !matchesMessage && !matchesBaby) {
          return false;
        }
      }
      return true;
    });
  }, [allFlattenedRsvps, selectedSiteFilter, statusFilter, searchQuery]);

  // Overall Stats
  const totalRsvps = allFlattenedRsvps.length;
  const totalAttending = allFlattenedRsvps.filter((i) => i.rsvp.attending).length;
  const totalDeclined = allFlattenedRsvps.filter((i) => !i.rsvp.attending).length;

  // Export CSV
  const handleExportCsv = () => {
    if (filteredRsvps.length === 0) return;
    const headers = ['Celebration Site', 'Baby Name', 'Guest Name', 'Status', 'Message', 'Date Submitted'];
    const rows = filteredRsvps.map((item) => [
      `"${item.siteTitle}"`,
      `"${item.babyName}"`,
      `"${item.rsvp.name}"`,
      item.rsvp.attending ? 'Attending' : 'Declined',
      `"${item.rsvp.message || ''}"`,
      `"${item.rsvp.submittedAt}"`,
    ]);

    const csvContent =
      'data:text/csv;charset=utf-8,' +
      [headers.join(','), ...rows.map((e) => e.join(','))].join('\n');
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', `Admin_RSVP_Responses_${new Date().toISOString().slice(0, 10)}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const handlePrint = () => {
    window.print();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-fade-in font-montserrat">
      <div className="relative w-full max-w-4xl bg-white rounded-3xl p-6 sm:p-8 shadow-2xl border border-stone-200 max-h-[92vh] flex flex-col">
        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute top-4 right-4 p-2 text-stone-400 hover:text-stone-700 rounded-full hover:bg-stone-100 transition-colors"
          aria-label="Close modal"
        >
          <X className="w-5 h-5" />
        </button>

        {/* Modal Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-4 border-b border-stone-100 shrink-0 gap-3">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-rose-50 border border-rose-100 flex items-center justify-center text-rose-600">
              <Heart className="w-5 h-5 fill-rose-500/20" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="text-[10px] font-bold tracking-widest uppercase text-rose-700 bg-rose-50 border border-rose-100 px-2 py-0.5 rounded-full">
                  ADMIN RSVP DASHBOARD
                </span>
                <span className="text-xs text-stone-400">• Guest Responses</span>
              </div>
              <h3 className="font-cormorant text-2xl font-bold text-stone-900 leading-tight">
                All Guest RSVP Responses
              </h3>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={handlePrint}
              className="px-3 py-2 rounded-xl text-xs font-semibold text-stone-700 bg-stone-100 hover:bg-stone-200 transition-colors flex items-center gap-1.5 cursor-pointer"
            >
              <Printer className="w-3.5 h-3.5 text-stone-500" />
              <span>Print</span>
            </button>
            <button
              onClick={handleExportCsv}
              disabled={filteredRsvps.length === 0}
              className="px-3.5 py-2 rounded-xl text-xs font-semibold text-white bg-stone-900 hover:bg-stone-800 disabled:opacity-40 transition-all flex items-center gap-1.5 shadow-xs cursor-pointer"
            >
              <Download className="w-3.5 h-3.5" />
              <span>Export CSV</span>
            </button>
          </div>
        </div>

        {/* Metric Cards Bar */}
        <div className="grid grid-cols-3 gap-3 py-4 shrink-0">
          <div className="p-3.5 bg-stone-50 rounded-2xl border border-stone-200/80 flex items-center justify-between">
            <div>
              <span className="text-[10px] uppercase font-bold tracking-wider text-stone-400 block">
                Total Responses
              </span>
              <span className="text-2xl font-bold text-stone-900 font-cormorant">
                {totalRsvps}
              </span>
            </div>
            <Users className="w-6 h-6 text-stone-300" />
          </div>

          <div className="p-3.5 bg-emerald-50/70 rounded-2xl border border-emerald-200 flex items-center justify-between">
            <div>
              <span className="text-[10px] uppercase font-bold tracking-wider text-emerald-800 block">
                Attending Guests
              </span>
              <span className="text-2xl font-bold text-emerald-950 font-cormorant">
                {totalAttending}
              </span>
            </div>
            <CheckCircle2 className="w-6 h-6 text-emerald-400" />
          </div>

          <div className="p-3.5 bg-stone-100/70 rounded-2xl border border-stone-200 flex items-center justify-between">
            <div>
              <span className="text-[10px] uppercase font-bold tracking-wider text-stone-500 block">
                Declined
              </span>
              <span className="text-2xl font-bold text-stone-700 font-cormorant">
                {totalDeclined}
              </span>
            </div>
            <XCircle className="w-6 h-6 text-stone-300" />
          </div>
        </div>

        {/* Search & Filter Bar */}
        <div className="p-3 bg-stone-50 rounded-2xl border border-stone-200/80 shrink-0 space-y-2 sm:space-y-0 sm:flex sm:items-center sm:gap-3">
          {/* Search box */}
          <div className="relative flex-1">
            <Search className="w-3.5 h-3.5 text-stone-400 absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              placeholder="Search by guest name or blessing message..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-8 pr-3 py-1.5 text-xs bg-white border border-stone-200 rounded-xl focus:ring-2 focus:ring-stone-300 text-stone-800 placeholder:text-stone-400"
            />
          </div>

          <div className="flex items-center gap-2">
            {/* Site selector dropdown */}
            <select
              value={selectedSiteFilter}
              onChange={(e) => setSelectedSiteFilter(e.target.value)}
              className="px-2.5 py-1.5 text-xs bg-white border border-stone-200 rounded-xl text-stone-700 font-medium"
            >
              <option value="all">All Public Sites ({sites.length})</option>
              {sites.map((s) => (
                <option key={s.id} value={s.id}>
                  {s.data.babyName} ({s.rsvps.length})
                </option>
              ))}
            </select>

            {/* Status toggle tabs */}
            <div className="flex items-center bg-stone-200/60 p-0.5 rounded-xl text-xs">
              <button
                onClick={() => setStatusFilter('all')}
                className={`px-2.5 py-1 rounded-lg text-[11px] font-semibold transition-all ${
                  statusFilter === 'all'
                    ? 'bg-white text-stone-900 shadow-xs'
                    : 'text-stone-600 hover:text-stone-900'
                }`}
              >
                All
              </button>
              <button
                onClick={() => setStatusFilter('attending')}
                className={`px-2.5 py-1 rounded-lg text-[11px] font-semibold transition-all ${
                  statusFilter === 'attending'
                    ? 'bg-white text-emerald-800 shadow-xs'
                    : 'text-stone-600 hover:text-stone-900'
                }`}
              >
                Attending
              </button>
              <button
                onClick={() => setStatusFilter('declined')}
                className={`px-2.5 py-1 rounded-lg text-[11px] font-semibold transition-all ${
                  statusFilter === 'declined'
                    ? 'bg-white text-stone-800 shadow-xs'
                    : 'text-stone-600 hover:text-stone-900'
                }`}
              >
                Declined
              </button>
            </div>
          </div>
        </div>

        {/* Responses Table / List */}
        <div className="flex-1 overflow-y-auto py-3 space-y-2.5">
          {filteredRsvps.length === 0 ? (
            <div className="text-center py-12 px-4 bg-stone-50 rounded-2xl border border-dashed border-stone-200">
              <Heart className="w-8 h-8 text-stone-300 mx-auto mb-2" />
              <h4 className="text-sm font-bold text-stone-700">No RSVP responses match</h4>
              <p className="text-xs text-stone-400 mt-1 max-w-sm mx-auto">
                {totalRsvps === 0
                  ? 'No guests have responded yet. Share your public site link to start collecting RSVPs!'
                  : 'Try clearing your search query or filter options above.'}
              </p>
            </div>
          ) : (
            filteredRsvps.map((item) => (
              <div
                key={`${item.siteId}_${item.rsvp.id}`}
                className="p-4 bg-stone-50/70 hover:bg-stone-50 rounded-2xl border border-stone-200 transition-colors flex flex-col sm:flex-row sm:items-start justify-between gap-3"
              >
                <div className="flex-1 space-y-1.5">
                  <div className="flex items-center gap-2">
                    <span className="text-sm font-bold text-stone-900 font-montserrat">
                      {item.rsvp.name}
                    </span>

                    {item.rsvp.attending ? (
                      <span className="inline-flex items-center gap-1 text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-800">
                        <CheckCircle2 className="w-3 h-3 text-emerald-600" />
                        <span>Attending</span>
                      </span>
                    ) : (
                      <span className="inline-flex items-center gap-1 text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-full bg-stone-200 text-stone-600">
                        <XCircle className="w-3 h-3 text-stone-400" />
                        <span>Declined</span>
                      </span>
                    )}

                    <span className="text-stone-300 text-xs">•</span>

                    <span className="text-[11px] text-stone-400 font-mono">
                      {item.rsvp.submittedAt}
                    </span>
                  </div>

                  {/* Public Site Source Badge */}
                  <div className="flex items-center gap-1.5 text-xs text-stone-500">
                    <Globe className="w-3 h-3 text-amber-700" />
                    <span>Site:</span>
                    <strong className="text-stone-700">{item.siteTitle}</strong>
                    <span className="text-stone-400">({item.babyName})</span>
                  </div>

                  {/* Guest Message / Blessing */}
                  {item.rsvp.message ? (
                    <div className="p-2.5 bg-white rounded-xl border border-stone-200/80 text-xs text-stone-700 flex items-start gap-2 shadow-2xs">
                      <MessageSquare className="w-3.5 h-3.5 text-amber-600 shrink-0 mt-0.5" />
                      <p className="italic leading-relaxed">
                        &ldquo;{item.rsvp.message}&rdquo;
                      </p>
                    </div>
                  ) : (
                    <p className="text-[11px] text-stone-400 italic">No note left</p>
                  )}
                </div>

                {/* Actions */}
                <div className="shrink-0 flex items-center gap-2 sm:self-center">
                  <button
                    onClick={() => {
                      if (window.confirm(`Delete RSVP response for "${item.rsvp.name}"?`)) {
                        onDeleteRsvp(item.siteId, item.rsvp.id);
                      }
                    }}
                    className="p-1.5 text-stone-400 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition-colors cursor-pointer"
                    title="Delete RSVP response"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>
            ))
          )}
        </div>

        {/* Modal Footer */}
        <div className="pt-3 border-t border-stone-100 flex items-center justify-between text-xs text-stone-500 shrink-0">
          <span>
            Showing <strong className="text-stone-800">{filteredRsvps.length}</strong> of{' '}
            <strong className="text-stone-800">{totalRsvps}</strong> total responses
          </span>

          <button
            onClick={onClose}
            className="px-5 py-2 rounded-xl text-xs font-semibold bg-stone-900 text-white hover:bg-stone-800 transition-colors cursor-pointer"
          >
            Done
          </button>
        </div>
      </div>
    </div>
  );
};
