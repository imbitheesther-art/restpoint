const BASE_URL = window.FLORIST_BASE_URL || `${window.location.origin}/api/v1/restpoint`;
const APP_BASE_PATH = '/florists';

const resolvePageUrl = (page) => {
  if (!page) return `${APP_BASE_PATH}/pages/orders/index.html`;
  const normalizedPage = page.replace(/^\//, '');
  return `${APP_BASE_PATH}/pages/${normalizedPage}/index.html`;
};

const browserIpcRenderer = {
  send(channel, ...args) {
    if (channel === 'navigate') {
      const page = args[0];
      const payload = args[1] || {};
      if (page === 'login') {
        window.location.href = '/login';
        return;
      }
      if (page === 'logout') {
        window.location.href = '/login';
        return;
      }
      if (typeof page === 'string') {
        try {
          if (payload && Object.keys(payload).length > 0) {
            localStorage.setItem('floristPageData', JSON.stringify(payload));
          }
        } catch (error) {
          console.warn('Could not save florist page data', error);
        }
        window.location.href = resolvePageUrl(page);
      }
      return;
    }

    if (channel === 'show-message-box') {
      const payload = args[0] || {};
      const message = payload.message || payload.title || 'Notification';
      window.alert(message);
      return;
    }

    console.warn('Unsupported ipcRenderer channel:', channel, args);
  },
  on(channel, listener) {
    console.warn(`ipcRenderer.on is not supported in browser mode: ${channel}`);
  },
  removeAllListeners(channel) {
    console.warn(`ipcRenderer.removeAllListeners is not supported in browser mode: ${channel}`);
  }
};

window.ipcRenderer = window.ipcRenderer || browserIpcRenderer;

