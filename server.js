var http = require("http");
var fs = require("fs");
var childProcess = require("child_process")
var path = require("path");
var ejs = require("ejs");


var indexJs = path.join(__dirname , "test", "test1" ,"index.js")



var listFiles = function (path){
    var files = fs.readdirSync(path );

    files.map(function (value , key  ){
        return {
            name : key,
            isFile :fs.statSync(path + "/" + value).isFile()
        }
    })
}

var routers = {
    "/index.html" : function (req , res , cb){
        var testPath = path.join(__dirname , "test" );



       var content = ""


       // ejs.render(content , listFiles(testPath), {});

        const ls = childProcess.spawn("mocha.cmd" , [indexJs ]  , {})

        ls.stdout.on('data', (data) => {
            content +=data;
        });

        ls.stderr.on('data', (data) => {
            content +=data;;
        });

        ls.on('close', (code) => {
            cb(ejs.render(fs.readFileSync(req.resourcePath).toString() , {content : content}, {}))
        });



    }
}

var server = http.createServer((req , res) => {

    var resourcePath = path.join(__dirname , req.url );
    req.resourcePath = resourcePath;
    console.log("load file %s" , resourcePath)
    var content = "";
    try{

        if(routers[req.url]) {

            content =  routers[req.url](req , res , function (content){
                res.setHeader('Content-Type', "text/html");
                res.write(content)

                res.end();
            });
            return ;
        }else {
            content = fs.readFileSync(resourcePath).toString();
        }

    }catch(e){
        content = "404"
    }


    if(req.headers.accept.indexOf("text/html") > -1){
        res.setHeader('Content-Type', "text/html");
    }else if(req.headers.accept.indexOf("text/css") > -1){
        res.setHeader('Content-Type', "text/css")
    }else if(req.headers.accept.indexOf("text/js") > -1){
        res.setHeader('Content-Type', "text/js")
    }
    res.write(content)

    res.end();


})

server.listen(80);