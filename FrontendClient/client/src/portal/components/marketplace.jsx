// src/components/CasketsPage.jsx
import React from 'react';
import { FaCouch, FaLeaf, FaChevronRight } from 'react-icons/fa';
import { 
  PageTitle, CasketCard, CasketImage, CasketInfo,
  CasketName, CasketPrice, BookButton
} from './StyledComponents';

const casketsData = [
  { id: 1, name: "Classic Oak Casket", price: "$1,200", description: "Traditional oak casket with brass fittings", icon: <FaCouch />, type: "casket" },
  { id: 2, name: "Mahogany Premium", price: "$2,500", description: "Luxurious mahogany with velvet interior", icon: <FaCouch />, type: "casket" },
  { id: 3, name: "Eco-Friendly Willow", price: "$900", description: "Environmentally friendly woven willow casket", icon: <FaLeaf />, type: "casket" },
  { id: 4, name: "Steel Protection", price: "$1,800", description: "Protective steel casket with sealing mechanism", icon: <FaCouch />, type: "casket" },
  { id: 5, name: "Pine Simplicity", price: "$750", description: "Simple yet dignified pine wood casket", icon: <FaCouch />, type: "casket" },
];

const CasketsPage = ({ onSelectCasket }) => {
  return (
    <>
      <PageTitle><FaCouch /> Available Caskets</PageTitle>
      <p>Select a dignified resting place for your loved one</p>
      {casketsData.map(casket => (
        <CasketCard key={casket.id} onClick={() => onSelectCasket(casket)}>
          <CasketImage>{casket.icon}</CasketImage>
          <CasketInfo>
            <CasketName>{casket.name}</CasketName>
            <p>{casket.description}</p>
            <CasketPrice>{casket.price}</CasketPrice>
          </CasketInfo>
          <BookButton>
            Select <FaChevronRight />
          </BookButton>
        </CasketCard>
      ))}
    </>
  );
};

export default CasketsPage;