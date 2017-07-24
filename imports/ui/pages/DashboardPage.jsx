import React from 'react'
import MyTasks from '../components/dashboard/MyTasks'


class DashboardPage extends React.Component{
    render() {
        return (
            <div className="dashboard-page">
                <div className="tab-container">
                  <h3>Dashboard</h3>
                  <hr />
                  <div>
                    <MyTasks />
                  </div>
                </div>
            </div>
        )
    }
}
export default DashboardPage
