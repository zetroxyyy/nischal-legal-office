export type Lang = "ne" | "en";

export interface BilingualPair {
  ne: string;
  en: string;
}

export interface ServiceItem {
  title: BilingualPair;
  desc: BilingualPair;
}

export interface DocGroup {
  title: BilingualPair;
  items: BilingualPair[];
}

export interface GalleryItem {
  image: string;
  caption: BilingualPair;
}

export interface SeedData {
  settings: {
    siteName: BilingualPair;
    siteSub: BilingualPair;
    phone: string;
    mobile: string;
    whatsapp: string;
    email: string;
    esewa: BilingualPair;
    address: BilingualPair;
    landmark: BilingualPair;
    hours: BilingualPair;
    plusCode: string;
    mapLink: string;
    mapEmbed: string;
    announce: BilingualPair & { show: boolean };
    footerNote: BilingualPair;
    seo: {
      title: BilingualPair;
      desc: BilingualPair;
      ogImage: string;
    };
  };
  ui: {
    nav_home: BilingualPair;
    nav_services: BilingualPair;
    nav_contact: BilingualPair;
    call: BilingualPair;
    whatsapp: BilingualPair;
    directions: BilingualPair;
    all_services: BilingualPair;
    more_photos: BilingualPair;
    phone_label: BilingualPair;
    mobile_label: BilingualPair;
    email_label: BilingualPair;
    hours_label: BilingualPair;
    address_label: BilingualPair;
    landmark_label: BilingualPair;
    payment_label: BilingualPair;
    open_map: BilingualPair;
    credit: BilingualPair;
  };
  hero: {
    kicker: BilingualPair;
    title: BilingualPair;
    subtitle: BilingualPair;
    points: BilingualPair[];
    image: string;
    imageCaption: BilingualPair;
  };
  services: {
    heading: BilingualPair;
    intro: BilingualPair;
    items: ServiceItem[];
  };
  docs: {
    heading: BilingualPair;
    intro: BilingualPair;
    groups: DocGroup[];
    note: BilingualPair;
  };
  procedure: {
    heading: BilingualPair;
    intro: BilingualPair;
    items: BilingualPair[];
  };
  about: {
    heading: BilingualPair;
    name: BilingualPair;
    roles: BilingualPair;
    body: BilingualPair;
    photo: string;
    tags: BilingualPair[];
  };
  gallery: {
    heading: BilingualPair;
    items: GalleryItem[];
  };
  contact: {
    heading: BilingualPair;
    intro: BilingualPair;
    formIntro: BilingualPair;
  };
}
