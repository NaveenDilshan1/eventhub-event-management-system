// src/pages/dashboards/user/ProfilePage.tsx
import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { DashboardLayout } from "@/components/layout/DashboardLayout";
import { User, Mail, Phone, MapPin, Camera, Save, Lock } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Separator } from "@/components/ui/separator";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Checkbox } from "@/components/ui/checkbox";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { toast } from "sonner";
import axios from "axios";
import { useRole } from "@/context/RoleContext";

interface UserProfile {
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
  address: string;
  avatarUrl?: string;
  memberSince: string;
  notifications: {
    email: boolean;
    push: boolean;
    sms: boolean;
    marketing: boolean;
  };
}

const ProfilePage = () => {
  const { userId, setUserName, setUserEmail, setUserAvatar } = useRole();
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [loading, setLoading] = useState(true);
  const [selectedAvatar, setSelectedAvatar] = useState<File | null>(null);

  // Password Change State
  const [passwordData, setPasswordData] = useState({
    currentPassword: "",
    newPassword: "",
    confirmPassword: "",
  });
  const [isPasswordModalOpen, setIsPasswordModalOpen] = useState(false);
  const [passwordLoading, setPasswordLoading] = useState(false);

  useEffect(() => {
    if (!userId) {
      setLoading(false);
      return;
    }

    const fetchProfile = async () => {
      try {
        const token = localStorage.getItem("token");
        const res = await axios.get(`http://localhost:5000/api/masterusers/${userId}`, {
          headers: { Authorization: `Bearer ${token}` },
        });

        if (!res.data) {
          toast.error("User profile not found.");
          setProfile(null);
          return;
        }

        setProfile({
          firstName: res.data.firstName || "",
          lastName: res.data.lastName || "",
          email: res.data.email || "",
          phone: res.data.phone || "",
          address: res.data.address || "",
          avatarUrl: res.data.avatarUrl ? `http://localhost:5000${res.data.avatarUrl}` : "",
          memberSince: res.data.createdAt
            ? new Date(res.data.createdAt).toLocaleDateString("en-US", { month: "short", year: "numeric" })
            : "",
          notifications: res.data.notifications || { email: true, push: true, sms: false, marketing: false },
        });
      } catch (err) {
        console.error("Failed to fetch user profile", err);
        toast.error("Failed to load profile data");
        setProfile(null);
      } finally {
        setLoading(false);
      }
    };

    fetchProfile();
  }, [userId]);

  const handlePasswordChange = async () => {
    if (passwordData.newPassword !== passwordData.confirmPassword) {
      toast.error("New passwords do not match!");
      return;
    }

    if (!passwordData.currentPassword || !passwordData.newPassword) {
      toast.error("Please fill in all security fields.");
      return;
    }

    try {
      setPasswordLoading(true);
      const token = localStorage.getItem("token");
      await axios.put(`http://localhost:5000/api/masterusers/${userId}/password`, {
        currentPassword: passwordData.currentPassword,
        newPassword: passwordData.newPassword,
      }, {
        headers: { Authorization: `Bearer ${token}` }
      });

      toast.success("Password updated successfully!");
      setIsPasswordModalOpen(false);
      setPasswordData({ currentPassword: "", newPassword: "", confirmPassword: "" });
    } catch (err: any) {
      console.error("Password update error", err);
      toast.error(err.response?.data?.message || "Failed to update password");
    } finally {
      setPasswordLoading(false);
    }
  };

  const handleAvatarChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setSelectedAvatar(file);
      const reader = new FileReader();
      reader.onloadend = () => {
        setProfile(profile => profile ? { ...profile, avatarUrl: reader.result as string } : null);
      };
      reader.readAsDataURL(file);
      toast.success("Avatar selected! Click Save to update.");
    }
  };

  const handleSave = async () => {
    if (!profile || !userId) {
      console.warn("Missing profile or userId:", { profile, userId });
      return;
    }

    try {
      console.log("Saving profile for userId:", userId);
      const token = localStorage.getItem("token");
      const formData = new FormData();
      formData.append("firstName", profile.firstName);
      formData.append("lastName", profile.lastName);
      formData.append("email", profile.email);
      formData.append("phone", profile.phone);
      formData.append("address", profile.address);
      formData.append("notifications", JSON.stringify(profile.notifications));
      if (selectedAvatar) {
        console.log("Appending avatar file:", selectedAvatar.name);
        formData.append("avatar", selectedAvatar);
      }

      console.log("Sending PUT request to:", `http://localhost:5000/api/masterusers/${userId}`);

      const res = await axios.put(`http://localhost:5000/api/masterusers/${userId}`, formData, {
        headers: { Authorization: `Bearer ${token}`, "Content-Type": "multipart/form-data" },
      });

      if (res.data) {
        const avatarFullUrl = res.data.avatarUrl ? `http://localhost:5000${res.data.avatarUrl}` : "";
        const updatedProfile = {
          ...profile,
          firstName: res.data.firstName,
          lastName: res.data.lastName,
          email: res.data.email,
          phone: res.data.phone || "",
          address: res.data.address || "",
          avatarUrl: avatarFullUrl,
          notifications: res.data.notifications,
        };
        setProfile(updatedProfile);

        // Update Global Context & LocalStorage
        const fullName = `${res.data.firstName} ${res.data.lastName}`;
        setUserName(fullName);
        setUserEmail(res.data.email);
        setUserAvatar(avatarFullUrl);

        localStorage.setItem("userName", fullName);
        localStorage.setItem("userEmail", res.data.email);
        localStorage.setItem("userAvatar", avatarFullUrl);
      }

      toast.success("Profile updated successfully! ✨");
      setSelectedAvatar(null);
    } catch (err) {
      console.error("Save error", err);
      toast.error("Failed to save profile");
    }
  };

  if (loading) return <DashboardLayout><div className="p-6 text-center">Loading profile...</div></DashboardLayout>;
  if (!profile) return <DashboardLayout><div className="p-6 text-center text-red-500">Profile not found.</div></DashboardLayout>;

  return (
    <DashboardLayout>
      <div className="space-y-6">
        {/* Header */}
        <motion.div initial={{ opacity: 0, y: -20 }} animate={{ opacity: 1, y: 0 }}>
          <h1 className="text-3xl font-bold text-foreground">Profile Settings</h1>
          <p className="text-muted-foreground mt-1">Manage your account settings and preferences.</p>
        </motion.div>

        {/* Profile Info */}
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }}>
          <Card>
            <CardHeader>
              <CardTitle>Personal Information</CardTitle>
              <CardDescription>Update your personal details here.</CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="flex items-center gap-6">
                <div className="relative">
                  <Avatar className="h-24 w-24 border-2 border-primary/20 shadow-inner">
                    {profile.avatarUrl ? (
                      <AvatarImage src={profile.avatarUrl} className="object-cover" />
                    ) : (
                      <AvatarFallback className="bg-primary/10 text-primary text-xl font-bold">
                        {profile.firstName?.[0]}{profile.lastName?.[0]}
                      </AvatarFallback>
                    )}
                  </Avatar>
                  <input type="file" accept="image/*" id="avatarUpload" className="hidden" onChange={handleAvatarChange} />
                  <Button size="icon" variant="outline" className="absolute bottom-0 right-0 rounded-full h-8 w-8" onClick={() => document.getElementById("avatarUpload")?.click()}>
                    <Camera className="h-4 w-4" />
                  </Button>
                </div>
                <div>
                  <h3 className="font-semibold text-lg">{profile.firstName} {profile.lastName}</h3>
                  <p className="text-muted-foreground">Member since {profile.memberSince}</p>
                </div>
              </div>

              <Separator />

              {/* Form Fields */}
              <div className="grid md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="firstName">First Name</Label>
                  <Input id="firstName" value={profile.firstName} onChange={e => setProfile({ ...profile, firstName: e.target.value })} />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="lastName">Last Name</Label>
                  <Input id="lastName" value={profile.lastName} onChange={e => setProfile({ ...profile, lastName: e.target.value })} />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="email">Email</Label>
                  <Input id="email" type="email" value={profile.email} onChange={e => setProfile({ ...profile, email: e.target.value })} />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="phone">Phone</Label>
                  <Input id="phone" value={profile.phone} onChange={e => setProfile({ ...profile, phone: e.target.value })} />
                </div>
                <div className="space-y-2 md:col-span-2">
                  <Label htmlFor="address">Address</Label>
                  <Input id="address" value={profile.address} onChange={e => setProfile({ ...profile, address: e.target.value })} placeholder="Enter your full address" />
                </div>
              </div>

              <div className="flex justify-end pt-4">
                <Button onClick={handleSave} className="gap-2 px-8 h-12 shadow-lg shadow-primary/20 transition-all hover:scale-105">
                  <Save className="h-4 w-4" /> Save Personal Details
                </Button>
              </div>
            </CardContent>
          </Card>
        </motion.div>

        {/* Notifications & Security */}
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }}>
          <div className="grid md:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle>Notification Preferences</CardTitle>
                <CardDescription>Choose how you want to be notified.</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                {[
                  { id: "email", label: "Email Notifications", desc: "Receive updates via your email" },
                  { id: "push", label: "Push Notifications", desc: "Get alerts on your browser" },
                  { id: "sms", label: "SMS Notifications", desc: "Important updates via phone" },
                  { id: "marketing", label: "Marketing Emails", desc: "Receive news and special offers" },
                ].map((item) => (
                  <div key={item.id} className="flex items-center justify-between py-2">
                    <div className="space-y-0.5">
                      <Label className="text-base">{item.label}</Label>
                      <p className="text-sm text-muted-foreground">{item.desc}</p>
                    </div>
                    <Checkbox
                      id={item.id}
                      checked={profile.notifications[item.id as keyof typeof profile.notifications]}
                      onCheckedChange={(checked) => setProfile({
                        ...profile,
                        notifications: { ...profile.notifications, [item.id]: !!checked }
                      })}
                    />
                  </div>
                ))}
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Account Security</CardTitle>
                <CardDescription>Manage your password and security settings.</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="p-4 bg-secondary/30 rounded-lg border border-border/50">
                  <h4 className="font-medium mb-1">Update Password</h4>
                  <p className="text-sm text-muted-foreground mb-4">You can change your password to keep your account secure.</p>

                  <Dialog open={isPasswordModalOpen} onOpenChange={setIsPasswordModalOpen}>
                    <DialogTrigger asChild>
                      <Button variant="outline" className="w-full gap-2">
                        <Lock className="h-4 w-4" /> Revise Password
                      </Button>
                    </DialogTrigger>
                    <DialogContent className="sm:max-w-[425px]">
                      <DialogHeader>
                        <DialogTitle>Update Password</DialogTitle>
                        <DialogDescription>
                          Enter your current password and your new password below.
                        </DialogDescription>
                      </DialogHeader>
                      <div className="grid gap-4 py-4">
                        <div className="grid gap-2">
                          <Label htmlFor="current">Current Password</Label>
                          <Input
                            id="current"
                            type="password"
                            value={passwordData.currentPassword}
                            onChange={(e) => setPasswordData({ ...passwordData, currentPassword: e.target.value })}
                          />
                        </div>
                        <div className="grid gap-2">
                          <Label htmlFor="new">New Password</Label>
                          <Input
                            id="new"
                            type="password"
                            value={passwordData.newPassword}
                            onChange={(e) => setPasswordData({ ...passwordData, newPassword: e.target.value })}
                          />
                        </div>
                        <div className="grid gap-2">
                          <Label htmlFor="confirm">Confirm New Password</Label>
                          <Input
                            id="confirm"
                            type="password"
                            value={passwordData.confirmPassword}
                            onChange={(e) => setPasswordData({ ...passwordData, confirmPassword: e.target.value })}
                          />
                        </div>
                      </div>
                      <DialogFooter>
                        <Button
                          disabled={passwordLoading}
                          onClick={handlePasswordChange}
                          className="w-full"
                        >
                          {passwordLoading ? "Updating..." : "Update Password"}
                        </Button>
                      </DialogFooter>
                    </DialogContent>
                  </Dialog>
                </div>
                <div className="p-4 bg-red-500/5 rounded-lg border border-red-500/20">
                  <h4 className="font-medium text-red-600 mb-1">Danger Zone</h4>
                  <p className="text-sm text-muted-foreground mb-4">Once you delete your account, there is no going back.</p>
                  <Button variant="destructive" className="w-full">Delete Account</Button>
                </div>
              </CardContent>
            </Card>
          </div>
        </motion.div>
      </div>
    </DashboardLayout>
  );
};

export default ProfilePage;
