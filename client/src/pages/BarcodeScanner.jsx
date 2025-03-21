import { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import { Html5QrcodeScanner } from 'html5-qrcode';

const BarcodeScanner = () => {
  const [scanning, setScanning] = useState(false);
  const [scanResult, setScanResult] = useState(null);
  const [medicine, setMedicine] = useState(null);
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(false);
  const scannerRef = useRef(null);
  const navigate = useNavigate();

  // Initialize the scanner
  useEffect(() => {
    if (!scanning && !scanResult) {
      const scanner = new Html5QrcodeScanner('reader', {
        qrbox: {
          width: 250,
          height: 250,
        },
        fps: 5,
      });

      scanner.render(onScanSuccess, onScanFailure);
      setScanning(true);
      scannerRef.current = scanner;
    }

    // Clean up
    return () => {
      if (scannerRef.current && scanning) {
        try {
          scannerRef.current.clear();
        } catch (error) {
          console.error('Failed to clear scanner', error);
        }
      }
    };
  }, [scanning, scanResult]);

  // Handle successful scan
  const onScanSuccess = async (decodedText) => {
    try {
      // Stop scanning
      if (scannerRef.current) {
        scannerRef.current.clear();
      }
      setScanning(false);
      setScanResult(decodedText);
      setLoading(true);
      setError(null);

      // Search for medicine with the scanned barcode
      const response = await axios.get(`/medicines/barcode/${decodedText}`);
      setMedicine(response.data);
      setLoading(false);
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to find medicine with this barcode');
      setLoading(false);
    }
  };

  // Handle scan failure
  const onScanFailure = (error) => {
    console.warn(`Scan failure: ${error}`);
  };

  // Reset scanner
  const handleReset = () => {
    setScanResult(null);
    setMedicine(null);
    setError(null);
    setScanning(false);
  };

  // Navigate to medicine details
  const handleViewDetails = () => {
    navigate(`/medicines/${medicine._id}`);
  };

  // Navigate to add transaction
  const handleTransaction = () => {
    navigate(`/medicines/${medicine._id}?action=transaction`);
  };

  return (
    <div className="max-w-xl mx-auto">
      <h1 className="text-3xl font-bold mb-6">Barcode Scanner</h1>
      
      {!scanResult && (
        <div className="bg-white p-6 rounded-lg shadow-md mb-6">
          <h2 className="text-xl font-semibold mb-4">Scan a Barcode</h2>
          <div id="reader" className="w-full"></div>
          <p className="mt-4 text-sm text-gray-500">
            Position the barcode in front of your camera to scan it.
          </p>
        </div>
      )}

      {loading && (
        <div className="flex justify-center items-center h-32">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
        </div>
      )}

      {error && (
        <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4" role="alert">
          <span className="block">{error}</span>
          <button 
            onClick={handleReset}
            className="mt-2 bg-red-600 text-white py-1 px-3 rounded text-sm"
          >
            Try Again
          </button>
        </div>
      )}

      {medicine && (
        <div className="bg-white p-6 rounded-lg shadow-md">
          <h2 className="text-xl font-semibold mb-4">Medicine Found</h2>
          
          <div className="mb-6">
            <div className="bg-gray-100 p-4 rounded-lg">
              <p className="text-sm text-gray-500 mb-1">Barcode</p>
              <p className="font-medium">{scanResult}</p>
            </div>
          </div>
          
          <div className="space-y-4 mb-6">
            <div className="flex justify-between">
              <p className="text-gray-600">Name:</p>
              <p className="font-medium">{medicine.name}</p>
            </div>
            <div className="flex justify-between">
              <p className="text-gray-600">Manufacturer:</p>
              <p>{medicine.manufacturer}</p>
            </div>
            <div className="flex justify-between">
              <p className="text-gray-600">Category:</p>
              <p>{medicine.category}</p>
            </div>
            <div className="flex justify-between">
              <p className="text-gray-600">Batch Number:</p>
              <p>{medicine.batchNumber}</p>
            </div>
            <div className="flex justify-between">
              <p className="text-gray-600">Expiry Date:</p>
              <p>{new Date(medicine.expiryDate).toLocaleDateString()}</p>
            </div>
            <div className="flex justify-between">
              <p className="text-gray-600">Quantity:</p>
              <p>{medicine.quantity}</p>
            </div>
            <div className="flex justify-between">
              <p className="text-gray-600">Price:</p>
              <p>${medicine.price.toFixed(2)}</p>
            </div>
          </div>
          
          <div className="flex gap-4 mt-6">
            <button
              onClick={handleViewDetails}
              className="flex-1 bg-blue-600 hover:bg-blue-700 text-white py-2 px-4 rounded"
            >
              View Details
            </button>
            <button
              onClick={handleTransaction}
              className="flex-1 bg-green-600 hover:bg-green-700 text-white py-2 px-4 rounded"
            >
              Add Transaction
            </button>
            <button
              onClick={handleReset}
              className="flex-1 bg-gray-300 hover:bg-gray-400 text-gray-800 py-2 px-4 rounded"
            >
              Scan Again
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default BarcodeScanner; 