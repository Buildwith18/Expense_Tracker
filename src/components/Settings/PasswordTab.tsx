import React, { useState } from 'react';
import { userApi } from '../../services/api';
import { Lock, Eye, EyeOff, Save } from 'lucide-react';
import toast from 'react-hot-toast';

const PasswordTab: React.FC = () => {
  const [isLoading, setIsLoading] = useState(false);
  const [showPasswords, setShowPasswords] = useState({
    current: false,
    new: false,
    confirm: false,
  });
  const [passwordData, setPasswordData] = useState({
    currentPassword: '',
    newPassword: '',
    confirmPassword: '',
  });
  const [errors, setErrors] = useState<Record<string, string>>({});

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setPasswordData(prev => ({
      ...prev,
      [name]: value,
    }));
    
    // Clear error when user starts typing
    if (errors[name]) {
      setErrors(prev => ({
        ...prev,
        [name]: '',
      }));
    }
  };

  const togglePasswordVisibility = (field: keyof typeof showPasswords) => {
    setShowPasswords(prev => ({
      ...prev,
      [field]: !prev[field],
    }));
  };

  const validateForm = () => {
    const newErrors: Record<string, string> = {};

    if (!passwordData.currentPassword) {
      newErrors.currentPassword = 'Current password is required';
    }

    if (!passwordData.newPassword) {
      newErrors.newPassword = 'New password is required';
    } else if (passwordData.newPassword.length < 6) {
      newErrors.newPassword = 'Password must be at least 6 characters long';
    }

    if (!passwordData.confirmPassword) {
      newErrors.confirmPassword = 'Please confirm your new password';
    } else if (passwordData.newPassword !== passwordData.confirmPassword) {
      newErrors.confirmPassword = 'Passwords do not match';
    }

    if (passwordData.currentPassword === passwordData.newPassword) {
      newErrors.newPassword = 'New password must be different from current password';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validateForm()) {
      return;
    }

    setIsLoading(true);

    try {
      await userApi.changePassword(passwordData.currentPassword, passwordData.newPassword);
      toast.success('Password changed successfully!');
      
      // Reset form
      setPasswordData({
        currentPassword: '',
        newPassword: '',
        confirmPassword: '',
      });
      setShowPasswords({
        current: false,
        new: false,
        confirm: false,
      });
    } catch (error: any) {
      if (error.response?.data?.current_password) {
        setErrors({ currentPassword: 'Current password is incorrect' });
      } else {
        toast.error('Failed to change password');
      }
    } finally {
      setIsLoading(false);
    }
  };

  const getPasswordStrength = (password: string) => {
    if (password.length === 0) return { strength: 0, label: '', color: '' };
    if (password.length < 6) return { strength: 1, label: 'Weak', color: 'bg-red-500' };
    if (password.length < 10) return { strength: 2, label: 'Medium', color: 'bg-yellow-500' };
    if (password.length >= 10 && /(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/.test(password)) {
      return { strength: 3, label: 'Strong', color: 'bg-green-500' };
    }
    return { strength: 2, label: 'Medium', color: 'bg-yellow-500' };
  };

  const passwordStrength = getPasswordStrength(passwordData.newPassword);

  return (
    <div className="space-y-6">
      <div>
        <h3 className="text-lg font-medium text-gray-900 mb-2">Change Password</h3>
        <p className="text-sm text-gray-600">Update your password to keep your account secure.</p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Current Password */}
        <div>
          <label htmlFor="currentPassword" className="block text-sm font-medium text-gray-700 mb-1">
            Current Password
          </label>
          <div className="relative">
            <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
            <input
              type={showPasswords.current ? 'text' : 'password'}
              id="currentPassword"
              name="currentPassword"
              value={passwordData.currentPassword}
              onChange={handleChange}
              className={`w-full pl-10 pr-12 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent ${
                errors.currentPassword ? 'border-red-300' : 'border-gray-300'
              }`}
              placeholder="Enter your current password"
            />
            <button
              type="button"
              onClick={() => togglePasswordVisibility('current')}
              className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600"
            >
              {showPasswords.current ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
            </button>
          </div>
          {errors.currentPassword && (
            <p className="mt-1 text-sm text-red-600">{errors.currentPassword}</p>
          )}
        </div>

        {/* New Password */}
        <div>
          <label htmlFor="newPassword" className="block text-sm font-medium text-gray-700 mb-1">
            New Password
          </label>
          <div className="relative">
            <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
            <input
              type={showPasswords.new ? 'text' : 'password'}
              id="newPassword"
              name="newPassword"
              value={passwordData.newPassword}
              onChange={handleChange}
              className={`w-full pl-10 pr-12 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent ${
                errors.newPassword ? 'border-red-300' : 'border-gray-300'
              }`}
              placeholder="Enter your new password"
            />
            <button
              type="button"
              onClick={() => togglePasswordVisibility('new')}
              className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600"
            >
              {showPasswords.new ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
            </button>
          </div>
          
          {/* Password Strength Indicator */}
          {passwordData.newPassword && (
            <div className="mt-2">
              <div className="flex items-center space-x-2">
                <div className="flex-1 bg-gray-200 rounded-full h-2">
                  <div
                    className={`h-2 rounded-full transition-all duration-300 ${passwordStrength.color}`}
                    style={{ width: `${(passwordStrength.strength / 3) * 100}%` }}
                  ></div>
                </div>
                <span className={`text-sm font-medium ${
                  passwordStrength.strength === 1 ? 'text-red-600' :
                  passwordStrength.strength === 2 ? 'text-yellow-600' : 'text-green-600'
                }`}>
                  {passwordStrength.label}
                </span>
              </div>
            </div>
          )}
          
          {errors.newPassword && (
            <p className="mt-1 text-sm text-red-600">{errors.newPassword}</p>
          )}
        </div>

        {/* Confirm Password */}
        <div>
          <label htmlFor="confirmPassword" className="block text-sm font-medium text-gray-700 mb-1">
            Confirm New Password
          </label>
          <div className="relative">
            <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
            <input
              type={showPasswords.confirm ? 'text' : 'password'}
              id="confirmPassword"
              name="confirmPassword"
              value={passwordData.confirmPassword}
              onChange={handleChange}
              className={`w-full pl-10 pr-12 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent ${
                errors.confirmPassword ? 'border-red-300' : 'border-gray-300'
              }`}
              placeholder="Confirm your new password"
            />
            <button
              type="button"
              onClick={() => togglePasswordVisibility('confirm')}
              className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600"
            >
              {showPasswords.confirm ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
            </button>
          </div>
          {errors.confirmPassword && (
            <p className="mt-1 text-sm text-red-600">{errors.confirmPassword}</p>
          )}
        </div>

        {/* Password Requirements */}
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
          <h4 className="text-sm font-medium text-blue-900 mb-2">Password Requirements:</h4>
          <ul className="text-sm text-blue-800 space-y-1">
            <li className="flex items-center space-x-2">
              <span className={passwordData.newPassword.length >= 6 ? 'text-green-600' : 'text-gray-400'}>
                {passwordData.newPassword.length >= 6 ? '✓' : '○'}
              </span>
              <span>At least 6 characters long</span>
            </li>
            <li className="flex items-center space-x-2">
              <span className={/(?=.*[a-z])(?=.*[A-Z])/.test(passwordData.newPassword) ? 'text-green-600' : 'text-gray-400'}>
                {/(?=.*[a-z])(?=.*[A-Z])/.test(passwordData.newPassword) ? '✓' : '○'}
              </span>
              <span>Contains both uppercase and lowercase letters</span>
            </li>
            <li className="flex items-center space-x-2">
              <span className={/\d/.test(passwordData.newPassword) ? 'text-green-600' : 'text-gray-400'}>
                {/\d/.test(passwordData.newPassword) ? '✓' : '○'}
              </span>
              <span>Contains at least one number</span>
            </li>
          </ul>
        </div>

        {/* Save Button */}
        <div className="flex justify-end">
          <button
            type="submit"
            disabled={isLoading}
            className="flex items-center space-x-2 px-6 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
          >
            <Save className="w-4 h-4" />
            <span>{isLoading ? 'Updating...' : 'Update Password'}</span>
          </button>
        </div>
      </form>
    </div>
  );
};

export default PasswordTab;