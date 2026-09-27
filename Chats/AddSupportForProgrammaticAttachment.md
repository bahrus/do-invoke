# Add Support For Programmatic Attachment

## Bruce's Ask

Can you please follow the example of [be-persistent](https://github.com/bahrus/be-persistent) and [be-bound](../../be-bound), [be-calculating](../../be-calculating/), [do-inc](../../do-inc/) and [the addendum](../types/ImportantEnhancementAddendum.md) to add demos and adjust do-invoke.js as needed and add def.js to support programmatic attachment of this enhancement?

Please add your implementation notes below.

## Implementation Notes

I followed the addendum's checklist, including step 6 (README wording). do-inc
was the closest model, including your follow-up that `increments` should
accept a string or an object as well as an array. I applied that here from
the start.

### Programmatic-friendly property: `invocations`

`hydrate` used to read the attribute's `StatementsResult` (`invokeParamSet`)
directly, and pushed a synthesized statement into it for the bare-attribute
case. Now:

- There is a new property, `invocations`, and it is the only thing `hydrate`
  reads.
- A compact, `when_invokeParamSet_changes_call_onInvokeParamSetChange`,
  copies each parsed statement's `value` into it. It still throws 400 when
  `success` is false.
- A `toRules()` helper normalizes `invocations`, which accepts:
  - **a method name**: `'howAmIFeelingAboutToday'`;
  - **a flat object**: `{hostOrPeerMethodName, targetElementId, localEventType}`.
    The parser's nested
    `{targetSpecifier: {hostOrPeerMethodName, targetElementId}}` shape comes
    from its dotted capture-group names and is awkward to write by hand, so
    the flat form is what the README documents. The nested form (what the
    attribute produces) is still accepted;
  - **an array of either**, mixed freely;
  - **an empty array**: one rule whose method name comes from the `name`
    attribute, the same as a bare attribute. It still throws 400 if there's
    no `name`.
- `hydrate` uses
  `ifKeyIn: ['invocations', 'initialized'], ifAllOf: ['invocations', 'enhancedElement', 'initialized']`.
- `hydrate` owns an `AbortController`, so reassigning `invocations` replaces
  the previous listeners instead of stacking them, as in do-assign and do-inc.

### Addendum steps

1. **`init()` awaits `roundabout(...)` and then sets `self.initialized = true`.**
   The `await` was missing.
2. **`ctx.emc || ctx.config`.**
3. **`def.js`** exports `defDoInvoke(ref)`. `package.json` has no `exports`
   map and no `files` field, so no change was needed there. As before, I
   didn't add an `exports` map, since that would block unlisted deep imports.
4. **Reserved names.** There are no collisions.
5. **Tests.** See below.
6. **README.** Added a "Programmatic attachment (no attribute)" section after
   Example 1c. It has the editorial intro (the "less clunky" point uses
   Example 1c's `-id defer-🕹️ 🕹️=#{{soul-searching}}?.engage`), registration,
   the accepted forms, a statement-part → property table, and both patterns.

I also removed a stray, orphaned `@type {EMC...}` JSDoc block above the
class.

### Programmatic vs. attribute default event

With the attribute, the parser's `defaultVals` make `localEventType` default
to `'click'`. The bare-attribute case (empty statements) already used the
*inferred* event, and I kept that for programmatic rules: an omitted
`localEventType` means the inferred event. For a button, that is `click`
either way.

### Demos and tests

Each demo has a `<mood-stone itemscope>` host whose methods count their calls
in `data-` attributes, plus a peer `<soul-searcher id=soulSearcher>`:

- `demo/Programmatic/DeclarativeInSequence.html`: the string form via
  `enh.set`.
- `demo/Programmatic/DeclarativeOutOfSequence.html`: `[]` on
  `<button name=howAmIFeelingAboutToday>`, set before `defDoInvoke`.
- `demo/Programmatic/Imperative.html`: `enh.get()` with a mixed array. It
  holds a flat object targeting the peer's `engageInSecondGuessing` and the
  host's method as a string, and both run on one click.
- `demo/Programmatic/ImperativeReassign.html`: `'howAmIFeelingAboutToday'`,
  then reassigned to `'changeOfHeart'`. The test expects only
  `changeOfHeart` to have run.
- `tests/Programmatic/*` mirror these.

Results: 8 Playwright tests pass (the 4 existing ones plus the 4 new ones).
The pre-existing `AllExamples` test is still skipped. Checks that the new
tests catch real problems:

- With the original `do-invoke.js` / `emc.json`, all 4 fail.
- With only the `abort()` call disabled, `ImperativeReassign` fails.

Example1e and Example1f still have no tests. They depend on `xtal-element`,
and their attributes parse the same way as Example1a's, which is tested.

### Other changes

- `types/do-invoke/types.d.ts` (in the `types` git submodule):
  - added `invocations` (in `EndUserProps`) and the `Invocations`,
    `Invocation` and `FlatInvokingParameters` types;
  - added `initialized` and `onInvokeParamSetChange`;
  - `InvokingParameters.localEventType` is now optional.

  **These edits need to be committed and pushed in the `types` submodule
  separately.**
- `emc.json` / `🕹️.json` were regenerated with `npm run build`.

