export enum FieldKind {
  TEXT_SINGLE = 'text-single',
  TEXT_MULTI = 'text-multi',
  NUMBER = 'number',
  DATE = 'date',
  TIME = 'time',
  EMAIL = 'email',
  URL = 'url',
  ADDRESS = 'address',
  SINGLE_SELECT = 'single-select',
  MULTI_SELECT = 'multi-select',
  FILE_UPLOAD = 'file-upload',
  SECTION_HEADER = 'section-header',
  CALCULATION = 'calculation',
  RATING = 'rating',
  LINEAR_SCALE = 'linear-scale',
  PHONE = 'phone',
  SIGNATURE = 'signature',
}

export enum BuilderTab {
  FIELD = 'Field',
  LOGIC = 'Logic',
  VALIDATION = 'Validation',
}

export enum BuilderActionType {
  ADD_FIELD = 'ADD_FIELD',
  REMOVE_FIELD = 'REMOVE_FIELD',
  UPDATE_FIELD = 'UPDATE_FIELD',
  MOVE_FIELD = 'MOVE_FIELD',
  SELECT_FIELD = 'SELECT_FIELD',
  DUPLICATE_FIELD = 'DUPLICATE_FIELD',
  UPDATE_SETTINGS = 'UPDATE_SETTINGS',
  SET_TITLE = 'SET_TITLE',
  MARK_SAVED = 'MARK_SAVED',
}

export enum FillActionType {
  SET_ANSWER = 'SET_ANSWER',
  SET_ERRORS = 'SET_ERRORS',
  SET_SUBMIT_ERROR = 'SET_SUBMIT_ERROR',
  MARK_SUBMITTED = 'MARK_SUBMITTED',
  RESET = 'RESET',
  LOAD_DRAFT = 'LOAD_DRAFT',
}

export enum FieldGroup {
  INPUT = 'input',
  SELECT = 'select',
  DISPLAY = 'display',
  SPECIAL = 'special',
}

export enum ConditionOperator {
  EQUALS = 'equals',
  NOT_EQUALS = 'not_equals',
  CONTAINS = 'contains',
  GREATER_THAN = 'greater_than',
  LESS_THAN = 'less_than',
  IS_EMPTY = 'is_empty',
  IS_NOT_EMPTY = 'is_not_empty',
  // Date operators
  IS_BEFORE = 'is_before',
  IS_AFTER = 'is_after',
  // Number range
  IS_WITHIN_RANGE = 'is_within_range',
  // Multi-select operators
  CONTAINS_ANY_OF = 'contains_any_of',
  CONTAINS_ALL_OF = 'contains_all_of',
  CONTAINS_NONE_OF = 'contains_none_of',
}

export enum ConditionEffect {
  SHOW = 'show',
  HIDE = 'hide',
  REQUIRE = 'require',
  UNREQUIRE = 'unrequire',
}

export enum CalculationOperation {
  SUM = 'sum',
  AVG = 'avg',
  MIN = 'min',
  MAX = 'max',
}

export enum SingleSelectVariant {
  RADIO = 'radio',
  DROPDOWN = 'dropdown',
  TILES = 'tiles',
  COMBOBOX = 'combobox',
}

export enum SectionHeaderSize {
  XS = 'xs',
  SM = 'sm',
  MD = 'md',
  LG = 'lg',
  XL = 'xl',
}

export enum GridItemKind {
  NEW = 'new',
  TEMPLATE = 'template',
}
