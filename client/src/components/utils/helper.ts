export const isValidEmail = (email:any) => {
    const isValidateEmail = /^\w+([\.-]?\w+)*@\w+([\.-]?\w+)*(\.\w{2,3})+$/; // eslint-disable-line
    return isValidateEmail.test(email);
}

export const setLocalStorage = (key:any, value:any) => {
    localStorage.setItem(key, value);
}

export const removeLocalStorage = (key:any) => {
    localStorage.removeItem(key);
}



export const setAccessToken = (token:string) => {
    localStorage.setItem('app_token', token);
}
export const getAccessToken = () => {
    return localStorage.getItem('app_token');
}

export const logout = (next:any) => {
    localStorage.removeItem('app_token');
    localStorage.removeItem('user');
    next();
}
