var HelloWorld = function(){};

HelloWorld.prototype = {
    "parrot": function(str){
        return str;
    }
};

module.exports.create = function(){
    return new HelloWorld();
};
