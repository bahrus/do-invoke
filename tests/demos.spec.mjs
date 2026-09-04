import { test, expect } from '@playwright/test';

/**
 * These tests mirror the demos that currently work:
 *   demo/Example1a.html, demo/Example1aInfer.html,
 *   demo/Example1b.html, demo/Example1c.html
 *
 * Each fixture in this folder is a copy of the matching demo with a small
 * amount of bookkeeping added to the invoked method (an incrementing
 * `data-invoke-count` attribute plus `__lastTarget` / `__lastEventType`)
 * so we can assert that do-invoke wired the listener and dispatched the
 * call to the right element with the right event.
 *
 * The remaining demos (Example1e, Example1f, demo/All Examples.html) are
 * not covered yet - see the disabled test in test1.spec.mjs.
 */

// Give be-hive / the emc pipeline time to enhance the element and attach
// the event listener before we dispatch anything.
const ENHANCE_MS = 1000;

test('Example1a: click on button invokes host method on the itemscope element', async ({ page }) => {
    await page.goto('./tests/Example1a.html');
    await page.waitForTimeout(ENHANCE_MS);

    await page.locator('button').dispatchEvent('click');

    const moodStone = page.locator('mood-stone');
    await expect(moodStone).toHaveAttribute('data-invoke-count', '1');

    const details = await page.evaluate(() => {
        const ms = document.querySelector('mood-stone');
        return { targetIsHost: ms.__lastTarget === ms, eventType: ms.__lastEventType };
    });
    expect(details.targetIsHost).toBe(true);
    expect(details.eventType).toBe('click');

    // A second dispatch should invoke it again - the listener is durable.
    await page.locator('button').dispatchEvent('click');
    await expect(moodStone).toHaveAttribute('data-invoke-count', '2');
});

test('Example1aInfer: method name from `name`, event type inferred as click', async ({ page }) => {
    await page.goto('./tests/Example1aInfer.html');
    await page.waitForTimeout(ENHANCE_MS);

    // The button is disabled; dispatchEvent still reaches attached listeners.
    await page.locator('button').dispatchEvent('click');

    const moodStone = page.locator('mood-stone');
    await expect(moodStone).toHaveAttribute('data-invoke-count', '1');

    const details = await page.evaluate(() => {
        const ms = document.querySelector('mood-stone');
        return { targetIsHost: ms.__lastTarget === ms, eventType: ms.__lastEventType };
    });
    expect(details.targetIsHost).toBe(true);
    expect(details.eventType).toBe('click');
});

test('Example1b: explicit "on mouseover" wires the listener to mouseover only', async ({ page }) => {
    await page.goto('./tests/Example1b.html');
    await page.waitForTimeout(ENHANCE_MS);

    const moodStone = page.locator('mood-stone');

    // click must NOT trigger it - the statement asked for mouseover.
    await page.locator('button').dispatchEvent('click');
    await page.waitForTimeout(100);
    await expect(moodStone).not.toHaveAttribute('data-invoke-count', /.*/);

    await page.locator('button').dispatchEvent('mouseover');
    await expect(moodStone).toHaveAttribute('data-invoke-count', '1');

    const details = await page.evaluate(() => {
        const ms = document.querySelector('mood-stone');
        return { targetIsHost: ms.__lastTarget === ms, eventType: ms.__lastEventType };
    });
    expect(details.targetIsHost).toBe(true);
    expect(details.eventType).toBe('mouseover');
});

test('Example1c: statement targets a sibling element by id, not the host', async ({ page }) => {
    await page.goto('./tests/Example1c.html');
    await page.waitForTimeout(ENHANCE_MS);

    await page.locator('button').dispatchEvent('click');

    const soulSearching = page.locator('soul-searching');
    await expect(soulSearching).toHaveAttribute('data-invoke-count', '1');

    const details = await page.evaluate(() => {
        const ss = document.querySelector('soul-searching');
        const ms = document.querySelector('mood-stone');
        return {
            targetIsSoulSearching: ss.__lastTarget === ss,
            hostUntouched: !ms.hasAttribute('data-invoke-count'),
            eventType: ss.__lastEventType,
        };
    });
    expect(details.targetIsSoulSearching).toBe(true);
    expect(details.hostUntouched).toBe(true);
    expect(details.eventType).toBe('click');
});
