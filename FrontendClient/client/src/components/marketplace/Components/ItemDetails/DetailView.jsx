import React, { useState, useEffect } from "react";
import { useParams } from "react-router-dom";
import axios from "axios";
import { getTenantHeaders, buildUrl } from "../../../../api/endpoints";
import { ENDPOINTS } from "../../../../api/endpoints";

const API_URL = buildUrl('marketplace', '');

const DetailView = () => {
  const { id } = useParams();
  const [product, setProduct] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchProduct = async () => {
      try {
        setLoading(true);
        const response = await axios.get(`${API_URL}/${id}`, {
          headers: getTenantHeaders()
        });
        setProduct(response.data.data || response.data);
      } catch (err) {
        setError(err.response?.data?.message || "Failed to load product");
      } finally {
        setLoading(false);
      }
    };
    if (id) fetchProduct();
  }, [id]);

  const getImageUrl = (imagePath) => {
    if (!imagePath) return "/placeholder.png";
    if (imagePath.startsWith("http")) return imagePath;
    if (imagePath.startsWith("/")) return `${API_URL}${imagePath}`;
    return `${API_URL}/${imagePath}`;
  };

  if (loading) return <div className="loading">Loading product details...</div>;
  if (error) return <div className="error">{error}</div>;
  if (!product) return <div className="error">Product not found</div>;

  return (
    <div className="detail-view">
      <div className="product-image">
        <img src={getImageUrl(product.image || product.image_url)} alt={product.name} />
      </div>
      <div className="product-info">
        <h1>{product.name}</h1>
        <p className="price">KSh {product.price}</p>
        <p className="description">{product.description}</p>
        <p className="category">Category: {product.category}</p>
        <p className="quantity">Available: {product.quantity || product.quantity_available}</p>
      </div>
    </div>
  );
};

export default DetailView;