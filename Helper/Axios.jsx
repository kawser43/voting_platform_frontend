import appConfig from '@/config/appConfig';
import axios from 'axios';

const Axios = axios.create({
    baseURL: appConfig.api,
});


Axios.interceptors.request.use(
    (config) => {
        if (typeof window !== 'undefined') {
            const token = localStorage.getItem('token');
            if (token) {
                config.headers.Authorization = `Bearer ${token}`;
            }
        }
        return config;
    },
    (error) => {
        return Promise.reject(error);
    }
);

export default Axios;
