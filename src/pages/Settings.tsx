import React, { useState, useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import Layout from '../components/Layout/Layout';
import ProfileTab from '../components/Settings/ProfileTab';
import BudgetTab from '../components/Settings/BudgetTab';
import AppearanceTab from '../components/Settings/AppearanceTab';
import PasswordTab from '../components/Settings/PasswordTab';
import { 
  User, 
  DollarSign, 
  Palette, 
  Lock 
} from 'lucide-react';

const Settings: React.FC = () => {
  const [searchParams, setSearchParams] = useSearchParams();
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
      <div className="space-y-6 sm:space-y-8">
        {/* Header */}
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div className="space-y-1 flex-1 min-w-0">
            <h1 className="text-2xl md:text-3xl font-bold text-gray-900 dark:text-white">Settings</h1>
            <p className="text-sm text-gray-600 dark:text-gray-400">Manage your account settings and preferences</p>
          </div>
        </div>

        {/* Settings Card */}
        <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 overflow-hidden">
          {/* Tab Navigation */}
          <div className="border-b border-gray-200 dark:border-gray-700">
            <nav className="flex flex-wrap items-center gap-2 sm:gap-0 sm:space-x-1 px-4 sm:px-6 overflow-x-auto" aria-label="Tabs">
              {tabs.map((tab) => {
                const Icon = tab.icon;
                return (
                  <button
                    key={tab.id}
                    onClick={() => handleTabChange(tab.id)}
                    className={`flex items-center gap-2 py-4 px-3 sm:px-4 border-b-2 font-medium text-sm transition-colors whitespace-nowrap ${
                      activeTab === tab.id
                        ? 'border-blue-600 dark:border-blue-400 text-blue-600 dark:text-blue-400'
                        : 'border-transparent text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-300 hover:border-gray-300 dark:hover:border-gray-600'
                    }`}
                  >
                    <Icon className="w-5 h-5 flex-shrink-0" />
                    <span>{tab.label}</span>
                  </button>
                );
              })}
            </nav>
          </div>

          {/* Tab Content */}
          <div className="p-4 sm:p-6">
            <ActiveComponent />
          </div>
        </div>
      </div>
    </Layout>
  );
};

export default Settings;