import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Trophy, Info, AlertCircle } from 'lucide-react';

const STORAGE_KEY = 'tissue_tournament_save';

export default function HomePage() {
  const [studentName, setStudentName] = useState('');
  const [hasSavedProgress, setHasSavedProgress] = useState(false);
  const [savedName, setSavedName] = useState('');
  const navigate = useNavigate();

  useEffect(() => {
    const savedStateJson = localStorage.getItem(STORAGE_KEY);
    if (savedStateJson) {
      try {
        const savedState = JSON.parse(savedStateJson);
        if (savedState.studentName) {
          setHasSavedProgress(true);
          setSavedName(savedState.studentName);
          setStudentName(savedState.studentName);
        }
      } catch (e) {
        console.error('Error reading saved state:', e);
      }
    }
  }, []);

  const handleStartTournament = () => {
    if (studentName.trim()) {
      sessionStorage.setItem('studentName', studentName.trim());
      navigate('/bracket');
    }
  };

  const handleContinue = () => {
    sessionStorage.setItem('studentName', savedName);
    navigate('/bracket');
  };

  return (
    <div className="min-h-screen bg-background">
      <header className="bg-primary text-primary-foreground py-8">
        <div className="container mx-auto px-4 text-center">
          <div className="flex items-center justify-center gap-3 mb-4">
            <Trophy className="h-12 w-12" />
            <h1 className="text-4xl md:text-5xl font-bold">The Tissue Tournament</h1>
            <Trophy className="h-12 w-12" />
          </div>
          <p className="text-xl md:text-2xl opacity-90">
            What's the most important tissue in the body? That's up to YOU to decide!
          </p>
        </div>
      </header>

      <main className="container mx-auto px-4 py-8 max-w-2xl">
        {hasSavedProgress && (
          <Card className="mb-6 border-2 border-green-500 bg-green-50">
            <CardContent className="pt-6">
              <div className="flex flex-col gap-4">
                <div className="flex items-center gap-3">
                  <div className="text-green-600 text-2xl">✅</div>
                  <div>
                    <p className="font-bold text-green-800">Welcome back, {savedName}!</p>
                    <p className="text-green-700 text-sm">You have saved progress from a previous session.</p>
                  </div>
                </div>
                <Button 
                  onClick={handleContinue}
                  className="w-full bg-green-600 hover:bg-green-700"
                  size="lg"
                >
                  Continue Where You Left Off
                </Button>
              </div>
            </CardContent>
          </Card>
        )}

        <Card className="mb-6 border-2 border-primary/30">
          <CardHeader className="pb-3">
            <CardTitle className="flex items-center gap-2 text-primary">
              <Info className="h-5 w-5" />
              How It Works
            </CardTitle>
          </CardHeader>
          <CardContent>
            <ol className="space-y-3 text-foreground">
              <li className="flex gap-3">
                <span className="flex-shrink-0 w-6 h-6 rounded-full bg-primary text-primary-foreground flex items-center justify-center text-sm font-bold">1</span>
                <span>Your bracket will start with 16 types of tissue in random match-ups.</span>
              </li>
              <li className="flex gap-3">
                <span className="flex-shrink-0 w-6 h-6 rounded-full bg-primary text-primary-foreground flex items-center justify-center text-sm font-bold">2</span>
                <span>For each match-up, you'll select one winner & briefly explain why you picked that tissue.</span>
              </li>
              <li className="flex gap-3">
                <span className="flex-shrink-0 w-6 h-6 rounded-full bg-primary text-primary-foreground flex items-center justify-center text-sm font-bold">3</span>
                <span>Your bracket will fill and the match ups will continue until only ONE tissue type remains... May the best tissue win!</span>
              </li>
            </ol>
          </CardContent>
        </Card>

        <Card className="mb-6 border-2 border-secondary/50">
          <CardHeader>
            <CardTitle className="text-center text-secondary">
              {hasSavedProgress ? 'Start a New Tournament' : 'Enter the Tournament'}
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div>
                <Label htmlFor="studentName" className="text-base">Your Name</Label>
                <Input
                  id="studentName"
                  type="text"
                  placeholder="Enter your name"
                  value={studentName}
                  onChange={(e: React.ChangeEvent<HTMLInputElement>) => setStudentName(e.target.value)}
                  className="mt-2"
                  onKeyDown={(e: React.KeyboardEvent) => e.key === 'Enter' && handleStartTournament()}
                />
              </div>
              <Button 
                onClick={handleStartTournament}
                disabled={!studentName.trim()}
                className="w-full text-lg py-6 bg-secondary hover:bg-secondary/90"
                size="lg"
              >
                <Trophy className="mr-2 h-5 w-5" />
                {hasSavedProgress ? 'Start Fresh' : 'Start Tournament'}
              </Button>
              {hasSavedProgress && (
                <p className="text-xs text-center text-muted-foreground">
                  Note: Starting fresh will erase your saved progress
                </p>
              )}
            </div>
          </CardContent>
        </Card>

        <Card className="bg-amber-50 border-2 border-amber-400">
          <CardContent className="pt-6">
            <div className="flex gap-3">
              <AlertCircle className="h-6 w-6 text-amber-600 flex-shrink-0 mt-0.5" />
              <p className="text-amber-800">
                <strong>Please Note:</strong> To get credit for completing this activity, you must upload your completed bracket & explanations to the "Final Exam Tissue Tournament Activity" dropbox in Canvas, so make sure you save it at the end!
              </p>
            </div>
          </CardContent>
        </Card>
      </main>

      <footer className="bg-muted py-4 mt-8">
        <div className="container mx-auto px-4 text-center text-muted-foreground text-sm">
          <p>Final Exam Tissue Tournament Activity</p>
        </div>
      </footer>
    </div>
  );
}
