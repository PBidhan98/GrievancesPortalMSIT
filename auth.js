const bcrypt = require('bcryptjs');
const mysql = require('mysql');

//create a connection
var con = mysql.createConnection({
  host: "localhost",
  user: "root",
  password: "",
  database: "mydb"
});

exports.authenticate = (email, pwd, member) => {
  return new Promise(async (resolve, reject) => {
    try{
      //Get user by email
      var sql = "SELECT password,id FROM "+member+"s WHERE email = ?";
      if(!id){
        reject({
          status: "fail",
          msg: "Password and email entered doesn't match"
        });
      }
      con.query(sql, email, function(err, result) {
        if(err) console.log(err);
        bcrypt.compare(pwd, result[0].password, (err, res) => {
          if(err) throw err;
          if(res){
            resolve(result[0].id);
          }else{
            reject('Password and Email entered does not match');
          }
        });
      });

    }catch(err) {
      //Email not found
      reject('Authentication Failed, check if You are registered or not.');
    }

  });
}
