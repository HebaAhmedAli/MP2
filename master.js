    var express = require('express');
    var app = express();
    var serv = require('http').Server(app);
    var mysql = require('mysql');
    // io connection 
    var io = require('socket.io')(serv,{});

    app.use(express.static('public'));
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


    function fill_table_in_server(Category_data,table_name,server_no)
    {
       for(var i=0;i<Category_data.length;i++)
          {
             var row=JSON.parse(JSON.stringify(Category_data[i]));
             var MovieName=row.MovieName;
             var Category=row.Category;
             var Rating=row.Rating;
             var date=row.Year;
             var Language=row.Language;

               var sql = "INSERT INTO "+table_name+" (MovieName, Category,Rating,Year,Language,Status) VALUES ("+mysql.escape(MovieName)+
          ","+mysql.escape(Category)+","+mysql.escape(Rating)+","+mysql.escape(date)+","+mysql.escape(Language)+", 0 )";

            if(server_no==1)
            {

              con_s1.query(sql, function (err, result) {
              if (err) throw err;
              //console.log("1 record inserted");
              });
            }
            else
            {
             
              con_s2.query(sql, function (err, result) {
              if (err) throw err;
              //console.log("1 record inserted");
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
          addValueToMap(row.Category,row.min_range,row.max_range);
        }
        

        });

        
    }
    function fill_meta_data(min_range,max_range,Category,server_no)
    {
         var sql = "INSERT INTO meta_data (Category, min_range,max_range,server_no) VALUES ("+mysql.escape(Category)+
              ","+mysql.escape(min_range)+","+mysql.escape(max_range)+","+mysql.escape(server_no)+")";

       
            
              con.query(sql, function (err, result) {
              if (err) throw err;
              //console.log("1 record inserted");
              });
    }

    function fill_servers_data (Category_name,server_no,i,result) {

      
      
        if(server_no==1)
        {
          var table_name=parseInt(i/2);
          if(i!=1)
          {
             con_s1.query("CREATE TABLE Table"+parseInt(i/2)+" (MovieName VARCHAR(100) NOT NULL UNIQUE,  Category VARCHAR(50),Rating INT(11),Year VARCHAR(50),Language VARCHAR(200),Status INT(11))", function (err, result1) {
        if (err) throw err;
       console.log("Table created");
       });
        
          }

          fill_table_in_server(result,"Table"+table_name,1);
          fill_meta_data(lower_range,lower_range+result.length-1,Category_name,1);
           
        }
        else
        {
          con_s2.query("CREATE TABLE Table0 (MovieName VARCHAR(100) NOT NULL UNIQUE, Category VARCHAR(50),Rating INT(11),Year DATE,Language VARCHAR(200),Status INT(11))", function (err, result2) {
        if (err) throw err;
       console.log("Table created");
       });

           fill_table_in_server(result,"Table0",2);
           fill_meta_data(lower_range,lower_range+result.length-1,Category_name,2);
           
        }

        lower_range+=result.length;

     

    }

    function generic_fill(categories)
    {
        var arr=[];
        var result_map={};
        var actual_result={};

        
       con.query("SELECT * FROM data where Category="+mysql.escape(categories[0]), function (err, result0) {
        if (err) throw err;

        arr.push(result0.length);
        result_map[result0.length]=categories[0]; //categories sizes
        actual_result[categories[0]]=result0; //categories data


        con.query("SELECT * FROM data where Category="+mysql.escape(categories[1]), function (err, result1) {
        if (err) throw err;

         arr.push(result1.length);
         result_map[result1.length]=categories[1];
          actual_result[categories[1]]=result1; //categories data


        con.query("SELECT * FROM data where Category="+mysql.escape(categories[2]), function (err, result2) {
        if (err) throw err;

        arr.push(result2.length);
         result_map[result2.length]=categories[2];
          actual_result[categories[2]]=result2; //categories data


       
        con.query("SELECT * FROM data where Category="+mysql.escape(categories[3]), function (err, result3) {
         if (err) throw err;
        
         arr.push(result3.length);
         result_map[result3.length]=categories[3];
          actual_result[categories[3]]=result3; //categories data


        
         arr.sort(function(a,b){ //Array now becomes [7, 8, 25, 41]
    return a - b
      });
 



         console.log(arr);
         console.log(result_map);
         //console.log(actual_result);


         for(var i=0;i<arr.length;i++)
         {
           fill_servers_data(result_map[arr[i]],parseInt(i/3)+1,i,actual_result[result_map[arr[i]]]);
         }

        

        });
        });

        });

        });
      
     
    }

    function start_update(result,server_no,table_no)
    {

      
      for(var i=0; i < result.length;i++)
          {
            //console.log(result[i]);
          var row=JSON.parse(JSON.stringify(result[i]));

          var sql = "UPDATE data SET Rating = "+mysql.escape(row.Rating)+" , Year= "
          + mysql.escape(row.Year)+" , Language= "
          + mysql.escape(row.Language)+" WHERE MovieName = "+mysql.escape(row.MovieName);

          //console.log(row.MovieName);
          con.query(sql, function (err, result2) {
          if (err) throw err;
          console.log(result2.affectedRows + " record(s) updated ");

          var sql_s = "UPDATE Table"+table_no+" SET Status = 0 WHERE MovieName = "+mysql.escape(row.MovieName);

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

    function update_ranges_while_delete(Category)
    {
        con.query("SELECT * FROM meta_data WHERE Category >= "+mysql.escape(Category), function (err, result, fields) {
        if (err) throw err;
        
          for(var i=0; i < result.length;i++)
          {
            //console.log(result[i]);
          var row=JSON.parse(JSON.stringify(result[i]));
          var sql;

          if(i==0)
          {
             var max_r= meta_map[row.Category][1];
            meta_map[row.Category][1]--;
            
            sql = "UPDATE meta_data SET max_range = "+mysql.escape(max_r-1)
            +" WHERE Category = "+mysql.escape(row.Category);
           }
          else
          {
            var min_r= meta_map[row.Category][0];
            meta_map[row.Category][0]--;
            
            var max_r= meta_map[row.Category][1];
            meta_map[row.Category][1]--;
            

            sql = "UPDATE meta_data SET min_range = "+mysql.escape(min_r-1)+" , max_range= "
          + mysql.escape(max_r-1)+" WHERE Category = "+mysql.escape(row.Category);
          }

          //console.log(row.MovieName);
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

          var sql = "DELETE FROM data WHERE MovieName = "+mysql.escape(row.MovieName);

          update_ranges_while_delete(row.Category);

          //console.log(row.MovieName);
          con.query(sql, function (err, result2) {
          if (err) throw err;
          console.log(result2.affectedRows + " record(s) deleted ");
          });
         
          var sql_s = "DELETE FROM Table"+table_no+" WHERE MovieName = "+mysql.escape(row.MovieName);

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

    function update_ranges_while_add(Category)
    {
      con.query("SELECT * FROM meta_data WHERE Category >= "+mysql.escape(Category), function (err, result, fields) {
        if (err) throw err;
        
          for(var i=0; i < result.length;i++)
          {
            //console.log(result[i]);
          var row=JSON.parse(JSON.stringify(result[i]));
          var sql;

          if(i==0)
          {
            var max_r= meta_map[row.Category][1];
            meta_map[row.Category][1]++;
            
            sql = "UPDATE meta_data SET max_range = "+mysql.escape(max_r+1)
            +" WHERE Category = "+mysql.escape(row.Category);

            //console.log("new me "+meta_map[row.Category][1]);
           }
          else
          {
            
            var min_r= meta_map[row.Category][0];
            meta_map[row.Category][0]++;
            
            var max_r= meta_map[row.Category][1];
            meta_map[row.Category][1]++;
            

            sql = "UPDATE meta_data SET min_range = "+mysql.escape(min_r+1)+" , max_range= "
          + mysql.escape(max_r+1)+" WHERE Category = "+mysql.escape(row.Category);

          //console.log("new others "+meta_map[row.Category][1]);

          }

          //console.log(row.MovieName);
          con.query(sql, function (err, result2) {
          if (err) throw err;
         // console.log(result2.affectedRows + " record(s) updated ");
         
              /* con.query("SELECT max_range FROM meta_data WHERE Category= "+mysql.escape(row.Category), function (err, result, fields) {
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

          var sql = "INSERT INTO data (MovieName,Category,Rating,Year,Language) VALUES ("+mysql.escape(row.MovieName)
          +","+mysql.escape(row.Category)+","
          +mysql.escape(row.Rating)+","+mysql.escape(row.Year)+","+mysql.escape(row.Language)+")" ;

          //var sql = "INSERT INTO customers (name, address) VALUES ('Company Inc', 'Highway 37')";

          update_ranges_while_add(row.Category);

          //console.log(row.MovieName);
          con.query(sql, function (err, result2) {
          if (err) throw err;
          console.log(result2.affectedRows + " record(s) added ");
          });
         
          var sql_s = "UPDATE Table"+table_no+" SET Status = 0 WHERE MovieName = "+mysql.escape(row.MovieName);

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
     
     con_s1.query("SELECT * FROM Table0 WHERE Status= "+mysql.escape(opr), function (err, result0, fields) {
      if (err) throw err;
       con_s1.query("SELECT * FROM Table1 WHERE Status= "+mysql.escape(opr), function (err, result1, fields) {
      if (err) throw err;
     
     con_s2.query("SELECT * FROM Table0 WHERE Status= "+mysql.escape(opr), function (err, result2, fields) {
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
        con.query("SELECT DISTINCT Category FROM data", function (err, result) {
          if (err) throw err;

          var categories = [];

         // append new value to the array
          
          for(var i=0; i < result.length;i++)
          {
            var row=JSON.parse(JSON.stringify(result[i]));
            categories.push(row.Category);
        
            //fill_servers_data(row.Category,parseInt(i/3)+1,i);
            //console.log(parseInt(i/3)+1);
          }

          generic_fill(categories);

         
          //fill_simulated_meta_data();

        });
      });
      
     */
     function till_client_server_no(data)
     {
      console.log("in master "+data.Category);
      var this_socket=this;
      con.query("SELECT server_no FROM meta_data WHERE Category= "+mysql.escape(data.Category), function (err, result, fields) {
      if (err) throw err;
      
      var row=JSON.parse(JSON.stringify(result[0]));
      console.log(row.server_no);

      var server_no ;

        if(row.server_no==1)
        server_no = {
          server_no: 2000
         };
         else
         server_no = {
          server_no: 5000
         };

       
         console.log("master till clieant "+server_no.server_no);

      
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

   
    serv.listen(process.env.PORT || 4000);
    console.log("Master started.");


    io.sockets.on('connection', function(socket){
    	console.log("socket connected"); 
      
      
      //socket.on("i_am_server",send_dbName);
      

      socket.on("request_to_master",till_client_server_no);



    });




