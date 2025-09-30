import { SessionData, DetectionStats } from '../types';
import { calculateIntegrityScore, calculateStats, formatDuration, formatTimestamp } from '../utils/detectionLogic';
import { Download, Award, AlertTriangle, CheckCircle } from 'lucide-react';

interface ProctoringReportProps {
  sessionData: SessionData;
  onClose: () => void;
}

export const ProctoringReport = ({ sessionData, onClose }: ProctoringReportProps) => {
  const stats: DetectionStats = calculateStats(sessionData.events);
  const integrityScore = calculateIntegrityScore(stats);
  const duration = sessionData.endTime
    ? sessionData.endTime - sessionData.startTime
    : Date.now() - sessionData.startTime;

  const downloadReport = () => {
    const reportContent = generateReportText(sessionData, stats, integrityScore, duration);
    const blob = new Blob([reportContent], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `proctoring-report-${sessionData.candidateName}-${Date.now()}.txt`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  const getScoreColor = (score: number) => {
    if (score >= 90) return 'text-green-600';
    if (score >= 70) return 'text-yellow-600';
    return 'text-red-600';
  };

  const getScoreLabel = (score: number) => {
    if (score >= 90) return 'Excellent';
    if (score >= 80) return 'Good';
    if (score >= 70) return 'Fair';
    if (score >= 60) return 'Poor';
    return 'Very Poor';
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg shadow-2xl max-w-4xl w-full max-h-[90vh] overflow-y-auto">
        <div className="p-8">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-3xl font-bold text-gray-800">Proctoring Report</h2>
            <button
              onClick={onClose}
              className="text-gray-500 hover:text-gray-700 text-2xl font-bold"
            >
              ×
            </button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
            <div className="bg-gradient-to-br from-blue-50 to-blue-100 p-6 rounded-lg">
              <h3 className="text-lg font-semibold text-gray-700 mb-2">Candidate Information</h3>
              <p className="text-2xl font-bold text-blue-600">{sessionData.candidateName}</p>
              <p className="text-sm text-gray-600 mt-2">
                Session Start: {formatTimestamp(sessionData.startTime)}
              </p>
              <p className="text-sm text-gray-600">Duration: {formatDuration(duration)}</p>
            </div>

            <div className="bg-gradient-to-br from-purple-50 to-purple-100 p-6 rounded-lg">
              <h3 className="text-lg font-semibold text-gray-700 mb-2 flex items-center gap-2">
                <Award className="w-5 h-5" />
                Integrity Score
              </h3>
              <div className="flex items-baseline gap-2">
                <p className={`text-5xl font-bold ${getScoreColor(integrityScore)}`}>
                  {integrityScore}
                </p>
                <p className="text-2xl text-gray-600">/100</p>
              </div>
              <p className={`text-lg font-semibold mt-2 ${getScoreColor(integrityScore)}`}>
                {getScoreLabel(integrityScore)}
              </p>
            </div>
          </div>

          <div className="mb-8">
            <h3 className="text-xl font-bold text-gray-800 mb-4">Violation Summary</h3>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <div className="bg-red-50 border-2 border-red-200 p-4 rounded-lg">
                <p className="text-sm text-gray-600 mb-1">No Face Detected</p>
                <p className="text-3xl font-bold text-red-600">{stats.noFaceCount}</p>
              </div>
              <div className="bg-orange-50 border-2 border-orange-200 p-4 rounded-lg">
                <p className="text-sm text-gray-600 mb-1">Focus Lost</p>
                <p className="text-3xl font-bold text-orange-600">{stats.focusLostCount}</p>
              </div>
              <div className="bg-yellow-50 border-2 border-yellow-200 p-4 rounded-lg">
                <p className="text-sm text-gray-600 mb-1">Multiple Faces</p>
                <p className="text-3xl font-bold text-yellow-600">{stats.multipleFacesCount}</p>
              </div>
              <div className="bg-purple-50 border-2 border-purple-200 p-4 rounded-lg">
                <p className="text-sm text-gray-600 mb-1">Suspicious Objects</p>
                <p className="text-3xl font-bold text-purple-600">{stats.suspiciousObjectCount}</p>
              </div>
            </div>
          </div>

          <div className="mb-8">
            <h3 className="text-xl font-bold text-gray-800 mb-4">Detailed Event Log</h3>
            <div className="bg-gray-50 rounded-lg p-4 max-h-64 overflow-y-auto">
              {sessionData.events.length === 0 ? (
                <div className="text-center py-8 text-gray-500 flex items-center justify-center gap-2">
                  <CheckCircle className="w-6 h-6" />
                  <p>No violations detected during the session</p>
                </div>
              ) : (
                <div className="space-y-2">
                  {sessionData.events.map(event => (
                    <div
                      key={event.id}
                      className="flex items-start gap-3 bg-white p-3 rounded border border-gray-200"
                    >
                      <AlertTriangle
                        className={`w-5 h-5 mt-0.5 ${
                          event.severity === 'high'
                            ? 'text-red-500'
                            : event.severity === 'medium'
                            ? 'text-yellow-500'
                            : 'text-blue-500'
                        }`}
                      />
                      <div className="flex-1">
                        <p className="font-semibold text-gray-800">{event.description}</p>
                        <p className="text-sm text-gray-600">{formatTimestamp(event.timestamp)}</p>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>

          <div className="mb-6">
            <h3 className="text-xl font-bold text-gray-800 mb-4">Score Breakdown</h3>
            <div className="bg-gray-50 rounded-lg p-4 space-y-2">
              <div className="flex justify-between">
                <span className="text-gray-700">Base Score</span>
                <span className="font-bold">100</span>
              </div>
              <div className="flex justify-between text-red-600">
                <span>Focus Lost Events (-2 each)</span>
                <span>-{stats.focusLostCount * 2}</span>
              </div>
              <div className="flex justify-between text-red-600">
                <span>No Face Events (-5 each)</span>
                <span>-{stats.noFaceCount * 5}</span>
              </div>
              <div className="flex justify-between text-red-600">
                <span>Multiple Faces Events (-10 each)</span>
                <span>-{stats.multipleFacesCount * 10}</span>
              </div>
              <div className="flex justify-between text-red-600">
                <span>Suspicious Objects (-15 each)</span>
                <span>-{stats.suspiciousObjectCount * 15}</span>
              </div>
              <div className="border-t-2 border-gray-300 pt-2 flex justify-between text-lg font-bold">
                <span>Final Score</span>
                <span className={getScoreColor(integrityScore)}>{integrityScore}</span>
              </div>
            </div>
          </div>

          <div className="flex justify-end gap-4">
            <button
              onClick={onClose}
              className="px-6 py-3 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300 font-semibold transition-colors"
            >
              Close
            </button>
            <button
              onClick={downloadReport}
              className="px-6 py-3 bg-blue-500 text-white rounded-lg hover:bg-blue-600 font-semibold flex items-center gap-2 transition-colors"
            >
              <Download className="w-5 h-5" />
              Download Report
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

function generateReportText(
  sessionData: SessionData,
  stats: DetectionStats,
  integrityScore: number,
  duration: number
): string {
  const lines = [
    '═══════════════════════════════════════════════',
    '          VIDEO PROCTORING REPORT',
    '═══════════════════════════════════════════════',
    '',
    'CANDIDATE INFORMATION',
    '─────────────────────────────────────────────',
    `Name: ${sessionData.candidateName}`,
    `Session Start: ${new Date(sessionData.startTime).toLocaleString()}`,
    `Duration: ${formatDuration(duration)}`,
    '',
    'INTEGRITY SCORE',
    '─────────────────────────────────────────────',
    `Final Score: ${integrityScore}/100`,
    '',
    'VIOLATION SUMMARY',
    '─────────────────────────────────────────────',
    `Focus Lost Events: ${stats.focusLostCount}`,
    `No Face Detected: ${stats.noFaceCount}`,
    `Multiple Faces Detected: ${stats.multipleFacesCount}`,
    `Suspicious Objects: ${stats.suspiciousObjectCount}`,
    '',
    'SCORE BREAKDOWN',
    '─────────────────────────────────────────────',
    `Base Score: 100`,
    `Focus Lost Penalty (-2 each): -${stats.focusLostCount * 2}`,
    `No Face Penalty (-5 each): -${stats.noFaceCount * 5}`,
    `Multiple Faces Penalty (-10 each): -${stats.multipleFacesCount * 10}`,
    `Suspicious Objects Penalty (-15 each): -${stats.suspiciousObjectCount * 15}`,
    `Final Score: ${integrityScore}`,
    '',
    'DETAILED EVENT LOG',
    '─────────────────────────────────────────────',
  ];

  if (sessionData.events.length === 0) {
    lines.push('No violations detected during the session.');
  } else {
    sessionData.events.forEach((event, index) => {
      lines.push(
        `${index + 1}. [${new Date(event.timestamp).toLocaleTimeString()}] ${event.description}`
      );
    });
  }

  lines.push('');
  lines.push('═══════════════════════════════════════════════');
  lines.push(`Generated: ${new Date().toLocaleString()}`);
  lines.push('═══════════════════════════════════════════════');

  return lines.join('\n');
}