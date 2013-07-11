var topojson = require('topojson'),
    gju = require('geojson-utils'),
    path = require("path"),
    fs = require('fs')

module.exports = function(points, polygons, options) {
  var pointObjects = points.objects,
      polygonObjects = polygons.objects,
      polygonObjectKey = null,
      countKey = options.key

  for(polygonObjectKey in polygonObjects) {

    if(polygonObjects[polygonObjectKey].type !== 'GeometryCollection')
      continue

    var polygonGeometries = polygonObjects[polygonObjectKey].geometries,
      i = polygonGeometries.length

    while(i--) {
      var polygon = polygonGeometries[i],
          pointObjectKey = null

      // No support for multipolygons just yet
      if(polygon.type === 'MultiPolygon')
        continue

      process.stdout.write("Checking " + i + " polygon...\r")

      polygon = topojson.feature(polygons, polygon)

      for(pointObjectKey in pointObjects) {
        var pointGeometries = pointObjects[pointObjectKey].geometries,
            j = pointGeometries.length

        if(typeof polygon.properties[countKey] === 'undefined')
          polygon.properties[countKey] = 0

        while(j--) {
          var point = topojson.feature(points, pointGeometries[j])

          if(gju.pointInPolygon(point.geometry, polygon.geometry))
            polygon.properties[countKey] += 1
        }
      }

    }
  }

  if(options.out) {
    fs.writeFileSync(path.join(options.out), JSON.stringify(polygons), "utf8");
  } else {
    console.log(polygons)
  }
}