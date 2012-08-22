var H = require("../../lib-cov/helloworld.js");
require("should");

module.exports = {
    "Hello World": function(){
        var h = H.create();
        h.parrot("hello").should.eql("hello");
    }
}; 
