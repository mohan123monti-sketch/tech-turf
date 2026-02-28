import apiRequest from './api.js';

export const login = async (email, password) => {
    const data = await apiRequest('/auth/login', 'POST', { email, password });
    localStorage.setItem('userInfo', JSON.stringify(data));
    localStorage.setItem('tt_token', data.token);
    if (data.user) {
        localStorage.setItem('tt_user', JSON.stringify(data.user));
    }
    return data;
};

export const register = async (username, email, password) => {
    const data = await apiRequest('/auth/register', 'POST', { username, email, password });
    localStorage.setItem('userInfo', JSON.stringify(data));
    localStorage.setItem('tt_token', data.token);
    if (data.user) {
        localStorage.setItem('tt_user', JSON.stringify(data.user));
    }
    return data;
};

export const logout = () => {
    localStorage.removeItem('userInfo');
    localStorage.removeItem('tt_token');
    window.location.href = '/pages/login.html';
};

export const getProfile = async () => {
    const userInfo = JSON.parse(localStorage.getItem('userInfo'));
    const token = (userInfo && userInfo.token) || localStorage.getItem('tt_token');
    if (!token) return null;
    return await apiRequest('/users/profile', 'GET', null, token);
};
