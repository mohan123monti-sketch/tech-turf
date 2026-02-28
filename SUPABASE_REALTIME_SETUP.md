# 🚀 Supabase Real-time Database Setup Guide

**Date:** February 28, 2026  
**Project:** Tech Turf Full-Stack Platform  
**Feature:** Real-time Database Updates

---

## Quick Start

Your Supabase connection string has been configured:
```
postgresql://postgres:[YOUR-PASSWORD]@db.fdagwlemysfmrvhucujh.supabase.co:5432/postgres
```

The backend now has **full real-time WebSocket support** ✅

---

## Step 1: Configure Environment Variables

Update `backend/.env` with your Supabase credentials:

```dotenv
# Database Connection (Already added)
DATABASE_URL=postgresql://postgres:YOUR-PASSWORD@db.fdagwlemysfmrvhucujh.supabase.co:5432/postgres

# Supabase Real-time Configuration
SUPABASE_URL=https://fdagwlemysfmrvhucujh.supabase.co
SUPABASE_ANON_KEY=your-anon-key-from-dashboard
SUPABASE_SERVICE_KEY=your-service-role-key-from-dashboard
```

### How to Get Your Keys:

1. Go to **Supabase Dashboard** → Your Project
2. Click **Settings** (bottom left)
3. Click **API** tab
4. Copy:
   - **Project URL** → `SUPABASE_URL`
   - **Anon public key** → `SUPABASE_ANON_KEY`
   - **Service role secret** → `SUPABASE_SERVICE_KEY`

---

## Step 2: Enable Real-time in Supabase

### Enable Realtime Publication:

1. Go to **Supabase Dashboard** → Your Project
2. Click **Database** → **Replication**
3. Under "Publications", find `supabase_realtime`
4. Toggle the tables you want real-time updates for:
   - ✅ `products` - Inventory & price updates
   - ✅ `orders` - Order status changes
   - ✅ `users` - User profile updates
   - ✅ `reviews` - New reviews
   - ✅ `inventory` - Stock levels

### Alternative: SQL Command

```sql
-- Enable real-time for specific tables
BEGIN;
  -- Assuming supabase_realtime publication exists
  ALTER PUBLICATION supabase_realtime ADD TABLE products;
  ALTER PUBLICATION supabase_realtime ADD TABLE orders;
  ALTER PUBLICATION supabase_realtime ADD TABLE users;
  ALTER PUBLICATION supabase_realtime ADD TABLE reviews;
COMMIT;
```

---

## Step 3: Required Database Schema

Your Supabase PostgreSQL database needs these tables:

```sql
-- Create users table
CREATE TABLE IF NOT EXISTS users (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    email VARCHAR(255) UNIQUE NOT NULL,
    password_hash VARCHAR(255) NOT NULL,
    username VARCHAR(100),
    profile_data JSONB,
    created_at TIMESTAMP DEFAULT now(),
    updated_at TIMESTAMP DEFAULT now()
);

-- Create products table
CREATE TABLE IF NOT EXISTS products (
    id SERIAL PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    description TEXT,
    price DECIMAL(10, 2),
    stock INTEGER DEFAULT 0,
    category VARCHAR(100),
    image_url TEXT,
    created_at TIMESTAMP DEFAULT now(),
    updated_at TIMESTAMP DEFAULT now()
);

-- Create orders table
CREATE TABLE IF NOT EXISTS orders (
    id SERIAL PRIMARY KEY,
    user_id UUID REFERENCES users(id),
    total_amount DECIMAL(10, 2),
    status VARCHAR(50) DEFAULT 'pending',
    items JSONB,
    created_at TIMESTAMP DEFAULT now(),
    updated_at TIMESTAMP DEFAULT now()
);

-- Create reviews table
CREATE TABLE IF NOT EXISTS reviews (
    id SERIAL PRIMARY KEY,
    product_id INTEGER REFERENCES products(id),
    user_id UUID REFERENCES users(id),
    rating INTEGER CHECK (rating >= 1 AND rating <= 5),
    comment TEXT,
    created_at TIMESTAMP DEFAULT now()
);

-- Create inventory table
CREATE TABLE IF NOT EXISTS inventory (
    id SERIAL PRIMARY KEY,
    product_id INTEGER REFERENCES products(id),
    warehouse VARCHAR(100),
    quantity INTEGER,
    updated_at TIMESTAMP DEFAULT now()
);

-- Enable real-time
ALTER PUBLICATION supabase_realtime ADD TABLE users, products, orders, reviews, inventory;
```

---

## Step 4: Start the Backend

The backend now has **three main components:**

### 1. **REST API** - `/api/*`
Traditional HTTP endpoints for CRUD operations

### 2. **WebSocket Server** - `/ws`
Real-time database change notifications

### 3. **Real-time Routes** - `/api/realtime/*`
Status and documentation endpoints

```bash
cd backend
npm install  # If needed
npm start    # Start with real-time support
```

You should see:
```
✓ Database connection successful
✓ Supabase Real-time initialized
🚀 Tech Turf API running on port 5000
📡 WebSocket real-time available at ws://localhost:5000/ws
🔗 Real-time status: ENABLED ✓
```

---

## Step 5: Frontend Real-time Integration

### Using the RealtimeClient (Included)

The frontend includes `realtime.js` with a complete client library:

```javascript
// Import the real-time client
import RealtimeClient from '/src/js/realtime.js';

// Create client (auto-connects to ws://your-server/ws)
const realtime = new RealtimeClient();

// Connect
await realtime.connect();

// Subscribe to products table
realtime.subscribe('products', (change) => {
    console.log('Product changed:', change);
    
    // change.event: 'INSERT' | 'UPDATE' | 'DELETE'
    // change.new: Updated record
    // change.old: Previous record
    // change.timestamp: When it happened
    
    // Update UI in real-time
    updateProductInUI(change.new);
});

// Listen to connection events
realtime.on('connected', () => console.log('Real-time connected ✓'));
realtime.on('disconnected', () => console.log('Real-time disconnected'));
realtime.on('error', (error) => console.error('Error:', error));

// Auto-reconnects on disconnect ✓
```

### Example: Real-time Product Updates

```javascript
// HTML: <div id="products-list"></div>

const realtime = new RealtimeClient();
await realtime.connect();

// Listen to database changes
realtime.subscribe('products', (change) => {
    if (change.event === 'INSERT') {
        // New product added
        addProductToUI(change.new);
    } else if (change.event === 'UPDATE') {
        // Product updated
        updateProductInUI(change.new);
    } else if (change.event === 'DELETE') {
        // Product removed
        removeProductFromUI(change.old.id);
    }
});
```

### Example: Real-time Order Status

```javascript
// Subscribe to orders for current user
realtime.subscribe('orders', (change) => {
    if (change.event === 'UPDATE') {
        const order = change.new;
        console.log(`Order #${order.id} status: ${order.status}`);
        
        // Show notification
        notifyUser(`Your order status: ${order.status}`);
    }
});
```

---

## API Endpoints

### Real-time Status
```bash
GET /api/realtime/status
```

Response:
```json
{
  "success": true,
  "data": {
    "realtime": {
      "connected": true,
      "subscriptions": ["products", "orders"],
      "protocol": "WebSocket",
      "endpoint": "/ws"
    }
  }
}
```

### Real-time Documentation
```bash
GET /api/realtime/docs
```

Returns full documentation and examples.

---

## WebSocket Messages

### Client → Server

#### Subscribe to table changes
```json
{
  "type": "subscribe",
  "table": "products"
}
```

### Server → Client

#### Connection confirmed
```json
{
  "type": "connected",
  "message": "Real-time connection established",
  "timestamp": "2026-02-28T10:30:00Z"
}
```

#### Subscription confirmed
```json
{
  "type": "subscribed",
  "table": "products",
  "timestamp": "2026-02-28T10:30:00Z"
}
```

#### Database change
```json
{
  "type": "db_change",
  "table": "products",
  "event": "UPDATE",
  "new": {
    "id": 1,
    "name": "Updated Product",
    "price": 99.99,
    "stock": 50
  },
  "old": {
    "id": 1,
    "name": "Old Product",
    "price": 89.99,
    "stock": 45
  },
  "timestamp": "2026-02-28T10:30:05Z"
}
```

#### Error
```json
{
  "type": "error",
  "message": "Table not found"
}
```

---

## Troubleshooting

### Real-time not connecting?

1. **Check Supabase credentials:**
   ```bash
   echo "DATABASE_URL: $DATABASE_URL"
   echo "SUPABASE_URL: $SUPABASE_URL"
   ```

2. **Verify real-time is enabled:**
   ```bash
   curl http://localhost:5000/api/realtime/status
   ```

3. **Check logs:**
   ```
   ✗ Failed to initialize Supabase
   ✗ Supabase credentials not configured
   ```

4. **Browser console errors?**
   - Check WebSocket is connected: `ws://localhost:5000/ws`
   - CORS/Origin issues? Update `CORS_ORIGIN` in `.env`

### Data not updating in real-time?

1. **Did you enable real-time** in Supabase Dashboard?
2. **Is the table in the publication?**
   ```sql
   SELECT * FROM pg_publication_tables WHERE pubname = 'supabase_realtime';
   ```

3. **Are you subscribed to the correct table?**
   ```javascript
   realtime.subscribe('products', callback); // Correct table name
   ```

### Performance issues?

- Limit subscriptions to necessary tables only
- Use specific event filters if possible
- Monitor active subscriptions: `/api/realtime/status`

---

## Production Deployment

### For Vercel (Frontend)
```bash
# Frontend just needs the API URL
VITE_API_BASE=https://your-api.render.com /api
```

### For Render (Backend)
```bash
# Set these environment variables in Render dashboard:
DATABASE_URL=postgresql://user:pass@db.render.com:5432/db
SUPABASE_URL=https://your-project.supabase.co
SUPABASE_ANON_KEY=your-anon-key
SUPABASE_SERVICE_KEY=your-service-key
NODE_ENV=production
```

### Security Checklist
- ✅ Use service key for backend (more permissions)
- ✅ Use anon key for frontend (limited access)
- ✅ Set `DB_SSL=true` in production
- ✅ Update Row Level Security (RLS) policies in Supabase
- ✅ Set proper CORS origins

---

## Performance Metrics

- **Real-time Latency:** ~100-500ms (Supabase → Your Server → Clients)
- **Max Concurrent Connections:** Depends on your plan
- **Message Rate:** Supabase limits per your tier
- **Scalability:** Horizontal scaling with multiple server instances + Redis Adapter (future)

---

## Next Steps

1. ✅ Update `.env` with Supabase credentials
2. ✅ Enable real-time in Supabase Dashboard
3. ✅ Run database schema
4. ✅ Start backend: `npm start`
5. ✅ Test WebSocket: `ws://localhost:5000/ws`
6. ✅ Integrate `RealtimeClient` in frontend components

---

## Support & Resources

- **Supabase Docs:** https://supabase.com/docs/guides/realtime
- **Supabase Dashboard:** https://app.supabase.com
- **Backend Health:** http://localhost:5000/health
- **API Docs:** http://localhost:5000/api/realtime/docs

---

**Your database is now real-time enabled! 🎉**

Users will see live updates across all devices instantly using PostgreSQL LISTEN/NOTIFY through Supabase, without traditional polling.
