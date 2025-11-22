import React, { useState, useEffect } from 'react';
import { useSelector } from 'react-redux';

import axios from 'axios';



// --- Mock Backend Function (Replace with actual API call) ---
const createRazorpayOrder = async (amountInPaise, token) => {
    // This is a placeholder for your backend API call.
    try {
        console.log(`Mocking backend order creation for amount: ${amountInPaise / 100}`);
        // In a real application, replace this mock return with: return response.data.order_id;
        return `order_MOCKID_${Date.now()}`;
    } catch (error) {
        console.error("Backend Order Creation Failed:", error);
  // toast removed
        throw new Error("Order initialization failed.");
    }
};

const paymentOptions = [
  { label: 'Cards', icon: '💳' },
  { label: 'Net Banking', icon: '🏦' },
  { label: 'UPI', icon: '📱' },
  { label: 'Paypal', icon: '🅿️' },
];

const Payment = () => {
    // Note: Assuming amount is in standard currency units (e.g., USD/INR)
    const [selectedOption, setSelectedOption] = useState('Cards');
  // Get cart items from Redux
  const items = useSelector(state => state.cart);
  // Calculate total from cart
  const subTotal = items.reduce((total, item) => total + item.qty * item.price, 0);
  const deliveryFee = 20;
  const taxes = subTotal * 0.5 / 100;
  const total = Math.floor(subTotal + deliveryFee + taxes);
  const [amount, setAmount] = useState(total);
    const [loading, setLoading] = useState(false);
    
    // Cards form state 
    const [cardNo, setCardNo] = useState('');
    const [expiry, setExpiry] = useState('');
    const [cvv, setCvv] = useState('');

    // Net Banking form state
    const [accountNumber, setAccountNumber] = useState('');
    const [holderName, setHolderName] = useState('');
    const [bank, setBank] = useState('');

    // UPI form state
    const [upiId, setUpiId] = useState('');
    
  // --- Razorpay Checkout Handler ---

  // Keep amount in sync with cart total
  useEffect(() => {
    setAmount(total);
  }, [total]);
    const handlePay = async (e) => {
        e.preventDefault();
        if (loading) return;

        // 🚨 Runtime Check for Razorpay SDK 
        if (typeof window.Razorpay === 'undefined') {
            // toast removed
            return;
        }

        setLoading(true);
        const amountInPaise = amount * 100; // Razorpay requires amount in smallest unit (paise)

        // Gather Data based on selected option for logging (optional, but good practice)
        let paymentData = { method: selectedOption };
        if (isCardsSelected) paymentData = { ...paymentData, cardNo, expiry };
        else if (isUpiSelected) paymentData = { ...paymentData, upiId };
        
        console.log("Attempting payment with:", paymentData);


        try {
            // 1. Get Order ID from Mock Backend
            const order_id = await createRazorpayOrder(amountInPaise, null); 
            
            // 2. Define Payment Options
            const options = {
                key: 'rzp_test_XXXXXXXXXXXXXX', // Replace with your actual Test/Live Key ID
                amount: amountInPaise, 
                currency: "INR", 
                name: "Food Ordering Service",
                description: "Payment for Order #12345",
                order_id: order_id, 
                handler: function (response) {
                    // This executes on successful payment
                    // toast removed
                    console.log("Payment verification needed:", response); 
                },
                prefill: {
                    name: "Customer Name", 
                    email: "customer@example.com"
                },
                theme: {
                    color: "#00A63E" // Use your primary green theme color
                }
            };
            
            // 3. Open Razorpay Window
            const rzp = new window.Razorpay(options);
            rzp.on('payment.failed', function (response) {
                // toast removed
                console.error("Payment Failed:", response.error);
            });
            rzp.open();

        } catch (error) {
            // Error already handled inside createRazorpayOrder
        } finally {
            setLoading(false);
        }
    };

    const isNetBankingSelected = selectedOption === 'Net Banking';
    const isCardsSelected = selectedOption === 'Cards';
    const isUpiSelected = selectedOption === 'UPI';

    return (
      <div className="flex min-h-screen bg-orange-200 items-center justify-center font-inter">
        <div className="flex flex-col md:flex-row gap-8 w-full max-w-4xl p-4">
          {/* Payment Options Card (Left) */}
          <div className="bg-orange-300 rounded-xl shadow-2xl p-8 w-full max-w-sm mx-auto">
            <div className="flex items-center gap-2 mb-6 border-b pb-4">
              <div className="w-10 h-10 rounded-full bg-black flex items-center justify-center">
                <span className="text-black text-xl font-bold">A</span>
              </div>
              <span className="text-lg font-semibold text-gray-800">Complete Payment</span>
            </div>
            
            <div className="mb-6">
              <label className="block text-gray-600 mb-1">Total Amount</label>
              <div className="text-3xl font-bold text-gray-800: text-black">Rs {total}</div>
            </div>
            
            <div className="mb-4">
              <label className="block text-gray-900 mb-3 font-medium">Select payment method</label>
              <div className="flex flex-col gap-2">
                {paymentOptions.map(opt => (
                  <label key={opt.label} className={`flex items-center gap-3 px-3 py-3 rounded-xl cursor-pointer transition-all ${selectedOption === opt.label ? 'bg-orange-100 border border-emerald-400 shadow-sm' : 'bg-gray-100'}`}
                    onClick={() => setSelectedOption(opt.label)}>
                    <span className="text-xl">{opt.icon}</span>
                    <span className="flex-1 text-gray-700 font-medium">{opt.label}</span>
                    <input type="radio" name="payment" checked={selectedOption === opt.label} readOnly className="accent-emerald-600" />
                  </label>
                ))}
              </div>
            </div>
          </div>

          {/* Dynamic Payment Form (Right) */}
          <div className="w-full max-w-md mx-auto">
            
            {/* Net Banking Form */}
            {isNetBankingSelected && (
              <form className="bg-orange-300 rounded-xl shadow-2xl p-8 space-y-4" onSubmit={handlePay}>
                <div className="flex items-center gap-2 mb-6 border-b pb-3">
                  <span className="text-2xl">🏦</span>
                  <span className="text-xl font-bold text-emerald-700">Net Banking</span>
                </div>
                
                <p className="text-sm text-gray-500">You will be redirected to your bank's portal for authentication.</p>
                
                {/* Form elements for Net Banking (kept simple) */}
                <div>
                  <label className="block text-gray-700 mb-1">Account Number</label>
                  <input type="text" value={accountNumber} onChange={(e) => setAccountNumber(e.target.value)} placeholder="5100 5422 3211 2544" className="w-full px-4 py-2 rounded-lg border border-gray-300 focus:outline-none focus:ring-2 focus:ring-emerald-400 bg-gray-50" required />
                </div>
                <div>
                  <label className="block text-gray-700 mb-1">Account Holder Name</label>
                  <input type="text" value={holderName} onChange={(e) => setHolderName(e.target.value)} placeholder="John Doe" className="w-full px-4 py-2 rounded-lg border border-gray-300 focus:outline-none focus:ring-2 focus:ring-emerald-400 bg-gray-50" required />
                </div>
                <div>
                  <label className="block text-gray-700 mb-1">Bank</label>
                  <input type="text" value={bank} onChange={(e) => setBank(e.target.value)} placeholder="HDFC Bank" className="w-full px-4 py-2 rounded-lg border border-gray-300 focus:outline-none focus:ring-2 focus:ring-emerald-400 bg-gray-50" required />
                </div>
              </form>
            )}
            
            {/* Cards Form */}
            {isCardsSelected && (
              <form className="bg-orange-300 rounded-xl shadow-2xl p-8 space-y-4" onSubmit={handlePay}>
                <div className="flex items-center gap-2 mb-6 border-b pb-3">
                  <span className="text-2xl">💳</span>
                  <span className="text-xl font-bold text-emerald-700">Card Details</span>
                </div>
                <p className="text-sm text-gray-500">Secure payment via Razorpay.</p>
                
                {/* Simplified Card form fields */}
                <div><label className="block text-gray-700 mb-1">Card Number</label><input type="text" value={cardNo} onChange={(e) => setCardNo(e.target.value)} placeholder="xxxx xxxx xxxx xxxx" className="w-full px-4 py-2 rounded-lg border border-gray-300 bg-gray-50" required /></div>
                <div className="flex gap-4">
                  <div className="w-1/2"><label className="block text-gray-700 mb-1">Expiry (MM/YY)</label><input type="text" value={expiry} onChange={(e) => setExpiry(e.target.value)} placeholder="MM/YY" className="w-full px-4 py-2 rounded-lg border border-gray-300 bg-gray-50" required /></div>
                  <div className="w-1/2"><label className="block text-gray-700 mb-1">CVV</label><input type="text" value={cvv} onChange={(e) => setCvv(e.target.value)} placeholder="123" className="w-full px-4 py-2 rounded-lg border border-gray-300 bg-gray-50" required /></div>
                </div>
              </form>
            )}
            
            {/* UPI Form */}
             {isUpiSelected && (
              <form className="bg-orange-300 rounded-xl shadow-2xl p-8 space-y-4" onSubmit={handlePay}>
                <div className="flex items-center gap-2 mb-6 border-b pb-3">
                  <span className="text-2xl">📱</span>
                  <span className="text-xl font-bold text-emerald-700">UPI/QR Code</span>
                </div>
                <p className="text-sm text-gray-500">Enter your VPA (Virtual Payment Address).</p>
                
                <div>
                  <label className="block text-gray-700 mb-1">UPI ID</label>
                  <input type="text" value={upiId} onChange={(e) => setUpiId(e.target.value)} placeholder="yourupi@bank" className="w-full px-4 py-2 rounded-lg border border-gray-300 bg-gray-50" required />
                </div>
              </form>
            )}
            
            {/* Submit Button (Outside dynamic form for clean handling) */}
            <div className="mt-6">
                <button
                    type={isNetBankingSelected || isCardsSelected || isUpiSelected ? "submit" : "button"}
                    onClick={!isNetBankingSelected && !isCardsSelected && !isUpiSelected ? handlePay : () => {}} // Only call handlePay if a form is NOT selected
                    disabled={loading}
                    className={`w-full py-3 rounded-xl shadow-lg text-black font-semibold transition-all text-lg flex items-center justify-center space-x-2 ${loading ? 'bg-orange-400 cursor-not-allowed' : 'bg-orange-400 hover:bg-orange-700'}`}
                >
                    {loading ? 'Initializing...' : `Pay Rs ${total}`}
                </button>
            </div>
          </div>
        </div>
      </div>
    );
};

export default Payment;