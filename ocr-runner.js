var PNG = require('pngjs').PNG;
var tools = require('./tools.js');
var fs = require('fs');
var synaptic = require('synaptic');
// var ocr = require('./ocr.js');
var ocr_json = require('./ocr.json');

fs.createReadStream(process.argv[2])
    .pipe(new PNG({
              filterType: 4
          }))
    .on('parsed', function() {
      var position,
          chunk = [],
          pixel = [],
          i, j, k, x, y;
      
      for(y = 0; y < this.height; y++) {
        for(x = 0; x < this.width; x++) {
          position = (this.width * y + x) << 2;

          for(j = 0; j < 3; j++)
            pixel.push(this.data[position + j]);

          chunk.push(
            pixel.reduce(function(previous, current) {
              return previous + current;
            }) > 400
          );
          pixel = [];
        }
      }
      
      // chunk = tools.center(chunk);
      console.log(JSON.stringify(chunk));

      var ocr = synaptic.Network.fromJSON(ocr_json);

      var output = ocr
        .activate(chunk)
        .map(function(bit) {
          return bit > 0.5 ? 1 : 0;
        });

      var character = String.fromCharCode(parseInt(output.join(''), 2));
      console.log(JSON.stringify(output));
      console.log(character);
    });

