# CertiFlow

CertiFlow is a web application that automatically generates certificates from an Excel sheet and uploads them directly to Google Drive.

It is designed for events, workshops, hackathons, and conferences where organizers need to generate multiple certificates quickly.

## Live

https://certiflow-f7ni.onrender.com/
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
## Screenshots

<img width="1909" height="917" alt="image" src="https://github.com/user-attachments/assets/99d70fd7-8da5-43ed-838a-ee7689bd70dd" />
<img width="1905" height="903" alt="image" src="https://github.com/user-attachments/assets/904343f3-7227-4623-bbeb-01fca1cbfcfa" />
<img width="897" height="820" alt="image" src="https://github.com/user-attachments/assets/f3f4f5ad-0cf2-412c-88c5-968121b68e90" />
<img width="888" height="395" alt="image" src="https://github.com/user-attachments/assets/6ab6f98f-00e5-4526-a89c-6f5319ec2d31" />
<img width="886" height="724" alt="image" src="https://github.com/user-attachments/assets/94ac84a7-0c4e-44e8-bd2d-0f7e2bf06f5a" />






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
