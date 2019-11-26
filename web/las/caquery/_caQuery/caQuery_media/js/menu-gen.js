
'use strict';
//add custom functions for building and opening the menu modal dialog 
console.log('menu-gen loaded!');

//TODO
//global emulated variables
/*var workingGroupsList = ["admin"];
var autocomplete_api_url = "/mdam/api/autocomplete/";
*/

//some global var
var startName="start";
var endName = "end";

var correlationElements = [
    null,
    null,
    "<span style='display: inline-block'><input class='correlated rangeFrom' type='text' readonly /><span class='correlated'>+</span><input type='number' value='0' step='1' class='correlated rangeTo' /><span class='correlated'>days</span></span>",
    "<span style='display: inline-block'><input class='correlated rangeFrom' type='text' readonly /><span class='correlated'>+</span><input type='number' value='0' step='1' class='correlated rangeFrom' /></span>",
    "<span style='display: inline-block'><input class='correlated' type='text' readonly /></span>",
    "<span style='display: inline-block'><input class='correlated' type='text' readonly /></span>"
];


var f_entity = function buildEntityModal(node){
    
    ggen.currentSelectedNode(node);
    
    if(node.type!="start" && node.children.length>0){
        return;
    }

    //in case if GB or Extend check it is configured
    if( node.config.button_cat == 'op' 
        && (node.config.button_id==7 || node.config.button_id==4) 
        && node.config.output_type_id==undefined){
        alert(  "Please configure the extend block first.",
            "Cannot continue",
            "Ok");
        return;
    }
    

    //build modal
    var tabbutton='';
    var tabs='';              
    var dslabels = [['biobanking_management_module','/caQuery_media/images/beuta.png'],
                    ['cellline_management_module','/caQuery_media/images/piastra.png'],
                    ['storage_management_module','/caQuery_media/images/storage.gif'],
                    ['xenografts_management_module','/caQuery_media/images/topo.png'],
                    ['operators','/caQuery_media/images/tools.png']];
                  

    tabbutton+='<div class="card-header tab-card-header">'
    +'<ul class="nav nav-tabs card-header-tabs" id="tabmenu" role="tablist">';
    tabs+='<div id="tabs" class="tab-content">';
        
    dslabels.forEach(d => {
        tabbutton += '<li class="nav-item"><a class="nav-link" data-toggle="tab"'
        +'" href="#'
            +d[0]+'" role="tab" aria-controls="One" aria-selected="true">'
            +'<img class="navbar" src="'
            +d[1]+'" data-toggle="tooltip" title="'+d[0]+'"></img>'
            +'</li>';
        
        //build tabs
        tabs += '<div id="'+d[0]+'" class="tab-pane fade p-3" data-toggle="buttons" role="tabpanel">';
        
        //build radio button list, inside the qent dslabel menu
        if(node.type=='start'){

            Object.entries(qent).filter(e => {
                return e[1].dslabel == d[0];
            }).forEach(e => { 
    
                tabs += '<label class="btn btn-primary button3 '
                    +d[0]+'">'
                    +'<input type="radio" name="radioGroup" autocomplete="off" value='
                    +e[0]+'>'
                    +e[1].name +' - '+e[0]+'</label></br>';
            });

        }else{
            if(node.type =='operator'
            ||node.data.name=="Extend" || node.data.name=="GROUP BY"){

                //insert ONLY possible selections: in fw_query_path of one PARENT
                //plus the parent itself
                /*var queryPaths = node.parent[0].data.fw_query_paths;
                if(node.parent[0].config.button_cat=="qent")
                    queryPaths['0']={ toEntity: node.parent[0].config.button_id,
                                        name:node.parent[0].data.name,
                                        isDefault:true, oneToMany:true };
                 */
                
                var queryPaths = Object.values(node.parent[0].data.fw_query_paths);
                if(node.parent[0].config.button_cat=="qent")
                    queryPaths.push({ toEntity: node.parent[0].config.button_id,
                                    name:node.parent[0].data.name,
                                    isDefault:true, oneToMany:true });                        

            }else if(node.data.isTranslator!=undefined){
                //if template insert only query paths available for its output qent type
                var queryPaths = qent[node.data.output].fw_query_paths ;

            }else{
               
                //insert ONLY possible selections: in fw_query_path of node
                //plus the parent itself
                var queryPaths = Object.values(node.data.fw_query_paths);
                    
                if(node.config.button_cat=="qent")
                    queryPaths.push({ toEntity: node.config.button_id,
                                        name:node.data.name,
                                        isDefault:true, oneToMany:true });
            }  
            
            var reduced =  Object.values(queryPaths).filter( e =>{ 
                    return qent[e.toEntity].dslabel==d[0];
                }).reduce((objectsByKeyValue, obj) => {
                    const value = obj['toEntity'];
                    objectsByKeyValue[value] = (objectsByKeyValue[value] || []).concat(obj);
                    return objectsByKeyValue;
                }, {});
            
            Object.values(reduced).forEach( e =>{ 
                console.log(e);
                    if(e.length>1){
                        console.log(e[0].toEntity,"doppio"); 
                        
                        //when there are more option to the same entity show the possible choices
                        tabs += '<label class="btn btn-primary button3 '
                        +d[0]+(e[0].isDefault ? ' default' : '')+'">'
                        +'<input type="radio" name="radioGroup" autocomplete="off" value='
                        +e[0].toEntity+'>'
                        //+qent[e[0].toEntity].name +' - '
                        +e[0].name+ (e[0].isDefault ? '*' : '')
                        +'</label></br>';
                        
                        tabs += '<label class="btn btn-primary button3 '
                        +d[0]+(e[1].isDefault ? ' default' : '')+'">'
                        +'<input type="radio" name="radioGroup" autocomplete="off" value='
                        +e[1].toEntity+'>'
                        //+qent[e[1].toEntity].name +' - '
                        +e[1].name+ (e[1].isDefault ? '*' : '')
                        +'</label></br>';

                    }else{
                        //console.log(e[0].toEntity,"singolo");
                        tabs += '<label class="btn btn-primary button3 '
                        +d[0]+'">'
                        +'<input type="radio" name="radioGroup" autocomplete="off" value='
                        +e[0].toEntity+'>'
                        +qent[e[0].toEntity].name +' - '+e[0].toEntity+'</label></br>';
                    }
                });

        }

        //insert operators inside operator tab
        if(d[0] == 'operators'){
            //already available operators
            var availableops = ggen.getAvailableOperators();
            var qentid = node.config.button_cat=="qent" ? node.config.button_id :
                        node.config.button_cat=="qent" =="op" ? node.config.output_type_id : 1000;
            
            availableops.forEach( (e,i) => {
                
                if(!(node.type=='start' && e.data.canBeFirst==false)
                   && ( ( e.parent[0].data.name==node.data.name
                        && e.data.numInputs==2 ) || 
                        (e.data.inputs!=undefined && e.data.inputs.length==4 && e.data.inputs.map(f=>{
                            
                            if(!e.parent.map(r=>{return r.config.output_type_id;}).includes(f.qent_id))
                                return f.qent_id;   //just the ones not connected yet
                            else
                                return 0;
                        }).includes(qentid)
                        //&& !e.parent.map(f=>{return f.config.output_type_id;}).includes(qentid))
                        ) 
                    )){
                    
                    tabs += '<label class="btn btn-primary button3 '
                        +d[0]+'">'
                        +'<input type="radio" name="radioGroup" '
                        +'autocomplete="off" value='+(100+i)+'> '
                        +e.data.name +' - connected to '+e.parent[0].data.name+'</br>'+'</label></br>';
                }   
            });

            //new selectable operators
            Object.entries(ops).forEach(e => {
                let ok = true;

                if(!(node.type=='start' && e[1].canBeFirst==false)
                //exclude genealogy id to be compliant with current situation
                   &&  e[1].name!='Genealogy ID' ){

                    //if GB or Extend check if i can connect
                    if(e[0]==4 || e[0]==7){
                        let connBOutType = node.config.output_type_id;
                        
                        ok = GUI.getManyToOneRelationships(connBOutType).length > 0;
                    }                    
                    
                    if(ok)
                        tabs += '<label class="btn btn-primary button3 '
                            +d[0]+'">'
                            +'<input type="radio" name="radioGroup" '
                            +'autocomplete="off" value='+e[0]+'> '
                            +e[1].name +' - '+e[0]+'</br>'+'</label></br>';
                }
            });

            //connect to end selection
            if(node.type!='start'
            && !(node.type=='operator' && node.canBeLast ==false)
            ){
                tabs += '<label class="btn btn-primary button3 '
                +d[0]+'">'
                +'<input type="radio" name="radioGroup" autocomplete="off" value=0>'
                +'Connect Node to END </br>'+'</label></br>';
            }

        }
        
        tabs+='</div>';
    });
    tabbutton+='</ul></div>';
    tabs+='</div>';
    

    $('#entity-modal .modal-body').empty();
    $('#entity-modal .modal-body').append(tabbutton);
    $('#entity-modal .modal-body').append(tabs);

    //adjust entity button active classes
    $("#tabs label").on('click', e=> { 
        dslabels.forEach(d=>{
            if(!$(e.target).hasClass(d[0])){
                $("#"+d[0]+" label").removeClass('active');
            }
        });
    }); 

    //modal show
    $('#entity-modal').modal('show');

};


var f_filter = function buildFilterModal(node){
    console.log("filter menu");
    ggen.currentSelectedNode(node);
    
    if(Object.values(ops).includes(node.data)){
        
        //if operator not configurable
        if(node.data.configurable==false){
            alert("this object is not configurable");
            return;
        }

        //if operator is configurable
        if(node.data.name=="Extend"){
            console.log("Open EXtend MOdal");
            buildExtendModal(node);
            return;
        }else if(node.data.name=="GROUP BY"){
            console.log("Open GB modal menu");
            buildGBModal(node);
            return;
        }else if(node.data.name=="Genealogy ID"){
            return;
        }

    }
    //if node is a qent or a template use bootstrap (different from old qery module)

    var tabbutton = '<div class="card-header tab-card-header">'
        +'<ul class="nav nav-tabs card-header-tabs" id="tabmenu" role="tablist">'
        +'<li class="nav-item"><a class="nav-link active" data-toggle="tab" href="#filters"'
        +'role="tab" aria-controls="filters" aria-selected="true">Filters</a></li>'
        +'<li class="nav-item"><a class="nav-link" data-toggle="tab" href="#outputs"'
        +'role="tab" aria-controls="ouputs" aria-selected="false">Outputs</a></li>'
        +'</ul></div>';
        
    var filtertab = '<div id="filters" class="tab-pane fade p-3 active show" aria-labelledby="filters"  role="tabpanel">';
    var outputtab = '<div id="outputs" class="tab-pane fade p-3" aria-labelledby="ouput" role="tabpanel">';

    if(Object.values(qent).includes(node.data)
        ||Object.values(templates).includes(node.data)
        ){
        
        var filters, outputs;

        //it is a queryable entity
        if(Object.values(qent).includes(node.data)){
            filters = node.data.filters;
            outputs = node.data.outputs;
        }
        //templates
        if(Object.values(templates).includes(node.data)){
            filters = node.data.parameters;
            outputs = qent[node.data.output].outputs;
        }

        //filters
        filtertab += '<form id="filter-selection">';
        Object.entries(filters).forEach(e => {
            var i = e[0];
            var f = e[1];
            
            filtertab += '<div class="form-check" >'+
            '<p id="pf'+i+'"><label class="form-check-label" for="if'+i+'">'+
            '<input type="checkbox" class="form-check-input cfgchk" id="if'+i+'" value="'+i+'" data-f_id="'+i+'">'+
            f.name+'</label></p>'+
            '<p class="cfgval" id="cfgval'+i+'"></p></div>';

        });
        filtertab += '</form>';

        //outputs
        outputtab += '<form id="output-selection">';

        Object.entries(outputs).forEach(e => {
            outputtab +='<div class="form-check">'
                    + '<label class="form-check-label"><input type="checkbox" id="out'
                    + e[0] +'" class="form-check-input"'
                    +'value="'+ e[0] +'"> '
                    +  e[1].name +'</label></div>';
        });
        outputtab += '</form>';
    }

    filtertab += '</div>';
    outputtab += '</div>';

    $('#filter-modal .modal-body').empty();
    $('#filter-modal .modal-body').append(tabbutton);
    $('#filter-modal .modal-body').append('<div id="tabs" class="tab-content"></div>');
    $('#filter-modal .modal-body #tabs').append(filtertab);

    //append data - add filter elements
    if(filters!=undefined)
        Object.entries(filters).forEach(e => {
            var i = e[0]; var f = e[1];
            $("#filter-modal #cfgval"+i).data("f_type", f.type)
        });
                
    $('#filter-modal .modal-body #tabs').append(outputtab);

    insertFilterEntity(node);
    
    //modal show
    $('#filter-modal').modal('show');
}

// ------- build filter menu for Queriable Entities

function insertFilterEntity(node){
    var filters;

    //check if is template
    if(node.data.isTranslator!=undefined){
        var t = node.data;
        $("#filter-modal .modal-body").prepend('<p id="templname">Name: <b>'
                                        +t.name+'</b></p>'
                                        +'<p id="templdescr">Description: '
                                        +(t.description != ""? t.description : "n/a")+'</p>');
        filters = node.data.parameters;
    }else{
        filters = node.data.filters;
    }

    Object.entries(filters).forEach(e => {
        var i = e[0];
        var f = e[1];
        var btn = node.data;

        switch(f.type){

            case 6:     // Boolean
                $("#tabs #cfgval"+i).addClass("valuesovf");
                for (var j in f.values) {
                    var v = f.values[j];
                    $("#tabs #cfgval"+i).append('<input name="par'+i+'" class="par'+i+'" id="val'+j+'" type="radio" value="'+v[0]+'"/><b>'+v[1]+'</b><br>');
                }
                break;

            case 1:     // Predefined list
                var input_type = f.multiValued == true ? "checkbox" : "radio";
                $("#tabs #cfgval"+i).addClass("valuesovf");
                $("#tabs #cfgval"+i).append("<table id='tval"+i+"' style='width: 99%'><tbody></tbody></table>");
                
                for (var j in f.values) {
                    var v = f.values[j];
                    var r = $("<tr><td></td><td></td></tr>");
                    r.find("td:eq(0)").append('<input name="par'+i+'" class="par'+i+'" id="val'+v[0]+'" type="'+input_type+'" value="'+v[0]+'"/><b>'+v[1]+'</b>');
                    
                    if (v[2] != null) { // value has an associated subfilter

                        if (v[4] == 3) { // numeric
                            var el = $('<select class="rangeFrom">'+
                                            '<option value=">"> &#x2265; </option>'+
                                            '<option value="="> = </option>'+
                                            '<option value="<"> &#x2264; </option>'+
                                        '</select>'+
                                        '<span class="corr-input"></span>'+
                                        '<input type="text" class="rangeFrom" value=""/>'+
                                        '<span id="trattino"> - </span>'+
                                        '<select class="rangeTo">'+
                                            '<option value="<"> &#x2264; </option>'+
                                        '</select>'+
                                        '<span class="corr-input"></span>'+
                                        '<input type="text" class="rangeTo" value=""/>');
                            $(el[1]).data("type", 3);
                            $(el[1]).addClass("corr" + v[2]);
                            $(el[5]).data("type", 3);
                            $(el[5]).addClass("corr" + v[2]);
                            $(el[0]).change(toggleStatus); //TODO

                        } else if (v[4] == 2) { // date
                            var el = $('<select class="rangeFrom">'+
                                            '<option value=">"> &#x2265; </option>'+
                                            '<option value="="> = </option>'+
                                            '<option value="<"> &#x2264; </option>'+
                                        '</select>'+
                                        '<span class="corr-input"></span>'+
                                        '<input type="text" class="rangeFrom" value=""/>'+
                                        '<span id="trattino"> - </span>'+
                                        '<select class="rangeTo">'+
                                            '<option value="<"> &#x2264; </option>'+
                                        '</select>'+
                                        '<span class="corr-input"></span>'+
                                        '<input type="text" class="rangeTo" value=""/>');
                            $(el[1]).data("type", 2);
                            $(el[1]).addClass("corr" + v[2]);
                            $(el[5]).data("type", 2);
                            $(el[5]).addClass("corr" + v[2]);
                           $([el[2],el[6]]).datepicker({
                                    defaultDate: "w",
                                    changeMonth: true,
                                    dateFormat: "yy-mm-dd",
                                    numberOfMonths: 1,
                                    showAnim: "",
                                    onSelect: function( selectedDate ) {
                                        var option = $(this).hasClass("rangeFrom") ? "minDate" : "maxDate";
                                        var instance = $( this ).data( "datepicker" );
                                        var date = $.datepicker.parseDate(
                                            instance.settings.dateFormat || $.datepicker._defaults.dateFormat,
                                            selectedDate,
                                            instance.settings
                                        );
                                        $(this).siblings("input").datepicker("option", option, date);
                                    }
                                });

                            $(el[0]).change(toggleStatus);

                        } else if (v[4] == 4) { // text
                            var el = $('<span class="corr-input"></span><input id="addvalue'+v[2]+'" type="text" value="" onkeypress="validate2(event)"/>');
                            $(el[0]).data("type", 4);
                            $(el[0]).addClass("corr" + v[2]);
                        }

                        var td = r.find("td:eq(1)");
                        td.append(v[3]+"&nbsp;");
                        td.append(el);
                        td.attr("id", "cfgval"+v[2]);
                        td.addClass("cfgval1");
                        td.data("f_type", v[4]);
                        td.attr("data-f_id", v[2]);
                        td.data("disabled", true);
                        td.data("par_flt_id", i);
                        td.data("par_flt_value", v[0]);

                        el.prop("disabled", true);
                        if (input_type == "checkbox") {
                            r.find("td:eq(0)").children("input").click(function() {
                                $(this).parent().siblings("td").find("input,select").prop("disabled",!$(this).is(":checked"));
                                $(this).parent().siblings("td").data("enabled", $(this).is(":checked"));
                            });

                        } else if (input_type == "radio") {
                            var prev_el;
                            r.find("td:eq(0)").children("input").click(function() {
                                if (prev_el) {
                                    prev_el.find("input,select").prop("disabled",true);
                                    prev_el.data("enabled",false);
                                }
                                prev_el = $(this).parent().siblings("td");
                                prev_el.find("input,select").prop("disabled",false);
                                prev_el.data("enabled",true);
                            });

                        }
                    }
                    $("#tabs #tval"+i).append(r);
                }
                
                if (f.multiValued == true) {
                    $("#tabs #pf"+i).append('<em class="counter" id="cnt'+i+'" data-count_val="0"></em>');
                    $("#tabs .par"+i).change(function (index) {
                            return function() {
                                var cnt = $("#tabs #cnt"+index).attr("data-count_val");
                                if ($(this).prop('checked') == true)
                                    ++cnt;
                                else
                                    --cnt;
                                $("#tabs #cnt"+index).attr("data-count_val", cnt);
                            }
                        } (i)
                    );
                }
                break;
            case 2:  
                $("#tabs #cfgval"+i).append(  '<select class="rangeFrom">'+
                            '<option value=">"> &#x2265; </option>'+
                            '<option value="="> = </option>'+
                            '<option value="<"> &#x2264; </option>'+
                            '</select>'+
                            '<span class="corr-input"></span>'+
                            '<input type="text" class="rangeFrom" value=""/>'+
                            '<span id="trattino"> - </span>'+
                            '<select class="rangeTo">'+
                                '<option value="<"> &#x2264; </option>'+
                            '</select>'+
                            '<span class="corr-input"></span>'+
                            '<input type="text" class="rangeTo" value=""/>');
                $("#tabs #cfgval"+i).find("span.corr-input").data("type", 2).addClass("corr" + i);;

                $('#tabs #cfgval'+i).children('.rangeFrom').change(toggleStatus);

                $("#tabs #cfgval"+i).children(':input').datepicker({
                defaultDate: "w",
                changeMonth: true,
                dateFormat: "yy-mm-dd",
                numberOfMonths: 1,
                showAnim: "",
                onSelect: function( selectedDate ) {
                    var option = $(this).hasClass("rangeFrom") ? "minDate" : "maxDate";
                    var instance = $( this ).data( "datepicker" );
                    var date = $.datepicker.parseDate(
                        instance.settings.dateFormat || $.datepicker._defaults.dateFormat,
                        selectedDate,
                        instance.settings
                    );
                    $(this).siblings("input").datepicker("option", option, date);
                }
                });   
                break;

            case 3: // Numeric
                    $("#tabs #cfgval"+i).append(  '<select class="rangeFrom">'+
                    '<option value=">"> &#x2265; </option>'+
                    '<option value="="> = </option>'+
                    '<option value="<"> &#x2264; </option>'+
                    '</select>'+
                    '<span class="corr-input"></span>'+
                    '<input type="number" step="0.1" maxlength="200" class="rangeFrom" value="" onkeypress="validate(event)"/>'+
                    '<span id="trattino"> - </span>'+
                    '<select class="rangeTo">'+
                    '<option value="<"> &#x2264; </option>'+
                    '</select>'+
                    '<span class="corr-input"></span>'+
                    '<input type="number" step="0.1" maxlength="200" class="rangeTo" value="" onkeypress="validate(event)"/>');
                $("#tabs #cfgval"+i).find("span.corr-input").data("type", 3).addClass("corr" + i);
                $('#tabs #cfgval'+i).children('.rangeFrom').change(toggleStatus);
                break;

            case 4: // Genid
                var f_idButton = i;

                if(node.data.isTranslator==undefined){ //START GENID for ENTITY

                // decide whether to instantiate textarea for batch input or not
                var htmlCode = '<p>Genealogy ID type: <select id="selgenidtype' + f_idButton +'">'
                for (var t in f.genid) {
                    htmlCode += '<option>'+ f.genid[t] +'</option>'
                }
                htmlCode += '</select></p>'

                htmlCode += '<table id="genid'+ f_idButton + '">'+ 
                            '<thead style="font-size: 10px"> <th style="width: 40px" class="add"></th> </thead> <tbody>  <tr> <td style="width: 40px" class="add"> '+ 
                            '<span id="add_gid'+ f_idButton +'" class="add_btn" style="margin-right:5px;">add</span> </td> </tr> </tbody> </table> <br>'+
                            '<div> <table> <tr> <td> <span style="font-size:10px;margin-right:10px;">Load Genealogy IDs from file:</span> </td> <td> <form id="genidfrm' + f_idButton + '"><input type="file" id="genidfile' + f_idButton +'" /></form> </td> </tr>' +
                            '<tr> <td> <span style="font-size:10px;margin-right:10px;">Insert full Genealogy IDs:<br>(newline or blank separated)</span> </td> <td> ' +
                            '<textarea id="fullgenid'+ f_idButton + '" type="text" style="width:500px;height:80px; resize:none" maxlength="20000"></textarea></td> <td> <span id="add_gid2_' + f_idButton +'" class="add_btn" style="margin-right:5px;">add</span> </td> </tr> </table> </div> <br> <div id="genidlist'+ f_idButton + '" style="max-height: 200px;overflow: auto;"></div>'

                $("#tabs #cfgval"+f_idButton).append(htmlCode);
                
                $("#fullgenid" + f_idButton).boxlist({
                    bMultiValuedInput: true,
                    oBtnEl: $("#add_gid2_" + f_idButton),
                    oContainerEl: $("#genidlist" + f_idButton),
                    fnEachParseInput: function(v) {
                        v = v.trim();
                        if (v.length == 0) {
                            return v;
                        } else if (v.length < 26) {
                            v = v + new Array(26 - v.length + 1).join("-");
                        } else if (v.length > 26) {
                            v = v.substr(0, 26);
                        }
                        return v.toUpperCase();
                    },
                    fnValidateInput: function(val) {
                        var ok;
                        console.log(val);
                        for (var t in genid) {
                            var fields = genid[t].fields;
                            ok = true;
                            for (var j = 0; j < fields.length && ok; ++j) {
                                var f = fields[j];
                                var x = val.substring(f.start, f.end + 1);
                                if (x == (new Array(f.end-f.start+2).join("-")) ||
                                    x == (new Array(f.end-f.start+2).join("0")) ) {
                                    ok = true;
                                    //console.log(t, f.name, "--");
                                    continue;
                                }
                                switch (f.ftype) {
                                    case 1: // predefined list
                                        ok = f.values.indexOf(x) != -1;
                                        //e' per gestire le linee che hanno un contatore al posto del TUM e se non metto questo if
                                    //mi danno errore in caso scriva il loro gen per intero
                                    if(!(ok)&&(f.name=="Tissue type")){
                                        // numeric
                                        ok = /^[0-9]+$/.test(x);
                                    }
                                        break;
                                    case 2: // alphabetic
                                        ok = /^[a-zA-Z]+$/.test(x);
                                        break;
                                    case 3: // numeric
                                        ok = /^[0-9]+$/.test(x);
                                        break;
                                    case 4: // alphanumeric
                                        ok = /^[a-zA-Z0-9]+$/.test(x);
                                        break;
                                }
                                //console.log(t, f.name, ok?"OK":"error");
                            }
                            //if (ok && val.substr(f.end+1,26) == (new Array(26-f.end+1).join("-"))) break;
                            // if genid validated AND (last field reaches end of genealogy OR remaining characters are '-' or '0')
                            if (ok && (f.end == 25 || /^[\-0]+$/.test(val.substr(f.end+1,26)))) {
                                console.log("Detected type:", t);
                                break;
                            }

                        }
                        console.log("[validate genid]", ok);
                        return ok;
                    },     
                    aoAltInput: [{
                            oBtnEl: $("#add_gid" + f_idButton),
                            fnParseInput: genIdFromForm }] 
                });

                $("#genidfile" + f_idButton).change(function() {
                    var r = new FileReader();
                    r.onload = function(evt) {
                        $("#fullgenid" +f_idButton ).val(evt.target.result);
                        $("#add_gid2_" +f_idButton ).click();
                        $("#genidfrm" +f_idButton )[0].reset();
                    }
                    r.readAsText($("#genidfile" + f_idButton )[0].files[0]);
                });

                $("#selgenidtype" + f_idButton ).change(function() {
                    
                    var t = $(this).val();
                    
                    try {
                        var fields = genid[t].fields;
                    }
                    catch(err) {
                        return;
                    }
                    $("table#genid"+ f_idButton + " th.field,table#genid" + f_idButton + " td.field").remove();
                    for (var j = 0; j < fields.length; ++j) {
                        $('<th class="field">' + fields[j].name + '</th>').insertBefore("table#genid" + f_idButton +" th.add");
                        if (fields[j].ftype == 1) {
                            var x = '<td class="field"><select class="genidpar" maxlength="' + (fields[j].end - fields[j].start + 1)+'">';
                            x += '<option></option>';
                            for (var k = 0; k < fields[j].values.length; ++k) {
                                x += '<option>' + fields[j].values[k] + '</option>';
                            }
                            x += '</select></td>';
                        } else

                        if (fields[j].ftype == 2 || fields[j].ftype == 3 || fields[j].ftype == 4) {
                            var x = '<td class="field"><input type="text" class="genidpar" maxlength="' + (fields[j].end - fields[j].start + 1)+ '" onkeypress="validate3(event)"></td>';
                        }
                        $(x).insertBefore("table#genid" + f_idButton +" td.add");
                    }
                });

                $("#selgenidtype" + f_idButton ).prop("selectedIndex", 0).change(); 
                
            }else{ //end GENID for ENTITY

                //START GENID for TEMPLATE
                var flt =e;

                if (qent.hasOwnProperty(flt.src_button_id)){
                    console.log(f_idButton, qent[flt.src_button_id].filters[flt.src_f_id].genid)
                    // decide whether to instantiate textarea for batch input or not
                    var htmlCode = '<p>Genealogy ID type: <select id="selgenidtype' + f_idButton +'">'
                    for (var g in qent[flt.src_button_id].filters[flt.src_f_id].genid) {
                        htmlCode += '<option>'+ qent[flt.src_button_id].filters[flt.src_f_id].genid[g] +'</option>'
                    }
                }
                else{
                    var htmlCode = '<p>Genealogy ID type: <select id="selgenidtype' + f_idButton +'">'
                    var arrayGenid = ['Aliquot', 'Mouse', 'Derived aliquot'];
                    for (var g in arrayGenid) {
                        htmlCode += '<option>'+ arrayGenid[g] +'</option>'
                    }

                }
                htmlCode += '</select></p>'

                htmlCode += '<table id="genid'+ f_idButton + '">'+ 
                            '<thead style="font-size: 10px"> <th style="width: 40px" class="add"></th> </thead> <tbody>  <tr> <td style="width: 40px" class="add"> '+ 
                            '<span id="add_gid'+ f_idButton +'" class="add_btn" style="margin-right:5px;">add</span> </td> </tr> </tbody> </table> <br>'+
                            '<div> <table> <tr> <td> <span style="font-size:10px;margin-right:10px;">Load Genealogy IDs from file:</span> </td> <td> <form id="genidfrm' + f_idButton + '"><input type="file" id="genidfile' + f_idButton +'" /></form> </td> </tr>' +
                            '<tr> <td> <span style="font-size:10px;margin-right:10px;">Insert full Genealogy IDs:<br>(newline or blank separated)</span> </td> <td> ' +
                            '<textarea id="fullgenid'+ f_idButton + '" type="text" style="width:500px;height:80px; resize:none" maxlength="20000"></textarea></td> <td> <span id="add_gid2_' + f_idButton +'" class="add_btn" style="margin-right:5px;">add</span> </td> </tr> </table> </div> <br> <div id="genidlist'+ f_idButton + '" style="max-height: 200px;overflow: auto;"></div>'

                $("#filter-modal #cfgval"+f_idButton).append(htmlCode);
                
                $("#fullgenid" + f_idButton).boxlist({
                        bMultiValuedInput: true,
                        oBtnEl: $("#add_gid2_" + f_idButton),
                        oContainerEl: $("#genidlist" + f_idButton),
                        fnEachParseInput: function(v) {
                            v = v.trim();
                            if (v.length == 0) {
                                return v;
                            } else if (v.length < 26) {
                                v = v + new Array(26 - v.length + 1).join("-");
                            } else if (v.length > 26) {
                                v = v.substr(0, 26);
                            }
                            return v.toUpperCase();
                        },
                        fnValidateInput: function(val) {
                            var ok;
                            console.log(val);
                            for (var t in genid) {
                                var fields = genid[t].fields;
                                ok = true;
                                for (var j = 0; j < fields.length && ok; ++j) {
                                    var f = fields[j];
                                    var x = val.substring(f.start, f.end + 1);
                                    if (x == (new Array(f.end-f.start+2).join("-")) ||
                                        x == (new Array(f.end-f.start+2).join("0")) ) {
                                        ok = true;
                                        //console.log(t, f.name, "--");
                                        continue;
                                    }
                                    switch (f.ftype) {
                                        case 1: // predefined list
                                            ok = f.values.indexOf(x) != -1;
                                            break;
                                        case 2: // alphabetic
                                            ok = /^[a-zA-Z]+$/.test(x);
                                            break;
                                        case 3: // numeric
                                            ok = /^[0-9]+$/.test(x);
                                            break;
                                        case 4: // alphanumeric
                                            ok = /^[a-zA-Z0-9]+$/.test(x);
                                            break;
                                    }
                                    //console.log(t, f.name, ok?"OK":"error");
                                }
                                //if (ok && val.substr(f.end+1,26) == (new Array(26-f.end+1).join("-"))) break;
                                // if genid validated AND (last field reaches end of genealogy OR remaining characters are '-' or '0')
                                if (ok && (f.end == 25 || /^[\-0]+$/.test(val.substr(f.end+1,26)))) {
                                    console.log("Detected type:", t);
                                    break;
                                }

                            }
                            console.log("[validate genid]", ok);
                            return ok;
                        },

                        aoAltInput: [
                            {
                                oBtnEl: $("#add_gid" + f_idButton),
                                fnParseInput: genIdFromForm
                            }
                        ]
                    });

                $("#genidfile" + f_idButton).change(function() {
                        var r = new FileReader();
                        r.onload = function(evt) {
                            $("#fullgenid" +f_idButton ).val(evt.target.result);
                            $("#add_gid2_" +f_idButton ).click();
                            $("#genidfrm" +f_idButton )[0].reset();
                        }
                        r.readAsText($("#genidfile" + f_idButton )[0].files[0]);
                    });

                $("#selgenidtype" + f_idButton ).change(function() {
                        
                        var t = $(this).val();
                        
                        try {
                            var fields = genid[t].fields;
                        }
                        catch(err) {
                            return;
                        }
                        $("table#genid"+ f_idButton + " th.field,table#genid" + f_idButton + " td.field").remove();
                        for (var j = 0; j < fields.length; ++j) {
                            $('<th class="field">' + fields[j].name + '</th>').insertBefore("table#genid" + f_idButton +" th.add");
                            if (fields[j].ftype == 1) {
                                var x = '<td class="field"><select class="genidpar" maxlength="' + (fields[j].end - fields[j].start + 1)+'">';
                                x += '<option></option>';
                                for (var k = 0; k < fields[j].values.length; ++k) {
                                    x += '<option>' + fields[j].values[k] + '</option>';
                                }
                                x += '</select></td>';
                            } else

                            if (fields[j].ftype == 2 || fields[j].ftype == 3 || fields[j].ftype == 4) {
                                var x = '<td class="field"><input type="text" class="genidpar" maxlength="' + (fields[j].end - fields[j].start + 1)+ '" onkeypress="validate3(event)"></td>';
                            }
                            $(x).insertBefore("table#genid" + f_idButton +" td.add");
                        }
                    });

                    $("#selgenidtype" + f_idButton ).prop("selectedIndex", 0).change();


            }  //end GENID for TEMPLATE
                break;

            case 5: // Text with autocomplete
            
                var f_idButton = i;
                var htmlCode = '<input style="width:30%;float:left" id="addvalue'+f_idButton+'" type="text" value="" onkeypress="validateText(event, ' + f_idButton + ')"/>';// validate2
                if (f.multiValued == true) {
                    htmlCode += ' <span class="add_btn" id="add_btn'+i+'">add</span> ';
                }
                if (f.fileInput == true){
                    htmlCode += ' <form style="width:30%;float:left"  id="textfrm' + f_idButton + '"><input type="file" id="textfile' + f_idButton +'" /></form>'
                }
            
                $("#tabs #cfgval"+f_idButton).append(htmlCode);

                var url = autocomplete_api_url + "?id=" + f.api_id;
                $('#tabs #addvalue'+f_idButton).autocomplete({
                    source: (function(u) {
                                return function(request, response) {
                                    $.ajax({
                                        url: u,
                                        dataType: "jsonp",
                                        data: {
                                            term: request.term
                                        },
                                        success: function(data) {
                                            response(data)
                                        }
                                    });
                                }
                            }) (url)
                });

                // also decide whether to insert input-style or paragraph-style correlation button
                if (f.multiValued == true) {
                    $("#tabs #cfgval"+i).data("multiValued", true);

                    $("#tabs #addvalue"+i).boxlist({bMultiValuedInput: true, fnParseInput:function(val) {return [val];}});
                    
                    // insert paragraph-style correlation button
                    var el = $("<span class='corr-par' value='"
                    +5+"'></span>");
                    
                    el.data("type", 5);
                    el.addClass("corr" + f_idButton);
                    el.data("checkbox", $("#tabs #if"+f_idButton));
                    el.data("paragraph", $("#tabs #cfgval"+f_idButton));
                
                    $("#tabs #pf"+i).append(el);
                    if (f.fileInput == true){
                        $("#tabs #textfile" + f_idButton ).change(function(i) {
                            return function() {
                                var r = new FileReader();
                                r.onload = function(evt) {
                                    var text= evt.target.result;
                                    var lines = text.split("\n");
                                    for (var k=0; k<lines.length; ++k){
                                        $("#addvalue" + i ).val(lines[k].trim());
                                        $("#add_btn" + i ).click();
                                    }
                                    $("#textfrm" + i )[0].reset();
                                };
                                console.log( f_idButton);

                                r.readAsText($("#tabs #textfile" + i)[0].files[0]);
                            }
                        } (f_idButton) );

                    }

                } else {
                    $("#tabs #cfgval"+f_idButton).data("multiValued", false);
                    // insert input-style correlation button
                    var el = $("<span class='corr-input'></span>");
                    el.data("type", 5).addClass("corr" + f_idButton);
                    $("#tabs #cfgval"+f_idButton).children(":eq(0)").before(el);
                }

                break;

            case 7:  // WG
                var myGroups = [];
                for (var j in f.values) {
                    var v = f.values[j];
                    if (workingGroupsList.indexOf(v[1]) >= 0) { //  && v[1]!='admin'
                        myGroups.push(v);
                    }
                }

                var input_type = f.multiValued == true ? "checkbox" : "radio";
                $("#tabs #cfgval"+i).addClass("valuesovf");
                $("#tabs #cfgval"+i).append("<table id='tval"+i+"' style='width: 99%'><tbody></tbody></table>");

                for (var j = 0; j < myGroups.length; ++j) {
                    var v = myGroups[j];
                    var r = $("<tr><td></td><td></td></tr>");
                    r.find("td:eq(0)").append('<input name="par'+i+'" class="par'+i+'" id="val'+v[0]+'" type="'+input_type+'" value="'+v[0]+'"  /><b>'+v[1]+'</b>');
                    $("#tabs #tval"+i).append(r);
                }
                    
                if (f.multiValued == true) {
                    $("#tabs #pf"+i).append('<em class="counter" id="cnt'+i+'" data-count_val="0"></em>');
                    $("#tabs .par"+i).change(function (index) {
                            return function() {
                                var cnt = $("#tabs #cnt"+index).attr("data-count_val");
                                if ($(this).prop('checked') == true)
                                    ++cnt;
                                else
                                    if (cnt != 1){
                                        --cnt;
                                    }
                                    else{
                                        alert('You should select at least one WG');
                                        $(this).prop('checked', true);
                                    }
                                $("#tabs #cnt"+index).attr("data-count_val", cnt);
                            }
                        } (i)
                    );
                }
                $('#if'+i).prop('checked','true');
                $('#if'+i).prop('disabled','true');

                break;
        }

        //hide filtering option
        $("#tabs .cfgval").hide();
        $("#tabs .counter").hide();
        $("#tabs .cfgchk").change(
            function () {
                var f_id = $(this).data("f_id");
                if(node.data.isTranslator!=undefined)
                    var f = btn.parameters[f_id];  //is template
                else
                    var f = btn.filters[f_id];
                $("#tabs #cfgval" + f_id).not(".noshow").toggle($(this).prop('checked'));
                $("#tabs #cnt" + f_id).toggle($(this).prop('checked'));
            }
        );

        // set current menu item in each correlation button
        $("#tabs #filters").find(".corr-par,.corr-input").data("menu-item", 0);

// **** TODO *****   
/*
        $("#tabs #filters").find(".corr-par, .corr-input")
            .off('click')
            .on("click.context", contextMenuHandler);
*/   


        $("#tabs .cfgchk:checked").change();

        // restore previous values (if any)

        // filters
        var params = node.config.parameters;
        
        if (params.length > 0) {
            
            for (var j = 0; j < params.length; ++j) { 
                var f_id = params[j]['f_id'];
                console.log(f_id);
                //if ($('#templconfigdialog #if' + f_id).prop('checked') == false)
                $('#filter-modal #if' + f_id).prop('checked', true);
                var f_type = $("#filter-modal #cfgval"+f_id).data("f_type");
                
                if (f_type == 7){
                    $('#if'+f_id).prop('disabled','true');
                }
                
                if (f_type == 1 || f_type == 6 || f_type == 7 ) { // predefined list or boolean
                    console.log(params[j])
                    
                    for (var i = 0; i < params[j]['values'].length; ++i) {
                        
                        $("#filter-modal .par"+f_id+"#val"+params[j]['values'][i]).trigger('click');
                    }
                } else if (f_type == 4 ) { // genid
                    for (var i = 0; i < params[j]['values'].length; ++i) {
                            $("#filter-modal #fullgenid"+f_id).val(params[j]['values'][i]);
                            $("#filter-modal span#add_gid2_" + f_id).trigger('click');
                    }
                } else if (f_type == 5) { // text with or without autocomplete
                    for (var i = 0; i < params[j]['values'].length; ++i) {
                        $("#filter-modal #addvalue"+f_id).val(params[j]['values'][i].slice(1));
                        $("#filter-modal #add_btn"+f_id).trigger('click');
                    }
                } else if (f_type == 3) { // numeric
                    var from = params[j]['values'][0];
                    from = from.slice(1); // skip past 'c' or 'u'
                    $("#filter-modal #cfgval"+f_id).children("select.rangeFrom").val(from[0]);
                    from = from.slice(1); // skip past '>', '=' or '<'
                    $("#filter-modal #cfgval"+f_id).children("select.rangeFrom").trigger('change');

                    $("#filter-modal #cfgval"+f_id).children("input.rangeFrom").val(from);

                    if (params[j]['values'].length > 1) {
                        var to = params[j]['values'][1];
                        to = to.slice(1);
                        $("#filter-modal #cfgval"+f_id).children("select.rangeTo").val(to[0]);
                        to = to.slice(1);
                        $("#filter-modal #cfgval"+f_id).children("input.rangeTo").val(to);
                    }
                } else if (f_type == 2) { // date
                    var from = params[j]['values'][0];
                    from = from.slice(1);
                    $("#filter-modal #cfgval"+f_id).children("select.rangeFrom").val(from[0]);
                    from = from.slice(1);
                    $("#filter-modal #cfgval"+f_id).children("select.rangeFrom").trigger('change');
                    
                    $("#filter-modal #cfgval"+f_id).children("input.rangeFrom").val(from);

                    if (params[j]['values'].length > 1) {
                        var to = params[j]['values'][1];
                        to = to.slice(1);
                        $("#filter-modal #cfgval"+f_id).children("select.rangeTo").val(to[0]);
                        to = to.slice(1);
                        $("#filter-modal #cfgval"+f_id).children("input.rangeTo").val(to);
                        $("#filter-modal #cfgval"+f_id).children("input.rangeFrom").datepicker("option", "maxDate", to);
                        $("#filter-modal #cfgval"+f_id).children("input.rangeTo").datepicker("option", "minDate", from);
                    }
                }
            }
        }

        //outputs
        // make list of outputs from current block that are referenced through correlation by next block
        if (node.children.length>0 && node.children[0].type != "end") {
            var outConnBlock = node.children[0];
            var corr_outs = findCorrelatedOutputs(outConnBlock);
        } else {
            var corr_outs = [];
        }
        var outputs = node.config.outputs;

        for (var j = 0; j < outputs.length; ++j) {
            if (outputs[j] != undefined) {
                $("#filter-modal #out"+outputs[j]).prop("checked", true);
                if (corr_outs.indexOf(j) != -1) {
                    $("#filter-modal #out"+outputs[j]).click(function() {alert("Output is in use by next block.", "Cannot uncheck"); $(this).prop("checked", true);});
                }
            }
        }
        //-------------------------
    });

    //create corr par
    $("#tabs #filters").find(".corr-par, .corr-input")
        .on("click", d=>{
            //var t = d.currentTarget.getAttribute('value');
            var t = $(d.target);
            var n = ggen.currentSelectedNode();
            console.log("open context menu - target ", t);
            prepareContextMenu(n,t);
        });

}


function prepareContextMenu(node, target){

    // populate context menu with outputs from previous block

    // TODO ****
    // if no output specified, all possible output?
    // 

    //var menu = $("#ctxmenu");
    var menu = $("#context-modal .modal-body");
    menu.data("target", target);
    var connBlock = node.parent[0]; 
    var connBlockId = connBlock.id;
    var btn_id = node.config.button_id;
    if (connBlock.type != "start") {
        var connNode = connBlock.config;
        var outs = connNode.outputs;
        var connBtn_id = connNode.button_id;
        menu.find("p.menu-item:eq(0)").siblings("p.menu-item").remove();
        
        // allow correlation with previous block only if block-1 is entity 
        // and block-1 and block have a many-to-one relationship
        // otherwise a group by should be used to correlate them
        if (connNode.button_cat == 'qent' && GUI.isManyToOneRelationship(connBtn_id, btn_id)) {
            
            // TODO ****
            
            if(outs.length==0){
                //by default all outputs are available
                outs = Object.keys(node.parent[0].data.outputs);
            }
            
            
            for (var j = 0; j < outs.length; ++j) {  
                if (outs[j] != undefined) {
                    var name = qent[connBtn_id].outputs[outs[j]].name;
                    
                    // TODO **** only the one of the same type (data or text)
                    var settedFilters = Object.values(node.parent[0].config.parameters.map(d=>{
                            return node.parent[0].data.filters[d.f_id]
                        }));
                   
                    if(settedFilters.filter(d=>{
                        return ( (d.type==2 && target.hasClass('corr-input'))
                            || ( d.type==5 && target.hasClass('corr-par') ) )
                            && d.name == name;
                    }).length==0)
                        continue;

                    // TODO **** only the one configured in the antecedent node? (only filtered outputs?
                    //if(!node.parent[0].config.parameters.map(d=>{return node.parent[0].data.filters[d.f_id].name;}).includes(name))
                     //   continue;
                        

                    var val = connBlockId+'_'+(j);
                    var el = $('<p class="menu-item"><input id="menu-item-'+(val)+'" class="menu-item" name="dd" type="radio" value="'
                                +val+'" /><label for="menu-item-'+(val)+'">'+connBlockId +':' +name+'</label></p>');
                    el.find("input").data("label", connBlockId +':' + name);
                    menu.append(el);
                }
            }
        } else if (connNode.button_cat == 'op' && connBtn_id == 6 && GUI.isManyToOneRelationship(connNode.output_type_id, btn_id)) {
            for (var j = 0; j < outs.length; ++j) {     //template
                if (outs[j] != undefined) {
                    var name = qent[connNode.output_type_id].outputs[outs[j]].name;
                    
                    var settedFilters = Object.values(node.parent[0].config.parameters.map(d=>{
                        return node.parent[0].data.filters[d.f_id]
                    }));
               
                    if(settedFilters.filter(d=>{
                        return ( (d.type==2 && target.hasClass('corr-input'))
                            || ( d.type==5 && target.hasClass('corr-par') ) )
                            && d.name == name;
                    }).length==0)
                        continue;

                    // TODO **** only the one configured in the antecedent node? (only filtered outputs?)
                    //if(!node.parent[0].config.parameters.map(d=>{return node.parent[0].data.filters[d.f_id].name;}).includes(name))
                     //   continue;

                    var val = connBlockId+'_'+(j);
                    var el = $('<p class="menu-item"><input id="menu-item-'+(val)+'" class="menu-item" name="dd" type="radio" value="'
                                +val+'" /><label for="menu-item-'+(val)+'">'+connBlockId +':' +name+'</label></p>');
                    el.find("input").data("label", connBlockId +':' + name);
                    menu.append(el);
                }
            }
        } else if (connNode.button_cat == 'op' && connBtn_id == 4) {// group by
            for (var j = 0; j < outs.length; ++j) {
                if (outs[j] != undefined) {
                    var name = outs[j].name;


                    var val = connBlockId+'_'+(j);
                    var el = $('<p class="menu-item"><input id="menu-item-'+(val)+'" class="menu-item" name="dd" type="radio" value="'
                                +val+'" /><label for="menu-item-'+(j+1)+'">'+connBlockId+':'+name+'</label></p>');
                    el.find("input").data("label", connBlockId +':' + name);
                    menu.append(el);
                }
            }
        } else if (connNode.button_cat == 'op' && connBtn_id == 7) {// extend
            for (var j = 0; j < outs.length; ++j) {
                if (outs[j] != undefined) {
                    var name = outs[j];


                    var val = connBlockId+'_'+(j);
                    var el = $('<p class="menu-item"><input id="menu-item-'+(val)+'" class="menu-item" name="dd" type="radio" value="'
                                +val+'" /><label for="menu-item-'+(j+1)+'">'+connBlockId+':'+name.substr(1)+'</label></p>'); // "substr" removes the first character which is either 'e' meaning 'extended' (for attributes in the extended entity) or 's' meaning 'self' (for attributes in the original entity)
                    el.find("input").data("label", connBlockId +':' + name);
                    menu.append(el);
                }
            }
        }

    }
    
    $('#context-modal').modal('show');

}


// ------------------ build EXTEND modal menu --------------------------

function buildExtendModal(node) {
        
    //var connBlock = node.parent[0].data;
    //QueryGen.getGraphNode(block_id).w_in[0];
    var connBType = node.parent[0].config.output_type_id;
    //QueryGen.getGraphNode(connBlock).output_type_id;
    
    var r = getManyToOneRelationships2(connBType);

    var fw_query_paths = qent[connBType].fw_query_paths;
            
    $("#extend-modal #ent-list").children().remove();
    
    // populate list of entities
    for (var i = 0; i < r.length; ++i) {
        $("#extend-modal #ent-list").append('<input class="qp" id="qp'+r[i]+'" type="checkbox" value="'+r[i]+'" data-toEntity="'+fw_query_paths[r[i]].toEntity+'"/><label for="qp'+r[i]+'" title="'+(fw_query_paths[r[i]].description || "")+'"><b>'+qent[fw_query_paths[r[i]].toEntity].name+'</b>&nbsp;(Path: <i>'+fw_query_paths[r[i]].name+'</i>)</label><br>');
        var ul = $("<ul></ul>");
        ul.hide();
        ul.css("list-style-type", "none")
          .css("margin-top", "3px")
          .css("margin-bottom", "0px")
          .css("padding-left", "25px");
        var qent_id = fw_query_paths[r[i]].toEntity;
        for (var x in qent[qent_id].outputs) {
            ul.append('<li><input class="out" id="out'+x+'" type="checkbox" value="' + x + '"/><label for="out' + x + '">' + qent[qent_id].outputs[x].name + '</label>');
        }
        $("#extend-modal #ent-list").append(ul);
    }

    // display entity attributes when entity is checked
    $("#extend-modal #ent-list input.qp").change(function() {
        if ($(this).prop("checked") == true) {
            $(this).next().next().next().show();
        } else {
            if ($(this).hasClass("noRemove")) {
                alert("One or more outputs from this entity are in use by next block", "Cannot uncheck");
                $(this).prop("checked", true);
            } else {
                $(this).next().next().next().hide();
            }
        }
    });

    // restore previously checked attributes

    // first make a list of outputs from current block that are referenced through correlation by next block 
    //var block = $("#box"+block_id);
    //var outTerminal = block.data("out-terminal")[0];
    //var outConnTerminal = outTerminal.getConnectedTerminals()[0];
    var outConnTerminal = node.children[0];
    if (outConnTerminal !== undefined && outConnTerminal.type != "end") {
        //var outConnBlock = outConnTerminal.parentEl;
        //var outConnBlockId = $(outConnBlock).attr("data-block_id");
        var corr_outs = findCorrelatedOutputs(outConnTerminal);
    } else {
        var corr_outs = [];
    }

    var params = node.config.parameters || [];
    for (var i = 0; i < params.length; ++i) {
        if (params[i] != undefined) {
            $("#extend-modal #ent-list #qp" + params[i].query_path_id).prop("checked", true).change();
            $("#extend-modal #ent-list #out" + params[i].out_id).prop("checked", true);

            // check if output is in use in next block (correlation) and, if so, disable it so it can't be unchecked
            if (corr_outs.indexOf(i) != -1) {
                $("#extend-modal #ent-list #out" + params[i].out_id).click(function() {alert("Output is in use by next block", "Cannot uncheck"); $(this).prop("checked", true);});;
                $("#extend-modal #ent-list #qp" + params[i].query_path_id).addClass("noRemove");
            }
        }
    }

    //modal show
    $('#extend-modal').modal('show');
}

function getManyToOneRelationships2(a) {
    // returns a list of QueryPath ids leading from current button to another button through a many-to-one relationship
        var list = [];
        for (var i in qent[a].fw_query_paths) {
            if (qent[a].fw_query_paths[i].oneToMany == true) {
                list.push(i);
            }
        }
        return list;
    }

    // ----- GUI functions

var GUI = {
    getButtonName : function (id, cat) {    
        if (cat === undefined || cat === "qent")
            return qent[id].name;
        else if (cat === "op")
            return ops[id].name;
        
    },
    isCompatible : function (a, b) {

        if (a == b) return true;
    
        for (var i in qent[a].fw_query_paths) {
            if (qent[a].fw_query_paths[i].toEntity == b)
                return true;
        }
        return false;
    },
    getManyToOneRelationships: function(a) {
        // returns a list of buttons reachable from current button through a many-to-one relationship
        var list = [];
        for (var i in qent[a].fw_query_paths) {
            if (qent[a].fw_query_paths[i].oneToMany == true) {
                list.push(qent[a].fw_query_paths[i].toEntity);
            }
        }
        return list;
    },

    isManyToOneRelationship : function(a, b) {
        
        if (a == b) return true;

        for (var i in qent[a].fw_query_paths) {
            if (qent[a].fw_query_paths[i].toEntity == b)
                return !qent[a].fw_query_paths[i].oneToMany;
        }

        return null;
    },
}
// -------------  ---  GB MODAL MENU ---  ----------------

function buildGBModal(node) {
        
    //var connBlockId = QueryGen.getGraphNode(block_id).w_in[0];
    //var connBType = QueryGen.getGraphNode(connBlockId).output_type_id;
    var parent = node.parent[0];
    var connBType = node.parent[0].config.output_type_id;

    var r = GUI.getManyToOneRelationships(connBType);
            
    $("#gb-modal select#selattr").children().remove();

    for (var i=0; i<r.length; ++i) {
        $("#gb-modal select#selattr").append('<option value="'+r[i]+'">'
                                    +qent[r[i]].name+'</value>');
    }

    // assign handler to re-populate input tab whenever grouping entity changes

    $("#gb-modal select#selattr").change(function() {
        // populate input tab
        $("#gb-modal #gbconfig-in-list").children().remove();

        var out_type = $(this).val();
        var all_paths = qent[connBType].fw_query_paths;
        for (var i in all_paths) {
            var p = all_paths[i];
            if (p.toEntity == out_type && p.oneToMany == true){
                $("#gb-modal #gbconfig-in-list").append('<input id="in'+i+'" name="inputpaths" type="radio" value="'+i
                                                                        +'"/><label for="in'+i+'"><b>'+p.name+'</b>&nbsp;&nbsp;'
                                                                        +(p.description || "")+'</label><br>');
                if (p.isDefault == true) {
                    $("#gb-modal #gbconfig-in-list #in"+i).prop("checked", true);
                }
            }
        }
        // if there is no default path, select the first one
        if ($("#gb-modal #gbconfig-in-list input:checked").length == 0) {
            $("#gb-modal #gbconfig-in-list input:eq(0)").prop("checked", true);
        }
    }).change(); // trigger event to populate

    $("#gb-modal #gbconfig-flt-list,#gbconfig-out-list").children().remove();
    $("#gb-modal #gbconfigtabs").tabs("option", "active", 0)
                                    
    
    // populate drop-down attribute list
    // differentiate whether previous block is entity, extend op or group by
    var connButtonCat = parent.config.button_cat;
    var connButtonId = parent.config.button_id;
    if (connButtonCat == "qent") {
         var o = qent[connBType].outputs;

    } else if (connButtonCat == "op" && connButtonId == 7) {
        var o = parent.config.outputs
                .map(function (el) {
                    return {name: el};
                })
                .reduce(function (prev,curr,ind) {
                    prev['c' + parent.id + '_' + ind] = curr; // mark this as "correlated"
                    return prev;
                }, {} );

    } else if (connButtonCat == "op" && connButtonId == 4) {
         // add both entity attributes and aggregate attributes from the group by outputs
        var o = parent.config.outputs
                .map(function (el) {
                    return {name: el.name};
                })
                .reduce(function (prev,curr,ind) {
                    prev['c' + parent.id + '_' + ind] = curr; // mark this as "correlated"
                    return prev;
                }, {} );
        $.extend(true, o, qent[connBType].outputs);
    }

    
    $("#gb-modal").data("outs", $.extend(true, {}, o));
   
    // restore previous group-by entity
    var old_gb_attr = node.config.gb_entity;
    if (old_gb_attr) {
        $("#gb-modal select#selattr").val(old_gb_attr);
    }
    
    // restore previous filters (if any)
    var next_uid = 0;
    var params = node.config.parameters;
    var old_gb_attr;
    for (var i = 0; i < params.length; ++i) {
        $("#gb-modal #gbitemadd-flt").click();
        var p = $("#gb-modal #gbconfig-flt-list p.gbitem").last();
        var f = params[i];
        p.children(":eq(0)").val(f.op);
        p.children(":eq(1)").val(f.attr);
        if (f.values.length == 0){
            ggen.getJsonStrGraph[node.id].config.parameters[i].values = ['u>1'];
            var v = 'u>1';
        
        }else{
            var v = f.values[0];
        }
        // first character is 'u' (always uncorrelated), skip it
        
        p.children(":eq(2)").val(v[1]).change();
        p.children(":eq(3)").val(v.substr(2));
        if (f.values.length > 1) {
            v = f.values[1];
            p.children(":eq(5)").val(v[1]);
            p.children(":eq(6)").val(v.substr(2));
        }
        
        // retrieve and set filter's unique identifier
        p.data("uid", f.uid);
        if (f.uid >= next_uid)
            next_uid = f.uid + 1;

    }
    $("#gb-modal").data("next_uid", next_uid);

    // restore previous outputs (if any)
    
    // make list of outputs from current block that are referenced through correlation by next block
    
    //var block = $("#box"+node.id);
    //var outTerminal = block.data("out-terminal")[0];
    // var outConnTerminal = outTerminal.getConnectedTerminals()[0];
    var outConnTerminal = node.children[0];
    if (outConnTerminal !== undefined && outConnTerminal.type != "end") {
        //var outConnBlock = outConnTerminal;
        //var outConnBlockId = $(outConnBlock).attr("data-block_id");
        var corr_outs = findCorrelatedOutputs(outConnTerminal);
    } else {
        var corr_outs = [];
    }

    var outs = node.config.outputs;
    for (var i = 0; i < outs.length; ++i) {
        if (outs[i] != undefined) {
            $("#gb-modal #gbitemadd-out").click();
            var p = $("#gb-modal #gbconfig-out-list p.gbitem").last();
            var o = outs[i];
            p.children(":eq(0)").val(o.op);
            p.children(":eq(1)").val(o.attr);
            p.children(":eq(3)").val(o.name);

            // check if output is in use in next block (correlation) and, if so, disable it so it can't be deleted
            if (corr_outs!=undefined && corr_outs.indexOf(i) != -1) {
                $("#gbconfig-out-list p.gbitem:last span.gbitemdel").addClass("noRemove");
            }

        }
    }

    //modal show
    $('#gb-modal').modal('show');
}


function findCorrelatedOutputs(n) {
    // return index of prev. block's outputs that are referenced by curr. block's filters through correlation
    //var n = QueryGen.getGraphNode(block_id);
    var f = n.config.parameters;
    var o = [];
    if (n.config.button_cat == "qent") {
        for (var i = 0; i < f.length; ++i) {
            for (var j = 0; j < (f[i].values.length < 2 ? f[i].values.length : 2); ++j) {
                if (f[i].values[j][0] == 'c') {
                    o.push(parseInt(f[i].values[j].split("_")[1].split("+")[0]));
                }
            }
        }
    } else if (n.config.button_cat == "op" && n.config.button_id == 7) { // extend operator
        for (var i = 0; i < f.length; ++i) {
            if (f[i] != undefined) {
                o.push(f[i].out_id);
            }
        }
    }

    return o;
}

// ----------------- CONFIGURE END MODAL -------------------------

var f_translator = function configEndDialog(node){

    ggen.currentSelectedNode(node);
   
    //var blockId = node.parent[0].id;
    var outType = node.parent[0].config.output_type_id;
    var trans = $("#translatorslist");

    // clear previous translators
    trans.children().remove();

    // populate translators list
    for (var x in templates) {
        var t = templates[x];
        if (t.isTranslator == true && outType == t.translatorInputType) {
            if ($(t.WG).filter(workingGroupsList).length != 0 || $(templates[x].WG).filter(["admin"]).length != 0){ 
                trans.append('<input id="trans'+x+'" type="checkbox" value="'+x+'"><label for="trans'+x+'"><b>'+t.name+'</b>: '+t.description+'</label><br>');
            }
        }
    }
    if (trans.children().length == 0) {
        trans.append("<i>No translators available for the current output entity</i>");
    }
    
    // restore previous values (if any)
    var currentTrans = node.config.translators;
    //if(currentTrans!=undefined)
    for (var i = 0; i < currentTrans.length; ++i) {
        $("#trans" + currentTrans[i]).prop("checked", true);
    }

    //modal show
    $('#translator-modal').modal('show');

}


// ---------------------------------------------------

function toggleStatus() {
    
    if ($(this).val()=="<" ||  $(this).val()=="=") {
        $(this).siblings('.rangeTo').attr('disabled', true);
    } else {
        $(this).siblings('.rangeTo').removeAttr('disabled');
    } 
}


function toggleCorrelation(target, v, label) {

    var prev = target.data("menu-item");
    target.data("menu-item", v);

    if (target.hasClass("corr-par")) {
        var chk = target.data("checkbox");
        var par = target.data("paragraph");
        chk.prop("checked", true);
        if (v != 0) {
            if (prev == 0) {
                target.after($(correlationElements[target.data("type")]));
            }
            target.next().children("input:eq(0)").val(label);
            par.hide();
        } else {
            target.next().remove();
            par.show();
        }
    } else if (target.hasClass("corr-input")) {
        if (v != 0) {
            if (prev == 0) {
                target.next().hide();
                target.after($(correlationElements[target.data("type")]))
            }
            target.next().children("input:eq(0)").val(label);
        } else {
            if (prev != 0) {
                target.next().remove();
                target.next().show();
            }
        }
    }
}

function getGraphSize(){
    var c = 0, i;
    var jsonstr = ggen.getJsonStrGraph();
    for (i in jsonstr) {
        if (jsonstr.hasOwnProperty(i)) ++c;
    }
    return c;
}

// ---------------------------------------___LOAD LAST QUERY___
function restoreNodeRecursive(i, parent, queryGraph){
    
    if(i!="end") i = parseInt(i);
    //console.log("-------> restore node ", i);
    if(i=="end"){
        
        //if w_out is end
        //connect to end and add to it translator
        var nend = ggen.connectNodeToEnd(parent);
        nend.config.translators = queryGraph[i].translators;

    } else if(   (queryGraph[i].button_cat=="op" &&
                    queryGraph[i].button_id<4 )
                ||(
                    queryGraph[i].button_cat=="op" &&
                    queryGraph[i].button_id==6 && //template
                    templates[ queryGraph[i].template_id].inputs.length==4
                )
    ){    
        
        
        //Extend, Template, GB have 1 input (with one exception)

         //if node is an opearator check if is already in canvas
        var avops = ggen.getAvailableOperators();
        var suitableop_found = false;
        if(avops.length>0){
            //search for a suitable operator for parent
        
            avops.forEach(d=>{
                if(d.config==queryGraph[i]){
                    //add arc
                    ggen.addArc(parent,d);
                    suitableop_found=true;
                }
            });
        }
        if(suitableop_found==false){
             //if not addNode
             let name = ops[queryGraph[i].button_id].name != "Template" ? ops[queryGraph[i].button_id].name : templates[queryGraph[i].template_id].name;
             if(    queryGraph[i].button_cat=="op" &&
                    queryGraph[i].button_id==6 && //template
                    templates[ queryGraph[i].template_id].inputs.length==4)
                var node = ggen.addNode(type="block", title=name, parent=parent, nodeclass="operators", 4);
            else
                var node = ggen.addNode(type="operator", title=name, parent=parent, nodeclass="operators");
             node.data = ops[queryGraph[i].button_id].name != "Template" ? ops[queryGraph[i].button_id] : templates[queryGraph[i].template_id];
             node.config = queryGraph[i];     
        }else return;
            

    } else if(queryGraph[i].button_cat=="op"){
        
        //operator with one input
        let name = ops[queryGraph[i].button_id].name != "Template" ? ops[queryGraph[i].button_id].name : templates[queryGraph[i].template_id].name;
        var node = ggen.addNode(type="block", title=name, parent=parent, nodeclass="operators");
        node.data = ops[queryGraph[i].button_id].name != "Template" ? ops[queryGraph[i].button_id] : templates[queryGraph[i].template_id];
        node.config = queryGraph[i];

    }else if(queryGraph[i].button_cat=="qent"){

        var nodeclass = qent[queryGraph[i].button_id].dslabel;
        //if qent add new node and update data and config
        var node = ggen.addNode(type="block", title=qent[queryGraph[i].button_id].name, parent=parent, nodeclass=nodeclass);
        node.data=qent[queryGraph[i].button_id];
        node.config=queryGraph[i];
    }

    //if node with 4 input and not every input connected => do not call recursive function
    //otherwise
    //call recursive for its child
    debugger;
    if( node==undefined || (node.config.w_in==4 && node.input.length<4) )
        return;
    //debugger;
    if( queryGraph[i].w_out!=undefined && queryGraph[i].w_out.length>0
    )
        restoreNodeRecursive(queryGraph[i].w_out[0], node, queryGraph);

}

function loadQueryGraph(queryGraph) {
        
    if(queryGraph["start"]==undefined)
        return;

    //n0 = ggen.addNode(type=="start", title=queryGraph["start"].title);
    n0 = ggen.nodes()[0];

    console.log("Start is ", n0);
    
    queryGraph["start"].w_out.forEach(d=>{
        //for each node in w_out call restoreNodeRecursive
        restoreNodeRecursive(parseInt(d), n0, queryGraph);
    });

}

/*
function setGraphNodeAttr(block_id, attr_name, val) {
    QueryGen.jsonStrGraph[block_id][attr_name] = val;   
}

function addGraphNodeAttr(block_id, attr_name, val) {
    QueryGen.jsonStrGraph[block_id][attr_name].push.apply(QueryGen.jsonStrGraph[block_id][attr_name], val);
}
*/

// ----------------------------------------___SUBMIT___

function submitGraph() {

    console.log("submit graph");
    
    var q = generateQueryDict();
    if (q == null)
        return;
    q.graph_nodes = JSON.stringify(q.graph_nodes);
    
    var ctrl = getBusyOverlay("viewport", {color:'#B2B2B2', opacity:0.3, text:'Running query, please wait...', style: 'color: #222222;'}, {color:'#222222', weight:'3', size:100, type:'rectangle', count:12});
    
    $("#sqf_title").val(q['title']);
    $("#sqf_description").val(q['description']);
    $("#sqf_graph_nodes").val(q['graph_nodes']);
    $("#sqf_qid").val(qid);
    
    console.log(qid);
    console.log(q['graph_nodes']);

    
    $("#submit_query_frm").submit(function(e) {
        var postData = $(this).serializeArray();
        var formURL = $(this).attr("action");
        
        $.ajax({
            url : formURL,
            type: "POST",
            data : postData,
            success:function(data, textStatus, jqXHR) {
                
                data = JSON.parse(data);
                window.location.href = display_results_url + '?qid=' + data.qid + '&rid=' + data.rid;
            },
            error: function(jqXHR, textStatus, errorThrown) {
                console.log("ERR: jqxhr- ",jqXHR," - txtStatus ",textStatus);
                alert("An error occurred. " + errorThrown);
            }
        });
        e.preventDefault(); //STOP default action
    });
    
    $("#submit_query_frm").submit();

}

 function generateQueryDict() {
    // perform some preliminary checks:
    // -graph has at least one block
    // -graph is connected
    // -graph is acyclic
    // -all blocks requiring configuration have been configured
    
    // la nuova interfaccia permette di configurare più parametri
    // simultaneamente nello stesso box, cosa non consentita prima.
    // per permettere di utilizzare temporaneamente il vecchio codice
    // server-side, nel generare il grafo di query, tutti i blocchi
    // che hanno più di un parametro configurato vengono splittati,
    // generando tanti blocchi dello stesso tipo, ciascuno con un solo
    // parametro settato. i nuovi blocchi sono numerati in questo modo:
    // -il primo mantiene l'id del blocco originale
    // -agli altri viene assegnato un nuovo id incrementale
    // -nel nodo originale viene aggiunto un attributo "last_id", contenente
    // il massimo degli id assegnati ai nuovi blocchi. questo valore deve essere 
    // utilizzato nell'assegnare il w_in dei blocchi successivi,
    // al posto dell'id originale

    var jsonStrGraph = ggen.getJsonStrGraph();
    var atleast1 = Object.keys(jsonStrGraph).length > 2 ? true : false;

    var acycl = checkAcyclic(jsonStrGraph);

    var conn = checkConnected(jsonStrGraph);

    var paramsOk = checkParameters(jsonStrGraph);

    var errMsg = '';

    
    if (!atleast1) {
        errMsg += '-query graph should include at least one block<br>';
    }
    if (!acycl) {
        errMsg += '-query graph has a cycle<br>';
    }
    if (!conn) {
        errMsg += '-one or more terminals are disconnected<br>';
    }
    if (!paramsOk) {
        errMsg += '-one or more blocks must be configured<br>'
    }
    if (errMsg != '') {
        alert(  "The following problems were identified:<br>" + errMsg,
                "Cannot submit query!",
                "Ok"
        );
        return null;
    }

    // remove undefined outputs from group by and extend blocks,
    // and fix references to outputs in downstream blocks
    removeNullOutputs(jsonStrGraph);

    var title=$("textarea#query_title").val();
    var description=$("textarea#query_description").val();

    var query = {
        'title' : title,
        'description' : description,
        'graph_nodes' : getQueryDict(jsonStrGraph)
    };
    
    return query;
    
}

// checks if graph is acyclic
function checkAcyclic(jsonStrGraph) {
        var res;
        for (var x in jsonStrGraph) {
            console.log(x);
            if (!jsonStrGraph[x].visited) {
                res = visitAcyclic(x); //still TODO
                if (!res) {
                    break;
                }
            }
        }
        //clean up
        for (var x in jsonStrGraph) {
            setGraphNodeAttr(x, 'visited', false); //still TODO
            setGraphNodeAttr(x, 'onstack', false); //still TODO
        }
        return res;
}

// visits graph starting from a given node to check for acyclicity
 function visitAcyclic(curr_id) {
        var curr = getGraphNode(curr_id);
        if (curr.visited) {
            if (!(curr.onstack)) {
                return true;
            } else {
                return false;
            }
        } else {
            setGraphNodeAttr(curr_id, 'visited', true);
            setGraphNodeAttr(curr_id, 'onstack', true);
            if (curr.w_out) {
                for (var i=0; i < curr.w_out.length; ++i){
                    var next_node = curr.w_out[i].split('.')[0];
                    var res = visitAcyclic(next_node);
                    if (!res) {
                        return false;
                    }
                }
            }
            setGraphNodeAttr(curr_id, 'onstack', false);
            return true;
        }
    }
     
// BL function
function getGraphNode(block_id) {
    return ggen.getJsonStrGraph()[block_id];

}
    
// BL function
function setGraphNodeAttr(block_id, attr_name, val) {
    ggen.getJsonStrGraph()[block_id][attr_name] = val;   
}



function checkConnected(jsonStrGraph) {
    for (var x in jsonStrGraph) {
        
        if (    (x == startName && jsonStrGraph[x].w_out.length < 1)  ||
                (x == endName && jsonStrGraph[x].w_in.length != 1)) {
            console.log("start or end block disconnected");
            return false;
        } else

        if (x != startName && x != endName) {
            var len_in;
            if (jsonStrGraph[x].button_cat == 'qent') {
                len_in = 1;
            } else

            if (jsonStrGraph[x].button_cat == 'op' && jsonStrGraph[x].button_id != 6) { // not templates
                len_in = ops[jsonStrGraph[x].button_id].numInputs;
            } else

            if (jsonStrGraph[x].button_cat == 'op' && jsonStrGraph[x].button_id == 6) { // templates
                len_in = templates[jsonStrGraph[x].template_id].inputs.length;
            }
            var len_out = 1;
            
            if (jsonStrGraph[x].w_in.length != len_in || 
                jsonStrGraph[x].w_out.length != len_out) {
                return false;
            } else {
                for (var j=0; j<jsonStrGraph[x].w_in.length; ++j) {
                    if (!jsonStrGraph[x].w_in[j]) {
                        return false;
                    }
                }
            }
        }
    }
    return true;
}

function checkParameters(jsonStrGraph) {
    // andrebbe schematizzato a database quali blocchi/operatori abbiano dei parametri obbligatori
    // n.b. il group by non richiede per forza parametri
    var requiresConfig = {
        // inserire qui le tuple [categoria_bottone, id_bottone] per i bottoni che richiedono configurazione
        data: [["op", 5], ["op", 4], ["op", 7]],
        
        check: function(obj) {
            for (var i = 0, len = this.data.length; i < len; ++i) {
                if (this.data[i][0] == obj.button_cat && this.data[i][1] == obj.button_id)
                    return true;
            }
            return false;
        }
    };

    for (var x in jsonStrGraph) {
        if (requiresConfig.check(jsonStrGraph[x]) && jsonStrGraph[x].parameters.length < 1) {
            return false;
        }
    }
    return true;
}

function removeNullOutputs(jsonStrGraph) {
    // remove undefined elements from GB "outputs" array and
    // from EXTEND "parameters" and "outputs" array
    // and fix references to these arrays in subsequent query blocks
    for (var i in jsonStrGraph) {
        var x = jsonStrGraph[i];
        if (x.button_cat == 'op') {
            // create remapping
            var remap = {};
            var toRemove = 0;
            for (var j = 0; j < x.outputs.length; ++j) {
                if (x.outputs[j] == undefined) {
                    ++toRemove;
                } else {
                    remap[j] = j - toRemove;
                }
            }
            if (toRemove == 0) continue;

            if (x.button_id == 4) { // group by
                // remove undefined elements
                x.outputs = x.outputs.filter(function(el) {return el != undefined;});
            } else

            if (x.button_id == 7) { // extend
                // remove undefined elements
                x.outputs = x.outputs.filter(function(el) {return el != undefined;});
                x.parameters = x.parameters.filter(function(el) {return el != undefined;});

            }

            // fix references in next block
            var connBlockId = x.w_out[0].split('.')[0];
            if (connBlockId == 'end') continue;
            
            var next = jsonStrGraph[connBlockId];
            var f = findCorrelatedFilters(connBlockId);
            
            if (next.button_cat == 'qent') {
                for (var j = 0; j < f.length; ++j) {
                    var param = next.parameters[f[j]];
                    for (var k = 0; k < (param.values.length < 2 ? param.values.length : 2); ++k) {
                        var v = param.values[k].split('_');
                        var vv = v[1].split('+');
                        var oid = remap[vv[0]];
                        param.values[k] = v[0] + '_' + oid + (vv[1] ? '+' + vv[1] : '');
                    }
                }
            } else

            if (next.button_cat == 'op' && next.button_id == 4) { // group by
                // fix correlated parameters
                for (var j = 0; j < f.length; ++j) {
                    var param = next.parameters[f[j]];
                    var v = param.attr.split('_');
                    param.attr = v[0] + '_' + remap[v[1]];
                }
                // find and fix correlated outputs
                for (var j = 0; j < next.outputs.length; ++j) {
                    var out = next.outputs[j];
                    if (out.attr[0] == 'c') {
                        var v = out.attr.split('_');
                        out.attr = v[0] + '_' + remap[v[1]];
                    }
                }
            } else

            if (next.button_cat == 'op' && next.button_id == 7) { // extend
                for (var j = 0; j < f.length; ++j) {
                    var param = next.parameters[f[j]];
                    param.out_id = remap[param.out_id];
                }
            }
        }
    }   
}

function getQueryDict(jsonStrGraph) {

    var d = {}

    //TODO
    //var z = $("#canvas").offset();
    var z = {left: 0, top: 0}; //dummy z

    for (var x in jsonStrGraph) {
        var j = jsonStrGraph[x];
        
        //TODO
        //var o = (x != "start" && x != "end") ? $("#box"+x).offset() : {left: 0, top: 0};
        var o = {left: 0, top: 0};  //dummy o

        d[x] = {
            button_id: j.button_id,
            parameters: j.parameters ? (j.button_cat == "op" && j.button_id == 6 ? processTemplateParameters(j.parameters, j.template_id) : processParameters(j.parameters, j.button_id)) : null,
            outputs: j.outputs,
            query_path_id: j.query_path_id instanceof Array ? j.query_path_id : [j.query_path_id],
            gb_entity: j.gb_entity,
            w_in: j.w_in,
            w_out: j.w_out,
            button_cat: j.button_cat,
            output_type_id: j.output_type_id,
            offsetX: o.left - z.left,
            offsetY: o.top - z.top,
            template_id: j.template_id
        };
    }
    d['end']['translators'] = jsonStrGraph['end']['translators'];

    return d;
}

    
function findCorrelatedFilters(block_id) {
    // return index of curr. block's filters that have correlated values from prev. block
    var n = getGraphNode(block_id);
    var f = n.parameters;
    var rem = [];
    if (n.button_cat == "qent") {
        for (var i = 0; i < f.length; ++i) {
            for (var j = 0; j < (f[i].values.length < 2 ? f[i].values.length : 2); ++j) {
                if (f[i].values[j][0] == 'c') {
                    rem.push(i);
                    break;
                }
            }
        }
    } else

    if (n.button_cat == "op" && n.button_id == 4) { // group by operator
        for (var i = 0; i < f.length; ++i) {
            if (f[i].attr[0] == 'c') {
                rem.push(i);
            }
        }
    } else


    if (n.button_cat == "op" && n.button_id == 7) { // extend operator
        for (var i = 0; i < f.length; ++i) {
            if (f[i].query_path_id == 'self') {
                rem.push(i);
            }
        }
    }
    return rem;
}

function processParameters(pList, button_id) {
    var params = [];
    var subflt = [];
    var l = pList.length;
    
    var WgFilters = {}
    if (qent.hasOwnProperty(button_id)){
        if (workingGroupsList.indexOf('admin') >= 0 ) {
            console.log(button_id, qent[button_id])
            if (qent[button_id].hasWG){    
                for (var f in qent[button_id].filters){
                    if (qent[button_id].filters[f].type == 7){
                        var W = qent[button_id]['filters'][f].values
                        for (var wj in W){
                            if (workingGroupsList.indexOf( W[wj][1]) != -1 && W[wj][1] == 'admin'){
                                WgFilters[f] = W[wj][0];
                            }
                        }
                    }
                }
            }
        }
    }
    
    for (var i = 0; i < l; ++i) {
        if (pList[i]['par_flt_id'] == undefined) {
            if (WgFilters.hasOwnProperty(pList[i]['f_id'])){
                if (pList[i].values.indexOf(WgFilters[pList[i]['f_id']]) != -1 )
                    continue;
                }
            params.push($.extend({}, pList[i]));
        } else {
            subflt.push(i);
        }
    }
    for (var i = 0; i < subflt.length; ++i) {
        var s = pList[subflt[i]];
        var parflt;
        for (var j = 0; j < params.length; ++j) {
            if (params[j]['f_id'] == s['par_flt_id']) {
                parflt = params[j];
                break;
            }
        }
        if (parflt['subflt'] == undefined) parflt['subflt'] = [];
        for (var j = 0; j < parflt.values.length; ++j) {
            if (parflt.values[j] == s['par_flt_value']) {
                parflt.subflt[j] = {'f_id': s['f_id'], 'values': s['values']};
                break;
            }
        }
    }
    return params;
}

function processTemplateParameters(pList, template_id) {
    var params = [];
    var subflt = [];
    var l = pList.length;

    var WgFilters = {}
    if (workingGroupsList.indexOf('admin') >= 0 ) {
        for (var t in templates[template_id].parameters){
            if (templates[template_id].parameters[t].type == 7){
                var button_id = templates[template_id].parameters[t].src_button_id
                var filter_id = templates[template_id].parameters[t].src_f_id
                var W = qent[button_id]['filters'][filter_id].values
               for (var wj in W){
                    if (workingGroupsList.indexOf( W[wj][1]) != -1 && W[wj][1] == 'admin'){
                        WgFilters[t] = W[wj][0];
                    }
                }
                
            }
        }
    }
    
    for (var i = 0; i < l; ++i) {
        if (pList[i]['par_flt_id'] == undefined) {
            if (WgFilters.hasOwnProperty(pList[i]['f_id'])){
                if (pList[i].values.indexOf(WgFilters[pList[i]['f_id']]) != -1 )
                    continue;
                }
            params.push($.extend({}, pList[i]));
        } else {
            subflt.push(i);
        }
    }
    for (var i = 0; i < subflt.length; ++i) {
        var s = pList[subflt[i]];
        var parflt;
        for (var j = 0; j < params.length; ++j) {
            if (params[j]['f_id'] == s['par_flt_id']) {
                parflt = params[j];
                break;
            }
        }
        if (parflt['subvalues'] == undefined) parflt['subvalues'] = [];
        for (var j = 0; j < parflt.values.length; ++j) {
            if (parflt.values[j] == s['par_flt_value']) {
                parflt.subvalues[j] = s['values'];
                console.log(parflt.subvalues);
                break;
            }
        }
    }
    return params;

}

//GUI function
function  toggleStatus() {
    
    if ($(this).val()=="<" ||  $(this).val()=="=") {
        $(this).siblings('.rangeTo').attr('disabled', true);
    } else {
        $(this).siblings('.rangeTo').removeAttr('disabled');
    } 
}

// -------- save as translator
   
function submitGraphAsTranslator() {

    console.log("submit graph as translator");
    var jsonstr = ggen.getJsonStrGraph();
    
    if (jsonstr['start'].w_out.length > 1) {
        alert(  "This feature requires that a single block be connected to the start block",
                "Cannot save as translator",
                "Ok"
        );
        return;
    }
    
    if ($("textarea#query_title").val().trim() == '' || $("textarea#query_description").val().trim() == '') {
        //open modal with title and description

        $("#titledescr-modal .modal-body").prepend("<p class='tmp_msg'>Please fill in the title and description fields. "
        +"<p>");
        $("#myoverlay").css("display","block");
        $("#titledescr-modal").attr("data-backdrop","false");
        $("#titledescr-modal").modal("show");
        $(".modal-backdrop").hide();

        /*
        alert(  "Please fill in the title and description fields",
                "Cannot save as translator",
                "Ok"
        );*/
        return;
    }
    
    if (Object.keys(jsonstr).length < 3) {
        alert(  "To translate an entity into another you need at least one block",
                "Cannot save as translator",
                "Ok"
        );
        return;
    }

    saveAsTranslator();
}

function saveAsTranslator() {
    QueryGen.template.base_query = generateQueryDict();
    if (QueryGen.template.base_query  == null)
        return;

    var jsonstr = ggen.getJsonStrGraph();

    var blocks = [];
    for (var x in jsonstr) {
        if (x == 'start' || x == 'end')
            continue;
        var b = jsonstr[x];
        // if it is an entity or a configurable operator (i.e. group by or genealogy id) except the extend operator or a configurable template
        if (b.button_cat == 'qent' || b.button_cat == 'op' && b.button_id != 7 
                && ((b.button_id != 6 && ops[b.button_id].configurable == true) 
                || (b.button_id == 6 && templates[b.template_id].parameters.length > 0))) {
            QueryGen.template.blocks.push(b);
            generateTemplate(b);
        }
    }

    QueryGen.template.curr_block_id = 0;
    $("#stf_isTranslator").val("true");

    submitTemplate();

}

function generateTemplate(b) {
    if (b.button_cat == 'qent') {
        // if refreshing, the current block might already be in the template, so we don't wanna overwrite the previous contents
        if (QueryGen.template.conf[b.id] == undefined) {

            QueryGen.template.conf[b.id] = {inputs: {}, parameters: {}};
            // we allow to define what to do with all filters of a given block (including those that have not been selected by the template designer in the block configuration window)
            // n.b. filters that are enabled in the block configuration will be set to option "1", otherwise they will be set to option "0"
            var e = qent[b.button_id];
            var enabled_filters = [];
            var pars = b.parameters;
            for (var i = 0, ll = pars.length; i <ll; ++i) {
                enabled_filters.push(pars[i].f_id);
            }
            for (var f_id in e.filters) {
                if (e.filters[f_id].type == 7)
                    QueryGen.template.conf[b.id].parameters[f_id] = {name: 'WG', description: '', opt: 2};
                
                else
                    QueryGen.template.conf[b.id].parameters[f_id] = {name: '', description: '', opt: enabled_filters.indexOf(f_id) == -1 ? 0 : 1};
            }
        }
    } else
            
    if (b.button_cat == 'op') {
        if (b.button_id == 4) { //group by
            // if refreshing, the current block might already be in the template, so we don't wanna overwrite the previous contents
            var old_conf = QueryGen.template.conf[b.id] || {inputs: {}, parameters: {}}
            QueryGen.template.conf[b.id] = {inputs: {}, parameters: {}}
            // we only allow to define what to do with filters that have already been defined
            // i.e., we don't allow the end user to define its own filters but only to provide values for filters defined by the template designer
            for (var j = 0, ll = b.parameters.length; j < ll; ++j) {
                // if refreshing, the current filter might already be in the block, so we don't wanna overwrite its previous settings
                if (old_conf.parameters[b.parameters[j].uid] != undefined) {
                    // if it's there, only update the filter index
                    QueryGen.template.conf[b.id].parameters[b.parameters[j].uid] = $.extend(old_conf.parameters[b.parameters[j].uid], {index: j});
                } else {
                    QueryGen.template.conf[b.id].parameters[b.parameters[j].uid] = {name: '', description: '', opt: 1, index: j};
                }
            }
        } else
        if (b.button_id == 5) { //genealogy id
            // we store whether the genealogy id value(s) shall be entered by the user or are locked to the ones defined by the template designer
            QueryGen.template.conf[b.id] = QueryGen.template.conf[b.id] || {inputs: {}, parameters: {'genid':{name: '', description: '', opt: -1}}};
        }
        if (b.button_id == 6) { // template
            if (QueryGen.template.conf[b.id] == undefined) {

                QueryGen.template.conf[b.id] = {inputs: {}, parameters: {}};
                // we allow to define what do with all filters of a given template block (including those that have not been selected by the template designer in the template configuration window)
                // n.b. filters that are enabled in the template configuration will be set to option "1", otherwise they will be set to option "0"
                var t = templates[b.template_id];
                var enabled_filters = [];
                var pars = b.parameters;
                for (var i = 0, ll = pars.length; i < ll; ++i) {
                    enabled_filters.push(parseInt(pars[i].f_id));
                }
                for (var i = 0, ll = t.parameters.length; i < ll; ++i) {
                    var f_id = i;
                    if (t.parameters[i].type == 7)
                        QueryGen.template.conf[b.id].parameters[f_id] = {name: 'WG', description: '', opt: 2};
                    else    
                        QueryGen.template.conf[b.id].parameters[f_id] = {name: '', description: '', opt: enabled_filters.indexOf(f_id) == -1 ? 0 : 1};
                }
            }
        }
    }

    var old_inputs = QueryGen.template.conf[b.id].inputs;
    QueryGen.template.conf[b.id].inputs = {};
    for (var i = 0; i < b.w_in.length; ++i) {
        if (b.w_in[i] == 'start') {
            QueryGen.template.conf[b.id].inputs[i] = old_inputs[i] || {name: '', description: ''};
        }
    }
}



function submitTemplate() {
    // regenerate query from scratch
    QueryGen.template.base_query = generateQueryDict();

    // save current configuration
    for (var x in QueryGen.template.conf) {
        saveToTemplate(x);
    }
    // check if an option has been specified for each parameter in each block
    var res = checkTemplate();
    if (res == -1) {
        alert("Please specify an option for all template parameters.", "Cannot continue");
        return;
    } else
    if (res == -2) {
        alert("Please provide a name, and optionally a description, for all template parameters left blank.", "Cannot continue");
        return;
    } else
    if (res == -3) {
        alert("Please provide a value for all template parameters that must be locked to the current value.", "Cannot continue");
        return;
    }

    // check if a title has been provided
    var title = $("#query_title").val().trim();
    var description = $("#query_description").val().trim();
    if (title == "") {
        //open modal with title and description
        $("#titledescr-modal .modal-body").prepend("<p class='tmp_msg'>Please provide a title for the template. </br> A concise description, "
                                          +"although not mandatory, is recommended.<p>");
        //alert("Please provide a title for the template. A concise description, although not mandatory, is recommended.");
             
        $("#myoverlay").css("display","block");
        $("#titledescr-modal").attr("data-backdrop","false");
        $("#titledescr-modal").modal("show");
        $(".modal-backdrop").hide();
        return;
    }

    var ctrl = getBusyOverlay("viewport", {color:'#B2B2B2', opacity:0.3, text:'Saving template, please wait...', style: 'color: #222222;'}, {color:'#222222', weight:'3', size:100, type:'rectangle', count:12});
    
    // check if template name is already in use
    $.ajax({
        
        url: $("#submit_template_frm").attr("action"),
        data: "check_template_name="+title + "&tqid=" + tqid + "&transid=" + transid,
        success: function(data) {
            data = JSON.parse(data);
            if (data == true) {
                ctrl.remove();
                alert("The template name you chose is already in use. Please choose a different name.");
            } else {
                
                postProcessTemplate();
                QueryGen.template.base_query.graph_nodes = JSON.stringify(QueryGen.template.base_query.graph_nodes);
                $("#stf_title").val(title);
                $("#stf_description").val(description);
                $("#stf_base_query").val(QueryGen.template.base_query.graph_nodes);
                $("#stf_conf").val(JSON.stringify(QueryGen.template.conf));
                if (tqid){
                    $("#stf_idtemplate").val(tqid);
                }
                if (transid){
                    $("#stf_idtemplate").val(transid);
                }
                console.log(QueryGen.template.base_query.graph_nodes);
                console.log(JSON.stringify(QueryGen.template.conf));
                $("#submit_template_frm").submit();
            }
        },
        error: function(data) {
            alert("Error: failed to connect to server!");
        }
    });

}


function saveToTemplate(bid) {
    
    $("#div" + bid + " table#paramdef tr.param").each(function() {
        var s = $(this).find("select");
        var d = s.data();
        var v = s.val();
        QueryGen.template.conf[d.b_id].parameters[d.f_id].opt = v;
        if (v == 2 || v == 3) {
            //var r = $(this).next();
            var t = $(this).find("input:eq(0)");
            QueryGen.template.conf[bid].parameters[d.f_id].name = t.val();
            //r = r.next();
            t = $(this).find("input:eq(1)");
            QueryGen.template.conf[bid].parameters[d.f_id].description = t.val();
        } else {
            QueryGen.template.conf[bid].parameters[d.f_id].name = "";
            QueryGen.template.conf[bid].parameters[d.f_id].description = "";
        }
    });

    $("#div" + bid + " table#inpdef tbody tr").each(function() {
        var iid = $(this).data("input_id");
        QueryGen.template.conf[bid].inputs[iid] = {name: $(this).find("input:eq(0)").val(), description: $(this).find("input:eq(1)").val()};
    });
}


function checkTemplate() {
    // check if an option has been specified for each parameter
    for (var b_id in QueryGen.template.conf) {
        var f_list = QueryGen.template.conf[b_id].parameters;
        for (var f_id in f_list) {
            if (f_list[f_id].opt == -1) {
                return -1;
            } else

            if (f_list[f_id].opt == 2 && f_list[f_id].name == "") {
                return -2;
            } else

            if (f_list[f_id].opt == 1 || f_list[f_id].opt == 3) {
                // check if "lock" or lock main" has been selected but no values have been provided for the filter
                var thisParam = QueryGen.template.base_query.graph_nodes[b_id].parameters.filter(function(e) {return (e.f_id != undefined? e.f_id : (e.uid != undefined ? e.uid : e.param_name)) == f_id});
                if (thisParam.length == 0 || thisParam[0].values == undefined || thisParam[0].values.length == 0) {
                    return -3;
                }
            }
        }
    }
    return 0;
}


function postProcessTemplate() {
    var templ_param_id = 0;
    for (var block_id in QueryGen.template.conf) {
        var block = QueryGen.template.base_query.graph_nodes[block_id];
        var blockParams = QueryGen.template.conf[block_id].parameters;
        for (var param_id in blockParams) {
            if (blockParams[param_id].opt == 2) {
                if (block.button_cat == 'qent') {
                    // each free qent parameter must be added to the corresponding block's param. list, if not already in the list, and it must have no value
                    var thisParam = block.parameters.filter(function(e) {return e.f_id == param_id});
                    if (thisParam.length > 0) {
                        thisParam[0].values = []
                    } else {
                        block.parameters.push({
                            f_id: param_id,
                            values: []
                        });
                    }
                } else

                if (block.button_cat == 'op') {
                    if (block.button_id == '4') { // group by
                        // each free gb parameter has been defined by the user with an associated value, which must be cleared
                        var thisParam = block.parameters.filter(function(e) {return e.uid == param_id})[0];
                        thisParam.values = [];
                    } else

                    if (block.button_id == '5') { // genealogy id
                        // values must be cleared for a free genealogy id parameter
                        block.parameters[0].values = [];
                    } else

                    if (block.button_id == '6') { // template
                        // each free template parameter must be added to the corresponding block's param. list, if not already in the list, and it must have no value
                        var thisParam = block.parameters.filter(function(e) {return e.f_id == param_id});
                        if (thisParam.length > 0) {
                            thisParam[0].values = []
                        } else {
                            block.parameters.push({
                                f_id: param_id,
                                values: []
                            });
                        }
                    }
                }
            } else

            if (blockParams[param_id].opt == 3) {
                // subfilter values (if any) must be removed from the query
                var thisParam = block.parameters.filter(function(e) {return e.f_id == param_id});
                delete thisParam[0].subvalues;
            }

        }
        var newBlockParams = {};
        for (var param_id in blockParams) {
            if (blockParams[param_id].opt == 0)
                continue;

            var index;
            if (block.button_cat == 'qent') {
                // find index of object that has f_id == param_id
                for (index = 0; index < block.parameters.length && block.parameters[index].f_id != param_id; ++index);
            } else

            if (block.button_cat == 'op') {
                if (block.button_id == '4') { // group by
                    // find index of object that has uid == param_id
                    index = blockParams[param_id].index;
                    // delete "index" property which is no longer needed
                    delete blockParams[param_id].index;
                } else

                if (block.button_id == '5') { // genealogy id
                    // index is 0
                    index = 0;
                } else

                if (block.button_id == '6') { //template
                    // find index of object that has f_id == param_id
                    for (index = 0; index < block.parameters.length && block.parameters[index].f_id != param_id; ++index);
                }
            }
            newBlockParams[index] = $.extend(blockParams[param_id], blockParams[param_id].opt != 1 ? {templ_param_id: templ_param_id++}:{}); // if opt == 1, param is locked to current value, hence it is not an actual template parameter
        }
        QueryGen.template.conf[block_id].parameters = newBlockParams;
    }
}

function startTemplateDefinition() {
    QueryGen.template.base_query = generateQueryDict();

    $('.templateform').remove();
    if (QueryGen.template.base_query == null)
        return;
    QueryGen.template.in_template = true;

    // get the template parameter with a modal


 /*   
    // hide button panels
    QueryGen.hideDesignTools();
    // show template definition panel
    $("#definetempl").show("fast");
    // hide non-template buttons
    $("#clear_btn,#save_transl,#save_templ").hide();
    // show back to design button
    $("#back_to_design").show();
    // set submission handler
    $("#query_submit").off("click").on("click", QueryGen.submitTemplate);
*/
    $("article#blockparams table.paramlist").remove();
    QueryGen.template.blocks = [];

    var jsonstr = ggen.getJsonStrGraph();

    for (var x in jsonstr) {
        if (x == 'start' || x == 'end')
            continue;
        var b = jsonstr[x];
        console.log(b);
        // if it is an entity or a configurable operator (i.e. group by or genealogy id) except the extend operator or a configurable template
        if (b.button_cat == 'qent' || b.button_cat == 'op' && b.button_id != 7 && ((b.button_id != 6 && ops[b.button_id].configurable == true) || (b.button_id == 6 && templates[b.template_id].parameters.length > 0))) {
            QueryGen.template.blocks.push(b);

            generateTemplate(b);
            updateTemplateConf(b);
            prepareTemplateForm(b);
        }
    }

    QueryGen.template.curr_block_id = 0;
    changeTemplateForm({data: {dir: 0}});
}

function updateTemplateConf(bid){
    if (tparams){
        console.log(bid.id);
        var block = bid.id;
        
        if (!$.isEmptyObject(tparams[block].inputs)){
            QueryGen.template.conf[bid.id]['inputs'] =  tparams[block]['inputs'];
        }
        
        console.log(QueryGen.template.conf[bid.id], tparams);
        for (var p in tparams[block]['parameters']){
            console.log(p, QueryGen.template.conf[bid.id]);
            console.log(QueryGen.template.conf[bid.id].parameters[p],  tparams[block]['parameters'][p]);
            QueryGen.template.conf[bid.id].parameters[p]['name'] = tparams[block]['parameters'][p]['name'];
            QueryGen.template.conf[bid.id].parameters[p]['description'] = tparams[block]['parameters'][p]['description'];
            QueryGen.template.conf[bid.id].parameters[p]['opt'] = parseInt(tparams[block]['parameters'][p]['opt']);
            console.log(QueryGen.template.conf[bid.id].parameters)
        }            
    }
}


function prepareTemplateForm(b) {
    //b = node.config;
    //for each node different from start and end call prepareTemplateForm
    var div = '<div style=" display: none" class="templateform"><p id="blockinfo" style="font-size: 14px; margin-left: 20px">Block<span style="margin-left: 5px" class="blockid2"></span>&nbsp;:<span style="margin-left: 10px; font-weight: bold"></span></p><article id="blockparams"><table id="inpdef" class="paramlist" style="margin-bottom: 20px"><thead><th style="padding: 5px; width: 30%; background-color: #cccccc">Input</th><th style="padding: 5px; width: 70%; background-color: #cccccc">Description</th></thead><tbody></tbody></table><table id="paramdef" class="paramlist"><thead><th style="padding: 5px; width: 30%; background-color: #cccccc">Filter name</th><th style="padding: 5px; width: 70%; background-color: #cccccc">Option</th></thead><tbody></tbody></table></article></div>';
    
    $("#div"+b.id).remove();

    var thediv = $(div);
    thediv.attr("id", "div" + b.id);
    //console.log("b", b)
    //console.log("b id", b.id);
   
    if ($.isEmptyObject(QueryGen.template.conf[b.id].inputs)) {
        thediv.find("#inpdef").hide();
    } else {
        var inptbody = thediv.find("#inpdef tbody");
        var inputs = QueryGen.template.conf[b.id].inputs;

        for (var i in inputs) {
            var itr = $("<tr></tr>").data("input_id", i);
            var itd1 = $("<td style='text-align: center; font-weight: bold'>" + (parseInt(i)+1) + "</td>");
            var itd2 = $('<td><label style=" display: inline-block" for="tinput-name"><i>Name:</i></label></br><input type="text" id="tinput-name" /><br>'
                        +'<label style=" display: inline-block" for="tinput-descr"><i>Description:</i></label></br><input type="text" id="tinput-descr" /></td>');
            itd1.appendTo(itr);
            itd2.appendTo(itr);
            itd2.find("input:eq(0)").val(inputs[i].name);
            itd2.find("input:eq(1)").val(inputs[i].description);
            itr.appendTo(inptbody);
        }
    }

    var p = thediv.find("#blockinfo");
    p.children("span:eq(0)").text(b.id);
    if (b.button_cat == 'qent') {
        p.children("span:eq(1)").text(qent[b.button_id].name);
    } else
    if (b.button_cat == 'op') {
        if (b.button_id == 6) { // we wanna show the template name rather than just "Template"
            p.children("span:eq(1)").text(templates[b.template_id].name);
        } else {
            p.children("span:eq(1)").text(ops[b.button_id].name);
        }
    }

    $("#templbtn").before(thediv);
    
    var tdselect = "<td><select class='selparam template'><option value='0'>Do not use</option><option value='1'>Lock to current value</option><option value='2'>Leave blank</option></select></td>";
    var tdselect_predefList = "<td><select class='selparam template'><option value='0'>Do not use</option><option value='1'>Lock to current values (main+sub)</option><option value='2'>Leave blank</option><option value='3'>Lock to current values (main only)</option></select></td>";

    var tbody = thediv.find("#paramdef tbody");

    if (b.button_cat == 'qent') {
        var e = qent[b.button_id];
        for (var x in QueryGen.template.conf[b.id].parameters) {
            var tr = $("<tr class='param' id='f" + b.id + "-" + x + "'></tr>");
            var td1 = $("<td>"+e.filters[x].name+"</td>"); 
            var td2 = $(e.filters[x].type == 1 ? tdselect_predefList : tdselect);
            td2.find("select").data("f_id", x).data("b_id", b.id);
            td1.appendTo(tr);
            td2.appendTo(tr);
            tr.appendTo(tbody);
            td2.find("select").prop("selectedIndex", QueryGen.template.conf[b.id].parameters[x].opt);
            if (e.filters[x].type == 7){
                td2.find("select").prop('disabled', true);
            }
        }
    } else if (b.button_cat == 'op') {
        var o = ops[b.button_id];

        if (b.button_id == 5) { // genealogy id
            var tr = $("<tr class='param'></tr>");
            var td1 = $("<td>Genealogy ID list</td>");
            var td2 = $(tdselect);
            td2.find("select").data("b_id", b.id).data("f_id", 'genid');
            td2.find("option:eq(0)").attr("disabled", true);
            td1.appendTo(tr);
            td2.appendTo(tr);
            tr.appendTo(tbody);
            td2.find("select").prop("selectedIndex", QueryGen.template.conf[b.id].parameters['genid'].opt);
        
        } else if (b.button_id == 4) { // group by

                                        
            //var connBlock = QueryGen.getGraphNode(b.id).w_in[0];
            //var connBType = QueryGen.getGraphNode(connBlock).output_type_id;
            var connBType = getGraphNode(b.w_in[0]).output_type_id;
            
            var attr_list = qent[connBType].outputs;
            for (var x in QueryGen.template.conf[b.id].parameters) {
                var j = QueryGen.template.conf[b.id].parameters[x].index;
                var f = b.parameters[j];
                var name = f.op + "(" + (f.attr == -1 ? "*" : attr_list[f.attr].name) + ")";
                var tr = $("<tr class='param' id='f" + b.id + "-" + f.uid + "'></tr>");
                var td1 = $("<td>"+name+"</td>");
                var td2 = $(tdselect);
                td2.find("select").data("b_id", b.id).data("f_id", x);
                td2.find("option:eq(0)").attr("disabled", true);
                td1.appendTo(tr);
                td2.appendTo(tr);
                tr.appendTo(tbody);
                td2.find("select").prop("selectedIndex", QueryGen.template.conf[b.id].parameters[x].opt);
            }
        }

        if (b.button_id == 6) { // template
            var t = templates[b.template_id];
            for (var i = 0, ll = t.parameters.length; i < ll; ++i) {
                var f_id = i;
                var tr = $("<tr class='param' id='f" + b.id + "-" + x + "'></tr>");
                var td1 = $("<td>"+t.parameters[i].name+"</td>");
                var td2 = $(t.parameters[i].type == 1 ? tdselect_predefList : tdselect);
                td2.find("select").data("f_id", f_id).data("b_id", b.id);
                td1.appendTo(tr);
                td2.appendTo(tr);
                tr.appendTo(tbody);
                td2.find("select").prop("selectedIndex", QueryGen.template.conf[b.id].parameters[f_id].opt);
                if (t.parameters[i].type == 7){
                    td2.find("select").prop('disabled', true);
                }

            }
        }

    }
    tbody.find("tr.param td:nth-child(2)").each(function() {
        var f_id = $(this).find("select").data("f_id");

        var x = $('<span style="display: none"><br><label style="width: 80px; display: inline-block"><i>Name:</i></label></br><input type="text" /><br><label style="width: 80px; display: inline-block"><i>Description:</i></label></br><input type="text" /></span>')
        $(this).append(x);
        x.find("input:eq(0)").val(QueryGen.template.conf[b.id].parameters[f_id].name);
        x.find("input:eq(1)").val(QueryGen.template.conf[b.id].parameters[f_id].description);
    });
    tbody.find("select.selparam").change(function() {
        var v = $(this).val();

        if (v == 2 || v == 3) { // show "name" and "description" fields if "leave blank" or "lock to current value (main only)" is selected
            $(this).next().show();
        } else {
            $(this).next().hide();
        }
    }).change();

    
}


function changeTemplateForm(evt) {
    var next_id = QueryGen.template.curr_block_id;
    if (evt.data.dir == 1 && QueryGen.template.curr_block_id < QueryGen.template.blocks.length - 1)
        ++next_id;
    else if (evt.data.dir == -1 && QueryGen.template.curr_block_id > 0)
        --next_id;
    showTemplateForm(next_id);
    QueryGen.template.curr_block_id = next_id;
    if (QueryGen.template.curr_block_id == 0) {
        $("#prev-param").attr("disabled", true);
        $("#prev-param").addClass("disabled");
    } else {
        $("#prev-param").attr("disabled", false);
        $("#prev-param").removeClass("disabled");
    }
    if (QueryGen.template.curr_block_id == QueryGen.template.blocks.length - 1) {
        $("#next-param").attr("disabled", true);            
        $("#next-param").addClass("disabled");
    } else {
        $("#next-param").attr("disabled", false);
        $("#next-param").removeClass("disabled");
    }
}

function showTemplateForm(next_id) {
    

    // fill block id label
    var b = QueryGen.template.blocks[next_id];

    var currb_id = QueryGen.template.blocks[QueryGen.template.curr_block_id].id;

    var div1 = $("#div" + currb_id);
    var div2 = $("#div" + b.id);

    var dir1, dir2;
    if (currb_id < b.id) {
        dir1 = 'left';
        dir2 = 'right';
    } else {
        dir1 = 'right';
        dir2 = 'left';
    }
    div1.hide({effect: "slide", direction: dir1}); //, complete: function() {$(this).css("position", "");}});
    div2.show({effect: "slide", direction: dir2}); //, complete: function() {$(this).css("position", "");}});
    $("#definetempl-modal").modal("show");
}

function backToDesign() {
    // save current configuration
    for (var x in QueryGen.template.conf) {
        saveToTemplate(x);
    }
    QueryGen.template.in_template = false;

    //open modal with title and description
    $("#message-modal .modal-title").empty();
    $("#message-modal .modal-title").append("Template Reset");
    $("#message-modal .modal-body").empty();
    $("#message-modal .modal-body").prepend('<p>Do you really want to return to the query design. '
                        +'If yes you will lose all the settings and a new template will be defined.</br>'
                        +'Press "Confirm" to go back to query design, "Cancel" to continue in template definition.'
                        +'</p>');
    $("#message-modal #cancel").show();
    $("#myoverlay").css("display","block");
    $("#message-modal").attr("data-backdrop","false");
    $("#message-modal").modal("show");
    $(".modal-backdrop").hide();

}

function updateTemplateAndForm(bid) {
    saveToTemplate(bid);
    QueryGen.template.base_query = generateQueryDict();
    var b = QueryGen.jsonStrGraph[bid];
    generateTemplate(b);
    prepareTemplateForm(b);
    if (QueryGen.template.blocks[QueryGen.template.curr_block_id].id == bid) {
        changeTemplateForm({data: {dir: 0}});
    }
}


// ----------------------------------------------------------

/// ----------------------------------------------- MY FUNCTION

function buildTemplatesModal(){

    var node = ggen.currentSelectedNode();
    var qentid = node.config.button_cat=="qent" ? node.config.button_id :
                 node.config.button_cat=="qent" =="op" ? node.config.output_type_id : 1000; 
                                                                    //1000 placehilder for start node

    var templselection = '<select class="form-control" id="template-selection" >';
    
    Object.entries(templates).filter(d => { 
        
            return qentid == 1000 || //if start return everything
                ( d[1].isTranslator==false && d[1].inputs.map(f=>{return f.qent_id;}).includes(qentid) );
                     
        }).forEach(e => {
        if ($(e[1].WG).filter(workingGroupsList).length != 0 || $(e[1].WG).filter(["admin"]).length != 0){                         
        templselection += '<option value="'+e[0]+'">'
                    + e[1].name +'</option>';
        }
    });
    templselection += '</select>';
    $('#template-modal .modal-body').empty();
    $('#template-modal .modal-body').append(templselection);
    
    if($('#template-modal .modal-body option').length == 0){
        alert("No template available.");
    }else{
     //modal show
     $('#template-modal').modal('show');
    }
};



$(document).ready(function(){

    //add function to the start node 
    ggen.setCustomFunction(f_entity, 'start');

    //add function to other blocks
    ggen.setCustomFunction(f_entity, 'block',3);

    //add function to other blocks
    ggen.setCustomFunction(f_filter, 'block',1);

    //add function to end node
    ggen.setCustomFunction(f_translator, 'end',1);

    //to activate all the tooltip in the page
    $('[data-toggle="tooltip"]').tooltip();

    //hide context menu - toggle by some filters
    //$("#ctxmenu").hide(); ///better to do it immediately when dom is created

    //set clear all button in config filter dialog
    $('#filter-modal #clearall').on('click', d=>{
        $("#filter-modal .cfgchk").prop('checked', false).change();       
    });

    //see/modify title and description
    $("a#titledescr").on('click', d=>{
        $("#titledescr-modal").modal("show");
    });

    //submit
    $("a#submit").on('click', d=>{
        submitGraph();
    });   

    //clear workspace/remove graph
    $("a#clearall").on('click', d=>{
        ggen.clearGraph();
        ggen.addNode(type="start", title="+");
    });

    // save as translator
    //$('span#save_transl').click(QueryGen.submitGraphAsTranslator);
    $("a#savetransl").on('click', d=>{
        submitGraphAsTranslator();
    });

    //title and descr modal on hide
    $('#titledescr-modal').on('hidden.bs.modal', function(event) { 
        $('#titledescr-modal .tmp_msg').remove();
        $("#myoverlay").css("display","none");
        $("#titledescr-modal").attr("data-backdrop","true");
        $(".modal-backdrop").show();
    });

    //message modal cancel and confirm
    $("#message-modal #cancel").hide();
    $("#message-modal #cancel").on('click',d=>{
        $("#myoverlay").css("display","none");
        $(".modal-backdrop").show();
    });
    $("#message-modal #confirm").on('click',d=>{
        $("#myoverlay").css("display","none");
        $("#definetempl-modal").modal("hide");
        $("#message-modal #cancel").hide();
        $("#message-modal").modal("hide");
    });

    //Context modal cancel and confirm
    $("#context-modal #confirm").on('click',d=>{
        $("#myoverlay").css("display","none");
        $(".modal-backdrop").show();
        
        //take selected item
        var v = $("#context-modal input:checked"). val();
        var l = $("#context-modal input:checked").data('label');
        var menu = $("#context-modal .modal-body").data('target');

        toggleCorrelation(menu, v, l);
        
        $("#context-modal").modal("hide");
    });

    //save as template
    $("a#savetempl").on('click', d=>{
        startTemplateDefinition();
    });
    
    //buttons from Template definition modal
    $("#prev-param").click({dir: -1}, changeTemplateForm);
    $("#next-param").click({dir: 1}, changeTemplateForm);
    $("#definetempl-modal #confirm").on("click", submitTemplate);
    $("#definetempl-modal #cancel").click(backToDesign);


    //initialize template and GB tabs
    $("#templconfigtabs").tabs();
    $("#gbconfigtabs").tabs();

    //button from GB definition modal
    $("#gbitemadd-flt").click(function() {
        var next_uid = $("#gb-modal").data("next_uid");
        var gbItem = '<p class="gbitem"><select class="op"><option value="COUNT">COUNT</option><option value="SUM">SUM</option><option value="MIN">MIN</option><option value="MAX">MAX</option><option value="AVG">AVG</option></select>'
                +'<select></select><select class="rangeFrom"><option value=">"> &#x2265; </option><option value="="> = </option><option value="<"> &#x2264; </option></select><input class="rangeFrom" />'
                +'<span id="trattino"> - </span><select class="rangeTo"><option value="<"> &#x2264; </option></select><input class="rangeTo" /><span class="ui-icon ui-icon-closethick gbitemdel"></span></p>';
        var el = $(gbItem);
        var outs = $("#gb-modal").data("outs");
        var target = el.find("select:eq(1)");
        target.append($("<option value='-1'>*</option>"));
        
        for (var i in outs) {
            target.append($("<option value='"+i+"'>"+outs[i].name+"</option>"));
        }
        el.find("select:eq(0)").change(function() {$(this).next().children("option:eq(0)").toggle($(this).val() == 'COUNT').parent().prop("selectedIndex", -1);});
        el.find("select.rangeFrom").change(QueryGen.toggleStatus);
        el.find("span.gbitemdel").click(function() {$(this).parent().remove();})
        $("#gbconfig-flt-list").append(el);
        target.prop("selectedIndex", -1);
        // set filter uid
        el.data("uid", next_uid);
        $("#gb-modal").data("next_uid", next_uid + 1);
    });

    $("#gbitemadd-out").click(function() {
       var gbOut = '<p class="gbitem"><select class="op"><option value="COUNT">COUNT</option><option value="SUM">SUM</option><option value="MIN">MIN</option><option value="MAX">MAX</option><option value="AVG">AVG</option></select>'
                    +'<select></select></span><label style="margin-left: 30px">Name:</label><input type="text" /><span class="ui-icon ui-icon-closethick gbitemdel"></p>';
        var el = $(gbOut);
        var outs = $("#gb-modal").data("outs");
        var target = el.find("select:eq(1)");
        target.append($("<option value='-1'>*</option>"));
        for (var i in outs) {
            target.append($("<option value='"+i+"'>"+outs[i].name+"</option>"));
        }
        el.find("select:eq(0)").change(function() {$(this).next().children("option:eq(0)").toggle($(this).val() == 'COUNT').parent().prop("selectedIndex", -1);});
        el.find("span.gbitemdel").click(function() {if (!$(this).hasClass("noRemove")) {$(this).parent().remove();} else {alert("Output is in use by next block.", "Cannot delete");}})
        $("#gbconfig-out-list").append(el);
        target.prop("selectedIndex", -1);
    });

    //open help
    $("a#help").on('click', d=>{
        $("#message-modal .modal-title").empty();
        $("#message-modal .modal-title").append("Help");
        $("#message-modal .modal-body").empty();
        $("#message-modal .modal-body").append('<p>'
            +'Choose a button from the <b>Entities</b> panel, then move the cursor on the <b>'
            +'Dataflow Drawing</b> area. Click anywhere in the area and a query block will appear.'
            +'<br><br>Place all the blocks you want. You can destroy a block by clicking on '
            +'<span class="ui-icon ui-icon-closethick" style="position: relative; top: 3px"></span>.'
            +' Click on <span class="ui-icon ui-icon-wrench" style="position: relative; top: 3px">'
            +'</span> to open a dialog box with the filtering parameters.<br><br>'
            +'You can connect two blocks by dragging a terminal over another terminal,'
            +' from output to input. Some blocks cannot be connected together. Before clicking'
            +' <b>Submit</b>, make sure that all the blocks are connected, including Start and End.'
            +'</p> '      
        );

        $("#message-modal").modal("show");
       
    });


    $('#entity-modal #confirm').on('click', e =>{
        console.log("confirmed!");

        var selected = $('#tabs input:radio:checked').val();
        var node = ggen.currentSelectedNode();
        var insertNode = true;
        var nodeclass = "operators";

        if(selected != undefined){
            if(selected==0){
                
                
                var nend = ggen.connectNodeToEnd(node);
                if(nend == false){
                    //there is already a node connected to end
                    var msg = "a node is already connected to End.";
                    alert(  msg, "Cannot continue", "Ok");
                }else{
                    nend.config.translators = [];
                }
                insertNode = false;

            }else if(selected > 99){
                var op = ggen.getAvailableOperators()[selected-100];
               
                ggen.addArc(node, op);
                insertNode = false;

                //update configuration
                //output type id e conn:inputs
               // op.config.conn_inputs.push(true);
               if(!op.input.length==4){
                    op.config.output_type_id = op.parent[0].config.output_type; 
                    op.config.conn_inputs=[true,true];
               }


            }else{
                var name, type, nodedata;

                var nodeconfig = {
                        button_cat: "",
                        button_id: -1,
                        output_type_id: undefined,
                        outputs: [],
                        parameters: [],
                        query_path_id: null,
                        w_in: [],
                        w_out: []
                    };
                 
                if(selected > 7 ){  //qent
                    name = qent[selected].name;
                    nodeclass = qent[selected].dslabel;
                    type = 'block';
                    nodedata = qent[selected];
                    nodeconfig.button_cat="qent";
                    nodeconfig.button_id = parseInt(selected);
                    nodeconfig.output_type_id = parseInt(selected);

                    //check that Qent can be attached to node
                    // -----------------------
                    if (node.type != "start") {
                        var currBType = selected;
                        var connBType = node.config.button_id;
                        var connBOutType = node.config.output_type_id;
                        var connBCat = node.config.button_cat;

                        if (connBType == 7) { // extend
                            insertNode = connBOutType != undefined;
                            var msg = "Please configure the extend block first.";
                            if (insertNode) {
                                insertNode = GUI.isCompatible(currBType, connBOutType);
                                msg = "The extend operator's output entity " + GUI.getButtonName(connBOutType) + " may not be connected to " + GUI.getButtonName(currBType);
                            }
                        } else if (connBType == 6) { // template
                            insertNode = GUI.isCompatible(currBType, connBOutType);
                            var msg = GUI.getButtonName(currBType) + " and " + GUI.getButtonName(connBOutType) + " may not be connected";
                        } else if (connBType == 5) { // genid
                            insertNode = qent[currBType].genid_prefilter == true;
                            var msg = GUI.getButtonName(currBType) + " does not support genealogy ID pre-filtering.";
                            if (insertNode && connBOutType != undefined) {
                                insertNode = GUI.isCompatible(currBType, connBOutType);
                                msg = "Genealogy ID's predecessor " + GUI.getButtonName(connBOutType) + " may not be connected to " + GUI.getButtonName(currBType);
                            }

                        } else if (connBType == 4) { // group by
                            insertNode = connBOutType != undefined;
                            var msg = "Please configure the group by block first.";
                            if (insertNode) {
                                insertNode = GUI.isCompatible(currBType, connBOutType);
                                msg = "Group by's output entity " + GUI.getButtonName(connBOutType) + " may not be connected to " + GUI.getButtonName(currBType);
                            }

                        } else if (connBType <= 3 && connBType >= 1) { // logical operator
                            insertNode = connBOutType != undefined;
                            var msg = "Please connect some entity to the " + ops[connBType].name + " operator first.";
                            if (insertNode) {
                                insertNode = GUI.isCompatible(currBType, connBOutType);
                                var msg = GUI.getButtonName(currBType) + " and " + GUI.getButtonName(connBOutType) + " may not be connected";
                            }
                        }
                        
                        if (insertNode == false) 
                            alert(  msg, "Cannot continue", "Ok");

                    }
                    // ------------------

                }else if(selected >0 ){ //operator

                    name = ops[selected].name;
                    type = ops[selected].numInputs==2 ? 'operator' : 'block';
                    nodedata = ops[selected];
                    nodeconfig.button_cat="op";
                    nodeconfig.button_id = parseInt(selected);
                    if(selected!=4 && selected!=7) //not for GB and Extend
                        nodeconfig.output_type_id = node.config.output_type_id;
                    //nodeconfig.conn_inputs=[];
                    //nodeconfig.conn_inputs.push(true);
                    
                    if(ops[selected].name=='Template'){
                        buildTemplatesModal();
                        insertNode=false;
                    }else if(selected == 7){    //Extend

                        // ------------------ check that Extend can be attached to node
                        //node is the future parent node
                        var connBType = node.config.button_id;
                        var connBCat = node.config.button_cat;
                        var connBOutType = node.config.output_type_id;
            
                        if (connBCat == "qent") { // entity
                            insertNode = GUI.getManyToOneRelationships(connBOutType).length > 0;
                            var msg = GUI.getButtonName(connBOutType) + " cannot be extended with attributes from other entities.";

                        } else if (connBCat == "op") {
            
                            if (connBType == 7) { // extend
                                insertNode = false;
                                var msg = "Extend operators cannot be chained."
                            } else if (connBType == 6) { // template
                                insertNode = GUI.getManyToOneRelationships(connBOutType).length > 0;
                                var msg = GUI.getButtonName(connBOutType) + " cannot be extended with attributes from other entities.";
                            } else if (connBType == 5) { // genid
                                insertNode = false;
                                var msg = "The Genealogy ID operator may not be connected to the Extend operator.";
                            } else if (connBType == 4) { // group by
                                insertNode = connBOutType != undefined;
                                var msg = "Please configure the group by block first.";
                                if (insertNode) {
                                    insertNode = GUI.getManyToOneRelationships(connBOutType).length > 0;
                                    msg = "Group by's output entity " + GUI.getButtonName(connBOutType) + " cannot be extended with attributes from other entities.";
                                }
            
                            } else if (connBType <= 3 && connBType >= 1) { // logical operator
                                insertNode = connBOutType != undefined;
                                var msg = "Please connect some entity to the " + ops[connBType].name + " operator first.";
                                if (insertNode) {
                                    insertNode = GUI.getManyToOneRelationships(connBOutType).length > 0;
                                    msg = GUI.getButtonName(connBOutType) + " cannot be extended with attributes from other entities.";
                                }
                            }
                        }
                        if (insertNode == false) 
                            alert(  msg, "Cannot continue", "Ok");
                        // ------------------
                    }else if(selected == 5){ //genid
                        // ------------------ check genid
                        // see function new_Handle_Genid_AddEvent: in querygen.js
                        // ------------------
                    }else if(selected == 4){ //GB
                        // ------------------ check GB
    
                        connBType = node.config.button_id;
                        connBCat = node.config.button_cat;
                        connBOutType = node.config.output_type_id;
        
                        if (connBCat == "qent") { // entity
                            insertNode = GUI.getManyToOneRelationships(connBOutType).length > 0;
                            var msg = GUI.getButtonName(connBOutType) + " does not allow grouping operations.";
                        } else
        
                        if (connBCat == "op") {
        
                            if (connBType == 7) { // extend
                                insertNode = connBOutType != undefined;
                                var msg = "Please configure the extend block first.";
                                if (insertNode) {
                                    insertNode = GUI.getManyToOneRelationships(connBOutType).length > 0;
                                    msg = "The extend operator's output entity " + GUI.getButtonName(connBOutType) + " does not allow grouping operations.";
                                }
        
                            } else
        
                            if (connBType == 6) { // template
                                insertNode = GUI.getManyToOneRelationships(connBOutType).length > 0;
                                var msg = GUI.getButtonName(connBOutType) + " does not allow grouping operations.";
                            } else
        
                            if (connBType == 5) { // genid
                                insertNode = false;
                                var msg = "The Genealogy ID operator may not be connected to the group by operator."
                            } else
        
                            if (connBType == 4) { // group by
                                insertNode = connBOutType != undefined;
                                var msg = "Please configure the group by block first.";
                                if (insertNode) {
                                    insertNode = GUI.getManyToOneRelationships(connBOutType).length > 0;
                                    msg = "Group by's output entity " + GUI.getButtonName(connBOutType) + " does not allow grouping operations.";
                                }
        
                            } else
        
                            if (connBType <= 3 && connBType >= 1) { // logical operator
                                insertNode = connBOutType != undefined;
                                var msg = "Please connect some entity to the " + ops[connBType].name + " operator first.";
                                if (insertNode) {
                                    insertNode = GUI.getManyToOneRelationships(connBOutType).length > 0;
                                    msg = GUI.getButtonName(connBOutType) + " does not allow grouping operations.";
                                }
                            }
                        }
    
                        if (insertNode == false)
                            alert(  msg,"Cannot continue","Ok");
                        // ------------------
                    }else{
                        //------- check operators
                                            
                        var connBCat = node.config.button_cat;
                        var connBType = node.config.button_id;
                        var connBOutType = node.config.output_type_id;
      
                        if (connBCat == "op") {
        
                            if (connBType == 7) { // extend
                                var insertNode = false;
                                var msg = "The extend operator may not be connected to the " + GUI.getButtonName(selected, "op") + " operator.";
                            }  else if (connBType == 5) { // genid
                                var insertNode = false;
                                var msg = "The " + GUI.getButtonName(currBType, "op") + " operator does not support genealogy ID pre-filtering.";
                            } else
        
                            if (connBType == 4) { // group by
                                var insertNode = connBOutType != undefined;
                                var msg = "Please configure the group by block first.";
                            } 
                        }
                    
        
                    if (insertNode == false)
                        alert(  msg, "Cannot continue", "Ok");
                      // -----------
                    }
                    

                }

                //insert node (with the exception of templates and end)
                if(insertNode)        
                    var n1 = ggen.addNode(type=type, title=name, parent = node, nodeclass=nodeclass);
                if(insertNode && n1!=undefined){
                    n1.data = nodedata;
                    n1.config = nodeconfig;
                }
                    
            
            }
        }
        $('#entity-modal').modal('hide');
    });


    $('#template-modal #confirm').on('click', e =>{
        console.log("confirm template modal");
        var selected = $('#template-selection option:selected').val(); 
        var node = ggen.currentSelectedNode();
        
        if(selected != undefined){
            var temp = templates[selected];
            var type = "block";

            var nodeconfig = {
                button_cat: "op",
                button_id: 6,
                id:-1,
                output_type_id: temp.output,
                outputs: temp.outputsList,
                parameters: [],
                query_path_id: [undefined],
                template_id:selected,
                w_in: [],
                w_out: []
            };
            var nodeclass = "operators";
            if(temp.inputs.length==4)
                var n1 = ggen.addNode(type=type, title=temp.name, parent=node, nodeclass=nodeclass, temp.inputs.length);
            else
                var n1 = ggen.addNode(type=type, title=temp.name, parent=node, nodeclass=nodeclass);

            nodeconfig.id=n1.id;
            nodeconfig.w_in.push(node);

            if(n1!=undefined){
                n1.data = temp;
                n1.config = nodeconfig;
            }

        }

        $('#template-modal').modal('hide');
      });
 
    $('#filter-modal #confirm').on('click', e =>{
        console.log("confirm filter modal"); 
        var node = ggen.currentSelectedNode();

        //take outputs selected and insert them in configuration
        /*
        var selected = Object.values($('#output-selection input:checked'));
        selected.forEach( s => {
            if(s.value!=undefined)
                node.config.outputs.push(s.value);
        });
        */

        //take filters selected and insert them in configuration

        // save parameters
        var params = [];

        //var selected = Object.values($('#filter-selection input:checked'));

        var checkboxes = $("#filter-modal .cfgchk:checked");
        
        var subfilters = $("#filter-modal td.cfgval1").filter(function() {return $(this).data("enabled")});
        checkboxes.add(subfilters).each(function() {

        var f_id = $(this).attr('data-f_id');
        var cfgval = $("#filter-modal #cfgval"+f_id);
        var f_type = cfgval.data("f_type");

        var v_list = [];
        
        if (cfgval.data("par_flt_id")) {
            var par_flt_id = cfgval.data("par_flt_id");
            var par_flt_value = cfgval.data("par_flt_value");
        } else {
            var par_flt_id = null;
            var par_flt_value = null;
        }
        
        if (f_type == 1 || f_type == 6 || f_type == 7) { // predefined list or boolean
            
            cfgval.find("input.par"+f_id+":checked").each(function() {
                v_list.push($(this).val());
            });
            
                                
        } else if (f_type == 2 || f_type == 3) { // date or numeric
                                
            var val;
            // "mi" stands for "menu item"
            var mi0 = $(".corr"+f_id+":eq(0)").data("menu-item");
            var mi1 = $(".corr"+f_id+":eq(1)").data("menu-item");
            var notEmpty;

            if (mi0 != 0) {
                val = 'c' + cfgval.children("select.rangeFrom").val() + mi0 + '+' + cfgval.find("input[type=number]:eq(0)").val();
                notEmpty = true;
            } else {
                val = 'u' + cfgval.children("select.rangeFrom").val() + cfgval.children("input.rangeFrom").val().trim();
                notEmpty = val.length > 2;
            }
            if (notEmpty) v_list.push(val);

            if (!cfgval.children('select.rangeTo').prop('disabled')) {
                if (mi1 != 0) {
                    val = 'c' + cfgval.children("select.rangeTo").val() + mi1 + '+' + cfgval.find("input[type=number]:eq(1)").val();
                    notEmpty = true;
                } else {
                    val = 'u' + cfgval.children("select.rangeTo").val() + cfgval.children("input.rangeTo").val().trim();
                    notEmpty = val.length > 2;
                }
                if (notEmpty) v_list.push(val);
            }
                                
        } else if (f_type == 5) { // text with or without autocomplete
                                
            var mi = $(".corr"+f_id).data("menu-item");

            var v_list = [];
            if (mi == 0) {
                if (cfgval.data("multiValued") == true) {
                    v_list = $("#filter-modal #addvalue"+f_id).boxlist("getValues").map(function(x) {return 'u'+x});
                } else {
                    var x = 'u' + $("#filter-modal #addvalue"+f_id).val();
                    if (x.length > 1) {
                        v_list.push(x);
                    }
                }
            } else {
                v_list.push('c' + mi);
            }
        } else if (f_type == 4){ // genid
            v_list = $("#filter-modal #fullgenid" +f_id ).boxlist("getValues");
        }
       
        if (v_list.length > 0) {
            var dic = {'f_id':f_id, 'values': v_list};
            if (par_flt_id != null) {
                $.extend(dic, {'par_flt_id': par_flt_id, 'par_flt_value': par_flt_value});
            }
            params.push(dic);
            console.log(params);
        }
                                
    });
 
    node.config.parameters = params;   

    /*
    if (node.config.parameters.length > 0) {
        $("p#box"+block_id).children("span#led").removeClass("filteroff").addClass("filteron");
    } else {
        $("p#box"+block_id).children("span#led").removeClass("filteron").addClass("filteroff");
    }
*/
    // save input
/*
    var paths = $("#filter-modal #config-in-list input");
    // if previous entity is the same as the current one, then there is no path in the input tab -- this case is handled separately even in the query engine
    if (paths.length > 0) {
        var query_path_id = paths.filter(":checked").val();
        node.config.query_path_id = query_path_id;  
    }
*/
    //save outputs
    var outs = [];
    var selected = Object.values($('#output-selection input:checked'));
    selected.forEach( s => {
        if(s.value!=undefined)
            outs.push(s.value);
    });
    //$("#filter-modal #config-out-list input:checked").each(function() {outs.push($(this).val());});
    
    var old_outs = node.config.outputs;
    // delete outputs that have been de-selected
    for (var i = 0; i < old_outs.length; ++i) {
        if (outs.indexOf(old_outs[i]) == -1) {
            old_outs[i] = undefined;
        }
    }
    // append new outputs
    for (var i = 0; i < outs.length; ++i) {
        if (old_outs.indexOf(outs[i]) == -1) {
            old_outs.push(outs[i]);
        }
    }
        
        $('#filter-modal').modal('hide');
    });


    $('#extend-modal #confirm').on('click', e =>{
        console.log("confirm Extend modal"); 
        var node = ggen.currentSelectedNode();

        // take outputs selected and insert them in configuration 
        // save selected outputs

        var out = [];
        $("#extend-modal #ent-list input.out:checked").each(function() {
            var out_id = $(this).val();
            var par_input_el = $(this).parent().parent().prev().prev().prev();
            if (par_input_el.prop("checked") == true) {
                var ent_id = par_input_el.data("toentity");
                var qp_id = par_input_el.val();
                out.push([ent_id, out_id, qp_id]);
            }
        });
        
        //var old_outs = QueryGen.getGraphNode(block_id).outputs;
        //var old_params = QueryGen.getGraphNode(block_id).parameters;
        var old_outs = node.config.outputs;
        var old_params = node.config.parameters;

        // delete stale outputs
        for (var i = 0; i < old_params.length; ++i) {
            var p = old_params[i];
            if (p != undefined && p.query_path_id != "self") {
                // look for p in out
                var found = false;
                for (var j = 0; found == false && j < out.length; ++j) {
                    if (out[j][2] == p.query_path_id && out[j][1] == p.out_id) {
                        found = true;
                    }
                }
                if (found == false) {
                    old_outs[i] = undefined;
                    old_params[i] = undefined;
                }
            }
        }

        // delete trailing undefined entries
        for (var l = old_outs.length-1; l >= 0; --l) {
            if (old_outs[l] == undefined) {
                --old_outs.length;
                --old_params.length;
            } else {
                break;
            }
        }

        // add new outputs
        for (var i = 0; i < out.length; ++i) {
            var o = out[i];
            // look for o in old_params
            var found = false;
            for (var j = 0; found == false && j < old_params.length; ++j) {
                if (old_params[j] != undefined) {
                    if (old_params[j].query_path_id == o[2] && old_params[j].out_id == o[1]) {
                        found = true;
                    }
                }
            }
            if (found == false) {
                old_outs.push("e" + qent[o[0]].name + "_" + qent[o[0]].outputs[o[1]].name); // "e" stands for "extended entity"
                old_params.push({query_path_id: o[2], out_id: o[1]});
            }
        }

        if (out.length > 0) {
/*
            $("p#box"+block_id).children("span#led")
                               .removeClass("filteroff2")
                               .addClass("filteron");
*/
            // update output type
            //QueryGen.setGraphNodeAttr(block_id, "output_type_id", connBType);
    
            var connBType = node.parent[0].config.output_type_id;
            node.config.output_type_id = connBType;
        } else {

/*
            $("p#box"+block_id).children("span#led")
                               .removeClass("filteron")
                               .addClass("filteroff2");
           // disconnect out wire
           outTerminal.removeAllWires();
*/

           // update output type
            //QueryGen.setGraphNodeAttr(block_id, "output_type_id", undefined);

            node.config.output_type_id = undefined;
            // if template mode is on, close it, since extend block needs configuration
            if (QueryGen.template.in_template) {
                backToDesign();
            }
        }
       
        
        $('#extend-modal').modal('hide');
    });

    $('#gb-modal #confirm').on('click', e =>{
        console.log("confirm Extend modal"); 
        var node = ggen.currentSelectedNode();

        var gb_attr = $('#gb-modal select#selattr').val();
        var gb_cnt = $("#gb-modal input#addnum").val();
        if (gb_cnt == '') {
            alert("Please specify a counting condition.", "Oops!");
        } else {
            
            // save filters
            var flt = [];

            $("#gb-modal #gbconfig-flt-list p.gbitem").filter(function() {
                    return $(this).children("select:eq(1)").val()!=null
                }).each(function() {
                    var values = [];
                    var v = $(this).children(":eq(3)").val();
                    if (v != "") values.push('u' + $(this).children(":eq(2)").val() + v);
                    v = $(this).children(":eq(6):enabled").val();
                    if (v && v != "") values.push('u' + $(this).children(":eq(5)").val() + v);
                    if (values.length == 0) return;
                    var f = {};
                    f.op = $(this).children(":eq(0)").val();
                    f.attr = $(this).children(":eq(1)").val();
                    f.values = values;
                    f.uid = $(this).data("uid");
                    flt.push(f);
                });

            node.config.parameters  = flt;
            //QueryGen.setGraphNodeAttr(block_id, "parameters", flt);

            if (flt.length > 0) {
                $("p#box"+node.id).children("span#led").removeClass("filteroff2").addClass("filteron");
                // save group-by entity
                //QueryGen.setGraphNodeAttr(block_id, 'gb_entity', gb_attr);
                node.config.gb_attr = flt;

                // non serve più: QueryGen.setGraphNodeAttr(block_id, 'connBlock', GUI.getButtonName(connBType));
                //QueryGen.setGraphNodeAttr(block_id, "output_type_id", parseInt(gb_attr));
                node.config.output_type_id  = parseInt(gb_attr);

            } else {
                $("p#box"+node.id).children("span#led").removeClass("filteron").addClass("filteroff2");
                // if template mode is on, close it, since group by block needs configuration
                if (QueryGen.template.in_template) {
                    backToDesign();
                }
            }

            // save outputs
            var out = [];
            $("#gb-modal #gbconfig-out-list p.gbitem").filter(function() {
                    return $(this).children("select:eq(1)").val()!=null
                }).each(function() {
                    var attr = $(this).children(":eq(1)").val();
                    if (attr == null) return;
                    var o = {};
                    o.op = $(this).children(":eq(0)").val();
                    o.attr = attr;
                    var name = $(this).children(":eq(3)").val();
                    if (name == "") {
                        name = o.op + "(" + $(this).children(":eq(1)").children("option:selected").text() + ")";
                    }
                    o.name = name;
                    out.push(o);
                });

            //var old_outs = QueryGen.getGraphNode(block_id).outputs;
            var old_outs = node.config.outputs;

            // delete outputs that have been deleted
            for (var i = 0; i < old_outs.length; ++i) {
                if (old_outs[i] != undefined) {
                    if (out.filter(function(e) {
                            return e.op == old_outs[i].op && e.attr == old_outs[i].attr;
                        }).length == 0) {
                        old_outs[i] = undefined;
                    }
                }
            }
            // append new outputs
            for (var i = 0; i < out.length; ++i) {
                var thisOut = old_outs.filter(function(e) {
                        return e != undefined && e.op == out[i].op && e.attr == out[i].attr;
                    });
                if (thisOut.length == 0) {
                    old_outs.push(out[i]);
                } else {
                    if (thisOut[0].name != out[i].name) {
                        thisOut[0].name = out[i].name;
                    }
                }
            }
            /*
            if (old_gb_attr != gb_attr) {
                outTerm.removeAllWires();
            }
            */
            // save input
            var query_path_id = $("#gb-modal #gbconfig-in-list input:checked").val();
            //QueryGen.setGraphNodeAttr(block_id, 'query_path_id', query_path_id);
            node.config.query_path_id = query_path_id;

            // if template mode is on, update template
            if (QueryGen.template.in_template == true) {
                updateTemplateAndForm(block_id);
            }

        }        
        
        $('#gb-modal').modal('hide');
    });

    $('#translator-modal #confirm').on('click', e =>{
        console.log("confirm Translator modal"); 
        var node = ggen.currentSelectedNode();

        var trans = [];
        $("#translatorslist input:checked").each(function() {
            trans.push($(this).val());
        });
        
        node.config.translators = trans;
        //QueryGen.setGraphNodeAttr("end", "translators", trans);
        
        $('#translator-modal').modal('hide');
    });

    

});



