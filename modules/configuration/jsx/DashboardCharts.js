import React, {Component} from 'react';
import {TabPane, VerticalTabs} from 'Tabs';
import PropTypes from 'prop-types';
import Loader from 'Loader';
import '../css/configuration.css';
import swal from 'sweetalert2';
import {
    FormElement,
    ButtonElement,
    FieldsetElement,
    TextboxElement,
    CheckboxElement,
    SearchableDropdown,
    SelectElement,
    TagsElement,
    NumericElement,
  } from 'jsx/Form';
import Select, {SingleValue} from 'react-select';
/**
 * Dashboard Charts Configuration component
 */
class DashboardCharts extends Component {
    /**
     * @constructor
     * @param {object} props - React Component properties
     */
    constructor(props) {
        super(props);

        this.state = {
            formData: {},
            errorMessage: {},
            error: false,
            isLoaded: false,
            currentTab: 'new',
        };

        this.setFormData = this.setFormData.bind(this);
        this.addSourceField = this.addSourceField.bind(this);
        this.sourceSelector = this.sourceSelector.bind(this);
    }

    /**
     * Called by React when the component has been rendered on the page.
     */
    componentDidMount() {
        this.fetchData()
            .then(() => this.setState({isLoaded: true}));
    }

    /**
     * Fetch data
     * @return {Promise<void>}
     */
    fetchData() {
        return fetch(this.props.dataURL, {credentials: 'same-origin'})
            .then((resp) => resp.json())
            .then((data) => {
                console.log('setting state to ')

                data.dashboardCharts.new = {
                    chartID: 'new',
                    title: 'new chart details',
                    sameSource: true
                }

                console.log(data)

                this.setState({
                    formData: data,
                })
            })
            .catch((error) => {
                this.setState({error: true});
                console.error(error);
            });
    }

    /**
     * Set form data
     * @param {string} formElement
     * @param {*} value
     */
    setFormData(formElement, value) {
        console.log('setting form data')
        console.log(this.state)
        const tabID = this.state.currentTab;
        let formData = this.state.formData;
        console.log('setting form value to ')
        console.log(value)
        console.log('element is')
        console.log(formElement)

        let tabData = {
            ...formData.dashboardCharts[tabID],
            [formElement]: value,
        };
        formData.dashboardCharts[tabID] = tabData;

        this.setState({
            formData: formData,
        });
    }

    /**
     * renders the diagnosis trajectory form
     * @param {int} chartID
     * @return {JSX} React markup for the component
     */
    renderDashboardChartConfigForm(chartID) {
        console.log('formdata is ')
        console.log(this.state.formData)
        const chartData = this.state.formData.dashboardCharts[chartID]

        const deleteButton = chartID !== 'new' ?
            (
                <ButtonElement
                    label='Delete'
                    type='delete'
                    onUserInput={this.confirmDelete}
                />
            ) : null;
        const errorMessage = this.state.errorMessage[chartID] ?
            this.state.errorMessage[chartID] :
            {
                Name: null,
                ProjectID: null,
                visitLabel: null,
                instrumentName: null,
                sourceField: null,
                orderNumber: null,
            };

        return (
            <TabPane TabId={`${chartID}`} key={chartID}>
                <div className='row'>
                    <h3>Dashboard Chart</h3>
                    <br />
                    <FormElement
                        name='dashboardChart'
                        // onSubmit={this.handleSubmit}
                        ref='form'
                    >
                        <FieldsetElement
                            legend='Modify Dashboard Chart'
                        >
                            <TextboxElement
                                name='title'
                                label='Chart Title'
                                onUserInput={this.setFormData}
                                value={chartData.title}
                                required={true}
                                errorMessage={errorMessage.Name}
                            />
                            <TextboxElement
                                name='panel'
                                label='Panel'
                                onUserInput={this.setFormData}
                                value={chartData.panel}
                                required={true}
                                errorMessage={errorMessage.Panel}
                            />
                            <CheckboxElement
                                name='sameSource'
                                label='Use same source for all projects'
                                onUserInput={this.setFormData}
                                value={chartData.sameSource}
                                errorMessage={errorMessage.sameSource}
                            />

                            {chartData.sameSource && this.sourceSelector('all', chartData, errorMessage)}
                            {!chartData.sameSource && Object.keys(this.state.formData.projects).map((project) => {
                                return this.sourceSelector(project, chartData, errorMessage)
                            })}

                            {/* <TagsElement
                                name='sourceField'
                                id={chartID}
                                label='Source Field'
                                options={this.state.formData.sourceFields}
                                useSearch={true}
                                strictSearch={true}
                                onUserInput={this.setFormData}
                                value={chartData.pendingSourceField ?
                                    chartData.pendingSourceField :
                                    null}
                                items={chartData.sourceField || []}
                                required={true}
                                btnLabel='Add Field'
                                pendingValKey='pendingSourceField'
                                onUserAdd={this.addSourceField}
                                onUserRemove={this.removeSourceField}
                                errorMessage={errorMessage.sourceField}
                            /> */}
                            <NumericElement
                                name='orderNumber'
                                min={1}
                                max={100}
                                label='Order Number'
                                onUserInput={this.setFormData}
                                value={chartData.orderNumber}
                                required={true}
                                errorMessage={errorMessage.orderNumber}
                            />
                            <div className='btn-container'>
                                <ButtonElement
                                    name='submit'
                                    label='Save'
                                    type='submit'
                                    onUserInput={this.handleSubmit}
                                />
                                <ButtonElement
                                    label='Reset'
                                    type='reset'
                                    onUserInput={this.handleReset}
                                />
                                {deleteButton}
                            </div>
                        </FieldsetElement>
                    </FormElement>
                </div>
            </TabPane>
        );
    }

    sourceSelector(project, chartData, errorMessage) {
        console.log('source selector for ' + project)
        let projectName = project == 'all' ? 'all projects' : this.state.formData.projects[project]
        let tableFieldName = 'sourceTable-proj' + project;
        let filterFieldName = 'sourceFilter-proj' + project;
        return <div
            style={{
                border: '0.5px solid gray',
                borderRadius: '5px',
                marginTop: '5px',
                marginBottom: '5px',
                paddingTop: '5px',
                paddingBottom: '5px',
            }}
        >
            <TagsElement
                name={tableFieldName}
                label={'Source table(s)' + ' for ' + projectName}
                options={this.state.formData.tables}
                onUserInput={this.setFormData}
                value={chartData['pending' + tableFieldName]}
                useSearch={true}
                onUserAdd={this.addSourceField}
                pendingValKey={'pending' + tableFieldName}
                items={chartData[tableFieldName] || []}
                required={true}
                errorMessage={errorMessage.sourceTable}
                btnLabel='Select Table'
            />  
            {/* todo: figure out how to join tables */}
            {chartData[tableFieldName] && chartData[tableFieldName].length > 1 &&
                <div>Join tables on</div> &&
                chartData[tableFieldName].map((table, index) => {
                    if (index == 0) return;
                    let selectedJoiningTableFieldName = chartData['join-table' + table + '-proj' + project];
                    console.log(chartData[selectedJoiningTableFieldName])
                    return <>
                        <div
                            style={{
                                flexDirection: 'row',
                                display: 'flex'
                            }}
                        >
                            <h4>{table}</h4>
                            <SelectElement
                                label={'Join with'}
                                options={chartData[tableFieldName]}
                                name={selectedJoiningTableFieldName}
                                value={chartData[selectedJoiningTableFieldName]}
                                onUserInput={this.setFormData}
                                multiple={false}
                            />
                            <SelectElement
                                options={this.state.formData.columns[table]}
                                name={'joinColumnFrom-table' + table + '-proj' + project}
                                label={'Join column from ' + table}
                                value={chartData['joinColumnFrom-table' + table + '-proj' + project]}
                                onUserInput={this.setFormData}
                            />
                            <h4>=</h4>
                            {chartData[selectedJoiningTableFieldName] && <SelectElement
                                options={this.state.formData.columns[chartData[selectedJoiningTableFieldName]]}
                                name={'joinColumnFrom-table' + chartData[tableFieldName][0] + '-proj' + project}
                                label={'Join column from ' + chartData[selectedJoiningTableFieldName]}
                                value={this.state.formData['joinColumnFrom-table' + chartData[tableFieldName][0] + '-proj' + project]}
                                onUserInput={this.setFormData}
                            /> }
                        </div>
                    </>
                })
            }
            {chartData[tableFieldName] && chartData[tableFieldName].map((table) => {
                console.log(table)
                let columnFieldName = 'sourceColumn-table' + table + '-proj' + project;
                return <TagsElement
                    name={columnFieldName}
                    label={'Selected columns from '  + table}
                    options={this.state.formData.columns[table]}
                    onUserInput={this.setFormData}
                    value={chartData['pending' + columnFieldName]}
                    useSearch={true}
                    onUserAdd={this.addSourceField}
                    pendingValKey={'pending' + columnFieldName}
                    items={chartData[columnFieldName] || []}
                    required={true}
                    errorMessage={errorMessage.sourceColumn}
                    btnLabel='Select Column'
                />
            })}
            {chartData[tableFieldName] && <TagsElement
                name={filterFieldName}
                label={'Filter out values (SQL WHERE syntax)'}
                onUserInput={this.setFormData}
                value={chartData['pending' + filterFieldName]}
                onUserAdd={this.addSourceField}
                pendingValKey={'pending' + filterFieldName}
                items={chartData[filterFieldName] || []}
                required={true}
                errorMessage={errorMessage.sourceColumn}
                btnLabel='Select Column'
            /> }

        </div>
    }

    /**
     * Renders the React component.
     *
     * @return {JSX} - React markup for the component
     */
    render() {
        if (this.state.error) {
            return <h3>An error occured while loading the page.</h3>;
        }

        if (!this.state.isLoaded) {
            return <Loader />;
        }

        let tabList = [];

        let dashboardCharts = [];
        const charts = this.state.formData.dashboardCharts;
        if (charts) {
            Object.values(charts).map((chart) => {
                const chartID = chart.chartID;
                const title = chart.title;
                dashboardCharts.push(this.renderDashboardChartConfigForm(chartID));
                tabList.push({id: `${chartID}`, label: title});
            });
        }

        return (
            <div>
                <p>
                    Use this page to manage the configuration of the dashboard charts.
                </p>
                <VerticalTabs
                    tabs={tabList}
                    defaultTab='new'
                    updateURL={false}
                    onTabChange={(tabId) => this.setState({currentTab: tabId})}
                >
                    {dashboardCharts}
                </VerticalTabs>
            </div>
        );
    }

    /**
     * Sets required field errors
     *
     * @param {object} formData - Form data
     * @param {string} tabID - Relevant tab
     *
     * @return {bool}
     */
    validate(formData, tabID) {
        // let isValid = true;
        // let errorMessage = this.state.errorMessage;
        // errorMessage[tabID] = {
        //     Name: null,
        //     ProjectID: null,
        //     instrumentName: null,
        //     sourceField: null,
        //     orderNumber: null,
        // };
        // if (!formData.Name) {
        //     errorMessage[tabID]['Name'] = 'This field is required!';
        //     isValid = false;
        // }
        // if (!formData.ProjectID) {
        //     errorMessage[tabID]['ProjectID'] = 'This field is required!' +
        //         ' Entry must be included in provided list of options.';
        //     isValid = false;
        // }
        // if (!formData.visitLabel) {
        //     errorMessage[tabID]['visitLabel'] = 'This field is required!' +
        //         ' Entry must be included in provided list of options.';
        //     isValid = false;
        // }
        // if (!formData.instrumentName) {
        //     errorMessage[tabID]['instrumentName'] = 'This field is required!' +
        //         ' Entry must be included in provided list of options.';
        //     isValid = false;
        // }
        // if (!formData.sourceField) {
        //     errorMessage[tabID]['sourceField'] = 'This field is required!' +
        //         ' Please click "Add Field" before saving';
        //     isValid = false;
        // }
        // if (!formData.orderNumber) {
        //     errorMessage[tabID]['orderNumber'] = 'This field is required!';
        //     isValid = false;
        // }
        // this.setState({errorMessage});
        // return isValid;
        return true;
    }

    /**
     * Handles form submission
     *
     * @param {event} e - Form submission event
     */
    handleSubmit(e) {
        // e.preventDefault();

        // const tabID = this.state.currentTab;
        // let formData = tabID == 'new' ?
        //     this.state.formData.new :
        //     this.state.formData.dashboardCharts[tabID];
        // let formObject = new FormData();
        // for (let key in formData) {
        //     if (formData[key] !== '') {
        //         formObject.append(key, formData[key]);
        //     }
        // }
        // if (!this.validate(formData, tabID)) {
        //     return;
        // }

        // fetch(this.props.submitURL, {
        //     method: 'POST',
        //     cache: 'no-cache',
        //     credentials: 'same-origin',
        //     body: formObject,
        // }).then((resp) => {
        //     if (resp.ok) {
        //         swal.fire({
        //             title: 'Submission Successful!',
        //             type: 'success',
        //         });
        //         window.location.href =
        //             `${loris.BaseURL}/configuration/diagnosis_evolution`;
        //     } else {
        //         resp.json().then((msg) => {
        //             let status = resp.status == 409 ?
        //                 'Conflict!' : 'Error!';
        //             swal.fire({
        //                 title: status,
        //                 text: msg.error,
        //                 type: 'error',
        //             });
        //         });
        //     }
        // }).catch((error) => {
        //     console.log(error);
        // });
    }

    /**
     * Handles form reset
     *
     * @param {event} e - Form submission event
     */
    handleReset(e) {
        // e.preventDefault();
        // const tabID = this.state.currentTab;
        // let formData = this.state.formData;
        // if (tabID === 'new') {
        //     let formDataNew = formData[tabID];
        //     for (let key in formDataNew) {
        //         if (key !== 'chartID') {
        //             formDataNew[key] = null;
        //         }
        //     }
        //     formData[tabID] = formDataNew;
        // } else {
        //   formData.dashboardCharts[tabID]
        //     = this.state.data.dashboardCharts[tabID];
        // }
        // this.setState({formData});
    }

    /**
     * Swal for user to confirm deletion
     *
     * @param {event} e - Form submission event
     */
    confirmDelete(e) {
        e.preventDefault();
        swal.fire({
            title: 'Are you sure you want to delete this dashboard chart?',
            type: 'warning',
            showCancelButton: true,
            confirmButtonText: 'Delete',
            cancelButtonText: 'Cancel',
        }).then((result) => {
            if (result.value) {
                this.handleDelete();
            }
        });
    }

    /**
     * Handles diagnosis delete
     */
    handleDelete() {
        // const tabID = this.state.currentTab;
        // let dashboardCharts = this.state.formData.dashboardCharts;
        // let ID = dashboardCharts[tabID]['chartID'];
        // fetch(this.props.submitURL + '/?ID='+ ID, {
        //     method: 'DELETE',
        //     cache: 'no-cache',
        //     credentials: 'same-origin',
        // }).then((resp) => {
        //     if (resp.ok) {
        //         swal.fire({
        //             title: 'Deletion Successful!',
        //             type: 'success',
        //         });
        //         window.location.href =
        //             `${loris.BaseURL}/configuration/diagnosis_evolution`;
        //     } else {
        //         resp.json().then((msg) => {
        //             let status = resp.status == 409 ?
        //                 'Conflict!' : 'Error!';
        //             swal.fire({
        //                 title: status,
        //                 text: msg.error,
        //                 type: 'error',
        //             });
        //         });
        //     }
        // }).catch((error) => {
        //     console.log(error);
        // });
    }


    /**
     * Add source field
     * @param {*} formElement
     * @param {string} value
     * @param {*} pendingValKey
     * @param {*} id
     */
    addSourceField(formElement, value, pendingValKey) {
        const tabID = this.state.currentTab;
        let formData = this.state.formData;

        let listItems =
            formData.dashboardCharts[tabID][formElement] || [];
        listItems.push(value);
        formData.dashboardCharts[tabID][formElement] = listItems;
        formData.dashboardCharts[tabID][pendingValKey] = null;

        this.setState({formData: formData});
    }

    /**
     * Remove source field
     * @param {*} formElement
     * @param {string} value
     * @param {*} pendingValKey
     */
    // removeSourceField(formElement, value) {
    //     const tabID = this.state.currentTab;
    //     let formData = this.state.formData;

    //     if (tabID == 'new') {
    //         let listItems = formData.new[formElement];
    //         let index = listItems.indexOf(value);
    //         if (index > -1) {
    //             listItems.splice(index, 1);
    //         }
    //         formData.new[formElement] = listItems;
    //     } else {
    //         let listItems =
    //             formData.dashboardCharts[tabID][formElement];
    //         let index = listItems.indexOf(value);
    //         if (index > -1) {
    //             listItems.splice(index, 1);
    //         }
    //         formData.dashboardCharts[tabID][formElement] = listItems;
    //     }
    //     this.setState({formData: formData});
    // }
}

DashboardCharts.propTypes = {
  dataURL: PropTypes.string,
  tabName: PropTypes.string,
  action: PropTypes.string,
  submitURL: PropTypes.string,
};

window.addEventListener('load', () => {
    ReactDOM.render(
        <DashboardCharts
            dataURL={`${loris.BaseURL}/configuration/charts`}
            submitURL={`${loris.BaseURL}/configuration/charts`}
        />,
        document.getElementById('lorisworkspace')
    );
});