# do-invoke (🕹️)

Invoke method on upstream peer element or the host.

> [!NOTE]
> This element enhancement took some inspiration from the original form that [the invoker commands proposal adopted](https://open-ui.org/components/invokers.explainer/) as well as [countless frameworks](https://knockoutjs.com/documentation/click-binding.html).  Once that becomes built into the platform (hopefully), definitely consider adopting that built-in technique before using this as a last resort.

## Alternatives

do-merge covers most of the same ground as [do-invoke](https://github.com/bahrus/do-invoke), [do-inc](https://github.com/bahrus/do-inc), and [do-toggle](https://github.com/bahrus/do-toggle). The key differences:

- **do-invoke**, **do-inc**, and **do-toggle** use a string DSL (no JSON required) and include inferencing logic — they can figure out the event type, target property, etc. from context, so you can often be less explicit. The intent is arguably more obvious at a glance for their specific use cases.
- **do-merge** uses JSON syntax and the full power of [assign-gingerly](https://github.com/bahrus/assign-gingerly) operators (`=!` for toggle, `+=` for increment, method calls via `?.classList?.add`, etc.). It's more general-purpose — a single enhancement that can handle toggling, incrementing, method invocation, and arbitrary property assignment in one attribute.

Choose do-merge when you need to combine multiple operations or want the full expressiveness of assign-gingerly. Choose the specialized enhancements like *do-invoke* when brevity and self-documenting intent matter more.

## Example 1a Invoking a host method on most common event (depending on context)


```html
<script type=module>
class MoodStone extends HTMLElement{
    howAmIFeelingAboutToday(targetElement, event){
        console.log({targetElement, event});
    }
}
customElements.define('mood-stone', MoodStone);
</script>
...
<mood-stone itemscope>
    <button disabled 🕹️=howAmIFeelingAboutToday>Feeling great</button>
    <xtal-element inherits=mood-stone-base></xtal-element>
</mood-stone>
```

What this does:

1.  Removes the disabled attribute after hydrating.
2.  Listens by default for "click" events in this case.
3.  Invokes the host element's howAmIFeelingToday method only when the button dispatches "click" event.

It passes in two arguments:  

1.  The instance of whatever element is being invoked, just in case that is helpful.
2.  The event that triggered the action. 

Note that the name of this package, "do-invoke" is the canonical name of this element enhancement.  It is a bit long, but benefits from making the markup somewhat self-explanatory.  It is easy to choose your own name, as demonstrated by [this file](https://github.com/bahrus/do-invoke/blob/baseline/%F0%9F%95%B9%EF%B8%8F.ts).

## Example 1a with inference

We can infer the name of the method to invoke from the name attribute of the element *do-invoke* adorns:

```html
<script type=module>
    import {Mount} from 'xtal-element/index.js';
    class MoodStoneBase extends Mount{
        howAmIFeelingAboutToday(targetElement, event){
            console.log({targetElement, event});
        }
    }
    customElements.define('mood-stone-base', MoodStoneBase);
</script>
...
<mood-stone itemscope>
    <button disabled name=howAmIFeelingAboutToday 🕹️>Feeling great</button>
    <xtal-element inherits=mood-stone-base></xtal-element>
</mood-stone>
```

## Example 1b  Specifying the event

To specify a different event to act on:

```html
<mood-stone itemscope>
    <button 🕹️="howAmIFeelingAboutToday on mouseover">Feeling great</button>
    <xtal-element inherits=mood-stone-base></xtal-element>
</mood-stone>
```

## Example 1c Specifying a peer element

In the following, we take advantage of the [automatic id generation](https://github.com/bahrus/id-generation) that is supported by the underlying standards polyfill that this package rest on.

```html
<script type=module>
class SoulSearching extends HTMLElement{
    engage(targetElement, event){
        console.log({targetElement, event});
    }
}
customElements.define('soul-searching', SoulSearching);
</script>
...

<mood-stone itemscope>
    <soul-searching #></soul-searching>
    <button 🕹️="#{{soul-searching}}?.engage">What have I done?</button>
    <xtal-element -id></xtal-element>
</mood-stone>
```



## Viewing Demos Locally

Any web server that can serve static files will do, but...

1.  Install git.
2.  Fork/clone this repo.
3.  Install node.js.
4.  Open command window to folder where you cloned this repo.
5.  > npm install
6.  > npm run serve
7.  Open http://localhost:8000/demo/ in a modern browser.

## Running Tests

```
> npm run test
```

## Using from ESM Module:

```JavaScript
import 'do-invoke/do-invoke.js';
```

## Using from CDN:

```html
<script type=module crossorigin=anonymous>
    import 'https://esm.sh/do-invoke';
</script>
```

[or](https://generator.jspm.io)

```html
<script type="importmap">
{
"imports": {
    "do-invoke": "https://ga.jspm.io/npm:do-invoke@0.0.5/do-invoke.js"
},
"scopes": {
    "https://ga.jspm.io/": {
    "be-enhanced/": "https://ga.jspm.io/npm:be-enhanced@0.0.163/",
    "trans-render/": "https://ga.jspm.io/npm:trans-render@0.0.876/"
    }
}
}
</script>
```

