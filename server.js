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
  secret: process.env.SESSION_SECRET, 
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
<link href="https://fonts.googleapis.com/css2?family=Inter:wght@400;600;800&display=swap" rel="stylesheet">
<style>
*{
margin:0;
padding:0;
box-sizing:border-box;
font-family:"Inter",sans-serif;
}

body{
background:linear-gradient(135deg,#0f0f0f,#1a1a1a);
display:flex;
align-items:center;
justify-content:center;
height:100vh;
color:white;
}

.card{
background:#111;
padding:60px;
width:600px;
border-radius:16px;
box-shadow:0 25px 70px rgba(0,0,0,.6);
text-align:center;
border:1px solid rgba(255,255,255,0.08);
}

.icon{
font-size:70px;
margin-bottom:20px;
color:#00e676;
}

h1{
font-size:36px;
margin-bottom:15px;
font-weight:800;
}

p{
color:#aaa;
font-size:16px;
margin-bottom:30px;
}

.link-box{
background:#1e1e1e;
padding:15px;
border-radius:8px;
word-break:break-all;
font-size:13px;
margin-bottom:30px;
border:1px solid rgba(255,255,255,0.05);
}

.buttons{
display:flex;
justify-content:center;
gap:20px;
flex-wrap:wrap;
}

.button{
padding:14px 30px;
border-radius:8px;
text-decoration:none;
font-weight:600;
transition:.3s ease;
}

.primary{
background:#00e676;
color:black;
}

.primary:hover{
background:#00c853;
}

.secondary{
background:transparent;
border:1px solid #00e676;
color:#00e676;
}

.secondary:hover{
background:#00e676;
color:black;
}
</style>
</head>

<body>

<div class="card">

<div class="icon">✔</div>

<h1>Certificates Generated Successfully</h1>

<p>
Your certificates have been created and uploaded to Google Drive.
</p>

<div class="link-box">
${folderLink}
</div>

<div class="buttons">
<a class="button primary" href="${folderLink}" target="_blank">
Open Drive Folder
</a>

<a class="button secondary" href="/dashboard">
Generate More
</a>
</div>

</div>

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