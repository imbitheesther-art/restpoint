import * as actionTypes from '../constants/productConstant';
import axios from 'axios';
import { ENDPOINTS, getTenantHeaders, buildUrl } from '../../../api/endpoints';

export const getProducts = () => async (dispatch) => {
    try {
        console.log('Fetching products via centralized API...');
        const { data } = await axios.get(buildUrl('marketplace', ENDPOINTS.MARKETPLACE.PRODUCTS), {
            headers: getTenantHeaders()
        });
        // Each tenant sees ONLY their own products via x-tenant-slug header
        dispatch({ type: actionTypes.GET_PRODUCTS_SUCCESS, payload: data });
    } catch (error) {
        dispatch({ type: actionTypes.GET_PRODUCTS_FAIL, payload: error.response });
    }
};

export const getProductDetails = (id) => async (dispatch) => {
    try {
        dispatch({ type: actionTypes.GET_PRODUCT_DETAILS_REQUEST });
        const { data } = await axios.get(`${buildUrl('marketplace', ENDPOINTS.MARKETPLACE.PRODUCTS)}/${id}`, {
            headers: getTenantHeaders()
        });
        console.log(data);
        dispatch({ type: actionTypes.GET_PRODUCT_DETAILS_SUCCESS, payload: data });
    } catch (error) {
        dispatch({ type: actionTypes.GET_PRODUCT_DETAILS_FAIL, payload: error.response});
    }
};

export const removeProductDetails = () => (dispatch) => {
    dispatch({ type: actionTypes.GET_PRODUCT_DETAILS_RESET });
};