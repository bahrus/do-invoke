// @ts-check

import '../SoulSearcher/SoulSearcher.js';
export class MoodStone extends HTMLElement {
    constructor() {
        super();
        this.attachShadow({ mode: 'open' });
    }
    #invokeCount = 0;
    get invokeCount() {
        return this.#invokeCount;
    }
    howAmIFeelingAboutToday(self, e) {
        this.#invokeCount++;
        console.log({ self, e });
    }
    connectedCallback() {
        this.shadowRoot.innerHTML = String.raw `
        <soul-searcher #></soul-searcher>
        <div>
            <h3>Example 1a</h3>
            <input disabled be-invoking=howAmIFeelingAboutToday>
            <h3>Example 1b</h3>
            <input disabled 🕹️='howAmIFeelingAboutToday on change'>
            <h3>Example 1c</h3>
            <input disabled 🕹️=#{{soul-searcher}}?.engageInSecondGuessing>
        </div>
        <be-hive -id></be-hive>
        `;
    }
}
customElements.define('mood-stone', MoodStone);
