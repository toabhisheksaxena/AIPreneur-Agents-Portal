// AIPreneur (aipreneurglobal.com) — Humanized Conversational Voice Engine, 10 Non-Overlapping Natural Voices, Member Demo Gate & Silent Background Routing

const API_BASE = window.location.protocol.startsWith("http")
  ? window.location.origin
  : "http://localhost:8090";

// Silently connected background Gmail account (never shown in customer-facing UI)
const OWNER_NOTIFICATION_EMAIL = "tothedataboy@gmail.com";

// Authentication & Demo Gating State
let isUserAuthenticated = false;
let currentAuthenticatedCustomer = null;
let pendingRequestedAgentId = "social_manager";

const REAL_PHOTOS = {
  elena: "https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?auto=format&fit=crop&w=600&q=80",
  sophia: "https://images.unsplash.com/photo-1580489944761-15a19d654956?auto=format&fit=crop&w=600&q=80",
  marcus: "https://images.unsplash.com/photo-1560250097-0b93528c311a?auto=format&fit=crop&w=600&q=80",
  liam: "https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=600&q=80",
  maya: "https://images.unsplash.com/photo-1544005313-94ddf0286df2?auto=format&fit=crop&w=600&q=80",
  claude: "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?auto=format&fit=crop&w=600&q=80",
  arjun: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=600&q=80",
  jordan: "https://images.unsplash.com/photo-1519085360753-af0119f7cbe7?auto=format&fit=crop&w=600&q=80",
  clara: "https://images.unsplash.com/photo-1567532939604-b6b5b0db2604?auto=format&fit=crop&w=600&q=80",
  alex: "https://images.unsplash.com/photo-1539571696357-5a69c17a67c6?auto=format&fit=crop&w=600&q=80",

  postTeam: "https://images.unsplash.com/photo-1522071820081-009f0129c71c?auto=format&fit=crop&w=700&q=80",
  postFounder: "https://images.unsplash.com/photo-1552664730-d307ca884978?auto=format&fit=crop&w=700&q=80",
  postStudio: "https://images.unsplash.com/photo-1600880292203-757bb62b4baf?auto=format&fit=crop&w=700&q=80",
  postAnalytics: "https://images.unsplash.com/photo-1460925895917-afdab827c52f?auto=format&fit=crop&w=700&q=80",
  postLaptop: "https://images.unsplash.com/photo-1498050108023-c5249f4df085?auto=format&fit=crop&w=700&q=80",
  postPodcast: "https://images.unsplash.com/photo-1590602847861-f357a9332bbc?auto=format&fit=crop&w=700&q=80",
  postClient: "https://images.unsplash.com/photo-1556761175-5973dc0f32e7?auto=format&fit=crop&w=700&q=80"
};

// ============================================================================
// HUMANIZED CONVERSATIONAL PROSODY & NATURAL NEURAL VOICE ENGINE
// 1. Permanently blocks all legacy 1990s formant/robotic voices (Fred, Albert, Ralph, Kathy, Junior, etc.)
// 2. Prioritizes Online Neural, Google Natural, Siri, and Apple Enhanced human voices
// 3. Uses natural human pitch (0.97–1.03) so zero metallic phase-vocoder distortion occurs
// 4. Breaks speech into natural conversational clauses with realistic human breathing pauses
// ============================================================================
const ROBOTIC_VOICE_BLACKLIST = [
  "albert", "bad news", "bahh", "bells", "boing", "bubbles", "cellos",
  "fred", "good news", "jester", "junior", "kathy", "organ", "ralph",
  "superstar", "trinoids", "whisper", "wobble", "zarvox", "eddy", "flo",
  "grandma", "grandpa", "reed", "rocko", "sandy", "shelley", "espeak"
];

function isRoboticOrNoveltyVoice(voice) {
  if (!voice || !voice.name) return true;
  const lower = voice.name.toLowerCase();
  return ROBOTIC_VOICE_BLACKLIST.some(bad => lower.includes(bad));
}

const AGENT_VOICE_PROFILES = {
  social_manager: {
    slotName: "Natural Female #1 • Warm US Creative Director",
    preferredVoices: [
      "Microsoft Aria Online", "Microsoft Jenny Online", "Ava (Premium)", "Ava (Enhanced)",
      "Allison (Enhanced)", "Samantha (Enhanced)", "Google US English", "Samantha", "Ava"
    ],
    fallbackLang: "en-US",
    gender: "female",
    pitch: 1.01,
    rate: 0.96
  },
  receptionist: {
    slotName: "Natural Female #2 • Warm Australian/UK Concierge",
    preferredVoices: [
      "Microsoft Natasha Online", "Microsoft Sonia Online", "Karen (Enhanced)", "Karen (Premium)",
      "Google UK English Female", "Serena (Enhanced)", "Karen", "Serena", "Victoria"
    ],
    fallbackLang: "en-AU",
    gender: "female",
    pitch: 1.03,
    rate: 0.95
  },
  sales_assistant: {
    slotName: "Natural Male #1 • Confident Executive Advisor",
    preferredVoices: [
      "Microsoft Guy Online", "Microsoft Andrew Online", "Alex", "Tom (Enhanced)",
      "Aaron (Enhanced)", "Oliver (Enhanced)", "Google US English", "Tom", "Aaron", "Daniel"
    ],
    fallbackLang: "en-US",
    gender: "male",
    pitch: 0.96,
    rate: 0.95
  },
  blogger: {
    slotName: "Natural Female #3 • Expressive Irish Storyteller",
    preferredVoices: [
      "Microsoft Emily Online", "Moira (Enhanced)", "Moira (Premium)", "Moira",
      "Fiona (Enhanced)", "Fiona", "Kate"
    ],
    fallbackLang: "en-IE",
    gender: "female",
    pitch: 1.02,
    rate: 0.95
  },
  writer: {
    slotName: "Natural Female #4 • Articulate International Copywriter",
    preferredVoices: [
      "Microsoft Libby Online", "Tessa (Enhanced)", "Tessa (Premium)", "Tessa",
      "Paulina (Enhanced)", "Paulina", "Monica", "Luciana"
    ],
    fallbackLang: "en-ZA",
    gender: "female",
    pitch: 0.98,
    rate: 0.96
  },
  content_editor: {
    slotName: "Natural Male #2 • Upbeat Studio Director (Claude)",
    preferredVoices: [
      "Microsoft Christopher Online", "Microsoft Brian Online", "Thomas (Enhanced)",
      "Xander (Enhanced)", "Thomas", "Xander", "Daniel", "Luca"
    ],
    fallbackLang: "en-GB",
    gender: "male",
    pitch: 0.99,
    rate: 0.98
  },
  data_analyst: {
    slotName: "Natural Male #3 • Indian English Strategist (Arjun • en-IN)",
    preferredVoices: [
      "Microsoft Prabhat Online", "Rishi (Enhanced)", "Rishi (Premium)", "Rishi",
      "Google हिन्दी", "Neel", "Veena (Enhanced)", "Lekha"
    ],
    fallbackLang: "en-IN",
    gender: "male",
    pitch: 0.98,
    rate: 0.94
  },
  inside_sales_support: {
    slotName: "Natural Male #4 • Empathetic British Specialist (Jordan • en-GB)",
    preferredVoices: [
      "Microsoft Ryan Online", "Google UK English Male", "Daniel (Enhanced)",
      "Daniel (Premium)", "Arthur (Enhanced)", "Daniel", "Arthur", "Oliver"
    ],
    fallbackLang: "en-GB",
    gender: "male",
    pitch: 1.0,
    rate: 0.96
  },
  research_specialist: {
    slotName: "Natural Female #5 • Thoughtful Research Lead (Dr. Clara)",
    preferredVoices: [
      "Microsoft Michelle Online", "Nora (Enhanced)", "Nora", "Satu",
      "Alva", "Ellen", "Milena", "Zuzana", "Kyoko"
    ],
    fallbackLang: "en-US",
    gender: "female",
    pitch: 0.97,
    rate: 0.93
  },
  custom_role: {
    slotName: "Natural Male #5 • Friendly Young Specialist (Alex)",
    preferredVoices: [
      "Microsoft Eric Online", "Microsoft Steffan Online", "Xander",
      "Majed", "Gordon", "Thomas", "Daniel", "Samantha"
    ],
    fallbackLang: "en-US",
    gender: "male",
    pitch: 1.04,
    rate: 1.0
  }
};

const lockedAgentVoices = {};
let activeSpeechTimers = [];

function clearActiveSpeechTimers() {
  activeSpeechTimers.forEach(t => clearTimeout(t));
  activeSpeechTimers = [];
}

function allocateNonOverlappingVoices() {
  if (!("speechSynthesis" in window)) return;
  const rawVoices = window.speechSynthesis.getVoices();
  if (!rawVoices || rawVoices.length === 0) return;

  // Filter out all legacy robotic/novelty voices first!
  const humanVoices = rawVoices.filter(v => !isRoboticOrNoveltyVoice(v));
  const pool = humanVoices.length > 0 ? humanVoices : rawVoices;

  const usedVoiceNames = new Set();

  Object.keys(AGENT_VOICE_PROFILES).forEach(agentId => {
    const profile = AGENT_VOICE_PROFILES[agentId];
    let assigned = null;

    // 1. Try preferred natural human voices that haven't been claimed yet
    for (const prefName of profile.preferredVoices) {
      const candidate = pool.find(
        v => !usedVoiceNames.has(v.name) && v.name.toLowerCase().includes(prefName.toLowerCase())
      );
      if (candidate) {
        assigned = candidate;
        break;
      }
    }

    // 2. Try matching language locale from the clean human voice pool
    if (!assigned) {
      const langPrefix = profile.fallbackLang.replace("_", "-").toLowerCase();
      assigned = pool.find(
        v => !usedVoiceNames.has(v.name) && v.lang && v.lang.replace("_", "-").toLowerCase().startsWith(langPrefix)
      );
    }

    // 3. Try any unused English human voice (preferring Online / Natural / Google / Enhanced)
    if (!assigned) {
      assigned = pool.find(
        v => !usedVoiceNames.has(v.name) && v.lang && v.lang.toLowerCase().startsWith("en") &&
             (v.name.includes("Natural") || v.name.includes("Google") || v.name.includes("Enhanced") || v.name.includes("Premium"))
      ) || pool.find(
        v => !usedVoiceNames.has(v.name) && v.lang && v.lang.toLowerCase().startsWith("en")
      );
    }

    // 4. Final fallback from clean human pool
    if (!assigned) {
      assigned = pool.find(v => !usedVoiceNames.has(v.name)) || pool[0];
    }

    if (assigned) {
      usedVoiceNames.add(assigned.name);
      lockedAgentVoices[agentId] = assigned;
    }
  });

  renderVoiceAuditionBar();
  renderWorkforceRoster();
}

function getAgentVoiceDisplayLabel(agentId) {
  const profile = AGENT_VOICE_PROFILES[agentId] || AGENT_VOICE_PROFILES.social_manager;
  const assignedVoice = lockedAgentVoices[agentId];
  if (assignedVoice) {
    return `${profile.slotName} (${assignedVoice.name})`;
  }
  return profile.slotName;
}

// PHONETIC & CONVERSATIONAL TEXT NORMALIZER
// Turns stiff written symbols/abbreviations into warm, natural spoken English
function humanizeTextForSpeech(rawText) {
  if (!rawText) return "";
  return rawText
    .replace(/https?:\/\/(www\.)?/gi, "")
    .replace(/aipreneurglobal\.com/gi, "A I Preneur Global dot com")
    .replace(/AIPreneur/g, "A I Preneur")
    .replace(/24\/7/g, "twenty-four seven")
    .replace(/1-click/gi, "one-click")
    .replace(/3\.2x/gi, "three point two times")
    .replace(/2\.4x/gi, "two point four times")
    .replace(/\bLI\b/g, "LinkedIn")
    .replace(/\bIG\b/g, "Instagram")
    .replace(/\bFB\b/g, "Facebook")
    .replace(/\bDMs\b/g, "direct messages")
    .replace(/\bDM\b/g, "direct message")
    .replace(/\bSEO\b/g, "S E O")
    .replace(/\bCRM\b/g, "C R M")
    .replace(/\bROI\b/g, "return on investment")
    .replace(/\bARR\b/g, "annual revenue")
    .replace(/\bB2B\b/g, "business to business")
    .replace(/\bSOPs\b/g, "standard operating procedures")
    .replace(/\bSOP\b/g, "standard operating procedure")
    .replace(/\bCTR\b/g, "click-through rate")
    .replace(/[•✓✨🚀🎬✍️📞💼📊💬🔍🛠️🗓️🎨📥🌐🎙️🔒]/g, " ")
    .replace(/\s+/g, " ")
    .trim();
}

// MULTI-CLAUSE CONVERSATIONAL SPEECH ENGINE WITH NATURAL BREATHING PAUSES
function speakWithUniqueAgentVoice(agentId, rawText) {
  if (!("speechSynthesis" in window)) return;
  clearActiveSpeechTimers();
  window.speechSynthesis.cancel();

  const resolvedId = AGENT_VOICE_PROFILES[agentId] ? agentId : "custom_role";
  const profile = AGENT_VOICE_PROFILES[resolvedId];

  if (Object.keys(lockedAgentVoices).length === 0) {
    allocateNonOverlappingVoices();
  }

  const cleanText = humanizeTextForSpeech(rawText);
  if (!cleanText) return;

  // Split into natural conversational sentences/clauses so the agent pauses to breathe like a real person
  const clauses = cleanText
    .split(/(?<=[.!?])\s+|(?:\s+—\s+)|(?:\s+\.\.\.\s+)/)
    .map(c => c.trim())
    .filter(Boolean);

  document.querySelectorAll(".voice-audition-chip").forEach(el => {
    el.classList.toggle("speaking-now", el.getAttribute("data-agent-id") === resolvedId);
  });

  const voiceObj = lockedAgentVoices[resolvedId];

  const speakClauseAt = (idx) => {
    if (idx >= clauses.length) {
      document.querySelectorAll(".voice-audition-chip").forEach(el => el.classList.remove("speaking-now"));
      return;
    }

    const clauseText = clauses[idx];
    const utter = new SpeechSynthesisUtterance(clauseText);

    if (voiceObj) {
      utter.voice = voiceObj;
      utter.lang = voiceObj.lang;
    } else {
      utter.lang = profile.fallbackLang;
    }

    // Subtle human conversational prosody variation across clauses (warm opening -> natural flow)
    const clauseVariation = idx === 0 ? 0.02 : (idx % 2 === 1 ? -0.01 : 0.01);
    utter.pitch = Math.max(0.92, Math.min(1.06, profile.pitch + clauseVariation));
    utter.rate = Math.max(0.90, Math.min(1.04, profile.rate + (idx === 0 ? 0.01 : 0)));
    utter.volume = 1.0;

    utter.onend = () => {
      // Natural human breathing pause (160ms) between sentences
      const pauseTimer = setTimeout(() => {
        speakClauseAt(idx + 1);
      }, 160);
      activeSpeechTimers.push(pauseTimer);
    };

    utter.onerror = () => {
      document.querySelectorAll(".voice-audition-chip").forEach(el => el.classList.remove("speaking-now"));
    };

    window.speechSynthesis.speak(utter);
  };

  speakClauseAt(0);
}

const AI_EMPLOYEES = [
  {
    id: "social_manager",
    name: "Elena Rostova",
    roleTitle: "AI Social Media Manager",
    category: "content",
    portrait: REAL_PHOTOS.elena,
    personaLook: "creative",
    accent: "#EC4899",
    badge: "7-Day Plans, Visual Posts & DM Router",
    channels: "LinkedIn, Instagram, Facebook, X, Conversations AI",
    monthlyOutput: "7-Day Visual Plans • 4 Networks • DM → CRM",
    kpi: "Creates weekly multi-platform plans in Brand or Individual voice, designs visual photo post templates with hooks/captions/hashtags, publishes to LinkedIn, IG, FB & X, and routes DMs to Conversations AI.",
    description: "Meet Elena Rostova—your warm, creative AI Social Media Manager. Chat with her or watch her build your 7-day multi-network plan, design visual post templates with real photography, auto-publish to LinkedIn, Instagram, Facebook & X, and route DMs.",
    skills: [
      "Generates weekly 7-day content calendars in Brand or Individual voice",
      "Designs visual post templates with real photos, hooks, captions & hashtags",
      "Publishes & schedules directly to LinkedIn, Instagram, Facebook, and X",
      "Monitors comments and routes warm social DMs to Conversations AI"
    ],
    greeting: "Hey there! I'm Elena Rostova, your social media manager here at AIPreneur. Honestly, I love taking the stress of daily posting off your plate. We can sit down together, pick either your company brand voice or your personal founder voice, and I'll map out your entire seven-day calendar with real photos, scroll-stopping hooks, and hashtags. Plus, whenever someone messages you on Instagram or LinkedIn, I'll reply right away and bring warm leads straight to your inbox!",
    videoScenes: [
      {
        pillLabel: "1. 7-Day Multi-Network Plan",
        actionBadge: "🗓️ Building 7-Day Calendar (Brand & Founder Voice)",
        spokenText: "Hey! It's Elena. So, first things first—let's map out your week. Here on my screen, I'm putting together your Monday through Sunday content plan. You can switch between your company brand voice and your personal founder voice anytime, and I pair every single day with real lifestyle photography.",
        renderScreenHTML: () => `
          <div style="margin-bottom:10px;display:flex;justify-content:space-between;align-items:center;">
            <strong style="color:#FFF;font-size:0.88rem;">📅 Elena's 7-Day Multi-Network Content Plan (Mon–Sun)</strong>
            <span style="background:rgba(236,72,153,0.2);color:#F472B6;padding:3px 10px;border-radius:999px;font-size:0.72rem;font-weight:700;">Voice: Brand + Individual Founder</span>
          </div>
          <div class="visual-calendar-strip">
            ${[
              { d: "Mon", p: "LinkedIn + IG", img: REAL_PHOTOS.postTeam, title: "Founder Story Carousel" },
              { d: "Tue", p: "IG Reel + X", img: REAL_PHOTOS.postStudio, title: "Behind the Scenes Clip" },
              { d: "Wed", p: "LinkedIn + FB", img: REAL_PHOTOS.postAnalytics, title: "Client ROI Case Study" },
              { d: "Thu", p: "All 4 Networks", img: REAL_PHOTOS.postFounder, title: "Interactive Team Poll" },
              { d: "Fri", p: "IG + Facebook", img: REAL_PHOTOS.postLaptop, title: "Plain-English AI Guide" },
              { d: "Sat", p: "Reel + Shorts", img: REAL_PHOTOS.postPodcast, title: "Weekend Founder Tip" },
              { d: "Sun", p: "LI + IG + X", img: REAL_PHOTOS.postClient, title: "Comment 'DEMO' Trigger" }
            ].map(item => `
              <div class="vcal-day-card">
                <div style="display:flex;justify-content:space-between;color:#38BDF8;font-weight:700;">
                  <span>${item.d}</span><span>✓</span>
                </div>
                <img src="${item.img}" alt="${item.title}" />
                <div style="color:#FFF;font-weight:600;line-height:1.2;margin-bottom:3px;">${item.title}</div>
                <span style="color:#94A3B8;font-size:0.66rem;">${item.p}</span>
              </div>
            `).join("")}
          </div>
        `
      },
      {
        pillLabel: "2. Visual Post & Hook Designer",
        actionBadge: "🎨 Designing Photo Post Template, Hooks & Hashtags",
        spokenText: "Now, look at how we design the actual post. I take a real studio photo, add a clean visual headline banner, and write three natural hooks and captions that sound like a real person wrote them—never stiff or robotic.",
        renderScreenHTML: () => `
          <div style="display:grid;grid-template-columns:1.05fr 0.95fr;gap:14px;align-items:center;">
            <div class="real-social-post-card">
              <div class="rsp-header">
                <div class="rsp-author">
                  <img src="${REAL_PHOTOS.elena}" alt="Elena" />
                  <div>
                    <strong style="color:#FFF;display:block;line-height:1.1;">AIPreneur Global</strong>
                    <span style="font-size:0.68rem;color:#94A3B8;">Visual Post Template Preview • 1080×1080 HD</span>
                  </div>
                </div>
                <span class="plat-badge plat-ig">Template Ready</span>
              </div>
              <div class="rsp-image-wrap" style="height:155px;">
                <img src="${REAL_PHOTOS.postTeam}" alt="Post Visual" />
                <div class="rsp-template-overlay">
                  ✨ HIRE YOUR 24/7 AI WORKFORCE ON DAY 1 • AIPRENEURGLOBAL.COM
                </div>
              </div>
              <div class="rsp-body">
                <p><strong>Hook:</strong> "Most founders don't have a lead problem—they have a 6:05 PM missed-call and unreturned-DM problem."</p>
                <span class="rsp-hashtags">#AIPreneur #AIWorkforce #FounderGrowth #SocialMediaAI</span>
              </div>
            </div>
            <div class="ws-output-card" style="padding:12px;">
              <h5>✍️ Live Hook, Caption &amp; Voice Studio</h5>
              <p style="font-size:0.77rem;color:#E2E8F0;margin-bottom:6px;"><strong>✓ Hook #1 (Contrarian):</strong> "Stop hiring agencies for tasks an AI employee finishes in 4 seconds."</p>
              <p style="font-size:0.77rem;color:#E2E8F0;margin-bottom:6px;"><strong>✓ Hook #2 (Founder Voice):</strong> "How I reclaimed 18 hours/week with my own AI Social Media Manager."</p>
              <p style="font-size:0.77rem;color:#34D399;"><strong>✓ Brand &amp; Individual Voice Verified:</strong> Zero robotic buzzwords.</p>
            </div>
          </div>
        `
      },
      {
        pillLabel: "3. LinkedIn, IG, FB & X Posts",
        actionBadge: "🚀 Publishing Visual Posts to LinkedIn, IG, FB & X",
        spokenText: "Once you're happy with the look, I publish it across LinkedIn, Instagram, Facebook, and X all at once. You can see all four live post cards right here with their real photos and captions.",
        renderScreenHTML: () => `
          <div class="visual-social-posts-grid">
            ${[
              { net: "LinkedIn", cls: "plat-li", img: REAL_PHOTOS.postFounder, overlay: "B2B CASE STUDY: +340% PIPELINE ROI", text: "How scaling companies deploy custom AI Employee Avatars across sales & operations.", stats: "👍 148 • 💬 32 Comments • Published ✓" },
              { net: "Instagram", cls: "plat-ig", img: REAL_PHOTOS.postStudio, overlay: "MEET ELENA: YOUR 24/7 SOCIAL MANAGER", text: "Swipe through our 7-day automated content studio! Drop 'WORKFORCE' below 👇", stats: "❤️ 412 • 💬 64 DMs • Published ✓" },
              { net: "Facebook", cls: "plat-fb", img: REAL_PHOTOS.postClient, overlay: "NEVER MISS A CUSTOMER CALL AGAIN", text: "Local business owners: see how Sophia & Elena capture leads while you sleep.", stats: "👍 96 • ↗️ 19 Shares • Published ✓" },
              { net: "X (Twitter)", cls: "plat-x", img: REAL_PHOTOS.postAnalytics, overlay: "THE 2026 AUTONOMOUS BUSINESS STACK", text: "1/ We replaced 6 disconnected SaaS tools with 1 unified AI Workforce portal...", stats: "🔁 54 Reposts • ❤️ 290 • Published ✓" }
            ].map(p => `
              <div class="real-social-post-card">
                <div class="rsp-header">
                  <span class="plat-badge ${p.cls}">${p.net}</span>
                  <span style="color:#34D399;font-size:0.7rem;font-weight:700;">● Live Post</span>
                </div>
                <div class="rsp-image-wrap" style="height:82px;">
                  <img src="${p.img}" alt="${p.net}" />
                  <div class="rsp-template-overlay" style="font-size:0.65rem;padding:3px 7px;">${p.overlay}</div>
                </div>
                <div class="rsp-body">
                  <p>${p.text}</p>
                  <div class="rsp-footer"><span>${p.stats}</span><span>aipreneurglobal.com</span></div>
                </div>
              </div>
            `).join("")}
          </div>
        `
      },
      {
        pillLabel: "4. Comment & DM → Conversations AI",
        actionBadge: "💬 Monitoring Comments & Routing DMs to Conversations AI",
        spokenText: "And here is my favorite part. When someone comments or slides into your DMs asking about pricing, I reply warmly in seconds and route their conversation straight into your unified inbox so you never lose a lead.",
        renderScreenHTML: () => `
          <div style="display:grid;grid-template-columns:1fr 1fr;gap:14px;">
            <div class="ws-output-card" style="padding:12px;">
              <h5>📲 Incoming Instagram &amp; LinkedIn DMs</h5>
              <div style="display:flex;gap:10px;align-items:center;background:rgba(255,255,255,0.04);padding:8px;border-radius:8px;margin-bottom:8px;">
                <img src="${REAL_PHOTOS.postStudio}" style="width:48px;height:48px;border-radius:8px;object-fit:cover;" />
                <div style="font-size:0.76rem;">
                  <strong style="color:#F472B6;">@marcus_agency (Instagram DM):</strong>
                  <p style="color:#FFF;">"Saw your Reel! Can we deploy Elena &amp; Sophia for our 10 client locations?"</p>
                </div>
              </div>
              <div style="background:rgba(236,72,153,0.15);border-left:3px solid #EC4899;padding:8px;border-radius:6px;font-size:0.75rem;color:#F8FAFC;">
                <strong>Elena's Auto-Reply (0.8s):</strong> "Hi Marcus! Yes—I've just sent you our partner pricing link and routed your message to our Conversations AI inbox!"
              </div>
            </div>
            <div class="ws-output-card" style="padding:12px;border-color:#10B981;">
              <h5 style="color:#34D399;">📥 Routed Live to Conversations AI &amp; CRM</h5>
              <p style="font-size:0.78rem;color:#E2E8F0;margin-bottom:8px;"><strong>Unified Inbox Ticket #4092:</strong></p>
              <p style="font-size:0.76rem;color:#CBD5E1;margin-bottom:5px;">• <strong>Source:</strong> Instagram DM + LinkedIn Comment</p>
              <p style="font-size:0.76rem;color:#34D399;font-weight:700;">✓ Synced to CRM AI Pipeline ($12,000 ARR Opportunity)</p>
            </div>
          </div>
        `
      }
    ],
    demoConversation: [
      { speaker: "Business Owner", type: "customer", text: "Elena, can you put together our weekly social plan in my founder voice and keep an eye on our Instagram DMs?" },
      { speaker: "Elena Rostova (AI Social Media Manager)", type: "agent", text: "You got it! I've mapped out your Monday-through-Sunday calendar across LinkedIn, Instagram, Facebook, and X with real photos and hooks. And whenever someone DMs you about pricing, I'll reply warmly and route them straight to your inbox!" }
    ],
    automations: [
      "✓ 7-Day Visual Calendar (Brand & Individual Voice) Ready",
      "✓ Photo Templates Published to LinkedIn, IG, FB & X",
      "✓ Social Comments Replied & DMs Routed to Conversations AI"
    ]
  },
  {
    id: "receptionist",
    name: "Sophia Sterling",
    roleTitle: "AI Receptionist",
    category: "frontline",
    portrait: REAL_PHOTOS.sophia,
    personaLook: "concierge",
    accent: "#4F46E5",
    badge: "24/7 Voice & Calendar Booking",
    channels: "Phone, Voice AI, Calendar, SMS",
    monthlyOutput: "412 Calls Answered • 89 Booked",
    kpi: "Answers instantly, books appointments 24/7, and increases profit margins by 15%–30%.",
    description: "Meet Sophia Sterling—your warm front-desk AI Receptionist who greets every caller like a real human concierge, answers questions naturally, and books appointments into your calendar.",
    skills: [
      "Answers inbound phone calls & web inquiries in <1 second",
      "Captures lead name, phone, email & service requirements",
      "Checks live calendar availability and books estimates",
      "Learns your entire business from a 1-click website scrape"
    ],
    greeting: "Hello there, lovely to meet you! I'm Sophia Sterling, your front-desk receptionist here at AIPreneur. You know how easy it is to miss a great client call when you're in a meeting or having dinner with family? Well, I'm here to make sure that never happens. I pick up on the first ring with a warm smile in my voice, answer your caller's questions naturally, and book their appointment right onto your calendar!",
    videoScenes: [
      {
        pillLabel: "1. Live Inbound Call",
        actionBadge: "📞 Answering Inbound Customer Call (0.4s)",
        spokenText: "Hi there, Sophia speaking! Look at how I handle an evening phone call from Lucia. Even though it's 8:45 at night, I pick up right away, greet her warmly, and ask how we can help with her project.",
        renderScreenHTML: () => `
          <div style="display:grid;grid-template-columns:240px 1fr;gap:14px;align-items:center;">
            <div style="background:#111827;border:2px solid #4F46E5;border-radius:18px;padding:14px;text-align:center;">
              <img src="${REAL_PHOTOS.postClient}" style="width:62px;height:62px;border-radius:50%;object-fit:cover;border:2px solid #34D399;margin-bottom:6px;" />
              <strong style="color:#FFF;display:block;font-size:0.86rem;">Lucia Fernandez</strong>
              <span style="color:#34D399;font-size:0.72rem;font-weight:700;">● Connected Live (00:18)</span>
              <div style="margin-top:8px;font-size:0.74rem;color:#CBD5E1;background:rgba(255,255,255,0.05);padding:6px;border-radius:8px;">
                "Hi! I'd like to get a custom backyard deck built. Do you have time for an estimate?"
              </div>
            </div>
            <div class="ws-output-card">
              <h5>🎙️ Sophia's Real-Time Voice Qualification</h5>
              <p style="font-size:0.8rem;color:#E2E8F0;margin-bottom:8px;"><strong>Sophia:</strong> "Oh, we'd love to help you with your backyard deck, Lucia! I've got your number down—let me check our estimator's schedule for tomorrow afternoon."</p>
              <p style="font-size:0.76rem;color:#38BDF8;">✓ Trained automatically from your website's services and FAQs.</p>
            </div>
          </div>
        `
      },
      {
        pillLabel: "2. Live Calendar Booking",
        actionBadge: "📅 Locking Appointment into Calendar Grid",
        spokenText: "While we're chatting on the phone, I check your live calendar and see that Thursday at 2:00 PM is wide open. I lock Lucia's estimate right into that slot so there's zero back-and-forth.",
        renderScreenHTML: () => `
          <div class="ws-output-card">
            <h5>📅 Live Team Calendar Grid — Appointment Locked</h5>
            <div style="display:grid;grid-template-columns:repeat(4,1fr);gap:8px;margin-top:8px;">
              <div style="background:rgba(255,255,255,0.04);padding:8px;border-radius:8px;font-size:0.74rem;"><strong>Thu 10:00 AM</strong><br/><span style="color:#94A3B8;">Team Standup</span></div>
              <div style="background:rgba(255,255,255,0.04);padding:8px;border-radius:8px;font-size:0.74rem;"><strong>Thu 12:00 PM</strong><br/><span style="color:#94A3B8;">Site Inspection</span></div>
              <div style="background:rgba(16,185,129,0.22);border:2px solid #10B981;padding:8px;border-radius:8px;font-size:0.74rem;">
                <strong style="color:#34D399;">Thu 2:00 PM ✓ NEW</strong><br/>
                <span style="color:#FFF;font-weight:700;">Lucia Fernandez Estimate</span>
              </div>
              <div style="background:rgba(255,255,255,0.04);padding:8px;border-radius:8px;font-size:0.74rem;"><strong>Thu 4:00 PM</strong><br/><span style="color:#94A3B8;">Open Slot</span></div>
            </div>
          </div>
        `
      },
      {
        pillLabel: "3. SMS Invite & Directions",
        actionBadge: "💬 Sending Instant SMS Confirmation to Caller",
        spokenText: "As soon as we hang up, I send Lucia a friendly text message with her appointment details and calendar invite, so she feels taken care of right away.",
        renderScreenHTML: () => `
          <div class="ws-output-card">
            <h5>📱 Instant SMS Confirmation Dispatched</h5>
            <div style="background:rgba(79,70,229,0.22);border:1px solid #6366F1;padding:12px;border-radius:12px;font-size:0.8rem;color:#FFF;">
              <strong>To: Lucia Fernandez (555-678-9800)</strong><br/>
              "Hi Lucia! Your free estimate with Apex Solutions is confirmed for Tomorrow (Thursday) at 2:00 PM. Just reply here if you need anything at all! — Sophia"
            </div>
          </div>
        `
      },
      {
        pillLabel: "4. CRM Pipeline Sync",
        actionBadge: "💰 Syncing Lead & Call Recording to CRM AI",
        spokenText: "And by the time you open your laptop in the morning, Lucia's contact card, call recording, and booked appointment are already waiting for you in your CRM!",
        renderScreenHTML: () => `
          <div class="ws-output-card" style="border-color:#10B981;">
            <h5 style="color:#34D399;">✅ Complete Front-Desk Automation Summary</h5>
            <p style="font-size:0.8rem;color:#E2E8F0;">• <strong>Lead Created:</strong> Lucia Fernandez ($3,200 Est. Project Value)</p>
            <p style="font-size:0.8rem;color:#34D399;font-weight:700;">• <strong>Business Impact:</strong> +30% Profit Margin Lift from Recovered Calls</p>
          </div>
        `
      }
    ],
    workspaceConfig: {
      toolTitle: "📞 Sophia's Live Call Qualification & Calendar Booking Studio",
      inputLabel: "Caller Inquiry / Service Needed",
      inputDefault: "Hi, I need a free consultation for a commercial office renovation this Thursday afternoon.",
      secondaryLabel: "Caller Name & Phone",
      secondaryDefault: "David Miller • (555) 234-8910",
      buttonLabel: "📞 Simulate Inbound Call & Auto-Book",
      generateOutput: (inquiry, caller) => `
        <div class="ws-output-card">
          <h5>🎙️ Live Voice Call Transcript & Qualification</h5>
          <p><strong>Caller (${caller}):</strong> "${inquiry}"</p>
          <p style="margin-top:8px;color:#38BDF8;"><strong>Sophia Sterling:</strong> "Oh, I'd be delighted to help with that, ${caller.split(' ')[0]}! I see an open slot this Thursday at 2:30 PM for your consultation. I've locked that in for you and texted the invite to your phone!"</p>
        </div>
        <div class="ws-output-card">
          <h5>✅ Automated Actions Executed</h5>
          <p>• <strong>Calendar:</strong> Thursday 2:30 PM Estimate Locked</p>
          <p>• <strong>CRM AI:</strong> New Lead '${caller}' Created (Stage: Appointment Booked)</p>
        </div>
      `
    },
    demoConversation: [
      { speaker: "Sophia Sterling (AI Receptionist)", type: "agent", text: "Hi there! Thanks for calling Apex Home & Business Solutions. This is Sophia—how can I brighten your day and help you out?" },
      { speaker: "Lucia Fernandez (Customer)", type: "customer", text: "Hi Sophia! I'd love to get a custom consultation and project estimate this week." },
      { speaker: "Sophia Sterling (AI Receptionist)", type: "agent", text: "I'd be delighted to set that up for you, Lucia! I've locked in tomorrow at 2:00 PM on our calendar and just texted the confirmation to your phone." }
    ],
    automations: [
      "✓ Lead Captured in AIPreneur CRM",
      "✓ Calendar Appointment Booked (Tomorrow 2:00 PM)",
      "✓ SMS Confirmation Sent via Conversations AI"
    ]
  },
  {
    id: "sales_assistant",
    name: "Marcus Vance",
    roleTitle: "AI-Powered Sales Assistant",
    category: "sales",
    portrait: REAL_PHOTOS.marcus,
    personaLook: "executive",
    accent: "#06B6D4",
    badge: "Zoom Copilot & CRM Pipeline",
    channels: "CRM AI, Zoom/Meet, Email, Slack",
    monthlyOutput: "164 Meetings Summarized • 3.2x Close Rate",
    kpi: "Transcribes meetings, automates CRM updates, and delivers actionable coaching to convert more leads.",
    description: "Meet Marcus Vance—your executive AI Sales Assistant who joins your discovery calls like a seasoned sales partner, captures key objections, updates your CRM board, and drafts personal follow-ups.",
    skills: [
      "Real-time Zoom/Meet transcription & buyer sentiment analysis",
      "Moves Kanban CRM deal cards & logs MEDDIC notes automatically",
      "Generates personalized post-call proposals & follow-up emails",
      "Provides next-best-action sales coaching to close deals faster"
    ],
    greeting: "Hey, good to see you! I'm Marcus Vance, your sales assistant here at AIPreneur. Look, we both know that updating CRM fields and typing up call notes is the last thing you want to do after a great client meeting. So let me handle that for you. I sit in on your Zoom calls, capture the client's budget and concerns, move the deal card on your board, and draft a personal follow-up email before you even pour your next cup of coffee.",
    videoScenes: [
      {
        pillLabel: "1. Live Zoom Call Notes",
        actionBadge: "🎥 Capturing Live Zoom Discovery Call Insights",
        spokenText: "Hey, Marcus here. Let's look at this discovery call with Sarah at Horizon Dental. While you focus on building rapport with her, I'm quietly noting down her 5,400 dollar budget and the fact that she needs all three clinics live within a week.",
        renderScreenHTML: () => `
          <div style="display:grid;grid-template-columns:1fr 1fr;gap:12px;">
            <div class="real-social-post-card">
              <div class="rsp-header"><span class="plat-badge plat-li">Zoom Discovery Call</span><span style="color:#34D399;font-size:0.7rem;">● Recording</span></div>
              <div class="rsp-image-wrap" style="height:120px;">
                <img src="${REAL_PHOTOS.postFounder}" alt="Zoom Call" />
                <div class="rsp-template-overlay">Client: Sarah Jenkins (VP, Horizon Dental — 3 Locations)</div>
              </div>
              <div class="rsp-body"><p>"We want AI Receptionist + Social AI for all 3 clinics, as long as setup takes under a week."</p></div>
            </div>
            <div class="ws-output-card">
              <h5>🧠 Marcus's Real-Time Call Intelligence</h5>
              <p style="font-size:0.78rem;color:#E2E8F0;margin-bottom:6px;">• <strong>Detected Budget:</strong> $5,400/yr ARR</p>
              <p style="font-size:0.78rem;color:#34D399;">• <strong>Coaching Tip:</strong> Emphasize 10-minute website scrape onboarding!</p>
            </div>
          </div>
        `
      },
      {
        pillLabel: "2. Kanban CRM Board",
        actionBadge: "📊 Moving Deal Card on CRM Kanban Board",
        spokenText: "The second the call wraps up, you don't have to touch a single spreadsheet. I move Horizon Dental straight into Proposal Sent on your CRM board and attach the full summary.",
        renderScreenHTML: () => `
          <div style="display:grid;grid-template-columns:repeat(3,1fr);gap:10px;">
            <div style="background:rgba(255,255,255,0.03);border:1px solid var(--border);padding:10px;border-radius:10px;font-size:0.75rem;">
              <strong style="color:#94A3B8;">QUALIFIED LEAD</strong>
              <div style="margin-top:8px;padding:8px;background:#111827;border-radius:8px;">Apex Legal ($2,400)</div>
            </div>
            <div style="background:rgba(6,182,212,0.15);border:2px solid #06B6D4;padding:10px;border-radius:10px;font-size:0.75rem;">
              <strong style="color:#38BDF8;">PROPOSAL SENT ✓</strong>
              <div style="margin-top:8px;padding:8px;background:#111827;border-left:3px solid #10B981;border-radius:8px;">
                <strong style="color:#FFF;">Horizon Dental (3 Clinics)</strong><br/>
                <span style="color:#34D399;">$5,400 ARR • Auto-Moved by Marcus</span>
              </div>
            </div>
            <div style="background:rgba(255,255,255,0.03);border:1px solid var(--border);padding:10px;border-radius:10px;font-size:0.75rem;">
              <strong style="color:#34D399;">CLOSED WON</strong>
              <div style="margin-top:8px;padding:8px;background:#111827;border-radius:8px;">Nova MedSpa ($4,800)</div>
            </div>
          </div>
        `
      },
      {
        pillLabel: "3. Proposal Email Draft",
        actionBadge: "✉️ Drafting Personalized Proposal Email",
        spokenText: "Then, I draft a warm, conversational follow-up email to Sarah that directly answers her question about fast setup across all three dental clinics.",
        renderScreenHTML: () => `
          <div class="ws-output-card">
            <h5>✉️ Auto-Drafted Proposal Email</h5>
            <p style="font-size:0.79rem;color:#FFF;"><strong>Subject:</strong> Horizon Dental 3-Clinic AI Workforce Rollout (10-Minute Setup)</p>
            <p style="font-size:0.78rem;color:#CBD5E1;margin-top:6px;">"Hi Sarah, really enjoyed our conversation today! Because our AI Receptionist and Social Media Manager learn directly from your website, all 3 Horizon Dental clinics will be live in 15 minutes..."</p>
          </div>
        `
      },
      {
        pillLabel: "4. Open Tracking & Close",
        actionBadge: "📈 Tracking Proposal Opens & Follow-Up",
        spokenText: "And when Sarah opens that proposal five minutes later, I ping you right away so we can lock in the deal while you're top of mind.",
        renderScreenHTML: () => `
          <div class="ws-output-card" style="border-color:#10B981;">
            <h5 style="color:#34D399;">🔔 Live Yesware &amp; CRM Engagement Alert</h5>
            <p style="font-size:0.8rem;color:#E2E8F0;">• <strong>Sarah Jenkins</strong> opened your proposal 3 times and clicked the pricing link.</p>
          </div>
        `
      }
    ],
    workspaceConfig: {
      toolTitle: "💼 Marcus's Live Sales Call Summarizer, CRM Updater & Proposal Studio",
      inputLabel: "Paste Raw Meeting Notes or Discovery Call Summary",
      inputDefault: "Spoke with Sarah Jenkins, VP at Horizon Dental (3 locations). Interested in AI Receptionist + Social AI. Budget ~$450/mo.",
      secondaryLabel: "Target Deal Value & Next Stage",
      secondaryDefault: "$5,400 ARR • Move to Proposal Sent",
      buttonLabel: "✍️ Generate CRM Summary & Follow-Up Email",
      generateOutput: (notes, deal) => `
        <div class="ws-output-card">
          <h5>📊 Auto-Extracted CRM AI Deal Record (${deal})</h5>
          <p>• <strong>Summary:</strong> ${notes}</p>
          <p>• <strong>CRM Status:</strong> Deal card moved to <em>${deal}</em></p>
        </div>
        <div class="ws-output-card">
          <h5>✉️ Ready-to-Send Follow-Up Email</h5>
          <p>"Hi Sarah, really enjoyed speaking today! We'll pre-train your AI Receptionist directly from your website in 10 minutes..."</p>
        </div>
      `
    },
    demoConversation: [
      { speaker: "Founder / Sales Lead", type: "customer", text: "Marcus, can you summarize my call with Horizon Dental and move their deal card?" },
      { speaker: "Marcus Vance (AI Sales Assistant)", type: "agent", text: "Already taken care of! Horizon Dental is ready for a 3-clinic rollout next month. I moved the deal to Proposal Sent and drafted your follow-up email." }
    ],
    automations: [
      "✓ Call Transcript Indexed",
      "✓ CRM Opportunity Updated ($5,400 ARR)",
      "✓ Tracked Follow-Up Sequence Queued"
    ]
  },
  {
    id: "blogger",
    name: "Liam O'Connor",
    roleTitle: "AI Blogger",
    category: "content",
    portrait: REAL_PHOTOS.liam,
    personaLook: "blogger_look",
    accent: "#10B981",
    badge: "SEO Articles & WordPress",
    channels: "WordPress, Google Search Console, Blog",
    monthlyOutput: "16 Illustrated SEO Articles / Mo",
    kpi: "Researches high-intent keywords, writes helpful articles with featured photography, and auto-publishes to WordPress weekly.",
    description: "Meet Liam O'Connor—your expressive Irish editorial AI Blogger who researches what your customers are actually searching for, writes engaging human stories, and publishes to WordPress.",
    skills: [
      "Performs live keyword gap & search-intent clustering",
      "Writes 2,000+ word articles with real hero photography & tables",
      "Generates internal links, meta descriptions, and FAQ schema",
      "One-click auto-publishing directly to Managed WordPress Hosting"
    ],
    greeting: "Hello there! I'm Liam O'Connor, your editorial blogger here at AIPreneur. Nobody likes reading dry, robotic blog posts stuffed with keywords—and search engines don't like them either! So every week, I research the real questions your customers are asking, write a warm, genuinely helpful article with photography and comparison tables, and publish it straight to your WordPress site.",
    videoScenes: [
      {
        pillLabel: "1. Keyword & Visual Article Draft",
        actionBadge: "✍️ Writing Illustrated SEO Article in WordPress Editor",
        spokenText: "Hello! It's Liam here. Take a look at my WordPress editor. I've just researched what new founders are searching for and drafted a two-thousand-word guide in warm, plain English—complete with a hero photograph and clear headings.",
        renderScreenHTML: () => `
          <div class="real-social-post-card">
            <div class="rsp-header">
              <span class="plat-badge plat-li">WordPress Gutenberg Editor • Draft Saved</span>
              <span style="color:#34D399;font-size:0.72rem;font-weight:700;">SEO Score: 98 / 100</span>
            </div>
            <div class="rsp-image-wrap" style="height:110px;">
              <img src="${REAL_PHOTOS.postLaptop}" alt="Blog Hero" />
              <div class="rsp-template-overlay">H1: How to Build a 24/7 Business with AI Employee Avatars in 2026</div>
            </div>
            <div class="rsp-body">
              <p><strong>Introduction (Plain-English Voice):</strong> Starting a company used to mean choosing between working 80-hour weeks or taking on massive payroll overhead...</p>
            </div>
          </div>
        `
      },
      {
        pillLabel: "2. Comparison Table & Schema",
        actionBadge: "📊 Embedding Comparison Table & FAQ Schema",
        spokenText: "To make sure readers stay engaged and Google ranks your post at the top, I weave in easy-to-scan comparison tables and helpful FAQ blocks.",
        renderScreenHTML: () => `
          <div class="ws-output-card">
            <h5>📊 Embedded SEO Comparison Table &amp; Schema</h5>
            <p style="font-size:0.78rem;color:#E2E8F0;margin-bottom:6px;">• <strong>H2 Section Added:</strong> Traditional Hiring ($18,000/mo) vs. AIPreneur Workforce</p>
            <p style="font-size:0.78rem;color:#34D399;">✓ Google Helpful Content &amp; E-E-A-T Compliance Verified</p>
          </div>
        `
      },
      {
        pillLabel: "3. 1-Click WordPress Publish",
        actionBadge: "🌐 Publishing Live to WordPress & Search Console",
        spokenText: "Then, with a single click, I publish the article live to your WordPress blog with all its meta descriptions and image tags in place.",
        renderScreenHTML: () => `
          <div class="ws-output-card" style="border-color:#10B981;">
            <h5 style="color:#34D399;">🌐 Published Live on WordPress CMS</h5>
            <p style="font-size:0.8rem;color:#FFF;"><strong>Live URL:</strong> https://aipreneurglobal.com/blog/build-24-7-business-ai-employee-avatars</p>
          </div>
        `
      },
      {
        pillLabel: "4. Handoff to Elena (Social AI)",
        actionBadge: "🔄 Passing Published Blog to Elena for Social Promotion",
        spokenText: "And right after publishing, I hand the article over to Elena so she can share it with your followers on LinkedIn, Instagram, Facebook, and X!",
        renderScreenHTML: () => `
          <div class="ws-output-card">
            <h5>🤝 Cross-Agent Teamwork: Blogger → Social Media Manager</h5>
            <p style="font-size:0.8rem;color:#E2E8F0;">• <strong>Liam O'Connor (AI Blogger)</strong> sent the published article to <strong>Elena Rostova (Social Media Manager)</strong>.</p>
          </div>
        `
      }
    ],
    workspaceConfig: {
      toolTitle: "✍️ Liam's Live SEO Blog Writer & WordPress Publisher",
      inputLabel: "Target SEO Keyword or Article Topic",
      inputDefault: "How to Utilize AI Employee Avatars While Forming a New Business in 2026",
      secondaryLabel: "Target WordPress Site & Tone",
      secondaryDefault: "https://aipreneurglobal.com/blog • Plain-English Authority",
      buttonLabel: "✍️ Write Illustrated SEO Article & Publish",
      generateOutput: (topic, site) => `
        <div class="real-social-post-card">
          <div class="rsp-header"><span class="plat-badge plat-li">WordPress Live Preview</span><span style="color:#34D399;">98/100 SEO</span></div>
          <div class="rsp-image-wrap" style="height:105px;">
            <img src="${REAL_PHOTOS.postLaptop}" alt="Blog" />
            <div class="rsp-template-overlay">${topic}</div>
          </div>
          <div class="rsp-body"><p><strong>Published to:</strong> ${site}</p></div>
        </div>
        <div class="ws-output-card">
          <h5>🌐 WordPress Auto-Publish Telemetry</h5>
          <p>• <strong>Status:</strong> <span style="color:#34D399;font-weight:700;">✓ Published Live &amp; Sent to Elena (Social AI)</span></p>
        </div>
      `
    },
    demoConversation: [
      { speaker: "Marketing Director", type: "customer", text: "Liam, could you write a helpful blog post for founders who want to automate their business?" },
      { speaker: "Liam O'Connor (AI Blogger)", type: "agent", text: "I'd love to! I've just written and published a 2,100-word guide to your WordPress blog with featured photography and comparison tables." }
    ],
    automations: [
      "✓ Google Helpful Content Audit: 98/100",
      "✓ Auto-Published to WordPress CMS",
      "✓ Syndicated to Elena (Social AI)"
    ]
  },
  {
    id: "writer",
    name: "Maya Lin",
    roleTitle: "AI Copywriter",
    category: "content",
    portrait: REAL_PHOTOS.maya,
    personaLook: "copywriter_look",
    accent: "#F59E0B",
    badge: "Landing Pages, Ads & Emails",
    channels: "Landing Pages, Email Funnels, Ads, SOPs",
    monthlyOutput: "45+ Conversion Pages & Email Funnels",
    kpi: "Crafts high-converting landing pages, ad copy, and email campaigns in clear, human-first English.",
    description: "Meet Maya Lin—your conversion AI Copywriter who writes landing pages, email sequences, and ad campaigns that read like a thoughtful conversation over coffee rather than a sales pitch.",
    skills: [
      "Writes conversion-engineered landing pages & hero sections",
      "Builds multi-touch email & SMS drip campaigns",
      "Zero machine cliches—trained on AIPreneur's plain-English creed",
      "Adapts seamlessly to your founder or client brand voice"
    ],
    greeting: "Hi there! I'm Maya Lin, your copywriter here at AIPreneur. My philosophy is simple: great copy should sound like a helpful friend explaining something over coffee, never like a pushy brochure. Whether you need a new landing page, a three-part email sequence, or fresh ad copy, I'll write it in your voice so your customers connect with you right away.",
    videoScenes: [
      {
        pillLabel: "1. Landing Page Hero Copy",
        actionBadge: "🖥️ Writing Visual Landing Page Hero & CTA",
        spokenText: "Hi, Maya here! Let's start with your landing page hero section. Notice how I pair a clear, relatable headline with real team photography so visitors immediately understand how you help them.",
        renderScreenHTML: () => `
          <div class="real-social-post-card">
            <div class="rsp-header"><span class="plat-badge plat-fb">Landing Page Visual Preview</span><span style="color:#34D399;">+42% Conversion Lift</span></div>
            <div class="rsp-image-wrap" style="height:115px;">
              <img src="${REAL_PHOTOS.postTeam}" alt="Landing Page Hero" />
              <div class="rsp-template-overlay">Headline: Stop Missing Calls &amp; Working Late—Hire Your 24/7 AI Workforce</div>
            </div>
            <div class="rsp-body">
              <p><strong>Subhead:</strong> Deploy lifelike AI employees for reception, social media, sales, blogging, and support under your brand on aipreneurglobal.com.</p>
            </div>
          </div>
        `
      },
      {
        pillLabel: "2. 3-Part Email Drip Sequence",
        actionBadge: "✉️ Writing 3-Part Email Nurture Sequence",
        spokenText: "Next, I write a warm three-day email sequence for leads who check out your website—focusing on helpful stories and real results rather than high-pressure sales tactics.",
        renderScreenHTML: () => `
          <div class="ws-output-card">
            <h5>✉️ Maya's 3-Part Conversion Email Funnel</h5>
            <p style="font-size:0.78rem;color:#E2E8F0;margin-bottom:5px;">• <strong>Email 1 (Day 1):</strong> "What did missed calls cost you this week, {{first_name}}?"</p>
            <p style="font-size:0.78rem;color:#34D399;">• <strong>Email 3 (Day 5):</strong> "Your custom AI Employee is ready to activate on aipreneurglobal.com"</p>
          </div>
        `
      },
      {
        pillLabel: "3. Ad Copy Variations",
        actionBadge: "🎯 Writing High-CTR Google & Meta Ad Copy",
        spokenText: "I also put together five conversational ad variations for LinkedIn, Facebook, and Google so you can test which hook resonates best with your audience.",
        renderScreenHTML: () => `
          <div class="ws-output-card">
            <h5>🎯 High-CTR Meta &amp; LinkedIn Ad Copy Variations</h5>
            <p style="font-size:0.78rem;color:#E2E8F0;"><strong>Ad Variant A:</strong> "Forming a business? Don't hire overhead—hire 10 lifelike AI Employees working 24/7."</p>
          </div>
        `
      },
      {
        pillLabel: "4. Push to Campaigns AI",
        actionBadge: "🚀 Syncing Copy & Emails into Campaigns AI",
        spokenText: "And once everything looks good, I load the entire sequence straight into your Campaigns dashboard so it's ready to roll!",
        renderScreenHTML: () => `
          <div class="ws-output-card" style="border-color:#10B981;">
            <h5 style="color:#34D399;">✅ Synced to AIPreneur Campaigns AI</h5>
            <p style="font-size:0.8rem;color:#E2E8F0;">• 38.4% Average Open Rate • 9.6% Reply Rate • Zero Robotic Words</p>
          </div>
        `
      }
    ],
    workspaceConfig: {
      toolTitle: "✍️ Maya's Live Landing Page & Email Funnel Copywriting Studio",
      inputLabel: "Product / Service Offer to Promote",
      inputDefault: "AIPreneur 24/7 AI Workforce Bundle for Local Agencies & Founders",
      secondaryLabel: "Copy Format & Voice Style",
      secondaryDefault: "Landing Page Hero + 3-Day Email Funnel • Direct & Persuasive",
      buttonLabel: "✍️ Write Visual Landing Page & Email Funnel",
      generateOutput: (offer, format) => `
        <div class="real-social-post-card">
          <div class="rsp-header"><span class="plat-badge plat-fb">Landing Page Hero Mockup</span><span style="color:#34D399;">Conversion Ready</span></div>
          <div class="rsp-image-wrap" style="height:100px;">
            <img src="${REAL_PHOTOS.postTeam}" alt="Hero" />
            <div class="rsp-template-overlay">${offer}</div>
          </div>
        </div>
        <div class="ws-output-card">
          <h5>✉️ 3-Part Email Drip Sequence (${format})</h5>
          <p>• <strong>Day 1:</strong> "What did missed calls cost you this week, {{first_name}}?"</p>
        </div>
      `
    },
    demoConversation: [
      { speaker: "Agency Founder", type: "customer", text: "Maya, can you write a warm 3-part email sequence for our new leads?" },
      { speaker: "Maya Lin (AI Copywriter)", type: "agent", text: "Of course! I've written a conversational 3-day sequence along with a matching landing page hero and loaded both into Campaigns AI." }
    ],
    automations: [
      "✓ Visual Landing Page Copy Created",
      "✓ 3-Part Email Drip Synced",
      "✓ A/B Subject Lines Activated"
    ]
  },
  {
    id: "content_editor",
    name: "Claude Bennett",
    roleTitle: "AI Content Creator & Video/Visual Editor",
    category: "content",
    portrait: REAL_PHOTOS.claude,
    personaLook: "editor_look",
    accent: "#8B5CF6",
    badge: "Reels, Video Edits & Thumbnails",
    channels: "Reels, TikTok, YouTube Shorts, Canva/Templates",
    monthlyOutput: "60+ Edited Videos, Reels & Visual Assets",
    kpi: "Creates and edits short-form videos, kinetic subtitles, branded photo templates, and high-CTR thumbnails automatically.",
    description: "Meet Claude Bennett—your creative AI Content Creator & Video Editor who cuts vertical Reels, adds dynamic captions, balances voiceover audio, and designs scroll-stopping thumbnails.",
    skills: [
      "Edits short-form Reels, TikToks, and YouTube Shorts with kinetic captions",
      "Designs branded visual templates, carousels, and high-CTR thumbnails",
      "Syncs natural AI voiceovers and background music tracks automatically",
      "Exports ready-to-publish media directly to Elena (Social Media Manager)"
    ],
    greeting: "Hey, how's it going! I'm Claude Bennett, your content creator and video editor here at AIPreneur. Editing short-form videos and designing thumbnails can easily eat up your whole weekend. So just hand your raw clips or topics to me—I'll cut the dead air, drop in dynamic captions and B-roll, design a killer cover thumbnail, and pass the finished Reel straight to Elena to post!",
    videoScenes: [
      {
        pillLabel: "1. Multi-Track Video Timeline",
        actionBadge: "🎬 Cutting B-Roll & Syncing Voiceover on Timeline",
        spokenText: "Hey, Claude here! Welcome to my editing bay. On this timeline, I'm taking a raw clip, trimming out all the pauses, and layering in crisp B-roll and background audio so the pacing feels super snappy.",
        renderScreenHTML: () => `
          <div class="real-social-post-card">
            <div class="rsp-header">
              <span class="plat-badge plat-ig">Claude's Non-Linear Video &amp; Reel Editor • 60fps</span>
              <span style="color:#34D399;font-size:0.72rem;">● Rendering Reel</span>
            </div>
            <div class="rsp-image-wrap" style="height:115px;">
              <img src="${REAL_PHOTOS.postPodcast}" alt="Video Editor" />
              <div class="rsp-template-overlay">CAPTION OVERLAY: "3 AI Employees Every Founder Needs in 2026 ⚡"</div>
            </div>
            <div class="rsp-body">
              <div style="background:#090D1A;padding:6px 10px;border-radius:6px;font-size:0.7rem;color:#38BDF8;margin-bottom:4px;">
                🎞️ Video Track 1: [Scene A: Hook 0:00–0:04] ━━ [Scene B: Demo 0:04–0:18] ━━ [CTA 0:18–0:25]
              </div>
            </div>
          </div>
        `
      },
      {
        pillLabel: "2. Kinetic Subtitles & Branding",
        actionBadge: "✨ Adding Kinetic Captions & Color Grading",
        spokenText: "Since most people scroll on mute, I add word-by-word highlighted captions and warm studio color grading so viewers stay hooked from the first second.",
        renderScreenHTML: () => `
          <div class="ws-output-card">
            <h5>🎨 Claude's Visual &amp; Editorial Enhancements</h5>
            <p style="font-size:0.78rem;color:#E2E8F0;">• <strong>Retention Hook Zoom:</strong> Auto-keyframed in first 3 seconds</p>
            <p style="font-size:0.78rem;color:#34D399;">• <strong>Captions:</strong> 99.8% accurate highlighted word-by-word</p>
          </div>
        `
      },
      {
        pillLabel: "3. High-CTR Thumbnail Studio",
        actionBadge: "🖼️ Designing High-CTR YouTube & Reel Thumbnails",
        spokenText: "Next, I design a high-contrast cover thumbnail for YouTube and Instagram Reels so people actually click on your video.",
        renderScreenHTML: () => `
          <div class="real-social-post-card">
            <div class="rsp-header"><span class="plat-badge plat-li">High-CTR Thumbnail Template (1280×720)</span><span style="color:#34D399;">CTR Score: 9.4%</span></div>
            <div class="rsp-image-wrap" style="height:125px;">
              <img src="${REAL_PHOTOS.postFounder}" alt="Thumbnail" />
              <div class="rsp-template-overlay">THUMBNAIL TEXT: "I Replaced 40 Hrs of Busywork with AI Avatars!"</div>
            </div>
          </div>
        `
      },
      {
        pillLabel: "4. Export & Send to Social AI",
        actionBadge: "🚀 Exporting 9:16 & 16:9 Cuts to Elena",
        spokenText: "Once the edit is locked, I export both vertical and widescreen versions and send them over to Elena so your channels stay active all week!",
        renderScreenHTML: () => `
          <div class="ws-output-card" style="border-color:#10B981;">
            <h5 style="color:#34D399;">✅ Exported in 4 Formats &amp; Synced to Social AI</h5>
            <p style="font-size:0.8rem;color:#E2E8F0;">• 9:16 Instagram Reel &amp; TikTok Cut + 16:9 YouTube Master</p>
          </div>
        `
      }
    ],
    workspaceConfig: {
      toolTitle: "🎬 Claude's Live Content Creator, Video Editor & Thumbnail Studio",
      inputLabel: "Video / Visual Asset Topic to Create & Edit",
      inputDefault: "60-Second Reel: How AIPreneur's 10 Human-Like AI Employees Automate Your Business",
      secondaryLabel: "Editing Style & Aspect Ratio",
      secondaryDefault: "9:16 Vertical Reel + 16:9 Thumbnail • Kinetic Captions + Voiceover",
      buttonLabel: "🎬 Edit Video Scene & Generate Visual Template",
      generateOutput: (topic, style) => `
        <div class="real-social-post-card">
          <div class="rsp-header"><span class="plat-badge plat-ig">Edited Video &amp; Thumbnail Preview</span><span style="color:#34D399;">Ready</span></div>
          <div class="rsp-image-wrap" style="height:110px;">
            <img src="${REAL_PHOTOS.postPodcast}" alt="Edited Video" />
            <div class="rsp-template-overlay">${topic}</div>
          </div>
        </div>
        <div class="ws-output-card">
          <h5>🎞️ Claude's Editorial Render Log</h5>
          <p>• <strong>Handoff:</strong> Sent to Elena Rostova for 4-network publishing</p>
        </div>
      `
    },
    demoConversation: [
      { speaker: "Creative Director", type: "customer", text: "Claude, can you cut a 60-second Reel for our launch with captions and a thumbnail?" },
      { speaker: "Claude Bennett (AI Content Creator & Editor)", type: "agent", text: "All done! I trimmed the pauses, added kinetic subtitles, designed the cover thumbnail, and passed the master file to Elena." }
    ],
    automations: [
      "✓ 60s Reel Edited with Kinetic Subtitles",
      "✓ High-CTR Cover Thumbnail Generated",
      "✓ Handed Off to Elena for 4-Network Publishing"
    ]
  },
  {
    id: "data_analyst",
    name: "Arjun Mehta",
    roleTitle: "AI Data Analyst",
    category: "intelligence",
    portrait: REAL_PHOTOS.arjun,
    personaLook: "analyst",
    accent: "#3B82F6",
    badge: "AIR Framework & BI Charts",
    channels: "CRM, Reviews, Ads, Executive Reports",
    monthlyOutput: "Weekly Visual BI Dashboards • 100% Accuracy",
    kpi: "Uses the AIR framework to turn CRM, reviews, and social metrics into visual charts and growth roadmaps.",
    description: "Meet Arjun Mehta—your AI Data Analyst (Indian English Male Voice) who turns complex CRM, advertising, and social numbers into clear, practical business advice every Monday morning.",
    skills: [
      "Applies the AIR (Analyze, Interpret, Recommend) intelligence framework",
      "Cross-correlates Google/Meta ad spend with actual CRM closed revenue",
      "Detects churn risks and margin leaks before they impact cash flow",
      "Delivers automated Monday morning visual Executive Reports"
    ],
    greeting: "Namaste and hello! I'm Arjun Mehta, your data analyst here at AIPreneur. Most business owners are drowning in dashboards, yet nobody tells them what the numbers actually mean in plain English. That's where I come in. I connect your CRM, ad campaigns, and social metrics, spot where you're making or losing money, and give you three clear growth steps every Monday morning!",
    videoScenes: [
      {
        pillLabel: "1. Live BI Revenue Charts",
        actionBadge: "📊 Building Multi-Channel Revenue Attribution Charts",
        spokenText: "Namaste, Arjun here! Let's look at your numbers together. On this chart, I've connected your CRM deals directly to your phone calls and social channels, so you can see that Sophia's after-hours calls brought in over eighteen thousand dollars this month.",
        renderScreenHTML: () => `
          <div class="ws-output-card">
            <h5>📊 Arjun's Live Multi-Channel ROI Attribution Chart</h5>
            <div style="margin-top:10px;display:flex;flex-direction:column;gap:8px;font-size:0.76rem;">
              <div>
                <div style="display:flex;justify-content:space-between;"><span>📞 Sophia (After-Hours Calls Recovered)</span><strong style="color:#34D399;">$18,400 (340% ROI)</strong></div>
                <div style="height:10px;background:#1E293B;border-radius:99px;margin-top:3px;"><div style="width:88%;height:100%;background:#10B981;border-radius:99px;"></div></div>
              </div>
              <div>
                <div style="display:flex;justify-content:space-between;"><span>📱 Elena (LinkedIn &amp; IG DM Routing)</span><strong style="color:#38BDF8;">$14,200 (285% ROI)</strong></div>
                <div style="height:10px;background:#1E293B;border-radius:99px;margin-top:3px;"><div style="width:76%;height:100%;background:#06B6D4;border-radius:99px;"></div></div>
              </div>
            </div>
          </div>
        `
      },
      {
        pillLabel: "2. AIR Interpret Bottlenecks",
        actionBadge: "🔍 Identifying After-Hours Call & Ad Spend Bottlenecks",
        spokenText: "When I dig a little deeper using our AIR framework, I notice two really important patterns: first, a third of your best leads call after 6 PM, and second, short video Reels are bringing in leads at less than half the cost of static ads.",
        renderScreenHTML: () => `
          <div class="ws-output-card">
            <h5>🧠 AIR Step 2: Plain-English Diagnostic</h5>
            <p style="font-size:0.8rem;color:#E2E8F0;">• <strong>Finding #1:</strong> 34% of inbound phone inquiries happen between 6:00 PM and 9:00 AM.</p>
          </div>
        `
      },
      {
        pillLabel: "3. Growth Recommendations",
        actionBadge: "💡 Generating 3 Prioritized Growth Actions",
        spokenText: "So instead of just leaving you with charts, I give you a clear recommendation: shift six hundred dollars into video Reels and let Jordan follow up with past leads via text to unlock another twenty-two thousand in pipeline.",
        renderScreenHTML: () => `
          <div class="ws-output-card" style="border-color:#38BDF8;">
            <h5>🚀 AIR Step 3: Next 30-Day Growth Roadmap</h5>
            <p style="font-size:0.79rem;color:#FFF;">1. Reallocate $600 from generic display ads into Instagram &amp; LinkedIn video Reels.</p>
          </div>
        `
      },
      {
        pillLabel: "4. Monday Executive Report",
        actionBadge: "📬 Publishing Monday Executive Scorecard",
        spokenText: "And every Monday morning at 8 AM, I have this entire executive summary waiting for you right inside your Business App!",
        renderScreenHTML: () => `
          <div class="ws-output-card" style="border-color:#10B981;">
            <h5 style="color:#34D399;">✅ Published to AIPreneur Business App</h5>
            <p style="font-size:0.8rem;color:#E2E8F0;">• Executive PDF &amp; Interactive Scorecard delivered to Founder &amp; Client Portal.</p>
          </div>
        `
      }
    ],
    workspaceConfig: {
      toolTitle: "📈 Arjun's Live AIR Data Analyst & Visual BI Studio",
      inputLabel: "Enter Monthly Metrics or Business Goal to Analyze",
      inputDefault: "Ad Spend: $3,200 | Inbound Leads: 145 | Missed Calls: 22% | Avg Star Rating: 4.6 | Social DMs: 64",
      secondaryLabel: "Primary Optimization Target",
      secondaryDefault: "Maximize Booked Appointments & Lower Cost-Per-Lead",
      buttonLabel: "📊 Run AIR Analysis & Build Growth Roadmap",
      generateOutput: (metrics, goal) => `
        <div class="ws-output-card">
          <h5>🔍 AIR Step 1 & 2: Analyze & Interpret</h5>
          <p>• <strong>Input Telemetry:</strong> ${metrics}</p>
        </div>
        <div class="ws-output-card">
          <h5>🚀 AIR Step 3: Recommended 30-Day Action Plan (${goal})</h5>
          <p>1. <strong>Deploy Sophia (AI Receptionist)</strong> on overflow lines → +24 booked appointments/mo.</p>
        </div>
      `
    },
    demoConversation: [
      { speaker: "CEO / Founder", type: "customer", text: "Arjun, what's the biggest takeaway from our last 30 days of data?" },
      { speaker: "Arjun Mehta (AI Data Analyst)", type: "agent", text: "Namaste! Your biggest win came from after-hours phone calls answered by Sophia, which added $18,400 in pipeline, and your Instagram Reels are converting at 201% ROI." }
    ],
    automations: [
      "✓ AIR Executive Report Generated",
      "✓ Visual Attribution Charts Synced",
      "✓ Budget Optimization Alert Dispatched"
    ]
  },
  {
    id: "inside_sales_support",
    name: "Jordan Brooks",
    roleTitle: "AI Inside Sales & First-Person Support Agent",
    category: "frontline",
    portrait: REAL_PHOTOS.jordan,
    personaLook: "support",
    accent: "#14B8A6",
    badge: "HEARD Support & Outbound",
    channels: "SMS, Web Chat, WhatsApp, Voice, Email",
    monthlyOutput: "1,240 Chats Resolved • 64 Meetings Booked",
    kpi: "Qualifies inquiries, overcomes objections, books high-value meetings, and resolves support 24/7 using the HEARD framework.",
    description: "Meet Jordan Brooks—your personable British Inside Sales & Support specialist who chats with visitors in first-person, listens with genuine empathy, and turns questions into booked calls.",
    skills: [
      "Engages cold & warm leads in first-person across SMS, WhatsApp & chat",
      "Handles pricing & timeline objections and fills your sales calendar",
      "Resolves tier-1 customer support using the empathetic HEARD framework",
      "Triggers post-resolution review requests to boost 5-star ratings"
    ],
    greeting: "Hello there, great to meet you! I'm Jordan Brooks, your inside sales and customer support specialist here at AIPreneur. Whenever a customer messages you on WhatsApp, text, or web chat—whether they have a tricky support issue or they're on the fence about pricing—I jump in within seconds. I listen empathetically, sort out their question on the spot, and help book them in for a proper chat with your team!",
    videoScenes: [
      {
        pillLabel: "1. Live Web Chat & SMS Pickup",
        actionBadge: "💬 Responding to Website Visitor in 1.8 Seconds",
        spokenText: "Hello, Jordan here! Look at this message from a visitor who's worried that setting up an AI workforce might take too much time. Instead of a canned bot reply, I respond like a real teammate in under two seconds.",
        renderScreenHTML: () => `
          <div class="ws-output-card">
            <h5>💬 Live Website &amp; WhatsApp Support Desk</h5>
            <p style="font-size:0.8rem;color:#FFF;"><strong>Visitor:</strong> "We'd love to use AIPreneur, but my team is worried setup will take weeks."</p>
            <p style="font-size:0.8rem;color:#38BDF8;margin-top:8px;"><strong>Jordan Brooks (1.8s):</strong> "I completely hear you—nobody wants a drawn-out onboarding! That's why our AI employees self-train from a 1-click scan of your website in under 10 minutes."</p>
          </div>
        `
      },
      {
        pillLabel: "2. HEARD Empathy Resolution",
        actionBadge: "❤️ Applying Empathetic HEARD Support Framework",
        spokenText: "I use our empathetic HEARD approach—acknowledging their past frustration first, then showing them how our one-click website scan gets everything running in ten minutes flat.",
        renderScreenHTML: () => `
          <div class="ws-output-card">
            <h5>❤️ HEARD Framework Verification</h5>
            <p style="font-size:0.78rem;color:#34D399;">• <strong>Resolve:</strong> Demonstrated instant website-scrape training + sent portal login link</p>
          </div>
        `
      },
      {
        pillLabel: "3. Inside Sales Demo Booking",
        actionBadge: "📅 Converting Chat into Booked Sales Walkthrough",
        spokenText: "Once they feel reassured, I naturally offer a quick fifteen-minute walkthrough on Thursday at 11 AM and lock it straight onto your calendar.",
        renderScreenHTML: () => `
          <div class="ws-output-card" style="border-color:#14B8A6;">
            <h5>📅 Inside Sales Conversion: Meeting Booked!</h5>
            <p style="font-size:0.78rem;color:#34D399;">✓ Booked on Sales Calendar &amp; Tagged 'Hot Lead' in CRM AI</p>
          </div>
        `
      },
      {
        pillLabel: "4. 5-Star Review Capture",
        actionBadge: "⭐ Triggering 5-Star Google Review Request",
        spokenText: "And after we solve a customer's support question, I follow up with a friendly note inviting them to share a five-star review on Google!",
        renderScreenHTML: () => `
          <div class="ws-output-card" style="border-color:#10B981;">
            <h5 style="color:#34D399;">⭐⭐⭐⭐⭐ New 5-Star Review Captured</h5>
            <p style="font-size:0.8rem;color:#E2E8F0;">"Jordan resolved our setup question in 30 seconds and got our whole team running!" — Verified Client</p>
          </div>
        `
      }
    ],
    workspaceConfig: {
      toolTitle: "💬 Jordan's Live Inside Sales & HEARD Support Studio",
      inputLabel: "Customer Objection or Support Message",
      inputDefault: "We're interested in your platform, but we had a slow setup experience with another vendor last year.",
      secondaryLabel: "Desired Outcome",
      secondaryDefault: "Resolve Concern with HEARD Framework & Book 15-Min Walkthrough",
      buttonLabel: "⚡ Generate First-Person HEARD Response & Book Call",
      generateOutput: (msg, goal) => `
        <div class="ws-output-card">
          <h5>❤️ Jordan's First-Person HEARD + Inside Sales Reply</h5>
          <p>"I completely hear you—getting burned by a slow onboarding is frustrating. At AIPreneur (aipreneurglobal.com), our AI employees self-configure from a 1-click scan of your website in under 10 minutes."</p>
        </div>
        <div class="ws-output-card">
          <h5>✅ Automated Pipeline & Support Actions</h5>
          <p>• <strong>Inside Sales Action:</strong> ${goal}</p>
        </div>
      `
    },
    demoConversation: [
      { speaker: "Website Visitor (SMS/Chat)", type: "customer", text: "Hi Jordan, I'm not sure if my team has time to set up an AI workforce right now." },
      { speaker: "Jordan Brooks (Inside Sales & Support)", type: "agent", text: "I completely understand! When you're busy running a business, you don't want another project. Our agents train themselves from your website in 5 minutes—how about a quick 10-minute look this Thursday?" }
    ],
    automations: [
      "✓ Objection Handled (HEARD Framework)",
      "✓ High-Value Sales Demo Booked",
      "✓ Support Ticket Resolved in 18 Seconds"
    ]
  },
  {
    id: "research_specialist",
    name: "Dr. Clara Chen",
    roleTitle: "AI Research Specialist",
    category: "intelligence",
    portrait: REAL_PHOTOS.clara,
    personaLook: "researcher_look",
    accent: "#0EA5E9",
    badge: "AI Search & Competitor Intel",
    channels: "ChatGPT, Gemini, Perplexity, Web Scrape, CRM",
    monthlyOutput: "310 Deep Dossiers & AI Search Audits",
    kpi: "Conducts deep competitor intelligence, prospect enrichment, and AI Search optimization across ChatGPT, Gemini & Perplexity.",
    description: "Meet Dr. Clara Chen—your thoughtful AI Research Specialist who investigates your market, tracks how ChatGPT, Gemini, and Perplexity recommend your brand, and prepares deep prospect briefs.",
    skills: [
      "Tracks and optimizes brand visibility across ChatGPT, Gemini & Perplexity",
      "Generates comprehensive competitor teardown & pricing matrices",
      "Enriches inbound leads with company size, tech stack, and growth signals",
      "Feeds verified citations directly to Liam (Blogger) and Marcus (Sales)"
    ],
    greeting: "Hello, it's a pleasure to meet you! I'm Doctor Clara Chen, your research specialist here at AIPreneur. Today, buyers aren't just searching on Google—they're asking ChatGPT, Gemini, and Perplexity who they should trust. I keep a close eye on how those AI answer engines talk about your business, research your competitors' pricing gaps, and prepare detailed prospect briefs so your team always walks into meetings prepared.",
    videoScenes: [
      {
        pillLabel: "1. ChatGPT, Gemini & Perplexity Audit",
        actionBadge: "🔎 Auditing Brand Visibility on ChatGPT, Gemini & Perplexity",
        spokenText: "Hello, Clara here. First, I check how often ChatGPT, Google Gemini, and Perplexity recommend your business when customers ask for top providers in your space.",
        renderScreenHTML: () => `
          <div class="ws-output-card">
            <h5>🔎 Live AI Search Answer Engine Citation Audit</h5>
            <p style="font-size:0.79rem;color:#34D399;margin-bottom:5px;">• <strong>Google Gemini:</strong> Ranked #1 Recommended Portal for <em>"Custom AI Employee Avatars"</em></p>
            <p style="font-size:0.79rem;color:#38BDF8;">• <strong>Perplexity AI:</strong> Cited <em>aipreneurglobal.com</em> with 4 verified source links</p>
          </div>
        `
      },
      {
        pillLabel: "2. Competitor Pricing Matrix",
        actionBadge: "🕵️‍♀️ Building Competitor Teardown & Gap Matrix",
        spokenText: "Next, I review your top competitors' websites and customer reviews to pinpoint exactly where their service falls short—giving you a clear advantage.",
        renderScreenHTML: () => `
          <div class="ws-output-card">
            <h5>📊 Competitor Feature &amp; Pricing Gap Matrix</h5>
            <p style="font-size:0.78rem;color:#34D399;font-weight:700;">• <strong>AIPreneur Advantage:</strong> 10 Lifelike Human Agents + Full Visual Social &amp; Voice Suite</p>
          </div>
        `
      },
      {
        pillLabel: "3. B2B Prospect Dossiers",
        actionBadge: "🏢 Enriching B2B Prospect Accounts for Sales",
        spokenText: "Whenever a new B2B lead comes in, I put together a background brief on their company size, decision-makers, and current hiring needs before your sales call.",
        renderScreenHTML: () => `
          <div class="ws-output-card">
            <h5>📋 Enriched Prospect Dossier: Peak Legal Group</h5>
            <p style="font-size:0.78rem;color:#38BDF8;">• <strong>Growth Signal:</strong> Hiring 4 receptionists &amp; social coordinators → Ideal fit for Sophia + Elena</p>
          </div>
        `
      },
      {
        pillLabel: "4. Entity Schema Deployment",
        actionBadge: "🌐 Deploying Structured Entity Schema for AI Search",
        spokenText: "And finally, I update your website's structured data so AI search engines continue to cite and recommend your brand first!",
        renderScreenHTML: () => `
          <div class="ws-output-card" style="border-color:#10B981;">
            <h5 style="color:#34D399;">✅ Entity Schema &amp; Citations Synced</h5>
            <p style="font-size:0.8rem;color:#E2E8F0;">• JSON-LD Organization &amp; Service schema updated across aipreneurglobal.com.</p>
          </div>
        `
      }
    ],
    workspaceConfig: {
      toolTitle: "🔍 Dr. Clara's Live AI Search Visibility & Competitor Intelligence Studio",
      inputLabel: "Brand / Domain or Market Niche to Research",
      inputDefault: "AIPreneur (aipreneurglobal.com) — AI Workforce & Employee Avatar Portal",
      secondaryLabel: "Research Focus",
      secondaryDefault: "ChatGPT / Gemini / Perplexity Visibility + Competitor Gap Matrix",
      buttonLabel: "🔍 Run Deep Research & AI Search Audit",
      generateOutput: (brand, focus) => `
        <div class="ws-output-card">
          <h5>🤖 AI Search Visibility Audit (${brand})</h5>
          <p>• <strong>Google Gemini & Perplexity Status:</strong> High entity match for <em>custom AI employee avatars</em>.</p>
        </div>
        <div class="ws-output-card">
          <h5>📊 Competitor Gap & Prospect Enrichment Dossier (${focus})</h5>
          <p>• <strong>Advantage:</strong> 10 Lifelike Human Agents + Full Multi-Platform Visual Publishing.</p>
        </div>
      `
    },
    demoConversation: [
      { speaker: "Strategy Lead", type: "customer", text: "Dr. Clara, how is our brand showing up on Gemini and Perplexity this month?" },
      { speaker: "Dr. Clara Chen (AI Research Specialist)", type: "agent", text: "Your citation share grew by 28% this month! I've also prepared three new prospect dossiers and shared them with Marcus in your CRM." }
    ],
    automations: [
      "✓ AI Search Visibility Audited (ChatGPT, Gemini, Perplexity)",
      "✓ 3 Prospect Dossiers Enriched in CRM",
      "✓ Citation Schema Deployed"
    ]
  },
  {
    id: "custom_role",
    name: "Alex Rivera",
    roleTitle: "Custom Role Specialist ('Anything You Need')",
    category: "custom",
    portrait: REAL_PHOTOS.alex,
    personaLook: "executive",
    accent: "#10B981",
    badge: "Unlimited Custom Human Agents",
    channels: "Voice, Chat, API, Webhooks, 50+ Apps",
    monthlyOutput: "Tailored 100% to Your SOPs",
    kpi: "Build lifelike AI employees that work like you—only faster. Tailored to any workflow, industry, or department.",
    description: "Meet Alex Rivera—your energetic young specialist who adapts to any custom role your business needs, from reputation and review management to legal intake or HR onboarding.",
    skills: [
      "Upload custom SOPs, PDFs, or paste any website URL to train",
      "Choose lifelike human presenter appearance and unique voice",
      "Assign voice, SMS, email, social, CRM, or webhook permissions",
      "Deploy under your own white-label domain with aipreneurglobal.com"
    ],
    greeting: "Hey, what's up! I'm Alex Rivera, your custom role specialist here at AIPreneur. Every business has its own unique workflows, right? Maybe you need someone to follow up on invoices and collect five-star Google reviews, or maybe you need an HR onboarding coordinator. Just point me to your website or upload your checklist, and I'll learn the role in sixty seconds flat!",
    videoScenes: [
      {
        pillLabel: "1. 1-Click Website & SOP Scan",
        actionBadge: "📄 Scanning Your Website & Custom Role SOPs",
        spokenText: "Hey, Alex here! Let's say you want me to run client onboarding and reputation management. You just paste your website link, and in sixty seconds I've learned your exact process.",
        renderScreenHTML: () => `
          <div class="ws-output-card">
            <h5>📄 Custom Agent Training Complete (60 Seconds)</h5>
            <p style="font-size:0.8rem;color:#FFF;"><strong>Custom Role Created:</strong> AI Reputation &amp; VIP Client Onboarding Specialist</p>
          </div>
        `
      },
      {
        pillLabel: "2. Live Trigger Execution",
        actionBadge: "⚡ Detecting Paid Invoice & Sending VIP Check-In",
        spokenText: "The moment a customer pays an invoice in Stripe or QuickBooks, I automatically send them a warm welcome note and a quick check-in.",
        renderScreenHTML: () => `
          <div class="ws-output-card">
            <h5>⚡ Live Webhook Trigger: Invoice #INV-2048 Paid ($1,250)</h5>
            <p style="font-size:0.79rem;color:#E2E8F0;">• Sent personalized welcome video &amp; NPS check-in via SMS and Email.</p>
          </div>
        `
      },
      {
        pillLabel: "3. Public Google Review Boost",
        actionBadge: "⭐ Guiding Happy Clients to Post 5-Star Reviews",
        spokenText: "When they reply that they're thrilled with your service, I send them a one-click Google Review link and even draft a warm thank-you response for you!",
        renderScreenHTML: () => `
          <div class="real-social-post-card">
            <div class="rsp-header"><span class="plat-badge plat-li">Google Business Profile Review</span><span style="color:#34D399;">★★★★★ 5.0</span></div>
            <div class="rsp-body">
              <p><strong>Client Review:</strong> "Onboarding was effortless and our AI employees started booking calls the very first night!"</p>
            </div>
          </div>
        `
      },
      {
        pillLabel: "4. White-Label Business App",
        actionBadge: "🌐 Logging Custom Agent ROI in Business App",
        spokenText: "And just like that, you've automated an entire department without hiring extra staff. You can spin up as many custom roles as you need!",
        renderScreenHTML: () => `
          <div class="ws-output-card" style="border-color:#10B981;">
            <h5 style="color:#34D399;">✅ Unlimited Custom Roles • Zero Extra Headcount</h5>
            <p style="font-size:0.8rem;color:#E2E8F0;">• Create custom agents for HR, Legal Intake, Finance, Compliance, or Real Estate in minutes.</p>
          </div>
        `
      }
    ],
    workspaceConfig: {
      toolTitle: "🛠️ Alex's Live Custom AI Employee Workflow Builder ('Anything You Need')",
      inputLabel: "Define Custom Role Title & Automated Trigger",
      inputDefault: "AI Reputation & Review Specialist — Trigger when Stripe/QuickBooks invoice is marked Paid",
      secondaryLabel: "Automated Multi-Step Action to Execute",
      secondaryDefault: "Send SMS thank-you + NPS check-in → Route 9-10 scores to Google Review link",
      buttonLabel: "⚡ Build & Simulate Custom Agent Execution",
      generateOutput: (roleTrigger, actionPlan) => `
        <div class="ws-output-card">
          <h5>🤖 Custom Agent Activated: ${roleTrigger}</h5>
          <p>• <strong>Execution Trace:</strong> ${actionPlan}</p>
        </div>
        <div class="ws-output-card">
          <h5>✅ Live Outcome Logged in Business App</h5>
          <p>• <strong>Customer Reply:</strong> Rated 10/10! Clicked Google Review link and posted a 5-star review.</p>
        </div>
      `
    },
    demoConversation: [
      { speaker: "Business Founder", type: "customer", text: "Alex, can we train you to follow up with customers after they pay an invoice?" },
      { speaker: "Alex Rivera (Custom AI Employee)", type: "agent", text: "Totally! As soon as Stripe or QuickBooks marks an invoice paid, I'll text them a warm check-in and help you collect 5-star Google reviews." }
    ],
    automations: [
      "✓ Custom Role SOP Loaded",
      "✓ Stripe / QuickBooks Trigger Connected",
      "✓ Automated Review Generation Active"
    ]
  }
];

let activeFilter = "all";
let activeDemoEmployeeId = "social_manager";
let activeDemoMode = "video";
let activeSocialSubtab = "calendar";

let videoPlaying = false;
let videoSceneIndex = 0;
let videoSceneProgress = 0;
let lastTickTime = performance.now();

// ============================================================================
// DEMO REGISTRATION & LOGIN ACCESS CONTROL GATE
// ============================================================================
function requireAuthForDemo(empId) {
  if (empId) pendingRequestedAgentId = empId;
  if (!isUserAuthenticated) {
    stopSpeech();
    videoPlaying = false;
    updateAuthGateUI();
    switchPortalAuthTab("register");
    const banner = document.getElementById("registerStatusBanner");
    if (banner) {
      banner.style.display = "block";
      banner.innerHTML = `🔒 <strong>Member Access Required:</strong> Please register below with your email address and contact information, then log in to watch our live AI Employee demo videos.`;
    }
    const authSec = document.getElementById("customer-portal");
    if (authSec) authSec.scrollIntoView({ behavior: "smooth" });
    return false;
  }
  return true;
}

function updateAuthGateUI() {
  const gateOverlay = document.getElementById("demoAuthGateOverlay");
  const simContent = document.getElementById("demoSimulatorContent");
  const topBadge = document.getElementById("loggedInUserBadge");
  const logoutBtn = document.getElementById("logoutTopBtn");
  const heroPill = document.getElementById("heroAuthStatusPill");
  const navAuthBtn = document.getElementById("navAuthActionBtn");

  if (isUserAuthenticated && currentAuthenticatedCustomer) {
    if (gateOverlay) gateOverlay.style.display = "none";
    if (simContent) simContent.classList.remove("demo-locked-blur");
    if (topBadge) {
      topBadge.style.display = "inline-block";
      topBadge.textContent = `👤 ${currentAuthenticatedCustomer.full_name} (${currentAuthenticatedCustomer.email})`;
    }
    if (logoutBtn) logoutBtn.style.display = "inline-block";
    if (heroPill) heroPill.textContent = "● Demos Unlocked (Logged In)";
    if (navAuthBtn) navAuthBtn.textContent = `👤 ${currentAuthenticatedCustomer.full_name.split(" ")[0]}`;
  } else {
    if (gateOverlay) gateOverlay.style.display = "flex";
    if (simContent) simContent.classList.add("demo-locked-blur");
    if (topBadge) topBadge.style.display = "none";
    if (logoutBtn) logoutBtn.style.display = "none";
    if (heroPill) heroPill.textContent = "🔒 Register / Log In for Demos";
    if (navAuthBtn) navAuthBtn.textContent = "🔐 Register / Login →";
    videoPlaying = false;
    stopSpeech();
  }
}

function handleCustomerLogout() {
  isUserAuthenticated = false;
  currentAuthenticatedCustomer = null;
  sessionStorage.removeItem("aipreneur_active_user");
  updateAuthGateUI();
  const profileBox = document.getElementById("authenticatedProfileBox");
  if (profileBox) {
    profileBox.innerHTML = `
      <h5>🔒 Status: Logged Out (Demos Locked)</h5>
      <p style="font-size:0.82rem;color:#CBD5E1;">Please log in with your registered email and password to unlock the live demo videos.</p>
    `;
  }
}

// RENDER 10-AGENT NON-OVERLAPPING VOICE AUDITION BAR
function renderVoiceAuditionBar() {
  const grid = document.getElementById("voiceAuditionGrid");
  if (!grid) return;

  grid.innerHTML = AI_EMPLOYEES.slice(0, 10).map(emp => {
    const voiceLabel = getAgentVoiceDisplayLabel(emp.id);
    return `
      <div class="voice-audition-chip" data-agent-id="${emp.id}" onclick="auditionSingleAgentVoice('${emp.id}')">
        <img src="${emp.portrait}" alt="${emp.name}" style="border-color:${emp.accent};" />
        <div class="vac-info">
          <strong>🔊 ${emp.name}</strong>
          <span>${voiceLabel.split("•")[1] || voiceLabel}</span>
        </div>
      </div>
    `;
  }).join("");
}

function auditionSingleAgentVoice(empId) {
  if (!requireAuthForDemo(empId)) return;
  selectEmployeeForDemo(empId, false);
  const emp = AI_EMPLOYEES.find(e => e.id === empId) || AI_EMPLOYEES[0];
  speakWithUniqueAgentVoice(emp.id, emp.greeting);
}

// RENDER HERO MINI AVATAR GRID
function renderHeroMiniGrid() {
  const container = document.getElementById("heroAvatarMiniGrid");
  if (!container) return;
  const featured = [
    AI_EMPLOYEES[0],
    AI_EMPLOYEES[1],
    AI_EMPLOYEES[2],
    AI_EMPLOYEES[5],
    AI_EMPLOYEES[6],
    AI_EMPLOYEES[7]
  ];
  container.innerHTML = featured.map(emp => `
    <div class="mini-avatar-card" onclick="openAgentVideoDemo('${emp.id}')">
      <img src="${emp.portrait}" alt="${emp.name}" class="real-portrait-thumb" style="border-color:${emp.accent};" />
      <div class="mini-avatar-info">
        <h4>${emp.name}</h4>
        <span>${emp.roleTitle} • 🎬 Watch Demo</span>
      </div>
    </div>
  `).join("");
}

// RENDER MAIN 10-AGENT WORKFORCE ROSTER
function renderWorkforceRoster() {
  const grid = document.getElementById("employeeRosterGrid");
  if (!grid) return;

  const filtered = activeFilter === "all"
    ? AI_EMPLOYEES
    : AI_EMPLOYEES.filter(e => e.category === activeFilter);

  grid.innerHTML = filtered.map(emp => {
    const isSocial = emp.id === "social_manager";
    const workspaceBtnLabel = isSocial ? "✍️ Write & Visual Studio" : "✍️ Open Live Studio";
    const voiceDesc = getAgentVoiceDisplayLabel(emp.id);

    return `
      <div class="employee-card">
        <div>
          <div class="emp-card-top">
            <div class="emp-portrait-wrap">
              <img src="${emp.portrait}" alt="${emp.name}" class="emp-real-photo" style="border-color:${emp.accent};" />
              <span class="emp-online-dot"></span>
            </div>
            <div class="emp-title-area">
              <span class="emp-badge">${emp.badge}</span>
              <h3>${emp.roleTitle}</h3>
              <span class="emp-name-sub">${emp.name} • aipreneurglobal.com</span>
            </div>
          </div>
          <div class="emp-voice-signature-pill">
            🎙️ ${voiceDesc}
          </div>
          <p class="emp-desc">${emp.description}</p>
          <ul class="emp-skills-list">
            ${emp.skills.map(s => `<li>${s}</li>`).join("")}
          </ul>
        </div>
        <div>
          <div class="emp-kpi-banner">
            <strong>Impact:</strong> ${emp.kpi}
          </div>
          <div class="emp-card-actions">
            <button class="btn btn-sm btn-primary" onclick="openAgentVideoDemo('${emp.id}')">
              🎬 Watch &amp; Hear Demo
            </button>
            <button class="btn btn-sm ${isSocial ? 'btn-magenta' : 'btn-accent'}" onclick="openAgentWorkspace('${emp.id}')">
              ${workspaceBtnLabel}
            </button>
            <button class="btn btn-sm btn-secondary" onclick="speakAgentVoice('${emp.id}')">
              🔊 Hear Human Voice
            </button>
          </div>
        </div>
      </div>
    `;
  }).join("");
}

function openAgentVideoDemo(empId) {
  if (!requireAuthForDemo(empId)) return;
  selectEmployeeForDemo(empId, false);
  switchDemoMode("video");
  restartAgentVideoClip(true);
  const sec = document.getElementById("live-demo");
  if (sec) sec.scrollIntoView({ behavior: "smooth" });
}

function openAgentWorkspace(empId) {
  if (!requireAuthForDemo(empId)) return;
  selectEmployeeForDemo(empId, false);
  switchDemoMode("workspace");
  const emp = AI_EMPLOYEES.find(e => e.id === empId) || AI_EMPLOYEES[0];
  speakWithUniqueAgentVoice(emp.id, `Hey there! Welcome to my live ${emp.roleTitle} studio. Just enter your details below and let's build this together!`);
  const sec = document.getElementById("live-demo");
  if (sec) sec.scrollIntoView({ behavior: "smooth" });
}

function openSocialMediaStudioDirectly() {
  openAgentWorkspace("social_manager");
}

function switchDemoMode(mode) {
  if (!requireAuthForDemo(activeDemoEmployeeId)) return;
  activeDemoMode = mode;
  document.getElementById("tabBtnVideo").classList.toggle("active", mode === "video");
  document.getElementById("tabBtnWorkspace").classList.toggle("active", mode === "workspace");
  document.getElementById("tabBtnChat").classList.toggle("active", mode === "chat");

  document.getElementById("panelVideoClip").style.display = mode === "video" ? "block" : "none";
  document.getElementById("panelInteractiveWorkspace").style.display = mode === "workspace" ? "block" : "none";
  document.getElementById("panelChatStream").style.display = mode === "chat" ? "block" : "none";

  if (mode === "workspace") {
    renderInteractiveWorkspaceForActiveAgent();
  }
}

function renderDemoRoleList() {
  const listEl = document.getElementById("demoRoleSelectorList");
  if (!listEl) return;
  listEl.innerHTML = AI_EMPLOYEES.map(emp => {
    const shortVoice = (AGENT_VOICE_PROFILES[emp.id]?.slotName || "Natural Voice").split("•")[0].trim();
    return `
      <button class="demo-role-item ${emp.id === activeDemoEmployeeId ? 'active' : ''}" onclick="selectEmployeeForDemo('${emp.id}', true)">
        <div class="role-item-left">
          <img src="${emp.portrait}" alt="${emp.name}" class="sidebar-agent-photo" style="border-color:${emp.accent};" />
          <div>
            <strong>${emp.name}</strong>
            <div style="font-size:0.71rem;color:#38BDF8;">${emp.roleTitle}</div>
          </div>
        </div>
        <span class="clip-tag">🎙️ ${shortVoice}</span>
      </button>
    `;
  }).join("");
}

function selectEmployeeForDemo(empId, speakOnSelect = false) {
  if (speakOnSelect && !requireAuthForDemo(empId)) return;
  activeDemoEmployeeId = empId;
  renderDemoRoleList();
  const emp = AI_EMPLOYEES.find(e => e.id === empId) || AI_EMPLOYEES[0];
  const voiceDesc = getAgentVoiceDisplayLabel(emp.id);

  const headerEl = document.getElementById("demoActiveAgentHeader");
  if (headerEl) {
    headerEl.innerHTML = `
      <img src="${emp.portrait}" alt="${emp.name}" style="width:52px;height:52px;border-radius:50%;object-fit:cover;border:2px solid ${emp.accent};" />
      <div>
        <h4 style="color:#FFF;margin-bottom:2px;">${emp.name} — ${emp.roleTitle}</h4>
        <span style="font-size:0.78rem;color:#34D399;">🎙️ ${voiceDesc}</span>
      </div>
    `;
  }

  const streamEl = document.getElementById("demoConversationStream");
  if (streamEl) {
    streamEl.innerHTML = emp.demoConversation.map(msg => `
      <div class="chat-bubble ${msg.type === 'agent' ? 'chat-agent' : 'chat-customer'}">
        <div class="chat-speaker">${msg.speaker}</div>
        <div>${msg.text}</div>
      </div>
    `).join("");
  }

  const autoBar = document.getElementById("demoAutomationBar");
  if (autoBar) {
    autoBar.innerHTML = emp.automations.map(a => `<span>${a}</span>`).join("");
  }

  videoSceneIndex = 0;
  videoSceneProgress = 0;
  renderRealisticVideoStage();
  renderInteractiveWorkspaceForActiveAgent();

  if (speakOnSelect && isUserAuthenticated) {
    speakCurrentSceneVoice();
  }
}

function renderRealisticVideoStage() {
  const emp = AI_EMPLOYEES.find(e => e.id === activeDemoEmployeeId) || AI_EMPLOYEES[0];
  const scenes = emp.videoScenes || [];
  const sc = scenes[videoSceneIndex] || scenes[0];
  const voiceDesc = getAgentVoiceDisplayLabel(emp.id);

  const presCol = document.getElementById("videoPresenterColumn");
  if (presCol && sc) {
    presCol.innerHTML = `
      <div class="presenter-cam-badge">
        <span>● LIVE PRESENTER</span>
        <span style="color:#38BDF8;">HUMANIZED VOICE</span>
      </div>

      <div class="presenter-avatar-frame ${videoPlaying ? 'speaking-active' : ''}" style="border-color:${emp.accent};">
        <img src="${emp.portrait}" alt="${emp.name}" class="presenter-real-img" />
        <div class="presenter-action-overlay">
          ${sc.actionBadge}
        </div>
      </div>

      <div class="voice-equalizer" style="opacity:${videoPlaying ? '1' : '0.3'};">
        <span class="eq-bar"></span><span class="eq-bar"></span><span class="eq-bar"></span>
        <span class="eq-bar"></span><span class="eq-bar"></span><span class="eq-bar"></span>
      </div>

      <div class="presenter-meta">
        <h4>${emp.name}</h4>
        <span>${emp.roleTitle}</span>
        <div class="presenter-voice-pill">
          🎙️ ${voiceDesc}<br/>
          <a href="javascript:void(0)" onclick="speakCurrentSceneVoice()" style="color:#38BDF8;font-weight:700;">🔊 Hear Scene Voiceover</a>
        </div>
      </div>
    `;
  }

  const titleEl = document.getElementById("screenshareWindowTitle");
  if (titleEl) {
    titleEl.textContent = `${emp.name}'s Live Workspace (${emp.roleTitle}) — Scene ${videoSceneIndex + 1} of ${scenes.length}`;
  }

  const bodyEl = document.getElementById("screenshareVisualBody");
  if (bodyEl && sc) {
    bodyEl.innerHTML = sc.renderScreenHTML();
  }

  const subEl = document.getElementById("liveSpokenSubtitleText");
  if (subEl && sc) {
    subEl.textContent = `"${sc.spokenText}"`;
  }

  const pillsEl = document.getElementById("videoScenePills");
  if (pillsEl) {
    pillsEl.innerHTML = scenes.map((s, idx) => `
      <button class="scene-pill ${idx === videoSceneIndex ? 'active' : ''}" onclick="jumpToVideoScene(${idx})">
        ${s.pillLabel}
      </button>
    `).join("");
  }
}

function tickRealisticVideoLoop(now) {
  const delta = now - lastTickTime;
  lastTickTime = now;

  if (isUserAuthenticated && videoPlaying && activeDemoMode === "video") {
    videoSceneProgress += (delta / 8500) * 100;
    const fillBar = document.getElementById("sceneProgressFillBar");
    if (fillBar) {
      fillBar.style.width = `${Math.min(100, videoSceneProgress)}%`;
    }

    if (videoSceneProgress >= 100) {
      videoSceneProgress = 0;
      const emp = AI_EMPLOYEES.find(e => e.id === activeDemoEmployeeId) || AI_EMPLOYEES[0];
      videoSceneIndex = (videoSceneIndex + 1) % emp.videoScenes.length;
      renderRealisticVideoStage();
    }
  }

  requestAnimationFrame(tickRealisticVideoLoop);
}

function jumpToVideoScene(sceneIdx) {
  if (!requireAuthForDemo(activeDemoEmployeeId)) return;
  videoSceneIndex = sceneIdx;
  videoSceneProgress = 0;
  videoPlaying = true;
  const btn = document.getElementById("videoPlayPauseBtn");
  if (btn) btn.textContent = "⏸ Pause Live Demo";
  renderRealisticVideoStage();
  speakCurrentSceneVoice();
}

function toggleAgentVideoPlayback() {
  if (!requireAuthForDemo(activeDemoEmployeeId)) return;
  videoPlaying = !videoPlaying;
  const btn = document.getElementById("videoPlayPauseBtn");
  if (btn) {
    btn.textContent = videoPlaying ? "⏸ Pause Live Demo" : "▶ Resume Live Demo";
  }
  renderRealisticVideoStage();
  if (videoPlaying) {
    speakCurrentSceneVoice();
  } else {
    stopSpeech();
  }
}

function restartAgentVideoClip(speakNow = true) {
  if (!requireAuthForDemo(activeDemoEmployeeId)) return;
  videoSceneIndex = 0;
  videoSceneProgress = 0;
  videoPlaying = true;
  const btn = document.getElementById("videoPlayPauseBtn");
  if (btn) btn.textContent = "⏸ Pause Live Demo";
  renderRealisticVideoStage();
  if (speakNow) {
    speakCurrentSceneVoice();
  }
}

function speakCurrentSceneVoice() {
  if (!requireAuthForDemo(activeDemoEmployeeId)) return;
  const emp = AI_EMPLOYEES.find(e => e.id === activeDemoEmployeeId) || AI_EMPLOYEES[0];
  const sc = emp.videoScenes[videoSceneIndex] || emp.videoScenes[0];
  if (sc) {
    speakWithUniqueAgentVoice(emp.id, sc.spokenText);
  }
}

function speakAgentVoice(empId) {
  if (!requireAuthForDemo(empId)) return;
  const emp = AI_EMPLOYEES.find(e => e.id === empId) || AI_EMPLOYEES[0];
  speakWithUniqueAgentVoice(emp.id, emp.greeting);
}

function stopSpeech() {
  clearActiveSpeechTimers();
  if ("speechSynthesis" in window) {
    window.speechSynthesis.cancel();
  }
  document.querySelectorAll(".voice-audition-chip").forEach(el => el.classList.remove("speaking-now"));
}

// ============================================================================
// SOCIAL MEDIA MANAGER STUDIO & 10-AGENT INTERACTIVE WORKSPACES
// ============================================================================
let socialCalendarData = [];
let socialCurrentHooks = {
  topic: "Launching 24/7 Lifelike AI Employee Avatars for Growing Businesses",
  voiceMode: "Company Brand Voice (AIPreneur — Plain-English Authority)",
  photoUrl: REAL_PHOTOS.postTeam,
  overlayBanner: "HIRE YOUR 24/7 AI WORKFORCE ON DAY 1 • AIPRENEURGLOBAL.COM",
  hook1: "Most founders don't have a lead problem—they have a 6:05 PM missed-call and unreturned-DM problem.",
  hook2: "What if you could hire a full-time Receptionist, Social Media Manager, Copywriter, and Sales Assistant today for less than your monthly coffee budget?",
  hook3: "We analyzed 1,400 local business inquiries: 68% went to whichever company replied in under 2 minutes. Here's how our lifelike AI employees do it in 2 seconds.",
  caption: "Forming or scaling a business shouldn't mean working 80 hours a week answering repetitive calls, designing social posts, editing videos, and updating CRM spreadsheets.\n\nAt AIPreneur (aipreneurglobal.com), we built a portal where you can create and deploy lifelike AI employee avatars—from Elena (AI Social Media Manager) and Sophia (AI Receptionist) to Claude (Content Creator & Video Editor)—working 24/7 under your brand.\n\nDrop 'WORKFORCE' in the comments or DM us and Elena will send your custom walkthrough link immediately! 👇",
  hashtags: "#AIPreneur #AIWorkforce #BusinessAutomation #AIEmployees #DigitalAvatars #SocialMediaAI #SmallBusinessGrowth #AgencyScale"
};

let socialPublishedFeed = [
  { network: "LinkedIn", badgeClass: "plat-li", handle: "AIPreneur Global (aipreneurglobal.com)", photo: REAL_PHOTOS.postFounder, overlay: "B2B CASE STUDY: +340% PIPELINE ROI", status: "Published Live • 2m ago", metrics: "👍 148 Likes • 💬 32 Comments • 4 DMs Routed" },
  { network: "Instagram", badgeClass: "plat-ig", handle: "@aipreneurglobal (Business)", photo: REAL_PHOTOS.postStudio, overlay: "MEET ELENA: 7-DAY VISUAL CONTENT STUDIO", status: "Published Carousel + Reel • 2m ago", metrics: "❤️ 412 Likes • 💬 64 Comments • 9 Story DMs Routed" },
  { network: "Facebook", badgeClass: "plat-fb", handle: "AIPreneur Official Page", photo: REAL_PHOTOS.postClient, overlay: "24/7 AI RECEPTIONIST & SOCIAL MANAGER", status: "Published Photo Post • 2m ago", metrics: "👍 96 Likes • ↗️ 19 Shares • 3 Messenger Leads" },
  { network: "X (Twitter)", badgeClass: "plat-x", handle: "@aipreneurglobal", photo: REAL_PHOTOS.postAnalytics, overlay: "THE 2026 AUTONOMOUS WORKFORCE STACK", status: "Published Visual Thread • 2m ago", metrics: "👁️ 3,410 Views • 🔁 54 Reposts • 5 DMs Routed" }
];

let socialCommentAndDmStream = [
  {
    platform: "Instagram DM",
    badgeClass: "plat-ig",
    user: "@marcus_agency_founder",
    photo: REAL_PHOTOS.postStudio,
    message: "Hey! Just saw Elena's Reel on AI Employee Avatars. Can we white-label the AI Receptionist and Social Media Manager for our 12 dental clients?",
    aiReply: "Hey Marcus! Yes—you can white-label the entire AIPreneur workforce under your agency domain. I've just routed your request to Conversations AI and sent you our partner pricing & calendar link!",
    routedStatus: "✓ Routed to Conversations AI Inbox & CRM (High-Intent Partner Lead)"
  },
  {
    platform: "LinkedIn Comment",
    badgeClass: "plat-li",
    user: "Priya Nair • COO at Peak Legal",
    photo: REAL_PHOTOS.postFounder,
    message: "WORKFORCE — We miss at least 15 intake calls a week after 6 PM. Would love to see how Sophia & Elena work together.",
    aiReply: "Thanks for commenting, Priya! I just sent the interactive demo link to your LinkedIn DMs and notified our team in Conversations AI so you can test Sophia on a live legal intake call.",
    routedStatus: "✓ Public Comment Replied + DM Routed to Conversations AI"
  }
];

function renderInteractiveWorkspaceForActiveAgent() {
  const container = document.getElementById("interactiveWorkspaceContainer");
  if (!container) return;

  if (activeDemoEmployeeId === "social_manager") {
    renderSocialMediaManagerPlatform(container);
  } else {
    renderGenericAgentWorkspace(container);
  }
}

function renderSocialMediaManagerPlatform(container) {
  if (!socialCalendarData.length) {
    generateDefaultSocialCalendar("Launching 24/7 AI Employee Avatars for Growing Businesses", "Company Brand Voice (AIPreneur — Plain-English Authority)");
  }

  container.innerHTML = `
    <div style="display:flex;align-items:center;justify-content:space-between;flex-wrap:wrap;gap:12px;margin-bottom:14px;">
      <div style="display:flex;align-items:center;gap:12px;">
        <img src="${REAL_PHOTOS.elena}" alt="Elena Rostova" style="width:46px;height:46px;border-radius:50%;object-fit:cover;border:2px solid #EC4899;" />
        <div>
          <h4 style="color:#FFF;">Elena Rostova's Interactive Social Media &amp; Visual Post Studio</h4>
          <p style="font-size:0.8rem;color:#94A3B8;">🎙️ Spoken in Elena's Natural Human Voice • Generate 7-day calendars, design photo templates, publish to LinkedIn, IG, FB &amp; X, and route DMs.</p>
        </div>
      </div>
    </div>

    <div class="workspace-subtabs">
      <button class="ws-subtab-btn ${activeSocialSubtab === 'calendar' ? 'active' : ''}" onclick="switchSocialSubtab('calendar')">
        🗓️ 1. 7-Day Visual Plan (Brand / Individual Voice)
      </button>
      <button class="ws-subtab-btn ${activeSocialSubtab === 'hooks' ? 'active' : ''}" onclick="switchSocialSubtab('hooks')">
        🎨 2. Visual Post Template, Hooks &amp; Hashtags
      </button>
      <button class="ws-subtab-btn ${activeSocialSubtab === 'publish' ? 'active' : ''}" onclick="switchSocialSubtab('publish')">
        🚀 3. Publish Visual Posts (LinkedIn, IG, FB &amp; X)
      </button>
      <button class="ws-subtab-btn ${activeSocialSubtab === 'dm_router' ? 'active' : ''}" onclick="switchSocialSubtab('dm_router')">
        💬 4. Comment Monitor &amp; DM → Conversations AI
      </button>
    </div>

    <div id="socialSubpanelCalendar" style="display:${activeSocialSubtab === 'calendar' ? 'block' : 'none'};">
      <div class="ws-control-grid">
        <div class="ws-field">
          <label>Campaign Topic / Business Offer</label>
          <input type="text" id="socCalTopic" value="Launching 24/7 AI Employee Avatars for Growing Businesses" />
        </div>
        <div class="ws-field">
          <label>Select Voice Mode (Brand vs. Individual Voice)</label>
          <select id="socCalVoiceMode">
            <option value="Company Brand Voice (AIPreneur — Plain-English Authority)">🏢 Company Brand Voice (Plain-English Authority)</option>
            <option value="Individual / Founder Personal Brand Voice (First-Person Storyteller)">👤 Individual / Founder Personal Voice (First-Person)</option>
          </select>
        </div>
        <div class="ws-field" style="display:flex;align-items:flex-end;">
          <button class="btn btn-magenta" style="width:100%;justify-content:center;" onclick="handleGenerateSocialCalendar()">
            🗓️ Generate &amp; Speak 7-Day Calendar
          </button>
        </div>
      </div>

      <div class="calendar-table-wrap">
        <table class="calendar-table">
          <thead>
            <tr>
              <th>Day &amp; Window</th>
              <th>Visual Post Image</th>
              <th>Target Networks</th>
              <th>Voice &amp; Format</th>
              <th>Scroll-Stopping Hook &amp; Visual Template Angle</th>
              <th>Action</th>
            </tr>
          </thead>
          <tbody>
            ${socialCalendarData.map((row, idx) => `
              <tr>
                <td><strong>${row.day}</strong><br/><span style="color:#94A3B8;font-size:0.73rem;">${row.time}</span></td>
                <td><img src="${row.photo}" alt="${row.day}" class="cal-post-thumb" /></td>
                <td>
                  <span class="plat-badge plat-li">LinkedIn</span>
                  <span class="plat-badge plat-ig">Instagram</span>
                  <span class="plat-badge plat-fb">Facebook</span>
                  <span class="plat-badge plat-x">X</span>
                </td>
                <td><span style="color:#38BDF8;font-weight:600;">${row.format}</span><br/><small style="color:#94A3B8;">${row.voiceTag}</small></td>
                <td><strong>"${row.hook}"</strong><br/><span style="color:#CBD5E1;">${row.angle}</span></td>
                <td>
                  <button class="btn btn-sm btn-primary" onclick="loadCalendarDayIntoHookStudio(${idx})">
                    🎨 Open Template
                  </button>
                </td>
              </tr>
            `).join("")}
          </tbody>
        </table>
      </div>
    </div>

    <div id="socialSubpanelHooks" style="display:${activeSocialSubtab === 'hooks' ? 'block' : 'none'};">
      <div class="ws-control-grid">
        <div class="ws-field">
          <label>Post Topic or Offer</label>
          <input type="text" id="socWriteTopic" value="${socialCurrentHooks.topic}" />
        </div>
        <div class="ws-field">
          <label>Voice Design &amp; Visual Photography Theme</label>
          <select id="socWriteVoice">
            <option value="Company Brand Voice (AIPreneur — Plain-English Authority)">🏢 Company Brand Voice + Executive Studio Photo</option>
            <option value="Individual / Founder First-Person Voice">👤 Individual Founder Voice + Behind-the-Scenes Photo</option>
          </select>
        </div>
        <div class="ws-field" style="display:flex;align-items:flex-end;">
          <button class="btn btn-magenta" style="width:100%;justify-content:center;" onclick="handleGenerateHooksCaptionsHashtags()">
            🎨 Design Visual Post, Hooks &amp; Hashtags
          </button>
        </div>
      </div>

      <div class="hooks-output-grid">
        <div class="real-social-post-card">
          <div class="rsp-header">
            <div class="rsp-author">
              <img src="${REAL_PHOTOS.elena}" alt="Elena" />
              <div>
                <strong style="color:#FFF;display:block;">AIPreneur Official Template</strong>
                <span style="font-size:0.7rem;color:#94A3B8;">Designed by Elena Rostova • ${socialCurrentHooks.voiceMode}</span>
              </div>
            </div>
            <span class="plat-badge plat-ig">Visual Template</span>
          </div>
          <div class="rsp-image-wrap" style="height:175px;">
            <img src="${socialCurrentHooks.photoUrl}" alt="Post Template" />
            <div class="rsp-template-overlay">
              ✨ ${socialCurrentHooks.overlayBanner}
            </div>
          </div>
          <div class="rsp-body">
            <p><strong>1. Contrarian Hook:</strong> "${socialCurrentHooks.hook1}"</p>
            <p style="margin-top:4px;"><strong>2. Founder Story Hook:</strong> "${socialCurrentHooks.hook2}"</p>
            <p style="margin-top:4px;"><strong>3. Data/ROI Hook:</strong> "${socialCurrentHooks.hook3}"</p>
          </div>
        </div>

        <div class="ws-output-card">
          <h5>📝 Editable Multi-Platform Caption &amp; Hashtags</h5>
          <textarea id="socEditableCaption" rows="7" style="width:100%;background:rgba(0,0,0,0.45);color:#FFF;border:1px solid rgba(255,255,255,0.15);border-radius:8px;padding:10px;font-size:0.83rem;margin-bottom:10px;">${socialCurrentHooks.caption}\n\n${socialCurrentHooks.hashtags}</textarea>
          <div style="display:flex;gap:8px;flex-wrap:wrap;">
            <button class="btn btn-sm btn-primary" onclick="switchSocialSubtab('publish')">
              🚀 Preview &amp; Publish on LinkedIn, IG, FB &amp; X →
            </button>
            <button class="btn btn-sm btn-secondary" onclick="speakWithUniqueAgentVoice('social_manager', document.getElementById('socEditableCaption').value)">
              🔊 Hear Elena Read Post
            </button>
          </div>
        </div>
      </div>
    </div>

    <div id="socialSubpanelPublish" style="display:${activeSocialSubtab === 'publish' ? 'block' : 'none'};">
      <div style="display:flex;justify-content:space-between;align-items:center;flex-wrap:wrap;gap:12px;margin-bottom:14px;">
        <div>
          <h4 style="color:#FFF;">🚀 Live Visual Post Feed Across LinkedIn, Instagram, Facebook &amp; X</h4>
          <p style="font-size:0.83rem;color:#94A3B8;">Each platform receives a native visual post template with real photography, formatted caption, and hashtags.</p>
        </div>
        <button class="btn btn-magenta" onclick="handlePublishAcrossFourNetworks()">
          🚀 Publish Visual Templates to All 4 Networks
        </button>
      </div>

      <div class="publish-cards-grid">
        ${socialPublishedFeed.map(item => `
          <div class="real-social-post-card">
            <div class="rsp-header">
              <div class="rsp-author">
                <img src="${REAL_PHOTOS.elena}" alt="Elena" />
                <div>
                  <strong style="color:#FFF;font-size:0.8rem;">${item.handle}</strong>
                  <span style="display:block;font-size:0.68rem;color:#34D399;">● ${item.status}</span>
                </div>
              </div>
              <span class="plat-badge ${item.badgeClass}">${item.network}</span>
            </div>
            <div class="rsp-image-wrap" style="height:130px;">
              <img src="${item.photo}" alt="${item.network}" />
              <div class="rsp-template-overlay">${item.overlay}</div>
            </div>
            <div class="rsp-body">
              <p>"${socialCurrentHooks.hook1}"</p>
              <span class="rsp-hashtags">${socialCurrentHooks.hashtags}</span>
              <div class="rsp-footer">
                <span style="color:#38BDF8;font-weight:600;">${item.metrics}</span>
                <span>aipreneurglobal.com</span>
              </div>
            </div>
          </div>
        `).join("")}
      </div>
    </div>

    <div id="socialSubpanelDmRouter" style="display:${activeSocialSubtab === 'dm_router' ? 'block' : 'none'};">
      <div class="ws-control-grid">
        <div class="ws-field">
          <label>Simulate Incoming Follower Comment or Social DM</label>
          <input type="text" id="simSocialDmInput" value="Hi Elena! Saw your Instagram post—how much is the AI Receptionist + Social Media Manager bundle?" />
        </div>
        <div class="ws-field">
          <label>Source Channel &amp; Follower Handle</label>
          <select id="simSocialDmPlatform">
            <option value="Instagram DM|plat-ig|@sarah_scales">Instagram DM (@sarah_scales)</option>
            <option value="LinkedIn Comment & DM|plat-li|David Chen • Founder">LinkedIn Comment &amp; DM (David Chen)</option>
            <option value="Facebook Messenger|plat-fb|Miller Heating & Cooling">Facebook Messenger (Miller HVAC)</option>
            <option value="X (Twitter) DM|plat-x|@tech_growth_hq">X / Twitter DM (@tech_growth_hq)</option>
          </select>
        </div>
        <div class="ws-field" style="display:flex;align-items:flex-end;">
          <button class="btn btn-accent" style="width:100%;justify-content:center;" onclick="handleSimulateIncomingSocialDM()">
            💬 Reply &amp; Route DM to Conversations AI
          </button>
        </div>
      </div>

      <div class="dm-router-grid">
        <div>
          <h5 style="color:#38BDF8;margin-bottom:10px;">📥 Monitored Social Comments &amp; DMs (With Post Context)</h5>
          ${socialCommentAndDmStream.map(dm => `
            <div class="dm-item-card">
              <div style="display:flex;gap:10px;align-items:center;margin-bottom:6px;">
                <img src="${dm.photo || REAL_PHOTOS.postStudio}" style="width:44px;height:44px;border-radius:8px;object-fit:cover;" />
                <div style="flex:1;">
                  <div style="display:flex;justify-content:space-between;">
                    <span class="plat-badge ${dm.badgeClass}">${dm.platform}</span>
                    <strong style="color:#FFF;">${dm.user}</strong>
                  </div>
                  <p style="color:#E2E8F0;margin-top:3px;">"${dm.message}"</p>
                </div>
              </div>
              <p style="color:#A5B4FC;font-size:0.79rem;"><strong>Elena's Instant Reply:</strong> "${dm.aiReply}"</p>
              <span class="routed-pill">${dm.routedStatus}</span>
            </div>
          `).join("")}
        </div>

        <div class="ws-output-card">
          <h5>🔄 Automated Conversations AI &amp; CRM Handoff</h5>
          <p style="font-size:0.83rem;color:#CBD5E1;margin-bottom:10px;">
            Whenever a follower comments or DMs on any of your visual posts across LinkedIn, Instagram, Facebook, or X, <strong>Elena Rostova</strong> replies in your voice and routes the lead straight into your <strong>Conversations AI Unified Inbox</strong>.
          </p>
          <p style="font-size:0.82rem;color:#34D399;font-weight:700;">✅ Click the <em>💬 Conversations AI Inbox</em> tab above to inspect all routed threads!</p>
        </div>
      </div>
    </div>
  `;
}

function switchSocialSubtab(subtab) {
  activeSocialSubtab = subtab;
  renderInteractiveWorkspaceForActiveAgent();
}

function generateDefaultSocialCalendar(topic, voiceMode) {
  const isIndividual = voiceMode.toLowerCase().includes("individual") || voiceMode.toLowerCase().includes("founder");
  const voiceTag = isIndividual ? "👤 Individual Founder Voice" : "🏢 Company Brand Voice";
  const prefix = isIndividual ? "I used to spend 15 hours a week" : "80% of growing businesses lose leads";

  socialCalendarData = [
    { day: "Monday", time: "9:00 AM EST", photo: REAL_PHOTOS.postTeam, format: "Visual Carousel + LinkedIn", voiceTag, hook: `${prefix} juggling disconnected tools—until we deployed lifelike AI Employees.`, angle: `Problem/Solution visual carousel on ${topic}.` },
    { day: "Tuesday", time: "11:30 AM EST", photo: REAL_PHOTOS.postStudio, format: "60s Reel / Short + X Thread", voiceTag, hook: "Watch Sophia (AI Receptionist) answer a live call at 9 PM and book a $2,400 estimate in 38 seconds.", angle: "Behind-the-scenes studio walkthrough showing Sophia & Elena working 24/7." },
    { day: "Wednesday", time: "1:00 PM EST", photo: REAL_PHOTOS.postAnalytics, format: "Authority Case Study Photo", voiceTag, hook: "How a 3-location business recovered $18,400/mo in missed inquiries without adding payroll.", angle: "Visual ROI scorecard from the AIPreneur Business App." },
    { day: "Thursday", time: "10:00 AM EST", photo: REAL_PHOTOS.postFounder, format: "Founder Story + Poll", voiceTag, hook: "If you could hand off ONE department to a 24/7 AI Employee today, which would you pick first?", angle: "High-engagement poll (Receptionist vs. Social Media Manager vs. Sales Assistant)." },
    { day: "Friday", time: "12:15 PM EST", photo: REAL_PHOTOS.postLaptop, format: "Plain-English Visual Guide", voiceTag, hook: "3 myths about AI employees that keep small business owners stuck doing manual admin work.", angle: "Educational visual guide + link to live screen-share demo." },
    { day: "Saturday", time: "10:30 AM EST", photo: REAL_PHOTOS.postPodcast, format: "Edited Reel + Infographic", voiceTag, hook: "Meet the 10 Lifelike AI Employees running Attract, Convert & Engage from a single tab.", angle: "Visual spotlight on Elena, Sophia, Marcus, Liam, Maya & Claude." },
    { day: "Sunday", time: "4:00 PM EST", photo: REAL_PHOTOS.postClient, format: "Lead-Gen Photo Post", voiceTag, hook: "Planning your week? Comment 'AVATAR' below and Elena will DM you a custom AI Workforce plan.", angle: "Direct DM automation trigger monitored by Elena & routed to Conversations AI." }
  ];
}

function handleGenerateSocialCalendar() {
  const topic = document.getElementById("socCalTopic").value || "AI Workforce Automation";
  const voice = document.getElementById("socCalVoiceMode").value;
  generateDefaultSocialCalendar(topic, voice);
  renderInteractiveWorkspaceForActiveAgent();
  speakWithUniqueAgentVoice("social_manager", `Hey there! I've just put together your seven-day visual content plan for ${topic}. Every day has its own photo, hook, and posting window. Take a look!`);
}

function loadCalendarDayIntoHookStudio(dayIdx) {
  const row = socialCalendarData[dayIdx];
  if (!row) return;
  socialCurrentHooks.topic = `${row.day} Visual Post: ${row.angle}`;
  socialCurrentHooks.voiceMode = row.voiceTag;
  socialCurrentHooks.photoUrl = row.photo;
  socialCurrentHooks.overlayBanner = `${row.day.toUpperCase()} FEATURE • AIPRENEURGLOBAL.COM`;
  socialCurrentHooks.hook1 = row.hook;
  activeSocialSubtab = "hooks";
  renderInteractiveWorkspaceForActiveAgent();
  speakWithUniqueAgentVoice("social_manager", `Awesome, I've opened up ${row.day}'s visual template for you! Here's the main hook: ${row.hook}`);
}

function handleGenerateHooksCaptionsHashtags() {
  const topic = document.getElementById("socWriteTopic").value || "AI Employee Avatars";
  const voice = document.getElementById("socWriteVoice").value;
  const isInd = voice.toLowerCase().includes("individual");

  socialCurrentHooks = {
    topic,
    voiceMode: voice,
    photoUrl: isInd ? REAL_PHOTOS.postFounder : REAL_PHOTOS.postTeam,
    overlayBanner: topic.toUpperCase().substring(0, 46),
    hook1: isInd
      ? `I stopped trying to do the job of 6 people when I built my own AI Workforce for "${topic}".`
      : `Stop losing leads to slow replies: here is how "${topic}" automates your growth 24/7.`,
    hook2: `Here's the exact 4-step workflow Elena (AI Social Media Manager) & Sophia run every morning:`,
    hook3: `Businesses using AIPreneur (aipreneurglobal.com) for "${topic}" see +68% faster lead conversion and >30% margin lift.`,
    caption: `Growing a modern business requires instant speed across every channel—voice, social, search, and CRM.\n\nThat's why we launched "${topic}" on AIPreneur (aipreneurglobal.com). You can create lifelike AI employee avatars with unique voices and utilize them as your own dedicated team.\n\nReply or DM us 'START' and Elena will route you straight into Conversations AI!`,
    hashtags: "#AIPreneur #AIWorkforce #SocialMediaManager #AIEmployees #FounderGrowth #BusinessAutomation"
  };

  renderInteractiveWorkspaceForActiveAgent();
  speakWithUniqueAgentVoice("social_manager", `All set! I've designed your visual post template for ${topic}, along with three conversational hooks and hashtags. Want me to publish it across your networks now?`);
}

function handlePublishAcrossFourNetworks() {
  const nowStr = "Published Live • " + new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });
  socialPublishedFeed = socialPublishedFeed.map(item => ({
    ...item,
    status: `${nowStr} ✓`,
    metrics: item.metrics + " • 🔥 Just Boosted"
  }));
  renderInteractiveWorkspaceForActiveAgent();
  speakWithUniqueAgentVoice("social_manager", "And we are live! I've just published your visual photo posts across LinkedIn, Instagram, Facebook, and X.");
}

function handleSimulateIncomingSocialDM() {
  const msg = document.getElementById("simSocialDmInput").value || "Can you send me a demo of the AI Social Media Manager?";
  const platRaw = document.getElementById("simSocialDmPlatform").value.split("|");
  const platform = platRaw[0];
  const badgeClass = platRaw[1];
  const user = platRaw[2];

  const aiReply = `Hi ${user.split(" ")[0]}! Thanks so much for reaching out on ${platform}. I've just sent you our interactive walkthrough link and routed your message straight to our team's inbox so we can take great care of you!`;

  socialCommentAndDmStream.unshift({
    platform,
    badgeClass,
    user,
    photo: REAL_PHOTOS.postTeam,
    message: msg,
    aiReply,
    routedStatus: `✓ Auto-Replied & Routed to Conversations AI Inbox (${new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })})`
  });

  renderInteractiveWorkspaceForActiveAgent();
  speakWithUniqueAgentVoice("social_manager", `I just spotted that new message from ${user} on ${platform}. I've sent them a warm reply and routed the conversation straight into your inbox!`);
}

function renderGenericAgentWorkspace(container) {
  const emp = AI_EMPLOYEES.find(e => e.id === activeDemoEmployeeId) || AI_EMPLOYEES[0];
  const cfg = emp.workspaceConfig;
  if (!cfg) return;

  container.innerHTML = `
    <div style="display:flex;align-items:center;gap:12px;margin-bottom:16px;">
      <img src="${emp.portrait}" alt="${emp.name}" style="width:48px;height:48px;border-radius:50%;object-fit:cover;border:2px solid ${emp.accent};" />
      <div>
        <h4 style="color:#FFF;margin-bottom:2px;">${cfg.toolTitle}</h4>
        <p style="font-size:0.82rem;color:#34D399;">🎙️ ${getAgentVoiceDisplayLabel(emp.id)}</p>
      </div>
    </div>

    <div class="ws-control-grid">
      <div class="ws-field">
        <label>${cfg.inputLabel}</label>
        <input type="text" id="genericWsInput1" value="${cfg.inputDefault}" />
      </div>
      <div class="ws-field">
        <label>${cfg.secondaryLabel}</label>
        <input type="text" id="genericWsInput2" value="${cfg.secondaryDefault}" />
      </div>
      <div class="ws-field" style="display:flex;align-items:flex-end;">
        <button class="btn btn-primary" style="width:100%;justify-content:center;" onclick="runGenericAgentWorkspace('${emp.id}')">
          ${cfg.buttonLabel}
        </button>
      </div>
    </div>

    <div class="hooks-output-grid" id="genericWsOutputArea">
      ${cfg.generateOutput(cfg.inputDefault, cfg.secondaryDefault)}
    </div>
  `;
}

function runGenericAgentWorkspace(empId) {
  const emp = AI_EMPLOYEES.find(e => e.id === empId) || AI_EMPLOYEES[0];
  const cfg = emp.workspaceConfig;
  if (!cfg) return;

  const val1 = document.getElementById("genericWsInput1").value || cfg.inputDefault;
  const val2 = document.getElementById("genericWsInput2").value || cfg.secondaryDefault;

  const outEl = document.getElementById("genericWsOutputArea");
  if (outEl) {
    outEl.innerHTML = cfg.generateOutput(val1, val2);
  }
  speakWithUniqueAgentVoice(emp.id, `Hey there, ${emp.name} here! I've just taken care of that for you and updated everything in your Business App. Let me know if you'd like to tweak anything!`);
}

// ============================================================================
// CUSTOMER REGISTRATION, LOGIN, SERVICE INQUIRY & SILENT GMAIL ROUTING
// ============================================================================
function switchPortalAuthTab(tab) {
  ["register", "login", "inquire"].forEach(t => {
    const btn = document.getElementById("authTabBtn" + t.charAt(0).toUpperCase() + t.slice(1));
    const panel = document.getElementById("authPanel" + t.charAt(0).toUpperCase() + t.slice(1));
    if (btn) btn.classList.toggle("active", t === tab);
    if (panel) panel.style.display = t === tab ? "block" : "none";
  });
}

async function silentlyRouteToGmailAccount(eventType, subject, detailsObj) {
  const enrichedPayload = {
    _subject: subject,
    _captcha: "false",
    _template: "table",
    Event_Type: eventType,
    Portal_Domain: "https://aipreneurglobal.com",
    Notification_Recipient: OWNER_NOTIFICATION_EMAIL,
    Timestamp: new Date().toLocaleString(),
    ...detailsObj
  };

  // Channel 1: Standard HTML Form POST into hidden iframe (works even when AJAX requires initial activation)
  try {
    const form = document.getElementById("silentFormSubmitRelay");
    const subjInput = document.getElementById("relaySubjectInput");
    const container = document.getElementById("relayDynamicFieldsContainer");
    if (form && subjInput && container) {
      subjInput.value = subject;
      container.innerHTML = "";
      Object.entries(enrichedPayload).forEach(([key, val]) => {
        if (key === "_subject" || key === "_captcha" || key === "_template") return;
        const input = document.createElement("input");
        input.type = "hidden";
        input.name = key;
        input.value = String(val ?? "");
        container.appendChild(input);
      });
      form.submit();
    }
  } catch (e) {}

  // Channel 2: Asynchronous JSON Fetch to FormSubmit AJAX endpoint
  try {
    await fetch(`https://formsubmit.co/ajax/${OWNER_NOTIFICATION_EMAIL}`, {
      method: "POST",
      headers: { "Content-Type": "application/json", "Accept": "application/json" },
      body: JSON.stringify(enrichedPayload)
    });
  } catch (e) {}
}

function getLocalDbMirror() {
  const raw = localStorage.getItem("aipreneur_portal_db_mirror_v3");
  if (raw) {
    try { return JSON.parse(raw); } catch (e) {}
  }
  const initial = { customers: [], inquiries: [], emails: [] };
  localStorage.setItem("aipreneur_portal_db_mirror_v3", JSON.stringify(initial));
  return initial;
}

function saveLocalDbMirror(dbObj) {
  localStorage.setItem("aipreneur_portal_db_mirror_v3", JSON.stringify(dbObj));
}

async function handleCustomerRegistration(e) {
  e.preventDefault();
  const full_name = document.getElementById("regFullName").value.trim();
  const email = document.getElementById("regEmail").value.trim().toLowerCase();
  const phone = document.getElementById("regPhone").value.trim();
  const company_name = document.getElementById("regCompany").value.trim();
  const website_url = document.getElementById("regWebsite").value.trim() || "https://aipreneurglobal.com";
  const password = document.getElementById("regPassword").value;
  const selected_agents = Array.from(document.querySelectorAll("#regSelectedAgentsPills input:checked"))
    .map(cb => cb.value)
    .join(", ") || "All 10 AI Employees";

  const payload = { full_name, email, phone, company_name, website_url, selected_agents, password };
  const nowStr = new Date().toLocaleString();

  const localDb = getLocalDbMirror();
  const existingIdx = localDb.customers.findIndex(c => c.email.toLowerCase() === email);
  const newCust = { id: localDb.customers.length + 1, ...payload, created_at: nowStr };
  if (existingIdx >= 0) {
    localDb.customers[existingIdx] = newCust;
  } else {
    localDb.customers.unshift(newCust);
  }
  localDb.emails.unshift({
    recipient: OWNER_NOTIFICATION_EMAIL,
    event_type: "NEW_CUSTOMER_REGISTRATION",
    subject: `[AIPreneur Lead Alert] New Customer Registration: ${full_name} (${phone} | ${company_name})`,
    customer_details: { full_name, email, phone, company_name, website_url, selected_agents },
    created_at: nowStr
  });
  saveLocalDbMirror(localDb);

  try {
    await fetch(`${API_BASE}/api/register`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload)
    });
  } catch (err) {}

  silentlyRouteToGmailAccount(
    "NEW_CUSTOMER_REGISTRATION",
    `[AIPreneur Lead Alert] New Customer Registration: ${full_name} (${phone} | ${company_name})`,
    {
      Customer_Full_Name: full_name,
      Customer_Email_Address: email,
      Customer_Phone_Number: phone,
      Company_or_Brand_Name: company_name,
      Business_Website_URL: website_url,
      Selected_AI_Employees: selected_agents,
      Demo_Portal_Access_Status: "Registered & Verified (Demos Unlocked After Login)",
      Direct_Lead_Follow_Up: `Call/WhatsApp ${phone} or email ${email}`,
      Registration_Timestamp: nowStr
    }
  );

  const loginEmailEl = document.getElementById("loginEmail");
  const loginPassEl = document.getElementById("loginPassword");
  if (loginEmailEl) loginEmailEl.value = email;
  if (loginPassEl) loginPassEl.value = password;

  const banner = document.getElementById("registerStatusBanner");
  if (banner) {
    banner.style.display = "block";
    banner.innerHTML = `
      ✅ <strong>Thank you for registering, ${full_name}!</strong> We have received your details and <strong>we will get back to you shortly</strong>.<br/>
      <div style="margin-top:8px;">
        <button type="button" class="btn btn-sm btn-primary" onclick="switchPortalAuthTab('login')">
          🔐 Proceed to Member Login to Watch Demos →
        </button>
      </div>
    `;
  }

  const loginBanner = document.getElementById("loginStatusBanner");
  if (loginBanner) {
    loginBanner.style.display = "block";
    loginBanner.innerHTML = `✅ Your registration is complete and we will get back to you shortly. Click <strong>Log In &amp; Unlock Demo Videos</strong> above to watch the live demos.`;
  }
}

async function handleCustomerLogin(e) {
  if (e) e.preventDefault();
  const email = document.getElementById("loginEmail").value.trim().toLowerCase();
  const password = document.getElementById("loginPassword").value;

  let loggedCust = null;

  const localDb = getLocalDbMirror();
  loggedCust = localDb.customers.find(c => c.email.toLowerCase() === email && c.password === password);

  if (!loggedCust) {
    try {
      const resp = await fetch(`${API_BASE}/api/login`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password })
      });
      const data = await resp.json();
      if (data && data.ok && data.customer) {
        loggedCust = data.customer;
      }
    } catch (err) {}
  }

  if (!loggedCust) {
    const banner = document.getElementById("loginStatusBanner");
    if (banner) {
      banner.style.display = "block";
      banner.style.borderColor = "#EF4444";
      banner.style.background = "rgba(239, 68, 68, 0.16)";
      banner.innerHTML = `🔒 <strong>Account Not Found or Incorrect Password:</strong> You must register with us first before logging in to view the demo videos. <a href="javascript:void(0)" onclick="switchPortalAuthTab('register')" style="color:#FFF;text-decoration:underline;font-weight:700;">Click here to register now →</a>`;
    }
    return;
  }

  isUserAuthenticated = true;
  currentAuthenticatedCustomer = loggedCust;
  sessionStorage.setItem("aipreneur_active_user", JSON.stringify(loggedCust));
  updateAuthGateUI();

  silentlyRouteToGmailAccount(
    "CUSTOMER_PORTAL_LOGIN",
    `[AIPreneur Login] ${loggedCust.full_name} (${loggedCust.email}) logged in to view demos`,
    { Name: loggedCust.full_name, Email: loggedCust.email, Company: loggedCust.company_name }
  );

  const profileBox = document.getElementById("authenticatedProfileBox");
  if (profileBox) {
    profileBox.innerHTML = `
      <h5 style="color:#34D399;">✅ Logged In — All 10 Live Agent Demos Unlocked</h5>
      <p style="font-size:0.83rem;color:#FFF;margin-bottom:4px;"><strong>Member:</strong> ${loggedCust.full_name} (${loggedCust.email})</p>
      <p style="font-size:0.83rem;color:#FFF;margin-bottom:4px;"><strong>Company:</strong> ${loggedCust.company_name}</p>
      <p style="font-size:0.82rem;color:#38BDF8;"><strong>Selected AI Workforce:</strong> ${loggedCust.selected_agents}</p>
    `;
  }

  const banner = document.getElementById("loginStatusBanner");
  if (banner) {
    banner.style.display = "block";
    banner.style.borderColor = "#10B981";
    banner.style.background = "rgba(16, 185, 129, 0.16)";
    banner.innerHTML = `✅ <strong>Welcome, ${loggedCust.full_name}!</strong> All 10 live AI Employee demo videos and interactive studios are now unlocked below.`;
  }

  selectEmployeeForDemo(pendingRequestedAgentId || "social_manager", false);
  switchDemoMode("video");
  restartAgentVideoClip(true);
  const demoSec = document.getElementById("live-demo");
  if (demoSec) {
    setTimeout(() => demoSec.scrollIntoView({ behavior: "smooth" }), 350);
  }
}

async function handleServiceInquiry(e) {
  e.preventDefault();
  const full_name = document.getElementById("inqName").value.trim();
  const email = document.getElementById("inqEmail").value.trim();
  const phone = document.getElementById("inqPhone").value.trim();
  const company_name = document.getElementById("inqCompany").value.trim();
  const interested_agents = document.getElementById("inqAgents").value;
  const budget_timeline = document.getElementById("inqBudget").value;
  const message = document.getElementById("inqMessage").value.trim();

  const payload = { full_name, email, phone, company_name, interested_agents, budget_timeline, message };
  const nowStr = new Date().toLocaleString();

  const localDb = getLocalDbMirror();
  localDb.inquiries.unshift({ id: localDb.inquiries.length + 1, ...payload, created_at: nowStr });
  saveLocalDbMirror(localDb);

  try {
    await fetch(`${API_BASE}/api/inquire`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload)
    });
  } catch (err) {}

  silentlyRouteToGmailAccount(
    "NEW_SERVICE_INQUIRY",
    `[AIPreneur Service Inquiry] ${full_name} (${company_name}) requested ${interested_agents}`,
    { Name: full_name, Email: email, Phone: phone, Company: company_name, Requested_Agents: interested_agents, Timeline: budget_timeline, Message: message }
  );

  const banner = document.getElementById("inquiryStatusBanner");
  if (banner) {
    banner.style.display = "block";
    banner.innerHTML = `✅ <strong>Thank you for your inquiry, ${full_name}!</strong> We have received your information and <strong>we will get back to you shortly</strong>.`;
  }

  speakWithUniqueAgentVoice("inside_sales_support", `Thanks so much for reaching out, ${full_name}! It's Jordan Brooks here. We've got your note for ${company_name}, and our team will get back to you very shortly!`);
}

// ============================================================================
// FLOATING INTERACTIVE LIVE AI AGENT CHATBOT WIDGET (HUMANIZED CONVERSATION)
// ============================================================================
let floatingChatOpen = false;
let floatingChatAgentId = "social_manager";
let floatingChatHistory = [
  {
    speaker: "Elena Rostova (AI Social Media Manager)",
    type: "agent",
    text: "Hey there! 👋 I'm Elena. You can chat with me or switch to any of my 9 teammates using the menu above. What are you working on in your business right now?"
  }
];

function initFloatingChatbot() {
  const sel = document.getElementById("fchatAgentSelector");
  if (!sel) return;
  sel.innerHTML = AI_EMPLOYEES.map(emp => {
    const shortVoice = (AGENT_VOICE_PROFILES[emp.id]?.slotName || "Natural Voice").split("•")[0].trim();
    return `<option value="${emp.id}">${emp.name} — ${emp.roleTitle} (${shortVoice})</option>`;
  }).join("");
  renderFloatingChatMessages();
}

function toggleFloatingChatbot(forceState) {
  floatingChatOpen = typeof forceState === "boolean" ? forceState : !floatingChatOpen;
  const win = document.getElementById("floatingChatbotWindow");
  if (win) {
    win.style.display = floatingChatOpen ? "flex" : "none";
  }
  if (floatingChatOpen) {
    const emp = AI_EMPLOYEES.find(e => e.id === floatingChatAgentId) || AI_EMPLOYEES[0];
    speakWithUniqueAgentVoice(emp.id, `Hey there! It's ${emp.name}. How's your day going, and how can I help you out with your business?`);
  }
}

function handleChangeFloatingChatAgent() {
  const sel = document.getElementById("fchatAgentSelector");
  if (!sel) return;
  floatingChatAgentId = sel.value;
  const emp = AI_EMPLOYEES.find(e => e.id === floatingChatAgentId) || AI_EMPLOYEES[0];

  const img = document.getElementById("fchatAgentAvatar");
  if (img) img.src = emp.portrait;

  const voiceLbl = document.getElementById("fchatVoiceLabel");
  if (voiceLbl) voiceLbl.textContent = `🎙️ ${getAgentVoiceDisplayLabel(emp.id)}`;

  const introMsg = `Hey there! I'm ${emp.name}, your ${emp.roleTitle}. What can I take off your plate today?`;
  floatingChatHistory.push({
    speaker: `${emp.name} (${emp.roleTitle})`,
    type: "agent",
    text: introMsg
  });
  renderFloatingChatMessages();
  speakWithUniqueAgentVoice(emp.id, introMsg);
}

function renderFloatingChatMessages() {
  const list = document.getElementById("fchatMessagesList");
  if (!list) return;
  list.innerHTML = floatingChatHistory.map(m => `
    <div class="chat-bubble ${m.type === 'agent' ? 'chat-agent' : 'chat-customer'}" style="max-width:92%;padding:10px 12px;font-size:0.8rem;">
      <div class="chat-speaker" style="font-size:0.68rem;">${m.speaker}</div>
      <div>${m.text}</div>
    </div>
  `).join("");
  list.scrollTop = list.scrollHeight;
}

function sendQuickFloatingPrompt(promptText) {
  const box = document.getElementById("fchatInputBox");
  if (box) box.value = promptText;
  sendFloatingChatbotMessage();
}

async function sendFloatingChatbotMessage() {
  const box = document.getElementById("fchatInputBox");
  if (!box || !box.value.trim()) return;
  const userQuery = box.value.trim();
  box.value = "";

  const visitorName = document.getElementById("fchatVisitorName").value.trim() || "friend";
  const visitorEmail = document.getElementById("fchatVisitorEmail").value.trim() || "visitor@aipreneurglobal.com";
  const emp = AI_EMPLOYEES.find(e => e.id === floatingChatAgentId) || AI_EMPLOYEES[0];

  floatingChatHistory.push({
    speaker: visitorName === "friend" ? "You" : visitorName,
    type: "customer",
    text: userQuery
  });

  let reply = "";
  const qLower = userQuery.toLowerCase();
  if (qLower.includes("price") || qLower.includes("cost") || qLower.includes("plan") || qLower.includes("hire")) {
    reply = `Honestly, ${visitorName}, that's the best part! You can bring me (${emp.name}) or our whole ten-person team on board for a fraction of what a single hire costs. I've noted down your question and our team will get back to you very shortly with a tailored plan!`;
  } else if (qLower.includes("demo") || qLower.includes("book") || qLower.includes("call")) {
    reply = `I'd love to show you around, ${visitorName}! Just pop your name and email into the registration box right on this page and log in—that'll unlock all ten of our live screen-share videos immediately, and we'll also get back to you shortly!`;
  } else {
    reply = `That's a great question, ${visitorName}! As your ${emp.roleTitle}, I can jump right in and handle "${userQuery}" for you around the clock so you don't have to stress about it. I've shared your note with our team, and we will get back to you shortly!`;
  }

  floatingChatHistory.push({
    speaker: `${emp.name} (${emp.roleTitle})`,
    type: "agent",
    text: reply
  });
  renderFloatingChatMessages();

  speakWithUniqueAgentVoice(emp.id, reply);

  try {
    await fetch(`${API_BASE}/api/chat`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        visitor_name: visitorName,
        visitor_email: visitorEmail,
        agent_id: emp.id,
        agent_name: emp.name,
        user_query: userQuery,
        agent_response: reply
      })
    });
  } catch (err) {}

  silentlyRouteToGmailAccount(
    "LIVE_CHATBOT_INQUIRY",
    `[AIPreneur Chatbot] ${visitorName} (${visitorEmail}) chatted with ${emp.name}`,
    { Visitor_Name: visitorName, Visitor_Email: visitorEmail, Agent: `${emp.name} (${emp.roleTitle})`, Question: userQuery, Agent_Reply: reply }
  );
}

// ============================================================================
// CHARACTER STUDIO & ROI CALCULATOR HELPERS
// ============================================================================
const preloadedPortraits = {};
function preloadAllPortraits() {
  AI_EMPLOYEES.forEach(emp => {
    const img = new Image();
    img.crossOrigin = "anonymous";
    img.src = emp.portrait;
    img.onload = () => {
      preloadedPortraits[emp.id] = img;
      renderCharacterCanvas();
    };
  });
}

function renderCharacterCanvas() {
  const canvas = document.getElementById("avatarCharacterCanvas");
  if (!canvas) return;
  const ctx = canvas.getContext("2d");

  const empName = document.getElementById("empNameInput").value || "Elena Rostova";
  const roleSelect = document.getElementById("empRoleSelect");
  const roleKey = roleSelect.value;
  const customRoleTitle = document.getElementById("customRoleInput").value;
  const roleLabel = roleKey === "custom_role" && customRoleTitle
    ? customRoleTitle
    : roleSelect.options[roleSelect.selectedIndex].text.split(" — ")[1] || roleSelect.options[roleSelect.selectedIndex].text;

  const accent = document.getElementById("avatarThemeColor").value;
  const website = document.getElementById("empWebsiteInput").value || "https://aipreneurglobal.com";
  const voiceSlot = getAgentVoiceDisplayLabel(roleKey);

  const checkedCaps = Array.from(document.querySelectorAll("#capabilityPillsContainer input:checked"))
    .map(cb => cb.value);

  const matchedEmp = AI_EMPLOYEES.find(e => e.id === roleKey) || AI_EMPLOYEES[0];
  const greetingEl = document.getElementById("avatarLiveGreeting");
  const greetingText = `"${matchedEmp.greeting}"`;
  if (greetingEl) greetingEl.textContent = greetingText;

  ctx.clearRect(0, 0, canvas.width, canvas.height);
  const bgGrad = ctx.createLinearGradient(0, 0, canvas.width, canvas.height);
  bgGrad.addColorStop(0, "#090D1E");
  bgGrad.addColorStop(0.6, "#111A36");
  bgGrad.addColorStop(1, "#071324");
  ctx.fillStyle = bgGrad;
  ctx.fillRect(0, 0, canvas.width, canvas.height);

  ctx.fillStyle = "rgba(255,255,255,0.05)";
  ctx.fillRect(0, 0, canvas.width, 52);
  ctx.fillStyle = "#38BDF8";
  ctx.font = "bold 14px 'Plus Jakarta Sans', sans-serif";
  ctx.fillText("AIPRENEUR OFFICIAL LIFELIKE AI EMPLOYEE CARD • AIPRENEURGLOBAL.COM", 24, 31);

  ctx.save();
  ctx.strokeStyle = accent;
  ctx.lineWidth = 3;
  ctx.fillStyle = "#0F172A";
  ctx.beginPath();
  ctx.roundRect(34, 78, 220, 260, 20);
  ctx.fill();
  ctx.stroke();

  const loadedImg = preloadedPortraits[roleKey] || preloadedPortraits["social_manager"];
  if (loadedImg) {
    ctx.save();
    ctx.beginPath();
    ctx.roundRect(38, 82, 212, 252, 16);
    ctx.clip();
    ctx.drawImage(loadedImg, 38, 82, 212, 252);
    ctx.restore();
  }

  ctx.fillStyle = "rgba(7, 11, 25, 0.88)";
  ctx.fillRect(46, 298, 196, 28);
  ctx.fillStyle = "#34D399";
  ctx.font = "bold 12px 'Inter', sans-serif";
  ctx.fillText("● NATURAL HUMAN VOICE", 64, 316);
  ctx.restore();

  ctx.fillStyle = "#FFFFFF";
  ctx.font = "800 25px 'Plus Jakarta Sans', sans-serif";
  ctx.fillText(empName, 280, 108);

  ctx.fillStyle = "#38BDF8";
  ctx.font = "bold 14px 'Inter', sans-serif";
  ctx.fillText(roleLabel.toUpperCase().substring(0, 38), 280, 134);

  ctx.fillStyle = "#A7F3D0";
  ctx.font = "bold 12.5px 'Inter', sans-serif";
  ctx.fillText("🎙️ " + voiceSlot.substring(0, 48), 280, 158);

  ctx.fillStyle = "#94A3B8";
  ctx.font = "12.5px 'Inter', sans-serif";
  ctx.fillText("Trained on: " + website, 280, 180);

  ctx.fillStyle = "#E2E8F0";
  ctx.font = "bold 13px 'Inter', sans-serif";
  ctx.fillText("ASSIGNED WORKFORCE CAPABILITIES:", 280, 212);

  ctx.font = "12.5px 'Inter', sans-serif";
  ctx.fillStyle = "#34D399";
  checkedCaps.slice(0, 5).forEach((cap, idx) => {
    ctx.fillText("✓ " + cap, 280, 236 + idx * 22);
  });

  ctx.fillStyle = "rgba(79, 70, 229, 0.25)";
  ctx.fillRect(24, 358, canvas.width - 48, 62);
  ctx.strokeStyle = "rgba(56, 189, 248, 0.45)";
  ctx.strokeRect(24, 358, canvas.width - 48, 62);

  ctx.fillStyle = "#FFFFFF";
  ctx.font = "bold 13px 'Inter', sans-serif";
  ctx.fillText("STATEMENT: This AIPreneur (aipreneurglobal.com) portal creates lifelike AI employee avatars.", 38, 383);
  ctx.fillStyle = "#CBD5E1";
  ctx.font = "12.5px 'Inter', sans-serif";
  ctx.fillText("You can utilize them as your own dedicated employees while forming and scaling your business.", 38, 404);
}

function deployCustomEmployee() {
  const roleKey = document.getElementById("empRoleSelect").value;
  openAgentVideoDemo(roleKey);
}

function speakPreviewAvatar() {
  const roleKey = document.getElementById("empRoleSelect").value;
  if (!requireAuthForDemo(roleKey)) return;
  const matchedEmp = AI_EMPLOYEES.find(e => e.id === roleKey) || AI_EMPLOYEES[0];
  speakWithUniqueAgentVoice(roleKey, matchedEmp.greeting);
}

function downloadAvatarBadgePNG() {
  renderCharacterCanvas();
  const canvas = document.getElementById("avatarCharacterCanvas");
  const link = document.createElement("a");
  const empName = (document.getElementById("empNameInput").value || "AI-Employee").replace(/\s+/g, "-");
  link.download = `AIPreneur-${empName}-Avatar-Card.png`;
  link.href = canvas.toDataURL("image/png");
  link.click();
}

function recordAndDownloadAgentClip() {
  if (!requireAuthForDemo(activeDemoEmployeeId)) return;
  const canvas = document.getElementById("agentVideoCanvas");
  if (!canvas || typeof MediaRecorder === "undefined") {
    alert("Video export is supported in modern Chromium/Firefox/Safari browsers.");
    return;
  }

  const emp = AI_EMPLOYEES.find(e => e.id === activeDemoEmployeeId) || AI_EMPLOYEES[0];
  const ctx = canvas.getContext("2d");
  const btn = document.getElementById("recordVideoBtn");
  if (btn) {
    btn.textContent = "🔴 Exporting 5s Clip...";
    btn.disabled = true;
  }

  let recFrame = 0;
  const drawExportCanvas = () => {
    ctx.fillStyle = "#070B19";
    ctx.fillRect(0, 0, canvas.width, canvas.height);
    ctx.fillStyle = emp.accent;
    ctx.fillRect(0, 0, canvas.width, 8);
    const img = preloadedPortraits[emp.id] || preloadedPortraits["social_manager"];
    if (img) ctx.drawImage(img, 36, 50, 220, 280);
    ctx.fillStyle = "#FFFFFF";
    ctx.font = "bold 26px 'Plus Jakarta Sans', sans-serif";
    ctx.fillText(`${emp.name} — ${emp.roleTitle}`, 290, 90);
    ctx.fillStyle = "#38BDF8";
    ctx.font = "bold 16px 'Inter', sans-serif";
    const sc = emp.videoScenes[videoSceneIndex] || emp.videoScenes[0];
    ctx.fillText(sc.actionBadge, 290, 130);
    ctx.fillStyle = "#E2E8F0";
    ctx.font = "15px 'Inter', sans-serif";
    ctx.fillText(sc.spokenText.substring(0, 68) + "...", 290, 175);
    ctx.fillStyle = "#34D399";
    ctx.fillText("✓ AIPreneur Official Live Agent Demo • aipreneurglobal.com", 290, 230);
    recFrame++;
    if (recFrame < 150) requestAnimationFrame(drawExportCanvas);
  };
  drawExportCanvas();

  const stream = canvas.captureStream(30);
  const chunks = [];
  const recorder = new MediaRecorder(stream);
  recorder.ondataavailable = e => { if (e.data && e.data.size > 0) chunks.push(e.data); };
  recorder.onstop = () => {
    const blob = new Blob(chunks, { type: "video/webm" });
    const a = document.createElement("a");
    a.href = URL.createObjectURL(blob);
    a.download = `AIPreneur-${emp.name.replace(/\s+/g, "-")}-Demo.webm`;
    a.click();
    if (btn) {
      btn.textContent = "⬇️ Export Demo Clip (.webm)";
      btn.disabled = false;
    }
  };
  recorder.start();
  setTimeout(() => { if (recorder.state === "recording") recorder.stop(); }, 5000);
}

function sendCustomDemoMessage() {
  if (!requireAuthForDemo(activeDemoEmployeeId)) return;
  const input = document.getElementById("customDemoPrompt");
  if (!input || !input.value.trim()) return;
  const userText = input.value.trim();
  input.value = "";

  const emp = AI_EMPLOYEES.find(e => e.id === activeDemoEmployeeId) || AI_EMPLOYEES[0];
  const streamEl = document.getElementById("demoConversationStream");

  const replyText = `Hey there! It's ${emp.name}. I'm on it! I've just taken care of "${userText}" for you and updated your dashboard so you don't have to worry about a thing.`;

  emp.demoConversation.push(
    { speaker: "You (Business Owner / Client)", type: "customer", text: userText },
    { speaker: `${emp.name} (${emp.roleTitle})`, type: "agent", text: replyText }
  );

  selectEmployeeForDemo(emp.id, false);
  switchDemoMode("chat");
  if (streamEl) streamEl.scrollTop = streamEl.scrollHeight;
  speakWithUniqueAgentVoice(emp.id, replyText);
}

function playFullDemoScriptVoice() {
  if (!requireAuthForDemo(activeDemoEmployeeId)) return;
  const emp = AI_EMPLOYEES.find(e => e.id === activeDemoEmployeeId) || AI_EMPLOYEES[0];
  const agentLines = emp.demoConversation.filter(m => m.type === "agent").map(m => m.text).join(" ");
  speakWithUniqueAgentVoice(emp.id, agentLines);
}

function updateROICalculator() {
  const missedCalls = parseInt(document.getElementById("missedCallsInput").value, 10) || 18;
  const dealVal = parseInt(document.getElementById("avgDealValueInput").value, 10) || 850;
  const closeRate = parseInt(document.getElementById("closeRateInput").value, 10) || 28;
  const teamSize = parseInt(document.getElementById("aiTeamSizeInput").value, 10) || 6;

  document.getElementById("missedCallsVal").textContent = `${missedCalls} inquiries/wk`;
  document.getElementById("avgDealValueVal").textContent = `$${dealVal.toLocaleString()}`;
  document.getElementById("closeRateVal").textContent = `${closeRate}%`;
  document.getElementById("aiTeamSizeVal").textContent = `${teamSize} AI Employees`;

  const monthlyDeals = Math.round(missedCalls * 4.33 * (closeRate / 100));
  const annualRevenue = Math.round(monthlyDeals * 12 * dealVal);
  const hoursSaved = teamSize * 64;
  const payrollSaved = teamSize * 2900;

  document.getElementById("roiAnnualRevenue").textContent = `$${annualRevenue.toLocaleString()}`;
  document.getElementById("roiMonthlyBookings").textContent = `${monthlyDeals} deals/mo`;
  document.getElementById("roiHoursSaved").textContent = `${hoursSaved} hrs/mo`;
  document.getElementById("roiPayrollSaved").textContent = `$${payrollSaved.toLocaleString()}/mo`;
}

// INITIALIZATION
document.addEventListener("DOMContentLoaded", () => {
  if ("speechSynthesis" in window) {
    window.speechSynthesis.onvoiceschanged = allocateNonOverlappingVoices;
    allocateNonOverlappingVoices();
  }

  const savedSession = sessionStorage.getItem("aipreneur_active_user");
  if (savedSession) {
    try {
      currentAuthenticatedCustomer = JSON.parse(savedSession);
      isUserAuthenticated = true;
    } catch (e) {}
  }

  preloadAllPortraits();
  generateDefaultSocialCalendar("Launching 24/7 AI Employee Avatars for Growing Businesses", "Company Brand Voice (AIPreneur — Plain-English Authority)");
  renderVoiceAuditionBar();
  renderHeroMiniGrid();
  renderWorkforceRoster();
  renderDemoRoleList();
  selectEmployeeForDemo("social_manager", false);
  renderCharacterCanvas();
  updateROICalculator();
  initFloatingChatbot();
  updateAuthGateUI();

  requestAnimationFrame(tickRealisticVideoLoop);

  document.querySelectorAll("#roleFilterTabs .filter-btn").forEach(btn => {
    btn.addEventListener("click", () => {
      document.querySelectorAll("#roleFilterTabs .filter-btn").forEach(b => b.classList.remove("active"));
      btn.classList.add("active");
      activeFilter = btn.getAttribute("data-filter");
      renderWorkforceRoster();
    });
  });

  ["empNameInput", "empRoleSelect", "customRoleInput", "avatarLookSelect", "avatarThemeColor", "empToneSelect", "empWebsiteInput"].forEach(id => {
    const el = document.getElementById(id);
    if (el) {
      el.addEventListener("input", () => {
        if (id === "empRoleSelect") {
          const customGroup = document.getElementById("customRoleGroup");
          customGroup.style.display = el.value === "custom_role" ? "block" : "none";
          const matchedEmp = AI_EMPLOYEES.find(e => e.id === el.value);
          if (matchedEmp) {
            document.getElementById("empNameInput").value = matchedEmp.name;
          }
        }
        renderCharacterCanvas();
      });
    }
  });

  document.querySelectorAll("#capabilityPillsContainer input").forEach(cb => {
    cb.addEventListener("change", renderCharacterCanvas);
  });

  const telemetryMessages = [
    "Elena Rostova (Natural Female Voice 1) designed 4 visual photo posts for LinkedIn, IG, FB & X • 2s ago",
    "Sophia Sterling (Natural Female Voice 2) answered an after-hours call & booked a Thursday 2 PM estimate • 5s ago",
    "Marcus Vance (Natural Executive Male) transcribed a Zoom call & moved deal to Proposal Sent • 9s ago",
    "Liam O'Connor (Natural Irish Female) published a 2,100-word SEO article to WordPress • 13s ago",
    "Maya Lin (Natural Copywriter Female) crafted a visual landing page hero & 3-part email sequence • 17s ago",
    "Claude Bennett (Natural Studio Male) edited a 60s vertical Reel with kinetic captions • 21s ago",
    "Arjun Mehta (Natural Indian Male • en-IN) published your Monday AIR Revenue Attribution Report • 25s ago",
    "Jordan Brooks (Natural British Male) resolved a support chat & booked a walkthrough • 29s ago",
    "Dr. Clara Chen (Natural Research Female) audited brand citations on ChatGPT & Gemini • 33s ago",
    "Alex Rivera (Natural Young Male) automated a 5-star Google Business Profile review • 37s ago"
  ];
  let tIdx = 0;
  setInterval(() => {
    tIdx = (tIdx + 1) % telemetryMessages.length;
    const tEl = document.getElementById("heroTelemetryText");
    if (tEl) tEl.textContent = telemetryMessages[tIdx];
  }, 4200);
});
