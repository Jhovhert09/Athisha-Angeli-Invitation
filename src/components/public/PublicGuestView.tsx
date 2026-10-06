import React, { useState } from 'react';
import { InvitationData, GuestRsvp } from '../../types/invitation';
import { CoverScreen } from '../invitation/CoverScreen';
import { InvitationView } from '../invitation/InvitationView';
import { invitationAudio } from '../../utils/audioPlayer';
import { SacredCrossIcon, GoldSparkleIcon } from '../common/DecorativeIcons';
import { Edit3, ExternalLink, ShieldCheck, LogOut } from 'lucide-react';

interface PublicGuestViewProps {
  data: InvitationData;
  guestRsvps: GuestRsvp[];
  onAddRsvp: (rsvp: GuestRsvp) => void;
  onOpenBuilder?: () => void;
  isAdminLoggedIn?: boolean;
  onLogout?: () => void;
  isPublished?: boolean;
  passwordProtected?: boolean;
  sitePassword?: string;
  siteTitle?: string;
}

export const PublicGuestView: React.FC<PublicGuestViewProps> = ({
  data,
  guestRsvps,
  onAddRsvp,
  onOpenBuilder,
  isAdminLoggedIn = false,
  onLogout,
  isPublished = true,
  passwordProtected = false,
  sitePassword,
  siteTitle,
}) => {
  const [isCoverOpen, setIsCoverOpen] = useState(false);
  const [unlocked, setUnlocked] = useState(!passwordProtected);
  const [enteredPassword, setEnteredPassword] = useState('');
  const [passwordError, setPasswordError] = useState(false);

  const handleOpenCover = () => {
    setIsCoverOpen(true);
    if (data.musicEnabled) {
      invitationAudio.play();
    }
  };

  const handleResetCover = () => {
    setIsCoverOpen(false);
  };

  const handlePasswordSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!sitePassword || enteredPassword === sitePassword) {
      setUnlocked(true);
      setPasswordError(false);
    } else {
      setPasswordError(true);
    }
  };

  return (
    <div
      className="min-h-screen w-full flex flex-col items-center justify-start relative overflow-x-hidden selection:bg-amber-100"
      style={{
        backgroundColor: data.secondaryColor || '#F7F4EE',
        backgroundImage: `radial-gradient(ellipse at 50% 0%, #FFFFFF 0%, ${data.secondaryColor} 65%, #EDE6DA 100%)`,
      }}
    >
      {/* Top Host Bar if Admin is Logged In */}
      {isAdminLoggedIn && (
        <div className="w-full bg-stone-900/95 backdrop-blur-md text-white py-2 px-4 flex items-center justify-between text-xs z-30 shrink-0 border-b border-white/10 font-montserrat shadow-sm">
          <div className="flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
            <span className="font-semibold text-amber-200">Host Mode Active</span>
            <span className="text-stone-400 hidden sm:inline">· Viewing Public Guest Invitation</span>
          </div>
          <div className="flex items-center gap-2">
            {onOpenBuilder && (
              <button
                onClick={onOpenBuilder}
                className="px-3 py-1 rounded-lg bg-white/15 hover:bg-white/25 text-white font-medium text-xs flex items-center gap-1.5 transition-all cursor-pointer shadow-2xs"
              >
                <Edit3 className="w-3.5 h-3.5" />
                <span>Return to Admin Studio</span>
              </button>
            )}
            {onLogout && (
              <button
                onClick={onLogout}
                className="px-2.5 py-1 rounded-lg bg-rose-500/20 hover:bg-rose-500/30 text-rose-200 font-medium text-xs flex items-center gap-1 transition-all cursor-pointer"
                title="Logout from Admin Studio"
              >
                <LogOut className="w-3 h-3" />
                <span>Logout</span>
              </button>
            )}
          </div>
        </div>
      )}

      {/* Discreet floating Admin Login button for host when not logged in */}
      {!isAdminLoggedIn && onOpenBuilder && (
        <div className="fixed top-3 right-3 z-30">
          <button
            onClick={onOpenBuilder}
            className="px-3 py-1.5 rounded-full bg-white/95 hover:bg-white text-stone-700 hover:text-stone-900 shadow-md border border-stone-200 backdrop-blur-xs text-[11px] font-semibold flex items-center gap-1.5 transition-all cursor-pointer hover:shadow-lg active:scale-95"
            title="Admin Login to Studio"
          >
            <ShieldCheck className="w-3.5 h-3.5 text-amber-700" />
            <span>Admin Login</span>
          </button>
        </div>
      )}

      {/* Desktop Presentation Ambiance: Soft floating light and delicate golden dust */}
      <div className="fixed inset-0 pointer-events-none overflow-hidden hidden md:block">
        <div
          className="absolute -top-40 left-1/2 -translate-x-1/2 w-[700px] h-[700px] rounded-full blur-3xl opacity-35"
          style={{ background: `radial-gradient(circle, ${data.accentColor}30, transparent 70%)` }}
        />
        <div className="absolute top-20 left-16 animate-sparkle opacity-25">
          <GoldSparkleIcon color={data.accentColor} className="w-6 h-6" />
        </div>
        <div className="absolute top-40 right-20 animate-sparkle opacity-25" style={{ animationDelay: '1.5s' }}>
          <GoldSparkleIcon color={data.accentColor} className="w-5 h-5" />
        </div>
        <div className="absolute bottom-24 left-24 animate-sparkle opacity-20" style={{ animationDelay: '2s' }}>
          <GoldSparkleIcon color={data.accentColor} className="w-6 h-6" />
        </div>
        <div className="absolute bottom-32 right-28 animate-sparkle opacity-20" style={{ animationDelay: '0.7s' }}>
          <GoldSparkleIcon color={data.accentColor} className="w-5 h-5" />
        </div>
      </div>

      {/* Invitation Core Container: Mobile (100% fluid) / Desktop (420px max centered) */}
      <div
        className="w-full max-w-[430px] min-h-screen relative flex flex-col md:my-6 md:rounded-[36px] shadow-2xl transition-all duration-300 md:border md:border-stone-200/80 overflow-hidden"
        style={{
          backgroundColor: data.primaryColor || '#FFFDF8',
        }}
      >
        {!isPublished ? (
          /* Unpublished / Draft Notice for Guests */
          <div className="flex-1 flex flex-col items-center justify-center p-8 text-center bg-[#FFFDF8] font-montserrat">
            <div
              className="w-16 h-16 rounded-full flex items-center justify-center mb-4 shadow-sm"
              style={{ background: `${data.accentColor}20` }}
            >
              <SacredCrossIcon color={data.accentColor} className="w-8 h-8" />
            </div>

            <span className="text-[10px] tracking-[0.25em] uppercase font-bold text-stone-400 mb-2">
              BLESSED CELEBRATION
            </span>

            <h2 className="font-cormorant text-3xl font-bold text-stone-800 mb-2">
              Invitation Coming Soon
            </h2>

            <p className="text-xs text-stone-600 leading-relaxed max-w-xs mb-6">
              The Holy Baptism &amp; 1st Birthday invitation for{' '}
              <strong className="text-stone-800">{data.babyName}</strong> is currently being prepared with love by the family. Please check back shortly!
            </p>

            <button
              onClick={() => window.location.reload()}
              className="py-2.5 px-6 rounded-xl text-xs font-semibold text-stone-700 bg-stone-100 hover:bg-stone-200 transition-colors"
            >
              Check Again
            </button>

            {onOpenBuilder && (
              <button
                onClick={onOpenBuilder}
                className="mt-8 text-[11px] text-amber-800 hover:text-amber-900 underline flex items-center gap-1"
              >
                <Edit3 className="w-3 h-3" />
                <span>Admin? Publish this site in Studio</span>
              </button>
            )}
          </div>
        ) : !unlocked ? (
          /* Password Protection Gate */
          <div className="flex-1 flex flex-col items-center justify-center p-8 text-center bg-[#FFFDF8] font-montserrat">
            <div
              className="w-14 h-14 rounded-full flex items-center justify-center mb-4 shadow-sm"
              style={{ background: `${data.accentColor}20` }}
            >
              <SacredCrossIcon color={data.accentColor} className="w-7 h-7" />
            </div>

            <h2 className="font-cormorant text-2xl font-bold text-stone-800 mb-1">
              Private Family Invitation
            </h2>

            <p className="text-xs text-stone-500 mb-4">
              Please enter the passcode provided by {data.babyName}&apos;s family to view the celebration details.
            </p>

            <form onSubmit={handlePasswordSubmit} className="w-full max-w-xs space-y-3">
              <input
                type="password"
                required
                placeholder="Enter invitation passcode"
                value={enteredPassword}
                onChange={(e) => setEnteredPassword(e.target.value)}
                className="w-full px-4 py-2.5 text-center text-sm bg-white border border-stone-200 rounded-xl focus:ring-2 focus:ring-amber-500/20"
              />
              {passwordError && (
                <p className="text-xs text-rose-600">Incorrect passcode. Please check with the family.</p>
              )}
              <button
                type="submit"
                className="w-full py-2.5 rounded-xl text-xs font-semibold text-white transition-opacity"
                style={{ backgroundColor: data.accentColor }}
              >
                Enter Invitation
              </button>
            </form>
          </div>
        ) : (
          /* Live Published Guest Experience */
          <>
            {/* Full-Screen Cover Screen */}
            <CoverScreen
              data={data}
              isOpen={isCoverOpen}
              onOpen={handleOpenCover}
            />

            {/* Main Sacred & Joyful Invitation Content */}
            <div className="w-full flex-1">
              <InvitationView
                data={data}
                onResetCover={handleResetCover}
                guestRsvps={guestRsvps}
                onAddRsvp={onAddRsvp}
              />
            </div>
          </>
        )}

        {/* Subtle, Dignified Footer for Public Guests */}
        <div className="py-4 px-6 text-center border-t border-stone-200/50 bg-stone-50/60 font-montserrat text-[11px] text-stone-400">
          <div className="flex items-center justify-center gap-1.5 mb-1 opacity-70">
            <SacredCrossIcon color={data.accentColor} className="w-3 h-3" />
            <span className="tracking-widest uppercase text-[10px]">Blessed Milestones</span>
          </div>
          <p className="font-light">
            Digital Invitation for {data.babyName}&apos;s Holy Baptism &amp; 1st Birthday
          </p>

          {/* Discreet Host Access Link */}
          {onOpenBuilder && (
            <div className="mt-3 pt-2 border-t border-stone-200/40">
              <button
                onClick={onOpenBuilder}
                className="text-[10px] text-stone-400 hover:text-stone-700 transition-colors inline-flex items-center gap-1 cursor-pointer"
              >
                <Edit3 className="w-2.5 h-2.5" />
                <span>Admin / Host Studio</span>
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
