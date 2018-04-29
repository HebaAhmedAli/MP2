
var ColorChange = document.getElementById('color');
var socket_master,socket_server,server_connected;
var firstTime= true;
var func_type;
var lockFunctions= false;
// socket = io.connect();
socket_master = io.connect('http://localhost:4000');
socket_server = io.connect('http://localhost:2000');
console.log(socket_server);
// mafrood kol el emits de hatroo7 el awel ll master b3d kda y3raf el server w y3mel emit leeh tany
function searchbox() {
		if (lockFunctions== false ){
  	lockFunctions= true;

     func_type=0;
     var category_from_user = document.getElementById('category').value;

 request_server_from_master({Category : category_from_user});
  }
}

function Search_toServer(){
   var minRate = document.getElementById('filmMinRate').value;
    var name = document.getElementById('filmName').value;
    var category_from_user = document.getElementById('category').value;


    console.log(minRate);
    console.log(name);
    console.log(category_from_user);
   
    socket_server.emit('client_find', {Category : category_from_user, rating: minRate, movieName: name})
    


}

  function AddRow(){
  	if (lockFunctions== false ){
  	lockFunctions= true;
 	func_type=1;


     var category_from_user = document.getElementById('AddCategory').value;

     console.log("Add"+category_from_user);

    request_server_from_master({Category : category_from_user});
	}
  }


  function AddRow_toServer(){


    var name_from_user = document.getElementById('AddMovieName').value;
    var minRating_from_user = document.getElementById('AddRating').value;
    var category_from_user = document.getElementById('AddCategory').value;
    var language_from_user = document.getElementById('AddLanguage').value;
    //var directory_from_user = document.getElementById('AddDirector').value;
    var year_from_user = document.getElementById('AddYear').value;
    //var awards_from_user = document.getElementById('AddAwards').value;
   



    socket_server.emit('client_add_row', {category : category_from_user,
                             rating: minRating_from_user,
                             movieName: name_from_user, 
                             language:language_from_user,
                             //directory:directory_from_user,
                             year:year_from_user,
                             //awards:awards_from_user,
                            })




  }


  function DeleteRow(){
	if (lockFunctions== false ){
  	lockFunctions= true;
    
    func_type=3;
    var category_from_user = document.getElementById('DeleteCategory').value;

    console.log("Add"+category_from_user);
    request_server_from_master({Category : category_from_user});
  		}
	}


  function DeleteRow_toServer (){

  	var name_from_user = document.getElementById('DeleteMovieName').value;
    var category_from_user = document.getElementById('DeleteCategory').value;
    
		socket_server.emit('client_delete_row', {category : category_from_user,
										movieName: name_from_user})


  }



function SetOnClick(){
	if (lockFunctions== false ){
  	lockFunctions= true;
    func_type=2;
    var category_from_user = document.getElementById('setCategory').value;
    

    console.log("aaabdo sel "+ category_from_user);

   request_server_from_master({Category : category_from_user});
		}
	}


	function Set_toServer (){

 var Rating_set = document.getElementById('setRating').value;
    var Year_set = document.getElementById('setYear').value;
    var Language_set = document.getElementById('setLanguage').value;
    //var Director_set = document.getElementById('setDirector').value;
    var Category_set = document.getElementById('setCategory').value;
    var Moviename_set = document.getElementById('setMovieName').value;

    socket_server.emit('client_set', {movieName: Moviename_set,
    								category : Category_set,
    								Rating : Rating_set,
    								Year: Year_set, 
    								Language: Language_set,
                                    //Director: Director_set
                                 });
    


	}

function DelOnClick(){
		if (lockFunctions== false ){
  	lockFunctions= true;
    func_type=4;

    var category_from_user = document.getElementById('delCategory').value;

    console.log("aaabdo del "+ category_from_user);

    request_server_from_master({Category : category_from_user});
}
}


function Del_toServer(){
// to be compeleted 

var Rating_delCells = document.getElementById('delRatting').checked;
var Year_delCells = document.getElementById('delYear').checked;
var Language_delCells = document.getElementById('delLanguage').checked;
var category_from_user = document.getElementById('delCategory').value;
var Moviename_delCells = document.getElementById('delMovieName').value;



socket_server.emit('client_DelCells', {movieName: Moviename_delCells,
                                category : category_from_user,
                                Ratting : Rating_delCells,
                                Year: Year_delCells, 
                                Language: Language_delCells });

}


function showResultFind(data){

console.log(data.Result);
//console.log("2na d5lt 2l result");
lockFunctions= false;
}

function showResultSAddMovie(data){
    console.log(data.Result);
lockFunctions= false;

}

function showResultSet(data){

    console.log(data.Result);
lockFunctions= false;

}

function showResultDeleteMovie (data){

    console.log(data.Result);

lockFunctions= false;

}

function showResultDeleteCells(data){

    console.log(data.Result);

lockFunctions= false;
}



function ask_server(data)
{
    console.log("client will ask server "+data.server_no);
    if(firstTime){
        updateSocketOn(data.server_no);
        console.log(socket_server);
    
        server_connected=data.server_no;
       
        firstTime=false;
        console.log(socket_server);
    }else if(data.server_no!=server_connected){
        //updateSocketOn();
        updateSocketOn(data.server_no);
        console.log("tttoooooootttt");
        server_connected=data.server_no;
        //socket_server=io.connect("http://localhost:"+server_connected);
    }
    console.log(socket_server);
    switch(func_type) { //lock the func_type untill here used
        
        case 0:
            //call Search
            console.log("calling search");
            Search_toServer();
            
            break;
        case 1:
            //call AddRow
            console.log("calling AddRow");
            AddRow_toServer();
            break;
        case 2:
            //call SetRow
            console.log("calling set");
            Set_toServer();
            break;
        case 3:
            //call DeleteRow
            console.log("calling del");
            DeleteRow_toServer();
            break;
        case 4:
            //call DelCells
            console.log("calling del cel");
            Del_toServer();
            break;
        default:
            console.log("error no ")
    } 
}

function request_server_from_master(data){

    //console.log("requestttttt")
    socket_master.emit("request_to_master",data);
  }

socket_master.on("server_no",ask_server);



function updateSocketOn(server){

    socket_server.disconnect();
    socket_server=io.connect("http://localhost:"+server);
    
    socket_server.on("ShowResultFind",showResultFind);

    socket_server.on("showResultSAddMovie",showResultSAddMovie);
    socket_server.on("showResultSet",showResultSet);
    socket_server.on("showResultDeleteMovie",showResultDeleteMovie);
    socket_server.on("showResultDeleteCells",showResultDeleteCells);
    
    



}

    




