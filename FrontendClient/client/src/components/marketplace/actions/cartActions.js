import * as actionTypes from "../flipkart/client/src/redux/constants/cartConstants";
import axios from "axios";
import { ENDPOINTS, getTenantHeaders, buildUrl } from "../../../api/endpoints";

export const addToCart = (id, quantity) => async (dispatch, getState) => {
  try {
    const { data } = await axios.get(`${buildUrl('marketplace', ENDPOINTS.MARKETPLACE.PRODUCTS)}/${id}`, {
      headers: getTenantHeaders()
    });

    dispatch({ type: actionTypes.ADD_TO_CART, payload: { ...data, quantity } });

    localStorage.setItem("cart", JSON.stringify(getState().cart.cartItems));
  } catch (error) {
    console.log("Error while calling cart API");
  }
};

export const removeFromCart = (id) => (dispatch, getState) => {
  console.log(id);
  dispatch({
    type: actionTypes.REMOVE_FROM_CART,
    payload: id,
  });

  localStorage.setItem("cart", JSON.stringify(getState().cart.cartItems));
};