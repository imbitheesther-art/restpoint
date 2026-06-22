import React, { useState, useEffect } from "react";
import axios from "axios";
import { getTenantHeaders, buildUrl } from "../../../../api/endpoints";

const API_URL = buildUrl('marketplace', '');

const MidSlide = () => {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchProducts = async () => {
      try {
        setLoading(true);
        const response = await axios.get(`${API_URL}?limit=20`, {
          headers: getTenantHeaders()
        });
        if (response.data.success) {
          setProducts(response.data.data || []);
        }
      } catch (err) {
        console.error("Error fetching products:", err);
      } finally {
        setLoading(false);
      }
    };
    fetchProducts();
  }, []);

  if (loading) return <div className="loading">Loading...</div>;

  return (
    <div className="mid-slide">
      <h2>Featured Products</h2>
      <div className="product-grid">
        {products.slice(0, 8).map((product) => (
          <div key={product.id || product._id} className="product-card">
            <img src={product.image || product.image_url || "/placeholder.png"} alt={product.name} />
            <h3>{product.name}</h3>
            <p className="price">KSh {product.price}</p>
          </div>
        ))}
      </div>
    </div>
  );
};

export default MidSlide;