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

    var meta_map = {};

    setTimeout(periodically, 5000);

    setTimeout(fill_simulated_meta_data, 1000); //tagroba


    function fill_table_in_server(category_data,table_name,server_no)
    {
       for(var i=0;i<category_data.length;i++)
          {
             var row=JSON.parse(JSON.stringify(category_data[i]));
             var film_name=row.film_name;
             var category=row.category;
             var rank=row.rank;
             var date=row.year;

              var sql = "INSERT INTO "+table_name+" (film_name, category,rank,year,status) VALUES ("+mysql.escape(film_name)+
              ","+mysql.escape(category)+","+mysql.escape(rank)+","+mysql.escape(date)+", 0)";

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

    function fill_simulated_meta_data()
    {
      console.log("fill sim_meta_data");
         con.query("SELECT * FROM meta_data", function (err, result, fields) {
        if (err) throw err;
        
        for(var i=0; i < result.length;i++)
          {
            //console.log(result[i]);
          var row=JSON.parse(JSON.stringify(result[i]));

           //to simulate the actual data
          addValueToMap(row.category,row.min_range,row.max_range);
        }
        

        });

        
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
            con_s1.query("CREATE TABLE Table"+parseInt(i/2)+" (film_name VARCHAR(100) NOT NULL UNIQUE,  category VARCHAR(50),rank INT(11),year DATE,status INT(11))", function (err, result1) {
            if (err) throw err;
           console.log("Table created");
           });
        
          }

          fill_table_in_server(result,"Table"+table_name,1);
          fill_meta_data(lower_range,lower_range+result.length-1,category_name,1);
           
        }
        else
        {
          con_s2.query("CREATE TABLE Table0 (film_name VARCHAR(100) NOT NULL UNIQUE,  category VARCHAR(50),rank INT(11),year DATE,status INT(11))", function (err, result2) {
            if (err) throw err;
           console.log("Table created");
           });

           fill_table_in_server(result,"Table0",2);
           fill_meta_data(lower_range,lower_range+result.length-1,category_name,2);
           
        }

        lower_range+=result.length;

     

      });
      

    }

    function start_update(result,server_no,table_no)
    {

      
      for(var i=0; i < result.length;i++)
          {
            //console.log(result[i]);
          var row=JSON.parse(JSON.stringify(result[i]));

          var sql = "UPDATE data SET rank = "+mysql.escape(row.rank)+" , year= "
          + mysql.escape(row.year)+" WHERE film_name = "+mysql.escape(row.film_name);

          //console.log(row.film_name);
          con.query(sql, function (err, result2) {
          if (err) throw err;
          console.log(result2.affectedRows + " record(s) updated ");

          var sql_s = "UPDATE Table"+table_no+" SET status = 0 WHERE film_name = "+mysql.escape(row.film_name);

          if(server_no==1)
          {
            con_s1.query(sql_s, function (err, result3) {
           if (err) throw err;
           //console.log(result2.affectedRows + " record(s) updated ");
           });
          }
          else
          {
            con_s2.query(sql_s, function (err, result3) {
           if (err) throw err;
          // console.log(result2.affectedRows + " record(s) updated ");
           });
          }

          });

         

         
          }
    }

    function update_ranges_while_delete(category)
    {
        con.query("SELECT * FROM meta_data WHERE category >= "+mysql.escape(category), function (err, result, fields) {
        if (err) throw err;
        
          for(var i=0; i < result.length;i++)
          {
            //console.log(result[i]);
          var row=JSON.parse(JSON.stringify(result[i]));
          var sql;

          if(i==0)
          {
             var max_r= meta_map[row.category][1];
            meta_map[row.category][1]--;
            
            sql = "UPDATE meta_data SET max_range = "+mysql.escape(max_r-1)
            +" WHERE category = "+mysql.escape(row.category);
           }
          else
          {
            var min_r= meta_map[row.category][0];
            meta_map[row.category][0]--;
            
            var max_r= meta_map[row.category][1];
            meta_map[row.category][1]--;
            

            sql = "UPDATE meta_data SET min_range = "+mysql.escape(min_r-1)+" , max_range= "
          + mysql.escape(max_r-1)+" WHERE category = "+mysql.escape(row.category);
          }

          //console.log(row.film_name);
          con.query(sql, function (err, result2) {
          if (err) throw err;
          console.log(result2.affectedRows + " record(s) updated ");
          });
         
          }

        });
    }
    function start_delete(result,server_no,table_no)
    {

      for(var i=0; i < result.length;i++)
          {
            //console.log(result[i]);
          var row=JSON.parse(JSON.stringify(result[i]));

          var sql = "DELETE FROM data WHERE film_name = "+mysql.escape(row.film_name);

          update_ranges_while_delete(row.category);

          //console.log(row.film_name);
          con.query(sql, function (err, result2) {
          if (err) throw err;
          console.log(result2.affectedRows + " record(s) deleted ");
          });
         
          var sql_s = "DELETE FROM Table"+table_no+" WHERE film_name = "+mysql.escape(row.film_name);

          if(server_no==1)
          {
            con_s1.query(sql_s, function (err, result2) {
           if (err) throw err;
           //console.log(result2.affectedRows + " record(s) updated ");
           });
          }
          else
          {
            con_s2.query(sql_s, function (err, result2) {
           if (err) throw err;
           //console.log(result2.affectedRows + " record(s) updated ");
           });
          }
          }



         
    }

    function update_ranges_while_add(category)
    {
      con.query("SELECT * FROM meta_data WHERE category >= "+mysql.escape(category), function (err, result, fields) {
        if (err) throw err;
        
          for(var i=0; i < result.length;i++)
          {
            //console.log(result[i]);
          var row=JSON.parse(JSON.stringify(result[i]));
          var sql;

          if(i==0)
          {
            var max_r= meta_map[row.category][1];
            meta_map[row.category][1]++;
            
            sql = "UPDATE meta_data SET max_range = "+mysql.escape(max_r+1)
            +" WHERE category = "+mysql.escape(row.category);

            //console.log("new me "+meta_map[row.category][1]);
           }
          else
          {
            
            var min_r= meta_map[row.category][0];
            meta_map[row.category][0]++;
            
            var max_r= meta_map[row.category][1];
            meta_map[row.category][1]++;
            

            sql = "UPDATE meta_data SET min_range = "+mysql.escape(min_r+1)+" , max_range= "
          + mysql.escape(max_r+1)+" WHERE category = "+mysql.escape(row.category);

          //console.log("new others "+meta_map[row.category][1]);

          }

          //console.log(row.film_name);
          con.query(sql, function (err, result2) {
          if (err) throw err;
         // console.log(result2.affectedRows + " record(s) updated ");
         
              /* con.query("SELECT max_range FROM meta_data WHERE category= "+mysql.escape(row.category), function (err, result, fields) {
               if (err) throw err;
               console.log(result);
                });*/
          });
         
          }

        });
    }

 
    
     function start_add(result,server_no,table_no)
    {
       for(var i=0; i < result.length;i++)
          {
            //console.log(result[i]);
          var row=JSON.parse(JSON.stringify(result[i]));

          var sql = "INSERT INTO data (film_name,category,rank,year) VALUES ("+mysql.escape(row.film_name)
          +","+mysql.escape(row.category)+","
          +mysql.escape(row.rank)+","+mysql.escape(row.year)+")" ;

          //var sql = "INSERT INTO customers (name, address) VALUES ('Company Inc', 'Highway 37')";

          update_ranges_while_add(row.category);

          //console.log(row.film_name);
          con.query(sql, function (err, result2) {
          if (err) throw err;
          console.log(result2.affectedRows + " record(s) added ");
          });
         
          var sql_s = "UPDATE Table"+table_no+" SET status = 0 WHERE film_name = "+mysql.escape(row.film_name);

          if(server_no==1)
          {
            con_s1.query(sql_s, function (err, result3) {
           if (err) throw err;
           //console.log(result2.affectedRows + " record(s) updated ");
           });
          }
          else
          {
            con_s2.query(sql_s, function (err, result3) {
           if (err) throw err;
          // console.log(result2.affectedRows + " record(s) updated ");
           });
          }


          }

     
    }

    function p_check(opr)
    {
     
     con_s1.query("SELECT * FROM Table0 WHERE status= "+mysql.escape(opr), function (err, result0, fields) {
      if (err) throw err;
       con_s1.query("SELECT * FROM Table1 WHERE status= "+mysql.escape(opr), function (err, result1, fields) {
      if (err) throw err;
     
     con_s2.query("SELECT * FROM Table0 WHERE status= "+mysql.escape(opr), function (err, result2, fields) {
      if (err) throw err;
     
     
     if(opr==1)
     {
      start_update(result0,1,0);
      start_update(result1,1,1);
      start_update(result2,2,0);
      
     }
     else if(opr==2)
     {
      start_add(result0,1,0);
      start_add(result1,1,1);
      start_add(result2,2,0);
     }
     else if(opr==-1)
     {
      start_delete(result0,1,0);
      start_delete(result1,1,1);
      start_delete(result2,2,0);


     }

     

    });
     

    });
    });


    }
   


    function periodically()
    {
        console.log("periodically");

            //-1 deleted
            //1 updated
            //2 added 
    

         p_check(1);
         p_check(-1);
         p_check(2);

    }



   /* con.connect(function(err) {
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

          //fill_simulated_meta_data();

        });
      });*/
      
     
     function till_client_server_no(data)
     {
      
      var this_socket=this;
      con.query("SELECT server_no FROM meta_data WHERE category= "+mysql.escape(data.category), function (err, result, fields) {
      if (err) throw err;
      
      var row=JSON.parse(JSON.stringify(result[0]));
      console.log(row.server_no);

      var  server_no={
        server_no:row.server_no
      };
      
       this_socket.emit("server_no",server_no);


       });

      
     }

    /* function send_dbName(data)
     {
      
      console.log("i am server "+data.server_no);

     }*/

     //initially create the map without any key

function addValueToMap(key, value1,value2) {
    //if the list is already created for the "key", then uses it
    //else creates new list for the "key" to store multiple values in it.
    meta_map[key] = meta_map[key] || [];
    meta_map[key].push(value1);
    meta_map[key].push(value2);
}
      
    app.get('/',function(req, res) {
    	res.sendFile(__dirname + '/client/index.html');
    });

    /*app.get('/server',function(req, res) {
      res.sendFile(__dirname + '/index.html');
    });*/

    //app.use('/client',express.static(__dirname + '/client'));

   
    serv.listen(process.env.PORT || 3000);
    console.log("Master started.");


    io.sockets.on('connection', function(socket){
    	console.log("socket connected"); 
      
      
      //socket.on("i_am_server",send_dbName);
      

      socket.on("request_to_master",till_client_server_no);



    });




