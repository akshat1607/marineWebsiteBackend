const express = require("express");
const app = express();
const bodyParser = require("body-parser");
const mongoose = require("mongoose");
const imgSchema = require("./models");
const fs = require("fs");
const path = require("path");
require("dotenv").config();
const cors = require("cors");
const nodemailer=require("nodemailer")
app.set("view engine", "ejs");
app.use(cors());
app.use(bodyParser.urlencoded({ extended: false }));
app.use(express.json());
app.use(express.static(path.join(__dirname, "public")));
var multer = require("multer");
const { response } = require("express");
mongoose.connect(process.env.MONGO_URL).then(() => console.log("DB Connected"));

const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, "uploads");
  },
  filename: (req, file, cb) => {
    cb(null, file.fieldname + "-" + Date.now());
  },
});

const upload = multer({ storage });

app.get("/", async (req, res, next) => {
  try {
    const data = await imgSchema.find();
    res.json(data);
  } catch (err) {
    next(err);
  }
});

app.post("/", upload.single("image"), async (req, res, next) => {
  try {
    const tempData = fs.readFileSync(
      path.resolve(__dirname, "uploads", req.file.filename)
    );
    const obj = {
      model: req.body.model,
      name:req.body.name,
      description: req.body.description,
      height: req.body.height,
      length: req.body.length,
      width: req.body.width,
      img: {
        data: Buffer.from(tempData).toString("base64"),
        contentType: "image/png",
      },
      isSold: false,
      productType: req.body.productType,
    };
    await imgSchema.create(obj);
    const folderPath = path.resolve(__dirname, "uploads");
    const files = await fs.promises.readdir(folderPath);
    await Promise.all(
      files.map((file) => fs.promises.unlink(path.join(folderPath, file)))
    );
    res.send("Successful");
  } catch (err) {
    next(err);
  }
});

app.post("/deleteImage", async (req, res, next) => {
  try {
    await imgSchema.deleteOne({ _id: req.body.id });
    const data = await imgSchema.find();
    res.json(data);
  } catch (err) {
    next(err);
  }
});

app.get("/video", (req, res, next) => {
  try {
    const tempData = fs.readFileSync(
      path.resolve(__dirname, "Videos", "image-1682928138520")
    );
    const vid = {
      data: Buffer.from(tempData).toString("base64"),
      contentType: "video/mp4",
    };
    res.send(vid);
  } catch (err) {
    next(err);
  }
});
app.post("/edit", async (req, res, next) => {
  try {

    const data=await imgSchema.findOne({_id : req.body.id})
    await Promise.all([
      imgSchema.deleteOne({ _id: req.body.id }),
      imgSchema.create({
        model:req.body.model,
        name:req.body.name,
        description:req.body.description,
        height:req.body.height,
        length:req.body.length,
        width:req.body.width,
        img:data.img,
        isSold: false,
        productType:req.body.productType,
      }),
    ]);
    const dat = await imgSchema.find().lean();

    res.send(dat);
  } catch (err) {
    next(err);
  }
});

app.post("/mail",(req,res)=>{
  console.log("Renders")
  var subject;
  var body;
  if(req.body.model!==undefined)
  {
      subject=`Enquiry for ${req.body.model}`
      body=`Hii, customer is asking for the price of Model : ${req.body.model}.Customer details are as follows : 
      Name : ${req.body.name}
      Contact number : ${req.body.contact}
      Email id : ${req.body.email}
      Country : ${req.body.country}
      `
  }
  else{
    subject=`Customer Enquiry`
    body=`Hii, the following customer is trying to contact you : 
    Name : ${req.body.name}
    Contact number : ${req.body.contact}
    Email id : ${req.body.email}
    Country : ${req.body.country}
    `
  }

  var transporter=nodemailer.createTransport({
    service:'gmail',
    auth:{
        user:'201901455@daiict.ac.in',
        pass:'tfosffhuhxqrqhiz',
    }
  })

  var mailOptions={
    from:'201901455@daiict.ac.in',
    to:req.body.email,
    subject:subject,
    text:body
  }

  transporter.sendMail(mailOptions,function(err,info){
    if(err)
      res.send(err);
    else 
      res.send("email sent")
  })

})


var port = process.env.PORT || "3000";

app.listen(port, () => {
  console.log("Server listening on port", port);
});