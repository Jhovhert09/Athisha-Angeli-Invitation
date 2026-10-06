import React, { useState } from 'react';
import {
  InvitationData,
  TemplateStyle,
  FrameShape,
  FontHeading,
  FontScript,
  FontBody,
  Gender,
  GuestRsvp,
} from '../../types/invitation';
import { TEMPLATES } from '../../utils/templates';
import { PhotoUploader } from '../common/PhotoUploader';
import {
  Sparkles,
  Palette,
  FileText,
  Users,
  Image,
  Calendar,
  Clock,
  Heart,
  Plus,
  Trash2,
  Check,
  Music,
  Download,
  Share2,
  Upload,
  RotateCcw,
  CheckCircle2,
  XCircle,
  Search,
  ExternalLink,
  Phone,
} from 'lucide-react';

interface BuilderSidebarProps {
  data: InvitationData;
  onChange: (updated: InvitationData) => void;
  guestRsvps: GuestRsvp[];
  onOpenShare: () => void;
  onClearRsvps: () => void;
  onOpenAllRsvpsModal?: () => void;
  onDeleteSingleRsvp?: (rsvpId: string) => void;
}

type TabType = 'invitation' | 'design' | 'family' | 'gallery' | 'rsvps';

export const BuilderSidebar: React.FC<BuilderSidebarProps> = ({
  data,
  onChange,
  guestRsvps,
  onOpenShare,
  onClearRsvps,
  onOpenAllRsvpsModal,
  onDeleteSingleRsvp,
}) => {
  const [activeTab, setActiveTab] = useState<TabType>('invitation');
  const [rsvpStatusFilter, setRsvpStatusFilter] = useState<'all' | 'attending' | 'declined'>('all');
  const [rsvpSearchQuery, setRsvpSearchQuery] = useState('');

  // Update helper
  const updateField = <K extends keyof InvitationData>(field: K, value: InvitationData[K]) => {
    onChange({
      ...data,
      [field]: value,
    });
  };

  // Preset baby photos generated for the app
  const photoPresets = [
    {
      label: 'Baptism Christening Outfit',
      url: '/src/assets/images/baby_baptism_portrait_1791254793568.jpg',
    },
    {
      label: 'Sleeping Angel',
      url: '/src/assets/images/baby_sleeping_angel_1791254831082.jpg',
    },
    {
      label: 'Joyful 1-Year Teddy Memory',
      url: '/src/assets/images/baby_teddy_memory_1791254818642.jpg',
    },
    {
      label: 'Golden Cake Celebration',
      url: '/src/assets/images/baptism_cake_gold_1791254806162.jpg',
    },
  ];

  // Apply template
  const handleApplyTemplate = (tpl: TemplateStyle) => {
    onChange({
      ...data,
      templateId: tpl.id,
      primaryColor: tpl.theme.primaryColor,
      secondaryColor: tpl.theme.secondaryColor,
      accentColor: tpl.theme.accentColor,
      backgroundColor: tpl.theme.backgroundColor,
      cardBgColor: tpl.theme.cardBgColor,
      textColor: tpl.theme.textColor,
      subtextColor: tpl.theme.subtextColor,
      frameShape: tpl.theme.frameShape,
      fontHeading: tpl.theme.fontHeading,
      fontScript: tpl.theme.fontScript,
      fontBody: tpl.theme.fontBody,
    });
  };

  // Add Godparent
  const handleAddGodparent = () => {
    const newGp = {
      id: 'gp_' + Date.now(),
      name: 'New Sponsor',
      role: 'Godmother' as const,
      relationship: 'Friend',
    };
    updateField('godparents', [...data.godparents, newGp]);
  };

  // Remove Godparent
  const handleRemoveGodparent = (id: string) => {
    updateField(
      'godparents',
      data.godparents.filter((g) => g.id !== id)
    );
  };

  // Replace a specific gallery photo
  const handleReplaceGalleryPhoto = (index: number, newUrl: string) => {
    const updated = [...data.photos];
    updated[index] = {
      ...updated[index],
      url: newUrl,
    };
    updateField('photos', updated);
  };

  // Add a new gallery photo
  const handleAddGalleryPhoto = (newUrl: string) => {
    const newPhoto = {
      id: 'photo_' + Date.now(),
      url: newUrl,
      caption: `Milestone Memory #${data.photos.length + 1}`,
      ageMonth: `Month ${data.photos.length + 1}`,
    };
    updateField('photos', [...data.photos, newPhoto]);
  };

  // Remove a gallery photo
  const handleRemoveGalleryPhoto = (index: number) => {
    if (data.photos.length <= 1) {
      alert('Please keep at least one milestone memory photo in the gallery.');
      return;
    }
    const updated = data.photos.filter((_, i) => i !== index);
    updateField('photos', updated);
  };

  // Restore sample gallery photos
  const handleResetSamplePhotos = () => {
    const samples = [
      {
        id: 'photo-1',
        url: '/src/assets/images/baby_baptism_portrait_1791254793568.jpg',
        caption: 'Blessings & White Heirloom Christening Outfit',
        ageMonth: 'Month 11',
      },
      {
        id: 'photo-2',
        url: '/src/assets/images/baby_sleeping_angel_1791254831082.jpg',
        caption: 'Our peaceful little angel dreaming sweet dreams',
        ageMonth: 'Newborn',
      },
      {
        id: 'photo-3',
        url: '/src/assets/images/baby_teddy_memory_1791254818642.jpg',
        caption: 'Playful giggles with teddy bear companion',
        ageMonth: 'Month 8',
      },
      {
        id: 'photo-4',
        url: '/src/assets/images/baptism_cake_gold_1791254806162.jpg',
        caption: 'Golden leaf 1st celebration cake & white flowers',
        ageMonth: 'Year 1',
      },
    ];
    updateField('photos', samples);
  };

  // Export RSVPs to CSV
  const handleExportRsvps = () => {
    if (guestRsvps.length === 0) return;
    const headers = ['Name', 'Attending', 'Message', 'Date'];
    const rows = guestRsvps.map((r) => [
      `"${r.name}"`,
      r.attending ? 'Yes' : 'No',
      `"${r.message || ''}"`,
      `"${r.submittedAt}"`,
    ]);
    const csvContent =
      'data:text/csv;charset=utf-8,' +
      [headers.join(','), ...rows.map((e) => e.join(','))].join('\n');
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', `${data.babyName}_RSVP_List.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const attendingRsvps = guestRsvps.filter((r) => r.attending);
  const declinedRsvps = guestRsvps.filter((r) => !r.attending);
  const attendingCount = attendingRsvps.length;
  const declinedCount = declinedRsvps.length;
  const totalHeadcount = attendingRsvps.reduce((sum, r) => sum + (r.guestCount || 1), 0);

  const displayedRsvps = guestRsvps.filter((rsvp) => {
    if (rsvpStatusFilter === 'attending' && !rsvp.attending) return false;
    if (rsvpStatusFilter === 'declined' && rsvp.attending) return false;
    if (rsvpSearchQuery.trim()) {
      const q = rsvpSearchQuery.toLowerCase().trim();
      const matchName = rsvp.name.toLowerCase().includes(q);
      const matchMsg = (rsvp.message || '').toLowerCase().includes(q);
      if (!matchName && !matchMsg) return false;
    }
    return true;
  });

  return (
    <div className="w-full h-full flex flex-col bg-white border-r border-stone-200 font-montserrat select-none">
      {/* Sidebar Header */}
      <div className="p-4 border-b border-stone-200 flex items-center justify-between bg-stone-50/50">
        <div>
          <span className="text-[10px] tracking-widest uppercase font-semibold text-amber-700 block">
            INVITATION DESIGN STUDIO
          </span>
          <h2 className="text-sm font-bold text-stone-800">
            {data.babyName}&apos;s Celebration
          </h2>
        </div>
        <button
          onClick={onOpenShare}
          className="px-3.5 py-1.5 rounded-xl text-xs font-semibold text-white flex items-center gap-1.5 shadow-xs transition-all hover:opacity-95 active:scale-95 cursor-pointer"
          style={{ backgroundColor: data.accentColor }}
        >
          <Share2 className="w-3.5 h-3.5" />
          <span>Publish &amp; Link</span>
        </button>
      </div>

      {/* Navigation Tabs */}
      <div className="grid grid-cols-5 p-1 bg-stone-100 border-b border-stone-200 text-xs">
        <button
          onClick={() => setActiveTab('invitation')}
          className={`py-2 px-1 text-center font-medium rounded-lg transition-all flex flex-col items-center gap-1 ${
            activeTab === 'invitation'
              ? 'bg-white text-stone-900 shadow-xs'
              : 'text-stone-500 hover:text-stone-900'
          }`}
        >
          <FileText className="w-4 h-4" />
          <span className="text-[10px]">Event</span>
        </button>

        <button
          onClick={() => setActiveTab('design')}
          className={`py-2 px-1 text-center font-medium rounded-lg transition-all flex flex-col items-center gap-1 ${
            activeTab === 'design'
              ? 'bg-white text-stone-900 shadow-xs'
              : 'text-stone-500 hover:text-stone-900'
          }`}
        >
          <Palette className="w-4 h-4" />
          <span className="text-[10px]">Design</span>
        </button>

        <button
          onClick={() => setActiveTab('family')}
          className={`py-2 px-1 text-center font-medium rounded-lg transition-all flex flex-col items-center gap-1 ${
            activeTab === 'family'
              ? 'bg-white text-stone-900 shadow-xs'
              : 'text-stone-500 hover:text-stone-900'
          }`}
        >
          <Users className="w-4 h-4" />
          <span className="text-[10px]">Family</span>
        </button>

        <button
          onClick={() => setActiveTab('gallery')}
          className={`py-2 px-1 text-center font-medium rounded-lg transition-all flex flex-col items-center gap-1 ${
            activeTab === 'gallery'
              ? 'bg-white text-stone-900 shadow-xs'
              : 'text-stone-500 hover:text-stone-900'
          }`}
        >
          <Image className="w-4 h-4" />
          <span className="text-[10px]">Photos</span>
        </button>

        <button
          onClick={() => setActiveTab('rsvps')}
          className={`py-2 px-1 text-center font-medium rounded-lg transition-all flex flex-col items-center gap-1 relative ${
            activeTab === 'rsvps'
              ? 'bg-white text-stone-900 shadow-xs'
              : 'text-stone-500 hover:text-stone-900'
          }`}
        >
          <Heart className="w-4 h-4" />
          <span className="text-[10px]">RSVP ({guestRsvps.length})</span>
        </button>
      </div>

      {/* Tab Body */}
      <div className="flex-1 overflow-y-auto p-4 space-y-6">
        {/* ========================================================================= */}
        {/* TAB 1: INVITATION & EVENT DETAILS                                         */}
        {/* ========================================================================= */}
        {activeTab === 'invitation' && (
          <div className="space-y-5">
            {/* Baby Information */}
            <div className="space-y-3">
              <h3 className="text-xs font-bold tracking-wider uppercase text-stone-400">
                Baby &amp; Milestone
              </h3>

              <div>
                <label className="block text-xs font-medium text-stone-700 mb-1">
                  Baby&apos;s Full Name
                </label>
                <input
                  type="text"
                  value={data.babyName}
                  onChange={(e) => updateField('babyName', e.target.value)}
                  className="w-full px-3 py-2 text-xs border border-stone-200 rounded-xl focus:ring-1 focus:ring-stone-400"
                />
              </div>

              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="block text-xs font-medium text-stone-700 mb-1">
                    Nickname / Call Name
                  </label>
                  <input
                    type="text"
                    value={data.babyNickname}
                    onChange={(e) => updateField('babyNickname', e.target.value)}
                    className="w-full px-3 py-2 text-xs border border-stone-200 rounded-xl"
                  />
                </div>
                <div>
                  <label className="block text-xs font-medium text-stone-700 mb-1">
                    Theme Affinity
                  </label>
                  <select
                    value={data.gender}
                    onChange={(e) => updateField('gender', e.target.value as Gender)}
                    className="w-full px-3 py-2 text-xs border border-stone-200 rounded-xl bg-white"
                  >
                    <option value="boy">Little Prince (Boy)</option>
                    <option value="girl">Little Princess (Girl)</option>
                    <option value="neutral">Classic Neutral</option>
                  </select>
                </div>
              </div>

              {/* Baby Portrait Photo Uploader */}
              <div className="pt-1">
                <PhotoUploader
                  label="Baby Portrait Photo"
                  description="Cover Screen & Sacred Invitation Hero"
                  currentUrl={data.babyPhotoUrl}
                  onPhotoChange={(url) => updateField('babyPhotoUrl', url)}
                  accentColor={data.accentColor}
                  showPresets={true}
                  presets={photoPresets}
                  aspectRatio="portrait"
                />
              </div>

              <div>
                <label className="block text-xs font-medium text-stone-700 mb-1">
                  Intro Invitation Message
                </label>
                <textarea
                  rows={2}
                  value={data.introText}
                  onChange={(e) => updateField('introText', e.target.value)}
                  className="w-full px-3 py-2 text-xs border border-stone-200 rounded-xl resize-none"
                />
              </div>
            </div>

            {/* Baptism Ceremony */}
            <div className="space-y-3 pt-3 border-t border-stone-100">
              <div className="flex items-center gap-1.5 text-xs font-bold tracking-wider uppercase text-amber-800">
                <Calendar className="w-3.5 h-3.5" />
                <span>Holy Baptism Rite</span>
              </div>

              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="block text-xs font-medium text-stone-700 mb-1">Date</label>
                  <input
                    type="text"
                    value={data.baptismDate}
                    onChange={(e) => updateField('baptismDate', e.target.value)}
                    className="w-full px-3 py-2 text-xs border border-stone-200 rounded-xl"
                  />
                </div>
                <div>
                  <label className="block text-xs font-medium text-stone-700 mb-1">Time</label>
                  <input
                    type="text"
                    value={data.baptismTime}
                    onChange={(e) => updateField('baptismTime', e.target.value)}
                    className="w-full px-3 py-2 text-xs border border-stone-200 rounded-xl"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-medium text-stone-700 mb-1">Church Name</label>
                <input
                  type="text"
                  value={data.baptismChurch}
                  onChange={(e) => updateField('baptismChurch', e.target.value)}
                  className="w-full px-3 py-2 text-xs border border-stone-200 rounded-xl"
                />
              </div>

              <div>
                <label className="block text-xs font-medium text-stone-700 mb-1">Church Address</label>
                <input
                  type="text"
                  value={data.baptismAddress}
                  onChange={(e) => updateField('baptismAddress', e.target.value)}
                  className="w-full px-3 py-2 text-xs border border-stone-200 rounded-xl"
                />
              </div>
            </div>

            {/* Birthday Reception */}
            <div className="space-y-3 pt-3 border-t border-stone-100">
              <div className="flex items-center gap-1.5 text-xs font-bold tracking-wider uppercase text-amber-800">
                <Clock className="w-3.5 h-3.5" />
                <span>1st Birthday Reception</span>
              </div>

              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="block text-xs font-medium text-stone-700 mb-1">Date</label>
                  <input
                    type="text"
                    value={data.birthdayDate}
                    onChange={(e) => updateField('birthdayDate', e.target.value)}
                    className="w-full px-3 py-2 text-xs border border-stone-200 rounded-xl"
                  />
                </div>
                <div>
                  <label className="block text-xs font-medium text-stone-700 mb-1">Time</label>
                  <input
                    type="text"
                    value={data.birthdayTime}
                    onChange={(e) => updateField('birthdayTime', e.target.value)}
                    className="w-full px-3 py-2 text-xs border border-stone-200 rounded-xl"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-medium text-stone-700 mb-1">Venue Name</label>
                <input
                  type="text"
                  value={data.birthdayVenue}
                  onChange={(e) => updateField('birthdayVenue', e.target.value)}
                  className="w-full px-3 py-2 text-xs border border-stone-200 rounded-xl"
                />
              </div>

              <div>
                <label className="block text-xs font-medium text-stone-700 mb-1">Venue Address</label>
                <input
                  type="text"
                  value={data.birthdayAddress}
                  onChange={(e) => updateField('birthdayAddress', e.target.value)}
                  className="w-full px-3 py-2 text-xs border border-stone-200 rounded-xl"
                />
              </div>
            </div>

            {/* Bible Verse */}
            <div className="space-y-3 pt-3 border-t border-stone-100">
              <h3 className="text-xs font-bold tracking-wider uppercase text-stone-400">
                Inspirational Bible Verse
              </h3>
              <div>
                <label className="block text-xs font-medium text-stone-700 mb-1">Verse Passage</label>
                <textarea
                  rows={2}
                  value={data.verseText}
                  onChange={(e) => updateField('verseText', e.target.value)}
                  className="w-full px-3 py-2 text-xs border border-stone-200 rounded-xl resize-none"
                />
              </div>
              <div>
                <label className="block text-xs font-medium text-stone-700 mb-1">Citation</label>
                <input
                  type="text"
                  value={data.verseCitation}
                  onChange={(e) => updateField('verseCitation', e.target.value)}
                  className="w-full px-3 py-2 text-xs border border-stone-200 rounded-xl"
                />
              </div>
            </div>
          </div>
        )}

        {/* ========================================================================= */}
        {/* TAB 2: DESIGN & TEMPLATES (8 Curated Visual Styles)                        */}
        {/* ========================================================================= */}
        {activeTab === 'design' && (
          <div className="space-y-6">
            {/* Template Selector Cards */}
            <div>
              <div className="flex items-center justify-between mb-2">
                <h3 className="text-xs font-bold tracking-wider uppercase text-stone-400">
                  Choose a Style (8 Themes)
                </h3>
              </div>

              <div className="grid grid-cols-2 gap-2.5">
                {TEMPLATES.map((tpl) => (
                  <div
                    key={tpl.id}
                    onClick={() => handleApplyTemplate(tpl)}
                    className={`p-3 rounded-2xl border text-left cursor-pointer transition-all flex flex-col justify-between ${
                      data.templateId === tpl.id
                        ? 'border-amber-600 bg-amber-50/40 ring-2 ring-amber-500/20'
                        : 'border-stone-200 bg-white hover:border-stone-300 hover:shadow-xs'
                    }`}
                  >
                    <div>
                      {/* Color Bar */}
                      <div className="flex items-center gap-1.5 mb-2">
                        <span
                          className="w-4 h-4 rounded-full shadow-xs shrink-0"
                          style={{ backgroundColor: tpl.previewColor }}
                        />
                        <span
                          className="w-3 h-3 rounded-full shrink-0"
                          style={{ backgroundColor: tpl.theme.accentColor }}
                        />
                        <span
                          className="w-3 h-3 rounded-full shrink-0 border border-stone-200"
                          style={{ backgroundColor: tpl.theme.secondaryColor }}
                        />
                      </div>
                      <h4 className="text-xs font-bold text-stone-800 leading-tight">
                        {tpl.name}
                      </h4>
                      <p className="text-[10px] text-stone-500 mt-1 line-clamp-2 leading-snug">
                        {tpl.description}
                      </p>
                    </div>

                    <button
                      type="button"
                      className={`mt-2.5 w-full py-1 rounded-lg text-[10px] font-semibold tracking-wide transition-colors ${
                        data.templateId === tpl.id
                          ? 'bg-amber-700 text-white'
                          : 'bg-stone-100 text-stone-600 hover:bg-stone-200'
                      }`}
                    >
                      {data.templateId === tpl.id ? 'Active' : 'Apply'}
                    </button>
                  </div>
                ))}
              </div>
            </div>

            {/* Frame Shape Selector */}
            <div className="pt-3 border-t border-stone-100">
              <label className="block text-xs font-bold tracking-wider uppercase text-stone-400 mb-2">
                Baby Photo Frame Shape
              </label>
              <div className="grid grid-cols-5 gap-1.5">
                {(['arch', 'oval', 'circle', 'scalloped', 'floral'] as FrameShape[]).map((shape) => (
                  <button
                    key={shape}
                    type="button"
                    onClick={() => updateField('frameShape', shape)}
                    className={`py-2 px-1 text-center rounded-xl border text-[11px] font-medium capitalize transition-all ${
                      data.frameShape === shape
                        ? 'bg-stone-900 text-white border-stone-900 shadow-xs'
                        : 'bg-white text-stone-600 border-stone-200 hover:bg-stone-50'
                    }`}
                  >
                    {shape}
                  </button>
                ))}
              </div>
            </div>

            {/* Color Swatches */}
            <div className="pt-3 border-t border-stone-100">
              <label className="block text-xs font-bold tracking-wider uppercase text-stone-400 mb-2">
                Accent Gold Swatches
              </label>
              <div className="flex items-center gap-2">
                {[
                  { name: 'Champagne Gold', val: '#C9A96A' },
                  { name: 'Antique Gold', val: '#B8924A' },
                  { name: 'Rose Gold', val: '#C49774' },
                  { name: 'Soft Olive', val: '#9A8E5C' },
                  { name: 'Muted Bronze', val: '#A87D43' },
                ].map((color) => (
                  <button
                    key={color.val}
                    onClick={() => updateField('accentColor', color.val)}
                    title={color.name}
                    className={`w-8 h-8 rounded-full border-2 transition-transform ${
                      data.accentColor === color.val
                        ? 'border-stone-900 scale-110 shadow-sm'
                        : 'border-white hover:scale-105'
                    }`}
                    style={{ backgroundColor: color.val }}
                  />
                ))}
              </div>
            </div>

            {/* Typography Selection */}
            <div className="pt-3 border-t border-stone-100 space-y-3">
              <label className="block text-xs font-bold tracking-wider uppercase text-stone-400">
                Font Pairings
              </label>

              <div>
                <span className="text-[11px] text-stone-600 block mb-1">Heading Style</span>
                <div className="grid grid-cols-2 gap-2">
                  <button
                    type="button"
                    onClick={() => updateField('fontHeading', 'cormorant')}
                    className={`p-2 rounded-xl border text-left font-cormorant text-base ${
                      data.fontHeading === 'cormorant'
                        ? 'bg-stone-900 text-white border-stone-900'
                        : 'bg-white text-stone-800 border-stone-200'
                    }`}
                  >
                    Cormorant Garamond
                  </button>
                  <button
                    type="button"
                    onClick={() => updateField('fontHeading', 'playfair')}
                    className={`p-2 rounded-xl border text-left font-playfair text-sm ${
                      data.fontHeading === 'playfair'
                        ? 'bg-stone-900 text-white border-stone-900'
                        : 'bg-white text-stone-800 border-stone-200'
                    }`}
                  >
                    Playfair Display
                  </button>
                </div>
              </div>

              <div>
                <span className="text-[11px] text-stone-600 block mb-1">Script Name Accent</span>
                <div className="grid grid-cols-2 gap-2">
                  <button
                    type="button"
                    onClick={() => updateField('fontScript', 'vibes')}
                    className={`p-2 rounded-xl border text-left font-vibes text-xl ${
                      data.fontScript === 'vibes'
                        ? 'bg-stone-900 text-white border-stone-900'
                        : 'bg-white text-stone-800 border-stone-200'
                    }`}
                  >
                    Great Vibes
                  </button>
                  <button
                    type="button"
                    onClick={() => updateField('fontScript', 'parisienne')}
                    className={`p-2 rounded-xl border text-left font-parisienne text-lg ${
                      data.fontScript === 'parisienne'
                        ? 'bg-stone-900 text-white border-stone-900'
                        : 'bg-white text-stone-800 border-stone-200'
                    }`}
                  >
                    Parisienne
                  </button>
                </div>
              </div>
            </div>

            {/* Effects & Audio */}
            <div className="pt-3 border-t border-stone-100 space-y-2.5">
              <label className="block text-xs font-bold tracking-wider uppercase text-stone-400 mb-1">
                Ambient Effects &amp; Audio
              </label>

              <label className="flex items-center justify-between p-2.5 bg-stone-50 rounded-xl cursor-pointer">
                <span className="text-xs text-stone-700">Falling Soft Petals</span>
                <input
                  type="checkbox"
                  checked={data.showFloatingPetals}
                  onChange={(e) => updateField('showFloatingPetals', e.target.checked)}
                  className="rounded text-amber-600 focus:ring-amber-500 w-4 h-4"
                />
              </label>

              <label className="flex items-center justify-between p-2.5 bg-stone-50 rounded-xl cursor-pointer">
                <span className="text-xs text-stone-700">Soft Sparkles Animation</span>
                <input
                  type="checkbox"
                  checked={data.showSparkles}
                  onChange={(e) => updateField('showSparkles', e.target.checked)}
                  className="rounded text-amber-600 focus:ring-amber-500 w-4 h-4"
                />
              </label>

              <label className="flex items-center justify-between p-2.5 bg-stone-50 rounded-xl cursor-pointer">
                <div className="flex items-center gap-2">
                  <Music className="w-3.5 h-3.5 text-stone-500" />
                  <span className="text-xs text-stone-700">Lullaby Harp Audio Player</span>
                </div>
                <input
                  type="checkbox"
                  checked={data.musicEnabled}
                  onChange={(e) => updateField('musicEnabled', e.target.checked)}
                  className="rounded text-amber-600 focus:ring-amber-500 w-4 h-4"
                />
              </label>
            </div>
          </div>
        )}

        {/* ========================================================================= */}
        {/* TAB 3: FAMILY & GODPARENTS (CIRCLE OF LOVE)                                */}
        {/* ========================================================================= */}
        {activeTab === 'family' && (
          <div className="space-y-5">
            {/* Parents */}
            <div className="space-y-3">
              <h3 className="text-xs font-bold tracking-wider uppercase text-stone-400">
                Loving Parents
              </h3>

              <div>
                <label className="block text-xs font-medium text-stone-700 mb-1">Father&apos;s Name</label>
                <input
                  type="text"
                  value={data.fatherName}
                  onChange={(e) => updateField('fatherName', e.target.value)}
                  className="w-full px-3 py-2 text-xs border border-stone-200 rounded-xl"
                />
              </div>

              <div>
                <label className="block text-xs font-medium text-stone-700 mb-1">Mother&apos;s Name</label>
                <input
                  type="text"
                  value={data.motherName}
                  onChange={(e) => updateField('motherName', e.target.value)}
                  className="w-full px-3 py-2 text-xs border border-stone-200 rounded-xl"
                />
              </div>

              <div>
                <label className="block text-xs font-medium text-stone-700 mb-1">Family Message</label>
                <textarea
                  rows={2}
                  value={data.parentsMessage}
                  onChange={(e) => updateField('parentsMessage', e.target.value)}
                  className="w-full px-3 py-2 text-xs border border-stone-200 rounded-xl resize-none"
                />
              </div>
            </div>

            {/* Godparents List */}
            <div className="space-y-3 pt-3 border-t border-stone-100">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="text-xs font-bold tracking-wider uppercase text-stone-400">
                    Godparents ({data.godparents.length})
                  </h3>
                  <span className="text-[11px] text-stone-500">Circle of Love</span>
                </div>
                <button
                  type="button"
                  onClick={handleAddGodparent}
                  className="px-2.5 py-1 rounded-lg text-xs font-semibold bg-stone-100 hover:bg-stone-200 text-stone-700 flex items-center gap-1 transition-colors"
                >
                  <Plus className="w-3.5 h-3.5" />
                  <span>Add</span>
                </button>
              </div>

              <div className="space-y-2">
                {data.godparents.map((gp, idx) => (
                  <div
                    key={gp.id}
                    className="p-3 bg-stone-50 rounded-xl border border-stone-200 flex items-center gap-2"
                  >
                    <div className="flex-1 space-y-1">
                      <input
                        type="text"
                        value={gp.name}
                        onChange={(e) => {
                          const updated = [...data.godparents];
                          updated[idx].name = e.target.value;
                          updateField('godparents', updated);
                        }}
                        className="w-full px-2 py-1 text-xs bg-white border border-stone-200 rounded-lg font-medium"
                      />
                      <div className="grid grid-cols-2 gap-1.5">
                        <select
                          value={gp.role}
                          onChange={(e) => {
                            const updated = [...data.godparents];
                            updated[idx].role = e.target.value as 'Godmother' | 'Godfather' | 'Principal Sponsor';
                            updateField('godparents', updated);
                          }}
                          className="px-2 py-0.5 text-[11px] bg-white border border-stone-200 rounded-md"
                        >
                          <option value="Godmother">Godmother</option>
                          <option value="Godfather">Godfather</option>
                          <option value="Principal Sponsor">Principal Sponsor</option>
                        </select>
                        <input
                          type="text"
                          value={gp.relationship || ''}
                          placeholder="e.g. Aunt"
                          onChange={(e) => {
                            const updated = [...data.godparents];
                            updated[idx].relationship = e.target.value;
                            updateField('godparents', updated);
                          }}
                          className="px-2 py-0.5 text-[11px] bg-white border border-stone-200 rounded-md"
                        />
                      </div>
                    </div>
                    <button
                      type="button"
                      onClick={() => handleRemoveGodparent(gp.id)}
                      className="p-1.5 text-stone-400 hover:text-rose-600 rounded-lg hover:bg-rose-50 transition-colors"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* ========================================================================= */}
        {/* TAB 4: PHOTO MEMORIES & TIMELINE                                           */}
        {/* ========================================================================= */}
        {activeTab === 'gallery' && (
          <div className="space-y-5">
            {/* Gallery Photos */}
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="text-xs font-bold tracking-wider uppercase text-stone-400">
                    Photo Scrapbook ({data.photos.length})
                  </h3>
                  <span className="text-[10px] text-stone-500">
                    Milestone memories &amp; baby journey
                  </span>
                </div>
                <button
                  type="button"
                  onClick={handleResetSamplePhotos}
                  className="text-[10px] text-stone-400 hover:text-stone-700 flex items-center gap-1 transition-colors cursor-pointer"
                  title="Reset to sample christening photos"
                >
                  <RotateCcw className="w-3 h-3" />
                  <span>Reset Samples</span>
                </button>
              </div>

              {/* Upload New Photo Card */}
              <div className="p-3 bg-amber-50/40 rounded-2xl border border-amber-200/70 space-y-2">
                <span className="text-[11px] font-bold text-amber-900 block flex items-center gap-1.5">
                  <Plus className="w-3.5 h-3.5" />
                  <span>Add New Milestone Memory</span>
                </span>
                <PhotoUploader
                  currentUrl=""
                  onPhotoChange={(newUrl) => handleAddGalleryPhoto(newUrl)}
                  label=""
                  description="Upload a photo from your computer or phone to add to the gallery"
                  accentColor={data.accentColor}
                  aspectRatio="square"
                  showPresets={true}
                  presets={photoPresets}
                />
              </div>

              {/* List of Existing Photos with Replace Photo Button */}
              <div className="space-y-3 pt-1">
                <span className="text-[11px] font-semibold text-stone-700 block">
                  Current Gallery Photos ({data.photos.length})
                </span>

                {data.photos.map((photo, idx) => (
                  <div
                    key={photo.id || idx}
                    className="p-3 bg-stone-50 rounded-2xl border border-stone-200 space-y-2.5 transition-all hover:border-stone-300"
                  >
                    {/* Header bar with photo number and delete */}
                    <div className="flex items-center justify-between text-[11px]">
                      <span className="font-bold text-stone-700">
                        Photo #{idx + 1}
                      </span>
                      {data.photos.length > 1 && (
                        <button
                          type="button"
                          onClick={() => handleRemoveGalleryPhoto(idx)}
                          className="p-1 text-stone-400 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition-colors cursor-pointer"
                          title="Delete this photo from gallery"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      )}
                    </div>

                    {/* Photo Uploader / Replace Component */}
                    <PhotoUploader
                      compact
                      currentUrl={photo.url}
                      onPhotoChange={(newUrl) => handleReplaceGalleryPhoto(idx, newUrl)}
                      accentColor={data.accentColor}
                    />

                    {/* Caption and Age Tag */}
                    <div className="space-y-1.5 pt-1">
                      <div>
                        <label className="block text-[10px] font-medium text-stone-500 mb-0.5">
                          Caption / Memory Note
                        </label>
                        <input
                          type="text"
                          value={photo.caption}
                          placeholder="e.g. Joyful smiles with Godparents"
                          onChange={(e) => {
                            const updated = [...data.photos];
                            updated[idx].caption = e.target.value;
                            updateField('photos', updated);
                          }}
                          className="w-full px-2.5 py-1.5 text-xs bg-white border border-stone-200 rounded-lg focus:outline-none focus:ring-1 focus:ring-stone-400"
                        />
                      </div>

                      <div className="flex items-center gap-2">
                        <div className="flex-1">
                          <label className="block text-[10px] font-medium text-stone-500 mb-0.5">
                            Milestone Tag
                          </label>
                          <input
                            type="text"
                            value={photo.ageMonth || ''}
                            placeholder="e.g. Month 8, Baptism Day"
                            onChange={(e) => {
                              const updated = [...data.photos];
                              updated[idx].ageMonth = e.target.value;
                              updateField('photos', updated);
                            }}
                            className="w-full px-2.5 py-1 text-[11px] bg-white border border-stone-200 rounded-lg focus:outline-none focus:ring-1 focus:ring-stone-400"
                          />
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Timeline Items */}
            <div className="space-y-3 pt-3 border-t border-stone-100">
              <h3 className="text-xs font-bold tracking-wider uppercase text-stone-400">
                Event Timeline Schedule
              </h3>
              <div className="space-y-2">
                {data.timelineItems.map((item, idx) => (
                  <div
                    key={item.id}
                    className="p-2.5 bg-stone-50 rounded-xl border border-stone-200 space-y-1.5"
                  >
                    <div className="flex items-center gap-2">
                      <input
                        type="text"
                        value={item.time}
                        onChange={(e) => {
                          const updated = [...data.timelineItems];
                          updated[idx].time = e.target.value;
                          updateField('timelineItems', updated);
                        }}
                        className="w-20 px-2 py-1 text-xs font-semibold bg-white border border-stone-200 rounded-lg"
                      />
                      <input
                        type="text"
                        value={item.title}
                        onChange={(e) => {
                          const updated = [...data.timelineItems];
                          updated[idx].title = e.target.value;
                          updateField('timelineItems', updated);
                        }}
                        className="flex-1 px-2 py-1 text-xs font-medium bg-white border border-stone-200 rounded-lg"
                      />
                    </div>
                    <input
                      type="text"
                      value={item.subtitle}
                      placeholder="Location/notes"
                      onChange={(e) => {
                        const updated = [...data.timelineItems];
                        updated[idx].subtitle = e.target.value;
                        updateField('timelineItems', updated);
                      }}
                      className="w-full px-2 py-0.5 text-[11px] bg-white border border-stone-200 rounded-md text-stone-600"
                    />
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* ========================================================================= */}
        {/* TAB 5: GUEST RSVPS MANAGEMENT & STATS                                      */}
        {/* ========================================================================= */}
        {activeTab === 'rsvps' && (
          <div className="space-y-4">
            {/* RSVP Stats */}
            <div className="grid grid-cols-3 gap-2">
              <div
                onClick={() => setRsvpStatusFilter('all')}
                className={`p-3 rounded-2xl border text-center cursor-pointer transition-all ${
                  rsvpStatusFilter === 'all'
                    ? 'bg-stone-100 border-stone-400 ring-2 ring-stone-300'
                    : 'bg-stone-50 border-stone-200 hover:bg-stone-100/60'
                }`}
              >
                <span className="text-[10px] uppercase font-bold text-stone-400 block">
                  Responses
                </span>
                <span className="text-xl font-bold text-stone-900 font-cormorant">
                  {guestRsvps.length}
                </span>
              </div>

              <div
                onClick={() => setRsvpStatusFilter('attending')}
                className={`p-3 rounded-2xl border text-center cursor-pointer transition-all ${
                  rsvpStatusFilter === 'attending'
                    ? 'bg-emerald-100/80 border-emerald-400 ring-2 ring-emerald-300'
                    : 'bg-emerald-50/70 border-emerald-200 hover:bg-emerald-100/50'
                }`}
              >
                <span className="text-[10px] uppercase font-bold text-emerald-800 block">
                  Attending
                </span>
                <span className="text-xl font-bold text-emerald-950 font-cormorant">
                  {attendingCount}
                </span>
                <span className="text-[9px] text-emerald-700 block mt-0.5 font-medium">
                  {totalHeadcount} {totalHeadcount === 1 ? 'seat' : 'seats'}
                </span>
              </div>

              <div
                onClick={() => setRsvpStatusFilter('declined')}
                className={`p-3 rounded-2xl border text-center cursor-pointer transition-all ${
                  rsvpStatusFilter === 'declined'
                    ? 'bg-rose-100/80 border-rose-400 ring-2 ring-rose-300'
                    : 'bg-stone-100/70 border-stone-200 hover:bg-stone-200/50'
                }`}
              >
                <span className="text-[10px] uppercase font-bold text-stone-600 block">
                  Declined
                </span>
                <span className="text-xl font-bold text-stone-800 font-cormorant">
                  {declinedCount}
                </span>
                <span className="text-[9px] text-stone-500 block mt-0.5 font-medium">
                  regrets
                </span>
              </div>
            </div>

            {/* Filter Tabs & Search */}
            <div className="space-y-2 pt-1">
              {/* Segmented Filter */}
              <div className="flex items-center bg-stone-100 p-1 rounded-xl text-xs">
                <button
                  type="button"
                  onClick={() => setRsvpStatusFilter('all')}
                  className={`flex-1 py-1.5 rounded-lg text-[11px] font-semibold transition-all ${
                    rsvpStatusFilter === 'all'
                      ? 'bg-white text-stone-900 shadow-xs'
                      : 'text-stone-500 hover:text-stone-800'
                  }`}
                >
                  All ({guestRsvps.length})
                </button>
                <button
                  type="button"
                  onClick={() => setRsvpStatusFilter('attending')}
                  className={`flex-1 py-1.5 rounded-lg text-[11px] font-semibold transition-all flex items-center justify-center gap-1 ${
                    rsvpStatusFilter === 'attending'
                      ? 'bg-white text-emerald-800 shadow-xs'
                      : 'text-stone-500 hover:text-emerald-700'
                  }`}
                >
                  <CheckCircle2 className="w-3 h-3 text-emerald-600" />
                  <span>Attending ({attendingCount})</span>
                </button>
                <button
                  type="button"
                  onClick={() => setRsvpStatusFilter('declined')}
                  className={`flex-1 py-1.5 rounded-lg text-[11px] font-semibold transition-all flex items-center justify-center gap-1 ${
                    rsvpStatusFilter === 'declined'
                      ? 'bg-white text-stone-800 shadow-xs'
                      : 'text-stone-500 hover:text-stone-800'
                  }`}
                >
                  <XCircle className="w-3 h-3 text-stone-400" />
                  <span>Declined ({declinedCount})</span>
                </button>
              </div>

              {/* Search Box */}
              <div className="relative">
                <Search className="w-3.5 h-3.5 text-stone-400 absolute left-3 top-1/2 -translate-y-1/2" />
                <input
                  type="text"
                  placeholder="Filter by guest name or message..."
                  value={rsvpSearchQuery}
                  onChange={(e) => setRsvpSearchQuery(e.target.value)}
                  className="w-full pl-8 pr-3 py-1.5 text-xs bg-stone-50 border border-stone-200 rounded-xl focus:bg-white focus:outline-none focus:ring-1 focus:ring-stone-400 text-stone-800 placeholder:text-stone-400"
                />
              </div>
            </div>

            {/* List Header */}
            <div className="flex items-center justify-between pt-1">
              <span className="text-[11px] font-bold uppercase tracking-wider text-stone-400">
                {rsvpStatusFilter === 'attending'
                  ? `Guests Attending (${displayedRsvps.length})`
                  : rsvpStatusFilter === 'declined'
                  ? `Guests Who Declined (${displayedRsvps.length})`
                  : `All Guest Responses (${displayedRsvps.length})`}
              </span>
              {onOpenAllRsvpsModal && (
                <button
                  type="button"
                  onClick={onOpenAllRsvpsModal}
                  className="text-[10px] text-amber-800 hover:text-amber-950 font-semibold flex items-center gap-1 underline"
                >
                  <span>Open Full Dashboard</span>
                  <ExternalLink className="w-2.5 h-2.5" />
                </button>
              )}
            </div>

            {/* Guest list cards */}
            <div className="space-y-2.5">
              {displayedRsvps.length === 0 ? (
                <div className="text-center py-8 px-4 bg-stone-50 rounded-2xl border border-dashed border-stone-200">
                  <Heart className="w-6 h-6 text-stone-300 mx-auto mb-2" />
                  <p className="text-xs font-semibold text-stone-700">
                    {guestRsvps.length === 0
                      ? 'No RSVPs yet'
                      : 'No responses match this filter'}
                  </p>
                  <p className="text-[11px] text-stone-400 mt-0.5">
                    {guestRsvps.length === 0
                      ? 'Share your published link or test RSVP in preview to see responses here.'
                      : 'Try switching the filter tabs or clearing your search.'}
                  </p>
                </div>
              ) : (
                displayedRsvps.map((rsvp) => (
                  <div
                    key={rsvp.id}
                    className={`p-3 rounded-2xl border space-y-2 transition-all ${
                      rsvp.attending
                        ? 'bg-emerald-50/40 border-emerald-200/80 hover:border-emerald-300'
                        : 'bg-stone-50 border-stone-200 hover:border-stone-300'
                    }`}
                  >
                    {/* Header: Name, Badge, Delete */}
                    <div className="flex items-start justify-between gap-2">
                      <div className="min-w-0">
                        <div className="flex items-center gap-1.5 flex-wrap">
                          <span className="text-xs font-bold text-stone-900 truncate">
                            {rsvp.name}
                          </span>
                          <span
                            className={`inline-flex items-center gap-1 text-[10px] font-bold px-2 py-0.5 rounded-full ${
                              rsvp.attending
                                ? 'bg-emerald-100 text-emerald-800'
                                : 'bg-stone-200 text-stone-600'
                            }`}
                          >
                            {rsvp.attending ? (
                              <>
                                <CheckCircle2 className="w-3 h-3 text-emerald-600" />
                                <span>Attending</span>
                                {rsvp.guestCount > 1 && (
                                  <span className="ml-0.5 font-normal">
                                    (+{rsvp.guestCount - 1})
                                  </span>
                                )}
                              </>
                            ) : (
                              <>
                                <XCircle className="w-3 h-3 text-stone-400" />
                                <span>Declined</span>
                              </>
                            )}
                          </span>
                        </div>

                        {/* Extra metadata */}
                        <div className="flex items-center gap-2 text-[10px] text-stone-400 mt-0.5">
                          <span>{rsvp.submittedAt}</span>
                          {rsvp.attending && (
                            <>
                              <span>•</span>
                              <span className="font-medium text-emerald-700">
                                {rsvp.guestCount || 1}{' '}
                                {rsvp.guestCount === 1 ? 'seat reserved' : 'seats reserved'}
                              </span>
                            </>
                          )}
                          {rsvp.emailOrPhone && (
                            <>
                              <span>•</span>
                              <span className="font-mono text-stone-500">
                                {rsvp.emailOrPhone}
                              </span>
                            </>
                          )}
                        </div>
                      </div>

                      {/* Delete action */}
                      {onDeleteSingleRsvp && (
                        <button
                          type="button"
                          onClick={() => {
                            if (window.confirm(`Delete RSVP response for "${rsvp.name}"?`)) {
                              onDeleteSingleRsvp(rsvp.id);
                            }
                          }}
                          className="p-1 text-stone-400 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition-colors cursor-pointer shrink-0"
                          title="Delete response"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      )}
                    </div>

                    {/* Blessing message */}
                    {rsvp.message && (
                      <p className="text-[11px] italic text-stone-600 bg-white p-2 rounded-xl border border-stone-100 shadow-2xs leading-relaxed">
                        &ldquo;{rsvp.message}&rdquo;
                      </p>
                    )}
                  </div>
                ))
              )}
            </div>

            {/* Actions: Export & Reset */}
            <div className="pt-2 flex items-center gap-2 border-t border-stone-100">
              <button
                type="button"
                onClick={handleExportRsvps}
                disabled={guestRsvps.length === 0}
                className="flex-1 py-2 px-3 rounded-xl text-xs font-semibold bg-stone-900 hover:bg-stone-800 disabled:opacity-40 text-white flex items-center justify-center gap-1.5 transition-colors cursor-pointer"
              >
                <Download className="w-3.5 h-3.5" />
                <span>Export CSV ({guestRsvps.length})</span>
              </button>
              {guestRsvps.length > 0 && (
                <button
                  type="button"
                  onClick={onClearRsvps}
                  className="p-2 rounded-xl text-stone-400 hover:text-rose-600 hover:bg-rose-50 border border-stone-200 cursor-pointer"
                  title="Clear all responses"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
