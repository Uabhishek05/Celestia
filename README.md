# Celestia Premium

Modern full-stack accessories e-commerce scaffold with a premium storefront, admin dashboard, Node/Express backend, MongoDB models, and Stripe-ready checkout wiring.

## Structure

```text
frontend/
  src/
    components/
      common/
      home/
      layout/
      product/
    context/
    data/
    hooks/
    pages/
    utils/
backend/
  config/
  controllers/
  middleware/
  models/
  routes/
  utils/
```

## Frontend stack

- React + Vite
- Tailwind CSS
- React Router
- Context API
- Framer Motion
- React Hot Toast

## Backend stack

- Node.js + Express
- MongoDB + Mongoose
- JWT authentication
- Stripe checkout session flow
- Cloudinary config scaffold

## Core storefront features

- Premium landing page with hero, trending, categories, best sellers, reviews, Instagram-style feed, newsletter, and responsive footer
- Category pages with filtering and price sorting
- Product details with gallery, pricing, stock, rating, wishlist, add to cart, buy now, and related products
- Cart and checkout flow with coupon input and payment options
- Authentication, profile, and order history UI
- Wishlist, search, dark mode, lazy-loaded images, SEO metadata, skeleton component, and toast notifications
- Admin dashboard overview, product/order/user/coupon sections, and analytics cards

## Environment

Create these files before running:

- `backend/.env`
- `frontend/.env`

### `backend/.env`

Use [backend/.env.example](/home/uabhishek05/Desktop/Celestia/backend/.env.example) as the starting point.

### `frontend/.env`

```bash
VITE_API_URL=http://localhost:5000/api
VITE_STRIPE_PUBLISHABLE_KEY=pk_test_your_key
```

## Local development

Install dependencies in each app:

```bash
cd frontend
npm install
npm run dev
```

```bash
cd backend
npm install
npm run dev
```

## Stripe flow

1. Frontend checkout should call `POST /api/orders/stripe-checkout`.
2. Backend creates a Stripe Checkout Session and persists a pending order.
3. Stripe redirects to `/order-confirmation` on success.
4. Add a webhook handler before production to mark orders as `paid`.

## Deployment

### Frontend on Vercel

1. Import the `frontend` folder as the project root.
2. Set `VITE_API_URL` to your Render or Railway backend URL.
3. Set `VITE_STRIPE_PUBLISHABLE_KEY`.
4. Build command: `npm run build`
5. Output directory: `dist`

### Backend on Render / Railway

1. Import the `backend` folder as the service root.
2. Set all variables from [backend/.env.example](/home/uabhishek05/Desktop/Celestia/backend/.env.example).
3. Build command: `npm install`
4. Start command: `npm start`
5. Allow the frontend domain in `CLIENT_URL`.

### Database on MongoDB Atlas

1. Create an Atlas cluster and database named `celestia`.
2. Whitelist your deployment IP or use allowed network access for the host.
3. Put the connection string into `MONGODB_URI`.

## Remaining production work

- Connect frontend auth/cart/order calls to backend API responses instead of demo local state.
- Add Cloudinary upload endpoints and multipart handling for real admin image uploads.
- Add Razorpay or Cashfree if you want Indian gateway support beyond Stripe.
- Add Stripe webhook verification for production-grade payment state updates.
- Add tests and seed scripts.
