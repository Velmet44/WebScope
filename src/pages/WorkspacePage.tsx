import { useState } from 'react';
import { useCrawlStore } from '../stores/crawlStore';
import { useCrawlerWs, startCrawl, stopCrawl, pauseCrawl, resumeCrawl } from '../hooks/useCrawler';
import { ControlsPanel } from '../components/ControlsPanel';
import { MapPanel } from '../components/MapPanel';
import { LogPanel } from '../components/LogPanel';
import { PageDetailPanel } from '../components/PageDetailPanel';
import { TopBar } from '../components/TopBar';

export function WorkspacePage() {
  const selectedPageId = useCrawlStore((s) => s.selectedPageId);
  const { setPhase, settings, addLog } = useCrawlStore();
  const [crawlerId, setCrawlerId] = useState<string | null>(null);

  useCrawlerWs(crawlerId);

  const handleStartCrawl = async () => {
    try {
      setPhase('crawling');
      const id = await startCrawl(settings);
      setCrawlerId(id);
    } catch (err) {
      setPhase('error');
      addLog({
        id: crypto.randomUUID(),
        timestamp: new Date().toISOString(),
        level: 'error',
        message: `Failed to start crawl: ${err instanceof Error ? err.message : 'Unknown error'}`,
      });
    }
  };

  const handleStopCrawl = async () => {
    if (crawlerId) {
      await stopCrawl(crawlerId);
    }
    setPhase('completed');
  };

  const handlePauseCrawl = async () => {
    if (crawlerId) {
      await pauseCrawl(crawlerId);
      setPhase('paused');
    }
  };

  const handleResumeCrawl = async () => {
    if (crawlerId) {
      await resumeCrawl(crawlerId);
      setPhase('crawling');
    }
  };

  return (
    <div className="h-screen flex flex-col bg-[var(--color-bg-primary)] overflow-hidden">
      <TopBar
        onStop={handleStopCrawl}
        onPause={handlePauseCrawl}
        onResume={handleResumeCrawl}
      />
      <div className="flex-1 flex overflow-hidden">
        <ControlsPanel onStart={handleStartCrawl} />
        <MapPanel />
        {selectedPageId ? <PageDetailPanel crawlerId={crawlerId} /> : <LogPanel />}
      </div>
    </div>
  );
}
