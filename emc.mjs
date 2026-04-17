// @ts-check

/** @import {EMC} from './types/mount-observer/types' */;
/** @import {AllProps, Actions} from './types/do-invoke/types' */
/** @import {RAConfig} from './types/roundabout/types' */

/**
 * @type {EMC<any, AllProps, Element, RAConfig<AllProps, Actions> >}
 */
export const emc = {
    enhConfig: {
        enhKey: 'DoInvoke',
        spawn: 'do-invoke/do-invoke.js',
        withAttrs: {
            base: 'do-invoke',
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
