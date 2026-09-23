# Secure Note-Taking Application - Backend REST API

Production-ready REST API built with **Node.js, Express, TypeScript, and MongoDB with Mongoose**.

---

## 🛠️ Architecture & Principles

- **SOLID Architecture:**
  - `controllers/`: Pure HTTP transport layer (reads requests, delegates to services, formats responses).
  - `services/`: Business logic, transaction management, and database queries.
  - `models/`: Mongoose schemas with explicit `schema.index()` declarations.
  - `middleware/`: JWT verification, Role-Based Access Control (`requireRole`), and centralized error handling.
- **DRY (Don't Repeat Yourself):** Unified pagination math, reusable DTOs, and centralized error handling.
- **Zero Template Bloat:** Built completely from scratch without heavy boilerplates.

---

## 📋 Database Indexing Strategy (`schema.index`)

Adheres strictly to the constraint: *"DO NOT MAKE ANY UNNECESSARY INDEXES. You must use the schema.index method for defining indexes in your code so they are visible during review."*

1. **`User` Schema (`src/models/User.ts`):**
   - `userSchema.index({ email: 1 }, { unique: true });`
   - `userSchema.index({ createdAt: -1 });`
   - `userSchema.index({ interests: 1 });`
2. **`Note` Schema (`src/models/Note.ts`):**
   - `noteSchema.index({ userId: 1, createdAt: -1 });` *(Compound Index)*
   - `noteSchema.index({ createdAt: -1 });`
3. **`Post` Schema (`src/models/Post.ts`):**
   - `postSchema.index({ userId: 1, createdAt: -1 });` *(Compound Index)*

---

## 📊 Aggregation Scenarios

### Scenario 1: Group by Interests
- **Constraint:** Exactly one `collection.aggregate()` call.
- **Implementation:** `src/services/aggregationService.ts` -> `getGroupedByInterests()`
```typescript
User.aggregate([
  { $unwind: '$interests' },
  {
    $group: {
      _id: '$interests',
      interest: { $first: '$interests' },
      count: { $sum: 1 },
      users: {
        $push: { _id: '$_id', name: '$name', email: '$email', role: '$role' }
      }
    }
  },
  { $sort: { count: -1, _id: 1 } }
]);
```

### Scenario 2: User Posts ($lookup)
- **Constraint:** Single aggregation pipeline with a `$lookup` stage.
- **Implementation:** `src/services/aggregationService.ts` -> `getUserPostsWithLookup(userId)`
```typescript
User.aggregate([
  { $match: { _id: new mongoose.Types.ObjectId(userId) } },
  {
    $lookup: {
      from: 'posts',
      localField: '_id',
      foreignField: 'userId',
      as: 'posts'
    }
  },
  {
    $project: {
      _id: 1,
      name: 1,
      email: 1,
      interests: 1,
      posts: 1,
      postCount: { $size: '$posts' }
    }
  }
]);
```

---

## 🚀 Getting Started

### 1. Install Dependencies
```bash
npm install
```

### 2. Configure Environment (`.env`)
Create or edit `.env`:
```env
PORT=5000
MONGODB_URI=mongodb://localhost:27017/notes
JWT_SECRET=super_secure_jwt_secret_key_2026_note_taking_app
JWT_EXPIRES_IN=7d
NODE_ENV=development
```
*(Supports local MongoDB or MongoDB Atlas. If no MongoDB is reachable, the server automatically starts an in-memory MongoDB runner).*

### 3. Available Scripts
```bash
# Start development server with live reload
npm run dev

# Compile TypeScript to JavaScript (dist/)
npm run build

# Start production server
npm start
```

---

## 🔑 Default Seed Accounts

- **Admin:** `admin@mail.com` | `password`
- **User:** `user@mail.com` | `password`
- **User 2:** `alex@mail.com` | `password`
