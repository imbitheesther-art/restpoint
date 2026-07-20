import { toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

// Toast event bus for global usage
class ToastEventBus {
  constructor() {
    this.listeners = new Map();
  }

  on(event, callback) {
    if (!this.listeners.has(event)) {
      this.listeners.set(event, []);
    }
    this.listeners.get(event).push(callback);
    
    return () => {
      const callbacks = this.listeners.get(event);
      const index = callbacks.indexOf(callback);
      if (index > -1) {
        callbacks.splice(index, 1);
      }
    };
  }

  emit(event, data) {
    const callbacks = this.listeners.get(event);
    if (callbacks) {
      callbacks.forEach(callback => callback(data));
    }
  }
}

export const toastEventBus = new ToastEventBus();

// Toast configuration
const toastConfig = {
  position: 'top-right',
  autoClose: 4000,
  hideProgressBar: false,
  closeOnClick: true,
  pauseOnHover: true,
  pauseOnFocusLoss: true,
  draggable: true,
  progress: undefined,
  theme: 'colored',
};

export const showToast = {
  success: (message, options = {}) => {
    toastEventBus.emit('toast:success', { message, options });
    return toast.success(message, { ...toastConfig, ...options });
  },

  error: (message, options = {}) => {
    toastEventBus.emit('toast:error', { message, options });
    return toast.error(message, { ...toastConfig, ...options });
  },

  warning: (message, options = {}) => {
    toastEventBus.emit('toast:warning', { message, options });
    return toast.warning(message, { ...toastConfig, ...options });
  },

  info: (message, options = {}) => {
    toastEventBus.emit('toast:info', { message, options });
    return toast.info(message, { ...toastConfig, ...options });
  },

  loading: (message, options = {}) => {
    toastEventBus.emit('toast:loading', { message, options });
    return toast.loading(message, { ...toastConfig, ...options });
  },

  promise: (promise, messages, options = {}) => {
    toastEventBus.emit('toast:promise', { promise, messages, options });
    return toast.promise(promise, messages, { ...toastConfig, ...options });
  },

  custom: (message, type = 'info', options = {}) => {
    const toastConfig = {
      success: () => toast.success(message, options),
      error: () => toast.error(message, options),
      warning: () => toast.warning(message, options),
      info: () => toast.info(message, options),
      loading: () => toast.loading(message, options),
    };

    const showFn = toastConfig[type] || toastConfig.info;
    toastEventBus.emit('toast:custom', { message, type, options });
    return showFn();
  },

  dismiss: (toastId) => {
    toastEventBus.emit('toast:dismiss', { toastId });
    return toast.dismiss(toastId);
  },

  dismissAll: () => {
    toastEventBus.emit('toast:dismissAll', {});
    return toast.dismiss();
  },
};

export default showToast;