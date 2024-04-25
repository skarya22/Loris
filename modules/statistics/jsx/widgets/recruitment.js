import React, {useEffect, useState} from 'react';
import PropTypes from 'prop-types';
import Loader from 'Loader';
import Panel from 'Panel';
import {QueryChartForm} from './helpers/queryChartForm';
import {progressBarBuilder} from './helpers/progressbarBuilder';
import {SelectElement, FormElement, TextboxElement, TagsElement, SearchableDropdown} from 'jsx/Form';

import {fetchData} from '../Fetch';
import {setupCharts} from './helpers/chartBuilder';

/**
 * Recruitment - a widget containing statistics for recruitment data.
 *
 * @param {object} props
 * @return {JSX.Element}
 */
const Recruitment = (props) => {
  const [loading, setLoading] = useState(true);
  let json = props.data;

  const [chartDetails, setChartDetails] = useState({});

  const showChart = (panelID, chartID) => {
    return props.showChart(panelID, chartID, chartDetails, setChartDetails);
  };

  const updateFilters = (formDataObj, section) => {
    props.updateFilters(formDataObj, section, chartDetails, setChartDetails);
  };

  useEffect(() => {
    if (json && Object.keys(json).length !== 0) {
      json = props.data;
      let query = `${props.baseURL}/charts/getDashboardChartInfo`
      fetchData(query).then((returnData) => {
        setLoading(false);
        // set chartDetails to have the panelIDs and chartIDs so that the divs can be created
        setChartDetails(returnData.panelData);

        console.log(returnData)
        setupCharts(false, returnData.panelData).then((data) => {
          // update chartDetails to have the data so that it doesn't need to be re-pulled
          setChartDetails(data);
        });
        console.log(chartDetails);
      })
      
    }
  }, [props.data]);

  return loading ? <Panel title='Recruitment'><Loader/></Panel> : (
    <>
      {/* <Panel
        title='Recruitment'
        id='statistics_recruitment'
        views={[
          // {
          //   content:
          //   <div className='recruitment-panel' id='overall-recruitment'>
          //     {progressBarBuilder(json['recruitment']['overall'])}
          //   </div>,
          //   title: 'Recruitment - overall',
          // },
          // ...Object.keys(chartDetails).map((panelID) => {
          //   return {
          //     content:
          //     json['recruitment']['overall']
          //     && json['recruitment']['overall']['total_recruitment'] > 0 ?
          //       <>
          //         <QueryChartForm
          //           Module={'statistics'}
          //           name={'recruitment'}
          //           id={'recruitment' + panelID + 'Form'}
          //           data={json}
          //           callback={(formDataObj) => {
          //             updateFilters(formDataObj, panelID);
          //           }}
          //         />
          //         {Object.keys(chartDetails[panelID]).map((chartID) => {
          //           return showChart(panelID, chartID);
          //         })}
          //       </> :
          //       <p>There have been no candidates registered yet.</p>,
          //     title: 'Recruitment - ' + panelID,
          //   }
          // }),
          // {
          //   content:
          //   <>
          //     {Object.entries(json['recruitment']).map(([key, value]) => {
          //       if (key !== 'overall') {
          //         return <div key={`projectBreakdown_${key}`}>
          //           {progressBarBuilder(value)}
          //         </div>;
          //       }
          //     })}
          //   </>,
          //   title: 'Recruitment - project breakdown',
          // },
          // {
          //   content:
          //     <>
          //       {Object.entries(json['recruitmentcohorts'])
          //       .map(([key, value]) => {
          //         return <div key={`cohortBreakdown_${key}`}>
          //           {progressBarBuilder(value)}
          //         </div>;
          //         }
          //       )}
          //     </>,
          //   title: 'Recruitment - cohort breakdown',
          // },
        ]}
      /> */}
    </>
  );
};

Recruitment.propTypes = {
  data: PropTypes.object,
  baseURL: PropTypes.string,
  updateFilters: PropTypes.function,
  showChart: PropTypes.function,
};
Recruitment.defaultProps = {
  data: {},
};

export default Recruitment;
