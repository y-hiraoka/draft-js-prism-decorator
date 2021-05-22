import "./App.css";

import { useState } from "react";
import {
  CompositeDecorator,
  convertFromRaw,
  EditorState,
  RawDraftContentState,
} from "draft-js";
import { Toolbar } from "./components/Toolbar";
import { linkDecorator } from "./decorators/link";
import { prismDecorator } from "./decorators/prism";
import DocRawState from "./DocsRawState.json";
import { Editor } from "./components/Editor";

const decorators = new CompositeDecorator([prismDecorator, linkDecorator]);
const InitialContentState = convertFromRaw(DocRawState as RawDraftContentState);

function App() {
  const [editorState, setEditorState] = useState(() =>
    EditorState.createWithContent(InitialContentState, decorators),
  );

  return (
    <div className="App">
      <div className="App__Toolbar">
        <Toolbar editorState={editorState} setEditorState={setEditorState} />
      </div>
      <div className="App__Editor">
        <Editor editorState={editorState} setEditorState={setEditorState} />
      </div>
    </div>
  );
}

export default App;
