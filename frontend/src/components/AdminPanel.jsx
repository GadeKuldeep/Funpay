import React, { useState, useEffect } from 'react'
import { useAuth } from '../contexts/AuthContext'
import axios from 'axios'

function AdminPanel() {
  const [users, setUsers] = useState([])
  const [addFunds, setAddFunds] = useState({ toMobile: '', amount: '' })
  const [loading, setLoading] = useState(false)
  const [message, setMessage] = useState('')
  
  const { user, logout } = useAuth()

  useEffect(() => {
    fetchUsers()
  }, [])

  const fetchUsers = async () => {
    try {
      const response = await axios.get('/api/users')
      setUsers(response.data)
    } catch (error) {
      console.error('Failed to fetch users:', error)
      setMessage('Failed to load users')
    }
  }

  const handleAddFunds = async (e) => {
    e.preventDefault()
    setLoading(true)
    setMessage('')

    try {
      const response = await axios.post('/api/admin/add-funds', addFunds)
      setMessage(`Success: ${response.data.message}`)
      setAddFunds({ toMobile: '', amount: '' })
      fetchUsers() // Refresh user list
    } catch (error) {
      setMessage(`Error: ${error.response?.data?.message || 'Failed to add funds'}`)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="container">
      <nav className="navbar">
        <div className="navbar-content">
          <h1>Admin Panel</h1>
          <div>
            <span>Admin: {user?.name} </span>
            <button 
              className="btn btn-primary" 
              style={{ marginLeft: '10px' }}
              onClick={() => window.location.href = '/dashboard'}
            >
              User Dashboard
            </button>
            <button 
              className="btn btn-danger" 
              style={{ marginLeft: '10px' }}
              onClick={logout}
            >
              Logout
            </button>
          </div>
        </div>
      </nav>

      {message && (
        <div className={`alert ${message.includes('Error') ? 'alert-error' : 'alert-success'}`}>
          {message}
        </div>
      )}

      <div className="card">
        <h3>Add Funds to User</h3>
        <form onSubmit={handleAddFunds}>
          <div className="form-group">
            <input
              type="text"
              className="form-control"
              placeholder="User Mobile Number"
              value={addFunds.toMobile}
              onChange={(e) => setAddFunds({...addFunds, toMobile: e.target.value})}
              required
            />
          </div>
          <div className="form-group">
            <input
              type="number"
              className="form-control"
              placeholder="Amount to Add"
              value={addFunds.amount}
              onChange={(e) => setAddFunds({...addFunds, amount: e.target.value})}
              required
            />
          </div>
          <button 
            type="submit" 
            className="btn btn-success"
            disabled={loading}
          >
            {loading ? 'Adding Funds...' : 'Add Funds'}
          </button>
        </form>
      </div>

      <div className="card">
        <h3>All Users</h3>
        <div className="user-list">
          {users.map(user => (
            <div key={user._id} className="user-card">
              <h4>{user.name}</h4>
              <p>Mobile: {user.mobile}</p>
              <p>Balance: ₹{user.balance}</p>
              {user.isAdmin && <span style={{color: 'green'}}>Admin</span>}
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}

export default AdminPanel