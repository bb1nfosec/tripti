'use client';

import { useCallback, useEffect, useRef, useState } from 'react';
import type { Lang, MealRecord } from '@/data/db';
import { color } from '@/lib/tokens';
import {
  getSettings,
  setLang as persistLang,
  getHousehold,
  getProviderConfig,
  cookAgain,
  getComfortFavourite,
  ensurePriceSeed,
  ensurePlanSeed,
} from '@/data/repo';
import { makeProvider, ProviderError } from '@/providers';
import { getSuggestion } from '@/llm/suggest';
import { ParseError } from '@/llm/parse';
import type { Suggestion } from '@/llm/schema';
import type { DailyContext } from '@/prompt/builder';
import { useOnline } from '@/lib/useOnline';

import EntryScreen from '@/screens/EntryScreen';
import ProviderScreen from '@/screens/ProviderScreen';
import OnboardingScreen from '@/screens/OnboardingScreen';
import DailyScreen from '@/screens/DailyScreen';
import HeroScreen, { type HeroView } from '@/screens/HeroScreen';
import FeedbackScreen from '@/screens/FeedbackScreen';
import HistoryScreen from '@/screens/HistoryScreen';
import WhyScreen from '@/screens/WhyScreen';
import ProvisioningScreen from '@/screens/ProvisioningScreen';
import HealthScreen from '@/screens/HealthScreen';
import SourcingScreen from '@/screens/SourcingScreen';
import { TriptiMark } from '@/components/Logo';

type ScreenName =
  | 'loading'
  | 'entry'
  | 'provider'
  | 'why'
  | 'onboarding'
  | 'daily'
  | 'hero'
  | 'feedback'
  | 'history'
  | 'provisioning'
  | 'health'
  | 'sourcing';

export default function App() {
  const [screen, setScreen] = useState<ScreenName>('loading');
  const [lang, setLangState] = useState<Lang>('hinglish');
  const [heroView, setHeroView] = useState<HeroView>('thinking');
  const [suggestion, setSuggestion] = useState<Suggestion | null>(null);
  const [fallbackMeal, setFallbackMeal] = useState<MealRecord | null>(null);
  const [downloadProgress, setDownloadProgress] = useState<number | undefined>(undefined);
  const online = useOnline();

  const lastCtx = useRef<DailyContext | null>(null);
  const abortRef = useRef<AbortController | null>(null);

  // Bootstrap from Dexie: decide where this device lands.
  useEffect(() => {
    (async () => {
      await ensurePriceSeed().catch(() => {});
      await ensurePlanSeed().catch(() => {});
      const settings = await getSettings();
      setLangState(settings.lang);
      if (!settings.providerConfigured) setScreen('entry');
      else if (!settings.onboarded) setScreen('onboarding');
      else setScreen('daily');
    })();
  }, []);

  const changeLang = useCallback((l: Lang) => {
    setLangState(l);
    void persistLang(l);
  }, []);

  const runSuggestion = useCallback(
    async (ctx: DailyContext) => {
      lastCtx.current = ctx;
      setSuggestion(null);
      setDownloadProgress(undefined);

      if (!navigator.onLine) {
        setHeroView('offline');
        setScreen('hero');
        return;
      }

      const cfg = await getProviderConfig();
      if (!cfg) {
        setScreen('provider');
        return;
      }

      // Calm one-time download screen for the on-device cook; thinking otherwise.
      setHeroView(cfg.type === 'ondevice' ? 'downloading' : 'thinking');
      setScreen('hero');

      abortRef.current?.abort();
      const ac = new AbortController();
      abortRef.current = ac;

      try {
        const provider = makeProvider(cfg);
        const household = await getHousehold();
        const result = await getSuggestion({
          provider,
          household,
          context: ctx,
          lang,
          signal: ac.signal,
          onDownloadProgress: (f) => {
            setDownloadProgress(f);
            if (f >= 1) setHeroView('thinking'); // download done → now generating
          },
        });
        if (ac.signal.aborted) return;
        setSuggestion(result);
        setHeroView('ready');
      } catch (err) {
        if (ac.signal.aborted) return;
        if (err instanceof ParseError) {
          // Parse fallback → a real, already-loved meal (or one clarifying Q).
          const fav = await getComfortFavourite();
          setFallbackMeal(fav ?? null);
          setHeroView('fallback');
        } else if (err instanceof ProviderError) {
          setHeroView('failed');
        } else {
          setHeroView('failed');
        }
      }
    },
    [lang]
  );

  // ---- render ----
  if (screen === 'loading') {
    return (
      <div style={{ width: '100%', maxWidth: 480, minHeight: '100dvh', display: 'flex', alignItems: 'center', justifyContent: 'center', background: color.screen }}>
        <div className="tripti-fade" style={{ opacity: 0.6 }}>
          <TriptiMark size={56} />
        </div>
      </div>
    );
  }

  if (screen === 'entry') {
    return <EntryScreen lang={lang} onLang={changeLang} onBegin={() => setScreen('provider')} />;
  }

  if (screen === 'provider') {
    return (
      <ProviderScreen
        lang={lang}
        onWhy={() => setScreen('why')}
        onDone={async () => {
          const settings = await getSettings();
          setScreen(settings.onboarded ? 'daily' : 'onboarding');
        }}
      />
    );
  }

  if (screen === 'why') {
    return <WhyScreen lang={lang} onBack={() => setScreen('provider')} />;
  }

  if (screen === 'onboarding') {
    return <OnboardingScreen lang={lang} onDone={() => setScreen('daily')} />;
  }

  if (screen === 'daily') {
    return (
      <DailyScreen
        lang={lang}
        onLang={changeLang}
        today={formatToday()}
        onHistory={() => setScreen('history')}
        onProvisioning={() => setScreen('provisioning')}
        onSuggest={(ctx) => void runSuggestion(ctx)}
      />
    );
  }

  if (screen === 'hero') {
    return (
      <HeroScreen
        lang={lang}
        onLang={changeLang}
        view={online ? heroView : heroView === 'ready' || heroView === 'fallback' ? heroView : 'offline'}
        suggestion={suggestion}
        fallbackMeal={fallbackMeal}
        downloadProgress={downloadProgress}
        onBack={() => setScreen('daily')}
        onAnother={() => lastCtx.current && void runSuggestion(lastCtx.current)}
        onRetry={() => lastCtx.current && void runSuggestion(lastCtx.current)}
        onAccept={() => setScreen('feedback')}
        onCheckKey={() => setScreen('provider')}
        onUseOnDevice={() => setScreen('provider')}
        onClarify={(answer) =>
          lastCtx.current &&
          void runSuggestion({ ...lastCtx.current, constraints: [...lastCtx.current.constraints, answer] })
        }
        onCookFallback={async () => {
          if (fallbackMeal?.id != null) await cookAgain(fallbackMeal.id);
          setScreen('daily');
        }}
        onGoHistory={() => setScreen('history')}
      />
    );
  }

  if (screen === 'feedback' && suggestion) {
    return <FeedbackScreen lang={lang} suggestion={suggestion} onDone={() => setScreen('history')} />;
  }

  if (screen === 'history') {
    return (
      <HistoryScreen
        lang={lang}
        onLang={changeLang}
        onBack={() => setScreen('daily')}
        onCookAgain={async (meal) => {
          if (meal.id != null) await cookAgain(meal.id);
          setSuggestion(meal.suggestion); // reload from Dexie — zero AI
          setHeroView('ready');
          setScreen('hero');
        }}
      />
    );
  }

  if (screen === 'provisioning') {
    return (
      <ProvisioningScreen
        lang={lang}
        onLang={changeLang}
        onBack={() => setScreen('daily')}
        onReview={() => setScreen('health')}
        onSourcing={() => setScreen('sourcing')}
      />
    );
  }

  if (screen === 'health') {
    return (
      <HealthScreen
        lang={lang}
        onLang={changeLang}
        onBack={() => setScreen('provisioning')}
        onCheckKey={() => setScreen('provider')}
      />
    );
  }

  if (screen === 'sourcing') {
    return <SourcingScreen lang={lang} onLang={changeLang} onBack={() => setScreen('provisioning')} />;
  }

  // Fallback (e.g. feedback with no suggestion) → home.
  setScreen('daily');
  return null;
}

function formatToday(): string {
  return new Date().toLocaleDateString('en-IN', { weekday: 'short', day: 'numeric', month: 'short' });
}
