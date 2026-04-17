// @ts-check
/** @import {Actions, PAP, AllProps, AP} from './types/do-invoke/types' */;
/** @import {RoundaboutOptions} from './types/roundabout/types' */;
/** @import {ElementEnhancementGateway} from './types/assign-gingerly/types' */;
/** @import {EMC} from './types/mount-observer/types' */;
/** @import {RAConfig} from './types/roundabout/types' */;
/**
 * @type {EMC<any, AllProps, Element, RAConfig<AllProps, Actions>>}
 */
import emc from './emc.json' with {type: 'json'};

const {customData} = emc;

/**
 * @implements {Actions}
 * @implements {EventListenerObject}
 */
class DoInvoke {

    /**
     * @this {AllProps & Actions}
     * @param {Element & ElementEnhancementGateway} enhancedElement 
     * @param {*} ctx 
     * @param {AllProps} initVals 
     */
    constructor(enhancedElement, ctx, initVals){
        this.init(this, enhancedElement, initVals);
    }

    /**
     * @param {AllProps} self 
     * @param {Element & ElementEnhancementGateway} enhancedElement 
     * @param {PAP} initVals 
     */
    async init(self, enhancedElement, initVals){
        const {defaultPropVals} = customData;
        /**
         * @type {RoundaboutOptions}
         */
        const raOptions = {
            ...customData,
            vm: self,
            initialPropVals: {
                enhancedElement,
                ...defaultPropVals,
                ...initVals
            }
        };
        (await import('roundabout-lib/roundabout.js')).roundabout(raOptions);
    }

    /** @type {Map<import('./types/do-invoke/types').Specifier, WeakRef<EventTarget>>} */
    #cache = new Map();

    /**
     * @param {AP} self 
     * @returns {Promise<PAP>}
     */
    async hydrate(self) {
        const { rawStatements, enhancedElement } = self;
        
        // TODO: Parse rawStatements into invokeParamSets using custom parser
        // For now, this is a placeholder that needs the custom parser implementation
        
        const { nudge } = await import('mount-observer/refid/nudge.js');
        
        // Temporary: assume rawStatements is a simple method name
        const localEventType = 'click'; // Default event type
        enhancedElement.addEventListener(localEventType, this);
        
        nudge(enhancedElement);
        return {
            resolved: true
        };
    }

    /**
     * @param {Event} e 
     */
    async handleEvent(e){
        const {target} = e;
        const self = /** @type {AP} */ (/** @type {any} */ (this));
        const { rawStatements, enhancedElement } = self;
        
        // TODO: Use parsed invokeParamSets instead of rawStatements
        // For now, this is a placeholder
        
        const methodName = rawStatements || enhancedElement.getAttribute('name');
        if (!methodName) return;
        
        // Find the host element (itemscope container)
        let remoteTarget = enhancedElement.closest('[itemscope]');
        if (!remoteTarget) return;
        
        /** @type {any} */
        const clone = {};
        for(const key in e){
            clone[key] = e[key];
        }
        clone.target = target;
        
        if (typeof remoteTarget[methodName] === 'function') {
            remoteTarget[methodName](remoteTarget, clone);
        }
    }
}

export { DoInvoke };
