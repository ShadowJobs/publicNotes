 /************************************************************************
   Action Viewer
 ************************************************************************
此脚本的主要功能是按照既定的规则，将ps文件中包含的图片导出，并记录图片及其内部的相关信息。
在ps文件的路径下会创建一个以ps文件名命名的目录，目录中保存所有图片。同时会有一个同样名字的.animxml文件，用来保存所有相关数据；具体规则查看下面的代码
 ************************************************************************/
 
/*origin part************************************************************************/

$.level = 1;//todo: ?

var toolVersion = "psdAnimToolv0.5"; //工具版本号
var scriptName = "BannerGenator"; //todo: ?
var deaultScalePixToPoint =2;

var global_buttons_dict ={};
global_buttons_dict["isInited"] = false;
function processOneFile()
{

var renameLibCount =1;
   
var originalUnit = preferences.rulerUnits;
app.preferences.rulerUnits = Units.PIXELS

var doc = app.activeDocument;
var docPath = new String(doc.fullName);
var docFileObject = new File(docPath);

var fileName = docPath.split("/").pop();
var rootPath = docPath.substring(0, docPath.lastIndexOf("/") + 1);

function removeMultSpaceInStr(str)//用英文空格替换字符串中所有的中文空格
{
	str = str.replace(/　/g, " ");
	while(str.indexOf("  ")>=0)
	{
		str = str.replace(/  /g, " ");
	}
	return str;
}

if(!global_buttons_dict["isInited"] )
{
	var assetRootIndex = docPath.lastIndexOf("anim/ui/");
	if(assetRootIndex>0)
	{
		var buttonListRootUrl = docPath.replace( docPath.split("anim/ui/").pop(), "");
		var buttonListFolder = new Folder( buttonListRootUrl);
		var buttonListFiles = buttonListFolder.getFiles("global_buttons.list");
		if(buttonListFiles != null && buttonListFiles.length ==1)
		{
			var buttonListFile = buttonListFiles[0];
			buttonListFile.open("r");
			var buttonListStr =  buttonListFile.read();
			buttonListFile.close();
			buttonListStr = removeMultSpaceInStr(buttonListStr);
			var buttonNameArr = buttonListStr.split(",");
			for(var i =buttonNameArr.length -1 ;i>=0 ;i--)
			{
				global_buttons_dict[buttonNameArr[i]] = true;	
			}
			global_buttons_dict["isInited"] = true;
		}
	}
}

var nochangeSinceLastTime = false;
var isTheNewToolVersion = false;
var rootFolder = new Folder( rootPath);
if (rootFolder.exists) 
{
	var processFileName =fileName;
	processFileName = processFileName.replace(/　/g, " ");
	processFileName = processFileName.replace(/ /g, " ");
	var nameSplitArr = processFileName.split(".");
	if(nameSplitArr.length == 3)
	{
		var oldfileName = fileName;
		fileName = nameSplitArr[1]+"."+nameSplitArr[2];
		docPath= docPath.replace(oldfileName,fileName);
	}
	else
	{
	
		var nameFiles = rootFolder.getFiles("*.name");
		if(nameFiles != null)
		{
			if(nameFiles.length ==1)
			{
				var oneNameFile = nameFiles[0];
				var oldfileName = fileName;
				fileName =oneNameFile.name.replace(".name",".psd");
				docPath= docPath.replace(oldfileName,fileName);
			}
			else if(nameFiles.length > 1)
			{
				alert("有两个.name文件");
			}
		}
	}

    var animXmlFiles = rootFolder.getFiles(fileName.replace(".psd",".animxml"));
    if(animXmlFiles != null && animXmlFiles.length ==1)
    {
        var animXml = animXmlFiles[0];
        animXml.open("r");
        var animXmlStr =  animXml.read();
        animXml.close();
        
        var fileUpdateTime = getKeyValueFromXmlStr(animXmlStr,"fileUpdateTime");
        var docUpdateDate  =docFileObject.modified;
        
        if(fileUpdateTime != null && fileUpdateTime == String(docUpdateDate.getTime()) )
            nochangeSinceLastTime = true;
        
        var toolVer = getKeyValueFromXmlStr(animXmlStr,"animToolVer");
        if(toolVer != null && toolVer ==toolVersion )
            isTheNewToolVersion = true;
        
	}
}

if(nochangeSinceLastTime && isTheNewToolVersion)
{
        return ;
}

function getKeyValueFromXmlStr(xml,keyStr)
{
   var mStart = xml.indexOf(keyStr+"__");
   var mEnd =xml.indexOf("__"+keyStr);
   if(mStart<0 || mEnd<0)
     return null;
   else
     return xml.substring(mStart+keyStr.length+2,mEnd);
}
 



var animRootUrl = docPath.replace(docPath.split("/anim/").pop(),"");
var xmlFolderUrl = docPath.replace(fileName,"");;//animRootUrl;//animRootUrl.replace("/Assets/","/Resources/asset/");
var xmlFileUrl =  xmlFolderUrl  +"/"+ fileName.replace(".psd",".animxml")
var fileNamePre = fileName.replace(".psd","");
var basePath = rootPath + fileNamePre;//"image";
var isNotGlobalFile =true;
if(fileName.toLowerCase().indexOf("global")==0)
{
	isNotGlobalFile = false;
}	
	
var clickedDialogLayerIndex = 0;    
var rowHeight = 20;
var layersHeight;
var totalHeight;
var dialogHeight;

var exportLayers = [];
var exportLayerOriginSelectIndex =[];
var exportLayerOriginNames =[];
var exportLayerNames = [];
var displayLayerNames = [];
var maskLayers ={};
var maskBounds={};


var allowSaveCharMin = "a".charCodeAt(0);
var allowSaveCharMax = "z".charCodeAt(0);
var allowSaveCharBigMin = "A".charCodeAt(0);
var allowSaveCharBigMax = "Z".charCodeAt(0);

var needSaveLayersCounts = [];
var needSaveLayersLibnameSet = {};

var layers0 = [];
var layers1 = [];
var layers01 = [];
var currentLayers;

var dialog;
var deepPreArr =[];

var dataFile = new File(basePath + "/log.txt");
    dataFile.encoding = "UTF8";
    dataFile.open( "w", "TEXT", "????" );
	dataFile.write("\uFEFF"); 
	
var dateCur = new Date();
var lastMS = (new Date).getTime();//dateCur.UTC();	

var pngExportPath = ""; 

//******************************************
//for animXml
var symbolLib = {};
var libItemsDict= {};

//******************************************

function getCurrentMS(strPre)
{
	return;
	
	var curMS = (new Date).getTime();
	dataFile.write(strPre,",ms:",curMS,":",curMS- lastMS,"\n");
	lastMS = curMS;
}


function getDeepPreStr(deep)
{
	var deepPreStr = deepPreArr[deep]
	if(deepPreStr == null)
	{
		deepPreStr = "";
		for(var i=0; i< deep;i++)
		{
			deepPreStr+="    ";
		}
		deepPreArr[deep]= deepPreStr;
	}
	else
	{
		deepPreStr =deepPreArr[deep];
	}
	return deepPreStr;	
}
function checkIsAllowSaveName(strName)
{
	var selfNameSave = false;
	var firstCharCode = strName.charCodeAt(0);
	if ( (firstCharCode >= allowSaveCharMin && firstCharCode <= allowSaveCharMax) || (firstCharCode >= allowSaveCharBigMin && firstCharCode <= allowSaveCharBigMax) )
	{
			selfNameSave = true;
	}
	
	return selfNameSave;
}

function getTypeStrFromLibName(libName)
{
	var lowerCaseLibName =libName.toLowerCase();
	if(lowerCaseLibName.indexOf("btn") ==0)
	{
		return "Button"
	}
	else if(lowerCaseLibName.indexOf("txt") ==0)
	{
		return "Text"
	}
	else if(lowerCaseLibName.indexOf("ntxt") ==0)
	{
		return "NumberText"
	}
	else if(lowerCaseLibName.indexOf("itxt") ==0)
	{
		return "InputText"
	}
	else if(lowerCaseLibName.indexOf("rct_") ==0)
	{
		return "Rect"
	}
	else if(lowerCaseLibName.indexOf("flamv") ==0)
	{
		return "MovieClip"
	}
	else
	{
		return "SimpleSprite"
	}
}
/*
		element_symbol =1,
		element_bitmap =2,
		element_shape =3,
		element_text =4,
		element_movieclip =5,
		element_simplesprite =6,
		element_button=7
*/		
function getTypeIntFromTypeStr(typeStr)
{
	var typeInt;
	switch(typeStr)
	{
		case "Symbol" :
			typeInt = 1;
			break;
		case "Bitmap" :
			typeInt = 2;
			break;
		case "Shape" :
			typeInt = 3;
			break;
		case "Text" :
			typeInt = 4;
			break;
		case "MovieClip" :
			typeInt = 5;
			break;
		case "SimpleSprite" :
			typeInt = 6;
			break;			
		case "Button" :
			typeInt = 7;
			break;
		case "Rect" :
			typeInt = 8;
			break;
		case "NumberText" :
			typeInt = 9;
			break;
		case "InputText" :
			typeInt = 10;
			break;
		default:
			typeInt =0;
	}
	
	return typeInt;

}


//********************************************************************************************************
//export PNG

function outputLayer(index)
{
    var ext = "png";
    copyLayerToNewDoc(index);
    //saveDoc(newDoc, ext, false);
	saveDocUseAction();
    app.activeDocument = doc;
}

function changeDPI(dpi,canvesWidth)
{

       
	var idImgS = charIDToTypeID( "ImgS" );
    var desc7 = new ActionDescriptor();
    var idWdth = charIDToTypeID( "Wdth" );
    var idPxl = charIDToTypeID( "#Pxl" );
    desc7.putUnitDouble( idWdth, idPxl, canvesWidth);
    var idRslt = charIDToTypeID( "Rslt" );
    var idRsl = charIDToTypeID( "#Rsl" );
    desc7.putUnitDouble( idRslt, idRsl, dpi );
    var idCnsP = charIDToTypeID( "CnsP" );
    desc7.putBoolean( idCnsP, true );
    var idIntr = charIDToTypeID( "Intr" );
    var idIntp = charIDToTypeID( "Intp" );
    var idBcbc = charIDToTypeID( "Bcbc" );
    desc7.putEnumerated( idIntr, idIntp, idBcbc );
	executeAction( idImgS, desc7, DialogModes.NO );

}


function copyLayerToNewDoc(index)
{



    var id2086 = charIDToTypeID( "slct" );
    var desc302 = new ActionDescriptor();
    var id2087 = charIDToTypeID( "null" );
        var ref107 = new ActionReference();
        var id2088 = charIDToTypeID( "Lyr " );
        //ref107.putName( id2088,exportLayerOriginNames[index] );
		ref107.putIndex(id2088, exportLayerOriginSelectIndex[index])
    desc302.putReference( id2087, ref107 );
    var id2089 = charIDToTypeID( "MkVs" );
    desc302.putBoolean( id2089, false );
    executeAction( id2086, desc302, DialogModes.NO );

    var id2090 = charIDToTypeID( "Mk  " );
    var desc303 = new ActionDescriptor();
    var id2091 = charIDToTypeID( "null" );
        var ref108 = new ActionReference();
        var id2092 = charIDToTypeID( "Dcmn" );
        ref108.putClass( id2092 );
    desc303.putReference( id2091, ref108 );
    var id2093 = charIDToTypeID( "Nm  " );
    desc303.putString( id2093, exportLayerNames[index] );
    var id2094 = charIDToTypeID( "Usng" );
        var ref109 = new ActionReference();
        var id2095 = charIDToTypeID( "Lyr " );
        var id2096 = charIDToTypeID( "Ordn" );
        var id2097 = charIDToTypeID( "Trgt" );
        ref109.putEnumerated( id2095, id2096, id2097 );
    desc303.putReference( id2094, ref109 );
    executeAction( id2090, desc303, DialogModes.NO );

	var maskBound = maskBounds[exportLayers[index]];
	chopCurrent(maskBound[0],maskBound[1],maskBound[2],maskBound[3]);
	
	/*
    var newDoc = app.activeDocument;
    var newLayer = newDoc.layers[0];
    var width = newLayer.bounds[2] - newLayer.bounds[0];
    var height = newLayer.bounds[3] - newLayer.bounds[1];
	
    //newDoc.crop(newLayer.bounds);
    
    
	if(maskBound ==null)
		newDoc.crop(newLayer.bounds);
	else
	{
		newDoc.crop(maskBound);
	}
    
    return newDoc;
	*/
}

function chopCurrent(left,top,right,bottom)
{
	var idCrop = charIDToTypeID( "Crop" );
    var desc25 = new ActionDescriptor();
    var idT = charIDToTypeID( "T   " );
        var desc26 = new ActionDescriptor();
        var idTop = charIDToTypeID( "Top " );
        var idPxl = charIDToTypeID( "#Pxl" );
        desc26.putUnitDouble( idTop, idPxl, Number(top) );
        var idLeft = charIDToTypeID( "Left" );
        var idPxl = charIDToTypeID( "#Pxl" );
        desc26.putUnitDouble( idLeft, idPxl, Number(left) );
        var idBtom = charIDToTypeID( "Btom" );
        var idPxl = charIDToTypeID( "#Pxl" );
        desc26.putUnitDouble( idBtom, idPxl, Number(bottom) );
        var idRght = charIDToTypeID( "Rght" );
        var idPxl = charIDToTypeID( "#Pxl" );
        desc26.putUnitDouble( idRght, idPxl, Number(right) );
    var idRctn = charIDToTypeID( "Rctn" );
    desc25.putObject( idT, idRctn, desc26 );
    var idAngl = charIDToTypeID( "Angl" );
    var idAng = charIDToTypeID( "#Ang" );
    desc25.putUnitDouble( idAngl, idAng, 0.000000 );
    var idWdth = charIDToTypeID( "Wdth" );
    var idPxl = charIDToTypeID( "#Pxl" );
    desc25.putUnitDouble( idWdth, idPxl, 0.000000 );
    var idHght = charIDToTypeID( "Hght" );
    var idPxl = charIDToTypeID( "#Pxl" );
    desc25.putUnitDouble( idHght, idPxl, 0.000000 );
    var idRslt = charIDToTypeID( "Rslt" );
    var idRsl = charIDToTypeID( "#Rsl" );
    desc25.putUnitDouble( idRslt, idRsl, 0.000000 );
	executeAction( idCrop, desc25, DialogModes.NO );
}

function saveDocUseAction()
{
    var folder = new Folder( basePath);
    if (!folder.exists) 
    {
        if (!folder.create())
        {
            throw( "Could not create output folder " + basePath);
		}
	}
		
		
	var idsave = charIDToTypeID( "save" );
    var desc3 = new ActionDescriptor();
    var idAs = charIDToTypeID( "As  " );
        var desc4 = new ActionDescriptor();
        var idPGIT = charIDToTypeID( "PGIT" );
        var idPGIT = charIDToTypeID( "PGIT" );
        var idPGIN = charIDToTypeID( "PGIN" );
        desc4.putEnumerated( idPGIT, idPGIT, idPGIN );
        var idPNGf = charIDToTypeID( "PNGf" );
        var idPNGf = charIDToTypeID( "PNGf" );
        var idPGAd = charIDToTypeID( "PGAd" );
        desc4.putEnumerated( idPNGf, idPNGf, idPGAd );
    var idPNGF = charIDToTypeID( "PNGF" );
    desc3.putObject( idAs, idPNGF, desc4 );
    var idIn = charIDToTypeID( "In  " );
    desc3.putPath( idIn, folder );
    var idCpy = charIDToTypeID( "Cpy " );
    desc3.putBoolean( idCpy, false );
	executeAction( idsave, desc3, DialogModes.NO );
	
	var idCls = charIDToTypeID( "Cls " );
    var desc23 = new ActionDescriptor();
    var idSvng = charIDToTypeID( "Svng" );
    var idYsN = charIDToTypeID( "YsN " );
    var idN = charIDToTypeID( "N   " );
    desc23.putEnumerated( idSvng, idYsN, idN );
	executeAction( idCls, desc23, DialogModes.NO );
}


function saveDoc(doc, ext, alsoPsd)
{
    var folder = new Folder( basePath);
    var path = folder.fullName + "/" + doc.name;
    if (!folder.exists) 
    {
        if (!folder.create())
        {
            throw( "Could not create output folder " + basePath);
		}
	}
		
    var file;
    if (ext == "jpeg" || ext == "jpg")
    {
        file = new File(path + ".jpg");
        var saveOptions = new JPEGSaveOptions()
        saveOptions.embedColorProfile = true
        //saveOptions.formatOptions = FormatOptions.STANDARDBASELINE
        //saveOptions.matte = MatteType.NONE
        //saveOptions.quality = 1
        doc.saveAs(file, saveOptions, true, Extension.LOWERCASE)
    }
    else if (ext == "png")
    {
        file = new File(path + ".png");
        var saveOptions = new PNGSaveOptions()
        doc.saveAs(file, saveOptions, true, Extension.LOWERCASE)
    }
    else if (ext == "gif")
    {
        file = new File(path + ".gif");
        var saveOptions = new GIFSaveOptions()
        doc.saveAs(file, saveOptions, true, Extension.LOWERCASE)
    }
    if (alsoPsd)
    {
        doc.saveAs(new File(path + ".psd"));
    }
    doc.close(SaveOptions.DONOTSAVECHANGES);
}


//********************************************************************************************************
PlistXMLTool = function()
{
	//this.xmlTxt = xmlTxt;
}

PlistXMLTool.addFromObject = function(key,object,deep)
{
	var theText = "";
	theText +=PlistXMLTool.addDeep(deep)+"<key>" + key+"<\/key>\n";
	
	if(PlistXMLTool.is(object ,"Number"))
	{
		theText +=PlistXMLTool.addDeep(deep)+"<real>" + object.toString() + "<\/real>\n";
	}
	else if(PlistXMLTool.is(object,"String"))
	{
		theText +=PlistXMLTool.addDeep(deep)+"<string>" + object + "<\/string>\n";
	}
	else if(object == null)
	{
	}
	else
	{
		theText +=PlistXMLTool.addDeep(deep)+"<dict>\n";
		for(var keyname in object)
		{
			theText +=PlistXMLTool.addFromObject(keyname,object[keyname],deep+1);
		}
		theText +=PlistXMLTool.addDeep(deep)+"<\/dict>\n";
	}
	
	return theText;
}

PlistXMLTool.is = function(obj, type) 
{  
	var _toString = Object.prototype.toString,undefined;  
	return 	(type === "Null" && obj === null) ||  
			(type === "Undefined" && obj === undefined ) ||  
			_toString.call(obj).slice(8,-1) === type;  
}

PlistXMLTool.addDeep= function(deep) 
{
	var str="";
	for(;deep>0; --deep)
	{
		str +="  ";
	}
	return str;
}
//*******************************************************************************************************
//exportAnimXml



function buildDataXML()
{
    var xml = '<data>\r\n<stage width="' + new Number(doc.width) +'" height="' + new Number(doc.height) + '">\r\n';
    for (var i = 0; i < exportLayers.length; i++)
    {
        var layer = exportLayers[i];
        xml += buildDataXMLNode(exportLayerNames[i] + ".png", layer.bounds[0], layer.bounds[1], i);
    }
    xml += '</stage>\r\n</data>';
    saveDataXML(xml);
}

function buildDataXMLNode(layerName, x, y, index)
{
    var node = '    <layer name="' + layerName + '" x="' + new Number(x) + '" y="' + new Number(y) + '" index="' + index + '" />\r\n';
    return node;
}

function saveDataXML(xml, x, y, index)
{    
    var dataFile = new File(basePath + "/data.xml");
    dataFile.encoding = "UTF8";
    dataFile.open( "w", "TEXT", "????" );
	dataFile.write("\uFEFF"); 
	
	dataFile.writeln(xml);
	dataFile.close();
}

function genBasicInfoOb(selfInfoOb,originOb)
{
	selfInfoOb["depth"] =  originOb["depth"];//instance.depth;
	selfInfoOb["position"] = "{"+originOb["x"]+","+originOb["y"]+"}";//"{"+instance.x+","+instance.y+"}";
	selfInfoOb["rect"] = "{{0,0},"+"{"+originOb["width"]+","+originOb["height"]+"}"+"}";//"{{0,0},"+"{"+instance.width+","+instance.height+"}"+"}";
	//var tranPoint = instance.getTransformationPoint();
	selfInfoOb["transformationPoint"] = "{"+0+","+0+"}";//"{"+tranPoint.x+","+tranPoint.y+"}";
	
	var scaleX =1;
	if(originOb["scaleX"] != null)
		scaleX = originOb["scaleX"];
	var scaleY =1;
	if(originOb["scaleY"] != null)
		scaleY = originOb["scaleY"];	
	
	selfInfoOb["scaleValue"] = "{"+scaleX+","+scaleY+"}";//"{"+instance.scaleX+","+instance.scaleY+"}";
	selfInfoOb["rotation"] = 0;//instance.rotation;
	selfInfoOb["skewValue"] ="{"+0+","+0+"}";// "{"+instance.skewX+","+instance.skewY+"}";
	selfInfoOb["transformValue"] = "{"+originOb["x"]+","+originOb["y"]+"}";//"{"+instance.transformX+","+instance.transformY+"}";
	//selfInfoOb["matrixValue"] = "{"+instance.matrix.a+","+instance.matrix.b+","+instance.matrix.c+","+instance.matrix.d+","+instance.matrix.tx+","+instance.matrix.ty+"}";
	selfInfoOb["matrix_a"] = 1;//instance.matrix.a;
	selfInfoOb["matrix_b"] = 0;//instance.matrix.b;
	selfInfoOb["matrix_c"] = 0;//instance.matrix.c;
	selfInfoOb["matrix_d"] = 1;//instance.matrix.d;
	selfInfoOb["matrix_tx"] = originOb["x"];//instance.matrix.tx;
	selfInfoOb["matrix_ty"] = originOb["y"];//instance.matrix.ty;
}

function checkOneInstance(selfInfoOb,originOb)
{
	if(originOb["type"] == "Bitmap")
	{
		selfInfoOb["type"] = getTypeIntFromTypeStr(originOb["type"]);
		selfInfoOb["libName"] = originOb["libName"];//instance.libraryItem.linkageClassName;
		selfInfoOb["instanceName"] = originOb["instanceName"];//instance.name;
		selfInfoOb["sourceName"] =  originOb["sourceName"];//instance.libraryItem.sourceFilePath.replace(this.rootUrl,"").replace("\\","\/");
		genBasicInfoOb(selfInfoOb,originOb);
	}
	else  if( originOb["type"] == "Text" ||originOb["type"] == "NumberText"||originOb["type"] == "InputText")
	{
		
		selfInfoOb["type"] =getTypeIntFromTypeStr(originOb["type"]);
		selfInfoOb["libName"] = originOb["libName"];//instance.libraryItem.linkageClassName;
		selfInfoOb["instanceName"] = originOb["instanceName"];//instance.name;
		
		//selfInfoOb["textWidth"] = originOb["textWidth"];
		//selfInfoOb["textHeight"] = originOb["textHeight"];

		selfInfoOb["textOriginContext"] = originOb["textOriginContext"];
		
		selfInfoOb["fontName"] = originOb["fontName"];
		selfInfoOb["fontSize"] = originOb["fontSize"];
		
		selfInfoOb["textRed"] = originOb["textRed"];
		selfInfoOb["textGrain"] = originOb["textGrain"];
		selfInfoOb["textBlue"] = originOb["textBlue"] ;
         selfInfoOb["alignmentType"]  = originOb["alignmentType"] ;
		

		
		//originOb["y"] -= originOb["fontSize"]/3.0;
		
		genBasicInfoOb(selfInfoOb,originOb);
		
	}
	else 
	{		
		selfInfoOb["type"] = getTypeIntFromTypeStr(originOb["type"]);
		selfInfoOb["libName"] = originOb["libName"];//instance.libraryItem.linkageClassName;
		selfInfoOb["instanceName"] = originOb["instanceName"];//instance.name;
		genBasicInfoOb(selfInfoOb,originOb);
		
	}
}


function exprotAnimXml()
{
	
	for(var keyname in symbolLib)
	{
	
			var itemOriginOb = symbolLib[keyname];
			var itemInfoOb = {};
			var name = itemOriginOb["libName"];
			libItemsDict[name] = itemInfoOb;
			itemInfoOb["frameRate"]  = 60;//this.frameRate;
			itemInfoOb["frameCount"] = 1;//tl.frameCount;
			itemInfoOb["layerCount"] = 1;//tl.layerCount;
			var layerDict = {};
			itemInfoOb["layerDict"]=layerDict;
			var layerInfoOb ={};
			layerDict["0"]=layerInfoOb;
			layerInfoOb["frameCount"] = 1;//tl.frameCount;
			layerInfoOb["keyFrameCount"] = 1;
			var keyFrameDict = {};
			layerInfoOb["keyFrameDict"]=keyFrameDict;
			var keyFrameOb = {};
			var keyFrameName = "0";//""+layerInfoOb["keyFrameCount"];
					
			keyFrameDict[keyFrameName] = keyFrameOb;
			keyFrameOb["startFrame"]= 0;
						
			var ins = itemOriginOb["children"];	
			if(ins == null)
                continue;
			keyFrameOb["elementNum"] = ins.length;
			var elementDict={};
			keyFrameOb["elementDict"] = elementDict;
			for(var h=0; h<ins.length; h++)
			{
				var elementInfoOb = {};
				var elementName = ""+h;
				elementDict[elementName]=elementInfoOb;
				checkOneInstance(elementInfoOb,ins[h]);
			}
	}

	var fileInfoOb={};
	fileInfoOb["name"] = fileName;
    var docUpdateDate  =docFileObject.modified;
	fileInfoOb["fileUpdateTime"] =  "fileUpdateTime__"+docUpdateDate.getTime() +"__fileUpdateTime";
	fileInfoOb["animToolVer"] =  "animToolVer__"+toolVersion+"__animToolVer";
	fileInfoOb["pix"] =deaultScalePixToPoint;
	fileInfoOb["psdUrl"] = docPath.split("/Assets/").pop();
	
	var finalXml ="<?xml version=\"1.0\" encoding=\"UTF-8\"?>\n";
	finalXml+="<!DOCTYPE plist PUBLIC \"-//Apple Computer//DTD PLIST 1.0//EN\" \"http://www.apple.com/DTDs/PropertyList-1.0.dtd\">";
	finalXml+="<plist version=\"1.0\">\n"+"<dict>\n";
	finalXml+=PlistXMLTool.addFromObject("libItemDict",libItemsDict,1);
	finalXml+=PlistXMLTool.addFromObject("fileInfo",fileInfoOb,1);
	finalXml+="<\/dict>\n"+"<\/plist>\n";	
	
	
	 var dataFile = new File(xmlFileUrl);//(rootPath + "/animinfo.xml");
    dataFile.encoding = "UTF8";
    dataFile.open( "w", "TEXT", "????" );
	dataFile.write("\uFEFF"); 
	
	dataFile.writeln(finalXml);
	dataFile.close();

}

//********************************************************************************************************



/***********************************************************************orgin part*/
function getNumberLayers()
{
   var ref = new ActionReference();
   ref.putProperty( charIDToTypeID("Prpr") , charIDToTypeID("NmbL") )
   ref.putEnumerated( charIDToTypeID("Dcmn"), charIDToTypeID("Ordn"), charIDToTypeID("Trgt") );
   return executeActionGet(ref).getInteger(charIDToTypeID("NmbL"));
}

function makeActiveByIndex( idx, visible ){
    var desc = new ActionDescriptor();
      var ref = new ActionReference();
      ref.putIndex(charIDToTypeID( "Lyr " ), idx)
      desc.putReference( charIDToTypeID( "null" ), ref );
      desc.putBoolean( charIDToTypeID( "MkVs" ), visible );
   executeAction( charIDToTypeID( "slct" ), desc, DialogModes.NO );
};

function DS_PrintSt(DS, Key)
{
  var Val;
  var TypeSt = "?";
  var ValSt = "?";
  var Type = DS.getType(Key);
 
  if (Type == DescValueType.ALIASTYPE) {
    TypeSt = "Path";
    ValSt = DS.getPath(Key);
  }
  else
  if (Type == DescValueType.BOOLEANTYPE) {
    TypeSt = "Boolean";
    ValSt = DS.getBoolean(Key);
  }
  else
  if (Type == DescValueType.CLASSTYPE) {
    TypeSt = "Class";
    Type = DS.getClass(Key);
    ValSt = IDSt(Type);
  }
  else
  if (Type == DescValueType.DOUBLETYPE) {
    TypeSt = "Double";
    ValSt = DS.getDouble(Key);
  }
  else
  if (Type == DescValueType.ENUMERATEDTYPE) {
    TypeSt = "Enumerated";
    Type = DS.getEnumerationType(Key);
    Val  = DS.getEnumerationValue(Key);
    ValSt =Val;
    
    /*"Type=" + IDSt(Type)
          + ", Val=" + NumSt(Val)
          ;
         */
  }
  else
  if (Type == DescValueType.INTEGERTYPE) {
    TypeSt = "Integer";
    ValSt = DS.getInteger(Key);//String(DS.getInteger(Key));
  }
  else
  if (Type == DescValueType.LISTTYPE) {
    TypeSt = "List";
    Val = DS.getList(Key);
    ValSt = Val;
  }
  else
  if (Type == DescValueType.OBJECTTYPE) {
    TypeSt = "Object";
    Type = DS.getObjectType(Key);
    Val = DS.getObjectValue(Key);
    ValSt =Val;
  }
  else
  if (Type == DescValueType.RAWTYPE) {
    TypeSt = "Raw";
    ValSt = DS.getData(Key) ;
  }
  else
  if (Type == DescValueType.REFERENCETYPE) {
    TypeSt = "Reference";
    Val = DS.getReference(Key);
    ValSt = Val;
  }
  else
  if (Type == DescValueType.STRINGTYPE) {
    TypeSt = "String";
    ValSt = DS.getString(Key);
  }
  else
  if (Type == DescValueType.UNITDOUBLE) {
    TypeSt = "UnitDouble";
    Type = DS.getUnitDoubleType(Key);
    ValSt =Type;
  }
  else {
    TypeSt = "Type";
    ValSt = DS.getType(Key);
  }
  return ValSt;
}



/*
function hasBackground() {
   var ref = new ActionReference();
   ref.putProperty( charIDToTypeID("Prpr"), charIDToTypeID( "Bckg" ));
   ref.putEnumerated(charIDToTypeID( "Lyr " ),charIDToTypeID( "Ordn" ),charIDToTypeID( "Back" ))//bottom Layer/background
   var desc =  executeActionGet(ref);
   var res = desc.getBoolean(charIDToTypeID( "Bckg" ));
   return res   
};
function getLayerType(idx,prop) {       
   var ref = new ActionReference();
   ref.putIndex(charIDToTypeID( "Lyr " ), idx);
   var desc =  executeActionGet(ref);
   var type = desc.getEnumerationValue(prop);
   var res = typeIDToStringID(type);
   return res   
};
function getLayerVisibilityByIndex( idx ) { 
   var ref = new ActionReference(); 
   ref.putProperty( charIDToTypeID("Prpr") , charIDToTypeID( "Vsbl" )); 
   ref.putIndex( charIDToTypeID( "Lyr " ), idx );
   return executeActionGet(ref).getBoolean(charIDToTypeID( "Vsbl" ));; 
};
*/

function getLayerNameByIndex(layerIndex)
{
	var DS = layerDsMapByIndex[layerIndex];
	var keyName = stringIDToTypeID("name");
	return  DS_PrintSt(DS,keyName);
}

function getLayerBoundsInDoubleNumberByIndex(layerIndex)
{
	var DS = layerDsMapByIndex[layerIndex];
	var desc = DS.getObjectValue(stringIDToTypeID( "bounds" ));
    var bounds = [];// array of Numbers as pixels regardless of ruler
	var top = desc.getUnitDoubleValue(stringIDToTypeID('top'));
	var left = desc.getUnitDoubleValue(stringIDToTypeID('left'));
	var bottom = desc.getUnitDoubleValue(stringIDToTypeID('bottom'));
	var right =desc.getUnitDoubleValue(stringIDToTypeID('right'));
    bounds.push(left);
    bounds.push(top);
    bounds.push(right);
    bounds.push(bottom);
	return  bounds;
}

function getLayerBoundsInUnitByIndex(layerIndex)
{

	var top ;
	var left ;
	var bottom ;
	var right ;
    
    var DS = layerDsMapByIndex[layerIndex];
    var desc = DS.getObjectValue(stringIDToTypeID( "bounds" ));

    top = desc.getUnitDoubleValue(stringIDToTypeID('top'));
    left = desc.getUnitDoubleValue(stringIDToTypeID('left'));
    bottom = desc.getUnitDoubleValue(stringIDToTypeID('bottom'));
    right =desc.getUnitDoubleValue(stringIDToTypeID('right'));
	

	
    var bounds = [];// array of Numbers as pixels regardless of ruler
      
    bounds.push( new UnitValue(left,"px"));
    bounds.push( new UnitValue(top,"px"));
    bounds.push( new UnitValue(right,"px"));
    bounds.push( new UnitValue(bottom,"px"));

	return  bounds; 
    
    
 }


function getMaskBoundsInUnitByIndex(layerIndex)
{
	var nameStr = getLayerNameByIndex(layerIndex);

	var top =Number.NaN;
	var left ;
	var bottom ;
	var right ;
		
	if(nameStr != "mask" && nameStr !="topOrigin" && nameStr !="origin")
	{
		 nameStr = removeMultSpaceInStr(nameStr);
         var nameArr = nameStr.split(" ");
    
		var numStr = nameArr[1];
		var numArr = numStr.split(";");
		left =  parseFloat(numArr[0]);
		top = parseFloat(numArr[1]);	
		right = parseFloat(numArr[2]);
		right = left + right;
		bottom =  parseFloat(numArr[3]);
		bottom = top+bottom;
	}
	if(isNaN(top) || isNaN(left) ||isNaN(bottom) ||isNaN(right) )
	{
	
		var DS = layerDsMapByIndex[layerIndex];
		var desc = DS.getObjectValue(stringIDToTypeID( "bounds" ));
	
		top = desc.getUnitDoubleValue(stringIDToTypeID('top'));
		left = desc.getUnitDoubleValue(stringIDToTypeID('left'));
		bottom = desc.getUnitDoubleValue(stringIDToTypeID('bottom'));
		right =desc.getUnitDoubleValue(stringIDToTypeID('right'));
	}
	

	
    var bounds = [];// array of Numbers as pixels regardless of ruler
      
    bounds.push( new UnitValue(left,"px"));
    bounds.push( new UnitValue(top,"px"));
    bounds.push( new UnitValue(right,"px"));
    bounds.push( new UnitValue(bottom,"px"));

	return  bounds;
}

function getLayerBoundsForTextInUnitByIndex(layerIndex)
{
	var DS = layerDsMapByIndex[layerIndex];
	var keyTextob = DS.getObjectValue(stringIDToTypeID( "textKey" ));
	var textContext = keyTextob.getString(stringIDToTypeID( "textKey" ));
    var xx =1;
    var yy =1;
    if(keyTextob.hasKey(stringIDToTypeID( "transform" )))
    {
        var transformOb = keyTextob.getObjectValue(stringIDToTypeID( "transform" ));
	
        xx= transformOb.getUnitDoubleValue(stringIDToTypeID('xx'));
        yy = transformOb.getUnitDoubleValue(stringIDToTypeID('yy'));
    }
	
	var textClickPoint = keyTextob.getObjectValue(stringIDToTypeID( "textClickPoint" ));
	
	var x = Number(doc.width*textClickPoint.getUnitDoubleValue(stringIDToTypeID('horizontal')))*0.01;
	var y = Number(doc.height*textClickPoint.getUnitDoubleValue(stringIDToTypeID('vertical')))*0.01;
	
	var testShapeList = keyTextob.getList(stringIDToTypeID( "textShape" ));
	var textShape = testShapeList.getObjectValue(0);
	
    try
    {
	var textShapeBounds = textShape.getObjectValue(stringIDToTypeID( "bounds" ));
    }
    catch(ex)
    {
        alert("Text :"+insObject["libName"]+" should be " +"Paragraph Text !");
        throw( new Error ("Exit process !"))
        return;
    }
	//var textArea = [];
	
	var top = textShapeBounds.getUnitDoubleValue(stringIDToTypeID('top'));
	var left = textShapeBounds.getUnitDoubleValue(stringIDToTypeID('left'));
	var bottom = textShapeBounds.getUnitDoubleValue(stringIDToTypeID('bottom'));
	var right =textShapeBounds.getUnitDoubleValue(stringIDToTypeID('right'));
	
	
	
    var bounds = [];// array of Numbers as pixels regardless of ruler
     
    bounds.push( new UnitValue(x,"px"));
    bounds.push( new UnitValue(y,"px"));
    bounds.push( new UnitValue(x+right*xx*deaultScalePixToPoint,"px"));
    bounds.push( new UnitValue(y+bottom*yy*deaultScalePixToPoint,"px"));

	return  bounds;
}


function getLayerVisibleByIndex(layerIndex)
{
	var DS = layerDsMapByIndex[layerIndex];
	var desc = DS.getObjectValue(stringIDToTypeID( "bounds" ));
    var keyName = stringIDToTypeID("visible");

	return  DS_PrintSt(DS,keyName);
}

function testIsNullTextLayer(layerIndex)
{
	var DS = layerDsMapByIndex[layerIndex];
	if(DS.hasKey(stringIDToTypeID( "textKey" )))
	{
		var keyTextob = DS.getObjectValue(stringIDToTypeID( "textKey" ));
		var textContext = keyTextob.getString(stringIDToTypeID( "textKey" ));
		if(textContext == "")
			return true;
	}
	
	return false;
	
}

function writeTextInsOb(layerIndex,insObject)
{
	var DS = layerDsMapByIndex[layerIndex];
	var keyTextob = DS.getObjectValue(stringIDToTypeID( "textKey" ));
	var textContext = keyTextob.getString(stringIDToTypeID( "textKey" ));
    
	
	
	
	var textStyleRange = (keyTextob.getList(stringIDToTypeID( "textStyleRange" ))).getObjectValue(0);
	var textStyle =  textStyleRange.getObjectValue(stringIDToTypeID( "textStyle" ));
	
	var fontName = textStyle.getString(stringIDToTypeID( "fontName" ));
	var fontSize = textStyle.getUnitDoubleValue(stringIDToTypeID( "size" ));
	fontSize = parseInt(fontSize*10)*0.1;
	//var color = 0;
	var colorOb = textStyle.getObjectValue(stringIDToTypeID( "color" ));
	var red = colorOb.getDouble(stringIDToTypeID( "red" ))   ;
	var grain = colorOb.getDouble(stringIDToTypeID( "grain" ))   ;
	var blue = colorOb.getDouble(stringIDToTypeID( "blue" ))   ;
	
	
	
	var paragraphStyleRange = (keyTextob.getList(stringIDToTypeID( "paragraphStyleRange" ))).getObjectValue(0);
	var paragraphStyle =  paragraphStyleRange.getObjectValue(stringIDToTypeID( "paragraphStyle" ));
    
    var nameStr = getLayerNameByIndex(layerIndex);
    nameStr = removeMultSpaceInStr(nameStr);
    var nameArr = nameStr.split(" ");
    var align =-1;
    if(nameArr.length >= 3 )
    {
        align = parseInt(nameArr[2]);
     }
    
    if(isNaN(align) || align<0)
    {
	  var alignStr =  app.typeIDToStringID( paragraphStyle.getEnumerationValue(stringIDToTypeID("align")) );
     
     
        switch(alignStr)
		{
		case "center":
			align =  33;
			break;
		case "right":
			align =  32;
			break;
		case "left":
		default:
			align = 11;
		};
     }
	
	
	insObject["textOriginContext"] = textContext;
	
	insObject["fontName"] = fontName;
	insObject["fontSize"] = fontSize;
	
	insObject["textRed"] = parseInt(red);
	insObject["textGrain"] = parseInt(grain);
	insObject["textBlue"] = parseInt(blue);
	
	insObject["alignmentType"] = align;
		

}



var count = 0;
var scanStr ="";
function scanTheLayer(layerIndex,deep,parentCount,parentOb,parentBounds,isNeedExport,nameTreeStr)
{
//*****************************************
	var layerName = getLayerNameByIndex(layerIndex);
	if(layerName.indexOf("mask")  == 0 )
	{
		maskLayers[exportLayers[parentCount]] = layerIndex;

		return false;
	}
	else if(layerName == "topOrigin" || layerName.indexOf("origin") == 0)
	{
		return  false;
	}
	else if(layerName.indexOf("scale@") == 0)
	{
		return  false;
	}
	else if(getLayerVisibleByIndex(layerIndex))
	{
		exportLayers[count] = layerIndex;
		maskLayers[layerIndex] = layerIndex;
		
		var nameStr = layerName;
		nameStr = removeMultSpaceInStr(nameStr);
		var nameArr = nameStr.split(" ");
		
		var libName = nameArr[0];
		var isAutoRenamed = false;
		if( libName.charCodeAt(0) == "#".charCodeAt(0))
		{
			isAutoRenamed = true;
			libName = libName.substr(1);
			var originNameBeforeAutoRename = libName;
			libName += nameTreeStr;//"abc_"+(new Date).getTime().toString()+renameLibCount.toString();
			//renameLibCount +=1;
		}
		
		var insName = nameArr[1];
		var addtionTag = nameArr[2];
		
		var isNotGlobalItem = true;
		
		if(insName!= null &&insName.toLowerCase() =="global" )
		{
			isNotGlobalItem =false;
			insName = null;
		}
		else if(addtionTag != null && addtionTag.toLowerCase() =="global" )
		{
			isNotGlobalItem =false;
		}
		
		var isNotSkip = true;
		if(isNotGlobalItem)
		{
			if(insName!= null &&insName.toLowerCase() =="skip" )
			{
				isNotSkip =false;
				insName = null;
			}
			else if(addtionTag != null && addtionTag.toLowerCase() =="skip" )
			{
				isNotSkip =false;
			}
		
		}
		
		var isNotSelfOnly = true;
		if(isNotGlobalItem&&isNotSkip)
		{
			if(insName!= null &&insName.toLowerCase() =="selfonly" )
			{
				isNotSelfOnly =false;
				insName = null;
			}
			else if(addtionTag != null && addtionTag.toLowerCase() =="selfonly" )
			{
				isNotSelfOnly =false;
			}
		
		}
		
		var isNotRectNode = true;
		if(isNotGlobalItem&&isNotSelfOnly&&isNotSkip)
		{
			if(addtionTag != null && addtionTag.toLowerCase() =="rect" )
			{
				isNotRectNode =  false;
			}
		}
		
		exportLayerOriginSelectIndex[count] = layerIndex;
        exportLayerOriginNames[count] = layerName;
		
		displayLayerNames[count] = getDeepPreStr(deep) + layerName;
		
		var selfNameSave = isNeedExport && checkIsAllowSaveName(libName);
		if(parentOb == null)
			selfNameSave = false;
		if(selfNameSave&&!isNotRectNode)
		{				
			libName = "Rct_"+ libName+"_"+fileNamePre;
		}
		
		var thisLibItem = null;
		var selfCout = count;	
		
		var originLibName = libName;
		var typeStr  =  getTypeStrFromLibName(libName);
		var isNotTextNode = true;
		if(typeStr == "Text" || typeStr == "NumberText" || typeStr == "InputText")
			isNotTextNode = false;
		if(selfNameSave&&isNotGlobalItem&&isNotSkip&&isNotRectNode&&isNotTextNode)
		{
			if(isNotGlobalItem&&isNotGlobalFile)
				libName = libName+"_"+fileNamePre;
			thisLibItem  = {};
			if(symbolLib[libName] != null && isAutoRenamed)
			{
				libName  +="_"+renameLibCount;
				renameLibCount++;
			}
			thisLibItem["libName"] = libName;
			symbolLib[libName] = thisLibItem;
			thisLibItem["type"] = typeStr;
			
		}
		exportLayerNames[count] = libName;
		
		var nameTreeStrPassToChildren;
		if(isAutoRenamed)
			nameTreeStrPassToChildren = nameTreeStr+"_"+originNameBeforeAutoRename;
		else
			nameTreeStrPassToChildren= nameTreeStr+"_"+libName;
		count++;
		
		var childHaveSave = false;
		var layerInfoOb = layerInfoMapByIndex[layerIndex];
		var thisLayerBounds = null;
		var thisLayerOriginBounds = null;
		var thisScaleX= 1;
		var thisScaleY= 1;
		if(layerInfoOb != null)
		{
		
			var childIndexArr = layerInfoOb["childrenIndexArr"];
			if(childIndexArr != null)
			{
			
				for(var i = 0;i< childIndexArr.length;i++)
				{
					var childLayerIndex = childIndexArr[i];
					var childLayerName = getLayerNameByIndex(childLayerIndex);
					if(childLayerName.indexOf("mask") == 0)
					{
						scanTheLayer(childLayerIndex,deep+1, selfCout,thisLibItem,null,false,nameTreeStrPassToChildren);
					}
					if(childLayerName.indexOf("origin") == 0)
					{
						thisLayerOriginBounds=getMaskBoundsInUnitByIndex(childLayerIndex);
					}
					
					
					if(childLayerName.indexOf("scale@") == 0)
					{

						var nameStr = childLayerName;
						
						nameStr = removeMultSpaceInStr(nameStr);
						var nameArr = nameStr.split(" ");
						var numStr = nameArr[1];
						var numArr = numStr.split(";");
						var scaleX =parseFloat(numArr[0]);
						var scaleY =parseFloat(numArr[1]);	
						
						if(isNaN(scaleX))
						{
							thisScaleX =1;
						}
						else
						{
							thisScaleX = scaleX;
						}
						if(isNaN(scaleY))
						{
							thisScaleY =1;
						}
						else
						{
							thisScaleY = scaleY;
						}
					}	
										
				}
				var useChildGetSelfBounds = false;
				if(maskLayers[layerIndex] == layerIndex)
				{
				
						var top = 100000;
						var left = 100000;//desc.getUnitDoubleValue(stringIDToTypeID('left'));
						var bottom = -100000;//desc.getUnitDoubleValue(stringIDToTypeID('bottom'));
						var right =  -100000;//desc.getUnitDoubleValue(stringIDToTypeID('right'));
						
						thisLayerBounds = [];		
						thisLayerBounds.push( new UnitValue(left,"px"));
						thisLayerBounds.push( new UnitValue(top,"px"));
						thisLayerBounds.push( new UnitValue(right,"px"));
						thisLayerBounds.push( new UnitValue(bottom,"px"));
			
						maskBounds[layerIndex] =thisLayerBounds;
						useChildGetSelfBounds = true;
				}
				else
				{
					thisLayerBounds = getMaskBoundsInUnitByIndex(maskLayers[layerIndex]);
					maskBounds[layerIndex] =thisLayerBounds;// getLayerBoundsInUnitByIndex(maskLayers[layerIndex]);
				}
				for(var i = 0;i< childIndexArr.length;i++)
				{
					var childLayerIndex = childIndexArr[i];
					if(scanTheLayer(childLayerIndex,deep+1,selfCout,thisLibItem,  ( useChildGetSelfBounds ?thisLayerBounds:null) , isNotSelfOnly ,nameTreeStrPassToChildren))
						childHaveSave = true;
				}
			}
		}
		if(thisLayerBounds == null)
		{
			if(isNotTextNode)
			{		
				thisLayerBounds = getLayerBoundsInUnitByIndex(maskLayers[layerIndex]);
				maskBounds[layerIndex] =thisLayerBounds;
			}
			else
			{
				thisLayerBounds = getLayerBoundsForTextInUnitByIndex(layerIndex);
				maskBounds[layerIndex] =thisLayerBounds;
			}		
			
		}
		if(parentBounds!=null)
		{
			if(  !testIsNullTextLayer(layerIndex) && ((0 != thisLayerBounds[2])|| (0 != thisLayerBounds[3])) )
			{		
				if(thisLayerBounds[0] < parentBounds[0])
					parentBounds[0]= thisLayerBounds[0];
				if(thisLayerBounds[1] < parentBounds[1])
					parentBounds[1]= thisLayerBounds[1];
				if(thisLayerBounds[2] > parentBounds[2])
					parentBounds[2]= thisLayerBounds[2];
				if(thisLayerBounds[3] > parentBounds[3])
					parentBounds[3]= thisLayerBounds[3];				
			}
		}

		var originOffsetX =0;
        var originOffsetY =0;
         if( thisLayerOriginBounds != null)
        {
            originOffsetX = Number( thisLayerBounds[0]) - Number( thisLayerOriginBounds[0]) ;
            originOffsetY = Number( thisLayerBounds[3]) - Number( thisLayerOriginBounds[3]) ;
        }
		
		
		if(thisLibItem != null)
		{


			if(!childHaveSave)
			{
				var bitmapInstance={};
				bitmapInstance["type"] = "Bitmap";
				bitmapInstance["libName"] = libName;
				bitmapInstance["sourceName"] = libName+".png";
				bitmapInstance["instanceName"] ="bitmap";
				bitmapInstance["width"] = Number(thisLayerBounds[2]-thisLayerBounds[0]);
				bitmapInstance["height"] = Number(thisLayerBounds[3]-thisLayerBounds[1]);
				bitmapInstance["x"] = bitmapInstance["width"]*0.5;
				bitmapInstance["y"] = bitmapInstance["height"]*0.5;
				bitmapInstance["depth"] =1;
				var selfChildren = [];		
				selfChildren.push(bitmapInstance);
				thisLibItem["children"] = selfChildren;	
				if(needSaveLayersLibnameSet[libName] == null)
				{		
					needSaveLayersCounts.push(selfCout);
					needSaveLayersLibnameSet[libName] = selfCout;					
				}
			}
			else
			{
				if(global_buttons_dict[originLibName])
				{
					var selfChildren = null;
					var childrenObArr = thisLibItem["children"];
					for(var k=0;k < childrenObArr.length;k++)
					{
						var childOb = childrenObArr[k] ;
						childOb["depth"] = childrenObArr.length -k;
						childOb["x"] = childOb["x"] -  Number(thisLayerBounds[0])+originOffsetX;
						childOb["y"] = Number(thisLayerBounds[3]) -(childOb["y"])-originOffsetY;
						if(childOb["instanceName"] == "self")
						{
							selfChildren = childOb;
						}
					}
					
					if( selfChildren != null)
					{
						
						var newLibName = originLibName+"_"+selfChildren["libName"];
						symbolLib[newLibName] = thisLibItem;
						if(symbolLib[libName] == thisLibItem)
						{
							symbolLib[libName] =null;
							delete symbolLib[libName] ;
						}
						thisLibItem["libName"] = newLibName;
						exportLayerNames[selfCout] = newLibName;
						libName = newLibName;
						
						var globalName = originLibName;
						if(globalName.toLowerCase().indexOf("btn")==0)
						{
							globalName = globalName.substr(3);
							
							var normalPartName = globalName+"normal";
							var downPartName = globalName+"down";
							
							var newArr = [];
							var childInstance;	
							childInstance={};
							childInstance["type"] = getTypeStrFromLibName(downPartName);
							childInstance["libName"] = downPartName;
							childInstance["instanceName"] ="down";
							childInstance["depth"] =-2;
										
							childInstance["x"] =Number(0);
							childInstance["width"] = Number(thisLayerBounds[2]-thisLayerBounds[0]);
							childInstance["height"] = Number(thisLayerBounds[3]-thisLayerBounds[1]);
							childInstance["y"] = Number(0);
							
							newArr.push(childInstance);
							
							childInstance={};
							childInstance["type"] = getTypeStrFromLibName(normalPartName);
							childInstance["libName"] = normalPartName;
							childInstance["instanceName"] ="normal";
							childInstance["depth"] =-1;
										
							childInstance["x"] =Number(0);					
							childInstance["width"] = Number(thisLayerBounds[2]-thisLayerBounds[0]);
							childInstance["height"] = Number(thisLayerBounds[3]-thisLayerBounds[1]);
							childInstance["y"] = Number(0);
							
							newArr.push(childInstance);
							
							childrenObArr= newArr.concat(childrenObArr);
							thisLibItem["children"] = childrenObArr;
							
							for(var k=0;k < childrenObArr.length;k++)
							{
								var childOb = childrenObArr[k] ;
								childOb["depth"] = childrenObArr.length -k;
							}
							
						}
						
					}
				}
				else
				{

					var childrenObArr = thisLibItem["children"];
					for(var k=0;k < childrenObArr.length;k++)
					{
						var childOb = childrenObArr[k] ;
						childOb["depth"] = childrenObArr.length -k;
						childOb["x"] = childOb["x"] -  Number(thisLayerBounds[0])+originOffsetX;
						childOb["y"] = Number(thisLayerBounds[3]) -(childOb["y"])-originOffsetY;
					}
				
				}
			
			}
		}
		if( parentOb!=null && (thisLibItem != null || !isNotGlobalItem || !isNotSkip|| !isNotRectNode || !isNotTextNode))
		{
			if(!isNotSkip && isNotGlobalFile)
				libName = libName+"_"+fileNamePre;
			var parentChildren = parentOb["children"];
			if(parentChildren == null)
			{
				parentChildren = [];
				parentOb["children"] = parentChildren;		
			}
			var childInstance={};
			childInstance["type"] = getTypeStrFromLibName(libName);
			childInstance["libName"] = libName;
			if(insName == null || !checkIsAllowSaveName(insName))
				childInstance["instanceName"] ="";
			else
				childInstance["instanceName"] =insName;
				
			
						
			childInstance["x"] =Number( thisLayerBounds[0])-originOffsetX;
			childInstance["y"] = Number( thisLayerBounds[3])-originOffsetY;
			childInstance["width"] = Number(thisLayerBounds[2]-thisLayerBounds[0]);
			childInstance["height"] = Number(thisLayerBounds[3]-thisLayerBounds[1]);
			childInstance["scaleX"]  = thisScaleX;
			childInstance["scaleY"]  = thisScaleY;
			
			
			if(!isNotTextNode)
			{
				writeTextInsOb(layerIndex,childInstance);
			}
			
	
			parentChildren.push(childInstance);
		}
		
        return selfNameSave;
        /*
		if(isNotRectNode)
			return selfNameSave;
		else
			return false;
		*/
		
	}
	
}

function scanTheWholeDoc()
{
	count=0;
	var deep =0;
	var thisLibItem  = {};
	var libName = fileName.split(".")[0];
	thisLibItem["libName"] = libName;
	symbolLib[libName] = thisLibItem;
	thisLibItem["type"] = "SimpleSprite";
	
	var docX=0;
	var docY=0;
	
	var thisLayerOriginBounds = null;
	var thisLayerBounds = null;
    var hasTopOrigin =false;
	for(var i = 0;i< topLayerIndexArr.length;i++)
	{
		var layerIndex = topLayerIndexArr[i];
		var layerName = getLayerNameByIndex(layerIndex);
		if(layerName == "topOrigin" || layerName.indexOf("mask") == 0)
		{
			var thisLayerBounds = getMaskBoundsInUnitByIndex(layerIndex);
            hasTopOrigin = true;
		}	
		if(layerName.indexOf("origin") == 0)
		{
			thisLayerOriginBounds=getMaskBoundsInUnitByIndex(layerIndex);
		}	
		
	}
	
	var originOffsetX =0;
	var originOffsetY =0;
	if( thisLayerOriginBounds != null)
	{
		originOffsetX = Number( thisLayerBounds[0]) - Number( thisLayerOriginBounds[0]) ;
		originOffsetY = Number( thisLayerBounds[3]) - Number( thisLayerOriginBounds[3]) ;
	}

    var originX =0;
    var originY =0;
	var originRight =0;
	var originBottom =0;
	if(thisLayerBounds == null)
	{
		var top = 100000;
		var left = 100000;//desc.getUnitDoubleValue(stringIDToTypeID('left'));
		var bottom = -100000;//desc.getUnitDoubleValue(stringIDToTypeID('bottom'));
		var right =  -100000;//desc.getUnitDoubleValue(stringIDToTypeID('right'));
		
		thisLayerBounds = [];		
		thisLayerBounds.push( new UnitValue(left,"px"));
		thisLayerBounds.push( new UnitValue(top,"px"));
		thisLayerBounds.push( new UnitValue(right,"px"));
		thisLayerBounds.push( new UnitValue(bottom,"px"));
	}
    else
    {
        originX =  Number(thisLayerBounds[0]);
        originY =   Number(thisLayerBounds[1]);
		originRight =  Number(thisLayerBounds[2]);
		originBottom = Number(thisLayerBounds[3]);
    }
	
	for(var i = 0;i< topLayerIndexArr.length;i++)
	{
		var layerIndex = topLayerIndexArr[i];
		scanTheLayer(layerIndex,0,0,thisLibItem,thisLayerBounds,true,libName);
	}

    if(!hasTopOrigin)
    {
        originX =  Number(thisLayerBounds[0]);
        originY =   Number(thisLayerBounds[1]);
		originRight =  Number(thisLayerBounds[2]);
		originBottom = Number(thisLayerBounds[3])
    }
	
	
	var childrenObArr = thisLibItem["children"];
    if(childrenObArr == null)
        return;
	
	for(var k=0;k < childrenObArr.length;k++)
	{
		var childOb = childrenObArr[k] ;
		childOb["depth"] = childrenObArr.length -k;
		childOb["x"] = childOb["x"] -  originX+originOffsetX;
		childOb["y"] = originBottom -(childOb["y"])-originOffsetY;
	}
	
}


/*----------------------------------------------------------------------*
   Main
 Prints a main action descriptor.
 *----------------------------------------------------------------------*/
 
 
 /*----------------------------------------------------------------------*/
 //globol value
 var FilePath   = "/c/PALYCRABLAYERINFOR.txt"; // Full path of the output file
 
 var endLayerIndexStack =[];//not the glodbal index ,just index in currentChildArr;
 var layerDsMapByIndex ={};
 var topLayerIndexArr =[];
 var layerInfoMapByIndex ={};
 var currentChildArr =[];
 
 
 /*----------------------------------------------------------------------*/
 
 
try {
/*
  var ref = new ActionReference();
  ref.putEnumerated(charIDToTypeID("capp"),
                    charIDToTypeID("Ordn"),
                    charIDToTypeID("Trgt")
                    );
  // Everything
  var AD = executeActionGet(ref);
 */ 
	changeDPI(72.0*deaultScalePixToPoint, Number(doc.width));
 
 
    var St ="";
	
   var prop =  stringIDToTypeID("layerSection")
   var cnt = getNumberLayers()+1;
   for(var i =1 ;i<cnt;i++)
   {
   
	   St +="layerIndex:"+i+"==================================================================================\n" 
       var ref = new ActionReference();
	   ref.putIndex(charIDToTypeID( "Lyr " ), i);
	   var AD =  executeActionGet(ref);
	   layerDsMapByIndex[i]= AD;
	   
	   var type = AD.getEnumerationValue(prop);
       var res = typeIDToStringID(type);
	   St +="retType:"+res+"\n";
	   if(res == "layerSectionEnd")
	   {
			endLayerIndexStack.push(currentChildArr.length);
	   }
	   else if (res == "layerSectionStart")
	   {	
			var lastEndLayerIndex = endLayerIndexStack.pop();
			var layerSetInfo = {};
			layerInfoMapByIndex[i] = layerSetInfo;
			
			var childrenArr = [];
			layerSetInfo["childrenIndexArr"] = childrenArr;
				
			for (var k =lastEndLayerIndex ;k < currentChildArr.length ;k++)
			{
				childrenArr.push(currentChildArr[k]);
			}
			currentChildArr.splice(lastEndLayerIndex);
			
			currentChildArr.push(i);
			
			if(endLayerIndexStack.length <=0)
			{
				topLayerIndexArr.push(i);
			}
		}
		else
		{
			if(endLayerIndexStack.length <=0 )
				topLayerIndexArr.push(i);
			else
				currentChildArr.push(i);	
		}
	   
	}
	
	   
	   
	   St  += "\n\n\n"+"=======================================================================\n";
   
   
  scanTheWholeDoc();


 var folder = new Folder( basePath);
 if (folder.exists) 
 {
	var pngFiles = folder.getFiles("*.png");
	for(var  k = pngFiles.length-1; k >=0; k--)
	{
		var onePng = pngFiles[k];
		onePng.remove();
	}
 }
 for(var i=0;i<needSaveLayersCounts.length;i++)
		outputLayer(needSaveLayersCounts[i]);

/*  
folder = new Folder( rootPath);

 if (folder.exists) 
 {
	var animXmlFiles = folder.getFiles("*.animxml");
	for(var  k = animXmlFiles.length-1; k >=0; k--)
	{
		var animXmlFile = animXmlFiles[k];
		animXmlFile.remove();
	}
 }
*/
  exprotAnimXml();
 
  //alert(St, ScriptName);
 
 
} catch(ex) {
  alert(ex.message);
}

}//end_processOneFile



function saveCurrentDoc()
{
    var idsave = charIDToTypeID( "save" );
    executeAction( idsave, undefined, DialogModes.NO );
}

saveCurrentDoc();
processOneFile();


try
{
    var python_path = "/usr/local/bin/python";
    var file_name_encoding = "utf-8";
    if ($.os.search(/windows/i) != -1) {
        // Windows 
        python_path = "D:/python27/python.exe";
        file_name_encoding = "gbk";
    } else {
        //Macintosh
        python_path = "/usr/local/bin/python";
        file_name_encoding = "utf-8";

        var docPath = new String(app.activeDocument.fullName);
        var docPath = docPath.substring(0, docPath.lastIndexOf("/") + 1);
        var project_root = docPath.substr (0,docPath.lastIndexOf ("svn/Asset"));
        //alert(project_root)
        //alert(docPath)
        //alert(Folder.temp + "/texture_packer.py")
        var script_file = new File(Folder.temp + "/texture_packer.py");
        script_file.open("w")
            //#encoding=utf-8?
            script_file.writeln(
                    'import os;' +
                    'import subprocess;'+
                    'import urllib;'+
                    'python_path="' + python_path +'";'+
                    'docPath = urllib.unquote("'+docPath+'").decode("utf-8");'+
                    'docPath = os.path.expanduser(docPath);'+
                    'os.chdir(os.path.expanduser("'+project_root+'"));'+
                    'args=[python_path,"tool.py","--abp",docPath,"--keep-animxml","tp","q"];'+
                    'subprocess.call(args)')
            script_file.close()
            script_file.execute()
    }

}
catch(ex) {
  alert(ex.message);
}




