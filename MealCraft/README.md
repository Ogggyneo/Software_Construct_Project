# 1. Run Frontend (Mobile)
cd MealCraft/MealCraft-RN
EXPO_PUBLIC_API_URL="https://mealcraft-production-9a23.up.railway.app" &&
      ./node_modules/.bin/expo export --platform web --clear 2>&1)
cd dist && npx vercel —prod 2>&1)

# 2. Run Backend (Node + Express)
cd MealCraft/backend
npm install
npm start

# 3. Run Frontend (Web)
cd MealCraft/frontend
npm install
npm run dev


