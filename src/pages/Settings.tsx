import React, { useState, useEffect } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import Layout from '../components/Layout/Layout';
import ProfileTab from '../components/Settings/ProfileTab';
import BudgetTab from '../components/Settings/BudgetTab';
import AppearanceTab from '../components/Settings/AppearanceTab';
import PasswordTab from '../components/Settings/PasswordTab';
import { 
  ArrowLeft, 
  User, 
  DollarSign, 
  Palette, 
  Lock 
} from 'lucide-react';

const Settings: React.FC = () => {
  const [searchParams, setSearchParams] = useSearchParams();
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState('profile');

  const tabs = [
    {
      id: 'profile',
      label: 'My Profile',
      icon: User,
      component: ProfileTab,
    },
    {
      id: 'budget',
      label: 'Budget Settings',
      icon: DollarSign,
      component: BudgetTab,
    },
    {
      id: 'appearance',
      label: 'Appearance',
      icon: Palette,
      component: AppearanceTab,
    },
    {
      id: 'password',
      label: 'Change Password',
      icon: Lock,
      component: PasswordTab,
    },
  ];

  useEffect(() => {
    const tabParam = searchParams.get('tab');
    if (tabParam && tabs.find(tab => tab.id === tabParam)) {
      setActiveTab(tabParam);
    } else {
      setActiveTab('profile');
    }
  }, [searchParams]);

  const handleTabChange = (tabId: string) => {
    setActiveTab(tabId);
    setSearchParams({ tab: tabId });
  };

  const activeTabData = tabs.find(tab => tab.id === activeTab);
  const ActiveComponent = activeTabData?.component || ProfileTab;

  return (
    <Layout>
      <div className="p-6">
        <div className="max-w-6xl mx-auto">
          {/* Header */}
          <div className="mb-6">
            <button
              onClick={() => navigate('/dashboard')}
              className="flex items-center text-sm text-gray-600 hover:text-gray-900 transition-colors mb-4"
            >
              <ArrowLeft className="h-4 w-4 mr-1" />
              Back to Dashboard
            </button>
            
            <div>
              <h1 className="text-2xl font-bold text-gray-900">Settings</h1>
              <p className="text-gray-600 mt-1">Manage your account settings and preferences</p>
            </div>
          </div>

          <div className="bg-white shadow-lg rounded-xl overflow-hidden">
            {/* Tab Navigation */}
            <div className="border-b border-gray-200">
              <nav className="flex space-x-8 px-6" aria-label="Tabs">
                {tabs.map((tab) => {
                  const Icon = tab.icon;
                  return (
                    <button
                      key={tab.id}
                      onClick={() => handleTabChange(tab.id)}
                      className={`flex items-center space-x-2 py-4 px-1 border-b-2 font-medium text-sm transition-colors ${
                        activeTab === tab.id
                          ? 'border-blue-500 text-blue-600'
                          : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                      }`}
                    >
                      <Icon className="w-5 h-5" />
                      <span>{tab.label}</span>
                    </button>
                  );
                })}
              </nav>
            </div>

            {/* Tab Content */}
            <div className="p-6">
              <ActiveComponent />
            </div>
          </div>
        </div>
      </div>
    </Layout>
  );
};

export default Settings;