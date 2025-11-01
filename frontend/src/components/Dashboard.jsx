import React, { useState, useEffect } from 'react'
import { useAuth } from '../contexts/AuthContext'
import axios from 'axios'

function Dashboard() {
  const [users, setUsers] = useState([])
  const [sendMoney, setSendMoney] = useState({ toMobile: '', amount: '' })
  const [loading, setLoading] = useState(false)
  const [message, setMessage] = useState('')
  const [activeTab, setActiveTab] = useState('send')
  
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

  const handleSendMoney = async (e) => {
    e.preventDefault()
    setLoading(true)
    setMessage('')

    try {
      const response = await axios.post('/api/users/send', sendMoney)
      setMessage(`Success: ${response.data.message}`)
      setSendMoney({ toMobile: '', amount: '' })
      fetchUsers() // Refresh user list to update balances
    } catch (error) {
      setMessage(`Error: ${error.response?.data?.message || 'Failed to send money'}`)
    } finally {
      setLoading(false)
    }
  }

  const currentUser = users.find(u => u.mobile === user?.mobile)

  return (
    <div className="container">
      <nav className="navbar">
        <div className="navbar-content">
          <h1>Payment App</h1>
          <div>
            <span>Welcome, {currentUser?.name || user?.name} </span>
            {currentUser?.isAdmin && (
              <button 
                className="btn btn-success" 
                style={{ marginLeft: '10px' }}
                onClick={() => window.location.href = '/admin'}
              >
                Admin Panel
              </button>
            )}
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

      <div className="card">
        <h2>Your Balance: ₹{currentUser?.balance || 0}</h2>
      </div>

      <div style={{ marginBottom: '20px' }}>
        <button 
          className={`btn ${activeTab === 'send' ? 'btn-primary' : ''}`}
          onClick={() => setActiveTab('send')}
        >
          Send Money
        </button>
        <button 
          className={`btn ${activeTab === 'users' ? 'btn-primary' : ''}`}
          style={{ marginLeft: '10px' }}
          onClick={() => setActiveTab('users')}
        >
          All Users
        </button>
      </div>

      {message && (
        <div className={`alert ${message.includes('Error') ? 'alert-error' : 'alert-success'}`}>
          {message}
        </div>
      )}

      {activeTab === 'send' && (
        <div className="card">
          <h3>Send Money</h3>
          <form onSubmit={handleSendMoney}>
            <div className="form-group">
              <input
                type="text"
                className="form-control"
                placeholder="Recipient Mobile Number"
                value={sendMoney.toMobile}
                onChange={(e) => setSendMoney({...sendMoney, toMobile: e.target.value})}
                required
              />
            </div>
            <div className="form-group">
              <input
                type="number"
                className="form-control"
                placeholder="Amount"
                value={sendMoney.amount}
                onChange={(e) => setSendMoney({...sendMoney, amount: e.target.value})}
                required
              />
            </div>
            <button 
              type="submit" 
              className="btn btn-primary"
              disabled={loading}
            >
              {loading ? 'Sending...' : 'Send Money'}
            </button>
          </form>
        </div>
      )}

      {activeTab === 'users' && (
        <div>
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
      )}
    </div>
  )
}

export default Dashboard