interface OBSCredentials {
  url: string;
  password: string;
  allowStore: boolean;
}

const STORAGE_KEY = 'obs-credentials';

export const storage = {
  saveCredentials: (creds: OBSCredentials) => {
    if (creds.allowStore) {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(creds));
    } else {
      localStorage.removeItem(STORAGE_KEY);
    }
  },

  getCredentials: (): OBSCredentials | null => {
    const data = localStorage.getItem(STORAGE_KEY);
    return data ? JSON.parse(data) : null;
  },

  clearCredentials: () => {
    localStorage.removeItem(STORAGE_KEY);
  }
};
