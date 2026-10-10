import { isPlatformBrowser } from '@angular/common';
import { Injectable, PLATFORM_ID, REQUEST, inject } from '@angular/core';

@Injectable({
    providedIn: 'root',
})
export class StoreDomainService {
    private readonly platformId = inject(PLATFORM_ID);
    private readonly request = inject(REQUEST, { optional: true });

    private getHostname(): string | null {
        if (isPlatformBrowser(this.platformId)) {
            return window.location.hostname;
        }

        const host =
            this.request?.headers.get('x-forwarded-host') ??
            this.request?.headers.get('host');

        return host ? host.split(':')[0] : null;
    }

    public getStoreSubdomain(): string | null {
        const hostname = this.getHostname();

        if (!hostname) {
            return null;
        }

        if (
            hostname === 'localhost' ||
            hostname === 'trademall.shop' ||
            hostname === 'www.trademall.shop' ||
            hostname === 'trademall-frontend.vercel.app'
        ) {
            return null;
        }

        if (hostname.endsWith('.localhost')) {
            return hostname.slice(0, -'.localhost'.length) || null;
        }

        if (hostname.endsWith('.trademall.shop')) {
            const subdomain = hostname.slice(
                0,
                -'.trademall.shop'.length,
            );

            return subdomain && subdomain !== 'www'
                ? subdomain
                : null;
        }

        return null;
    }

    public getStoreUrl(subdomain: string): string {
        if (isPlatformBrowser(this.platformId)) {
            const { protocol, hostname, port } = window.location;

            if (hostname === 'localhost' || hostname.endsWith('.localhost')) {
                return `${protocol}//${subdomain}.localhost${port ? `:${port}` : ''}`;
            }
        }

        return `https://${subdomain}.trademall.shop`;
    }
}