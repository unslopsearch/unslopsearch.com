// Search engine configurations
const searchEngines = {
  google: {
    name: 'Google',
    url: 'https://www.google.com/search',
    params: {},
    queryParam: 'q',
    modes: [
      { id: 'suffix', querySuffix: ' -ai' },
      { id: 'udm14', params: { udm: '14' } }
    ]
  },
  duckduckgo: {
    name: 'DuckDuckGo',
    url: 'https://noai.duckduckgo.com/',
    params: {},
    queryParam: 'q',
    modes: [
      { id: 'noai', url: 'https://noai.duckduckgo.com/' },
      { id: 'params', url: 'https://duckduckgo.com/', params: { kbg: '-1', kbe: '-1', kbd: '-1' } }
    ]
  },
  brave: {
    name: 'Brave',
    url: 'https://search.brave.com/search',
    params: { summary: '0' },
    queryParam: 'q'
  },
  startpage: {
    name: 'Startpage',
    url: 'https://www.startpage.com/do/search',
    params: {},
    queryParam: 'q'
  },
  qwant: {
    name: 'Qwant',
    url: 'https://www.qwant.com/',
    params: {},
    queryParam: 'q'
  },
  mojeek: {
    name: 'Mojeek',
    url: 'https://www.mojeek.com/search',
    params: {},
    queryParam: 'q'
  },
  presearch: {
    name: 'Presearch',
    url: 'https://presearch.com/search',
    params: {},
    queryParam: 'q'
  }
};

// Google domains to match
const googleDomains = [
  'www.google.com',
  'www.google.co.uk',
  'www.google.ca',
  'www.google.com.au',
  'www.google.de',
  'www.google.fr',
  'www.google.es',
  'www.google.it',
  'www.google.co.jp',
  'www.google.co.in'
];

// Get current settings
async function getSettings() {
  return new Promise((resolve) => {
    chrome.storage.sync.get(['searchEngine', 'searchMode', 'autoRedirect'], (result) => {
      resolve({
        engine: result.searchEngine || 'google',
        modeIndex: result.searchMode || 0,
        autoRedirect: result.autoRedirect !== false // default to true
      });
    });
  });
}

// Track URLs we've already modified to avoid redirect loops
const modifiedUrls = new Set();

// Clear old entries periodically to prevent memory buildup
setInterval(() => modifiedUrls.clear(), 60000);

// Check if URL needs modification and build new URL
function checkAndBuildUrl(url, settings) {
  try {
    const urlObj = new URL(url);

    // Check Google
    if (googleDomains.includes(urlObj.hostname) && urlObj.pathname.startsWith('/search')) {
      const query = urlObj.searchParams.get('q');
      if (!query) return null;

      if (settings.modeIndex === 0) {
        // -ai suffix mode
        if (!query.includes(' -ai')) {
          urlObj.searchParams.set('q', query + ' -ai');
          return urlObj.toString();
        }
      } else {
        // udm=14 mode
        if (urlObj.searchParams.get('udm') !== '14') {
          urlObj.searchParams.set('udm', '14');
          return urlObj.toString();
        }
      }
      return null;
    }

    // Check DuckDuckGo - redirect regular duckduckgo.com to noai.duckduckgo.com
    if (urlObj.hostname === 'duckduckgo.com' && urlObj.searchParams.has('q')) {
      // Get DuckDuckGo mode setting (0 = noai subdomain, 1 = params)
      const ddgModeIndex = settings.engine === 'duckduckgo' ? settings.modeIndex : 0;

      if (ddgModeIndex === 0) {
        // noai subdomain mode - redirect to noai.duckduckgo.com
        urlObj.hostname = 'noai.duckduckgo.com';
        return urlObj.toString();
      } else {
        // params mode - add kbg=-1 etc
        if (urlObj.searchParams.get('kbg') !== '-1') {
          urlObj.searchParams.set('kbg', '-1');
          urlObj.searchParams.set('kbe', '-1');
          urlObj.searchParams.set('kbd', '-1');
          return urlObj.toString();
        }
      }
      return null;
    }

    // Already on noai.duckduckgo.com - no modification needed
    if (urlObj.hostname === 'noai.duckduckgo.com') {
      return null;
    }

    // Check Brave
    if (urlObj.hostname === 'search.brave.com' && urlObj.pathname.startsWith('/search')) {
      if (urlObj.searchParams.get('summary') !== '0') {
        urlObj.searchParams.set('summary', '0');
        return urlObj.toString();
      }
      return null;
    }

    return null;
  } catch (e) {
    return null;
  }
}

// Handle search URL modifications using webNavigation
// Using onCommitted is more reliable than onBeforeNavigate for redirects
chrome.webNavigation.onCommitted.addListener(async (details) => {
  // Only handle main frame navigations
  if (details.frameId !== 0) return;

  // Skip if this URL was already modified by us (prevent loops)
  if (modifiedUrls.has(details.url)) {
    modifiedUrls.delete(details.url);
    return;
  }

  const settings = await getSettings();
  if (!settings.autoRedirect) return;

  const newUrl = checkAndBuildUrl(details.url, settings);
  if (newUrl) {
    // Track the new URL to prevent redirect loops
    modifiedUrls.add(newUrl);
    chrome.tabs.update(details.tabId, { url: newUrl });
  }
});

// Omnibox support - type "us <query>" to search
chrome.omnibox.onInputEntered.addListener(async (text) => {
  const settings = await getSettings();
  const engine = settings.engine;
  const config = searchEngines[engine] || searchEngines.google;
  const mode = config.modes && config.modes[settings.modeIndex];

  let finalQuery = text;
  let params = { ...config.params };
  let baseUrl = config.url;

  if (mode) {
    if (mode.url) {
      baseUrl = mode.url;
    }
    if (mode.querySuffix) {
      finalQuery = text + mode.querySuffix;
    }
    if (mode.params) {
      params = mode.params; // Use mode params instead of merging
    }
  }

  const urlParams = new URLSearchParams({
    [config.queryParam]: finalQuery,
    ...params
  });

  const url = `${baseUrl}?${urlParams.toString()}`;
  chrome.tabs.update({ url });
});

chrome.omnibox.setDefaultSuggestion({
  description: 'Search without AI: %s'
});

// Log settings changes
chrome.storage.onChanged.addListener((changes, namespace) => {
  if (namespace === 'sync') {
    console.log('Unslop Search settings updated', changes);
  }
});

// Log extension startup
chrome.runtime.onInstalled.addListener(() => {
  console.log('Unslop Search installed/updated');
});
