import React, { useState } from 'react';
import styled from 'styled-components';
import { Heart, ShoppingCart, Search, X } from 'lucide-react';

const Colors = {
  primaryDark: '#0a0e27',
  accentGreen: '#22c55e',
  darkGreen: '#16a34a',
  white: '#FFFFFF',
  lightGray: '#f3f4f6',
  mediumGray: '#e5e7eb',
  darkGray: '#6b7280',
  successGreen: '#22c55e',
  dangerRed: '#ef4444',
};

const Container = styled.div`
  padding: 0.5rem;
  background: linear-gradient(135deg, #0a0e27 0%, #1a1f3a 50%, #0f1626 100%);
  min-height: 100vh;
`;

const Header = styled.div`
  background: rgba(10, 14, 39, 0.8);
  backdrop-filter: blur(10px);
  padding: 1rem;
  border-bottom: 1px solid rgba(34, 197, 94, 0.2);
  margin-bottom: 1rem;
`;

const HeaderTitle = styled.h1`
  color: ${Colors.white};
  font-size: 1.8rem;
  margin-bottom: 1rem;
  text-align: center;
  font-weight: 700;

  &::after {
    content: '';
    display: block;
    width: 60px;
    height: 3px;
    background: linear-gradient(90deg, #22c55e 0%, #16a34a 100%);
    margin: 0.5rem auto 0;
    border-radius: 2px;
  }
`;

const SearchSection = styled.div`
  background: rgba(255, 255, 255, 0.05);
  padding: 0.8rem;
  border-radius: 12px;
  margin-bottom: 1rem;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.3);
  border: 1px solid rgba(34, 197, 94, 0.2);
`;

const SearchInput = styled.input`
  width: 100%;
  padding: 0.7rem;
  border: 1px solid rgba(34, 197, 94, 0.3);
  border-radius: 25px;
  font-size: 0.9rem;
  background: rgba(255, 255, 255, 0.1);
  color: ${Colors.white};

  &:focus {
    border-color: ${Colors.successGreen};
    outline: none;
    background: rgba(255, 255, 255, 0.15);
  }

  &::placeholder {
    color: rgba(255, 255, 255, 0.5);
  }
`;

const CategoryTabs = styled.div`
  display: flex;
  gap: 0.5rem;
  margin-bottom: 1rem;
  overflow-x: auto;
  padding-bottom: 0.5rem;

  &::-webkit-scrollbar {
    height: 4px;
  }

  &::-webkit-scrollbar-thumb {
    background: rgba(34, 197, 94, 0.3);
    border-radius: 2px;
  }
`;

const CategoryTab = styled.button`
  padding: 0.6rem 1rem;
  border: 2px solid ${props => props.active ? Colors.successGreen : 'rgba(34, 197, 94, 0.3)'};
  background: ${props => props.active ? 'rgba(34, 197, 94, 0.2)' : 'transparent'};
  color: ${props => props.active ? Colors.successGreen : Colors.darkGray};
  border-radius: 20px;
  font-size: 0.85rem;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.3s ease;
  white-space: nowrap;
  flex-shrink: 0;

  &:hover {
    border-color: ${Colors.successGreen};
    color: ${Colors.successGreen};
  }
`;

const ProductsGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: 0.8rem;
`;

const ProductCard = styled.div`
  background: linear-gradient(135deg, #1a1f3a 0%, #0f1626 100%);
  border-radius: 12px;
  overflow: hidden;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.3);
  transition: all 0.3s ease;
  border: 1px solid rgba(34, 197, 94, 0.2);
  display: flex;
  flex-direction: column;

  &:hover {
    transform: translateY(-4px);
    box-shadow: 0 8px 16px rgba(34, 197, 94, 0.2);
    border-color: rgba(34, 197, 94, 0.4);
  }
`;

const ProductImage = styled.div`
  width: 100%;
  height: 140px;
  background: linear-gradient(135deg, rgba(34, 197, 94, 0.1), rgba(22, 163, 74, 0.1));
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 3rem;
  color: rgba(34, 197, 94, 0.3);
`;

const ProductContent = styled.div`
  padding: 1rem;
  flex-grow: 1;
  display: flex;
  flex-direction: column;
`;

const ProductName = styled.h3`
  color: ${Colors.white};
  font-size: 0.95rem;
  font-weight: 700;
  margin-bottom: 0.5rem;
`;

const ProductDescription = styled.p`
  color: ${Colors.darkGray};
  font-size: 0.75rem;
  margin-bottom: 0.5rem;
  flex-grow: 1;
`;

const ProductFooter = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  gap: 0.5rem;
`;

const ProductPrice = styled.div`
  color: ${Colors.successGreen};
  font-size: 1rem;
  font-weight: 700;
`;

const ProductActions = styled.div`
  display: flex;
  gap: 0.4rem;
`;

const ActionButton = styled.button`
  padding: 0.5rem;
  border: none;
  border-radius: 8px;
  cursor: pointer;
  transition: all 0.2s ease;
  display: flex;
  align-items: center;
  justify-content: center;
  background: ${props => props.type === 'like' ? 
    (props.liked ? Colors.dangerRed : 'rgba(34, 197, 94, 0.1)') : 
    'rgba(34, 197, 94, 0.2)'};
  color: ${props => props.type === 'like' ? 
    (props.liked ? Colors.white : Colors.darkGray) : 
    Colors.successGreen};

  &:hover {
    background: ${props => props.type === 'like' ? 
      (props.liked ? '#dc2626' : 'rgba(34, 197, 94, 0.3)') : 
      'rgba(34, 197, 94, 0.3)'};
  }

  svg {
    width: 16px;
    height: 16px;
  }
`;

const EmptyState = styled.div`
  text-align: center;
  padding: 2rem;
  color: ${Colors.darkGray};
`;

const CartBadge = styled.div`
  position: fixed;
  bottom: 70px;
  right: 1rem;
  background: ${Colors.successGreen};
  color: ${Colors.primaryDark};
  width: 50px;
  height: 50px;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  font-weight: 700;
  font-size: 1.2rem;
  box-shadow: 0 4px 12px rgba(34, 197, 94, 0.4);
  cursor: pointer;
  transition: all 0.3s ease;

  &:hover {
    transform: scale(1.1);
  }
`;

// Sample marketplace products
const PRODUCTS = [
  {
    id: 1,
    name: 'Casket - Premium Oak',
    category: 'caskets',
    price: '$2,500',
    description: 'Handcrafted premium oak casket',
    emoji: '⚰️'
  },
  {
    id: 2,
    name: 'Flowers - Rose Bundle',
    category: 'flowers',
    price: '$150',
    description: 'Fresh red rose arrangement',
    emoji: '🌹'
  },
  {
    id: 3,
    name: 'Memorial Service',
    category: 'services',
    price: '$800',
    description: 'Complete memorial planning',
    emoji: '🕯️'
  },
  {
    id: 4,
    name: 'Casket - Mahogany',
    category: 'caskets',
    price: '$3,200',
    description: 'Elegant mahogany wood casket',
    emoji: '⚰️'
  },
  {
    id: 5,
    name: 'Flowers - Mixed Bundle',
    category: 'flowers',
    price: '$200',
    description: 'Seasonal mixed flower arrangement',
    emoji: '💐'
  },
  {
    id: 6,
    name: 'Transportation Service',
    category: 'services',
    price: '$500',
    description: 'Professional hearse & vehicle',
    emoji: '🚗'
  },
  {
    id: 7,
    name: 'Casket - Metal Standard',
    category: 'caskets',
    price: '$1,800',
    description: 'Standard metal casket',
    emoji: '⚰️'
  },
  {
    id: 8,
    name: 'Keepsake Urn',
    category: 'urns',
    price: '$350',
    description: 'Small memorial keepsake urn',
    emoji: '🏺'
  },
];

const CATEGORIES = [
  { id: 'all', label: 'All Items' },
  { id: 'caskets', label: 'Caskets' },
  { id: 'flowers', label: 'Flowers' },
  { id: 'services', label: 'Services' },
  { id: 'urns', label: 'Urns' },
];

const MarketplacePage = ({ onLogout }) => {
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [likedProducts, setLikedProducts] = useState({});
  const [cartItems, setCartItems] = useState([]);
  const [searchQuery, setSearchQuery] = useState('');

  const filteredProducts = PRODUCTS.filter(product => {
    const matchesCategory = selectedCategory === 'all' || product.category === selectedCategory;
    const matchesSearch = product.name.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesCategory && matchesSearch;
  });

  const toggleLike = (productId) => {
    setLikedProducts(prev => ({
      ...prev,
      [productId]: !prev[productId]
    }));
  };

  const addToCart = (product) => {
    setCartItems(prev => [...prev, product]);
  };

  return (
    <Container>
      <Header>
        <HeaderTitle>Funeral Marketplace</HeaderTitle>
        <SearchSection>
          <SearchInput
            type="text"
            placeholder="Search products..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </SearchSection>
      </Header>

      <CategoryTabs>
        {CATEGORIES.map(category => (
          <CategoryTab
            key={category.id}
            active={selectedCategory === category.id}
            onClick={() => setSelectedCategory(category.id)}
          >
            {category.label}
          </CategoryTab>
        ))}
      </CategoryTabs>

      {filteredProducts.length > 0 ? (
        <ProductsGrid>
          {filteredProducts.map(product => (
            <ProductCard key={product.id}>
              <ProductImage>{product.emoji}</ProductImage>
              <ProductContent>
                <ProductName>{product.name}</ProductName>
                <ProductDescription>{product.description}</ProductDescription>
                <ProductFooter>
                  <ProductPrice>{product.price}</ProductPrice>
                  <ProductActions>
                    <ActionButton
                      type="like"
                      liked={likedProducts[product.id]}
                      onClick={() => toggleLike(product.id)}
                      title="Add to favorites"
                    >
                      <Heart fill={likedProducts[product.id] ? 'currentColor' : 'none'} />
                    </ActionButton>
                    <ActionButton
                      onClick={() => addToCart(product)}
                      title="Add to cart"
                    >
                      <ShoppingCart />
                    </ActionButton>
                  </ProductActions>
                </ProductFooter>
              </ProductContent>
            </ProductCard>
          ))}
        </ProductsGrid>
      ) : (
        <EmptyState>
          <p>No products found. Try a different search or category.</p>
        </EmptyState>
      )}

      {cartItems.length > 0 && (
        <CartBadge title={`${cartItems.length} items in cart`}>
          {cartItems.length}
        </CartBadge>
      )}
    </Container>
  );
};

export default MarketplacePage;
