import React from 'react'
import {Modal} from 'react-bootstrap'
import AllSalesRecords from '../components/salesRecord/AllSalesRecords'
import CreateSalesRecord from '/imports/ui/components/salesRecord/CreateSalesRecord'

export default class SalesRecordPage extends React.Component{
    constructor(props){
        super(props)
        this.state = {
            keyword: '',
            showModal: false
        }
    }

    getTitle = () => {
        const {stage} = this.props

        switch(stage) {
            case 'lead':
                return 'All Leads'
            case 'opportunity':
                return 'All Opportunity'
            case 'order':
                return 'All Orders'
            case 'ticket':
                return 'All Tickets'
            default:
                return 'All Deals'
        }
    }
    getTabs = () => {
      const showsearchbar = false
      return <div>
          <div className="sale-title">
              {this.getTitle()}
          </div>
          <div style={{float: 'left', width: 100, marginLeft: 50}}>
            <button
              className="btn btn-primary"
              onClick={() => this.setState({showModal:true})}
            >
              <span className="fa fa-plus"></span> Add Deal
            </button>
          </div>
          {showsearchbar &&
          <div style={{float: 'left', width: 250, marginLeft: 50}}>
              <InputGroup>
                  <InputGroup.Addon><i className="fa fa-search"/></InputGroup.Addon>
                  <FormControl type="text" placeholder="Search..." onChange={this.onChangeSearch}/>
              </InputGroup>
          </div>
          }
      </div>
    }

    render() {
      const props = _.clone(this.props)
      props.salesRecords = props.salesRecords.filter(({ stage, name, supplier, shipper }) => {
        const keyfilter = new RegExp(this.state.keyword,'i')
        return (props.stage ? stage === props.stage : 1) && (this.state.keyword == null || (name.search(keyfilter) > -1))
      })
      props.stage = props.stage || 'lead'

      return (
          <div className="projects-page">
           	<div className="tab-container">
            		<div className="tab-controls">
              		{this.getTabs()}
            		</div>
            		<div className="tab-content">
              		<AllSalesRecords {...props} />
            		</div>
           	</div>
              {this.renderModal(props)}
          </div>
      )
    }

    renderModal = (props) => {
        const {showModal} = this.state
        return (
            <Modal show={showModal} onHide={() => {
                this.setState({showModal: false})
            }}>
                <Modal.Header closeButton><Modal.Title>Create Deal</Modal.Title></Modal.Header>
                <Modal.Body>
                    <CreateSalesRecord {...props}/>
                </Modal.Body>
            </Modal>
        )
    }
}
