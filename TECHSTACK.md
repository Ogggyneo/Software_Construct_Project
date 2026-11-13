# MealCraft — Tech Stack

Tài liệu mô tả chi tiết các công nghệ được sử dụng trong **Backend** và **MealCraft-RN** (ứng dụng mobile).

---

## Backend

### Tổng quan

| Hạng mục | Lựa chọn |
|---|---|
| Runtime | Node.js 18+ |
| Framework | Express 5 |
| Ngôn ngữ | JavaScript (CommonJS) |
| Database | MongoDB 6+ |
| Hosting | Railway |

### Dependencies chi tiết

#### Core

| Package | Phiên bản | Vai trò |
|---|---|---|
| `express` | ^5.2.1 | Web framework — xử lý routing, middleware HTTP |
| `dotenv` | ^16.6.1 | Load biến môi trường từ `.env` |
| `cors` | ^2.8.6 | Bật Cross-Origin Resource Sharing cho mọi origin |

#### Database

| Package | Phiên bản | Vai trò |
|---|---|---|
| `mongoose` | ^9.6.2 | ODM cho MongoDB — định nghĩa schema, query |


#### Auth & Security

| Package | Phiên bản | Vai trò |
|---|---|---|
| `jsonwebtoken` | ^9.0.3 | Tạo và verify JWT (hết hạn sau 24h) |
| `bcrypt` | ^5.1.1 | Hash mật khẩu (salt rounds = 10) |

#### Real-time

| Package | Phiên bản | Vai trò |
|---|---|---|
| `socket.io` | ^4.8.3 | WebSocket server — chat nhóm thời gian thực |

#### AI & HTTP

| Package | Phiên bản | Vai trò |
|---|---|---|
| `@google/generative-ai` | ^0.24.1 | Google Gemini 2.5 Flash — AI tư vấn món ăn |
| `axios` | ^1.16.1 | HTTP client dùng trong scripts crawl dữ liệu |
| `cheerio` | ^1.2.0 | HTML parser — scrape công thức từ web |

---

### Kiến trúc Backend

```
backend/
├── index.js            # Entry point: kết nối DB, tạo HTTP server, gắn Socket.io
├── src/
│   ├── app.js          # Express app: đăng ký middleware và routes
│   ├── socket.js       # Socket.io handlers (join-group, leave-group, send-message)
│   ├── config/
│   │   ├── db.js       # Kết nối MongoDB qua Mongoose
│   │   └── auth.js     # (config phụ trợ auth)
│   ├── middleware/
│   │   └── auth.js     # JWT middleware bảo vệ routes
│   ├── models/
│   │   ├── User.js         # Tài khoản, tủ lạnh, sở thích, dị ứng
│   │   ├── Recipe.js       # Công thức nấu ăn
│   │   ├── Ingredient.js   # Nguyên liệu
│   │   ├── Group.js        # Nhóm đặt món
│   │   ├── Message.js      # Tin nhắn nhóm
│   │   └── Restaurant.js   # Nhà hàng (dùng cho AI tư vấn)
│   └── routes/
│       ├── auth.js     # POST /register, POST /login, PUT /preferences
│       ├── recipe.js   # GET /recipes, GET /matching, GET /recommended
│       ├── fridge.js   # GET/POST nguyên liệu tủ lạnh
│       ├── group.js    # Tạo/quản lý nhóm
│       └── ai.js       # POST /chat → Gemini 2.5 Flash
└── scripts/            # Seed, scrape, normalize, enrich dữ liệu
```

### API Endpoints

| Method | Path | Auth | Mô tả |
|---|---|---|---|
| POST | `/api/auth/register` | — | Đăng ký tài khoản mới |
| POST | `/api/auth/login` | — | Đăng nhập, trả về JWT |
| PUT | `/api/auth/preferences` | JWT | Cập nhật chế độ ăn / dị ứng |
| GET | `/api/recipes` | JWT | Danh sách công thức |
| GET | `/api/recipes/matching` | JWT | Tìm công thức theo nguyên liệu có sẵn |
| GET | `/api/recipes/recommended` | JWT | Công thức gợi ý theo hồ sơ người dùng |
| GET | `/api/fridge` | JWT | Lấy danh sách nguyên liệu tủ lạnh |
| POST | `/api/fridge` | JWT | Thêm nguyên liệu vào tủ lạnh |
| GET | `/api/group` | JWT | Lấy thông tin nhóm hiện tại |
| POST | `/api/group` | JWT | Tạo nhóm mới |
| POST | `/api/ai/chat` | JWT | Gửi tin nhắn đến Gemini AI |
| GET | `/health` | — | Kiểm tra server còn sống |
| GET | `/stats` | — | Thống kê công thức theo danh mục |

### Socket.io Events

| Event | Hướng | Mô tả |
|---|---|---|
| `join-group` | Client → Server | Tham gia room của nhóm |
| `leave-group` | Client → Server | Rời room của nhóm |
| `send-message` | Client → Server | Gửi tin nhắn, lưu vào MongoDB rồi broadcast |
| `message` | Server → Client | Broadcast tin nhắn mới đến tất cả thành viên room |
| `error` | Server → Client | Thông báo lỗi khi gửi thất bại |

> Socket.io kết nối được bảo vệ bằng JWT qua `socket.handshake.auth.token`.

---

### AI — Google Gemini 2.5 Flash

Backend tích hợp Gemini qua thư viện `@google/generative-ai`. Mỗi request `/api/ai/chat`:

1. Nhận `message`, `history` (lịch sử hội thoại), và `profile` (hồ sơ người dùng) từ client
2. Nếu message chứa từ khoá liên quan nhà hàng → query MongoDB lấy danh sách quán thực tế để inject vào context
3. Build system prompt bao gồm: vai trò AI, thông tin người dùng (dị ứng, kỹ năng nấu ăn, khu vực), dữ liệu quán ăn (nếu có)
4. Gửi toàn bộ history + message mới lên Gemini và trả kết quả về client

---

## MealCraft-RN (Mobile)

### Tổng quan

| Hạng mục | Lựa chọn |
|---|---|
| Framework | React Native 0.81.5 |
| Build tool | Expo SDK 54 |
| Ngôn ngữ | TypeScript 5.9 |
| Platforms | iOS, Android, Web (export) |
| Hosting | Vercel (web export) |

### Dependencies chi tiết

#### Core

| Package | Phiên bản | Vai trò |
|---|---|---|
| `react` | 19.1.0 | UI library |
| `react-native` | 0.81.5 | Cross-platform mobile framework |
| `expo` | 54.0.34 | Managed workflow — build, dev server, OTA |
| `typescript` | ~5.9.2 | Type safety (devDependency) |

#### Navigation

| Package | Phiên bản | Vai trò |
|---|---|---|
| `@react-navigation/native` | ^7.2.4 | Core navigation container |
| `@react-navigation/native-stack` | ^7.15.1 | Stack navigator (màn hình chồng lên nhau) |
| `@react-navigation/bottom-tabs` | ^7.16.1 | Tab bar ở dưới cùng (4 tab chính) |
| `react-native-screens` | ~4.16.0 | Native screen optimization cho navigation |
| `react-native-safe-area-context` | ~5.6.0 | Xử lý notch, home indicator |

#### Storage & Auth

| Package | Phiên bản | Vai trò |
|---|---|---|
| `@react-native-async-storage/async-storage` | 2.2.0 | Lưu JWT token, userId, userName trên thiết bị |

#### Real-time

| Package | Phiên bản | Vai trò |
|---|---|---|
| `socket.io-client` | ^4.8.3 | Kết nối WebSocket đến backend — nhận tin nhắn nhóm |

#### Expo Modules

| Package | Phiên bản | Vai trò |
|---|---|---|
| `expo-image-picker` | ~17.0.11 | Chọn ảnh từ thư viện hoặc camera |
| `expo-location` | ~19.0.8 | Lấy vị trí GPS của người dùng |
| `expo-status-bar` | ~3.0.9 | Quản lý status bar |
| `@expo/metro-runtime` | ~6.1.2 | Metro bundler runtime cho Expo web |

#### Web Support

| Package | Phiên bản | Vai trò |
|---|---|---|
| `react-dom` | 19.1.0 | React renderer cho web |
| `react-native-web` | ^0.21.0 | Polyfill React Native API cho trình duyệt |

---

### Kiến trúc MealCraft-RN

```
MealCraft-RN/
├── App.tsx             # Root component: navigation setup, Auth gate, AI FAB
├── index.ts            # Entry point Expo
├── app.json            # Cấu hình Expo (app name, icon, splash, bundle ID)
├── tsconfig.json       # TypeScript config
├── vercel.json         # Cấu hình deploy web export lên Vercel
└── src/
    ├── api/
    │   └── index.ts        # apiFetch wrapper — thêm JWT header tự động
    ├── contexts/
    │   ├── AuthContext.tsx  # Token, userId, login/logout — persisted qua AsyncStorage
    │   └── FabContext.tsx   # Ẩn/hiện FAB button (dùng trong GroupChatScreen)
    ├── screens/
    │   ├── LoginScreen.tsx          # Đăng nhập / đăng ký
    │   ├── HomeScreen.tsx           # Khám phá công thức
    │   ├── MealDetailScreen.tsx     # Chi tiết công thức
    │   ├── CookingMissionScreen.tsx # Chế độ nấu ăn từng bước
    │   ├── RecommendedScreen.tsx    # Gợi ý theo hồ sơ người dùng
    │   ├── IngredientsScreen.tsx    # Quản lý tủ lạnh
    │   ├── OrderFoodScreen.tsx      # Đặt món theo nhóm
    │   ├── CreateGroupScreen.tsx    # Tạo nhóm mới
    │   ├── GroupChatScreen.tsx      # Chat nhóm thời gian thực
    │   ├── AIChatScreen.tsx         # Chat với Gemini AI
    │   └── ProfileScreen.tsx        # Hồ sơ, chế độ ăn, dị ứng
    └── components/                  # Shared UI components
```

### Navigation Flow

```
App
└── AuthProvider
    ├── [Chưa đăng nhập] → LoginScreen
    └── [Đã đăng nhập]   → Bottom Tab Navigator
            ├── "Khám phá" (HomeStack)
            │       ├── HomeScreen
            │       ├── MealDetailScreen
            │       ├── CookingMissionScreen
            │       └── RecommendedScreen
            ├── "Nấu ăn" (CookStack)
            │       ├── IngredientsScreen
            │       └── MealDetailScreen
            ├── "Đặt món" (OrderStack)
            │       ├── OrderFoodScreen
            │       ├── CreateGroupScreen
            │       └── GroupChatScreen
            └── "Profile"
                    └── ProfileScreen

[FAB 💬] → Modal → AIChatScreen (xuất hiện ở mọi tab, ẩn khi ở GroupChatScreen)
```

### State Management

Dự án dùng **React Context API** thay vì thư viện ngoài (Redux, Zustand):

| Context | Nội dung quản lý |
|---|---|
| `AuthContext` | `token`, `userId`, `userName`, `isAuthenticated`, `login()`, `logout()` |
| `FabContext` | `setFabVisible()` — cho phép GroupChatScreen ẩn FAB button |

Token được persist qua `AsyncStorage` và restore khi mở app.

### HTTP Layer

Toàn bộ API call đi qua hàm `apiFetch` trong `src/api/index.ts`:

- Tự động gắn `Authorization: Bearer <token>` header
- Tự động parse JSON response
- Throw error nếu status không phải 2xx
- Base URL lấy từ `EXPO_PUBLIC_API_URL` (env var) hoặc fallback về IP local

---

## Liên kết

- Backend production: `https://mealcraft-production-9a23.up.railway.app`
- Mobile web (Vercel): xem `vercel.json` trong MealCraft-RN
- Tài liệu Expo SDK 54: `https://docs.expo.dev/versions/v54.0.0/`
