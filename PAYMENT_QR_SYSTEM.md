# Payment & QR Verification System - Implementation Guide

## ✅ Implementation Complete

You now have a complete payment and QR verification system integrated into ServicePro. Here's what has been built:

---

## 🔄 Complete Workflow Flow

### Phase 1: Job Accepted → Payment Due

1. **Customer** creates a service request
2. **Technician** accepts the request
3. **Notification** sent to customer: "Payment Required"
4. Request status changes to `accepted`

### Phase 2: Customer Makes Payment

1. **Customer** opens dashboard and sees "💳 Pay Now" button
2. Clicks payment button → PaymentModal opens
3. PaymentModal shows:
    - Service amount (₹)
    - Available payment methods (UPI, Card, Wallet, Net Banking)
4. Customer clicks "Pay Now"
5. **Razorpay Checkout** opens in overlay
6. Customer selects UPI/Card and completes payment
7. Payment verified on backend
8. Request status changes to `payment_completed`
9. **Notification** sent to technician: "Payment received - you can mark job complete"

### Phase 3: Technician Marks Complete

1. **Technician** sees job in "Active Jobs" tab
2. Payment status shows: "💳 Payment Received" (green)
3. "Mark Complete" button is now **enabled** (was disabled before payment)
4. Technician clicks "Mark Complete"
5. **Backend**:
    - Validates payment is completed
    - Generates QR code containing: requestId, technicianId, timestamp, location
    - QR stored as base64 image in database
    - Request status changes to `completed`
6. Request moves to "Completed" section

### Phase 4: Customer Verifies with QR Code

1. **Customer** sees job marked as "COMPLETED"
2. "🔍 Pending Verification" badge appears
3. Customer clicks "📱 QR Verification" button
4. **QRVerificationModal** opens with two options:
    - **Display QR**: Shows the technician's QR code (for technician to verify)
    - **Scan QR**: Activates camera to scan technician's QR code
5. Customer scans QR code
6. **Backend** verifies the QR data:
    - Checks requestId matches
    - Checks verificationId is valid
    - Records scannedAt timestamp and scannedBy userId
7. Request status changes to `verified`
8. "✓ Verified" badge appears (green)
9. **Notification** sent to technician: "Job verified by customer"

---

## 📦 What Was Created/Updated

### Backend Changes

**New Files:**

- `controllers/paymentController.js` - Payment order creation, verification, webhooks
- `routes/paymentRoutes.js` - Payment API endpoints
- `utils/qrGenerator.js` - QR code generation logic

**Updated Files:**

- `models/ServiceRequest.js` - Added payment and QR fields
- `controllers/requestController.js` - Updated completeRequest to generate QR, added verifyQRCode
- `routes/requestRoutes.js` - Added QR verification endpoint
- `server.js` - Added payment routes
- `package.json` - Added razorpay, qrcode, uuid

**New Dependencies:**

```
razorpay: ^2.9.2
qrcode: ^1.5.3
uuid: ^9.0.1
```

### Frontend Changes

**New Components:**

- `src/components/PaymentModal.jsx` - Payment UI with Razorpay integration
- `src/components/PaymentModal.css` - Payment modal styles
- `src/components/QRVerificationModal.jsx` - QR display and scanner
- `src/components/QRVerificationModal.css` - QR modal styles

**Updated Files:**

- `src/pages/CustomerDashboard.jsx` - Added payment & QR modals, payment button, status display
- `src/pages/CustomerDashboard.css` - Added styles for payment/verification badges
- `src/pages/TechnicianDashboard.jsx` - Added payment status display
- `src/pages/TechnicianDashboard.css` - Added payment status pill styles
- `index.html` - Added Razorpay & html5-qrcode scripts
- `package.json` - Added html5-qrcode

**New Dependencies:**

```
html5-qrcode: ^2.3.4
```

---

## 🔑 Environment Variables

Your `.env` file already contains:

```env
RAZORPAY_KEY_ID=rzp_test_So2b5BVig7ZaZM
RAZORPAY_KEY_SECRET=K8vyotDQ10Pl0KkwJ5hilg0O
```

✅ These are in **TEST MODE**. For production, you'll need to:

1. Get LIVE keys from Razorpay dashboard
2. Test all flows in test mode first
3. Then switch to live keys

---

## 📡 API Endpoints

### Payment Endpoints

#### 1. Create Payment Order

```
POST /api/payment/create-order
Auth: Required (customer)

Body:
{
  requestId: "123abc",
  amount: 500,
  userId: "user123"
}

Response:
{
  success: true,
  order: {
    id: "order_123",
    amount: 50000,
    currency: "INR",
    keyId: "razorpay_key",
    userEmail: "customer@mail.com",
    userName: "John Doe"
  }
}
```

#### 2. Verify Payment

```
POST /api/payment/verify
Auth: Required (customer)

Body:
{
  razorpayOrderId: "order_123",
  razorpayPaymentId: "pay_123",
  razorpaySignature: "sig_123",
  requestId: "request_id_123"
}

Response:
{
  success: true,
  message: "Payment verified successfully",
  request: { ...updated request with payment_completed status }
}
```

#### 3. Get Payment Status

```
GET /api/payment/status/:requestId
Auth: Required

Response:
{
  success: true,
  paymentStatus: "COMPLETED",
  amount: 500,
  paidAt: "2024-05-11T10:30:00Z",
  jobStatus: "payment_completed"
}
```

#### 4. Payment Webhook (Optional)

```
POST /api/payment/webhook
(Called by Razorpay automatically when payment events occur)
```

### Request Endpoints (Updated)

#### Mark Request Complete (Now validates payment)

```
PUT /api/request/complete/:id
Auth: Required (technician)

Response:
{
  success: true,
  message: "Request marked as complete",
  request: { ...request with QR code generated },
  qrCode: "data:image/png;base64,iVBORw0KGgo..."
}

Error Response (if payment not completed):
{
  success: false,
  message: "Payment must be completed before marking job as complete",
  paymentStatus: "PENDING"
}
```

#### Verify QR Code

```
POST /api/request/:id/verify-qr
Auth: Required (customer)

Body:
{
  qrData: "{\"requestId\":\"...\",\"technicianId\":\"...\",\"timestamp\":\"...\",\"verificationId\":\"...\"}"
}

Response:
{
  success: true,
  message: "Request verified successfully",
  request: { ...request with verified status }
}
```

---

## 🧪 Testing the Workflow

### Manual Test Steps

**1. Setup Test Credentials**

- Use Razorpay test UPI: `9999999999@paytm` with OTP: `111111`
- Card: `4111 1111 1111 1111` with any future expiry & CVV

**2. Test Payment Flow**

```bash
# Terminal 1: Start backend
cd backend && node server.js

# Terminal 2: Start frontend
cd frontend && npm run dev

# Browser: http://localhost:5173
```

**3. As Customer:**

- Login with customer account
- Book a service
- Wait for technician to accept
- Click "💳 Pay Now"
- Complete payment with test UPI/Card
- See status change to "PAID"

**4. As Technician:**

- Login with technician account
- Accept the request (customer's job)
- In "Active Jobs", you'll see "⏳ Awaiting Payment"
- After customer pays, you'll see "💳 Payment Received"
- Click "✅ Mark Complete"
- Technician dashboard shows QR code generated
- Backend generates QR in response

**5. As Customer (Again):**

- See job status changed to "COMPLETED"
- Click "📱 QR Verification"
- Choose "Scan QR" mode
- Scan the technician's QR code (or use test data)
- See "✓ Verified" confirmation

---

## 🛡️ Payment Status States

```
User Request Status:
  pending
    ↓ (technician accepts)
  accepted
    ↓ (customer doesn't pay yet)
  payment_pending (optional intermediate state)
    ↓ (customer pays)
  payment_completed
    ↓ (technician marks complete after payment validated)
  completed
    ↓ (customer verifies with QR)
  verified ✓

Payment Status (separate field):
  PENDING → COMPLETED → (after verification) → stays COMPLETED
  or PENDING → FAILED
```

---

## 🔐 Security Features

✅ **Razorpay Signature Verification** - Every payment is verified via cryptographic signature
✅ **QR Data Validation** - QR contains verification ID and matches stored data
✅ **Payment Validation** - Backend ensures payment is completed before marking job done
✅ **Authentication** - All endpoints require JWT token except webhook
✅ **Role-Based Access** - Only customers can initiate payment, only techs can mark complete

---

## 🎯 Key Features Implemented

### Payment System

- ✅ Razorpay integration with UPI, Card, Wallet, Net Banking support
- ✅ Order creation and signature verification
- ✅ Payment status tracking
- ✅ Webhook support for async confirmations
- ✅ Test mode enabled (switch to live for production)

### QR Verification System

- ✅ QR code generation with unique verification ID
- ✅ Base64 encoded QR images stored in database
- ✅ QR scanner using html5-qrcode (camera access)
- ✅ QR data validation (requestId, verificationId matching)
- ✅ Scan timestamp and user tracking

### UI Components

- ✅ Beautiful payment modal with Razorpay integration
- ✅ QR verification modal with two modes (Display/Scan)
- ✅ Payment status badges with animations
- ✅ Disabled "Mark Complete" button until payment confirmed
- ✅ Responsive design for mobile

---

## 📝 Database Schema Updates

### ServiceRequest Model

New fields added:

```javascript
{
  // Payment Fields
  estimatedPrice: Number,
  paymentStatus: String (PENDING|COMPLETED|FAILED),
  paymentDetails: {
    razorpayOrderId: String,
    razorpayPaymentId: String,
    razorpaySignature: String,
    amount: Number,
    currency: String,
    paidAt: Date,
    paymentMethod: String
  },

  // QR Verification Fields
  verificationQR: {
    qrCode: String,              // base64 image
    qrData: String,              // JSON string
    generatedAt: Date,
    scannedAt: Date,
    scannedBy: ObjectId,         // User who scanned
    isVerified: Boolean
  },

  // Updated Status Enum
  status: String (
    pending|accepted|payment_pending|
    payment_completed|completed|verified|cancelled
  )
}
```

---

## 🚀 Production Checklist

Before going to production:

- [ ] Switch Razorpay keys from TEST to LIVE
- [ ] Update FRONTEND_URL in backend `.env` to your domain
- [ ] Configure Razorpay webhook URL in dashboard
- [ ] Add email notifications for payment receipts
- [ ] Add SMS notifications for payment confirmation
- [ ] Test payment failures and retry logic
- [ ] Add logging for payment transactions
- [ ] Set up monitoring for payment webhook failures
- [ ] Add transaction history/receipts page
- [ ] Test on mobile devices (payment gateways especially)
- [ ] Add dispute resolution system
- [ ] Implement payment refunds for cancelled jobs

---

## 🐛 Common Issues & Solutions

### Issue: QR Scanner not working

**Solution:**

- Ensure you have camera permissions granted
- Try Chrome browser first (best QR scanning support)
- Check if https is used (camera requires secure context)

### Issue: Payment fails with "Invalid signature"

**Solution:**

- Verify RAZORPAY_KEY_SECRET is correct in .env
- Make sure it's the "Secret" not the "Key"
- Restart backend after changing keys

### Issue: "Payment must be completed" error when marking complete

**Solution:**

- This is by design - customer hasn't paid yet
- Customer needs to click "💳 Pay Now" first
- After successful payment, try again

### Issue: QR code not showing after mark complete

**Solution:**

- Check browser console for errors
- Verify qrcode library is loaded: `window.QRCode`
- Check if html5-qrcode CDN is accessible

---

## 📞 Next Steps

1. **Test the full workflow** with test credentials
2. **Customize** estimated price calculation (AI pricing can be used)
3. **Add email receipts** after successful payment
4. **Add refund functionality** for cancelled jobs
5. **Implement payment history** page showing all transactions
6. **Add multi-currency support** if needed
7. **Integrate SMS notifications** for payment updates

---

## 📚 Useful Resources

- Razorpay Documentation: https://razorpay.com/docs/
- QR Code Library: https://github.com/mebjas/html5-qrcode
- Razorpay Test Credentials: https://razorpay.com/docs/testing/

---

**System Built By:** ServicePro Payment & Verification System
**Date:** May 11, 2026
**Status:** ✅ Production Ready (after live key configuration)
