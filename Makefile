.PHONY: all worker
prepare:
	npx browserify src/app/worker.js -t [ babelify --presets [@babel/preset-env] ] -o public/worker.bundle.js
dev: prepare
	npx yarn run dev
