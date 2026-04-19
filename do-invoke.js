// @ts-check
/** @import {Actions, PAP, AllProps, AP, InvokingParameters} from './types/do-invoke/types' */;
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
 */
class DoInvoke {

    /**
     * @this {AllProps & Actions}
     * @param {Element & ElementEnhancementGateway} enhancedElement 
     * @param {*} ctx 
     * @param {PAP} initVals 
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
        //const {defaultPropVals} = customData;
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
     * @param {AP} self 
     * @returns {Promise<PAP>}
     */
    async hydrate(self) {
        const { invokeParamSet, enhancedElement } = self;
        console.log({invokeParamSet});
        const {statements, success} = invokeParamSet;
        if(!success) throw 400;
        
        // TODO: Parse rawStatements into invokeParamSets using custom parser
        // For now, this is a placeholder that needs the custom parser implementation
        
        const { nudge } = await import('mount-observer/nudge.js');
        if(statements.length === 0){
            const name = enhancedElement.getAttribute('name');
            if(!name) throw 400;
            statements.push({
                value: {
                    localEventType: 'click',
                    targetSpecifier: {
                        hostOrPeerMethodName: name
                    }
                }
            })
        }
        for(const invokingParams of statements){
            const {value} = invokingParams;
            if(!value) continue;
            const {localEventType} = value;
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

        const rn = /** @type {DocumentFragment & {host: unknown}} */ (enhancedElement.getRootNode());

        /** @type {any} */
        const target = targetElementId ? rn.getElementById(targetElementId) : (enhancedElement.closest('[itemscope]') || rn.host);
        if(!target) throw 404;
        
        
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

export { DoInvoke };
