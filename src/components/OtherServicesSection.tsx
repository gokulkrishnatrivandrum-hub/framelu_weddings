'use client';

import React, { useState } from 'react';
import { OtherServicePackage, StudioContactConfig } from '@/types';
import {
  Sparkles,
  Palette,
  Shirt,
  Mail,
  Car,
  Compass,
  Check,
  PhoneCall,
  MessageCircle,
} from 'lucide-react';

export const OTHER_PACKAGES: OtherServicePackage[] = [
  // 1. Event Planning & Stage Decor
  {
    id: 'decor_royal',
    category: 'event_planning',
    title: 'Royal Floral Stage Decor',
    titleMl: 'റോയൽ ഫ്ലോറൽ സ്റ്റേജ് ഡെക്കോർ',
    description: 'Fresh exotic flower arrangements, royal backdrop lighting, elegant bride & groom walkway arch with fairy lights.',
    price: 65000,
    features: ['Exotic Dutch Roses & Orchids', 'LED Par Cans & Ambient Focus Lighting', 'Grand Entry Archway', 'Sofa & Stage Furniture'],
    imageUrl: 'https://images.unsplash.com/photo-1519741497674-611481863552?auto=format&fit=crop&w=600&q=80',
    badge: 'Popular Decor',
  },
  {
    id: 'decor_minimal',
    category: 'event_planning',
    title: 'Modern Minimalist Pastel Setup',
    titleMl: 'മോഡേൺ മിനിമലിസ്റ്റ് പാസ്റ്റൽ തീം',
    description: 'Chic geometric metal frames with soft pastel floral accents, warm bulb chandeliers, subtle aesthetic vibe.',
    price: 45000,
    features: ['Pastel Roses & Gypsophila', 'Edison Bulb Hanging Fixtures', 'Custom Couple Monogram Neon Sign', 'Photo Booth Selfie Corner'],
    imageUrl: 'https://images.unsplash.com/photo-1511285560929-80b456fea0bc?auto=format&fit=crop&w=600&q=80',
  },

  // 2. Makeup & Styling
  {
    id: 'makeup_airbrush',
    category: 'makeup',
    title: 'Bridal HD Airbrush Makeup Suite',
    titleMl: 'ബ്രൈഡൽ HD എയർബ്രഷ് മേക്കപ്പ് പാക്കേജ്',
    description: '18-hour waterproof, sweat-resistant luxury airbrush makeup by senior makeup artist, designer hair styling, saree draping.',
    price: 25000,
    features: ['MAC & Temptu Airbrush Base', 'Intricate Bridal Hair Styling & Flowers', 'Jewelry & Saree Draping Assistance', 'Complimentary Touch-up Kit'],
    imageUrl: 'https://images.unsplash.com/photo-1487412720507-e7ab37603c6f?auto=format&fit=crop&w=600&q=80',
    badge: 'Trending',
  },
  {
    id: 'makeup_groom',
    category: 'makeup',
    title: 'Groom Grooming & Hair Styling',
    titleMl: 'ഗ്രൂം സ്പെഷ്യൽ ഗ്രൂമിംഗ് & സ്റ്റൈലിംഗ്',
    description: 'Hydra facial treatment, professional beard grooming, tailored hair styling and natural camera-ready matte touch-up.',
    price: 8500,
    features: ['Pre-wedding Hydra Glow Facial', 'Beard Styling & Shave', 'Hair Styling & Setting', 'Camera Matte Touch-up'],
    imageUrl: 'https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?auto=format&fit=crop&w=600&q=80',
  },

  // 3. Luxury Cars
  {
    id: 'car_bmw',
    category: 'luxury_cars',
    title: 'BMW 5-Series / Audi A6 Luxury Sedan',
    titleMl: 'BMW 5-സീരീസ് / Audi A6 ലക്ഷ്വറി കാർ',
    description: 'Pristine white luxury bridal entry car with chauffeur in uniform, fuel, and premium floral hood decorations.',
    price: 18000,
    features: ['100 KM / 8 Hours Included', 'Uniformed Experienced Chauffeur', 'Fresh Floral Hood & Door Ribbon Decor', 'Full AC & Refreshment Amenities'],
    imageUrl: 'https://images.unsplash.com/photo-1555215695-3004980ad54e?auto=format&fit=crop&w=600&q=80',
    badge: 'VIP Ride',
  },
  {
    id: 'car_vintage',
    category: 'luxury_cars',
    title: 'Vintage Open-Top Convertible',
    titleMl: 'വിന്റേജ് ഓപ്പൺ-ടോപ്പ് ക്ലാസിക് കാർ',
    description: 'Retro classic convertible car for dramatic royal bride & groom entry photoshoot and grand procession.',
    price: 26000,
    features: ['Classic Convertible Vintage Car', 'Ideal for Cinematic Drone Entry', 'Custom Ribbon & Flower Wreath', 'Event Photo-op Support'],
    imageUrl: 'https://images.unsplash.com/photo-1502877338535-766e1452684a?auto=format&fit=crop&w=600&q=80',
  },

  // 4. Wedding Cards
  {
    id: 'card_digital',
    category: 'invitations',
    title: 'Animated 3D Digital Video Card & Website',
    titleMl: 'ആനിമേറ്റഡ് 3D ഡിജിറ്റൽ ഇൻവിറ്റേഷൻ & വെബ്സൈറ്റ്',
    description: 'Personalized WhatsApp video invitation with couple caricature, countdown timer wedding website with RSVP tracking.',
    price: 6500,
    features: ['Custom Animated 3D Story Video', 'Mobile Friendly Wedding Webpage', 'Google Maps Venue Integration', 'WhatsApp RSVP Manager'],
    imageUrl: 'https://images.unsplash.com/photo-1510074377623-8cf13fb86c08?auto=format&fit=crop&w=600&q=80',
  },

  // 5. Honeymoon Packages
  {
    id: 'honey_kashmir',
    category: 'honeymoon',
    title: 'Kashmir Romantic Paradise Tour (5D/4N)',
    titleMl: 'കാശ്മീർ റൊമാന്റിക് ടൂർ പാക്കേജ് (5 ദിവസം)',
    description: 'Srinagar Dal Lake luxury houseboat stay, Gulmarg snow gondola ride, Pahalgam valleys, private cab with honeymoon decor.',
    price: 48000,
    features: ['Dal Lake Houseboat with Candlelight Dinner', 'Gulmarg & Pahalgam Sightseeing', 'Private Sedan Cab throughout', '4-Star Luxury Resort Stay'],
    imageUrl: 'https://images.unsplash.com/photo-1595815771614-ade9d652a65d?auto=format&fit=crop&w=600&q=80',
    badge: 'Best Seller',
  },
  {
    id: 'honey_bali',
    category: 'honeymoon',
    title: 'Bali Tropical Island Escape (6D/5N)',
    titleMl: 'ബാലി ഐലൻഡ് ഹണിമൂൺ പാക്കേജ് (6 ദിവസം)',
    description: 'Private pool villa in Ubud & Seminyak, floating breakfast, Nusa Penida island speedboat tour, sunset dinner cruise.',
    price: 88000,
    features: ['Private Pool Luxury Villa', 'Floating Flower Breakfast', 'Nusa Penida & Kelingking Beach Tour', 'Couples Traditional Balinese Spa'],
    imageUrl: 'https://images.unsplash.com/photo-1537996194471-e657df975ab4?auto=format&fit=crop&w=600&q=80',
  },
];

interface OtherServicesSectionProps {
  language?: 'en' | 'ml';
  studioContact?: StudioContactConfig;
}

export const OtherServicesSection: React.FC<OtherServicesSectionProps> = ({
  language = 'ml',
  studioContact = { whatsapp: '919876543210' } as StudioContactConfig,
}) => {
  const isMl = language === 'ml';
  const [selectedCategory, setSelectedCategory] = useState<string>('all');

  const categories = [
    { id: 'all', name: isMl ? 'എല്ലാം (All)' : 'All Services' },
    { id: 'event_planning', name: isMl ? 'സ്റ്റേജ് ഡെക്കോർ (Stage Decor)' : 'Stage Decor & Styling' },
    { id: 'makeup', name: isMl ? 'മേക്കപ്പ് & ഗ്രൂമിംഗ് (Makeup)' : 'Bridal Makeup & Grooming' },
    { id: 'luxury_cars', name: isMl ? 'ലക്ഷ്വറി കാറുകൾ (Luxury Cars)' : 'Luxury Rental Cars' },
    { id: 'invitations', name: isMl ? 'ഇൻവിറ്റേഷൻ കാർഡുകൾ (Cards)' : 'Wedding Invitations' },
    { id: 'honeymoon', name: isMl ? 'ഹണിമൂൺ ടൂർസ് (Honeymoon)' : 'Honeymoon Packages' },
  ];

  const filtered =
    selectedCategory === 'all'
      ? OTHER_PACKAGES
      : OTHER_PACKAGES.filter((p) => p.category === selectedCategory);

  return (
    <div className="max-w-7xl mx-auto px-4 py-8">
      <div className="text-center max-w-3xl mx-auto mb-8">
        <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider bg-rosewood-100 text-rosewood-800 mb-2">
          Full Wedding Solutions
        </span>
        <h2 className="text-3xl sm:text-4xl font-extrabold text-stone-900 tracking-tight">
          {isMl ? 'മറ്റ് പ്രീമിയം വെഡ്ഡിംഗ് സർവീസുകൾ' : 'Complete Wedding Services'}
        </h2>
        <p className="text-stone-600 text-xs sm:text-sm mt-2">
          {isMl
            ? 'ഫോട്ടോഗ്രാഫിക്ക് പുറമെ സ്റ്റേജ് ഡെക്കോർ, ബ്രൈഡൽ മേക്കപ്പ്, ലക്ഷ്വറി കാറുകൾ, ഹണിമൂൺ എന്നിവയുടെ ഏറ്റവും പുതിയ പാക്കേജുകൾ'
            : 'Explore complete wedding solutions including stage decor, bridal makeup, luxury bridal entry cars and curated honeymoons'}
        </p>
      </div>

      {/* Category Filter Pills */}
      <div className="flex flex-wrap items-center justify-center gap-2 mb-8">
        {categories.map((c) => (
          <button
            key={c.id}
            onClick={() => setSelectedCategory(c.id)}
            className={`px-4 py-2 rounded-xl text-xs sm:text-sm font-bold transition shadow-xs ${
              selectedCategory === c.id
                ? 'bg-rosewood-600 text-white shadow-md'
                : 'bg-white border border-stone-200 text-stone-700 hover:bg-stone-50'
            }`}
          >
            {c.name}
          </button>
        ))}
      </div>

      {/* Package Cards Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filtered.map((pkg) => (
          <div
            key={pkg.id}
            className="bg-white rounded-2xl border border-stone-200 overflow-hidden shadow-sm hover:shadow-md transition flex flex-col justify-between"
          >
            <div>
              <div className="relative h-48 w-full overflow-hidden bg-stone-100">
                <img
                  src={pkg.imageUrl}
                  alt={pkg.title}
                  className="w-full h-full object-cover hover:scale-105 transition duration-500"
                />
                {pkg.badge && (
                  <span className="absolute top-3 right-3 bg-amber-500 text-stone-900 text-[10px] font-black uppercase tracking-wider px-2.5 py-1 rounded-full shadow-sm">
                    {pkg.badge}
                  </span>
                )}
              </div>

              <div className="p-5">
                <h3 className="text-lg font-bold text-stone-900">{pkg.titleMl}</h3>
                <p className="text-xs font-semibold text-rosewood-700 mb-2">{pkg.title}</p>
                <p className="text-xs text-stone-600 line-clamp-2 leading-relaxed mb-4">
                  {pkg.description}
                </p>

                {/* Features List */}
                <ul className="space-y-1.5 text-xs text-stone-600 mb-4">
                  {pkg.features.map((feat, i) => (
                    <li key={i} className="flex items-center gap-2">
                      <Check className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
                      <span>{feat}</span>
                    </li>
                  ))}
                </ul>
              </div>
            </div>

            <div className="p-5 pt-0">
              <div className="pt-3 border-t border-stone-100 flex items-center justify-between">
                <div>
                  <span className="text-[10px] text-stone-400 font-bold block uppercase">
                    Starting from
                  </span>
                  <span className="text-lg font-extrabold text-stone-900">
                    ₹{pkg.price.toLocaleString('en-IN')}
                  </span>
                </div>

                <a
                  href={`https://wa.me/${studioContact.whatsapp || '919876543210'}?text=${encodeURIComponent(
                    `Hello Framelu Weddings, I am interested in ${pkg.title} (₹${pkg.price.toLocaleString('en-IN')}).`
                  )}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center gap-1.5 bg-rosewood-50 hover:bg-rosewood-100 text-rosewood-700 border border-rosewood-200 font-bold text-xs py-2 px-3 rounded-xl transition"
                >
                  <MessageCircle className="w-3.5 h-3.5 text-rosewood-600" />
                  <span>{isMl ? 'എൻക്വയറി' : 'Enquiry'}</span>
                </a>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};
