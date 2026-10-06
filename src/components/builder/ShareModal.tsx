import React, { useState } from 'react';
import { InvitationData } from '../../types/invitation';
import { Check, Copy, Share2, QrCode, X, Printer, ExternalLink, MessageCircle, Send, Globe } from 'lucide-react';

interface ShareModalProps {
  isOpen: boolean;
  onClose: () => void;
  data: InvitationData;
  siteSlug?: string;
  onOpenGuestView?: () => void;
}

export const ShareModal: React.FC<ShareModalProps> = ({
  isOpen,
  onClose,
  data,
  siteSlug,
  onOpenGuestView,
}) => {
  const [copied, setCopied] = useState(false);

  if (!isOpen) return null;

  // Clean guest URL pointing explicitly to ?site=slug&view=guest
  const origin = window.location.origin;
  const pathname = window.location.pathname;
  const guestUrl = siteSlug
    ? `${origin}${pathname}?site=${siteSlug}&view=guest`
    : `${origin}${pathname}?view=guest`;

  const handleCopyLink = () => {
    navigator.clipboard.writeText(guestUrl);
    setCopied(true);
    setTimeout(() => setCopied(false), 2500);
  };

  const handlePrint = () => {
    window.print();
  };

  const shareText = `You are warmly invited to celebrate ${data.babyName}'s Holy Baptism & 1st Birthday! Please view our interactive digital invitation and RSVP here: ${guestUrl}`;

  const handleShareWhatsApp = () => {
    window.open(`https://api.whatsapp.com/send?text=${encodeURIComponent(shareText)}`, '_blank');
  };

  const handleShareGeneral = async () => {
    if (navigator.share) {
      try {
        await navigator.share({
          title: `${data.babyName} - Holy Baptism & 1st Birthday Invitation`,
          text: `You are invited to celebrate ${data.babyName}'s Holy Baptism & 1st Birthday!`,
          url: guestUrl,
        });
      } catch {
        // User cancelled share
      }
    } else {
      handleCopyLink();
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/55 backdrop-blur-sm animate-fade-in font-montserrat">
      <div className="relative w-full max-w-lg bg-white rounded-3xl p-6 sm:p-7 shadow-2xl border border-stone-200 max-h-[92vh] overflow-y-auto">
        <button
          onClick={onClose}
          className="absolute top-4 right-4 p-2 text-stone-400 hover:text-stone-700 rounded-full hover:bg-stone-100 transition-colors"
          aria-label="Close modal"
        >
          <X className="w-5 h-5" />
        </button>

        {/* Header & Live Publish Badge */}
        <div className="text-center mb-6">
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs font-semibold mb-3">
            <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
            <span>Invitation is Published &amp; Live</span>
          </div>

          <h3 className="font-cormorant text-2xl sm:text-3xl font-bold text-stone-800">
            Share Public Guest Invitation
          </h3>
          <p className="text-xs text-stone-500 mt-1">
            Send this public link to your guests, family, and godparents.
          </p>
        </div>

        <div className="space-y-4">
          {/* Public Link Box */}
          <div className="p-4 bg-stone-50 rounded-2xl border border-stone-200/80">
            <div className="flex items-center justify-between mb-1.5">
              <label className="text-xs font-semibold text-stone-700 flex items-center gap-1.5">
                <Globe className="w-3.5 h-3.5 text-stone-500" />
                <span>Public Guest URL</span>
              </label>
              <span className="text-[10px] text-amber-800 font-semibold uppercase tracking-wider">
                Ready to send
              </span>
            </div>

            <div className="flex items-center gap-2">
              <input
                type="text"
                readOnly
                value={guestUrl}
                className="w-full px-3 py-2 text-xs bg-white border border-stone-200 rounded-xl text-stone-700 select-all font-mono shadow-xs truncate"
              />
              <button
                onClick={handleCopyLink}
                className="px-4 py-2 text-xs font-semibold rounded-xl text-white flex items-center gap-1.5 transition-all shadow-sm shrink-0 active:scale-95 cursor-pointer"
                style={{ backgroundColor: data.accentColor }}
              >
                {copied ? <Check className="w-3.5 h-3.5" /> : <Copy className="w-3.5 h-3.5" />}
                <span>{copied ? 'Copied!' : 'Copy Link'}</span>
              </button>
            </div>
          </div>

          {/* Direct Launch Preview Button */}
          {onOpenGuestView && (
            <button
              onClick={() => {
                onClose();
                onOpenGuestView();
              }}
              className="w-full py-3 px-4 rounded-2xl text-xs font-semibold text-stone-800 bg-stone-100 hover:bg-stone-200 border border-stone-200 transition-all flex items-center justify-center gap-2 cursor-pointer"
            >
              <ExternalLink className="w-3.5 h-3.5 text-stone-600" />
              <span>Open Full Public Guest View Now</span>
            </button>
          )}

          {/* Social Quick Share Buttons */}
          <div>
            <span className="block text-xs font-semibold text-stone-700 mb-2">
              Quick Send to Guests
            </span>
            <div className="grid grid-cols-2 gap-2">
              <button
                onClick={handleShareWhatsApp}
                className="py-2.5 px-3 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-semibold flex items-center justify-center gap-2 transition-colors cursor-pointer"
              >
                <MessageCircle className="w-4 h-4" />
                <span>Send via WhatsApp</span>
              </button>

              <button
                onClick={handleShareGeneral}
                className="py-2.5 px-3 rounded-xl bg-stone-800 hover:bg-stone-900 text-white text-xs font-semibold flex items-center justify-center gap-2 transition-colors cursor-pointer"
              >
                <Send className="w-4 h-4" />
                <span>Share via App / SMS</span>
              </button>
            </div>
          </div>

          {/* Scannable QR Code Section */}
          <div className="p-4 bg-stone-50 rounded-2xl border border-stone-200/80 text-center flex flex-col items-center">
            <div className="p-3 bg-white rounded-2xl shadow-xs border border-stone-200 mb-2">
              <svg className="w-28 h-28 text-stone-900" viewBox="0 0 100 100" fill="currentColor">
                <rect x="10" y="10" width="26" height="26" rx="3" fill="#1C1917" />
                <rect x="15" y="15" width="16" height="16" rx="2" fill="white" />
                <rect x="19" y="19" width="8" height="8" rx="1" fill="#1C1917" />
                <rect x="64" y="10" width="26" height="26" rx="3" fill="#1C1917" />
                <rect x="69" y="15" width="16" height="16" rx="2" fill="white" />
                <rect x="73" y="19" width="8" height="8" rx="1" fill="#1C1917" />
                <rect x="10" y="64" width="26" height="26" rx="3" fill="#1C1917" />
                <rect x="15" y="69" width="16" height="16" rx="2" fill="white" />
                <rect x="19" y="73" width="8" height="8" rx="1" fill="#1C1917" />
                <rect x="42" y="14" width="6" height="6" rx="1" fill="#1C1917" />
                <rect x="52" y="14" width="6" height="6" rx="1" fill="#1C1917" />
                <rect x="42" y="24" width="6" height="6" rx="1" fill="#1C1917" />
                <rect x="42" y="44" width="6" height="6" rx="1" fill="#1C1917" />
                <rect x="52" y="44" width="6" height="6" rx="1" fill="#1C1917" />
                <rect x="62" y="44" width="6" height="6" rx="1" fill="#1C1917" />
                <rect x="22" y="44" width="6" height="6" rx="1" fill="#1C1917" />
                <rect x="74" y="54" width="6" height="6" rx="1" fill="#1C1917" />
                <rect x="84" y="64" width="6" height="6" rx="1" fill="#1C1917" />
                <rect x="54" y="74" width="6" height="6" rx="1" fill="#1C1917" />
                <rect x="64" y="84" width="6" height="6" rx="1" fill="#1C1917" />
                <rect x="74" y="74" width="6" height="6" rx="1" fill="#1C1917" />
              </svg>
            </div>
            <span className="text-xs font-semibold text-stone-700 flex items-center gap-1">
              <QrCode className="w-3.5 h-3.5 text-stone-500" />
              Scan QR code on smartphones
            </span>
            <span className="text-[10px] text-stone-400 mt-0.5">
              Ideal for printing on physical keepsake cards and envelopes
            </span>
          </div>

          {/* Action buttons */}
          <div className="grid grid-cols-2 gap-2 pt-1">
            <button
              onClick={handlePrint}
              className="py-2.5 px-4 rounded-xl text-xs font-semibold text-stone-700 bg-stone-100 hover:bg-stone-200 transition-colors flex items-center justify-center gap-1.5 cursor-pointer"
            >
              <Printer className="w-3.5 h-3.5 text-stone-500" />
              <span>Print Keepsake / PDF</span>
            </button>
            <button
              onClick={onClose}
              className="py-2.5 px-4 rounded-xl text-xs font-semibold text-white transition-opacity cursor-pointer"
              style={{ backgroundColor: data.accentColor }}
            >
              Done
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

