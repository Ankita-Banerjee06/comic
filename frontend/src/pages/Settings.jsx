import { Bell, Moon, Sun, Shield, Globe } from 'lucide-react';

export default function Settings() {
  return (
    <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500 max-w-4xl mx-auto">
      <div>
        <h1 className="text-3xl font-bold text-white">Settings</h1>
        <p className="text-gray-400 mt-2">Customize your VLQ experience.</p>
      </div>

      <div className="bg-gray-900/50 border border-gray-800 rounded-3xl overflow-hidden divide-y divide-gray-800">
        
        <SettingSection title="Notifications" icon={<Bell className="w-5 h-5"/>}>
          <ToggleOption title="Email Notifications" desc="Receive weekly progress reports and tips" enabled={true} />
          <ToggleOption title="In-App Alerts" desc="Get notified when AI processing is complete" enabled={true} />
        </SettingSection>

        <SettingSection title="Language & Region" icon={<Globe className="w-5 h-5"/>}>
          <div className="flex items-center justify-between py-2">
            <div>
              <p className="text-white font-medium">App Language</p>
              <p className="text-sm text-gray-500">Select your preferred language</p>
            </div>
            <select className="bg-gray-950 border border-gray-800 text-white text-sm rounded-lg focus:ring-cyan-500 focus:border-cyan-500 block p-2.5">
              <option>English (US)</option>
              <option>Spanish</option>
              <option>French</option>
            </select>
          </div>
        </SettingSection>
        
        <SettingSection title="Privacy & Security" icon={<Shield className="w-5 h-5"/>}>
          <div className="py-2">
            <button className="text-red-400 hover:text-red-300 font-medium text-sm transition-colors">
              Delete Account Data
            </button>
            <p className="text-xs text-gray-500 mt-1">This will permanently delete your library and progress.</p>
          </div>
        </SettingSection>

      </div>
    </div>
  );
}

function SettingSection({ title, icon, children }) {
  return (
    <div className="p-6 md:p-8">
      <div className="flex items-center space-x-3 mb-6 text-cyan-400">
        {icon}
        <h2 className="text-lg font-bold text-white">{title}</h2>
      </div>
      <div className="space-y-4">
        {children}
      </div>
    </div>
  );
}

function ToggleOption({ title, desc, enabled }) {
  return (
    <div className="flex items-center justify-between py-2">
      <div>
        <p className="text-white font-medium">{title}</p>
        <p className="text-sm text-gray-500">{desc}</p>
      </div>
      <div className={`w-11 h-6 rounded-full relative cursor-pointer transition-colors ${enabled ? 'bg-cyan-500' : 'bg-gray-700'}`}>
        <div className={`w-4 h-4 bg-white rounded-full absolute top-1 transition-transform ${enabled ? 'translate-x-6' : 'translate-x-1'}`}></div>
      </div>
    </div>
  );
}
