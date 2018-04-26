  var express = require('express');
  var app = express();
  var serv = require('http').Server(app);
  var mysql = require('mysql');
  // io connection 
  var io = require('socket.io')(serv,{});

  var con = mysql.createConnection({
    host: "localhost",
    user: "root",
    password: "",
    database: "movies"

  });

  var con_s1 = mysql.createConnection({
    host: "localhost",
    user: "root",
    password: "",
    database: "server1"
   
  });

  var con_s2 = mysql.createConnection({
    host: "localhost",
    user: "root",
    password: "",
   database: "server2"
  });

  var lower_range=0;

  function fill_table_in_server(category_data,table_name,server_no)
  {
     for(var i=0;i<category_data.length;i++)
        {
           var row=JSON.parse(JSON.stringify(category_data[i]));
           var film_name=row.film_name;
           var category=row.category;
           var rank=row.rank;
           var date=row.year;

            var sql = "INSERT INTO "+table_name+" (film_name, category,rank,year) VALUES ("+mysql.escape(film_name)+
            ","+mysql.escape(category)+","+mysql.escape(rank)+","+mysql.escape(date)+")";

          if(server_no==1)
          {

            con_s1.query(sql, function (err, result) {
            if (err) throw err;
            console.log("1 record inserted");
            });
          }
          else
          {
           
            con_s2.query(sql, function (err, result) {
            if (err) throw err;
            console.log("1 record inserted");
            });
          }

        }
  }

  function fill_meta_data(min_range,max_range,category,server_no)
  {
       var sql = "INSERT INTO meta_data (category, min_range,max_range,server_no) VALUES ("+mysql.escape(category)+
            ","+mysql.escape(min_range)+","+mysql.escape(max_range)+","+mysql.escape(server_no)+")";

          
            con.query(sql, function (err, result) {
            if (err) throw err;
            console.log("1 record inserted");
            });
  }

  function fill_servers_data (category_name,server_no,i) {

    
    con.query("SELECT * FROM data where category="+mysql.escape(category_name), function (err, result) {
      if (err) throw err;
      //console.log(result.length);
      
      if(server_no==1)
      {
        var table_name=parseInt(i/2);
        if(i!=1)
        {
          con_s1.query("CREATE TABLE Table"+parseInt(i/2)+" (film_name VARCHAR(100) NOT NULL UNIQUE,  category VARCHAR(50),rank INT(11),year DATE)", function (err, result1) {
          if (err) throw err;
         console.log("Table created");
         });
      
        }

        fill_table_in_server(result,"Table"+table_name,1);
        fill_meta_data(lower_range,lower_range+result.length-1,category_name,1);
         
      }
      else
      {
        con_s2.query("CREATE TABLE Table0 (film_name VARCHAR(100) NOT NULL UNIQUE,  category VARCHAR(50),rank INT(11),year DATE)", function (err, result2) {
          if (err) throw err;
         console.log("Table created");
         });

         fill_table_in_server(result,"Table0",2);
         fill_meta_data(lower_range,lower_range+result.length-1,category_name,2);
         
      }

      lower_range+=result.length;

   

    });
    

  }

  con.connect(function(err) {
      if (err) throw err;
      console.log("Connected!");
      con.query("SELECT DISTINCT category FROM data", function (err, result) {
        if (err) throw err;
      
        for(var i=0; i < result.length;i++)
        {
          var row=JSON.parse(JSON.stringify(result[i]));
          fill_servers_data(row.category,parseInt(i/3)+1,i);
          console.log(parseInt(i/3)+1);
        }

      });
    });
    
  app.get('/',function(req, res) {
  	res.sendFile(__dirname + '/client/index.html');
  });

  //app.use('/client',express.static(__dirname + '/client'));

  serv.listen(process.env.PORT || 3000);
  console.log("Master started.");


  io.sockets.on('connection', function(socket){
  	console.log("socket connected"); 

  });