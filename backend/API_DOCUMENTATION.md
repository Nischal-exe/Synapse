# Synapse API Documentation

This document describes all available API endpoints for the Synapse backend.

## 🔑 Authentication
All endpoints (except the root `/`) require a **Bearer Token** in the header.
`Authorization: Bearer <your_jwt_token>`

| Endpoint | Method | Description | Request Body |
| :--- | :--- | :--- | :--- |
| `/auth/sync` | `POST` | Sync Supabase user with DB. | `{"username": "string", "full_name": "string", "date_of_birth": "YYYY-MM-DD"}` |

---

## 👤 Users
| Endpoint | Method | Description | Response |
| :--- | :--- | :--- | :--- |
| `/users/me` | `GET` | Returns the profile of the logged-in user. | `{"id": int, "username": "str", "role": "str", ...}` |
| `/users/me/sidebar` | `GET` | Returns a list of rooms the user has joined. | `{"joined_rooms": [...]}` |

---

## 🛡️ Moderator (Admin/Mod Only)
| Endpoint | Method | Role | Description |
| :--- | :--- | :--- | :--- |
| `/moderator/posts` | `GET` | Mod/Admin | **Moderator Queue**: Get list of all recent posts. |
| `/moderator/posts/{id}` | `DELETE` | Mod/Admin | **Moderator Action**: Delete any post by ID. |

---

## 🏘️ Rooms
| Endpoint | Method | Role | Description | Request Body |
| :--- | :--- | :--- | :--- | :--- |
| `/rooms/` | `GET` | Any | List all rooms. | None |
| `/rooms/` | `POST` | **Admin** | Create a room. | `{"name": "string", "description": "string"}` |
| `/rooms/{id}` | `DELETE` | **Admin** | Delete a room. | None |
| `/rooms/{id}/join` | `POST` | Any | Join/Leave a room. | None |
| `/rooms/{id}/messages` | `GET` | Any | Fetch chat messages. | None |
| `/rooms/{id}/messages` | `POST` | Any | Send a chat message. | `{"content": "string"}` |
| `/rooms/messages/{id}` | `DELETE` | **Admin** | Delete a message. | None |

---

## 📝 Posts
| Endpoint | Method | Role | Description | Request Body |
| :--- | :--- | :--- | :--- | :--- |
| `/posts/` | `GET` | Any | Get all posts. | None (Query param: `room_id`) |
| `/posts/` | `POST` | Any | Create a post. | `{"title": "string", "content": "string", "room_id": int}` |
| `/posts/{id}` | `GET` | Any | Get post details. | None |
| `/posts/{id}` | `DELETE` | **Admin** | Delete a post (Legacy/Admin). | None |
| `/posts/comments/{id}` | `DELETE` | **Admin** | Delete a comment. | None |

---

## 💬 Comments
| Endpoint | Method | Role | Description | Request Body |
| :--- | :--- | :--- | :--- | :--- |
| `/posts/{post_id}/comments` | `GET` | Any | Get post comments. | None |
| `/posts/{post_id}/comments` | `POST` | Any | Post a comment. | `{"content": "string", "parent_id": int/null}` |

---

## ❤️ Likes
| Endpoint | Method | Role | Description |
| :--- | :--- | :--- | :--- |
| `/posts/{post_id}/like` | `POST` | Any | Toggle Like/Unlike. |
| `/posts/{post_id}/likes` | `GET` | Any | Get like count. |

---

## 🛠️ Development Tools
- **Swagger Documentation**: [http://localhost:8000/docs](http://localhost:8000/docs)
- **Make Admin Script**: `python make_admin.py <username>`
- **Test Token Generator**: `python generate_test_token.py <username> <email>`
- **CSV User Seeder**: `python seed_users_from_csv.py`