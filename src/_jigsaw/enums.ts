export enum UserTimezoneConstants {
  UTC = 'UTC',
  AMERICA_NEW_YORK = 'America/New_York',
  AMERICA_CHICAGO = 'America/Chicago',
  AMERICA_DENVER = 'America/Denver',
  AMERICA_LOS_ANGELES = 'America/Los_Angeles',
  EUROPE_LONDON = 'Europe/London',
  EUROPE_PARIS = 'Europe/Paris',
  EUROPE_BERLIN = 'Europe/Berlin',
  EUROPE_MOSCOW = 'Europe/Moscow',
  ASIA_DUBAI = 'Asia/Dubai',
  ASIA_KOLKATA = 'Asia/Kolkata',
  ASIA_SHANGHAI = 'Asia/Shanghai',
  ASIA_TOKYO = 'Asia/Tokyo',
  AUSTRALIA_SYDNEY = 'Australia/Sydney',
  AMERICA_SAO_PAULO = 'America/Sao_Paulo',
}

export enum HmsRoomUserRoles {
  hiring_manager = 'hiring-manager',
  candidate = 'candidate',
  mentor = 'mentor',
}

export enum HmsRoomWebhookTypes {
  recordingSuccess = 'recording.success',
  recordingFailed = 'recording.failed',
  beamRecordingSuceess = 'beam.recording.success',
  beamRecordingFailed = 'beam.recording.failed',
}

export enum CronJobConstants {
  refreshCandidateSkillRatings = 'refresh.candidates.skill.ratings',
  refreshPrevettedCandidates = 'refresh.prevetted.candidates',
  archiveFlaggedQuestions = 'archive.flagged.questions',
}
