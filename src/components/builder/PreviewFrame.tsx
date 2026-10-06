import React, { useState } from 'react';
import { InvitationData, GuestRsvp } from '../../types/invitation';
import { CoverScreen } from '../invitation/CoverScreen';
import { InvitationView } from '../invitation/InvitationView';
import { invitationAudio } from '../../utils/audioPlayer';
import { Smartphone, Monitor, Eye, RotateCcw } from 'lucide-react';

interface PreviewFrameProps {
  data: InvitationData;
  guestRsvps: GuestRsvp[];
  onAddRsvp: (rsvp: GuestRsvp) => void;
  isGuestMode: boolean;
  onToggleGuestMode: () => void;
}

export const PreviewFrame: React.FC<PreviewFrameProps> = ({
  data,
  guestRsvps,
  onAddRsvp,
  isGuestMode,
  onToggleGuestMode,
}) => {
  const [deviceMode, setDeviceMode] = useState<'mobile' | 'desktop'>('mobile');
  const [isCoverOpen, setIsCoverOpen] = useState(false);

  const handleOpenCover = () => {
    setIsCoverOpen(true);
    if (data.musicEnabled) {
      invitationAudio.play();
    }
  };

  const handleResetCover = () => {
    setIsCoverOpen(false);
  };

  // Builder Studio Preview Viewport
  return (
    <div className="flex-1 h-full flex flex-col bg-stone-100/90 relative overflow-hidden select-none">
      {/* Top Bar for Preview Viewport Controls */}
      <div className="h-14 bg-white border-b border-stone-200 px-4 flex items-center justify-between shrink-0 font-montserrat">
        {/* Left: Device Switcher */}
        <div className="flex items-center gap-1 bg-stone-100 p-1 rounded-xl">
          <button
            onClick={() => setDeviceMode('mobile')}
            className={`px-3 py-1 text-xs font-semibold rounded-lg flex items-center gap-1.5 transition-all ${
              deviceMode === 'mobile'
                ? 'bg-white text-stone-900 shadow-xs'
                : 'text-stone-500 hover:text-stone-900'
            }`}
          >
            <Smartphone className="w-3.5 h-3.5" />
            <span>Mobile (390px)</span>
          </button>
          <button
            onClick={() => setDeviceMode('desktop')}
            className={`px-3 py-1 text-xs font-semibold rounded-lg flex items-center gap-1.5 transition-all ${
              deviceMode === 'desktop'
                ? 'bg-white text-stone-900 shadow-xs'
                : 'text-stone-500 hover:text-stone-900'
            }`}
          >
            <Monitor className="w-3.5 h-3.5" />
            <span>Desktop Center</span>
          </button>
        </div>

        {/* Right: State controls */}
        <div className="flex items-center gap-2">
          {isCoverOpen && (
            <button
              onClick={handleResetCover}
              className="px-2.5 py-1 text-xs text-stone-600 hover:text-stone-900 bg-stone-100 hover:bg-stone-200 rounded-lg flex items-center gap-1 transition-colors cursor-pointer"
              title="Show Cover Screen again"
            >
              <RotateCcw className="w-3 h-3" />
              <span>Reset to Cover</span>
            </button>
          )}

          <button
            onClick={onToggleGuestMode}
            className="px-3.5 py-1.5 text-xs font-semibold bg-stone-900 hover:bg-stone-800 text-white rounded-xl flex items-center gap-1.5 transition-all shadow-xs cursor-pointer"
          >
            <Eye className="w-3.5 h-3.5" />
            <span>Open Public Guest View</span>
          </button>
        </div>
      </div>

      {/* Preview Canvas Area */}
      <div className="flex-1 overflow-y-auto p-4 sm:p-6 flex items-start justify-center relative">
        {/* Device Container */}
        {deviceMode === 'mobile' ? (
          /* Mobile Device Frame Mockup (390px width) */
          <div className="w-[390px] min-h-[780px] bg-white rounded-[44px] shadow-2xl border-[8px] border-stone-800 overflow-hidden relative flex flex-col my-auto shrink-0 transition-all">
            {/* Dynamic Island / Speaker notch */}
            <div className="absolute top-2 left-1/2 -translate-x-1/2 w-24 h-4 bg-stone-800 rounded-full z-50 pointer-events-none" />

            {/* Invitation scrollable screen */}
            <div className="w-full flex-1 overflow-y-auto relative pt-4 bg-[#FFFDF8]">
              <CoverScreen data={data} isOpen={isCoverOpen} onOpen={handleOpenCover} />
              <InvitationView
                data={data}
                onResetCover={handleResetCover}
                guestRsvps={guestRsvps}
                onAddRsvp={onAddRsvp}
              />
            </div>
          </div>
        ) : (
          /* Desktop Centered Container (420px card on elegant canvas as required by spec) */
          <div className="w-full max-w-[440px] bg-white rounded-3xl shadow-xl border border-stone-200 overflow-hidden relative min-h-[700px] my-auto transition-all">
            <CoverScreen data={data} isOpen={isCoverOpen} onOpen={handleOpenCover} />
            <InvitationView
              data={data}
              onResetCover={handleResetCover}
              guestRsvps={guestRsvps}
              onAddRsvp={onAddRsvp}
            />
          </div>
        )}
      </div>
    </div>
  );
};
