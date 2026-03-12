# FixMate - Data Storage & Model Documentation

This document describes how data is structured and stored within the FixMate ecosystem. It is intended for developers who need to connect other applications (e.g., Worker App, Admin Dashboard) to the same data source.

---

## 🏗️ Storage Architecture

- **Primary Database:** Firebase Firestore (NoSQL Document Store)
- **Authentication:** Firebase Authentication
- **File Storage:** Firebase Storage (for images and documents)

---

## 📂 Collections & Data Models

### 1. `users` Collection

Stores profile information for all users (Customers, Workers, and Admins).

| Field          | Type      | Description                                             |
| :------------- | :-------- | :------------------------------------------------------ |
| `uid`          | String    | Unique ID from Firebase Auth                            |
| `fullName`     | String    | User's full name                                        |
| `email`        | String    | User's email address                                    |
| `phone`        | String    | Contact number                                          |
| `role`         | String    | Role of the user: `customer`, `worker`, or `admin`      |
| `profileImage` | String    | URL to the profile picture (Firebase Storage)           |
| `address`      | String    | Primary address                                         |
| `city`         | String    | City of residence                                       |
| `location`     | Object    | `{ latitude: Number, longitude: Number }`               |
| `status`       | String    | Account status: `active`, `pending_approval`, `blocked` |
| `createdAt`    | Timestamp | Server-side creation time                               |

---

### 2. `categories` Collection

Defines the types of services available on the platform.

| Field         | Type   | Description                                 |
| :------------ | :----- | :------------------------------------------ |
| `id`          | String | Unique category slug (e.g., `cat_plumbing`) |
| `name`        | String | Display name (e.g., `Plumbing`)             |
| `icon`        | String | Material Design Icon name                   |
| `color`       | String | Hex code for UI representation              |
| `description` | String | Brief summary of services in this category  |

---

### 3. `workers` Collection

Contains detailed information for service providers. Linked to `users` via ID.

| Field         | Type    | Description                                  |
| :------------ | :------ | :------------------------------------------- |
| `id`          | String  | Matching `uid` from the users collection     |
| `name`        | String  | Worker's display name                        |
| `categoryId`  | String  | Foreign key to the `categories` collection   |
| `category`    | String  | Category name (denormalized for performance) |
| `hourlyRate`  | Number  | Rate in LKR                                  |
| `rating`      | Number  | Average star rating (0.0 to 5.0)             |
| `reviews`     | Number  | Total count of reviews received              |
| `location`    | String  | Base service location                        |
| `isAvailable` | Boolean | Real-time availability status                |
| `experience`  | Number  | Years of experience                          |
| `description` | String  | Professional bio                             |

---

### 4. `requests` Collection

Stores service requests (jobs) created by customers.

| Field         | Type      | Description                                                                |
| :------------ | :-------- | :------------------------------------------------------------------------- |
| `id`          | String    | Firestore Auto-ID                                                          |
| `userId`      | String    | UID of the customer who created the request                                |
| `workerId`    | String    | UID of the assigned worker (null if pending)                               |
| `serviceType` | String    | Name of the service category                                               |
| `description` | String    | Detailed description of the problem                                        |
| `urgency`     | String    | `low`, `normal`, or `high`                                                 |
| `photos`      | Array     | List of URLs to job-related images                                         |
| `status`      | String    | Status flow: `pending` → `accepted` → `in_progress` → `completed` → `paid` |
| `location`    | Object    | Detailed location data (see below)                                         |
| `createdAt`   | Timestamp | Time when the request was posted                                           |

**`location` Object Structure:**

```json
{
  "address": "123 Main St, Colombo",
  "date": "2024-03-25",
  "time": "10:30 AM",
  "isFlexible": false,
  "accessNotes": "Gate code is 1234"
}
```

---

### 5. `conversations` Collection

Manages real-time chat sessions between customers and workers.

| Field                | Type      | Description                               |
| :------------------- | :-------- | :---------------------------------------- |
| `participants`       | Array     | Array of UIDs: `[customerUid, workerUid]` |
| `lastMessage`        | String    | Snippet of the latest message             |
| `lastMessageTime`    | Timestamp | Time of the latest activity               |
| `unreadCount`        | Number    | Number of unread messages                 |
| `participantDetails` | Map       | Cached names/avatars for UI display       |

#### Sub-collection: `messages`

Nested under `conversations/{id}/messages`.

| Field       | Type      | Description                       |
| :---------- | :-------- | :-------------------------------- |
| `text`      | String    | Message content                   |
| `senderId`  | String    | UID of the message sender         |
| `type`      | String    | `text`, `image`, or `system`      |
| `image`     | String    | Image URL (optional)              |
| `read`      | Boolean   | Whether the recipient has seen it |
| `createdAt` | Timestamp | Message timestamp                 |

---

### 6. `payments` Collection

Tracks financial transactions for completed jobs.

| Field           | Type   | Description                               |
| :-------------- | :----- | :---------------------------------------- |
| `jobId`         | String | Link to the `requests` collection         |
| `customerId`    | String | Payer UID                                 |
| `workerId`      | String | Payee UID                                 |
| `totalAmount`   | Number | Total paid by customer                    |
| `commission`    | Number | Platform fee (default 10%)                |
| `workerEarning` | Number | Net amount for worker (90%)               |
| `status`        | String | `pending` or `paid`                       |
| `gatewayRef`    | String | Reference ID from PayHere/payment gateway |

---

### 7. `reviews` Collection

Stores feedback left by customers after a job is completed.

| Field        | Type      | Description                            |
| :----------- | :-------- | :------------------------------------- |
| `jobId`      | String    | Link to the `requests` collection      |
| `customerId` | String    | UID of the customer giving the review  |
| `workerId`   | String    | UID of the worker receiving the review |
| `rating`     | Number    | Star rating (1-5)                      |
| `reviewText` | String    | Written comment                        |
| `createdAt`  | Timestamp | Review submission time                 |

---

## 🔗 Relationships Summary

- **Customer to Request:** 1-to-Many (`requests.userId`)
- **Worker to Request:** 1-to-Many (`requests.workerId`)
- **Category to Worker:** 1-to-Many (`workers.categoryId`)
- **Conversation to Request:** Usually 1-to-1 or 1-to-Many between the same participants concerning a job.
- **User to Worker Details:** 1-to-1 via shared `id/uid`.

---

## 🔐 Authentication & Security

- **Provider:** Firebase Email/Password or Google Auth.
- **Security Rules:** Access should be restricted so users can only read their own requests and profile data, while public data like `categories` and `workers` (partial) can be read by all authenticated users.

---

> [!NOTE]
> All timestamps in Firestore are stored as `firebase.firestore.Timestamp` objects. When reading from the database, ensure your application handles these correctly (e.g., converting to Date objects).
