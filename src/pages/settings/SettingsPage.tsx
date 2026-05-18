import React, { useState, useEffect, useRef } from 'react';
import {
  User, Lock, Bell, Globe, Palette, CreditCard, Save, Camera, Eye, EyeOff, Check
} from 'lucide-react';
import { Card, CardHeader, CardBody } from '../../components/ui/Card';
import { Input } from '../../components/ui/Input';
import { Button } from '../../components/ui/Button';
import { Badge } from '../../components/ui/Badge';
import { Avatar } from '../../components/ui/Avatar';
import { useAuth } from '../../context/AuthContext';
import api from '../../lib/api';

type SettingsTab = 'profile' | 'security' | 'notifications' | 'entrepreneur' | 'investor' | 'Billing' ;

export const SettingsPage: React.FC = () => {
  const { user, setUser } = useAuth();
  const fileInputRef = useRef<HTMLInputElement>(null);

  const [activeTab, setActiveTab] = useState<SettingsTab>('profile');
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState('');
  const [error, setError] = useState('');

  // ✅ Profile fields
  const [name, setName] = useState('');
  const [bio, setBio] = useState('');
  const [location, setLocation] = useState('');
  const [phone, setPhone] = useState('');
  const [website, setWebsite] = useState('');
  const [linkedin, setLinkedin] = useState('');
  const [twitter, setTwitter] = useState('');

  // ✅ Entrepreneur fields
  const [startupName, setStartupName] = useState('');
  const [startupStage, setStartupStage] = useState('');
  const [industry, setIndustry] = useState('');
  const [fundingNeeded, setFundingNeeded] = useState(0);
  const [fundingStage, setFundingStage] = useState('');
  const [pitchSummary, setPitchSummary] = useState('');
  const [foundedYear, setFoundedYear] = useState<number | ''>('');
  const [teamSize, setTeamSize] = useState(1);

  // ✅ Investor fields
  const [investmentFocus, setInvestmentFocus] = useState('');
  const [investmentStage, setInvestmentStage] = useState<string[]>([]);
  const [investmentInterests, setInvestmentInterests] = useState('');
  const [minInvestment, setMinInvestment] = useState(0);
  const [maxInvestment, setMaxInvestment] = useState(0);
  const [portfolioSize, setPortfolioSize] = useState(0);

  // ✅ Password fields
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);

  // ✅ Notification preferences
  const [emailNotifs, setEmailNotifs] = useState(true);
  const [messageNotifs, setMessageNotifs] = useState(true);
  const [collaborationNotifs, setCollaborationNotifs] = useState(true);
  const [investmentNotifs, setInvestmentNotifs] = useState(true);

  // ✅ Load user data into form
  useEffect(() => {
    if (!user) return;

    // Profile
    setName(user.name || '');
    setBio(user.bio || '');
    setLocation(user.location || '');
    setPhone(user.phone || '');
    setWebsite(user.website || '');
    setLinkedin(user.socialLinks?.linkedin || '');
    setTwitter(user.socialLinks?.twitter || '');

    // Entrepreneur
    setStartupName(user.startupName || '');
    setStartupStage(user.startupStage || '');
    setIndustry(user.industry || '');
    setFundingNeeded(user.fundingNeeded || 0);
    setFundingStage(user.fundingStage || '');
    setPitchSummary(user.pitchSummary || '');
    setFoundedYear(user.foundedYear || '');
    setTeamSize(user.teamSize || 1);

    // Investor
    setInvestmentFocus(user.investmentFocus?.join(', ') || '');
    setInvestmentStage(user.investmentStage || []);
    setInvestmentInterests(user.investmentInterests?.join(', ') || '');
    setMinInvestment(user.minInvestment || 0);
    setMaxInvestment(user.maxInvestment || 0);
    setPortfolioSize(user.portfolioSize || 0);

    // Notifications
    setEmailNotifs(user.notificationPreferences?.emailNotifications ?? true);
    setMessageNotifs(user.notificationPreferences?.messageNotifications ?? true);
    setCollaborationNotifs(user.notificationPreferences?.collaborationNotifications ?? true);
    setInvestmentNotifs(user.notificationPreferences?.investmentNotifications ?? true);
  }, [user]);

  // ✅ Show success message temporarily
  const showSuccess = (msg: string) => {
    setSuccess(msg);
    setError('');
    setTimeout(() => setSuccess(''), 3000);
  };

  const showError = (msg: string) => {
    setError(msg);
    setSuccess('');
    setTimeout(() => setError(''), 5000);
  };

  // ✅ Save profile
  const handleSaveProfile = async () => {
    if (!user?._id) return;

    try {
      setLoading(true);

      const updateData: any = {
        name,
        bio,
        location,
        phone,
        website,
        socialLinks: { linkedin, twitter },
      };

      const response = await api.put(`/users/${user._id}`, updateData);

      if (response.data.user && setUser) {
        setUser(response.data.user);
      }

      showSuccess('Profile updated successfully!');
    } catch (err: any) {
      showError(err.response?.data?.message || 'Failed to update profile');
    } finally {
      setLoading(false);
    }
  };

  // ✅ Save entrepreneur details
  const handleSaveEntrepreneur = async () => {
    if (!user?._id) return;

    try {
      setLoading(true);

      const updateData = {
        startupName,
        startupStage,
        industry,
        fundingNeeded: Number(fundingNeeded),
        fundingStage,
        pitchSummary,
        foundedYear: foundedYear ? Number(foundedYear) : null,
        teamSize: Number(teamSize),
      };

      const response = await api.put(`/users/${user._id}`, updateData);

      if (response.data.user && setUser) {
        setUser(response.data.user);
      }

      showSuccess('Startup details updated!');
    } catch (err: any) {
      showError(err.response?.data?.message || 'Failed to update');
    } finally {
      setLoading(false);
    }
  };

  // ✅ Save investor details
  const handleSaveInvestor = async () => {
    if (!user?._id) return;

    try {
      setLoading(true);

      const updateData = {
        investmentFocus: investmentFocus.split(',').map((s) => s.trim()).filter(Boolean),
        investmentStage,
        investmentInterests: investmentInterests.split(',').map((s) => s.trim()).filter(Boolean),
        minInvestment: Number(minInvestment),
        maxInvestment: Number(maxInvestment),
        portfolioSize: Number(portfolioSize),
      };

      const response = await api.put(`/users/${user._id}`, updateData);

      if (response.data.user && setUser) {
        setUser(response.data.user);
      }

      showSuccess('Investment details updated!');
    } catch (err: any) {
      showError(err.response?.data?.message || 'Failed to update');
    } finally {
      setLoading(false);
    }
  };

  // ✅ Change password
  const handleChangePassword = async () => {
    if (newPassword !== confirmPassword) {
      showError('Passwords do not match');
      return;
    }
    if (newPassword.length < 6) {
      showError('Password must be at least 6 characters');
      return;
    }

    try {
      setLoading(true);

      await api.put('/auth/change-password', {
        currentPassword,
        newPassword,
      });

      setCurrentPassword('');
      setNewPassword('');
      setConfirmPassword('');

      showSuccess('Password changed successfully!');
    } catch (err: any) {
      showError(err.response?.data?.message || 'Failed to change password');
    } finally {
      setLoading(false);
    }
  };

  // ✅ Save notification preferences
  const handleSaveNotifications = async () => {
    if (!user?._id) return;

    try {
      setLoading(true);

      await api.put(`/users/${user._id}`, {
        notificationPreferences: {
          emailNotifications: emailNotifs,
          messageNotifications: messageNotifs,
          collaborationNotifications: collaborationNotifs,
          investmentNotifications: investmentNotifs,
        },
      });

      showSuccess('Notification preferences saved!');
    } catch (err: any) {
      showError(err.response?.data?.message || 'Failed to save');
    } finally {
      setLoading(false);
    }
  };

  // ✅ Upload profile picture
  const handleAvatarUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file || !user?._id) return;

    try {
      setLoading(true);

      const formData = new FormData();
      formData.append('file', file);

      const response = await api.post('/docs/upload-document', formData, {
        headers: { 'Content-Type': 'multipart/form-data' },
      });

      const fileUrl = response.data.document?.fileUrl || response.data.fileUrl;

      if (fileUrl) {
        await api.put(`/users/${user._id}`, {
          profilePic: fileUrl,
          avatarUrl: fileUrl,
        });

        if (setUser) {
          setUser({ ...user, profilePic: fileUrl, avatarUrl: fileUrl });
        }
      }

      showSuccess('Profile photo updated!');
    } catch (err: any) {
      showError('Failed to upload photo');
    } finally {
      setLoading(false);
    }
  };

  if (!user) return null;

  // ✅ Navigation tabs based on role
  const tabs: { id: SettingsTab; label: string; icon: React.ReactNode }[] = [
    { id: 'profile', label: 'Profile', icon: <User size={18} /> },
    ...(user.role === 'entrepreneur'
      ? [{ id: 'entrepreneur' as SettingsTab, label: 'Startup Details', icon: <Globe size={18} /> }]
      : [{ id: 'investor' as SettingsTab, label: 'Investment Details', icon: <CreditCard size={18} /> }]),
    { id: 'security', label: 'Security', icon: <Lock size={18} /> },
    { id: 'notifications', label: 'Notifications', icon: <Bell size={18} /> },
    
  ];

  return (
    <div className="space-y-6 animate-fade-in">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Settings</h1>
        <p className="text-gray-600">Manage your account preferences</p>
      </div>

      {/* ✅ Success/Error messages */}
      {success && (
        <div className="p-3 bg-green-50 text-green-700 rounded-lg flex items-center gap-2">
          <Check size={18} />
          {success}
        </div>
      )}
      {error && (
        <div className="p-3 bg-red-50 text-red-700 rounded-lg">
          {error}
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
        {/* Navigation */}
        <Card className="lg:col-span-1">
          <CardBody className="p-2">
            <nav className="space-y-1">
              {tabs.map((tab) => (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={`flex items-center w-full px-3 py-2 text-sm font-medium rounded-md ${
                    activeTab === tab.id
                      ? 'text-primary-700 bg-primary-50'
                      : 'text-gray-700 hover:bg-gray-50'
                  }`}
                >
                  <span className="mr-3">{tab.icon}</span>
                  {tab.label}
                </button>
              ))}
            </nav>
          </CardBody>
        </Card>

        {/* Content */}
        <div className="lg:col-span-3 space-y-6">

          {/* ========== PROFILE TAB ========== */}
          {activeTab === 'profile' && (
            <Card>
              <CardHeader>
                <h2 className="text-lg font-medium text-gray-900">Profile Settings</h2>
              </CardHeader>
              <CardBody className="space-y-6">
                {/* Avatar */}
                <div className="flex items-center gap-6">
                  <div className="relative">
                    <Avatar
                      src={user.avatarUrl || user.profilePic || ''}
                      alt={user.name}
                      size="xl"
                    />
                    <button
                      onClick={() => fileInputRef.current?.click()}
                      className="absolute bottom-0 right-0 p-1.5 bg-primary-600 text-white rounded-full hover:bg-primary-700"
                    >
                      <Camera size={14} />
                    </button>
                    <input
                      type="file"
                      ref={fileInputRef}
                      onChange={handleAvatarUpload}
                      className="hidden"
                      accept="image/*"
                    />
                  </div>
                  <div>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => fileInputRef.current?.click()}
                    >
                      Change Photo
                    </Button>
                    <p className="mt-2 text-sm text-gray-500">JPG, PNG. Max 2MB</p>
                  </div>
                </div>

                {/* Form fields */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <Input
                    label="Full Name"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                  />
                  <Input
                    label="Email"
                    type="email"
                    value={user.email}
                    disabled
                  />
                  <Input
                    label="Role"
                    value={user.role}
                    disabled
                  />
                  <Input
                    label="Location"
                    value={location}
                    onChange={(e) => setLocation(e.target.value)}
                    placeholder="e.g., San Francisco, CA"
                  />
                  <Input
                    label="Phone"
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                    placeholder="+1 (555) 000-0000"
                  />
                  <Input
                    label="Website"
                    value={website}
                    onChange={(e) => setWebsite(e.target.value)}
                    placeholder="https://example.com"
                  />
                  <Input
                    label="LinkedIn"
                    value={linkedin}
                    onChange={(e) => setLinkedin(e.target.value)}
                    placeholder="https://linkedin.com/in/username"
                  />
                  <Input
                    label="Twitter"
                    value={twitter}
                    onChange={(e) => setTwitter(e.target.value)}
                    placeholder="@username"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Bio</label>
                  <textarea
                    className="w-full rounded-md border border-gray-300 shadow-sm focus:border-primary-500 focus:ring-primary-500 p-3"
                    rows={4}
                    value={bio}
                    onChange={(e) => setBio(e.target.value)}
                    placeholder="Tell us about yourself..."
                  />
                </div>

                <div className="flex justify-end gap-3">
                  <Button variant="outline" onClick={() => window.location.reload()}>
                    Cancel
                  </Button>
                  <Button
                    leftIcon={<Save size={18} />}
                    onClick={handleSaveProfile}
                    disabled={loading}
                  >
                    {loading ? 'Saving...' : 'Save Changes'}
                  </Button>
                </div>
              </CardBody>
            </Card>
          )}

          {/* ========== ENTREPRENEUR TAB ========== */}
          {activeTab === 'entrepreneur' && user.role === 'entrepreneur' && (
            <Card>
              <CardHeader>
                <h2 className="text-lg font-medium text-gray-900">Startup Details</h2>
              </CardHeader>
              <CardBody className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <Input
                    label="Startup Name"
                    value={startupName}
                    onChange={(e) => setStartupName(e.target.value)}
                    placeholder="Your startup name"
                  />
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Startup Stage
                    </label>
                    <select
                      className="w-full rounded-md border border-gray-300 shadow-sm p-2"
                      value={startupStage}
                      onChange={(e) => setStartupStage(e.target.value)}
                    >
                      <option value="">Select stage</option>
                      <option value="idea">Idea</option>
                      <option value="mvp">MVP</option>
                      <option value="early">Early Stage</option>
                      <option value="growth">Growth</option>
                      <option value="scaling">Scaling</option>
                    </select>
                  </div>
                  <Input
                    label="Industry"
                    value={industry}
                    onChange={(e) => setIndustry(e.target.value)}
                    placeholder="e.g., FinTech, HealthTech"
                  />
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Funding Stage
                    </label>
                    <select
                      className="w-full rounded-md border border-gray-300 shadow-sm p-2"
                      value={fundingStage}
                      onChange={(e) => setFundingStage(e.target.value)}
                    >
                      <option value="">Select funding stage</option>
                      <option value="pre-seed">Pre-Seed</option>
                      <option value="seed">Seed</option>
                      <option value="series-a">Series A</option>
                      <option value="series-b">Series B</option>
                      <option value="series-c">Series C</option>
                    </select>
                  </div>
                  <Input
                    label="Funding Needed ($)"
                    type="number"
                    value={fundingNeeded}
                    onChange={(e) => setFundingNeeded(Number(e.target.value))}
                    placeholder="500000"
                  />
                  <Input
                    label="Founded Year"
                    type="number"
                    value={foundedYear}
                    onChange={(e) => setFoundedYear(e.target.value ? Number(e.target.value) : '')}
                    placeholder="2024"
                  />
                  <Input
                    label="Team Size"
                    type="number"
                    value={teamSize}
                    onChange={(e) => setTeamSize(Number(e.target.value))}
                    placeholder="5"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Pitch Summary
                  </label>
                  <textarea
                    className="w-full rounded-md border border-gray-300 shadow-sm p-3"
                    rows={4}
                    value={pitchSummary}
                    onChange={(e) => setPitchSummary(e.target.value)}
                    placeholder="Describe your startup in a few sentences..."
                  />
                </div>

                <div className="flex justify-end">
                  <Button
                    leftIcon={<Save size={18} />}
                    onClick={handleSaveEntrepreneur}
                    disabled={loading}
                  >
                    {loading ? 'Saving...' : 'Save Startup Details'}
                  </Button>
                </div>
              </CardBody>
            </Card>
          )}

          {/* ========== INVESTOR TAB ========== */}
          {activeTab === 'investor' && user.role === 'investor' && (
            <Card>
              <CardHeader>
                <h2 className="text-lg font-medium text-gray-900">Investment Details</h2>
              </CardHeader>
              <CardBody className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <Input
                    label="Investment Focus (comma separated)"
                    value={investmentFocus}
                    onChange={(e) => setInvestmentFocus(e.target.value)}
                    placeholder="FinTech, AI, Healthcare"
                  />
                  <Input
                    label="Investment Interests (comma separated)"
                    value={investmentInterests}
                    onChange={(e) => setInvestmentInterests(e.target.value)}
                    placeholder="SaaS, B2B, Mobile"
                  />
                  <Input
                    label="Min Investment ($)"
                    type="number"
                    value={minInvestment}
                    onChange={(e) => setMinInvestment(Number(e.target.value))}
                  />
                  <Input
                    label="Max Investment ($)"
                    type="number"
                    value={maxInvestment}
                    onChange={(e) => setMaxInvestment(Number(e.target.value))}
                  />
                  <Input
                    label="Portfolio Size"
                    type="number"
                    value={portfolioSize}
                    onChange={(e) => setPortfolioSize(Number(e.target.value))}
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Investment Stages
                  </label>
                  <div className="flex flex-wrap gap-2">
                    {['pre-seed', 'seed', 'series-a', 'series-b', 'series-c'].map((stage) => (
                      <button
                        key={stage}
                        onClick={() => {
                          setInvestmentStage((prev) =>
                            prev.includes(stage)
                              ? prev.filter((s) => s !== stage)
                              : [...prev, stage]
                          );
                        }}
                        className={`px-3 py-1.5 text-sm rounded-full border capitalize ${
                          investmentStage.includes(stage)
                            ? 'bg-primary-600 text-white border-primary-600'
                            : 'bg-white text-gray-700 border-gray-300 hover:bg-gray-50'
                        }`}
                      >
                        {stage}
                      </button>
                    ))}
                  </div>
                </div>

                <div className="flex justify-end">
                  <Button
                    leftIcon={<Save size={18} />}
                    onClick={handleSaveInvestor}
                    disabled={loading}
                  >
                    {loading ? 'Saving...' : 'Save Investment Details'}
                  </Button>
                </div>
              </CardBody>
            </Card>
          )}

          {/* ========== SECURITY TAB ========== */}
          {activeTab === 'security' && (
            <Card>
              <CardHeader>
                <h2 className="text-lg font-medium text-gray-900">Security Settings</h2>
              </CardHeader>
              <CardBody className="space-y-6">
                <div>
                  <h3 className="text-sm font-medium text-gray-900 mb-4">
                    Two-Factor Authentication
                  </h3>
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm text-gray-600">
                        Add extra security to your account
                      </p>
                      <Badge
                        variant={user.twoFactorEnabled ? 'success' : 'error'}
                        className="mt-1"
                      >
                        {user.twoFactorEnabled ? 'Enabled' : 'Not Enabled'}
                      </Badge>
                    </div>
                    <Button variant="outline">
                      {user.twoFactorEnabled ? 'Disable' : 'Enable'}
                    </Button>
                  </div>
                </div>

                <div className="pt-6 border-t border-gray-200">
                  <h3 className="text-sm font-medium text-gray-900 mb-4">Change Password</h3>
                  <div className="space-y-4 max-w-md">
                    <div className="relative">
                      <Input
                        label="Current Password"
                        type={showPassword ? 'text' : 'password'}
                        value={currentPassword}
                        onChange={(e) => setCurrentPassword(e.target.value)}
                      />
                    </div>

                    <Input
                      label="New Password"
                      type={showPassword ? 'text' : 'password'}
                      value={newPassword}
                      onChange={(e) => setNewPassword(e.target.value)}
                    />

                    <Input
                      label="Confirm New Password"
                      type={showPassword ? 'text' : 'password'}
                      value={confirmPassword}
                      onChange={(e) => setConfirmPassword(e.target.value)}
                    />

                    <div className="flex items-center gap-2">
                      <button
                        onClick={() => setShowPassword(!showPassword)}
                        className="text-sm text-gray-600 flex items-center gap-1"
                      >
                        {showPassword ? <EyeOff size={14} /> : <Eye size={14} />}
                        {showPassword ? 'Hide' : 'Show'} passwords
                      </button>
                    </div>

                    <div className="flex justify-end">
                      <Button
                        onClick={handleChangePassword}
                        disabled={loading || !currentPassword || !newPassword}
                      >
                        {loading ? 'Updating...' : 'Update Password'}
                      </Button>
                    </div>
                  </div>
                </div>
              </CardBody>
            </Card>
          )}

          {/* ========== NOTIFICATIONS TAB ========== */}
          {activeTab === 'notifications' && (
            <Card>
              <CardHeader>
                <h2 className="text-lg font-medium text-gray-900">Notification Preferences</h2>
              </CardHeader>
              <CardBody className="space-y-4">
                {[
                  {
                    label: 'Email Notifications',
                    desc: 'Receive email notifications',
                    value: emailNotifs,
                    setter: setEmailNotifs,
                  },
                  {
                    label: 'Message Notifications',
                    desc: 'Get notified when you receive messages',
                    value: messageNotifs,
                    setter: setMessageNotifs,
                  },
                  {
                    label: 'Collaboration Notifications',
                    desc: 'Get notified about collaboration requests',
                    value: collaborationNotifs,
                    setter: setCollaborationNotifs,
                  },
                  {
                    label: 'Investment Notifications',
                    desc: 'Get notified about investment activities',
                    value: investmentNotifs,
                    setter: setInvestmentNotifs,
                  },
                ].map((pref) => (
                  <div
                    key={pref.label}
                    className="flex items-center justify-between p-4 bg-gray-50 rounded-lg"
                  >
                    <div>
                      <h3 className="text-sm font-medium text-gray-900">{pref.label}</h3>
                      <p className="text-sm text-gray-500">{pref.desc}</p>
                    </div>
                    <label className="relative inline-flex items-center cursor-pointer">
                      <input
                        type="checkbox"
                        checked={pref.value}
                        onChange={(e) => pref.setter(e.target.checked)}
                        className="sr-only peer"
                      />
                      <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-primary-600"></div>
                    </label>
                  </div>
                ))}

                <div className="flex justify-end pt-4">
                  <Button
                    leftIcon={<Save size={18} />}
                    onClick={handleSaveNotifications}
                    disabled={loading}
                  >
                    {loading ? 'Saving...' : 'Save Preferences'}
                  </Button>
                </div>
              </CardBody>
            </Card>
          )}
        </div>
      </div>
    </div>
  );
};