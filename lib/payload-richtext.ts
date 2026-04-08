type RichTextRecord = Record<string, unknown>;

const isRecord = (value: unknown): value is RichTextRecord =>
    typeof value === 'object' && value !== null;

const escapeHtml = (value: string) =>
    value
        .replace(/&/g, '&amp;')
        .replace(/</g, '&lt;')
        .replace(/>/g, '&gt;')
        .replace(/"/g, '&quot;')
        .replace(/'/g, '&#39;');

const maybeParseStructuredString = (value: string) => {
    const trimmed = value.trim();

    if (!trimmed) {
        return null;
    }

    if (
        (trimmed.startsWith('{') && trimmed.endsWith('}')) ||
        (trimmed.startsWith('[') && trimmed.endsWith(']'))
    ) {
        try {
            return JSON.parse(trimmed);
        } catch {
            return null;
        }
    }

    return null;
};

const looksLikeHtml = (value: string) => /<([a-z][a-z0-9-]*)(\s[^>]*)?>/i.test(value);

export function renderLexicalToHTML(node: unknown): string {
    if (!node) return '';

    if (typeof node === 'string') {
        const parsed = maybeParseStructuredString(node);
        if (parsed) {
            return renderLexicalToHTML(parsed);
        }

        return looksLikeHtml(node) ? node : escapeHtml(node);
    }

    if (Array.isArray(node)) {
        return node.map(renderLexicalToHTML).join('');
    }

    if (!isRecord(node)) {
        return '';
    }

    if ('root' in node && isRecord(node.root)) {
        return renderLexicalToHTML(node.root);
    }

    if (node.type === 'root') {
        return renderLexicalToHTML(node.children);
    }

    if (node.type === 'paragraph') {
        const content = renderLexicalToHTML(node.children);
        return content ? `<p>${content}</p>` : '';
    }

    if (node.type === 'heading') {
        const rawTag = typeof node.tag === 'string' ? node.tag.toLowerCase() : 'h2';
        const tag = /^h[1-6]$/.test(rawTag) ? rawTag : 'h2';
        return `<${tag}>${renderLexicalToHTML(node.children)}</${tag}>`;
    }

    if (node.type === 'list') {
        const tag = node.listType === 'number' ? 'ol' : 'ul';
        return `<${tag}>${renderLexicalToHTML(node.children)}</${tag}>`;
    }

    if (node.type === 'listitem') {
        return `<li>${renderLexicalToHTML(node.children)}</li>`;
    }

    if (node.type === 'quote') {
        return `<blockquote>${renderLexicalToHTML(node.children)}</blockquote>`;
    }

    if (node.type === 'linebreak') {
        return '<br />';
    }

    if (node.type === 'link') {
        const url =
            isRecord(node.fields) && typeof node.fields.url === 'string' && node.fields.url.length > 0
                ? escapeHtml(node.fields.url)
                : '#';
        return `<a href="${url}">${renderLexicalToHTML(node.children)}</a>`;
    }

    if (node.type === 'text') {
        let text = typeof node.text === 'string' ? escapeHtml(node.text) : '';
        const format = typeof node.format === 'number' ? node.format : 0;
        if (format & 1) text = `<strong>${text}</strong>`;
        if (format & 2) text = `<em>${text}</em>`;
        if (format & 8) text = `<u>${text}</u>`;
        if (format & 16) text = `<code>${text}</code>`;
        return text;
    }

    if (node.children) {
        return renderLexicalToHTML(node.children);
    }

    return '';
}

export function createLexicalRichTextFromText(value: string | null | undefined) {
    const paragraphs = String(value ?? '')
        .split(/\n{2,}/)
        .map((part) => part.trim())
        .filter(Boolean);

    return {
        root: {
            type: 'root',
            children: paragraphs.map((paragraph) => ({
                type: 'paragraph',
                children: [
                    {
                        type: 'text',
                        detail: 0,
                        format: 0,
                        mode: 'normal',
                        style: '',
                        text: paragraph,
                        version: 1,
                    },
                ],
                direction: 'ltr',
                format: '',
                indent: 0,
                textFormat: 0,
                textStyle: '',
                version: 1,
            })),
            direction: 'ltr',
            format: '',
            indent: 0,
            version: 1,
        },
    };
}
