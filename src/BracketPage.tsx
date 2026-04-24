import React, { useState, useEffect, useMemo, useRef, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Progress } from '@/components/ui/progress';
import { Trophy, Download, ArrowLeft, Check, AlertCircle, PartyPopper, Save } from 'lucide-react';
import { performStratifiedDraw, Tissue, getTissueCategoryColor } from '@/lib/tissueData';

interface Match {
  id: number;
  round: number;
  tissue1: Tissue | null;
  tissue2: Tissue | null;
  winner: Tissue | null;
  explanation: string;
}

interface SavedState {
  studentName: string;
  matches: Match[];
  completedRounds: number[];
  savedAt: string;
}

const STORAGE_KEY = 'tissue_tournament_save';

export default function BracketPage() {
  const navigate = useNavigate();
  const [studentName, setStudentName] = useState('');
  const [tissues, setTissues] = useState<Tissue[]>([]);
  const [matches, setMatches] = useState<Match[]>([]);
  const [selectedTissue, setSelectedTissue] = useState<Tissue | null>(null);
  const [explanation, setExplanation] = useState('');
  const [explanationError, setExplanationError] = useState('');
  const [isComplete, setIsComplete] = useState(false);
  const [showRoundCompletePopup, setShowRoundCompletePopup] = useState(false);
  const [completedRound, setCompletedRound] = useState(0);
  const [previouslyCompletedRounds, setPreviouslyCompletedRounds] = useState<number[]>([]);
  const [isGeneratingPDF, setIsGeneratingPDF] = useState(false);
  const [showSavedMessage, setShowSavedMessage] = useState(false);
  const [wasRestored, setWasRestored] = useState(false);
  const bracketRef = useRef<HTMLDivElement>(null);
  const [initialized, setInitialized] = useState(false);

  const boxWidth = 105;
  const boxHeight = 36;
  const bracketWidth = 22;
  const columnGap = 30;
  const matchHeight = 80;
  
  const col1 = 10;
  const col2 = col1 + boxWidth + bracketWidth;
  const col3 = col2 + boxWidth + columnGap;
  const col4 = col3 + bracketWidth + boxWidth + columnGap;
  const col5 = col4 + bracketWidth + boxWidth + columnGap + 40;
  const col6 = col5 + 160 + columnGap + 40;
  const col7 = col6 + boxWidth + bracketWidth + columnGap;
  const col8 = col7 + boxWidth + columnGap;
  const col9 = col8 + boxWidth + bracketWidth;
  
  const totalWidth = col9 + boxWidth + 10;

  const saveState = useCallback(() => {
    if (!studentName || matches.length === 0) return;
    
    const saveData: SavedState = {
      studentName,
      matches,
      completedRounds: previouslyCompletedRounds,
      savedAt: new Date().toISOString()
    };
    
    localStorage.setItem(STORAGE_KEY, JSON.stringify(saveData));
    setShowSavedMessage(true);
    setTimeout(() => setShowSavedMessage(false), 2000);
  }, [studentName, matches, previouslyCompletedRounds]);

  useEffect(() => {
    if (initialized && matches.some(m => m.winner !== null)) {
      const saveData: SavedState = {
        studentName,
        matches,
        completedRounds: previouslyCompletedRounds,
        savedAt: new Date().toISOString()
      };
      localStorage.setItem(STORAGE_KEY, JSON.stringify(saveData));
    }
  }, [matches, studentName, previouslyCompletedRounds, initialized]);

  const clearSavedState = useCallback(() => {
    localStorage.removeItem(STORAGE_KEY);
  }, []);

  useEffect(() => {
    if (initialized) return;
    
    const name = sessionStorage.getItem('studentName');
    if (!name) {
      navigate('/');
      return;
    }
    setStudentName(name);

    const savedStateJson = localStorage.getItem(STORAGE_KEY);
    if (savedStateJson) {
      try {
        const savedState: SavedState = JSON.parse(savedStateJson);
        if (savedState.studentName === name) {
          setMatches(savedState.matches);
          setPreviouslyCompletedRounds(savedState.completedRounds || []);
          setWasRestored(true);
          
          const championshipMatch = savedState.matches.find(m => m.id === 15);
          if (championshipMatch?.winner) {
            setIsComplete(true);
          }
          
          const savedTissues: Tissue[] = [];
          savedState.matches.filter(m => m.round === 1).forEach(m => {
            if (m.tissue1) savedTissues.push(m.tissue1);
            if (m.tissue2) savedTissues.push(m.tissue2);
          });
          setTissues(savedTissues);
          
          setInitialized(true);
          return;
        }
      } catch (e) {
        console.error('Error restoring saved state:', e);
        localStorage.removeItem(STORAGE_KEY);
      }
    }

    const drawnTissues = performStratifiedDraw();
    setTissues(drawnTissues);

    const initialMatches: Match[] = [];
    
    for (let i = 0; i < 8; i++) {
      initialMatches.push({
        id: i + 1,
        round: 1,
        tissue1: drawnTissues[i * 2],
        tissue2: drawnTissues[i * 2 + 1],
        winner: null,
        explanation: ''
      });
    }

    for (let i = 0; i < 4; i++) {
      initialMatches.push({
        id: i + 9,
        round: 2,
        tissue1: null,
        tissue2: null,
        winner: null,
        explanation: ''
      });
    }

    for (let i = 0; i < 2; i++) {
      initialMatches.push({
        id: i + 13,
        round: 3,
        tissue1: null,
        tissue2: null,
        winner: null,
        explanation: ''
      });
    }

    initialMatches.push({
      id: 15,
      round: 4,
      tissue1: null,
      tissue2: null,
      winner: null,
      explanation: ''
    });

    setMatches(initialMatches);
    setInitialized(true);
  }, [navigate, initialized]);

  const currentMatch = useMemo(() => {
    return matches.find((m: Match) => m.winner === null && m.tissue1 !== null && m.tissue2 !== null);
  }, [matches]);

  const wordCount = useMemo(() => {
    return explanation.trim().split(/\s+/).filter((w: string) => w.length > 0).length;
  }, [explanation]);

  const completedMatches = matches.filter((m: Match) => m.winner !== null).length;
  const progressPercent = (completedMatches / 15) * 100;

  const handleTissueSelect = (tissue: Tissue) => {
    setSelectedTissue(tissue);
    setExplanationError('');
  };

  const checkRoundComplete = (updatedMatches: Match[]) => {
    const round1Matches = updatedMatches.filter((m: Match) => m.round === 1);
    const round1Complete = round1Matches.every((m: Match) => m.winner !== null);
    if (round1Complete && !previouslyCompletedRounds.includes(1)) {
      setCompletedRound(1);
      setShowRoundCompletePopup(true);
      setPreviouslyCompletedRounds(prev => [...prev, 1]);
      return;
    }
    
    const round2Matches = updatedMatches.filter((m: Match) => m.round === 2);
    const round2Complete = round2Matches.every((m: Match) => m.winner !== null);
    if (round2Complete && !previouslyCompletedRounds.includes(2)) {
      setCompletedRound(2);
      setShowRoundCompletePopup(true);
      setPreviouslyCompletedRounds(prev => [...prev, 2]);
      return;
    }
    
    const round3Matches = updatedMatches.filter((m: Match) => m.round === 3);
    const round3Complete = round3Matches.every((m: Match) => m.winner !== null);
    if (round3Complete && !previouslyCompletedRounds.includes(3)) {
      setCompletedRound(3);
      setShowRoundCompletePopup(true);
      setPreviouslyCompletedRounds(prev => [...prev, 3]);
      return;
    }
  };

  const handleSubmitMatch = () => {
    if (!selectedTissue || !currentMatch) return;

    if (wordCount < 10) {
      setExplanationError('Please write at least 10 words explaining your choice.');
      return;
    }

    const updatedMatches = [...matches];
    const matchIndex = updatedMatches.findIndex((m: Match) => m.id === currentMatch.id);
    updatedMatches[matchIndex] = {
      ...updatedMatches[matchIndex],
      winner: selectedTissue,
      explanation: explanation
    };

    const currentMatchId = currentMatch.id;
    let nextMatchId: number | null = null;
    let isFirstInPair = false;

    if (currentMatchId <= 8) {
      nextMatchId = 9 + Math.floor((currentMatchId - 1) / 2);
      isFirstInPair = (currentMatchId - 1) % 2 === 0;
    } else if (currentMatchId <= 12) {
      nextMatchId = 13 + Math.floor((currentMatchId - 9) / 2);
      isFirstInPair = (currentMatchId - 9) % 2 === 0;
    } else if (currentMatchId <= 14) {
      nextMatchId = 15;
      isFirstInPair = currentMatchId === 13;
    }

    if (nextMatchId !== null) {
      const nextMatchIndex = updatedMatches.findIndex((m: Match) => m.id === nextMatchId);
      if (nextMatchIndex !== -1) {
        if (isFirstInPair) {
          updatedMatches[nextMatchIndex].tissue1 = selectedTissue;
        } else {
          updatedMatches[nextMatchIndex].tissue2 = selectedTissue;
        }
      }
    }

    setMatches(updatedMatches);
    setSelectedTissue(null);
    setExplanation('');
    setExplanationError('');

    if (currentMatchId === 15) {
      setIsComplete(true);
    } else {
      checkRoundComplete(updatedMatches);
    }
  };

  const getRoundName = (round: number) => {
    switch (round) {
      case 1: return 'The Original 16';
      case 2: return 'Elite 8';
      case 3: return 'Final 4';
      case 4: return 'Championship';
      default: return `Round ${round}`;
    }
  };

  const handleStartOver = () => {
    if (confirm('Are you sure you want to start over? This will erase all your progress.')) {
      clearSavedState();
      sessionStorage.removeItem('studentName');
      navigate('/');
    }
  };
  const generateAndDownloadPDF = useCallback(async () => {
    setIsGeneratingPDF(true);

    try {
      const champion = matches.find((m: Match) => m.id === 15)?.winner;
      const roundNames = ['The Original 16', 'Elite 8', 'Final 4', 'Championship'];

      let explanationsHtml = '';
      for (let round = 1; round <= 4; round++) {
        const roundMatches = matches.filter(m => m.round === round && m.winner);
        if (roundMatches.length > 0) {
          explanationsHtml += `<h3 style="color: #166534; border-bottom: 2px solid #166534; padding-bottom: 5px; margin-top: 20px;">${roundNames[round - 1]}</h3>`;
          roundMatches.forEach(match => {
            explanationsHtml += `
              <div style="margin: 10px 0; padding-left: 15px;">
                <p style="margin: 5px 0;"><strong>Match ${match.id}:</strong> ${match.tissue1?.name} vs ${match.tissue2?.name}</p>
                <p style="margin: 5px 0; color: #166534;"><strong>Winner:</strong> ${match.winner?.name}</p>
                <p style="margin: 5px 0; color: #4b5563;"><strong>Explanation:</strong> ${match.explanation}</p>
              </div>
            `;
          });
        }
      }

      const svgWidth = 1500;
      const svgHeight = 650;
      const pdfBoxWidth = 100;
      const pdfBoxHeight = 32;
      const pdfBracketWidth = 20;
      const pdfColGap = 25;
      const pdfMatchHeight = 72;
      
      const pdfCol1 = 15;
      const pdfCol2 = pdfCol1 + pdfBoxWidth + pdfBracketWidth;
      const pdfCol3 = pdfCol2 + pdfBoxWidth + pdfColGap;
      const pdfCol4 = pdfCol3 + pdfBracketWidth + pdfBoxWidth + pdfColGap;
      const pdfCol5 = svgWidth / 2 - 70;
      const pdfCol6 = svgWidth - pdfCol4 - pdfBoxWidth;
      const pdfCol7 = svgWidth - pdfCol3 - pdfBracketWidth;
      const pdfCol8 = svgWidth - pdfCol2 - pdfBoxWidth;
      const pdfCol9 = svgWidth - pdfCol1 - pdfBoxWidth;
      
      const wrapText = (text: string, maxChars: number = 16): string[] => {
        if (text.length <= maxChars) return [text];
        const words = text.split(' ');
        let line1 = '';
        let line2 = '';
        for (const word of words) {
          if ((line1 + ' ' + word).trim().length <= maxChars) {
            line1 = (line1 + ' ' + word).trim();
          } else {
            line2 = (line2 + ' ' + word).trim();
          }
        }
        return [line1, line2];
      };
      
      const getTissueBoxSVG = (tissue: Tissue | null, x: number, y: number, isWinner: boolean) => {
        if (tissue) {
          const colors = getTissueCategoryColor(tissue.category);
          const lines = wrapText(tissue.name);
          const textY1 = lines.length === 1 ? y + 20 : y + 13;
          const textY2 = y + 26;
          return `
            <rect x="${x}" y="${y}" width="${pdfBoxWidth}" height="${pdfBoxHeight}" rx="4" 
                  fill="${colors.bg}" stroke="${isWinner ? '#ca8a04' : colors.border}" stroke-width="${isWinner ? 2 : 1}"/>
            <text x="${x + pdfBoxWidth/2}" y="${textY1}" font-size="8" font-family="Arial" fill="${colors.text}" text-anchor="middle">${lines[0]}</text>
            ${lines[1] ? `<text x="${x + pdfBoxWidth/2}" y="${textY2}" font-size="8" font-family="Arial" fill="${colors.text}" text-anchor="middle">${lines[1]}</text>` : ''}
          `;
        } else {
          return `
            <rect x="${x}" y="${y}" width="${pdfBoxWidth}" height="${pdfBoxHeight}" rx="4" 
                  fill="#f1f5f9" stroke="#cbd5e1" stroke-width="1" stroke-dasharray="3,2"/>
            <text x="${x + pdfBoxWidth/2}" y="${y + 20}" font-size="8" font-family="Arial" fill="#94a3b8" text-anchor="middle">TBD</text>
          `;
        }
      };

      let svgContent = `<svg xmlns="http://www.w3.org/2000/svg" width="${svgWidth}" height="${svgHeight}" viewBox="0 0 ${svgWidth} ${svgHeight}">`;
      svgContent += `<rect width="${svgWidth}" height="${svgHeight}" fill="white"/>`;
      
      svgContent += `<text x="${svgWidth/2}" y="22" font-size="16" font-family="Arial" font-weight="bold" fill="#166534" text-anchor="middle">${studentName}'s Tissue Tournament Bracket</text>`;

      const labelY = 42;
      svgContent += `<text x="${pdfCol1 + pdfBoxWidth}" y="${labelY}" font-size="10" font-family="Arial" font-weight="bold" fill="#166534" text-anchor="middle">The Original 16</text>`;
      svgContent += `<text x="${pdfCol3 + pdfBracketWidth + pdfBoxWidth/2}" y="${labelY}" font-size="10" font-family="Arial" font-weight="bold" fill="#166534" text-anchor="middle">The Elite 8</text>`;
      svgContent += `<text x="${pdfCol4 + pdfBracketWidth + pdfBoxWidth/2}" y="${labelY}" font-size="10" font-family="Arial" font-weight="bold" fill="#166534" text-anchor="middle">The Final 4</text>`;
      svgContent += `<text x="${svgWidth/2}" y="${labelY}" font-size="11" font-family="Arial" font-weight="bold" fill="#ca8a04" text-anchor="middle">The Final Match</text>`;
      svgContent += `<text x="${pdfCol6 + pdfBoxWidth/2}" y="${labelY}" font-size="10" font-family="Arial" font-weight="bold" fill="#166534" text-anchor="middle">The Final 4</text>`;
      svgContent += `<text x="${pdfCol7 + pdfBoxWidth/2}" y="${labelY}" font-size="10" font-family="Arial" font-weight="bold" fill="#166534" text-anchor="middle">The Elite 8</text>`;
      svgContent += `<text x="${pdfCol9 + pdfBoxWidth/2}" y="${labelY}" font-size="10" font-family="Arial" font-weight="bold" fill="#166534" text-anchor="middle">The Original 16</text>`;

      const startY = 55;

      for (let i = 0; i < 4; i++) {
        const match = matches.find(m => m.id === i + 1);
        if (match) {
          const y1 = startY + (i * pdfMatchHeight);
          const y2 = y1 + pdfBoxHeight + 4;
          const midY = y1 + pdfBoxHeight + 2;
          
          svgContent += getTissueBoxSVG(match.tissue1, pdfCol1, y1, match.winner?.name === match.tissue1?.name);
          svgContent += getTissueBoxSVG(match.tissue2, pdfCol1, y2, match.winner?.name === match.tissue2?.name);
          
          const bx = pdfCol1 + pdfBoxWidth;
          svgContent += `<path d="M${bx} ${y1 + pdfBoxHeight/2} L${bx + 8} ${y1 + pdfBoxHeight/2} L${bx + 8} ${y2 + pdfBoxHeight/2} L${bx} ${y2 + pdfBoxHeight/2}" fill="none" stroke="#6b7280" stroke-width="1.5"/>`;
          svgContent += `<line x1="${bx + 8}" y1="${midY}" x2="${pdfCol2}" y2="${midY}" stroke="#6b7280" stroke-width="1.5"/>`;
          
          svgContent += getTissueBoxSVG(match.winner, pdfCol2, midY - pdfBoxHeight/2, false);
        }
      }

      for (let i = 0; i < 2; i++) {
        const match = matches.find(m => m.id === i + 9);
        if (match) {
          const sourceY1 = startY + (i * 2 * pdfMatchHeight) + pdfBoxHeight + 2;
          const sourceY2 = startY + ((i * 2 + 1) * pdfMatchHeight) + pdfBoxHeight + 2;
          const midY = (sourceY1 + sourceY2) / 2;
          
          const bx = pdfCol2 + pdfBoxWidth;
          svgContent += `<path d="M${bx} ${sourceY1} L${bx + 8} ${sourceY1} L${bx + 8} ${sourceY2} L${bx} ${sourceY2}" fill="none" stroke="#6b7280" stroke-width="1.5"/>`;
          svgContent += `<line x1="${bx + 8}" y1="${midY}" x2="${pdfCol3 + pdfBracketWidth}" y2="${midY}" stroke="#6b7280" stroke-width="1.5"/>`;
          
          svgContent += getTissueBoxSVG(match.winner, pdfCol3 + pdfBracketWidth, midY - pdfBoxHeight/2, false);
        }
      }

      const match13 = matches.find(m => m.id === 13);
      if (match13) {
        const sourceY1 = startY + pdfMatchHeight + 2;
        const sourceY2 = startY + (3 * pdfMatchHeight) + 2;
        const midY = (sourceY1 + sourceY2) / 2;
        
        const bx = pdfCol3 + pdfBracketWidth + pdfBoxWidth;
        svgContent += `<path d="M${bx} ${sourceY1} L${bx + 8} ${sourceY1} L${bx + 8} ${sourceY2} L${bx} ${sourceY2}" fill="none" stroke="#6b7280" stroke-width="1.5"/>`;
        svgContent += `<line x1="${bx + 8}" y1="${midY}" x2="${pdfCol4 + pdfBracketWidth}" y2="${midY}" stroke="#6b7280" stroke-width="1.5"/>`;
        
        svgContent += getTissueBoxSVG(match13.winner, pdfCol4 + pdfBracketWidth, midY - pdfBoxHeight/2, false);
      }

      for (let i = 0; i < 4; i++) {
        const match = matches.find(m => m.id === i + 5);
        if (match) {
          const y1 = startY + (i * pdfMatchHeight);
          const y2 = y1 + pdfBoxHeight + 4;
          const midY = y1 + pdfBoxHeight + 2;
          
          svgContent += getTissueBoxSVG(match.tissue1, pdfCol9, y1, match.winner?.name === match.tissue1?.name);
          svgContent += getTissueBoxSVG(match.tissue2, pdfCol9, y2, match.winner?.name === match.tissue2?.name);
          
          const bx = pdfCol9;
          svgContent += `<path d="M${bx} ${y1 + pdfBoxHeight/2} L${bx - 8} ${y1 + pdfBoxHeight/2} L${bx - 8} ${y2 + pdfBoxHeight/2} L${bx} ${y2 + pdfBoxHeight/2}" fill="none" stroke="#6b7280" stroke-width="1.5"/>`;
          svgContent += `<line x1="${bx - 8}" y1="${midY}" x2="${pdfCol8 + pdfBoxWidth}" y2="${midY}" stroke="#6b7280" stroke-width="1.5"/>`;
          
          svgContent += getTissueBoxSVG(match.winner, pdfCol8, midY - pdfBoxHeight/2, false);
        }
      }

      for (let i = 0; i < 2; i++) {
        const match = matches.find(m => m.id === i + 11);
        if (match) {
          const sourceY1 = startY + (i * 2 * pdfMatchHeight) + pdfBoxHeight + 2;
          const sourceY2 = startY + ((i * 2 + 1) * pdfMatchHeight) + pdfBoxHeight + 2;
          const midY = (sourceY1 + sourceY2) / 2;
          
          const bx = pdfCol8;
          svgContent += `<path d="M${bx} ${sourceY1} L${bx - 8} ${sourceY1} L${bx - 8} ${sourceY2} L${bx} ${sourceY2}" fill="none" stroke="#6b7280" stroke-width="1.5"/>`;
          svgContent += `<line x1="${bx - 8}" y1="${midY}" x2="${pdfCol7 + pdfBoxWidth}" y2="${midY}" stroke="#6b7280" stroke-width="1.5"/>`;
          
          svgContent += getTissueBoxSVG(match.winner, pdfCol7, midY - pdfBoxHeight/2, false);
        }
      }

      const match14 = matches.find(m => m.id === 14);
      if (match14) {
        const sourceY1 = startY + pdfMatchHeight + 2;
        const sourceY2 = startY + (3 * pdfMatchHeight) + 2;
        const midY = (sourceY1 + sourceY2) / 2;
        
        const bx = pdfCol7;
        svgContent += `<path d="M${bx} ${sourceY1} L${bx - 8} ${sourceY1} L${bx - 8} ${sourceY2} L${bx} ${sourceY2}" fill="none" stroke="#6b7280" stroke-width="1.5"/>`;
        svgContent += `<line x1="${bx - 8}" y1="${midY}" x2="${pdfCol6 + pdfBoxWidth}" y2="${midY}" stroke="#6b7280" stroke-width="1.5"/>`;
        
        svgContent += getTissueBoxSVG(match14.winner, pdfCol6, midY - pdfBoxHeight/2, false);
      }

      const match15 = matches.find(m => m.id === 15);
      const champMidY = startY + (2 * pdfMatchHeight);
      if (match15) {
        svgContent += `<line x1="${pdfCol4 + pdfBracketWidth + pdfBoxWidth}" y1="${champMidY}" x2="${pdfCol5}" y2="${champMidY}" stroke="#6b7280" stroke-width="1.5"/>`;
        svgContent += `<line x1="${pdfCol6}" y1="${champMidY}" x2="${pdfCol5 + 140}" y2="${champMidY}" stroke="#6b7280" stroke-width="1.5"/>`;
        
        if (match15.winner) {
          const colors = getTissueCategoryColor(match15.winner.category);
          const lines = wrapText(match15.winner.name);
          svgContent += `<rect x="${pdfCol5}" y="${champMidY - 30}" width="140" height="60" rx="6" fill="#fef3c7" stroke="#ca8a04" stroke-width="2"/>`;
          svgContent += `<text x="${pdfCol5 + 70}" y="${champMidY - 10}" font-size="10" font-family="Arial" font-weight="bold" fill="#ca8a04" text-anchor="middle">🏆 CHAMPION 🏆</text>`;
          svgContent += `<text x="${pdfCol5 + 70}" y="${champMidY + 8}" font-size="9" font-family="Arial" font-weight="bold" fill="${colors.text}" text-anchor="middle">${lines[0]}</text>`;
          if (lines[1]) {
            svgContent += `<text x="${pdfCol5 + 70}" y="${champMidY + 22}" font-size="9" font-family="Arial" font-weight="bold" fill="${colors.text}" text-anchor="middle">${lines[1]}</text>`;
          }
        } else {
          svgContent += `<rect x="${pdfCol5}" y="${champMidY - 20}" width="140" height="40" rx="4" fill="#fef3c7" stroke="#ca8a04" stroke-width="1.5" stroke-dasharray="3,2"/>`;
          svgContent += `<text x="${pdfCol5 + 70}" y="${champMidY + 5}" font-size="9" font-family="Arial" fill="#ca8a04" text-anchor="middle">Champion TBD</text>`;
        }
      }

      const legendY = svgHeight - 25;
      const legendItems = [
        { label: 'Epithelial', category: 'epithelial' },
        { label: 'Connective', category: 'connective' },
        { label: 'Muscle', category: 'muscle' },
        { label: 'Nervous', category: 'nervous' }
      ];
      let legendX = svgWidth/2 - 150;
      legendItems.forEach(item => {
        const colors = getTissueCategoryColor(item.category);
        svgContent += `<rect x="${legendX}" y="${legendY}" width="14" height="14" rx="2" fill="${colors.bg}" stroke="${colors.border}" stroke-width="1"/>`;
        svgContent += `<text x="${legendX + 18}" y="${legendY + 11}" font-size="10" font-family="Arial" fill="#374151">${item.label}</text>`;
        legendX += 80;
      });

      svgContent += '</svg>';

      const printWindow = window.open('', '_blank');
      if (!printWindow) {
        throw new Error('Could not open print window. Please allow popups.');
      }

      printWindow.document.write(`
        <!DOCTYPE html>
        <html>
        <head>
          <title>${studentName}'s Tissue Tournament Results</title>
          <style>
            @page { size: landscape; margin: 0.3in; }
            @media print {
              body { -webkit-print-color-adjust: exact; print-color-adjust: exact; }
              .page-break { page-break-before: always; }
            }
            body { font-family: Arial, sans-serif; margin: 0; padding: 10px; }
            h1 { color: #166534; text-align: center; margin-bottom: 5px; font-size: 18px; }
            h2 { color: #4b5563; text-align: center; margin-top: 5px; font-size: 14px; }
            .champion { color: #ca8a04; text-align: center; font-size: 1.2em; font-weight: bold; margin: 10px 0; }
            .bracket-container { width: 100%; text-align: center; margin: 5px 0; }
            .bracket-container svg { max-width: 100%; height: auto; }
            .explanations-section { margin-top: 15px; }
          </style>
        </head>
        <body>
          <h1>${studentName}'s Bracket</h1>
          <h2>Final Exam Tissue Tournament Activity</h2>
          ${champion ? `<p class="champion">🏆 CHAMPION: ${champion.name} 🏆</p>` : ''}
          
          <div class="bracket-container">
            ${svgContent}
          </div>
          
          <div class="page-break"></div>
          
          <div class="explanations-section">
            <h2 style="color: #166534; text-align: center;">Match Results & Explanations</h2>
            ${explanationsHtml}
          </div>
          
          <script>
            window.onload = function() {
              setTimeout(function() {
                window.print();
              }, 500);
            };
          <\/script>
        </body>
        </html>
      `);
      
      printWindow.document.close();
      clearSavedState();

    } catch (error) {
      console.error('Error generating PDF:', error);
      alert('There was an error generating the PDF. Please try again.');
    } finally {
      setIsGeneratingPDF(false);
    }
  }, [matches, studentName, clearSavedState]);

  const TissueSlot = ({ tissue, isWinner }: { tissue: Tissue | null; isWinner?: boolean }) => {
    if (!tissue) {
      return (
        <div 
          className="px-1.5 py-1 border border-dashed border-gray-300 rounded flex items-center justify-center text-[9px] text-gray-400 bg-gray-50 text-center"
          style={{ width: boxWidth, height: boxHeight }}
        >
          TBD
        </div>
      );
    }

    const colors = getTissueCategoryColor(tissue.category);
    
    return (
      <div 
        className={`px-1.5 py-1 border rounded flex items-center justify-center text-[9px] font-medium text-center leading-tight ${
          isWinner ? 'ring-2 ring-yellow-500' : ''
        }`}
        style={{ 
          backgroundColor: colors.bg, 
          borderColor: colors.border,
          color: colors.text,
          width: boxWidth,
          height: boxHeight
        }}
        title={tissue.name}
      >
        <span className="line-clamp-2">{tissue.name}</span>
      </div>
    );
  };

  const MatchLeft = ({ match, top }: { match: Match; top: number }) => {
    const isCurrent = currentMatch?.id === match.id && !showRoundCompletePopup;
    const totalHeight = boxHeight * 2 + 4;
    const midY = totalHeight / 2;
    
    return (
      <div className="absolute flex items-center" style={{ left: col1, top }}>
        <div className={`flex flex-col gap-1 ${isCurrent ? 'bg-yellow-100 ring-2 ring-yellow-500 rounded p-0.5' : ''}`}>
          <TissueSlot tissue={match.tissue1} isWinner={match.winner?.name === match.tissue1?.name} />
          <TissueSlot tissue={match.tissue2} isWinner={match.winner?.name === match.tissue2?.name} />
        </div>
        <svg width={bracketWidth} height={totalHeight} className="flex-shrink-0">
          <path d={`M0 ${boxHeight/2} L8 ${boxHeight/2} L8 ${totalHeight - boxHeight/2} L0 ${totalHeight - boxHeight/2}`} fill="none" stroke="#6b7280" strokeWidth="1.5"/>
          <line x1="8" y1={midY} x2={bracketWidth} y2={midY} stroke="#6b7280" strokeWidth="1.5"/>
        </svg>
        <TissueSlot tissue={match.winner} />
      </div>
    );
  };

  const MatchRight = ({ match, top }: { match: Match; top: number }) => {
    const isCurrent = currentMatch?.id === match.id && !showRoundCompletePopup;
    const totalHeight = boxHeight * 2 + 4;
    const midY = totalHeight / 2;
    
    return (
      <div className="absolute flex items-center" style={{ right: col1, top }}>
        <TissueSlot tissue={match.winner} />
        <svg width={bracketWidth} height={totalHeight} className="flex-shrink-0">
          <line x1="0" y1={midY} x2="14" y2={midY} stroke="#6b7280" strokeWidth="1.5"/>
          <path d={`M${bracketWidth} ${boxHeight/2} L14 ${boxHeight/2} L14 ${totalHeight - boxHeight/2} L${bracketWidth} ${totalHeight - boxHeight/2}`} fill="none" stroke="#6b7280" strokeWidth="1.5"/>
        </svg>
        <div className={`flex flex-col gap-1 ${isCurrent ? 'bg-yellow-100 ring-2 ring-yellow-500 rounded p-0.5' : ''}`}>
          <TissueSlot tissue={match.tissue1} isWinner={match.winner?.name === match.tissue1?.name} />
          <TissueSlot tissue={match.tissue2} isWinner={match.winner?.name === match.tissue2?.name} />
        </div>
      </div>
    );
  };

  const round1Left = matches.filter((m: Match) => m.id >= 1 && m.id <= 4);
  const round1Right = matches.filter((m: Match) => m.id >= 5 && m.id <= 8);
  const elite8Left = matches.filter((m: Match) => m.id >= 9 && m.id <= 10);
  const elite8Right = matches.filter((m: Match) => m.id >= 11 && m.id <= 12);
  const final4Left = matches.find((m: Match) => m.id === 13);
  const final4Right = matches.find((m: Match) => m.id === 14);
  const championship = matches.find((m: Match) => m.id === 15);

  if (tissues.length === 0 && !initialized) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="animate-pulse text-lg">Loading tournament...</div>
      </div>
    );
  }

  const headerHeight = 25;
  const round1Tops = [headerHeight, headerHeight + matchHeight, headerHeight + matchHeight * 2, headerHeight + matchHeight * 3];
  const elite8MidY1 = (round1Tops[0] + boxHeight + 2 + round1Tops[1] + boxHeight + 2) / 2;
  const elite8MidY2 = (round1Tops[2] + boxHeight + 2 + round1Tops[3] + boxHeight + 2) / 2;
  const final4MidY = (elite8MidY1 + elite8MidY2) / 2;
  return (
    <div className="min-h-screen bg-background">
      {wasRestored && (
        <div className="bg-green-100 border-b border-green-300 py-2 px-4 text-center text-green-800 text-sm">
          ✅ Your progress has been restored! You can continue where you left off.
        </div>
      )}
      
      {showSavedMessage && (
        <div className="fixed top-20 right-4 bg-green-600 text-white px-4 py-2 rounded-lg shadow-lg z-50 animate-in fade-in slide-in-from-top-2">
          <div className="flex items-center gap-2">
            <Save className="h-4 w-4" />
            Progress saved!
          </div>
        </div>
      )}

      {showRoundCompletePopup && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 animate-in fade-in duration-300">
          <div className="bg-card rounded-xl shadow-2xl p-8 max-w-md mx-4 text-center animate-in zoom-in-95 duration-300">
            <div className="flex justify-center mb-4">
              <PartyPopper className="h-16 w-16 text-secondary" />
            </div>
            <h2 className="text-2xl font-bold text-foreground mb-2">
              Round #{completedRound} is Complete!
            </h2>
            <p className="text-muted-foreground mb-6">
              Great job! You've finished {getRoundName(completedRound)}. 
              {completedRound < 3 ? ` Time to move on to the ${getRoundName(completedRound + 1)}!` : ' Only the Championship remains!'}
            </p>
            <Button 
              onClick={() => setShowRoundCompletePopup(false)}
              className="bg-secondary hover:bg-secondary/90 text-secondary-foreground px-8 py-3 text-lg"
              size="lg"
            >
              Let's Review the Bracket!
            </Button>
          </div>
        </div>
      )}

      <header className="bg-primary text-primary-foreground py-4 sticky top-0 z-10 print:hidden">
        <div className="container mx-auto px-4">
          <div className="flex items-center justify-between">
            <Button 
              variant="ghost" 
              onClick={handleStartOver}
              className="text-primary-foreground hover:bg-primary-foreground/20"
            >
              <ArrowLeft className="mr-2 h-4 w-4" />
              Start Over
            </Button>
            <div className="text-center">
              <h1 className="text-xl font-bold flex items-center gap-2">
                <Trophy className="h-5 w-5" />
                {studentName}'s Bracket
              </h1>
            </div>
            <Button 
              variant="ghost" 
              onClick={saveState}
              className="text-primary-foreground hover:bg-primary-foreground/20"
            >
              <Save className="mr-2 h-4 w-4" />
              Save
            </Button>
          </div>
        </div>
      </header>

      <div className="bg-card border-b print:hidden">
        <div className="container mx-auto px-4 py-3">
          <div className="flex items-center gap-4">
            <span className="text-sm font-medium">Progress:</span>
            <Progress value={progressPercent} className="flex-1" />
            <span className="text-sm text-muted-foreground">{completedMatches}/15 matches</span>
          </div>
        </div>
      </div>

      <main className="container mx-auto px-4 py-6">
        <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">
          <div className="xl:col-span-2">
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-lg">Tournament Bracket</CardTitle>
              </CardHeader>
              <CardContent className="overflow-x-auto">
                <div ref={bracketRef} className="bg-white p-4 relative" style={{ width: totalWidth, height: matchHeight * 4 + headerHeight + 40 }}>
                  
                  <div className="absolute text-[10px] font-bold text-primary text-center" style={{ left: col1, top: 0, width: boxWidth * 2 + bracketWidth }}>The Original 16</div>
                  <div className="absolute text-[10px] font-bold text-primary text-center" style={{ left: col3, top: 0, width: boxWidth + bracketWidth }}>The Elite 8</div>
                  <div className="absolute text-[10px] font-bold text-primary text-center" style={{ left: col4, top: 0, width: boxWidth + bracketWidth }}>The Final 4</div>
                  <div className="absolute text-[10px] font-bold text-amber-600 text-center" style={{ left: col5, top: 0, width: 160 }}>The Final Match</div>
                  <div className="absolute text-[10px] font-bold text-primary text-center" style={{ left: col6 - bracketWidth, top: 0, width: boxWidth + bracketWidth }}>The Final 4</div>
                  <div className="absolute text-[10px] font-bold text-primary text-center" style={{ left: col7 - bracketWidth, top: 0, width: boxWidth + bracketWidth }}>The Elite 8</div>
                  <div className="absolute text-[10px] font-bold text-primary text-center" style={{ right: col1, top: 0, width: boxWidth * 2 + bracketWidth }}>The Original 16</div>
                  
                  {round1Left.map((match, idx) => (
                    <MatchLeft key={match.id} match={match} top={round1Tops[idx]} />
                  ))}
                  
                  {elite8Left.map((match, idx) => {
                    const isCurrent = currentMatch?.id === match.id && !showRoundCompletePopup;
                    const sourceY1 = round1Tops[idx * 2] + boxHeight + 2;
                    const sourceY2 = round1Tops[idx * 2 + 1] + boxHeight + 2;
                    const bracketHeightCalc = sourceY2 - sourceY1;
                    
                    return (
                      <div key={match.id} className="absolute" style={{ left: col3, top: sourceY1 - boxHeight/2 }}>
                        <svg width={bracketWidth} height={bracketHeightCalc + boxHeight} className="flex-shrink-0">
                          <path d={`M0 ${boxHeight/2} L8 ${boxHeight/2} L8 ${bracketHeightCalc + boxHeight/2} L0 ${bracketHeightCalc + boxHeight/2}`} fill="none" stroke="#6b7280" strokeWidth="1.5"/>
                          <line x1="8" y1={(bracketHeightCalc + boxHeight) / 2} x2={bracketWidth} y2={(bracketHeightCalc + boxHeight) / 2} stroke="#6b7280" strokeWidth="1.5"/>
                        </svg>
                        <div className={`absolute ${isCurrent ? 'bg-yellow-100 ring-2 ring-yellow-500 rounded p-0.5' : ''}`} style={{ left: bracketWidth, top: (bracketHeightCalc + boxHeight) / 2 - boxHeight / 2 }}>
                          <TissueSlot tissue={match.winner} />
                        </div>
                      </div>
                    );
                  })}
                  
                  {final4Left && (() => {
                    const isCurrent = currentMatch?.id === 13 && !showRoundCompletePopup;
                    const bracketHeightCalc = elite8MidY2 - elite8MidY1;
                    
                    return (
                      <div className="absolute" style={{ left: col4, top: elite8MidY1 - boxHeight/2 }}>
                        <svg width={bracketWidth} height={bracketHeightCalc + boxHeight} className="flex-shrink-0">
                          <path d={`M0 ${boxHeight/2} L8 ${boxHeight/2} L8 ${bracketHeightCalc + boxHeight/2} L0 ${bracketHeightCalc + boxHeight/2}`} fill="none" stroke="#6b7280" strokeWidth="1.5"/>
                          <line x1="8" y1={(bracketHeightCalc + boxHeight) / 2} x2={bracketWidth} y2={(bracketHeightCalc + boxHeight) / 2} stroke="#6b7280" strokeWidth="1.5"/>
                        </svg>
                        <div className={`absolute ${isCurrent ? 'bg-yellow-100 ring-2 ring-yellow-500 rounded p-0.5' : ''}`} style={{ left: bracketWidth, top: (bracketHeightCalc + boxHeight) / 2 - boxHeight / 2 }}>
                          <TissueSlot tissue={final4Left.winner} />
                        </div>
                      </div>
                    );
                  })()}
                  
                  {championship && (() => {
                    const isCurrent = currentMatch?.id === 15 && !showRoundCompletePopup;
                    
                    return (
                      <div className="absolute" style={{ left: col5, top: final4MidY - 40 }}>
                        <svg width={40} height={80} style={{ position: 'absolute', left: -40, top: 0 }}>
                          <line x1="0" y1="40" x2="40" y2="40" stroke="#6b7280" strokeWidth="1.5"/>
                        </svg>
                        <svg width={40} height={80} style={{ position: 'absolute', right: -40, top: 0 }}>
                          <line x1="0" y1="40" x2="40" y2="40" stroke="#6b7280" strokeWidth="1.5"/>
                        </svg>
                        
                        <div className={`bg-amber-50 border-2 border-amber-500 rounded-lg p-3 text-center ${
                          isCurrent ? 'ring-2 ring-yellow-500' : ''
                        }`} style={{ width: 160 }}>
                          <div className="text-[10px] font-bold text-amber-600 mb-2">🏆 CHAMPIONSHIP 🏆</div>
                          {championship.winner ? (
                            <div>
                              <div className="text-[9px] text-amber-600 font-bold mb-1">CHAMPION</div>
                              <div 
                                className="text-[10px] font-bold px-2 py-1.5 rounded leading-tight"
                                style={{
                                  backgroundColor: getTissueCategoryColor(championship.winner.category).bg,
                                  color: getTissueCategoryColor(championship.winner.category).text
                                }}
                              >
                                {championship.winner.name}
                              </div>
                            </div>
                          ) : (
                            <div className="text-[9px] text-gray-400 py-2">Awaiting finalists...</div>
                          )}
                        </div>
                      </div>
                    );
                  })()}
                  
                  {final4Right && (() => {
                    const isCurrent = currentMatch?.id === 14 && !showRoundCompletePopup;
                    const bracketHeightCalc = elite8MidY2 - elite8MidY1;
                    
                    return (
                      <div className="absolute" style={{ right: col4, top: elite8MidY1 - boxHeight/2 }}>
                        <div className={`absolute ${isCurrent ? 'bg-yellow-100 ring-2 ring-yellow-500 rounded p-0.5' : ''}`} style={{ right: bracketWidth, top: (bracketHeightCalc + boxHeight) / 2 - boxHeight / 2 }}>
                          <TissueSlot tissue={final4Right.winner} />
                        </div>
                        <svg width={bracketWidth} height={bracketHeightCalc + boxHeight} className="flex-shrink-0" style={{ position: 'absolute', right: 0 }}>
                          <line x1="0" y1={(bracketHeightCalc + boxHeight) / 2} x2="14" y2={(bracketHeightCalc + boxHeight) / 2} stroke="#6b7280" strokeWidth="1.5"/>
                          <path d={`M${bracketWidth} ${boxHeight/2} L14 ${boxHeight/2} L14 ${bracketHeightCalc + boxHeight/2} L${bracketWidth} ${bracketHeightCalc + boxHeight/2}`} fill="none" stroke="#6b7280" strokeWidth="1.5"/>
                        </svg>
                      </div>
                    );
                  })()}
                  
                  {elite8Right.map((match, idx) => {
                    const isCurrent = currentMatch?.id === match.id && !showRoundCompletePopup;
                    const sourceY1 = round1Tops[idx * 2] + boxHeight + 2;
                    const sourceY2 = round1Tops[idx * 2 + 1] + boxHeight + 2;
                    const bracketHeightCalc = sourceY2 - sourceY1;
                    
                    return (
                      <div key={match.id} className="absolute" style={{ right: col3, top: sourceY1 - boxHeight/2 }}>
                        <div className={`absolute ${isCurrent ? 'bg-yellow-100 ring-2 ring-yellow-500 rounded p-0.5' : ''}`} style={{ right: bracketWidth, top: (bracketHeightCalc + boxHeight) / 2 - boxHeight / 2 }}>
                          <TissueSlot tissue={match.winner} />
                        </div>
                        <svg width={bracketWidth} height={bracketHeightCalc + boxHeight} className="flex-shrink-0" style={{ position: 'absolute', right: 0 }}>
                          <line x1="0" y1={(bracketHeightCalc + boxHeight) / 2} x2="14" y2={(bracketHeightCalc + boxHeight) / 2} stroke="#6b7280" strokeWidth="1.5"/>
                          <path d={`M${bracketWidth} ${boxHeight/2} L14 ${boxHeight/2} L14 ${bracketHeightCalc + boxHeight/2} L${bracketWidth} ${bracketHeightCalc + boxHeight/2}`} fill="none" stroke="#6b7280" strokeWidth="1.5"/>
                        </svg>
                      </div>
                    );
                  })}
                  
                  {round1Right.map((match, idx) => (
                    <MatchRight key={match.id} match={match} top={round1Tops[idx]} />
                  ))}

                  <div className="absolute bottom-2 left-1/2 transform -translate-x-1/2 flex gap-4 text-[9px]">
                    <div className="flex items-center gap-1">
                      <div className="w-3 h-3 rounded" style={{ backgroundColor: getTissueCategoryColor('epithelial').bg, border: `1px solid ${getTissueCategoryColor('epithelial').border}` }}></div>
                      <span>Epithelial</span>
                    </div>
                    <div className="flex items-center gap-1">
                      <div className="w-3 h-3 rounded" style={{ backgroundColor: getTissueCategoryColor('connective').bg, border: `1px solid ${getTissueCategoryColor('connective').border}` }}></div>
                      <span>Connective</span>
                    </div>
                    <div className="flex items-center gap-1">
                      <div className="w-3 h-3 rounded" style={{ backgroundColor: getTissueCategoryColor('muscle').bg, border: `1px solid ${getTissueCategoryColor('muscle').border}` }}></div>
                      <span>Muscle</span>
                    </div>
                    <div className="flex items-center gap-1">
                      <div className="w-3 h-3 rounded" style={{ backgroundColor: getTissueCategoryColor('nervous').bg, border: `1px solid ${getTissueCategoryColor('nervous').border}` }}></div>
                      <span>Nervous</span>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          <div className="xl:col-span-1 print:hidden">
            {!isComplete && currentMatch && !showRoundCompletePopup ? (
              <Card className="sticky top-24">
                <CardHeader>
                  <CardTitle className="text-lg">Which is more important?</CardTitle>
                  <p className="text-sm text-muted-foreground">
                    Click on the type of tissue that you think is slightly more important.
                  </p>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="text-sm text-muted-foreground text-center font-medium">
                    Match {currentMatch.id}
                  </div>

                  <div className="space-y-2">
                    <button
                      onClick={() => handleTissueSelect(currentMatch.tissue1!)}
                      className={`w-full p-3 rounded-lg border-2 text-left transition-all hover:scale-[1.02] ${
                        selectedTissue?.name === currentMatch.tissue1?.name 
                          ? 'ring-2 ring-secondary ring-offset-2' 
                          : ''
                      }`}
                      style={{
                        backgroundColor: getTissueCategoryColor(currentMatch.tissue1?.category || '').bg,
                        borderColor: getTissueCategoryColor(currentMatch.tissue1?.category || '').border,
                        color: getTissueCategoryColor(currentMatch.tissue1?.category || '').text
                      }}
                    >
                      <div className="font-medium">{currentMatch.tissue1?.name}</div>
                      <div className="text-xs opacity-75 capitalize">{currentMatch.tissue1?.category} tissue</div>
                    </button>

                    <div className="text-center font-bold text-muted-foreground py-1">VS</div>

                    <button
                      onClick={() => handleTissueSelect(currentMatch.tissue2!)}
                      className={`w-full p-3 rounded-lg border-2 text-left transition-all hover:scale-[1.02] ${
                        selectedTissue?.name === currentMatch.tissue2?.name 
                          ? 'ring-2 ring-secondary ring-offset-2' 
                          : ''
                      }`}
                      style={{
                        backgroundColor: getTissueCategoryColor(currentMatch.tissue2?.category || '').bg,
                        borderColor: getTissueCategoryColor(currentMatch.tissue2?.category || '').border,
                        color: getTissueCategoryColor(currentMatch.tissue2?.category || '').text
                      }}
                    >
                      <div className="font-medium">{currentMatch.tissue2?.name}</div>
                      <div className="text-xs opacity-75 capitalize">{currentMatch.tissue2?.category} tissue</div>
                    </button>
                  </div>

                  {selectedTissue && (
                    <div className="space-y-2 animate-in fade-in slide-in-from-bottom-2">
                      <Label htmlFor="explanation" className="text-sm font-medium">
                        What makes that tissue slightly more important?
                      </Label>
                      <Textarea
                        id="explanation"
                        value={explanation}
                        onChange={(e: React.ChangeEvent<HTMLTextAreaElement>) => {
                          setExplanation(e.target.value);
                          setExplanationError('');
                        }}
                        placeholder="Explain your selection here. Consider things like the tissue's functions or locations, or other tissues that could take its place!"
                        className="min-h-[100px]"
                      />
                      <div className="flex justify-between items-center text-xs">
                        <span className={wordCount >= 10 ? 'text-green-600' : 'text-muted-foreground'}>
                          {wordCount}/10 words minimum
                        </span>
                        {wordCount >= 10 && <Check className="h-4 w-4 text-green-600" />}
                      </div>
                      {explanationError && (
                        <div className="flex items-center gap-2 text-destructive text-sm">
                          <AlertCircle className="h-4 w-4" />
                          {explanationError}
                        </div>
                      )}
                      <Button 
                        onClick={handleSubmitMatch}
                        className="w-full"
                        disabled={wordCount < 10}
                      >
                        Confirm Selection
                      </Button>
                    </div>
                  )}
                </CardContent>
              </Card>
            ) : isComplete ? (
              <Card className="sticky top-24 bg-gradient-to-br from-secondary/20 to-accent/20">
                <CardHeader>
                  <CardTitle className="text-lg text-center">
                    🏆 Tournament Complete! 🏆
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4 text-center">
                  <div>
                    <div className="text-sm text-muted-foreground">Your Champion:</div>
                    <div 
                      className="mt-2 p-3 rounded-lg font-bold text-lg"
                      style={{
                        backgroundColor: getTissueCategoryColor(championship?.winner?.category || '').bg,
                        color: getTissueCategoryColor(championship?.winner?.category || '').text
                      }}
                    >
                      {championship?.winner?.name}
                    </div>
                  </div>
                  <p className="text-sm text-muted-foreground">
                    Download your bracket & explanations, then make sure to upload them into the "Final Exam Tissue Tournament Activity" dropbox in the Final Exam Module (in Canvas).
                  </p>
                  <Button 
                    onClick={generateAndDownloadPDF}
                    className="w-full bg-secondary hover:bg-secondary/90"
                    size="lg"
                    disabled={isGeneratingPDF}
                  >
                    {isGeneratingPDF ? (
                      <span className="animate-pulse">Generating...</span>
                    ) : (
                      <>
                        <Download className="mr-2 h-5 w-5" />
                        Download Your Bracket & Explanations
                      </>
                    )}
                  </Button>
                </CardContent>
              </Card>
            ) : showRoundCompletePopup ? (
              <Card className="sticky top-24">
                <CardContent className="py-8 text-center text-muted-foreground">
                  <PartyPopper className="h-8 w-8 mx-auto mb-2 text-secondary" />
                  <div>Round complete! Click the button to continue.</div>
                </CardContent>
              </Card>
            ) : (
              <Card className="sticky top-24">
                <CardContent className="py-8 text-center text-muted-foreground">
                  <div className="animate-pulse">Loading next match...</div>
                </CardContent>
              </Card>
            )}
          </div>
        </div>
      </main>
    </div>
  );
}
