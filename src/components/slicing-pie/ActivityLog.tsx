"use client";

import React from "react";
import { Card, CardBody, CardHeader } from "@/components/ui/Card";
import type { ActivityEvent } from "@/types/slicingPie";
import { formatSlices } from "@/utils/slicingPie";
import { TrashIcon, ArrowUturnLeftIcon } from "@heroicons/react/24/outline";

interface ActivityLogProps {
  events: ActivityEvent[];
  title?: string;
  showCard?: boolean;
  maxHeight?: string;
}

function formatRelativeTime(timestamp: string): string {
  const date = new Date(timestamp);
  const now = new Date();
  const diffMs = now.getTime() - date.getTime();
  const diffMins = Math.floor(diffMs / 60000);
  const diffHours = Math.floor(diffMs / 3600000);
  const diffDays = Math.floor(diffMs / 86400000);

  if (diffMins < 1) return "Just now";
  if (diffMins < 60) return `${diffMins}m ago`;
  if (diffHours < 24) return `${diffHours}h ago`;
  if (diffDays < 7) return `${diffDays}d ago`;

  return date.toLocaleDateString();
}

function ActivityEventItem({ event }: { event: ActivityEvent }) {
  const isDelete = event.type === "deleted";
  const Icon = isDelete ? TrashIcon : ArrowUturnLeftIcon;
  const iconColor = isDelete ? "text-red-500" : "text-green-500";
  const bgColor = isDelete ? "bg-red-50" : "bg-green-50";

  const entityLabel = event.entityType === "contributor" ? "Contributor" : "Contribution";
  const actionLabel = isDelete ? "deleted" : "restored";

  return (
    <div className={`flex items-start gap-3 rounded-lg p-3 ${bgColor}`}>
      <div className={`mt-0.5 ${iconColor}`}>
        <Icon className="h-4 w-4" />
      </div>
      <div className="flex-1 min-w-0">
        <p className="text-sm text-gray-900">
          <span className="font-medium">{event.entityName}</span>
          <span className="text-gray-500"> {actionLabel}</span>
        </p>
        <div className="mt-1 flex flex-wrap items-center gap-2 text-xs text-gray-500">
          <span>{entityLabel}</span>
          <span className="text-gray-300">|</span>
          <span>{formatSlices(event.slicesAffected)} slices</span>
          {event.cascadeCount !== undefined && event.cascadeCount > 0 && (
            <>
              <span className="text-gray-300">|</span>
              <span>
                {event.cascadeCount} contribution{event.cascadeCount !== 1 ? "s" : ""} affected
              </span>
            </>
          )}
        </div>
      </div>
      <div className="text-xs text-gray-400 whitespace-nowrap">
        {formatRelativeTime(event.timestamp)}
      </div>
    </div>
  );
}

export function ActivityLog({
  events,
  title = "Recent Activity",
  showCard = true,
  maxHeight = "400px",
}: ActivityLogProps) {
  if (events.length === 0) {
    const content = (
      <div className="py-8 text-center text-sm text-gray-500">
        No deletion or restoration activity yet.
      </div>
    );

    if (showCard) {
      return (
        <Card>
          <CardHeader>
            <h3 className="text-lg font-semibold text-gray-900">{title}</h3>
          </CardHeader>
          <CardBody>{content}</CardBody>
        </Card>
      );
    }

    return content;
  }

  const content = (
    <div className="space-y-2" style={{ maxHeight, overflowY: "auto" }}>
      {events.map((event) => (
        <ActivityEventItem key={event.id} event={event} />
      ))}
    </div>
  );

  if (showCard) {
    return (
      <Card>
        <CardHeader>
          <h3 className="text-lg font-semibold text-gray-900">{title}</h3>
        </CardHeader>
        <CardBody>{content}</CardBody>
      </Card>
    );
  }

  return content;
}

export default ActivityLog;
