import { useState, useEffect } from 'react';
import { VideoMonitor } from './VideoMonitor';
import { EventLog } from './EventLog';
import { ProctoringReport } from './ProctoringReport';
import { SessionData, ProctoringEvent } from '../types';
import { Play, Square, FileText, User } from 'lucide-react';

export const InterviewSession = () => {
  const [candidateName, setCandidateName] = useState('');
  const [isSessionStarted, setIsSessionStarted] = useState(false);
  const [isRecording, setIsRecording] = useState(false);
  const [sessionData, setSessionData] = useState<SessionData | null>(null);
  const [events, setEvents] = useState<ProctoringEvent[]>([]);
  const [showReport, setShowReport] = useState(false);

  useEffect(() => {
    if (isRecording) {
      const savedSession = localStorage.getItem('currentSession');
      if (savedSession) {
        const parsed = JSON.parse(savedSession);
        setEvents(parsed.events || []);
      }
    }
  }, [isRecording]);

  useEffect(() => {
    if (isRecording && sessionData) {
      const updatedSession = {
        ...sessionData,
        events,
      };
      localStorage.setItem('currentSession', JSON.stringify(updatedSession));
    }
  }, [events, isRecording, sessionData]);

  const startSession = () => {
    if (!candidateName.trim()) {
      alert('Please enter candidate name');
      return;
    }

    const newSession: SessionData = {
      candidateName: candidateName.trim(),
      startTime: Date.now(),
      events: [],
    };

    setSessionData(newSession);
    setIsSessionStarted(true);
    setIsRecording(true);
    setEvents([]);
    localStorage.setItem('currentSession', JSON.stringify(newSession));
  };

  const stopSession = () => {
    if (sessionData) {
      const finalSession: SessionData = {
        ...sessionData,
        endTime: Date.now(),
        events,
      };

      setSessionData(finalSession);
      setIsRecording(false);

      const sessions = JSON.parse(localStorage.getItem('completedSessions') || '[]');
      sessions.push(finalSession);
      localStorage.setItem('completedSessions', JSON.stringify(sessions));
      localStorage.removeItem('currentSession');
    }
  };

  const handleEventDetected = (event: ProctoringEvent) => {
    setEvents(prev => [...prev, event]);
  };

  const viewReport = () => {
    if (sessionData) {
      const finalSession: SessionData = {
        ...sessionData,
        endTime: sessionData.endTime || Date.now(),
        events,
      };
      setSessionData(finalSession);
      setShowReport(true);
    }
  };

  const resetSession = () => {
    setIsSessionStarted(false);
    setIsRecording(false);
    setSessionData(null);
    setEvents([]);
    setCandidateName('');
    setShowReport(false);
  };

  if (!isSessionStarted) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50 flex items-center justify-center p-4">
        <div className="bg-white rounded-2xl shadow-2xl p-8 max-w-md w-full">
          <div className="text-center mb-8">
            <div className="inline-block p-4 bg-blue-100 rounded-full mb-4">
              <User className="w-12 h-12 text-blue-600" />
            </div>
            <h1 className="text-3xl font-bold text-gray-800 mb-2">Video Proctoring System</h1>
            <p className="text-gray-600">Enter candidate details to start the interview</p>
          </div>

          <div className="space-y-4">
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">
                Candidate Name
              </label>
              <input
                type="text"
                value={candidateName}
                onChange={e => setCandidateName(e.target.value)}
                placeholder="Enter candidate name"
                className="w-full px-4 py-3 border-2 border-gray-300 rounded-lg focus:outline-none focus:border-blue-500 transition-colors"
                onKeyDown={e => e.key === 'Enter' && startSession()}
              />
            </div>

            <button
              onClick={startSession}
              className="w-full bg-gradient-to-r from-blue-500 to-blue-600 text-white py-4 rounded-lg hover:from-blue-600 hover:to-blue-700 font-semibold flex items-center justify-center gap-2 transition-all transform hover:scale-105 shadow-lg"
            >
              <Play className="w-5 h-5" />
              Start Interview Session
            </button>
          </div>

          <div className="mt-8 p-4 bg-blue-50 rounded-lg">
            <h3 className="font-semibold text-gray-800 mb-2">System Features:</h3>
            <ul className="text-sm text-gray-600 space-y-1">
              <li>• Real-time face detection</li>
              <li>• Focus tracking</li>
              <li>• Object detection for unauthorized items</li>
              <li>• Comprehensive integrity scoring</li>
            </ul>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100">
      <div className="container mx-auto px-4 py-8">
        <div className="bg-white rounded-lg shadow-lg p-6 mb-6">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold text-gray-800">Interview in Progress</h1>
              <p className="text-gray-600 mt-1">Candidate: {sessionData?.candidateName}</p>
            </div>
            <div className="flex gap-3">
              {isRecording ? (
                <button
                  onClick={stopSession}
                  className="px-6 py-3 bg-red-500 text-white rounded-lg hover:bg-red-600 font-semibold flex items-center gap-2 transition-all shadow-lg"
                >
                  <Square className="w-5 h-5" />
                  Stop Session
                </button>
              ) : (
                <>
                  <button
                    onClick={viewReport}
                    className="px-6 py-3 bg-blue-500 text-white rounded-lg hover:bg-blue-600 font-semibold flex items-center gap-2 transition-all shadow-lg"
                  >
                    <FileText className="w-5 h-5" />
                    View Report
                  </button>
                  <button
                    onClick={resetSession}
                    className="px-6 py-3 bg-gray-500 text-white rounded-lg hover:bg-gray-600 font-semibold transition-all shadow-lg"
                  >
                    New Session
                  </button>
                </>
              )}
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2">
            <VideoMonitor isRecording={isRecording} onEventDetected={handleEventDetected} />
          </div>

          <div className="lg:col-span-1">
            <EventLog events={events} />
          </div>
        </div>
      </div>

      {showReport && sessionData && (
        <ProctoringReport sessionData={sessionData} onClose={() => setShowReport(false)} />
      )}
    </div>
  );
};