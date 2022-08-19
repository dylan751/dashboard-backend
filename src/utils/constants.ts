export const HTTP_EXCEPTION_ERROR_MESSAGES = {
  AGENT_UNAUTHORIZED_ACTION: 'This agent cannot perform this action',
  FORBIDDEN_RESOURCE: 'forbidden resource',
  INVALID_JWT_TOKEN: 'invalid token',
  MISSING_JWT_TOKEN: 'missing JWT token',
  MISSING_DATA_PAYLOAD: 'missing user data in payload',
  USER_DOES_NOT_EXIST: "user doesn't exist",
  USER_EMAIL_MUST_UNIQUE: "user's email must be unique",
  INVALID_PASSWORD: 'Invalid password',

  TOUR_TITLE_MUST_UNIQUE: "Tour's title must be unique",
  TOUR_DOES_NOT_EXIST: 'Tour does not exist',

  DESTINATION_NAME_MUST_UNIQUE: "Destination's name must be unique",
  DESTINATION_DOES_NOT_EXIST: 'Destination does not exist',

  FORM_DOES_NOT_EXIST: 'Form does not exist',
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
  TOUR_TITLE_MUST_UNIQUE: 2102,
  TOUR_CREATE_FAILED: 2103,
  TOUR_DOES_NOT_EXIST: 2104,
  TOUR_FIND_FAILED: 2105,
  TOUR_UPDATE_FAILED: 2106,
  TOUR_DELETE_FAILED: 2107,
  // DESTINATION: 22XX
  DESTINATION_LIST_FAILED: 2201,
  DESTINATION_NAME_MUST_UNIQUE: 2202,
  DESTINATION_CREATE_FAILED: 2203,
  DESTINATION_DOES_NOT_EXIST: 2204,
  DESTINATION_FIND_FAILED: 2205,
  DESTINATION_UPDATE_FAILED: 2206,
  DESTINATION_DELETE_FAILED: 2207,
  // FORM: 23XX
  FORM_LIST_FAILED: 2301,
  FORM_NAME_MUST_UNIQUE: 2302,
  FORM_CREATE_FAILED: 2303,
  FORM_DOES_NOT_EXIST: 2304,
  FORM_FIND_FAILED: 2305,
  FORM_UPDATE_FAILED: 2306,
  FORM_DELETE_FAILED: 2307,
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
