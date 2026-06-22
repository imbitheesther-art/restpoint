import React, { useState } from "react";
import axios from "axios";
import { getTenantHeaders, buildUrl } from "../../../api/endpoints";
import { ENDPOINTS } from "../../../api/endpoints";

const API_URL = buildUrl('marketplace', '');

const ProductModal = ({ product, onClose, onSave }) => {
  const [formData, setFormData] = useState(product || {
    name: "",
    price: "",
    description: "",
    category: "",
    quantity: 1,
  });
  const [image, setImage] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(null);

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    setSuccess(null);

    try {
      const formDataObj = new FormData();
      Object.keys(formData).forEach(key => {
        formDataObj.append(key, formData[key]);
      });
      if (image) formDataObj.append("image", image);

      let response;
      if (product?.id) {
        response = await axios.put(`${API_URL}/${product.id}`, formData, {
          headers: { ...getTenantHeaders(), "Content-Type": "application/json" }
        });
        setSuccess("Product updated successfully!");
      } else {
        response = await axios.post(API_URL, formData, {
          headers: { ...getTenantHeaders(), "Content-Type": "application/json" }
        });
        setSuccess("Product created successfully!");
      }
      if (onSave) onSave(response.data);
      setTimeout(() => onClose && onClose(), 1500);
    } catch (err) {
      setError(err.response?.data?.message || "Operation failed");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="modal-overlay">
      <div className="modal-content">
        <h2>{product ? "Edit Product" : "Add Product"}</h2>
        {error && <p className="error">{error}</p>}
        {success && <p className="success">{success}</p>}
        <form onSubmit={handleSubmit}>
          <input name="name" placeholder="Product Name" value={formData.name} onChange={handleChange} required />
          <input name="price" type="number" placeholder="Price" value={formData.price} onChange={handleChange} required />
          <textarea name="description" placeholder="Description" value={formData.description} onChange={handleChange} />
          <input name="category" placeholder="Category" value={formData.category} onChange={handleChange} />
          <input name="quantity" type="number" placeholder="Quantity" value={formData.quantity} onChange={handleChange} />
          <input type="file" onChange={(e) => setImage(e.target.files[0])} />
          <div className="modal-actions">
            <button type="submit" disabled={loading}>{loading ? "Saving..." : "Save"}</button>
            <button type="button" onClick={onClose}>Cancel</button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default ProductModal;