import axios from 'axios';
import { baseUrl } from '../env';

const apiClient = axios.create({
    baseURL: baseUrl,
    headers:{
        'Content-Type': "application/json",
    },
})

const setAuthToken = (token)=>{
    if(token){
        apiClient.defaults.headers.common['Authorization'] = `Bearer ${token}`;
    }else{
        delete apiClient.defaults.headers.common['Authorization'];
    }
}

export {apiClient, setAuthToken}