/**
 * Voice Analyzer Engine
 * Manages Web Speech API, real-time analysis, and state updates
 */

export interface TranscriptEntry {
  timestamp: Date;
  speaker: 'user' | 'scammer';
  text: string;
}

export interface TimelineEntry {
  timestamp: Date;
  utterance: string;
  interpretation: string;
  severity: 'low' | 'medium' | 'high' | 'critical';
  type: 'manipulation' | 'urgency' | 'impersonation' | 'coercion' | 'grooming';
}

export interface ScammerProfile {
  riskLevel: 'low' | 'medium' | 'high' | 'extreme';
  archetype: string;
  primaryTechnique: string;
  secondaryTechnique: string;
  emotionalPattern: string;
  aggressionIndex: number;
}

export interface EmotionAnalysis {
  anger: number;
  calmManipulation: number;
  gaslighting: number;
  threatening: number;
  seduction: number;
}

export interface DangerAlert {
  id: string;
  type: 'manipulation' | 'urgency' | 'impersonation' | 'coercion' | 'grooming';
  message: string;
  timestamp: Date;
}

export interface VoiceEngineState {
  isListening: boolean;
  transcript: TranscriptEntry[];
  timeline: TimelineEntry[];
  profile: ScammerProfile | null;
  emotions: EmotionAnalysis | null;
  deceptionProbability: number;
  dangerScore: number;
  alerts: DangerAlert[];
  sessionDuration: number;
}

export type VoiceEngineCallback = (state: VoiceEngineState) => void;

export class VoiceAnalyzerEngine {
  private recognition: any = null;
  private isListening = false;
  private transcript: TranscriptEntry[] = [];
  private timeline: TimelineEntry[] = [];
  private profile: ScammerProfile | null = null;
  private emotions: EmotionAnalysis | null = null;
  private deceptionProbability = 0;
  private dangerScore = 0;
  private alerts: DangerAlert[] = [];
  private sessionDuration = 0;
  private sessionStartTime: Date | null = null;
  private analysisInterval: NodeJS.Timeout | null = null;
  private durationInterval: NodeJS.Timeout | null = null;
  private inFlightAnalysis = false;
  private callback: VoiceEngineCallback | null = null;
  private apiUrl: string;
  private buffer: string = '';
  private analyzeIntervalMs: number;

  constructor(apiUrl: string, analyzeIntervalMs: number = 5000) {
    this.apiUrl = apiUrl;
    this.analyzeIntervalMs = analyzeIntervalMs;
  }

  public setCallback(callback: VoiceEngineCallback) {
    this.callback = callback;
  }

  public start() {
    if (this.isListening) return;

    const SpeechRecognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
    if (!SpeechRecognition) {
      throw new Error('Web Speech API not supported in this browser');
    }

    this.recognition = new SpeechRecognition();
    this.recognition.continuous = true;
    this.recognition.interimResults = true;
    this.recognition.lang = 'en-US';

    this.recognition.onstart = () => {
      this.isListening = true;
      this.sessionStartTime = new Date();
      this.sessionDuration = 0;
      this.notifyCallback();

      this.durationInterval = setInterval(() => {
        if (this.sessionStartTime) {
          this.sessionDuration = Math.floor((Date.now() - this.sessionStartTime.getTime()) / 1000);
          this.notifyCallback();
        }
      }, 1000);

      this.analysisInterval = setInterval(() => {
        this.performAnalysis();
      }, this.analyzeIntervalMs);
    };

    this.recognition.onresult = (event: any) => {
      let interimTranscript = '';
      let finalTranscript = '';

      for (let i = event.resultIndex; i < event.results.length; i++) {
        const transcript = event.results[i][0].transcript;
        if (event.results[i].isFinal) {
          finalTranscript += transcript + ' ';
        } else {
          interimTranscript += transcript;
        }
      }

      if (finalTranscript) {
        this.transcript.push({
          timestamp: new Date(),
          speaker: 'scammer', // Assume scammer for now
          text: finalTranscript.trim(),
        });

        this.buffer += finalTranscript;

        this.notifyCallback();
      }
    };

    this.recognition.onerror = (event: any) => {
      console.error('Speech recognition error:', event.error);
    };

    this.recognition.onend = () => {
      if (this.isListening) {
        try {
          this.recognition.start();
        } catch (e) {
          console.error('Failed to restart recognition:', e);
        }
      }
    };

    try {
      this.recognition.start();
    } catch (e) {
      console.error('Failed to start recognition:', e);
      throw e;
    }
  }

  public stop() {
    this.isListening = false;

    if (this.recognition) {
      this.recognition.stop();
      this.recognition = null;
    }

    if (this.analysisInterval) {
      clearInterval(this.analysisInterval);
      this.analysisInterval = null;
    }

    if (this.durationInterval) {
      clearInterval(this.durationInterval);
      this.durationInterval = null;
    }

    this.notifyCallback();
  }

  public reset() {
    this.stop();
    this.transcript = [];
    this.timeline = [];
    this.profile = null;
    this.emotions = null;
    this.deceptionProbability = 0;
    this.dangerScore = 0;
    this.alerts = [];
    this.sessionDuration = 0;
    this.sessionStartTime = null;
    this.buffer = '';
    this.notifyCallback();
  }

  private async performAnalysis() {
    if (!this.buffer.trim() || this.inFlightAnalysis) {
      return;
    }

    const textToAnalyze = this.buffer;
    this.buffer = ''; // Clear buffer
    this.inFlightAnalysis = true;

    try {
      const analyzeResponse = await fetch(`${this.apiUrl}/api/analyze-text`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          text: textToAnalyze,
        }),
      });

      if (analyzeResponse.ok) {
        const analysisData = await analyzeResponse.json();
        
        this.deceptionProbability = (analysisData.scam_probability || 0) * 100;
        
        this.dangerScore = analysisData.danger_score || 0;
        
        if (analysisData.emotional_tone) {
          this.emotions = {
            anger: (analysisData.emotional_tone.anger || 0) * 100,
            calmManipulation: (analysisData.emotional_tone.calm_manipulation || 0) * 100,
            gaslighting: (analysisData.emotional_tone.gaslighting || 0) * 100,
            threatening: (analysisData.emotional_tone.threatening || 0) * 100,
            seduction: (analysisData.emotional_tone.seduction || 0) * 100,
          };
        }
        
        if (analysisData.manipulation_timeline && Array.isArray(analysisData.manipulation_timeline)) {
          for (const event of analysisData.manipulation_timeline) {
            this.timeline.push({
              timestamp: new Date(event.timestamp || Date.now()),
              utterance: textToAnalyze.substring(0, 100),
              interpretation: event.label || 'Manipulation detected',
              severity: event.intensity > 0.8 ? 'critical' : event.intensity > 0.6 ? 'high' : event.intensity > 0.4 ? 'medium' : 'low',
              type: 'manipulation',
            });
          }
        }
        
        if (this.dangerScore > 70) {
          this.addAlert({
            type: 'manipulation',
            message: '⚠️ High Danger Detected - ' + (analysisData.summary || 'Scam pattern identified'),
          });
        } else if (this.dangerScore > 50) {
          this.addAlert({
            type: 'urgency',
            message: '🚨 Moderate Risk - ' + (analysisData.summary || 'Suspicious activity detected'),
          });
        }
        
        this.updateProfile();
      }

      this.notifyCallback();
    } catch (error) {
      console.error('Analysis error:', error);
    } finally {
      this.inFlightAnalysis = false;
    }
  }

  private updateProfile() {
    const riskLevel = 
      this.dangerScore > 80 ? 'extreme' :
      this.dangerScore > 60 ? 'high' :
      this.dangerScore > 40 ? 'medium' : 'low';

    const archetype = this.deceptionProbability > 70 ? 'Professional Scammer' : 'Opportunistic Fraudster';
    
    const primaryTechnique = 
      (this.emotions?.anger || 0) > 60 ? 'Intimidation' :
      (this.emotions?.calmManipulation || 0) > 60 ? 'Calm Manipulation' :
      (this.emotions?.seduction || 0) > 60 ? 'Romance Scam' : 'Social Engineering';
    
    const secondaryTechnique = 
      (this.emotions?.threatening || 0) > 50 ? 'Fear Manipulation' :
      (this.emotions?.gaslighting || 0) > 50 ? 'Gaslighting' : 'Urgency Tactics';
    
    const patterns = [];
    if ((this.emotions?.anger || 0) > 30) patterns.push('aggressive');
    if ((this.emotions?.threatening || 0) > 30) patterns.push('threatening');
    if ((this.emotions?.gaslighting || 0) > 30) patterns.push('gaslighting');
    if ((this.emotions?.calmManipulation || 0) > 30) patterns.push('manipulative');
    if ((this.emotions?.seduction || 0) > 30) patterns.push('seductive');
    
    const emotionalPattern = patterns.length > 0 
      ? patterns.join(', ') + ' tactics detected'
      : 'High pressure with false authority';

    const aggressionIndex = Math.min(100, Math.max(0, Math.round(
      (this.emotions?.anger || 0) * 0.6 +
      (this.emotions?.threatening || 0) * 0.8 +
      (this.emotions?.gaslighting || 0) * 0.5 +
      (this.emotions?.calmManipulation || 0) * 0.2 +
      (this.emotions?.seduction || 0) * 0.2
    ) / 2.3));
    
    const emotionalPatterns = [];
    if ((this.emotions?.anger || 0) > 30) emotionalPatterns.push('aggressive');
    if ((this.emotions?.threatening || 0) > 30) emotionalPatterns.push('threatening');
    if ((this.emotions?.calmManipulation || 0) > 30) emotionalPatterns.push('manipulative');
    if ((this.emotions?.gaslighting || 0) > 30) emotionalPatterns.push('gaslighting');
    if ((this.emotions?.seduction || 0) > 30) emotionalPatterns.push('seductive');
    
    const emotionalPattern = emotionalPatterns.length > 0
      ? `${emotionalPatterns.join(', ')} tactics with ${primaryTechnique.toLowerCase()}`
      : 'High pressure with false authority';

    this.profile = {
      riskLevel,
      archetype,
      primaryTechnique,
      secondaryTechnique,
      emotionalPattern,
      aggressionIndex: Math.round(((this.emotions?.anger || 0) + (this.emotions?.threatening || 0)) / 2),
    };
  }

  private addAlert(alert: Omit<DangerAlert, 'id' | 'timestamp'>) {
    this.alerts.push({
      id: Date.now().toString(),
      timestamp: new Date(),
      ...alert,
    });

    if (this.alerts.length > 10) {
      this.alerts = this.alerts.slice(-10);
    }
  }

  private notifyCallback() {
    if (this.callback) {
      this.callback({
        isListening: this.isListening,
        transcript: this.transcript,
        timeline: this.timeline,
        profile: this.profile,
        emotions: this.emotions,
        deceptionProbability: this.deceptionProbability,
        dangerScore: this.dangerScore,
        alerts: this.alerts,
        sessionDuration: this.sessionDuration,
      });
    }
  }

  public getState(): VoiceEngineState {
    return {
      isListening: this.isListening,
      transcript: this.transcript,
      timeline: this.timeline,
      profile: this.profile,
      emotions: this.emotions,
      deceptionProbability: this.deceptionProbability,
      dangerScore: this.dangerScore,
      alerts: this.alerts,
      sessionDuration: this.sessionDuration,
    };
  }
}
