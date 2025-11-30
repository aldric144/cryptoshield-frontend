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

  constructor(apiUrl: string) {
    this.apiUrl = apiUrl;
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
      }, 5000);
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
      const voiceResponse = await fetch(`${this.apiUrl}/api/voice-analysis`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          call_id: 'voice-session-' + Date.now(),
          user_id: 'demo-user',
          audio_text: textToAnalyze,
        }),
      });

      if (voiceResponse.ok) {
        const voiceData = await voiceResponse.json();
        this.deceptionProbability = voiceData.scam_probability || 0;

        if (voiceData.scam_probability > 50) {
          this.timeline.push({
            timestamp: new Date(),
            utterance: textToAnalyze.substring(0, 100),
            interpretation: voiceData.script_classification || 'Suspicious pattern detected',
            severity: voiceData.scam_probability > 80 ? 'critical' : voiceData.scam_probability > 60 ? 'high' : 'medium',
            type: 'manipulation',
          });

          if (voiceData.scam_probability > 70) {
            this.addAlert({
              type: 'manipulation',
              message: '⚠️ Manipulation Detected - High scam probability',
            });
          }
        }
      }

      const emotionResponse = await fetch(`${this.apiUrl}/api/emotional-analysis`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          call_id: 'voice-session-' + Date.now(),
          user_id: 'demo-user',
          audio_text: textToAnalyze,
        }),
      });

      if (emotionResponse.ok) {
        const emotionData = await emotionResponse.json();
        this.emotions = {
          anger: emotionData.anger || 0,
          calmManipulation: emotionData.calm_manipulation || 0,
          gaslighting: emotionData.gaslighting || 0,
          threatening: emotionData.threatening || 0,
          seduction: emotionData.seduction || 0,
        };

        if (emotionData.stress_level > 70) {
          this.addAlert({
            type: 'urgency',
            message: '🚨 Urgency Scam Pattern - High stress detected',
          });
        }
      }

      this.dangerScore = Math.round(
        (this.deceptionProbability * 0.5) +
        ((this.emotions?.anger || 0) * 0.2) +
        ((this.emotions?.threatening || 0) * 0.3)
      );

      this.updateProfile();

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

    this.profile = {
      riskLevel,
      archetype,
      primaryTechnique,
      secondaryTechnique: 'Urgency Tactics',
      emotionalPattern: 'High pressure with false authority',
      aggressionIndex: Math.round((this.emotions?.anger || 0) + (this.emotions?.threatening || 0)) / 2,
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
