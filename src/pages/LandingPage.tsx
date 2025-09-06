import type React from 'react';
import { useState } from 'react';
import { Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { ThemeToggle } from '@/components/ui/theme-toggle';
import { ArrowRight, Star, Database, User, Menu, X, LogOut, Settings } from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';
import { BackToLanding } from '@/components/BackToLanding';
import toast from 'react-hot-toast';

export const LandingPage: React.FC = () => {
  const { user, logout } = useAuth();
  const [menuOpen, setMenuOpen] = useState(false);

  const handleLogout = () => {
    logout();
    toast('ออกจากระบบเรียบร้อย', { duration: 2000 });
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-900 via-blue-900 to-indigo-900">
      {/* Header */}
      <header className="border-b backdrop-blur-sm bg-background/80 sticky top-0 z-50">
        <div className="container mx-auto px-6 py-4">
          <div className="flex items-center justify-between">
            {/* Logo/Brand */}
            <div className="flex items-center space-x-3">
              <div className="bg-gradient-to-br from-primary to-primary/70 p-2 rounded-xl shadow-sm">
                <Database className="h-5 w-5 text-primary-foreground" />
              </div>
              <div>
                <h1 className="text-xl font-semibold">Xano Boilerplate</h1>
                <p className="text-xs text-muted-foreground">by Natt</p>
              </div>
            </div>

            {/* Menu Items */}
            <div className="flex items-center space-x-4">
              {/* Home Button */}
              <BackToLanding />
              
              {/* Theme Toggle */}
              <ThemeToggle />
              
              {/* Hamburger Menu */}
              <div className="relative">
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => setMenuOpen(!menuOpen)}
                  className="h-9 w-9 p-0"
                >
                  {menuOpen ? <X className="h-4 w-4" /> : <Menu className="h-4 w-4" />}
                </Button>

                {/* Dropdown Menu */}
                {menuOpen && (
                  <div className="absolute right-0 top-12 w-64 bg-background border rounded-lg shadow-lg py-2 z-50">
                    {/* User Info */}
                    <div className="px-4 py-3 border-b">
                      <div className="flex items-center space-x-3">
                        <div className="bg-primary/10 p-2 rounded-full">
                          <User className="h-4 w-4 text-primary" />
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="font-medium text-sm truncate">{user?.name || 'User'}</p>
                          <p className="text-xs text-muted-foreground truncate">{user?.email}</p>
                        </div>
                      </div>
                    </div>

                    {/* Menu Items */}
                    <div className="py-2">
                      <Link
                        to="/settings"
                        className="w-full text-left px-4 py-2 text-sm hover:bg-secondary/50 flex items-center space-x-2"
                        onClick={() => setMenuOpen(false)}
                      >
                        <Settings className="h-4 w-4" />
                        <span>การตั้งค่า</span>
                      </Link>
                      <button
                        type="button"
                        className="w-full text-left px-4 py-2 text-sm hover:bg-secondary/50 flex items-center space-x-2 text-red-600 dark:text-red-400"
                        onClick={() => {
                          handleLogout();
                          setMenuOpen(false);
                        }}
                      >
                        <LogOut className="h-4 w-4" />
                        <span>Logout</span>
                      </button>
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </header>
      
      {/* Hero Section */}
      <section className="relative min-h-screen flex items-center justify-center px-4 py-20">
        <div className="max-w-6xl mx-auto text-center">
            {/* Main Heading */}
          <h1 className="text-5xl md:text-7xl font-bold text-white mb-8 leading-tight">
            <span className="block bg-gradient-to-r from-purple-400 via-pink-500 to-amber-400 bg-clip-text text-transparent">
              เปิดดวงชะตาด้วย AI
            </span>
            <span className="block text-3xl md:text-5xl mt-4 text-white/90">
              ที่เข้าใจคุณอย่างแท้จริง
              </span>
            </h1>
            
            {/* Subtitle */}
          <p className="text-xl md:text-2xl text-white/80 max-w-4xl mx-auto mb-12 leading-relaxed">
            รับคำทำนายจากไพ่ทาโรต์ที่แม่นยำ ผ่านปัญญาประดิษฐ์ขั้นสูง 
            <br className="hidden md:block" />
            พร้อมคำแนะนำเพื่อชีวิตที่ดีกว่าและชัดเจนขึ้น
          </p>
          
          {/* CTA Buttons */}
          <div className="flex flex-col sm:flex-row gap-6 justify-center mb-16">
            <Button asChild size="lg" className="text-xl px-16 py-8 h-auto rounded-2xl shadow-2xl hover:shadow-3xl transition-all duration-300 bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 transform hover:scale-105">
              <Link to="/dashboard">
                เริ่มต้นทำนายดวง <ArrowRight className="ml-4 h-6 w-6" />
              </Link>
            </Button>
            <Button asChild size="lg" className="text-xl px-16 py-8 h-auto rounded-2xl shadow-2xl hover:shadow-3xl transition-all duration-300 bg-gradient-to-r from-amber-600 to-orange-600 hover:from-amber-700 hover:to-orange-700 transform hover:scale-105">
              <Link to="/cards">
                ดูไพ่ทาโรต์ <ArrowRight className="ml-4 h-6 w-6" />
              </Link>
            </Button>
          </div>

          {/* Stats */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-4xl mx-auto">
            <div className="text-center">
              <div className="text-4xl font-bold text-white mb-2">10,000+</div>
              <div className="text-white/70">คำทำนายที่แม่นยำ</div>
            </div>
            <div className="text-center">
              <div className="text-4xl font-bold text-white mb-2">95%</div>
              <div className="text-white/70">ความพึงพอใจของผู้ใช้</div>
            </div>
            <div className="text-center">
              <div className="text-4xl font-bold text-white mb-2">24/7</div>
              <div className="text-white/70">พร้อมให้บริการ</div>
            </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-20 px-4">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-4xl md:text-5xl font-bold text-white mb-6">
              ทำไมต้องเลือก Taro App?
            </h2>
            <p className="text-xl text-white/80 max-w-3xl mx-auto">
              เทคโนโลยี AI ขั้นสูงผสมผสานกับภูมิปัญญาโบราณ 
              เพื่อให้คำทำนายที่แม่นยำและเป็นประโยชน์
            </p>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
            <div className="group p-8 rounded-2xl bg-gradient-to-br from-purple-500/20 to-pink-500/20 border border-purple-500/30 hover:border-purple-500/60 transition-all duration-300 hover:scale-105">
              <div className="text-6xl mb-6 text-center">🔮</div>
              <h3 className="text-2xl font-bold text-white mb-4 text-center">ปัญญาประดิษฐ์ขั้นสูง</h3>
              <p className="text-white/80 text-center leading-relaxed">
                ใช้เทคโนโลยี OpenAI ในการวิเคราะห์และให้คำทำนายที่แม่นยำ เข้าใจบริบทของชีวิตคุณ
              </p>
            </div>
            
            <div className="group p-8 rounded-2xl bg-gradient-to-br from-amber-500/20 to-orange-500/20 border border-amber-500/30 hover:border-amber-500/60 transition-all duration-300 hover:scale-105">
              <div className="text-6xl mb-6 text-center">👤</div>
              <h3 className="text-2xl font-bold text-white mb-4 text-center">คำทำนายเฉพาะตัว</h3>
              <p className="text-white/80 text-center leading-relaxed">
                คำนึงถึงวันเกิดและข้อมูลส่วนตัว เพื่อให้คำทำนายที่ตรงกับดวงชะตาของคุณมากที่สุด
              </p>
            </div>
            
            <div className="group p-8 rounded-2xl bg-gradient-to-br from-blue-500/20 to-cyan-500/20 border border-blue-500/30 hover:border-blue-500/60 transition-all duration-300 hover:scale-105">
              <div className="text-6xl mb-6 text-center">📚</div>
              <h3 className="text-2xl font-bold text-white mb-4 text-center">เก็บประวัติการทำนาย</h3>
              <p className="text-white/80 text-center leading-relaxed">
                บันทึกและจัดการคำทำนายทั้งหมด เพิ่มโน้ตส่วนตัว และติดตามความแม่นยำ
              </p>
            </div>
            
            <div className="group p-8 rounded-2xl bg-gradient-to-br from-green-500/20 to-emerald-500/20 border border-green-500/30 hover:border-green-500/60 transition-all duration-300 hover:scale-105">
              <div className="text-6xl mb-6 text-center">🇹🇭</div>
              <h3 className="text-2xl font-bold text-white mb-4 text-center">ภาษาไทยที่เข้าใจง่าย</h3>
              <p className="text-white/80 text-center leading-relaxed">
                คำทำนายเป็นภาษาไทยที่เข้าใจง่าย ครอบคลุมทุกด้านของชีวิต
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* How It Works Section */}
      <section className="py-20 px-4 bg-gradient-to-r from-purple-800/30 to-pink-800/30">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-4xl md:text-5xl font-bold text-white mb-6">
              วิธีการใช้งาน
            </h2>
            <p className="text-xl text-white/80 max-w-3xl mx-auto">
              เพียง 3 ขั้นตอนง่ายๆ คุณก็สามารถรับคำทำนายที่แม่นยำได้
            </p>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-12">
            <div className="text-center">
              <div className="w-20 h-20 bg-gradient-to-r from-purple-500 to-pink-500 rounded-full flex items-center justify-center text-white text-3xl font-bold mx-auto mb-6">
                1
              </div>
              <h3 className="text-2xl font-bold text-white mb-4">เลือกไพ่</h3>
              <p className="text-white/80 leading-relaxed">
                เลือกไพ่ทาโรต์ที่คุณรู้สึกถูกใจ หรือให้ระบบสุ่มเลือกให้
              </p>
            </div>
            
            <div className="text-center">
              <div className="w-20 h-20 bg-gradient-to-r from-amber-500 to-orange-500 rounded-full flex items-center justify-center text-white text-3xl font-bold mx-auto mb-6">
                2
              </div>
              <h3 className="text-2xl font-bold text-white mb-4">AI วิเคราะห์</h3>
              <p className="text-white/80 leading-relaxed">
                ระบบ AI จะวิเคราะห์ไพ่และข้อมูลส่วนตัวของคุณเพื่อให้คำทำนาย
              </p>
            </div>
            
            <div className="text-center">
              <div className="w-20 h-20 bg-gradient-to-r from-blue-500 to-cyan-500 rounded-full flex items-center justify-center text-white text-3xl font-bold mx-auto mb-6">
                3
              </div>
              <h3 className="text-2xl font-bold text-white mb-4">รับคำทำนาย</h3>
              <p className="text-white/80 leading-relaxed">
                รับคำทำนายที่แม่นยำและคำแนะนำที่เป็นประโยชน์สำหรับชีวิต
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Testimonials Section */}
      <section className="py-20 px-4">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-4xl md:text-5xl font-bold text-white mb-6">
              ความคิดเห็นจากผู้ใช้
            </h2>
            <p className="text-xl text-white/80 max-w-3xl mx-auto">
              ฟังเสียงจากผู้ใช้จริงที่ได้รับประโยชน์จาก Taro App
            </p>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="p-8 rounded-2xl bg-white/10 backdrop-blur-sm border border-white/20">
              <div className="flex items-center mb-4">
                {Array.from({ length: 5 }, (_, i) => (
                  <Star key={`star-${i}-${Math.random()}`} className="w-5 h-5 text-yellow-400 fill-current" />
                ))}
              </div>
              <p className="text-white/90 mb-6 leading-relaxed">
                "คำทำนายแม่นยำมาก! AI เข้าใจสถานการณ์ของฉันได้อย่างน่าประหลาดใจ"
              </p>
              <div className="flex items-center">
                <div className="w-12 h-12 bg-gradient-to-r from-purple-500 to-pink-500 rounded-full flex items-center justify-center text-white font-bold mr-4">
                  ส
                </div>
                <div>
                  <div className="text-white font-semibold">สมใจ</div>
                  <div className="text-white/60">ผู้ใช้</div>
                </div>
              </div>
            </div>
            
            <div className="p-8 rounded-2xl bg-white/10 backdrop-blur-sm border border-white/20">
              <div className="flex items-center mb-4">
                {Array.from({ length: 5 }, (_, i) => (
                  <Star key={`star-${i}-${Math.random()}`} className="w-5 h-5 text-yellow-400 fill-current" />
                ))}
              </div>
              <p className="text-white/90 mb-6 leading-relaxed">
                "ใช้งานง่ายมาก และคำแนะนำที่ได้ช่วยให้ฉันตัดสินใจได้ดีขึ้น"
              </p>
              <div className="flex items-center">
                <div className="w-12 h-12 bg-gradient-to-r from-amber-500 to-orange-500 rounded-full flex items-center justify-center text-white font-bold mr-4">
                  น
                </div>
                <div>
                  <div className="text-white font-semibold">นิดา</div>
                  <div className="text-white/60">ผู้ใช้</div>
                </div>
              </div>
            </div>
            
            <div className="p-8 rounded-2xl bg-white/10 backdrop-blur-sm border border-white/20">
              <div className="flex items-center mb-4">
                {Array.from({ length: 5 }, (_, i) => (
                  <Star key={`star-${i}-${Math.random()}`} className="w-5 h-5 text-yellow-400 fill-current" />
                ))}
              </div>
              <p className="text-white/90 mb-6 leading-relaxed">
                "ประวัติการทำนายช่วยให้ฉันติดตามการเปลี่ยนแปลงในชีวิตได้ดี"
              </p>
              <div className="flex items-center">
                <div className="w-12 h-12 bg-gradient-to-r from-blue-500 to-cyan-500 rounded-full flex items-center justify-center text-white font-bold mr-4">
                  ก
                </div>
                <div>
                  <div className="text-white font-semibold">กิตติ</div>
                  <div className="text-white/60">ผู้ใช้</div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 px-4 bg-gradient-to-r from-purple-600/20 to-pink-600/20">
        <div className="max-w-4xl mx-auto text-center">
          <h2 className="text-4xl md:text-5xl font-bold text-white mb-6">
            พร้อมเริ่มต้นการเดินทางแห่งดวงชะตาแล้วหรือยัง?
          </h2>
          <p className="text-xl text-white/80 mb-12 leading-relaxed">
            รับคำทำนายที่แม่นยำจาก AI พร้อมคำแนะนำที่เป็นประโยชน์สำหรับชีวิต
          </p>
          <div className="flex flex-col sm:flex-row gap-6 justify-center">
            <Button asChild size="lg" className="text-xl px-16 py-8 h-auto rounded-2xl shadow-2xl hover:shadow-3xl transition-all duration-300 bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 transform hover:scale-105">
              <Link to="/dashboard">
                เริ่มทำนายดวงฟรี <ArrowRight className="ml-4 h-6 w-6" />
              </Link>
            </Button>
            <Button asChild size="lg" className="text-xl px-16 py-8 h-auto rounded-2xl shadow-2xl hover:shadow-3xl transition-all duration-300 bg-gradient-to-r from-amber-600 to-orange-600 hover:from-amber-700 hover:to-orange-700 transform hover:scale-105">
              <Link to="/cards">
                ดูไพ่ทาโรต์ <ArrowRight className="ml-4 h-6 w-6" />
              </Link>
            </Button>
              </div>
            </div>
          </section>
          
          {/* Footer */}
      <footer className="py-12 px-4 border-t border-white/20">
        <div className="max-w-7xl mx-auto text-center">
          <div className="mb-8">
            <h3 className="text-2xl font-bold text-white mb-4">Taro App</h3>
            <p className="text-white/80 max-w-2xl mx-auto">
              เปิดดวงชะตาด้วย AI ที่เข้าใจคุณ รับคำทำนายที่แม่นยำและเป็นประโยชน์
            </p>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-8">
            <div>
              <h4 className="text-white font-semibold mb-4">บริการ</h4>
              <ul className="space-y-2 text-white/70">
                <li>คำทำนายไพ่ทาโรต์</li>
                <li>การวิเคราะห์ด้วย AI</li>
                <li>ประวัติการทำนาย</li>
              </ul>
            </div>
            
            <div>
              <h4 className="text-white font-semibold mb-4">ข้อมูล</h4>
              <ul className="space-y-2 text-white/70">
                <li>เกี่ยวกับเรา</li>
                <li>วิธีการใช้งาน</li>
                <li>คำถามที่พบบ่อย</li>
              </ul>
            </div>
            
            <div>
              <h4 className="text-white font-semibold mb-4">ติดต่อ</h4>
              <ul className="space-y-2 text-white/70">
                <li>support@taroapp.com</li>
                <li>02-123-4567</li>
                <li>Line: @taroapp</li>
              </ul>
            </div>
          </div>
          
          <div className="border-t border-white/20 pt-8">
            <p className="text-white/60">
              © 2024 Taro App. สงวนลิขสิทธิ์ทั้งหมด
            </p>
          </div>
        </div>
      </footer>
    </div>
  );
};