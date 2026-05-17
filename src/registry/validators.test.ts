/**
 * Tests for all registry plugin validate() functions.
 * These are pure functions — no React rendering needed.
 */
import { describe, it, expect } from 'vitest';
import { textSinglePlugin } from './text-single';
import { textMultiPlugin } from './text-multi';
import { numberPlugin } from './number';
import { emailPlugin } from './email';
import { urlPlugin } from './url';
import { datePlugin } from './date';
import { timePlugin } from './time';
import { singleSelectPlugin } from './single-select';
import { multiSelectPlugin } from './multi-select';
import { ratingPlugin } from './rating';
import { linearScalePlugin } from './linear-scale';
import { addressPlugin } from './address';
import { sectionHeaderPlugin } from './section-header';
import { calculationPlugin } from './calculation';
import { FieldKind, CalculationOperation, SingleSelectVariant } from '../enums';
import { OTHER_OPTION_ID } from '../types/fields';
import type {
  TextSingleConfig,
  TextMultiConfig,
  NumberConfig,
  EmailConfig,
  UrlConfig,
  DateConfig,
  TimeConfig,
  SingleSelectConfig,
  MultiSelectConfig,
  RatingConfig,
  LinearScaleConfig,
  AddressConfig,
  SectionHeaderConfig,
  CalculationConfig,
} from '../types/fields';

// ---------------------------------------------------------------------------
// Factories
// ---------------------------------------------------------------------------

function base(id = 'f1') {
  return { id, label: 'Field', conditions: [], defaultVisible: true, defaultRequired: false };
}

function makeText(overrides: Partial<TextSingleConfig> = {}): TextSingleConfig {
  return { ...base(), kind: FieldKind.TEXT_SINGLE, ...overrides };
}

function makeTextMulti(overrides: Partial<TextMultiConfig> = {}): TextMultiConfig {
  return { ...base(), kind: FieldKind.TEXT_MULTI, ...overrides };
}

function makeNumber(overrides: Partial<NumberConfig> = {}): NumberConfig {
  return { ...base(), kind: FieldKind.NUMBER, ...overrides };
}

function makeEmail(overrides: Partial<EmailConfig> = {}): EmailConfig {
  return { ...base(), kind: FieldKind.EMAIL, ...overrides };
}

function makeUrl(overrides: Partial<UrlConfig> = {}): UrlConfig {
  return { ...base(), kind: FieldKind.URL, ...overrides };
}

function makeDate(overrides: Partial<DateConfig> = {}): DateConfig {
  return { ...base(), kind: FieldKind.DATE, prefillToday: false, ...overrides };
}

function makeTime(overrides: Partial<TimeConfig> = {}): TimeConfig {
  return { ...base(), kind: FieldKind.TIME, ...overrides };
}

function makeSingleSelect(overrides: Partial<SingleSelectConfig> = {}): SingleSelectConfig {
  return {
    ...base(),
    kind: FieldKind.SINGLE_SELECT,
    options: [{ id: 'opt-1', label: 'Option 1' }],
    variant: SingleSelectVariant.RADIO,
    allowOther: false,
    shuffleOptions: false,
    ...overrides,
  };
}

function makeMultiSelect(overrides: Partial<MultiSelectConfig> = {}): MultiSelectConfig {
  return {
    ...base(),
    kind: FieldKind.MULTI_SELECT,
    options: [{ id: 'opt-1', label: 'A' }, { id: 'opt-2', label: 'B' }],
    minSelections: null,
    maxSelections: null,
    searchable: false,
    allowOther: false,
    shuffleOptions: false,
    ...overrides,
  };
}

function makeRating(overrides: Partial<RatingConfig> = {}): RatingConfig {
  return { ...base(), kind: FieldKind.RATING, maxRating: 5, ...overrides };
}

function makeLinearScale(overrides: Partial<LinearScaleConfig> = {}): LinearScaleConfig {
  return { ...base(), kind: FieldKind.LINEAR_SCALE, minValue: 1, maxValue: 5, ...overrides };
}

function makeAddress(overrides: Partial<AddressConfig> = {}): AddressConfig {
  return {
    ...base(),
    kind: FieldKind.ADDRESS,
    includeStreet2: true,
    includeState: true,
    includeZip: true,
    ...overrides,
  };
}

function makeSection(): SectionHeaderConfig {
  return { ...base(), kind: FieldKind.SECTION_HEADER, size: 'md' as never };
}

function makeCalc(): CalculationConfig {
  return {
    ...base(),
    kind: FieldKind.CALCULATION,
    operation: CalculationOperation.SUM,
    sourceFieldIds: [],
  };
}

// ---------------------------------------------------------------------------
// text-single
// ---------------------------------------------------------------------------

describe('textSinglePlugin.validate', () => {
  it('returns null when value is present and no constraints', () => {
    expect(textSinglePlugin.validate('hello', makeText(), false)).toBeNull();
  });

  it('returns error when required and empty', () => {
    expect(textSinglePlugin.validate('', makeText(), true)).toMatch(/required/i);
  });

  it('returns error when required and whitespace only', () => {
    expect(textSinglePlugin.validate('   ', makeText(), true)).toMatch(/required/i);
  });

  it('returns null when not required and empty', () => {
    expect(textSinglePlugin.validate('', makeText(), false)).toBeNull();
  });

  it('returns error when value is shorter than minLength', () => {
    expect(textSinglePlugin.validate('hi', makeText({ minLength: 5 }), false)).toMatch(/at least 5/i);
  });

  it('returns null when value meets minLength exactly', () => {
    expect(textSinglePlugin.validate('hello', makeText({ minLength: 5 }), false)).toBeNull();
  });

  it('returns error when value exceeds maxLength', () => {
    expect(textSinglePlugin.validate('toolong', makeText({ maxLength: 3 }), false)).toMatch(/at most 3/i);
  });

  it('returns error when value does not match validationPattern', () => {
    expect(textSinglePlugin.validate('abc', makeText({ validationPattern: '^[0-9]+$' }), false)).toMatch(/invalid format/i);
  });

  it('returns null when value matches validationPattern', () => {
    expect(textSinglePlugin.validate('123', makeText({ validationPattern: '^[0-9]+$' }), false)).toBeNull();
  });

  it('uses custom validationMessage for pattern failure', () => {
    const config = makeText({ validationPattern: '^[A-Z]+$', validationMessage: 'Uppercase only' });
    expect(textSinglePlugin.validate('abc', config, false)).toBe('Uppercase only');
  });

  it('does not throw on invalid regex — skips pattern check silently', () => {
    expect(() => textSinglePlugin.validate('abc', makeText({ validationPattern: '[invalid' }), false)).not.toThrow();
  });

  it('uses custom requiredMessage when field is required', () => {
    const config = makeText({ requiredMessage: 'Oops, fill this in' });
    expect(textSinglePlugin.validate('', config, true)).toBe('Oops, fill this in');
  });
});

// ---------------------------------------------------------------------------
// text-multi
// ---------------------------------------------------------------------------

describe('textMultiPlugin.validate', () => {
  it('returns null for valid non-empty value', () => {
    expect(textMultiPlugin.validate('hello world', makeTextMulti(), false)).toBeNull();
  });

  it('returns error when required and empty', () => {
    expect(textMultiPlugin.validate('', makeTextMulti(), true)).toMatch(/required/i);
  });

  it('validates minLength', () => {
    expect(textMultiPlugin.validate('hi', makeTextMulti({ minLength: 10 }), false)).toMatch(/at least 10/i);
  });

  it('validates maxLength', () => {
    expect(textMultiPlugin.validate('a very long string', makeTextMulti({ maxLength: 5 }), false)).toMatch(/at most 5/i);
  });
});

// ---------------------------------------------------------------------------
// number
// ---------------------------------------------------------------------------

describe('numberPlugin.validate', () => {
  it('returns null for a valid number', () => {
    expect(numberPlugin.validate(42, makeNumber(), false)).toBeNull();
  });

  it('returns error when required and null', () => {
    expect(numberPlugin.validate(null, makeNumber(), true)).toMatch(/required/i);
  });

  it('returns error for non-numeric string', () => {
    expect(numberPlugin.validate('abc', makeNumber(), false)).toMatch(/valid number/i);
  });

  it('returns error when number is below min', () => {
    expect(numberPlugin.validate(3, makeNumber({ min: 5 }), false)).toMatch(/at least 5/i);
  });

  it('returns error when number exceeds max', () => {
    expect(numberPlugin.validate(100, makeNumber({ max: 50 }), false)).toMatch(/at most 50/i);
  });

  it('returns error when non-integer value with decimalPlaces=0', () => {
    expect(numberPlugin.validate(3.5, makeNumber({ decimalPlaces: 0 }), false)).toMatch(/whole number/i);
  });

  it('returns null when integer value with decimalPlaces=0', () => {
    expect(numberPlugin.validate(4, makeNumber({ decimalPlaces: 0 }), false)).toBeNull();
  });

  it('returns null when not required and null', () => {
    expect(numberPlugin.validate(null, makeNumber(), false)).toBeNull();
  });
});

// ---------------------------------------------------------------------------
// email
// ---------------------------------------------------------------------------

describe('emailPlugin.validate', () => {
  it('returns null for a valid email', () => {
    expect(emailPlugin.validate('user@example.com', makeEmail(), false)).toBeNull();
  });

  it('returns error when required and empty', () => {
    expect(emailPlugin.validate('', makeEmail(), true)).toMatch(/required/i);
  });

  it('returns error for email without @', () => {
    expect(emailPlugin.validate('notanemail', makeEmail(), false)).toMatch(/valid email/i);
  });

  it('returns error for email without domain', () => {
    expect(emailPlugin.validate('user@', makeEmail(), false)).toMatch(/valid email/i);
  });

  it('returns null when not required and empty', () => {
    expect(emailPlugin.validate('', makeEmail(), false)).toBeNull();
  });

  it('uses custom validationMessage on format failure', () => {
    const config = makeEmail({ validationMessage: 'Bad email' });
    expect(emailPlugin.validate('bad', config, false)).toBe('Bad email');
  });
});

// ---------------------------------------------------------------------------
// url
// ---------------------------------------------------------------------------

describe('urlPlugin.validate', () => {
  it('returns null for a valid URL', () => {
    expect(urlPlugin.validate('https://example.com', makeUrl(), false)).toBeNull();
  });

  it('returns error for an invalid URL', () => {
    expect(urlPlugin.validate('not-a-url', makeUrl(), false)).toMatch(/valid url/i);
  });

  it('returns error when required and empty', () => {
    expect(urlPlugin.validate('', makeUrl(), true)).toMatch(/required/i);
  });

  it('returns null when not required and empty', () => {
    expect(urlPlugin.validate('', makeUrl(), false)).toBeNull();
  });

  it('accepts http URLs', () => {
    expect(urlPlugin.validate('http://example.com', makeUrl(), false)).toBeNull();
  });
});

// ---------------------------------------------------------------------------
// date
// ---------------------------------------------------------------------------

describe('datePlugin.validate', () => {
  it('returns null for a valid date string', () => {
    expect(datePlugin.validate('2024-06-15', makeDate(), false)).toBeNull();
  });

  it('returns error when required and empty', () => {
    expect(datePlugin.validate('', makeDate(), true)).toMatch(/required/i);
  });

  it('returns error when date is before minDate', () => {
    expect(datePlugin.validate('2023-01-01', makeDate({ minDate: '2024-01-01' }), false)).toMatch(/on or after/i);
  });

  it('returns null when date equals minDate', () => {
    expect(datePlugin.validate('2024-01-01', makeDate({ minDate: '2024-01-01' }), false)).toBeNull();
  });

  it('returns error when date is after maxDate', () => {
    expect(datePlugin.validate('2025-06-01', makeDate({ maxDate: '2025-01-01' }), false)).toMatch(/on or before/i);
  });

  it('returns error when date falls on a disabled day of week', () => {
    // 2024-01-01 is a Monday (day 1)
    expect(datePlugin.validate('2024-01-01', makeDate({ disabledDaysOfWeek: [1] }), false)).toMatch(/not available/i);
  });

  it('returns null when date is not a disabled day', () => {
    // 2024-01-01 is a Monday; disabling Sunday (0) should not block it
    expect(datePlugin.validate('2024-01-01', makeDate({ disabledDaysOfWeek: [0] }), false)).toBeNull();
  });

  it('returns null when not required and null value', () => {
    expect(datePlugin.validate(null, makeDate(), false)).toBeNull();
  });
});

// ---------------------------------------------------------------------------
// time
// ---------------------------------------------------------------------------

describe('timePlugin.validate', () => {
  it('returns null for a valid time', () => {
    expect(timePlugin.validate('10:30', makeTime(), false)).toBeNull();
  });

  it('returns error when required and empty', () => {
    expect(timePlugin.validate('', makeTime(), true)).toMatch(/required/i);
  });

  it('returns error when time is before minTime', () => {
    expect(timePlugin.validate('08:00', makeTime({ minTime: '09:00' }), false)).toMatch(/at or after/i);
  });

  it('returns error when time is after maxTime', () => {
    expect(timePlugin.validate('20:00', makeTime({ maxTime: '18:00' }), false)).toMatch(/at or before/i);
  });

  it('returns null when not required and empty', () => {
    expect(timePlugin.validate('', makeTime(), false)).toBeNull();
  });
});

// ---------------------------------------------------------------------------
// single-select
// ---------------------------------------------------------------------------

describe('singleSelectPlugin.validate', () => {
  it('returns null when a valid option is selected', () => {
    expect(singleSelectPlugin.validate('opt-1', makeSingleSelect(), false)).toBeNull();
  });

  it('returns error when required and empty', () => {
    expect(singleSelectPlugin.validate('', makeSingleSelect(), true)).toMatch(/required/i);
  });

  it('returns null when not required and empty', () => {
    expect(singleSelectPlugin.validate('', makeSingleSelect(), false)).toBeNull();
  });

  it('returns error when "other" is selected but text is empty', () => {
    const config = makeSingleSelect({ allowOther: true });
    expect(singleSelectPlugin.validate(`${OTHER_OPTION_ID}:`, config, false)).toMatch(/specify/i);
  });

  it('returns error when "other" is selected but text is whitespace only', () => {
    const config = makeSingleSelect({ allowOther: true });
    expect(singleSelectPlugin.validate(`${OTHER_OPTION_ID}:   `, config, false)).toMatch(/specify/i);
  });

  it('returns null when "other" has valid text', () => {
    const config = makeSingleSelect({ allowOther: true });
    expect(singleSelectPlugin.validate(`${OTHER_OPTION_ID}:my answer`, config, false)).toBeNull();
  });
});

// ---------------------------------------------------------------------------
// multi-select
// ---------------------------------------------------------------------------

describe('multiSelectPlugin.validate', () => {
  it('returns null when selections are within constraints', () => {
    expect(multiSelectPlugin.validate(['opt-1'], makeMultiSelect(), false)).toBeNull();
  });

  it('returns error when required and no selections', () => {
    expect(multiSelectPlugin.validate([], makeMultiSelect(), true)).toMatch(/required/i);
  });

  it('returns null when not required and empty', () => {
    expect(multiSelectPlugin.validate([], makeMultiSelect(), false)).toBeNull();
  });

  it('returns error when below minSelections', () => {
    expect(multiSelectPlugin.validate(['opt-1'], makeMultiSelect({ minSelections: 2 }), false)).toMatch(/at least 2/i);
  });

  it('returns error when above maxSelections', () => {
    expect(multiSelectPlugin.validate(['opt-1', 'opt-2', 'opt-3'], makeMultiSelect({ maxSelections: 2 }), false)).toMatch(/at most 2/i);
  });

  it('returns error when other is selected but text is empty', () => {
    expect(multiSelectPlugin.validate([`${OTHER_OPTION_ID}:`], makeMultiSelect(), false)).toMatch(/specify/i);
  });

  it('returns null when other has valid text', () => {
    expect(multiSelectPlugin.validate([`${OTHER_OPTION_ID}:my answer`], makeMultiSelect(), false)).toBeNull();
  });

  it('does not count the raw OTHER_OPTION_ID marker in realCount', () => {
    // Selecting just __other__ without text — count should be 0 for required check
    expect(multiSelectPlugin.validate([OTHER_OPTION_ID], makeMultiSelect(), true)).toMatch(/required/i);
  });
});

// ---------------------------------------------------------------------------
// rating
// ---------------------------------------------------------------------------

describe('ratingPlugin.validate', () => {
  it('returns null for a valid rating', () => {
    expect(ratingPlugin.validate(4, makeRating(), false)).toBeNull();
  });

  it('returns error when required and value is null', () => {
    expect(ratingPlugin.validate(null, makeRating(), true)).toMatch(/required/i);
  });

  it('returns error when required and value is 0', () => {
    expect(ratingPlugin.validate(0, makeRating(), true)).toMatch(/required/i);
  });

  it('returns null when not required and null', () => {
    expect(ratingPlugin.validate(null, makeRating(), false)).toBeNull();
  });
});

// ---------------------------------------------------------------------------
// linear-scale
// ---------------------------------------------------------------------------

describe('linearScalePlugin.validate', () => {
  it('returns null for a valid selection', () => {
    expect(linearScalePlugin.validate(3, makeLinearScale(), false)).toBeNull();
  });

  it('returns error when required and null', () => {
    expect(linearScalePlugin.validate(null, makeLinearScale(), true)).toMatch(/required/i);
  });

  it('returns null when not required and null', () => {
    expect(linearScalePlugin.validate(null, makeLinearScale(), false)).toBeNull();
  });
});

// ---------------------------------------------------------------------------
// address
// ---------------------------------------------------------------------------

describe('addressPlugin.validate', () => {
  const validAddress = { street1: '123 Main St', city: 'Springfield', country: 'US' };

  it('returns null for a complete address', () => {
    expect(addressPlugin.validate(validAddress, makeAddress(), false)).toBeNull();
  });

  it('returns error when required and value is not an address object', () => {
    expect(addressPlugin.validate(null, makeAddress(), true)).toMatch(/required/i);
  });

  it('returns null when not required and value is not an address object', () => {
    expect(addressPlugin.validate(null, makeAddress(), false)).toBeNull();
  });

  it('returns error when required and street1 is empty', () => {
    expect(addressPlugin.validate({ ...validAddress, street1: '' }, makeAddress(), true)).toMatch(/required address fields/i);
  });

  it('returns error when required and city is empty', () => {
    expect(addressPlugin.validate({ ...validAddress, city: '' }, makeAddress(), true)).toMatch(/required address fields/i);
  });

  it('returns error when required and country is empty (no countryFixed)', () => {
    expect(addressPlugin.validate({ ...validAddress, country: '' }, makeAddress(), true)).toMatch(/required address fields/i);
  });

  it('does not require country when countryFixed is set', () => {
    const config = makeAddress({ countryFixed: 'US' });
    const addr = { ...validAddress, country: '' };
    expect(addressPlugin.validate(addr, config, true)).toBeNull();
  });
});

// ---------------------------------------------------------------------------
// section-header (display-only — never validates)
// ---------------------------------------------------------------------------

describe('sectionHeaderPlugin', () => {
  it('is display-only', () => {
    expect(sectionHeaderPlugin.isDisplayOnly).toBe(true);
  });

  it('validate always returns null', () => {
    expect(sectionHeaderPlugin.validate(null, makeSection(), true)).toBeNull();
  });
});

// ---------------------------------------------------------------------------
// calculation (computed — never validates)
// ---------------------------------------------------------------------------

describe('calculationPlugin', () => {
  it('is computed', () => {
    expect(calculationPlugin.isComputed).toBe(true);
  });

  it('validate always returns null', () => {
    expect(calculationPlugin.validate(42, makeCalc(), true)).toBeNull();
  });
});

// ---------------------------------------------------------------------------
// formatForPrint
// ---------------------------------------------------------------------------

describe('plugin formatForPrint', () => {
  it('textSingle returns the string value', () => {
    expect(textSinglePlugin.formatForPrint('hello', makeText())).toBe('hello');
  });

  it('textSingle returns null for non-string', () => {
    expect(textSinglePlugin.formatForPrint(42 as never, makeText())).toBeNull();
  });

  it('number formats with prefix and suffix', () => {
    const config = makeNumber({ prefix: '$', suffix: ' USD', decimalPlaces: 2 });
    expect(numberPlugin.formatForPrint(9.5, config)).toBe('$9.50 USD');
  });

  it('number returns null for null', () => {
    expect(numberPlugin.formatForPrint(null, makeNumber())).toBeNull();
  });

  it('rating returns value out of maxRating', () => {
    expect(ratingPlugin.formatForPrint(4, makeRating({ maxRating: 5 }))).toBe('4 / 5 stars');
  });

  it('linearScale returns value with range', () => {
    expect(linearScalePlugin.formatForPrint(3, makeLinearScale({ minValue: 1, maxValue: 5 }))).toBe('3 (1–5)');
  });

  it('multiSelect joins selected option ids with comma', () => {
    expect(multiSelectPlugin.formatForPrint(['opt-1', 'opt-2'], makeMultiSelect())).toBe('opt-1, opt-2');
  });

  it('multiSelect unwraps OTHER_OPTION_ID prefix', () => {
    expect(multiSelectPlugin.formatForPrint([`${OTHER_OPTION_ID}:my text`], makeMultiSelect())).toBe('my text');
  });

  it('singleSelect unwraps OTHER_OPTION_ID prefix', () => {
    expect(singleSelectPlugin.formatForPrint(`${OTHER_OPTION_ID}:their text`, makeSingleSelect())).toBe('their text');
  });
});
