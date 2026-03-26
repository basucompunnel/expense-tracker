# API Documentation

Complete REST API for the Expense Tracker & Budget Manager application. All endpoints (except auth) require JWT authentication via Bearer token.

---

## 🔐 Authentication Endpoints

### `POST /api/auth/register`
**Create a new user account**

**Database Operations:**
- Query: `User.findOne({ email })` - Check if email exists
- Create: `User.create()` - Insert new user with hashed password using bcrypt

**Request Body:**
```json
{
  "email": "user@example.com",
  "password": "securePassword123",
  "fullName": "John Doe"
}
```

**Response (201):**
```json
{
  "success": true,
  "message": "User created successfully",
  "token": "eyJhbGciOiJIUzI1NiIs..."
}
```

**Error Cases:**
- `400` - Missing fields or password < 6 characters
- `409` - Email already in use

---

### `POST /api/auth/login`
**Authenticate user and receive JWT token**

**Database Operations:**
- Query: `User.findOne({ email })` - Fetch user by email
- Verify: `user.comparePassword(password)` - Compare hashed passwords

**Request Body:**
```json
{
  "email": "user@example.com",
  "password": "securePassword123"
}
```

**Response (200):**
```json
{
  "success": true,
  "message": "Login successful",
  "token": "eyJhbGciOiJIUzI1NiIs..."
}
```

**Error Cases:**
- `400` - Missing email or password
- `401` - Invalid credentials

---

## 💰 Expense Endpoints

### `GET /api/expenses`
**Fetch all expenses for authenticated user**

**Authentication:** Required (Bearer token)

**Query Parameters:**
- `startDate` (optional) - Filter from date (ISO 8601)
- `endDate` (optional) - Filter to date (ISO 8601)
- `category` (optional) - Filter by category
- `page` (optional) - Pagination

**Database Operations:**
- Query: `Expense.find({ userId })` - Fetch all user expenses with optional filters
- Sort: `sort({ date: -1 })` - Newest first

**Response (200):**
```json
{
  "success": true,
  "expenses": [
    {
      "_id": "64a1b2c3d4e5f6g7h8i9j0",
      "userId": "64a1b2c3d4e5f6g7h8i9j1",
      "amount": 500,
      "description": "Grocery shopping",
      "category": "Groceries",
      "date": "2026-03-25T10:30:00.000Z",
      "createdAt": "2026-03-25T10:30:00.000Z"
    }
  ]
}
```

---

### `POST /api/expenses`
**Create a new expense**

**Authentication:** Required (Bearer token)

**Request Body:**
```json
{
  "amount": 500,
  "description": "Grocery shopping",
  "category": "Groceries",
  "date": "2026-03-25"
}
```

**Database Operations:**
- Create: `Expense.create()` - Insert new expense document
- Fields: userId (from auth), amount, description, category, date
- Validation: amount must be positive number

**Response (201):**
```json
{
  "success": true,
  "message": "Expense created successfully",
  "expense": {
    "_id": "64a1b2c3d4e5f6g7h8i9j0",
    "amount": 500,
    "description": "Grocery shopping",
    "category": "Groceries",
    "date": "2026-03-25T00:00:00.000Z"
  }
}
```

**Error Cases:**
- `400` - Missing required fields
- `400` - Invalid amount (must be positive)

---

### `PUT /api/expenses/[id]`
**Update an existing expense**

**Authentication:** Required (Bearer token)

**URL Parameters:**
- `id` - Expense MongoDB ObjectId

**Request Body:**
```json
{
  "amount": 600,
  "description": "Updated grocery shopping",
  "category": "Groceries",
  "date": "2026-03-25"
}
```

**Database Operations:**
- Query: `Expense.findById(id)` - Fetch expense by ID
- Verify: Check userId matches authenticated user
- Update: `Expense.findByIdAndUpdate()` - Update expense fields
- Validation: Verify ownership before updating

**Response (200):**
```json
{
  "success": true,
  "message": "Expense updated successfully",
  "expense": { /* updated expense object */ }
}
```

**Error Cases:**
- `400` - Invalid expense ID format
- `400` - Missing required fields
- `403` - User doesn't own this expense
- `404` - Expense not found

---

### `DELETE /api/expenses/[id]`
**Delete a single expense**

**Authentication:** Required (Bearer token)

**URL Parameters:**
- `id` - Expense MongoDB ObjectId

**Database Operations:**
- Query: `Expense.findById(id)` - Fetch expense
- Verify: Check userId matches authenticated user
- Delete: `Expense.findByIdAndDelete(id)` - Remove expense from database

**Response (200):**
```json
{
  "success": true,
  "message": "Expense deleted successfully"
}
```

**Error Cases:**
- `400` - Invalid expense ID format
- `403` - User doesn't own this expense
- `404` - Expense not found

---

### `POST /api/expenses/bulk`
**Create multiple expenses in one request (batch create)**

**Authentication:** Required (Bearer token)

**Request Body:**
```json
[
  {
    "amount": 500,
    "description": "Grocery shopping",
    "category": "Groceries",
    "date": "2026-03-25"
  },
  {
    "amount": 50,
    "description": "Gas",
    "category": "Fuel",
    "date": "2026-03-25"
  }
]
```

**Database Operations:**
- Create: `Expense.insertMany()` - Batch insert up to 100 expenses
- Validation: Validate each expense before insertion
- Error Handling: Tracks failed and successful insertions

**Response (200):**
```json
{
  "success": true,
  "data": {
    "created": [
      {
        "_id": "64a1b2c3d4e5f6g7h8i9j0",
        "description": "Grocery shopping",
        "amount": 500,
        "category": "Groceries",
        "date": "2026-03-25"
      }
    ],
    "failed": [
      {
        "index": 1,
        "description": "Invalid expense",
        "error": "Amount must be positive"
      }
    ],
    "stats": {
      "total": 2,
      "success": 1,
      "failed": 1
    }
  }
}
```

**Constraints:**
- Maximum 100 expenses per request
- Each expense must be valid (amount > 0)

**Error Cases:**
- `400` - Empty array or invalid JSON
- `400` - Batch size exceeds 100
- `401` - Unauthorized

---

### `DELETE /api/expenses/bulk/delete`
**Delete multiple expenses in one request (batch delete)**

**Authentication:** Required (Bearer token)

**Request Body:**
```json
{
  "ids": [
    "64a1b2c3d4e5f6g7h8i9j0",
    "64a1b2c3d4e5f6g7h8i9j1",
    "64a1b2c3d4e5f6g7h8i9j2"
  ]
}
```

**Database Operations:**
- Query: `Expense.find({ _id: { $in: ids }, userId })` - Fetch all expenses to verify ownership
- Delete: `Expense.deleteMany({ _id: { $in: ids }, userId })` - Remove all matching expenses
- Ownership Check: Only deletes expenses belonging to authenticated user

**Response (200):**
```json
{
  "success": true,
  "message": "3 expenses deleted successfully",
  "deletedCount": 3
}
```

**Error Cases:**
- `400` - Missing ids array
- `401` - Unauthorized
- `403` - Attempting to delete other user's expenses

---

### `GET /api/expenses/report`
**Generate comprehensive expense report with analytics**

**Authentication:** Required (Bearer token)

**Database Operations:**
- Query: `Expense.find({ userId })` - Fetch all user expenses
- Aggregation:
  - Calculate total amount: `sum(amount)`
  - Count expenses: `count()`
  - Calculate average: `sum(amount) / count()`
  - Find highest: `max(amount)`
  - Find lowest: `min(amount)`
  - Calculate range: `max - min`
  - Group by category: Aggregate and sum amounts per category
- Sort: `sort({ date: -1 })` - Newest first

**Response (200):**
```json
{
  "success": true,
  "stats": {
    "totalAmount": 5500,
    "expenseCount": 12,
    "averageExpense": 458.33,
    "highestExpense": 1200,
    "lowestExpense": 50,
    "spendingRange": 1150
  },
  "breakdown": [
    {
      "category": "Groceries",
      "amount": 2000,
      "percentage": 36.36
    },
    {
      "category": "Restaurants",
      "amount": 800,
      "percentage": 14.55
    }
  ]
}
```

---

## 💳 Budget Endpoints

### `GET /api/budgets`
**Fetch all budgets for current month with spending progress**

**Authentication:** Required (Bearer token)

**Query Parameters:**
- `month` (optional) - Month number (1-12), defaults to current
- `year` (optional) - Year, defaults to current

**Database Operations:**
- Query: `Budget.find({ userId, month, year })` - Fetch budgets for specified period
- For each budget:
  - Calculate month date range: `new Date(year, month-1, 1)` to `new Date(year, month, 0, 23:59:59)`
  - Query: `Expense.find({ userId, date: { $gte: monthStart, $lte: monthEnd }, category (if category budget) })`
  - Sum expenses: `spent = sum(amount)`
  - Calculate metrics: `remaining = budget - spent`, `percentageUsed = (spent / budget) * 100`

**Response (200):**
```json
{
  "success": true,
  "budgets": [
    {
      "_id": "64a1b2c3d4e5f6g7h8i9j0",
      "userId": "64a1b2c3d4e5f6g7h8i9j1",
      "type": "overall",
      "amount": 50000,
      "month": 3,
      "year": 2026,
      "spent": 8500,
      "remaining": 41500,
      "percentageUsed": 17
    },
    {
      "_id": "64a1b2c3d4e5f6g7h8i9j2",
      "userId": "64a1b2c3d4e5f6g7h8i9j1",
      "type": "category",
      "category": "Groceries",
      "amount": 5000,
      "month": 3,
      "year": 2026,
      "spent": 3200,
      "remaining": 1800,
      "percentageUsed": 64
    }
  ]
}
```

---

### `POST /api/budgets`
**Create or update a budget (upsert)**

**Authentication:** Required (Bearer token)

**Request Body:**
```json
{
  "type": "category",
  "category": "Groceries",
  "amount": 5000
}
```

**Database Operations:**
- Query: `Budget.findOne({ userId, type, category, month, year })` - Check if budget exists
- Upsert: Uses MongoDB unique index on `(userId, type, category, month, year)`
  - If exists: `Budget.findOneAndUpdate()` - Update amount
  - If not exists: `Budget.create()` - Create new budget
- Automatic month/year: Set to current month/year if not provided

**Response (200/201):**
```json
{
  "success": true,
  "message": "Budget created successfully",
  "budget": {
    "_id": "64a1b2c3d4e5f6g7h8i9j0",
    "userId": "64a1b2c3d4e5f6g7h8i9j1",
    "type": "category",
    "category": "Groceries",
    "amount": 5000,
    "month": 3,
    "year": 2026
  }
}
```

**Validation:**
- `type` must be "overall" or "category"
- `category` required if type is "category"
- `amount` must be positive number

**Error Cases:**
- `400` - Invalid budget type
- `400` - Missing category for category budget
- `400` - Invalid amount

---

### `DELETE /api/budgets/[id]`
**Delete a specific budget**

**Authentication:** Required (Bearer token)

**URL Parameters:**
- `id` - Budget MongoDB ObjectId

**Database Operations:**
- Query: `Budget.findById(id)` - Fetch budget by ID
- Verify: Check userId matches authenticated user
- Delete: `Budget.findByIdAndDelete(id)` - Remove budget from database

**Response (200):**
```json
{
  "success": true,
  "message": "Budget deleted successfully"
}
```

**Error Cases:**
- `400` - Invalid budget ID format
- `403` - User doesn't own this budget
- `404` - Budget not found

---

## 📊 Database Models Summary

### Expense Schema
```
{
  _id: ObjectId,
  userId: ObjectId (indexed),
  amount: Number (required),
  description: String (required),
  category: String (required),
  date: Date (required),
  createdAt: Date (auto)
}
```

### Budget Schema
```
{
  _id: ObjectId,
  userId: ObjectId (indexed),
  type: "overall" | "category" (required),
  category: String (optional, for category budgets),
  amount: Number (required),
  month: Number (1-12),
  year: Number,
  unique index on (userId, type, category, month, year)
}
```

### User Schema
```
{
  _id: ObjectId,
  email: String (unique, indexed),
  password: String (hashed with bcrypt),
  fullName: String,
  createdAt: Date (auto)
}
```

---

## 🔒 Authentication Flow

All endpoints except `/api/auth/*` require Bearer token authentication:

```
Authorization: Bearer eyJhbGciOiJIUzI1NiIs...
```

**How it works:**
1. User registers or logs in via auth endpoints
2. Receives JWT token with userId encoded
3. Includes token in Authorization header for subsequent requests
4. `withAuth` middleware validates token and extracts userId
5. All database queries filtered by authenticated userId

---

## ⚡ Performance Optimizations

- **Batch Operations**: `/expenses/bulk` handles up to 100 creates in single request
- **Server-side Aggregation**: Report calculations done on backend, not client
- **Indexed Queries**: userId indexed on all collections for fast lookups
- **Lean Queries**: Use `.lean()` for read-only operations (no Mongoose overhead)
- **Unique Indexes**: Budget table prevents duplicate budget creation

---

## 🚨 Error Handling

All endpoints return consistent error format:

```json
{
  "success": false,
  "message": "Descriptive error message"
}
```

Common HTTP status codes:
- `200` - Success (GET, PUT)
- `201` - Created (POST with entity creation)
- `400` - Bad request (validation error)
- `401` - Unauthorized (missing/invalid token)
- `403` - Forbidden (ownership check failed)
- `404` - Not found (resource doesn't exist)
- `405` - Method not allowed
- `409` - Conflict (duplicate email on signup)
- `500` - Server error

---

## 🔄 Common Workflows

### Creating an Expense
1. `POST /api/auth/register` or `POST /api/auth/login` → Get token
2. `POST /api/expenses` with token → Create expense

### Batch Adding Expenses
1. Authenticate (get token)
2. `POST /api/expenses/bulk` with array of expenses → Multiple creates

### Checking Budget Status
1. Authenticate (get token)
2. `GET /api/budgets` → Fetch all budgets with calculated spent amount
3. Frontend uses `spent` and `percentageUsed` for progress bars

### Generating Financial Report
1. Authenticate (get token)
2. `GET /api/expenses/report` → Server calculates all metrics and breakdown

---

**Last Updated:** March 2026  
**API Version:** 1.0
