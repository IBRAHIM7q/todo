"use client";

import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Clock, CheckCircle, Circle, Plus, Edit, Trash2, Play, Pause, RotateCcw, Target, BookOpen, Zap, Loader2, Check, X, Calendar, Tag, Flag } from "lucide-react";
import { format } from "date-fns";
import { ThemeToggle } from "@/components/theme-toggle";
import { ColorSchemeSelector } from "@/components/color-scheme-selector";
import { WelcomeScreen } from "@/components/welcome-screen";

interface Task {
  id: string;
  title: string;
  description?: string;
  completed: boolean;
  priority: "LOW" | "MEDIUM" | "HIGH";
  category?: string;
  dueDate?: string;
  createdAt: string;
  updatedAt: string;
}

interface Note {
  id: string;
  title: string;
  content: string;
  tags?: string;
  createdAt: string;
  updatedAt: string;
}

interface FocusSession {
  id: string;
  duration: number;
  type: "FOCUS" | "BREAK";
  createdAt: string;
}

interface Stats {
  tasks: {
    total: number;
    completed: number;
    pending: number;
    completionRate: number;
    byPriority: {
      high: number;
      medium: number;
      low: number;
    };
  };
  focus: {
    totalTime: number;
    breakTime: number;
    sessions: number;
    focusSessions: number;
    breakSessions: number;
  };
  notes: {
    total: number;
    recent: Array<{
      id: string;
      title: string;
      createdAt: string;
    }>;
  };
  today: {
    date: string;
    isComplete: boolean;
  };
}

const colorSchemes = {
  purple: {
    primary: "from-purple-400 via-pink-400 to-blue-400",
    bg: "from-slate-900 via-purple-900 to-slate-900",
    card: "border-purple-500/20",
    button: "bg-purple-600 hover:bg-purple-500",
    accent: "text-purple-300",
    bgAccent: "bg-purple-800/30",
  },
  blue: {
    primary: "from-blue-400 via-cyan-400 to-teal-400",
    bg: "from-slate-900 via-blue-900 to-slate-900",
    card: "border-blue-500/20",
    button: "bg-blue-600 hover:bg-blue-500",
    accent: "text-blue-300",
    bgAccent: "bg-blue-800/30",
  },
  green: {
    primary: "from-green-400 via-emerald-400 to-teal-400",
    bg: "from-slate-900 via-green-900 to-slate-900",
    card: "border-green-500/20",
    button: "bg-green-600 hover:bg-green-500",
    accent: "text-green-300",
    bgAccent: "bg-green-800/30",
  },
  orange: {
    primary: "from-orange-400 via-red-400 to-pink-400",
    bg: "from-slate-900 via-orange-900 to-slate-900",
    card: "border-orange-500/20",
    button: "bg-orange-600 hover:bg-orange-500",
    accent: "text-orange-300",
    bgAccent: "bg-orange-800/30",
  },
  rose: {
    primary: "from-rose-400 via-pink-400 to-fuchsia-400",
    bg: "from-slate-900 via-rose-900 to-slate-900",
    card: "border-rose-500/20",
    button: "bg-rose-600 hover:bg-rose-500",
    accent: "text-rose-300",
    bgAccent: "bg-rose-800/30",
  }
};

export default function Dashboard() {
  const [userName, setUserName] = useState<string | null>(null);
  const [tasks, setTasks] = useState<Task[]>([]);
  const [notes, setNotes] = useState<Note[]>([]);
  const [stats, setStats] = useState<Stats | null>(null);
  const [focusTime, setFocusTime] = useState(0);
  const [isTimerActive, setIsTimerActive] = useState(false);
  const [timerType, setTimerType] = useState<"FOCUS" | "BREAK">("FOCUS");
  const [timeLeft, setTimeLeft] = useState(25 * 60); // 25 minutes in seconds
  const [newTask, setNewTask] = useState({ title: "", description: "", priority: "MEDIUM" as "LOW" | "MEDIUM" | "HIGH" });
  const [newNote, setNewNote] = useState({ title: "", content: "", tags: "" });
  const [aiResponse, setAiResponse] = useState("");
  const [aiQuery, setAiQuery] = useState("");
  const [loading, setLoading] = useState(false);
  const [aiLoading, setAiLoading] = useState(false);
  const [colorScheme, setColorScheme] = useState<keyof typeof colorSchemes>("purple");
  const [userId, setUserId] = useState<string | null>(null);

  // Check if user has already entered their name
  useEffect(() => {
    const savedName = localStorage.getItem('userName');
    const savedUserId = localStorage.getItem('userId');
    
    if (savedName) {
      setUserName(savedName);
    }
    
    if (!savedUserId) {
      const id = 'user_' + Math.random().toString(36).substr(2, 9);
      localStorage.setItem('userId', id);
      setUserId(id);
    } else {
      setUserId(savedUserId);
    }
  }, []);

  // Fetch data on component mount and when userId changes
  useEffect(() => {
    if (userId && userName) {
      fetchData();
    }
  }, [userId, userName]);

  const fetchData = async () => {
    if (!userId) return;
    
    try {
      setLoading(true);
      const headers = { 'x-user-id': userId };
      
      const [tasksRes, notesRes, statsRes] = await Promise.all([
        fetch('/api/tasks', { headers }),
        fetch('/api/notes', { headers }),
        fetch('/api/stats', { headers })
      ]);

      if (tasksRes.ok) {
        const tasksData = await tasksRes.json();
        setTasks(tasksData);
      }

      if (notesRes.ok) {
        const notesData = await notesRes.json();
        setNotes(notesData);
      }

      if (statsRes.ok) {
        const statsData = await statsRes.json();
        setStats(statsData);
        setFocusTime(statsData.focus.totalTime);
      }
    } catch (error) {
      console.error('Error fetching data:', error);
    } finally {
      setLoading(false);
    }
  };

  // Timer effect
  useEffect(() => {
    let interval: NodeJS.Timeout;
    
    if (isTimerActive && timeLeft > 0) {
      interval = setInterval(() => {
        setTimeLeft((prev) => prev - 1);
      }, 1000);
    } else if (timeLeft === 0) {
      setIsTimerActive(false);
      // Switch between focus and break
      if (timerType === "FOCUS") {
        setTimerType("BREAK");
        setTimeLeft(5 * 60); // 5 minutes break
        setFocusTime(prev => prev + 25);
        // Save focus session
        saveFocusSession(25, "FOCUS");
      } else {
        setTimerType("FOCUS");
        setTimeLeft(25 * 60); // 25 minutes focus
        // Save break session
        saveFocusSession(5, "BREAK");
      }
    }
    
    return () => clearInterval(interval);
  }, [isTimerActive, timeLeft, timerType]);

  const saveFocusSession = async (duration: number, type: "FOCUS" | "BREAK") => {
    if (!userId) return;
    
    try {
      await fetch('/api/focus-sessions', {
        method: 'POST',
        headers: { 
          'Content-Type': 'application/json',
          'x-user-id': userId
        },
        body: JSON.stringify({ duration, type })
      });
      // Refresh stats
      const statsRes = await fetch('/api/stats', {
        headers: { 'x-user-id': userId }
      });
      if (statsRes.ok) {
        const statsData = await statsRes.json();
        setStats(statsData);
      }
    } catch (error) {
      console.error('Error saving focus session:', error);
    }
  };

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  const getGreeting = () => {
    const hour = new Date().getHours();
    if (hour < 12) return "Good Morning";
    if (hour < 18) return "Good Afternoon";
    return "Good Evening";
  };

  const addTask = async () => {
    if (!userId || !userName || !newTask.title.trim()) return;
    
    try {
      const response = await fetch('/api/tasks', {
        method: 'POST',
        headers: { 
          'Content-Type': 'application/json',
          'x-user-id': userId
        },
        body: JSON.stringify(newTask)
      });

      if (response.ok) {
        const task = await response.json();
        setTasks([...tasks, task]);
        setNewTask({ title: "", description: "", priority: "MEDIUM" });
        // Refresh stats
        fetchData();
      }
    } catch (error) {
      console.error('Error adding task:', error);
    }
  };

  const toggleTask = async (id: string) => {
    if (!userId || !userName) return;
    
    try {
      const task = tasks.find(t => t.id === id);
      if (task) {
        const response = await fetch(`/api/tasks/${id}`, {
          method: 'PUT',
          headers: { 
            'Content-Type': 'application/json',
            'x-user-id': userId
          },
          body: JSON.stringify({ ...task, completed: !task.completed })
        });

        if (response.ok) {
          setTasks(tasks.map(t => 
            t.id === id ? { ...t, completed: !t.completed } : t
          ));
          // Refresh stats
          fetchData();
        }
      }
    } catch (error) {
      console.error('Error toggling task:', error);
    }
  };

  const deleteTask = async (id: string) => {
    if (!userId || !userName) return;
    
    try {
      const response = await fetch(`/api/tasks/${id}`, {
        method: 'DELETE',
        headers: { 
          'x-user-id': userId
        }
      });

      if (response.ok) {
        setTasks(tasks.filter(task => task.id !== id));
        // Refresh stats
        fetchData();
      }
    } catch (error) {
      console.error('Error deleting task:', error);
    }
  };

  const addNote = async () => {
    if (!userId || !userName || !newNote.title.trim() || !newNote.content.trim()) return;
    
    try {
      const response = await fetch('/api/notes', {
        method: 'POST',
        headers: { 
          'Content-Type': 'application/json',
          'x-user-id': userId
        },
        body: JSON.stringify(newNote)
      });

      if (response.ok) {
        const note = await response.json();
        setNotes([...notes, note]);
        setNewNote({ title: "", content: "", tags: "" });
        // Refresh stats
        fetchData();
      }
    } catch (error) {
      console.error('Error adding note:', error);
    }
  };

  const deleteNote = async (id: string) => {
    if (!userId || !userName) return;
    
    try {
      const response = await fetch(`/api/notes/${id}`, {
        method: 'DELETE',
        headers: { 
          'x-user-id': userId
        }
      });

      if (response.ok) {
        setNotes(notes.filter(note => note.id !== id));
        // Refresh stats
        fetchData();
      }
    } catch (error) {
      console.error('Error deleting note:', error);
    }
  };

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case "HIGH": return "bg-red-500";
      case "MEDIUM": return "bg-yellow-500";
      case "LOW": return "bg-green-500";
      default: return "bg-gray-500";
    }
  };

  const getPriorityIcon = (priority: string) => {
    switch (priority) {
      case "HIGH": return <Flag className="h-3 w-3" />;
      case "MEDIUM": return <Flag className="h-3 w-3" />;
      case "LOW": return <Flag className="h-3 w-3" />;
      default: return <Flag className="h-3 w-3" />;
    }
  };

  const getAIResponse = async () => {
    if (!userId || !userName || !aiQuery.trim()) return;
    
    try {
      setAiLoading(true);
      const response = await fetch('/api/ai', {
        method: 'POST',
        headers: { 
          'Content-Type': 'application/json',
          'x-user-id': userId
        },
        body: JSON.stringify({ query: aiQuery })
      });

      if (response.ok) {
        const data = await response.json();
        setAiResponse(data.response);
      }
    } catch (error) {
      console.error('Error getting AI response:', error);
      setAiResponse("I'm sorry, I'm having trouble responding right now. Please try again later.");
    } finally {
      setAiLoading(false);
    }
  };

  // If user hasn't entered their name yet, show welcome screen
  if (!userName) {
    return <WelcomeScreen onNameSubmit={setUserName} />;
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br bg-background text-foreground p-4 md:p-8 flex items-center justify-center">
        <div className="text-center">
          <Loader2 className="h-12 w-12 animate-spin mx-auto mb-4 text-primary" />
          <p className="text-xl text-muted-foreground">Loading your productivity dashboard...</p>
        </div>
      </div>
    );
  }

  const completedTasks = tasks.filter(task => task.completed).length;
  const totalTasks = tasks.length;
  const colors = colorSchemes[colorScheme];

  return (
    <div className="min-h-screen bg-gradient-to-br bg-background text-foreground">
      {/* Background Pattern */}
      <div className="fixed inset-0 bg-black/20 backdrop-blur-sm dark:bg-black/40"></div>
      <div className="fixed inset-0 bg-[url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNjAiIGhlaWdodD0iNjAiIHZpZXdCb3g9IjAgMCA2MCA2MCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48ZyBmaWxsPSJub25lIiBmaWxsLXJ1bGU9ImV2ZW5vZGQiPjxnIGZpbGw9IiM5QzkyQUMiIGZpbGwtb3BhY2l0eT0iMC4xIj48cGF0aCBkPSJNMzYgMzR2LTRoLTJ2NGgtNHYyaDR2NGgydi00aDR2LTJoLTR6bTAtMzBWMGgtMnY0aC00djJoNHY0aDJWNmg0VjRoLTR6bTYgMzR2LTRINGg0djBIMnY0aDR2LTRINGg0djJINGgtNHY0aDQtNHYyaDR2LTRINGg0djJoNHY0aC00ek02IDRWMGgtNHY0SDB2Mmg0djRoMnYtNGg0VjZINGgtNHoiLz48L2c+PC9nPjwvc3ZnPg==')] opacity-30 dark:opacity-20"></div>
      
      <div className="relative z-10 max-w-7xl mx-auto p-4 md:p-8">
        {/* Header */}
        <div className="mb-12">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h1 className={`text-5xl md:text-6xl font-bold bg-gradient-to-r ${colors.primary} bg-clip-text text-transparent mb-2`}>
                {getGreeting()}, {userName} 👋
              </h1>
              <p className={`text-xl ${colors.accent}`}>
                {format(new Date(), "EEEE, MMMM d, yyyy")} • Let's make today productive
              </p>
            </div>
            <div className="flex items-center space-x-4">
              <div className="hidden md:block">
                <div className={`${colors.bgAccent} backdrop-blur-sm border ${colors.card} rounded-2xl p-4`}>
                  <div className={`text-2xl font-bold ${colors.accent}`}>
                    {format(new Date(), "HH:mm")}
                  </div>
                  <div className={`text-sm ${colors.accent}`}>Current Time</div>
                </div>
              </div>
              <div className="flex items-center space-x-2">
                <ColorSchemeSelector 
                  onColorChange={(scheme) => setColorScheme(scheme as keyof typeof colorSchemes)}
                  currentColor={colorScheme}
                />
                <ThemeToggle />
              </div>
            </div>
          </div>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-12">
          <Card className={`bg-background/10 backdrop-blur-md border ${colors.card} hover:bg-background/15 transition-all duration-300`}>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className={colors.accent}>Tasks Today</CardTitle>
              <Target className="h-5 w-5 text-primary" />
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold text-foreground">{totalTasks}</div>
              <p className={colors.accent}>{completedTasks} completed</p>
              <Progress value={totalTasks > 0 ? (completedTasks / totalTasks) * 100 : 0} className="mt-2 bg-primary/20" />
            </CardContent>
          </Card>

          <Card className={`bg-background/10 backdrop-blur-md border-blue-500/20 hover:bg-background/15 transition-all duration-300`}>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-blue-300">Focus Time</CardTitle>
              <Clock className="h-5 w-5 text-blue-400" />
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold text-foreground">{Math.floor(focusTime / 60)}h {focusTime % 60}m</div>
              <p className="text-blue-200 text-sm">Today's focus time</p>
            </CardContent>
          </Card>

          <Card className={`bg-background/10 backdrop-blur-md border-green-500/20 hover:bg-background/15 transition-all duration-300`}>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-green-300">Notes</CardTitle>
              <BookOpen className="h-5 w-5 text-green-400" />
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold text-foreground">{notes.length}</div>
              <p className="text-green-200 text-sm">Quick notes saved</p>
            </CardContent>
          </Card>
        </div>

        <Tabs defaultValue="tasks" className="space-y-8">
          <TabsList className="bg-black/30 backdrop-blur-md border border-white/20 p-1 w-full max-w-2xl mx-auto">
            <TabsTrigger value="tasks" className={`data-[state=active]:${colors.button} data-[state=active]:text-white ${colors.accent} hover:text-white hover:bg-primary/50 transition-all duration-200`}>
              <Target className="h-4 w-4 mr-2" />
              Tasks
            </TabsTrigger>
            <TabsTrigger value="notes" className="data-[state=active]:bg-blue-600 data-[state=active]:text-white text-blue-200 hover:text-white hover:bg-blue-600/50 transition-all duration-200">
              <BookOpen className="h-4 w-4 mr-2" />
              Notes
            </TabsTrigger>
            <TabsTrigger value="timer" className="data-[state=active]:bg-green-600 data-[state=active]:text-white text-green-200 hover:text-white hover:bg-green-600/50 transition-all duration-200">
              <Clock className="h-4 w-4 mr-2" />
              Focus Timer
            </TabsTrigger>
            <TabsTrigger value="ai" className="data-[state=active]:bg-pink-600 data-[state=active]:text-white text-pink-200 hover:text-white hover:bg-pink-600/50 transition-all duration-200">
              <Zap className="h-4 w-4 mr-2" />
              AI Assistant
            </TabsTrigger>
          </TabsList>

          {/* Tasks Tab */}
          <TabsContent value="tasks" className="space-y-6">
            <Card className={`bg-background/10 backdrop-blur-md border ${colors.card}`}>
              <CardHeader>
                <CardTitle className={colors.accent + " flex items-center"}>
                  <Plus className="h-5 w-5 mr-2" />
                  Add New Task
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <Input
                  placeholder="What needs to be done?"
                  value={newTask.title}
                  onChange={(e) => setNewTask({ ...newTask, title: e.target.value })}
                  className={`bg-background/10 border ${colors.card} text-foreground placeholder-muted-foreground focus:border-primary`}
                />
                <Textarea
                  placeholder="Add details (optional)"
                  value={newTask.description}
                  onChange={(e) => setNewTask({ ...newTask, description: e.target.value })}
                  className={`bg-background/10 border ${colors.card} text-foreground placeholder-muted-foreground focus:border-primary min-h-[80px]`}
                />
                <div className="flex gap-3">
                  <select
                    value={newTask.priority}
                    onChange={(e) => setNewTask({ ...newTask, priority: e.target.value as "LOW" | "MEDIUM" | "HIGH" })}
                    className={`bg-background/10 border ${colors.card} text-foreground px-4 py-2 rounded-lg focus:border-primary`}
                  >
                    <option value="LOW" className="bg-background">🟢 Low Priority</option>
                    <option value="MEDIUM" className="bg-background">🟡 Medium Priority</option>
                    <option value="HIGH" className="bg-background">🔴 High Priority</option>
                  </select>
                  <Button onClick={addTask} className={colors.button + " text-white"}>
                    <Plus className="h-4 w-4 mr-2" />
                    Add Task
                  </Button>
                </div>
              </CardContent>
            </Card>

            <div className="space-y-4">
              {tasks.map((task) => (
                <Card key={task.id} className="bg-background/5 backdrop-blur-md border-white/10 hover:bg-background/10 transition-all duration-200">
                  <CardContent className="p-4">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center space-x-4 flex-1">
                        <button
                          onClick={() => toggleTask(task.id)}
                          className={`flex-shrink-0 w-6 h-6 rounded-full border-2 flex items-center justify-center transition-all duration-200 ${
                            task.completed 
                              ? 'bg-green-500 border-green-500' 
                              : `border-primary hover:border-primary/80`
                          }`}
                        >
                          {task.completed && <Check className="h-4 w-4 text-white" />}
                        </button>
                        <div className="flex-1">
                          <h3 className={`font-medium transition-all duration-200 ${
                            task.completed ? "line-through text-muted-foreground" : "text-foreground"
                          }`}>
                            {task.title}
                          </h3>
                          {task.description && (
                            <p className="text-muted-foreground text-sm mt-1">{task.description}</p>
                          )}
                        </div>
                      </div>
                      <div className="flex items-center space-x-3">
                        <Badge className={`${getPriorityColor(task.priority)} text-white flex items-center space-x-1`}>
                          {getPriorityIcon(task.priority)}
                          <span>{task.priority}</span>
                        </Badge>
                        <button
                          onClick={() => deleteTask(task.id)}
                          className="text-red-400 hover:text-red-300 transition-colors duration-200"
                        >
                          <Trash2 className="h-4 w-4" />
                        </button>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
              
              {tasks.length === 0 && (
                <Card className="bg-background/5 backdrop-blur-md border-white/10">
                  <CardContent className="p-8 text-center">
                    <Target className="h-12 w-12 mx-auto mb-4 text-primary" />
                    <p className={colors.accent}>No tasks yet. Add your first task above!</p>
                  </CardContent>
                </Card>
              )}
            </div>
          </TabsContent>

          {/* Notes Tab */}
          <TabsContent value="notes" className="space-y-6">
            <Card className="bg-background/10 backdrop-blur-md border-blue-500/20">
              <CardHeader>
                <CardTitle className="text-blue-300 flex items-center">
                  <Plus className="h-5 w-5 mr-2" />
                  Add New Note
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <Input
                  placeholder="Note title"
                  value={newNote.title}
                  onChange={(e) => setNewNote({ ...newNote, title: e.target.value })}
                  className="bg-background/10 border-blue-500/30 text-foreground placeholder-blue-300 focus:border-blue-400"
                />
                <Textarea
                  placeholder="Write your thoughts..."
                  value={newNote.content}
                  onChange={(e) => setNewNote({ ...newNote, content: e.target.value })}
                  className="bg-background/10 border-blue-500/30 text-foreground placeholder-blue-300 focus:border-blue-400 min-h-[120px]"
                />
                <Input
                  placeholder="Tags (comma separated)"
                  value={newNote.tags}
                  onChange={(e) => setNewNote({ ...newNote, tags: e.target.value })}
                  className="bg-background/10 border-blue-500/30 text-foreground placeholder-blue-300 focus:border-blue-400"
                />
                <Button onClick={addNote} className="bg-blue-600 hover:bg-blue-500 text-white">
                  <Plus className="h-4 w-4 mr-2" />
                  Add Note
                </Button>
              </CardContent>
            </Card>

            <div className="space-y-4">
              {notes.map((note) => (
                <Card key={note.id} className="bg-background/5 backdrop-blur-md border-white/10 hover:bg-background/10 transition-all duration-200">
                  <CardHeader className="pb-2">
                    <div className="flex items-center justify-between">
                      <CardTitle className="text-foreground flex items-center">
                        <BookOpen className="h-4 w-4 mr-2 text-blue-400" />
                        {note.title}
                      </CardTitle>
                      <button
                        onClick={() => deleteNote(note.id)}
                        className="text-red-400 hover:text-red-300 transition-colors duration-200"
                      >
                        <Trash2 className="h-4 w-4" />
                      </button>
                    </div>
                  </CardHeader>
                  <CardContent>
                    <p className="text-muted-foreground mb-3 leading-relaxed">{note.content}</p>
                    {note.tags && (
                      <div className="flex gap-2 flex-wrap">
                        {note.tags.split(',').map((tag, index) => (
                          <Badge key={index} className="bg-blue-600/20 text-blue-300 border-blue-500/30">
                            <Tag className="h-3 w-3 mr-1" />
                            {tag.trim()}
                          </Badge>
                        ))}
                      </div>
                    )}
                  </CardContent>
                </Card>
              ))}
              
              {notes.length === 0 && (
                <Card className="bg-background/5 backdrop-blur-md border-white/10">
                  <CardContent className="p-8 text-center">
                    <BookOpen className="h-12 w-12 mx-auto mb-4 text-blue-400" />
                    <p className="text-blue-300">No notes yet. Create your first note above!</p>
                  </CardContent>
                </Card>
              )}
            </div>
          </TabsContent>

          {/* Timer Tab */}
          <TabsContent value="timer" className="space-y-6">
            <Card className="bg-background/10 backdrop-blur-md border-green-500/20">
              <CardHeader>
                <CardTitle className="text-green-300 text-center flex items-center justify-center">
                  <Clock className="h-6 w-6 mr-2" />
                  Focus Timer
                </CardTitle>
              </CardHeader>
              <CardContent className="text-center space-y-8">
                <div className="relative">
                  <div className="text-8xl font-mono font-bold text-foreground mb-4">
                    {formatTime(timeLeft)}
                  </div>
                  <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
                    <div className={`w-64 h-64 rounded-full border-4 ${
                      timerType === "FOCUS" ? "border-green-500/30" : "border-blue-500/30"
                    }`}></div>
                  </div>
                </div>
                
                <div className="space-y-3">
                  <Badge className={`${timerType === "FOCUS" ? "bg-green-600" : "bg-blue-600"} text-white text-lg px-4 py-2`}>
                    {timerType === "FOCUS" ? "🎯 Focus Time" : "☕ Break Time"}
                  </Badge>
                  <p className="text-muted-foreground text-lg">
                    {timerType === "FOCUS" ? "Stay focused and productive!" : "Take a well-deserved break!"}
                  </p>
                </div>

                <div className="flex justify-center space-x-6">
                  <Button
                    onClick={() => setIsTimerActive(!isTimerActive)}
                    className={`${isTimerActive ? "bg-red-600 hover:bg-red-500" : "bg-green-600 hover:bg-green-500"} text-white px-8 py-3 text-lg`}
                  >
                    {isTimerActive ? <Pause className="h-5 w-5 mr-2" /> : <Play className="h-5 w-5 mr-2" />}
                    {isTimerActive ? "Pause" : "Start"}
                  </Button>
                  <Button
                    onClick={() => {
                      setIsTimerActive(false);
                      setTimeLeft(25 * 60);
                      setTimerType("FOCUS");
                    }}
                    className="bg-muted hover:bg-muted-foreground text-foreground px-8 py-3 text-lg"
                  >
                    <RotateCcw className="h-5 w-5 mr-2" />
                    Reset
                  </Button>
                </div>

                <div className="bg-background/5 backdrop-blur-sm rounded-xl p-4">
                  <p className="text-muted-foreground">
                    Total focus time today: <span className="text-green-400 font-bold">{Math.floor(focusTime / 60)}h {focusTime % 60}m</span>
                  </p>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* AI Assistant Tab */}
          <TabsContent value="ai" className="space-y-6">
            <Card className="bg-background/10 backdrop-blur-md border-pink-500/20">
              <CardHeader>
                <CardTitle className="text-pink-300 flex items-center">
                  <Zap className="h-5 w-5 mr-2" />
                  AI Assistant
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="space-y-3">
                  <label className="text-pink-300 font-medium">What should I work on next?</label>
                  <div className="flex space-x-3">
                    <Input
                      placeholder="Ask AI for productivity advice..."
                      value={aiQuery}
                      onChange={(e) => setAiQuery(e.target.value)}
                      className="bg-background/10 border-pink-500/30 text-foreground placeholder-pink-300 focus:border-pink-400 flex-1"
                      onKeyPress={(e) => e.key === 'Enter' && getAIResponse()}
                    />
                    <Button 
                      onClick={getAIResponse}
                      disabled={aiLoading}
                      className="bg-pink-600 hover:bg-pink-500 text-white"
                    >
                      {aiLoading ? <Loader2 className="h-4 w-4 animate-spin" /> : <Zap className="h-4 w-4" />}
                    </Button>
                  </div>
                </div>

                {aiResponse && (
                  <Card className="bg-background/5 backdrop-blur-md border-pink-500/30">
                    <CardContent className="p-6">
                      <div className="flex items-start space-x-3">
                        <div className="w-8 h-8 bg-pink-600 rounded-full flex items-center justify-center flex-shrink-0">
                          <Zap className="h-4 w-4 text-white" />
                        </div>
                        <p className="text-muted-foreground leading-relaxed">{aiResponse}</p>
                      </div>
                    </CardContent>
                  </Card>
                )}

                <div className="space-y-3">
                  <h4 className="text-pink-300 font-medium">Quick Suggestions:</h4>
                  <div className="space-y-2">
                    <Button 
                      variant="outline" 
                      className="w-full justify-start bg-background/5 border-pink-500/30 text-pink-300 hover:bg-pink-600/20 hover:text-white transition-all duration-200"
                      onClick={() => {
                        setAiQuery("What's my most important task right now?");
                        setTimeout(getAIResponse, 100);
                      }}
                    >
                      🎯 What's my most important task right now?
                    </Button>
                    <Button 
                      variant="outline" 
                      className="w-full justify-start bg-background/5 border-pink-500/30 text-pink-300 hover:bg-pink-600/20 hover:text-white transition-all duration-200"
                      onClick={() => {
                        setAiQuery("Give me a productivity tip");
                        setTimeout(getAIResponse, 100);
                      }}
                    >
                      💡 Give me a productivity tip
                    </Button>
                    <Button 
                      variant="outline" 
                      className="w-full justify-start bg-background/5 border-pink-500/30 text-pink-300 hover:bg-pink-600/20 hover:text-white transition-all duration-200"
                      onClick={() => {
                        setAiQuery("How should I prioritize my tasks?");
                        setTimeout(getAIResponse, 100);
                      }}
                    >
                      📋 How should I prioritize my tasks?
                    </Button>
                  </div>
                </div>

                {/* AI Cost Explanation */}
                <div className="bg-background/5 backdrop-blur-md rounded-xl p-4 border border-white/10">
                  <h4 className="text-foreground font-medium mb-2">💰 About AI Usage</h4>
                  <p className="text-muted-foreground text-sm leading-relaxed">
                    This AI assistant uses the Z.ai SDK. Basic usage is free for testing and development. 
                    For production use, costs depend on the AI model and usage volume. 
                    You can monitor usage and set up billing in your Z.ai dashboard.
                  </p>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}