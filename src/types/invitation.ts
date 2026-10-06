export type Gender = 'boy' | 'girl' | 'neutral';

export type FrameShape = 'arch' | 'oval' | 'circle' | 'scalloped' | 'floral';

export type FontHeading = 'cormorant' | 'playfair';
export type FontScript = 'vibes' | 'parisienne';
export type FontBody = 'montserrat' | 'poppins';

export interface Godparent {
  id: string;
  name: string;
  role: 'Godmother' | 'Godfather' | 'Principal Sponsor';
  relationship?: string;
}

export interface TimelineItem {
  id: string;
  time: string;
  title: string;
  subtitle: string;
  icon: 'cross' | 'camera' | 'cake' | 'utensils' | 'heart' | 'gift';
}

export interface GalleryPhoto {
  id: string;
  url: string;
  caption: string;
  ageMonth?: string;
}

export interface GuestRsvp {
  id: string;
  name: string;
  emailOrPhone?: string;
  attending: boolean;
  guestCount: number;
  message?: string;
  dietaryRestrictions?: string;
  submittedAt: string;
}

export interface TemplateStyle {
  id: string;
  name: string;
  description: string;
  previewColor: string;
  genderAffinity: Gender;
  theme: {
    primaryColor: string;
    secondaryColor: string;
    accentColor: string;
    backgroundColor: string;
    cardBgColor: string;
    textColor: string;
    subtextColor: string;
    frameShape: FrameShape;
    fontHeading: FontHeading;
    fontScript: FontScript;
    fontBody: FontBody;
  };
}

export interface PublicSite {
  id: string;
  slug: string;
  title: string;
  isPublished: boolean;
  publishedAt?: string;
  createdAt: string;
  viewCount: number;
  allowGuestRsvp: boolean;
  passwordProtected?: boolean;
  password?: string;
  data: InvitationData;
  rsvps: GuestRsvp[];
}

export interface InvitationData {
  // Baby details
  babyName: string;
  babyNickname: string;
  gender: Gender;
  babyPhotoUrl: string;
  coverKicker: string;
  milestoneTitle: string;
  introHeading: string;
  introText: string;

  // Baptism
  baptismDate: string;
  baptismTime: string;
  baptismChurch: string;
  baptismAddress: string;
  baptismMapsUrl: string;
  baptismNotes: string;

  // Birthday Reception
  birthdayDate: string;
  birthdayTime: string;
  birthdayVenue: string;
  birthdayAddress: string;
  birthdayMapsUrl: string;
  birthdayNotes: string;

  // Countdown
  countdownTarget: string; // ISO date-time string e.g. 2026-12-13T10:00:00

  // Parents
  fatherName: string;
  motherName: string;
  parentsMessage: string;

  // Godparents
  godparentsHeading: string;
  godparentsSubheading: string;
  godparents: Godparent[];

  // Bible Verse
  verseText: string;
  verseCitation: string;

  // Birthday section
  birthdayHeading: string;
  birthdaySubheading: string;

  // Photo Gallery
  galleryTitle: string;
  gallerySubtitle: string;
  photos: GalleryPhoto[];

  // Timeline
  timelineItems: TimelineItem[];

  // RSVP settings
  rsvpDeadline: string;
  rsvpNote: string;
  contactNumber: string;

  // Closing
  closingHeading: string;
  closingMessage: string;
  closingSignature: string;

  // Design & Theme
  templateId: string;
  frameShape: FrameShape;
  fontHeading: FontHeading;
  fontScript: FontScript;
  fontBody: FontBody;
  primaryColor: string;
  secondaryColor: string;
  accentColor: string;
  backgroundColor: string;
  cardBgColor: string;
  textColor: string;
  subtextColor: string;

  // Visual effects
  showFloatingPetals: boolean;
  showSparkles: boolean;
  musicEnabled: boolean;
  musicTheme: 'lullaby-harp' | 'celesta-bells' | 'peaceful-piano';
}
