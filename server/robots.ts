export interface RobotsRule {
  userAgent: string;
  allow: string[];
  disallow: string[];
  crawlDelay?: number;
}

export interface RobotsData {
  rules: RobotsRule[];
  sitemaps: string[];
}

export async function fetchRobotsTxt(url: string, userAgent: string): Promise<{
  status: 'found' | 'not_found' | 'error';
  message: string;
  data: RobotsData | null;
}> {
  try {
    const parsed = new URL(url);
    const robotsUrl = `${parsed.protocol}//${parsed.host}/robots.txt`;

    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), 10000);

    const response = await fetch(robotsUrl, {
      headers: { 'User-Agent': userAgent },
      signal: controller.signal,
    });

    clearTimeout(timeout);

    if (response.status === 404 || response.status === 403) {
      return {
        status: 'not_found',
        message: 'robots.txt not found. No crawler instructions were provided.',
        data: null,
      };
    }

    if (!response.ok) {
      return {
        status: 'error',
        message: `Could not retrieve robots.txt (HTTP ${response.status})`,
        data: null,
      };
    }

    const text = await response.text();
    const data = parseRobotsTxt(text);

    return {
      status: 'found',
      message: 'Found and respected',
      data,
    };
  } catch (err) {
    return {
      status: 'error',
      message: `Could not retrieve robots.txt: ${err instanceof Error ? err.message : 'Unknown error'}`,
      data: null,
    };
  }
}

export function isUrlBlocked(url: string, robotsData: RobotsData | null, userAgent: string): boolean {
  if (!robotsData) return false;

  const parsed = new URL(url);
  const path = parsed.pathname + parsed.search;

  for (const rule of robotsData.rules) {
    const uaMatch = rule.userAgent === '*' ||
      userAgent.toLowerCase().includes(rule.userAgent.toLowerCase());

    if (!uaMatch) continue;

    for (const disallowed of rule.disallow) {
      if (!disallowed) continue;
      if (path.startsWith(disallowed) || path === disallowed) {
        return true;
      }
    }
  }

  return false;
}

function parseRobotsTxt(text: string): RobotsData {
  const lines = text.split('\n').map((l) => l.trim());
  const rules: RobotsRule[] = [];
  const sitemaps: string[] = [];

  let currentRule: RobotsRule | null = null;

  for (const line of lines) {
    if (line.startsWith('#') || !line) continue;

    const colonIndex = line.indexOf(':');
    if (colonIndex === -1) continue;

    const key = line.substring(0, colonIndex).trim().toLowerCase();
    const value = line.substring(colonIndex + 1).trim();

    if (key === 'user-agent') {
      if (currentRule) {
        rules.push(currentRule);
      }
      currentRule = { userAgent: value, allow: [], disallow: [] };
    } else if (key === 'disallow' && currentRule) {
      if (value) currentRule.disallow.push(value);
    } else if (key === 'allow' && currentRule) {
      if (value) currentRule.allow.push(value);
    } else if (key === 'crawl-delay' && currentRule) {
      currentRule.crawlDelay = parseInt(value) || undefined;
    } else if (key === 'sitemap') {
      sitemaps.push(value);
    }
  }

  if (currentRule) {
    rules.push(currentRule);
  }

  return { rules, sitemaps };
}
