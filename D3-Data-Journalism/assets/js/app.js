//-- ====================================================================================
//-- Module16   D3 challenge homework           
//-- Date: 22-Aug-2022                                                             
//-- Note: Need to use 'python -m http.server' or localhost:8000 to run the script 
//-- Description:
//-- It's an interactive scatter chart display using d3 svg features
//-- Allow user to click on either xlabel or ylabel, then the chart will response 
//-- according.
//-- ==================================================================================== 
var svgWidth = window.innerWidth *0.7;
var svgHeight = window.innerHeight * 0.75;

var margin = {
  top: 10,
  right: 40,
  bottom: 100,
  left: 110
};

var width = svgWidth - margin.left - margin.right;
var height = svgHeight - margin.top - margin.bottom;

// Create a SVG wrapper, append group that will hold our chart, and shift the latter by left and top margins.
//===================================================================================
var svg = d3
  .select("#scatter")
  .append("svg")
  .attr("width", svgWidth)
  .attr("height", svgHeight);

//All in our chart is 1 group
var chartGroup = svg.append("g").attr("transform", `translate(${margin.left}, ${margin.top})`);
var chosenXAxis = "poverty";
var chosenYAxis = "healthcare";

// function used for updating x-scale var upon click on axis label
//===================================================================================
function xScale(censusData, chosenXAxis) {
  var xLinearScale = d3.scaleLinear()
    .domain([d3.min(censusData, d => d[chosenXAxis]) * 0.75, d3.max(censusData, d => d[chosenXAxis]) * 1.1])
    .range([0, width]);
  return xLinearScale;
}
function yScale(censusData, chosenYAxis) {
  var yLinearScale = d3.scaleLinear()
    .domain([d3.min(censusData, d => d[chosenYAxis]) * 0.25, d3.max(censusData, d => d[chosenYAxis]) * 1.15])
    .range([height, 0]);
  return yLinearScale;
}

// function used for updating xAxis and yAxis var upon click on axes labels
//===================================================================================
function renderXAxes(newXScale, xAxis) {
  var bottomAxis = d3.axisBottom(newXScale);
  xAxis.transition()
    .duration(1000)
    .call(bottomAxis);
  return xAxis;
}
function renderYAxes(newYScale, yAxis) {
  var leftAxis = d3.axisLeft(newYScale);
  yAxis.transition()
    .duration(1000)
    .call(leftAxis);
  return yAxis;
}

// Update circles group and text with a transition to new circles
// ==================================================================================
function renderCircles(circlesGroup, newXScale, newYScale, chosenXAxis, chosenYAxis) {
  circlesGroup.transition()
    .duration(1000)
    .attr("cx", d => newXScale(d[chosenXAxis]))
    .attr("cy", d => newYScale(d[chosenYAxis]));
  return circlesGroup;
}
function renderCirclesText(circlesText, newXScale, newYScale, chosenXAxis, chosenYAxis) {
  circlesText.transition()
    .duration(1000)
    .attr("dx", d => newXScale(d[chosenXAxis]) - 8)
    .attr("dy", d => newYScale(d[chosenYAxis]) + 4);
  return circlesText;
}

// Update circles group and text with new tooltip
// ===================================================================================
function updateToolTip(chosenXAxis, chosenYAxis, circlesGroup, circlesText) {

  if (chosenXAxis === "poverty") {
    var labelX = "In Poverty: ";   }
  else if (chosenXAxis === "age") {
    var labelX = "Age (Median): "; }
  else {
    var labelX = "Household Income (Median): ";  }

  if (chosenYAxis === "obesity") {
    var labelY = "Obese (%): ";    }
  else if (chosenYAxis === "healthcare") {
    var labelY = "Lacks Healthcare (%): ";  }
  else {
    var labelY = "Smokes (%): "; }

  var toolTip = d3.tip()
      .attr("class", "d3-tip")
      .offset([80, -60])
      .html(function (d) {
        return (`<h6>${d.state}(${d.abbr})</h6>${labelX} ${d[chosenXAxis]}<br>${labelY} ${d[chosenYAxis]}`);
      })

  circlesGroup.call(toolTip);
  circlesGroup
    .on("mouseover", function(data) {toolTip.show(data, this); })
    .on("mouseout", function(data) {toolTip.hide(data); });

  circlesText.call(toolTip);    
  circlesText
  .on("mouseover", function(data) {toolTip.show(data, this);})
  .on("mouseout", function(data) {toolTip.hide(data); });
  
  return circlesGroup;
}

//===============================================================================
// Retrieve data from the CSV file and execute everything below
//===============================================================================
d3.csv("assets/data/data.csv").then(function (censusData) {
  // parse data
  censusData.forEach(function (data) {
    data.poverty = +data.poverty;
    data.age = +data.age;
    data.income = +data.income;
    data.obesity = +data.obesity;
    data.healthcare = +data.healthcare;
    data.smokes = +data.smokes;
  });

  // xLinearScale & yLinearScale
  var xLinearScale = xScale(censusData, chosenXAxis);
  var yLinearScale = yScale(censusData, chosenYAxis);

  // Create initial axis functions
  var bottomAxis = d3.axisBottom(xLinearScale);
  var leftAxis = d3.axisLeft(yLinearScale);

  // append x axis
  var xAxis = chartGroup.append("g")
    .classed("x-axis", true)
    .attr("transform", `translate(0, ${height})`)
    .call(bottomAxis);

  // append y axis
  var yAxis = chartGroup.append("g")
    .call(leftAxis);

  // Create Circles and text
  // ===========================================================================
  // new group for circles and text:
  var elementCircle = chartGroup.append("g");

  // append initial circles 
  var circlesGroup = elementCircle.selectAll("circle")
    .data(censusData).enter().append("circle")
    .attr("cx", d => xLinearScale(d[chosenXAxis]))
    .attr("cy", d => yLinearScale(d[chosenYAxis]))
    .attr("r", 15)
    .attr("fill", "lightblue")    
    .attr("stroke", "blue")
    .attr("opacity", ".75");
 
  var circlesText = elementCircle.selectAll("text")
    .data(censusData).enter().append("text")
    .attr("dx", d => xLinearScale(d[chosenXAxis]) - 8) // if font size changed, adjust dx and dy to make text centre again
    .attr("dy", d => yLinearScale(d[chosenYAxis]) + 4)
    .text(function (d) { return d.abbr })
    .attr("font-size", "12")
    .attr("font-weight", "bold")

  // Create x-axis and y-axis groups and labels
  //================================================================================
  // Create group for 3 XAxis labels
  var labelsXGroup = chartGroup.append("g")
    .attr("transform", `translate(${width / 2}, ${height + 20})`);

  var label_font_size = "16";
  var povertyLabel = labelsXGroup.append("text")
    .attr("x", 0).attr("y", 20)
    .attr("value", "poverty").classed("active", true)
    .attr("font-size", label_font_size).attr("font-weight", "bold")
    .text("In Poverty (%)");

  var ageLabel = labelsXGroup.append("text")
    .attr("x", 0).attr("y", 45)
    .attr("value", "age").classed("inactive", true)
    .attr("font-size", label_font_size).attr("font-weight", "bold")
    .text("Age (Median)");

  var incomeLabel = labelsXGroup.append("text")
    .attr("x", 0).attr("y", 70)
    .attr("value", "income").classed("inactive", true)
    .attr("font-size", label_font_size).attr("font-weight", "bold")
    .text("Household Income (Median)");

  // Create group for 3 YAxis labels
  var labelsYGroup = chartGroup.append("g")
    .attr("transform", "rotate(-90)");

  var healthcareLabel = labelsYGroup.append("text")
    .attr("y", 0 - margin.left + 80).attr("x", 0 - (height / 2))
    .attr("value", "healthcare").classed("active", true)
    .attr("font-size", label_font_size).attr("font-weight", "bold")
    .text("Lacks Healthcare (%)");

  var smokesLabel = labelsYGroup.append("text")
    .attr("y", 0 - margin.left + 50).attr("x", 0 - (height / 2))
    .attr("value", "smokes").classed("inactive", true)
    .attr("font-size", label_font_size).attr("font-weight", "bold")
    .text("Smokes (%)");

  var obeseLabel = labelsYGroup.append("text")
    .attr("y", 0 - margin.left + 20).attr("x", 0 - (height / 2))
    .attr("value", "obesity").classed("inactive", true)
    .attr("font-size", label_font_size).attr("font-weight", "bold")
    .text("Obese (%)");

  // updateToolTip function above csv import
  var circlesGroup = updateToolTip(chosenXAxis, chosenYAxis, circlesGroup, circlesText);

  // x axis labels event listener====================================================
  labelsXGroup.selectAll("text")
    .on("click", function () {
      // get value of selection
      var value = d3.select(this).attr("value");
      if (value !== chosenXAxis) {
        chosenXAxis = value;
        xLinearScale = xScale(censusData, chosenXAxis);

        // update x axis with transition
        xAxis = renderXAxes(xLinearScale, xAxis);

        // update circles with new x values
        circlesGroup = renderCircles(circlesGroup, xLinearScale, yLinearScale, chosenXAxis, chosenYAxis);
        circlesText = renderCirclesText(circlesText, xLinearScale, yLinearScale, chosenXAxis, chosenYAxis);

        // update tooltips with new info
        circlesGroup = updateToolTip(chosenXAxis, chosenYAxis, circlesGroup, circlesText);

        // change label classes to bold text for active selection
        if (chosenXAxis === "poverty") {
          povertyLabel.classed("active", true).classed("inactive", false);
          ageLabel.classed("active", false).classed("inactive", true);
          incomeLabel.classed("active", false).classed("inactive", true);
        }
        else if (chosenXAxis === "age") {
          povertyLabel.classed("active", false).classed("inactive", true);
          ageLabel.classed("active", true).classed("inactive", false);
          incomeLabel.classed("active", false).classed("inactive", true);
        }
        else {
          povertyLabel.classed("active", false).classed("inactive", true);
          ageLabel.classed("active", false).classed("inactive", true);
          incomeLabel.classed("active", true).classed("inactive", false);
        }    
      } // end of  value !== chosenYAxis
    }); // end of 'click' of labelsXGroup

  // y axis labels event listener =================================================
  labelsYGroup.selectAll("text")
    .on("click", function () {

      // get value of selection
      var value = d3.select(this).attr("value");
      if (value !== chosenYAxis) {
        chosenYAxis = value;
        yLinearScale = yScale(censusData, chosenYAxis);

        // update y axis with transition
        yAxis = renderYAxes(yLinearScale, yAxis);

        // update circles with new y values
        circlesGroup = renderCircles(circlesGroup, xLinearScale, yLinearScale, chosenXAxis, chosenYAxis);
        circlesText = renderCirclesText(circlesText, xLinearScale, yLinearScale, chosenXAxis, chosenYAxis);

        // updates tooltips with new info
        circlesGroup = updateToolTip(chosenXAxis, chosenYAxis, circlesGroup, circlesText);

        // change label classes to bold text for active selection
        if (chosenYAxis === "obesity") {
          obeseLabel.classed("active", true).classed("inactive", false);
          healthcareLabel.classed("active", false).classed("inactive", true);
          smokesLabel.classed("active", false).classed("inactive", true);
        }
        else if (chosenYAxis === "healthcare") {
          obeseLabel.classed("active", false).classed("inactive", true);
          healthcareLabel.classed("active", true).classed("inactive", false);
          smokesLabel.classed("active", false).classed("inactive", true);
        }
        else {
          obeseLabel.classed("active", false).classed("inactive", true);
          healthcareLabel.classed("active", false).classed("inactive", true);
          smokesLabel.classed("active", true).classed("inactive", false);
        }
      } // end of  value !== chosenYAxis
    }); // end of 'click' of labelsYGroup

}).catch(function(error) {
  console.log(error);
});