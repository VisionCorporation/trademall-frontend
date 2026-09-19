import { ImageResponse } from '@vercel/og';

export const config = { runtime: 'edge' };

function h(type: string, props: Record<string, any> = {}, ...children: any[]) {
    const flat = children.flat().filter((c) => c !== null && c !== undefined && c !== false);
    return { type, props: { ...props, children: flat.length === 1 ? flat[0] : flat } };
}

async function loadGoogleFont(fontFamily: string, weight: number, text: string): Promise<ArrayBuffer | null> {
    try {
        const family = fontFamily.replace(/ /g, '+');
        const url = `https://fonts.googleapis.com/css2?family=${family}:wght@${weight}&text=${encodeURIComponent(text)}`;
        const css = await (await fetch(url)).text();
        const match = css.match(/src: url\((.+)\) format\('(opentype|truetype)'\)/);
        if (!match) return null;
        const fontRes = await fetch(match[1]);
        return fontRes.ok ? await fontRes.arrayBuffer() : null;
    } catch {
        return null; 
    }
}

const chip = (children: any, extraStyle: Record<string, any> = {}) =>
    h('div', {
        style: {
            display: 'flex',
            alignItems: 'center',
            background: '#f4f4f4',
            color: '#000000',
            padding: '10px 20px',
            borderRadius: 12,
            ...extraStyle,
        },
    }, children);

export default async function handler(req: Request) {
    const { searchParams } = new URL(req.url);

    const image = searchParams.get('image') ?? '';
    const salePrice = searchParams.get('salePrice') ?? '0';
    const originalPrice = searchParams.get('originalPrice');
    const rating = searchParams.get('rating') ?? '0.0';
    const reviewCount = searchParams.get('reviewCount') ?? '0';
    const discount = searchParams.get('discount');

    const priceText = `GHS ${salePrice}`;
    const ratingText = `☆ ${rating} (${reviewCount})`;

    const fontText = priceText + (originalPrice ? `GHS ${originalPrice}` : '');
    const priceFont = await loadGoogleFont('Atkinson Hyperlegible', 700, fontText);

    return new ImageResponse(
        h('div', { style: { display: 'flex', width: '1200px', height: '630px', position: 'relative' } },
            h('img', {
                src: image,
                width: 1200,
                height: 630,
                style: { objectFit: 'cover', position: 'absolute', inset: 0 },
            }),

            discount
                ? h('div', { style: { position: 'absolute', top: 40, left: 40, display: 'flex' } },
                    chip(`-${discount}%`, { fontSize: 44, fontWeight: 700 }))
                : null,

            h('div', { style: { position: 'absolute', top: 40, right: 40, display: 'flex' } },
                chip(ratingText, { fontSize: 44 })),

            h('div', {
                style: {
                    position: 'absolute', bottom: 40, left: 40,
                    display: 'flex', alignItems: 'center', gap: '16px',
                },
            },
                chip(priceText, {
                    fontSize: 60,
                    fontWeight: 700,
                    fontFamily: priceFont ? 'Atkinson Hyperlegible' : undefined,
                }),
                originalPrice
                    ? chip(`GHS ${originalPrice}`, { fontSize: 40, color: '#999999', textDecoration: 'line-through' })
                    : null
            )
        ) as any,
        {
            width: 1200,
            height: 630,
            fonts: priceFont
                ? [{ name: 'Atkinson Hyperlegible', data: priceFont, weight: 700, style: 'normal' }]
                : [],
        },
    );
}