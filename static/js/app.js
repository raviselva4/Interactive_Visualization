/** Data structure
 *   metadata: [ List of dictionary array for all individuals]
 *           [   {
 *                   age         :
 *                   bbtype      :
 *                   ethnicity   :
 *                   gender      :
 *                   id          :
 *                   location    :
 *                   wfreq       :
 *               }
 *           ]
 *  names: [ List of id's]
 *  samples: [id, otu_ids, otu_labels, sample_values]
 *      [ {     id              : single id value for an individual
 *              otu_ids         : [ list of values for the individual ]
 *              otu_labels      : [ list of values for the individual ]
 *              sample_values   : [ list of values for the individual ]
 *        }]
***/
/**   Data Testing area
 * 
 *  console.log("Main Data:", bbbDataset);
 *  console.log("samples:", bbbDataset.samples);
 *  console.log("metadata:", bbbDataset.metadata);
 *  console.log("ids:", bbbDataset.names);
 * 
***/

// Changing container style first
var vcont = d3.select(".container");
vcont.classed("container", false);
vcont.classed("container-fluid", true);

// Read Json file using D3
// 
d3.json("samples.json").then(function(bbbDataset) {

  // Extract Individual Ids

  var individualIds = bbbDataset.names;

  // Part-1 :  Generating dropdown individuls id

  // Append individulas id using d3
  var rowSelect = d3.select("#selDataset");
  individualIds.forEach(function(id) {
    var option = rowSelect.append("option");
    option.text(id);
  });

  function showData(inputVal) {

    // Filter sample data record 

    var filteredSample = bbbDataset.samples.filter(data => data.id == inputVal);
    console.log("Sample Row : ", filteredSample);
    
    // Extract sample_values
    var sampleValues = filteredSample[0].sample_values;
    // console.log("Sample Values:", sampleValues);

    // Checking if we have sample values otherwise resetting to default
    if (sampleValues.length == 0) {
      alert("No Samples found for this Id. Setting back to Default Id. Try again!!!");
      d3.select("#selDataset").node().value = "940";
      inputVal = '940';
      var filteredSample = bbbDataset.samples.filter(data => data.id == inputVal);
      var sampleValues = filteredSample[0].sample_values;
      // tmp.this.value.reset();
      // console.log("Before Return:", tmp);
      // return;
    };

    // Extract Demographic data record 

    var filteredDemorow = bbbDataset.metadata.filter(data => data.id == inputVal);
    console.log("Metadata Row : ", filteredDemorow);

    // Part-2 : Display Demographic Info

    var pbody = d3.select(".panel-body");
    Object.entries(filteredDemorow[0]).forEach(([key, value]) => {
      var para = pbody.append("small");
      para.text(`${key}: ${value}`);
      para.append("br");
      // console.log(`${key}: ${value}`);
    });

    // Slice Top 10 sample values

    var sampleValuestop10 = sampleValues.slice(0, 10).reverse();
    // var slicedValues = sampleValues.slice(0, 10);
    // var reversedValues = slicedValues.reverse();
    // var sampleValuestop10 = reversedValues.map((x) => parseInt(x));
    console.log("Sample Values:", sampleValuestop10);
 
    // Extract otu_ids
    var otuids = filteredSample[0].otu_ids;
    var slicedOtuids = otuids.slice(0, 10).reverse();
    var otuidsTop10 = slicedOtuids.map(function(oi) { return 'OTU '+oi; });
    // var  otuidsTop10 = otuids.slice(0, 10);
    console.log("Otu Ids:", otuidsTop10);
    
    // Extract otu_labels
    var  otulabels = filteredSample[0].otu_labels;
    var  otulabelsTop10 = otulabels.slice(0, 10).reverse();
    // var  otulabelsTop10 = otulabels.slice(0, 10);
    console.log("Otu Labels:", otulabelsTop10);

    // Plot preparation
    var trace1 = {
      x: sampleValuestop10,
      y: otuidsTop10,
      text: otulabelsTop10,
      type: 'bar',
      orientation: "h",
    };
    var layout = {
      height: 500,
      margin: {
        t: 10,
        l: 100,
        r: 100
      }
    }
    // var config = {
    //   staticPlot: true,
    //   displayModeBar: false
    // }

    // Create a data array
    var top10 = [trace1];

    // Part-3 : Render the bar chart
    Plotly.newPlot("bar", top10, layout, {displayModeBar: false});

    // Part-4 : Render bubble chart

    var trace2 = {
      x: otuids,
      y: sampleValues,
      text: otulabels,
      mode: 'markers',
      marker: {
        size: sampleValues,
        color: otuids,
        colorscale: 'Earth'
      }
    };

    var layout2 = {
      height: 500,
      margin: {
        t: 10
      }
    };

    // Create a data array
    var bubbleData = [trace2];

    // Render the plot
    Plotly.newPlot("bubble", bubbleData, layout2, {displayModeBar: false});

    // Part-5 : Gauge Chart
    var washFrequency = filteredDemorow[0].wfreq;
    console.log("Wash Frequency :", washFrequency);

    /****
     *          Indicator method to plot guage meter
     * 
    var trace3 = [{
      domain: { x: [0, 1], y: [0, 1] },
      type: "indicator",
      value: washFrequency,
      mode: "gauge+number",
      gauge: { axis: { range: [0, 9] } },
      title: {
        text: 
          "Belly Button Washing Frequency<br><span style='font-size:0.8em'>Scrubs per Week</span>"
      }
    }];

    var layout3 = {
      margin: {
        t: 0
      }
    };
    *
    ***/

    // Plotly.newPlot("gauge", trace3, layout3, {displayModeBar: false});

    // Enter a level between 0 and 9
    var level = washFrequency;
    if (level == null) {
      level = 0;
    }

    // Trig to calc meter point
    var degrees = 180-(level)*20;
    radius = .9;
    var radians = degrees * Math.PI / 180;
    var x = radius * Math.cos(radians);
    var y = radius * Math.sin(radians);

    // Path: triangle
    var mainPath = 'M -.0 -0.030 L .0 0.030 L ',
        pathX = String(x),
        space = ' ',
        pathY = String(y),
        pathEnd = ' Z';
    var path = mainPath.concat(pathX,space,pathY,pathEnd);

    var trace33 = [{ type: 'category',
      x: [0], y:[0],
      marker: {size: 23, color:'850000'},
      showlegend: false,
      opacity: 0.7,
      name: 'Wash Frequency',
      text: level,
      hoverinfo: 'text+name'},
      {
      title: {
        text: 
          "<b>Belly Button Washing Frequency</b><br><span style='font-size:0.8em'>Scrubs per Week</span>"
      },
      rotation: 90,
      values: [10, 10, 10, 10, 10, 10, 10, 10, 10, 90],
      text: ["0-1","1-2","2-3","3-4","4-5","5-6","6-7","7-8","8-9"],
      textinfo: 'text',
      textposition: "inside",
      direction: "clockwise",
      marker: {
        colors: ['rgb(225, 232, 213)','rgb(219, 237,187)','rgb(210, 247, 146)','rgb(188, 230, 119)','rgb(197, 224, 146)',
                 'rgb(166, 204, 102)','rgb(89,182,91)','rgb(65,169,76)','rgb(105,155,103)','white']
      },
      labels: ["0-1","1-2","2-3","3-4","4-5","5-6","6-7","7-8","8-9"," "],
      // hoverinfo: "label",
      hoverinfo: 'skip',
      hole: .4,
      type: 'pie',
      showlegend: false
    }];

    var layout33 = {
      shapes:[{
        type: 'path',
        path: path,
        fillcolor: '850000',
        opacity: 0.5,
        line: { color: '850000' }
        }],
      annotations: [{
        font: {size: 40, color: '850000'},
        showarrow: false,
        text: level,
        x: 0.0,
        y: 0.3
      }],
      height: 500,
      width: 700,
      xaxis: {visible: false, range: [-1, 1]},
      yaxis: {visible: false, range: [-1, 1]},
      margin: {
        t: 0,
        r: 200,
        l: 0,
        b: 10
      }
    };

    Plotly.newPlot("gauge", trace33, layout33, {displayModeBar: false});

  };

  showData(individualIds[0]);

  rowSelect.on("change", function() {
    var indval = rowSelect.property("value");
    console.log("Selected Id : ", indval);
    d3.select(".panel-body").selectAll("small").remove();
    // prevent page from refreshing
	  d3.event.preventDefault();
    showData(indval);
  }) 

});



