import React, { useState, useEffect, useCallback, useMemo, useRef } from 'react';
import {
  ArrowLeft,
  Monitor,
  Shield,
  ChevronDown,
  ChevronLeft,
  ChevronRight,
  SkipForward,
  SkipBack,
  Layers,
  Film,
  X,
  ExternalLink,
  Clock as ClockIcon,
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { videoSources } from '../utils/videoSources';
import { CONTENT_TYPES } from '../utils/constants';

const VideoPlayerModal = ({
  content,
  isOpen,
  onClose,
  contentType,
  fetchEpisodes, // optional async function
}) => {
  const isTV = contentType === CONTENT_TYPES.TV || contentType === CONTENT_TYPES.ANIME;
  const title = content?.title || content?.name;

  // Primary state
  const [selectedSource, setSelectedSource] = useState(videoSources.find((s) => s.featured) || videoSources[0]);
  const [selectedSeason, setSelectedSeason] = useState(1);
  const [selectedEpisode, setSelectedEpisode] = useState(1);
  const [seasons, setSeasons] = useState([]);
  const [episodesBySeason, setEpisodesBySeason] = useState({});

  // Source/loading state
  const [loadingSource, setLoadingSource] = useState(false);
  const [sourceError, setSourceError] = useState(false);
  const [retryCount, setRetryCount] = useState(0);
  const [workingSources, setWorkingSources] = useState(new Set());
  const [failedSources, setFailedSources] = useState(new Set());
  const [autoFallback, setAutoFallback] = useState(true);
  const [adBlockMode, setAdBlockMode] = useState(true);
  const [bypassAttempts, setBypassAttempts] = useState(0);

  // Auto next-episode
  const [autoNextEnabled, setAutoNextEnabled] = useState(true);
  const [showNextOverlay, setShowNextOverlay] = useState(false);
  const [nextCountdown, setNextCountdown] = useState(10);
  const countdownRef = useRef(null);
  const preCountdownTimerRef = useRef(null);

  // Local UI state
  const [seasonPickerOpen, setSeasonPickerOpen] = useState(false);
  const [episodePickerOpen, setEpisodePickerOpen] = useState(false);

  // Refs
  const modalRef = useRef(null);

  // Categorize sources
  const { premiumSources, adFreeSources, trustedSources, backupSources } = useMemo(() => {
    const premium = videoSources.filter((s) => s.premium || s.vip);
    const adfree = videoSources.filter((s) => s.adFree || s.clean || (s.key || '').includes('pstream'));
    const trusted = videoSources.filter((s) => s.trusted || s.featured);
    const backup = videoSources.filter((s) => !s.premium && !s.adFree && !s.trusted && !s.featured);
    return { premiumSources: premium, adFreeSources: adfree, trustedSources: trusted, backupSources: backup };
  }, []);

  // Sandbox policy
  const getSandboxPolicy = useCallback((source) => {
    if (!source) return '';
    if (source.key?.includes('vidlink')) return undefined; // explicitly no sandbox per your original code

    if (source.premium || source.vip) {
      return 'allow-scripts allow-same-origin allow-popups allow-forms allow-presentation allow-top-navigation-by-user-activation allow-orientation-lock allow-pointer-lock';
    }
    if (source.adFree || source.clean || source.featured || source.trusted) {
      return 'allow-scripts allow-same-origin allow-popups allow-forms allow-presentation';
    }
    return 'allow-scripts allow-same-origin';
  }, []);

  // Compute stream URL (used for iframe)
  const getStreamUrl = useCallback(() => {
    if (!content?.id || !selectedSource) return '';

    let baseUrl;
    if (isTV) {
      if (typeof selectedSource.getTVUrl !== 'function') return '';
      baseUrl = selectedSource.getTVUrl(content.id, selectedSeason, selectedEpisode);
    } else {
      if (typeof selectedSource.getMovieUrl !== 'function') return '';
      baseUrl = selectedSource.getMovieUrl(content.id);
    }
    if (!baseUrl) return '';

    if (adBlockMode) {
      const separator = baseUrl.includes('?') ? '&' : '?';
      const antiAdParams = [
        'autoplay=true',
        'muted=false',
        'controls=1',
        'modestbranding=1',
        'rel=0',
        'showinfo=0',
        'iv_load_policy=3',
        'fs=1',
        'cc_load_policy=0',
        'disablekb=0',
        'enablejsapi=1',
        `origin=${typeof window !== 'undefined' ? window.location.origin : ''}`,
        'playsinline=1',
        'ads=0',
        'ad=0',
        'adblock=1',
        'no_ads=true',
        'skip_ads=true',
      ];
      return baseUrl + separator + antiAdParams.join('&');
    }

    return baseUrl;
  }, [content, selectedSource, selectedSeason, selectedEpisode, isTV, adBlockMode]);

  // Plain base URL for "Open in new tab"
  const getBaseOpenUrl = useCallback(() => {
    if (!content?.id || !selectedSource) return '';
    if (isTV) {
      if (typeof selectedSource.getTVUrl !== 'function') return '';
      return selectedSource.getTVUrl(content.id, selectedSeason, selectedEpisode);
    }
    if (typeof selectedSource.getMovieUrl !== 'function') return '';
    return selectedSource.getMovieUrl(content.id);
  }, [content, selectedSource, selectedSeason, selectedEpisode, isTV]);

  // Normalize open-in-new-tab URL for PStream
  const getOpenInNewTabUrl = useCallback(() => {
    const base = getBaseOpenUrl();
    if (!base) return '';
    try {
      const u = new URL(base);
      const isPStream =
        u.hostname.endsWith('pstream.mov') || u.hostname.endsWith('iframe.pstream.mov');
      if (isPStream) {
        if (u.hostname === 'iframe.pstream.mov') u.hostname = 'pstream.mov';
        if (u.pathname.startsWith('/embed/')) {
          u.pathname = u.pathname.replace('/embed/', '/media/');
        }
        return u.toString();
      }
    } catch {}
    return base;
  }, [getBaseOpenUrl]);

  // Select optimal source (single)
  const selectOptimalSource = useCallback(() => {
    const byPriority = [
      ...premiumSources.filter((s) => workingSources.has(s.key) && !failedSources.has(s.key)),
      ...adFreeSources.filter((s) => !failedSources.has(s.key)),
      ...trustedSources.filter((s) => workingSources.has(s.key) && !failedSources.has(s.key)),
      ...videoSources.filter((s) => !failedSources.has(s.key)),
    ];
    const unique = [];
    const seen = new Set();
    for (const s of byPriority) {
      if (s?.key && !seen.has(s.key)) {
        seen.add(s.key);
        unique.push(s);
      }
    }
    const alt = unique.find((s) => s.key !== selectedSource?.key);
    return alt || unique[0] || selectedSource || videoSources[0];
  }, [premiumSources, adFreeSources, trustedSources, workingSources, failedSources, selectedSource]);

  // Attempt ad bypass by switching to next best source
  const attemptAdBypass = useCallback(async () => {
    if (bypassAttempts >= 3) return false;
    setBypassAttempts((prev) => prev + 1);

    const nextSource = selectOptimalSource();
    if (nextSource && nextSource.key !== selectedSource?.key) {
      handleSourceChange(nextSource.key, true);
      return true;
    }
    return false;
  }, [bypassAttempts, selectOptimalSource, selectedSource]);

  const handleSourceChange = useCallback((newSourceKey, isAutoFallback = false) => {
    if (newSourceKey === '__open_in_new_tab') {
      const openUrl = getOpenInNewTabUrl();
      if (openUrl) window.open(openUrl, '_blank', 'noopener,noreferrer');
      return;
    }

    const newSource = videoSources.find((s) => s.key === newSourceKey);
    if (!newSource) return;

    setLoadingSource(true);
    setSourceError(false);

    if (!isAutoFallback) {
      setRetryCount(0);
      setBypassAttempts(0);
    }

    setSelectedSource(newSource);
  }, [getOpenInNewTabUrl]);

  // Iframe handlers
  const handleIframeLoad = useCallback(() => {
    setLoadingSource(false);
    setSourceError(false);
    if (selectedSource?.key) {
      setWorkingSources((prev) => new Set([...prev, selectedSource.key]));
    }
  }, [selectedSource]);

  const handleIframeError = useCallback(async () => {
    setLoadingSource(false);
    setSourceError(true);
    if (selectedSource?.key) {
      setFailedSources((prev) => new Set([...prev, selectedSource.key]));
    }

    if (autoFallback && retryCount < 5) {
      setTimeout(async () => {
        const bypassSuccess = await attemptAdBypass();
        if (!bypassSuccess) {
          const nextSource = selectOptimalSource();
          if (nextSource && nextSource.key !== selectedSource?.key) {
            handleSourceChange(nextSource.key, true);
            setRetryCount((prev) => prev + 1);
          }
        }
      }, 800);
    }
  }, [autoFallback, retryCount, attemptAdBypass, selectOptimalSource, selectedSource, handleSourceChange]);

  // Detect suspicious redirects
  useEffect(() => {
    if (!isOpen || !selectedSource) return;

    const iframe = document.querySelector('#secure-stream-iframe');
    if (!iframe) return;

    const checkForAds = () => {
      try {
        const currentSrc = iframe.src;
        const expectedSrc = getStreamUrl();
        if (currentSrc !== expectedSrc && !loadingSource) {
          attemptAdBypass();
        }
      } catch {}
    };

    const interval = setInterval(checkForAds, 5000);
    return () => clearInterval(interval);
  }, [isOpen, selectedSource, getStreamUrl, loadingSource, attemptAdBypass]);

  // Initialize seasons for TV
  useEffect(() => {
    if (!isOpen || !isTV || !content) return;

    const rawSeasons = Array.isArray(content?.seasons) ? content.seasons : [];
    const filtered = rawSeasons.filter((s) => typeof s.season_number === 'number' && s.season_number > 0);

    if (filtered.length > 0) {
      setSeasons(
        filtered
          .map((s) => ({
            season_number: s.season_number,
            episode_count: s.episode_count,
            name: s.name,
          }))
          .sort((a, b) => a.season_number - b.season_number)
      );

      const last = content?.last_episode_to_air;
      if (last?.season_number && last?.episode_number) {
        setSelectedSeason(last.season_number);
        setSelectedEpisode(last.episode_number);
      } else {
        setSelectedSeason(filtered[0].season_number || 1);
        setSelectedEpisode(1);
      }
    } else {
      const fallbackSeasons = Array.from({ length: 3 }, (_, i) => ({
        season_number: i + 1,
        episode_count: 10,
        name: `Season ${i + 1}`,
      }));
      setSeasons(fallbackSeasons);
      setSelectedSeason(1);
      setSelectedEpisode(1);
    }
  }, [isOpen, isTV, content]);

  // Load episodes when season changes
  useEffect(() => {
    if (!isOpen || !isTV || !content?.id || !selectedSeason) return;

    let mounted = true;

    const load = async () => {
      if (episodesBySeason[selectedSeason]?.length) return;
      try {
        let episodes = [];

        if (typeof fetchEpisodes === 'function') {
          episodes = await fetchEpisodes(content.id, selectedSeason);
        }

        if (!Array.isArray(episodes) || episodes.length === 0) {
          const seasonMeta =
            seasons.find((s) => s.season_number === selectedSeason) ||
            { episode_count: 20 };
          const count = Math.max(1, seasonMeta.episode_count || 20);
          episodes = Array.from({ length: count }, (_, i) => ({
            episode_number: i + 1,
          }));
        }

        if (mounted) {
          setEpisodesBySeason((prev) => ({
            ...prev,
            [selectedSeason]: episodes,
          }));

          const maxEp = episodes[episodes.length - 1]?.episode_number || 1;
          if (selectedEpisode > maxEp) {
            setSelectedEpisode(maxEp);
          }
        }
      } catch {
        if (mounted) {
          const fallback = Array.from({ length: 20 }, (_, i) => ({
            episode_number: i + 1,
          }));
          setEpisodesBySeason((prev) => ({
            ...prev,
            [selectedSeason]: fallback,
          }));
          if (selectedEpisode > 20) setSelectedEpisode(20);
        }
      }
    };

    load();
    return () => {
      mounted = false;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isOpen, isTV, content?.id, selectedSeason, fetchEpisodes, seasons, selectedEpisode]);

  // Close pickers on outside click
  useEffect(() => {
    const handler = (e) => {
      if (!modalRef.current) return;
      if (!modalRef.current.contains(e.target)) {
        setSeasonPickerOpen(false);
        setEpisodePickerOpen(false);
      }
    };
    document.addEventListener('mousedown', handler, true);
    return () => document.removeEventListener('mousedown', handler, true);
  }, []);

  // Keyboard shortcuts for TV
  useEffect(() => {
    if (!isOpen || !isTV) return;
    const onKeyDown = (e) => {
      if (e.altKey || e.metaKey || e.ctrlKey || e.shiftKey) return;
      if (['INPUT', 'TEXTAREA', 'SELECT'].includes(document.activeElement?.tagName)) return;
      if (e.key === 'ArrowRight') { e.preventDefault(); goToNextEpisode(); }
      else if (e.key === 'ArrowLeft') { e.preventDefault(); goToPrevEpisode(); }
      else if (e.key === 'ArrowUp') { e.preventDefault(); goToPrevSeason(); }
      else if (e.key === 'ArrowDown') { e.preventDefault(); goToNextSeason(); }
    };
    document.addEventListener('keydown', onKeyDown);
    return () => document.removeEventListener('keydown', onKeyDown);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isOpen, isTV, selectedSeason, selectedEpisode, episodesBySeason, seasons]);

  // Navigation helpers
  const getEpisodesForCurrentSeason = useCallback(() => episodesBySeason[selectedSeason] || [], [episodesBySeason, selectedSeason]);

  const goToEpisode = useCallback(
    (ep) => {
      const eps = getEpisodesForCurrentSeason();
      if (!eps.length) return;
      const maxEp = eps[eps.length - 1]?.episode_number || 1;
      const next = Math.min(Math.max(1, ep), maxEp);
      setSelectedEpisode(next);
      setLoadingSource(true);
      setSourceError(false);
      resetAutoNextTimers(); // reset on change
      scheduleAutoNext(); // schedule for new episode
    },
    [getEpisodesForCurrentSeason] // eslint-disable-line
  );

  const goToNextEpisode = useCallback(() => {
    const eps = getEpisodesForCurrentSeason();
    if (!eps.length) return;
    const maxEp = eps[eps.length - 1]?.episode_number || 1;

    if (selectedEpisode < maxEp) {
      goToEpisode(selectedEpisode + 1);
      return;
    }
    const currentSeasonIndex = seasons.findIndex((s) => s.season_number === selectedSeason);
    const nextSeason = seasons[currentSeasonIndex + 1];
    if (nextSeason) {
      setSelectedSeason(nextSeason.season_number);
      setSelectedEpisode(1);
      setLoadingSource(true);
      setSourceError(false);
      resetAutoNextTimers();
      scheduleAutoNext();
    }
  }, [getEpisodesForCurrentSeason, selectedEpisode, seasons, selectedSeason, goToEpisode]); // eslint-disable-line

  const goToPrevEpisode = useCallback(() => {
    if (selectedEpisode > 1) {
      goToEpisode(selectedEpisode - 1);
      return;
    }
    const currentSeasonIndex = seasons.findIndex((s) => s.season_number === selectedSeason);
    const prevSeason = seasons[currentSeasonIndex - 1];
    if (prevSeason) {
      setSelectedSeason(prevSeason.season_number);
      const prevSeasonEpisodes = episodesBySeason[prevSeason.season_number] || [];
      const lastEp =
        prevSeasonEpisodes[prevSeasonEpisodes.length - 1]?.episode_number ||
        prevSeason.episode_count ||
        20;
      setSelectedEpisode(lastEp);
      setLoadingSource(true);
      setSourceError(false);
      resetAutoNextTimers();
      scheduleAutoNext();
    }
  }, [selectedEpisode, goToEpisode, seasons, selectedSeason, episodesBySeason]); // eslint-disable-line

  const goToSeason = useCallback(
    (seasonNumber, keepEpisode = false) => {
      const target = seasons.find((s) => s.season_number === seasonNumber);
      if (!target) return;
      setSelectedSeason(seasonNumber);
      setSeasonPickerOpen(false);

      if (!keepEpisode) {
        setSelectedEpisode(1);
      } else {
        const eps = episodesBySeason[seasonNumber] || [];
        if (eps.length) {
          const maxEp = eps[eps.length - 1]?.episode_number || 1;
          if (selectedEpisode > maxEp) setSelectedEpisode(maxEp);
        }
      }
      setLoadingSource(true);
      setSourceError(false);
      resetAutoNextTimers();
      scheduleAutoNext();
    },
    [seasons, episodesBySeason, selectedEpisode] // eslint-disable-line
  );

  const goToNextSeason = useCallback(() => {
    const idx = seasons.findIndex((s) => s.season_number === selectedSeason);
    const next = seasons[idx + 1];
    if (next) {
      goToSeason(next.season_number, false);
    }
  }, [seasons, selectedSeason, goToSeason]); // eslint-disable-line

  const goToPrevSeason = useCallback(() => {
    const idx = seasons.findIndex((s) => s.season_number === selectedSeason);
    const prev = seasons[idx - 1];
    if (prev) {
      goToSeason(prev.season_number, false);
    }
  }, [seasons, selectedSeason, goToSeason]); // eslint-disable-line

  // Helpers
  const getSourcePriorityIcon = (source) => {
    if (source?.premium || source?.vip) return '👑';
    if (source?.adFree || source?.clean) return '🛡️';
    if (source?.trusted || source?.featured) return '⭐';
    return '📺';
  };
  const getSourceStatus = (sourceKey) => {
    if (workingSources.has(sourceKey)) return 'working';
    if (failedSources.has(sourceKey)) return 'failed';
    return 'unknown';
  };

  // Auto-next: estimate episode duration and schedule pre-countdown
  const estimateEpisodeDurationSec = useMemo(() => {
    if (!isTV) return 0;
    // TMDB TV metadata: episode_run_time is array of minutes
    const runtimes = Array.isArray(content?.episode_run_time) ? content.episode_run_time : [];
    const min = (runtimes[0] || 24) * 60; // default 24min
    return Math.max(8 * 60, min); // at least 8min safety
  }, [isTV, content]);

  const resetAutoNextTimers = useCallback(() => {
    setShowNextOverlay(false);
    setNextCountdown(10);
    if (preCountdownTimerRef.current) {
      clearTimeout(preCountdownTimerRef.current);
      preCountdownTimerRef.current = null;
    }
    if (countdownRef.current) {
      clearInterval(countdownRef.current);
      countdownRef.current = null;
    }
  }, []);

  const scheduleAutoNext = useCallback(() => {
    if (!isTV || !autoNextEnabled) return;
    resetAutoNextTimers();

    // Show the countdown 10s before target end. If runtime is small, show at 90s.
    const showAtMs = Math.max((estimateEpisodeDurationSec - 10) * 1000, 90 * 1000);
    preCountdownTimerRef.current = setTimeout(() => {
      setShowNextOverlay(true);
      setNextCountdown(10);
      countdownRef.current = setInterval(() => {
        setNextCountdown((c) => {
          if (c <= 1) {
            clearInterval(countdownRef.current);
            countdownRef.current = null;
            // Auto-advance
            goToNextEpisode();
            return 0;
          }
          return c - 1;
        });
      }, 1000);
    }, showAtMs);
  }, [isTV, autoNextEnabled, estimateEpisodeDurationSec, goToNextEpisode, resetAutoNextTimers]);

  // Start/stop scheduling when episode/season/content changes or modal toggles
  useEffect(() => {
    if (isOpen && isTV) {
      scheduleAutoNext();
    }
    return () => resetAutoNextTimers();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isOpen, isTV, selectedSeason, selectedEpisode, autoNextEnabled, content?.id]);

  if (!isOpen || !content) return null;

  const streamUrl = getStreamUrl();
  const sandboxPolicy = getSandboxPolicy(selectedSource);
  const currentSeasonMeta = seasons.find((s) => s.season_number === selectedSeason);
  const currentEpisodes = getEpisodesForCurrentSeason();
  const openInNewTabUrl = getOpenInNewTabUrl();

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
        className="fixed inset-0 bg-black/95 backdrop-blur-xl flex items-center justify-center z-[100]"
      >
        <motion.div
          ref={modalRef}
          initial={{ scale: 0.98, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} exit={{ scale: 0.98, opacity: 0 }}
          className="bg-black/90 backdrop-blur-3xl rounded-3xl w-full h-full max-w-7xl max-h-[95vh] overflow-hidden border border-white/10 flex flex-col shadow-2xl"
        >
          {/* Header */}
          <div className="flex items-center justify-between p-4 md:p-6 border-b border-white/10">
            <div className="flex items-center gap-3">
              <button onClick={onClose}
                className="p-2.5 bg-white/10 backdrop-blur-xl rounded-2xl border border-white/20 text-white hover:bg-white/20 transition-all">
                <ArrowLeft size={18} />
              </button>
              <div>
                <h2 className="text-lg md:text-xl font-bold text-white">{title}</h2>
                <div className="flex items-center gap-2 text-xs md:text-sm">
                  <span className="text-white/60">
                    {isTV ? `S${selectedSeason} · E${selectedEpisode}` : 'Movie'} • {selectedSource?.name}
                  </span>
                  {selectedSource?.premium && (
                    <span className="bg-gradient-to-r from-yellow-500 to-amber-500 text-black px-2 py-0.5 rounded-full text-[10px] font-bold">PREMIUM</span>
                  )}
                  {selectedSource?.adFree && (
                    <span className="bg-gradient-to-r from-green-500 to-emerald-500 text-white px-2 py-0.5 rounded-full text-[10px] font-bold">AD-FREE</span>
                  )}
                  {adBlockMode && (
                    <span className="flex items-center gap-1 bg-blue-500/20 text-blue-300 px-2 py-0.5 rounded-full text-[10px]">
                      <Shield size={10} /> PROTECTED
                    </span>
                  )}
                </div>
              </div>
            </div>

            {/* Source selector + ad toggle + actions */}
            <div className="flex items-center gap-3">
              <select
                value={selectedSource?.key}
                onChange={(e) => handleSourceChange(e.target.value)}
                className="bg-white/10 backdrop-blur-xl border border-white/20 rounded-2xl px-3 md:px-4 py-2.5 text-white text-xs md:text-sm focus:ring-2 focus:ring-blue-500/50 min-w-52"
                disabled={loadingSource}
              >
                {premiumSources.length > 0 && (
                  <optgroup label="👑 Premium (No Ads)">
                    {premiumSources.map((source) => (
                      <option key={source.key} value={source.key}>
                        👑 {source.name} {getSourceStatus(source.key) === 'working' ? '✅' : getSourceStatus(source.key) === 'failed' ? '❌' : ''}
                      </option>
                    ))}
                  </optgroup>
                )}
                {adFreeSources.length > 0 && (
                  <optgroup label="🛡️ Ad-Free Sources">
                    {adFreeSources.map((source) => (
                      <option key={source.key} value={source.key}>
                        🛡️ {source.name} {getSourceStatus(source.key) === 'working' ? '✅' : getSourceStatus(source.key) === 'failed' ? '❌' : ''}
                      </option>
                    ))}
                  </optgroup>
                )}
                {trustedSources.filter((s) => !s.premium && !s.adFree).length > 0 && (
                  <optgroup label="⭐ Trusted Sources">
                    {trustedSources.filter((s) => !s.premium && !s.adFree).map((source) => (
                      <option key={source.key} value={source.key}>
                        ⭐ {source.name} {getSourceStatus(source.key) === 'working' ? '✅' : getSourceStatus(source.key) === 'failed' ? '❌' : ''}
                      </option>
                    ))}
                  </optgroup>
                )}
                {backupSources.length > 0 && (
                  <optgroup label="📺 Backup Sources">
                    {backupSources.map((source) => (
                      <option key={source.key} value={source.key}>
                        📺 {source.name} {getSourceStatus(source.key) === 'working' ? '✅' : getSourceStatus(source.key) === 'failed' ? '❌' : ''}
                      </option>
                    ))}
                  </optgroup>
                )}
                <optgroup label="⚙️ Actions">
                  <option value="__open_in_new_tab">
                    🔗 Open in new tab ({selectedSource?.name})
                  </option>
                </optgroup>
              </select>

              {/* AdBlock toggle */}
              <div className="flex items-center gap-2 bg-white/10 backdrop-blur-xl px-3 md:px-4 py-2.5 rounded-2xl border border-white/20">
                <Shield size={16} className={adBlockMode ? 'text-green-400' : 'text-white/40'} />
                <span className="text-white/80 text-xs md:text-sm">Ad Block</span>
                <button
                  onClick={() => setAdBlockMode((v) => !v)}
                  className={`w-11 h-6 rounded-full transition-all duration-300 relative ${adBlockMode ? 'bg-green-500' : 'bg-white/20'}`}
                  aria-label="Toggle Ad Block"
                >
                  <div className={`w-4 h-4 bg-white rounded-full absolute top-1 transition-all duration-300 ${adBlockMode ? 'left-6' : 'left-1'}`} />
                </button>
              </div>

              {/* Auto-next toggle (TV only) */}
              {isTV && (
                <div className="flex items-center gap-2 bg-white/10 backdrop-blur-xl px-3 md:px-4 py-2.5 rounded-2xl border border-white/20">
                  <ClockIcon size={16} className={autoNextEnabled ? 'text-emerald-400' : 'text-white/40'} />
                  <span className="text-white/80 text-xs md:text-sm">Auto Next</span>
                  <button
                    onClick={() => setAutoNextEnabled((v) => !v)}
                    className={`w-11 h-6 rounded-full transition-all duration-300 relative ${autoNextEnabled ? 'bg-emerald-500' : 'bg-white/20'}`}
                    aria-label="Toggle Auto Next"
                  >
                    <div className={`w-4 h-4 bg-white rounded-full absolute top-1 transition-all duration-300 ${autoNextEnabled ? 'left-6' : 'left-1'}`} />
                  </button>
                </div>
              )}
            </div>
          </div>

          {/* TV Controls */}
          {isTV && (
            <div className="px-4 md:px-6 py-2 border-b border-white/10 bg-white/[0.03]">
              <div className="flex flex-wrap items-center justify-between gap-3">
                <div className="flex items-center gap-2 text-white/80 text-sm">
                  <Layers size={16} className="text-white/60" />
                  <span className="font-medium">Season {selectedSeason}</span>
                  <span className="text-white/40">•</span>
                  <Film size={16} className="text-white/60" />
                  <span className="font-medium">Episode {selectedEpisode}</span>
                  {currentSeasonMeta?.episode_count ? (
                    <span className="text-white/40">(of {currentSeasonMeta.episode_count})</span>
                  ) : null}
                </div>

                <div className="flex items-center gap-2">
                  <button
                    onClick={goToPrevEpisode}
                    className="text-white/80 hover:text-white bg-white/10 border border-white/20 px-3 py-1.5 rounded-xl text-sm flex items-center gap-1"
                    title="Previous Episode"
                  >
                    <SkipBack size={16} /> Prev
                  </button>
                  <button
                    onClick={goToNextEpisode}
                    className="text-white/80 hover:text-white bg-white/10 border border-white/20 px-3 py-1.5 rounded-xl text-sm flex items-center gap-1"
                    title="Next Episode"
                  >
                    Next <SkipForward size={16} />
                  </button>

                  <div className="w-px h-6 bg-white/10 mx-1" />

                  <button
                    onClick={goToPrevSeason}
                    className="text-white/80 hover:text-white bg-white/10 border border-white/20 px-3 py-1.5 rounded-xl text-sm flex items-center gap-1"
                    title="Previous Season"
                  >
                    <ChevronLeft size={16} /> Season
                  </button>
                  <button
                    onClick={goToNextSeason}
                    className="text-white/80 hover:text-white bg-white/10 border border-white/20 px-3 py-1.5 rounded-xl text-sm flex items-center gap-1"
                    title="Next Season"
                  >
                    Season <ChevronRight size={16} />
                  </button>
                </div>
              </div>
            </div>
          )}

          {/* Player area */}
          <div className="flex-1 bg-black relative rounded-2xl overflow-hidden m-4 md:m-6">
            {/* Loading overlay */}
            {loadingSource && (
              <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}
                className="absolute inset-0 bg-black/80 backdrop-blur-sm flex items-center justify-center z-40">
                <div className="text-center text-white">
                  <div className="relative mb-6">
                    <div className="w-16 h-16 border-4 border-white/20 border-t-blue-500 rounded-full animate-spin mx-auto"></div>
                    <div className="absolute inset-2 border-4 border-transparent border-r-green-500 rounded-full animate-spin"
                      style={{ animationDelay: '0.3s', animationDirection: 'reverse' }}></div>
                  </div>
                  <p className="text-xl font-bold mb-2">Loading {selectedSource?.name}…</p>
                  <p className="text-white/60">
                    {selectedSource?.adFree ? '🛡️ Ad-Free Stream' : '📺 Standard Stream'}
                  </p>
                  {adBlockMode && <p className="text-sm text-green-400 mt-2 flex items-center justify-center gap-1"><Shield size={12} /> Ad protection active</p>}
                </div>
              </motion.div>
            )}

            {/* Main Player Iframe */}
            {streamUrl ? (
              <iframe
                id="secure-stream-iframe"
                key={`${selectedSource?.key}-${content.id}-${selectedSeason}-${selectedEpisode}-${retryCount}-${bypassAttempts}`}
                src={streamUrl}
                title={`${title} - ${selectedSource?.name}`}
                className="w-full h-full"
                width="100%"
                height="100%"
                frameBorder="0"
                allowFullScreen={true}
                webkitAllowFullScreen={true}
                mozAllowFullScreen={true}
                allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share; fullscreen"
                referrerPolicy="no-referrer"
                loading="eager"
                sandbox={sandboxPolicy}
                style={{ width: '100%', height: '100%', border: 'none', outline: 'none', background: 'black' }}
                onLoad={handleIframeLoad}
                onError={handleIframeError}
              />
            ) : (
              <div className="flex items-center justify-center h-full text-white/60">
                <div className="text-center">
                  <Monitor size={64} className="mx-auto mb-4 opacity-50" />
                  <p className="text-xl font-medium">Preparing Stream…</p>
                  <p className="text-sm mt-2 text-blue-400">Optimizing source selection</p>
                </div>
              </div>
            )}

            {/* Auto-next overlay (TV) */}
            {isTV && autoNextEnabled && showNextOverlay && (
              <div className="absolute right-3 bottom-3 z-50 bg-black/80 border border-white/15 rounded-xl p-3 text-white backdrop-blur-md">
                <div className="flex items-center gap-2">
                  <ClockIcon size={16} className="text-emerald-400" />
                  <span className="text-sm">Next episode in</span>
                  <span className="text-emerald-300 font-bold">{nextCountdown}s</span>
                </div>
                <div className="flex items-center gap-2 mt-2">
                  <button
                    onClick={() => {
                      resetAutoNextTimers();
                      setShowNextOverlay(false);
                    }}
                    className="px-3 py-1.5 rounded-lg bg-white/10 border border-white/20 hover:bg-white/15 text-xs"
                    title="Cancel auto next"
                  >
                    Cancel
                  </button>
                  <button
                    onClick={() => {
                      resetAutoNextTimers();
                      setShowNextOverlay(false);
                      goToNextEpisode();
                    }}
                    className="px-3 py-1.5 rounded-lg bg-emerald-600 hover:bg-emerald-500 text-white text-xs"
                    title="Play next now"
                  >
                    Next now
                  </button>
                </div>
              </div>
            )}

            {/* Error Overlay */}
            {sourceError && (
              <div className="absolute inset-0 bg-black/80 backdrop-blur-sm flex flex-col items-center justify-center z-40">
                <div className="text-center text-white max-w-md px-6">
                  <p className="text-lg font-semibold mb-2">We couldn’t display this source here.</p>
                  <p className="text-white/70 mb-4">
                    Some providers block embedding. You can open it in a new tab, or switch source.
                  </p>
                  <div className="flex items-center justify-center gap-3 flex-wrap">
                    {openInNewTabUrl && (
                      <a
                        href={openInNewTabUrl}
                        target="_blank"
                        rel="noreferrer"
                        className="px-4 py-2 rounded-xl bg-white/10 border border-white/20 hover:bg-white/15"
                      >
                        <ExternalLink size={16} className="inline mr-1" />
                        Open in new tab
                      </a>
                    )}
                    <button
                      onClick={() => {
                        setSourceError(false);
                        setLoadingSource(true);
                        setRetryCount((r) => r + 1);
                      }}
                      className="px-4 py-2 rounded-xl bg-blue-600/80 hover:bg-blue-600"
                    >
                      Retry
                    </button>
                    <button
                      onClick={() => handleSourceChange(selectOptimalSource()?.key, true)}
                      className="px-4 py-2 rounded-xl bg-white/10 border border-white/20 hover:bg-white/15"
                    >
                      Switch Source
                    </button>
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* Footer */}
          <div className="p-4 bg-white/5 backdrop-blur-xl border-t border-white/10">
            <div className="flex items-center justify-between text-sm text-white/80">
              <div className="flex items-center gap-4">
                <span className="flex items-center gap-2 font-medium">
                  {getSourcePriorityIcon(selectedSource)} <strong className="text-white">{selectedSource?.name}</strong>
                  {adBlockMode && <Shield size={12} className="text-green-400" />}
                </span>
                <span className="text-xs flex items-center gap-2">
                  <span className="text-green-400">{workingSources.size} working</span>
                  <span className="text-white/30">•</span>
                  <span className="text-red-400">{failedSources.size} blocked</span>
                  <span className="text-white/30">•</span>
                  <span className="text-blue-400">{bypassAttempts} bypassed</span>
                </span>
              </div>

              <div
                className={`text-xs px-2 py-1 rounded-full flex items-center gap-1 ${
                  loadingSource
                    ? 'bg-yellow-500/20 text-yellow-300'
                    : sourceError
                    ? 'bg-red-500/20 text-red-300'
                    : 'bg-green-500/20 text-green-300'
                }`}
              >
                {adBlockMode && <Shield size={10} />}
                <span>{loadingSource ? 'Loading' : sourceError ? 'Error' : 'Ready'}</span>
              </div>
            </div>
          </div>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
};

export default VideoPlayerModal;