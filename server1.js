var express = require('express');
var app = express();
var serv = require('http').Server(app);
var mysql = require('mysql');
// io connection 
var io = require('socket.io')(serv,{});


var socket_master; 
socket_master = io.connect('http://localhost:3000/server');


var con = mysql.createConnection({
  host: "localhost",
  user: "root",
  password: ""
});



function print_check(data)
{
	console.log(data.category);
}
  
app.get('/',function(req, res) {
	res.sendFile(__dirname + '/client/index.html');
});
app.use('/client',express.static(__dirname + '/client'));
serv.listen(process.env.PORT || 2000);
console.log("Server started.");

io.sockets.on('connection', function(socket){
	console.log("socket connected server"); 

    var server_no={
    	server_no:1
    }
	socket_master.emit("i_am_server",server_no);

    //socket.on("request_to_master",print_check)

});
