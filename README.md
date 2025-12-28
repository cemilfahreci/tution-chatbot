# AI Tuition Chatbot

An AI-powered chatbot application for querying tuition status and making payments, integrated with the Tuition Payment System API from the midterm project.

## Source Code
- **Chatbot Repository**: https://github.com/cemilfahreci/tution-chatbot
- **Tuition API Repository**: https://github.com/cemilfahreci/TuitionPaymentSystemApi

## Demo Video
[YouTube Demo](https://www.youtube.com/watch?v=cGWJF7jVKiE)

---

## Technologies Used

| Layer | Technology |
|-------|------------|
| Frontend | React.js, Vite |
| Backend | Node.js, Express.js |
| Real-time | Socket.io (WebSocket) |
| AI/LLM | Ollama (Llama 3.2 - Local) |
| Database | Supabase (Message History) |
| API Gateway | Ocelot (.NET) |
| Styling | CSS3 |

---

## Architecture

```
┌─────────────────┐     WebSocket      ┌─────────────────┐
│   React.js      │◄──────────────────►│   Node.js       │
│   Frontend      │                    │   Backend       │
│   (Port 5173)   │                    │   (Port 3001)   │
└─────────────────┘                    └────────┬────────┘
                                                │
                                    ┌───────────┴───────────┐
                                    │                       │
                              ┌─────▼─────┐          ┌──────▼──────┐
                              │  Ollama   │          │  Tuition    │
                              │  LLM      │          │  API        │
                              │  (11434)  │          │  Gateway    │
                              └───────────┘          │  (Render)   │
                                                     └─────────────┘
```

**Flow:**
1. User sends message via WebSocket
2. Backend receives message and calls Ollama for intent parsing
3. Based on intent, backend calls Tuition API (via gateway)
4. Response is sent back to frontend in real-time
5. Messages are saved to Supabase for history

---

## How to Run

### Prerequisites
- Node.js v18+
- Ollama with `llama3.2` model installed
- TuitionPaymentSystemApi running (or use Render deployment)

### 1. Clone the Repository
```bash
git clone https://github.com/cemilfahreci/tution-chatbot.git
cd tution-chatbot
```

### 2. Install Ollama & Model
```bash
# Install Ollama (macOS)
brew install ollama

# Pull the model
ollama pull llama3.2

# Start Ollama
ollama serve
```

### 3. Setup Backend
```bash
cd backend
cp .env.example .env
# Edit .env with your configuration
npm install
npm run dev
```

### 4. Setup Frontend
```bash
cd frontend
cp .env.example .env
npm install
npm run dev
```

### 5. Open Application
Navigate to `http://localhost:5173`

---

## Design, Assumptions, and Issues

### Design Decisions
1. **Local LLM (Ollama)**: Used Llama 3.2 via Ollama instead of OpenAI to meet the requirement "Project does NOT need to be deployed to a cloud app service if you are using a local LLM". This ensures data privacy and zero cost.

2. **API Gateway Pattern**: All chatbot traffic is routed through the Ocelot API Gateway (TuitionPaymentSystemApi), strictly adhering to the architectural requirement.

3. **WebSocket Communication**: Implemented Socket.io for robust bidirectional real-time communication between frontend and backend.

4. **Supabase for Persistence**: Utilized Supabase for storing message history, enabling conversation persistence across sessions.

### Assumptions
1. **Local Environment**: The system assumes Ollama is running locally on port 11434 with the `llama3.2` model installed.

2. **Midterm API Availability**: The TuitionPaymentSystemApi is deployed on Render and accessible at `https://tuitionpaymentsystemapi-1.onrender.com`.

3. **Authentication**: The chatbot uses standard `admin/admin123` credentials for the Tuition API authentication.

4. **Rate Limiting**: The API enforces a rate limit of 3 requests per student per day, which the chatbot handles gracefully with user-friendly messages.

### Issues Encountered
1. **Rate Limit Handling**: Initially, the chatbot did not distinguish between a network error and a rate limit hit. Implemented specific error handling for HTTP 429 status codes and the "quota exceeded" message.

2. **Locale Number Parsing**: The payment amount was initially formatted using `toLocaleString()` (e.g., "19.481"), which caused parsing errors. Resolved by passing raw numeric values.

3. **Student Not Found**: Users entering invalid student numbers received raw 404 errors. Added a check to catch 404s and return a helpful "Student not found" message.

4. **OpenAI to Local LLM Migration**: Switching from OpenAI to Ollama required rewriting the `agent.js` logic, as local models do not natively support OpenAI's structured Function Calling. Implemented a simplified intent parsing system for Llama 3.2.

---

## Students (Test Data)

| Student No | Name | Term |
|------------|------|------|
| 100 | SUDE KARAKAYA | Fall2024 |
| 101 | DOĞUKAN YEŞİLKAYA | Spring2025 |
| 102 | BAŞAR ÖZKAŞLI | Fall2024 |
| 103 | TEVFİK EFE AYDIN | Spring2025 |
| 104 | KAAN YILMAZ | Fall2024 |
| 105 | HÜSEYİN BALCI | Spring2025 |
| 106 | MELİSA ŞENER | Fall2024 |
| 114 | CEMİL FAHRECİ | Fall2024 |

---

## License
This project was developed for SE4458 - Software Architecture course.
