// const bcrypt = require('bcryptjs');
// const mysql = require('mysql');
//
// //create a connection
// var con = mysql.createConnection({
//   host: "localhost",
//   user: "root",
//   password: "",
//   database: "mydb"
// });
// // var con = mysql.createConnection({
// //   host: "sql12.freesqldatabase.com",
// //   user: "sql12303299",
// //   password: "vvpkijscyS",
// //   database: "sql12303299",
// //   port:3306
// // });
//
// exports.authenticate = (username, pwd, member) => {
//   return new Promise(async (resolve, reject) => {
//     try{
//       //Get user by email
//       var sql = "SELECT password,id FROM admin WHERE username = ?";
//       con.query(sql, username, function(err, result) {
//         if(err) console.log(err);
//         bcrypt.compare(pwd, result[0].password, (err, res) => {
//           if(err) throw err;
//           if(res){
//             resolve(result[0].id);
//           }else{
//             reject('Password and Username entered does not match');
//           }
//         });
//       });
//
//     }catch(err) {
//       //Email not found
//       reject('Authentication Failed!');
//     }
//
//   });
// }
