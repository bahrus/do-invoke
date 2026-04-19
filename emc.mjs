// @ts-check

/** @import {EMC} from './types/mount-observer/types' */;
/** @import {AllProps, Actions} from './types/do-invoke/types' */
/** @import {RAConfig} from './types/roundabout/types' */
/** @import {PatternConfig} from './types/nested-regex-groups/types' */

const defaultVals = {
    localEventType: 'click'
};

/** @type {PatternConfig[]} */
const parsePatterns = [
    {
        name: 'idWithMethodAndEvent',
        pattern: String.raw `^#(?<targetSpecifier.targetElementId>[^?]+)\?\.(?<targetSpecifier.hostOrPeerMethodName>\w+) on (?<localEventType>\w+)$`,
        description: 'Element ID with method and explicit event type: #{{id}}?.method on event',
        defaultVals,
    },
    {
        name: 'idWithMethod',
        pattern: String.raw `^#(?<targetSpecifier.targetElementId>[^?]+)\?\.(?<targetSpecifier.hostOrPeerMethodName>\w+)$`,
        description: 'Element ID with method, default event: #{{id}}?.method',
        defaultVals,
    },
    {
        name: 'methodWithEvent',
        pattern: String.raw `^(?<targetSpecifier.hostOrPeerMethodName>\w+) on (?<localEventType>\w+)$`,
        description: 'Method name with explicit event type: method on event',
        defaultVals,
    },
    {
        name: 'methodOnly',
        pattern: String.raw `^(?<targetSpecifier.hostOrPeerMethodName>\w+)$`,
        description: 'Method name only, default event: method',
        defaultVals,
    }
]

/**
 * @type {EMC<any, AllProps, Element, RAConfig<AllProps, Actions> >}
 */
export const emc = {
    enhConfig: {
        enhKey: 'DoInvoke',
        spawn: 'do-invoke/do-invoke.js',
        withAttrs: {
            base: 'do-invoke',
            _base: {
                mapsTo: 'invokeParamSet',
                parser: "parse-pattern-statements",
                instanceOf: 'Array',
                parserConfig: parsePatterns
            },
            // TODO: Custom parser needed for complex attribute parsing
            // For now, using basic string mapping - will need custom parser implementation
            rawStatements: '${base}'
        }
    },
    customData: {
        weakRef: {
            properties: ['enhancedElement']
        },
        actions: {
            hydrate: {
                ifAllOf: ['invokeParamSet', 'enhancedElement']
            }
        }
    }
};

export function render() {
    return JSON.stringify(emc, null, 4);
}

console.log(render());
