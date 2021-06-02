var tablename = "Case"; //schema name
var rowCount = 1000; // max rows to export

function download(filename, text) {
	var element = document.createElement('a');
	element.setAttribute('href', 'data:text/plain;charset=utf-8,' + encodeURIComponent(text));
	element.setAttribute('download', filename);

	element.style.display = 'none';
	document.body.appendChild(element);

	element.click();

	document.body.removeChild(element);
}

if (!Date.prototype.toSQLString) {
    (function() {

        function pad(number) {
            if (number < 10) {
                return '0' + number;
            }
            return number;
        }

        Date.prototype.toSQLOString = function() {
            return this.getUTCFullYear() +
                '-' + pad(this.getUTCMonth() + 1) +
                '-' + pad(this.getUTCDate()) +
                ' ' + pad(this.getUTCHours()) +
                ':' + pad(this.getUTCMinutes()) +
                ':' + pad(this.getUTCSeconds());
        };
    }());
}
var select = Ext.create("Terrasoft.EntitySchemaQuery", {
	rootSchemaName: tablename
});
select.allColumns = true;
select.rowCount = rowCount;
select.getEntityCollection(function(result) {
	if (result.success) {
		var script = "";
		result.collection.each(function(item) {
			
            var insertStr = "INSERT INTO [" + tablename + "] ( ";
			
			for(var el in item.values) { 
                var name = el;
                var value = item.values[el]
                if(value && value.value){ 
                    value = value.value;
                    if(name != "Id"){
                        name += "Id";
                    }
                }
				if(value){
					insertStr += "[" + name + "],";
				}
				
			}
			insertStr = insertStr.slice(0, -1);
			insertStr += ")\r\nVALUES (";
			
			for(var el in item.values) {
                var value = item.values[el];
				
				if(value && value.value){ 
                    value = value.value;
                }
				
                var valueType = typeof value;
				
				if(value){
					switch (valueType) {
						case "string":
							value = "'" + value + "'"
							break;
						case "number":
							break;
						case "boolean":
							value = 0 + value
							break;
					}
					if(value === null){ value = "NULL"; }
					
					if(valueType == "object" && typeof value.getMonth === 'function'){
						value = "'" + value.toSQLOString() + "'";
					}
					insertStr += value + ",";
				}
            }
			insertStr = insertStr.slice(0, -1);
			insertStr += ");\r\n\r\n";
			script += insertStr; 
		});
		
		download(tablename+"_insert.sql", script);
	}
}, this);
