export const DESIGNATION_LIST = ['Standart', 'Guest', 'Employee'];
export const SHIPPING_MODE_LIST = ['LCL', 'FCL', 'FCL Pallets', 'Courrier'];
export const STAKEHOLDER_CATEGORY = [
  'Architect',
  'Developers',
  'GC',
  'Contractor',
  'Installer',
  'Owner',
  'Consultant',
  'Arch',
  'Takeoffs',
  'Sales',
  'Manager',
]

export const STAGES = [
  'lead',
  'opportunity',
  'order',
  'ticket'
]

export const STAGES_MAP = [
  {value: 'lead', label: 'Lead'},
  {value: 'opportunity', label: 'Opportunity'},
  {value: 'order', label: 'Order'},
  {value: 'ticket', label: 'Ticket'}
]

export const SUB_STAGES = [
  'proposed', 'contacted', 'qualifying', 'meetingScheduled', 'takeoffs', 'firstQuote',
  'clientReview', 'closing', 'coldProject', 'production', 'packing', 'shipping', 'delivery',
  'ticketReceived', 'ticketAccepted', 'solutionDetermined', 'solutionDelivered', 'projectClosed'
]

export const SUB_STAGES_LEAD = [
  {value: 'proposed', label: 'Proposed' }, {value: 'contacted', label: 'Contacted'},
  {value: 'qualifying', label: 'Qualifying' }, {value: 'meetingScheduled', label: 'Meeting Scheduled'},
]

export const SUB_STAGES_OPP = [
  {value: 'takeoffs', label: 'Takeoffs' }, {value: 'firstQuote', label: 'First Quote'},
  {value: 'clientReview', label: 'Client Review' }, {value: 'closing', label: 'Closing'},
  {value: 'coldProject', label: 'Cold Project'}
]

export const SUB_STAGES_ORDER = [
  {value: 'production', label: 'Production' }, {value: 'packing', label: 'Packing'},
  {value: 'shipping', label: 'Shipping' }, {value: 'delivery', label: 'Delivery'},
]

export const SUB_STAGE_TICKET = [
  {value: 'ticketReceived', label: 'Ticket Received' }, {value: 'ticketAccepted', label: 'Ticket Accepted'},
  {value: 'solutionDetermined', label: 'Solution Determined' }, {value: 'solutionDelivered', label: 'Solution Delivered'},
  {value: 'projectClosed', label: 'Project Closed'}
]
