import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import './FlowerCustomers.css';

const FlowerCustomers = () => {
    const navigate = useNavigate();
    const [customers, setCustomers] = useState([]);
    const [filteredCustomers, setFilteredCustomers] = useState([]);
    const [searchInput, setSearchInput] = useState('');
    const [selectedRows, setSelectedRows] = useState([]);
    const [currentPage, setCurrentPage] = useState(1);
    const [totalPages, setTotalPages] = useState(1);
    const [totalResults, setTotalResults] = useState(0);
    const resultsPerPage = 20;

    // Modal states
    const [showAddModal, setShowAddModal] = useState(false);
    const [showEditModal, setShowEditModal] = useState(false);
    const [editingCustomer, setEditingCustomer] = useState(null);

    // Form states
    const [formData, setFormData] = useState({
        name: '',
        abbreviation: '',
        address: '',
        phone_number: '',
        email: ''
    });

    useEffect(() => {
        // Load sample customer data
        const sampleCustomers = [
            {
                id: 1,
                name: 'John Doe',
                abbreviation: 'JDN',
                address: '123 Main Street, Nairobi',
                phone_number: '+254 712 345 678',
                email: 'john@example.com'
            },
            {
                id: 2,
                name: 'Jane Smith',
                abbreviation: 'JNS',
                address: '456 Oak Avenue, Mombasa',
                phone_number: '+254 723 456 789',
                email: 'jane@example.com'
            },
            {
                id: 3,
                name: 'Mike Johnson',
                abbreviation: 'MJN',
                address: '789 Pine Road, Kisumu',
                phone_number: '+254 734 567 890',
                email: 'mike@example.com'
            },
            {
                id: 4,
                name: 'Sarah Williams',
                abbreviation: 'SWL',
                address: '321 Elm Street, Nakuru',
                phone_number: '+254 745 678 901',
                email: 'sarah@example.com'
            },
            {
                id: 5,
                name: 'David Brown',
                abbreviation: 'DBN',
                address: '654 Maple Drive, Eldoret',
                phone_number: '+254 756 789 012',
                email: 'david@example.com'
            }
        ];
        setCustomers(sampleCustomers);
        setFilteredCustomers(sampleCustomers);
        setTotalResults(sampleCustomers.length);
        setTotalPages(Math.ceil(sampleCustomers.length / resultsPerPage));
    }, []);

    useEffect(() => {
        let filtered = customers;

        if (searchInput) {
            filtered = customers.filter(customer =>
                customer.name.toLowerCase().includes(searchInput.toLowerCase()) ||
                customer.phone_number.includes(searchInput) ||
                customer.email.toLowerCase().includes(searchInput.toLowerCase())
            );
        }

        setFilteredCustomers(filtered);
        setTotalResults(filtered.length);
        setTotalPages(Math.ceil(filtered.length / resultsPerPage));
        setCurrentPage(1);
    }, [searchInput, customers]);

    const handleSearch = (e) => {
        e.preventDefault();
    };

    const handleRowClick = (customerId) => {
        navigate(`/tenant/flowers/order/${customerId}`);
    };

    const toggleRowSelection = (e, customerId) => {
        e.stopPropagation();
        setSelectedRows(prev => {
            if (prev.includes(customerId)) {
                return prev.filter(id => id !== customerId);
            } else {
                return [...prev, customerId];
            }
        });
    };

    const getPageData = () => {
        const start = (currentPage - 1) * resultsPerPage;
        const end = start + resultsPerPage;
        return filteredCustomers.slice(start, end);
    };

    const navigateToPage = (page) => {
        if (page >= 1 && page <= totalPages) {
            setCurrentPage(page);
        }
    };

    const openAddModal = () => {
        setFormData({
            name: '',
            abbreviation: '',
            address: '',
            phone_number: '',
            email: ''
        });
        setShowAddModal(true);
    };

    const openEditModal = () => {
        if (selectedRows.length === 0) {
            alert('Please select a customer to edit');
            return;
        }

        const selectedId = selectedRows[selectedRows.length - 1];
        const customer = customers.find(c => c.id === selectedId);

        if (customer) {
            setEditingCustomer(customer);
            setFormData({
                name: customer.name,
                abbreviation: customer.abbreviation,
                address: customer.address,
                phone_number: customer.phone_number,
                email: customer.email
            });
            setShowEditModal(true);
        }
    };

    const handleAddCustomer = (e) => {
        e.preventDefault();

        if (!formData.name || !formData.abbreviation || !formData.phone_number) {
            alert('Please fill in all required fields');
            return;
        }

        const newCustomer = {
            id: Date.now(),
            ...formData
        };

        setCustomers([...customers, newCustomer]);
        setShowAddModal(false);
        setFormData({
            name: '',
            abbreviation: '',
            address: '',
            phone_number: '',
            email: ''
        });
    };

    const handleEditCustomer = (e) => {
        e.preventDefault();

        if (!formData.name || !formData.abbreviation || !formData.phone_number) {
            alert('Please fill in all required fields');
            return;
        }

        const updatedCustomers = customers.map(customer =>
            customer.id === editingCustomer.id
                ? { ...customer, ...formData }
                : customer
        );

        setCustomers(updatedCustomers);
        setShowEditModal(false);
        setEditingCustomer(null);
    };

    const deleteCustomer = () => {
        if (selectedRows.length === 0) {
            alert('Please select a customer to delete');
            return;
        }

        if (window.confirm('Are you sure you want to delete the selected customer(s)? This cannot be undone.')) {
            const updatedCustomers = customers.filter(customer => !selectedRows.includes(customer.id));
            setCustomers(updatedCustomers);
            setSelectedRows([]);
        }
    };

    return (
        <div className="flower-customers-container">
            <div className="toolbar">
                <div className="btn-container">
                    <div className="add-customer-btn" id="add-customer-btn" onClick={openAddModal}>
                        <div>Add Customer</div>
                        <div style={{ paddingBottom: '2.5px', fontSize: '1.5rem' }}>+</div>
                    </div>
                    <button id="edit-btn" className="edit-btn" onClick={openEditModal}>Edit</button>
                    <button id="delete-btn" className="delete-btn" onClick={deleteCustomer}>Delete</button>
                </div>
                <form className="filter-group" onSubmit={handleSearch}>
                    <input
                        id="search-input"
                        className="search-input"
                        type="search"
                        placeholder="Search..."
                        value={searchInput}
                        onChange={(e) => setSearchInput(e.target.value)}
                    />
                    <button type="submit" className="search-btn">
                        <img src="../../svg/search.svg" alt="Search" />
                    </button>
                </form>
            </div>

            <div className="table-container">
                <table>
                    <thead>
                        <tr className="order-head-row">
                            <th></th>
                            <th>CUSTOMER NAME</th>
                            <th>ABBREVIATION</th>
                            <th>ADDRESS</th>
                            <th>PHONE NUMBER</th>
                            <th>EMAIL</th>
                        </tr>
                    </thead>
                    <tbody id="table-body">
                        {getPageData().map((customer) => (
                            <tr
                                key={customer.id}
                                className={`order-row ${selectedRows.includes(customer.id) ? 'selected-row' : ''}`}
                                onClick={() => handleRowClick(customer.id)}
                            >
                                <td onClick={(e) => toggleRowSelection(e, customer.id)}>
                                    <input
                                        type="checkbox"
                                        checked={selectedRows.includes(customer.id)}
                                        onChange={() => { }}
                                    />
                                </td>
                                <td className="order-column">{customer.name}</td>
                                <td className="order-column">{customer.abbreviation}</td>
                                <td className="order-column">{customer.address}</td>
                                <td className="order-column">{customer.phone_number}</td>
                                <td className="order-column">{customer.email}</td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>

            <div className="pagination">
                <div className="out-of-results">
                    {totalResults > 0
                        ? `${(currentPage - 1) * resultsPerPage + 1}-${Math.min(currentPage * resultsPerPage, totalResults)} out of ${totalResults} customers`
                        : '0 customers'}
                </div>
                <div className="pagination-navigate">
                    <div className="pagination-pages-text">
                        Page <span id="current-page">{currentPage}</span> of <span id="total-pages">{totalPages}</span>
                    </div>
                    <div className="pagination-pages-button">
                        <button onClick={() => navigateToPage(1)} disabled={currentPage === 1}>{'|<'}</button>
                        <button onClick={() => navigateToPage(currentPage - 1)} disabled={currentPage === 1}>{'<'}</button>
                    </div>
                    <div className="pagination-pages-text">
                        <input
                            type="number"
                            className="pagination-page-input"
                            value={currentPage}
                            onChange={(e) => navigateToPage(parseInt(e.target.value))}
                            min="1"
                            max={totalPages}
                        />
                    </div>
                    <div className="pagination-pages-button">
                        <button onClick={() => navigateToPage(currentPage + 1)} disabled={currentPage === totalPages}>{'>'}</button>
                        <button onClick={() => navigateToPage(totalPages)} disabled={currentPage === totalPages}>{'>|'}</button>
                    </div>
                </div>
            </div>

            {/* Add Customer Modal */}
            {showAddModal && (
                <div id="myModal" className="modal">
                    <div className="modal-content">
                        <div>
                            <button className="delete-image" onClick={() => setShowAddModal(false)}>
                                <img src="../../svg/cross.svg" alt="" />
                            </button>
                        </div>

                        <h2 className="add-new-customer">Add New Customer</h2>
                        <form onSubmit={handleAddCustomer}>
                            <div className="input-container">
                                <label htmlFor="fullname">Full Name *</label>
                                <input
                                    type="text"
                                    id="fullname"
                                    placeholder="Type full name of customer"
                                    value={formData.name}
                                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                                    required
                                />
                            </div>
                            <div className="input-container">
                                <label htmlFor="abbreviation">Abbreviation *</label>
                                <input
                                    type="text"
                                    id="abbreviation"
                                    placeholder="3-letter abbreviation"
                                    maxLength="3"
                                    value={formData.abbreviation}
                                    onChange={(e) => setFormData({ ...formData, abbreviation: e.target.value.toUpperCase() })}
                                    required
                                />
                            </div>
                            <div className="input-container">
                                <label htmlFor="address">Address</label>
                                <input
                                    type="text"
                                    id="address"
                                    placeholder="Enter the address"
                                    value={formData.address}
                                    onChange={(e) => setFormData({ ...formData, address: e.target.value })}
                                />
                            </div>
                            <div className="input-container">
                                <label htmlFor="phone-number">Phone Number *</label>
                                <input
                                    type="tel"
                                    id="phone-number"
                                    placeholder="Enter phone number"
                                    value={formData.phone_number}
                                    onChange={(e) => setFormData({ ...formData, phone_number: e.target.value })}
                                    required
                                />
                            </div>
                            <div className="input-container">
                                <label htmlFor="email">Email</label>
                                <input
                                    type="email"
                                    id="email"
                                    placeholder="Enter email address"
                                    value={formData.email}
                                    onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                                />
                            </div>
                            <button type="submit" id="addButton">Add Customer</button>
                        </form>
                    </div>
                </div>
            )}

            {/* Edit Customer Modal */}
            {showEditModal && (
                <div id="editModal" className="modal">
                    <div className="modal-content">
                        <div>
                            <button className="delete-image" onClick={() => setShowEditModal(false)}>
                                <img src="../../svg/cross.svg" alt="" />
                            </button>
                        </div>

                        <h2 className="add-new-customer">Edit Customer</h2>
                        <form onSubmit={handleEditCustomer}>
                            <div className="input-container">
                                <label htmlFor="edit-modal-name">Full Name *</label>
                                <input
                                    type="text"
                                    id="edit-modal-name"
                                    placeholder="Type full name of customer"
                                    value={formData.name}
                                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                                    required
                                />
                            </div>
                            <div className="input-container">
                                <label htmlFor="edit-modal-abbreviation">Abbreviation *</label>
                                <input
                                    type="text"
                                    id="edit-modal-abbreviation"
                                    placeholder="3-letter abbreviation"
                                    maxLength="3"
                                    value={formData.abbreviation}
                                    onChange={(e) => setFormData({ ...formData, abbreviation: e.target.value.toUpperCase() })}
                                    required
                                />
                            </div>
                            <div className="input-container">
                                <label htmlFor="edit-modal-address">Address</label>
                                <input
                                    type="text"
                                    id="edit-modal-address"
                                    placeholder="Enter the address"
                                    value={formData.address}
                                    onChange={(e) => setFormData({ ...formData, address: e.target.value })}
                                />
                            </div>
                            <div className="input-container">
                                <label htmlFor="edit-modal-phone-number">Phone Number *</label>
                                <input
                                    type="tel"
                                    id="edit-modal-phone-number"
                                    placeholder="Enter phone number"
                                    value={formData.phone_number}
                                    onChange={(e) => setFormData({ ...formData, phone_number: e.target.value })}
                                    required
                                />
                            </div>
                            <div className="input-container">
                                <label htmlFor="edit-modal-email">Email</label>
                                <input
                                    type="email"
                                    id="edit-modal-email"
                                    placeholder="Enter email address"
                                    value={formData.email}
                                    onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                                />
                            </div>
                            <button type="submit" id="editSaveButton">Save Changes</button>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
};

export default FlowerCustomers;