## Tables

### `users`


| Column    | Type          | Constraints           | Notes                       |
|-----------|---------------|-----------------------|-----------------------------|
| `id`      | SERIAL        | PRIMARY KEY           | Auto-incrementing user ID   |
| `username`| VARCHAR(255)  | UNIQUE, NOT NULL      | Chosen username             |
| `password`| VARCHAR(255)  | NOT NULL              | Plaintext for now (will migrate to hashed with bcrypt later) |

**SQL definition:**
```sql
CREATE TABLE users (
  id SERIAL PRIMARY KEY,
  username VARCHAR(255) UNIQUE NOT NULL,
  password VARCHAR(255) NOT NULL
);
