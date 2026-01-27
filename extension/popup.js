const searchEngines = {
  google: {
    name: 'Google',
    url: 'https://www.google.com/search',
    params: {},
    queryParam: 'q',
    hint: '-ai',
    modes: [
      { id: 'suffix', hint: '-ai', querySuffix: ' -ai' },
      { id: 'udm14', hint: 'udm=14', params: { udm: '14' } }
    ]
  },
  duckduckgo: {
    name: 'DuckDuckGo',
    url: 'https://noai.duckduckgo.com/',
    params: {},
    queryParam: 'q',
    hint: 'noai subdomain',
    modes: [
      { id: 'noai', hint: 'noai subdomain', url: 'https://noai.duckduckgo.com/' },
      { id: 'params', hint: 'kbg=-1', url: 'https://duckduckgo.com/', params: { kbg: '-1', kbe: '-1', kbd: '-1' } }
    ]
  },
  brave: {
    name: 'Brave',
    url: 'https://search.brave.com/search',
    params: { summary: '0' },
    queryParam: 'q',
    hint: 'summary=0'
  },
  startpage: {
    name: 'Startpage',
    url: 'https://www.startpage.com/do/search',
    params: {},
    queryParam: 'q',
    hint: 'no AI by default'
  },
  qwant: {
    name: 'Qwant',
    url: 'https://www.qwant.com/',
    params: {},
    queryParam: 'q',
    hint: 'no AI by default'
  },
  mojeek: {
    name: 'Mojeek',
    url: 'https://www.mojeek.com/search',
    params: {},
    queryParam: 'q',
    hint: 'no AI by default'
  },
  presearch: {
    name: 'Presearch',
    url: 'https://presearch.com/search',
    params: {},
    queryParam: 'q',
    hint: 'no AI, decentralized'
  }
};

let currentEngine = 'google';
let currentModeIndex = 0;
let autoRedirect = true;

// Load saved preferences
chrome.storage.sync.get(['searchEngine', 'searchMode', 'autoRedirect'], (result) => {
  if (result.searchEngine && searchEngines[result.searchEngine]) {
    currentEngine = result.searchEngine;
  }
  if (result.searchMode !== undefined) {
    currentModeIndex = parseInt(result.searchMode, 10) || 0;
  }
  if (result.autoRedirect !== undefined) {
    autoRedirect = result.autoRedirect;
  }
  updateUI();
});

function getCurrentMode() {
  const config = searchEngines[currentEngine];
  if (config.modes && config.modes[currentModeIndex]) {
    return config.modes[currentModeIndex];
  }
  return null;
}

function updateUI() {
  const config = searchEngines[currentEngine];
  const mode = getCurrentMode();

  document.getElementById('engine').value = currentEngine;
  document.getElementById('hint-method').textContent = mode ? mode.hint : config.hint;
  document.getElementById('query').placeholder = `Search ${config.name}...`;
  document.getElementById('auto-redirect').checked = autoRedirect;

  const modeToggle = document.getElementById('mode-toggle');
  if (config.modes && config.modes.length > 1) {
    modeToggle.style.display = 'inline';
    modeToggle.textContent = `(${config.modes[(currentModeIndex + 1) % config.modes.length].hint})`;
  } else {
    modeToggle.style.display = 'none';
  }
}

function buildSearchUrl(query) {
  const config = searchEngines[currentEngine];
  const mode = getCurrentMode();

  let finalQuery = query;
  let params = { ...config.params };
  let baseUrl = config.url;

  if (mode) {
    if (mode.url) {
      baseUrl = mode.url;
    }
    if (mode.querySuffix) {
      finalQuery = query + mode.querySuffix;
    }
    if (mode.params) {
      params = mode.params; // Use mode params instead of merging
    }
  }

  const urlParams = new URLSearchParams({
    [config.queryParam]: finalQuery,
    ...params
  });
  return `${baseUrl}?${urlParams.toString()}`;
}

// Engine selection
document.getElementById('engine').addEventListener('change', (e) => {
  currentEngine = e.target.value;
  currentModeIndex = 0;
  chrome.storage.sync.set({ searchEngine: currentEngine, searchMode: 0 });
  updateUI();
});

// Mode toggle
document.getElementById('mode-toggle').addEventListener('click', () => {
  const config = searchEngines[currentEngine];
  if (config.modes && config.modes.length > 1) {
    currentModeIndex = (currentModeIndex + 1) % config.modes.length;
    chrome.storage.sync.set({ searchMode: currentModeIndex });
    updateUI();
  }
});

// Auto-redirect toggle
document.getElementById('auto-redirect').addEventListener('change', (e) => {
  autoRedirect = e.target.checked;
  chrome.storage.sync.set({ autoRedirect: autoRedirect });
});

// Search form
document.getElementById('search-form').addEventListener('submit', (e) => {
  e.preventDefault();
  const query = document.getElementById('query').value.trim();
  if (query) {
    chrome.tabs.create({ url: buildSearchUrl(query) });
  }
});
