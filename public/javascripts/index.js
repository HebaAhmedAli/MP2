
var ColorChange = document.getElementById('color');
var socket; 
socket = io.connect();

//socket = io('http://localhost:2000');

// mafrood kol el emits de hatroo7 el awel ll master b3d kda y3raf el server w y3mel emit leeh tany
function searchbox() {
    var minRate = document.getElementById('filmMinRate').value;
    var name = document.getElementById('filmName').value;
    var category_from_user = document.getElementById('category').value;


    console.log(minRate);
    console.log(name);
    console.log(category_from_user);


    socket.emit('client_find', {category : category_from_user, rating: minRate, movieName: name})

  }

  function AddRow(){

    var name_from_user = document.getElementById('AddMovieName').value;
    var minRating_from_user = document.getElementById('AddRating').value;
    var category_from_user = document.getElementById('AddCategory').value;
    var language_from_user = document.getElementById('AddLanguage').value;
    var directory_from_user = document.getElementById('AddDirector').value;
    var year_from_user = document.getElementById('AddYear').value;
    var awards_from_user = document.getElementById('AddAwards').value;
    



    socket.emit('client_add_row', {category : category_from_user,
                             rating: minRating_from_user,
                             movieName: name_from_user, 
                             language:language_from_user,
                             directory:directory_from_user,
                             year:year_from_user,
                             awards:awards_from_user,
                            })

  }

  function DeleteRow(){

    var name_from_user = document.getElementById('DeleteMovieName').value;
    var category_from_user = document.getElementById('DeleteCategory').value;
    



    socket.emit('client_delete_row', {category : category_from_user,
                                       movieName: name_from_user})

  }



  