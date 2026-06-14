import type { Lang } from '@/data/db';

// Self-contained copy for the sourcing/provisioning screens (keeps the main
// i18n file lean). Hinglish/Hindi override the visible headers + buttons;
// less-prominent lines fall back to English via spread.
export interface ProvStrings {
  sixMonthPlan: string;
  planSubtitle: string;
  thisMonthRoughly: string;
  spreadOver: string;
  tapSectionHint: string;
  item: string;
  items: string;
  // budget
  budgetThisMonth: string;
  planTotalLabel: string;
  monthlyTarget: string;
  whereItGoes: string;
  comfortablyUnder: string;
  aLittleOver: string;
  comfortablyUnderSub: string;
  aLittleOverSub: string;
  toSpare: (s: string) => string;
  over: (s: string) => string;
  // nav
  gentleReview: string;
  whereToBuy: string;
  // health
  aGentleLook: string;
  onDevicePrivately: string;
  fewKindAdjustments: string;
  doctorSetsNumbers: string;
  doctorSub: string;
  addToPlan: string;
  notNow: string;
  addedToPlan: string;
  takeWhatHelps: string;
  reviewThinking: string[];
  couldntRunReview: string;
  couldntRunSub: string;
  tryReviewAgain: string;
  planBudgetSafe: string;
  lastGoodReview: string;
  lastGoodSub: string;
  alreadyInPlan: string;
  reviewNeedsProvider: string;
  freshReviewSoon: string;
  runReview: string;
  // sourcing
  aroundYou: string;
  whereToBuyWhat: string;
  yourNeighbourhood: string;
  keepingItWell: string;
}

const en: ProvStrings = {
  sixMonthPlan: 'The six-month plan',
  planSubtitle: 'Stock the house for six months, calmly',
  thisMonthRoughly: 'This month, roughly',
  spreadOver: 'Spread over a six-month stock-up',
  tapSectionHint: 'Tap a section to open it · nudge any quantity',
  item: 'item',
  items: 'items',
  budgetThisMonth: 'This month',
  planTotalLabel: 'Plan total',
  monthlyTarget: 'Monthly target',
  whereItGoes: 'Where it goes',
  comfortablyUnder: 'You’re comfortably under',
  aLittleOver: 'A little over — easy to trim',
  comfortablyUnderSub: 'Your six-month stock-up sits well inside the monthly target. No need to cut anything.',
  aLittleOverSub: 'A small nudge to one or two bulk items brings it right back.',
  toSpare: (s) => `${s} to spare`,
  over: (s) => `${s} over`,
  gentleReview: 'A gentle review',
  whereToBuy: 'Where to buy',
  aGentleLook: 'A gentle look at your plan',
  onDevicePrivately: 'On-device · privately',
  fewKindAdjustments: 'A few kind adjustments',
  doctorSetsNumbers: 'Your doctor sets the numbers',
  doctorSub: 'Portions, targets, restrictions — those are theirs. Tripti just sources around them.',
  addToPlan: 'Add to plan',
  notNow: 'Not now',
  addedToPlan: 'Added to your plan',
  takeWhatHelps: 'Take what helps, leave the rest. Nothing changes without you.',
  reviewThinking: [
    'Reading your plan…',
    'Comparing with your household’s notes…',
    'Looking for gentle swaps…',
    'Keeping your doctor’s limits in mind…',
  ],
  couldntRunReview: 'I couldn’t run the review just now.',
  couldntRunSub: 'The connection or the key didn’t go through. Your plan and budget are untouched.',
  tryReviewAgain: 'Try the review again',
  planBudgetSafe: 'Your six-month plan and budget are all still here, fully editable.',
  lastGoodReview: 'Showing your last good review',
  lastGoodSub: 'I hit a snag making a fresh one — these are the swaps you’d already settled on.',
  alreadyInPlan: 'Already in your plan',
  reviewNeedsProvider: 'Needs a provider',
  freshReviewSoon: 'I’ll have a fresh review ready in a moment.',
  runReview: 'Run a gentle review',
  aroundYou: 'Around you',
  whereToBuyWhat: 'Where to buy what',
  yourNeighbourhood: 'your neighbourhood',
  keepingItWell: 'Keeping it well · monsoon-aware',
};

const hinglish: ProvStrings = {
  ...en,
  sixMonthPlan: 'Chhe-maheene ka plan',
  planSubtitle: 'Ghar ka saaman chhe maheene ke liye, aaram se',
  thisMonthRoughly: 'Is mahine, mota-mota',
  spreadOver: 'Chhe-maheene ke stock-up mein faila hua',
  tapSectionHint: 'Section kholne ke liye tap karein · quantity nudge karein',
  budgetThisMonth: 'Is mahine',
  planTotalLabel: 'Plan total',
  monthlyTarget: 'Mahine ka target',
  whereItGoes: 'Paisa kahan jaata hai',
  comfortablyUnder: 'Aap aaram se under ho',
  aLittleOver: 'Thoda zyada — aasaani se kam ho jaayega',
  gentleReview: 'Ek halka review',
  whereToBuy: 'Kahan se kharidein',
  aGentleLook: 'Aapke plan par ek halki nazar',
  fewKindAdjustments: 'Kuch pyaari adjustments',
  doctorSetsNumbers: 'Numbers aapke doctor tay karte hain',
  addToPlan: 'Plan mein daalein',
  notNow: 'Abhi nahi',
  addedToPlan: 'Plan mein daal diya',
  couldntRunReview: 'Abhi review nahi chala paayi.',
  tryReviewAgain: 'Review phir se try karein',
  lastGoodReview: 'Aapka pichla accha review dikha rahi hoon',
  alreadyInPlan: 'Pehle se plan mein',
  reviewNeedsProvider: 'Provider chahiye',
  runReview: 'Ek halka review chalayein',
  whereToBuyWhat: 'Kya kahan se kharidein',
  keepingItWell: 'Achhe se rakhna · monsoon-aware',
};

const regional: ProvStrings = {
  ...en,
  sixMonthPlan: 'छह-महीने की योजना',
  planSubtitle: 'घर का सामान छह महीने के लिए, आराम से',
  thisMonthRoughly: 'इस महीने, मोटे तौर पर',
  spreadOver: 'छह-महीने के स्टॉक-अप में फैला हुआ',
  tapSectionHint: 'सेक्शन खोलने के लिए टैप करें · मात्रा बदलें',
  budgetThisMonth: 'इस महीने',
  planTotalLabel: 'योजना कुल',
  monthlyTarget: 'महीने का लक्ष्य',
  whereItGoes: 'पैसा कहाँ जाता है',
  comfortablyUnder: 'आप आराम से सीमा में हैं',
  aLittleOver: 'थोड़ा ज़्यादा — आसानी से कम होगा',
  gentleReview: 'एक हल्की समीक्षा',
  whereToBuy: 'कहाँ से ख़रीदें',
  aGentleLook: 'आपकी योजना पर एक हल्की नज़र',
  fewKindAdjustments: 'कुछ नरम बदलाव',
  doctorSetsNumbers: 'नंबर आपके डॉक्टर तय करते हैं',
  addToPlan: 'योजना में जोड़ें',
  notNow: 'अभी नहीं',
  addedToPlan: 'योजना में जोड़ा',
  couldntRunReview: 'अभी समीक्षा नहीं चला पाई।',
  tryReviewAgain: 'समीक्षा फिर आज़माएँ',
  lastGoodReview: 'आपकी पिछली अच्छी समीक्षा दिखा रही हूँ',
  alreadyInPlan: 'पहले से योजना में',
  reviewNeedsProvider: 'प्रोवाइडर चाहिए',
  runReview: 'एक हल्की समीक्षा चलाएँ',
  whereToBuyWhat: 'क्या कहाँ से ख़रीदें',
  keepingItWell: 'अच्छे से रखना · मानसून के अनुसार',
};

const TABLE: Record<Lang, ProvStrings> = { en, hinglish, regional };
export function pi(lang: Lang): ProvStrings {
  return TABLE[lang] ?? en;
}
