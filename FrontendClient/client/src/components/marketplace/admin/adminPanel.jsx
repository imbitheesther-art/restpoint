import React, { useState, useEffect } from "react";
import axios from "axios";
import { getTenantHeaders, buildUrl } from "../../../api/endpoints";
import { ENDPOINTS } from "../../../api/endpoints";

const API_URL = buildUrl('marketplace', '');

const AdminPanel = () => {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchProducts = async () => {
      try {
        setLoading(true);
        const response = await axios.get(API_URL, { headers: getTenantHeaders() });
        setProducts(response.data.data || []);
        setError(null);
      } catch (err) {
        console.error("Error fetching products:", err);
        setError(err.response?.data?.message || "Failed to load products");
      } finally {
        setLoading(false);
      }
    };
    fetchProducts();
  }, []);

  // ... rest of component
  return (
    <div>
      <h1>Admin Panel</h1>
      {loading && <p>Loading...</p>}
      {error && <p style={{ color: "red" }}>{error}</p>}
      {!loading && !error && (
        <div>
          <p>Total Products: {products.length}</p>
          <ul>
            {products.map((product) => (
              <li key={product.id}>{product.name}</li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
};

export default AdminPanel;