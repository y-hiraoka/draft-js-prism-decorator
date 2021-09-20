import React from "react";
import { ContentBlock, ContentState, DraftDecorator } from "draft-js";
import Prism from "prismjs";

class InMemoryCache {
  private _cache = new Map<string, Prism.Token>();

  private _generateKey(blockKey: string, start: number, end: number) {
    return `${blockKey}-${start}-${end}`;
  }

  setToken(blockKey: string, start: number, end: number, token: Prism.Token) {
    const cacheKey = this._generateKey(blockKey, start, end);
    this._cache.set(cacheKey, token);
  }

  getToken(blockKey: string, start: number, end: number) {
    const cacheKey = this._generateKey(blockKey, start, end);
    return this._cache.get(cacheKey);
  }
}

const cache = new InMemoryCache();

type Options = {
  /**
   * A function that filters blocks.
   * By default, it is determined by whether `block.getType()` is "code-block" or not.
   */
  filter?: (block: ContentBlock, contentState: ContentState) => boolean;
  /**
   * A function that gets language string.
   * If it is not passed, `block.getData().get("language")` will be used.
   */
  getLanguage?: (block: ContentBlock, contentState: ContentState) => string;
};

const defaultFilter = (block: ContentBlock) => block.getType() === "code-block";
const defaultGetLanguage = (block: ContentBlock) => {
  const language = block.getData().get("language");
  return typeof language !== "string" ? "" : language;
};

/**
 * A function to create a DraftDecorator.
 *
 * usage:
 * ```tsx
 * import { EditorState, CompositeDecorator } from "draft-js";
 * import createPrismDecorator from "draft-js-prism-decorator";
 *
 * const decorators = new CompositeDecorator([createPrismDecorator()]);
 * const editorState = EditorState.createEmpty(decorators);
 * ```
 */
export default function createPrismDecorator({
  filter = defaultFilter,
  getLanguage = defaultGetLanguage,
}: Options = {}): DraftDecorator {
  const strategy = createStrategy(filter, getLanguage);

  const component = createTokenComponent(getLanguage);

  return {
    strategy,
    component,
  };
}

type Filter = Required<Options>["filter"];
type GetLanguage = Required<Options>["getLanguage"];

const createStrategy =
  (filter: Filter, getLanguage: GetLanguage): DraftDecorator["strategy"] =>
  (contentBlock, callback, contentState) => {
    if (!filter(contentBlock, contentState)) return;

    const blockKey = contentBlock.getKey();
    const blockText = contentBlock.getText();
    const language = getLanguage(contentBlock, contentState);
    const tokenList = Prism.tokenize(blockText, Prism.languages[language]);

    let start = 0;
    let end = 0;
    for (const token of tokenList) {
      end = end + token.length;

      if (typeof token !== "string") {
        cache.setToken(blockKey, start, end, token);
        callback(start, end);
      }

      start = end;
    }
  };

const createTokenComponent =
  (getLanguage: GetLanguage): React.FC<DraftDecoratorComponentProps> =>
  props => {
    const contentBlock = props.contentState.getBlockForKey(props.blockKey);
    const blockKey = contentBlock.getKey();
    let token = cache.getToken(blockKey, props.start, props.end);
    const classNames = ["token"];

    if (token === undefined) {
      const blockText = contentBlock.getText();
      const language = getLanguage(contentBlock, props.contentState);
      const tokenList = Prism.tokenize(blockText, Prism.languages[language]);

      let start = 0;
      let end = 0;

      for (const _token of tokenList) {
        end = end + _token.length;

        if (typeof _token !== "string") {
          if (start === props.start && end === props.end) {
            token = _token;
            break;
          }
        }

        start = end;
      }
    }

    token?.type && classNames.push(token.type);

    if (token?.alias) {
      if (Array.isArray(token.alias)) {
        classNames.push(...token.alias);
      } else {
        classNames.push(token.alias);
      }
    }

    return (
      <span className={classNames.join(" ")} data-offset-key={props.offsetKey}>
        {props.children}
      </span>
    );
  };

// https://github.com/facebook/draft-js/blob/7f86bca283c7d4c4afe9046016f74dc8e419b505/src/model/decorators/DraftDecorator.js#L54
type DraftDecoratorComponentProps = {
  blockKey: string;
  contentState: ContentState;
  end: number;
  offsetKey: string;
  start: number;
};
