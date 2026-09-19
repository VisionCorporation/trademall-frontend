import { ImageResponse } from '@vercel/og';

export const config = { runtime: 'edge' };

const WIDTH = 1200;
const HEIGHT = 1200;
const FONT_FAMILY = 'Atkinson Hyperlegible';

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

const GOLD = '#D89E12';

function starDataUri(size = 34): string {
    const svg = `<svg width="${size}" height="${size}" viewBox="0 0 20 20" fill="none" xmlns="http://www.w3.org/2000/svg"><path d="M11.44 2.87011L12.9065 5.82735C13.1065 6.23902 13.6398 6.63388 14.0897 6.70949L16.7478 7.15476C18.4476 7.4404 18.8475 8.68379 17.6227 9.91037L15.5562 11.9939C15.2063 12.3467 15.0146 13.0272 15.1229 13.5145L15.7145 16.0937C16.1812 18.1352 15.1063 18.9249 13.3148 17.858L10.8234 16.3709C10.3735 16.1021 9.63189 16.1021 9.17361 16.3709L6.68222 17.858C4.89908 18.9249 3.81587 18.1268 4.28248 16.0937L4.87408 13.5145C4.9824 13.0272 4.79076 12.3467 4.4408 11.9939L2.37436 9.91037C1.15783 8.68379 1.54945 7.4404 3.24926 7.15476L5.9073 6.70949C6.34892 6.63388 6.88219 6.23902 7.08217 5.82735L8.54868 2.87011C9.34859 1.26547 10.6484 1.26547 11.44 2.87011Z" fill="${GOLD}" stroke="${GOLD}" stroke-width="1.5" stroke-linejoin="round"/></svg>`;
    return `data:image/svg+xml;base64,${btoa(svg)}`;
}

const chip = (children: any, extraStyle: Record<string, any> = {}) =>
    h('div', {
        style: {
            display: 'flex',
            alignItems: 'center',
            background: '#f4f4f4',
            color: '#171717',
            padding: '10px 20px',
            borderRadius: 12,
            fontFamily: FONT_FAMILY, 
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
    const discountText = discount ? `-${discount}%` : '';
    const ratingText = `${rating} (${reviewCount})`;
    const originalPriceText = originalPrice ? `GHS ${originalPrice}` : '';

    const boldText = discountText + ratingText + priceText;
    const regularText = originalPriceText;

    const [boldFont, regularFont] = await Promise.all([
        loadGoogleFont(FONT_FAMILY, 700, boldText),
        regularText ? loadGoogleFont(FONT_FAMILY, 400, regularText) : Promise.resolve(null),
    ]);

    const fonts = [
        ...(boldFont ? [{ name: FONT_FAMILY, data: boldFont, weight: 700 as const, style: 'normal' as const }] : []),
        ...(regularFont ? [{ name: FONT_FAMILY, data: regularFont, weight: 400 as const, style: 'normal' as const }] : []),
    ];

    const ratingChip = h('div', {
        style: {
            display: 'flex', alignItems: 'center', gap: '10px',
            background: '#f4f4f4', color: '#171717',
            padding: '10px 20px', borderRadius: 12,
            fontFamily: FONT_FAMILY,
        },
    },
        h('img', { src: starDataUri(34), width: 34, height: 34 }),
        h('span', { style: { fontSize: 34, fontWeight: 700, display: 'flex' } }, ratingText)
    );

    return new ImageResponse(
        h('div', { style: { display: 'flex', width: `${WIDTH}px`, height: `${HEIGHT}px`, position: 'relative' } },
            h('img', {
                src: image,
                width: WIDTH,
                height: HEIGHT,
                style: { objectFit: 'cover', position: 'absolute', inset: 0 },
            }),

            discount
                ? h('div', { style: { position: 'absolute', top: 40, left: 40, display: 'flex' } },
                    chip(discountText, { fontSize: 44, fontWeight: 700 }))
                : null,

            h('div', { style: { position: 'absolute', top: 40, right: 40, display: 'flex' } }, ratingChip),

            h('div', {
                style: {
                    position: 'absolute', bottom: 40, left: 40,
                    display: 'flex', alignItems: 'center', gap: '16px',
                },
            },
                chip(priceText, { fontSize: 60, fontWeight: 700 }),
                originalPrice
                    ? chip(originalPriceText, { fontSize: 40, fontWeight: 400, color: '#999999', textDecoration: 'line-through' })
                    : null
            )
        ) as any,
        { width: WIDTH, height: HEIGHT, fonts },
    );
}