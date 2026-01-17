/**
 * Mayor West Mode - Policy System Reference Implementation
 * 
 * This file provides starter code for implementing the custom policy system.
 * Use this as a foundation for building the policy parser and validator.
 * 
 * @module policy-system
 * @status Reference Implementation - Not Production Ready
 */

const yaml = require('js-yaml');
const fs = require('fs');
const path = require('path');

// ============================================================================
// CONSTANTS
// ============================================================================

const POLICY_FILE_PATH = '.github/mayor-west-policies.yml';

const POLICY_SCHEMA_VERSION = '1.0';

const DEFAULT_POLICY = {
  version: POLICY_SCHEMA_VERSION,
  enabled: true,
  policies: {
    files: {
      allowed_patterns: ['**/*'],
      blocked_patterns: [],
      max_files_per_pr: 100,
      max_lines_per_file: 1000,
    },
    commits: {
      format: {
        pattern: '^\\[MAYOR\\]\\s+.{10,100}$',
        example: '[MAYOR] Add feature description',
      },
    },
  },
  overrides: {
    bypass_labels: ['emergency', 'hotfix'],
    partial_bypass: [],
  },
};

// ============================================================================
// POLICY PARSER
// ============================================================================

/**
 * Parse and validate a policy YAML file
 * 
 * @param {string} filePath - Path to policy file
 * @returns {Object} Parsed and validated policy object
 * @throws {Error} If file doesn't exist, syntax invalid, or schema invalid
 */
function parsePolicyFile(filePath = POLICY_FILE_PATH) {
  // 1. Check file exists
  if (!fs.existsSync(filePath)) {
    throw new Error(`Policy file not found: ${filePath}`);
  }

  // 2. Read file content
  const content = fs.readFileSync(filePath, 'utf8');

  // 3. Parse YAML
  let parsed;
  try {
    parsed = yaml.load(content);
  } catch (err) {
    throw new Error(`Invalid YAML syntax: ${err.message}`);
  }

  // 4. Validate schema
  validatePolicySchema(parsed);

  return parsed;
}

/**
 * Validate policy object against expected schema
 * 
 * @param {Object} policy - Parsed policy object
 * @throws {Error} If schema validation fails
 */
function validatePolicySchema(policy) {
  // Check version
  if (!policy.version) {
    throw new Error('Missing required field: version');
  }

  if (policy.version !== POLICY_SCHEMA_VERSION) {
    throw new Error(`Unsupported policy version: ${policy.version}. Expected: ${POLICY_SCHEMA_VERSION}`);
  }

  // Check enabled flag
  if (typeof policy.enabled !== 'boolean') {
    throw new Error('Field "enabled" must be a boolean');
  }

  // Check policies object exists
  if (!policy.policies || typeof policy.policies !== 'object') {
    throw new Error('Missing or invalid "policies" object');
  }

  // Validate file policies (if present)
  if (policy.policies.files) {
    validateFilePolicy(policy.policies.files);
  }

  // Validate command policies (if present)
  if (policy.policies.commands) {
    validateCommandPolicy(policy.policies.commands);
  }

  // Validate quality policies (if present)
  if (policy.policies.quality) {
    validateQualityPolicy(policy.policies.quality);
  }

  // Validate dependency policies (if present)
  if (policy.policies.dependencies) {
    validateDependencyPolicy(policy.policies.dependencies);
  }

  // Validate commit policies (if present)
  if (policy.policies.commits) {
    validateCommitPolicy(policy.policies.commits);
  }

  // Validate PR policies (if present)
  if (policy.policies.pull_requests) {
    validatePRPolicy(policy.policies.pull_requests);
  }

  // Validate overrides (if present)
  if (policy.overrides) {
    validateOverrides(policy.overrides);
  }
}

// Validation functions for each policy category
function validateFilePolicy(filePolicy) {
  if (filePolicy.allowed_patterns && !Array.isArray(filePolicy.allowed_patterns)) {
    throw new Error('files.allowed_patterns must be an array');
  }
  if (filePolicy.blocked_patterns && !Array.isArray(filePolicy.blocked_patterns)) {
    throw new Error('files.blocked_patterns must be an array');
  }
  if (filePolicy.max_files_per_pr && typeof filePolicy.max_files_per_pr !== 'number') {
    throw new Error('files.max_files_per_pr must be a number');
  }
}

function validateCommandPolicy(commandPolicy) {
  // TODO: Implement command policy validation
}

function validateQualityPolicy(qualityPolicy) {
  // TODO: Implement quality policy validation
}

function validateDependencyPolicy(dependencyPolicy) {
  // TODO: Implement dependency policy validation
}

function validateCommitPolicy(commitPolicy) {
  if (commitPolicy.format) {
    if (!commitPolicy.format.pattern) {
      throw new Error('commits.format.pattern is required');
    }
    // Validate regex pattern
    try {
      new RegExp(commitPolicy.format.pattern);
    } catch (err) {
      throw new Error(`Invalid regex in commits.format.pattern: ${err.message}`);
    }
  }
}

function validatePRPolicy(prPolicy) {
  // TODO: Implement PR policy validation
}

function validateOverrides(overrides) {
  if (overrides.bypass_labels && !Array.isArray(overrides.bypass_labels)) {
    throw new Error('overrides.bypass_labels must be an array');
  }
  if (overrides.partial_bypass && !Array.isArray(overrides.partial_bypass)) {
    throw new Error('overrides.partial_bypass must be an array');
  }
}

// ============================================================================
// POLICY VALIDATOR
// ============================================================================

/**
 * Validate a list of changed files against file policies
 * 
 * @param {Array<Object>} files - Array of file objects with {filename, additions, deletions}
 * @param {Object} policy - Parsed policy object
 * @returns {Object} Validation result {passed: boolean, violations: Array<string>}
 */
function validateFiles(files, policy) {
  const violations = [];

  // Skip if policies disabled
  if (!policy.enabled) {
    return { passed: true, violations: [], reason: 'Policies disabled' };
  }

  const filePolicy = policy.policies?.files;
  if (!filePolicy) {
    return { passed: true, violations: [], reason: 'No file policies defined' };
  }

  // 1. Check max files per PR
  if (filePolicy.max_files_per_pr && files.length > filePolicy.max_files_per_pr) {
    violations.push(
      `Too many files changed: ${files.length} > ${filePolicy.max_files_per_pr}`
    );
  }

  // 2. Check each file against patterns
  for (const file of files) {
    // Check blocked patterns first (takes precedence)
    if (filePolicy.blocked_patterns) {
      for (const pattern of filePolicy.blocked_patterns) {
        if (matchesPattern(file.filename, pattern)) {
          violations.push(
            `File ${file.filename} matches blocked pattern: ${pattern}`
          );
          break; // One violation per file is enough
        }
      }
    }

    // Check allowed patterns (if present, acts as whitelist)
    if (filePolicy.allowed_patterns && filePolicy.allowed_patterns.length > 0) {
      const isAllowed = filePolicy.allowed_patterns.some(pattern =>
        matchesPattern(file.filename, pattern)
      );
      if (!isAllowed) {
        violations.push(
          `File ${file.filename} not in allowed patterns`
        );
      }
    }

    // Check max lines per file
    if (filePolicy.max_lines_per_file) {
      const linesChanged = (file.additions || 0) + (file.deletions || 0);
      if (linesChanged > filePolicy.max_lines_per_file) {
        violations.push(
          `File ${file.filename} has too many changes: ${linesChanged} > ${filePolicy.max_lines_per_file}`
        );
      }
    }
  }

  return {
    passed: violations.length === 0,
    violations,
  };
}

/**
 * Check if a filename matches a glob pattern
 * 
 * @param {string} filename - File path to check
 * @param {string} pattern - Glob pattern (**, *, etc.)
 * @returns {boolean} True if matches
 */
function matchesPattern(filename, pattern) {
  // Convert glob pattern to regex
  // ** → .* (any characters including /)
  // * → [^/]* (any characters except /)
  // . → \. (literal dot)
  const regexPattern = pattern
    .replace(/\./g, '\\.')
    .replace(/\*\*/g, '§§§') // Temporary placeholder
    .replace(/\*/g, '[^/]*')
    .replace(/§§§/g, '.*');

  const regex = new RegExp(`^${regexPattern}$`);
  return regex.test(filename);
}

/**
 * Validate commit message against commit policies
 * 
 * @param {string} message - Commit message to validate
 * @param {Object} policy - Parsed policy object
 * @returns {Object} Validation result {passed: boolean, violations: Array<string>}
 */
function validateCommitMessage(message, policy) {
  const violations = [];

  if (!policy.enabled) {
    return { passed: true, violations: [] };
  }

  const commitPolicy = policy.policies?.commits;
  if (!commitPolicy) {
    return { passed: true, violations: [] };
  }

  // Check format
  if (commitPolicy.format && commitPolicy.format.pattern) {
    const regex = new RegExp(commitPolicy.format.pattern);
    if (!regex.test(message)) {
      violations.push(
        `Commit message doesn't match required format: ${commitPolicy.format.example || commitPolicy.format.pattern}`
      );
    }
  }

  // Check required trailer
  if (commitPolicy.required_trailer && commitPolicy.required_trailer.pattern) {
    const lines = message.split('\n');
    const lastLine = lines[lines.length - 1].trim();
    const regex = new RegExp(commitPolicy.required_trailer.pattern);
    if (!regex.test(lastLine)) {
      violations.push(
        `Commit message missing required trailer: ${commitPolicy.required_trailer.example || commitPolicy.required_trailer.pattern}`
      );
    }
  }

  return {
    passed: violations.length === 0,
    violations,
  };
}

/**
 * Check if issue has bypass labels
 * 
 * @param {Array<string>} issueLabels - Labels on the issue
 * @param {Object} policy - Parsed policy object
 * @returns {Object} {hasBypass: boolean, bypassType: 'full'|'partial'|null, bypasses: Array<string>}
 */
function checkBypass(issueLabels, policy) {
  if (!policy.overrides) {
    return { hasBypass: false, bypassType: null, bypasses: [] };
  }

  // Check for full bypass
  if (policy.overrides.bypass_labels) {
    const hasBypass = policy.overrides.bypass_labels.some(label =>
      issueLabels.includes(label)
    );
    if (hasBypass) {
      return { hasBypass: true, bypassType: 'full', bypasses: ['all'] };
    }
  }

  // Check for partial bypass
  if (policy.overrides.partial_bypass) {
    const bypasses = [];
    for (const bypass of policy.overrides.partial_bypass) {
      if (issueLabels.includes(bypass.label)) {
        bypasses.push(...(bypass.bypasses || []));
      }
    }
    if (bypasses.length > 0) {
      return { hasBypass: true, bypassType: 'partial', bypasses };
    }
  }

  return { hasBypass: false, bypassType: null, bypasses: [] };
}

// ============================================================================
// POLICY GENERATOR
// ============================================================================

/**
 * Generate default policy file
 * 
 * @param {Object} options - Options for policy generation
 * @returns {string} YAML content
 */
function generateDefaultPolicy(options = {}) {
  const policy = { ...DEFAULT_POLICY };

  // Customize based on options
  if (options.strict) {
    policy.policies.files.max_files_per_pr = 10;
    policy.policies.files.blocked_patterns = [
      '.github/workflows/**',
      'package.json',
      '**/*.sql',
      '**/migrations/**',
    ];
  }

  if (options.categories) {
    // Filter to only requested categories
    const filteredPolicies = {};
    for (const category of options.categories) {
      if (policy.policies[category]) {
        filteredPolicies[category] = policy.policies[category];
      }
    }
    policy.policies = filteredPolicies;
  }

  // Convert to YAML
  return yaml.dump(policy, {
    indent: 2,
    lineWidth: 100,
    noRefs: true,
  });
}

// ============================================================================
// EXPORTS
// ============================================================================

module.exports = {
  // Parser
  parsePolicyFile,
  validatePolicySchema,

  // Validator
  validateFiles,
  validateCommitMessage,
  checkBypass,

  // Generator
  generateDefaultPolicy,

  // Utilities
  matchesPattern,

  // Constants
  POLICY_FILE_PATH,
  POLICY_SCHEMA_VERSION,
  DEFAULT_POLICY,
};

// ============================================================================
// CLI USAGE EXAMPLE
// ============================================================================

/**
 * Example usage from CLI
 */
if (require.main === module) {
  const args = process.argv.slice(2);
  const command = args[0];

  switch (command) {
    case 'validate': {
      try {
        const policy = parsePolicyFile();
        console.log('✓ Policy file is valid');
        console.log(`  Version: ${policy.version}`);
        console.log(`  Enabled: ${policy.enabled}`);
      } catch (err) {
        console.error('✗ Policy validation failed:', err.message);
        process.exit(1);
      }
      break;
    }

    case 'init': {
      const policyYaml = generateDefaultPolicy();
      fs.writeFileSync(POLICY_FILE_PATH, policyYaml, 'utf8');
      console.log(`✓ Created default policy file: ${POLICY_FILE_PATH}`);
      break;
    }

    case 'test': {
      // Test hypothetical file changes
      const testFiles = [
        { filename: 'src/index.ts', additions: 50, deletions: 10 },
        { filename: 'package.json', additions: 2, deletions: 0 },
      ];

      try {
        const policy = parsePolicyFile();
        const result = validateFiles(testFiles, policy);

        console.log('\nTest Results:');
        console.log(`  Status: ${result.passed ? '✓ PASSED' : '✗ FAILED'}`);

        if (result.violations.length > 0) {
          console.log('\nViolations:');
          result.violations.forEach(v => console.log(`  - ${v}`));
        }
      } catch (err) {
        console.error('✗ Test failed:', err.message);
        process.exit(1);
      }
      break;
    }

    default: {
      console.log('Usage: node policy-system.js <command>');
      console.log('\nCommands:');
      console.log('  validate   Validate policy file syntax');
      console.log('  init       Create default policy file');
      console.log('  test       Test policy against sample files');
      break;
    }
  }
}
