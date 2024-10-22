// client/src/components/Layout.jsx
const Layout = () => {
    const [activeTab, setActiveTab] = React.useState('dashboard');
    const [user, setUser] = React.useState(null);
  
    const menuItems = [
      { id: 'dashboard', label: 'Dashboard', icon: '📊' },
      { id: 'orbat', label: 'ORBAT', icon: '👥' },
      { id: 'forms', label: 'Forms', icon: '📝' },
      { id: 'orders', label: 'Orders', icon: '📋' },
      { id: 'profile', label: 'Profile', icon: '👤' }
    ];
  
    const handleTabChange = (tabId) => {
      setActiveTab(tabId);
    };
  
    return (
      <div className="min-h-screen bg-gray-100">
        {/* Header */}
        <header className="bg-white shadow">
          <div className="max-w-7xl mx-auto px-4 py-6">
            <h1 className="text-3xl font-bold text-gray-900">USM Dashboard</h1>
          </div>
        </header>
  
        <div className="flex">
          {/* Sidebar */}
          <div className="w-64 min-h-screen bg-white shadow-lg">
            <nav className="mt-5">
              {menuItems.map((item) => (
                <button
                  key={item.id}
                  onClick={() => handleTabChange(item.id)}
                  className={`w-full text-left px-4 py-2 flex items-center space-x-2 ${
                    activeTab === item.id ? 'bg-blue-50 text-blue-600' : 'text-gray-600 hover:bg-gray-50'
                  }`}
                >
                  <span>{item.icon}</span>
                  <span>{item.label}</span>
                </button>
              ))}
            </nav>
          </div>
  
          {/* Main Content */}
          <div className="flex-1 p-8">
            <div className="max-w-7xl mx-auto">
              {activeTab === 'dashboard' && (
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                  <div className="bg-white p-6 rounded-lg shadow">
                    <h3 className="text-lg font-semibold">Unit Status</h3>
                    <p className="text-3xl font-bold mt-2">Active</p>
                  </div>
                  <div className="bg-white p-6 rounded-lg shadow">
                    <h3 className="text-lg font-semibold">Pending Forms</h3>
                    <p className="text-3xl font-bold mt-2">3</p>
                  </div>
                  <div className="bg-white p-6 rounded-lg shadow">
                    <h3 className="text-lg font-semibold">Active Orders</h3>
                    <p className="text-3xl font-bold mt-2">2</p>
                  </div>
                </div>
              )}
              {activeTab === 'orbat' && (
                <div className="bg-white p-6 rounded-lg shadow">
                  <h2 className="text-xl font-bold mb-4">ORBAT</h2>
                  <p>ORBAT content will go here</p>
                </div>
              )}
              {activeTab === 'forms' && (
                <div className="bg-white p-6 rounded-lg shadow">
                  <h2 className="text-xl font-bold mb-4">Forms</h2>
                  <p>Forms content will go here</p>
                </div>
              )}
              {activeTab === 'orders' && (
                <div className="bg-white p-6 rounded-lg shadow">
                  <h2 className="text-xl font-bold mb-4">Orders</h2>
                  <p>Orders content will go here</p>
                </div>
              )}
              {activeTab === 'profile' && (
                <div className="bg-white p-6 rounded-lg shadow">
                  <h2 className="text-xl font-bold mb-4">Profile</h2>
                  <p>Profile content will go here</p>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    );
  };