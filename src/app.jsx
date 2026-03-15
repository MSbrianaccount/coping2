
    // alias commonly used React hooks from the UMD build
    const { useState, useEffect, useRef, useCallback, useMemo, useContext } = React;

    const ROLE_PERMISSIONS = {
      'admin': ['dashboard', 'patients', 'staff', 'finance', 'reports', 'settings', 'admin-panel', 'appointments'],
      'doctor': ['dashboard', 'patients', 'reports'],
      'nurse': ['dashboard', 'patients', 'appointments', 'reports'],
      'finance': ['dashboard', 'finance', 'reports'],
      'reception': ['dashboard', 'patients', 'appointments'],
      'therapist': ['dashboard', 'reports']
    };

    // ===== ACCESS DENIED COMPONENT =====
    const AccessDenied = ({ page, onRequestPassword, onCancel }) => {
      const [password, setPassword] = useState('');
      const [error, setError] = useState('');
      // Ensure audit list is retrieved safely to avoid runtime ReferenceError
      const auditList = (typeof DB !== 'undefined' && DB.getAuditTrail) ? (DB.getAuditTrail() || []) : [];

      const handleSubmit = (e) => {
        e.preventDefault();
        setError('');

        if (!password.trim()) {
          setError('Please enter password');
          return;
        }

        const result = PasswordAuth.authenticate(password);
        if (result.success && (result.isAdmin || result.role === page)) {
          setPassword('');
          onRequestPassword(result);
        } else {
          setError('Access denied. Only Admin or authorized staff can access this.');
          setPassword('');
        }
      };

      return (
        <div className="modal-overlay" onClick={onCancel}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h2>Access Restricted</h2>
              <button className="close-btn" onClick={onCancel}>&times;</button>
            </div>

            <div className="access-denied-content">
              <p>This section requires authorization. Please enter your password to access:</p>
              <p className="page-name">{page.toUpperCase()}</p>


            {auditList && (
              <div className="audit-list">
                <h3>Audit Trail (most recent first)</h3>
                {auditList.length === 0 ? (
                  <p>No audit events recorded</p>
                ) : (
                  <table className="data-table">
                    <thead>
                      <tr>
                        <th>Time</th>
                        <th>Type</th>
                        <th>User</th>
                        <th>Details</th>
                      </tr>
                    </thead>
                    <tbody>
                      {auditList.map(a => (
                        <tr key={a.id}>
                          <td>{new Date(a.timestamp).toLocaleString()}</td>
                          <td>{a.type}</td>
                          <td>{a.username || a.userId || 'system'}</td>
                          <td><pre style={{whiteSpace:'pre-wrap'}}>{JSON.stringify(a.details || {}, null, 2)}</pre></td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                )}
              </div>
            )}
              <form onSubmit={handleSubmit} className="admin-form">
                <div className="form-group">
                  <label>Admin/Authorized Password:</label>
                  <input
                    type="password"
                    className="form-input"
                    placeholder="Enter password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    autoFocus
                  />
                </div>

                {error && <div className="error-message">{error}</div>}

                <button type="submit" className="submit-btn">Verify</button>
                <button
                  type="button"
                  className="submit-btn cancel-btn"
                  onClick={onCancel}
                >
                  Cancel
                </button>
              </form>
            </div>
          </div>
        </div>
      );
    };
    const Login = ({ onLoginSuccess }) => {
      const [password, setPassword] = useState('');
      const [selectedRole, setSelectedRole] = useState('');
      const [error, setError] = useState('');
      const [isLoading, setIsLoading] = useState(false);
      const passwordInputRef = useRef(null);

      const roles = [
        { value: '', label: 'Select your role' },
        { value: 'admin', label: 'Admin' },
        { value: 'doctor', label: 'Doctor' },
        { value: 'nurse', label: 'Nurse' },
        { value: 'finance', label: 'Finance Officer' },
        { value: 'reception', label: 'Reception' },
        { value: 'therapist', label: 'Therapist' }
      ];

      const handleSubmit = (e) => {
        e.preventDefault();
        setError('');
        setIsLoading(true);

        if (!selectedRole) {
          setError('Please select a role');
          setIsLoading(false);
          return;
        }

        if (!password.trim()) {
          setError('Please enter a password');
          setIsLoading(false);
          return;
        }

        // Validate credentials
        const result = PasswordAuth.authenticate(password, selectedRole);

        if (result.success) {
          setPassword('');
          setSelectedRole('');
          setError('');
          setIsLoading(false);
          onLoginSuccess();
        } else {
          setError(result.message);
          setPassword('');
          setIsLoading(false);
          if (passwordInputRef.current) {
            setTimeout(() => passwordInputRef.current.focus(), 100);
          }
        }
      };

      useEffect(() => {
        if (passwordInputRef.current && !isLoading) {
          passwordInputRef.current.focus();
        }
      }, [isLoading]);

      return (
        <div className="login-container">
          <div className="login-card">
            <div className="login-header">
              <h1>RehabApp</h1>
              <p>Rehabilitation Management System</p>
            </div>

            <form onSubmit={handleSubmit} className="login-form">
              <div className="form-group">
                <label htmlFor="role">Select Role *</label>
                <select
                  id="role"
                  className="form-input"
                  value={selectedRole}
                  onChange={(e) => {
                    setSelectedRole(e.target.value);
                    setError('');
                  }}
                  disabled={isLoading}
                >
                  {roles.map((role) => (
                    <option key={role.value} value={role.value}>
                      {role.label}
                    </option>
                  ))}
                </select>
              </div>

              <div className="form-group">
                <label htmlFor="password">Enter Password *</label>
                <input
                  ref={passwordInputRef}
                  id="password"
                  type="password"
                  className="form-input"
                  placeholder="Enter password"
                  value={password}
                  onChange={(e) => {
                    setPassword(e.target.value);
                    setError('');
                  }}
                  onKeyPress={(e) => {
                    if (e.key === 'Enter' && password && selectedRole) {
                      handleSubmit(e);
                    }
                  }}
                  disabled={isLoading}
                  autoComplete="current-password"
                />
              </div>

              {error && <div className="error-message">{error}</div>}

              <button 
                type="submit" 
                className="submit-btn login-submit-btn"
                disabled={isLoading}
              >
                {isLoading ? 'Logging in...' : 'Enter'}
              </button>
            </form>

            <div className="demo-credentials">
              <h3>Demo Credentials:</h3>
              <p><strong>Admin:</strong> admin123</p>
              <p><strong>Doctor:</strong> doctor123</p>
              <p><strong>Nurse:</strong> nurse123</p>
              <p><strong>Finance:</strong> finance123</p>
              <p><strong>Reception:</strong> reception123</p>
              <p><strong>Therapist:</strong> therapist123</p>
            </div>
          </div>
        </div>
      );
    };

    // ===== MENU COMPONENT =====
    const Menu = ({ onNavigate, onClose, userRole, userPermissions }) => {
      const allMenuItems = [
        {
          id: 'dashboard',
          icon: '📊',
          title: 'Dashboard',
          description: 'View system metrics and overview'
        },
        {
          id: 'patients',
          icon: '👥',
          title: 'Patient Management',
          description: 'Manage patient records'
        },
        {
          id: 'staff',
          icon: '👔',
          title: 'Staff Management',
          description: 'Manage staff information'
        },
        {
          id: 'appointments',
          icon: '📅',
          title: 'Appointments',
          description: 'View and manage appointments'
        },
        {
          id: 'finance',
          icon: '💰',
          title: 'Billing & Finance',
          description: 'Invoice and payment tracking'
        },
        {
          id: 'reports',
          icon: '📈',
          title: 'Reports & Analytics',
          description: 'Generate reports and insights'
        },
        {
          id: 'settings',
          icon: '⚙️',
          title: 'Settings',
          description: 'Configure application settings'
        }
      ];

      const menuItems = allMenuItems.filter(item => userPermissions.includes(item.id));

      const handleCardClick = (id) => {
        onNavigate(id);
      };

      return (
        <div className="modal-overlay" onClick={onClose}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h2>Navigation Menu - {userRole.toUpperCase()}</h2>
              <button className="close-btn" onClick={onClose}>&times;</button>
            </div>

            <div className="menu-grid">
              {menuItems.map((item) => (
                <div
                  key={item.id}
                  className="menu-card"
                  onClick={() => handleCardClick(item.id)}
                >
                  <div className="menu-icon">{item.icon}</div>
                  <h3>{item.title}</h3>
                  <p>{item.description}</p>
                </div>
              ))}
            </div>
          </div>
        </div>
      );
    };

    // ===== ADMIN PANEL COMPONENT =====
    const AdminPanel = ({ onBack }) => {
      const [auditList, setAuditList] = useState(null);
      const [importing, setImporting] = useState(false);
      const [fullname, setFullname] = useState('');
      const [username, setUsername] = useState('');
      const [password, setPassword] = useState('');
      const [role, setRole] = useState('');
      const [photoFile, setPhotoFile] = useState(null);
      const [error, setError] = useState('');
      const [success, setSuccess] = useState('');
      const [staffList, setStaffList] = useState(null);

      const handleAddStaff = async (e) => {
        e.preventDefault();
        setError('');
        setSuccess('');

        if (!fullname || !username || !password || !role) {
          setError('All fields are required');
          return;
        }

        if (username.length < 3) {
          setError('Username must be at least 3 characters');
          return;
        }

        if (password.length < 6) {
          setError('Password must be at least 6 characters');
          return;
        }

        const result = PasswordAuth.addStaffMember(username, password, role, fullname);

        if (result.success) {
          // If photo provided, upload and attach
          if (photoFile && window.electronAPI && window.electronAPI.saveUpload) {
            try {
              const reader = new FileReader();
              reader.onload = async (ev) => {
                const dataUrl = ev.target.result;
                const uploaded = await window.electronAPI.saveUpload(photoFile.name, dataUrl);
                if (uploaded && uploaded.success) {
                  PasswordAuth.updateStaffMember(username, { photo: uploaded.path });
                }
              };
              reader.readAsDataURL(photoFile);
            } catch (e) {
              console.warn('Photo upload failed', e);
            }
          }

          setSuccess(result.message);
          setFullname('');
          setUsername('');
          setPassword('');
          setRole('');
          setPhotoFile(null);
        } else {
          setError(result.message);
        }
      };

      const handlePhotoChange = (e) => {
        const f = e.target.files && e.target.files[0];
        if (f) setPhotoFile(f);
      };

      const handleViewStaff = () => {
        const staff = PasswordAuth.getAllStaff();
        setStaffList(Object.entries(staff));
      };

      const handleRemoveStaff = (usr) => {
        if (!window.confirm(`Remove staff member "${usr}"? This will revoke access.`)) return;
        const result = PasswordAuth.removeStaffMember(usr);
        if (result && result.success) {
          DB.addAudit({ type: 'staff-remove', userId: null, username: 'admin', details: { username: usr } });
        }
        alert(result.message || 'Operation completed');
        handleViewStaff();
      };

      const handleEditStaff = async (usr) => {
        const staffMeta = PasswordAuth.getAuthorizedStaff()[usr] || {};
        const newName = await window.electronAPI.prompt('Full name:', staffMeta.name || '');
        const newRole = await window.electronAPI.prompt('Role (doctor,nurse,finance,reception,therapist):', staffMeta.role || '');
        // Ask to upload photo
        const doUpload = window.confirm('Upload a profile photo now?');
        if (doUpload && window.electronAPI && window.electronAPI.saveUpload) {
          const input = document.createElement('input');
          input.type = 'file';
          input.accept = 'image/*';
          input.onchange = async (e) => {
            const f = e.target.files[0];
            if (!f) return;
            const reader = new FileReader();
            reader.onload = async (ev) => {
              const dataUrl = ev.target.result;
              const uploaded = await window.electronAPI.saveUpload(f.name, dataUrl);
                if (uploaded && uploaded.success) {
                  PasswordAuth.updateStaffMember(usr, { photo: uploaded.path, name: newName, role: newRole });
                  DB.addAudit({ type: 'staff-update', userId: null, username: 'admin', details: { username: usr } });
                  alert('Staff updated');
                  handleViewStaff();
                } else {
                  alert('Upload failed');
                }
            };
            reader.readAsDataURL(f);
          };
          input.click();
        } else {
          const res = PasswordAuth.updateStaffMember(usr, { name: newName, role: newRole });
          if (res && res.success) DB.addAudit({ type: 'staff-update', userId: null, username: 'admin', details: { username: usr } });
          alert(res.message || 'Staff updated');
          handleViewStaff();
        }
      };

      const handleViewAudit = () => {
        const audits = DB.getAuditTrail() || [];
        setAuditList(audits.reverse());
      };

      const handleExportDB = () => {
        const db = DB.getDatabase();
        const dataStr = JSON.stringify(db, null, 2);
        const blob = new Blob([dataStr], { type: 'application/json' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `rehabapp-backup-${new Date().toISOString().slice(0,10)}.json`;
        document.body.appendChild(a);
        a.click();
        a.remove();
        DB.addAudit({ type: 'export-db', userId: null, username: 'admin', details: { size: dataStr.length } });
        alert('Database exported');
      };

      const handleImportDB = (file) => {
        if (!file) return;
        setImporting(true);
        const reader = new FileReader();
        reader.onload = (e) => {
          try {
            const parsed = JSON.parse(e.target.result);
            DB.saveDatabase(parsed);
            setImporting(false);
            DB.addAudit({ type: 'import-db', userId: null, username: 'admin', details: { restored: true } });
            alert('Database imported successfully');
            window.location.reload();
          } catch (err) {
            setImporting(false);
            alert('Invalid JSON file');
          }
        };
        reader.readAsText(file);
      };

      const handleDeleteStaff = (usr) => {
        if (window.confirm(`Remove staff member "${usr}"?`)) {
          const result = PasswordAuth.removeStaffMember(usr);
          alert(result.message);
          handleViewStaff();
        }
      };

      return (
        <div className="admin-panel">
          <div className="admin-header">
            <h2>Admin Panel - Add Staff Member</h2>
            <button className="back-btn" onClick={onBack}>← Back</button>
          </div>

          <div className="admin-content">
            <form onSubmit={handleAddStaff} className="admin-form">
              <div className="form-group">
                <label>Full Name:</label>
                <input
                  type="text"
                  className="form-input"
                  placeholder="Enter full name"
                  value={fullname}
                  onChange={(e) => setFullname(e.target.value)}
                />
              </div>

              <div className="form-group">
                <label>Username:</label>
                <input
                  type="text"
                  className="form-input"
                  placeholder="Enter username"
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                />
              </div>

              <div className="form-group">
                <label>Password:</label>
                <input
                  type="password"
                  className="form-input"
                  placeholder="Enter password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                />
              </div>

              <div className="form-group">
                <label>Role:</label>
                <select
                  className="form-input"
                  value={role}
                  onChange={(e) => setRole(e.target.value)}
                >
                  <option value="">Select Role</option>
                  <option value="doctor">Doctor</option>
                      <option value="nurse">Nurse</option>
                  <option value="finance">Finance</option>
                  <option value="reception">Reception</option>
                  <option value="therapist">Therapist</option>
                </select>
              </div>

              <div className="form-group">
                <label>Profile Photo (required within 5 days):</label>
                <input type="file" accept="image/*" onChange={handlePhotoChange} />
              </div>

              {error && <div className="error-message">{error}</div>}
              {success && <div className="success-message">{success}</div>}

              <button type="submit" className="submit-btn">Add Staff Member</button>
              <button
                type="button"
                className="submit-btn view-staff-btn"
                onClick={handleViewStaff}
              >
                View All Staff
              </button>
              <button type="button" className="submit-btn view-staff-btn" onClick={() => { const staff = PasswordAuth.getAllStaff(); setStaffList(Object.entries(staff)); }}>Refresh Staff</button>
              <button type="button" className="submit-btn view-staff-btn" onClick={handleViewAudit}>
                View Audit Trail
              </button>
              <button type="button" className="submit-btn" onClick={handleExportDB}>
                Export Database (JSON)
              </button>
              <label className="import-label">
                Import Database:
                <input type="file" accept="application/json" onChange={(e) => handleImportDB(e.target.files[0])} />
              </label>
            </form>

            {staffList && (
              <div className="staff-list">
                <h3>Registered Staff</h3>
                {staffList.length === 0 ? (
                  <p>No staff members registered</p>
                ) : (
                  <table>
                    <thead>
                      <tr>
                        <th>Name</th>
                        <th>Username</th>
                        <th>Role</th>
                        <th>Action</th>
                      </tr>
                    </thead>
                    <tbody>
                      {staffList.map(([usr, data]) => (
                        <tr key={usr}>
                          <td>
                            <div style={{display:'flex',alignItems:'center',gap:8}}>
                              <img src={data.photo || 'assets/default_avatar.png'} alt="photo" style={{width:40,height:40,borderRadius:20}} />
                              <div>{data.name}</div>
                            </div>
                          </td>
                          <td>{usr}</td>
                          <td>{data.role}</td>
                          <td>
                            <button className="action-btn edit-btn" onClick={() => handleEditStaff(usr)}>Edit</button>
                            <button className="action-btn delete-btn" onClick={() => handleRemoveStaff(usr)}>Remove</button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                )}
              </div>
            )}
          </div>
        </div>
      );
    };

    // ===== DASHBOARD PAGE =====
    const Dashboard = ({ user }) => {
      const [stats, setStats] = useState(null);
      const [photoWarning, setPhotoWarning] = useState(null);

      useEffect(() => {
        try {
          const current = PasswordAuth.getCurrentUser();
          if (current && !current.isAdmin) {
            const staff = PasswordAuth.getAllStaff();
            const meta = staff[current.username] || {};
            if (meta && !meta.photo) {
              const missingSince = meta.photoMissingSince ? new Date(meta.photoMissingSince).getTime() : (meta.createdAt ? new Date(meta.createdAt).getTime() : Date.now());
              const now = Date.now();
              const hours = Math.floor((now - missingSince) / (1000*60*60));
              const hoursLeft = Math.max(0, 120 - hours);
              setPhotoWarning({ hoursLeft, paused: meta.status === 'paused' });
            }
          }
        } catch (e) { /* ignore */ }
      }, []);

      useEffect(() => {
        const statistics = DB.getStatistics();
        setStats(statistics);
      }, []);

      if (!stats) {
        return <div className="page-container"><p>Loading...</p></div>;
      }

      if (photoWarning && photoWarning.paused) {
        return (
          <div className="page-container">
            <div className="error-message">Your account is paused until a profile photo is uploaded. Please contact admin or upload your photo.</div>
          </div>
        );
      }
      // Show reminder banner if photo is missing but not yet paused
      const reminderBanner = (photoWarning && !photoWarning.paused) ? (
        <div className="warning-message">Profile photo missing. Please upload within {Math.ceil(photoWarning.hoursLeft / 24)} day(s) ({photoWarning.hoursLeft} hours left).</div>
      ) : null;

      const renderDashboard = () => {
        if (user.isAdmin) {
          return (
            <div className="dashboard-grid">
              <div className="widget">
                <h3>Total Patients</h3>
                <p className="metric">{stats.totalPatients}</p>
              </div>
              <div className="widget">
                <h3>Active Staff</h3>
                <p className="metric">{stats.activeStaff}</p>
              </div>
              <div className="widget">
                <h3>Total Revenue</h3>
                <p className="metric">${stats.totalRevenue.toFixed(2)}</p>
              </div>
              <div className="widget">
                <h3>Pending Invoices</h3>
                <p className="metric">{stats.pendingInvoices}</p>
              </div>
            </div>
          );
        }

        return (
          <div className="dashboard-grid">
            <div className="widget">
              <h3>Welcome</h3>
              <p className="metric">Hello, {user.name}!</p>
            </div>
          </div>
        );
      };

      return (
        <div className="page-container">
          <h1>Dashboard</h1>
          {reminderBanner}
          {renderDashboard()}
        </div>
      );
    };

    // ===== ADD PATIENT MODAL =====
    const AddPatientModal = ({ onClose, onSuccess }) => {
      const [firstName, setFirstName] = useState('');
      const [lastName, setLastName] = useState('');
      const [dateOfBirth, setDateOfBirth] = useState('');
      const [phone, setPhone] = useState('');
      const [email, setEmail] = useState('');
      const [address, setAddress] = useState('');
      const [diagnosis, setDiagnosis] = useState('');
      const [error, setError] = useState('');
      const [success, setSuccess] = useState('');
      const [photoFile, setPhotoFile] = useState(null);

      const handleSubmit = async (e) => {
        e.preventDefault();
        setError('');
        setSuccess('');

        if (!firstName || !lastName || !phone || !diagnosis) {
          setError('Please fill in all required fields');
          return;
        }

        const newPatient = {
          firstName,
          lastName,
          dateOfBirth,
          phone,
          email,
          address,
          diagnosis,
          status: 'active',
          admissionDate: new Date().toISOString().split('T')[0],
          notes: ''
        };

        // If photo provided, upload it and set path
        if (photoFile && window.electronAPI && window.electronAPI.saveUpload) {
          try {
            const reader = new FileReader();
            reader.onload = async (ev) => {
              const dataUrl = ev.target.result;
              const uploaded = await window.electronAPI.saveUpload(photoFile.name, dataUrl);
              if (uploaded && uploaded.success) {
                newPatient.photo = uploaded.path;
              } else {
                newPatient.photo = 'assets/default_medical_avatar.png';
              }
              DB.addPatient(newPatient);
              setSuccess('Patient added successfully!');
              setTimeout(() => {
                onSuccess();
                onClose();
              }, 1000);
            };
            reader.readAsDataURL(photoFile);
            return;
          } catch (e) {
            console.warn('Patient photo upload failed', e);
            newPatient.photo = 'assets/default_medical_avatar.png';
          }
        } else {
          newPatient.photo = 'assets/default_medical_avatar.png';
        }

        DB.addPatient(newPatient);
        setSuccess('Patient added successfully!');
        setTimeout(() => {
          onSuccess();
          onClose();
        }, 1000);
      };

      const handlePhotoChange = (e) => {
        const f = e.target.files && e.target.files[0];
        if (f) setPhotoFile(f);
      };

      return (
        <div className="modal-overlay" onClick={onClose}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h2>Add New Patient</h2>
              <button className="close-btn" onClick={onClose}>&times;</button>
            </div>

            <form onSubmit={handleSubmit} className="admin-form">
              <div className="form-row">
                <div className="form-group">
                  <label>First Name *</label>
                  <input
                    type="text"
                    className="form-input"
                    value={firstName}
                    onChange={(e) => setFirstName(e.target.value)}
                    placeholder="First name"
                  />
                </div>
                <div className="form-group">
                  <label>Last Name *</label>
                  <input
                    type="text"
                    className="form-input"
                    value={lastName}
                    onChange={(e) => setLastName(e.target.value)}
                    placeholder="Last name"
                  />
                </div>
              </div>
              <div className="form-group">
                <label>Photo (optional):</label>
                <input type="file" accept="image/*" onChange={(e) => handlePhotoChange(e)} />
              </div>

              <div className="form-row">
                <div className="form-group">
                  <label>Date of Birth</label>
                  <input
                    type="date"
                    className="form-input"
                    value={dateOfBirth}
                    onChange={(e) => setDateOfBirth(e.target.value)}
                  />
                </div>
                <div className="form-group">
                  <label>Phone *</label>
                  <input
                    type="tel"
                    className="form-input"
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                    placeholder="Phone number"
                  />
                </div>
              </div>

              <div className="form-group">
                <label>Email</label>
                <input
                  type="email"
                  className="form-input"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="Email address"
                />
              </div>

              <div className="form-group">
                <label>Address</label>
                <textarea
                  className="form-input"
                  value={address}
                  onChange={(e) => setAddress(e.target.value)}
                  placeholder="Address"
                  rows="2"
                ></textarea>
              </div>

              <div className="form-group">
                <label>Diagnosis *</label>
                <textarea
                  className="form-input"
                  value={diagnosis}
                  onChange={(e) => setDiagnosis(e.target.value)}
                  placeholder="Medical diagnosis"
                  rows="3"
                ></textarea>
              </div>

              {error && <div className="error-message">{error}</div>}
              {success && <div className="success-message">{success}</div>}

              <button type="submit" className="submit-btn">Add Patient</button>
            </form>
          </div>
        </div>
      );
    };

    // ===== PATIENTS PAGE =====
    const Patients = ({ user, onSelectPatient }) => {
      const [patients, setPatients] = useState([]);
      const [showAddModal, setShowAddModal] = useState(false);
      const [showArchived, setShowArchived] = useState(false);

      const loadPatients = () => {
        let patientList = [];
        if (user.role === 'doctor') {
          patientList = DB.getPatients({ doctorId: user.id });
        } else if (user.isAdmin || user.role === 'reception') {
          patientList = DB.getPatients();
        }
        setPatients(patientList);
      };

      const loadArchived = () => {
        return DB.getArchivedPatients();
      };

      const handleDismiss = (id) => {
        if (!window.confirm('Dismiss patient (archive) — this will remove them from active lists. Continue?')) return;
        DB.dismissPatient(id, 'discharged');
        loadPatients();
        alert('Patient archived');
      };

      useEffect(() => {
        loadPatients();
      }, [user]);

      return (
        <div className="page-container">
          <h1>Patient Management</h1>

          {(user.role === 'doctor' || user.isAdmin || user.role === 'reception') && (
            <button className="add-btn" onClick={() => setShowAddModal(true)}>
              + Add Patient
            </button>
          )}

          {patients.length === 0 ? (
            <p className="empty-state">No patients found.</p>
          ) : (
            <table className="data-table">
              <thead>
                <tr>
                  <th>ID</th>
                  <th>Name</th>
                  <th>Phone</th>
                  <th>Email</th>
                  <th>Diagnosis</th>
                  <th>Status</th>
                </tr>
              </thead>
              <tbody>
                {patients.map((p) => (
                  <tr key={p.id} onClick={() => onSelectPatient && onSelectPatient(p)} style={{cursor:'pointer'}}>
                    <td>{p.id}</td>
                    <td>{p.firstName} {p.lastName}</td>
                    <td>{p.phone}</td>
                    <td>{p.email}</td>
                    <td>{p.diagnosis}</td>
                    <td>
                      <span className={`status-badge ${p.status}`}>
                        {p.status}
                      </span>
                    </td>
                    <td>
                      {(user.isAdmin || user.role === 'reception') && (
                        <button className="action-btn" onClick={(e)=>{ e.stopPropagation(); handleDismiss(p.id); }}>Dismiss</button>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}

          {showAddModal && (
            <AddPatientModal
              onClose={() => setShowAddModal(false)}
              onSuccess={loadPatients}
            />
          )}

          <div style={{marginTop:16}}>
            <button className="submit-btn" onClick={() => setShowArchived(!showArchived)}>{showArchived ? 'Hide Archived' : 'Show Archived/Discharged'}</button>
          </div>

          {showArchived && (
            <div style={{marginTop:12}}>
              <h3>Archived / Discharged Patients</h3>
              <table className="data-table">
                <thead>
                  <tr><th>ID</th><th>Name</th><th>Phone</th><th>Diagnosis</th><th>Archived At</th></tr>
                </thead>
                <tbody>
                  {loadArchived().map(p => (
                    <tr key={p.id}>
                      <td>{p.id}</td>
                      <td>{p.firstName} {p.lastName}</td>
                      <td>{p.phone}</td>
                      <td>{p.diagnosis}</td>
                      <td>{p.archivedAt}</td>
                      <td>
                        <button className="action-btn" onClick={async (e) => {
                          e.stopPropagation();
                          // Only admin may readmit; if current user not admin, request admin password
                          const current = PasswordAuth.getCurrentUser();
                          let authorized = false;
                          if (current && current.isAdmin) {
                            authorized = true;
                          } else {
                            const adm = await window.electronAPI.prompt('Enter Admin password to readmit patient:');
                            if (!adm) return alert('Admin password required');
                            if (PasswordAuth.verifyAdminPassword && PasswordAuth.verifyAdminPassword(adm)) {
                              authorized = true;
                            } else {
                              return alert('Invalid admin password');
                            }
                          }

                          if (authorized) {
                            const ok = DB.readmitPatient(p.id);
                            if (ok) {
                              alert('Patient readmitted');
                              loadPatients();
                            } else alert('Failed to readmit');
                          }
                        }}>Readmit</button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      );
    };

    // ===== PATIENT PROGRESS COMPONENT =====
    const PatientProgress = ({ patient, user, socket }) => {
      const [entries, setEntries] = useState([]);
      const [bp, setBp] = useState('');
      const [temp, setTemp] = useState('');
      const [hr, setHr] = useState('');
      const [notes, setNotes] = useState('');
      const [treatment, setTreatment] = useState('');
      const [practitioner, setPractitioner] = useState(user.name || user.username || '');

      useEffect(() => {
        if (!patient) return;
        const list = DB.getProgressEntries(patient.id);
        setEntries(list);
      }, [patient]);

      useEffect(() => {
        if (!socket) return;
        const handler = (data) => {
          if (String(data.patientId) === String(patient.id)) {
            setEntries((prev) => [data.entry, ...prev]);
          }
        };
        socket.on('progress:update', handler);
        return () => socket.off('progress:update', handler);
      }, [socket, patient]);

      const handleSave = () => {
        if (!patient) return alert('Select a patient from Manage Patient first');
        if (!practitioner) return alert('Enter practitioner name');
        const entry = {
          vitals: { bp, temp, hr },
          notes,
          treatment,
          practitioner,
          timestamp: new Date().toISOString()
        };
        const saved = DB.addProgressEntry(patient.id, entry);
        DB.addAudit({ type: 'progress-add', userId: user.id || null, username: user.name || user.username || null, details: { patientId: patient.id, entryId: saved.id } });
        // emit for sync
        if (socket && socket.connected) {
          socket.emit('progress:added', { patientId: patient.id, entry: saved });
        }
        setEntries([saved, ...entries]);
        // clear inputs
        setBp(''); setTemp(''); setHr(''); setNotes(''); setTreatment('');
      };

      if (!patient) {
        return (
          <div className="page-container">
            <h1>Patient Progress</h1>
            <p className="empty-state">Please go to Manage Patient and select a patient to view or add progress entries.</p>
          </div>
        );
      }

      return (
        <div className="page-container">
          <div className="progress-header">
            <h1>Progress Report</h1>
            <p><strong>Patient:</strong> {patient.firstName} {patient.lastName} &nbsp; <strong>ID:</strong> {patient.id}</p>
          </div>

          <div className="progress-form">
            <div className="form-row">
              <div className="form-group">
                <label>BP</label>
                <input value={bp} onChange={(e)=>setBp(e.target.value)} className="form-input" placeholder="e.g. 120/80" />
              </div>
              <div className="form-group">
                <label>Temp (°C)</label>
                <input value={temp} onChange={(e)=>setTemp(e.target.value)} className="form-input" placeholder="e.g. 37.0" />
              </div>
              <div className="form-group">
                <label>Heart Rate</label>
                <input value={hr} onChange={(e)=>setHr(e.target.value)} className="form-input" placeholder="bpm" />
              </div>
            </div>

            <div className="form-group">
              <label>Progress Notes</label>
              <textarea value={notes} onChange={(e)=>setNotes(e.target.value)} className="form-input" rows="3"></textarea>
            </div>

            <div className="form-row">
              <div className="form-group">
                <label>Treatment Administered</label>
                <input value={treatment} onChange={(e)=>setTreatment(e.target.value)} className="form-input" />
              </div>
              <div className="form-group">
                <label>Practitioner</label>
                <input value={practitioner} onChange={(e)=>setPractitioner(e.target.value)} className="form-input" />
              </div>
            </div>

            <div className="form-actions">
              <button className="submit-btn" onClick={handleSave}>Save Entry</button>
            </div>
          </div>

          <h2>Entries</h2>
          {entries.length === 0 ? (
            <p className="empty-state">No progress entries yet.</p>
          ) : (
            <table className="data-table">
              <thead>
                <tr>
                  <th>Date/Time</th>
                  <th>BP</th>
                  <th>Temp</th>
                  <th>HR</th>
                  <th>Notes</th>
                  <th>Treatment</th>
                  <th>Practitioner</th>
                </tr>
              </thead>
              <tbody>
                {entries.map(e => (
                  <tr key={e.id}>
                    <td>{new Date(e.timestamp).toLocaleString()}</td>
                    <td>{e.vitals?.bp || '-'}</td>
                    <td>{e.vitals?.temp || '-'}</td>
                    <td>{e.vitals?.hr || '-'}</td>
                    <td style={{whiteSpace:'pre-wrap'}}>{e.notes}</td>
                    <td>{e.treatment}</td>
                    <td>{e.practitioner}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
      );
    };

    // ===== APPOINTMENTS PAGE =====
    const Appointments = ({ user }) => {
      const [appointments, setAppointments] = useState([]);
      const [filterDate, setFilterDate] = useState('');

      const loadAppointments = () => {
        let appts = DB.getAppointments();
        if (user.role === 'doctor') {
          appts = DB.getAppointments({ doctorId: user.id });
        } else if (user.role === 'nurse') {
          appts = DB.getAppointments();
        }
        setAppointments(appts);
      };

      useEffect(() => {
        loadAppointments();
      }, [user]);

      const handleAdd = async () => {
        // Only Admin or Reception may create bookings
        if (!(user.isAdmin || user.role === 'reception')) {
          return alert('Only Admin or Reception can create appointments');
        }

        const patientId = await window.electronAPI.prompt('Patient ID for appointment:');
        if (!patientId) return;

        // let user pick staff from authorized staff list
        const staffObj = PasswordAuth.getAllStaff();
        const staffList = Object.entries(staffObj).map(([username, meta]) => ({ id: username, username, name: meta.name, role: meta.role, photo: meta.photo }));
        if (!staffList || staffList.length === 0) return alert('No staff available');
        const staffOptions = staffList.map(s => `${s.id}:${s.name || s.username}`).join('\n');
        const staffChoice = await window.electronAPI.prompt('Choose staff (enter username):\n' + staffOptions);
        if (!staffChoice) return;
        const staffSelected = staffList.find(s => String(s.id) === staffChoice) || staffList[0];

        const date = await window.electronAPI.prompt('Date (YYYY-MM-DD):', new Date().toISOString().split('T')[0]);
        if (!date) return;
        const time = await window.electronAPI.prompt('Time (HH:MM):', '09:00');
        const notes = (await window.electronAPI.prompt('Notes (optional):')) || '';

        const newAppt = DB.addAppointment({ patientId, doctorId: staffSelected.id || staffSelected.username || null, date, time, notes });
        DB.addAudit({ type: 'appointment-create', userId: user.id || null, username: user.name || user.username || null, details: { apptId: newAppt.id } });
        loadAppointments();
        alert('Appointment created');
      };

      const handleCancel = (id) => {
        if (!window.confirm('Cancel this appointment?')) return;
        DB.cancelAppointment(id);
        DB.addAudit({ type: 'appointment-cancel', userId: user.id || null, username: user.name || user.username || null, details: { apptId: id } });
        loadAppointments();
      };

      const filtered = filterDate ? appointments.filter(a => a.date === filterDate) : appointments;

      return (
        <div className="page-container">
          <h1>Appointments</h1>

          {(user.isAdmin || user.role === 'reception' || user.role === 'nurse') && (
            <button className="add-btn" onClick={handleAdd}>+ Create Appointment</button>
          )}

          <div className="filter-row">
            <label>Filter Date: <input type="date" value={filterDate} onChange={(e) => setFilterDate(e.target.value)} /></label>
            <button className="submit-btn" onClick={() => setFilterDate('')}>Clear</button>
          </div>

          {filtered.length === 0 ? (
            <p className="empty-state">No appointments found.</p>
          ) : (
            <table className="data-table">
              <thead>
                <tr>
                  <th>ID</th>
                  <th>Patient ID</th>
                  <th>Date</th>
                  <th>Status</th>
                  <th>Notes</th>
                  <th>Action</th>
                </tr>
              </thead>
              <tbody>
                {filtered.map(a => (
                  <tr key={a.id}>
                    <td>{a.id}</td>
                    <td>{a.patientId}</td>
                    <td>{a.date}</td>
                    <td>{a.status}</td>
                    <td>{a.notes}</td>
                    <td>
                      {a.status !== 'cancelled' && (
                        <button className="action-btn delete-btn" onClick={() => handleCancel(a.id)}>Cancel</button>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
      );
    };

    // ===== OTHER PAGES =====
    const Staff = ({ user }) => {
      const [staffList, setStaffList] = useState([]);
      const [filter, setFilter] = useState('all');

      const handleRemove = (username) => {
        if (!window.confirm(`Remove staff member "${username}"?`)) return;
        const res = PasswordAuth.removeStaffMember(username);
        if (res && res.success) DB.addAudit({ type: 'staff-remove', userId: user.id || null, username: user.username || user.name || null, details: { username } });
        alert(res && res.message ? res.message : 'Removed');
        loadStaff();
      };

      const handleEdit = async (username) => {
        const staffMeta = PasswordAuth.getAuthorizedStaff()[username] || {};
        const newName = await window.electronAPI.prompt('Full name:', staffMeta.name || '');
        const newRole = await window.electronAPI.prompt('Role (doctor,nurse,finance,reception,therapist):', staffMeta.role || '');
        const doUpload = window.confirm('Upload a new profile photo now?');
        if (doUpload && window.electronAPI && window.electronAPI.saveUpload) {
          const input = document.createElement('input');
          input.type = 'file';
          input.accept = 'image/*';
          input.onchange = async (e) => {
            const f = e.target.files[0];
            if (!f) return;
            const reader = new FileReader();
            reader.onload = async (ev) => {
              const dataUrl = ev.target.result;
              const uploaded = await window.electronAPI.saveUpload(f.name, dataUrl);
              if (uploaded && uploaded.success) {
                const res = PasswordAuth.updateStaffMember(username, { photo: uploaded.path, name: newName, role: newRole });
                if (res && res.success) DB.addAudit({ type: 'staff-update', userId: user.id || null, username: user.username || user.name || null, details: { username } });
                alert(res && res.message ? res.message : 'Staff updated');
                loadStaff();
              } else alert('Upload failed');
            };
            reader.readAsDataURL(f);
          };
          input.click();
        } else {
          const res = PasswordAuth.updateStaffMember(username, { name: newName, role: newRole });
          if (res && res.success) DB.addAudit({ type: 'staff-update', userId: user.id || null, username: user.username || user.name || null, details: { username } });
          alert(res && res.message ? res.message : 'Staff updated');
          loadStaff();
        }
      };

      const loadStaff = () => {
        if (user.isAdmin) {
          const staff = PasswordAuth.getAllStaff();
          const staffArray = Object.entries(staff).map(([username, data]) => ({
            username,
            ...data,
            id: username
          }));
          setStaffList(staffArray);
        }
      };

      useEffect(() => {
        loadStaff();
      }, [user]);

      if (!user.isAdmin) {
        return (
          <div className="page-container">
            <h1>Staff Management</h1>
            <div className="restricted-message">
              <p>⚠️ Only administrators can access staff management.</p>
            </div>
          </div>
        );
      }

      const filtered = filter === 'all' ? staffList : staffList.filter(s => s.role === filter);

      return (
        <div className="page-container">
          <h1>Staff Management</h1>

          <div className="staff-filter">
            <button
              className={`filter-btn ${filter === 'all' ? 'active' : ''}`}
              onClick={() => setFilter('all')}
            >
              All ({staffList.length})
            </button>
            {['doctor', 'nurse', 'finance', 'reception', 'therapist'].map((role) => (
              <button
                key={role}
                className={`filter-btn ${filter === role ? 'active' : ''}`}
                onClick={() => setFilter(role)}
              >
                {role.charAt(0).toUpperCase() + role.slice(1)} ({staffList.filter(s => s.role === role).length})
              </button>
            ))}
          </div>

          {filtered.length === 0 ? (
            <p className="empty-state">No staff members found.</p>
          ) : (
            <div className="staff-grid">
              {filtered.map((staff) => (
                <div key={staff.id} className="staff-card">
                  <div className="staff-card-header">
                    <h3>{staff.name}</h3>
                    <span className="role-badge">{staff.role}</span>
                  </div>
                  <div className="staff-card-body">
                    <p><strong>Username:</strong> {staff.username}</p>
                    <p><strong>Role:</strong> {staff.role.toUpperCase()}</p>
                    <p className="status">
                      <span className="status-indicator online"></span>
                      Active
                    </p>
                  </div>
                        <div className="staff-card-footer">
                          <button className="action-btn edit-btn" onClick={() => handleEdit(staff.username)}>Edit</button>
                          <button className="action-btn delete-btn" onClick={() => handleRemove(staff.username)}>Remove</button>
                        </div>
                </div>
              ))}
            </div>
          )}
        </div>
      );
    };

    const Finance = ({ user }) => {
      const [invoices, setInvoices] = useState([]);
      const [totalRevenue, setTotalRevenue] = useState(0);
      const [pendingAmount, setPendingAmount] = useState(0);

      useEffect(() => {
        const stats = DB.getStatistics();
        setTotalRevenue(stats.totalRevenue || 0);
        setPendingAmount(stats.pendingInvoices || 0);
        
        const allInvoices = DB.getAll('invoices') || [];
        setInvoices(allInvoices);
      }, []);

      const handleCreateInvoice = async () => {
        const patientId = await window.electronAPI.prompt('Enter Patient ID:');
        if (!patientId) return;

        const amount = await window.electronAPI.prompt('Enter amount:');
        if (!amount || isNaN(amount)) return;

        const newInvoice = {
          id: 'INV-' + Date.now(),
          patientId,
          amount: parseFloat(amount),
          date: new Date().toISOString().split('T')[0],
          status: 'pending',
          description: (await window.electronAPI.prompt('Enter description (optional):')) || 'Service rendered'
        };

        DB.save('invoices', [...invoices, newInvoice]);
        setInvoices([...invoices, newInvoice]);
        alert('Invoice created successfully!');
      };

      const markAsPaid = (invoiceId) => {
        const updated = invoices.map(inv =>
          inv.id === invoiceId ? { ...inv, status: 'paid' } : inv
        );
        DB.save('invoices', updated);
        setInvoices(updated);
      };

      return (
        <div className="page-container">
          <h1>Billing & Finance</h1>

          <div className="finance-dashboard">
            <div className="finance-card">
              <h3>Total Revenue</h3>
              <p className="large-metric">${totalRevenue.toFixed(2)}</p>
            </div>
            <div className="finance-card">
              <h3>Pending Invoices</h3>
              <p className="large-metric">{invoices.filter(i => i.status === 'pending').length}</p>
            </div>
            <div className="finance-card">
              <h3>Pending Amount</h3>
              <p className="large-metric">${invoices.filter(i => i.status === 'pending').reduce((sum, i) => sum + i.amount, 0).toFixed(2)}</p>
            </div>
          </div>

          {(user.isAdmin || user.role === 'finance') && (
            <button className="add-btn" onClick={handleCreateInvoice}>
              + Create Invoice
            </button>
          )}

          <h2>Invoice List</h2>
          {invoices.length === 0 ? (
            <p className="empty-state">No invoices found.</p>
          ) : (
            <table className="data-table">
              <thead>
                <tr>
                  <th>Invoice ID</th>
                  <th>Patient ID</th>
                  <th>Amount</th>
                  <th>Date</th>
                  <th>Status</th>
                  <th>Action</th>
                </tr>
              </thead>
              <tbody>
                {invoices.map((inv) => (
                  <tr key={inv.id}>
                    <td>{inv.id}</td>
                    <td>{inv.patientId}</td>
                    <td>${inv.amount.toFixed(2)}</td>
                    <td>{inv.date}</td>
                    <td>
                      <span className={`status-badge ${inv.status}`}>
                        {inv.status}
                      </span>
                    </td>
                    <td>
                      {inv.status === 'pending' && (
                        <button
                          className="action-btn"
                          onClick={() => markAsPaid(inv.id)}
                        >
                          Mark Paid
                        </button>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
      );
    };

    const Reports = ({ user }) => {
      const [stats, setStats] = useState({});
      const [recentProgress, setRecentProgress] = useState([]);
      const [invoicesSummary, setInvoicesSummary] = useState({ total: 0, pending: 0, paid: 0 });

      useEffect(() => {
        try {
          const s = DB.getStatistics() || {};
          setStats(s);

          const allProgress = DB.getAll('progress') || [];
          const recent = allProgress.sort((a,b)=>new Date(b.timestamp)-new Date(a.timestamp)).slice(0,10);
          setRecentProgress(recent);

          const invoices = DB.getAll('invoices') || [];
          const total = invoices.reduce((sum,inv)=>sum + (inv.paidAmount || 0), 0);
          const pending = invoices.filter(i=>i.status === 'pending').length;
          const paid = invoices.filter(i=>i.status === 'paid').length;
          setInvoicesSummary({ total, pending, paid });
        } catch (e) {
          console.warn('Reports load error', e);
        }
      }, []);

      const downloadReport = (report) => {
        const blob = new Blob([JSON.stringify(report, null, 2)], { type: 'application/json' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `report-${report.reportType || 'custom'}-${new Date().toISOString().slice(0,10)}.json`;
        document.body.appendChild(a);
        a.click();
        a.remove();
      };

      const generatePatientReport = (patientId) => {
        const patient = DB.getPatientById(patientId);
        if (!patient) return alert('Patient not found');
        const entries = DB.getProgressEntries(patientId) || [];
        const invoices = DB.getInvoices({ patientId }) || [];
        const report = {
          reportType: 'patient_report',
          patientId,
          generatedDate: new Date().toISOString(),
          data: {
            patient,
            totalVisits: entries.length,
            recentEntries: entries.slice(0,10),
            invoices
          }
        };
        downloadReport(report);
      };

      const generateFinancialReport = () => {
        const invoices = DB.getAll('invoices') || [];
        const totalRevenue = invoices.reduce((s,i)=>s + (i.paidAmount || 0), 0);
        const report = {
          reportType: 'financial_report',
          generatedDate: new Date().toISOString(),
          data: { totalRevenue, invoicesCount: invoices.length, invoices }
        };
        downloadReport(report);
      };

      return (
        <div className="page-container">
          <h1>Reports & Analytics</h1>

          <div className="dashboard-grid">
            <div className="widget">
              <h3>Total Patients</h3>
              <p className="metric">{stats.totalPatients || 0}</p>
            </div>
            <div className="widget">
              <h3>Active Staff</h3>
              <p className="metric">{stats.activeStaff || 0}</p>
            </div>
            <div className="widget">
              <h3>Total Revenue</h3>
              <p className="metric">${(invoicesSummary.total || 0).toFixed(2)}</p>
            </div>
            <div className="widget">
              <h3>Pending Invoices</h3>
              <p className="metric">{invoicesSummary.pending || 0}</p>
            </div>
          </div>

          <div style={{marginTop:16}}>
            <button className="submit-btn" onClick={generateFinancialReport}>Export Financial Report (JSON)</button>
            <button className="submit-btn" onClick={async () => {
              const pid = await window.electronAPI.prompt('Enter Patient ID to generate report for:');
              if (pid) generatePatientReport(pid);
            }}>Export Patient Report (JSON)</button>
          </div>

          <h2 style={{marginTop:20}}>Recent Progress Entries</h2>
          {recentProgress.length === 0 ? (
            <p className="empty-state">No progress entries available.</p>
          ) : (
            <table className="data-table">
              <thead>
                <tr><th>Date</th><th>Patient ID</th><th>Practitioner</th><th>Notes</th></tr>
              </thead>
              <tbody>
                {recentProgress.map(r => (
                  <tr key={r.id}>
                    <td>{new Date(r.timestamp).toLocaleString()}</td>
                    <td>{r.patientId}</td>
                    <td>{r.practitioner || '-'}</td>
                    <td style={{whiteSpace:'pre-wrap'}}>{r.notes || '-'}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
      );
    };

    const Settings = ({ user }) => {
      const [settings, setSettings] = useState({
        appName: 'RehabApp',
        theme: 'light',
        language: 'en',
        autoBackup: true
      });
      const [saved, setSaved] = useState(false);

      useEffect(() => {
        const saved = DB.load('settings') || settings;
        setSettings(saved);
      }, []);

      const handleSave = () => {
        DB.save('settings', settings);
        setSaved(true);
        setTimeout(() => setSaved(false), 2000);
      };

      const handleChange = (field, value) => {
        setSettings({
          ...settings,
          [field]: value
        });
      };

      // Apply theme immediately when changed
      useEffect(() => {
        try {
          if (settings && settings.theme) {
            document.documentElement.setAttribute('data-theme', settings.theme);
          }
        } catch (e) {
          console.warn('Failed to apply theme', e);
        }
      }, [settings.theme]);

      return (
        <div className="page-container">
          <h1>Settings</h1>

          <div className="settings-form">
            <div className="form-group">
              <label>Application Name:</label>
              <input
                type="text"
                className="form-input"
                value={settings.appName}
                onChange={(e) => handleChange('appName', e.target.value)}
              />
            </div>

            <div className="form-group">
              <label>Theme:</label>
              <select
                className="form-input"
                value={settings.theme}
                onChange={(e) => handleChange('theme', e.target.value)}
              >
                <option value="light">Light</option>
                <option value="dark">Dark</option>
              </select>
            </div>

            <div className="form-group">
              <label>Language:</label>
              <select
                className="form-input"
                value={settings.language}
                onChange={(e) => handleChange('language', e.target.value)}
              >
                <option value="en">English</option>
                <option value="es">Spanish</option>
                <option value="fr">French</option>
              </select>
            </div>

            <div className="form-group">
              <label>
                <input
                  type="checkbox"
                  checked={settings.autoBackup}
                  onChange={(e) => handleChange('autoBackup', e.target.checked)}
                />
                Auto Backup Enabled
              </label>
            </div>

            <button className="submit-btn" onClick={handleSave}>
              Save Settings
            </button>

            {saved && <div className="success-message">Settings saved!</div>}

            <div className="settings-info">
              <h3>Application Information</h3>
              <p><strong>Version:</strong> 1.0.0</p>
              <p><strong>Database:</strong> localStorage</p>
              <p><strong>User Role:</strong> {user.role.toUpperCase()}</p>
              <p><strong>Current User:</strong> {user.name}</p>
            </div>
              {user.isAdmin && (
                <div style={{marginTop:16}} className="admin-password-change">
                  <h3>Change Admin Password</h3>
                  <AdminPasswordChange />
                </div>
              )}
          </div>
        </div>
      );
    };

      const AdminPasswordChange = () => {
        const [currentPwd, setCurrentPwd] = useState('');
        const [newPwd, setNewPwd] = useState('');
        const [msg, setMsg] = useState('');

        const doChange = () => {
          setMsg('');
          try {
            if (!currentPwd || !newPwd) return setMsg('Fill both fields');
            const res = PasswordAuth.changeAdminPassword(currentPwd, newPwd);
            setMsg(res.message || (res.success ? 'Password changed' : 'Failed'));
            if (res.success) {
              setCurrentPwd(''); setNewPwd('');
            }
          } catch (e) {
            console.error('change admin pwd error', e);
            setMsg('Error changing password');
          }
        };

        return (
          <div>
            <div className="form-group">
              <label>Current Admin Password</label>
              <input type="password" className="form-input" value={currentPwd} onChange={(e)=>setCurrentPwd(e.target.value)} />
            </div>
            <div className="form-group">
              <label>New Admin Password</label>
              <input type="password" className="form-input" value={newPwd} onChange={(e)=>setNewPwd(e.target.value)} />
            </div>
            {msg && <div className="error-message" style={{marginBottom:8}}>{msg}</div>}
            <button className="submit-btn" onClick={doChange}>Change Admin Password</button>
          </div>
        );
      };

    // ===== MAIN APP COMPONENT =====
    const App = () => {
      const INACTIVITY_TIMEOUT = 10 * 60 * 1000; // 10 minutes
      const inactivityTimerRef = useRef(null);

      const resetInactivityTimer = (userObj) => {
        if (inactivityTimerRef.current) {
          clearTimeout(inactivityTimerRef.current);
        }
        inactivityTimerRef.current = setTimeout(() => {
          const currentUser = userObj || PasswordAuth.getCurrentUser();
          if (currentUser) {
            DB.addAudit({ type: 'auto-logout', userId: currentUser.id || null, username: currentUser.name || currentUser.username || null, role: currentUser.role || null, reason: 'inactivity' });
          }
          PasswordAuth.logout();
          localStorage.removeItem('rehabapp_session');
          setUser(null);
          setShowMenu(false);
          setShowAdminPanel(false);
          setShowAccessDenied(false);
          setRequestedPage('');
          setCurrentPage('dashboard');
          alert('You have been logged out due to inactivity.');
        }, INACTIVITY_TIMEOUT);
      };

      useEffect(() => {
        const activityEvents = ['click', 'mousemove', 'keydown', 'touchstart'];
        const handleActivity = () => resetInactivityTimer();

        activityEvents.forEach(evt => window.addEventListener(evt, handleActivity));
        if (PasswordAuth.getCurrentUser()) resetInactivityTimer(PasswordAuth.getCurrentUser());

        return () => {
          activityEvents.forEach(evt => window.removeEventListener(evt, handleActivity));
          if (inactivityTimerRef.current) clearTimeout(inactivityTimerRef.current);
        };
      }, []);

      const [currentPage, setCurrentPage] = useState('dashboard');
      const [showMenu, setShowMenu] = useState(false);
      const [user, setUser] = useState(null);
      const [showAdminPanel, setShowAdminPanel] = useState(false);
      const [isLoading, setIsLoading] = useState(true);
      const [showAccessDenied, setShowAccessDenied] = useState(false);
      const [requestedPage, setRequestedPage] = useState('');
      const [selectedPatient, setSelectedPatient] = useState(null);
      const [socket, setSocket] = useState(null);
      const [connectionInfo, setConnectionInfo] = useState({ connected: false, host: null, port: null, workspace: null });

      // Check for persistent login on mount
      useEffect(() => {
        const savedSession = localStorage.getItem('rehabapp_session');
        if (savedSession) {
          try {
            const sessionData = JSON.parse(savedSession);
            // Validate session
            const authenticatedUser = PasswordAuth.getCurrentUser();
            if (authenticatedUser) {
              // Verify staff status (photo pause)
              if (!authenticatedUser.isAdmin) {
                const staffMeta = PasswordAuth.getAuthorizedStaff()[authenticatedUser.username] || {};
                if (staffMeta && staffMeta.status === 'paused') {
                  // revoke session
                  PasswordAuth.logout();
                  localStorage.removeItem('rehabapp_session');
                } else {
                  setUser(authenticatedUser);
                }
              } else {
                setUser(authenticatedUser);
              }
            } else {
              localStorage.removeItem('rehabapp_session');
            }
          } catch (e) {
            localStorage.removeItem('rehabapp_session');
          }
        }
        setIsLoading(false);
      }, []);

        // cleanup socket on unmount
        useEffect(() => {
          return () => {
            if (socket && socket.disconnect) socket.disconnect();
          };
        }, [socket]);

        // Close modals on Escape key for smoother UX
        useEffect(() => {
          const onKey = (e) => {
            if (e.key === 'Escape') {
              setShowMenu(false);
              setShowAccessDenied(false);
              setShowAdminPanel(false);
            }
          };
          window.addEventListener('keydown', onKey);
          return () => window.removeEventListener('keydown', onKey);
        }, []);

      const handleLoginSuccess = (panel = null) => {
        if (panel === 'admin-panel') {
          setShowAdminPanel(true);
        } else {
          const authenticatedUser = PasswordAuth.getCurrentUser();
          setUser(authenticatedUser);
          // Save session
          localStorage.setItem('rehabapp_session', JSON.stringify({
            userId: authenticatedUser.id,
            username: authenticatedUser.name,
            role: authenticatedUser.role,
            timestamp: new Date().toISOString()
          }));
          setCurrentPage('dashboard');
        }
      };

      const handleLogout = () => {
        if (window.confirm('Are you sure you want to logout?')) {
          const currentUser = PasswordAuth.getCurrentUser();
          if (currentUser) {
            DB.addAudit({
              type: 'logout',
              userId: currentUser.id || null,
              username: currentUser.name || currentUser.username || null,
              role: currentUser.role || null,
              reason: 'manual'
            });
          }
          PasswordAuth.logout();
          localStorage.removeItem('rehabapp_session');
          setUser(null);
          setShowMenu(false);
          setShowAdminPanel(false);
          // Ensure any access modal or requested page is cleared so login inputs work
          setShowAccessDenied(false);
          setRequestedPage('');
          setCurrentPage('dashboard');
        }
      };

      const handleNavigate = (page) => {
        if (canAccess(page)) {
          setCurrentPage(page);
          setShowMenu(false);
        } else {
          setRequestedPage(page);
          setShowAccessDenied(true);
          setShowMenu(false);
        }
      };

      const handleSelectPatient = (patient) => {
        setSelectedPatient(patient);
        setCurrentPage('patient-progress');
      };

      // Network discovery / join / create
      const discoverAndJoin = async (workspaceName, pin) => {
        try {
          const resp = await window.electronAPI.discoverWorkspace(workspaceName);
          if (resp) {
            const url = `http://${resp.host}:${resp.port}`;
            // determine providedPin ahead of socket connect (may prompt)
            let providedPin = pin || null;
            if (resp.requiresPin && !providedPin) {
              providedPin = await window.electronAPI.prompt('Enter workspace PIN:');
            }
            const s = io(url, { autoConnect: false });
            // attempt connect then authenticate with PIN if required
            s.on('connect', () => {
              if (resp.requiresPin) {
                s.emit('auth:join', { pin: providedPin });
              } else {
                s.emit('auth:join', {});
              }
            });

            s.on('auth:ok', () => {
              setSocket(s);
              DB.flushSyncQueue();
              setConnectionInfo({ connected: true, host: resp.host, port: resp.port, workspace: workspaceName });
            });

            s.on('auth:failed', (d) => {
              alert('Failed to join workspace: ' + (d?.message || 'Authentication failed'));
              s.disconnect();
            });

            s.on('connect_error', (err) => {
              console.warn('connect_error', err);
            });

            s.connect();
          } else {
            // not found - try localhost probe as a fallback (common for packaged single-host setups)
            let localProbe = null;
            try {
              const res = await fetch('http://127.0.0.1:3001/');
              if (res && res.ok) localProbe = await res.json();
            } catch (e) {
              // ignore
            }

            if (localProbe) {
              const resp = { host: '127.0.0.1', port: 3001, requiresPin: false, name: localProbe.workspace || workspaceName };
              const url = `http://${resp.host}:${resp.port}`;
              const s = io(url, { autoConnect: false });

              s.on('connect', () => {
                s.emit('auth:join', {});
              });

              s.on('auth:ok', () => {
                setSocket(s);
                DB.flushSyncQueue();
                setConnectionInfo({ connected: true, host: resp.host, port: resp.port, workspace: workspaceName });
              });

              s.on('auth:failed', (d) => {
                alert('Failed to join local workspace: ' + (d?.message || 'Authentication failed'));
                s.disconnect();
              });

              s.on('connect_error', (err) => console.warn('connect_error', err));
              s.connect();
              return;
            }

            // not found
            if (PasswordAuth.getCurrentUser() && PasswordAuth.getCurrentUser().isAdmin) {
              // create host - ask for optional PIN
              const newPin = await window.electronAPI.prompt('No workspace found. Enter a PIN to protect this workspace (leave blank for none):', '');
              await window.electronAPI.startServer(workspaceName, newPin || '');
              // try connect to localhost
              const url = `http://127.0.0.1:3001`;
              const s = io(url, { autoConnect: false });

              s.on('connect', () => {
                if (newPin) {
                  s.emit('auth:join', { pin: newPin });
                } else {
                  s.emit('auth:join', {});
                }
              });

              s.on('auth:ok', () => {
                setSocket(s);
                DB.flushSyncQueue();
                setConnectionInfo({ connected: true, host: '127.0.0.1', port: 3001, workspace: workspaceName });
              });

              s.on('auth:failed', (d) => {
                alert('Failed to join newly created workspace: ' + (d?.message || 'Authentication failed'));
                s.disconnect();
              });

              s.connect();
              return;
            }

            // fallback: if no response after attempt, inform user
            alert('No workspace found on the local network. If you expect available hosts, check firewall settings or try creating a workspace as Admin.');
          }
        } catch (err) {
          console.error('discoverAndJoin error', err);
          alert('Workspace discovery failed: ' + (err && err.message ? err.message : 'unknown error'));
        }
      };

      const canAccess = (page) => {
        if (!user) return false;
        const permissions = ROLE_PERMISSIONS[user.role] || [];
        return permissions.includes(page);
      };

      const handleBackFromAdmin = () => {
        setShowAdminPanel(false);
      };

      const handleAccessGranted = (result) => {
        setShowAccessDenied(false);
        setCurrentPage(requestedPage);
        setRequestedPage('');
      };

      if (isLoading) {
        return (
          <div className="login-container">
            <div className="login-card">
              <h1>Loading...</h1>
            </div>
          </div>
        );
      }

      if (!user) {
        return <Login onLoginSuccess={handleLoginSuccess} />;
      }

      if (showAdminPanel && user.isAdmin) {
        return <AdminPanel onBack={handleBackFromAdmin} />;
      }

      const renderPage = () => {
        switch (currentPage) {
          case 'dashboard':
              return <Dashboard user={user} />;
            case 'patients':
              return <Patients user={user} onSelectPatient={handleSelectPatient} />;
            case 'patient-progress':
              return <PatientProgress patient={selectedPatient} user={user} socket={socket} />;
          case 'appointments':
            return <Appointments user={user} />;
          case 'staff':
            return <Staff user={user} />;
          case 'finance':
            return <Finance user={user} />;
          case 'reports':
            return <Reports user={user} />;
          case 'settings':
            return <Settings user={user} />;
          case 'admin-panel':
            return user.isAdmin ? <AdminPanel onBack={() => setCurrentPage('dashboard')} /> : <Dashboard user={user} />;
          default:
            return <Dashboard user={user} />;
        }
      };

      return (
        <div className="app">
          <nav className="navbar">
            <div className="navbar-brand">
              <span className="brand-name">RehabApp</span>
            </div>
            <div className="navbar-center">
              <span className="user-role">{user.role.toUpperCase()}</span>
              <span className="user-name">{user.name}</span>
            </div>
            <div className="navbar-right">
              <div className="connection-status" title={connectionInfo.connected ? 'Connected' : 'Offline'}>
                <span style={{width:12,height:12,display:'inline-block',borderRadius:6,background: connectionInfo.connected ? 'green' : 'red',marginRight:8}}></span>
                <small>{connectionInfo.workspace || 'No Workspace'}</small>
              </div>
              <button className="menu-btn" onClick={async () => {
                const name = await window.electronAPI.prompt('Workspace Name to join/create:','Wellness');
                if (name) discoverAndJoin(name);
              }}>Connect</button>
              {user.isAdmin && (
                <button
                  className="menu-btn"
                  onClick={() => setShowAdminPanel(!showAdminPanel)}
                  title="Admin Panel"
                >
                  🔧 Admin
                </button>
              )}
              <button
                className="menu-btn"
                onClick={() => setShowMenu(!showMenu)}
              >
                ☰ Menu
              </button>
              <button className="logout-btn" onClick={handleLogout}>
                Logout
              </button>
            </div>
          </nav>

          <div className="main-content">
            {renderPage()}
          </div>

          {showMenu && (
            <Menu
              onNavigate={handleNavigate}
              onClose={() => setShowMenu(false)}
              userRole={user.role}
              userPermissions={ROLE_PERMISSIONS[user.role] || []}
            />
          )}

          {showAccessDenied && (
            <AccessDenied
              page={requestedPage}
              onRequestPassword={handleAccessGranted}
              onCancel={() => {
                setShowAccessDenied(false);
                setRequestedPage('');
              }}
            />
          )}
        </div>
      );
    };

    // Render the app
    const root = ReactDOM.createRoot(document.getElementById('root'));
    root.render(<App />);
  