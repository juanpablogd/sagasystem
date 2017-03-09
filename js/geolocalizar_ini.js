var myLatitud;
var myLongitud;
var myPrecision;
var speed;
var heading;
var timestamp;
var watchID = null;
var options = { maximumAge: 60000*1, timeout: 10000, enableHighAccuracy: true }; //timeout: 60000*10, enableHighAccuracy: true };

var success = function(pos) {
	 myLatitud = pos.coords.latitude;		var buscar_myLatitud = myLatitud.toString().substring(0, 5);		//console.log(buscar_myLatitud);
	 myLongitud = pos.coords.longitude;		var buscar_myLongitud = myLongitud.toString().substring(0, 7);		//console.log(buscar_myLongitud);
	 myPrecision = pos.coords.accuracy;
	 speed = pos.coords.speed; 		if(speed == null) speed = "";
	 heading = pos.coords.heading;	if(heading == null) heading = "";		 	//text = "<div>Latitude: " + myLatitud + "<br/>" + "Longitude: " + myLongitud + "<br/>" + "Accuracy: " + myPrecision + " m<br/>" + "</div>";
	 
	var now = new Date();
	var timestamp    = now.getFullYear()+'-'+(1+now.getMonth())+'-'+now.getDate()+'-'+now.getHours()+'_'+now.getMinutes()+'_'+now.getSeconds();
	var SQLtimestamp = now.getFullYear()+'-'+(1+now.getMonth())+'-'+now.getDate()+'-'+now.getHours();	//FECHA Y HORA 2014-11-10-10
	 
	var parentElement = document.getElementById('deviceready');
	var ubicandoElement = parentElement.querySelector('.ubicando');
	var georeferenciadoElement = parentElement.querySelector('.georeferenciado');
	ubicandoElement.setAttribute('style', 'display:none;');
	georeferenciadoElement.setAttribute('style', 'display:block;');
	 
	function errorInsert(err) {		console.log('Error en consulta!!!!!');	//alert("INSERT FALLÓ!");
		// Esto se puede ir a un Log de Error dir�a el purista de la oficina, pero como este es un ejemplo pongo el MessageBox.Show :P
		if (err.code !== undefined && err.message !== undefined){
	    	//alert("Error procesando SQL: Codigo: " + err.code + " Mensaje: "+err.message);
	   	}else{ //alert("Crear Tabla Usuario");
	   		db.transaction(TBLubicacion);
	   	}
	}
	function successInsert() {
	    //alert("INSERT Ok!");
	}
	/* CREACIÓN DE LA TABLA USUARIO Y REGISTRO EN EL DISPOSITIVO */
	function TBLubicacion(tx) { //Si no existe crea la talba USUARIOS	//tx.executeSql('DELETE TABLE IF EXISTS "usuario"');
		console.log('CREATE TABLE IF NOT EXISTS ubicacion ("longitud" TEXT,"latitud" TEXT,"exactitud" TEXT,"velocidad" TEXT,"direccion" TEXT,"fecha_captura" TEXT)');
	    tx.executeSql('CREATE TABLE IF NOT EXISTS ubicacion ("longitud" TEXT,"latitud" TEXT,"exactitud" TEXT,"velocidad" TEXT,"direccion" TEXT,"fecha_captura" TEXT)');
		if(myPrecision < 100){
			db.transaction(function(tx) { //console.log('SELECT * FROM ubicacion  where fecha_captura like "'+SQLtimestamp+'%" and latitud like "'+buscar_myLatitud+'%" and longitud like "'+buscar_myLongitud+'%";');
			   tx.executeSql('SELECT * FROM ubicacion  where fecha_captura like "'+SQLtimestamp+'%" and latitud like "'+buscar_myLatitud+'%" and longitud like "'+buscar_myLongitud+'%";', [],
			     function(tx, result) {
			     	var len = result.rows.length;	//console.log(len);
			     	if(len == 0){
			     		  //console.log('INSERT INTO ubicacion (longitud,latitud,exactitud,velocidad,direccion,fecha_captura) VALUES ("'+myLongitud+'","'+myLatitud+'","'+myPrecision+'","'+speed+'","'+heading+'","'+timestamp+'")');
						tx.executeSql('INSERT INTO ubicacion (longitud,latitud,exactitud,velocidad,direccion,fecha_captura) VALUES ("'+myLongitud+'","'+myLatitud+'","'+myPrecision+'","'+speed+'","'+heading+'","'+timestamp+'")');
			     	}
			     },errorInsert);
			 },errorInsert,successInsert);
		}
	}	//console.log("Presición: "+myPrecision);
	
	if(myPrecision < 100){
		db.transaction(function(tx) { //console.log('SELECT * FROM ubicacion  where fecha_captura like "'+SQLtimestamp+'%" and latitud like "'+buscar_myLatitud+'%" and longitud like "'+buscar_myLongitud+'%";');
		   tx.executeSql('SELECT * FROM ubicacion  where fecha_captura like "'+SQLtimestamp+'%" and latitud like "'+buscar_myLatitud+'%" and longitud like "'+buscar_myLongitud+'%";', [],
		     function(tx, result) {
		     	var len = result.rows.length;	//console.log(len);
		     	if(len == 0){
		     		  //console.log('INSERT INTO ubicacion (longitud,latitud,exactitud,velocidad,direccion,fecha_captura) VALUES ("'+myLongitud+'","'+myLatitud+'","'+myPrecision+'","'+speed+'","'+heading+'","'+timestamp+'")');
					tx.executeSql('INSERT INTO ubicacion (longitud,latitud,exactitud,velocidad,direccion,fecha_captura) VALUES ("'+myLongitud+'","'+myLatitud+'","'+myPrecision+'","'+speed+'","'+heading+'","'+timestamp+'")');
		     	}
		     },errorInsert);
		 },errorInsert,successInsert);
	 }
};

var failw = function(error) {
	if (myLatitud===undefined || myLatitud=="undefined"){myLatitud="";}
	if (myLongitud===undefined || myLongitud=="undefined"){myLongitud="";}
	if (myPrecision===undefined || myPrecision=="undefined"){myPrecision="";}
	//msj_peligro("No hay Ubicación, Revise su GPS");
};

//document.getElementById('search_cur_position').innerHTML = '<span class="glyphicon glyphicon-search"></span> Ubicando...';	//$("#id_tab4_geom").html('<span class="glyphicon glyphicon-search"></span> Ubicación');
watchID = navigator.geolocation.watchPosition(success, failw, options);
