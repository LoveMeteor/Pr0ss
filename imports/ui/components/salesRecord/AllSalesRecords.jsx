/* global moment, FlowRouter */
import {Roles} from 'meteor/alanning:roles'
import React from 'react'
import { Table, Glyphicon, Button } from 'react-bootstrap'
import classNames from 'classnames'
import DatePicker from 'react-datepicker'
import {ROLES} from '/imports/api/models'
import { SHIPPING_MODE_LIST } from '/imports/api/constants/project'
import { info, warning  } from '/imports/api/lib/alerts'
import Select from 'react-select'
import swal from 'sweetalert2'
import 'sweetalert2/dist/sweetalert2.min.css'
import 'bootstrap-select'
import 'bootstrap-select/dist/css/bootstrap-select.min.css'
import KanbanView from './kanbanView/KanbanView'


import {
  SUB_STAGES_LEAD,
  SUB_STAGES_OPP,
  SUB_STAGES_ORDER,
  SUB_STAGE_TICKET,
  STAGES_MAP
} from '../../../api/constants/project'

class AllSalesRecords extends React.Component{
    constructor(props){
        super(props)
        this.state = {
            hoverCell: {
                key: null,
                rowIndex: null,
                value: null,
            },
            edittingCell: {
                key: null,
                rowIndex: null,
                value: null,
                _id: null,
            },
            possibleColumns: [
                {
                    key: '_id',
                    label: 'ID',
                    type: 'text',
                    selected: false,
                    editable: false,
                }, {
                    key: 'name',
                    label: 'Name',
                    type: 'text',
                    selected: false,
                    editable: true,
                },
                {
                    key: 'productionStartDate',
                    label: 'Start Date',
                    selected: false,
                    type: 'date',
                    editable: true,
                },
                {
                    key: 'actualDeliveryDate',
                    label: 'Delivery Date',
                    selected: false,
                    type: 'date',
                    editable: true,
                },
                {
                    key: 'shippingContactEmail',
                    label: 'Shipping Email',
                    selected: false,
                    type: 'text',
                    editable: true,
                },
                {
                    key: 'shippingAddress',
                    label: 'Shipping Address',
                    selected: false,
                    type: 'text',
                    editable: true,
                },
                {
                    key: 'shippingContactPhone',
                    label: 'Shipping Phone',
                    selected: false,
                    type: 'text',
                    editable: true,
                },
                {
                    key: 'shippingNotes',
                    label: 'Shipping Notes',
                    selected: false,
                    type: 'text',
                    editable: true,
                },
                {
                    key: 'billingContactName',
                    label: 'Billing Contact',
                    selected: false,
                    type: 'text',
                    editable: true,
                },
                {
                    key: 'billingContactEmail',
                    label: 'Billing Email',
                    selected: false,
                    type: 'text',
                    editable: true,
                },
                {
                    key: 'billingAddress',
                    label: 'Billing Address',
                    selected: false,
                    type: 'text',
                    editable: true,
                },
                {
                    key: 'billingContactPhone',
                    label: 'Billing Phone',
                    selected: false,
                    type: 'text',
                    editable: true,
                },
                {
                    key: 'billingNotes',
                    label: 'Billing Notes',
                    selected: false,
                    type: 'text',
                    editable: true,
                },
                {
                    key: 'shippingMode',
                    label: 'Shipping Mode',
                    selected: false,
                    type: 'select',
                    options: SHIPPING_MODE_LIST.map((value) => ({label: value, value})),
                    editable: true,
                },
                {
                    key: 'supplier',
                    label: 'Supplier',
                    selected: false,
                    type: 'text',
                    editable: true,
                },
                {
                    key: 'shipper',
                    label: 'Shipper',
                    selected: false,
                    type: 'text',
                    editable: true,
                },
                {
                    key: 'shippingContactName',
                    label: 'Shipping Name',
                    selected: false,
                    type: 'text',
                    editable: true,
                },
                {
                  key: 'stage',
                  label: 'Stage',
                  selected: false,
                  options: [],
                  type: 'select',
                  editable: true
                },
                {
                  key: 'subStage',
                  label: 'Sub Stage',
                  selected: false,
                  options: [],
                  type: 'select',
                  editable: true
                }
            ],
            showKanbanView: false
        }
        this.renderRows = this.renderRows.bind(this)
        this.allowEdit = this.allowEdit.bind(this)
        this.handleChange = this.handleChange.bind(this)
        this.handleMouseEnter = this.handleMouseEnter.bind(this)
        this.handleMouseLeave = this.handleMouseLeave.bind(this)
        this.renderEditButton = this.renderEditButton.bind(this)
        this.renderSaveButton = this.renderSaveButton.bind(this)
        this.updateProject = this.updateProject.bind(this)
        this.renderKanbanView = this.renderKanbanView.bind(this)
        this.renderSwitchLabels = this.renderSwitchLabels.bind(this)
        this.removeProject = this.removeProject.bind(this)
        this.updateStage = this.updateStage.bind(this)
    }

    handleMouseLeave() {
        this.setState({
            hoverCell: {
                key: null,
                rowIndex: null,
                value: null,
            }
        })
    }

    handleMouseEnter(key, rowIndex, value ) {
        const {editable} = this.state.possibleColumns.find((column) => column.key === key)
        if (!editable) return
        this.setState({
            hoverCell: {
                key,
                rowIndex,
                value
            }
        })
    }

    allowEdit(key, rowIndex, value, _id) {
        this.setState({
            edittingCell: {
                key,
                rowIndex,
                value,
                _id,
            }
        })
    }

    handleChange(value) {
        const edittingCell = this.state.edittingCell
        edittingCell.value = value
        this.setState({
            edittingCell,
        })
    }

    renderEditButton(key, index, value, _id) {
        if (this.state.edittingCell.key) return
        if (key === this.state.hoverCell.key && index === this.state.hoverCell.rowIndex) {
            return (
                <button
                    className='btn btn-sm pull-right btn-primary'
                    onClick={() => this.allowEdit(key, index, value, _id)}
                >
                    <i className='fa fa-pencil'/>
                </button>
            )
        }
    }

    updateProject() {
        // TODO: update salesRecord at here
        const { type } = this.state.possibleColumns.find(({ key }) => key === this.state.edittingCell.key)
        const _id = this.state.edittingCell._id
        let { value } = this.state.edittingCell
        const { key } = this.state.edittingCell
        switch (type) {
            case 'date':
                value = value.toDate()
                break
            case 'select':
                // When user did not select any new option
                value = value.value ? value.value : value
                break
            default:
                break
        }
        Meteor.call('updateProjectProperty', _id, { key, value }, (error) => {
            if(error) return warning(`Problems with updating project. ${error.error}`)
            this.handleMouseLeave()
            this.setState({
                edittingCell: {
                    key: null,
                    rowIndex: null,
                    value: null,
                    _id: null
                }
            })
            return info('Success update project')
        })
    }

    updateStage() {
      const _id = this.state.edittingCell._id
      let { value } = this.state.edittingCell
      value = value.value ? value.value : value
      Meteor.call('changeStageOfSalesRecord', _id, value, (error) => {
        if(error) return warning(`Problems with updating project. ${error.error}`)
        this.handleMouseLeave()
        this.setState({
            edittingCell: {
                key: null,
                rowIndex: null,
                value: null,
                _id: null
            }
        })
        return info('Success update project')
      })
    }

    renderSaveButton(key) {
        return (
            <button
                className='btn btn-warning btn-sm pull-right'
                onClick={ key === 'stage' ? this.updateStage.bind('', key) : this.updateProject }
            >
                <i className='fa fa-save'/> Save
            </button>
        )

    }
    getSubStages(stage) {
     switch (stage) {
       case 'lead': return SUB_STAGES_LEAD
       case 'opportunity': return SUB_STAGES_OPP
       case 'order': return SUB_STAGES_ORDER
       case 'ticket': return SUB_STAGE_TICKET
       default: return []
     }
    }
    renderRows() {
        const selectedColumns = this.state.possibleColumns.filter(({ selected }) => selected)
        const salesRecords =_.sortBy( this.props.salesRecords, ({ productionStartDate }) => -productionStartDate.getTime())
        return salesRecords.map((project, index) => (
                <tr key={project._id}>
                {
                    selectedColumns.map(({ key, type, options }) => {
                        if (key === this.state.edittingCell.key && index === this.state.edittingCell.rowIndex) {
                            switch(type) {
                                case 'date':
                                    return (
                                        <td key={key}>
                                            <div>
                                                <DatePicker
                                                    selected={this.state.edittingCell.value}
                                                    onChange={this.handleChange}
                                                />
                                                { this.renderSaveButton() }
                                            </div>
                                        </td>
                                    )
                                case 'select':
                                    options = key === 'subStage' ? this.getSubStages(project.stage) : options
                                    options = key === 'stage' ? STAGES_MAP : options
                                    return (
                                        <td key={key}>
                                            <div>
                                                <Select
                                                    style={{width: '60%'}}
                                                    value={this.state.edittingCell.value}
                                                    options={options}
                                                    onChange={this.handleChange}
                                                />
                                              { this.renderSaveButton(key) }
                                            </div>
                                        </td>
                                    )
                                default:
                                    return (
                                        <td key={key}>
                                            <div>
                                                <input
                                                    type='text'
                                                    value={this.state.edittingCell.value}
                                                    onChange={(event) => this.handleChange(event.target.value)}
                                                />
                                                { this.renderSaveButton() }
                                            </div>
                                        </td>
                                    )
                                    break
                            }
                        } else {
                            switch(type) {
                                case 'date':
                                    const date = moment(project[key]).format('MM/DD/YYYY')
                                    return (
                                        <td
                                            key={key}
                                            onMouseLeave={this.handleMouseLeave}
                                            onMouseEnter={() => this.handleMouseEnter(key, index, moment(project[key]))}
                                        >
                                            <div>
                                                { date }
                                                { this.renderEditButton(key, index, moment(project[key]), project._id) }
                                            </div>
                                        </td>
                                    )
                                default:
                                    return (
                                        <td
                                            key={key}
                                            onMouseLeave={this.handleMouseLeave}
                                            onMouseEnter={() => this.handleMouseEnter(key, index, project[key])}
                                        >
                                            <div>
                                                { project[key] }
                                                { this.renderEditButton(key, index, project[key], project._id) }
                                            </div>
                                        </td>)
                            }
                        }
                    })
                }
                <td>
                  <div className='btn-group'>
                    <Button onClick={() => this.goToProject(project)} bsSize='small'><i className='fa fa-link'/> </Button>
                    {
                      (Roles.userIsInRole(Meteor.userId(), ROLES.ADMIN)) ? (
                        <Button onClick={() => this.removeProject(project._id)} bsStyle='danger' bsSize='small'><i className='fa fa-trash'/></Button>
                      ) : ''
                    }
                  </div>
                </td>
                </tr>
            ))
    }

    renderProjectList(){
        const selectedColumns = this.state.possibleColumns.filter(({ selected }) => selected)
        return (
            <Table condensed hover>
                <thead>
                  <tr>
                    {
                      selectedColumns.map(({ label, key }) => (
                              <th key={key}>{label}</th>
                          ))
                    }
                    <th></th>
                  </tr>
                </thead>
                <tbody>
                    { this.renderRows() }
                </tbody>
              </Table>
        )
    }

    removeProject(_id) {
      swal({
        title: 'Are you sure ?',
        type: 'warning',
        html: `
          <div class='form-group text-left'>
            <div class='checkbox'>
              <label>
                <input type='checkbox' checked id='confirm-remove-folders'/> Remove resource folders
              </label>
            </div>
            <div class='checkbox'>
              <label>
                <input type='checkbox' checked id='confirm-remove-slack'/> Remove slack channel
              </label>
            </div>
          </div>
        `,
        showCancelButton: true,
        confirmButtonColor: '#3085d6',
        cancelButtonColor: '#d33',
        confirmButtonText: 'Yes, remove it!',
        preConfirm: () => new Promise((resolve) => {
            resolve({
              isRemoveFolders: $('#confirm-remove-folders').is(':checked'),
              isRemoveSlack: $('#confirm-remove-slack').is(':checked'),
            })
          })
      }).then(({ isRemoveFolders, isRemoveSlack }) => {
        Meteor.call('removeSalesRecord', { _id, isRemoveFolders, isRemoveSlack }, (error, result) => {
          if (error) {
            const msg = error.reason ? error.reason : error.message
            return swal('remove deal failed',  msg, 'warning')
          }
          swal(
            'Removed!',
            'Deal has been removed.',
            'success'
          )
        })
      })
    }

    goToProject(project){
        FlowRouter.go('SalesRecord', {id: project._id})
    }

    componentDidMount() {
        const _this = this

        //init tooltip
        $('[data-toggle="tooltip"]').tooltip()
        $('[data-toggle="tooltip"]').on('show.bs.tooltip', function() {
          // Only one tooltip should ever be open at a time
          $('.tooltip').not(this).hide()
        })

        Meteor.call('getVisibleFields', 'salesRecord', (error, selectedFields) => {
            if (!error) {
                const possibleColumns = _this.state.possibleColumns
                possibleColumns.forEach((column) => {
                    if (selectedFields.includes(column.key)) {
                        column.selected = true
                    }
                })
                _this.setState({possibleColumns})

                $('.selectpicker').selectpicker({
                    style: 'btn-default',
                    size: 4
                })

                $('.selectpicker').selectpicker('val', selectedFields)

                $('.selectpicker').on('changed.bs.select', function() {
                    const selectedKeys = $(this).val()
                    const possibleColumns = _this.state.possibleColumns
                    possibleColumns.forEach((column) => {
                        if (selectedKeys.includes(column.key))
                            return column.selected = true
                        return column.selected = false
                    })
                    _this.setState({
                        hoverCell: {
                            key: null,
                            rowIndex: null,
                            value: null,
                        },
                        edittingCell: {
                            key: null,
                            rowIndex: null,
                            value: null,
                            _id: null,
                        },
                        possibleColumns
                    })
                    Meteor.call('updateVisibleFields', 'salesRecord', selectedKeys, (error) => {

                    })
                })
            }
        })
    }
    renderKanbanView() {
      const { stage , salesRecords} = this.props;
      const isSubStage = !this.props.showAllDeals
      const columns = isSubStage ?
          this.getSubStages(stage).map((sub) => {return {id: sub.value, title: sub.label}}) :
          STAGES_MAP.map((stage) => {return {id: stage.value, title: stage.label}})
      return (
        <KanbanView
          columns={columns}
          salesRecords={salesRecords}
          isSubStage={isSubStage}
        />
      )
    }
    renderSwitchLabels() {
      const active = this.state.showKanbanView ? 'active' : ''
      return (
        <div className="text-right input-group-btn">
        <button
          className={`btn btn-default ${!active ? 'active' : ''}`}
          data-toggle="tooltip" title="List View"
          data-replacement="auto"
          onClick={() => {
            this.setState({showKanbanView: false})
          }}
        >
          <span className="fa fa-list" aria-hidden="true"></span>
        </button>
        <button
          className={`btn btn-default ${active}`}
          data-toggle="tooltip" title="Kaban View"
          data-replacement="auto"
          onClick={() => {
            this.setState({showKanbanView: true})
          }}
        >
          <span className="fa fa-align-left fa-rotate-90" aria-hidden="true"></span>
        </button>
      </div>
      )
    }
    render() {
      const showKaban = this.state.showKanbanView
      return (
        <div className="">
          {this.renderSwitchLabels()}
          <div className="col-md-12">&nbsp;</div>
          {showKaban ? this.renderKanbanView() : ''}
          <div className={showKaban ? 'hidden' : ''}>
            <select className='selectpicker pull-right' multiple>
            {
              this.state.possibleColumns.map(({ key, label }) => <option value={key} key={key}>{label}</option>)
            }
            </select>
            <br/>
            {this.renderProjectList()}
          </div>
        </div>
      )
    }
}

export default  AllSalesRecords
