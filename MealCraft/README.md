# MealCraft

A meal-planning and group food-ordering app built with React (Vite + TypeScript) on the frontend and Node.js/Express + MySQL on the backend.

---

## Project Structure

```
MealCraft/
├── frontend/          # React + TypeScript (Vite)
│   └── src/
│       ├── app/
│       │   ├── components/   # Page components
│       │   ├── contexts/     # AuthContext, ModeContext
│       │   └── routes.tsx
│       └── styles/
└── backend/
    ├── index.js          # Entry point — connects DB then starts server
    ├── app.js            # Express app (routes, middleware) ← to be moved to src/
    ├── src/
    │   ├── config/db.js      # MySQL connection pool
    │   ├── middleware/auth.js # JWT verification
    │   └── routes/
    │       ├── auth.js       # POST /register, POST /login
    │       ├── recipe.js     # GET /recipes, GET /recommended, etc.
    │       ├── group.js      # Group order CRUD + nearby search
    │       └── fridge.js     # User fridge CRUD
    └── package.json
```

---

## Prerequisites

- Node.js 18+
- MySQL 8+
- pnpm (frontend) / npm (backend)

---

## Backend Setup

### 1. Install dependencies

The `package.json` in `backend/` is incomplete. Install all required packages:

```bash
cd backend
npm install express cors bcrypt jsonwebtoken mysql2 dotenv
```

### 2. Configure environment variables

Create a `.env` file inside `backend/`:

```env
DB_HOST=localhost
DB_PORT=3306
DB_USER=your_mysql_user
DB_PASSWORD=your_mysql_password
DB_NAME=mealcraft
JWT_SECRET=your_secret_key_here
PORT=3000
```

### 3. Fix the backend file structure (required before running)

Currently `index.js` expects `./src/app` but `app.js` lives at the root of `backend/`. Move it:

```bash
mv backend/app.js backend/src/app.js
```

Then open `backend/src/app.js` and fix the route import paths (change `./routes/` → `./routes/` is already correct once the file is in `src/`). Also fix the recipe route filename — the file is `recipe.js` not `recipes.js`:

```js
// backend/src/app.js  (after moving)
app.use('/api/auth',    require('./routes/auth'));
app.use('/api/recipes', require('./routes/recipe'));   // ← was "recipes", file is "recipe.js"
app.use('/api/group',   require('./routes/group'));
app.use('/api/fridge',  require('./routes/fridge'));
```

### 4. Create the MySQL database

```sql
CREATE DATABASE mealcraft;
USE mealcraft;

CREATE TABLE User (
  user_id       INT AUTO_INCREMENT PRIMARY KEY,
  name          VARCHAR(100) NOT NULL,
  email         VARCHAR(150) UNIQUE NOT NULL,
  phone         VARCHAR(20) UNIQUE,
  password_hash VARCHAR(255) NOT NULL,
  created_at    TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE UserPreferences (
  user_id              INT PRIMARY KEY,
  cuisine_interests    VARCHAR(255),
  cooking_skill_level  VARCHAR(50),
  FOREIGN KEY (user_id) REFERENCES User(user_id)
);

CREATE TABLE Ingredient (
  ingredient_id INT AUTO_INCREMENT PRIMARY KEY,
  name          VARCHAR(100) NOT NULL,
  category      VARCHAR(50)
);

CREATE TABLE UserFridge (
  user_id       INT NOT NULL,
  ingredient_id INT NOT NULL,
  PRIMARY KEY (user_id, ingredient_id),
  FOREIGN KEY (user_id)       REFERENCES User(user_id),
  FOREIGN KEY (ingredient_id) REFERENCES Ingredient(ingredient_id)
);

CREATE TABLE Recipe (
  recipe_id    INT AUTO_INCREMENT PRIMARY KEY,
  name         VARCHAR(200) NOT NULL,
  cook_time    VARCHAR(50),
  difficulty   VARCHAR(50),
  image_url    VARCHAR(500),
  category     VARCHAR(100),
  kcal         INT,
  servings     INT,
  instructions TEXT,
  created_at   TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE RecipeIngredient (
  recipe_id     INT NOT NULL,
  ingredient_id INT NOT NULL,
  quantity      VARCHAR(50),
  unit          VARCHAR(50),
  PRIMARY KEY (recipe_id, ingredient_id),
  FOREIGN KEY (recipe_id)     REFERENCES Recipe(recipe_id),
  FOREIGN KEY (ingredient_id) REFERENCES Ingredient(ingredient_id)
);

CREATE TABLE SavedRecipe (
  user_id   INT NOT NULL,
  recipe_id INT NOT NULL,
  saved_at  TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (user_id, recipe_id),
  FOREIGN KEY (user_id)   REFERENCES User(user_id),
  FOREIGN KEY (recipe_id) REFERENCES Recipe(recipe_id)
);

CREATE TABLE GroupOrder (
  group_id            INT AUTO_INCREMENT PRIMARY KEY,
  creator_user_id     INT NOT NULL,
  title_ui            VARCHAR(200) DEFAULT 'Untitled',
  cuisine_tag         VARCHAR(100),
  eat_time            TIME,
  address             VARCHAR(500),
  latitude            DECIMAL(10, 7),
  longitude           DECIMAL(10, 7),
  status              ENUM('open','closed') DEFAULT 'open',
  join_window_minutes INT DEFAULT 10,
  created_at          TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (creator_user_id) REFERENCES User(user_id)
);

CREATE TABLE GroupOrderMember (
  group_id INT NOT NULL,
  user_id  INT NOT NULL,
  PRIMARY KEY (group_id, user_id),
  FOREIGN KEY (group_id) REFERENCES GroupOrder(group_id),
  FOREIGN KEY (user_id)  REFERENCES User(user_id)
);

CREATE TABLE Message (
  message_id INT AUTO_INCREMENT PRIMARY KEY,
  group_id   INT NOT NULL,
  user_id    INT NOT NULL,
  content    TEXT NOT NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (group_id) REFERENCES GroupOrder(group_id),
  FOREIGN KEY (user_id)  REFERENCES User(user_id)
);
```

### 5. Start the backend

```bash
cd backend
node index.js
# Server runs on http://localhost:3000
```

---

## Frontend Setup

### 1. Install dependencies

```bash
cd frontend
pnpm install
```

### 2. Fix the Vite proxy port

Open `frontend/vite.config.ts`. The proxy currently points to port **5000**, but the backend runs on port **3000**. Update it:

```ts
server: {
  port: 5173,
  proxy: {
    '/api': 'http://localhost:3000',  // ← was 5000
  },
},
```

### 3. Start the frontend

```bash
cd frontend
pnpm dev
# App runs on http://localhost:5173
```

---

## API Reference

All routes except `/health`, `POST /api/auth/register`, and `POST /api/auth/login` require:
```
Authorization: Bearer <token>
```

| Method | Path | Description |
|--------|------|-------------|
| GET | `/health` | Health check |
| POST | `/api/auth/register` | Register a new user |
| POST | `/api/auth/login` | Login, returns JWT token |
| GET | `/api/recipes` | All recipes |
| GET | `/api/recipes/recommended` | Recipes matching user preferences |
| GET | `/api/recipes/matching` | Recipes matching fridge ingredients |
| GET | `/api/recipes/category/:category` | Recipes by category |
| GET | `/api/recipes/:recipe_id` | Single recipe with ingredients & steps |
| POST | `/api/recipes/save` | Save a recipe |
| DELETE | `/api/recipes/save/:recipe_id` | Unsave a recipe |
| GET | `/api/fridge` | User's fridge ingredients |
| GET | `/api/fridge/all` | All available ingredients |
| POST | `/api/fridge` | Add ingredient to fridge |
| DELETE | `/api/fridge/clear` | Clear entire fridge |
| DELETE | `/api/fridge/:ingredient_id` | Remove one ingredient |
| GET | `/api/group/nearby?latitude=&longitude=` | Open groups within 5 km |
| POST | `/api/group/create` | Create a group order |
| POST | `/api/group/:group_id/join` | Join a group |
| DELETE | `/api/group/:group_id/leave` | Leave a group |
| GET | `/api/group/:group_id/messages` | Group chat messages |
| GET | `/api/group/:group_id` | Group details + members |

---

## Backend–Frontend Integration Status

The backend API is fully implemented. The frontend currently uses **mock / static data** everywhere — the API calls still need to be wired in.

| Feature | Backend route | Frontend file | Status |
|---------|--------------|---------------|--------|
| Login | `POST /api/auth/login` | `Login.tsx` | **Not connected** — calls local `login()` only |
| Register | `POST /api/auth/register` | `Register.tsx` | **Not connected** — navigates without calling API |
| Auth token storage | — | `AuthContext.tsx` | **Not connected** — stores only a boolean, no JWT |
| Home recipe feed | `GET /api/recipes` | `Home.tsx` | **Not connected** — uses hardcoded array |
| Ingredient finder | `GET /api/fridge`, `GET /api/recipes/matching` | `IngredientFinder.tsx` | **Not connected** — uses local `data/recipes.ts` |
| Group order list | `GET /api/group/nearby` | `OrderFood.tsx` | **Not connected** — uses `data/FoodGroup.ts` |
| Group chat | `GET /api/group/:id/messages` | `GroupChat.tsx` | **Not connected** — uses hardcoded messages |

### What needs to be done to connect them

1. **`AuthContext.tsx`** — store the JWT token (e.g., in `localStorage`) and expose it so components can include it in `Authorization` headers.

2. **`Login.tsx`** — replace the stub `handleLogin` with a `fetch`/`axios` call to `POST /api/auth/login`, store the returned token, then navigate.

3. **`Register.tsx`** — replace the stub `handleRegister` with a call to `POST /api/auth/register`.

4. **`Home.tsx`** — on mount, call `GET /api/recipes` (or `GET /api/recipes/recommended`) and replace the hardcoded `recipes` array with the response.

5. **`IngredientFinder.tsx`** — call `GET /api/fridge/all` to populate the ingredient search list, `GET /api/fridge` for the user's current fridge, and `GET /api/recipes/matching` for the matched recipes.

6. **`OrderFood.tsx`** — call `GET /api/group/nearby?latitude=&longitude=` (after requesting the user's geolocation) instead of `data/FoodGroup.ts`.

7. **`GroupChat.tsx`** — call `GET /api/group/:group_id/messages` on mount and poll or use WebSocket for new messages.

---

## Known Issues to Fix Before Running

| # | Issue | Where | Fix |
|---|-------|--------|-----|
| 1 | `index.js` requires `./src/app` but `app.js` is at `backend/app.js` | `backend/index.js` | Move `app.js` into `backend/src/` |
| 2 | `app.js` requires `./routes/recipes` but file is `recipe.js` | `backend/app.js` | Change import to `./routes/recipe` |
| 3 | Backend `package.json` missing `bcrypt`, `jsonwebtoken`, `mysql2`, `dotenv` | `backend/package.json` | Run `npm install bcrypt jsonwebtoken mysql2 dotenv` |
| 4 | Vite proxy targets port 5000; backend runs on port 3000 | `frontend/vite.config.ts` | Change proxy target to `http://localhost:3000` |
| 5 | No `.env` file — server crashes on startup without DB env vars | `backend/` | Create `.env` with DB credentials and `JWT_SECRET` |
