# Full-Stack Ecommerce Integration Plan (MySQL + Backend)

## Phase 1: Architecture & Technology Stack Setup

1. **Choose a Backend Framework:**
   - Since the frontend heavily relies on JavaScript, we will use **Node.js with Express.js** to build our backend API.
   - We will use the `mysql2` package to connect Express natively to your system MySQL database.
2. **Setup the Project Structure:**
   - Initialize a Node.js project (`npm init`).
   - Install dependencies: `express`, `mysql2`, `cors` (for cross-origin requests bridging frontend/backend), `bcrypt` (for password hashing), `jsonwebtoken` (for secure user session management).

## Phase 2: Database Design (MySQL)

We need to create the foundation to store users, their carts, and their favorites.

1. **`users` Table:**
   - `id` (Primary Key, Auto-increment)
   - `name`, `email` (Unique), `password_hash`
   - `created_at`
2. **`products` Table (Optional but Recommended):**
   - We can migrate `products.json` into a MySQL table (`id`, `title`, `price`, `image`, etc.) to easily link carts to products. _Alternatively, we can just store the product string IDs (like 'apple-iphone-17-pro') in the cart and look them up in JSON._
3. **`cart` Table (Links Users to Products):**
   - `id` (Primary Key)
   - `user_id` (Foreign Key -> users.id)
   - `product_id` (String ID matching products.json)
   - `quantity` (Integer)
4. **`wishlist` Table (Favorites):**
   - `id` (Primary Key)
   - `user_id` (Foreign Key -> users.id)
   - `product_id` (String ID matching products.json)

## Phase 3: Building the Backend API (Express.js)

Create robust API endpoints that our frontend will talk to securely via frontend JavaScript.

1. **Authentication API:**
   - `POST /api/register`: Hashes password, saves user to DB, returns success.
   - `POST /api/login`: Verifies password, generates a JWT (JSON Web Token) securely identifying the user session.
2. **Cart API:**
   - `GET /api/cart`: Fetch all items in the logged-in user's cart.
   - `POST /api/cart/add`: Add a specific product ID to the cart.
   - `PUT /api/cart/update`: Change quantity.
   - `DELETE /api/cart/remove`: Remove item.
3. **Wishlist API:**
   - `GET /api/wishlist`: Fetch user's favorite products.
   - `POST /api/wishlist/toggle`: Add or remove a product from favorites.

## Phase 4: Frontend Development (HTML/JS)

Connecting the existing UI to the new Backend APIs.

1. **User Authentication UI:**
   - Build a `login.html` and `register.html` (or an elegant unified Login/Signup Modal) matching the site's rich design guidelines.
   - Save the JWT Token in the browser's `localStorage` upon successful login.
   - Update the Header: Check for the token, showing "Login" if logged out, or a personalized "My Account" dropdown if logged in.
2. **Favorites (Wishlist) Logic:**
   - Update the existing `<i class="fa-regular fa-heart"></i>` buttons globally.
   - On click, send an invisible `fetch()` request (along with the user's JWT token) to `/api/wishlist/toggle`.
   - Update the heart icon dynamically (fill it in with `fa-solid` and turn it brand-red) upon success.
3. **Add to Cart Logic:**
   - Update all "Add to Cart" buttons across `index.html`, `product-details.html`, and the new Compare Modal.
   - On click, send a `fetch()` request to `/api/cart/add` with the target `product_id`.
   - Show a beautiful floating success toast/notification.
   - Later: Create a dynamic Cart Sidebar UI that fetches and renders the user's saved items in real-time.

## Phase 5: Implementation Roadmap

We must tackle this step-by-step without breaking your currently flawless frontend:
**Step A:** I create the MySQL table schemas (`.sql` commands) for you to run in your local `phpMyAdmin` or command line.
**Step B:** We initialize the basic Node.js API server (`server.js`) & wire it to your MySQL instance.
**Step C:** We build the Auth UI (Modals/Pages) to actually log a user in.
**Step D:** We wire up the frontend Cart/Wishlist buttons to dynamically save to the database securely!
