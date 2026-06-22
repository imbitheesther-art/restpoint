import React from "react";
import { getTenantHeaders, buildUrl } from "../../../../api/endpoints";

const API_URL = buildUrl('marketplace', '');

const Slide = ({ product }) => {
  const getImageUrl = (imagePath) => {
    if (!imagePath) return "/placeholder.png";
    if (imagePath.startsWith("http")) return imagePath;
    if (imagePath.startsWith("/")) return `${API_URL}${imagePath}`;
    return `${API_URL}/${imagePath}`;
  };

  return (
    <div className="slide">
      <img src={getImageUrl(product?.image || product?.image_url)} alt={product?.name || "Product"} />
      <div className="slide-content">
        <h2>{product?.name || "Featured Product"}</h2>
        <p className="price">KSh {product?.price || "0.00"}</p>
        <p className="description">{product?.description || ""}</p>
      </div>
    </div>
  );
};

export default Slide;