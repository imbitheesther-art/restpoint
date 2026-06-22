import React, { useContext } from "react";
import { CartContext } from "../../context/CartContext";
import CartItem from "./CartItem";
import { getTenantHeaders, buildUrl } from "../../../../api/endpoints";

const API_URL = buildUrl('marketplace', '');

const Cart = () => {
  const cartContext = useContext(CartContext);
  const cartItems = cartContext?.cartItems || [];
  const totalAmount = cartItems.reduce((sum, item) => sum + (item.price || 0) * (item.quantity || 1), 0);

  return (
    <div className="cart-page">
      <h1>Shopping Cart</h1>
      {cartItems.length === 0 ? (
        <div className="empty-cart">
          <p>Your cart is empty</p>
        </div>
      ) : (
        <div className="cart-content">
          <div className="cart-items">
            {cartItems.map((item) => (
              <CartItem key={item.id || item._id} item={item} />
            ))}
          </div>
          <div className="cart-summary">
            <h2>Order Summary</h2>
            <div className="total">
              <span>Total:</span>
              <span>KSh {totalAmount.toFixed(2)}</span>
            </div>
            <button className="checkout-btn">Proceed to Checkout</button>
          </div>
        </div>
      )}
    </div>
  );
};

export default Cart;