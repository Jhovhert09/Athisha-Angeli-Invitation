import React, { useState, useEffect } from 'react';
import { InvitationData, GuestRsvp, TimelineItem, GalleryPhoto } from '../../types/invitation';
import { DecorativeFrame } from '../common/DecorativeFrames';
import {
  SacredCrossIcon,
  HolyDoveIcon,
  BirthdayCakeIcon,
  NumberOneMilestoneIcon,
  FloralDivider,
  GoldSparkleIcon,
} from '../common/DecorativeIcons';
import { RsvpModal } from './RsvpModal';
import { invitationAudio } from '../../utils/audioPlayer';
import {
  Calendar,
  Clock,
  MapPin,
  ExternalLink,
  Volume2,
  VolumeX,
  Camera,
  Utensils,
  Heart,
  Gift,
  Check,
  RotateCcw,
  Sparkles,
  ChevronRight,
  X,
} from 'lucide-react';

interface InvitationViewProps {
  data: InvitationData;
  onResetCover?: () => void;
  guestRsvps: GuestRsvp[];
  onAddRsvp: (rsvp: GuestRsvp) => void;
}

export const InvitationView: React.FC<InvitationViewProps> = ({
  data,
  onResetCover,
  guestRsvps,
  onAddRsvp,
}) => {
  // Audio state
  const [isPlayingAudio, setIsPlayingAudio] = useState(false);

  // RSVP state
  const [isRsvpModalOpen, setIsRsvpModalOpen] = useState(false);
  const [attendingInitial, setAttendingInitial] = useState(true);
  const [confirmedRsvp, setConfirmedRsvp] = useState<GuestRsvp | null>(null);

  // Gallery Lightbox
  const [selectedPhoto, setSelectedPhoto] = useState<GalleryPhoto | null>(null);

  // Countdown timer state
  const [timeLeft, setTimeLeft] = useState<{
    days: number;
    hours: number;
    minutes: number;
    seconds: number;
  }>({ days: 0, hours: 0, minutes: 0, seconds: 0 });

  useEffect(() => {
    const unsub = invitationAudio.subscribe((playing) => {
      setIsPlayingAudio(playing);
    });
    return unsub;
  }, []);

  const toggleMusic = () => {
    invitationAudio.toggle();
  };

  // Countdown Calculation
  useEffect(() => {
    const updateCountdown = () => {
      const targetTime = new Date(data.countdownTarget || '2026-12-13T10:00:00').getTime();
      const now = new Date().getTime();
      const difference = targetTime - now;

      if (difference > 0) {
        const days = Math.floor(difference / (1000 * 60 * 60 * 24));
        const hours = Math.floor((difference % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
        const minutes = Math.floor((difference % (1000 * 60 * 60)) / (1000 * 60));
        const seconds = Math.floor((difference % (1000 * 60)) / 1000);
        setTimeLeft({ days, hours, minutes, seconds });
      } else {
        setTimeLeft({ days: 0, hours: 0, minutes: 0, seconds: 0 });
      }
    };

    updateCountdown();
    const interval = setInterval(updateCountdown, 1000);
    return () => clearInterval(interval);
  }, [data.countdownTarget]);

  // Handle RSVP confirmation
  const handleRsvpConfirm = (rsvp: GuestRsvp) => {
    setConfirmedRsvp(rsvp);
    onAddRsvp(rsvp);
  };

  // Typography class helpers
  const fontHeadingClass =
    data.fontHeading === 'playfair' ? 'font-playfair' : 'font-cormorant';
  const fontScriptClass =
    data.fontScript === 'parisienne' ? 'font-parisienne' : 'font-vibes';
  const fontBodyClass =
    data.fontBody === 'poppins' ? 'font-poppins' : 'font-montserrat';

  // Helper for timeline icon
  const renderTimelineIcon = (iconType: TimelineItem['icon']) => {
    switch (iconType) {
      case 'cross':
        return <SacredCrossIcon color={data.accentColor} className="w-4 h-4" />;
      case 'camera':
        return <Camera className="w-4 h-4" style={{ color: data.accentColor }} />;
      case 'cake':
        return <BirthdayCakeIcon color={data.accentColor} className="w-4 h-4" />;
      case 'utensils':
        return <Utensils className="w-4 h-4" style={{ color: data.accentColor }} />;
      case 'heart':
        return <Heart className="w-4 h-4 fill-current" style={{ color: data.accentColor }} />;
      case 'gift':
        return <Gift className="w-4 h-4" style={{ color: data.accentColor }} />;
      default:
        return <GoldSparkleIcon color={data.accentColor} className="w-4 h-4" />;
    }
  };

  return (
    <div
      className="relative w-full min-h-screen text-stone-800 transition-colors duration-500 pb-20 select-text overflow-hidden"
      style={{
        backgroundColor: data.primaryColor || '#FFFDF8',
        color: data.textColor,
      }}
    >
      {/* Floating Ambient Falling Petals (optional effect) */}
      {data.showFloatingPetals && (
        <div className="absolute inset-0 pointer-events-none overflow-hidden z-10">
          {[...Array(6)].map((_, i) => (
            <div
              key={i}
              className="absolute w-3 h-4 rounded-full opacity-40"
              style={{
                left: `${15 + i * 16}%`,
                top: `-20px`,
                background: `linear-gradient(135deg, ${data.secondaryColor}, ${data.accentColor}66)`,
                filter: 'blur(0.5px)',
                animation: `slowPetalFall ${8 + (i % 4) * 3}s linear infinite`,
                animationDelay: `${i * 1.8}s`,
              }}
            />
          ))}
        </div>
      )}

      {/* Floating Header Controls: Audio & Cover Rewind */}
      <div className="sticky top-3 z-30 flex items-center justify-between px-4 max-w-lg mx-auto pointer-events-none">
        {onResetCover ? (
          <button
            onClick={onResetCover}
            aria-label="View Cover"
            className="pointer-events-auto px-3 py-1.5 rounded-full bg-white/85 backdrop-blur-md border border-stone-200/70 shadow-sm text-stone-600 hover:text-stone-900 transition-all text-xs font-montserrat flex items-center gap-1.5 hover:scale-105 active:scale-95"
          >
            <RotateCcw className="w-3 h-3 text-stone-500" />
            <span className="text-[11px] font-medium tracking-wide">Cover</span>
          </button>
        ) : <div />}

        {data.musicEnabled && (
          <button
            onClick={toggleMusic}
            aria-label={isPlayingAudio ? 'Mute lullaby music' : 'Play lullaby music'}
            className="pointer-events-auto px-3 py-1.5 rounded-full bg-white/90 backdrop-blur-md border shadow-sm transition-all duration-300 flex items-center gap-1.5 hover:scale-105 active:scale-95"
            style={{
              borderColor: `${data.accentColor}50`,
              color: isPlayingAudio ? data.accentColor : '#78716C',
            }}
          >
            {isPlayingAudio ? (
              <>
                <Volume2 className="w-3.5 h-3.5 animate-pulse" />
                <span className="text-[11px] font-montserrat font-medium tracking-wide">
                  ♪ Playing
                </span>
              </>
            ) : (
              <>
                <VolumeX className="w-3.5 h-3.5" />
                <span className="text-[11px] font-montserrat font-medium tracking-wide">
                  ♪ Music
                </span>
              </>
            )}
          </button>
        )}
      </div>

      <div className="max-w-md mx-auto px-5 pt-4 space-y-12">
        {/* ========================================================================= */}
        {/* SECTION 1: BABY PHOTO & SACRED BLESSING                                   */}
        {/* ========================================================================= */}
        <section className="text-center pt-2">
          {/* Subtle Faith Top Motif */}
          <div className="flex items-center justify-center gap-2 mb-3">
            <SacredCrossIcon color={data.accentColor} className="w-4 h-5" />
            <span
              className={`${fontBodyClass} text-[11px] tracking-[0.28em] uppercase font-medium text-stone-400`}
            >
              Holy Sacrament &amp; 1st Birthday
            </span>
            <HolyDoveIcon color={data.accentColor} className="w-4 h-4" />
          </div>

          {/* Baby Photo in Template Frame */}
          <div className="relative inline-block mb-4">
            <DecorativeFrame
              photoUrl={data.babyPhotoUrl}
              altText={data.babyName}
              shape={data.frameShape}
              accentColor={data.accentColor}
              size="lg"
            />
          </div>

          {/* Baby Nickname / Kicker */}
          <p
            className={`${fontBodyClass} text-xs tracking-[0.2em] uppercase font-medium text-stone-500 mb-1`}
          >
            {data.coverKicker || 'Our Little Blessing'}
          </p>

          {/* Baby's Full Name (Visually Dominant) */}
          <h2
            className={`${fontScriptClass} text-5xl sm:text-6xl leading-tight mb-2 drop-shadow-sm`}
            style={{ color: data.textColor }}
          >
            {data.babyName}
          </h2>

          <FloralDivider color={data.accentColor} className="w-44 h-4 mx-auto my-2 opacity-80" />
        </section>

        {/* ========================================================================= */}
        {/* SECTION 2: WARM INVITATION COPY                                           */}
        {/* ========================================================================= */}
        <section
          className="text-center px-4 py-6 rounded-3xl transition-all"
          style={{
            backgroundColor: `${data.secondaryColor}40`,
            border: `1px solid ${data.accentColor}25`,
          }}
        >
          <p
            className={`${fontHeadingClass} text-xl sm:text-2xl italic font-normal text-stone-700 leading-snug mb-2`}
          >
            &ldquo;{data.introHeading}&rdquo;
          </p>
          <p
            className={`${fontBodyClass} text-xs sm:text-sm text-stone-600 leading-relaxed font-light`}
          >
            {data.introText}
          </p>
        </section>

        {/* ========================================================================= */}
        {/* SECTION 3: TWO-MILESTONE VISUAL CONNECTING FAITH & JOY                     */}
        {/* ========================================================================= */}
        <section className="text-center">
          <div
            className="p-5 rounded-3xl relative overflow-hidden shadow-sm"
            style={{
              backgroundColor: data.cardBgColor,
              border: `1.5px solid ${data.accentColor}35`,
            }}
          >
            {/* Background soft glow */}
            <div
              className="absolute -top-10 -right-10 w-32 h-32 rounded-full blur-2xl opacity-40 pointer-events-none"
              style={{ background: data.secondaryColor }}
            />

            <div className="grid grid-cols-2 items-center divide-x divide-stone-200">
              {/* Milestone 1: Baptism */}
              <div className="px-3 py-2 flex flex-col items-center">
                <div
                  className="w-10 h-10 rounded-full flex items-center justify-center mb-2 shadow-xs"
                  style={{ background: `${data.accentColor}18` }}
                >
                  <SacredCrossIcon color={data.accentColor} className="w-5 h-5" />
                </div>
                <span className="text-[10px] tracking-[0.2em] uppercase font-semibold text-stone-400 font-montserrat">
                  A BLESSING
                </span>
                <h3 className={`${fontHeadingClass} text-lg font-semibold text-stone-800`}>
                  Holy Baptism
                </h3>
              </div>

              {/* Milestone 2: 1st Birthday */}
              <div className="px-3 py-2 flex flex-col items-center">
                <div
                  className="w-10 h-10 rounded-full flex items-center justify-center mb-2 shadow-xs"
                  style={{ background: `${data.accentColor}18` }}
                >
                  <BirthdayCakeIcon color={data.accentColor} className="w-5 h-5" />
                </div>
                <span className="text-[10px] tracking-[0.2em] uppercase font-semibold text-stone-400 font-montserrat">
                  A MILESTONE
                </span>
                <h3 className={`${fontHeadingClass} text-lg font-semibold text-stone-800`}>
                  1st Birthday
                </h3>
              </div>
            </div>

            {/* Connecting Badge Bar */}
            <div className="mt-4 pt-3 border-t border-stone-100 flex items-center justify-center gap-2">
              <Sparkles className="w-3.5 h-3.5" style={{ color: data.accentColor }} />
              <p
                className={`${fontBodyClass} text-[11px] tracking-wider uppercase font-medium text-stone-600`}
              >
                Baptized in Faith • Celebrating One Year of Love
              </p>
              <Sparkles className="w-3.5 h-3.5" style={{ color: data.accentColor }} />
            </div>
          </div>
        </section>

        {/* ========================================================================= */}
        {/* SECTION 4: EVENT INFORMATION CARDS (BAPTISM & RECEPTION)                   */}
        {/* ========================================================================= */}
        <section className="space-y-4">
          <div className="text-center mb-2">
            <span
              className={`${fontBodyClass} text-[10px] tracking-[0.25em] uppercase font-semibold text-stone-400`}
            >
              Event Details
            </span>
            <h3 className={`${fontHeadingClass} text-2xl font-semibold text-stone-800`}>
              Where &amp; When
            </h3>
          </div>

          {/* Card 1: Holy Baptism */}
          <div
            className="p-5 rounded-3xl shadow-sm transition-transform hover:-translate-y-0.5 duration-300"
            style={{
              backgroundColor: data.cardBgColor,
              border: `1.5px solid ${data.accentColor}35`,
            }}
          >
            <div className="flex items-start justify-between gap-3 mb-3">
              <div className="flex items-center gap-2.5">
                <div
                  className="w-9 h-9 rounded-2xl flex items-center justify-center"
                  style={{ background: `${data.accentColor}15` }}
                >
                  <SacredCrossIcon color={data.accentColor} className="w-5 h-5" />
                </div>
                <div>
                  <span className="text-[10px] tracking-widest uppercase font-semibold text-amber-700 block">
                    SACRAMENT
                  </span>
                  <h4 className={`${fontHeadingClass} text-xl font-bold text-stone-800`}>
                    Holy Baptism
                  </h4>
                </div>
              </div>
            </div>

            <div className="space-y-2 text-xs text-stone-600 font-montserrat my-3">
              <div className="flex items-center gap-2">
                <Calendar className="w-3.5 h-3.5 text-stone-400 shrink-0" />
                <span className="font-medium text-stone-800">{data.baptismDate}</span>
              </div>
              <div className="flex items-center gap-2">
                <Clock className="w-3.5 h-3.5 text-stone-400 shrink-0" />
                <span>{data.baptismTime}</span>
              </div>
              <div className="flex items-start gap-2">
                <MapPin className="w-3.5 h-3.5 text-stone-400 shrink-0 mt-0.5" />
                <div>
                  <span className="font-semibold text-stone-800 block">
                    {data.baptismChurch}
                  </span>
                  <span className="text-stone-500 text-[11px] leading-tight block">
                    {data.baptismAddress}
                  </span>
                </div>
              </div>
            </div>

            {data.baptismNotes && (
              <p className="text-[11px] italic text-stone-500 bg-stone-50/70 p-2.5 rounded-xl border border-stone-100 mb-3">
                &ldquo;{data.baptismNotes}&rdquo;
              </p>
            )}

            <a
              href={data.baptismMapsUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center justify-center w-full py-2.5 px-4 rounded-xl text-xs font-medium transition-all group"
              style={{
                backgroundColor: `${data.secondaryColor}70`,
                color: data.textColor,
                border: `1px solid ${data.accentColor}30`,
              }}
            >
              <span>View Church Location</span>
              <ExternalLink className="w-3 h-3 ml-1.5 text-stone-400 group-hover:text-stone-700" />
            </a>
          </div>

          {/* Card 2: First Birthday Reception */}
          <div
            className="p-5 rounded-3xl shadow-sm transition-transform hover:-translate-y-0.5 duration-300"
            style={{
              backgroundColor: data.cardBgColor,
              border: `1.5px solid ${data.accentColor}35`,
            }}
          >
            <div className="flex items-start justify-between gap-3 mb-3">
              <div className="flex items-center gap-2.5">
                <div
                  className="w-9 h-9 rounded-2xl flex items-center justify-center"
                  style={{ background: `${data.accentColor}15` }}
                >
                  <BirthdayCakeIcon color={data.accentColor} className="w-5 h-5" />
                </div>
                <div>
                  <span className="text-[10px] tracking-widest uppercase font-semibold text-amber-700 block">
                    RECEPTION &amp; FEAST
                  </span>
                  <h4 className={`${fontHeadingClass} text-xl font-bold text-stone-800`}>
                    First Birthday Celebration
                  </h4>
                </div>
              </div>
            </div>

            <div className="space-y-2 text-xs text-stone-600 font-montserrat my-3">
              <div className="flex items-center gap-2">
                <Calendar className="w-3.5 h-3.5 text-stone-400 shrink-0" />
                <span className="font-medium text-stone-800">{data.birthdayDate}</span>
              </div>
              <div className="flex items-center gap-2">
                <Clock className="w-3.5 h-3.5 text-stone-400 shrink-0" />
                <span>{data.birthdayTime}</span>
              </div>
              <div className="flex items-start gap-2">
                <MapPin className="w-3.5 h-3.5 text-stone-400 shrink-0 mt-0.5" />
                <div>
                  <span className="font-semibold text-stone-800 block">
                    {data.birthdayVenue}
                  </span>
                  <span className="text-stone-500 text-[11px] leading-tight block">
                    {data.birthdayAddress}
                  </span>
                </div>
              </div>
            </div>

            {data.birthdayNotes && (
              <p className="text-[11px] italic text-stone-500 bg-stone-50/70 p-2.5 rounded-xl border border-stone-100 mb-3">
                &ldquo;{data.birthdayNotes}&rdquo;
              </p>
            )}

            <a
              href={data.birthdayMapsUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center justify-center w-full py-2.5 px-4 rounded-xl text-xs font-medium transition-all group"
              style={{
                backgroundColor: `${data.secondaryColor}70`,
                color: data.textColor,
                border: `1px solid ${data.accentColor}30`,
              }}
            >
              <span>View Reception Location</span>
              <ExternalLink className="w-3 h-3 ml-1.5 text-stone-400 group-hover:text-stone-700" />
            </a>
          </div>
        </section>

        {/* ========================================================================= */}
        {/* SECTION 5: CELEBRATORY COUNTDOWN TIMER                                    */}
        {/* ========================================================================= */}
        <section
          className="text-center p-6 rounded-3xl shadow-sm relative overflow-hidden"
          style={{
            background: `radial-gradient(ellipse at top, #FFFFFF, ${data.secondaryColor} 90%)`,
            border: `1.5px solid ${data.accentColor}40`,
          }}
        >
          <div className="flex items-center justify-center gap-2 mb-3">
            <GoldSparkleIcon color={data.accentColor} className="w-3.5 h-3.5" />
            <h4
              className={`${fontHeadingClass} text-xl sm:text-2xl font-semibold tracking-wide text-stone-800`}
            >
              The Celebration Begins In
            </h4>
            <GoldSparkleIcon color={data.accentColor} className="w-3.5 h-3.5" />
          </div>

          {/* Large Elegant Numbers (Not technical dashboard timer) */}
          <div className="grid grid-cols-4 gap-2 sm:gap-3 max-w-xs mx-auto my-3">
            <div className="p-3 bg-white/80 rounded-2xl border border-stone-200/60 shadow-xs flex flex-col items-center">
              <span
                className={`${fontHeadingClass} text-2xl sm:text-3xl font-bold tracking-tight text-stone-900 tabular-nums`}
              >
                {String(timeLeft.days).padStart(2, '0')}
              </span>
              <span className="text-[10px] tracking-wider uppercase text-stone-500 font-montserrat mt-0.5">
                Days
              </span>
            </div>

            <div className="p-3 bg-white/80 rounded-2xl border border-stone-200/60 shadow-xs flex flex-col items-center">
              <span
                className={`${fontHeadingClass} text-2xl sm:text-3xl font-bold tracking-tight text-stone-900 tabular-nums`}
              >
                {String(timeLeft.hours).padStart(2, '0')}
              </span>
              <span className="text-[10px] tracking-wider uppercase text-stone-500 font-montserrat mt-0.5">
                Hours
              </span>
            </div>

            <div className="p-3 bg-white/80 rounded-2xl border border-stone-200/60 shadow-xs flex flex-col items-center">
              <span
                className={`${fontHeadingClass} text-2xl sm:text-3xl font-bold tracking-tight text-stone-900 tabular-nums`}
              >
                {String(timeLeft.minutes).padStart(2, '0')}
              </span>
              <span className="text-[10px] tracking-wider uppercase text-stone-500 font-montserrat mt-0.5">
                Minutes
              </span>
            </div>

            <div className="p-3 bg-white/80 rounded-2xl border border-stone-200/60 shadow-xs flex flex-col items-center">
              <span
                className={`${fontHeadingClass} text-2xl sm:text-3xl font-bold tracking-tight text-stone-900 tabular-nums`}
              >
                {String(timeLeft.seconds).padStart(2, '0')}
              </span>
              <span className="text-[10px] tracking-wider uppercase text-stone-500 font-montserrat mt-0.5">
                Seconds
              </span>
            </div>
          </div>

          <p className="text-[11px] text-stone-500 font-montserrat italic mt-2">
            Counting down each precious moment of thanksgiving
          </p>
        </section>

        {/* ========================================================================= */}
        {/* SECTION 6: PARENTS SECTION                                                */}
        {/* ========================================================================= */}
        <section className="text-center py-4">
          <p
            className={`${fontBodyClass} text-xs tracking-[0.25em] uppercase font-medium text-stone-400 mb-2`}
          >
            With love from
          </p>

          <div className="space-y-1 mb-3">
            <h3 className={`${fontHeadingClass} text-2xl font-bold text-stone-800`}>
              {data.fatherName}
            </h3>
            <span
              className={`${fontScriptClass} text-2xl text-stone-500 block -my-1`}
              style={{ color: data.accentColor }}
            >
              and
            </span>
            <h3 className={`${fontHeadingClass} text-2xl font-bold text-stone-800`}>
              {data.motherName}
            </h3>
          </div>

          <FloralDivider color={data.accentColor} className="w-40 h-4 mx-auto my-3 opacity-75" />

          <p
            className={`${fontBodyClass} text-xs sm:text-sm text-stone-600 max-w-sm mx-auto leading-relaxed font-light`}
          >
            {data.parentsMessage}
          </p>
        </section>

        {/* ========================================================================= */}
        {/* SECTION 7: GODPARENTS (CIRCLE OF LOVE)                                    */}
        {/* ========================================================================= */}
        <section className="space-y-3">
          <div className="text-center mb-4">
            <div className="inline-flex items-center justify-center gap-1.5 text-stone-400 mb-1">
              <HolyDoveIcon color={data.accentColor} className="w-4 h-4" />
              <span className="text-[10px] tracking-[0.28em] uppercase font-semibold font-montserrat">
                Circle of Love
              </span>
            </div>
            <h3 className={`${fontHeadingClass} text-2xl font-bold text-stone-800`}>
              {data.godparentsHeading || 'Godparents'}
            </h3>
            <p className="text-xs text-stone-500 font-montserrat max-w-xs mx-auto italic mt-1">
              {data.godparentsSubheading ||
                'Those who will help guide our little one with faith, love, and kindness.'}
            </p>
          </div>

          {/* Godparent Cards Grid */}
          <div className="grid grid-cols-2 gap-2.5">
            {data.godparents.map((gp) => (
              <div
                key={gp.id}
                className="p-3.5 rounded-2xl bg-white border border-stone-200/70 shadow-xs flex flex-col justify-between transition-transform hover:scale-[1.01]"
              >
                <div>
                  <div className="flex items-center justify-between mb-1.5">
                    <span
                      className="text-[10px] tracking-wider uppercase font-semibold"
                      style={{ color: data.accentColor }}
                    >
                      {gp.role}
                    </span>
                    <SacredCrossIcon color={data.accentColor} className="w-3 h-3.5 opacity-60" />
                  </div>
                  <h4 className="text-xs sm:text-sm font-semibold text-stone-800 font-montserrat line-clamp-2">
                    {gp.name}
                  </h4>
                </div>
                {gp.relationship && (
                  <span className="text-[10px] text-stone-400 font-montserrat block mt-1">
                    {gp.relationship}
                  </span>
                )}
              </div>
            ))}
          </div>
        </section>

        {/* ========================================================================= */}
        {/* SECTION 8: INSPIRATIONAL BIBLE VERSE                                      */}
        {/* ========================================================================= */}
        <section
          className="text-center p-8 rounded-3xl shadow-sm relative overflow-hidden my-6"
          style={{
            backgroundColor: `${data.secondaryColor}65`,
            border: `1.5px solid ${data.accentColor}30`,
          }}
        >
          {/* Subtle dove watermark motif */}
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 opacity-5 pointer-events-none">
            <HolyDoveIcon color={data.accentColor} className="w-48 h-48" />
          </div>

          <div className="relative z-10">
            <SacredCrossIcon color={data.accentColor} className="w-5 h-6 mx-auto mb-3" />

            <blockquote
              className={`${fontHeadingClass} text-lg sm:text-xl font-normal italic text-stone-800 leading-relaxed max-w-sm mx-auto mb-3`}
            >
              {data.verseText}
            </blockquote>

            <p
              className={`${fontBodyClass} text-xs tracking-widest uppercase font-semibold text-amber-800`}
            >
              — {data.verseCitation} —
            </p>
          </div>
        </section>

        {/* ========================================================================= */}
        {/* SECTION 9: BIRTHDAY CELEBRATION SECTION (PLAYFUL ELEMENTS)                */}
        {/* ========================================================================= */}
        <section
          className="text-center p-6 rounded-3xl relative overflow-hidden shadow-xs"
          style={{
            backgroundColor: '#FFFFFF',
            border: `1.5px dashed ${data.accentColor}60`,
          }}
        >
          {/* Subtle party ornaments */}
          <div className="flex items-center justify-center gap-2 mb-2">
            <NumberOneMilestoneIcon color={data.accentColor} className="w-5 h-5" />
            <h3 className={`${fontHeadingClass} text-2xl font-bold text-stone-800`}>
              {data.birthdayHeading || "Let's Celebrate!"}
            </h3>
            <NumberOneMilestoneIcon color={data.accentColor} className="w-5 h-5" />
          </div>

          <p className={`${fontScriptClass} text-2xl text-amber-800 mb-4`}>
            {data.birthdaySubheading || 'Our little one is turning ONE!'}
          </p>

          {/* Celebratory milestone badges */}
          <div className="grid grid-cols-3 gap-2 text-stone-700 text-xs font-montserrat">
            <div className="p-2.5 rounded-xl bg-amber-50/60 border border-amber-100 flex flex-col items-center">
              <span className="text-xl mb-1">🎈</span>
              <span className="text-[11px] font-medium">Balloons &amp; Joy</span>
            </div>
            <div className="p-2.5 rounded-xl bg-amber-50/60 border border-amber-100 flex flex-col items-center">
              <span className="text-xl mb-1">🎂</span>
              <span className="text-[11px] font-medium">Birthday Cake</span>
            </div>
            <div className="p-2.5 rounded-xl bg-amber-50/60 border border-amber-100 flex flex-col items-center">
              <span className="text-xl mb-1">🎁</span>
              <span className="text-[11px] font-medium">Fun &amp; Games</span>
            </div>
          </div>
        </section>

        {/* ========================================================================= */}
        {/* SECTION 10: PHOTO MEMORIES GALLERY                                        */}
        {/* ========================================================================= */}
        <section className="space-y-4">
          <div className="text-center">
            <div className="flex items-center justify-center gap-2 text-stone-400 mb-1">
              <Camera className="w-3.5 h-3.5" style={{ color: data.accentColor }} />
              <span className="text-[10px] tracking-[0.25em] uppercase font-semibold font-montserrat">
                Scrapbook
              </span>
            </div>
            <h3 className={`${fontHeadingClass} text-2xl font-bold text-stone-800`}>
              {data.galleryTitle || 'One Year of Love'}
            </h3>
            <p className="text-xs text-stone-500 font-montserrat italic">
              {data.gallerySubtitle || 'Memories of a wonderful first year.'}
            </p>
          </div>

          <div className="grid grid-cols-2 gap-3">
            {data.photos.map((photo) => (
              <div
                key={photo.id}
                onClick={() => setSelectedPhoto(photo)}
                className="group cursor-pointer bg-white p-2 rounded-2xl shadow-xs border border-stone-200/70 transition-all hover:shadow-md hover:-translate-y-0.5"
              >
                <div className="aspect-square rounded-xl overflow-hidden mb-2 relative bg-stone-100">
                  <img
                    src={photo.url}
                    alt={photo.caption}
                    referrerPolicy="no-referrer"
                    className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
                  />
                  {photo.ageMonth && (
                    <span
                      className="absolute bottom-1.5 right-1.5 text-[9px] font-semibold tracking-wider uppercase px-2 py-0.5 rounded-md text-stone-800 bg-white/90 backdrop-blur-xs shadow-xs font-montserrat"
                    >
                      {photo.ageMonth}
                    </span>
                  )}
                </div>
                <p className="text-[11px] text-stone-700 font-montserrat truncate px-1">
                  {photo.caption}
                </p>
              </div>
            ))}
          </div>
        </section>

        {/* ========================================================================= */}
        {/* SECTION 11: EVENT TIMELINE                                                */}
        {/* ========================================================================= */}
        <section className="space-y-4">
          <div className="text-center">
            <span className="text-[10px] tracking-[0.25em] uppercase font-semibold text-stone-400 font-montserrat">
              Order of Events
            </span>
            <h3 className={`${fontHeadingClass} text-2xl font-bold text-stone-800`}>
              Event Timeline
            </h3>
          </div>

          <div className="relative pl-6 space-y-6 before:content-[''] before:absolute before:left-3 before:top-2 before:bottom-2 before:w-0.5 before:bg-stone-200">
            {data.timelineItems.map((item) => (
              <div key={item.id} className="relative group">
                {/* Timeline node icon */}
                <div
                  className="absolute -left-6 top-0 w-6 h-6 rounded-full bg-white border-2 flex items-center justify-center shadow-xs transition-transform group-hover:scale-110"
                  style={{ borderColor: data.accentColor }}
                >
                  {renderTimelineIcon(item.icon)}
                </div>

                <div className="pl-4">
                  <span
                    className="text-[11px] font-semibold tracking-wider uppercase font-montserrat block"
                    style={{ color: data.accentColor }}
                  >
                    {item.time}
                  </span>
                  <h4 className={`${fontHeadingClass} text-lg font-bold text-stone-800 leading-tight`}>
                    {item.title}
                  </h4>
                  {item.subtitle && (
                    <p className="text-xs text-stone-500 font-montserrat font-light mt-0.5">
                      {item.subtitle}
                    </p>
                  )}
                </div>
              </div>
            ))}
          </div>
        </section>

        {/* ========================================================================= */}
        {/* SECTION 12 & 13: RSVP INTERACTIVE SECTION & CONFIRMATION                   */}
        {/* ========================================================================= */}
        <section
          id="rsvp-section"
          className="text-center p-6 sm:p-8 rounded-3xl shadow-md transition-all relative overflow-hidden"
          style={{
            background: `radial-gradient(ellipse at 50% 10%, #FFFFFF 30%, ${data.secondaryColor} 100%)`,
            border: `2px solid ${data.accentColor}50`,
          }}
        >
          {/* Subtle gold sparkles */}
          <div className="absolute top-4 left-4 animate-sparkle">
            <GoldSparkleIcon color={data.accentColor} className="w-4 h-4" />
          </div>
          <div className="absolute top-4 right-4 animate-sparkle" style={{ animationDelay: '1s' }}>
            <GoldSparkleIcon color={data.accentColor} className="w-4 h-4" />
          </div>

          <div className="inline-flex items-center justify-center w-12 h-12 rounded-full mb-3" style={{ background: `${data.accentColor}20` }}>
            <Heart className="w-6 h-6 fill-current" style={{ color: data.accentColor }} />
          </div>

          <h3 className={`${fontHeadingClass} text-3xl font-bold text-stone-900 mb-1`}>
            Will You Join Us?
          </h3>

          <p className="text-xs sm:text-sm text-stone-600 font-montserrat max-w-xs mx-auto leading-relaxed mb-6 font-light">
            {data.rsvpNote ||
              'Your presence would make this special day even more meaningful to our family.'}
          </p>

          {/* Conditional: If guest already confirmed in this session, show confirmation badge */}
          {confirmedRsvp ? (
            <div className="p-4 bg-white/95 rounded-2xl border border-stone-200 shadow-sm animate-fade-in text-center font-montserrat">
              <div className="flex items-center justify-center gap-1.5 text-xs font-semibold tracking-wider uppercase text-emerald-700 mb-2">
                <Check className="w-4 h-4" />
                <span>ATTENDANCE CONFIRMED</span>
              </div>

              <h4 className="text-lg font-bold text-stone-800">
                {confirmedRsvp.name}
              </h4>

              <p className="text-xs text-stone-500 mb-3">
                {confirmedRsvp.attending
                  ? 'Attendance confirmed with joy'
                  : 'Declined with love'}
              </p>

              <button
                onClick={() => {
                  setAttendingInitial(confirmedRsvp.attending);
                  setIsRsvpModalOpen(true);
                }}
                className="text-xs font-medium text-stone-600 hover:text-stone-900 underline hover:no-underline cursor-pointer"
              >
                Update RSVP
              </button>
            </div>
          ) : (
            /* Primary RSVP Buttons */
            <div className="space-y-3 font-montserrat max-w-xs mx-auto">
              <button
                onClick={() => {
                  setAttendingInitial(true);
                  setIsRsvpModalOpen(true);
                }}
                className="w-full py-4 px-6 rounded-2xl text-sm font-semibold text-white shadow-md hover:shadow-lg transition-all duration-300 flex items-center justify-center gap-2 transform hover:-translate-y-0.5 active:scale-95 cursor-pointer"
                style={{
                  background: `linear-gradient(135deg, ${data.accentColor}, #A87D43)`,
                }}
              >
                <span>💛 YES, I&apos;LL BE THERE!</span>
              </button>

              <button
                onClick={() => {
                  setAttendingInitial(false);
                  setIsRsvpModalOpen(true);
                }}
                className="w-full py-3 px-6 rounded-2xl text-xs font-medium text-stone-600 hover:text-stone-900 bg-white/80 hover:bg-white border border-stone-200 transition-all duration-200 cursor-pointer"
              >
                I&apos;M SORRY, I CAN&apos;T ATTEND
              </button>

              <p className="text-[10px] text-stone-400 tracking-wide uppercase pt-2">
                {data.rsvpDeadline}
              </p>
            </div>
          )}
        </section>

        {/* ========================================================================= */}
        {/* SECTION 14: LOCATION & DIRECTIONS                                         */}
        {/* ========================================================================= */}
        <section className="space-y-3">
          <div className="text-center">
            <span className="text-[10px] tracking-[0.25em] uppercase font-semibold text-stone-400 font-montserrat">
              Maps &amp; Directions
            </span>
            <h3 className={`${fontHeadingClass} text-2xl font-bold text-stone-800`}>
              Where to Go
            </h3>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 font-montserrat">
            <div className="p-4 rounded-2xl bg-white border border-stone-200/80 shadow-xs flex flex-col justify-between">
              <div>
                <div className="flex items-center gap-2 text-xs font-semibold text-stone-700 mb-1">
                  <SacredCrossIcon color={data.accentColor} className="w-4 h-4" />
                  <span>Holy Baptism Church</span>
                </div>
                <p className="text-xs font-bold text-stone-800">{data.baptismChurch}</p>
                <p className="text-[11px] text-stone-500 mt-0.5">{data.baptismAddress}</p>
              </div>
              <a
                href={data.baptismMapsUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="mt-3 inline-flex items-center text-xs font-semibold transition-colors gap-1 text-amber-800 hover:text-amber-900"
              >
                <span>Open in Maps</span>
                <ChevronRight className="w-3.5 h-3.5" />
              </a>
            </div>

            <div className="p-4 rounded-2xl bg-white border border-stone-200/80 shadow-xs flex flex-col justify-between">
              <div>
                <div className="flex items-center gap-2 text-xs font-semibold text-stone-700 mb-1">
                  <BirthdayCakeIcon color={data.accentColor} className="w-4 h-4" />
                  <span>Birthday Reception</span>
                </div>
                <p className="text-xs font-bold text-stone-800">{data.birthdayVenue}</p>
                <p className="text-[11px] text-stone-500 mt-0.5">{data.birthdayAddress}</p>
              </div>
              <a
                href={data.birthdayMapsUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="mt-3 inline-flex items-center text-xs font-semibold transition-colors gap-1 text-amber-800 hover:text-amber-900"
              >
                <span>Open in Maps</span>
                <ChevronRight className="w-3.5 h-3.5" />
              </a>
            </div>
          </div>
        </section>

        {/* ========================================================================= */}
        {/* SECTION 15: EMOTIONAL CLOSING SECTION                                      */}
        {/* ========================================================================= */}
        <footer className="text-center pt-8 pb-12 border-t border-stone-200/60">
          <div className="flex items-center justify-center gap-2 mb-2">
            <SacredCrossIcon color={data.accentColor} className="w-3.5 h-4.5" />
            <span className="text-lg">🎂</span>
            <HolyDoveIcon color={data.accentColor} className="w-4 h-4" />
          </div>

          <h3 className={`${fontHeadingClass} text-3xl font-bold text-stone-800 mb-2`}>
            {data.closingHeading || 'Thank You'}
          </h3>

          <p className="text-xs sm:text-sm text-stone-600 font-montserrat max-w-xs mx-auto leading-relaxed mb-6 font-light">
            {data.closingMessage ||
              'Thank you for being part of our little one’s journey and for celebrating this beautiful milestone with us.'}
          </p>

          <p
            className={`${fontScriptClass} text-3xl text-stone-800 mb-1`}
            style={{ color: data.accentColor }}
          >
            {data.closingSignature || `With love, ${data.fatherName} & ${data.motherName}`}
          </p>

          <p className={`${fontHeadingClass} text-xl font-semibold text-stone-700 tracking-wide uppercase mt-1`}>
            {data.babyName}
          </p>
        </footer>
      </div>

      {/* RSVP Modal */}
      <RsvpModal
        isOpen={isRsvpModalOpen}
        onClose={() => setIsRsvpModalOpen(false)}
        attendingInitial={attendingInitial}
        accentColor={data.accentColor}
        babyName={data.babyName}
        existingRsvp={confirmedRsvp}
        onConfirm={handleRsvpConfirm}
      />

      {/* Lightbox for Gallery Photo */}
      {selectedPhoto && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/85 backdrop-blur-sm animate-fade-in"
          onClick={() => setSelectedPhoto(null)}
        >
          <div
            className="relative max-w-sm sm:max-w-md w-full bg-white rounded-3xl p-4 shadow-2xl"
            onClick={(e) => e.stopPropagation()}
          >
            <button
              onClick={() => setSelectedPhoto(null)}
              className="absolute top-3 right-3 p-2 rounded-full bg-stone-100 hover:bg-stone-200 text-stone-600 z-10"
              aria-label="Close photo preview"
            >
              <X className="w-4 h-4" />
            </button>
            <div className="aspect-square rounded-2xl overflow-hidden mb-3">
              <img
                src={selectedPhoto.url}
                alt={selectedPhoto.caption}
                referrerPolicy="no-referrer"
                className="w-full h-full object-cover"
              />
            </div>
            <div className="text-center">
              {selectedPhoto.ageMonth && (
                <span className="text-[10px] font-semibold uppercase tracking-wider text-amber-800 font-montserrat block mb-1">
                  {selectedPhoto.ageMonth}
                </span>
              )}
              <p className="text-sm font-medium text-stone-800 font-montserrat">
                {selectedPhoto.caption}
              </p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
