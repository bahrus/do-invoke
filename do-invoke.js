// @ts-check
/** @import {Actions, PAP, AllProps, AP, InvokingParameters, Invocations} from './types/do-invoke/types' */;
/** @import {RoundaboutOptions} from './types/roundabout/types' */;
/** @import {ElementEnhancementGateway, SpawnContext} from './types/assign-gingerly/types' */;
/** @import {Infer} from './types/inferencer/types' */
/** @import {EMC} from './types/mount-observer/types' */;
/** @import {RAConfig} from './types/roundabout/types' */;

/**
 * @implements {Actions}
 */
class DoInvoke {

    /**
     * @this {AllProps & Actions}
     * @param {Element & ElementEnhancementGateway} enhancedElement 
     * @param {SpawnContext} ctx 
     * @param {PAP} initVals 
     */
    constructor(enhancedElement, ctx, initVals){
        this.init(this, enhancedElement, ctx, initVals);
    }

    /**
     * @param {AllProps} self 
     * @param {Element & ElementEnhancementGateway} enhancedElement 
     * @param {SpawnContext} ctx 
     * @param {PAP} initVals 
     */
    async init(self, enhancedElement, ctx, initVals){
        const {customData} = /** @type {EMC<any, AllProps, Element, RAConfig<AllProps, Actions>>} */ (ctx.emc || ctx.config);
        /**
         * @type {RoundaboutOptions}
         */
        const raOptions = {
            ...customData,
            vm: self,
            initialPropVals: {
                enhancedElement,
                //...defaultPropVals,
                ...initVals
            }
        };
        await (await import('roundabout-lib/roundabout.js')).roundabout(raOptions);
        self.initialized = true;
    }

    /**
     * Transfers the attribute-parsed `invokeParamSet` into `invocations` --
     * the property `hydrate` actually reads.  Programmatic callers skip
     * `invokeParamSet` entirely and assign `invocations` directly.
     * Invoked via the `when_invokeParamSet_changes_call_onInvokeParamSetChange`
     * compact, never called directly.
     * @param {AP} self
     * @returns {PAP}
     */
    onInvokeParamSetChange(self){
        const {invokeParamSet} = self;
        if(invokeParamSet === undefined) return {};
        const {statements, success} = invokeParamSet;
        if(!success) throw 400;
        /** @type {Array<InvokingParameters>} */
        const invocations = [];
        for(const statement of statements){
            if(statement.value !== undefined) invocations.push(statement.value);
        }
        return {invocations};
    }

    /** @type {AbortController | undefined} */
    #ac;

    /**
     * @param {AP & Actions & ElementEnhancementGateway} self
     * @returns {Promise<PAP>}
     */
    async hydrate(self) {
        const { invocations, enhancedElement } = self;
        // A targetElement passed as an element must not be held strongly --
        // not even via the invocations value roundabout stores on this instance.
        // Replace it with a weakened copy; that re-triggers hydrate, which
        // then finds nothing left to weaken and attaches the listeners.
        const weakened = weakenTargetElements(invocations);
        if(weakened !== undefined) return /** @type {PAP} */ ({invocations: weakened});
        const { nudge } = await import('assign-gingerly/handlers/nudge.js');
        // Re-hydrating (invocations reassigned) replaces the listeners from
        // the previous pass rather than stacking on them.
        this.#ac?.abort();
        const {signal} = this.#ac = new AbortController();
        for(const value of toRules(invocations, enhancedElement)){
            let {localEventType} = value;
            if(!localEventType){
                localEventType = (await infer(enhancedElement)).eventType;
            }
            enhancedElement.addEventListener(localEventType, e => {
                this.handleEvent(self, e, value);
            }, {signal});
        }


        nudge(enhancedElement);
        return {
            resolved: true
        };
    }

    /**
     * @param {AP} self
     * @param {Event} e 
     * @param {InvokingParameters} invokingParams
     */
    async handleEvent(self, e, invokingParams){
        const { enhancedElement } = self;
    
        const {targetSpecifier} = invokingParams;
        const {hostOrPeerMethodName, targetElementId, targetElement} = targetSpecifier;

        /** @type {any} */
        let target;
        if(targetElement !== undefined){
            // By now a WeakRef -- see weakenTargetElements
            target = targetElement.deref();
            if(target === undefined) return; // the target has been garbage collected
        }else{
            target = await ((await import('assign-gingerly/inferencer/upSearch.js')).upSearch(enhancedElement, targetElementId));
        }
        
        
        /** @type {any} */
        const clone = {};
        for(const key in e){
            clone[key] = e[key];
        }
        clone.target = target;
        
        if (typeof target[hostOrPeerMethodName] === 'function') {
            target[hostOrPeerMethodName](target, clone);
        }
    }
}

/**
 * Normalize `invocations` into an array of rules in the parsed (nested
 * targetSpecifier) shape.  Programmatic callers may pass a method name, a
 * single rule -- flat ({hostOrPeerMethodName, targetElementId, localEventType})
 * or nested (as parsed from the attribute) -- or an array mixing these.
 * Without a method name (e.g. an empty array), the enhanced element's name
 * attribute supplies it.
 * @param {Invocations} invocations
 * @param {Element} enhancedElement
 * @returns {Array<InvokingParameters>}
 */
function toRules(invocations, enhancedElement){
    const arr = Array.isArray(invocations) ? invocations : [invocations];
    const items = arr.length === 0 ? [{}] : arr;
    return items.map(item => {
        /** @type {any} */
        const inv = typeof item === 'string' ? {hostOrPeerMethodName: item} : item;
        const {targetSpecifier, hostOrPeerMethodName, targetElementId, targetElement, localEventType} = inv;
        const methodName = targetSpecifier?.hostOrPeerMethodName ?? hostOrPeerMethodName
            ?? enhancedElement.getAttribute('name');
        if(!methodName) throw 400;
        return {
            localEventType,
            targetSpecifier: {
                hostOrPeerMethodName: methodName,
                targetElementId: targetSpecifier?.targetElementId ?? targetElementId,
                // a WeakRef by now -- see weakenTargetElements
                targetElement: targetSpecifier?.targetElement ?? targetElement,
            }
        };
    });
}

/**
 * If any flat rule's `targetElement` is an element (rather than a WeakRef),
 * return a copy of `invocations` -- same shape -- with each such element
 * wrapped in a WeakRef.  Otherwise return undefined.  Never mutates
 * `invocations`.
 * @param {Invocations} invocations
 * @returns {Invocations | undefined}
 */
function weakenTargetElements(invocations){
    const arr = Array.isArray(invocations) ? invocations : [invocations];
    let found = false;
    const weakened = arr.map(item => {
        if(typeof item === 'object' && item !== null && 'targetElement' in item && item.targetElement instanceof Element){
            found = true;
            return {...item, targetElement: new WeakRef(item.targetElement)};
        }
        return item;
    });
    if(!found) return undefined;
    return Array.isArray(invocations) ? weakened : weakened[0];
}

/**
 *
 * @param {Element & ElementEnhancementGateway} from
 */
async function infer(from){return /** @type {Infer} */ (/** @type {any} */ (from.enh.get((await import('assign-gingerly/inferencer/inferencer.js')).registryItem)));}

export { DoInvoke };
