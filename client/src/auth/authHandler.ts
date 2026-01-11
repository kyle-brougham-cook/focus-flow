let logoutFn: (() => void) | null = null;

export const registerLogout = (fn: () => void) => {
  logoutFn = fn;
};

export const forceLogout = () => {
  if (logoutFn) {
    logoutFn();
  }
};
