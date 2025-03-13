
type Credentials = {
  url: string;
  password: string;
  allowStore: boolean;
  bypassSecurity?: boolean;
};

const CREDENTIALS_KEY = 'obs-controller-credentials';

export const storage = {
  saveCredentials: (credentials: Credentials) => {
    localStorage.setItem(CREDENTIALS_KEY, JSON.stringify(credentials));
  },
  
  getCredentials: (): Credentials | null => {
    const stored = localStorage.getItem(CREDENTIALS_KEY);
    if (!stored) return null;
    
    try {
      return JSON.parse(stored) as Credentials;
    } catch (error) {
      console.error('Failed to parse stored credentials:', error);
      return null;
    }
  },
  
  clearCredentials: () => {
    localStorage.removeItem(CREDENTIALS_KEY);
  }
};
