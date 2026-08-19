import { useCrawlStore } from '../stores/crawlStore';
import { ControlsPanel } from '../components/ControlsPanel';
import { MapPanel } from '../components/MapPanel';
import { LogPanel } from '../components/LogPanel';
import { PageDetailPanel } from '../components/PageDetailPanel';
import { TopBar } from '../components/TopBar';

export function WorkspacePage() {
  const selectedPageId = useCrawlStore((s) => s.selectedPageId);

  return (
    <div className="h-screen flex flex-col bg-[var(--color-bg-primary)] overflow-hidden">
      <TopBar />
      <div className="flex-1 flex overflow-hidden">
        <ControlsPanel />
        <MapPanel />
        {selectedPageId ? <PageDetailPanel /> : <LogPanel />}
      </div>
    </div>
  );
}
