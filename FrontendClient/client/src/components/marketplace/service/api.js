import axios from 'axios';
import { ENDPOINTS, getTenantHeaders, buildUrl } from '../../../api/endpoints';

export const authenticateLogin = async (user) => {
    try {
        return await axios.post(buildUrl('auth', ENDPOINTS.AUTH.LOGIN), user, {
            headers: getTenantHeaders()
        });
    } catch (error) {
        console.log('error while calling login API: ', error);
    }
};

export const authenticateSignup = async (user) => {
    try {
        return await axios.post(buildUrl('auth', ENDPOINTS.AUTH.REGISTER), user, {
            headers: getTenantHeaders()
        });
    } catch (error) {
        console.log('error while calling Signup API: ', error);
    }
};

export const getProductById = async (id) => {
    try {
        return await axios.get(`${buildUrl('marketplace', ENDPOINTS.MARKETPLACE.PRODUCTS)}/${id}`, {
            headers: getTenantHeaders()
        });
    } catch (error) {
        console.log('Error while getting product by id response', error);
    }
};

export const payUsingPaytm = async (data) => {
    try {
        console.log('payment api');
        let response = await axios.post(buildUrl('mpesa', ENDPOINTS.MPESA.STKPUSH), data, {
            headers: getTenantHeaders()
        });
        console.log(response.data);
        return response.data;
    } catch (error) {
        console.log('error', error);
    }
};