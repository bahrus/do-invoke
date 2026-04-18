// @ts-check

/** @import {EMC} from './types/mount-observer/types' */;
/** @import {AllProps, Actions} from './types/do-invoke/types' */
/** @import {RAConfig} from './types/roundabout/types' */
/** @import {PatternConfig} from './types/nested-regex-groups/types' */

/** @type {PatternConfig[]} */
const parsePatterns = [
    {
        name: 'targetsPartOnEventType',
        pattern: String.raw `^(?<targetPart>.*) on (?<localEventType>.*)`,
        description: 'Method/selector with explicit event type'
    },
    {
        name: 'targetsPart',
        pattern: String.raw `^(?<targetPart>.*)`,
        description: 'Method/selector with default event type'
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
                mapsTo: 'invokeParamSets',
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
                ifAllOf: ['rawStatements', 'enhancedElement']
            }
        }
    }
};

export function render() {
    return JSON.stringify(emc, null, 4);
}

console.log(render());
