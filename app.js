const express = require("express");
const mysql = require('mysql');
const bodyParser = require('body-parser');
const ejs = require("ejs");
const multer = require("multer");
const bcrypt = require('bcryptjs');
const auth = require('./auth');
// const adminAuth = require('./adminAuth');
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
  host: "sql12.freesqldatabase.com",
  user: "sql12303299",
  password: "vvpkijscyS",
  database: "sql12303299",
  port:3306,
  // host: "localhost",
  // user: "root",
  // password: "",
  // database: "mydb",
  multipleStatements: true
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
  // var sql = "CREATE TABLE admin (id INT AUTO_INCREMENT PRIMARY KEY,username VARCHAR(255) NOT NULL UNIQUE,password VARCHAR(255))";
  // con.query(sql, function(err, result) {
  //
  //   if (err) console.log(err);
  //   console.log("admin is created..");
  // });
});


app.get('/', function(req, res) {
  res.render("member");
});

app.get('/admin', function(req, res) {
  res.render("adminLogin");
});

app.get('/adminPortal', function(req, res) {
  res.render("adminPortal");
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

      var s="SELECT email FROM "+req.params.member+"s WHERE email=?";
      con.query(s, email,function(err,data){
        console.log(data);
        if(data.length!=0){
          console.log("hi");
          res.send({
            status: "fail",
            msg: "Email entered already exists. Login to submit the grievance."
          });
        }else{
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
              res.send({
                status: "success",
                pid: result.insertId
              });
              //res.render("submit", {pid: result.insertId, mem: req.params.member, posts:[]});
            }
          });

        }
      });
    });
  });

});

// app.post('/admin/register', function(req, res) {
//   var {username, password} = req.body;
//
//   bcrypt.genSalt(10, (err, salt)=> {
//     bcrypt.hash(password, salt, async(err, hash) => {
//       //Hash password
//       password = hash;
//       var sql = "INSERT INTO admin (username, password) VALUES ('" + username + "', '" + password + "')";
//       con.query(sql, function(err, result) {
//         if (err) {
//           console.log(err);
//           res.send("Something went wrong :( Refresh or Try Again Later!)");
//         } else {
//           res.send({
//             status: "success",
//           });
//         }
//       });
//     });
//   });
//
// });

app.post('/formsubmit/:pid/:mem',upload.fields([{name: 'pic', maxCount: 1},{name: 'resume', maxCount: 1}]),function(req, res) {
  var {details, subject} = req.body;

  var sql = "INSERT INTO " + req.params.mem+"form (subject, details, person_id, filename) VALUES (?,?,?,?)";
  var toplace = [subject, details,req.params.pid,timestamp];
  con.query(sql,toplace, function(err, result) {
    if (err) {
      console.log(err);
      res.send("Something went wrong :( Refresh or Try Again Later!)");
    } else {
      res.redirect("/submitted/"+req.params.pid+"/"+req.params.mem);
    }
  });
});

app.post("/login/:member", async function(req, res) {
  var {email, password} = req.body;
  try{
    const id = await auth.authenticate(email,password, req.params.member);
    var sql = "SELECT person_id FROM "+req.params.member+"form WHERE person_id = ?";
    con.query(sql, id, function(err, data) {
      if (err) console.log(err);
      if (data.length==0) {
        res.send({
          status: "success",
          pid: id
        });
      } else {
        if (id == data[0].person_id) {
          res.send({
            status: "success",
            pid: id
          });
        }
      }
    });
  }catch(err){
    res.send({
      status: "fail",
      msg: "Password and Email entered doesn't match. Check if you are registered or not"
    });
  }
});

app.post('/adminPortal', function(req, res) {
  var sql = "SELECT COUNT(*) AS count FROM parentform;SELECT COUNT(*) AS countt FROM studentform;SELECT COUNT(*) AS counttt FROM teacherform";
  con.query(sql, function(err, result,feilds) {
    if (err) {
      console.log(err);
      res.send("Something went wrong :( Refresh or Try Again Later!)");
    }else{
      res.send({
        pnum: result[0][0].count,
        snum: result[1][0].countt,
        tnum: result[2][0].counttt
      });
    }
  });
  // var sql = "SELECT COUNT(*) AS count FROM studentform";
  // con.query(sql, function(err, data) {
  //   if (err) {
  //     console.log(err);
  //     res.send("Something went wrong :( Refresh or Try Again Later!)");
  //   }
  //   else{
  //     ss=data[0].count;
  //   }
  // });
  // var sql = "SELECT COUNT(*) AS count FROM teacherform";
  // con.query(sql, function(err, results) {
  //   if (err) {
  //     console.log(err);
  //     res.send("Something went wrong :( Refresh or Try Again Later!)");
  //   }else{
  //     tt=results[0].count;
  //   }
  // });

});

app.post("/admin/login", async function(req, res) {
  var {username, password} = req.body;
  if(username=="sql12303299" && password=="vvpkijscyS"){
    res.send({
      status: "success"
    });
  }else{
    res.send({
      status: "fail",
      msg: "Password and Username entered doesn't match. Check if you are registered or not"
    });
  }
  // try{
  //   const id = await adminAuth.authenticate(username,password);
  //   if (id) {
      // res.send({
      //   status: "success"
      // });
  //   }
  // }catch(err){
    // res.send({
    //   status: "fail",
    //   msg: "Password and Username entered doesn't match. Check if you are registered or not"
    // });
  // }
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
         console.log(result.affectedRows);
         if (err) {
           console.log(err);
           res.send("Something went wrong :( Refresh or Try Again Later!)");
         }
         if(result.affectedRows==0){
           res.send({
             status: "fail",
             msg: "Entered Email and DOB doesn't match :("
           });
         }
         if(result.affectedRows!=0) {
           res.send({
             status: "success",
             msg: "Well done, You have successfully changed the password..."
           });
         }
       });
     });
   });

});

app.post('/ptable', function(req, res) {
  var sql = "SELECT formid,subject,details FROM parentform";
  con.query(sql, function(err, result) {
    if (err) {
      console.log(err);
      res.send("Something went wrong :( Refresh or Try Again Later!)");
    } else {
      res.render("ptable", {posts:result});
    }
  });
});

app.post('/stable', function(req, res) {
  var sql = "SELECT formid,subject,details FROM studentform";
  con.query(sql, function(err, result) {
    if (err) {
      console.log(err);
      res.send("Something went wrong :( Refresh or Try Again Later!)");
    } else {
      res.render("stable", {posts:result});
    }
  });
});

app.post('/ttable', function(req, res) {
  var sql = "SELECT formid,subject,details FROM teacherform";
  con.query(sql, function(err, result) {
    if (err) {
      console.log(err);
      res.send("Something went wrong :( Refresh or Try Again Later!)");
    } else {
      res.render("ttable", {posts:result});
    }
  });
});

app.listen(process.env.PORT || 3000, function(req,res){
  console.log("server running successfully");
});
