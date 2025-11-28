'use client';

import { useState, useEffect } from 'react';
import {
  BarChart,
  Bar,
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
} from 'recharts';
import { format, subDays, parseISO } from 'date-fns';
import { TrendingUp, Users, Clock, CheckCircle } from 'lucide-react';
import { FormCardSkeleton } from './LoadingSkeleton';

interface AnalyticsData {
  form_id: string;
  form_title: string;
  total_responses: number;
  last_response: string | null;
  first_response: string | null;
  avg_responses_per_day: number;
  responses_by_date: Record<string, number>;
  question_analytics: Array<{
    question_id: string;
    prompt: string;
    type: string;
    answered_count: number;
    skipped_count: number;
    completion_rate: number;
    distribution: Record<string, number>;
  }>;
  unique_respondents: number;
}

interface AnalyticsClientProps {
  formId: string;
}

const COLORS = ['#9333ea', '#3b82f6', '#10b981', '#f59e0b', '#ef4444', '#8b5cf6'];

export function AnalyticsClient({ formId }: AnalyticsClientProps) {
  const [analytics, setAnalytics] = useState<AnalyticsData | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchAnalytics();
  }, [formId]);

  const fetchAnalytics = async () => {
    try {
      const res = await fetch(`/api/forms/${formId}/analytics`);
      if (!res.ok) throw new Error('Failed to fetch analytics');
      const data = await res.json();
      setAnalytics(data);
    } catch (error) {
      console.error('Error fetching analytics:', error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          {[1, 2, 3, 4].map((i) => (
            <div key={i} className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 animate-pulse">
              <div className="h-4 bg-gray-200 rounded w-3/4 mb-2"></div>
              <div className="h-8 bg-gray-200 rounded w-1/2"></div>
            </div>
          ))}
        </div>
      </div>
    );
  }

  if (!analytics) {
    return (
      <div className="text-center py-12">
        <p className="text-gray-600">Failed to load analytics</p>
      </div>
    );
  }

  // Prepare response trend data
  const responseTrendData = Object.entries(analytics.responses_by_date)
    .map(([date, count]) => ({
      dateKey: date,
      date: format(parseISO(date), 'MMM dd'),
      responses: count,
    }))
    .sort((a, b) => {
      const dateA = parseISO(a.dateKey);
      const dateB = parseISO(b.dateKey);
      return dateA.getTime() - dateB.getTime();
    })
    .map(({ dateKey, ...rest }) => rest);

  return (
    <div className="space-y-6">
      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600 mb-1">Total Responses</p>
              <p className="text-3xl font-bold text-gray-900">
                {analytics.total_responses}
              </p>
            </div>
            <div className="p-3 bg-primary-100 rounded-full">
              <CheckCircle className="w-6 h-6 text-primary-600" />
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600 mb-1">Avg. per Day</p>
              <p className="text-3xl font-bold text-gray-900">
                {analytics.avg_responses_per_day.toFixed(1)}
              </p>
            </div>
            <div className="p-3 bg-blue-100 rounded-full">
              <TrendingUp className="w-6 h-6 text-blue-600" />
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600 mb-1">Unique Respondents</p>
              <p className="text-3xl font-bold text-gray-900">
                {analytics.unique_respondents}
              </p>
            </div>
            <div className="p-3 bg-green-100 rounded-full">
              <Users className="w-6 h-6 text-green-600" />
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600 mb-1">Last Response</p>
              <p className="text-lg font-semibold text-gray-900">
                {analytics.last_response
                  ? format(parseISO(analytics.last_response), 'MMM dd, yyyy')
                  : 'No responses'}
              </p>
              {analytics.last_response && (
                <p className="text-xs text-gray-500 mt-1">
                  {format(parseISO(analytics.last_response), 'h:mm a')}
                </p>
              )}
            </div>
            <div className="p-3 bg-yellow-100 rounded-full">
              <Clock className="w-6 h-6 text-yellow-600" />
            </div>
          </div>
        </div>
      </div>

      {/* Response Trend Chart */}
      {responseTrendData.length > 0 && (
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
          <h2 className="text-lg font-semibold text-gray-900 mb-4">
            Response Trend (Last 30 Days)
          </h2>
          <ResponsiveContainer width="100%" height={300}>
            <LineChart data={responseTrendData}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="date" />
              <YAxis />
              <Tooltip />
              <Legend />
              <Line
                type="monotone"
                dataKey="responses"
                stroke="#9333ea"
                strokeWidth={2}
                name="Responses"
              />
            </LineChart>
          </ResponsiveContainer>
        </div>
      )}

      {/* Question Analytics */}
      <div className="space-y-6">
        <h2 className="text-lg font-semibold text-gray-900">Question Analytics</h2>
        {analytics.question_analytics.map((qa) => (
          <div
            key={qa.question_id}
            className="bg-white rounded-lg shadow-sm border border-gray-200 p-6"
          >
            <div className="mb-4">
              <h3 className="font-medium text-gray-900 mb-2">{qa.prompt}</h3>
              <div className="flex items-center gap-4 text-sm text-gray-600">
                <span>
                  Answered: {qa.answered_count} / {analytics.total_responses}
                </span>
                <span>Skipped: {qa.skipped_count}</span>
                <span>
                  Completion: {qa.completion_rate.toFixed(1)}%
                </span>
              </div>
            </div>

            {/* Distribution Charts */}
            {Object.keys(qa.distribution).length > 0 && (
              <div className="mt-4">
                {qa.type === 'mcq' || qa.type === 'checkbox' || qa.type === 'linear_scale' ? (
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div>
                      <h4 className="text-sm font-medium text-gray-700 mb-3">
                        Response Distribution
                      </h4>
                      <ResponsiveContainer width="100%" height={250}>
                        <BarChart data={Object.entries(qa.distribution).map(([key, value]) => ({
                          name: key,
                          count: value,
                        }))}>
                          <CartesianGrid strokeDasharray="3 3" />
                          <XAxis dataKey="name" />
                          <YAxis />
                          <Tooltip />
                          <Bar dataKey="count" fill="#9333ea" />
                        </BarChart>
                      </ResponsiveContainer>
                    </div>
                    <div>
                      <h4 className="text-sm font-medium text-gray-700 mb-3">
                        Percentage Breakdown
                      </h4>
                      <ResponsiveContainer width="100%" height={250}>
                        <PieChart>
                          <Pie
                            data={Object.entries(qa.distribution).map(([key, value]) => ({
                              name: key,
                              value: value,
                            }))}
                            cx="50%"
                            cy="50%"
                            labelLine={false}
                            label={({ name, percent }) =>
                              `${name}: ${(percent * 100).toFixed(0)}%`
                            }
                            outerRadius={80}
                            fill="#8884d8"
                            dataKey="value"
                          >
                            {Object.entries(qa.distribution).map((_, index) => (
                              <Cell
                                key={`cell-${index}`}
                                fill={COLORS[index % COLORS.length]}
                              />
                            ))}
                          </Pie>
                          <Tooltip />
                        </PieChart>
                      </ResponsiveContainer>
                    </div>
                  </div>
                ) : (
                  <div className="mt-4">
                    <h4 className="text-sm font-medium text-gray-700 mb-3">
                      Response Summary
                    </h4>
                    <div className="bg-gray-50 rounded-md p-4">
                      <p className="text-sm text-gray-600">
                        {qa.answered_count} responses received
                      </p>
                      {qa.completion_rate < 100 && (
                        <p className="text-xs text-yellow-600 mt-1">
                          {qa.skipped_count} respondents skipped this question
                        </p>
                      )}
                    </div>
                  </div>
                )}
              </div>
            )}
          </div>
          ))}
        </div>
      )}

      {analytics.total_responses === 0 && (
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-12 text-center">
          <p className="text-gray-600 mb-2">No responses yet</p>
          <p className="text-sm text-gray-500">
            Share your form to start collecting responses
          </p>
        </div>
      )}
    </div>
  );
}

