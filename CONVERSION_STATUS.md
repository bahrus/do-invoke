# do-invoke Conversion Status

## Completed Steps

### ✅ Step 1: Migrate Type Definitions
- Copied `ts-refs/do-invoke` to `types/do-invoke`
- Removed old `ts-refs` submodule

### ✅ Step 2: Archive Legacy Implementation
- Moved all legacy `.js` and `.json` files to `legacy/` folder
- Preserved original implementation for reference

### ✅ Step 3: Update package.json
- Updated dependencies to modern architecture:
  - `be-hive`: 0.1.9
  - `mount-observer`: 0.0.16
  - `roundabout-lib`: 0.0.2
- Updated build script to generate both `emc.json` and `🕹️.json`
- Ran `npm run update` to install dependencies

### ✅ Step 4: Update imports.html
- Created modern import map with:
  - `assign-gingerly/`
  - `do-invoke/` (maps to root)
  - `be-hive/`
  - `mount-observer/`
  - `roundabout-lib/`

### ✅ Step 5: Establish Coding Standards
- Created `.kiro/steering/coding-standards.md`

### ✅ Step 6: Update Type Definitions
- Made types standalone (removed trans-render dependencies)
- Added `enhancedElement: Element` to `AllProps`
- Removed `BAP` type, replaced with `AP`
- Added local `Specifier` interface

### ✅ Step 7: Create emc.mjs
- Created build-time configuration file
- Basic attribute mapping in place (custom parser placeholder)
- Configured `weakRef` for `enhancedElement`
- Configured `hydrate` action

### ✅ Step 8: Configure VS Code File Nesting
- Created `.vscode/settings.json`
- Configured `.mjs` files to nest their `.json` outputs

### ✅ Step 9: Create Modern Enhancement Class
- Created `do-invoke.js` with modern architecture
- Uses roundabout for reactive properties
- Implements `Actions` interface
- **Note**: Contains placeholder logic for custom parser

### ✅ Step 10: Create Emoji Shorthand
- Created `🕹️.mjs` for emoji variant
- Generates `🕹️.json` configuration

### ✅ Step 11: Update Demo Files (Partial)
- Updated `demo/Example1a.html` to use be-hive pattern
- Updated `playwright.config.ts` to Chrome-only

## Remaining Work

### 🔧 Custom Attribute Parser Implementation

The key complexity in this conversion is the **custom attribute parser**. The legacy implementation used `regExpExts` to parse complex attribute patterns:

**Patterns to support:**
1. `🕹️="methodName"` - Simple method name
2. `🕹️="methodName on eventType"` - Method with explicit event
3. `🕹️="#{{selector}}?.methodName"` - Peer element selector with method
4. `🕹️="#{{selector}}?.methodName on eventType"` - Full pattern

**Current state:**
- `emc.mjs` has placeholder for custom parser
- `do-invoke.js` has simplified logic that only handles basic cases
- Need to implement proper parser function that:
  - Parses the attribute value into `InvokingParameters[]`
  - Handles all four pattern types
  - Integrates with assign-gingerly's parser system

**Files needing custom parser:**
- `emc.mjs` - Define parser function (may need to be registered at runtime)
- `do-invoke.js` - Use parsed `invokeParamSets` instead of `rawStatements`

### 📝 Remaining Demo/Test Updates

- Update remaining demo files:
  - `demo/Example1aInfer.html`
  - `demo/Example1b.html`
  - `demo/Example1c.html`
  - `demo/Example1e.html`
  - `demo/Example1f.html`
  - `demo/All Examples.html`
- Update test files:
  - `tests/AllExamples.html`
  - `tests/test1.spec.mjs`

### 🧪 Testing

Once custom parser is implemented:
1. Run `npm run build` to regenerate JSON
2. Run `npm test` to verify functionality
3. Manually test all demo files

## Architecture Notes

### Modern vs Legacy

**Legacy (be-enhanced):**
- Extended `BE` base class
- Static `config` object in class
- Used `emc.js` with `regExpExts` for custom parsing
- Runtime registration with `bootUp()`

**Modern (be-hive + roundabout):**
- Standalone class (no base class)
- Configuration in `emc.mjs` (build-time)
- Uses `withAttrs` with custom parser functions
- Automatic registration via `<be-hive>` element

### Custom Parser Challenge

The legacy `regExpExts` pattern was a trans-render-specific feature. The modern architecture uses assign-gingerly's parser system, which requires:
- Parser functions that transform attribute strings to property values
- Integration with `ParserContext` for advanced scenarios
- Possible runtime registration if parser can't be serialized to JSON

This is the first conversion requiring a custom parser, making it a learning opportunity for the pattern.
