/* eslint-disable */
import 'c3/c3.min.css';
import c3 from 'c3';
import {fetchData} from '../../Fetch';

const baseURL = window.location.origin;

// Colours for all charts broken down by multiple fields
const pieColours = [
  '#F0CC00', '#27328C', '#2DC3D0', '#4AE8C2', '#D90074', '#7900DB', '#FF8000',
  '#0FB500', '#CC0000', '#DB9CFF', '#8c564b', '#c49c94', '#e377c2', '#f7b6d2',
  '#7f7f7f', '#c7c7c7', '#bcbd22', '#dbdb8d', '#17becf', '#9edae5',
];

// Colours for bar charts with 2 fields
const barColours = ['#2FA4E7', '#1C70B6'];

/**
 * onload - override link click to cancel any fetch for statistical data.
 */
window.onload = () => {
  document.body.addEventListener('click', (e) => {
    // User clicks on a link..
    if (
      e.target &&
      e.target.nodeName === 'A' &&
      e.target.hasAttribute('data-target') === false
    ) {
      window.stop();
    } else if (
      e.target &&
      e.target.nodeName === 'A' &&
      e.target.hasAttribute('data-target') === true
    ) {
      const myTimeout = setTimeout(() => {
        resizeGraphs();
        clearTimeout(myTimeout);
      }, 500);
    }
  });
};

let charts = []
const resizeGraphs = () => {
  charts.forEach((chart) => {
    if (chart !== undefined) {
      elementVisibility(chart.element, (visible) => {
        if (visible) {
          chart.resize();
        }
      })
    }
  })
};

/**
 * elementVisibility - used to resize charts when element becomes visible.
 * @param {HTMLElement} element
 * @param {function} callback
 */
const elementVisibility = (element, callback) => {
  const options = {
    root: document.documentElement,
  };
  const observer = new IntersectionObserver((entries, observer) => {
    entries.forEach((entry) => {
      callback(entry.intersectionRatio > 0);
    });
  }, options);
  observer.observe(element);
};

const createBasicChart = (chartType, data, id, targetModal, colours) => {
  let newChart = c3.generate({
    bindto: targetModal ? targetModal : id,
    data: {
      x: 'x',
      // rows for pie and columns for bar
      rows: chartType == 'pie' ? data : null,
      columns: chartType == 'bar' ? data : null,
      type: chartType,
      color: (color, d) =>  data.length <= 2 && chartType == 'bar' ? colours[d.x] : color
    },
    size: {
      width: targetModal ? 700 : 350,
      height: targetModal ? 700 : 350,
    },
    axis: {
      x: {
        type: 'category',
      },
      y: {
        label: {
          text: 'Candidates registered',
          position: 'inner-top'
        },
      },
    },
    tooltip: data.length <= 2 && chartType == 'bar' ? {
      contents: function(d, defaultTitleFormat, defaultValueFormat, color) {
          return newChart.internal.getTooltipContent.call(this, d, defaultTitleFormat, defaultValueFormat, () =>  colours[d[0].x])
      }
    } : null,
    legend: chartType === 'bar' && data.length > 2 ? {
      position: 'inset',
      inset: {
        anchor: 'top-right',
        x: 20,
        y: 10,
        step: 2
      },
    } : targetModal ? {
        show: true
      } : {
        show: false
      }
  });
  charts.push(newChart);
  resizeGraphs();
}

const createLineChart = (data, columns, id, label, targetModal) => {
  let newChart = c3.generate({
    size: {
      height: targetModal && 1000,
      width: targetModal && 1000
    },
    bindto: targetModal ? targetModal : id,
    data: {
      x: 'x',
      xFormat: '%m-%Y',
      columns: columns,
      type: 'area-spline',
    },
    legend: {
      show: targetModal ? true : false,
    },
    axis: {
      x: {
        type: 'timeseries',
        tick: {
          format: '%m-%Y',
        },
      },
      y: {
        max: maxY(data),
        label: label,
      },
    },
    zoom: {
      enabled: true,
    },
    color: {
      pattern: barColours,
    },
    tooltip: {
      // hide if 0
      contents: function (d, defaultTitleFormat, defaultValueFormat, color) {
        let $$ = this,
          config = $$.config,
          titleFormat = config.tooltip_format_title || defaultTitleFormat,
          nameFormat = config.tooltip_format_name || function (name) { return name; },
          valueFormat = config.tooltip_format_value || defaultValueFormat,
          text, i, title, value, name, bgcolor;
        for (i = 0; i < d.length; i++) {
          if (d[i] && d[i].value == 0) { continue; }

          if (! text) {
            title = titleFormat ? titleFormat(d[i].x) : d[i].x;
            text = "<table class='" + $$.CLASS.tooltip + "'>" + (title || title === 0 ? "<tr><th colspan='2'>" + title + "</th></tr>" : "");
          }

          name = nameFormat(d[i].name);
          value = valueFormat(d[i].value, d[i].ratio, d[i].id, d[i].index);
          bgcolor = $$.levelColor ? $$.levelColor(d[i].value) : color(d[i].id);

          text += "<tr class='" + $$.CLASS.tooltipName + "-" + d[i].id + "'>";
          text += "<td class='name'><span style='background-color:" + bgcolor + "'></span>" + name + "</td>";
          text += "<td class='value'>" + value + "</td>";
          text += "</tr>";
        }
        return text + "</table>";
      }

    }
  });
  charts.push(newChart);
  resizeGraphs();
}

const getChartData = async (target, filters) => {
  let query = `${baseURL}/statistics/charts/${target}`
  if (filters) {
    query = query + filters;
  }

  return await fetchData(query);
}

/**
 * setupCharts - fetch data for charts
 * If data is provided, use that instead of fetching
 * There are three types of data provided. Pie, bar and line
 * This is determined by the original chart type of the data provided from the API
 * If data was provided as a Pie, and the requested chartType is Bar, then the data will be reformatted
 */
const setupCharts = async (targetIsModal, chartDetails) => {
  const chartPromises = [];
  let newChartDetails = {...chartDetails}
  Object.keys(chartDetails).forEach((panel) => {
    Object.keys(chartDetails[panel]).forEach((chartID) => {
      let chart = chartDetails[panel][chartID];
      let data = chart.data;
      const chartPromise = (data && !chart.filters ? Promise.resolve(data) : getChartData(chartID, chart.filters))
        .then((chartData) => {
          let columns = [];
          let colours = [];
          if (chart.chartType === 'line') {
            columns = formatLineData(chartData);
            createLineChart(chartData, columns, `#${chartID}`, chart.label, targetIsModal && '#dashboardModal');
          } else {
            // pie or bar chart
            if (chart.chartType === 'pie') {
              columns = formatDataForPie(chartData);
              colours = pieColours;
            } else if (chart.chartType === 'bar'){
              colours = pieColours;
              columns = chartData;
            }
            createBasicChart(chart.chartType, columns, `#${chartID}`, targetIsModal && '#dashboardModal', colours);
          }
          newChartDetails[panel][chartID].data = chartData;
        });
      chartPromises.push(chartPromise);
    });
  });

  await Promise.all(chartPromises);
  return newChartDetails;
};

/**
 * formatDataForPie - used for the study progression widget
 * @param {*[]} data
 * @return {*[]}
 */
// If the data was in a multi-dimensional form,
// then it must be aggregated for use in a pie chart.
// ie: if charts.class.inc returns data such as:
// [[x, Montreal, Ottawa, Montreal, Ottawa],[Male, x,...],[Female, y,...]]
// We want the data to look like:
// [[x, Montreal Male, Ottawa Male, Montreal Female, Ottawa Female],[-1, x,..., y,...]]
function formatDataForPie(data) {
  if (data[0].length > data[1].length) {
    const processedData = [];

    // Create the first row with the updated headers
    const headers = ['x'];
    for (let i = 1; i < data.length; i++) {
      for (let j = 1; j < data[i].length; j++) {
        headers.push(data[0][j] + ' ' + data[i][0]);
      }
    }
    processedData.push(headers);
  
    // Create the second row with the values
    const values = [];
    for (let i = 1; i < data.length; i++) {
        if (i === 1) {
            values.push(-1, ...data[i].slice(1));
        } else {
            values.push(...data[i].slice(1));
        }
    }
    processedData.push(values);
  
    return processedData; 
  } else {
    return data;
  }
}

/**
 * formatLineData - used for the study progression widget
 * @param {object} data
 * @return {*[]}
 */
const formatLineData = (data) => {
  const processedData = [];
  const labels = [];
  labels.push('x');
  for (const [i] of Object.entries(data.labels)) {
    labels.push(data.labels[i]);
  }
  processedData.push(labels);
  for (const [i] of Object.entries(data['datasets'])) {
    const dataset = [];
    dataset.push(data['datasets'][i].name);
    processedData.push(dataset.concat(data['datasets'][i].data));
  }
  const totals = [];
  totals.push('Total');
  for (let j = 0; j < data['datasets'][0].data.length; j++) {
    let total = 0;
    for (let i = 0; i < data['datasets'].length; i++) {
      total += parseInt(data['datasets'][i].data[j]);
    }
    totals.push(total);
  }
  processedData.push(totals);
  return processedData;
};

/**
 * maxY - used for the study progression widget
 * @param {object} data
 * @return {number}
 */
const maxY = (data) => {
  let maxi = 0;
  for (let j = 0; j < data['datasets'][0].data.length; j++) {
    for (let i = 0; i < data['datasets'].length; i++) {
      maxi = Math.max(maxi, parseInt(data['datasets'][i].data[j]));
    }
  }
  return maxi;
};

export {
  // following used by WidgetIndex.js,
  // recruitment.js and studyProgression.js
  setupCharts,
};