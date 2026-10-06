import React from 'react';
import { InvitationData } from '../../types/invitation';
import { DecorativeFrame } from '../common/DecorativeFrames';
import {
  SacredCrossIcon,
  HolyDoveIcon,
  BirthdayCakeIcon,
  GoldSparkleIcon,
  FloralDivider,
} from '../common/DecorativeIcons';
import { ChevronDown, Sparkles, Camera } from 'lucide-react';
import { PhotoReplaceModal } from '../common/PhotoReplaceModal';

interface CoverScreenProps {
  data: InvitationData;
  onOpen: () => void;
  isOpen: boolean;
  onReplaceBabyPhoto?: (newUrl: string) => void;
}

export const CoverScreen: React.FC<CoverScreenProps> = ({
  data,
  onOpen,
  isOpen,
  onReplaceBabyPhoto,
}) => {
  const [isPhotoModalOpen, setIsPhotoModalOpen] = React.useState(false);
  const fontHeadingClass =
    data.fontHeading === 'playfair' ? 'font-playfair' : 'font-cormorant';
  const fontScriptClass =
    data.fontScript === 'parisienne' ? 'font-parisienne' : 'font-vibes';
  const fontBodyClass =
    data.fontBody === 'poppins' ? 'font-poppins' : 'font-montserrat';

  return (
    <div
      className={`fixed inset-0 z-40 flex flex-col items-center justify-between text-center px-6 py-10 transition-all duration-1000 ease-out select-none ${
        isOpen
          ? '-translate-y-full opacity-0 pointer-events-none'
          : 'translate-y-0 opacity-100 pointer-events-auto'
      }`}
      style={{
        backgroundColor: data.primaryColor || '#FFFDF8',
        backgroundImage: `radial-gradient(ellipse at 50% 15%, #FFFFFF 20%, ${data.secondaryColor} 70%, ${data.primaryColor} 100%)`,
      }}
    >
      {/* Background Soft Glow & Cloud Light */}
      <div className="absolute inset-0 pointer-events-none overflow-hidden">
        {/* Soft celestial radial light */}
        <div
          className="absolute -top-32 left-1/2 -translate-x-1/2 w-96 h-96 rounded-full blur-3xl opacity-60"
          style={{ background: `radial-gradient(circle, ${data.accentColor}25, transparent 70%)` }}
        />
        {/* Delicate floating background sparkles */}
        <div className="absolute top-12 left-10 animate-sparkle opacity-40">
          <GoldSparkleIcon color={data.accentColor} className="w-5 h-5" />
        </div>
        <div className="absolute top-24 right-8 animate-sparkle opacity-35" style={{ animationDelay: '1.2s' }}>
          <GoldSparkleIcon color={data.accentColor} className="w-4 h-4" />
        </div>
        <div className="absolute bottom-32 left-8 animate-sparkle opacity-40" style={{ animationDelay: '0.8s' }}>
          <GoldSparkleIcon color={data.accentColor} className="w-4 h-4" />
        </div>
        <div className="absolute bottom-40 right-12 animate-sparkle opacity-30" style={{ animationDelay: '1.8s' }}>
          <GoldSparkleIcon color={data.accentColor} className="w-5 h-5" />
        </div>
      </div>

      {/* Top Section: Sacred Blessing & Kicker */}
      <div className="relative z-10 pt-4 flex flex-col items-center">
        {/* Subtle Cross & Dove Header Motif */}
        <div className="flex items-center justify-center gap-3 mb-2 opacity-80">
          <HolyDoveIcon color={data.accentColor} className="w-5 h-5" />
          <span className="text-[10px] tracking-[0.3em] uppercase text-stone-400 font-montserrat">
            • A Blessed Celebration •
          </span>
          <SacredCrossIcon color={data.accentColor} className="w-3.5 h-4.5" />
        </div>

        {/* Small uppercase kicker */}
        <p
          className={`${fontBodyClass} text-xs tracking-[0.25em] uppercase font-medium text-stone-500`}
        >
          {data.coverKicker || 'YOU ARE INVITED'}
        </p>
      </div>

      {/* Center Section: Baby Photo + Name + Milestones */}
      <div className="relative z-10 flex flex-col items-center my-auto py-2">
        {/* Baby Photo in Template-defined Frame */}
        <div className="relative mb-4 transform transition-transform duration-500 hover:scale-[1.02]">
          <DecorativeFrame
            photoUrl={data.babyPhotoUrl}
            altText={data.babyName}
            shape={data.frameShape}
            accentColor={data.accentColor}
            size="md"
          />

          {onReplaceBabyPhoto && (
            <button
              type="button"
              onClick={(e) => {
                e.stopPropagation();
                setIsPhotoModalOpen(true);
              }}
              className="absolute -bottom-2.5 left-1/2 -translate-x-1/2 px-3 py-1 rounded-full bg-stone-900/90 hover:bg-stone-900 text-white shadow-lg text-[10px] font-semibold flex items-center gap-1.5 backdrop-blur-xs transition-all hover:scale-105 active:scale-95 cursor-pointer z-30 border border-white/20"
              title="Upload & Replace Baby Portrait Photo"
            >
              <Camera className="w-3 h-3 text-amber-300" />
              <span>Replace Photo</span>
            </button>
          )}
        </div>

        {/* Modal for uploading/replacing cover baby photo */}
        {onReplaceBabyPhoto && (
          <PhotoReplaceModal
            isOpen={isPhotoModalOpen}
            onClose={() => setIsPhotoModalOpen(false)}
            currentUrl={data.babyPhotoUrl}
            onPhotoChange={(newUrl) => {
              onReplaceBabyPhoto(newUrl);
            }}
            title="Replace Baby Portrait Photo"
            description="Upload and replace the main cover & christening hero portrait"
            accentColor={data.accentColor}
            presets={[
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
            ]}
          />
        )}

        {/* Baby's Name (Most visually important text) */}
        <h1
          className={`${fontScriptClass} text-4xl sm:text-5xl md:text-6xl text-stone-900 leading-tight mb-1 drop-shadow-sm`}
          style={{ color: data.textColor }}
        >
          {data.babyName}
        </h1>

        {/* Milestone Title */}
        <div className="flex items-center gap-2 mb-2">
          <p
            className={`${fontHeadingClass} text-lg sm:text-xl font-medium tracking-wide uppercase text-stone-700`}
            style={{ color: data.accentColor }}
          >
            {data.milestoneTitle || 'Holy Baptism & 1st Birthday'}
          </p>
        </div>

        <FloralDivider color={data.accentColor} className="w-40 h-4 my-1 opacity-75" />

        {/* Event Date preview on cover */}
        <p className={`${fontBodyClass} text-xs text-stone-600 tracking-wider font-light mt-1`}>
          {data.baptismDate}
        </p>
      </div>

      {/* Bottom Section: Tap to Open Invitation */}
      <div className="relative z-10 pb-4 flex flex-col items-center w-full max-w-xs">
        <button
          onClick={onOpen}
          className="group relative w-full py-4 px-6 rounded-full overflow-hidden transition-all duration-300 shadow-md hover:shadow-xl active:scale-95 flex items-center justify-center gap-2.5 border"
          style={{
            background: `linear-gradient(135deg, #FFFFFF 0%, ${data.primaryColor} 100%)`,
            borderColor: `${data.accentColor}60`,
          }}
        >
          {/* Subtle gold shimmer on hover */}
          <div
            className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none"
            style={{
              background: `radial-gradient(circle at center, ${data.accentColor}18, transparent 70%)`,
            }}
          />

          <Sparkles className="w-4 h-4 animate-sparkle" style={{ color: data.accentColor }} />

          <span
            className={`${fontBodyClass} text-xs sm:text-sm tracking-[0.18em] uppercase font-semibold text-stone-800 group-hover:text-stone-900`}
          >
            Tap to Open Invitation
          </span>

          <ChevronDown
            className="w-4 h-4 animate-bounce text-stone-500 group-hover:text-stone-800"
            style={{ animationDuration: '2s' }}
          />
        </button>

        <span className="text-[10px] text-stone-400 font-montserrat tracking-widest uppercase mt-3">
          ✦ Touch screen to begin journey ✦
        </span>
      </div>
    </div>
  );
};
