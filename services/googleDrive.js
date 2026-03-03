const { google } = require("googleapis");
const path = require("path");
const fs = require("fs");

const KEYFILEPATH = path.join(__dirname, "../google-credentials.json");
const SCOPES = ["https://www.googleapis.com/auth/drive"];

const auth = new google.auth.GoogleAuth({
  keyFile: KEYFILEPATH,
  scopes: SCOPES,
});

const uploadFile = async (filePath, fileName) => {
  const driveService = google.drive({
    version: "v3",
    auth,
  });

  const fileMetaData = {
    name: fileName,
    parents: ["PASTE_YOUR_FOLDER_ID_HERE"],
  };

  const media = {
    mimeType: "application/pdf",
    body: fs.createReadStream(filePath),
  };

  const response = await driveService.files.create({
    resource: fileMetaData,
    media: media,
    fields: "id",
  });

  return response.data;
};

module.exports = uploadFile;



