const express = require("express");
const bodyParser = require("body-parser");
const cors = require("cors");
var fileupload = require("express-fileupload");
// var fileupload = require("express-busboy");

const app = express();
app.use(express.json());
app.use(fileupload());
const fs = require('fs');
const path = require('path')
const formidable = require('formidable');
require('./conn')
const port = 3000;
const file=require('./file')
app.use(cors());

app.use(bodyParser.urlencoded({ extended: false }));
app.use(bodyParser.json());
app.use(express.static('public'))



app.post("/book", (req, res) => {
  const data = req.body;
  
  //   const fileContents = new Buffer(attachmentResponse.data.data, 'base64')
  // fs.writeFile(part.filename, fileContents, (err) => {
      //   if (err) return console.error(err)
      //   console.log('file saved to ', part.filename)
      // })
      res.send(data)
});
app.use('/file',file)
app.listen(port, () =>
  console.log(`Hello world app listening on port ${port}!`)
);
