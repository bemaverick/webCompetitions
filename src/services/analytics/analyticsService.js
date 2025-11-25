// AnalyticsService.js
import { initializeApp, getApps } from "firebase/app";
import {
  getAnalytics,
  logEvent,
  setUserId,
  setUserProperties,
  isSupported,
} from "firebase/analytics";
import { firebaseApp } from "../../firebase";
import { APP_VERSION } from "../../constants/config";


const eventPrefix = 'ARM_GRID_'
// 🧩 Хелпер-декоратор: додає базові властивості до події
function withBaseProps(fn) {
  return function (eventName, params = {}) {
    const baseProps = {
      app_version: APP_VERSION|| "dev",
      platform: detectPlatform(),
      locale: navigator.language || "en",
      is_offline: !navigator.onLine,
      timestamp: new Date().toISOString(),
    };

    const mergedParams = { ...baseProps, ...params };
    fn.call(this, eventName, mergedParams);
  };
}

// 🧠 Детектор платформи
function detectPlatform() {
  if (typeof window === "undefined") return "server";
  const ua = navigator.userAgent.toLowerCase();
  if (ua.includes("android")) return "android";
  if (ua.includes("iphone") || ua.includes("ipad")) return "ios";
  return "web";
}

class AnalyticsService {
  static instance = null;
  analytics = null;
  isReady = false;
  debug = import.meta.env.DEV;

  constructor() {
    if (AnalyticsService.instance) return AnalyticsService.instance;
    this.init();
    AnalyticsService.instance = this;
  }

  static getInstance() {
    if (!AnalyticsService.instance) {
      AnalyticsService.instance = new AnalyticsService();
    }
    return AnalyticsService.instance;
  }

  async init() {
    try {
      if (!getApps().length) {
        initializeApp(firebaseApp);
      }

      const supported = await isSupported();
      if (supported) {
        this.analytics = getAnalytics();
        this.isReady = true;
        if (this.debug) console.log("[Analytics] Initialized");
      } else {
        if (this.debug)
          console.warn("[Analytics] Not supported in this environment");
      }
    } catch (e) {
      console.error("[Analytics] Init failed:", e);
    }
  }

  setUser(id) {
    if (!this.isReady || !this.analytics) return;
    setUserId(this.analytics, id || undefined);
    if (this.debug) console.log("[Analytics] setUser:", id);
  }

  setUserProps(props) {
    if (!this.isReady || !this.analytics) return;
    setUserProperties(this.analytics, props);
    if (this.debug) console.log("[Analytics] setUserProps:", props);
  }

  // 🔹 Основний метод логування (обгорнутий декоратором)
  logEvent = withBaseProps(function (eventName, params = {}) {
    if (!this.isReady || !this.analytics) {
      if (this.debug)
        console.warn("[Analytics] Skipped event (not ready):", eventName, params);
      return;
    }

    try {
      if (this.debug) {
        console.log(`[Analytics] ${eventName}:`, params);
      } else {
        logEvent(this.analytics, `${eventPrefix}${eventName}`, params);
      }
    } catch (err) {
      console.error("[Analytics] Failed to log event", eventName, err);
    }
  });

  // 🎯 Специфічні події
  trackTournamentCreated(tournamentId, tablesCount, hasWeightClasses) {
    this.logEvent("tournament_created", {
      tournament_id: tournamentId,
      tables_count: tablesCount,
      has_weight_classes: hasWeightClasses,
    });
  }

  trackMatchResult(matchId, categoryId, winnerId, method, timeMs) {
    this.logEvent("match_result_recorded", {
      match_id: matchId,
      category_id: categoryId,
      winner_id: winnerId,
      method,
      time_ms: timeMs,
    });
  }

  trackResultsExported(format, scope) {
    this.logEvent("results_exported", { format, scope });
  }
}

export const analytics = AnalyticsService.getInstance();
