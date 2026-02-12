export const authToken = () =>{
    const token = localStorage.getItem("token");
    return token ?? null;
}

export const authHeader = () => {
    if (authToken()) {
        const headers = {
            'Authorization': `Bearer ${authToken()}`,
        };
        return headers;
    }
    return false;
}
