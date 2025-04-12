import fs from 'fs/promises';
import path from 'path';

const DATA_DIR = path.join(process.cwd(), 'data', 'analytics');
const ANALYTICS_ENABLED = true; // Setze auf false, um Analytics zu deaktivieren

interface PageViewData {
  path: string;
  sessionId?: string;
  browser?: string;
  referrer?: string;
  timeOnPage?: number;
  timestamp?: string;
  event?: string;
}

interface PageView {
  timestamp: string;
  page: string;
  sessionId?: string;
  browser?: string;
  referrer: string;
  timeOnPage: number;
}

interface DailyData {
  views: PageView[];
  pages: Record<string, number>;
  browsers: Record<string, number>;
  referrers: Record<string, number>;
}

interface SessionData {
  firstSeen: string;
  lastSeen: string;
  pageViews: number;
  pages: Array<{ timestamp: string; path: string }>;
}

interface VisitorStats {
  totalPageViews: number; // Umbenannt von totalVisitors
  uniqueVisitors: number;
  averageSessionDuration: number; // Umbenannt von averageTimeOnSite
  bounceRate: number;
  dailyVisitors: Array<{ date: string; count: number; uniqueCount: number }>;
}

interface PageViewStats {
  total: number;
  pages: Record<string, number>;
}

interface AdminActivityLog {
  user: string;
  action: string;
  ip?: string;
  userAgent?: string;
  details?: Record<string, any>;
  timestamp?: string;
}

export async function ensureAnalyticsDirectory(): Promise<void> {
  try {
    await fs.access(DATA_DIR);
  } catch (error) {
    await fs.mkdir(DATA_DIR, { recursive: true });
  }
}

export async function trackPageView(pageData: PageViewData): Promise<{ success: boolean }> {
  if (!ANALYTICS_ENABLED) return { success: false };
  
  await ensureAnalyticsDirectory();
  
  const today = new Date().toISOString().split('T')[0];
  const dataPath = path.join(DATA_DIR, `pageviews-${today}.json`);
  
  let dailyData: DailyData = { views: [], pages: {}, browsers: {}, referrers: {} };
  
  try {
    const fileContent = await fs.readFile(dataPath, 'utf8');
    dailyData = JSON.parse(fileContent) as DailyData;
  } catch (error) {
    // New day, new file
  }
  
  // Add page view
  dailyData.views.push({
    timestamp: new Date().toISOString(),
    page: pageData.path,
    sessionId: pageData.sessionId,
    browser: pageData.browser,
    referrer: pageData.referrer || 'direct',
    timeOnPage: pageData.timeOnPage || 0
  });
  
  // Update page counts
  dailyData.pages[pageData.path] = (dailyData.pages[pageData.path] || 0) + 1;
  
  // Update browser stats
  if (pageData.browser) {
    dailyData.browsers[pageData.browser] = (dailyData.browsers[pageData.browser] || 0) + 1;
  }
  
  // Update referrer stats
  const referrer = pageData.referrer || 'direct';
  dailyData.referrers[referrer] = (dailyData.referrers[referrer] || 0) + 1;
  
  // Save updated data
  await fs.writeFile(dataPath, JSON.stringify(dailyData, null, 2));
  
  // Update session data
  if (pageData.sessionId) {
    await updateSessionData(pageData.sessionId, pageData);
  }
  
  return { success: true };
}

async function updateSessionData(sessionId: string, pageData: PageViewData): Promise<void> {
  if (!sessionId) return;
  
  const sessionPath = path.join(DATA_DIR, 'sessions.json');
  let sessions: Record<string, SessionData> = {};
  
  try {
    const fileContent = await fs.readFile(sessionPath, 'utf8');
    sessions = JSON.parse(fileContent);
  } catch (error) {
    // No session file yet
  }
  
  if (!sessions[sessionId]) {
    sessions[sessionId] = {
      firstSeen: new Date().toISOString(),
      lastSeen: new Date().toISOString(),
      pageViews: 0,
      pages: []
    };
  }
  
  sessions[sessionId].lastSeen = new Date().toISOString();
  sessions[sessionId].pageViews += 1;
  sessions[sessionId].pages.push({
    timestamp: new Date().toISOString(),
    path: pageData.path
  });
  
  await fs.writeFile(sessionPath, JSON.stringify(sessions, null, 2));
}

export async function getVisitorStats(): Promise<VisitorStats> {
  if (!ANALYTICS_ENABLED) {
    return {
      totalPageViews: 0,
      uniqueVisitors: 0,
      averageSessionDuration: 0,
      bounceRate: 0,
      dailyVisitors: []
    };
  }

  await ensureAnalyticsDirectory();

  let totalPageViews = 0;
  let uniqueSessionIds = new Set<string>();
  // let totalTimeOnSite = 0; // Nicht mehr für den Durchschnitt benötigt
  let sessionsWithOnePageView = 0;
  const dailyVisitorMap = new Map<string, { count: number; uniqueSessions: Set<string> }>();
  let sessionData: Record<string, SessionData> = {};
  let totalSessionDuration = 0; // Neu für Durchschnittsberechnung
  let validSessionsForDuration = 0; // Neu für Durchschnittsberechnung

  try {
    // 1. Read session data
    const sessionPath = path.join(DATA_DIR, 'sessions.json');
    try {
      const sessionContent = await fs.readFile(sessionPath, 'utf8');
      sessionData = JSON.parse(sessionContent);
      uniqueSessionIds = new Set(Object.keys(sessionData));

      // Calculate total and average session duration & bounce rate sessions
      Object.values(sessionData).forEach(session => {
        const firstSeen = new Date(session.firstSeen).getTime();
        const lastSeen = new Date(session.lastSeen).getTime();
        // Only consider sessions with a valid duration > 0
        if (lastSeen > firstSeen) {
          const duration = (lastSeen - firstSeen) / 1000; // Dauer in Sekunden
          totalSessionDuration += duration;
          validSessionsForDuration++;
        }
        if (session.pageViews === 1) {
          sessionsWithOnePageView++;
        }
      });

    } catch (error) {
      console.warn("Could not read or process session data:", error);
    }

    // 2. Read daily page view files for total page views and daily stats
    const files = await fs.readdir(DATA_DIR);
    const pageViewFiles = files.filter(file => file.startsWith('pageviews-') && file.endsWith('.json'));

    for (const file of pageViewFiles) {
      const date = file.replace('pageviews-', '').replace('.json', '');
      const filePath = path.join(DATA_DIR, file);
      try {
        const fileContent = await fs.readFile(filePath, 'utf8');
        const dailyData = JSON.parse(fileContent) as DailyData;

        totalPageViews += dailyData.views.length;

        const dailyUniqueSessions = new Set<string>();
        dailyData.views.forEach(view => {
          if (view.sessionId) {
             // Ensure uniqueSessionIds set is complete, even if sessions.json was incomplete
             uniqueSessionIds.add(view.sessionId);
             dailyUniqueSessions.add(view.sessionId);
          }
          // totalTimeOnSite += view.timeOnPage || 0; // Nicht mehr benötigt für Durchschnitt
        });

        dailyVisitorMap.set(date, {
            count: dailyData.views.length,
            uniqueSessions: dailyUniqueSessions
        });

      } catch (error) {
        console.error(`Error reading or parsing daily file ${file}:`, error);
      }
    }

    // 3. Calculate Bounce Rate
    const totalSessions = uniqueSessionIds.size; // Use size of the set as total sessions
    const bounceRate = totalSessions > 0 ? (sessionsWithOnePageView / totalSessions) * 100 : 0;

    // 4. Calculate Average Session Duration
    const averageSessionDuration = validSessionsForDuration > 0 ? totalSessionDuration / validSessionsForDuration : 0;

    // 5. Format daily visitors
    const dailyVisitors = Array.from(dailyVisitorMap.entries())
        .map(([date, data]) => ({
            date: date,
            count: data.count, // Daily Page Views
            uniqueCount: data.uniqueSessions.size // Daily Unique Visitors
        }))
        .sort((a, b) => a.date.localeCompare(b.date));

    return {
      totalPageViews: totalPageViews, // Korrekt benannt
      uniqueVisitors: uniqueSessionIds.size, // Korrekt gezählt
      averageSessionDuration: Math.round(averageSessionDuration), // Neue Berechnung
      bounceRate: Math.round(bounceRate), // Berechnung beibehalten
      dailyVisitors: dailyVisitors
    };

  } catch (error) {
    console.error('Failed to calculate visitor stats:', error);
    return {
      totalPageViews: 0,
      uniqueVisitors: 0,
      averageSessionDuration: 0,
      bounceRate: 0,
      dailyVisitors: []
    };
  }
}

export async function getPageViews(): Promise<PageViewStats> {
  await ensureAnalyticsDirectory();
  
  const result: PageViewStats = {
    total: 0,
    pages: {}
  };
  
  try {
    const files = await fs.readdir(DATA_DIR);
    const pageViewFiles = files.filter(file => file.startsWith('pageviews-'));
    
    for (const file of pageViewFiles) {
      const filePath = path.join(DATA_DIR, file);
      const fileContent = await fs.readFile(filePath, 'utf8');
      const dailyData = JSON.parse(fileContent) as DailyData;
      
      result.total += dailyData.views.length;
      
      // Aggregate page views
      Object.entries(dailyData.pages).forEach(([page, count]) => {
        result.pages[page] = (result.pages[page] || 0) + count;
      });
    }
  } catch (error) {
    // No data yet
  }
  
  return result;
}

export async function getBrowserStats(): Promise<Record<string, number>> {
  await ensureAnalyticsDirectory();
  
  const browsers: Record<string, number> = {};
  
  try {
    const files = await fs.readdir(DATA_DIR);
    const pageViewFiles = files.filter(file => file.startsWith('pageviews-'));
    
    for (const file of pageViewFiles) {
      const filePath = path.join(DATA_DIR, file);
      const fileContent = await fs.readFile(filePath, 'utf8');
      const dailyData = JSON.parse(fileContent) as DailyData;
      
      // Aggregate browser stats
      Object.entries(dailyData.browsers || {}).forEach(([browser, count]) => {
        browsers[browser] = (browsers[browser] || 0) + count;
      });
    }
  } catch (error) {
    // No data yet
  }
  
  return browsers;
}

export async function logAdminActivity(activity: AdminActivityLog): Promise<void> {
  const logsDir = path.join(process.cwd(), 'data', 'logs');
  
  try {
    await fs.access(logsDir);
  } catch (error) {
    await fs.mkdir(logsDir, { recursive: true });
  }
  
  const logFilePath = path.join(logsDir, 'admin_activity.json');
  
  let logs: AdminActivityLog[] = [];
  try {
    const content = await fs.readFile(logFilePath, 'utf8');
    logs = JSON.parse(content);
  } catch (error) {
    // File doesn't exist yet
  }
  
  logs.unshift({
    timestamp: new Date().toISOString(),
    ...activity
  });
  
  // Limit log size
  if (logs.length > 1000) {
    logs = logs.slice(0, 1000);
  }
  
  await fs.writeFile(logFilePath, JSON.stringify(logs, null, 2));
}