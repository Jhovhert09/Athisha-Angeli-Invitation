import React, { useState } from 'react';
import confetti from 'canvas-confetti';
import { GuestRsvp } from '../../types/invitation';
import { GoldSparkleIcon, SacredCrossIcon } from '../common/DecorativeIcons';
import { Heart, X, CheckCircle2 } from 'lucide-react';

interface RsvpModalProps {
  isOpen: boolean;
  onClose: () => void;
  attendingInitial: boolean;
  accentColor: string;
  babyName: string;
  existingRsvp?: GuestRsvp | null;
  onConfirm: (rsvp: GuestRsvp) => void;
}

export const RsvpModal: React.FC<RsvpModalProps> = ({
  isOpen,
  onClose,
  attendingInitial,
  accentColor,
  babyName,
  existingRsvp,
  onConfirm,
}) => {
  const [attending, setAttending] = useState(attendingInitial);
  const [name, setName] = useState(existingRsvp?.name || '');
  const [message, setMessage] = useState(existingRsvp?.message || '');
  const [submitted, setSubmitted] = useState(false);

  React.useEffect(() => {
    setAttending(attendingInitial);
  }, [attendingInitial]);

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) return;

    const newRsvp: GuestRsvp = {
      id: existingRsvp?.id || 'rsvp_' + Date.now(),
      name: name.trim(),
      attending,
      guestCount: attending ? 1 : 0,
      message: message.trim(),
      submittedAt: new Date().toLocaleDateString('en-US', {
        month: 'short',
        day: 'numeric',
        year: 'numeric',
      }),
    };

    onConfirm(newRsvp);
    setSubmitted(true);

    if (attending) {
      try {
        confetti({
          particleCount: 80,
          spread: 70,
          origin: { y: 0.6 },
          colors: ['#C9A96A', '#FFFDF8', '#96B3D6', '#EAD9BC'],
        });
      } catch {
        // confetti fallback
      }
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/45 backdrop-blur-sm animate-fade-in">
      <div
        className="relative w-full max-w-md bg-[#FFFDF9] rounded-3xl p-6 sm:p-8 shadow-2xl border transition-all duration-300"
        style={{ borderColor: `${accentColor}40` }}
      >
        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute top-4 right-4 p-2 text-stone-400 hover:text-stone-700 rounded-full hover:bg-stone-100 transition-colors"
          aria-label="Close RSVP modal"
        >
          <X className="w-5 h-5" />
        </button>

        {!submitted ? (
          <div>
            {/* Header */}
            <div className="text-center mb-6">
              <div className="inline-flex items-center justify-center w-10 h-10 rounded-full mb-3" style={{ background: `${accentColor}18` }}>
                <SacredCrossIcon color={accentColor} className="w-5 h-5" />
              </div>

              <h3 className="font-cormorant text-2xl sm:text-3xl font-semibold text-stone-800">
                {attending
                  ? "We're so happy you'll be joining us!"
                  : "We will miss your presence"}
              </h3>
              <p className="text-xs sm:text-sm text-stone-500 font-montserrat mt-1">
                Celebrating {babyName}&apos;s Holy Baptism &amp; 1st Birthday
              </p>
            </div>

            {/* Attendance Toggle */}
            <div className="grid grid-cols-2 gap-2 p-1 bg-stone-100/80 rounded-2xl mb-5">
              <button
                type="button"
                onClick={() => setAttending(true)}
                className={`py-2 text-xs font-montserrat font-medium rounded-xl transition-all ${
                  attending
                    ? 'bg-white text-stone-900 shadow-sm'
                    : 'text-stone-500 hover:text-stone-800'
                }`}
              >
                💛 Attending
              </button>
              <button
                type="button"
                onClick={() => setAttending(false)}
                className={`py-2 text-xs font-montserrat font-medium rounded-xl transition-all ${
                  !attending
                    ? 'bg-white text-stone-900 shadow-sm'
                    : 'text-stone-500 hover:text-stone-800'
                }`}
              >
                Declining with Love
              </button>
            </div>

            <form onSubmit={handleSubmit} className="space-y-4 font-montserrat">
              {/* Full Name */}
              <div>
                <label className="block text-xs font-medium text-stone-700 mb-1">
                  Your Name <span className="text-amber-700">*</span>
                </label>
                <input
                  type="text"
                  required
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="e.g. Maria Santos"
                  className="w-full px-4 py-2.5 text-sm bg-white border border-stone-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-amber-500/30 focus:border-amber-600 transition-all text-stone-800 placeholder:text-stone-400"
                />
              </div>

              {/* Message */}
              <div>
                <label className="block text-xs font-medium text-stone-700 mb-1">
                  A blessing or message for the family (optional)
                </label>
                <textarea
                  rows={2}
                  value={message}
                  onChange={(e) => setMessage(e.target.value)}
                  placeholder="Warm wishes for baby and parents..."
                  className="w-full px-4 py-2 text-sm bg-white border border-stone-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-amber-500/30 focus:border-amber-600 transition-all text-stone-800 placeholder:text-stone-400 resize-none"
                />
              </div>

              {/* Submit CTA */}
              <button
                type="submit"
                className="w-full py-3.5 px-6 rounded-2xl font-montserrat text-sm font-semibold text-white shadow-md hover:shadow-lg transition-all duration-200 flex items-center justify-center gap-2 transform active:scale-[0.99]"
                style={{
                  background: attending
                    ? `linear-gradient(135deg, ${accentColor}, #A87D43)`
                    : 'linear-gradient(135deg, #78716C, #57534E)',
                }}
              >
                <Heart className="w-4 h-4 fill-white/80" />
                <span>{attending ? 'Confirm My Attendance' : 'Send My Regrets & Love'}</span>
              </button>
            </form>
          </div>
        ) : (
          /* Confirmation Success State */
          <div className="text-center py-6 animate-fade-in font-montserrat">
            <div
              className="inline-flex items-center justify-center w-16 h-16 rounded-full mb-4 shadow-sm"
              style={{ background: `${accentColor}20` }}
            >
              <CheckCircle2 className="w-8 h-8" style={{ color: accentColor }} />
            </div>

            <div className="flex items-center justify-center gap-1.5 text-xs font-semibold tracking-wider uppercase mb-1" style={{ color: accentColor }}>
              <GoldSparkleIcon color={accentColor} className="w-3.5 h-3.5" />
              <span>{attending ? "You're on the guest list!" : 'Response Recorded'}</span>
            </div>

            <h3 className="font-cormorant text-3xl font-semibold text-stone-800 mb-2">
              Thank you, {name}!
            </h3>

            <p className="text-sm text-stone-600 mb-6 px-4">
              {attending
                ? `We can't wait to celebrate ${babyName}'s Holy Baptism & 1st Birthday with you!`
                : `Thank you for letting us know. You will be warmly in our hearts and prayers!`}
            </p>

            {attending && (
              <div className="p-3 bg-stone-50 rounded-2xl border border-stone-200/80 mb-6 text-xs text-stone-600 text-center">
                <span className="block text-stone-400 text-[11px]">Confirmed Guest</span>
                <span className="font-semibold text-stone-800 text-sm">{name}</span>
              </div>
            )}

            <button
              onClick={onClose}
              className="w-full py-3 px-4 rounded-xl text-xs font-semibold text-stone-700 bg-stone-100 hover:bg-stone-200 transition-colors"
            >
              Close &amp; View Invitation
            </button>
          </div>
        )}
      </div>
    </div>
  );
};
