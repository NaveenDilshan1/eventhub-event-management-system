import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import API from "@/services/api";
import { useCurrency } from "@/context/CurrencyContext";
import { DashboardLayout } from "@/components/layout/DashboardLayout";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Select, SelectTrigger, SelectValue, SelectContent, SelectItem } from "@/components/ui/select";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { toast } from "sonner";
import { ImagePlus, Upload, Globe } from "lucide-react";

interface SettingsData {
  timezone: string;
  language: string;
  currency: string;

  emailNotifications: boolean;
  pushNotifications: boolean;
  smsNotifications: boolean;

  maintenanceMode: boolean;
  twoFactorAuth: boolean;
  sessionTimeout: string;
  passwordExpiry: string;
  ipWhitelist: string;

  apiKey: string;
  webhookUrl: string;

  smtpHost: string;
  smtpPort: string;
  smtpUser: string;
  smtpPassword: string;
  senderName: string;
  senderEmail: string;
  websiteName: string;
  websiteLogo: string;
}

const SettingsPage = () => {
  const { refreshCurrency, getFullImageUrl } = useCurrency();
  const [settings, setSettings] = useState<SettingsData>({
    timezone: "Asia/Colombo",
    language: "en",
    currency: "LKR",
    emailNotifications: true,
    pushNotifications: true,
    smsNotifications: false,
    maintenanceMode: false,
    twoFactorAuth: false,
    sessionTimeout: "30",
    passwordExpiry: "90",
    ipWhitelist: "",
    apiKey: "sk_live_xxxxx",
    webhookUrl: "",
    smtpHost: "",
    smtpPort: "587",
    smtpUser: "",
    smtpPassword: "",
    senderName: "Event Hub",
    senderEmail: "",
    websiteName: "Event Hub Pro",
    websiteLogo: "/logo.png",
  });

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [showApiKey, setShowApiKey] = useState(false);

  // Fetch settings from backend
  useEffect(() => {
    API.get("/settings")
      .then(res => setSettings(res.data))
      .catch(err => {
        console.error(err);
        toast.error("Failed to load settings");
      })
      .finally(() => setLoading(false));
  }, []);

  // Save settings to backend
  const handleSave = async () => {
    try {
      setSaving(true);
      console.log("Saving settings...", settings);
      const res = await API.put("/settings", settings);
      console.log("Settings saved response:", res.data);
      // Refresh global currency across the entire app
      await refreshCurrency();
      toast.success("Settings saved successfully! Currency updated globally.");
    } catch (err: any) {
      console.error("Settings save error:", err);
      toast.error(err?.response?.data?.message || "Failed to save settings");
    } finally {
      setSaving(false);
    }
  };

  // Regenerate API Key
  const handleRegenerateApiKey = () => {
    setSettings(prev => ({
      ...prev,
      apiKey: "sk_live_" + Math.random().toString(36).substring(2, 35),
    }));
    toast.success("API key regenerated successfully!");
  };

  const handleLogoUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const formData = new FormData();
    formData.append("logo", file);

    try {
      toast.info("Uploading logo...");
      const res = await API.post("/settings/upload-logo", formData, {
        headers: { "Content-Type": "multipart/form-data" },
      });
      setSettings(prev => ({ ...prev, websiteLogo: res.data.url }));
      toast.success("Logo uploaded successfully!");
    } catch (err) {
      toast.error("Logo upload failed");
    }
  };

  if (loading) return <p>Loading...</p>;

  return (
    <DashboardLayout>
      <div className="space-y-6">
        <h1 className="text-3xl font-bold">Settings</h1>

        <Tabs defaultValue="general" className="space-y-6">
          <TabsList className="grid w-full grid-cols-5 lg:w-auto lg:inline-grid">
            <TabsTrigger value="general">General</TabsTrigger>
            <TabsTrigger value="notifications">Notifications</TabsTrigger>
            <TabsTrigger value="security">Security</TabsTrigger>
            <TabsTrigger value="api">API</TabsTrigger>
            <TabsTrigger value="email">Email</TabsTrigger>
          </TabsList>

          {/* General */}
          <TabsContent value="general">
            <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
              <Card>
                <CardHeader>
                  <CardTitle>General Settings</CardTitle>
                  <CardDescription>Timezone, Language, Currency</CardDescription>
                </CardHeader>
                <CardContent className="grid grid-cols-1 md:grid-cols-3 gap-6">
                  <div>
                    <Label>Timezone</Label>
                    <Select value={settings.timezone} onValueChange={v => setSettings({ ...settings, timezone: v })}>
                      <SelectTrigger><SelectValue /></SelectTrigger>
                      <SelectContent>
                        <SelectItem value="Asia/Colombo">Sri Lanka</SelectItem>
                        <SelectItem value="Asia/Kolkata">India</SelectItem>
                        <SelectItem value="America/New_York">New York</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  <div>
                    <Label>Language</Label>
                    <Select value={settings.language} onValueChange={v => setSettings({ ...settings, language: v })}>
                      <SelectTrigger><SelectValue /></SelectTrigger>
                      <SelectContent>
                        <SelectItem value="en">English</SelectItem>
                        <SelectItem value="ta">Tamil</SelectItem>
                        <SelectItem value="si">Sinhala</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  <div>
                    <Label>Currency</Label>
                    <Select value={settings.currency} onValueChange={v => setSettings({ ...settings, currency: v })}>
                      <SelectTrigger><SelectValue /></SelectTrigger>
                      <SelectContent>
                        <SelectItem value="LKR">LKR</SelectItem>
                        <SelectItem value="USD">USD</SelectItem>
                        <SelectItem value="EUR">EUR</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </CardContent>
              </Card>

              {/* Website Branding */}
              <Card className="mt-6">
                <CardHeader>
                  <CardTitle>Website Branding</CardTitle>
                  <CardDescription>Custom name and logo for your platform</CardDescription>
                </CardHeader>
                <CardContent className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-2">
                    <Label htmlFor="websiteName">Website Name</Label>
                    <Input
                      id="websiteName"
                      value={settings.websiteName}
                      onChange={e => setSettings({ ...settings, websiteName: e.target.value })}
                      placeholder="Enter Website Name"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="websiteLogo">Logo Selection</Label>
                    <div className="flex flex-col gap-4">
                      <div className="flex gap-2">
                        <Input
                          id="websiteLogo"
                          value={settings.websiteLogo}
                          onChange={e => setSettings({ ...settings, websiteLogo: e.target.value })}
                          placeholder="/logo.png or https://..."
                          className="flex-1 font-mono text-xs"
                        />
                        <div className="relative">
                          <input
                            type="file"
                            id="logo-upload"
                            className="hidden"
                            accept="image/*"
                            onChange={handleLogoUpload}
                          />
                          <Button
                            variant="outline"
                            className="gap-2 shrink-0 border-dashed border-primary/40 hover:border-primary"
                            onClick={() => document.getElementById('logo-upload')?.click()}
                          >
                            <ImagePlus className="w-4 h-4" /> Upload New
                          </Button>
                        </div>
                      </div>

                      <div className="flex items-center gap-4 p-4 bg-muted/30 rounded-2xl border border-dashed">
                        <div className="w-20 h-20 rounded-xl bg-background border flex items-center justify-center overflow-hidden shadow-inner">
                          {settings.websiteLogo ? (
                            <img
                              src={getFullImageUrl(settings.websiteLogo)}
                              alt="Preview"
                              className="w-full h-full object-contain p-2"
                            />
                          ) : (
                            <span className="text-[10px] text-muted-foreground text-center">No Logo Selected</span>
                          )}
                        </div>
                        <div className="flex-1">
                          <p className="text-sm font-semibold">Live Preview</p>
                          <p className="text-xs text-muted-foreground mt-1 line-clamp-1">
                            {settings.websiteLogo || "No logo file selected"}
                          </p>
                          <div className="mt-2 flex gap-2">
                            <Badge variant="secondary" className="text-[10px] font-medium">PNG/SVG/JPG</Badge>
                            <Badge variant="outline" className="text-[10px] font-medium">Transparent Preferred</Badge>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          </TabsContent>

          {/* Notifications */}
          <TabsContent value="notifications">
            <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
              <Card>
                <CardHeader>
                  <CardTitle>Notification Settings</CardTitle>
                  <CardDescription>Email, Push, SMS</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="flex justify-between items-center">
                    <Label>Email Notifications</Label>
                    <Switch checked={settings.emailNotifications} onCheckedChange={v => setSettings({ ...settings, emailNotifications: v })} />
                  </div>
                  <div className="flex justify-between items-center">
                    <Label>Push Notifications</Label>
                    <Switch checked={settings.pushNotifications} onCheckedChange={v => setSettings({ ...settings, pushNotifications: v })} />
                  </div>
                  <div className="flex justify-between items-center">
                    <Label>SMS Notifications</Label>
                    <Switch checked={settings.smsNotifications} onCheckedChange={v => setSettings({ ...settings, smsNotifications: v })} />
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          </TabsContent>

          {/* Security */}
          <TabsContent value="security">
            <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
              <Card>
                <CardHeader>
                  <CardTitle>Security Settings</CardTitle>
                  <CardDescription>Maintenance, 2FA, Session Timeout, Password, IP</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="flex justify-between items-center">
                    <Label>Maintenance Mode</Label>
                    <Switch checked={settings.maintenanceMode} onCheckedChange={v => setSettings({ ...settings, maintenanceMode: v })} />
                  </div>
                  <div className="flex justify-between items-center">
                    <Label>Two-Factor Authentication</Label>
                    <Switch checked={settings.twoFactorAuth} onCheckedChange={v => setSettings({ ...settings, twoFactorAuth: v })} />
                  </div>
                  <div>
                    <Label>Session Timeout (minutes)</Label>
                    <Select value={settings.sessionTimeout} onValueChange={v => setSettings({ ...settings, sessionTimeout: v })}>
                      <SelectTrigger><SelectValue /></SelectTrigger>
                      <SelectContent>
                        <SelectItem value="15">15</SelectItem>
                        <SelectItem value="30">30</SelectItem>
                        <SelectItem value="60">60</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div>
                    <Label>Password Expiry (days)</Label>
                    <Select value={settings.passwordExpiry} onValueChange={v => setSettings({ ...settings, passwordExpiry: v })}>
                      <SelectTrigger><SelectValue /></SelectTrigger>
                      <SelectContent>
                        <SelectItem value="30">30</SelectItem>
                        <SelectItem value="60">60</SelectItem>
                        <SelectItem value="90">90</SelectItem>
                        <SelectItem value="never">Never</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div>
                    <Label>IP Whitelist</Label>
                    <Input value={settings.ipWhitelist} onChange={e => setSettings({ ...settings, ipWhitelist: e.target.value })} placeholder="Comma-separated IPs" />
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          </TabsContent>

          {/* API */}
          <TabsContent value="api">
            <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
              <Card>
                <CardHeader>
                  <CardTitle>API Settings</CardTitle>
                  <CardDescription>API Key & Webhook URL</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="flex items-center gap-2">
                    <Input type={showApiKey ? "text" : "password"} value={settings.apiKey} readOnly className="flex-1 font-mono" />
                    <Button onClick={() => setShowApiKey(!showApiKey)}>{showApiKey ? "Hide" : "Show"}</Button>
                    <Button onClick={handleRegenerateApiKey}>Regenerate</Button>
                  </div>
                  <div>
                    <Label>Webhook URL</Label>
                    <Input value={settings.webhookUrl} onChange={e => setSettings({ ...settings, webhookUrl: e.target.value })} />
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          </TabsContent>

          {/* Email */}
          <TabsContent value="email">
            <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
              <Card>
                <CardHeader>
                  <CardTitle>Email Settings</CardTitle>
                  <CardDescription>SMTP & Sender Email</CardDescription>
                </CardHeader>
                <CardContent className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <Label>SMTP Host</Label>
                    <Input value={settings.smtpHost} onChange={e => setSettings({ ...settings, smtpHost: e.target.value })} />
                  </div>
                  <div>
                    <Label>SMTP Port</Label>
                    <Input value={settings.smtpPort} onChange={e => setSettings({ ...settings, smtpPort: e.target.value })} />
                  </div>
                  <div>
                    <Label>SMTP User</Label>
                    <Input value={settings.smtpUser} onChange={e => setSettings({ ...settings, smtpUser: e.target.value })} />
                  </div>
                  <div>
                    <Label>SMTP Password</Label>
                    <Input type="password" value={settings.smtpPassword} onChange={e => setSettings({ ...settings, smtpPassword: e.target.value })} />
                  </div>
                  <div>
                    <Label>Sender Name</Label>
                    <Input value={settings.senderName} onChange={e => setSettings({ ...settings, senderName: e.target.value })} />
                  </div>
                  <div>
                    <Label>Sender Email</Label>
                    <Input value={settings.senderEmail} onChange={e => setSettings({ ...settings, senderEmail: e.target.value })} />
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          </TabsContent>
        </Tabs>
      </div>

      {/* Sticky Save Bar */}
      <div className="sticky bottom-0 left-0 right-0 z-50 bg-background/80 backdrop-blur-md border-t py-4 px-6 -mx-6 mt-8">
        <div className="flex justify-end">
          <Button
            type="button"
            onClick={handleSave}
            disabled={saving}
            className="px-8 h-12 rounded-xl text-base font-semibold shadow-lg"
          >
            {saving ? "Saving..." : "💾 Save All Settings"}
          </Button>
        </div>
      </div>
    </DashboardLayout>
  );
};

export default SettingsPage;
