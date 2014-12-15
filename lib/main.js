(function(){
  var fs = require('fs');

  fs.watch(".git", function(event, filename){
    console.log("["+event+"] on:"+filename);
  });
}());