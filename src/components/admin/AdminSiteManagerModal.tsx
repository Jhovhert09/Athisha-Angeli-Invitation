import React, { useState } from 'react';
import { PublicSite, Gender, TemplateStyle } from '../../types/invitation';
import { TEMPLATES, INITIAL_INVITATION_DATA } from '../../utils/templates';
import {
  Globe,
  Plus,
  Check,
  Copy,
  ExternalLink,
  Trash2,
  Lock,
  Unlock,
  Settings2,
  Calendar,
  X,
  Sparkles,
  Users,
  Eye,
  ShieldCheck,
  Heart,
  Key,
} from 'lucide-react';

interface AdminSiteManagerModalProps {
  isOpen: boolean;
  onClose: () => void;
  sites: PublicSite[];
  activeSiteId: string;
  onSelectSite: (siteId: string) => void;
  onCreateSite: (newSite: PublicSite) => void;
  onTogglePublish: (siteId: string) => void;
  onUpdateSiteConfig: (siteId: string, updates: Partial<PublicSite>) => void;
  onDeleteSite: (siteId: string) => void;
  onOpenPublicSite: (slug: string) => void;
  onOpenRsvpsModal?: (siteId?: string) => void;
  onOpenSecurityModal?: () => void;
}

export const AdminSiteManagerModal: React.FC<AdminSiteManagerModalProps> = ({
  isOpen,
  onClose,
  sites,
  activeSiteId,
  onSelectSite,
  onCreateSite,
  onTogglePublish,
  onUpdateSiteConfig,
  onDeleteSite,
  onOpenPublicSite,
  onOpenRsvpsModal,
  onOpenSecurityModal,
}) => {
  const [isCreatingNew, setIsCreatingNew] = useState(false);
  const [editingSiteId, setEditingSiteId] = useState<string | null>(null);
  const [copiedSlug, setCopiedSlug] = useState<string | null>(null);

  // New site form state
  const [newTitle, setNewTitle] = useState('');
  const [newBabyName, setNewBabyName] = useState('');
  const [newGender, setNewGender] = useState<Gender>('neutral');
  const [newSlug, setNewSlug] = useState('');
  const [newTemplateId, setNewTemplateId] = useState('heavenly-blessings');
  const [newPublishImmediately, setNewPublishImmediately] = useState(true);

  if (!isOpen) return null;

  const handleBabyNameChange = (name: string) => {
    setNewBabyName(name);
    // Auto generate clean slug
    const generatedSlug = name
      .toLowerCase()
      .trim()
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/^-|-$/g, '');
    setNewSlug(generatedSlug || 'my-celebration');
    if (!newTitle) {
      setNewTitle(`${name}'s Holy Baptism & 1st Birthday`);
    }
  };

  const handleCreateSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newBabyName.trim()) return;

    const chosenTemplate =
      TEMPLATES.find((t) => t.id === newTemplateId) || TEMPLATES[0];

    // Clone initial data with new baby details
    const newSiteData = {
      ...INITIAL_INVITATION_DATA,
      babyName: newBabyName.trim(),
      babyNickname: newBabyName.trim().split(' ')[0],
      gender: newGender,
      templateId: chosenTemplate.id,
      primaryColor: chosenTemplate.theme.primaryColor,
      secondaryColor: chosenTemplate.theme.secondaryColor,
      accentColor: chosenTemplate.theme.accentColor,
      backgroundColor: chosenTemplate.theme.backgroundColor,
      cardBgColor: chosenTemplate.theme.cardBgColor,
      textColor: chosenTemplate.theme.textColor,
      subtextColor: chosenTemplate.theme.subtextColor,
      frameShape: chosenTemplate.theme.frameShape,
      fontHeading: chosenTemplate.theme.fontHeading,
      fontScript: chosenTemplate.theme.fontScript,
      fontBody: chosenTemplate.theme.fontBody,
      closingSignature: `With love, Parents of ${newBabyName.trim()}`,
    };

    const finalSlug = (newSlug.trim() || 'baby-' + Date.now()).toLowerCase();

    const newPublicSite: PublicSite = {
      id: 'site_' + Date.now(),
      slug: finalSlug,
      title: newTitle.trim() || `${newBabyName}'s Celebration`,
      isPublished: newPublishImmediately,
      publishedAt: newPublishImmediately
        ? new Date().toLocaleDateString('en-US', {
            month: 'short',
            day: 'numeric',
            year: 'numeric',
          })
        : undefined,
      createdAt: new Date().toLocaleDateString('en-US', {
        month: 'short',
        day: 'numeric',
        year: 'numeric',
      }),
      viewCount: 0,
      allowGuestRsvp: true,
      data: newSiteData,
      rsvps: [],
    };

    onCreateSite(newPublicSite);
    setIsCreatingNew(false);
    setNewTitle('');
    setNewBabyName('');
    setNewSlug('');
  };

  const handleCopyLink = (slug: string) => {
    const origin = window.location.origin;
    const pathname = window.location.pathname;
    const url = `${origin}${pathname}?site=${slug}&view=guest`;
    navigator.clipboard.writeText(url);
    setCopiedSlug(slug);
    setTimeout(() => setCopiedSlug(null), 2500);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-fade-in font-montserrat">
      <div className="relative w-full max-w-2xl bg-white rounded-3xl p-6 sm:p-8 shadow-2xl border border-stone-200 max-h-[92vh] flex flex-col">
        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute top-4 right-4 p-2 text-stone-400 hover:text-stone-700 rounded-full hover:bg-stone-100 transition-colors"
          aria-label="Close modal"
        >
          <X className="w-5 h-5" />
        </button>

        {/* Modal Header */}
        <div className="flex items-center justify-between pb-4 border-b border-stone-100 shrink-0">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-amber-500/15 flex items-center justify-center text-amber-800">
              <Globe className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="text-[10px] font-bold tracking-widest uppercase text-amber-800 bg-amber-100/70 px-2 py-0.5 rounded-full">
                  ADMIN CONSOLE
                </span>
                <span className="text-xs text-stone-400">• Multi-Site Hub</span>
              </div>
              <h3 className="font-cormorant text-2xl font-bold text-stone-900 leading-tight">
                Public Guest Sites Manager
              </h3>
            </div>
          </div>

          {!isCreatingNew && (
            <div className="flex items-center gap-2">
              {onOpenSecurityModal && (
                <button
                  onClick={() => onOpenSecurityModal()}
                  className="px-3 py-2 rounded-xl text-xs font-semibold text-amber-900 bg-amber-50 hover:bg-amber-100 border border-amber-200/80 transition-all flex items-center gap-1.5 cursor-pointer active:scale-95"
                  title="Update admin login username and password"
                >
                  <Key className="w-3.5 h-3.5 text-amber-700" />
                  <span className="hidden sm:inline">Credentials</span>
                </button>
              )}
              {onOpenRsvpsModal && (
                <button
                  onClick={() => onOpenRsvpsModal()}
                  className="px-3.5 py-2 rounded-xl text-xs font-semibold text-rose-800 bg-rose-50 hover:bg-rose-100 border border-rose-200 transition-all flex items-center gap-1.5 cursor-pointer active:scale-95"
                >
                  <Heart className="w-3.5 h-3.5 fill-rose-500/20 text-rose-600" />
                  <span>All RSVPs</span>
                </button>
              )}
              <button
                onClick={() => setIsCreatingNew(true)}
                className="px-3.5 py-2 rounded-xl text-xs font-semibold text-white bg-stone-900 hover:bg-stone-800 transition-all flex items-center gap-1.5 shadow-xs cursor-pointer active:scale-95"
              >
                <Plus className="w-4 h-4" />
                <span>Create New Site</span>
              </button>
            </div>
          )}
        </div>

        {/* Content Body */}
        <div className="flex-1 overflow-y-auto py-4 space-y-4">
          {/* ========================================================================= */}
          {/* CREATE NEW PUBLIC SITE FORM                                               */}
          {/* ========================================================================= */}
          {isCreatingNew ? (
            <form onSubmit={handleCreateSubmit} className="space-y-4 p-5 bg-stone-50 rounded-2xl border border-stone-200">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2 text-stone-800 font-semibold text-sm">
                  <Sparkles className="w-4 h-4 text-amber-700" />
                  <span>Create New Public Invitation Website</span>
                </div>
                <button
                  type="button"
                  onClick={() => setIsCreatingNew(false)}
                  className="text-xs text-stone-500 hover:text-stone-800"
                >
                  Cancel
                </button>
              </div>

              <div>
                <label className="block text-xs font-semibold text-stone-700 mb-1">
                  Baby&apos;s Full Name <span className="text-amber-700">*</span>
                </label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Sophia Rose"
                  value={newBabyName}
                  onChange={(e) => handleBabyNameChange(e.target.value)}
                  className="w-full px-3.5 py-2 text-xs bg-white border border-stone-200 rounded-xl focus:ring-2 focus:ring-amber-500/20"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-stone-700 mb-1">
                    Event / Site Title
                  </label>
                  <input
                    type="text"
                    placeholder="e.g. Sophia Rose's Christening"
                    value={newTitle}
                    onChange={(e) => setNewTitle(e.target.value)}
                    className="w-full px-3.5 py-2 text-xs bg-white border border-stone-200 rounded-xl"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-stone-700 mb-1">
                    Public URL Slug
                  </label>
                  <div className="flex items-center">
                    <span className="text-[11px] text-stone-400 pl-2 pr-1 select-none">/site?</span>
                    <input
                      type="text"
                      required
                      placeholder="sophia-rose"
                      value={newSlug}
                      onChange={(e) => setNewSlug(e.target.value)}
                      className="w-full px-2.5 py-2 text-xs bg-white border border-stone-200 rounded-xl font-mono text-stone-700"
                    />
                  </div>
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-stone-700 mb-1.5">
                  Choose Starting Aesthetic Style
                </label>
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                  {TEMPLATES.slice(0, 4).map((tpl) => (
                    <button
                      key={tpl.id}
                      type="button"
                      onClick={() => setNewTemplateId(tpl.id)}
                      className={`p-2.5 rounded-xl border text-left text-xs transition-all ${
                        newTemplateId === tpl.id
                          ? 'border-amber-600 bg-white ring-2 ring-amber-500/20'
                          : 'border-stone-200 bg-white/70 hover:bg-white'
                      }`}
                    >
                      <span
                        className="w-3.5 h-3.5 rounded-full inline-block mb-1 shadow-xs"
                        style={{ backgroundColor: tpl.previewColor }}
                      />
                      <span className="block font-semibold text-stone-800 text-[11px] leading-tight">
                        {tpl.name}
                      </span>
                    </button>
                  ))}
                </div>
              </div>

              <div className="flex items-center justify-between pt-2">
                <label className="flex items-center gap-2 cursor-pointer text-xs text-stone-700 font-medium">
                  <input
                    type="checkbox"
                    checked={newPublishImmediately}
                    onChange={(e) => setNewPublishImmediately(e.target.checked)}
                    className="rounded text-amber-600 w-4 h-4"
                  />
                  <span>Publish immediately for public guest viewing</span>
                </label>

                <button
                  type="submit"
                  className="py-2.5 px-5 rounded-xl text-xs font-semibold text-white bg-amber-700 hover:bg-amber-800 shadow-sm transition-all"
                >
                  Create Public Site
                </button>
              </div>
            </form>
          ) : null}

          {/* ========================================================================= */}
          {/* LIST OF CREATED SITES                                                     */}
          {/* ========================================================================= */}
          <div className="space-y-3">
            <div className="flex items-center justify-between text-xs text-stone-500 px-1">
              <span className="font-semibold uppercase tracking-wider text-[10px] text-stone-400">
                Public Sites ({sites.length})
              </span>
              <span>Click a site to load in studio</span>
            </div>

            {sites.map((site) => {
              const origin = window.location.origin;
              const pathname = window.location.pathname;
              const guestUrl = `${origin}${pathname}?site=${site.slug}&view=guest`;
              const isActive = site.id === activeSiteId;

              return (
                <div
                  key={site.id}
                  className={`p-4 rounded-2xl border transition-all ${
                    isActive
                      ? 'border-amber-500/80 bg-amber-50/20 shadow-sm ring-1 ring-amber-500/20'
                      : 'border-stone-200 bg-white hover:border-stone-300'
                  }`}
                >
                  {/* Top Bar of card */}
                  <div className="flex items-start justify-between gap-3 mb-2">
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-1">
                        {site.isPublished ? (
                          <span className="inline-flex items-center gap-1 text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-800">
                            <span className="w-1.5 h-1.5 rounded-full bg-emerald-600 animate-pulse" />
                            <span>Live for Guests</span>
                          </span>
                        ) : (
                          <span className="inline-flex items-center gap-1 text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-full bg-stone-100 text-stone-600">
                            <span>Draft / Offline</span>
                          </span>
                        )}

                        {isActive && (
                          <span className="text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-full bg-amber-100 text-amber-800">
                            Active in Studio
                          </span>
                        )}

                        {site.passwordProtected && (
                          <span className="inline-flex items-center gap-1 text-[10px] text-stone-500">
                            <Lock className="w-3 h-3 text-amber-700" />
                            <span>PIN Protected</span>
                          </span>
                        )}
                      </div>

                      <h4 className="text-sm font-bold text-stone-900">
                        {site.title}
                      </h4>
                      <p className="text-xs text-stone-500">
                        Baby: <strong className="text-stone-700">{site.data.babyName}</strong> · Created {site.createdAt}
                      </p>
                    </div>

                    {/* Quick Publish Toggle */}
                    <button
                      onClick={() => onTogglePublish(site.id)}
                      className={`px-3 py-1.5 rounded-xl text-xs font-semibold transition-all cursor-pointer ${
                        site.isPublished
                          ? 'bg-stone-100 text-stone-700 hover:bg-stone-200'
                          : 'bg-emerald-600 text-white hover:bg-emerald-700 shadow-xs'
                      }`}
                    >
                      {site.isPublished ? 'Unpublish' : 'Publish Site'}
                    </button>
                  </div>

                  {/* Public Link row */}
                  <div className="flex items-center gap-2 p-2 bg-stone-50 rounded-xl border border-stone-200/80 mb-3 text-xs">
                    <Globe className="w-3.5 h-3.5 text-stone-400 shrink-0" />
                    <span className="font-mono text-[11px] text-stone-600 truncate flex-1 select-all">
                      {guestUrl}
                    </span>

                    <button
                      onClick={() => handleCopyLink(site.slug)}
                      className="p-1 text-stone-500 hover:text-stone-900 rounded-md hover:bg-white transition-colors"
                      title="Copy Public Guest Link"
                    >
                      {copiedSlug === site.slug ? (
                        <Check className="w-3.5 h-3.5 text-emerald-600" />
                      ) : (
                        <Copy className="w-3.5 h-3.5" />
                      )}
                    </button>

                    <button
                      onClick={() => onOpenPublicSite(site.slug)}
                      className="p-1 text-stone-500 hover:text-stone-900 rounded-md hover:bg-white transition-colors"
                      title="Open Public Site in Guest View"
                    >
                      <ExternalLink className="w-3.5 h-3.5" />
                    </button>
                  </div>

                  {/* Metrics and Actions Bar */}
                  <div className="flex items-center justify-between pt-2 border-t border-stone-100 text-xs">
                    <div className="flex items-center gap-4 text-stone-500 text-[11px]">
                      {onOpenRsvpsModal ? (
                        <button
                          onClick={() => onOpenRsvpsModal(site.id)}
                          className="flex items-center gap-1 text-rose-700 hover:text-rose-900 font-semibold cursor-pointer"
                          title="Click to view RSVPs for this site"
                        >
                          <Heart className="w-3 h-3 fill-rose-500/20 text-rose-600" />
                          <span>{site.rsvps.length} RSVPs</span>
                        </button>
                      ) : (
                        <span className="flex items-center gap-1">
                          <Users className="w-3 h-3 text-stone-400" />
                          <span>{site.rsvps.length} RSVPs</span>
                        </span>
                      )}
                      <span>
                        Theme: <strong className="text-stone-700 capitalize">{site.data.templateId.replace('-', ' ')}</strong>
                      </span>
                    </div>

                    <div className="flex items-center gap-1.5">
                      {!isActive && (
                        <button
                          onClick={() => onSelectSite(site.id)}
                          className="px-2.5 py-1 rounded-lg text-xs font-semibold bg-stone-100 hover:bg-stone-200 text-stone-700 transition-colors cursor-pointer"
                        >
                          Load into Studio
                        </button>
                      )}

                      {sites.length > 1 && (
                        <button
                          onClick={() => {
                            if (window.confirm(`Delete public site "${site.title}"?`)) {
                              onDeleteSite(site.id);
                            }
                          }}
                          className="p-1.5 text-stone-400 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition-colors"
                          title="Delete Site"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      )}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Footer */}
        <div className="pt-3 border-t border-stone-100 flex items-center justify-between text-xs text-stone-500 shrink-0">
          <div className="flex items-center gap-1.5">
            <ShieldCheck className="w-4 h-4 text-amber-700" />
            <span>Admin Control Active</span>
          </div>
          <button
            onClick={onClose}
            className="px-4 py-2 rounded-xl text-xs font-semibold bg-stone-900 text-white hover:bg-stone-800 transition-colors"
          >
            Done
          </button>
        </div>
      </div>
    </div>
  );
};
