import type { ExampleCase } from '../types/pda';

export const EXAMPLE_CASES: ExampleCase[] = [
  {
    id: 'valid-nested',
    name: '1. Valid Nested JSON',
    category: 'valid',
    description: 'All nested objects and arrays are properly balanced and closed.',
    expectedResult: 'ACCEPT',
    json: `{
  "student": {
    "name": "Rahul",
    "age": 20,
    "subjects": ["TOC", "AT"]
  },
  "active": true
}`
  },
  {
    id: 'mismatched-delimiter',
    name: '2. Mismatched Delimiter',
    category: 'mismatch',
    description: 'Array is incorrectly closed with "}" instead of "]". PDA detects stack top mismatch.',
    expectedResult: 'REJECT',
    json: `{
  "student": {
    "name": "Rahul",
    "subjects": ["TOC", "AT"}
  }
}`
  },
  {
    id: 'missing-closing',
    name: '3. Missing Closing Delimiter',
    category: 'unclosed',
    description: 'Outer object remains unclosed at End-Of-Input. Stack still has unmatched "{" above "$".',
    expectedResult: 'REJECT',
    json: `{
  "student": {
    "name": "Rahul",
    "age": 20
  }`
  },
  {
    id: 'invalid-syntax-trailing-comma',
    name: '4. Trailing Comma (Syntax Error)',
    category: 'syntax',
    description: 'Delimiters balance properly in PDA stack, but full JSON syntax fails due to trailing comma.',
    expectedResult: 'REJECT',
    json: `{
  "name": "Rahul",
  "age": 20,
}`
  },
  {
    id: 'delimiters-in-strings',
    name: '5. Delimiters Inside Strings',
    category: 'string_delims',
    description: 'Braces "{" and "[" inside string literals and escaped quotes "\\" are ignored by the PDA stack.',
    expectedResult: 'ACCEPT',
    json: `{
  "message": "Example containing { and [ inside a string",
  "escaped": "He said: \\"Hello!\\""
}`
  },
  {
    id: 'deeply-nested',
    name: '6. Deeply Nested Structures',
    category: 'deep_nest',
    description: 'Demonstrates multi-level LIFO behavior: multiple delimiters accumulate and resolve in reverse order.',
    expectedResult: 'ACCEPT',
    json: `{
  "system": {
    "modules": [
      {
        "id": "TOC-01",
        "nestedConfig": {
          "flags": [true, false, [1, 2, {"ready": true}]]
        }
      }
    ]
  }
}`
  }
];
