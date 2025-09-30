import { ProctoringEvent } from '../types';
import { formatTimestamp } from '../utils/detectionLogic';
import { AlertTriangle, Eye, Users, Smartphone, CheckCircle } from 'lucide-react';

interface EventLogProps {
  events: ProctoringEvent[];
}

export const EventLog = ({ events }: EventLogProps) => {
  const getEventIcon = (type: ProctoringEvent['type']) => {
    switch (type) {
      case 'focus_lost':
        return <Eye className="w-5 h-5" />;
      case 'no_face':
        return <AlertTriangle className="w-5 h-5" />;
      case 'multiple_faces':
        return <Users className="w-5 h-5" />;
      case 'suspicious_object':
        return <Smartphone className="w-5 h-5" />;
      case 'focus_regained':
      case 'face_detected':
        return <CheckCircle className="w-5 h-5" />;
      default:
        return <AlertTriangle className="w-5 h-5" />;
    }
  };

  const getSeverityColor = (severity: ProctoringEvent['severity']) => {
    switch (severity) {
      case 'high':
        return 'bg-red-100 border-red-300 text-red-800';
      case 'medium':
        return 'bg-yellow-100 border-yellow-300 text-yellow-800';
      case 'low':
        return 'bg-blue-100 border-blue-300 text-blue-800';
      default:
        return 'bg-gray-100 border-gray-300 text-gray-800';
    }
  };

  return (
    <div className="bg-white rounded-lg shadow-lg p-6">
      <h2 className="text-2xl font-bold mb-4 text-gray-800">Event Log</h2>

      <div className="space-y-3 max-h-96 overflow-y-auto">
        {events.length === 0 ? (
          <p className="text-gray-500 text-center py-8">No events recorded yet</p>
        ) : (
          events
            .slice()
            .reverse()
            .map(event => (
              <div
                key={event.id}
                className={`flex items-start gap-3 p-4 rounded-lg border-2 ${getSeverityColor(
                  event.severity
                )}`}
              >
                <div className="mt-0.5">{getEventIcon(event.type)}</div>
                <div className="flex-1">
                  <p className="font-semibold">{event.description}</p>
                  <p className="text-sm opacity-75">{formatTimestamp(event.timestamp)}</p>
                </div>
              </div>
            ))
        )}
      </div>
    </div>
  );
};