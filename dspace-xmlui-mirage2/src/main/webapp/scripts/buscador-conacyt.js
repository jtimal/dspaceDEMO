/*
 * The contents of this file are subject to the license and copyright
 * detailed in the LICENSE and NOTICE files at the root of the source
 * tree and available online at
 *
 * http://www.dspace.org/license/
 */
//Contenedor principal del cuerpo del modal y variables principales
var content;
var campo;

//Funcion Iniciadora
function AuthorLookup(p1, p2, p3) {
//    TODO i18n
    campo = p2;
    content =   $(        '<div class="modal fade" id="modal1">'+
                              '<div class="modal-dialog modal-lg">'+
                                '<div class="modal-content">'+
                                  '<div class="modal-header">'+
                                    '<button type="button" class="close" data-dismiss="modal" aria-label="Close">'+
                                      '&times;'+
                                    '</button>'+
                                    '<h5 class="modal-title">Búsqueda de Autor CONACyT</h5>'+
                                    '<div class="fg-toolbar ui-toolbar ui-widget-header ui-helper-clearfix ui-corner-tl ui-corner-tr">'+
                                        'Nombre a buscar: </br>'+
                                        'Nombre: <input type="text" name="FirstName" id="FirstName"> Apellidos: <input type="text" name="LastName" id = "LastName">'+
                                        '<button type="button" onclick="Start_QueryPL()">Buscar</button>'+
                                    '</div>'+
                                  '<div class="modal-body">'+
                                    '<div id="Respuesta">'+
                                         'Sin Resultados'+
                                    '</div>'+
                                  '</div>'+
                                  '<div class="modal-footer">'+
                                    '<button type="button" class="btn btn-secondary" data-dismiss="modal">Cerrar</button>'+
                                  '</div>'+
                                '</div>'+
                              '</div>'+
                            '</div>'
                    );

    content.modal('show');
}


//Funcion inciadora que llama a los metodos que realizan la consulta al WebService
function Start_QueryPL(){
  var _nombre = content.find("#FirstName").val();
  var _apellidos = content.find("#LastName").val();
  var url = Query_NM(_nombre,_apellidos);
  Get_Query(url);
}


    // Create the XHR object.
function createCORSRequest(method, url) {
  var xhr = new XMLHttpRequest();
  if ("withCredentials" in xhr) {
    // XHR for Chrome/Firefox/Opera/Safari.
    xhr.open(method, url, true, "User", "Password");
  } else if (typeof XDomainRequest != "undefined") {
    // XDomainRequest for IE.
    xhr = new XDomainRequest();
    xhr.open(method, url);
  } else {
    // CORS not supported.
    xhr = null;
  }
  return xhr;
}


//Funcion que crea la consulta CORS
function Get_Query(url) {
  // This is a sample server that supports CORS.
  var xhr = createCORSRequest('GET', url);
  if (!xhr) {
    alert('CORS not supported');
    return;
  }
  content.find("#Respuesta").html("Buscando...");
  // Response handlers.
  xhr.onload = function() {
    var text = xhr.responseText;
    var myArr = JSON.parse(xhr.responseText);
    //El resultado lo manda a otra funcion para ser procesado
    WriteJson2(myArr);
    return myArr;
  };

  xhr.onerror = function() {
    alert('Error al procesar tu solicitud, revisa los ajustes de tu navegador');
  };

  xhr.send();
}

//Funcion que recibe como argumento la respuesta del servidor
function WriteJson2(JsonArray){
  var _table = "<br>";
    if (JsonArray.length != 0) {
        _table = _table +
        '<table id = "TablaDatos" class="TablaDatos col-xs-12" type="display">'+
          '<thead>'+
            '<tr>'+
              '<th>Apellidos</th>'+
              '<th>Nombre</th>'+
              '<th>Correo</th>'+
              '<th>ID</th>'+
              '<th>Tipo</th>'+
            '</tr>'+
          '</thead>'+
          '<tbody>';
        var _trs = "";
        for (var i = JsonArray.length - 1; i >= 0; i--) {
          var aux = Format(JsonArray[i]);
          var _trs = _trs + "<tr><td>"+aux[0]+"</td><td>"+aux[1]+"</td><td>"+aux[2]+"</td><td>"+aux[3]+"</td><td>"+aux[4]+"</td></tr>"
        }
        _table = _table + _trs +
          '<div class="vcard-add" align="right">' +
          '<div id="previewData" class="previewData"> </div>'+
            '<button type="button" id="AddPerson">Agregar</button>' +
          '</div>' +
        '</tbody>'+'</table>';
    }
  else{
    _table = _table + "No hay información en la Base de Datos";
  }
  content.find("#Respuesta").hide();
  content.find("#Respuesta").html(_table);
  content.find("#Respuesta").show();
  CreateDatable();
}

//funcion que recibe el elemento json y lo convierte a un arreglo con los parametros más usados
function Format(JsonElement) {
  var _response = [];
  if (JsonElement.segundoApellido) {
        var aux = JsonElement.primerApellido +" "+ JsonElement.segundoApellido;
        _response.push(aux);
        _response.push(JsonElement.nombres);
  } else {
      _response.push(JsonElement.primerApellido);
      _response.push(JsonElement.nombres);
  }
  if (JsonElement.correoE) {
    _response.push(JsonElement.correoE);
  } else{
    _response.push("-");
  }

  if (JsonElement.idCvuConacyt){
    _response.push(JsonElement.idCvuConacyt);
    _response.push(1);
  } else if (JsonElement.idIdentificadorCa){
    _response.push(JsonElement.idIdentificadorCa);
    _response.push(6);
  } else if(JsonElement.curp){
    _response.push(JsonElement.curp);
    _response.push(2);
  } else if (JsonElement.idOrcid) {
    _response.push(JsonElement.idOrcid);
    _response.push(3);
  } else if (JsonElement.dni) {
    _response.push(JsonElement.dni);
    _response.push(4);
  } else if (JsonElement.rn) {
    _response.push(JsonElement.rn);
    _response.push(5);

  }
  //console.log(_response);
  return _response;
}


//Funcion que crea la tabla de datos, usa la biblioteca dataTable
function CreateDatable(){
  //console.log("Holamundo");
  var datatable = content.find("table.TablaDatos");
  //console.log(datatable);
  datatable.dataTable({
      "info":     false,
      "searching" : false,
      "select": true,
      "columnDefs": [ {
            "orderable": false,
            "targets":   0
        },
        //Ocultar la ultima seccion
        {
          "targets": 4,
          "visible": false
        }
        ],
        "select": {
            "style":    "os",
        },
        "order": [[ 1, 'asc' ]],
        "fnRowCallback": function( nRow, aData, iDisplayIndex ) {
          var $row = $(nRow);
          //Funcion para seleccionar una fila
          $row.click(function(){
            var $this = $(this);
            if($this.hasClass('selected')){
              $this.removeClass('selected');
            }
            else{
              datatable.$('tr.selected').removeClass('selected');
              $this.addClass('selected');
            }
            var _auxData = SetPreview(datatable.api().row(this).data());
            //console.log(_auxData);
            content.find("#previewData").html(_auxData[0]);

            content.find(".vcard-add button").click(function() {
              PutValues(campo, _auxData[1], _auxData[2], _auxData[3]);
            });
          });
        },
    });
}

/*Funcion que recibe el array de valores seleccionado de la dataTable y regresa un arreglo con los valores
*para poner en el formulario de subida
*
*/
function SetPreview(ArrayDatos){
  switch (ArrayDatos[4]) {
    case "1":
      return [ArrayDatos[0]+", "+ArrayDatos[1]+"; "+ArrayDatos[3], ArrayDatos[0], ArrayDatos[1]+"; "+ArrayDatos[3], ArrayDatos[1]];
      break;
    case "2":
      return [ArrayDatos[0]+", "+ArrayDatos[1]+";-"+ArrayDatos[3], ArrayDatos[0], ArrayDatos[1]+";-"+ArrayDatos[3], ArrayDatos[1]];
      break;
    case "3":
      return [ArrayDatos[0]+", "+ArrayDatos[1]+";#"+ArrayDatos[3], ArrayDatos[0], ArrayDatos[1]+";#"+ArrayDatos[3], ArrayDatos[1]];
      break;
    case "5":
      return [ArrayDatos[0]+", "+ArrayDatos[1]+";;"+ArrayDatos[3], ArrayDatos[0], ArrayDatos[1]+";;"+ArrayDatos[3], ArrayDatos[1]];
      break;
    case "6":
      return [ArrayDatos[0]+", "+ArrayDatos[1]+";*"+ArrayDatos[3], ArrayDatos[0], ArrayDatos[1]+";*"+ArrayDatos[3], ArrayDatos[1]];
      break;
    default:
      return [ArrayDatos[0]+", "+ArrayDatos[1]+";?"+ArrayDatos[3], ArrayDatos[0], ArrayDatos[1]+";?"+ArrayDatos[3], ArrayDatos[1]];
  }
}

//Fuuncion que coloca valores en el formulario
function PutValues(_campo, _dato1, _dato2, _dato3) {
  /*
  function CapitalNames(texto) {
    const re = /(^|[^A-Za-zÁÉÍÓÚÜÑáéíóúüñ])(?:([a-záéíóúüñ])|([A-ZÁÉÍÓÚÜÑ]))|([A-ZÁÉÍÓÚÜÑ]+)/gu;
    return texto.replace(re,
        (m, caracterPrevio, minuscInicial, mayuscInicial, mayuscIntermedias) => {
            const locale = ['es', 'gl', 'ca', 'pt', 'en'];
            if (mayuscIntermedias)
                return mayuscIntermedias.toLocaleLowerCase(locale);
            return caracterPrevio
                 + (minuscInicial ? minuscInicial.toLocaleUpperCase(locale) : mayuscInicial);
        }
    );
  }
  */
  function CapitalNames(texto) {
    const re = /(^|[^A-Za-zÁÉÍÓÚÜÑáéíóúüñ])(?:([a-záéíóúüñ])|([A-ZÁÉÍÓÚÜÑ]))|([A-ZÁÉÍÓÚÜÑ]+)/gu;
    return texto.replace(re, function (m, caracterPrevio, minuscInicial, mayuscInicial, mayuscIntermedias) {
      const locale = ['es', 'gl', 'ca', 'pt', 'en'];
      if (mayuscIntermedias)
          return mayuscIntermedias.toLocaleLowerCase(locale);
      return caracterPrevio
           + (minuscInicial ? minuscInicial.toLocaleUpperCase(locale) : mayuscInicial);
    });
  }


  if (_campo.startsWith("value_")){
    window.parent.document.getElementsByName(_campo)[0].value = _dato1+", "+_dato2
  } else{
    window.parent.document.getElementsByName(_campo+"_first")[0].value = _dato2;
    window.parent.document.getElementsByName(_campo+"_last")[0].value = _dato1;
    if (_campo.localeCompare("dc_creator")==0) {
      window.parent.document.getElementsByName("dc_contributor_author_first")[0].value = CapitalNames(_dato3);
      window.parent.document.getElementsByName("dc_contributor_author_last")[0].value = CapitalNames(_dato1);
    }
  }
  content.modal('hide');
}


/*Funciones que limpian los parametros de consulta de caracteres extraños
*solo deja letras y espacios
*regresan la url*/

function Query_NM(nombre, apellidos) {
  var re = /[^A-Za-zÀ-ÿ\s\'\-\_\.]/g;
  //quita caracteres extraños
  nombre = nombre.trim().replace(re,"");
  apellidos = apellidos.trim().replace(re,"");
  //Reemplaza espacios
  nombre = nombre.replace(" ","%20");
  apellidos = apellidos.replace(" ","%20");
  return "http://catalogs.repositorionacionalcti.mx/webresources/persona/byNombreCompleto/params;nombre="+nombre+"%20"+apellidos;
}
