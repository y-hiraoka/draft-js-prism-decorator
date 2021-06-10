import React from "react";
import { render } from "@testing-library/react";
import { ContentBlock, ContentState } from "draft-js";
import createPrismDecorator from "../src";

import Prism from "prismjs";
jest.mock("prismjs");
const mockedPrism = Prism as jest.Mocked<typeof Prism>;

const sampleCode = `const ref = React.useRef(null);`;
const mockTokenList: ReturnType<typeof Prism.tokenize> = [
  { type: "keyword", content: "const", length: 5, alias: "", greedy: true },
  " ref ",
  { type: "operator", content: "=", length: 1, alias: "", greedy: true },
  " React",
  { type: "punctuation", content: ".", length: 1, alias: "", greedy: true },
  {
    type: "function",
    content: "useRef",
    length: 6,
    alias: "string-alias",
    greedy: true,
  },
  { type: "punctuation", content: "(", length: 1, alias: "", greedy: true },
  {
    type: "keyword",
    content: "null",
    length: 4,
    alias: ["array", "alias"],
    greedy: true,
  },
  { type: "punctuation", content: ")", length: 1, alias: "", greedy: true },
  { type: "punctuation", content: ";", length: 1, alias: "", greedy: true },
];
mockedPrism.tokenize.mockReturnValue(mockTokenList);

const contentBlock = new ContentBlock({
  key: "blockKey",
  text: sampleCode,
  type: "code-block",
}).merge({ data: { language: "typescript" } }) as ContentBlock;

const contentState = ContentState.createFromBlockArray([contentBlock]);

test("defaultGetLanguage throws an error.", () => {
  const numberLanguageBlock = contentBlock.merge({
    data: { language: 999 },
  }) as ContentBlock;

  const contentState = ContentState.createFromBlockArray([numberLanguageBlock]);

  const { strategy } = createPrismDecorator();

  const mockCallback = jest.fn();

  expect(() =>
    strategy(numberLanguageBlock, mockCallback, contentState),
  ).toThrowError('block.getData().get("language") is not string.');
});

test("strategy ignores a block if filter returns false.", () => {
  const { strategy } = createPrismDecorator({ filter: () => false });

  const mockCallback = jest.fn();

  strategy(contentBlock, mockCallback, contentState);

  expect(mockCallback.mock.calls.length).toEqual(0);
});

test("strategy passes each start and end to a callback function.", () => {
  const { strategy } = createPrismDecorator();

  const mockCallback = jest.fn();

  strategy(contentBlock, mockCallback, contentState);

  // "const" (start:0, end:5)
  expect(mockCallback.mock.calls[0][0]).toBe(0);
  expect(mockCallback.mock.calls[0][1]).toBe(5);

  // 'useRef' (start:18, end:24)
  expect(mockCallback.mock.calls[3][0]).toBe(18);
  expect(mockCallback.mock.calls[3][1]).toBe(24);
});

test("DraftDecoratorComponent render.", () => {
  const { component: Component } = createPrismDecorator();

  const { getByText, rerender } = render(
    <Component
      blockKey="blockKey"
      contentState={contentState}
      offsetKey="offsetKey"
      start={18}
      end={24}
      children="useRef"
    />,
  );

  const spanElement = getByText("useRef");

  expect(spanElement.className).toEqual("token function string-alias");
  expect(spanElement.getAttribute("data-offset-key")).toEqual("offsetKey");

  rerender(
    <Component
      blockKey="blockKey"
      contentState={contentState}
      offsetKey="offsetKey"
      start={25}
      end={29}
      children="null"
    />,
  );

  expect(spanElement.className).toEqual("token keyword array alias");

  rerender(
    <Component
      blockKey="blockKey"
      contentState={contentState}
      offsetKey="offsetKey"
      start={0}
      end={5}
      children="const"
    />,
  );

  expect(spanElement.className).toEqual("token keyword");
});
