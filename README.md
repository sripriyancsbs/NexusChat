# NexusChat
> *"Private conversations. Connected community."*

NexusChat is a modern, privacy-focused community communication and messaging platform inspired by collaborative workspaces like Slack, built with an original visual identity, a dark-first aesthetic, and a strictly enforced administrative privacy boundary.

---

## 1. Project Overview & Problem Statement

Modern team messaging platforms often provide administrators and moderators with unrestricted, opaque access to all messages, conversations, and direct communications across the entire workspace. For many communities, sensitive interest groups, and privacy-conscious teams, this creates an inherent conflict of trust.

NexusChat bridges the gap between structured community administration and personal communication privacy:
- **Administrators** can manage accounts, approve community access requests, configure roles, inspect active sessions, revoke credentials, and review security events.
- **Administrators CANNOT** generally access, inspect, or browse users' private channels, private group conversations, or direct messages.

> [!IMPORTANT]
> **Privacy Model Declaration:**
> The administrator interface is restricted from general private conversation access at the application layer. This is not equivalent to end-to-end encryption. Database queries and WebSocket multicasting enforce conversation membership boundaries to prevent horizontal and vertical privilege escalation.

---

## 2. Core User Roles

1. **MEMBER:**
   - Participates in public community channels.
   - Creates and joins authorized private channels and private group conversations.
   - Sends direct messages (DMs) to fellow community members.
   - Edits and deletes own messages (with visible `edited` or deletion notices).
   - Replies in threads, adds reactions, pins important messages, searches authorized conversations.
   - Manages personal profile, status, presence, and notification preferences.

2. **MODERATOR:**
   - Moderates public channels where granted channel-level permissions.
   - Handles reported content strictly within the isolated report workflow.
   - Mutes or takes corrective moderation actions within authorized scopes.
   - *Has NO unrestricted access to private direct messages or unrelated private channels.*

3. **ADMIN:**
   - Approves or rejects community access requests.
   - Manages user accounts (activation, deactivation, suspension, deletion).
   - Assigns and updates platform roles without self-escalation.
   - Inspects active login sessions, revokes sessions, and forces logout.
   - Monitors security logs, authentication failures, and platform audit events.
   - *Has NO general message viewer and cannot invoke endpoints returning unauthorized private messages.*

---

## 3. Technology Stack

- **Frontend:** React.js, JavaScript (ESM), HTML5, Vanilla CSS design token system (Dark-first charcoal theme, responsive 375px to 1440px).
- **Backend:** Node.js, Express.js.
- **Database:** PostgreSQL with relational integrity, foreign keys, and indexes.
- **Real-Time:** WebSocket-based messaging (`ws`) with authenticated handshakes and strictly authorized room multicasting.
- **Security:** bcrypt password hashing, session revocation, rate-limiting, parameterized queries, and sanitized audit trails.
- **CI/CD:** GitHub Actions.
- **Deployment:** Vercel-compatible client build + persistent WebSocket Node.js backend.

---

## 4. Architecture & Directory Layout

```
NexusChat/
├── .github/workflows/ci.yml       # Continuous Integration pipeline
├── client/                        # Frontend React Application (Vite)
│   ├── public/                    # Static assets & favicons
│   ├── src/
│   │   ├── components/            # Chat, Admin, Common, Navigation components
│   │   ├── context/               # Auth, Socket, Chat, Theme React contexts
│   │   ├── pages/                 # Landing, Login, Member App, Admin pages
│   │   ├── services/              # HTTP API & WebSocket client adapters
│   │   ├── styles/                # Vanilla CSS tokens, themes, layouts
│   │   ├── App.jsx                # Application routing and route guards
│   │   └── main.jsx               # React entry point
│   ├── package.json
│   ├── vite.config.js
│   └── .env.example
├── server/                        # Backend Node.js / Express Application
│   ├── src/
│   │   ├── config/                # Database pool & environment loaders
│   │   ├── controllers/           # Auth, Users, Channels, Messages, Admin, Audit
│   │   ├── db/                    # PostgreSQL schema, migrations, seed data
│   │   ├── middleware/            # Auth, RBAC, Rate-limiting, Error sanitization
│   │   ├── routes/                # Scoped REST API routes
│   │   ├── services/              # Socket service, search, audit logging
│   │   ├── utils/                 # Safe logger (never logs message bodies)
│   │   ├── app.js                 # Express app definition
│   │   └── server.js              # Server bootstrapper & WebSocket listener
│   ├── tests/                     # Automated unit and security tests
│   ├── package.json
│   └── .env.example
├── .gitignore
├── .env.example                   # Master environment template
├── package.json                   # Monorepo workspace orchestrator
└── README.md
```

---

## 5. Architectural Privacy & Security Boundaries

1. **No Admin Message Viewing:**
   No endpoint such as `GET /api/admin/messages` exists. The admin portal intentionally lacks message browsing views.
2. **Database Query Scoping:**
   Messages are never fetched globally. Queries join `conversation_members` and public channel tables with parameterized user ID checks.
3. **WebSocket Event Isolation:**
   Events (`message:new`, `message:edit`, `message:delete`, `reaction:add`, `typing:start`) are broadcast exclusively to verified connection sockets registered in the target room.
4. **Audit Log Sanitization:**
   Administrative audit events capture operational details (actor, action code, target user ID, timestamp, IP) while explicitly stripping all message content.

---

## 6. Local Setup & Getting Started

### Prerequisites
- **Node.js:** v20+ LTS (Tested on Node.js v24)
- **NPM:** v10+
- **PostgreSQL:** v14+ instance running locally or via a cloud provider (Supabase / Neon / RDS)
- **Git**

### Installation

1. Clone the repository:
   ```bash
   git clone https://github.com/your-username/NexusChat.git
   cd NexusChat
   ```

2. Configure environment variables:
   ```bash
   cp .env.example .env
   cp server/.env.example server/.env
   cp client/.env.example client/.env
   ```

3. Install dependencies across workspaces:
   ```bash
   npm install
   ```

4. Run the development environments:
   - Run server:
     ```bash
     npm run dev:server
     ```
   - Run client:
     ```bash
     npm run dev:client
     ```

5. Access the applications:
   - **Frontend (Member Portal & Landing):** `http://localhost:5173`
   - **Admin Portal:** `http://localhost:5173/admin` (Requires ADMIN role authentication)
   - **Backend API & Health Check:** `http://localhost:5000/api/health`

---

## 7. Testing & Quality Assurance

Automated testing covers authentication, conversation authorization, search privacy boundaries, and admin controls:
```bash
npm test
```

---

## 8. Continuous Integration & Deployment

- **GitHub Actions:** Located in `.github/workflows/ci.yml`. Automatically validates client build and server test suites on every pull request to `main`.
- **Frontend Deployment:** Vercel-compatible static/SPA export (`npm run build`).
- **Backend Deployment:** Node.js long-running process with persistent WebSocket support (e.g., Render, Railway, Fly.io, or VPS).

---

## 9. Known Limitations & Future Enhancements

### Known Limitations in Version 1:
- Application-layer privacy boundary prevents administrator message snooping, but does not provide client-side End-to-End Encryption (E2EE).
- Attachment sizes in Version 1 are restricted to verified image and document formats with size caps.

### Documented Future Enhancements (Post-V1):
- Client-side End-to-End Encryption (E2EE) with double-ratchet key exchanges.
- WebRTC Voice and Video calls with peer-to-peer media streaming.
- Multi-tenant workspace partitioning for enterprise organizations.
