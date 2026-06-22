import React, { useState, useEffect } from "react";
import axios from "axios";
import { getTenantHeaders, buildUrl } from "../../../../api/endpoints";

const API_URL = buildUrl('marketplace', '');

const MidSection = () => {
  const [categories, setCategories] = useState([]);
  const [featured, setFeatured] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        const headers = getTenantHeaders();
        const [catRes, featRes] = await Promise.all([
          axios.get(`${API_URL}/categories`, { headers }),
          axios.get(`${API_URL}/featured?limit=5`, { headers })
        ]);
        setCategories(catRes.data.data || []);
        setFeatured(featRes.data.data || []);
      } catch (err) {
        console.error("Error fetching data:", err);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  const getImageUrl = (path) => {
    if (!path) return "/placeholder.png";
    if (path.startsWith("http")) return path;
    return `${API_URL}${path.startsWith("/") ? "" : "/"}${path}`;
  };

  if (loading) return <div className="loading">Loading...</div>;

  return (
    <div className="mid-section">
      <div className="categories">
        <h2>Categories</h2>
        <div className="category-list">
          {categories.map((cat) => (
            <div key={cat.id || cat._id} className="category-card">
              <img src={getImageUrl(cat.image)} alt={cat.name} />
              <span>{cat.name}</span>
            </div>
          ))}
        </div>
      </div>
      <div className="featured-products">
        <h2>Featured Products</h2>
        <div className="featured-grid">
          {featured.map((product) => (
            <div key={product.id || product._id} className="featured-card">
              <img src={getImageUrl(product.image || product.image_url)} alt={product.name} />
              <h3>{product.name}</h3>
              <p>KSh {product.price}</p>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default MidSection;