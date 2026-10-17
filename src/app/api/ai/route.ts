// @ts-nocheck
import { NextResponse } from 'next/server';

interface AiRequestBody {
  action: 'chat' | 'optimize_budget' | 'timeline';
  language?: 'en' | 'ml';
  message?: string;
  history?: Array<{ role: 'user' | 'model'; parts: string }>;
  targetBudget?: number;
  preferences?: {
    focus?: 'balanced' | 'cinematic_video' | 'luxury_albums' | 'candid_photo';
    includePreWedding?: boolean;
    includeReception?: boolean;
    venueType?: string;
  };
  timelineData?: {
    tradition?: 'kerala_hindu' | 'christian' | 'muslim' | 'contemporary';
    eventDate?: string;
    muhurthamTime?: string;
    receptionTime?: string;
    venueName?: string;
    district?: string;
  };
}

export async function POST(req: Request) {
  try {
    const body: AiRequestBody = await req.json();
    const isMl = body.language === 'ml';
    const apiKey = process.env.GEMINI_API_KEY;

    // =========================================================
    // 1. ACTION: CHATBOT (മലയാളം & English AI Wedding Assistant)
    // =========================================================
    if (body.action === 'chat') {
      const userMessage = body.message?.trim() || '';
      if (!userMessage) {
        return NextResponse.json({ error: 'Message cannot be empty' }, { status: 400 });
      }

      // If Gemini API Key is configured, attempt calling Google Gemini REST API
      if (apiKey) {
        try {
          const systemInstruction = `You are the official smart wedding photography & event planning assistant of Framelu wedding Company, located in Kayamkulam, Alappuzha, Kerala.
Services offered: Traditional & Candid Wedding Photography, 4K Cinematic Films, Teaser & Reels, Drone Cinematography, Canvera/Feather Touch Luxury Albums, Pre/Post-wedding shoots, Birthday, Baby shower, Stage Decor, Bridal Makeup, Luxury Cars, and Catering.
Tone: Warm, respectful, traditional yet modern, helpful, friendly Kerala wedding expert.
Response language: If user writes in Malayalam or language is 'ml', respond in natural, polite Malayalam. If in English, respond in English.
Keep answers concise (under 3-4 paragraphs or crisp bullet points), encouraging them to customize their package or connect on WhatsApp.`;

          const contents = [
            ...(body.history || []).map((h) => ({
              role: h.role === 'model' ? 'model' : 'user',
              parts: [{ text: h.parts }],
            })),
            {
              role: 'user',
              parts: [{ text: userMessage }],
            },
          ];

          const geminiRes = await fetch(
            `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent?key=${apiKey}`,
            {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({
                contents,
                systemInstruction: { parts: [{ text: systemInstruction }] },
                generationConfig: {
                  temperature: 0.7,
                  maxOutputTokens: 800,
                },
              }),
            }
          );

          if (geminiRes.ok) {
            const geminiData = await geminiRes.json();
            const reply =
              geminiData?.candidates?.[0]?.content?.parts?.[0]?.text || null;
            if (reply) {
              return NextResponse.json({ reply, source: 'gemini_api' });
            }
          }
        } catch (apiErr) {
          console.warn('Gemini API call failed, falling back to local Kerala Wedding Engine:', apiErr);
        }
      }

      // Intelligent Local Kerala Wedding AI Assistant Fallback
      const fallbackReply = generateKeralaWeddingAiReply(userMessage, isMl);
      return NextResponse.json({ reply: fallbackReply, source: 'wedding_ai_engine' });
    }

    // =========================================================
    // 2. ACTION: SMART BUDGET OPTIMIZER (ബജറ്റ് ഒപ്റ്റിമൈസർ)
    // =========================================================
    if (body.action === 'optimize_budget') {
      const budget = Number(body.targetBudget) || 120000;
      const focus = body.preferences?.focus || 'balanced';

      // If Gemini API Key is available, prompt Gemini for a structured recommendation
      if (apiKey) {
        try {
          const prompt = `Act as an expert Kerala Wedding Photography consultant for Framlu Weddings (Kayamkulam).
Client Target Budget: ₹${budget}.
Priority Focus: ${focus}.
Generate a structured recommendation in ${isMl ? 'Malayalam' : 'English'} explaining the best combination of:
1. Crew: Traditional Photo/Video, Candid Photographer, Cinematic Videographer, Drone pilot.
2. Deliverables: Album type (Canvera/Feather-touch), 4K Teaser/Highlights, Reel packages.
3. Why this fits their budget and tips for saving cost.`;

          const geminiRes = await fetch(
            `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent?key=${apiKey}`,
            {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({
                contents: [{ role: 'user', parts: [{ text: prompt }] }],
                generationConfig: { temperature: 0.6, maxOutputTokens: 900 },
              }),
            }
          );

          if (geminiRes.ok) {
            const data = await geminiRes.json();
            const advice = data?.candidates?.[0]?.content?.parts?.[0]?.text;
            if (advice) {
              const config = buildOptimizedConfig(budget, focus);
              return NextResponse.json({
                advice,
                recommendedConfig: config,
                source: 'gemini_api',
              });
            }
          }
        } catch (e) {
          console.warn('Gemini budget optimization failed, using local engine:', e);
        }
      }

      // Local Intelligent Budget Engine
      const { advice, recommendedConfig } = getLocalBudgetOptimization(budget, focus, isMl);
      return NextResponse.json({ advice, recommendedConfig, source: 'wedding_ai_engine' });
    }

    // =========================================================
    // 3. ACTION: WEDDING TIMELINE SCHEDULER (മുഹൂർത്ത ഷെഡ്യൂളർ)
    // =========================================================
    if (body.action === 'timeline') {
      const {
        tradition = 'kerala_hindu',
        eventDate = 'Upcoming Wedding',
        muhurthamTime = '10:30 AM - 11:30 AM',
        receptionTime = '12:30 PM - 03:00 PM',
        venueName = 'Auditorium / Convention Centre',
      } = body.timelineData || {};

      if (apiKey) {
        try {
          const prompt = `Generate a realistic, professional minute-by-minute photography & event timeline for a ${tradition} in Kerala.
Date: ${eventDate}
Muhurtham / Ceremony Window: ${muhurthamTime}
Reception / Lunch: ${receptionTime}
Venue: ${venueName}
Language: ${isMl ? 'Malayalam' : 'English'}
Include:
- Morning bridal & groom preparations photoshoot
- Arrival & traditional welcoming
- Ceremony coverage (Kettuka / Thalikettu or Rings exchange / Nikah)
- Post-ceremony family group portraits
- Couple portraits session
- Reception & lunch highlights
- Candid moments tips for couple`;

          const geminiRes = await fetch(
            `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent?key=${apiKey}`,
            {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({
                contents: [{ role: 'user', parts: [{ text: prompt }] }],
                generationConfig: { temperature: 0.6, maxOutputTokens: 1200 },
              }),
            }
          );

          if (geminiRes.ok) {
            const data = await geminiRes.json();
            const schedule = data?.candidates?.[0]?.content?.parts?.[0]?.text;
            if (schedule) {
              return NextResponse.json({ schedule, source: 'gemini_api' });
            }
          }
        } catch (e) {
          console.warn('Gemini timeline failed, using local engine:', e);
        }
      }

      // Local Timeline Generator
      const schedule = generateLocalWeddingTimeline(tradition, muhurthamTime, receptionTime, venueName, isMl);
      return NextResponse.json({ schedule, source: 'wedding_ai_engine' });
    }

    return NextResponse.json({ error: 'Invalid action requested' }, { status: 400 });
  } catch (err: any) {
    console.error('AI API handler error:', err);
    return NextResponse.json(
      { error: 'Internal AI processing error', details: err?.message },
      { status: 500 }
    );
  }
}

// =============================================================
// LOCAL INTELLIGENT KERALA WEDDING AI ENGINES (FAILSAFE & OFFLINE)
// =============================================================

function generateKeralaWeddingAiReply(query: string, isMl: boolean): string {
  const q = query.toLowerCase();

  if (q.includes('budget') || q.includes('ബജറ്റ്') || q.includes('rate') || q.includes('വില') || q.includes('cost')) {
    return isMl
      ? `✨ **Framlu Weddings ബജറ്റ് ഗൈഡ്:**\n\nഞങ്ങളുടെ പക്കൽ ₹45,000 മുതൽ ₹2,50,000+ വരെയുള്ള കസ്റ്റമൈസ്ഡ് പാക്കേജുകൾ ലഭ്യമാണ്:\n- **ബേസിക് പാക്കേജ് (₹50,000 - ₹75,000)**: ട്രഡീഷണൽ ഫോട്ടോ & HD വീഡിയോ + 1 പ്രീമിയം ആൽബം.\n- **സ്റ്റാൻഡേർഡ് പാക്കേജ് (₹1,00,000 - ₹1,50,000)**: ട്രഡീഷണൽ + കാൻഡിഡ് ഫോട്ടോ, സിനിമാറ്റിക് ഹൈലൈറ്റ്സ് & കാൻവേര ആൽബം.\n- **ലക്ഷ്വറി പാക്കേജ് (₹1,80,000+)**: ഡ്രോൺ, കാൻഡിഡ് ഷൂട്ട്, 4K സിനിമ, ഫെതർ ടച്ച് ആൽബങ്ങൾ & പ്രീ-വെഡ്ഡിംഗ് ഷൂട്ട്.\n\nനിങ്ങളുടെ കൃത്യമായ ബജറ്റിന് അനുയോജ്യമായ പാക്കേജ് തനിയെ നിർമ്മിക്കാൻ സ്ക്രീനിലെ **'✨ AI ബജറ്റ് ഒപ്റ്റിമൈസർ'** ബട്ടൺ ഉപയോഗിക്കൂ!`
      : `✨ **Framlu Weddings Budget Guide:**\n\nWe offer completely customizable wedding packages ranging from ₹45,000 to ₹2,50,000+:\n- **Starter Package (₹50k - ₹75k)**: Traditional Photo & HD Video + 1 Premium Photobook.\n- **Popular Package (₹1L - ₹1.5L)**: Traditional + Candid Photo, Cinematic Highlights, Teaser & Canvera Album.\n- **Grand Luxury (₹1.8L+)**: Drone aerials, Multi-camera Candid, 4K Wedding Film, Feather Touch albums & Pre-wedding shoot.\n\nClick our **'✨ AI Budget Optimizer'** on the screen to let AI build the exact package matching your budget!`;
  }

  if (q.includes('drone') || q.includes('ഡ്രോൺ') || q.includes('aerial')) {
    return isMl
      ? `🚁 **ഡ്രോൺ സിനിമാറ്റോഗ്രാഫി ഗൈഡ്:**\n\nവിവാഹ വേദി, അതിഥികളുടെ വരവ്, താലികെട്ട് സമയം, ഔട്ട്ഡോർ കപ്പിൾ ഷൂട്ട് എന്നിവയ്ക്ക് ഡ്രോൺ ദൃശ്യങ്ങൾ സിനിമ നിലവാരം നൽകുന്നു.\n- ഓഡിറ്റോറിയത്തിന്റെ പുറംകാഴ്ചയും ആകാശക്കാഴ്ചകളും ലഭിക്കാൻ 1 ഡ്രോൺ വളരെ ശുപാർശ ചെയ്യുന്നു.\n- ഞങ്ങളുടെ ലൈവ് പ്ലാനറിൽ 'Wedding Ceremony' സെക്ഷനിൽ നിങ്ങൾക്ക് നേരിട്ട് ഡ്രോൺ പൈലറ്റിനെ ചേർക്കാവുന്നതാണ്.`
      : `🚁 **Drone Aerial Coverage:**\n\nDrone footage elevates your wedding video into a cinematic masterwork, capturing the grand venue, arrivals, and picturesque couple moments from the sky. You can easily toggle a 4K Drone Pilot in the Ceremony section of our live planner!`;
  }

  if (q.includes('album') || q.includes('ആൽബം') || q.includes('canvera') || q.includes('book')) {
    return isMl
      ? `📖 **ആൽബം ചോയ്‌സുകൾ:**\n\n- **കാൻവേര (Canvera)**: ആജീവനാന്ത വാറന്റിയുള്ള പ്രീമിയം ലാമിനേഷൻ & പ്രിന്റിംഗ്.\n- **ഫെതർ ടച്ച് (Feather Touch)**: അൾട്രാ-സ്മൂത്ത് മാറ്റ് ഫിനിഷോട് കൂടിയ ലക്ഷ്വറി പേപ്പറുകൾ.\n- **സ്റ്റാൻഡേർഡ് പ്രീമിയം**: മികച്ച ഗ്ലോസി/മാറ്റ് ബൈൻഡിംഗ്.\n\nഓരോ ആൽബത്തിലും സാധാരണയായി 30 മുതൽ 40 വരെ പേജുകൾ (250-350 തെരഞ്ഞെടുത്ത ഫോട്ടോകൾ) ഉൾക്കൊള്ളിക്കാം. കൂടുതൽ കോപ്പികൾ മാതാപിതാക്കൾക്കായി ഓർഡർ ചെയ്യാം.`
      : `📖 **Photo Album Options:**\n\n- **Canvera Luxury**: Premium archival quality with guaranteed lifetime color durability.\n- **Feather Touch**: Ultra-velvety matte finish with non-tearable pages.\n- **Standard Premium**: High-grade glossy or matte binding.\nEach album comfortably fits 30-40 sheets (250 to 350 curated photographs). Parent pocket copies are also available!`;
  }

  if (q.includes('kayamkulam') || q.includes('കായംകുളം') || q.includes('location') || q.includes('സ്ഥലം') || q.includes('contact') || q.includes('ഫോൺ') || q.includes('phone')) {
    return isMl
      ? `📍 **Framlu Weddings വിലാസവും കോൺടാക്റ്റും:**\n\nഞങ്ങളുടെ മെയിൻ സ്റ്റുഡിയോ കായംകുളം ടൗണിലാണ് സ്ഥിതി ചെയ്യുന്നത്. ആലപ്പുഴ, കൊല്ലം, പത്തനംതിട്ട, തിരുവനന്തപുരം, എറണാകുളം ഉൾപ്പെടെ കേരളത്തിൽ എല്ലായിടത്തും ഞങ്ങൾ ഷൂട്ട് ചെയ്യുന്നുണ്ട്!\n\n📞 **ഫോൺ**: +91 6238747722\n💬 **വാട്ട്‌സ്ആപ്പ്**: [ഇവിടെ ക്ലിക്ക് ചെയ്ത് വാട്ട്‌സ്ആപ്പിൽ മെസ്സേജ് അയക്കാം](https://wa.me/916238747722)\n📧 **ഇമെയിൽ**: frameluweddings@gmail.com`
      : `📍 **Framlu Weddings Location & Contact:**\n\nOur flagship studio is located in Kayamkulam, Alappuzha. We cover weddings all across Kerala (Alappuzha, Kollam, Pathanamthitta, Trivandrum, Kochi and beyond)!\n\n📞 **Phone**: +91 6238747722\n💬 **WhatsApp**: https://wa.me/916238747722\n📧 **Email**: frameluweddings@gmail.com`;
  }

  // General Friendly Response
  return isMl
    ? `നമസ്കാരം! ഞാൻ ഫ്രെയിം ലൂ വെഡ്ഡിംഗ്സിന്റെ AI അസിസ്റ്റന്റാണ്. നിങ്ങളുടെ സ്വപ്ന വിവാഹത്തിന് അനുയോജ്യമായ ഫോട്ടോഗ്രാഫി പാക്കേജുകൾ, ഡ്രോൺ, കാൻഡിഡ് ഷൂട്ട്, ആൽബങ്ങൾ, അല്ലെങ്കിൽ മുഹൂർത്തം ഷെഡ്യൂളിംഗ് എന്നിവയെക്കുറിച്ച് എന്തും ചോദിക്കാം.\n\nനിങ്ങൾക്ക് എന്താണ് അറിയേണ്ടത്? (ഉദാഹരണത്തിന്: "₹1.5 ലക്ഷത്തിൽ എന്തൊക്കെ ലഭിക്കും?", "ഡ്രോൺ ഉൾപ്പെടുത്തണോ?", "ആൽബം പേജുകൾ എത്ര?")`
    : `Hello! I am Framlu Weddings' AI Wedding Assistant. I can help you customize your photography package, select candid & cinematic crew, understand album papers, or build a minute-by-minute ceremony timeline.\n\nFeel free to ask me anything about your wedding planning!`;
}

function buildOptimizedConfig(budget: number, focus: string) {
  // Logic to build default event crew and deliverables based on budget tier
  let candidShooter = budget >= 100000 ? 1 : 0;
  let cinematicVideo = budget >= 110000 ? 1 : 0;
  let drone = budget >= 140000 ? 1 : 0;
  let albumSheets = budget >= 150000 ? 40 : budget >= 90000 ? 30 : 25;
  let albumType = budget >= 160000 ? 'canvera' : budget >= 100000 ? 'feather_touch' : 'premium';

  if (focus === 'candid_photo') {
    candidShooter = Math.max(candidShooter, 1);
  } else if (focus === 'cinematic_video') {
    cinematicVideo = Math.max(cinematicVideo, 1);
    if (budget >= 120000) drone = 1;
  } else if (focus === 'luxury_albums') {
    albumType = 'canvera';
    albumSheets = 40;
  }

  return {
    weddingCrew: {
      photographers: 1,
      videographers: 1,
      candidPhotographers: candidShooter,
      cinematicVideographers: cinematicVideo,
      dronePilots: drone,
      traditionalPhotoOnly: budget < 80000,
    },
    deliverables: {
      albumSheets,
      albumType,
      printedCopies: budget >= 140000 ? 2 : 1,
      teaserVideo: budget >= 90000,
      highlightFilm: budget >= 100000,
      fullDocumentary: true,
      penDrive: true,
    },
  };
}

function getLocalBudgetOptimization(budget: number, focus: string, isMl: boolean) {
  const config = buildOptimizedConfig(budget, focus);
  let advice = '';

  if (isMl) {
    advice = `✨ **₹${budget.toLocaleString('en-IN')} ബജറ്റിൽ നിർദ്ദേശിക്കുന്ന AI സ്മാർട്ട് പാക്കേജ്:**\n\n` +
      `1. **വിവാഹ ചടങ്ങ് ക്രൂ (Wedding Ceremony Crew)**:\n` +
      `   - 📸 1 x ട്രഡീഷണൽ ഫോട്ടോഗ്രാഫർ (സ്റ്റേജ്, ഗ്രൂപ്പ് & കുടുംബ ചിത്രങ്ങൾ)\n` +
      `   - 🎥 1 x ട്രഡീഷണൽ ഫുൾ HD വീഡിയോഗ്രാഫർ\n` +
      (config.weddingCrew.candidPhotographers > 0 ? `   - 🌟 1 x പ്രൊഫഷണൽ കാൻഡിഡ് ഫോട്ടോഗ്രാഫർ (സ്വാഭാവിക ചിരികളും ഭാവങ്ങളും)\n` : '') +
      (config.weddingCrew.cinematicVideographers > 0 ? `   - 🎬 1 x സിനിമാറ്റിക് വീഡിയോഗ്രാഫർ (വെഡ്ഡിംഗ് ടീസർ & റീൽസിനായി)\n` : '') +
      (config.weddingCrew.dronePilots > 0 ? `   - 🚁 1 x 4K ഡ്രോൺ ഏരിയൽ പൈലറ്റ് (വേദിയുടെ ആകാശദൃശ്യങ്ങൾ)\n` : '') +
      `\n2. **ആൽബവും ഡെലിവറബിളുകളും**:\n` +
      `   - 📖 **${config.deliverables.albumType.toUpperCase()}** ലക്ഷ്വറി ആൽബം (${config.deliverables.albumSheets} പേജുകൾ / ഷീറ്റുകൾ)\n` +
      `   - 🎞️ 3-4 മിനിറ്റ് സിനിമാറ്റിക് ഹൈലൈറ്റ് വീഡിയോ & സോഷ്യൽ മീഡിയ റീൽ\n` +
      `   - 💾 ഹൈ-സ്പീഡ് പെൻഡ്രൈവിൽ എല്ലാ എഡിറ്റ് ചെയ്ത ഫോട്ടോകളും ഫുൾ HD സിനിമയും\n\n` +
      `💡 **AI ടിപ്പ്**: ഈ പാക്കേജ് നിങ്ങളുടെ ബജറ്റിന് ഏറ്റവും കൂടുതൽ മൂല്യവും സിനിമ നിലവാരമുള്ള ഓർമ്മകളും നൽകാൻ പ്രത്യേകം രൂപകൽപ്പന ചെയ്തതാണ്!`;
  } else {
    advice = `✨ **AI Recommended Setup for ₹${budget.toLocaleString('en-IN')} Budget:**\n\n` +
      `1. **Ceremony Crew Allocation**:\n` +
      `   - 📸 1 x Traditional Photographer (Stage, Relatives & Rituals)\n` +
      `   - 🎥 1 x Traditional Full HD Videographer\n` +
      (config.weddingCrew.candidPhotographers > 0 ? `   - 🌟 1 x Dedicated Candid Photographer (Spontaneous emotive captures)\n` : '') +
      (config.weddingCrew.cinematicVideographers > 0 ? `   - 🎬 1 x Cinematic Film Videographer (For wedding teaser & reel)\n` : '') +
      (config.weddingCrew.dronePilots > 0 ? `   - 🚁 1 x 4K Aerial Drone Pilot\n` : '') +
      `\n2. **Albums & Deliverables**:\n` +
      `   - 📖 **${config.deliverables.albumType.toUpperCase()}** Luxury Album (${config.deliverables.albumSheets} sheets / 300+ photos)\n` +
      `   - 🎞️ 3-4 Min Cinematic Teaser & Instagram Reel edits\n` +
      `   - 💾 High-speed Wooden USB Drive containing full raw & graded files\n\n` +
      `💡 **AI Tip**: This balanced allocation maximizes your keepsake quality while staying within your allocated financial limit.`;
  }

  return { advice, recommendedConfig: config };
}

function generateLocalWeddingTimeline(
  tradition: string,
  muhurthamTime: string,
  receptionTime: string,
  venueName: string,
  isMl: boolean
): string {
  if (isMl) {
    return `📅 **കേരള വെഡ്ഡിംഗ് ഫോട്ടോഗ്രാഫി & ഇവന്റ് ടൈംലൈൻ ഷെഡ്യൂൾ**\nവേദി: ${venueName} | മുഹൂർത്തം: ${muhurthamTime}\n\n` +
      `⏰ **07:30 AM - 08:30 AM | ബ്രൈഡൽ മേക്കപ്പ് & ഗെറ്റിംഗ് റെഡി ഷൂട്ട്**\n` +
      `• വധുവിന്റെയും വരന്റെയും ആഭരണങ്ങൾ, വസ്ത്രങ്ങൾ (സാരി/കസവ്/ഷേർവാണി), മേക്കപ്പ് ഫിനിഷിംഗ് ക്ലോസ്-അപ്പ് ഷോട്ടുകൾ.\n\n` +
      `⏰ **08:45 AM - 09:30 AM | പ്രീ-സെറിമണി പോർട്രെയ്റ്റ്സ്**\n` +
      `• വധുവിന്റെയും വരന്റെയും ഒറ്റയ്ക്കുള്ള സിഗ്നേച്ചർ പോർട്രെയ്റ്റുകൾ. അടുത്ത കുടുംബാംഗങ്ങളുമൊത്തുള്ള ചിത്രങ്ങൾ.\n\n` +
      `⏰ **09:45 AM - 10:15 AM | വേദിയിലേക്കുള്ള വരവ് & സ്വീകരണം**\n` +
      `• വരന്റെയും വധുവിന്റെയും പരമ്പരാഗത വരവ്, താലപ്പൊലി, നാദസ്വരം/ചെണ്ടമേളം, പൂമാല സ്വീകരണം, ഡ്രോൺ ആകാശദൃശ്യങ്ങൾ.\n\n` +
      `⏰ **${muhurthamTime} | പ്രധാന ചടങ്ങ് (താലികെട്ട് / മുഹൂർത്തം / മോതിരമാറ്റം)**\n` +
      `• കാൻഡിഡ് & ട്രഡീഷണൽ ക്യാമറകൾ ഒരുപോലെ സജീവം. താലികെട്ട്, സിന്ദൂരച്ചാർത്ത്, മാലയിടൽ, കുടുംബാംഗങ്ങളുടെ അനുഗ്രഹം.\n\n` +
      `⏰ **11:30 AM - 12:30 PM | വേദിയിലെ ഗ്രൂപ്പ് ഫോട്ടോകൾ**\n` +
      `• മാതാപിതാക്കൾ, അടുത്ത ബന്ധുക്കൾ, സുഹൃത്തുക്കൾ എന്നിവരുമൊത്തുള്ള ചിട്ടയായ ഫോട്ടോ സെഷൻ.\n\n` +
      `⏰ **${receptionTime} | വെഡ്ഡിംഗ് സദ്യ & റിസപ്ഷൻ**\n` +
      `• പരമ്പരാഗത സദ്യ കഴിക്കുന്ന ചിത്രങ്ങൾ, അതിഥികളുടെ ആശംസകൾ, കേക്ക് മുറിക്കൽ, വധൂവരന്മാരുടെ ഔട്ട്ഡോർ റൊമാന്റിക് ഫ്രെയിമുകൾ.\n\n` +
      `✨ *Framlu Weddings ഫോട്ടോഗ്രാഫി ടീം ഈ ടൈംലൈൻ പ്രകാരം കൃത്യമായി നിമിഷങ്ങൾ ഒപ്പിയെടുക്കും.*`;
  }

  return `📅 **Kerala Wedding Photography & Event Master Timeline**\nVenue: ${venueName} | Muhurtham: ${muhurthamTime}\n\n` +
    `⏰ **07:30 AM - 08:30 AM | Bridal & Groom Getting-Ready Session**\n` +
    `• Capturing saree/kasavu details, jewelry, shoes, makeup touches, and intimate family moments before departure.\n\n` +
    `⏰ **08:45 AM - 09:30 AM | Solo Creative Portraits**\n` +
    `• High-fashion solo portraits of the bride and groom at their respective suites or scenic home backdrops.\n\n` +
    `⏰ **09:45 AM - 10:15 AM | Grand Venue Arrival & Traditional Welcome**\n` +
    `• Arrival with Chenda Melam / Nadaswaram, Thalappoli, aerial drone reception shots and entrance candid.\n\n` +
    `⏰ **${muhurthamTime} | Sacred Ceremony (Thalikettu / Exchange of Vows)**\n` +
    `• Full multi-angle focus: Thalikettu, Sindooram ritual, garlands exchange, rings, and emotional blessings.\n\n` +
    `⏰ **11:30 AM - 12:30 PM | Stage Family & VIP Portraits**\n` +
    `• Structured stage photos with parents, extended family, cousins, and VIP guests.\n\n` +
    `⏰ **${receptionTime} | Wedding Feast (Sadya) & Couple Creative Shoot**\n` +
    `• Traditional feast moments, lunch interactions, greeting guests, and a 20-minute private romantic couple portrait session.\n\n` +
    `✨ *Framlu Weddings production team will coordinate smoothly with this exact schedule.*`;
}
