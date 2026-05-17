# MealCraft

Ứng dụng lên thực đơn, khám phá công thức nấu ăn và đặt món theo nhóm.  
Hỗ trợ AI tư vấn món ăn, theo dõi nguyên liệu trong tủ lạnh và nhắn tin thời gian thực giữa các thành viên.

---

## Tổng quan kiến trúc

```txt
MealCraft/
├── frontend/        React + TypeScript (web)
├── MealCraft-RN/    React Native + Expo (iOS / Android / web export)
└── backend/         Node.js + Express + MongoDB (dùng chung)
```

Backend đang chạy trên Railway:

```txt
https://mealcraft-production-9a23.up.railway.app
```

---

## Tính năng chính

- **Khám phá công thức** — Duyệt và tìm kiếm hàng trăm công thức được scrape từ các trang nấu ăn Việt Nam
- **Tủ lạnh thông minh** — Nhập nguyên liệu sẵn có để nhận gợi ý món phù hợp
- **AI Tư vấn** — Chatbot dùng Google Gemini đề xuất món dựa trên sở thích và dị ứng thực phẩm
- **Nhóm & đặt món** — Tạo nhóm, chọn nhà hàng cùng nhau và nhắn tin thời gian thực qua Socket.io
- **Hồ sơ cá nhân** — Lưu chế độ ăn, dị ứng (Big 9 quốc tế + đặc thù Việt Nam) và công thức yêu thích

---

# Dành cho người dùng

## Web

Truy cập bản web tại địa chỉ Vercel đã deploy (xem phần Deployment bên dưới).

## Mobile

- **iOS / Android**: Cài Expo Go, quét QR code khi dev server đang chạy
- **Web export**: Truy cập URL Vercel của bản mobile

---

# Dành cho Contributors

## Yêu cầu hệ thống

| Công cụ | Phiên bản tối thiểu |
|----------|---------------------|
| Node.js | 18+ |
| npm | 9+ |
| MongoDB | 6+ (local) hoặc Atlas |
| Expo CLI | SDK 54 |

---

## 1. Clone & cài đặt

```bash
git clone https://github.com/Ogggyneo/Software_Construct_Project.git

cd Software_Construct_Project/MealCraft
```

Cài dependencies cho từng phần:

```bash
# Backend
cd backend
npm install

# Web frontend
cd ../frontend
npm install

# Mobile
cd ../MealCraft-RN
npm install
```

---

## 2. Cấu hình môi trường

### Backend

Tạo file:

```txt
MealCraft/backend/.env
```

Nội dung:

```env
MONGODB_URI=mongodb://localhost:27017/mealcraft
JWT_SECRET=your-secret-key
PORT=3000
GEMINI_API_KEY=your-gemini-api-key
```

### Mobile

Tạo file:

```txt
MealCraft/MealCraft-RN/.env
```

Nội dung:

```env
EXPO_PUBLIC_API_URL=http://localhost:3000
```

---

## 3. Chạy local

```bash
# Terminal 1 — Backend
cd MealCraft/backend
npm start
```

```bash
# Terminal 2 — Web frontend
cd MealCraft/frontend
npm run dev
```

```bash
# Terminal 3 — Mobile (Expo)
cd MealCraft/MealCraft-RN
npm start
```

Sau khi chạy:

- Web frontend: `http://localhost:5173`
- Backend API: `http://localhost:3000`

---

## 4. Seed dữ liệu (lần đầu)

```bash
cd MealCraft/backend

# Seed nhà hàng mẫu
npm run seed:restaurants

# Scrape công thức
npm run scrape:recipes

# Chuẩn hóa dữ liệu
npm run normalize:recipes
```

---

# Cấu trúc API

| Method | Endpoint | Mô tả |
|--------|----------|-------|
| POST | `/auth/register` | Đăng ký tài khoản |
| POST | `/auth/login` | Đăng nhập, trả JWT |
| GET | `/recipe` | Lấy danh sách công thức |
| GET | `/recipe/matching` | Tìm công thức theo nguyên liệu |
| GET | `/recipe/recommended` | Công thức gợi ý cho user |
| GET / POST | `/fridge` | Quản lý nguyên liệu tủ lạnh |
| GET / POST | `/group` | Tạo và quản lý nhóm |
| POST | `/ai/chat` | Chat với Gemini AI |

### Socket.io Events

```txt
join-group
leave-group
send-message
```

---

# Stack công nghệ

| | Frontend | Mobile | Backend |
|---|---|---|---|
| **Framework** | React 18 + Vite | React Native 0.81 + Expo 54 | Express 5 |
| **Ngôn ngữ** | TypeScript | TypeScript | JavaScript |
| **UI** | Tailwind CSS 4 + shadcn/ui | React Native styles | — |
| **Database** | — | — | MongoDB + Mongoose |
| **Auth** | JWT | JWT + AsyncStorage | jsonwebtoken + bcrypt |
| **Real-time** | Socket.io client | Socket.io client | Socket.io |
| **AI** | — | — | Google Gemini API |

---

# Deployment

| Phần | Nền tảng | Lệnh |
|------|----------|------|
| Backend | Railway | Tự động qua git push |
| Web frontend | Vercel | `npm run build` → deploy |
| Mobile web | Vercel | `expo export --platform web` → deploy |

### Deploy Mobile Web thủ công

```bash
cd MealCraft/MealCraft-RN

EXPO_PUBLIC_API_URL="https://mealcraft-production-9a23.up.railway.app" \
./node_modules/.bin/expo export --platform web --clear

cd dist

npx vercel --prod
```

---

# Đóng góp

1. Fork repo và tạo branch từ `main`
2. Đặt tên branch theo format:
   - `feature/ten-tinh-nang`
   - `fix/mo-ta-loi`
3. Mỗi commit nên nhỏ gọn và có message rõ ràng bằng tiếng Anh
4. Mở Pull Request vào `main`, mô tả rõ thay đổi và cách test
5. Đảm bảo không commit file `.env` hay API key
