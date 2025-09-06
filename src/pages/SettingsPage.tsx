import type React from 'react';
import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { ThemeToggle } from '@/components/ui/theme-toggle';
import { BackToLanding } from '@/components/BackToLanding';
import { useAuth } from '@/contexts/AuthContext';
import { LogOut, User, Mail, Calendar, MapPin, Heart, Edit, X, Plus } from 'lucide-react';

export const SettingsPage: React.FC = () => {
  const { user, logout, updateProfile, refreshUser } = useAuth();
  const [isEditing, setIsEditing] = useState(false);
  
  // Form state
  const [formData, setFormData] = useState({
    interests: user?.interests || [],
    birth_place: user?.birth_place || '',
    birth_date: user?.birth_date ? new Date(user.birth_date).toISOString().split('T')[0] : '',
    birth_time: user?.birth_date ? new Date(user.birth_date).toTimeString().split(' ')[0].substring(0, 5) : ''
  });
 
  // Available interests
  const defaultInterests = ["การงาน", "การเงิน", "ความรัก"];
  const [newInterest, setNewInterest] = useState('');

  // Format birth date from timestamp
  const formatBirthDate = (timestamp: number) => {
    const date = new Date(timestamp);
    return date.toLocaleDateString('th-TH', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  // Format interests array
  const formatInterests = (interests: string[]) => {
    return interests.join(', ');
  };

  // Form handlers
  const handleInterestToggle = (interest: string) => {
    setFormData(prev => ({
      ...prev,
      interests: prev.interests.includes(interest)
        ? prev.interests.filter((i: string) => i !== interest)
        : [...prev.interests, interest]
    }));
  };

  const handleAddInterest = () => {
    if (newInterest.trim() && !formData.interests.includes(newInterest.trim())) {
      setFormData(prev => ({
        ...prev,
        interests: [...prev.interests, newInterest.trim()]
      }));
      setNewInterest('');
    }
  };

  const handleRemoveInterest = (interest: string) => {
    setFormData(prev => ({
      ...prev,
      interests: prev.interests.filter((i: string) => i !== interest)
    }));
  };

  const handleInputChange = (field: string, value: string) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const handleSave = async () => {
    try {
      // Combine birth date and time into epoch timestamp
      let birthTimestamp: number | undefined;
      if (formData.birth_date && formData.birth_time) {
        const dateTimeString = `${formData.birth_date}T${formData.birth_time}:00`;
        birthTimestamp = new Date(dateTimeString).getTime();
      } else if (formData.birth_date) {
        // If only date is provided, use midnight
        birthTimestamp = new Date(`${formData.birth_date}T00:00:00`).getTime();
      }

      // Prepare profile data for API
      const profileData = {
        interests: formData.interests,
        birth_place: formData.birth_place || undefined,
        birth_date: birthTimestamp
      };

      // Update profile via API
      await updateProfile(profileData);
      
      // Refresh user data to get the latest information
      await refreshUser();
      
      setIsEditing(false);
    } catch (error) {
      console.error('Failed to save profile:', error);
      // You might want to show an error message to the user here
    }
  };

  const handleCancel = () => {
    // Reset form data to original user data
    setFormData({
      interests: user?.interests || [],
      birth_place: user?.birth_place || '',
      birth_date: user?.birth_date ? new Date(user.birth_date).toISOString().split('T')[0] : '',
      birth_time: user?.birth_date ? new Date(user.birth_date).toTimeString().split(' ')[0].substring(0, 5) : ''
    });
    setIsEditing(false);
  };

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="border-b backdrop-blur-sm bg-background/80 sticky top-0 z-50">
        <div className="container mx-auto px-6 py-4">
          <div className="flex items-center justify-between">
            {/* Logo/Brand */}
            <div className="flex items-center space-x-3">
              <div className="bg-gradient-to-br from-primary to-primary/70 p-2 rounded-xl shadow-sm">
                <User className="h-5 w-5 text-primary-foreground" />
              </div>
              <div>
                <h1 className="text-xl font-semibold">การตั้งค่า</h1>
                <p className="text-xs text-muted-foreground">จัดการข้อมูลส่วนตัว</p>
              </div>
            </div>

            {/* Back Button & Theme Toggle */}
            <div className="flex items-center space-x-4">
              <BackToLanding />
              <ThemeToggle />
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="container mx-auto px-6 py-12">
        <div className="max-w-4xl mx-auto">
          <div className="text-center mb-8">
            <h1 className="text-4xl font-bold text-foreground mb-4">
              ข้อมูลส่วนตัว
            </h1>
            <p className="text-lg text-muted-foreground">
              จัดการข้อมูลบัญชีและข้อมูลพื้นดวงของคุณ
            </p>
          </div>

          {isEditing ? (
            /* Edit Form */
            <div className="max-w-2xl mx-auto">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center space-x-2">
                    <Edit className="h-5 w-5 text-primary" />
                    <span>แก้ไขข้อมูลส่วนตัว</span>
                  </CardTitle>
                  <CardDescription>
                    อัปเดตข้อมูลสำหรับการทำนายดวงชะตา
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-6">
                  {/* ความสนใจ */}
                  <div className="space-y-4">
                    <Label className="text-base font-medium">ความสนใจ</Label>
                    <div className="space-y-3">
                      {/* Default Interests */}
                      <div className="flex flex-wrap gap-2">
                        {defaultInterests.map((interest) => (
                          <Button
                            key={interest}
                            type="button"
                            variant={formData.interests.includes(interest) ? "default" : "outline"}
                            size="sm"
                            onClick={() => handleInterestToggle(interest)}
                            className="h-8"
                          >
                            {interest}
                          </Button>
                        ))}
                      </div>
                      
                      {/* Add Custom Interest */}
                      <div className="flex gap-2">
                        <Input
                          placeholder="เพิ่มความสนใจใหม่..."
                          value={newInterest}
                          onChange={(e) => setNewInterest(e.target.value)}
                          onKeyDown={(e) => {
                            if (e.key === 'Enter') {
                              e.preventDefault();
                              handleAddInterest();
                            }
                          }}
                        />
                        <Button
                          type="button"
                          onClick={handleAddInterest}
                          disabled={!newInterest.trim()}
                          size="sm"
                        >
                          <Plus className="h-4 w-4" />
                        </Button>
                      </div>
                      
                      {/* Selected Interests */}
                      {formData.interests.length > 0 && (
                        <div className="space-y-2">
                          <Label className="text-sm text-muted-foreground">ความสนใจที่เลือก:</Label>
                          <div className="flex flex-wrap gap-2">
                            {formData.interests.map((interest: string) => (
                              <div
                                key={interest}
                                className="flex items-center gap-1 px-3 py-1 bg-primary/10 text-primary rounded-full text-sm"
                              >
                                <span>{interest}</span>
                                <button
                                  type="button"
                                  onClick={() => handleRemoveInterest(interest)}
                                  className="ml-1 hover:bg-primary/20 rounded-full p-0.5"
                                >
                                  <X className="h-3 w-3" />
                                </button>
                              </div>
                            ))}
                          </div>
                        </div>
                      )}
                    </div>
                  </div>

                  {/* สถานที่เกิด */}
                  <div className="space-y-2">
                    <Label htmlFor="birth_place" className="text-base font-medium">
                      สถานที่เกิด
                    </Label>
                    <Input
                      id="birth_place"
                      placeholder="กรอกสถานที่เกิด"
                      value={formData.birth_place}
                      onChange={(e) => handleInputChange('birth_place', e.target.value)}
                    />
                  </div>

                  {/* วันเกิด */}
                  <div className="space-y-2">
                    <Label htmlFor="birth_date" className="text-base font-medium">
                      วันเกิด
                    </Label>
                    <Input
                      id="birth_date"
                      type="date"
                      value={formData.birth_date}
                      onChange={(e) => handleInputChange('birth_date', e.target.value)}
                    />
                  </div>

                  {/* เวลาเกิด */}
                  <div className="space-y-2">
                    <Label htmlFor="birth_time" className="text-base font-medium">
                      เวลาเกิด
                    </Label>
                    <Input
                      id="birth_time"
                      type="time"
                      value={formData.birth_time}
                      onChange={(e) => handleInputChange('birth_time', e.target.value)}
                    />
                  </div>
                </CardContent>
              </Card>
            </div>
          ) : (
            /* Display Mode */
            <div className="grid md:grid-cols-2 gap-8 mb-8">
              {/* ข้อมูลบัญชี */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center space-x-2">
                    <User className="h-5 w-5 text-primary" />
                    <span>ข้อมูลบัญชี</span>
                  </CardTitle>
                  <CardDescription>
                    ข้อมูลพื้นฐานของบัญชีผู้ใช้
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-6">
                  {/* อีเมลล์ */}
                  <div className="space-y-2">
                    <div className="flex items-center space-x-2">
                      <Mail className="h-4 w-4 text-muted-foreground" />
                      <span className="text-sm font-medium text-muted-foreground">
                        อีเมลล์
                      </span>
                    </div>
                    <div className="p-3 bg-muted/50 rounded-lg">
                      <p className="text-foreground">{user?.email || 'ไม่ระบุ'}</p>
                    </div>
                  </div>

                  {/* ชื่อ */}
                  <div className="space-y-2">
                    <div className="flex items-center space-x-2">
                      <User className="h-4 w-4 text-muted-foreground" />
                      <span className="text-sm font-medium text-muted-foreground">
                        ชื่อ
                      </span>
                    </div>
                    <div className="p-3 bg-muted/50 rounded-lg">
                      <p className="text-foreground">{user?.name || 'ไม่ระบุ'}</p>
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* ข้อมูลพื้นดวง */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center space-x-2">
                    <Heart className="h-5 w-5 text-primary" />
                    <span>ข้อมูลพื้นดวง</span>
                  </CardTitle>
                  <CardDescription>
                    ข้อมูลสำหรับการทำนายดวงชะตา
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-6">
                  {/* ความสนใจ */}
                  <div className="space-y-2">
                    <div className="flex items-center space-x-2">
                      <Heart className="h-4 w-4 text-muted-foreground" />
                      <span className="text-sm font-medium text-muted-foreground">
                        ความสนใจ
                      </span>
                    </div>
                    <div className="p-3 bg-muted/50 rounded-lg">
                      <p className="text-foreground">
                        {user?.interests ? formatInterests(user.interests) : 'ไม่ระบุ'}
                      </p>
                    </div>
                  </div>

                  {/* สถานที่เกิด */}
                  <div className="space-y-2">
                    <div className="flex items-center space-x-2">
                      <MapPin className="h-4 w-4 text-muted-foreground" />
                      <span className="text-sm font-medium text-muted-foreground">
                        สถานที่เกิด
                      </span>
                    </div>
                    <div className="p-3 bg-muted/50 rounded-lg">
                      <p className="text-foreground">{user?.birth_place || 'ไม่ระบุ'}</p>
                    </div>
                  </div>

                  {/* วันเกิด */}
                  <div className="space-y-2">
                    <div className="flex items-center space-x-2">
                      <Calendar className="h-4 w-4 text-muted-foreground" />
                      <span className="text-sm font-medium text-muted-foreground">
                        วันและเวลาเกิด
                      </span>
                    </div>
                    <div className="p-3 bg-muted/50 rounded-lg">
                      <p className="text-foreground">
                        {user?.birth_date ? formatBirthDate(user.birth_date) : 'ไม่ระบุ'}
                      </p>
                      {user?.birth_date && (
                        <p className="text-sm text-muted-foreground mt-1">
                          เวลา: {new Date(user.birth_date).toLocaleTimeString('th-TH', {
                            hour: '2-digit',
                            minute: '2-digit'
                          })}
                        </p>
                      )}
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          )}

          {/* Action Buttons */}
          <div className="flex justify-center space-x-4">
            {isEditing ? (
              <>
                <Button
                  onClick={handleSave}
                  className="px-8 py-3 text-lg"
                >
                  <Edit className="mr-2 h-5 w-5" />
                  บันทึก
                </Button>
                <Button
                  variant="outline"
                  onClick={handleCancel}
                  className="px-8 py-3 text-lg"
                >
                  <X className="mr-2 h-5 w-5" />
                  ยกเลิก
                </Button>
              </>
            ) : (
              <>
                <Button
                  onClick={() => setIsEditing(true)}
                  className="px-8 py-3 text-lg"
                >
                  <Edit className="mr-2 h-5 w-5" />
                  แก้ไข
                </Button>
                <Button
                  variant="outline"
                  onClick={logout}
                  className="px-8 py-3 text-lg"
                >
                  <LogOut className="mr-2 h-5 w-5" />
                  ออกจากระบบ
                </Button>
              </>
            )}
          </div>

        </div>
      </main>
    </div>
  );
};
