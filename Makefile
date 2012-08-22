unit: clean unit.execute
unit.after: int.push.beacon

#0 development
tdd: clean
	./node_modules/expresso/deps/jscoverage/node-jscoverage lib lib-cov 
	./node_modules/expresso/bin/expresso tests/unit/*.test.js -b --json logs/lib.coverage.json

clean:
	#if test -d logs; then rm -Rf logs; mkdir logs; fi
	rm -Rf logs;
	mkdir logs;
	if test -d lib-cov; then rm -Rf lib-cov; fi
	
update:
	git pull origin; 	
	git submodule init;
	git submodule update;
	cd tdd_toy/; git merge origin/master; cd -;	
	
#-------------------------------------------	

#1 unit test
unit.execute: 
	./node_modules/expresso/deps/jscoverage/node-jscoverage lib lib-cov 
	./node_modules/expresso/bin/expresso tests/unit/*.test.js
	./node_modules/expresso/bin/expresso tests/unit/*.test.js --json logs/lib.coverage.json
	
#2 send beacon for crontab to deploy & trigger smoke
int.push.beacon:
	curl -X POST -d "coverage.json"=`cat logs\/lib.coverage.json` "http://ci.mallocworks.com/beacon.php?proj=Hacklets&env=int&machine=ci3"

#--------------------------------------------

.PHONY: unit
.DEFAULT: unit
