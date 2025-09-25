---

````markdown
## Tables

### `users`

| Column     | Type          | Constraints           | Notes                                         |
|------------|---------------|-----------------------|-----------------------------------------------|
| `id`       | SERIAL        | PRIMARY KEY           | Auto-incrementing user ID                     |
| `username` | VARCHAR(255)  | UNIQUE, NOT NULL      | Chosen username                               |
| `password` | VARCHAR(255)  | NOT NULL              | Plaintext for now (will migrate to bcrypt)    |

**SQL definition:**
```sql
CREATE TABLE users (
  id SERIAL PRIMARY KEY,
  username VARCHAR(255) UNIQUE NOT NULL,
  password VARCHAR(255) NOT NULL
);
````

---

### `sessions`

| Column       | Type         | Constraints               | Notes                                    |
| ------------ | ------------ | ------------------------- | ---------------------------------------- |
| `session_id` | VARCHAR(255) | PRIMARY KEY               | Randomly generated session token         |
| `user_id`    | INT          | REFERENCES users(id)      | Associated user                          |
| `created_at` | TIMESTAMP    | DEFAULT CURRENT_TIMESTAMP | When the session was created             |
| `expires_at` | TIMESTAMP    |                           | Optional expiry time (e.g. 1 hour later) |

**SQL definition:**

```sql
CREATE TABLE sessions (
  session_id VARCHAR(255) PRIMARY KEY,
  user_id INT REFERENCES users(id),
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  expires_at TIMESTAMP
);
```
