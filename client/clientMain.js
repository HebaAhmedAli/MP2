var socket; 
socket = io.connect('http://localhost:3000');

var socket_serv1; 
socket_serv1 = io.connect('http://localhost:2000');

var socket_serv2; 
socket_serv2 = io.connect('http://localhost:5000');


function ask_server(data)
{
	console.log("client will ask server "+data.server_no);
}

console.log("connected to master"); 

var data={
	category:"horor"
}

socket.emit("request_to_master",data);
//socket_serv1.emit("request_to_master",data);

socket.on("server_no",ask_server);

