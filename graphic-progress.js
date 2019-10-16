//annotation is the text, the coordinates underneath is 
//do the draw thing when you want to transition between different states



(function () {
  var width = 900;
  var height = 500;

  var canvas = d3.select("#graphic")
    .append('canvas')
    .attr('width', width)
    .attr('height', height)

  var context = canvas.node().getContext('2d')

  var projection = d3.geoMercator()
    .scale(1000)
    .translate([width / 2, height / 2]);

  var path = d3.geoPath()
    .projection(projection)

// this is a list of images were going to scroll through
  const layers = [
    {
      'name': 'southamerica-farther',
      'filePath': 'images/southamerica-merc-25pct.jpg',
      'cornerCoords': [[ -108.816666669949,   24.1916666628633],    [ -19.8556513797124, -58.85]],
      'fadesWith': 'waypoint',
      'z-index': -3
    },
    {
      'name': 'southamerica-closer', 
      'filePath': 'images/southamerica-closer.jpg',
      'cornerCoords': [[ -81.5625, -10.660607108893062 ] , [ -52.38281249999999, -26.78484736105055 ]],
      'fadesWith': 'waypoint',
      'z-index': -3
    },
    {
      'name': 'lake',
      'filePath': 'images/lake.jpg',
      'cornerCoords': [[ -70, -16 ] , [ -64, -22 ]],
      'fadesWith': 'waypoint',
      'z-index': -3
    },
    {
      'name': 'lake-closer',
      'filePath': 'images/lake-closer.jpg',  
      'cornerCoords': [[ -68.00013888888888, -17.999860763549805 ] , [ -65.9998611111111, -20.000139236450195 ]],
      'fadesWith': 'waypoint',
      'z-index': -3
    }
  ]


//need a unique slug 
//focus is the cetnering point 

  const waypoints = [
    {
      slug:'zero',
      zoom: 700, 
      mobilezoom: 12.3,
      focus: [-57.86, -25.50],
      visibleLayers: ['southamerica-farther'],
      annotations: [
        {
          text: 'first bit of text at zero',
          coords: [-57.86, -25.50]
        }
      ]
    },
    {
      slug:'one',
      zoom: 700, 
      mobilezoom: 12.3,
      focus: [-57.86, -25.50],
      visibleLayers: ['southamerica-farther'],
      annotations: [
        {
          text: 'second bit of text at one',
          coords: [-56.86, -25.50]
        },
      ]
    },
    {
      slug:'two',
      zoom: 3000,
      mobilezoom: 14.0,
      focus: [-67.05, -18.79],
      visibleLayers: ['southamerica-farther','southamerica-closer'],
      annotations: [
        {
          text: 'text at two',
          coords: [-67.05, -18.79]
        },
      ]
    },
    {
      slug:'three',
      zoom: 4000,
      mobilezoom: 17.0,
      focus: [-67.05, -18.79],
      visibleLayers: ['southamerica-farther', 'southamerica-closer', 'lake'],
      annotations: [
        {
          text: 'more text at three',
          coords: [-69.05, -18.79]
        },
      ]
    },
    {
      slug:'four',
      zoom: 6000,
      mobilezoom: 18.0,
      focus: [-67.05, -18.79],   
      visibleLayers: ['southamerica-closer', 'lake', 'lake-closer'],
      annotations: []
    },
    {
      slug:'five',
      zoom: 12000,
      mobilezoom: 18.1,
      focus: [-67.05, -18.79],  
      visibleLayers: ['lake', 'lake-closer'],
      annotations: []
    },
    {
      slug:'six',
      zoom: 30000,
      mobilezoom: 18.2,
      focus: [-67.05, -18.79],  
      visibleLayers: ['lake', 'lake-closer'],
      annotations: []
    }
  ]

  let loadImages = Promise.all(
    layers.map(d => {
      return new Promise((resolve, reject) => {
        var image = new Image()
        image.onload = function() {
          console.log('finished reading something in')
          d.imageObj = image
          d.height = image.height
          d.width = image.width
          resolve()
        }
        image.src = d.filePath
      })
    })
  )

  loadImages.then(ready)

  function ready() {
    var annotationLayers = d3.select(canvas.node().parentNode)
      .style('position', 'relative')
      .append('div')
      .selectAll('div')
      .data(waypoints)
      .enter().append('div')
      .attr('class', d => 'annotations-for-' + d.slug)
      .style('opacity', 0)

    annotationLayers.selectAll('div')
      .data(d => d.annotations)
      .enter().append('div')
      .html(d => d.text)
      .attr('class', 'annotation')
      .style('position', 'absolute')
      .style('width', '200px')

    var annotations = annotationLayers.selectAll('.annotation')

    function positionAnnotations () {
      annotations.style('top', d => projection(d.coords)[1] + 'px')
        .style('left', d => projection(d.coords)[0] + 'px')
        .style('color', 'white')
        .style('font-weight', 'bold')
        .style('font-size', '16px')
    }

    function drawWaypoint (waypoint) {
      projection
        .center(waypoint.focus)
        .scale(waypoint.zoom)

      context.clearRect(0, 0, width, height)
      waypoint.visibleLayers.forEach(layerName => {
        layer = layers.find(d => d.name == layerName)
        drawLayer(layer)
      })
      positionAnnotations()
    }

    function drawBetweenWaypoints(waypoint0, waypoint1, progress) {
      let zoom = d3.interpolateNumber(waypoint0.zoom, waypoint1.zoom)(progress)
      let focus = [
        d3.interpolateNumber(waypoint0.focus[0], waypoint1.focus[0])(progress),
        d3.interpolateNumber(waypoint0.focus[1], waypoint1.focus[1])(progress),
      ]

      projection
        .center(focus)
        .scale(zoom)

      context.clearRect(0, 0, width, height)

      waypoint0.visibleLayers.forEach(layerName => {
        layer = layers.find(d => d.name == layerName)
        drawLayer(layer)
      })

      waypoint1.visibleLayers.forEach(layerName => {
        layer = layers.find(d => d.name == layerName)
        drawLayer(layer)
      })

      d3.select('.annotations-for-' + waypoint0.slug)
        .style('opacity', 1 - progress)

      d3.select('.annotations-for-' + waypoint1.slug)
        .style('opacity', progress)

      positionAnnotations()
    }

    function drawLayer (layer) {
      var screenCoords = [ projection(layer.cornerCoords[0]), projection(layer.cornerCoords[1]) ]

      var topLeft     = screenCoords[0],
          bottomRight = screenCoords[1],
          imageWidth  = bottomRight[0] - topLeft[0],
          imageHeight = bottomRight[1] - topLeft[1];

      context.drawImage(layer.imageObj, topLeft[0], topLeft[1], imageWidth, imageHeight)
    }

    d3.select("#step-1").on('stepin', function() {
      drawWaypoint(waypoints[0])
    })

    d3.select("#step-2").on('stepin', function() {
      console.log(d3.event.detail.progress)
      drawWaypoint(waypoints[1])
    })

    d3.select("#step-3").on('stepin', function() {
      drawWaypoint(waypoints[2])
    })

    d3.select("#step-4").on('stepin', function() {
      drawWaypoint(waypoints[3])
    })

    d3.select("#step-5").on('stepin', function() {
      drawWaypoint(waypoints[4])
    })

    d3.select("#step-6").on('stepin', function() {
      drawWaypoint(waypoints[5])
    })

    d3.select("#step-7").on('stepin', function() {
      drawWaypoint(waypoints[6])
    })

    d3.select("#step-1").on('progress', function() {
      drawBetweenWaypoints(waypoints[0], waypoints[1], d3.event.detail.progress)
    })

    d3.select("#step-2").on('progress', function() {
      drawBetweenWaypoints(waypoints[1], waypoints[2], d3.event.detail.progress)
    })

    d3.select("#step-3").on('progress', function() {
      drawBetweenWaypoints(waypoints[2], waypoints[3], d3.event.detail.progress)
    })

    d3.select("#step-4").on('progress', function() {
      drawBetweenWaypoints(waypoints[3], waypoints[4], d3.event.detail.progress)
    })

    d3.select("#step-5").on('progress', function() {
      drawBetweenWaypoints(waypoints[4], waypoints[5], d3.event.detail.progress)
    })

    d3.select("#step-6").on('progress', function() {
      drawBetweenWaypoints(waypoints[5], waypoints[6], d3.event.detail.progress)
    })

    d3.select("#step-7").on('progress', function() {
      drawBetweenWaypoints(waypoints[6], waypoints[7], d3.event.detail.progress)
    })
  }

})()