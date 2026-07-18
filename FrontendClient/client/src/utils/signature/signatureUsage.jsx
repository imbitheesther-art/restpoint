import React, { useRef, useState } from 'react';
import ReusableSignaturePad from './components/SignaturePad';

const ContractForm = () => {
  const sigPadRef = useRef(null);
  const [signatureData, setSignatureData] = useState(null);

  const handleSaveSignature = (dataUrl) => {
    setSignatureData(dataUrl);
    console.log("Signature saved for API submission:", dataUrl.substring(0, 50) + '...');
  };

  const handleSubmitForm = async (e) => {
    e.preventDefault();

    // Validate signature
    if (sigPadRef.current?.isEmpty()) {
      alert("Please provide your signature before submitting.");
      return;
    }

    // Get trimmed data URL for your API payload
    const signaturePayload = sigPadRef.current.toDataURL(); 
    // OR get the blob for multipart/form-data:
    // sigPadRef.current.toBlob((blob) => { ... formData.append('signature', blob) }, 'image/png');

    const formData = {
      contractId: 'CT-9912',
      signature: signaturePayload,
    };

    // await api.post('/contracts/sign', formData);
    alert("Form submitted successfully!");
  };

  return (
    <form onSubmit={handleSubmitForm} style={{ maxWidth: 600, margin: '0 auto' }}>
      <h2>Sign Your Contract</h2>
      <p>Please sign below to accept the terms.</p>

      <div style={{ marginBottom: '1.5rem' }}>
        <ReusableSignaturePad
          ref={sigPadRef}
          penColor="#0f172a"
          placeholder="John Doe"
          onSave={handleSaveSignature}
          onChange={(val) => setSignatureData(val)} // Live update local state
        />
      </div>

      {/* Preview the saved signature */}
      {signatureData && (
        <div style={{ marginBottom: '1rem', padding: '1rem', border: '1px dashed #ccc', textAlign: 'center' }}>
          <p style={{ fontSize: '0.8rem', color: '#666', margin: '0 0 0.5rem' }}>Signature Preview:</p>
          <img 
            src={signatureData} 
            alt="Signature Preview" 
            style={{ maxHeight: 80, filter: 'drop-shadow(0px 1px 2px rgba(0,0,0,0.1))' }} 
          />
        </div>
      )}

      <button type="submit" style={{ padding: '0.6rem 1.5rem', background: '#266b52', color: '#fff', border: 'none', borderRadius: '4px', cursor: 'pointer' }}>
        Submit Contract
      </button>
    </form>
  );
};

export default ContractForm;