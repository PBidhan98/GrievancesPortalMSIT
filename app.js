const express = require("express");
const mysql = require('mysql');
const bodyParser = require('body-parser');
const ejs = require("ejs");
const multer = require("multer");
const bcrypt = require('bcryptjs');
const auth = require('./auth');
const path = require("path");

var timestamp=Date.now();

// Set Storage Engine
const storage = multer.diskStorage({
  destination: './public/uploads/',
  filename: function(req, file, cb){
    cb(null , timestamp + '-' + file.fieldname + path.extname(file.originalname));
  }
});

const upload = multer({
  storage: storage
  // limits: {fileSize: 100},
  // fileFilter: function(req,file,cb){
  //   checkFileType(file,cb);
});

// //check file checkFileType
// function checkFileType(file,cb){
//   //allowed ext
//   const filetypes = /jpeg|jpg|png|gif/;
//   //check ext
//   const extname = filetypes.test(path.extname(file.originalname).toLowerCase());
// }

const app = express();

app.set('view engine', 'ejs');

app.use(express.static('./public'));

app.use(bodyParser.urlencoded({
  extended: false
}));
app.use(bodyParser.json());

//create a connection
var con = mysql.createConnection({
  host: "localhost",
  user: "root",
  password: "",
  database: "mydb"
});

con.connect(function(err) {
    //creating the database
  // con.query("CREATE DATABASE myDB", function(err, result){
  //   if(err) console.log(err);
  //   console.log("database created!");
  // });
  //
  // var sql="CREATE TABLE parents (id INT AUTO_INCREMENT PRIMARY KEY, name VARCHAR(255), phone VARCHAR(255), email VARCHAR(255) NOT NULL UNIQUE, dob VARCHAR(255), password VARCHAR(255))"
  // con.query(sql, function(err, result){
  //   if(err) throw err;
  //   console.log("parent has been created..");
  // });
  //
  // var sql="CREATE TABLE students (id INT AUTO_INCREMENT PRIMARY KEY, name VARCHAR(255), phone VARCHAR(255), email VARCHAR(255) NOT NULL UNIQUE, branch VARCHAR(20), shift VARCHAR(20),dob VARCHAR(255), password VARCHAR(255), enrollment_No VARCHAR(255))"
  // con.query(sql, function(err, result){
  //   if(err) throw err;
  //   console.log("student has been created..");
  // });
  //
  // var sql="CREATE TABLE teachers (id INT AUTO_INCREMENT PRIMARY KEY, name VARCHAR(255), phone VARCHAR(255), email VARCHAR(255) NOT NULL UNIQUE, branch VARCHAR(20), shift VARCHAR(20),dob VARCHAR(255), password VARCHAR(255), employee_Id VARCHAR(255))"
  // con.query(sql, function(err, result){
  //   if(err) throw err;
  //   console.log("teacher has been created..");
  // });
  //
  // var sql = "CREATE TABLE parentform (formid INT AUTO_INCREMENT PRIMARY KEY,subject VARCHAR(255), details TEXT, person_id int, filename VARCHAR(255), FOREIGN KEY(person_id) REFERENCES parents(id))";
  // con.query(sql, function(err, result) {
  //
  //   if (err) console.log(err);
  //   console.log("parentform is created..");
  // });
  //
  // var sql = "CREATE TABLE studentform (formid INT AUTO_INCREMENT PRIMARY KEY,subject VARCHAR(255), details TEXT, person_id int, filename VARCHAR(255), FOREIGN KEY(person_id) REFERENCES students(id))";
  // con.query(sql, function(err, result) {
  //
  //   if (err) console.log(err);
  //   console.log("studentform is created..");
  // });
  //
  // var sql = "CREATE TABLE teacherform (formid INT AUTO_INCREMENT PRIMARY KEY,subject VARCHAR(255), details TEXT, person_id int, filename VARCHAR(255), FOREIGN KEY(person_id) REFERENCES teachers(id))";
  // con.query(sql, function(err, result) {
  //
  //   if (err) console.log(err);
  //   console.log("teacherform is created..");
  // });
});


app.get('/', function(req, res) {
  res.render("member");
});

app.get('/contact', function(req,res){
  res.render("contact");
})

app.get('/formsubmit/:pid/:mem', function(req, res) {
  res.render("form", {pid: req.params.pid, mem: req.params.mem});
});

app.get('/submitted/:pid/:mem', function(req, res) {
  var sql = "SELECT subject,details FROM "+req.params.mem+"form WHERE person_id = ?";
  con.query(sql, req.params.pid, function(err, result) {
    if (err) {
      console.log(err);
      res.send("Something went wrong :( Refresh or Try Again Later!)");
    } else {
      res.render("submit", {pid: req.params.pid, mem: req.params.mem, posts:result});
    }
  });
});

app.get("/forget/:mem", function(req,res){
  res.render("forget",{mem:req.params.mem});
});

app.get('/:member', function(req, res) {
  res.render("home",{mem:req.params.member});
});

app.get("/login/:member", function(req, res) {
  res.render("login",{mem:req.params.member});
});

app.get("/register/:member", function(req, res) {
  res.render("register",{mem:req.params.member});
});

app.post('/register/:member', function(req, res) {
  var {name, phone, email, branch, shift, dob, password, number} = req.body;

  bcrypt.genSalt(10, (err, salt)=> {
    bcrypt.hash(password, salt, async(err, hash) => {
      //Hash password
      password = hash;

      if(req.params.member=="parent"){
        var sql = "INSERT INTO "+req.params.member+"s (name, phone, email, dob, password) VALUES ('" + name + "', '" + phone + "', '" + email + "', '" + dob + "', '" + password + "')";
      }else if(req.params.member=="student"){
        var sql = "INSERT INTO "+req.params.member+"s (name, phone, email, branch, shift, dob, password, enrollment_No) VALUES ('" + name + "', '" + phone + "',  '" + email + "',  '" + branch + "',  '"+shift+"', '" + dob + "', '" + password + "',  '" + number + "')";
      }else if(req.params.member=="teacher"){
        var sql = "INSERT INTO "+req.params.member+"s (name, phone, email, branch, shift, dob, password, employee_Id) VALUES ('" + name + "', '" + phone + "',  '" + email + "',  '" + branch + "',  '"+shift+"', '" + dob + "', '" + password + "',  '" + number + "')";
      }

      con.query(sql, function(err, result) {
        if (err) {
          console.log(err);
          res.send("Something went wrong :( Refresh or Try Again Later!)");
        } else {
          res.render("submit", {pid: result.insertId, mem: req.params.member, posts:[]});
        }
      });

    });
  });

});

app.post('/formsubmit/:pid/:mem',upload.fields([{name: 'pic', maxCount: 1},{name: 'resume', maxCount: 1}]),function(req, res) {
  var {details, subject} = req.body;
  var _id = req.params.pid;

  var sql = "INSERT INTO " + req.params.mem+"form (subject, details, person_id, filename) VALUES ('" + subject + "','" + details + "', '" + _id + "', '" + timestamp + "')";

  con.query(sql, function(err, result) {
    if (err) {
      console.log(err);
      res.send("Something went wrong :( Refresh or Try Again Later!)");
    } else {
      res.redirect("/submitted/"+_id+"/"+req.params.mem);
    }
  });
});

app.post("/login/:member", async function(req, res) {

  var {email, password} = req.body;
  try{
    //authenticate user
        const id = await auth.authenticate(email,password, req.params.member);
        var sql = "SELECT person_id FROM "+req.params.member+"form WHERE person_id = ?";
        con.query(sql, id, function(err, data) {
          if (err) {
            console.log(err);
            res.send("Something went wrong :( Refresh or Try Again Later!)");
          }
          if (data.length == 0) {
              res.redirect("/submitted/"+id+"/"+req.params.member);
          } else {
            if (id == data[0].person_id) {
                res.redirect("/submitted/"+id+"/"+req.params.member);
            }
          }
        });
  }catch(err){
    //User unauthorized
    res.send({
      status: "fail",
      msg: "Password and email entered doesn't match. Authentication Failed, check if You are registered or not."
    });
  }

});

app.post("/forget/:mem", function(req,res){

   var {email, dob, npwd} = req.body;

   bcrypt.genSalt(10, (err, salt)=> {
     bcrypt.hash(npwd, salt, async(err, hash) => {
       //Hash password
       npwd = hash;
       var sql = "UPDATE "+req.params.mem+"s SET password = ? WHERE email = ? AND dob = ?";
       var data = [npwd, email, dob];
       con.query(sql, data, function(err, result) {
         if (err) {
           console.log(err);
           res.send("Something went wrong :( Refresh or Try Again Later!)");
         } else {
           res.redirect("/login/"+req.params.mem);
         }
       });
     });
   });

});

app.listen(process.env.PORT || 3000, function(req,res){
  console.log("server running successfully");
});
