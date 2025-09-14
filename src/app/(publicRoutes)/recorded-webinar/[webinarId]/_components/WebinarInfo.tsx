import React from "react";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Calendar, Clock } from "lucide-react";
import { format } from "date-fns";
import { RecordedWebinarData } from "@/lib/type";

interface WebinarInfoProps {
  webinar: RecordedWebinarData;
}

const WebinarInfo: React.FC<WebinarInfoProps> = ({ webinar }) => {
  return (
    <div className="space-y-4">
      <div>
        <h1 className="text-3xl font-bold text-white mb-3 leading-tight">
          {webinar.title}
        </h1>
        <div className="flex items-center gap-6 text-gray-400">
          <div className="flex items-center gap-2">
            <Calendar className="h-4 w-4" />
            <span className="text-sm">
              {format(new Date(webinar.startTime), "MMMM dd, yyyy")}
            </span>
          </div>
          <div className="flex items-center gap-2">
            <Clock className="h-4 w-4" />
            <span className="text-sm">{webinar.duration} minutes</span>
          </div>
          <Badge className="bg-gradient-to-r from-indigo-600 to-blue-600 text-white border-none">
            Recorded
          </Badge>
        </div>
      </div>

      {/* Tags */}
      {webinar.tags.length > 0 && (
        <div className="flex flex-wrap gap-2">
          {webinar.tags.map((tag: string, index: number) => (
            <Badge
              key={index}
              variant="outline"
              className="border-gray-700 text-gray-300 hover:bg-gray-800 transition-colors"
            >
              #{tag}
            </Badge>
          ))}
        </div>
      )}

      {/* Description */}
      {webinar.description && (
        <Card className="bg-gray-900/30 border-gray-800/50 backdrop-blur-sm">
          <div className="p-6">
            <h3 className="font-semibold text-white mb-3 flex items-center gap-2">
              <div className="w-1 h-4 bg-indigo-500 rounded-full"></div>
              Description
            </h3>
            <p className="text-gray-300 leading-relaxed">
              {webinar.description}
            </p>
          </div>
        </Card>
      )}
    </div>
  );
};

export default WebinarInfo;
