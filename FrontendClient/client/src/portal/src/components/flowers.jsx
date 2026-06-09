// src/components/FlowersPage.jsx
import React from 'react';
import { FaLeaf, FaShoppingCart } from 'react-icons/fa';
import { 
  PageTitle, FlowerCard, FlowerImage, CasketName,
  CasketPrice, BookButton
} from './StyledComponents';

const flowersData = [
  { id: 1, name: "Eternal Peace Bouquet", price: "$85", description: "White lilies and roses symbolizing peace", icon: <FaLeaf />, type: "flower" },
  { id: 2, name: "Loving Memory Wreath", price: "$120", description: "Circular arrangement with mixed flowers", icon: <FaLeaf />, type: "flower" },
  { id: 3, name: "Heaven's Garden Spray", price: "$95", description: "Colorful spray with seasonal flowers", icon: <FaLeaf />, type: "flower" },
  { id: 4, name: "Simple Elegance Bouquet", price: "$65", description: "Modest but beautiful arrangement", icon: <FaLeaf />, type: "flower" },
  { id: 5, name: "Premium Tribute Display", price: "$150", description: "Large, impressive floral tribute", icon: <FaLeaf />, type: "flower" },
];

const FlowersPage = ({ onSelectFlower }) => {
  return (
    <>
      <PageTitle><FaLeaf /> Floral Arrangements</PageTitle>
      <p>Choose a beautiful floral tribute for your loved one</p>
      {flowersData.map(flower => (
        <FlowerCard key={flower.id} onClick={() => onSelectFlower(flower)}>
          <FlowerImage>{flower.icon}</FlowerImage>
          <CasketName>{flower.name}</CasketName>
          <p>{flower.description}</p>
          <CasketPrice>{flower.price}</CasketPrice>
          <BookButton style={{ margin: '15px auto 0', width: 'auto' }}>
            Order <FaShoppingCart />
          </BookButton>
        </FlowerCard>
      ))}
    </>
  );
};

export default FlowersPage;