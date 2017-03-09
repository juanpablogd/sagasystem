var db = window.openDatabase("bdpolimovil", "1.0", "Proyecto Cliente Policia", 33554432);

function errorCB(err) {
	// Esto se puede ir a un Log de Error dir�a el purista de la oficina, pero como este es un ejemplo pongo el MessageBox.Show :P
	if (err.code !== undefined && err.message !== undefined){
    	//alert("Error procesando SQL: Codigo: " + err.code + " Mensaje: "+err.message);
   	}else{
   		db.transaction(TBLusuario);		//alert("Crear Tabla Usuario");
   	}
}
function successCB() {
    //alert("TRANSACION Ok!");
}
/* CREACIÓN DE LA TABLA USUARIO Y REGISTRO EN EL DISPOSITIVO */
function TBLusuario(tx) { //Si no existe crea la talba USUARIOS	//tx.executeSql('DELETE TABLE IF EXISTS "usuario"');
    tx.executeSql('CREATE TABLE IF NOT EXISTS ubicacion ("longitud" TEXT,"latitud" TEXT,"exactitud" TEXT,"velocidad" TEXT,"direccion" TEXT,"fecha_captura" TEXT)');
	db.transaction(enviar_geo);
}

function msj_peligro(msj){
/*	$.growl(msj, { 
			type: "danger", 
			timer : 100,
			delay: 3000,
				animate: {
					enter: 'animated bounceIn',
					exit: 'animated bounceOut'
				},
				placement: {
					from: "top",
					align: "center"
				}
	});*/
}

/* VERIFICA SI YA EXISTE REGISTRO DE ALGÚN USUARIO Y SI YA ESTÁ ACTIVADO O NO*/
function enviar_geo(tx) {	//console.log('SELECT nombres,apellidos,cedula,telefono,direccion,email,clave,activo FROM registro');
	tx.executeSql('select longitud,latitud,exactitud,velocidad,direccion,fecha_captura from ubicacion order by rowid', [],Resp_enviar_geo, errorCB);
}
function Resp_enviar_geo(tx, results) {
	
	//NÚMERO DE REGISTROS
    var len = results.rows.length;		//console.log("NÚMERO DE REGISTROS: "+len);					
	for (i = 0; i < len; i++){ 
		//id_t_usuario = results.rows.item(i).id_t_usuario; console.log(id_t_usuario);
		longitud = results.rows.item(i).longitud; 
		latitud = results.rows.item(i).latitud; 
		exactitud = results.rows.item(i).exactitud; 
		velocidad = results.rows.item(i).velocidad;
		direccion = results.rows.item(i).direccion;
		//console.log(longitud + " " +latitud+"; Exact: "+exactitud+"; Vel.: "+velocidad+"; Dir: "+direccion);
		fecha_captura = results.rows.item(i).fecha_captura; //console.log("Fecha Cap: " +fecha_captura);
		
		var parametros = new Object();
			parametros['imei'] = imei;
			parametros['longitud'] = longitud;
			parametros['latitud'] = latitud;
			parametros['exactitud'] = exactitud;
			parametros['velocidad'] = velocidad;
			parametros['direccion'] = direccion;		
			parametros['fechacaptura'] = fecha_captura;
			parametros['tipo'] = '2';
			//console.log(parametros);
		app.enviar(parametros);	

	}
}

function RegError(){
	msj_peligro("Error al eliminar el Registro");
}

/*	Envía cada 2 segundos las coordenadas pendientes */
setInterval(function(){db.transaction(enviar_geo);}, 10000);

