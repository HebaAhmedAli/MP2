var express = require('express');
var app = express();
var serv = require('http').Server(app);
var mysql = require('mysql');
var locks = require('locks');
var cors = require('cors')

var mutexTab0 = locks.createReadWriteLock();
var mutexTab1 = locks.createReadWriteLock();
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
  database: "server1"
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

    var client=this;
    
    var theResult;
    var Category = data.Category;
    var Rating = data.rating;

    var tablet;
    if(Category == "Drama" || Category == "Horror" ) {
        tablet = 'Table0';
        wrLock=mutexTab0;
    }
    else {
        tablet = 'Table1';
        wrLock=mutexTab1;
    }

    var MovieName = data.movieName


    if (MovieName == ""){// if we are serching in the category with rating greater than a certian value 

    var where =  ' WHERE Category = ? AND Rating >= ?' ;
    var select = 'SELECT * FROM '

    var sql = select + tablet + where;
    if(mutexTab0)
   console.log(sql);
    wrLock.readLock(function () {
    con.query(sql, [Category, Rating], function (err, result) {
  if (err) throw err;
  console.log('2na gbt 2l result');
        theResult = result;
        
  console.log(result);
  client.emit('ShowResultFind', {Result : result});
      });
    wrLock.unlock();
    });

      
    }
    else { // if we are serching in the name of the movie 

      console.log("2na fl function d ya b4r");
    var where =  ' WHERE Category = ? AND MovieName = ? AND Status <> -1' ;
    var select = 'SELECT * FROM '

       if(Category == "Drama" || Category == "Horror" ) {
            tablet = 'Table0';
            wrLock=mutexTab0;
        }
        else {
            tablet = 'Table1';
            wrLock=mutexTab1;
        }

    var sql = select + tablet + where;

    console.log(sql);
        wrLock.readLock(function () {

            con.query(sql, [Category, MovieName], function (err, result) {
                if (err) throw err;
                console.log('2na gbt 2l result');
                client.emit('ShowResultFind', {Result: result});

                console.log(result);
            });
            wrLock.unlock();
        });


    }






}

function addMovie(data){

  console.log("I am server adding row ");

  client=this;
  var MovieName = data.movieName
  var Category = data.category;
    var Rating = data.rating;
    
    var Language = data.language;
  
    var Year = data.year;

    var wrLock;

    var tablet;
    console.log(Category+ " in server ----->"+ " rating" +Rating)

    if(Category == "Drama" || Category == "Horror" ) {
        tablet = 'Table0';
        wrLock=mutexTab0;
    }
     else {
        tablet = 'Table1';
        wrLock=mutexTab1;
    }
    
    var fields =  ' (MovieName, Category,Rating,Year,Language,Status) VALUES ?' ;
    var insert = 'INSERT INTO ';

    var values = [
        [MovieName,Category,Rating,Year,Language,2] //2 means new row
    ];

    var sql = insert + tablet + fields;
    wrLock.writeLock(function () {
        console.log('We may now write to a resource!');
        console.log(sql);
        con.query(sql, [values], function (err, result) {
            if (err) throw err;
            client.emit('showResultSAddMovie', {result: result.result});
            console.log("Number of records inserted: " + result);
        });

        wrLock.unlock();
    });
      


}


function set (data){

  client=this;
  
  var update = 'UPDATE '

  var set =  ' SET' ;  
  var where = ' WHERE Category = ? AND MovieName = ?'

  
 // var where = ;

  var ratting = data.Rating;
  var year = data.Year;
  var language = data.Language; 


    var Category = data.category;
    var MovieName = data.movieName;

    var tablet;
if(Category == "Drama" || Category == "Horror" ) {
        tablet = 'Table0';
        wrLock=mutexTab0;
    }
    else {
        tablet = 'Table1';
        wrLock=mutexTab1;
    }

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
    wrLock.writeLock(function () {
con.query(sql, [Category, MovieName], function (err, result) {
        if (err) throw err;
        client.emit('showResultSet',{result: result});
        console.log(result);
        });
        rwlock.unlock();
    });
//  var variables=

}


function deleteMovie(data){

  client = this ;

  var MovieName = data.movieName
  var Category = data.category;

  var tablet;
   if(Category == "Drama" || Category == "Horror" ) {
        tablet = 'Table0';
        wrLock=mutexTab0;
    }
    else {
        tablet = 'Table1';
        wrLock=mutexTab1;
    }

  var update = 'UPDATE '

  var set =  ' SET Status = -1' ;  // -1 means deleted
  var where = ' WHERE Category = ? AND MovieName = ?'

    var sql = update + tablet + set + where;

    wrLock.writeLock(function () {
    console.log(sql);
      con.query(sql, [Category, MovieName], function (err, result) {
        if (err) throw err;
        client.emit('showResultDeleteMovie', {result: result});
        console.log("Number of records deleted: " + result);
        });
        rwlock.unlock();
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

    var tablet;
  
if(Category == "Drama" || Category == "Horror" ) {
        tablet = 'Table0';
        wrLock=mutexTab0;
    }
    else {
        tablet = 'Table1';
        wrLock=mutexTab1;
    }




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