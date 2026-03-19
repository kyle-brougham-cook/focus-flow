let token: string | null = null;

export const setToken = (newToken: string | null) => {
    token = newToken;
};

export const clearToken = () => token = null;

export const getToken = () => token;