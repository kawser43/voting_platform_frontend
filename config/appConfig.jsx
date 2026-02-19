const appConfig = Object.freeze({
    app_env: process.env.NEXT_PUBLIC_APP_ENV ?? 'production',
    url: process.env.NEXT_PUBLIC_APP_URL ?? 'https://test.com/',
    app_name: process.env.NEXT_PUBLIC_APP_NAME ?? 'test.COM',
    api: process.env.NEXT_PUBLIC_API ?? 'http://localhost:8008/api/',
    api_base_url: process.env.NEXT_PUBLIC_API_BASE_URL ?? 'http://localhost:8008/',
    authPaths: [
        '/forget-password',
        '/auth/login',
        '/auth/register',
        '/registration-success',
        '/reset-password',
        '/verify-email'
    ],
    guestPaths: [
        '/',
        '/leaderboard',
        '/profiles',
        '/faq',
        '/why-join-us',
        '/contents',
    ],
    ip_provider: process.env.NEXT_PUBLIC_IP_PROVIDER ?? 'https://api.ipify.org?format=json',
    ip_location_provider: process.env.NEXT_PUBLIC_IP_LOCATION_PROVIDER ?? 'https://api.fbutube.com/api/get_ip_to_location',
    audio_recording_limit: process.env.NEXT_PUBLIC_AUDIO_RECORDING_LIMIT ?? 1
});

export default appConfig;
