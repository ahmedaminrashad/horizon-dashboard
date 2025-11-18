import React from 'react'
import { hasPermissionTo } from '../auth/authService'
import Header from '../layout/Header'

function DashboardHome({ user }) {
  const canViewAppointments = hasPermissionTo(user, 'appointments:view')
  const canViewDoctors = hasPermissionTo(user, 'doctors:view')

  return (
    <div className="main">
 
      <section className="cards">
        <div className="card">
          <h2>Total Patients</h2>
          <p className="card-number">248</p>
          <p className="card-trend positive">+12 this week</p>
        </div>
        <div className="card">
          <h2>Today&apos;s Appointments</h2>
          <p className="card-number">32</p>
          <p className="card-trend">Across all doctors</p>
        </div>
        <div className="card">
          <h2>Active Doctors</h2>
          <p className="card-number">18</p>
          <p className="card-trend">Including specialists</p>
        </div>
        <div className="card">
          <h2>Pending Approvals</h2>
          <p className="card-number">5</p>
          <p className="card-trend warning">Need your attention</p>
        </div>
      </section>

      <section className="grid">
        <div className="panel">
          <div className="panel-header">
            <h2>Upcoming appointments</h2>
          </div>

          {canViewAppointments ? (
            <table className="table">
              <thead>
                <tr>
                  <th>Patient</th>
                  <th>Doctor</th>
                  <th>Time</th>
                  <th>Status</th>
                </tr>
              </thead>
              <tbody>
                <tr>
                  <td>John Carter</td>
                  <td>Dr. Smith</td>
                  <td>09:30</td>
                  <td>
                    <span className="badge badge-success">Confirmed</span>
                  </td>
                </tr>
                <tr>
                  <td>Emily Clark</td>
                  <td>Dr. Lopez</td>
                  <td>10:15</td>
                  <td>
                    <span className="badge badge-warning">Pending</span>
                  </td>
                </tr>
              </tbody>
            </table>
          ) : (
            <p>You don&apos;t have permission to view appointments.</p>
          )}
        </div>

        <div className="panel">
          <div className="panel-header">
            <h2>Doctor availability</h2>
          </div>

          {canViewDoctors ? (
            <ul className="stats-list">
              <li>
                <span>Doctors on duty</span>
                <span>12</span>
              </li>
              <li>
                <span>In consultation</span>
                <span>7</span>
              </li>
              <li>
                <span>On break</span>
                <span>3</span>
              </li>
            </ul>
          ) : (
            <p>You don&apos;t have permission to view doctor stats.</p>
          )}
        </div>
      </section>
    </div>
  )
}

export default DashboardHome


