var express = require('express');
var app = express();
var serv = require('http').Server(app);
var mysql = require('mysql');
var locks = require('locks');
var cors = require('cors')

var lockTab = locks.createReadWriteLock();
app.use(cors())

/*var allowCrossDomain = function(req, res, next) {
    res.header('Access-Control-Allow-Origin', 'example.com');
    res.header('Access-Control-Allow-Methods', 'GET,PUT,POST,DELETE');
    res.header('Access-Control-Allow-Headers', 'Content-Type');

    next();
}*/

//var client;
var con = mysql.createConnection({
  host: "localhost",
  user: "root",
  password: "", 
  //port: 3366,
  database: "server2"
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
serv.listen(process.env.PORT || 5000);
console.log("Server started.");

/*
/ cat : "action","3yat","d7k w mr23a"
/ rating : rkm 
/ movieName : "Lost", "theHope", "homeLess", "ذوبنملا"
*/
function findMovies (data){

    var client=this;
    
    var theResult;
    var Category = data.Category;
    var Rating = data.rating;

    var tablet= 'Table0';
    

    var MovieName = data.movieName


    if (MovieName == ""){// if we are serching in the category with rating greater than a certian value 

    var where =  ' WHERE Category = ? AND Rating >= ?' ;
    var select = 'SELECT * FROM '

    var sql = select + tablet + where;

    lockTab.readLock(function () {

   console.log(sql);
    con.query(sql, [Category, Rating], function (err, result) {
  if (err) throw err;
  console.log('2na gbt 2l result');
        theResult = result;
        
  console.log(result);
  client.emit('ShowResultFind', {Result : result});
      });
    lockTab.unlock();
    });

      
    }
    else { // if we are serching in the name of the movie 

      console.log("2na fl function d ya b4r");
    var where =  ' WHERE Category = ? AND MovieName = ? AND Status <> -1' ;
    var select = 'SELECT * FROM '
    var tablet = 'Table0'

    var sql = select + tablet + where;

    console.log(sql);
        lockTab.readLock(function () {

            con.query(sql, [Category, MovieName], function (err, result) {
        if (err) throw err;
        console.log('2na gbt 2l result');
        client.emit('ShowResultFind', {Result : result });

        console.log(result);
        });

            lockTab.unlock();
        });


    }






}

function addMovie(data){

  client=this;
  var MovieName = data.movieName
  var Category = data.category;
    var Rating = data.rating;
    
    var Language = data.language;
  
    var Year = data.year;
   

    var tablet = 'Table0'
    
    
    var fields =  ' (MovieName, Category,Rating,Year,Language,Status) VALUES ?' ;
    var insert = 'INSERT INTO ';

    var values = [
        [MovieName,Category,Rating,Year,Language,2] //2 means new row
    ];

    var sql = insert + tablet + fields;

    console.log(sql);
    lockTab.writeLock(function(){
        con.query(sql, [values], function (err, result) {
        if (err) throw err;
        client.emit('showResultSAddMovie', {result: result});
        console.log("Number of records inserted: " + result);
    });
        lockTab.unlock();
});
      


}


function set (data){

  client=this;
  var tablet = 'Table0'

  var update = 'UPDATE '

  var set =  ' SET' ;  
  var where = ' WHERE Category = ? AND MovieName = ?'

  
 // var where = ;

  var ratting = data.Rating;
  var year = data.Year;
  var language = data.Language; 


    var Category = data.category;
    var MovieName = data.movieName;


  if (ratting !=""){

    set = set + ' `Rating` = ' + '\'' +ratting + '\'' ;
  }
  if (year !=""){
      if (set !=" SET")
        set+=' ,';
    set = set + ' `Year` = ' + '\'' +year+ '\'' ;
  }
  if (language!= ""){
      if (set !=" SET")
        set+=' ,';
    set = set + ' `Language` = '+ '\'' +language +'\'';
  }
  
  if (set !=" SET")
  set+=' ,';
set = set + ' `Status` = '+ '\'' + 1 +'\'';


var sql = update + tablet + set + where;
console.log(sql);
console.log(Category);
console.log(MovieName);

        lockTab.writeLock(function () {

            con.query(sql, [Category, MovieName], function (err, result) {
                if (err) throw err;
                client.emit('showResultSet', {result: result});
                console.log(result);
            });
            lockTab.unlock();
        });

}


function deleteMovie(data){

  client = this ;

  var MovieName = data.movieName
  var Category = data.category;

  var tablet = 'Table0'

  var update = 'UPDATE '

  var set =  ' SET Status = -1' ;  // -1 means deleted
  var where = ' WHERE Category = ? AND MovieName = ?'

    var sql = update + tablet + set + where;

  console.log(sql);
    lockTab.writeLock(function () {

        con.query(sql, [Category, MovieName], function (err, result) {
        if (err) throw err;
        client.emit('showResultDeleteMovie', {result: result});
        console.log("Number of records deleted: " + result);
        });
        lockTab.unlock();
    });


}

function DelCells(data){
 client = this ;
  
  

  
    var update = 'UPDATE '
  
    var set =  ' SET' ;  
    var where = ' WHERE Category = ? AND MovieName = ?'
  
    
   // var where = ;
  
    var ratting = data.Ratting;
    var year = data.Year;
    var language = data.Language;
    
    var Category = data.category;
    var MovieName = data.movieName;

    var tablet = "Table0";
    
  
    if (year==true){
        set = set + ' `Year` = ' + '\'' +""+ '\'' ;
    }
     if (language== true){
        if (set !=" SET")
          set+=' ,';
      set = set + ' `Language` = '+ '\'' +"" +'\'';
    }
     if (ratting == true){
        if (set !=" SET")
          set+=' ,';
      set = set + ' `Rating` = '+ '\'' +"" +'\'';
    }

    if (set !=" SET")
  set+=' ,';
set = set + ' `Status` = '+ '\'' + 1 +'\'';
 


 
  var sql = update + tablet + set + where;
  console.log(sql);
  console.log(Category);
  console.log(MovieName);
  con.query(sql, [Category, MovieName], function (err, result) {
          if (err) throw err;
          client.emit('showResultSet',{result: result});
          console.log(result);
          });
  
 
}





// io connection 
var io = require('socket.io')(serv,{ origins: '*:*'});

io.sockets.on('connection', function(socket){
  console.log("socket connected in server 1"); 

  socket.on("client_find",findMovies);
  socket.on("client_add_row",addMovie);
  socket.on("client_delete_row",deleteMovie);

socket.on("client_set",set);
  socket.on("client_DelCells",DelCells);











});