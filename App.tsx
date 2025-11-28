import React, { useState, useEffect, useMemo } from 'react';
import { 
  User, 
  UserRole, 
  MoodType, 
  Reward, 
  MoodLog, 
  CounselingRequest, 
  DiaryEntry 
} from './types';
import { 
  MOCK_USERS, 
  MOCK_STUDENTS, 
  REWARDS, 
  MOOD_COLORS,
  MOOD_EMOJIS,
  PSYCH_QUESTIONS,
  PSYCH_OPTIONS
} from './constants';
import MoodSelector from './components/MoodSelector';
import StatCard from './components/StatCard';
import { analyzeDiaryEntry, generatePsychAnalysis } from './services/geminiService';
import { 
  LogOut, 
  Star, 
  BookOpen, 
  MessageCircleHeart, 
  ClipboardList, 
  LayoutDashboard, 
  UserCheck, 
  Users, 
  PieChart, 
  TrendingUp,
  Plus,
  Minus,
  Send,
  Loader2,
  CheckCircle2,
  ChevronRight,
  RotateCcw
} from 'lucide-react';
import { 
  BarChart, 
  Bar, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  Legend, 
  ResponsiveContainer, 
  PieChart as RePieChart, 
  Pie, 
  Cell 
} from 'recharts';

// --- Components for different Roles ---

// 1. Student View
const StudentView: React.FC<{ user: User; onLogout: () => void }> = ({ user, onLogout }) => {
  const [activeTab, setActiveTab] = useState<'HOME' | 'REWARD' | 'DIARY' | 'COUNSEL' | 'TEST'>('HOME');
  const [moodLog, setMoodLog] = useState<MoodType | null>(null);
  const [stars, setStars] = useState(user.stars || 0);
  const [diaryInput, setDiaryInput] = useState('');
  const [diaryEntries, setDiaryEntries] = useState<DiaryEntry[]>([]);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [requests, setRequests] = useState<CounselingRequest[]>([]);

  // Test State
  const [testStatus, setTestStatus] = useState<'IDLE' | 'TAKING' | 'ANALYZING' | 'RESULT'>('IDLE');
  const [currentQuestion, setCurrentQuestion] = useState(0);
  const [testAnswers, setTestAnswers] = useState<string[]>([]);
  const [testResult, setTestResult] = useState<string>('');

  const handleMoodSelect = (mood: MoodType) => {
    setMoodLog(mood);
    // In a real app, save to backend
    alert(`บันทึกความรู้สึก "${mood}" เรียบร้อยแล้ว!`);
  };

  const handleRedeem = (reward: Reward) => {
    if (stars >= reward.cost) {
      if(confirm(`ต้องการแลก "${reward.name}" ใช่หรือไม่?`)) {
        setStars(prev => prev - reward.cost);
        alert('แลกของรางวัลสำเร็จ! โปรดแสดงหน้าจอนี้แก่ครู');
      }
    } else {
      alert('จำนวนดาวไม่เพียงพอ');
    }
  };

  const handleDiarySubmit = async () => {
    if (!diaryInput.trim()) return;
    setIsAnalyzing(true);
    const analysis = await analyzeDiaryEntry(diaryInput);
    
    const newEntry: DiaryEntry = {
      id: Date.now().toString(),
      studentId: user.id,
      content: diaryInput,
      aiResponse: analysis,
      timestamp: new Date()
    };
    
    setDiaryEntries([newEntry, ...diaryEntries]);
    setDiaryInput('');
    setIsAnalyzing(false);
  };

  const requestCounseling = (type: 'GUIDANCE' | 'PSYCHOLOGIST') => {
    const newReq: CounselingRequest = {
      id: Date.now().toString(),
      studentId: user.id,
      studentName: user.name,
      type,
      note: 'ขอนัดหมายด่วน',
      status: 'PENDING',
      timestamp: new Date()
    };
    setRequests([newReq, ...requests]);
    alert('ส่งคำร้องขอเรียบร้อยแล้ว');
  };

  const startTest = () => {
    setTestStatus('TAKING');
    setCurrentQuestion(0);
    setTestAnswers([]);
  };

  const submitAnswer = async (answerLabel: string) => {
    const updatedAnswers = [...testAnswers, `Q: ${PSYCH_QUESTIONS[currentQuestion]} - A: ${answerLabel}`];
    setTestAnswers(updatedAnswers);

    if (currentQuestion < PSYCH_QUESTIONS.length - 1) {
      setCurrentQuestion(prev => prev + 1);
    } else {
      setTestStatus('ANALYZING');
      const result = await generatePsychAnalysis(updatedAnswers);
      setTestResult(result);
      setTestStatus('RESULT');
    }
  };

  const resetTest = () => {
    setTestStatus('IDLE');
    setCurrentQuestion(0);
    setTestAnswers([]);
    setTestResult('');
  };

  return (
    <div className="flex flex-col h-screen bg-slate-50">
      {/* Header */}
      <header className="bg-white shadow-sm px-6 py-4 flex justify-between items-center sticky top-0 z-10">
        <div className="flex items-center space-x-3">
          <img src={user.avatar} alt="avatar" className="w-10 h-10 rounded-full border-2 border-indigo-100" />
          <div>
            <h1 className="font-bold text-gray-800">{user.name}</h1>
            <span className="text-xs text-indigo-600 font-semibold bg-indigo-50 px-2 py-0.5 rounded-full">นักเรียน</span>
          </div>
        </div>
        <div className="flex items-center space-x-4">
          <div className="flex items-center space-x-1 bg-amber-100 px-3 py-1 rounded-full text-amber-700 font-bold border border-amber-200">
            <Star className="w-4 h-4 fill-amber-500 text-amber-500" />
            <span>{stars}</span>
          </div>
          <button onClick={onLogout} className="text-gray-400 hover:text-red-500"><LogOut className="w-5 h-5" /></button>
        </div>
      </header>

      {/* Content */}
      <main className="flex-1 overflow-y-auto p-4 md:p-6 pb-24 max-w-4xl mx-auto w-full">
        {activeTab === 'HOME' && (
          <div className="space-y-6">
            <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-100">
              <MoodSelector currentMood={moodLog} onSelect={handleMoodSelect} />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <button onClick={() => setActiveTab('REWARD')} className="bg-gradient-to-br from-indigo-500 to-purple-600 text-white p-6 rounded-2xl shadow-md hover:shadow-lg transition-all flex flex-col items-center justify-center space-y-2">
                <Star className="w-8 h-8 fill-white/20" />
                <span className="font-semibold text-lg">แลกของรางวัล</span>
              </button>
              <button onClick={() => setActiveTab('DIARY')} className="bg-white text-indigo-600 border-2 border-indigo-100 p-6 rounded-2xl shadow-sm hover:border-indigo-300 transition-all flex flex-col items-center justify-center space-y-2">
                <BookOpen className="w-8 h-8" />
                <span className="font-semibold text-lg">บันทึกไดอารี่</span>
              </button>
              <button onClick={() => setActiveTab('COUNSEL')} className="bg-white text-teal-600 border-2 border-teal-100 p-6 rounded-2xl shadow-sm hover:border-teal-300 transition-all flex flex-col items-center justify-center space-y-2">
                <MessageCircleHeart className="w-8 h-8" />
                <span className="font-semibold text-lg">มุมปรึกษาใจ</span>
              </button>
              <button onClick={() => setActiveTab('TEST')} className="bg-white text-pink-600 border-2 border-pink-100 p-6 rounded-2xl shadow-sm hover:border-pink-300 transition-all flex flex-col items-center justify-center space-y-2">
                <ClipboardList className="w-8 h-8" />
                <span className="font-semibold text-lg">แบบทดสอบจิตวิทยา</span>
              </button>
            </div>
          </div>
        )}

        {activeTab === 'REWARD' && (
          <div className="space-y-4">
            <h2 className="text-xl font-bold text-gray-800">แลกของรางวัล</h2>
            <div className="grid gap-4">
              {REWARDS.map(reward => (
                <div key={reward.id} className="bg-white p-4 rounded-xl border border-gray-100 shadow-sm flex justify-between items-center">
                  <div className="flex items-center space-x-3">
                    <div className="text-3xl">{reward.icon}</div>
                    <div>
                      <h3 className="font-bold text-gray-800">{reward.name}</h3>
                      <p className="text-xs text-gray-500">{reward.description}</p>
                    </div>
                  </div>
                  <button 
                    onClick={() => handleRedeem(reward)}
                    disabled={stars < reward.cost}
                    className={`px-4 py-2 rounded-lg font-semibold text-sm ${stars >= reward.cost ? 'bg-amber-400 text-white hover:bg-amber-500 shadow-amber-200 shadow-md' : 'bg-gray-200 text-gray-400 cursor-not-allowed'}`}
                  >
                    ใช้ {reward.cost} ดาว
                  </button>
                </div>
              ))}
            </div>
          </div>
        )}

        {activeTab === 'DIARY' && (
          <div className="space-y-6">
            <h2 className="text-xl font-bold text-gray-800">ไดอารี่ของฉัน</h2>
            <div className="bg-white p-4 rounded-xl border border-gray-100 shadow-sm">
              <textarea 
                className="w-full h-32 p-3 border border-gray-200 rounded-lg focus:ring-2 focus:ring-indigo-300 focus:outline-none resize-none"
                placeholder="วันนี้เจออะไรมาบ้าง เล่าให้ฟังหน่อยสิ..."
                value={diaryInput}
                onChange={(e) => setDiaryInput(e.target.value)}
              />
              <div className="flex justify-end mt-2">
                <button 
                  onClick={handleDiarySubmit}
                  disabled={isAnalyzing || !diaryInput.trim()}
                  className="bg-indigo-600 text-white px-4 py-2 rounded-lg flex items-center space-x-2 hover:bg-indigo-700 disabled:opacity-50"
                >
                  {isAnalyzing ? <Loader2 className="animate-spin w-4 h-4" /> : <Send className="w-4 h-4" />}
                  <span>บันทึก</span>
                </button>
              </div>
            </div>

            <div className="space-y-4">
              {diaryEntries.map(entry => (
                <div key={entry.id} className="bg-white p-4 rounded-xl border border-gray-100 shadow-sm space-y-3">
                  <div className="flex justify-between text-xs text-gray-400">
                    <span>{entry.timestamp.toLocaleDateString('th-TH')}</span>
                  </div>
                  <p className="text-gray-700">{entry.content}</p>
                  {entry.aiResponse && (
                    <div className="bg-indigo-50 p-3 rounded-lg flex items-start space-x-2 text-indigo-800 text-sm">
                      <MessageCircleHeart className="w-5 h-5 flex-shrink-0 mt-0.5" />
                      <p>{entry.aiResponse}</p>
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>
        )}

        {activeTab === 'COUNSEL' && (
          <div className="space-y-4">
            <h2 className="text-xl font-bold text-gray-800">ขอคำปรึกษา</h2>
            <div className="grid grid-cols-2 gap-4">
              <button onClick={() => requestCounseling('GUIDANCE')} className="bg-teal-50 border-2 border-teal-200 p-4 rounded-xl text-teal-700 hover:bg-teal-100 text-left">
                <h3 className="font-bold">ครูแนะแนว</h3>
                <p className="text-xs mt-1">ปรึกษาเรื่องเรียน ทุน หรืออาชีพในอนาคต</p>
              </button>
              <button onClick={() => requestCounseling('PSYCHOLOGIST')} className="bg-pink-50 border-2 border-pink-200 p-4 rounded-xl text-pink-700 hover:bg-pink-100 text-left">
                <h3 className="font-bold">นักจิตวิทยา</h3>
                <p className="text-xs mt-1">ปรึกษาเรื่องความเครียด หรือเรื่องไม่สบายใจ</p>
              </button>
            </div>
            {requests.length > 0 && (
              <div className="mt-6">
                <h3 className="font-semibold text-gray-700 mb-2">ประวัติการขอคำปรึกษา</h3>
                <div className="space-y-2">
                   {requests.map(req => (
                     <div key={req.id} className="bg-white p-3 rounded-lg border flex justify-between items-center text-sm">
                        <span>{req.type === 'GUIDANCE' ? 'ครูแนะแนว' : 'นักจิตวิทยา'} ({req.timestamp.toLocaleDateString('th-TH')})</span>
                        <span className={`px-2 py-1 rounded-full text-xs ${req.status === 'PENDING' ? 'bg-yellow-100 text-yellow-700' : 'bg-green-100 text-green-700'}`}>
                          {req.status === 'PENDING' ? 'รอยืนยัน' : 'ยืนยันแล้ว'}
                        </span>
                     </div>
                   ))}
                </div>
              </div>
            )}
          </div>
        )}

        {activeTab === 'TEST' && (
          <div className="space-y-6">
            <h2 className="text-xl font-bold text-gray-800">แบบประเมินสุขภาพใจ</h2>
            
            {testStatus === 'IDLE' && (
              <div className="bg-white p-8 rounded-2xl shadow-sm border border-slate-100 text-center space-y-4">
                <div className="bg-pink-50 w-20 h-20 rounded-full flex items-center justify-center mx-auto mb-4">
                   <ClipboardList className="w-10 h-10 text-pink-500" />
                </div>
                <h3 className="text-lg font-bold text-gray-800">แบบทดสอบความเครียดและภาวะซึมเศร้า</h3>
                <p className="text-gray-500 text-sm max-w-sm mx-auto">
                  แบบสอบถามนี้ช่วยประเมินระดับความเครียดและอารมณ์ของคุณในเบื้องต้น เพื่อให้คุณเข้าใจตัวเองมากขึ้น (ไม่ใช่การวินิจฉัยทางการแพทย์)
                </p>
                <button 
                  onClick={startTest}
                  className="bg-pink-500 text-white px-8 py-3 rounded-xl font-semibold hover:bg-pink-600 transition-colors shadow-lg shadow-pink-200 mt-4"
                >
                  เริ่มทำแบบทดสอบ
                </button>
              </div>
            )}

            {testStatus === 'TAKING' && (
              <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-100">
                <div className="mb-6">
                   <div className="flex justify-between text-xs font-semibold text-gray-400 mb-2">
                      <span>คำถามที่ {currentQuestion + 1} / {PSYCH_QUESTIONS.length}</span>
                      <span>{Math.round(((currentQuestion + 1) / PSYCH_QUESTIONS.length) * 100)}%</span>
                   </div>
                   <div className="w-full bg-gray-100 rounded-full h-2">
                      <div 
                        className="bg-pink-500 h-2 rounded-full transition-all duration-300" 
                        style={{ width: `${((currentQuestion + 1) / PSYCH_QUESTIONS.length) * 100}%` }}
                      ></div>
                   </div>
                </div>

                <h3 className="text-xl font-bold text-gray-800 mb-8 text-center leading-relaxed">
                  {PSYCH_QUESTIONS[currentQuestion]}
                </h3>

                <div className="space-y-3">
                  {PSYCH_OPTIONS.map((option) => (
                    <button
                      key={option.score}
                      onClick={() => submitAnswer(option.label)}
                      className="w-full text-left p-4 rounded-xl border border-gray-200 hover:border-pink-300 hover:bg-pink-50 transition-all flex justify-between items-center group"
                    >
                      <span className="font-medium text-gray-700 group-hover:text-pink-700">{option.label}</span>
                      <ChevronRight className="w-5 h-5 text-gray-300 group-hover:text-pink-400" />
                    </button>
                  ))}
                </div>
              </div>
            )}

            {testStatus === 'ANALYZING' && (
               <div className="flex flex-col items-center justify-center h-64 bg-white rounded-2xl border border-slate-100">
                  <Loader2 className="w-12 h-12 text-pink-500 animate-spin mb-4" />
                  <p className="text-gray-500 animate-pulse">AI กำลังวิเคราะห์ผลลัพธ์...</p>
               </div>
            )}

            {testStatus === 'RESULT' && (
              <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-100 space-y-6">
                <div className="flex items-center space-x-3 text-pink-600 mb-2">
                   <MessageCircleHeart className="w-6 h-6" />
                   <h3 className="font-bold text-lg">ผลการวิเคราะห์</h3>
                </div>
                
                <div className="bg-pink-50 p-6 rounded-xl border border-pink-100 text-gray-700 leading-relaxed">
                   {testResult}
                </div>

                <div className="flex justify-center pt-4">
                  <button 
                    onClick={resetTest}
                    className="flex items-center space-x-2 text-gray-500 hover:text-gray-700 bg-gray-100 hover:bg-gray-200 px-4 py-2 rounded-lg transition-colors"
                  >
                    <RotateCcw className="w-4 h-4" />
                    <span>กลับไปหน้าแรก</span>
                  </button>
                </div>
                
                <p className="text-xs text-center text-gray-400 mt-4">
                  * หากคุณรู้สึกไม่สบายใจ แนะนำให้กดเมนู "มุมปรึกษาใจ" เพื่อพูดคุยกับนักจิตวิทยา
                </p>
              </div>
            )}
          </div>
        )}
      </main>

      {/* Bottom Nav Mobile */}
      <nav className="fixed bottom-0 left-0 right-0 bg-white border-t border-gray-200 px-6 py-2 flex justify-between items-center z-10">
        <button onClick={() => setActiveTab('HOME')} className={`flex flex-col items-center space-y-1 ${activeTab === 'HOME' ? 'text-indigo-600' : 'text-gray-400'}`}>
          <LayoutDashboard className="w-6 h-6" />
          <span className="text-[10px]">หน้าหลัก</span>
        </button>
        <button onClick={() => setActiveTab('REWARD')} className={`flex flex-col items-center space-y-1 ${activeTab === 'REWARD' ? 'text-indigo-600' : 'text-gray-400'}`}>
          <Star className="w-6 h-6" />
          <span className="text-[10px]">แลกดาว</span>
        </button>
        <button onClick={() => setActiveTab('DIARY')} className={`flex flex-col items-center space-y-1 ${activeTab === 'DIARY' ? 'text-indigo-600' : 'text-gray-400'}`}>
          <BookOpen className="w-6 h-6" />
          <span className="text-[10px]">ไดอารี่</span>
        </button>
      </nav>
    </div>
  );
};

// 2. Teacher View
const TeacherView: React.FC<{ user: User; onLogout: () => void }> = ({ user, onLogout }) => {
  const [moodLog, setMoodLog] = useState<MoodType | null>(null);
  const [students, setStudents] = useState(MOCK_STUDENTS);
  const [counselingReqs, setCounselingReqs] = useState<CounselingRequest[]>([
    { id: 'req1', studentId: 's3', studentName: 'ด.ช. มานะ อดทน', type: 'PSYCHOLOGIST', note: 'เครียดเรื่องที่บ้าน', status: 'PENDING', timestamp: new Date() }
  ]);

  const updateStars = (studentId: string, amount: number) => {
    setStudents(prev => prev.map(s => 
      s.id === studentId ? { ...s, stars: (s.stars || 0) + amount } : s
    ));
  };

  const confirmRequest = (reqId: string) => {
    setCounselingReqs(prev => prev.map(r => r.id === reqId ? { ...r, status: 'CONFIRMED' } : r));
    alert('ยืนยันนัดหมายแล้ว');
  };

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col">
       <header className="bg-white shadow-sm px-6 py-4 flex justify-between items-center sticky top-0 z-20">
        <div className="flex items-center space-x-3">
          <div className="bg-indigo-100 p-2 rounded-full"><UserCheck className="w-6 h-6 text-indigo-600" /></div>
          <div>
            <h1 className="font-bold text-gray-800">{user.name}</h1>
            <span className="text-xs text-indigo-600 font-semibold bg-indigo-50 px-2 py-0.5 rounded-full">ครู</span>
          </div>
        </div>
        <button onClick={onLogout} className="text-gray-400 hover:text-red-500"><LogOut className="w-5 h-5" /></button>
      </header>

      <main className="flex-1 p-6 max-w-5xl mx-auto w-full space-y-8">
        {/* Mood Record */}
        <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-100">
           <MoodSelector currentMood={moodLog} onSelect={setMoodLog} />
        </div>

        <div className="grid md:grid-cols-2 gap-8">
          {/* Student Star Management */}
          <div className="space-y-4">
            <h2 className="text-xl font-bold text-gray-800 flex items-center gap-2">
              <Star className="w-5 h-5 text-amber-500" /> จัดการคะแนนความดี
            </h2>
            <div className="bg-white rounded-2xl shadow-sm border border-slate-100 overflow-hidden">
              <div className="overflow-x-auto">
                <table className="w-full text-left">
                  <thead className="bg-gray-50 text-gray-500 text-xs uppercase">
                    <tr>
                      <th className="px-4 py-3">นักเรียน</th>
                      <th className="px-4 py-3 text-center">ดาวสะสม</th>
                      <th className="px-4 py-3 text-center">จัดการ</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-100">
                    {students.map(student => (
                      <tr key={student.id}>
                        <td className="px-4 py-3 text-sm font-medium text-gray-800">{student.name}</td>
                        <td className="px-4 py-3 text-center">
                          <span className="bg-amber-100 text-amber-800 px-2 py-1 rounded-full text-xs font-bold">{student.stars}</span>
                        </td>
                        <td className="px-4 py-3 flex justify-center space-x-2">
                          <button onClick={() => updateStars(student.id, 1)} className="p-1.5 bg-green-100 text-green-600 rounded-lg hover:bg-green-200"><Plus className="w-4 h-4" /></button>
                          <button onClick={() => updateStars(student.id, -1)} className="p-1.5 bg-red-100 text-red-600 rounded-lg hover:bg-red-200"><Minus className="w-4 h-4" /></button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </div>

          {/* Counseling Requests */}
          <div className="space-y-4">
            <h2 className="text-xl font-bold text-gray-800 flex items-center gap-2">
              <MessageCircleHeart className="w-5 h-5 text-pink-500" /> คำร้องขอคำปรึกษา
            </h2>
             <div className="bg-white rounded-2xl shadow-sm border border-slate-100 p-4 space-y-3">
                {counselingReqs.length === 0 ? (
                  <p className="text-center text-gray-400 py-4">ไม่มีคำร้องขอใหม่</p>
                ) : (
                  counselingReqs.map(req => (
                    <div key={req.id} className="border border-gray-100 rounded-xl p-3 flex justify-between items-start">
                      <div>
                        <div className="font-semibold text-gray-800">{req.studentName}</div>
                        <div className="text-xs text-gray-500 mt-1">ต้องการพบ: <span className="text-indigo-600">{req.type === 'GUIDANCE' ? 'ครูแนะแนว' : 'นักจิตวิทยา'}</span></div>
                        <div className="text-xs text-gray-400 mt-1">เหตุผล: {req.note}</div>
                      </div>
                      {req.status === 'PENDING' ? (
                        <button onClick={() => confirmRequest(req.id)} className="text-xs bg-indigo-600 text-white px-3 py-1.5 rounded-lg hover:bg-indigo-700">
                          ยืนยัน
                        </button>
                      ) : (
                        <span className="text-green-500"><CheckCircle2 className="w-5 h-5"/></span>
                      )}
                    </div>
                  ))
                )}
             </div>
          </div>
        </div>

        {/* Stats Preview */}
        <div className="space-y-4">
           <h2 className="text-xl font-bold text-gray-800 flex items-center gap-2">
              <TrendingUp className="w-5 h-5 text-blue-500" /> สถิติดาวนักเรียน
           </h2>
           <div className="bg-white p-4 rounded-2xl shadow-sm border border-slate-100 h-64">
             <ResponsiveContainer width="100%" height="100%">
               <BarChart data={students}>
                 <CartesianGrid strokeDasharray="3 3" vertical={false} />
                 <XAxis dataKey="name" tick={{fontSize: 10}} interval={0} />
                 <YAxis />
                 <Tooltip />
                 <Bar dataKey="stars" fill="#f59e0b" radius={[4, 4, 0, 0]} name="จำนวนดาว" />
               </BarChart>
             </ResponsiveContainer>
           </div>
        </div>
      </main>
    </div>
  );
};

// 3. Admin View
const AdminView: React.FC<{ user: User; onLogout: () => void }> = ({ user, onLogout }) => {
  const [moodLog, setMoodLog] = useState<MoodType | null>(null);
  
  // Mock aggregated data
  const moodData = [
    { name: 'ยอดเยี่ยม', value: 30, color: '#22c55e' },
    { name: 'ดี', value: 45, color: '#3b82f6' },
    { name: 'เฉยๆ', value: 15, color: '#9ca3af' },
    { name: 'แย่', value: 5, color: '#f97316' },
    { name: 'แย่มาก', value: 5, color: '#ef4444' },
  ];

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col">
       <header className="bg-white shadow-sm px-6 py-4 flex justify-between items-center sticky top-0 z-20">
        <div className="flex items-center space-x-3">
          <div className="bg-indigo-100 p-2 rounded-full"><LayoutDashboard className="w-6 h-6 text-indigo-600" /></div>
          <div>
            <h1 className="font-bold text-gray-800">{user.name}</h1>
            <span className="text-xs text-indigo-600 font-semibold bg-indigo-50 px-2 py-0.5 rounded-full">ผู้บริหาร</span>
          </div>
        </div>
        <button onClick={onLogout} className="text-gray-400 hover:text-red-500"><LogOut className="w-5 h-5" /></button>
      </header>

      <main className="flex-1 p-6 max-w-6xl mx-auto w-full space-y-8">
        <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-100">
           <MoodSelector currentMood={moodLog} onSelect={setMoodLog} />
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
           <StatCard title="นักเรียนทั้งหมด" value="450" icon={Users} colorClass="bg-blue-500" />
           <StatCard title="อารมณ์เฉลี่ยวันนี้" value="ดีมาก" icon={MessageCircleHeart} colorClass="bg-green-500" />
           <StatCard title="ดาวที่แจกแล้ว" value="1,240" icon={Star} colorClass="bg-amber-500" />
           <StatCard title="ขอคำปรึกษา (เดือนนี้)" value="12" icon={ClipboardList} colorClass="bg-pink-500" />
        </div>

        <div className="grid md:grid-cols-2 gap-8">
            <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-100">
              <h2 className="text-lg font-bold text-gray-800 mb-4">ภาพรวมอารมณ์ (นักเรียน & ครู)</h2>
              <div className="h-64">
                <ResponsiveContainer width="100%" height="100%">
                  <RePieChart>
                    <Pie
                      data={moodData}
                      cx="50%"
                      cy="50%"
                      innerRadius={60}
                      outerRadius={80}
                      paddingAngle={5}
                      dataKey="value"
                    >
                      {moodData.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={entry.color} />
                      ))}
                    </Pie>
                    <Tooltip />
                    <Legend />
                  </RePieChart>
                </ResponsiveContainer>
              </div>
            </div>

            <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-100">
              <h2 className="text-lg font-bold text-gray-800 mb-4">สถิติพฤติกรรมเชิงบวก (ดาวสะสมสูงสุด)</h2>
              <div className="h-64">
                 <ResponsiveContainer width="100%" height="100%">
                   <BarChart data={MOCK_STUDENTS} layout="vertical">
                     <CartesianGrid strokeDasharray="3 3" horizontal={false} />
                     <XAxis type="number" />
                     <YAxis dataKey="name" type="category" width={100} tick={{fontSize: 12}} />
                     <Tooltip />
                     <Bar dataKey="stars" fill="#8b5cf6" radius={[0, 4, 4, 0]} name="จำนวนดาว" />
                   </BarChart>
                 </ResponsiveContainer>
              </div>
            </div>
        </div>

        {/* Student Management Table (Simplified for Admin) */}
         <div className="bg-white rounded-2xl shadow-sm border border-slate-100 overflow-hidden">
             <div className="p-4 border-b border-gray-100">
               <h2 className="font-bold text-gray-800">จัดการข้อมูลนักเรียน</h2>
             </div>
             <div className="overflow-x-auto">
               <table className="w-full text-left">
                  <thead className="bg-gray-50 text-gray-500 text-xs uppercase">
                    <tr>
                      <th className="px-6 py-3">ID</th>
                      <th className="px-6 py-3">ชื่อ-นามสกุล</th>
                      <th className="px-6 py-3 text-center">ดาวสะสม</th>
                      <th className="px-6 py-3 text-center">สถานะ</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-100">
                    {MOCK_STUDENTS.map(student => (
                      <tr key={student.id}>
                        <td className="px-6 py-3 text-gray-400 text-sm">{student.id}</td>
                        <td className="px-6 py-3 font-medium text-gray-800">{student.name}</td>
                        <td className="px-6 py-3 text-center font-bold text-amber-500">{student.stars}</td>
                        <td className="px-6 py-3 text-center"><span className="text-xs bg-green-100 text-green-700 px-2 py-1 rounded-full">ปกติ</span></td>
                      </tr>
                    ))}
                  </tbody>
               </table>
             </div>
         </div>
      </main>
    </div>
  );
};

// 4. Login Screen
const LoginScreen: React.FC<{ onLogin: (user: User) => void }> = ({ onLogin }) => {
  return (
    <div className="min-h-screen bg-slate-50 flex items-center justify-center p-4">
      <div className="bg-white p-8 rounded-3xl shadow-xl w-full max-w-md border border-slate-100">
        <div className="text-center mb-8">
          <div className="bg-indigo-600 w-16 h-16 rounded-2xl mx-auto flex items-center justify-center mb-4 shadow-lg shadow-indigo-200">
            <MessageCircleHeart className="text-white w-8 h-8" />
          </div>
          <h1 className="text-2xl font-bold text-gray-800">SchoolMood & Care</h1>
          <p className="text-gray-400 mt-2">ระบบดูแลช่วยเหลือนักเรียนและบันทึกอารมณ์</p>
        </div>

        <div className="space-y-4">
          <p className="text-sm font-medium text-gray-500 text-center mb-2">เลือกบทบาทเพื่อทดสอบระบบ</p>
          
          <button onClick={() => onLogin(MOCK_STUDENTS[0])} className="w-full bg-white border-2 border-indigo-100 hover:border-indigo-500 hover:bg-indigo-50 text-indigo-700 p-4 rounded-xl flex items-center transition-all group">
            <div className="bg-indigo-100 p-2 rounded-lg group-hover:bg-indigo-200"><Users className="w-5 h-5" /></div>
            <span className="ml-4 font-semibold">เข้าใช้งานเป็น "นักเรียน"</span>
          </button>

          <button onClick={() => onLogin(MOCK_USERS.find(u => u.role === UserRole.TEACHER)!)} className="w-full bg-white border-2 border-teal-100 hover:border-teal-500 hover:bg-teal-50 text-teal-700 p-4 rounded-xl flex items-center transition-all group">
            <div className="bg-teal-100 p-2 rounded-lg group-hover:bg-teal-200"><UserCheck className="w-5 h-5" /></div>
            <span className="ml-4 font-semibold">เข้าใช้งานเป็น "ครู"</span>
          </button>

          <button onClick={() => onLogin(MOCK_USERS.find(u => u.role === UserRole.ADMIN)!)} className="w-full bg-white border-2 border-pink-100 hover:border-pink-500 hover:bg-pink-50 text-pink-700 p-4 rounded-xl flex items-center transition-all group">
            <div className="bg-pink-100 p-2 rounded-lg group-hover:bg-pink-200"><LayoutDashboard className="w-5 h-5" /></div>
            <span className="ml-4 font-semibold">เข้าใช้งานเป็น "ผู้บริหาร"</span>
          </button>
        </div>
        
        <div className="mt-8 text-center text-xs text-gray-400">
           © 2024 SchoolMood Project. Demo Version.
        </div>
      </div>
    </div>
  );
}

// 5. Main App
function App() {
  const [currentUser, setCurrentUser] = useState<User | null>(null);

  if (!currentUser) {
    return <LoginScreen onLogin={setCurrentUser} />;
  }

  const handleLogout = () => setCurrentUser(null);

  return (
    <>
      {currentUser.role === UserRole.STUDENT && <StudentView user={currentUser} onLogout={handleLogout} />}
      {currentUser.role === UserRole.TEACHER && <TeacherView user={currentUser} onLogout={handleLogout} />}
      {currentUser.role === UserRole.ADMIN && <AdminView user={currentUser} onLogout={handleLogout} />}
    </>
  );
}

export default App;