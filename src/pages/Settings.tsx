import React, { useState, useEffect } from 'react';
import { Save, Library, Clock, Bell, CircleDollarSign } from 'lucide-react';
import { useLibrary } from '../context/LibraryContext';
import './Settings.css';

export default function Settings() {
  const { settings, updateSettings } = useLibrary();
  
  // Local state for the form so we only save when clicking the button
  const [formData, setFormData] = useState(settings);
  const [isSaved, setIsSaved] = useState(false);

  useEffect(() => {
    setFormData(settings);
  }, [settings]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const target = e.target;
    const value = target.type === 'checkbox' ? (target as HTMLInputElement).checked : target.value;
    
    setFormData(prev => ({
      ...prev,
      [target.name]: target.type === 'number' ? Number(value) : value
    }));
    setIsSaved(false);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    updateSettings(formData);
    setIsSaved(true);
    
    // Hide the "Saved!" message after 3 seconds
    setTimeout(() => setIsSaved(false), 3000);
  };

  return (
    <div className="settings page-content">


      <form className="settings-form" onSubmit={handleSubmit}>
        
        <div className="settings-section glass-panel">
          <div className="settings-section-header">
            <Library size={22} className="settings-icon" />
            <h2>General Profile</h2>
          </div>
          
          <div className="settings-grid">
            <div className="form-group">
              <label>Library Name</label>
              <input 
                type="text" 
                name="libraryName"
                className="input-glass" 
                value={formData.libraryName} 
                onChange={handleChange}
                required
              />
            </div>
            
            <div className="form-group">
              <label>System Theme</label>
              <select 
                name="theme"
                className="input-glass"
                value={formData.theme}
                onChange={handleChange}
              >
                <option value="light">Light Mode</option>
                <option value="dark">Dark Mode</option>
              </select>
            </div>
          </div>
        </div>

        <div className="settings-section glass-panel">
          <div className="settings-section-header">
            <Clock size={22} className="settings-icon" />
            <h2>Loan Policies</h2>
          </div>
          
          <div className="settings-grid">
            <div className="form-group">
              <label>Default Loan Period (Days)</label>
              <input 
                type="number" 
                name="defaultLoanPeriod"
                className="input-glass" 
                min="1"
                max="90"
                value={formData.defaultLoanPeriod} 
                onChange={handleChange}
                required
              />
            </div>
            
            <div className="form-group">
              <label>Late Fee per Day ($)</label>
              <div className="input-with-icon">
                <CircleDollarSign size={18} className="input-icon-left" />
                <input 
                  type="number" 
                  name="lateFeePerDay"
                  className="input-glass" 
                  min="0"
                  step="0.10"
                  value={formData.lateFeePerDay} 
                  onChange={handleChange}
                  style={{ paddingLeft: '2.5rem' }}
                  required
                />
              </div>
            </div>
          </div>
        </div>

        <div className="settings-section glass-panel">
          <div className="settings-section-header">
            <Bell size={22} className="settings-icon" />
            <h2>Notifications</h2>
          </div>
          
          <div className="settings-list">
            <div className="setting-toggle-row">
              <div>
                <h3>Email Notifications</h3>
                <p>Send automated reminders for due dates and late fees.</p>
              </div>
              <label className="toggle-switch">
                <input 
                  type="checkbox" 
                  name="emailNotifications"
                  checked={formData.emailNotifications}
                  onChange={handleChange}
                />
                <span className="slider"></span>
              </label>
            </div>
            
            <div className="setting-toggle-row">
              <div>
                <h3>Push Notifications</h3>
                <p>Receive browser alerts for system updates.</p>
              </div>
              <label className="toggle-switch">
                <input 
                  type="checkbox" 
                  name="pushNotifications"
                  checked={formData.pushNotifications}
                  onChange={handleChange}
                />
                <span className="slider"></span>
              </label>
            </div>
          </div>
        </div>

        <div className="settings-actions">
          {isSaved && <span className="save-success">Settings saved successfully!</span>}
          <button type="submit" className="btn btn-primary save-btn">
            <Save size={18} />
            Save Changes
          </button>
        </div>

      </form>
    </div>
  );
}
