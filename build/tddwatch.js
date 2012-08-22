var util=require("util");
var terminal=require("node-terminal");
var fs=require("fs");
var exec=require("child_process").exec;
var fileExtensionPattern = new RegExp("^.*\.(node|js)$");


var lock=false;
var coverage, testnum, errormsg;

var runTest = function(){

    if (lock){
        return;
    }
    lock=true;
    terminal.move(0,0).clearLine().color("red").write('status: lock');

    var child;
    chlid=exec("make unit", function(error, stdout, stderr){
        
        //util.print("stdout: "+stdout);
        //util.print("stderr: "+stderr);
        if (error!=null){
            //console.log("exec error: "+error);
            errormsg=error;
        }

        fs.readFile("logs/lib.coverage.json", function(error, data){
            if (error!=null){
                //console.log("readfile error: "+error);
            } else {
                try{
                    var json=JSON.parse(data);
                    coverage=json.coverage;
                    var files=json.files;
                    var testsarr=stderr.match(/(\d*) tests/);
                    testnum=testsarr==undefined? "?": testsarr[1];
                } catch(error){
                    //console.log("json error: "+error);
                }
            }

            terminal.clear().move(1,0).colorize('%cTests   : %b'+testnum).nl();
            terminal.colorize('%cCoverage:');
            if(coverage>90){
                terminal.colorize('%w%2  '+coverage+'  %n ');
            } else if(coverage>60){
                terminal.colorize('%w%3  '+coverage+'  %n ');
            } else {
                terminal.colorize('%w%1  '+coverage+'  %n ');
            }
            terminal.nl().write("----------------------------------------").nl();
            if (errormsg==undefined){
                terminal.color("white").write("no error");
            } else {
                terminal.write(errormsg);
            }

            lock=false;
            terminal.move(0,0).color("green").write('status: unlock');
        });
    });
}

var watchGivenFile = function(watch, poll_interval, callback) {
    fs.watchFile(watch, { persistent: true, interval: poll_interval }, callback);
}

var findAllWatchFiles = function(path, callback) {
  fs.stat(path, function(err, stats){
    if (err) {
      util.error('Error retrieving stats for file: ' + path);
    } else {
      if (stats.isDirectory()) {
        fs.readdir(path, function(err, fileNames) {
          if(err) {
            util.error('Error reading path: ' + path);
          }
          else {
            fileNames.forEach(function (fileName) {
              findAllWatchFiles(path + '/' + fileName, callback);
            });
          }
        });
      } else {
        if (path.match(fileExtensionPattern)) {
          callback(path);
        }
      }
    }
  });
};


var watchItems="lib,test";
var poll_interval=100;

runTest();
dirs=watchItems.split(",");
for(var i=0; i<dirs.length; i++){
    var watchItem=dirs[i];
    findAllWatchFiles(watchItem, function(f) {
        //terminal.move(50,0).clearLine().color("black").write('changed:'+f);
        watchGivenFile( f, poll_interval, runTest );
    });
}
