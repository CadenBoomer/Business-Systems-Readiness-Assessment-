# Business Systems Pathway Assessment Tool

A full-stack web application that assesses a service-based entrepreneur's business systems readiness and classifies them into one of three pathways: Foundation, Growth, or Optimization.

---

## Tech Stack

| Layer | Technology |
|---|---|
| Frontend | Angular 21+ (standalone components) |
| Backend | Node.js / Express |
| Database | MySQL |
| ML API | FastAPI
| AI Narrative | Anthropic Claude (claude-sonnet-4-20250514) |
| PDF Generation | PDFKit |
| Email | Nodemailer (Gmail) |
| Webhook | Make → GoHighLevel |

---

## Project Structure

```
Business-Systems-Readiness-Assessment/
├── backend/
│   ├── src/
│   │   ├── controllers/
│   │   │   ├── assessmentController.js   # ML + Claude + submission logic
│   │   │   ├── authController.js         # Admin login + credentials
│   │   │   ├── answerController.js       # Answer options CRUD
│   │   │   ├── questionController.js     # Questions CRUD
│   │   │   ├── pdfController.js          # PDF download endpoint
│   │   │   ├── settingsController.js     # CTA settings CRUD
│   │   │   └── pathwayController.js      # Pathway descriptions CRUD
│   │   ├── models/
│   │   │   └── db.js                     # MySQL connection pool
│   │   ├── routes/                       # Express route definitions
│   │   ├── services/
│   │   │   ├── pdfService.js             # PDFKit PDF generation
│   │   │   └── email.js                  # Nodemailer email sending
│   │   ├── middleware/
│   │   │   └── authMiddleware.js         # JWT verification
│   │   └── assets/                       # Fonts and logo for PDF
│   ├── server.js
│   └── .env                              # Environment variables (not in git)
│
└── frontend/
    └── src/app/
        ├── components/
        │   ├── assessment/               # 12-question assessment
        │   ├── email-gate/               # Name/email capture form
        │   └── results/                  # Streaming results display
        └── admin/
            ├── login/                    # Admin login page
            └── dashboard/                # Admin dashboard (5 tabs)
```

---

## Local Setup

### Prerequisites

- Node.js v24
- MySQL 8+
- Angular CLI (`npm install -g @angular/cli`)

### 1. Clone the repository

```bash
git clone <repo-url>
cd Business-Systems-Readiness-Assessment
```

### 2. Backend setup

```bash
cd backend
npm install
```

Create a `.env` file based on `.env.example`:

```bash
cp .env.example .env
```

Fill in all required values in `.env`.

### 3. Database setup

Create the database in MySQL:

```sql
CREATE DATABASE riipen_business_assessment;
```

Run the schema to create all tables:

```sql
USE riipen_business_assessment;

CREATE TABLE submissions (
  id INT AUTO_INCREMENT PRIMARY KEY,
  first_name VARCHAR(255),
  last_name VARCHAR(255),
  email VARCHAR(255),
  answers JSON,
  pathway VARCHAR(255),
  reasoning TEXT,
  confidence_score FLOAT,
  summary TEXT,
  priority_actions JSON,
  anti_priority_warnings JSON,
  graduation_outlook TEXT,
  class_probabilities JSON,
  narrative_report TEXT,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE questions (
  id INT AUTO_INCREMENT PRIMARY KEY,
  question_text TEXT,
  display_order INT,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE answer_options (
  id INT AUTO_INCREMENT PRIMARY KEY,
  question_id INT,
  answer_text TEXT,
  display_order INT
);

CREATE TABLE admin (
  id INT AUTO_INCREMENT PRIMARY KEY,
  username VARCHAR(255),
  password VARCHAR(255),
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE settings (
  id INT AUTO_INCREMENT PRIMARY KEY,
  setting_key VARCHAR(255),
  setting_value TEXT,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);

CREATE TABLE pathways (
  id INT AUTO_INCREMENT PRIMARY KEY,
  pathway_name VARCHAR(255),
  description TEXT,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);
```

Seed the admin user (replace with your own credentials):

```bash
node scripts/seedAdmin.js
```

Seed the default settings:

```sql
INSERT INTO settings (setting_key, setting_value) VALUES
('cta_button_text', 'Explore The Website Membership'),
('cta_button_url', 'https://thewebsitemembership.com'),
('cta_description', 'Your full results report is attached as a PDF. Ready to take the next step?');
```

Seed the pathways:

```sql
INSERT INTO pathways (pathway_name, description) VALUES
('Foundation', 'You are building the core systems your business needs to run consistently.'),
('Growth', 'Your core systems are in place and you are ready to scale.'),
('Optimization', 'Your systems are strong and you are optimizing for maximum efficiency.');
```

### 4. Frontend setup

```bash
cd frontend
npm install
```

### 5. Run the app

**Terminal 1 — Backend:**
```bash
cd backend
node server.js
```

**Terminal 2 — Frontend:**
```bash
cd frontend
ng serve or ng serve -o
```

Open `http://localhost:4200` in your browser.

---

## Environment Variables

See `.env.example` for all required variables. Key variables:

| Variable | Description |
|---|---|
| `PORT` | Backend port (default 3000) |
| `DB_HOST` | MySQL host |
| `DB_USER` | MySQL username |
| `DB_PASSWORD` | MySQL password |
| `DB_NAME` | Database name |
| `ML_API_URL` | Abhay's ML API base URL |
| `ADMIN_USERNAME` | Initial admin username |
| `ADMIN_PASSWORD` | Initial admin password |
| `JWT_SECRET` | Secret for signing JWT tokens |
| `EMAIL_USER` | Gmail address for sending results |
| `EMAIL_PASS` | Gmail app password |
| `WEBHOOK_URL` | Make webhook URL for GoHighLevel |
| `ANTHROPIC_API_KEY` | Anthropic API key for Claude |

---

## Key Features

### Assessment Flow
1. User completes 12-question assessment
2. Navigates to email gate to enter their details
3. Results page opens immediately and streams results in real time
4. ML API classifies the user into Foundation / Growth / Optimization
5. Claude generates a personalized narrative report (streamed word by word)
6. Results saved to database
7. PDF generated and emailed to user
8. Webhook fires to GoHighLevel via Make

### Streaming (SSE)
The assessment uses Server-Sent Events (SSE) for real-time streaming:
- `status` — loading messages
- `ml_results` — pathway and ML data (sent immediately when ML responds)
- `narrative_chunk` — Claude text chunks (streamed word by word)
- `complete` — final event with submission ID
- `error` — error event if something fails

### Admin Panel
Located at `/admin/login`. Five tabs:
- **Questions** — edit question and answer wording (edit only — ML requires exactly 12 questions with 4 options each)
- **Submissions** — view all submissions with pagination and search by name/email, download PDFs
- **Settings** — edit CTA button text, URL and description
- **Pathways** — edit pathway descriptions
- **Account** — change admin username and password

---

## ML API

- **Production URL:** `https://business-api.thewebsitemembership.com`
- **Health check:** `GET /health`
- **Predict:** `POST /predict`

Request format:
```json
{
  "first_name": "Sarah",
  "responses": {
    "q1": "A", "q2": "B", "q3": "C",
    "q4": "D", "q5": "A", "q6": "B",
    "q7": "C", "q8": "D", "q9": "A",
    "q10": "B", "q11": "C", "q12": "D"
  }
}
```

The ML model requires exactly 12 questions with answers A, B, C, or D.

---

## Deployment

### Frontend (Angular)

Build for production:
```bash
cd frontend
ng build --configuration production
```

Upload the contents of `dist/` to the web root of `assessment.thewebsitemembership.com`.

### Backend (Node.js)

Deploy to cPanel using the Node.js app manager:
1. Set the application root to the `backend` folder
2. Set the startup file to `server.js`
3. Add all environment variables from `.env`
4. Start the application

### Before deploying
- Replace all `localhost:3000` URLs with the production backend URL
- Update `.env` with Julie's credentials
- Uncomment the webhook in `assessmentController.js`
- Remove any remaining test data from the database
- Set `JWT_SECRET` to a long random string

---

## Important Notes

- The ML model requires **exactly 12 questions** with **exactly 4 answer options** each. Do not add or remove questions or options without consulting the ML engineer.
- Answer options must maintain their order — Option A = least developed, Option D = most developed.
- The three pathway names (Foundation, Growth, Optimization) are hardcoded in the ML model. Do not rename them.
- Prompt caching is enabled on the Claude system prompt (`cache_control: ephemeral`) to reduce latency and cost on repeated requests.
- PDF and email are generated in the background after the complete event is sent to the frontend — they do not block the user experience.

---

