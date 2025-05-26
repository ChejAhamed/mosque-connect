"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import {
  TrendingUpIcon,
  TrendingDownIcon,
  MinusIcon,
  UsersIcon,
  ClipboardCheckIcon,
  EyeIcon,
  BuildingIcon
} from "lucide-react";

export default function VolunteerStatsCard({ 
  title, 
  value, 
  subtitle, 
  icon: Icon, 
  trend, 
  trendValue,
  breakdown = [],
  color = "blue" 
}) {
  const getColorClasses = (color) => {
    const colorMap = {
      blue: "bg-blue-50 text-blue-600 border-blue-100",
      green: "bg-green-50 text-green-600 border-green-100",
      purple: "bg-purple-50 text-purple-600 border-purple-100",
      orange: "bg-orange-50 text-orange-600 border-orange-100",
      red: "bg-red-50 text-red-600 border-red-100"
    };
    return colorMap[color] || colorMap.blue;
  };

  const getTrendIcon = () => {
    if (trend === "up") return <TrendingUpIcon className="h-3 w-3 text-green-600" />;
    if (trend === "down") return <TrendingDownIcon className="h-3 w-3 text-red-600" />;
    return <MinusIcon className="h-3 w-3 text-gray-400" />;
  };

  const getTrendColor = () => {
    if (trend === "up") return "text-green-600";
    if (trend === "down") return "text-red-600";
    return "text-gray-400";
  };

  return (
    <Card className="hover:shadow-md transition-shadow">
      <CardHeader className={`${getColorClasses(color)} pb-3`}>
        <CardTitle className="flex items-center justify-between">
          <div className="flex items-center">
            {Icon && <Icon className="mr-2 h-5 w-5" />}
            <span className="text-sm font-medium">{title}</span>
          </div>
          {trend && trendValue && (
            <div className={`flex items-center text-xs ${getTrendColor()}`}>
              {getTrendIcon()}
              <span className="ml-1">{trendValue}</span>
            </div>
          )}
        </CardTitle>
      </CardHeader>
      <CardContent className="pt-6">
        <div className="space-y-3">
          <div>
            <p className="text-3xl font-bold">{value}</p>
            {subtitle && (
              <p className="text-gray-500 text-sm mt-1">{subtitle}</p>
            )}
          </div>

          {breakdown.length > 0 && (
            <div className="space-y-2">
              {breakdown.map((item, index) => (
                <div key={index} className="flex items-center justify-between">
                  <div className="flex items-center space-x-2">
                    <div className={`w-2 h-2 rounded-full ${item.color || 'bg-gray-300'}`} />
                    <span className="text-sm text-gray-600">{item.label}</span>
                  </div>
                  <div className="flex items-center space-x-2">
                    <span className="text-sm font-medium">{item.value}</span>
                    {item.percentage !== undefined && (
                      <Badge variant="outline" className="text-xs">
                        {item.percentage}%
                      </Badge>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}

          {breakdown.length > 0 && breakdown.some(item => item.percentage !== undefined) && (
            <div className="mt-3">
              <div className="flex justify-between text-xs text-gray-500 mb-1">
                <span>Completion</span>
                <span>{Math.round(breakdown.reduce((acc, item) => acc + (item.percentage || 0), 0) / breakdown.length)}%</span>
              </div>
              <Progress 
                value={breakdown.reduce((acc, item) => acc + (item.percentage || 0), 0) / breakdown.length} 
                className="h-2"
              />
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
}