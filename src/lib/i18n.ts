import type { Lang } from '@/data/db';

// Real, working language toggle. Every screen reads its copy from here, so
// switching EN / Hinglish / हिंदी actually re-renders the UI (and the LLM output
// language is driven separately by the prompt builder).
export interface Strings {
  // Entry
  tagline: string;
  entryBlurb: string;
  chooseLanguage: string;
  langSwitchNote: string;
  begin: string;
  runsOnDevice: string;
  // Provider
  settingUpPrivacy: string;
  kitchenStaysYours: string;
  privacyBody: string;
  nothingLeaves: string;
  nothingLeavesSub: string;
  whoCooksIdeas: string;
  bringYourKey: string;
  needsKey: string;
  pasteKey: string;
  verify: string;
  verified: string;
  verifying: string;
  or: string;
  onDeviceCook: string;
  experimental: string;
  onDeviceDesc: string;
  onDeviceNote: string;
  keySafety: string;
  continue: string;
  // Onboarding
  about90: string;
  skip: string;
  justBasics: string;
  basicsTitle: string;
  basicsBody: string;
  cookingFrom: string;
  neverEats: string;
  cookingForSpecial: string;
  showFirstIdea: string;
  skipStart: string;
  // Daily
  greeting: string;
  todayLabel: (d: string) => string;
  whatsInKitchen: string;
  tapWhatYouGot: string;
  add: string;
  tonight: string;
  whosCooking: string;
  energyTonight: string;
  anythingSpecial: string;
  showMeIdea: string;
  // Hero
  another: string;
  tonightsIdea: string;
  fitsYourHouse: string;
  whyThisWorks: string;
  forN: (n: number) => string;
  costHigh: string;
  costMedium: string;
  costLow: string;
  whatYoullNeed: string;
  toBuy: (n: number) => string;
  howToMake: string;
  leftoverIdea: string;
  orSimpler: string;
  letsMakeThis: string;
  dishPhoto: string;
  confidentHigh: string;
  confidentMedium: string;
  confidentLow: string;
  // States
  thinking: string[];
  oneTimeSetup: string;
  settingUpCook: string;
  downloadBody: string;
  downloadingModel: string;
  downloadMeta: string;
  takeYourTime: string;
  couldntReach: string;
  couldntReachBody: string;
  tryAgain: string;
  checkKey: string;
  useOnDevice: string;
  meanwhileWorks: string;
  comfortBanner: string;
  comfortBannerSub: string;
  fromYourKitchen: string;
  cookItAgain: string;
  instantNoAI: string;
  freshIdeaSoon: string;
  // Offline
  offline: string;
  offlineKitchenWorks: string;
  freshIdeaNeedsNet: string;
  needsInternet: string;
  backOnline: string;
  stillRightHere: string;
  mealHistoryTitle: string;
  savedRecipes: string;
  localPrices: string;
  cookLoved: string;
  // Feedback
  howWasIdea: string;
  oneTap: string;
  yes: string;
  almost: string;
  no: string;
  whatWouldMakeRight: string;
  honestKindest: string;
  // History
  regulars: string;
  cookedLoved: string;
  makeAgain: string;
  earlierWeek: string;
  again: string;
  everyMealWiser: string;
  emptyHistory: string;
  // Provider setup v2 (free-first) + Why-BYO explainer
  howShouldThink: string;
  startFreeTitle: string;
  easiestRecommended: string;
  tryFreeOnDevice: string;
  tryFreeBody: string;
  tryFreeBodyEmphasis: string;
  startFree: string;
  orUseFreeKey: string;
  freeTier: string;
  groqDesc: string;
  geminiDesc: string;
  getAKey: string;
  bringOwnKey: string;
  sharedTestAccess: string;
  sharedTestDesc: string;
  whateverPick: string;
  whyByoLink: string;
  whyIntro: string;
  why1t: string;
  why1b: string;
  why2t: string;
  why2b: string;
  why3t: string;
  why3b: string;
  why4t: string;
  why4b: string;
  whyKeySafe: string;
  pickHowThinks: string;
  // generic
  back: string;
}

const en: Strings = {
  tagline: 'The quiet comfort of a well-fed home.',
  entryBlurb:
    'The question that comes every evening — "what shall we cook?" Let’s answer it together, with what’s already in your kitchen.',
  chooseLanguage: 'Choose your language',
  langSwitchNote: 'Whoever’s at the stove can switch this anytime.',
  begin: 'Let’s begin',
  runsOnDevice: 'Runs on your device · no account needed',
  settingUpPrivacy: 'Setting up · privacy',
  kitchenStaysYours: 'Your kitchen stays yours.',
  privacyBody:
    'Tripti runs no servers. Your profile and your key live on this device — nowhere else. This is also where you choose who does the thinking.',
  nothingLeaves: 'Nothing leaves this phone by default',
  nothingLeavesSub: 'We can’t see your household — there’s no "we" on the other end.',
  whoCooksIdeas: 'Who should cook up ideas?',
  bringYourKey: 'Bring your own key',
  needsKey: 'needs an API key',
  pasteKey: 'Paste your key — it’s stored only here',
  verify: 'Verify & save',
  verified: 'Verified',
  verifying: 'Verifying…',
  or: 'or',
  onDeviceCook: 'On-device cook',
  experimental: 'Experimental',
  onDeviceDesc: 'Nothing leaves your phone, no key. Slower, simpler ideas.',
  onDeviceNote: 'It downloads once, then works with no internet at all.',
  keySafety: 'A key saved here is only as safe as your phone is — we won’t pretend it’s safer than that.',
  continue: 'Continue',
  about90: 'About 90 seconds',
  skip: 'Skip',
  justBasics: 'Just the basics',
  basicsTitle: 'Let’s get the basics down.',
  basicsBody: 'Three quick things — I’ll learn the rest as we cook together.',
  cookingFrom: 'Where’s your cooking from?',
  neverEats: 'Anything the house never eats?',
  cookingForSpecial: 'Cooking for anyone special right now?',
  showFirstIdea: 'Show my first idea',
  skipStart: 'Skip and start anyway — I’ll catch up as we go.',
  greeting: 'Namaste',
  todayLabel: (d) => `Today · ${d}`,
  whatsInKitchen: 'What’s in the kitchen?',
  tapWhatYouGot: 'Tap what you’ve got — a rough idea is plenty.',
  add: '+ Add',
  tonight: 'Tonight',
  whosCooking: 'Who’s cooking?',
  energyTonight: 'Energy tonight',
  anythingSpecial: 'Anything special?',
  showMeIdea: 'Show me an idea',
  another: 'Another',
  tonightsIdea: 'Tonight’s idea',
  fitsYourHouse: 'Fits your house',
  whyThisWorks: 'Why this works for your house',
  forN: (n) => `for ${n}`,
  costHigh: 'Cost · high confidence',
  costMedium: 'Cost · medium confidence',
  costLow: 'Cost · rough estimate',
  whatYoullNeed: 'What you’ll need',
  toBuy: (n) => (n === 1 ? '1 thing to buy' : `${n} things to buy`),
  howToMake: 'How to make it',
  leftoverIdea: 'Leftover idea',
  orSimpler: 'Or something simpler',
  letsMakeThis: 'Let’s make this',
  dishPhoto: 'dish photo',
  confidentHigh: 'I’m confident about this one.',
  confidentMedium: 'I think this fits — here’s a calmer option too.',
  confidentLow: 'I’m less sure tonight — a simpler backup is below.',
  thinking: [
    'Checking today’s house rules…',
    'Reviewing rough prices…',
    'Seeing what’s in your kitchen…',
    'Keeping everyone’s plate in mind…',
  ],
  oneTimeSetup: 'One-time setup',
  settingUpCook: 'Setting up your on-device cook',
  downloadBody: 'This downloads once, then works fully offline — nothing ever leaves your phone.',
  downloadingModel: 'Downloading model',
  downloadMeta: 'Downloads once',
  takeYourTime: 'Take your time — you don’t need to wait on this screen.',
  couldntReach: 'I couldn’t reach your cook just now.',
  couldntReachBody:
    'It’s not you — the connection or the key didn’t go through. Nothing’s lost. Let’s try a gentle fix.',
  tryAgain: 'Try again',
  checkKey: 'Check your API key',
  useOnDevice: 'Use the on-device cook',
  meanwhileWorks: 'Meanwhile, last night’s idea and your saved recipes still work.',
  comfortBanner: 'A comforting favourite while we recalibrate',
  comfortBannerSub: 'I had a hiccup making something new — here’s one your house already loves.',
  fromYourKitchen: 'From your kitchen',
  cookItAgain: 'Cook it again',
  instantNoAI: 'Instant · no internet, no AI needed',
  freshIdeaSoon: 'I’ll have a fresh idea ready in a moment.',
  offline: 'Offline',
  offlineKitchenWorks: 'You’re offline — your kitchen still works',
  freshIdeaNeedsNet: 'A fresh idea from your cook',
  needsInternet: 'Needs internet',
  backOnline: 'Back online and I’ll have one ready right away.',
  stillRightHere: 'Still right here',
  mealHistoryTitle: 'Meal history',
  savedRecipes: 'Saved recipes',
  localPrices: 'Local price list',
  cookLoved: 'Cook something you’ve loved before',
  howWasIdea: 'How was this idea?',
  oneTap: 'One tap is all I need — it helps me suggest better tomorrow.',
  yes: 'Yes',
  almost: 'Almost',
  no: 'No',
  whatWouldMakeRight: 'What would’ve made it just right?',
  honestKindest: 'Your honest answer is the kindest one.',
  regulars: 'Your kitchen’s regulars',
  cookedLoved: 'Cooked & loved',
  makeAgain: 'Make any of these again — instant, no internet, no AI needed.',
  earlierWeek: 'Earlier',
  again: 'Again',
  everyMealWiser: 'Every meal you cook makes Tripti’s next idea a little wiser.',
  emptyHistory: 'Once you cook a few meals, your loved favourites land here.',
  howShouldThink: 'How should Tripti think?',
  startFreeTitle: 'Start free — no card, no account.',
  easiestRecommended: 'Easiest · recommended',
  tryFreeOnDevice: 'Try Tripti free, on your device',
  tryFreeBody: 'No key, no sign-up. Nothing ever leaves your phone. ',
  tryFreeBodyEmphasis: 'Slower, and the ideas are simpler — honest about that.',
  startFree: 'Start free →',
  orUseFreeKey: 'Or use your own free key · 2 min',
  freeTier: 'FREE TIER',
  groqDesc: 'Fast · generous free limits',
  geminiDesc: 'Google · free for everyday use',
  getAKey: 'Get a key →',
  bringOwnKey: 'Bring your own key',
  sharedTestAccess: 'Shared test access',
  sharedTestDesc: 'Trusted testers only · your operator has enabled it',
  whateverPick: 'Whatever you pick, your household details stay on this device.',
  whyByoLink: 'Why bring your own AI?',
  whyIntro: 'Your family’s health and budget are personal. Here’s how Tripti keeps them that way.',
  why1t: 'It all lives on your phone',
  why1b: 'Your household, your plan, your budget — stored only here.',
  why2t: 'Only the question travels',
  why2b: 'When you ask for an idea, Tripti sends just that to the AI you chose.',
  why3t: 'We run no servers',
  why3b: 'There’s no Tripti account, and nothing for us to see.',
  why4t: 'Or send nothing at all',
  why4b: 'Prefer total privacy? The on-device cook never leaves your phone.',
  whyKeySafe: 'A key you save here is only as safe as your phone — we won’t pretend otherwise.',
  pickHowThinks: 'Pick how Tripti thinks',
  back: 'Back',
};

const hinglish: Strings = {
  ...en,
  tagline: 'Ek bhare-pet ghar ka sukoon.',
  entryBlurb:
    'Har shaam ka sawaal — "aaj kya banaye?" Chalo ise saath mein hal karte hain, jo aapke kitchen mein already hai usi se.',
  chooseLanguage: 'Apni bhasha chuniye',
  langSwitchNote: 'Jo bhi stove pe ho, kabhi bhi badal sakta hai.',
  begin: 'Chaliye shuru karein',
  runsOnDevice: 'Aapke phone pe chalta hai · koi account nahi',
  kitchenStaysYours: 'Aapki rasoi aapki hi rehti hai.',
  privacyBody:
    'Tripti ka koi server nahi. Aapki profile aur key sirf isi phone pe rehti hai — kahin aur nahi. Yahin aap chunte ho ki sochega kaun.',
  nothingLeaves: 'Default mein kuch bhi phone se bahar nahi jaata',
  nothingLeavesSub: 'Hum aapka ghar dekh hi nahi sakte — doosri taraf koi "hum" hai hi nahi.',
  whoCooksIdeas: 'Ideas kaun banaye?',
  bringYourKey: 'Apni khud ki key laayein',
  pasteKey: 'Apni key paste karein — sirf yahin save hoti hai',
  verify: 'Verify karke save karein',
  verified: 'Verified',
  verifying: 'Verify ho raha hai…',
  onDeviceCook: 'On-device cook',
  onDeviceDesc: 'Kuch bhi phone se bahar nahi, koi key nahi. Thoda slow, simple ideas.',
  onDeviceNote: 'Ek baar download hota hai, phir bina internet ke kaam karta hai.',
  keySafety: 'Yahan save ki key utni hi safe hai jitna aapka phone — isse zyada safe hum nahi kehte.',
  continue: 'Aage badhein',
  about90: 'Lagbhag 90 second',
  skip: 'Skip',
  justBasics: 'Bas basics',
  basicsTitle: 'Chalo basics set kar lete hain.',
  basicsBody: 'Teen chhoti baatein — baaki main saath cook karte karte seekh loongi.',
  cookingFrom: 'Aapki cooking kahan se hai?',
  neverEats: 'Ghar mein kya bilkul nahi khaya jaata?',
  cookingForSpecial: 'Abhi kisi khaas ke liye bana rahe ho?',
  showFirstIdea: 'Mera pehla idea dikhao',
  skipStart: 'Skip karke shuru karo — main saath mein catch up kar loongi.',
  greeting: 'Namaste',
  todayLabel: (d) => `Aaj · ${d}`,
  whatsInKitchen: 'Kitchen mein kya hai?',
  tapWhatYouGot: 'Jo hai uspe tap karo — mota-mota idea kaafi hai.',
  add: '+ Add',
  tonight: 'Aaj raat',
  whosCooking: 'Kaun bana raha hai?',
  energyTonight: 'Aaj ki energy',
  anythingSpecial: 'Kuch khaas?',
  showMeIdea: 'Ek idea dikhao',
  another: 'Doosra',
  tonightsIdea: 'Aaj ka idea',
  fitsYourHouse: 'Aapke ghar ke liye sahi',
  whyThisWorks: 'Ye aapke ghar ke liye kyun sahi hai',
  whatYoullNeed: 'Kya chahiye hoga',
  toBuy: (n) => (n === 1 ? '1 cheez kharidni hai' : `${n} cheezein kharidni hain`),
  howToMake: 'Kaise banayein',
  leftoverIdea: 'Bache hue ka idea',
  orSimpler: 'Ya kuch aur simple',
  letsMakeThis: 'Chalo ye banate hain',
  confidentHigh: 'Iske baare mein main confident hoon.',
  confidentMedium: 'Lagta hai ye fit hai — ek aaram wala option bhi hai.',
  confidentLow: 'Aaj thoda kam sure hoon — neeche ek simple backup hai.',
  thinking: [
    'Aaj ke ghar ke niyam dekh rahi hoon…',
    'Mote-mote daam dekh rahi hoon…',
    'Kitchen mein kya hai dekh rahi hoon…',
    'Sabki thali dhyaan mein rakh rahi hoon…',
  ],
  settingUpCook: 'Aapka on-device cook set ho raha hai',
  downloadBody: 'Ek baar download hota hai, phir poora offline chalta hai — kuch bahar nahi jaata.',
  downloadingModel: 'Model download ho raha hai',
  takeYourTime: 'Aaram se — is screen pe rukne ki zaroorat nahi.',
  couldntReach: 'Abhi aapke cook tak nahi pahunch paayi.',
  couldntReachBody: 'Aapki galti nahi — connection ya key nahi chali. Kuch nahi gaya. Ek aasaan fix try karte hain.',
  tryAgain: 'Phir se try karein',
  checkKey: 'Apni API key check karein',
  useOnDevice: 'On-device cook use karein',
  meanwhileWorks: 'Tab tak, kal raat ka idea aur saved recipes chalte rehte hain.',
  comfortBanner: 'Recalibrate karte hue ek comforting favourite',
  comfortBannerSub: 'Naya banane mein thodi dikkat aayi — ye ek jo ghar ko already pasand hai.',
  fromYourKitchen: 'Aapki rasoi se',
  cookItAgain: 'Phir se banao',
  instantNoAI: 'Turant · na internet, na AI',
  freshIdeaSoon: 'Ek fresh idea bas thodi der mein.',
  offlineKitchenWorks: 'Aap offline ho — par aapki rasoi chal rahi hai',
  freshIdeaNeedsNet: 'Aapke cook se naya idea',
  needsInternet: 'Internet chahiye',
  backOnline: 'Online aate hi turant ek ready kar doongi.',
  stillRightHere: 'Abhi bhi yahin',
  mealHistoryTitle: 'Meal history',
  savedRecipes: 'Saved recipes',
  localPrices: 'Local daam list',
  cookLoved: 'Kuch jo pehle pasand aaya tha banao',
  howWasIdea: 'Ye idea kaisa tha?',
  oneTap: 'Bas ek tap — kal behtar suggest karne mein madad karta hai.',
  yes: 'Haan',
  almost: 'Lagbhag',
  no: 'Nahi',
  whatWouldMakeRight: 'Kya hota toh bilkul sahi hota?',
  honestKindest: 'Aapka sachcha jawab hi sabse accha hai.',
  regulars: 'Aapki rasoi ke regulars',
  cookedLoved: 'Banaya aur pasand kiya',
  makeAgain: 'Inme se koi bhi phir banao — turant, na internet, na AI.',
  earlierWeek: 'Pehle',
  again: 'Phir se',
  everyMealWiser: 'Har meal Tripti ke agle idea ko thoda samajhdaar banata hai.',
  emptyHistory: 'Kuch meals cook karte hi, aapke favourites yahan aa jaayenge.',
  howShouldThink: 'Tripti kaise soche?',
  startFreeTitle: 'Free shuru karein — na card, na account.',
  easiestRecommended: 'Sabse aasaan · recommended',
  tryFreeOnDevice: 'Tripti free try karein, apne phone pe',
  tryFreeBody: 'Na key, na sign-up. Kuch bhi phone se bahar nahi jaata. ',
  tryFreeBodyEmphasis: 'Thoda slow, aur ideas simple — iske baare mein honest hain.',
  startFree: 'Free shuru karein →',
  orUseFreeKey: 'Ya apni free key use karein · 2 min',
  getAKey: 'Key lein →',
  bringOwnKey: 'Apni key laayein',
  sharedTestAccess: 'Shared test access',
  sharedTestDesc: 'Sirf trusted testers · operator ne enable kiya hai',
  whateverPick: 'Jo bhi chunein, aapke ghar ki details isi phone pe rehti hain.',
  whyByoLink: 'Apni khud ki AI kyun?',
  whyIntro: 'Aapke parivaar ki sehat aur budget personal hai. Tripti use aise hi rakhti hai.',
  why1t: 'Sab kuch aapke phone pe',
  why2t: 'Sirf sawaal jaata hai',
  why3t: 'Hamare koi server nahi',
  why4t: 'Ya kuch bhi mat bhejein',
  pickHowThinks: 'Chunein Tripti kaise soche',
};

const regional: Strings = {
  ...en,
  tagline: 'भरे-पेट घर का सुकून।',
  entryBlurb:
    'हर शाम का सवाल — "आज क्या बनाएँ?" चलिए इसे साथ मिलकर हल करें, जो आपकी रसोई में पहले से है उसी से।',
  chooseLanguage: 'अपनी भाषा चुनें',
  langSwitchNote: 'जो भी चूल्हे पर हो, कभी भी बदल सकता है।',
  begin: 'चलिए शुरू करें',
  runsOnDevice: 'आपके फ़ोन पर चलता है · कोई अकाउंट नहीं',
  settingUpPrivacy: 'सेटअप · प्राइवेसी',
  kitchenStaysYours: 'आपकी रसोई आपकी ही रहती है।',
  privacyBody:
    'तृप्ति का कोई सर्वर नहीं। आपकी प्रोफ़ाइल और की सिर्फ़ इसी फ़ोन पर रहती है — और कहीं नहीं। यहीं आप चुनते हैं कि सोचेगा कौन।',
  nothingLeaves: 'डिफ़ॉल्ट में कुछ भी फ़ोन से बाहर नहीं जाता',
  nothingLeavesSub: 'हम आपका घर देख ही नहीं सकते — दूसरी तरफ़ कोई "हम" है ही नहीं।',
  whoCooksIdeas: 'आइडिया कौन बनाए?',
  bringYourKey: 'अपनी की लाएँ',
  needsKey: 'API की चाहिए',
  pasteKey: 'अपनी की पेस्ट करें — सिर्फ़ यहीं सेव होती है',
  verify: 'वेरिफ़ाई करके सेव करें',
  verified: 'वेरिफ़ाइड',
  verifying: 'वेरिफ़ाई हो रहा है…',
  or: 'या',
  onDeviceCook: 'ऑन-डिवाइस कुक',
  experimental: 'प्रयोगात्मक',
  onDeviceDesc: 'कुछ भी फ़ोन से बाहर नहीं, कोई की नहीं। थोड़ा धीमा, सरल आइडिया।',
  onDeviceNote: 'एक बार डाउनलोड होता है, फिर बिना इंटरनेट के चलता है।',
  keySafety: 'यहाँ सेव की उतनी ही सुरक्षित है जितना आपका फ़ोन — इससे ज़्यादा हम नहीं कहते।',
  continue: 'आगे बढ़ें',
  about90: 'लगभग 90 सेकंड',
  skip: 'छोड़ें',
  justBasics: 'बस ज़रूरी बातें',
  basicsTitle: 'चलिए ज़रूरी बातें तय कर लें।',
  basicsBody: 'तीन छोटी बातें — बाकी मैं साथ पकाते-पकाते सीख लूँगी।',
  cookingFrom: 'आपकी रसोई कहाँ की है?',
  neverEats: 'घर में क्या बिलकुल नहीं खाया जाता?',
  cookingForSpecial: 'अभी किसी खास के लिए बना रहे हैं?',
  showFirstIdea: 'मेरा पहला आइडिया दिखाएँ',
  skipStart: 'छोड़कर शुरू करें — मैं साथ में समझ लूँगी।',
  greeting: 'नमस्ते',
  todayLabel: (d) => `आज · ${d}`,
  whatsInKitchen: 'रसोई में क्या है?',
  tapWhatYouGot: 'जो है उस पर टैप करें — मोटा-मोटा अंदाज़ा काफ़ी है।',
  add: '+ जोड़ें',
  tonight: 'आज रात',
  whosCooking: 'कौन बना रहा है?',
  energyTonight: 'आज की ऊर्जा',
  anythingSpecial: 'कुछ खास?',
  showMeIdea: 'एक आइडिया दिखाएँ',
  another: 'दूसरा',
  tonightsIdea: 'आज का आइडिया',
  fitsYourHouse: 'आपके घर के लिए सही',
  whyThisWorks: 'यह आपके घर के लिए क्यों सही है',
  whatYoullNeed: 'क्या चाहिए होगा',
  toBuy: (n) => (n === 1 ? '1 चीज़ ख़रीदनी है' : `${n} चीज़ें ख़रीदनी हैं`),
  howToMake: 'कैसे बनाएँ',
  leftoverIdea: 'बचे हुए का आइडिया',
  orSimpler: 'या कुछ और सरल',
  letsMakeThis: 'चलिए यह बनाते हैं',
  dishPhoto: 'व्यंजन फ़ोटो',
  confidentHigh: 'इसके बारे में मैं आश्वस्त हूँ।',
  confidentMedium: 'लगता है यह सही है — एक आराम वाला विकल्प भी है।',
  confidentLow: 'आज थोड़ी कम पक्की हूँ — नीचे एक सरल बैकअप है।',
  thinking: [
    'आज के घर के नियम देख रही हूँ…',
    'मोटे-मोटे दाम देख रही हूँ…',
    'रसोई में क्या है देख रही हूँ…',
    'सबकी थाली ध्यान में रख रही हूँ…',
  ],
  oneTimeSetup: 'एक बार का सेटअप',
  settingUpCook: 'आपका ऑन-डिवाइस कुक सेट हो रहा है',
  downloadBody: 'एक बार डाउनलोड होता है, फिर पूरा ऑफ़लाइन चलता है — कुछ बाहर नहीं जाता।',
  downloadingModel: 'मॉडल डाउनलोड हो रहा है',
  downloadMeta: 'एक बार डाउनलोड',
  takeYourTime: 'आराम से — इस स्क्रीन पर रुकने की ज़रूरत नहीं।',
  couldntReach: 'अभी आपके कुक तक नहीं पहुँच पाई।',
  couldntReachBody: 'आपकी ग़लती नहीं — कनेक्शन या की नहीं चली। कुछ नहीं गया। एक आसान फ़िक्स आज़माते हैं।',
  tryAgain: 'फिर कोशिश करें',
  checkKey: 'अपनी API की जाँचें',
  useOnDevice: 'ऑन-डिवाइस कुक इस्तेमाल करें',
  meanwhileWorks: 'तब तक, कल रात का आइडिया और सेव की हुई रेसिपी चलती रहती हैं।',
  comfortBanner: 'फिर से संभलते हुए एक पसंदीदा',
  comfortBannerSub: 'कुछ नया बनाने में थोड़ी दिक्कत हुई — यह एक जो घर को पहले से पसंद है।',
  fromYourKitchen: 'आपकी रसोई से',
  cookItAgain: 'फिर से बनाएँ',
  instantNoAI: 'तुरंत · न इंटरनेट, न AI',
  freshIdeaSoon: 'एक नया आइडिया बस थोड़ी देर में।',
  offline: 'ऑफ़लाइन',
  offlineKitchenWorks: 'आप ऑफ़लाइन हैं — पर आपकी रसोई चल रही है',
  freshIdeaNeedsNet: 'आपके कुक से नया आइडिया',
  needsInternet: 'इंटरनेट चाहिए',
  backOnline: 'ऑनलाइन आते ही तुरंत एक तैयार कर दूँगी।',
  stillRightHere: 'अभी भी यहीं',
  mealHistoryTitle: 'मील हिस्ट्री',
  savedRecipes: 'सेव की हुई रेसिपी',
  localPrices: 'स्थानीय दाम सूची',
  cookLoved: 'कुछ जो पहले पसंद आया था बनाएँ',
  howWasIdea: 'यह आइडिया कैसा था?',
  oneTap: 'बस एक टैप — कल बेहतर सुझाने में मदद करता है।',
  yes: 'हाँ',
  almost: 'लगभग',
  no: 'नहीं',
  whatWouldMakeRight: 'क्या होता तो बिलकुल सही होता?',
  honestKindest: 'आपका सच्चा जवाब ही सबसे अच्छा है।',
  regulars: 'आपकी रसोई के नियमित',
  cookedLoved: 'बनाया और पसंद किया',
  makeAgain: 'इनमें से कोई भी फिर बनाएँ — तुरंत, न इंटरनेट, न AI।',
  earlierWeek: 'पहले',
  again: 'फिर',
  everyMealWiser: 'हर मील तृप्ति के अगले आइडिया को थोड़ा समझदार बनाता है।',
  emptyHistory: 'कुछ मील पकाते ही, आपके पसंदीदा यहाँ आ जाएँगे।',
  howShouldThink: 'तृप्ति कैसे सोचे?',
  startFreeTitle: 'मुफ़्त शुरू करें — न कार्ड, न अकाउंट।',
  easiestRecommended: 'सबसे आसान · सुझाया',
  tryFreeOnDevice: 'तृप्ति मुफ़्त आज़माएँ, अपने फ़ोन पर',
  tryFreeBody: 'न की, न साइन-अप। कुछ भी फ़ोन से बाहर नहीं जाता। ',
  tryFreeBodyEmphasis: 'थोड़ा धीमा, और आइडिया सरल — इसके बारे में ईमानदार हैं।',
  startFree: 'मुफ़्त शुरू करें →',
  orUseFreeKey: 'या अपनी मुफ़्त की इस्तेमाल करें · 2 मिनट',
  getAKey: 'की लें →',
  bringOwnKey: 'अपनी की लाएँ',
  sharedTestAccess: 'साझा टेस्ट एक्सेस',
  sharedTestDesc: 'सिर्फ़ भरोसेमंद टेस्टर · ऑपरेटर ने चालू किया है',
  whateverPick: 'जो भी चुनें, आपके घर की जानकारी इसी फ़ोन पर रहती है।',
  whyByoLink: 'अपनी ख़ुद की AI क्यों?',
  whyIntro: 'आपके परिवार की सेहत और बजट निजी हैं। तृप्ति उन्हें वैसा ही रखती है।',
  why1t: 'सब कुछ आपके फ़ोन पर',
  why2t: 'सिर्फ़ सवाल जाता है',
  why3t: 'हमारे कोई सर्वर नहीं',
  why4t: 'या कुछ भी न भेजें',
  pickHowThinks: 'चुनें तृप्ति कैसे सोचे',
  back: 'वापस',
};

const TABLE: Record<Lang, Strings> = { en, hinglish, regional };

export function t(lang: Lang): Strings {
  return TABLE[lang] ?? en;
}

export const LANG_LABELS: Record<Lang, { label: string; sub: string; chip: string; deva: string }> = {
  en: { label: 'English', sub: 'For everyday', chip: 'English', deva: 'A' },
  hinglish: { label: 'Hinglish', sub: 'Thodi English, thodi apni', chip: 'Hinglish', deva: 'अ' },
  regional: { label: 'हिंदी · Regional', sub: 'Aapki bhasha mein', chip: 'हिंदी', deva: 'अ' },
};
