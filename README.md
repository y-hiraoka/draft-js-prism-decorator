# draft-js-prism-decorator

This generates a decorator that applies syntax highlighting to [Draft.js](https://draftjs.org/) code blocks with [Prism.js](https://prismjs.com/).

It is a simple decorator object with just `strategy` and `component`, so you can easily integrate it into your Draft.js app.

## Demo & Document

https://y-hiraoka.github.io/draft-js-prism-decorator

## Install

```
npm i draft-js-prism-decorator draft-js prismjs
```

`draft-js` and `prismjs` are peerDependencies for `draft-js-prism-decorator`.

## Usage

```tsx
import "prismjs/themes/prism.css";
import { useState } from "react";
import { Editor, CompositeDecorator, ContentBlock, EditorState } from "draft-js";
import createPrismDecorator from "draft-js-prism-decorator";

const prismDecorator = createPrismDecorator();
const decorators = new CompositeDecorator([prismDecorator, otherDecorator]);

const EditorApp = () => {
  const [editorState, setEditorState] = useState(
    EditorState.createEmpty(decorators),
  );

  return <Editor editorState={editorState} onChange={setEditorState} />
};
```

## API

Two options can be passed:

```tsx
import { ContentBlock, DraftDecorator } from "draft-js";

type Options = {
    filter?: (block: ContentBlock) => boolean;
    getLanguage?: (block: ContentBlock) => string;
};

default export function createPrismDecorator(options?: Options): DraftDecorator;
```

### `filter`

A function that filters blocks. By default, it is determined by whether `block.getType()` is `"code-block"` or not.

### `getLanguage`

A function that gets language string. If it is not passed, `block.getData().get("language")` will be used.

## LICENSE

MIT