import type { CrawlProject, CrawlSettings, Page, Link, Comment, LogEntry } from '../types';

export function exportProject(
  settings: CrawlSettings,
  pages: Page[],
  links: Link[],
  comments: Comment[],
  logs: LogEntry[],
  options: {
    includeMetadata: boolean;
    includeRelationships: boolean;
    includeComments: boolean;
    includeSettings: boolean;
    includeLogs: boolean;
    includeContent: boolean;
    includeRawHtml: boolean;
  }
): string {
  const project: CrawlProject = {
    format: 'webscope',
    version: 1,
    project: {
      name: `Crawl - ${settings.startUrl}`,
      startUrl: settings.startUrl,
      createdAt: new Date().toISOString(),
    },
    settings: options.includeSettings ? settings : { ...settings, startUrl: settings.startUrl },
    pages: options.includeMetadata
      ? pages.map((p) => ({
          ...p,
          content: options.includeRawHtml ? p.content : options.includeContent ? p.content : undefined,
        }))
      : [],
    links: options.includeRelationships ? links : [],
    comments: options.includeComments ? comments : [],
    logs: options.includeLogs ? logs : [],
    metadata: {
      exportDate: new Date().toISOString(),
      totalPageCount: pages.length,
      totalLinkCount: links.length,
    },
  };

  return JSON.stringify(project, null, 2);
}

export function importProject(jsonString: string): {
  success: boolean;
  data?: CrawlProject;
  error?: string;
} {
  try {
    const data = JSON.parse(jsonString);

    if (!data || typeof data !== 'object') {
      return { success: false, error: 'Invalid file format' };
    }

    if (data.format !== 'webscope') {
      return {
        success: false,
        error: 'This file is not a valid WebScope project. The format identifier is missing or incorrect.',
      };
    }

    if (typeof data.version !== 'number' || data.version < 1) {
      return {
        success: false,
        error: `Unsupported format version: ${data.version}. This version of WebScope supports version 1.`,
      };
    }

    if (!data.project || !data.project.startUrl) {
      return {
        success: false,
        error: 'The project file is missing required fields (project name or start URL).',
      };
    }

    if (!Array.isArray(data.pages)) {
      return {
        success: false,
        error: 'The project file is missing the pages array.',
      };
    }

    return { success: true, data: data as CrawlProject };
  } catch {
    return {
      success: false,
      error: 'This file could not be parsed. It may be corrupted or not a valid JSON file.',
    };
  }
}

export function downloadFile(content: string, filename: string, mimeType: string) {
  const blob = new Blob([content], { type: mimeType });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = filename;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
}
