
export interface MinuteEntry {
  timestamp: string;
  speaker: string;
  dialogue: string;
}

export interface MeetingReport {
  executiveSummary: string;
  minutes: MinuteEntry[];
}
