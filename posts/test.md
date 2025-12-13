---
title: "Test Post"
description: "This is a test post. It is for testing the blog engine."
publish_date: 2025-12-12
update_date: null
image: "https://cdn.hack.sv/counterspell/converted/CS_00107.jpeg"
author: "Simon Kibidi"
tags:
- test
- post
toc: false
unlisted: false
---

# H1 - Title

## H2 - Section

### H3 - Subsection

#### H4 - Sub-subsection

##### H5 - Rarely used

###### H6 - Rarely used

---

## Paragraphs

This is a normal paragraph.
This line uses a hard line break (two spaces).

This is a new paragraph.

---

## Emphasis & Inline Formatting

*Italic*
_Italic (underscore)_

**Bold**
__Bold (underscore)__

***Bold + Italic***
___Bold + Italic (underscore)___

~~Strikethrough~~

`Inline code`

Mixing styles: **bold _italic_ `code` ~~strike~~**

Escaped formatting:
\*not italic\*
\_\_not bold\_\_
\~\~not struck\~\~

---

## Underline (HTML passthrough)

<u>Underlined text using HTML</u>

<span style="text-decoration: underline;">Underlined via span</span>

---

## Links

[Inline link](https://example.com)

[Link with title](https://example.com "Example Title")

Autolink: <https://example.com>

Email autolink: <test@example.com>

Reference-style link [Example][ref]

[ref]: https://example.com "Reference Link"

---

## Images

![Alt text](https://via.placeholder.com/300)

![Alt text with title](https://via.placeholder.com/300 "Image Title")

---

## Blockquotes

> This is a blockquote.
>
> > Nested blockquote.
>
> Back to first level.

---

## Lists

### Unordered List

- Item A
- Item B
- Nested B.1
- Nested B.2
- Nested B.2.a
- Item C

### Ordered List

1. Item 1
2. Item 2
1. Nested 2.1
2. Nested 2.2
3. Item 3

### Mixed List

- Bullet
1. Numbered
- Bullet again

---

## Task Lists (GFM)

- [x] Completed task
- [ ] Incomplete task
- [ ] Another task

---

## Code Blocks

### Plain fenced code

```
This is plain code.
No language specified.
```

### Language-specified code

```python
def hello():
print("Hello, world!")
```

```js
function hello() {
console.log("Hello, world!");
}
```

```html
<div class="test">HTML code</div>
```

### Indented code block

Indented code block
Still code

---

## Tables (GFM)

| Feature | Supported | Notes |
|--------|-----------|-------|
| Bold | Yes | **Works** |
| Italic | Yes | *Works* |
| Table| Yes | GFM |

Alignment test:

| Left | Center | Right |
|:-----|:------:|------:|
| A| B| C |

---

## Horizontal Rules

---
***
___

---

## HTML Blocks

<div class="custom-block">
<p>This is a block-level HTML element.</p>
</div>

---

## Footnotes (Extension)

This has a footnote.[^1]

Another reference.[^long]

[^1]: Short footnote.
[^long]:
This is a longer footnote that spans multiple lines.

---

## Definition Lists (Extension)

Term
: Definition of the term.

Another Term
: Another definition.

---

## Abbreviations (Extension)

*[HTML]: HyperText Markup Language

HTML is an abbreviation.

---

## Escaping & Edge Cases

Backslash escape: \\

Literal asterisks: \*\*\*

Literal underscores: \_\_\_

Inline code with backticks: `` `code` ``

---

## Smart Typography (if enabled)

"Quotes"
'Single quotes'
-- en dash
--- em dash
... ellipsis

---

## Emoji (if supported)

:smile:
🔥
✅

---

## Callouts / Admonitions (engine-specific)

> **Note**
> This is a note-style blockquote.

> ⚠️ **Warning**
> This is a warning-style blockquote.

---

## TOC Scroll Test

This section exists to test scroll-spy TOC behavior.

### Scroll Target A

Content…

### Scroll Target B

Content…

### Scroll Target C

Content…

---

## Final Paragraph

End of the Markdown feature test.