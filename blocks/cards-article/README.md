# cards-article

Custom **cards** block. Purpose: Grid of blog article teasers (image, category, linked title, summary); the tiles option shows category tiles with image and title only.

## Authoring (Document Authoring)

Model: `standalone`

Single block table. Content: One row per card: 1) image; 2) text: optional category paragraph, heading with the article link, optional summary paragraph. The title link makes the whole card clickable.

## Supported variations

| Variation | Option class |
| --- | --- |
| Tiles | `tiles` |

## Universal Editor fields

- Content fields derived from the block's decorate contract.
- `classes` select for options: Tiles.
