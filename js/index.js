//DEFINICIÓN DE VARIABLES
var fecha_captura;
var db = window.openDatabase("bdpolimovil", "1.0", "Proyecto Cliente Policia", 33554432);

var app = {
	imei:"",
	serial:"",
    // Application Constructor
    initialize: function() {
        this.bindEvents();
    },
    // Bind Event Listeners
    // Bind any events that are required on startup. Common events are:
    // 'load', 'deviceready', 'offline', and 'online'.
    bindEvents: function() {
        document.addEventListener('deviceready', this.onDeviceReady, false);
    },
    // deviceready Event Handler
    //
    // The scope of 'this' is the event. In order to call the 'receivedEvent'
    // function, we must explicitly call 'app.receivedEvent(...);'
    onDeviceReady: function() {
        app.receivedEvent('deviceready');
		try {
			var permissions = cordova.plugins.permissions;
			permissions.hasPermission(permissions.READ_PHONE_STATE, checkPermissionCallback, null);
		}
		catch(err) {
		    console.log(err.message);
		}
		function checkPermissionCallback(status) {
		  if(!status.hasPermission) {
			var errorCallback = function() {
			  console.warn('No tiene permisos de Leer el IMEI!');
			};
			permissions.requestPermission(
			  permissions.READ_PHONE_STATE,
			  function(status) {
				if(!status.hasPermission) errorCallback();
			  },
			  errorCallback);
		  }else{
				app.getImei();	
			}
		}
    },
    // Update DOM on a Received Event
    receivedEvent: function(id) {
        var parentElement = document.getElementById(id);
        var listeningElement = parentElement.querySelector('.listening');
        var receivedElement = parentElement.querySelector('.received');

        listeningElement.setAttribute('style', 'display:none;');
        receivedElement.setAttribute('style', 'display:block;');

        console.log('Received Event: ' + id);
    },
	enviar: function(parametros){
		var urlEnvio = 'http://'+localStorage.url_servidor+'/SIG/servicios/m123/m123_geopos_SRV_BGv2.php';
			console.log(urlEnvio);
			console.log(parametros.imei); 	//alert(parametros);
		$.ajax({
			headers:  parametros,
			url: urlEnvio,
			type:  'post',
			async: false,		//timeout: 30000,
			success: function(responsef){	console.log( "RESP SRV: "+responsef);		//alert(responsef);
				if(responsef != ""){
					db.transaction(function(tx) {
						var respf = responsef.trim();	//console.log('DELETE FROM ubicacion WHERE fecha_captura = "'+respf+'"');
						tx.executeSql('DELETE FROM ubicacion WHERE fecha_captura = "'+respf+'"');
					});
				}
			},
			error: function (error) {
				msj_peligro("Error al conectarse al servidor, revise su conexión a Internet");
		    }
		});
	},
	getImei: function(){
		var deviceInfo = cordova.require("cordova/plugin/DeviceInformation");
		deviceInfo.get(function(result) { //alert(result);
		   //Obtiene el Número de SIM
		   var res = result.split("simNo");
		   res = res[1].split('"');	//alert (res[2]);
		   app.serial = res[2]; //alert("SIM / Serial: "+serial);
		   //Obtiene el IMEI
		   res = result.split("deviceID");
		   res = res[1].split('"');
		   app.imei = res[2]; console.log("GET Imei: "+app.imei);
		   app.iniGeoBackground(app.imei);
		   }, function(error) {
				console.log("Error: " + error);
				console.log("Habilite los permisos en su aplicación");
		   });
	},
	iniGeoBackground: function (imei){
		console.log("Imei  CONFIGURAR: "+imei);
		
		backgroundGeolocation.watchLocationMode(
		  function (enabled) {
			if (enabled) {
			  // location service are now enabled
			  // call backgroundGeolocation.start
			  // only if user already has expressed intent to start service
			  console.log("WhatchLocarionMode ACTIVO")
			} else {
			  // location service are now disabled or we don't have permission
			  // time to change UI to reflect that
			  console.log("WhatchLocarionMode INACTIVO - ver permisos");
			}
		  },
		  function (error) {
			console.log('Error watching location mode. Error:' + error);
		  }
		);

		backgroundGeolocation.isLocationEnabled(function (enabled) {
		  if (enabled) {
			backgroundGeolocation.start(
			  function () {
				// service started successfully
				// you should adjust your app UI for example change switch element to indicate
				// that service is running
				console.log("Habilitado isLocationEnabled")
			  },
			  function (error) {
				// Tracking has not started because of error
				// you should adjust your app UI for example change switch element to indicate
				// that service is not running
				if (error.code === 2) {
				  if (window.confirm('Not authorized for location updates. Would you like to open app settings?')) {
					backgroundGeolocation.showAppSettings();
				  }
				} else {
				  window.alert('Start failed: ' + error.message);  
				}
			  }
			);
		  } else {
			// Location services are disabled
			if (window.confirm('Location is disabled. Would you like to open location settings?')) {
			  backgroundGeolocation.showLocationSettings();
			}
		  }
		});
		
		/**
		* This callback will be executed every time a geolocation is recorded in the background.
		*/
		var callbackFn = function(location) {
			console.log('[js] BackgroundGeolocation callback:  ' + location.latitude + ',' + location.longitude);
			// Do your HTTP request here to POST location to your server.
			// jQuery.post(url, JSON.stringify(location));
			var now = new Date();
			var timestamp    = now.getFullYear()+'-'+(1+now.getMonth())+'-'+now.getDate()+'-'+now.getHours()+'_'+now.getMinutes()+'_'+now.getSeconds();
			
			var parametros = new Object();
				parametros['imei'] = imei;
				parametros['longitud'] = location.longitude;
				parametros['latitud'] = location.latitude;
				parametros['exactitud'] = location.accuracy;
				parametros['velocidad'] = location.speed;
				parametros['direccion'] = location.bearing;		
				parametros['fechacaptura'] = timestamp;
				parametros['tipo'] = '3';
				app.enviar(parametros);
			/*
			IMPORTANT:  You must execute the finish method here to inform the native plugin that you're finished,
			and the background-task may be completed.  You must do this regardless if your HTTP request is successful or not.
			IF YOU DON'T, ios will CRASH YOUR APP for spending too much time in the background.
			*/
			backgroundGeolocation.finish();
		};

		var failureFn = function(error) {
			console.log('BackgroundGeolocation error');
		};
		
		backgroundGeolocation.configure(callbackFn, failureFn, {
			debug: true,
			desiredAccuracy: 10,
			stationaryRadius: 20,
			distanceFilter: 30,
			url: 'http://saga.cundinamarca.gov.co/SIG/servicios/m123/m123_geopos_SRV_BGv2.php',
			httpHeaders: { imei: imei },
			maxLocations: 1000,
			// Android only section
			locationProvider: backgroundGeolocation.provider.ANDROID_DISTANCE_FILTER_PROVIDER,
			interval: 60*1000,
			fastestInterval: 5000,
			activitiesInterval: 10000,
			notificationTitle: 'Background tracking',
			notificationText: 'enabled',
			notificationIconColor: '#FEDD1E',
			notificationIconLarge: 'mappointer_large',
			notificationIconSmall: 'mappointer_small',
			startOnBoot: true
		});
		//INICIA SERVICIO BACKGROUND
		// Turn ON the background-geolocation system.  The user will be tracked whenever they suspend the app.
		backgroundGeolocation.start();
	}
};

app.initialize();

