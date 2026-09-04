// @ts-check
/** @import {Actions, PAP, AllProps, AP, InvokingParameters} from './types/do-invoke/types' */;
/** @import {RoundaboutOptions} from './types/roundabout/types' */;
/** @import {ElementEnhancementGateway, SpawnContext} from './types/assign-gingerly/types' */;
/** @import {Infer} from './types/inferencer/types' */
/** @import {EMC} from './types/mount-observer/types' */;
/** @import {RAConfig} from './types/roundabout/types' */;
/**
 * @type {EMC<any, AllProps, Element, RAConfig<AllProps, Actions>>}
 */


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
        const {customData} = /** @type {EMC<any, AllProps, Element, RAConfig<AllProps, Actions>>} */ (ctx.emc);
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
        (await import('roundabout-lib/roundabout.js')).roundabout(raOptions);
    }

    // /** @type {Map<import('./types/do-invoke/types').Specifier, WeakRef<EventTarget>>} */
    // #cache = new Map();

    /**
     * @param {AP & Actions & ElementEnhancementGateway} self 
     * @returns {Promise<PAP>}
     */
    async hydrate(self) {
        const { invokeParamSet, enhancedElement } = self;
        const {statements, success} = invokeParamSet;
        if(!success) throw 400;
        
        // TODO: Parse rawStatements into invokeParamSets using custom parser
        // For now, this is a placeholder that needs the custom parser implementation
        
        const { nudge } = await import('assign-gingerly/handlers/nudge.js');
        if(statements.length === 0){
            const name = enhancedElement.getAttribute('name');
            if(!name) throw 400;
            const inference = await infer(enhancedElement);
            statements.push({
                value: {
                    localEventType: inference.eventType,
                    targetSpecifier: {
                        hostOrPeerMethodName: name
                    }
                }
            })
        }
        for(const invokingParams of statements){
            const {value} = invokingParams;
            if(!value) continue;
            let {localEventType} = value;
            if(!localEventType){
                localEventType = (await infer(enhancedElement)).eventType;
            }
            enhancedElement.addEventListener(localEventType, e => {
                this.handleEvent(self, e, value);
            });
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
        const {hostOrPeerMethodName, targetElementId} = targetSpecifier;

        const target = /** @type {any} */ (await ((await import('assign-gingerly/inferencer/upSearch.js')).upSearch(enhancedElement, targetElementId)));
        
        
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
 * 
 * @param {Element & ElementEnhancementGateway} from 
 */
async function infer(from){return /** @type {Infer} */ (/** @type {any} */ (from.enh.get((await import('assign-gingerly/inferencer/inferencer.js')).registryItem)));}

export { DoInvoke };
