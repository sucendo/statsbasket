/**
 * stats-teams.js v1.0.0
 *
 * Licensed under the MIT license.
 * http://www.opensource.org/licenses/mit-license.php
 * 
 * Copyright 2016, Sucendo
 * http://www.sucendo.com
 */
 
 /*Time variable recording the number of milliseconds past since start of the stats teams*/
 

    function stats_teams(archive_json, table, div, week, competition) {
		var json = [];
		var aviso = 0;
				
		$.getJSON(archive_json, function(datos) {
										
			var f = 0;
		 
			$.each(datos["equipos"], function(idx,equipo) {
											
				var PJe = 0;							
				var dat = ['',0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0];
										
				dat[0] = equipo["nombre"];
				var pnd = 0;
								
				$.each(datos["partidos"], function(idx,partido){
					
					if (partido["semana"] <= week){
					
						if (partido["competicion"] == competition){
					
							$.each(partido["equipos"], function(idx,equipos){
								
								if (idx==0){
									pt_local = equipos["puntos"];
									eq_local = equipos["equipo"];
								}else{
									pt_visitante = equipos["puntos"]; 
									eq_visitante = equipos["equipo"]; 
								}
									
								if (equipos["equipo"] == equipo["numero"]){	
									dat[1]++;						
								}	
							
							});

							if ((eq_local == equipo["numero"])||(eq_visitante == equipo["numero"])){
								if ((pt_local == 0) && (pt_visitante == 20)){
									pnd++;
									dat[0]=dat[0]+" (*)";
									aviso++;
								}
								if ((pt_local == 20) && (pt_visitante == 0)){
									pnd++;
									dat[0]=dat[0]+" (*)";
									aviso++;
								}
							}
							
							$.each(partido["acciones"], function(idx,accion) {
							
								if (accion["equipo"] == equipo["numero"]){
						
									if (accion["ficha"] != 100){
									
										if (accion["acierto"] == "dentro"){
											if (accion["tipo"] == "T1"){dat[4]++;dat[2]++;dat[6]++;}
										}else{
											if (accion["tipo"] == "T1") {dat[6]++;}
										}
										if (accion["tipo"] == "T2") {dat[2]+=2;dat[7]++;}
										if (accion["tipo"] == "T3") {dat[2]+=3;dat[9]++;}
										if (accion["tipo"] == "reb") dat[11]++;
										if (accion["tipo"] == "tap") dat[13]++;
										if (accion["tipo"] == "fal") dat[15]++;
										
									}

								}
											 
							});
						
						}
						
					}
				
				});	

				/*funcion medias*/
				//PTS + ASIS + REB + TAPF + BR + FR + T1C + T2C + T3C - BP - TAPC - FP - T1I - T2I - T3I = VL
				/*
				dat[19] = dat[2] + dat[12] + dat[9] + dat[15] + dat[13] + dat[18] + dat[3] + dat[5] + dat[7] - dat[14] - dat[16] - dat[17] - dat[4] - dat[6] - dat[8];
						
				if (dat[0] != 0){
					dat[19] = (dat[19] / dat[0]).toFixed(2);
					dat[1] = (calcDivT(dat[1],dat[0])).substr(3,5);
				}else{
					dat[1] = dat[1].substr(3,5);
				}
				*/			
				
				dat[3] = (dat[2] / (dat[1] - pnd)).toFixed(2);		
				dat[5] = (dat[4] / (dat[1] - pnd)).toFixed(2);
						
				var T1 = dat[4] + "/" + dat[6];
				if(dat[6] == 0){dat[6]="-";}else{dat[6]=((dat[4]*100)/dat[6]).toFixed(0)+"%";}
				dat[4] = T1;

				dat[8] = (dat[7] / (dat[1] - pnd)).toFixed(2);		
				dat[10] = (dat[9] / (dat[1] - pnd)).toFixed(2);		
				dat[12] = (dat[11] / (dat[1] - pnd)).toFixed(2);
				dat[14] = (dat[13] / (dat[1] - pnd)).toFixed(2);
				dat[16] = (dat[15] / (dat[1] - pnd)).toFixed(2);
				/*fin funcion medias*/
				
				if (dat[1] != 0){
					json[f] = dat;
					f++;
				}

				if (pnd != 0) dat[1] =(dat[1] - pnd) + "/" + dat[1];

			});
			
			/*funcion ordenar*/
			json.sort(function (a, b){
				if (b[0] != a[0]){return (b[0] - a[0])}else{return (b[1] - a[1])}
			});
			/*fin funcion ordenar*/
			
			insert_tbody (table,json);

			/* partido no disputado */		
				if (aviso != 0){
					var p = document.createElement('p');             
					p.innerHTML += "Los Equipos con (*) al final de su nombre tienen uno o varios partidos jugados pero no disputados. La estadística de *PP se halla respecto a los partidos disputados.";
					div.appendChild(p);
				}
			/* fin partido no disputado */
			
		});
		
		
	}
		
	function insert_tbody(table, json) {
	
		var thead = document.createElement('thead');     
		thead.innerHTML += '<tr><th>Equipo</th><th>PJ</th><th>Ptos</th><th>PPP</th><th>T1</th><th>T1PP</th><th>%T1</th><th>T2</th><th>T2PP</th><th>T3</th><th>T3PP</th><th>Reb</th><th>RebPP</th><th>Tap</th><th>TapPP</th><th>Flts</th><th>FltsPP</th></tr>';           
		table.appendChild(thead); 
							
		var tbody = document.createElement('tbody');
		tbody.id = "equipos";
							
		$.each(json, function(idx,dat) {
							
			var row = document.createElement('tr');
								
			/*var cell = document.createElement('th');
			cell.innerHTML = idx+1;
			row.appendChild(cell);*/
								
			$.each(dat, function(idx,equipo) {
				if (idx < 1){var cell = document.createElement('th');}else{var cell = document.createElement('td');}
				cell.innerHTML = equipo;
				row.appendChild(cell);
			});
			/*if (idx < 10)*/
			tbody.appendChild(row);
		});    
										
		table.appendChild(tbody);
		stickytable(table.id);
                
    }
