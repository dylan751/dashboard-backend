export const HTTP_EXCEPTION_ERROR_MESSAGES = {
  AGENT_UNAUTHORIZED_ACTION: 'This agent cannot perform this action',
  FORBIDDEN_RESOURCE: 'forbidden resource',
  INVALID_JWT_TOKEN: 'invalid token',
  MISSING_JWT_TOKEN: 'missing JWT token',
  MISSING_DATA_PAYLOAD: 'missing user data in payload',
  USER_DOES_NOT_EXIST: "user doesn't exist",
  USER_EMAIL_MUST_UNIQUE: "user's email must be unique",
  INVALID_PASSWORD: 'Invalid password',
  GROUP_DOES_NOT_EXIST: "group doesn't exist",
  GROUP_HAS_MEMBERS: 'group has members that cannot be removed',
  GROUP_DISP_NAME_MUST_UNIQUE: "group's display name must be unique",
  PHONE_NUMBER_DOES_NOT_EXIST: "phone number doesn't exist",
  PHONE_NUMBER_MUST_UNIQUE: 'phone number must be unique',
  PHONE_NUMBER_DOMAIN_AND_ACCOUNT_MUST_UNIQUE:
    'domain and account id must be unique',
  CUSTOMER_DOES_NOT_EXIST: "customer doesn't exist",
  IVR_FLOW_DOES_NOT_EXIST: "ivr flow doesn't exist",
  IVR_AUDIO_DOES_NOT_EXIST: "ivr audio doesn't exist",
  ROLE_DOES_NOT_EXIST: "role doesn't exist",
  ROLE_MUST_UNIQUE: 'role name must be unique',
  PHONE_NUMBER_EXIST: 'phone number exists',
  AUDIO_EXIST: 'audio name exists',
  IVR_EXIST: 'ivr name exists',
  AGENT_USER_IS_BEING_USED: 'cannot delete while agent user is being used',
  ROLE_IS_BEING_ASSIGNED: 'cannot delete role while being assigned to user',
  ROLE_DEFAULT_CANNOT_BE_DELETED: 'cannot delete role default',
  ENTRY_POINT_ERROR: 'Entry point must point to 1 node',
  CUSTOMER_INPUT_INVALID_DATA:
    'Customer Input node must have audio file and branches',
  CUSTOMER_INPUT_INVALID_CONNECTION:
    'Missing connections of Customer Input node',
  WORKING_HOUR_INVALID_DATA: 'Working Hour node must have branches',
  WORKING_HOUR_INVALID_CONNECTION: 'Missing connections of Working Hour node',
  VOICE_INVALID_DATA: 'Voice node must have audio file',
  VOICE_INVALID_CONNECTION: 'Missing connections of Voice node',
  CONTACT_TARGET_INVALID_DATA:
    'Contact target node must transfer to a group or agent',
  CONTACT_TARGET_INVALID_GROUP: 'Contact target node must transfer to a group',
  CONTACT_TARGET_INVALID_AGENT: 'Contact target node must transfer to a agent',
  CONTACT_TARGET_INVALID_CONNECTION:
    'Missing connections of Contact target node',
  NODE_INVALID_CONNECTION: 'Missing connections of nodes',
  CALL_LOG_DOES_NOT_EXIST: "call log doesn't exist",
  CALL_LOG_QUERY_MISSING_PHONE_NUMBER:
    'You must provide a phone number when selecting type',
  CUSTOMER_NOTE_DOES_NOT_EXIST: 'This note does not exist',
  TRANSCRIPT_LINK_DOES_NOT_EXIST: 'Transcript link doesnt exist',
  NOTE_DOES_NOT_EXIST: 'This note does not exist',
  COMPANY_CODE_INVALID: 'Company code is invalid',
  CALL_NOTE_DOES_NOT_EXIST: 'call note doesnt exist',
  CALL_NOTE_CREATE_MORE_THAN_ONE: 'cannot create more note for this call log',
  CALL_NOTE_MEMO_TAG_MUST_UNIQUE: 'call note memo must be unique',
  CALL_NOTE_MEMO_TAG_DOES_NOT_EXIST: 'call note memo tag doesnt exist',
  CUSTOMER_PHONE_NUMBER_EXIST:
    'customer with this phone number already existed',
  CUSTOMER_EMAIL_EXIST: 'customer with this email already existed',
  CUSTOMER_COMPANY_DOES_NOT_EXIST: 'customer company doesnt exist',
  CUSTOMER_COMPANY_ALREADY_EXISTED: 'customer company already existed',
  CUSTOMER_COMPANY_CREATE_FAILED: 'failed to create customer company',
  CUSTOMER_COMPANY_FIND_FAILED: 'failed to find customer company',
  DEVICE_DOES_NOT_EXIST: 'Device doesnt exist',
  ROOT_USER_CANNOT_BE_DELETED: 'cannot delete root user',
  ROOT_USER_CANNOT_REMOVE_ROLE_DEFAULT:
    'cannot remove default role of root user',
  SLACK_WORKSPACE_DOES_NOT_EXIST: 'slack workspace doesnt exist',
  SLACK_AUTHED_USER_DOES_NOT_EXIST:
    'authed user on slack workspace doesnt exist',
};

export const HTTP_RESPONSE_MESSAGE = {
  SUCCESSFULLY_DELETE_NOTE: (id: number) =>
    `Successfully remove the note ${id}`,
};

export const HTTP_EXCEPTION_ERROR_CODE = {
  // INTERNAL ERROR: 10XX
  FORBIDDEN_RESOURCE: 1000,
  VALIDATION_ERROR: 1001,
  JWT_VALIDATION_ERROR: 1002,
  MISSING_JWT_TOKEN: 1003,
  // GOTRUE AUTH: 11XX
  GOTRUE_FORBIDDEN: 1101,
  GOTRUE_AUTH_FAILED: 1102,
  GOTRUE_FAILED: 1103,
  INVALID_PASSWORD: 1104,

  // USER: 20XX
  USER_DOES_NOT_EXIST: 2001,
  USER_UPDATE_FORBIDDEN: 2002,
  USER_UPDATE_FAILED: 2003,
  USER_FIND_FAILED: 2004,
  UNAUTHORIZED_TO_REMOVE_USER: 2005,
  USER_DELETE_FAILED: 2006,
  USER_LIST_FAILED: 2007,
  USER_CREATE_FAILED: 2008,
  USER_EMAIL_MUST_UNIQUE: 2009,
  ROOT_USER_CANNOT_BE_DELETED: 2010,
  ROOT_USER_CANNOT_REMOVE_ROLE_DEFAULT: 2011,
  //TOUR: 21XX
  TOUR_LIST_FAILED: 2101,
};

export const HTTP_VALIDATION_ERROR_MESSAGE = {
  IsCustomerExisted: 'Customer does not exist',
};

export enum Strategy {
  ringall = 'ringall',
  roundrobin = 'roundrobin',
  leastrecent = 'leastrecent',
  fewestcalls = 'fewestcalls',
  random = 'random',
  rrmemory = 'rrmemory',
}

export enum GotrueRoles {
  ADMIN = 'admin',
  USER = 'user',
}

export enum nodeType {
  entryPoint = 'ENTRY_POINT',
  customerInput = 'CUSTOMER_INPUT',
  contactTarget = 'CONTACT_TARGET',
  voice = 'VOICE',
  disconnect = 'DISCONNECT',
  workingHour = 'WORKING_HOUR',
  voiceMail = 'VOICE_MAIL',
}

export enum CALL_LOG_DIRECTION {
  INCOMING = 'incoming',
  OUTGOING = 'outgoing',
}

export enum DEVICE_TYPE {
  WEB = 'WEB',
  IOS = 'IOS',
  ANDROID = 'ANDROID',
}

export enum AGGREGATION_CALL_TYPE {
  INCOMING = 'Incoming',
  OUTGOING = 'Outgoing',
  MISSED = 'Missed',
  ABSENT = 'Absent',
  ALL = 'All',
}

export enum AGGREGATION_PERIOD_CALL_LOG {
  THREE_DAYS = '3D',
  SEVEN_DAYS = '7D',
  FOURTEEN_DAYS = '14D',
  TWENTY_EIGHT_DAYS = '28D',
}

export enum USER_ROLE {
  DEFAULT = 'default',
}
