# CertiFlow

CertiFlow is a web application that automatically generates certificates from an Excel sheet and uploads them directly to Google Drive.

It is designed for events, workshops, hackathons, and conferences where organizers need to generate multiple certificates quickly.

---

Features

- Generate certificates automatically from an Excel sheet
- Upload certificates directly to Google Drive
- Drag-and-drop interface for uploading files
- Auto-center participant names on certificates
- Customizable font size and position
- Secure Google OAuth login
- Modern dashboard UI

---

Tech Stack

Frontend

- HTML
- CSS
- JavaScript

Backend

- Node.js
- Express.js

Libraries & APIs

- Passport.js (Google OAuth)
- Google Drive API
- Multer (file uploads)
- XLSX (Excel parsing)
- pdf-lib (certificate generation)

---

How It Works

1. User logs in with Google.
2. Uploads an Excel file containing participant names.
3. Uploads a certificate template (PDF).
4. CertiFlow generates certificates for each participant.
5. Certificates are uploaded to the user's Google Drive.
6. A folder link is provided for easy access.

---

Installation

Clone the repository

git clone https://github.com/Aavani142/CertiFlow.git
cd CertiFlow

Install dependencies

npm install

Create a ".env" file

GOOGLE_CLIENT_ID=your_client_id
GOOGLE_CLIENT_SECRET=your_client_secret
SESSION_SECRET=your_secret
CALLBACK_URL=http://localhost:5000/auth/google/callback

Run the server

node server.js

Open in browser

http://localhost:5000

---

Project Structure

CertiFlow
│
├── public
│   ├── index.html
│   ├── dashboard.html
│   ├── connect.html
│   └── success.html
│
├── services
│   └── googleDrive.js
│
├── server.js
├── package.json
└── .env

---

Deployment

The application can be deployed using platforms like:

- Render

Make sure environment variables are configured in the hosting platform.

---

Security

Sensitive credentials such as API keys and OAuth secrets are stored in environment variables and not committed to the repository.

---

Future Improvements

- Email certificates automatically
- Download all certificates as ZIP
- Certificate preview editor
- Admin dashboard
- Template customization

---

Author

Aavani

GitHub: https://github.com/Aavani142

---

License

This project is open-source and available for educational and personal use.