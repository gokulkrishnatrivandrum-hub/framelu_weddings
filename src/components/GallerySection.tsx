'use client';

import React, { useState } from 'react';
import { GalleryProject, StudioContactConfig, ServiceCategory } from '@/types';
import { DEFAULT_GALLERY_PROJECTS, DEFAULT_SERVICE_CATEGORIES } from '@/constants/defaults';
import {
  Sparkles,
  MapPin,
  Star,
  Users,
  Eye,
  X,
  MessageCircle,
  Calendar,
  Filter,
  Search,
  CheckCircle2,
  Heart,
  Camera,
  UtensilsCrossed,
  ArrowRight,
  ChevronLeft,
  ChevronRight,
  ExternalLink,
} from 'lucide-react';

interface GallerySectionProps {
  language?: 'en' | 'ml';
  projects?: GalleryProject[];
  categories?: ServiceCategory[];
  studioContact?: StudioContactConfig;
  onNavigateToCustomizer?: () => void;
}

export const GallerySection: React.FC<GallerySectionProps> = ({
  language = 'ml',
  projects = DEFAULT_GALLERY_PROJECTS,
  categories = DEFAULT_SERVICE_CATEGORIES,
  studioContact,
  onNavigateToCustomizer,
}) => {
  const isMl = language === 'ml';

  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [activeModalProject, setActiveModalProject] = useState<GalleryProject | null>(null);
  const [activeImageIndex, setActiveImageIndex] = useState<number>(0);

  const allProjects = projects && projects.length > 0 ? projects : DEFAULT_GALLERY_PROJECTS;

  // Filter projects by category and search
  const filteredProjects = allProjects.filter((proj) => {
    const matchesCategory =
      selectedCategory === 'all' ||
      proj.category === selectedCategory ||
      (selectedCategory === 'photography' && !proj.category);

    const q = searchQuery.toLowerCase().trim();
    const matchesSearch =
      !q ||
      proj.title.toLowerCase().includes(q) ||
      proj.titleMl.toLowerCase().includes(q) ||
      proj.clientName.toLowerCase().includes(q) ||
      proj.venueLocation.toLowerCase().includes(q) ||
      (proj.description && proj.description.toLowerCase().includes(q));

    return matchesCategory && matchesSearch;
  });

  const getCategoryName = (catId: string) => {
    if (catId === 'all') return isMl ? 'എല്ലാ വർക്കുകളും' : 'All Projects';
    if (catId === 'photography') return isMl ? 'ഫോട്ടോഗ്രാഫി' : 'Photography';
    const found = categories.find((c) => c.id === catId);
    if (found) return isMl ? found.nameMl : found.name;
    return catId;
  };

  const openLightbox = (proj: GalleryProject) => {
    setActiveModalProject(proj);
    setActiveImageIndex(0);
  };

  const closeLightbox = () => {
    setActiveModalProject(null);
  };

  return (
    <div className="max-w-7xl mx-auto px-4 py-8 animate-fade-in text-stone-900">
      {/* Header Banner */}
      <div className="text-center max-w-3xl mx-auto mb-10">
        <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-black uppercase tracking-wider bg-amber-500/15 text-amber-900 border border-amber-300 mb-3 shadow-2xs">
          <Sparkles className="w-3.5 h-3.5 text-amber-600" />
          <span>{isMl ? 'യഥാർത്ഥ വിവാഹ വർക്കുകൾ & കസ്റ്റമർ റിവ്യൂസ്' : 'Real Wedding Works & Client Reviews'}</span>
        </div>

        <h1 className="text-3xl sm:text-5xl font-black text-stone-900 tracking-tight leading-tight">
          {isMl ? 'ഞങ്ങൾ ചെയ്ത മനോഹരമായ വർക്കുകൾ' : 'Showcase of Our Signature Celebrations'}
        </h1>

        <p className="text-stone-600 text-xs sm:text-base mt-3 leading-relaxed">
          {isMl
            ? 'ഫ്രെയിം ലൂ വെഡ്ഡിംഗ് കമ്പനി കേരളത്തിലെ പ്രമുഖ വെന്യൂകളിൽ വിജയകരമായി പൂർത്തിയാക്കിയ വിവാഹ ഫോട്ടോഗ്രാഫി, സദ്യ, സ്റ്റേജ് ഡെക്കോർ, മേക്കപ്പ് വർക്കുകളും സന്തുഷ്ടരായ വധൂവരന്മാരുടെ അനുഭവങ്ങളും കാണൂ.'
            : 'Explore our completed wedding cinematography, traditional feasts, grand stage decors, and bridal styling along with genuine verified client reviews.'}
        </p>
      </div>

      {/* Filter and Search Bar */}
      <div className="mb-8 flex flex-col md:flex-row items-stretch md:items-center justify-between gap-4 p-3 bg-white rounded-3xl border border-stone-200 shadow-sm">
        {/* Category Pills Slider */}
        <div className="flex items-center gap-2 overflow-x-auto pb-1 md:pb-0 scrollbar-none">
          <button
            type="button"
            onClick={() => setSelectedCategory('all')}
            className={`shrink-0 px-4 py-2 rounded-2xl text-xs font-black transition cursor-pointer ${
              selectedCategory === 'all'
                ? 'bg-amber-600 text-white shadow-xs'
                : 'bg-stone-100 text-stone-700 hover:bg-stone-200'
            }`}
          >
            {isMl ? `എല്ലാം (${allProjects.length})` : `All (${allProjects.length})`}
          </button>

          <button
            type="button"
            onClick={() => setSelectedCategory('photography')}
            className={`shrink-0 flex items-center gap-1.5 px-4 py-2 rounded-2xl text-xs font-black transition cursor-pointer ${
              selectedCategory === 'photography'
                ? 'bg-amber-600 text-white shadow-xs'
                : 'bg-stone-100 text-stone-700 hover:bg-stone-200'
            }`}
          >
            <Camera className="w-3.5 h-3.5" />
            <span>{isMl ? 'ഫോട്ടോഗ്രാഫി' : 'Photography'}</span>
          </button>

          {categories.map((cat) => (
            <button
              key={cat.id}
              type="button"
              onClick={() => setSelectedCategory(cat.id)}
              className={`shrink-0 px-4 py-2 rounded-2xl text-xs font-black transition cursor-pointer ${
                selectedCategory === cat.id
                  ? 'bg-amber-600 text-white shadow-xs'
                  : 'bg-stone-100 text-stone-700 hover:bg-stone-200'
              }`}
            >
              <span>{isMl ? cat.nameMl : cat.name}</span>
            </button>
          ))}
        </div>

        {/* Search by location or client name */}
        <div className="relative shrink-0 md:w-72">
          <Search className="w-4 h-4 text-stone-400 absolute left-3.5 top-3" />
          <input
            type="text"
            placeholder={isMl ? 'സ്ഥലം അല്ലെങ്കിൽ കസ്റ്റമർ പേര്...' : 'Search venue or couple...'}
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-10 pr-4 py-2 rounded-2xl border border-stone-250 text-xs font-medium text-stone-800 bg-stone-50 focus:bg-white focus:outline-none focus:ring-2 focus:ring-amber-500"
          />
          {searchQuery && (
            <button
              type="button"
              onClick={() => setSearchQuery('')}
              className="absolute right-3 top-2.5 text-stone-400 hover:text-stone-700 text-xs"
            >
              <X className="w-3.5 h-3.5" />
            </button>
          )}
        </div>
      </div>

      {/* Projects Grid */}
      {filteredProjects.length === 0 ? (
        <div className="text-center py-16 bg-white rounded-3xl border border-stone-200 p-8 shadow-xs">
          <Camera className="w-12 h-12 text-stone-300 mx-auto mb-3" />
          <h3 className="text-base font-bold text-stone-800">
            {isMl ? 'ഈ കാറ്റഗറിയിൽ പ്രോജക്റ്റുകൾ ഒന്നും കണ്ടെത്തിയില്ല' : 'No projects found in this category'}
          </h3>
          <p className="text-xs text-stone-500 mt-1">
            {isMl ? 'മറ്റൊരു കാറ്റഗറി തിരഞ്ഞെടുക്കുകയോ സെർച്ച് മാറ്റുകയോ ചെയ്യുക' : 'Try selecting another category or clear search query.'}
          </p>
          <button
            type="button"
            onClick={() => {
              setSelectedCategory('all');
              setSearchQuery('');
            }}
            className="mt-4 px-4 py-2 rounded-xl bg-amber-600 text-white text-xs font-bold shadow-xs hover:bg-amber-700"
          >
            {isMl ? 'എല്ലാ പ്രോജക്റ്റുകളും കാണുക' : 'Show All Projects'}
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-7">
          {filteredProjects.map((project) => {
            const allImages = [
              project.coverImage,
              ...(project.galleryImages || []).filter((img) => img !== project.coverImage),
            ].filter(Boolean);

            return (
              <div
                key={project.id}
                className="group bg-white rounded-3xl border border-stone-200/90 overflow-hidden shadow-sm hover:shadow-xl hover:border-amber-400 transition-all duration-300 flex flex-col justify-between"
              >
                <div>
                  {/* Photo Thumbnail with Badges */}
                  <div
                    onClick={() => openLightbox(project)}
                    className="relative h-60 w-full overflow-hidden bg-stone-100 cursor-pointer"
                  >
                    <img
                      src={project.coverImage}
                      alt={project.title}
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                      onError={(e) => {
                        (e.currentTarget as HTMLImageElement).src =
                          'https://images.unsplash.com/photo-1519741497674-611481863552?auto=format&fit=crop&w=800&q=80';
                      }}
                    />

                    {/* Gradient Overlay */}
                    <div className="absolute inset-0 bg-gradient-to-t from-stone-950/80 via-transparent to-black/20" />

                    {/* Category Badge Top Left */}
                    <span className="absolute top-3 left-3 bg-stone-900/80 backdrop-blur-md text-amber-300 text-[10px] font-black uppercase tracking-wider px-2.5 py-1 rounded-xl shadow-xs border border-white/10">
                      {getCategoryName(project.category)}
                    </span>

                    {/* Photos Count Top Right */}
                    {allImages.length > 1 && (
                      <span className="absolute top-3 right-3 bg-black/60 backdrop-blur-md text-white text-[10px] font-bold px-2.5 py-1 rounded-xl flex items-center gap-1 shadow-xs border border-white/10">
                        <Camera className="w-3 h-3 text-amber-300" />
                        <span>{allImages.length} Photos</span>
                      </span>
                    )}

                    {/* Bottom Info on Image: Client & Location */}
                    <div className="absolute bottom-3 left-3 right-3 text-white">
                      <div className="flex items-center gap-1.5 text-xs font-black drop-shadow-md">
                        <Users className="w-3.5 h-3.5 text-amber-400 shrink-0" />
                        <span className="truncate">{project.clientName}</span>
                      </div>
                      <div className="flex items-center gap-1 text-[11px] text-amber-100/90 font-medium mt-0.5 truncate drop-shadow-sm">
                        <MapPin className="w-3 h-3 text-rose-400 shrink-0" />
                        <span className="truncate">{project.venueLocation}</span>
                      </div>
                    </div>
                  </div>

                  {/* Card Body */}
                  <div className="p-5">
                    {/* Project Title */}
                    <h3 className="font-black text-base text-stone-900 leading-snug line-clamp-1 group-hover:text-amber-800 transition">
                      {isMl && project.titleMl ? project.titleMl : project.title}
                    </h3>
                    {project.titleMl && !isMl && (
                      <p className="text-[11px] text-stone-500 font-medium truncate mt-0.5">
                        {project.titleMl}
                      </p>
                    )}

                    {project.description && (
                      <p className="text-xs text-stone-600 line-clamp-2 mt-2 leading-relaxed">
                        {isMl && project.descriptionMl ? project.descriptionMl : project.description}
                      </p>
                    )}

                    {/* CUSTOMER REVIEW SECTION (Requirement 1 & 2) */}
                    {project.clientReview && (
                      <div className="mt-4 p-3.5 bg-gradient-to-br from-amber-50/70 via-stone-50 to-amber-50/30 rounded-2xl border border-amber-200/80 shadow-2xs">
                        <div className="flex items-center justify-between mb-1.5">
                          {/* 5 Star Rating */}
                          <div className="flex items-center gap-0.5">
                            {[...Array(5)].map((_, i) => (
                              <Star
                                key={i}
                                className={`w-3.5 h-3.5 ${
                                  i < (project.clientReview?.rating || 5)
                                    ? 'text-amber-500 fill-amber-500'
                                    : 'text-stone-300'
                                }`}
                              />
                            ))}
                            <span className="text-[10px] font-black text-amber-900 ml-1">
                              {project.clientReview.rating}.0
                            </span>
                          </div>

                          <span className="inline-flex items-center gap-1 text-[9px] font-bold text-emerald-800 bg-emerald-100/80 px-2 py-0.5 rounded-full border border-emerald-200">
                            <CheckCircle2 className="w-2.5 h-2.5" />
                            {isMl ? 'വെരിഫൈഡ് റിവ്യൂ' : 'Verified Client'}
                          </span>
                        </div>

                        <p className="text-xs text-stone-700 italic line-clamp-3 leading-relaxed font-serif">
                          &ldquo;{isMl && project.clientReview.commentMl ? project.clientReview.commentMl : project.clientReview.comment}&rdquo;
                        </p>

                        <div className="mt-2 pt-2 border-t border-amber-200/60 flex items-center justify-between text-[10px] text-stone-500">
                          <span className="font-bold text-stone-800">
                            — {project.clientReview.reviewerName}
                          </span>
                          {project.eventDate && <span>{project.eventDate}</span>}
                        </div>
                      </div>
                    )}
                  </div>
                </div>

                {/* Card Action Footer */}
                <div className="p-5 pt-0 flex items-center gap-2">
                  <button
                    type="button"
                    onClick={() => openLightbox(project)}
                    className="flex-1 py-2.5 px-3 rounded-xl bg-stone-100 hover:bg-amber-100 text-stone-800 hover:text-amber-900 font-bold text-xs flex items-center justify-center gap-1.5 transition cursor-pointer"
                  >
                    <Eye className="w-3.5 h-3.5" />
                    <span>{isMl ? 'പടങ്ങളും വിവരങ്ങളും' : 'View Photos & Story'}</span>
                  </button>

                  <a
                    href={`https://wa.me/${studioContact?.whatsapp || '916238747722'}?text=${encodeURIComponent(
                      `Hello Framelu Weddings, I saw your work "${project.title}" (${project.venueLocation}) on your gallery. I would like to enquire about a similar package.`
                    )}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="p-2.5 rounded-xl bg-emerald-50 hover:bg-emerald-100 text-emerald-700 transition"
                    title="Enquire on WhatsApp"
                  >
                    <MessageCircle className="w-4 h-4" />
                  </a>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* LIGHTBOX / PROJECT DETAILS MODAL */}
      {activeModalProject && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-2 sm:p-4 bg-black/85 backdrop-blur-md overflow-y-auto animate-fade-in">
          <div className="bg-white rounded-3xl max-w-4xl w-full p-5 sm:p-7 shadow-2xl relative border border-stone-200 my-4 max-h-[92vh] overflow-y-auto">
            {/* Modal Close Button */}
            <button
              type="button"
              onClick={closeLightbox}
              className="absolute top-4 right-4 w-9 h-9 rounded-full bg-stone-100 hover:bg-stone-200 text-stone-700 flex items-center justify-center transition cursor-pointer z-10"
            >
              <X className="w-5 h-5" />
            </button>

            {/* Modal Header */}
            <div className="pr-10 mb-5">
              <span className="text-[10px] font-black uppercase tracking-wider text-amber-900 bg-amber-100 border border-amber-300 px-2.5 py-0.5 rounded-full inline-block mb-1.5">
                {getCategoryName(activeModalProject.category)}
              </span>
              <h2 className="text-xl sm:text-2xl font-black text-stone-900 leading-snug">
                {isMl && activeModalProject.titleMl ? activeModalProject.titleMl : activeModalProject.title}
              </h2>
              <div className="flex flex-wrap items-center gap-3 text-xs text-stone-600 mt-2">
                <span className="flex items-center gap-1 font-bold text-stone-900">
                  <Users className="w-3.5 h-3.5 text-amber-600" />
                  <span>{activeModalProject.clientName}</span>
                </span>
                <span>•</span>
                <span className="flex items-center gap-1">
                  <MapPin className="w-3.5 h-3.5 text-rose-500" />
                  <span>{activeModalProject.venueLocation}</span>
                </span>
                {activeModalProject.eventDate && (
                  <>
                    <span>•</span>
                    <span className="flex items-center gap-1">
                      <Calendar className="w-3.5 h-3.5 text-amber-600" />
                      <span>{activeModalProject.eventDate}</span>
                    </span>
                  </>
                )}
              </div>
            </div>

            {/* Modal Image Gallery Showcase */}
            {(() => {
              const images = [
                activeModalProject.coverImage,
                ...(activeModalProject.galleryImages || []).filter((img) => img !== activeModalProject.coverImage),
              ].filter(Boolean);

              const currentImg = images[activeImageIndex] || activeModalProject.coverImage;

              return (
                <div className="space-y-3 mb-6">
                  {/* Main Large Image */}
                  <div className="relative h-72 sm:h-96 w-full rounded-2xl overflow-hidden bg-stone-950 flex items-center justify-center">
                    <img
                      src={currentImg}
                      alt={activeModalProject.title}
                      className="max-h-full max-w-full object-contain"
                    />

                    {/* Prev/Next buttons if multiple images */}
                    {images.length > 1 && (
                      <>
                        <button
                          type="button"
                          onClick={() =>
                            setActiveImageIndex((prev) => (prev > 0 ? prev - 1 : images.length - 1))
                          }
                          className="absolute left-3 top-1/2 -translate-y-1/2 w-9 h-9 rounded-full bg-black/60 hover:bg-black/90 text-white flex items-center justify-center transition cursor-pointer"
                        >
                          <ChevronLeft className="w-5 h-5" />
                        </button>
                        <button
                          type="button"
                          onClick={() =>
                            setActiveImageIndex((prev) => (prev < images.length - 1 ? prev + 1 : 0))
                          }
                          className="absolute right-3 top-1/2 -translate-y-1/2 w-9 h-9 rounded-full bg-black/60 hover:bg-black/90 text-white flex items-center justify-center transition cursor-pointer"
                        >
                          <ChevronRight className="w-5 h-5" />
                        </button>
                      </>
                    )}

                    <span className="absolute bottom-3 right-3 bg-black/60 backdrop-blur-md text-white text-[10px] font-bold px-2.5 py-1 rounded-full">
                      {activeImageIndex + 1} / {images.length}
                    </span>
                  </div>

                  {/* Thumbnail Row */}
                  {images.length > 1 && (
                    <div className="flex items-center gap-2 overflow-x-auto pb-1 scrollbar-none">
                      {images.map((img, idx) => (
                        <button
                          key={idx}
                          type="button"
                          onClick={() => setActiveImageIndex(idx)}
                          className={`relative w-20 h-16 rounded-xl overflow-hidden shrink-0 border-2 transition cursor-pointer ${
                            activeImageIndex === idx
                              ? 'border-amber-600 ring-2 ring-amber-400/40'
                              : 'border-transparent opacity-70 hover:opacity-100'
                          }`}
                        >
                          <img src={img} alt="Thumb" className="w-full h-full object-cover" />
                        </button>
                      ))}
                    </div>
                  )}
                </div>
              );
            })()}

            {/* Project Story & Customer Review in Modal */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-5 mb-6">
              {/* Left: Project Story */}
              <div className="space-y-2">
                <h4 className="text-xs font-black uppercase tracking-wider text-amber-900">
                  {isMl ? 'പ്രോജക്റ്റ് വിവരണം (Project Story)' : 'About This Project'}
                </h4>
                <p className="text-xs sm:text-sm text-stone-700 leading-relaxed font-normal">
                  {isMl && activeModalProject.descriptionMl
                    ? activeModalProject.descriptionMl
                    : activeModalProject.description ||
                      'Signature luxury wedding arrangements organized and captured by Framelu Wedding Company.'}
                </p>

                <div className="pt-2 text-xs text-stone-600 space-y-1">
                  <div>
                    <strong className="text-stone-900">{isMl ? 'വെന്യൂ / സ്ഥലം:' : 'Venue Location:'}</strong>{' '}
                    {activeModalProject.venueLocation}
                  </div>
                  <div>
                    <strong className="text-stone-900">{isMl ? 'ക്ലയന്റ്:' : 'Client:'}</strong>{' '}
                    {activeModalProject.clientName}
                  </div>
                </div>
              </div>

              {/* Right: Customer Review Quote Box */}
              {activeModalProject.clientReview && (
                <div className="p-4 bg-gradient-to-br from-amber-500/10 via-amber-50/50 to-white rounded-2xl border border-amber-300 shadow-sm">
                  <div className="flex items-center justify-between mb-2">
                    <div className="flex items-center gap-1">
                      {[...Array(5)].map((_, i) => (
                        <Star
                          key={i}
                          className={`w-4 h-4 ${
                            i < (activeModalProject.clientReview?.rating || 5)
                              ? 'text-amber-500 fill-amber-500'
                              : 'text-stone-300'
                          }`}
                        />
                      ))}
                    </div>
                    <span className="text-xs font-black text-amber-900">
                      {activeModalProject.clientReview.rating}.0 / 5.0
                    </span>
                  </div>

                  <p className="text-xs sm:text-sm text-stone-800 italic font-serif leading-relaxed">
                    &ldquo;
                    {isMl && activeModalProject.clientReview.commentMl
                      ? activeModalProject.clientReview.commentMl
                      : activeModalProject.clientReview.comment}
                    &rdquo;
                  </p>

                  <div className="mt-3 pt-2.5 border-t border-amber-200 flex items-center justify-between text-xs">
                    <span className="font-extrabold text-stone-900">
                      {activeModalProject.clientReview.reviewerName}
                    </span>
                    <span className="text-[10px] text-stone-500">
                      {activeModalProject.clientReview.date || activeModalProject.eventDate}
                    </span>
                  </div>
                </div>
              )}
            </div>

            {/* Modal Bottom Actions */}
            <div className="pt-4 border-t border-stone-200 flex flex-col sm:flex-row items-center justify-between gap-3">
              <a
                href={`https://wa.me/${studioContact?.whatsapp || '916238747722'}?text=${encodeURIComponent(
                  `Hello Framelu Weddings, I am interested in getting a quote similar to "${activeModalProject.title}".`
                )}`}
                target="_blank"
                rel="noopener noreferrer"
                className="w-full sm:w-auto flex items-center justify-center gap-2 px-5 py-3 rounded-2xl bg-emerald-600 hover:bg-emerald-700 text-white font-black text-xs shadow-md transition"
              >
                <MessageCircle className="w-4 h-4" />
                <span>{isMl ? 'ഇതുപോലെയുള്ള പാക്കേജിന് WhatsApp വഴി ബന്ധപ്പെടുക' : 'Enquire for Similar Wedding Package'}</span>
              </a>

              {onNavigateToCustomizer && (
                <button
                  type="button"
                  onClick={() => {
                    closeLightbox();
                    onNavigateToCustomizer();
                  }}
                  className="w-full sm:w-auto flex items-center justify-center gap-2 px-6 py-3 rounded-2xl bg-gradient-to-r from-amber-600 to-amber-700 hover:from-amber-700 hover:to-amber-800 text-white font-black text-xs shadow-md transition cursor-pointer"
                >
                  <span>{isMl ? 'സ്വന്തം പാക്കേജ് തയ്യാറാക്കുക' : 'Build Your Custom Package'}</span>
                  <ArrowRight className="w-4 h-4" />
                </button>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Bottom Call to Action */}
      <div className="mt-14 p-6 sm:p-8 bg-gradient-to-r from-stone-900 via-stone-850 to-stone-900 rounded-3xl text-white shadow-xl flex flex-col md:flex-row items-center justify-between gap-6">
        <div>
          <span className="text-amber-400 font-extrabold text-xs uppercase tracking-wider block mb-1">
            Framelu Wedding Company • {studioContact?.destination || 'Kerala'}
          </span>
          <h3 className="text-xl sm:text-2xl font-black">
            {isMl
              ? 'നിങ്ങളുടെ വിവാഹവും ഒരു റോയൽ അനുഭവമാക്കി മാറ്റാം'
              : 'Plan Your Signature Kerala Wedding With Us'}
          </h3>
          <p className="text-xs sm:text-sm text-stone-400 mt-1 max-w-xl">
            {isMl
              ? 'ഫോട്ടോഗ്രാഫർമാർ, 4K വീഡിയോ, ആൽബങ്ങൾ എന്നിവയോടൊപ്പം സദ്യ, സ്റ്റേജ് ഡെക്കോർ, മേക്കപ്പ് എന്നിവയും ഉൾപ്പെടുത്തി തത്സമയം കൃത്യമായ ബഡ്ജറ്റ് അറിയാം.'
              : 'Get complete transparent pricing for photography, Sadhya feast, decor, and styling with instant live quotation.'}
          </p>
        </div>

        {onNavigateToCustomizer && (
          <button
            type="button"
            onClick={onNavigateToCustomizer}
            className="shrink-0 flex items-center gap-2 px-6 py-3.5 rounded-2xl bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-600 hover:to-amber-700 text-stone-950 font-black text-xs sm:text-sm shadow-lg transition active:scale-95 cursor-pointer"
          >
            <span>{isMl ? 'കസ്റ്റം പാക്കേജ് ബിൽഡറിലേക്ക് പോകുക' : 'Start Customizing Now'}</span>
            <ArrowRight className="w-4 h-4" />
          </button>
        )}
      </div>
    </div>
  );
};
