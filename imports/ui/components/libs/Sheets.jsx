import {Roles} from 'meteor/alanning:roles'
import React, { Component, PropTypes } from 'react'
import { Table, Glyphicon, Button } from 'react-bootstrap'
import classNames from 'classnames'
import DatePicker from 'react-datepicker'
import { info, warning  } from '/imports/api/lib/alerts'
import Select from 'react-select'
import {ROLES} from '/imports/api/models'
import 'bootstrap-select'
import 'bootstrap-select/dist/css/bootstrap-select.min.css'

class Sheets extends Component {
    constructor(props) {
        super(props)
        const { columns: possibleColumns } = props
        this.state = {
            // cell that you are hovering
            hoverCell: {
                key: null,
                rowIndex: null,
                value: null,
            },
            // cell that you are editing
            edittingCell: {
                key: null,
                rowIndex: null,
                value: null,
            },
            // all possible columns
            possibleColumns,
        }

        this.renderList = this.renderList.bind(this)
        this.renderRows = this.renderRows.bind(this)
        this.allowEdit = this.allowEdit.bind(this)
        this.handleChange = this.handleChange.bind(this)
        this.handleMouseEnter = this.handleMouseEnter.bind(this)
        this.handleMouseLeave = this.handleMouseLeave.bind(this)
        this.renderEditButton = this.renderEditButton.bind(this)
        this.renderSaveButton = this.renderSaveButton.bind(this)
        this.saveCell = this.saveCell.bind(this)
        this.goTo = this.goTo.bind(this)
    }

    // remove save button when mouse leaves
    handleMouseLeave() {
        this.setState({
            hoverCell: {
                key: null,
                rowIndex: null,
                value: null,
            }
        })
    }

    // view save button when enter mouse
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

    // choose editing cell
    allowEdit(key, rowIndex, value) {
        this.setState({
            edittingCell: {
                key,
                rowIndex,
                value,
            }
        })
    }

    // apply new data to editing cell
    handleChange(value) {
        const edittingCell = this.state.edittingCell
        edittingCell.value = value
        this.setState({
            edittingCell,
        })
    }

    // show edit button
    renderEditButton(key, index, value) {
        if (this.state.edittingCell.key) return
        if (key === this.state.hoverCell.key && index === this.state.hoverCell.rowIndex) {
            return (
                <button
                    className='btn btn-sm pull-right btn-primary'
                    onClick={() => this.allowEdit(key, index, value)}
                >
                    <i className='fa fa-pencil'/>
                </button>
            )
        }
    }
    // save data to database
    saveCell() {
        const { type } = this.state.possibleColumns.find(({ key }) => key === this.state.edittingCell.key)
        const { _id } = this.props.rows[this.state.edittingCell.rowIndex]
        let { key, value } = this.state.edittingCell
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
        this.props.onSave(_id, { key, value }, (error, message) => {
            if (error) {
                warning(error.reason)
            } else {
                this.handleMouseLeave()
                this.setState({
                    edittingCell: {
                        key: null,
                        rowIndex: null,
                        value: null,
                    }
                })
                return info(message)
            }
        })
    }

    renderSaveButton() {
        return (
            <button
                className='btn btn-warning btn-sm pull-right'
                onClick={ this.saveCell}
            >
                <i className='fa fa-save'/> Save
            </button>
        )

    }

    renderRows() {
        const selectedColumns = this.state.possibleColumns.filter(({ selected }) => selected)
        return this.props.rows.map((project, index) => (
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
                                    return (
                                        <td key={key}>
                                            <div>
                                                <Select
                                                    style={{width: '60%'}}
                                                    value={this.state.edittingCell.value}
                                                    options={options}
                                                    onChange={this.handleChange}
                                                />
                                                { this.renderSaveButton() }
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
                                                { this.renderEditButton(key, index, moment(project[key])) }
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
                                                { this.renderEditButton(key, index, project[key]) }
                                            </div>
                                        </td>)
                            }
                        }
                    })
                }
                <td>
                  <div className='btn-group'>
                    <Button onClick={() => this.goTo(project)} bsSize='small'>
                      <i className='fa fa-link'/>
                    </Button>
                    {
                      (Roles.userIsInRole(Meteor.userId(), ROLES.ADMIN)) ? (
                        <Button onClick={() => this.props.remove(project)} bsSize='small' bsStyle='danger'>
                          <i className='fa fa-times'/>
                        </Button>
                      ) : ''
                    }
                  </div>
                </td>
                </tr>
            ))
    }

    renderList(){
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

    goTo(project) {
        this.props.goTo(project)
    }

    componentDidMount() {
        const _this = this
        Meteor.call('getVisibleFields', _this.props.settingKey, (error, selectedFields) => {
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
                        },
                        possibleColumns
                    })
                    Meteor.call('updateVisibleFields', _this.props.settingKey, selectedKeys)
                })
            }
        })
    }

    render() {
        return (
            <div>
                <div>
                    <select className='selectpicker pull-right' multiple>
                    {
                        this.state.possibleColumns.map(({ key, label }) => <option value={key} key={key}>{label}</option>)
                    }
                    </select>
                    <br/>
                    {
                        ( this.props.loading ) ? (
                            <div>loading....</div>
                        ) : (
                           this.renderList()
                        )
                    }
                </div>
            </div>
        )
    }
}

Sheets.propTypes = {
    columns: PropTypes.array.isRequired,
    rows: PropTypes.array.isRequired,
    onSave: PropTypes.func.isRequired,
    settingKey: PropTypes.string.isRequired,
    goTo: PropTypes.func.isRequired,
    remove: PropTypes.func.isRequired,
}

export default Sheets
