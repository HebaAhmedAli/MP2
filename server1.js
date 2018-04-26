var express = require('express');
var app = express();
var serv = require('http').Server(app);
var mysql = require('mysql');

var con = mysql.createConnection({
  host: "localhost",
  user: "root",
  password: "", 
  database: "movies"
});


app.use(express.static('public'));
con.connect(function(err) {
    if (err) throw err;
    console.log("Connected!");
   // con.query("CREATE DATABASE mydb", function (err, result) {
    //  if (err) throw err;
  //    console.log("Database created");
 
  //  });
  });
  
app.get('/',function(req, res) {
	res.sendFile(__dirname + '/client/index.html');
});
app.use('/client',express.static(__dirname + '/client'));
serv.listen(process.env.PORT || 2000);
console.log("Server started.");

/*
/ cat : "action","3yat","d7k w mr23a"
/ rating : rkm 
/ movieName : "Lost", "theHope", "homeLess", "ذوبنملا"
*/
function findMovies (data){
    var Category = data.category;
    var Rating = data.rating;
    var tablet = 'action';
    var MovieName = data.movieName


    if (MovieName == ""){// if we are serching in the category with rating greater than a certian value 

    var where =  ' WHERE Category = ? AND Rating >= ?' ;
    var select = 'SELECT * FROM '

    var sql = select + tablet + where;

   console.log(sql);
    con.query(sql, [Category, Rating], function (err, result) {
  if (err) throw err;
  console.log(result);
      });


    }
    else { // if we are serching in the name of the movie 

      console.log("2na fl function d ya b4r");
    var where =  ' WHERE Category = ? AND MovieName = ?' ;
    var select = 'SELECT * FROM '

    var sql = select + tablet + where;

    console.log(sql);
      con.query(sql, [Category, MovieName], function (err, result) {
        if (err) throw err;
        console.log(result);
        });



    }






}

function addMovie(data){

  var MovieName = data.movieName
  var Category = data.category;
    var Rating = data.rating;
    
    var Language = data.language;
    var Directory = data.directory;
    var Year = data.year;
    var Awards = data.awards;

    var tablet = 'action';
    
    
    var fields =  ' (MovieName, Category,Rating,Language,Directory,Year,Awards) VALUES ?' ;
    var insert = 'INSERT INTO ';

    var values = [
        [MovieName,Category,Rating,Language,Directory,Year,Awards]
    ];

    var sql = insert + tablet + fields;

    console.log(sql);
      con.query(sql, [values], function (err, result) {
        if (err) throw err;
        console.log("Number of records inserted: " + result.affectedRows);
        });

      


}


function deleteMovie(data){

  var MovieName = data.movieName
  var Category = data.category;


  var delete_q = 'SELECT * FROM '

    var sql = select + tablet + where;

    console.log(sql);
      con.query(sql, [Category, MovieName], function (err, result) {
        if (err) throw err;
        console.log(result);
        });


}




// io connection 
var io = require('socket.io')(serv,{});

io.sockets.on('connection', function(socket){
	console.log("socket connected"); 

  socket.on("client_find",findMovies);
  socket.on("client_add_row",addMovie);
  socket.on("client_delete_row",deleteMovie);












});

