import {createContext, useContext, useEffect, useMemo, useState} from 'react'
import axios from 'axios'

const AuthContext = useContext();
const AuthProvider = ({children}) => {

    const [token, setToken] = useState(localStorage.getItem("token"))

    const saveToken = (newToken) => {
        setToken(newToken)
    };

    useEffect(() => {
        if(token) {
            axios.defaults.headers.common['Authorization'] = 'Bearer' + token;
            localStorage.setItem('token', token)
        }else{
            delete axios.defaults.headers.common['Authorization']
            localStorage.removeItem('token')
        }
    }, [token])

    const contextValue = useMemo(()=>({
        token, setToken,
    }),[token])

    return (
        <AuthContext.Provider value={contextValue}>
            {children}
        </AuthContext.Provider>
    )
};

export const useAuth = () => {
    return useContext(AuthContext);
}

export default AuthProvider