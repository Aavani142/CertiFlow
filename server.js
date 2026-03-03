require("dotenv").config();
const express = require("express");
const cors = require("cors");
const session = require("express-session");
const passport = require("passport");
const GoogleStrategy = require("passport-google-oauth20").Strategy;
const multer = require("multer");
const fs = require("fs");
const path = require("path");
const xlsx = require("xlsx");
const { PDFDocument, rgb } = require("pdf-lib");
const { google } = require("googleapis");

const app = express();

app.use(express.static("public"));
app.use(cors());
app.use(express.json());

app.use(session({
  secret: process.env.SESSION_SECRET, // ✅ FIXED (removed quotes)
  resave: false,
  saveUninitialized: false
}));

app.use(passport.initialize());
app.use(passport.session());

/* ================= GOOGLE LOGIN ================= */

passport.use(new GoogleStrategy({
  clientID: process.env.GOOGLE_CLIENT_ID,
  clientSecret: process.env.GOOGLE_CLIENT_SECRET,
  callbackURL: process.env.CALLBACK_URL
},
(accessToken, refreshToken, profile, done) => {
  profile.accessToken = accessToken;
  done(null, profile);
}));

passport.serializeUser((u,d)=>d(null,u));
passport.deserializeUser((u,d)=>d(null,u));

app.get("/auth/google",
passport.authenticate("google",{
scope:[
"profile",
"email",
"https://www.googleapis.com/auth/drive"
]
}));

app.get("/auth/google/callback",
passport.authenticate("google",{failureRedirect:"/"}),
(req,res)=>res.redirect("/dashboard"));

/* ================= PAGES ================= */

app.get("/",(req,res)=>res.sendFile(__dirname+"/public/index.html"));
app.get("/connect",(req,res)=>res.sendFile(__dirname+"/public/connect.html"));
app.get("/dashboard",(req,res)=>{
if(!req.user) return res.redirect("/");
res.sendFile(__dirname+"/public/dashboard.html");
});

/* ================= UPLOAD ================= */

const upload = multer({ dest:"uploads/" });

/* ================= DRIVE ================= */

async function getDrive(token){
const auth=new google.auth.OAuth2();
auth.setCredentials({access_token:token});
return google.drive({version:"v3",auth});
}

async function getOrCreateFolder(token,name){
const drive=await getDrive(token);

const res=await drive.files.list({
q:`mimeType='application/vnd.google-apps.folder' and name="${name}" and trashed=false`,
fields:"files(id)"
});

if(res.data.files.length) return res.data.files[0].id;

const folder=await drive.files.create({
requestBody:{name,mimeType:"application/vnd.google-apps.folder"}
});

return folder.data.id;
}

async function uploadFile(token,filePath,fileName,folderId){
const drive=await getDrive(token);

const file=await drive.files.create({
requestBody:{name:fileName,parents:[folderId]},
media:{body:fs.createReadStream(filePath)}
});

const id=file.data.id;

await drive.permissions.create({
fileId:id,
requestBody:{role:"reader",type:"anyone"}
});

return `https://drive.google.com/file/d/${id}/view`;
}

/* ================= GENERATE ================= */

app.post("/generate-certificates",
upload.fields([{name:"excelFile"},{name:"templateFile"}]),
async(req,res)=>{

try{

if(!req.user) return res.send("Login required");

const excel=req.files?.excelFile?.[0];
const template=req.files?.templateFile?.[0];
const event=req.body.eventName || "Certificates";

if(!excel || !template) return res.send("Files missing");

const x=parseInt(req.body.xPos)||250;
const y=parseInt(req.body.yPos)||300;
const size=parseInt(req.body.fontSize)||30;
const auto=req.body.autoCenter==="true";

const folderId=await getOrCreateFolder(req.user.accessToken,event);
const folderLink=`https://drive.google.com/drive/folders/${folderId}`;

const wb=xlsx.readFile(excel.path);
const sheet=wb.Sheets[wb.SheetNames[0]];
const rows=xlsx.utils.sheet_to_json(sheet);

const links=[];

/* ✅ FIX: Ensure generated folder exists */
const generatedDir = path.join(__dirname, "generated");
if (!fs.existsSync(generatedDir)) {
  fs.mkdirSync(generatedDir);
}

for(const row of rows){

const name =
row.Name ||
row.name ||
row["Full Name"] ||
Object.values(row)[0];

if(!name) continue;

const pdfBytes=fs.readFileSync(template.path);
const pdf=await PDFDocument.load(pdfBytes);
const page=pdf.getPages()[0];

let drawX=x;
if(auto){
const textWidth=name.length*(size*0.5);
drawX=page.getWidth()/2-textWidth/2;
}

page.drawText(String(name),{
x:drawX,
y,
size,
color:rgb(0,0,0)
});

const out=await pdf.save();
const fileName=`${name}.pdf`;

/* ✅ FIX: Use absolute generated folder path */
const filePath = path.join(generatedDir, fileName);

fs.writeFileSync(filePath,out);

const link=await uploadFile(req.user.accessToken,filePath,fileName,folderId);
links.push(link);
}

res.send(`
<!DOCTYPE html>
<html>
<head>
<title>CertiFlow – Success</title>
</head>
<body>
<h2>Certificates Generated Successfully</h2>
<a href="${folderLink}" target="_blank">Open Drive Folder</a>
<br><br>
<a href="/dashboard">Generate More Certificates</a>
</body>
</html>
`);

}catch(e){
console.error(e);
res.send("Generation failed");
}
});

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log("Server running"));