import React, { useState, useEffect } from "react";
import axios from "axios";
import { getTenantHeaders, buildUrl } from "../../../api/endpoints";

const API_URL = buildUrl('marketplace', '');

const ProductsManagement = () => {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [editingProduct, setEditingProduct] = useState(null);

  const fetchProducts = async () => {
    try {
      setLoading(true);
      const response = await axios.get(API_URL, { headers: getTenantHeaders() });
      setProducts(response.data.data || response.data.products || []);
    } catch (err) {
      console.error("Error fetching products:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchProducts(); }, []);

  const handleDelete = async (id) => {
    if (!window.confirm("Delete this product?")) return;
    try {
      await axios.delete(`${API_URL}/${id}`, { headers: getTenantHeaders() });
      fetchProducts();
    } catch (err) {
      console.error("Error deleting product:", err);
    }
  };

  const handleEdit = (product) => {
    setEditingProduct(product);
  };

  const handleSave = async (productData) => {
    try {
      if (editingProduct?.id) {
        await axios.put(`${API_URL}/${editingProduct.id}`, productData, {
          headers: { ...getTenantHeaders(), "Content-Type": "application/json" }
        });
      } else {
        await axios.post(API_URL, productData, {
          headers: { ...getTenantHeaders(), "Content-Type": "application/json" }
        });
      }
      setEditingProduct(null);
      fetchProducts();
    } catch (err) {
      console.error("Error saving product:", err);
    }
  };

  return (
    <div>
      <h2>Products Management</h2>
      {loading && <p>Loading...</p>}
      <table>
        <thead>
          <tr>
            <th>Name</th>
            <th>Price</th>
            <th>Category</th>
            <th>Actions</th>
          </tr>
        </thead>
        <tbody>
          {products.map((product) => (
            <tr key={product.id || product._id}>
              <td>{product.name}</td>
              <td>{product.price}</td>
              <td>{product.category}</td>
              <td>
                <button onClick={() => handleEdit(product)}>Edit</button>
                <button onClick={() => handleDelete(product.id || product._id)}>Delete</button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};

export default ProductsManagement;