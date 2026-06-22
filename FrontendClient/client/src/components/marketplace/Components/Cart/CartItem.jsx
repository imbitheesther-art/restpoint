import React from "react";
import { getTenantHeaders, buildUrl } from "../../../../api/endpoints";

const API_URL = buildUrl('marketplace', '');

const CartItem = ({ item, onUpdateQty, onRemove }) => {
  const getImageUrl = (imagePath) => {
    if (!imagePath) return "/placeholder.png";
    if (imagePath.startsWith("http")) return imagePath;
    if (imagePath.startsWith("/")) return `${API_URL}${imagePath}`;
    return `${API_URL}/${imagePath}`;
  };

  return (
    <div className="cart-item">
      <div className="item-image">
        <img src={getImageUrl(item.image || item.image_url || item.url)} alt={item.name || item.title} />
      </div>
      <div className="item-details">
        <h3>{item.name || item.title}</h3>
        <p className="item-price">KSh {item.price || item.cost}</p>
        <div className="quantity-controls">
          <button onClick={() => onUpdateQty(item.id || item._id, (item.quantity || 1) - 1)} disabled={(item.quantity || 1) <= 1}>-</button>
          <span>{item.quantity || 1}</span>
          <button onClick={() => onUpdateQty(item.id || item._id, (item.quantity || 1) + 1)}>+</button>
        </div>
        <button className="remove-btn" onClick={() => onRemove(item.id || item._id)}>Remove</button>
      </div>
    </div>
  );
};

export default CartItem;