import React, { useState, useEffect } from 'react';
import { userApi } from '../../services/api';
import { Moon, Sun, Palette, Save } from 'lucide-react';
import toast from 'react-hot-toast';

const AppearanceTab: React.FC = () => {
  const [isLoading, setIsLoading] = useState(false);
  const [isInitialLoading, setIsInitialLoading] = useState(true);
  const [appearanceData, setAppearanceData] = useState({
    darkMode: false,
    themeColor: 'blue',
    compactMode: false,
  });

  // Apply dark mode to document immediately
  useEffect(() => {
    if (appearanceData.darkMode) {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
  }, [appearanceData.darkMode]);

  // Load dark mode from localStorage and backend on mount
  useEffect(() => {
    const loadInitialSettings = async () => {
      // First, load from localStorage for immediate UI update
      const storedDarkMode = localStorage.getItem('darkMode');
      if (storedDarkMode) {
        try {
          const isDark = JSON.parse(storedDarkMode);
          setAppearanceData(prev => ({ ...prev, darkMode: isDark }));
        } catch (e) {
          console.error('Failed to parse darkMode from localStorage:', e);
        }
      }
      
      // Then, fetch from backend to ensure consistency
      try {
        const data = await userApi.getSettings();
        const backendDarkMode = data.preferences?.dark_mode;
        if (backendDarkMode !== undefined) {
          setAppearanceData(prev => ({ ...prev, darkMode: backendDarkMode }));
          localStorage.setItem('darkMode', JSON.stringify(backendDarkMode));
        }
      } catch (error) {
        console.error('Failed to load appearance settings from backend:', error);
      }
    };
    
    loadInitialSettings();
  }, []);

  const themeColors = [
    { name: 'Blue', value: 'blue', color: 'bg-blue-500' },
    { name: 'Green', value: 'green', color: 'bg-green-500' },
    { name: 'Purple', value: 'purple', color: 'bg-purple-500' },
    { name: 'Red', value: 'red', color: 'bg-red-500' },
    { name: 'Orange', value: 'orange', color: 'bg-orange-500' },
    { name: 'Pink', value: 'pink', color: 'bg-pink-500' },
  ];

  useEffect(() => {
    fetchAppearanceSettings();
  }, []);

  const fetchAppearanceSettings = async () => {
    try {
      setIsInitialLoading(true);
      const data = await userApi.getSettings();
      setAppearanceData({
        darkMode: data.preferences?.dark_mode || false,
        themeColor: data.preferences?.theme_color || 'blue',
        compactMode: data.preferences?.compact_mode || false,
      });
    } catch (error) {
      console.error('Failed to fetch appearance settings:', error);
    } finally {
      setIsInitialLoading(false);
    }
  };

  const handleToggle = async (field: string) => {
    const newValue = !appearanceData[field as keyof typeof appearanceData];
    
    // Update UI immediately
    setAppearanceData(prev => ({
      ...prev,
      [field]: newValue,
    }));
    
    // Save to localStorage immediately for dark mode
    if (field === 'darkMode') {
      localStorage.setItem('darkMode', JSON.stringify(newValue));
      // Apply dark mode immediately
      if (newValue) {
        document.documentElement.classList.add('dark');
      } else {
        document.documentElement.classList.remove('dark');
      }
    }
    
    // Save to backend
    try {
      await userApi.updateSettings({
        preferences: {
          dark_mode: field === 'darkMode' ? newValue : appearanceData.darkMode,
          theme_color: field === 'themeColor' ? newValue : appearanceData.themeColor,
          compact_mode: field === 'compactMode' ? newValue : appearanceData.compactMode,
        }
      });
      toast.success(`${field === 'darkMode' ? 'Theme' : field === 'compactMode' ? 'Layout' : 'Setting'} updated!`);
    } catch (error) {
      console.error('Failed to save appearance setting:', error);
      toast.error('Failed to save setting');
      // Revert on error
      setAppearanceData(prev => ({
        ...prev,
        [field]: !newValue,
      }));
      if (field === 'darkMode') {
        localStorage.setItem('darkMode', JSON.stringify(!newValue));
        if (!newValue) {
          document.documentElement.classList.add('dark');
        } else {
          document.documentElement.classList.remove('dark');
        }
      }
    }
  };

  const handleThemeChange = async (color: string) => {
    // Update UI immediately
    setAppearanceData(prev => ({
      ...prev,
      themeColor: color,
    }));
    
    // Save to backend
    try {
      await userApi.updateSettings({
        preferences: {
          dark_mode: appearanceData.darkMode,
          theme_color: color,
          compact_mode: appearanceData.compactMode,
        }
      });
      toast.success('Theme color updated!');
    } catch (error) {
      console.error('Failed to save theme:', error);
      toast.error('Failed to save theme color');
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      await userApi.updateSettings({
        preferences: {
          dark_mode: appearanceData.darkMode,
          theme_color: appearanceData.themeColor,
          compact_mode: appearanceData.compactMode,
        }
      });
      
      // Store dark mode preference in localStorage for immediate access
      localStorage.setItem('darkMode', JSON.stringify(appearanceData.darkMode));
      toast.success('Appearance settings saved!');
    } catch (error) {
      console.error('Failed to update appearance settings:', error);
      toast.error('Failed to save appearance settings');
    } finally {
      setIsLoading(false);
    }
  };

  if (isInitialLoading) {
    return (
      <div className="flex items-center justify-center py-8">
        <div className="animate-spin h-8 w-8 border-2 border-blue-600 border-t-transparent rounded-full"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div>
        <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">Appearance</h3>
        <p className="text-sm text-gray-600 dark:text-gray-400">Customize the look and feel of your dashboard.</p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Dark Mode Toggle */}
        <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
          <div className="flex items-center space-x-3">
            {appearanceData.darkMode ? (
              <Moon className="w-5 h-5 text-gray-600" />
            ) : (
              <Sun className="w-5 h-5 text-gray-600" />
            )}
            <div>
              <h4 className="text-sm font-medium text-gray-900">Dark Mode</h4>
              <p className="text-sm text-gray-500">Switch between light and dark themes</p>
            </div>
          </div>
          <button
            type="button"
            onClick={() => handleToggle('darkMode')}
            className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
              appearanceData.darkMode ? 'bg-blue-600' : 'bg-gray-200'
            }`}
            aria-label={appearanceData.darkMode ? 'Disable dark mode' : 'Enable dark mode'}
            title={appearanceData.darkMode ? 'Disable dark mode' : 'Enable dark mode'}
          >
            <span
              className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                appearanceData.darkMode ? 'translate-x-6' : 'translate-x-1'
              }`}
            />
          </button>
        </div>

        {/* Theme Color Selection */}
        <div>
          <div className="flex items-center space-x-2 mb-4">
            <Palette className="w-5 h-5 text-gray-600" />
            <h4 className="text-sm font-medium text-gray-900">Theme Color</h4>
          </div>
          <div className="grid grid-cols-3 md:grid-cols-6 gap-3">
            {themeColors.map((theme) => (
              <button
                key={theme.value}
                type="button"
                onClick={() => handleThemeChange(theme.value)}
                className={`flex flex-col items-center p-3 rounded-lg border-2 transition-colors ${
                  appearanceData.themeColor === theme.value
                    ? 'border-gray-400 bg-gray-50'
                    : 'border-gray-200 hover:border-gray-300'
                }`}
              >
                <div className={`w-8 h-8 rounded-full ${theme.color} mb-2`}></div>
                <span className="text-xs text-gray-600">{theme.name}</span>
              </button>
            ))}
          </div>
        </div>

        {/* Compact Mode */}
        <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
          <div>
            <h4 className="text-sm font-medium text-gray-900">Compact Mode</h4>
            <p className="text-sm text-gray-500">Reduce spacing and padding for a denser layout</p>
          </div>
          <button
            type="button"
            onClick={() => handleToggle('compactMode')}
            className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
              appearanceData.compactMode ? 'bg-blue-600' : 'bg-gray-200'
            }`}
            aria-label={appearanceData.compactMode ? 'Disable compact mode' : 'Enable compact mode'}
            title={appearanceData.compactMode ? 'Disable compact mode' : 'Enable compact mode'}
          >
            <span
              className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                appearanceData.compactMode ? 'translate-x-6' : 'translate-x-1'
              }`}
            />
          </button>
        </div>

        {/* Preview Section */}
        <div className="border border-gray-200 rounded-lg p-4">
          <h4 className="text-sm font-medium text-gray-900 mb-3">Preview</h4>
          <div className={`p-4 rounded-lg ${appearanceData.darkMode ? 'bg-gray-800 text-white' : 'bg-white border border-gray-200'}`}>
            <div className="flex items-center space-x-3 mb-3">
              <div className={`w-3 h-3 rounded-full ${themeColors.find(t => t.value === appearanceData.themeColor)?.color}`}></div>
              <span className={`text-sm font-medium ${appearanceData.compactMode ? 'text-xs' : ''}`}>
                Sample Dashboard Card
              </span>
            </div>
            <p className={`text-sm ${appearanceData.darkMode ? 'text-gray-300' : 'text-gray-600'} ${appearanceData.compactMode ? 'text-xs' : ''}`}>
              This is how your dashboard will look with the selected theme.
            </p>
          </div>
        </div>

        {/* Save Button */}
        <div className="flex justify-end">
          <button
            type="submit"
            disabled={isLoading}
            className="flex items-center space-x-2 px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
          >
            <Save className="w-4 h-4" />
            <span>{isLoading ? 'Saving...' : 'Save Appearance'}</span>
          </button>
        </div>
      </form>
    </div>
  );
};

export default AppearanceTab;