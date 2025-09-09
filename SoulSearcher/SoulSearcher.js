export class SoulSearcher extends HTMLElement {
    engageInSecondGuessing(self, e) {
        console.log({ self, e });
    }
}
customElements.define('soul-searcher', SoulSearcher);
